// src/components/DexieSyncIndicator.jsx
// Visual Status Badge & Drawer for Dexie.js Offline Outbox & Cloudflare D1 Synchronization

import React, { useState } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, 
  Database, ArrowUpRight, ShieldCheck, HardDrive, Clock
} from 'lucide-react';
import { useDexieSyncStatus } from '../db/useDexieData';
import { db } from '../db/dexieDb';

export default function DexieSyncIndicator({ compact = false }) {
  const { 
    isOnline, pendingCount, failedCount, isSyncing, 
    lastSyncedAt, triggerManualSync, retryFailed 
  } = useDexieSyncStatus();

  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({ kotCount: 0, menuCount: 0, sessionCount: 0 });

  const loadStats = async () => {
    try {
      const kotCount = await db.kots.count();
      const menuCount = await db.menuCatalog.count();
      const sessionCount = await db.tableSessions.count();
      setStats({ kotCount, menuCount, sessionCount });
    } catch (e) {}
  };

  const handleOpenDetails = () => {
    loadStats();
    setShowDetails(true);
  };

  // Compact Pill (For Mobile Headers & Steward Pad)
  if (compact) {
    return (
      <>
        <button
          onClick={handleOpenDetails}
          title="Dexie.js Offline Storage & Cloudflare Sync Status"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs transition-all border ${
            !isOnline
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
              : isSyncing
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
              : failedCount > 0
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              : pendingCount > 0
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline ({pendingCount} Queued)</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Syncing D1...</span>
            </>
          ) : failedCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{failedCount} Sync Alert</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Dexie: {pendingCount} Pndg</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dexie Synced</span>
            </>
          )}
        </button>

        {/* Modal / Dialog Details */}
        {showDetails && (
          <SyncDetailsModal 
            onClose={() => setShowDetails(false)}
            stats={stats}
            isOnline={isOnline}
            pendingCount={pendingCount}
            failedCount={failedCount}
            isSyncing={isSyncing}
            lastSyncedAt={lastSyncedAt}
            triggerManualSync={triggerManualSync}
            retryFailed={retryFailed}
          />
        )}
      </>
    );
  }

  // Expanded Bar (For Reception Desktop Header)
  return (
    <>
      <div 
        onClick={handleOpenDetails}
        className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          !isOnline 
            ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' 
            : pendingCount > 0 
            ? 'bg-amber-950/30 text-amber-300 border-amber-700/50'
            : failedCount > 0
            ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
            : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold tracking-tight">Dexie DB:</span>
        </div>
        
        {!isOnline ? (
          <span className="flex items-center gap-1 text-amber-300">
            <WifiOff className="w-3 h-3" /> Offline Buffer ({pendingCount} pending)
          </span>
        ) : isSyncing ? (
          <span className="flex items-center gap-1 text-blue-300">
            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing Cloudflare D1...
          </span>
        ) : failedCount > 0 ? (
          <span className="flex items-center gap-1 text-rose-300">
            <AlertTriangle className="w-3 h-3" /> {failedCount} Failed Retries
          </span>
        ) : pendingCount > 0 ? (
          <span className="flex items-center gap-1 text-amber-300">
            <Clock className="w-3 h-3" /> {pendingCount} Queued to D1
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Live Synchronized
          </span>
        )}
      </div>

      {showDetails && (
        <SyncDetailsModal 
          onClose={() => setShowDetails(false)}
          stats={stats}
          isOnline={isOnline}
          pendingCount={pendingCount}
          failedCount={failedCount}
          isSyncing={isSyncing}
          lastSyncedAt={lastSyncedAt}
          triggerManualSync={triggerManualSync}
          retryFailed={retryFailed}
        />
      )}
    </>
  );
}

function SyncDetailsModal({
  onClose,
  stats,
  isOnline,
  pendingCount,
  failedCount,
  isSyncing,
  lastSyncedAt,
  triggerManualSync,
  retryFailed
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Dexie.js Offline Storage</h3>
              <p className="text-xs text-slate-400">IndexedDB + Cloudflare D1 Synchronization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Network & Engine Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 mb-1">Network Connection</div>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Online (Connected)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">Offline (Local Only)</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 mb-1">Outbox Queue</div>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>{pendingCount} Pending</span>
              {failedCount > 0 && (
                <span className="text-rose-400">({failedCount} failed)</span>
              )}
            </div>
          </div>
        </div>

        {/* Local IndexedDB Stores Overview */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            IndexedDB Cached Data Sets
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Cached KOT Orders:</span>
              <span className="font-mono text-emerald-400 font-semibold">{stats.kotCount} records</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Active Table Sessions:</span>
              <span className="font-mono text-blue-400 font-semibold">{stats.sessionCount} tables</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Offline Menu Catalog:</span>
              <span className="font-mono text-purple-400 font-semibold">{stats.menuCount} dishes</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/60">
              <span>Last Remote Sync:</span>
              <span className="text-slate-400">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('en-IN') : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation Note */}
        <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs text-blue-200/90 leading-relaxed">
          💡 <strong>Guaranteed Offline Punching:</strong> Stewards can punch food orders even in dead Wi-Fi zones (gardens, basements). All orders instantly write to Dexie IndexedDB and automatically flush to Cloudflare D1 the moment Wi-Fi reconnects.
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              triggerManualSync();
              onClose();
            }}
            disabled={isSyncing || !isOnline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now with Cloudflare D1'}</span>
          </button>

          {failedCount > 0 && (
            <button
              onClick={() => {
                retryFailed();
                onClose();
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Retry Failed ({failedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
