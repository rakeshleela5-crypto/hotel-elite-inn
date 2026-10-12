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
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.95)',
          color: '#f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e293b', backgroundColor: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
              <Cloud size={22} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Cloudflare R2 Automated Backup Vault
                <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  Zero-Egress S3
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Independent Cloud-to-Cloud disaster recovery &amp; nightly automated snapshot pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px',
              color: '#94a3b8',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#0f172a' }}>
          {/* Architecture Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', marginBottom: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Cloud size={14} />
                <span>Cloud Storage</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Cloudflare R2 Bucket</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>10 GB Free Tier • Zero Egress Fees</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22d3ee', marginBottom: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Clock size={14} />
                <span>Nightly Cron</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>02:00 AM UTC Daily</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>Automated post-night audit backup</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', marginBottom: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <HardDrive size={14} />
                <span>Independence</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>100% Cloud-to-Cloud</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>Runs even if hotel PC is powered off</div>
            </div>
          </div>

          {/* Action Callouts */}
          <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#131b2e', border: '1px solid #25334d', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} color="#fbbf24" />
                  Primary Disaster Recovery (Cloud-to-Cloud)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Takes a full PostgreSQL tables snapshot, compresses it with Gzip, and vaults it into Cloudflare R2.
                </p>
              </div>

              <button
                type="button"
                disabled={triggering}
                onClick={handleTriggerBackup}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0f172a',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                  opacity: triggering ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                }}
              >
                {triggering ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Backing Up...</span>
                  </>
                ) : (
                  <>
                    <Cloud size={14} />
                    <span>Backup to Cloudflare R2 Now</span>
                  </>
                )}
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #1e293b', margin: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileArchive size={16} color="#22d3ee" />
                  Owner Self-Service Export (Client Peace of Mind)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Downloads today's complete hotel books, bookings, and F&amp;B ledger (.JSON) directly to your local PC.
                </p>
              </div>

              <button
                type="button"
                disabled={downloading}
                onClick={handleDownloadArchive}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  opacity: downloading ? 0.6 : 1
                }}
              >
                {downloading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" color="#22d3ee" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} color="#22d3ee" />
                    <span>Download Local Archive</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Result Feedback Notification */}
          {lastActionResult && (
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: lastActionResult.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                backgroundColor: lastActionResult.success ? 'rgba(6, 78, 59, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                color: lastActionResult.success ? '#a7f3d0' : '#fecaca',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {lastActionResult.success ? (
                <CheckCircle size={18} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} color="#f87171" style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 700 }}>
                  {lastActionResult.success ? 'Operation Completed' : 'Action Notice'}
                </div>
                <div>{lastActionResult.message || lastActionResult.error || 'Done.'}</div>
                {lastActionResult.backup_key && (
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#fcd34d' }}>
                    Vault Key: {lastActionResult.backup_key} ({lastActionResult.compressed_size_bytes} bytes)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Backups Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#34d399" />
                Cloudflare R2 Backup Vault Inventory
              </span>
              <button
                type="button"
                onClick={loadStatus}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px' }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              {statusData?.recent_backups && statusData.recent_backups.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {statusData.recent_backups.map((b, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '12px 16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        fontSize: '12px',
                        borderBottom: idx < statusData.recent_backups.length - 1 ? '1px solid #1e293b' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{b.key}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#94a3b8' }}>
                        <span>{(b.size_bytes / 1024).toFixed(1)} KB</span>
                        <span>{new Date(b.last_modified).toLocaleString()}</span>
                        <span style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={28} color="#475569" />
                  <p style={{ margin: 0 }}>
                    Automated snapshots trigger nightly at 02:00 AM UTC.
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                    Target Bucket: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{statusData?.bucket_name || 'hotel-elite-inn-backups'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #1e293b', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
          <span>SLA: 90-Day daily snapshot retention + 12 monthly archives</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

