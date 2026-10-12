import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Download,
  Database,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileArchive,
  ExternalLink
} from 'lucide-react';
import {
  getFastApiBackupStatus,
  triggerFastApiCloudflareR2Backup,
  downloadFastApiDailyArchive
} from '../../utils/backendApi';

export default function CloudflareR2BackupModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [lastActionResult, setLastActionResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  async function loadStatus() {
    setLoading(true);
    try {
      const data = await getFastApiBackupStatus();
      setStatusData(data);
    } catch (err) {
      console.warn('Failed to load backup status:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerBackup() {
    setTriggering(true);
    setLastActionResult(null);
    try {
      const res = await triggerFastApiCloudflareR2Backup();
      setLastActionResult(res);
      await loadStatus();
    } catch (err) {
      setLastActionResult({ success: false, error: err.message });
    } finally {
      setTriggering(false);
    }
  }

  async function handleDownloadArchive() {
    setDownloading(true);
    try {
      const res = await downloadFastApiDailyArchive();
      if (res.success) {
        setLastActionResult({
          success: true,
          message: 'Daily archive snapshot downloaded directly to your PC (Downloads folder).'
        });
      }
    } catch (err) {
      setLastActionResult({ success: false, error: err.message });
    } finally {
      setDownloading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cloudflare R2 Automated Backup Vault
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero-Egress S3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent Cloud-to-Cloud disaster recovery & nightly automated snapshot pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Architecture Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Cloud className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Cloud Storage</span>
              </div>
              <div className="text-sm font-bold text-white">Cloudflare R2 Bucket</div>
              <div className="text-xs text-slate-400 mt-1">10 GB Free Tier • Zero Egress Fees</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Nightly Cron</span>
              </div>
              <div className="text-sm font-bold text-white">02:00 AM UTC Daily</div>
              <div className="text-xs text-slate-400 mt-1">Automated post-night audit backup</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Independence</span>
              </div>
              <div className="text-sm font-bold text-white">100% Cloud-to-Cloud</div>
              <div className="text-xs text-slate-400 mt-1">Runs even if hotel PC is powered off</div>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-950 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Primary Disaster Recovery (Cloud-to-Cloud)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Takes a full PostgreSQL tables snapshot, compresses it with Gzip, and vaults it into Cloudflare R2.
                </p>
              </div>

              <button
                type="button"
                disabled={triggering}
                onClick={handleTriggerBackup}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {triggering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Backing Up...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Backup to Cloudflare R2 Now</span>
                  </>
                )}
              </button>
            </div>

            <hr className="border-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-cyan-400" />
                  Owner Self-Service Export (Client Peace of Mind)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Downloads today's complete hotel books, bookings, and F&B ledger (.JSON) directly to your local PC.
                </p>
              </div>

              <button
                type="button"
                disabled={downloading}
                onClick={handleDownloadArchive}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Local Archive</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Result Feedback Notification */}
          {lastActionResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                lastActionResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              {lastActionResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <div className="font-semibold">
                  {lastActionResult.success ? 'Operation Completed' : 'Action Notice'}
                </div>
                <div>{lastActionResult.message || lastActionResult.error || 'Done.'}</div>
                {lastActionResult.backup_key && (
                  <div className="font-mono text-[11px] text-amber-300">
                    Vault Key: {lastActionResult.backup_key} ({lastActionResult.compressed_size_bytes} bytes)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Backups Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cloudflare R2 Backup Vault Inventory
              </span>
              <button
                onClick={loadStatus}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
              {statusData?.recent_backups && statusData.recent_backups.length > 0 ? (
                <div className="divide-y divide-slate-800/80">
                  {statusData.recent_backups.map((b, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono text-slate-200">{b.key}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>{(b.size_bytes / 1024).toFixed(1)} KB</span>
                        <span>{new Date(b.last_modified).toLocaleString()}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <Cloud className="w-8 h-8 mx-auto text-slate-600" />
                  <p>
                    Automated snapshots trigger nightly at 02:00 AM UTC.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Target Bucket: <span className="font-mono text-slate-400">{statusData?.bucket_name || 'hotel-elite-inn-backups'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>SLA: 90-Day daily snapshot retention + 12 monthly archives</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
