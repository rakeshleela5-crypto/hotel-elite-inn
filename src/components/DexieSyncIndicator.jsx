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
          type="button"
          title="Dexie.js Offline Storage & Cloudflare Sync Status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            border: !isOnline ? '1px solid rgba(245, 158, 11, 0.5)' : (isSyncing ? '1px solid rgba(59, 130, 246, 0.5)' : (failedCount > 0 ? '1px solid rgba(244, 63, 94, 0.5)' : (pendingCount > 0 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)'))),
            background: !isOnline ? 'rgba(245, 158, 11, 0.18)' : (isSyncing ? 'rgba(59, 130, 246, 0.18)' : (failedCount > 0 ? 'rgba(244, 63, 94, 0.18)' : (pendingCount > 0 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.18)'))),
            color: !isOnline ? '#fcd34d' : (isSyncing ? '#93c5fd' : (failedCount > 0 ? '#fda4af' : (pendingCount > 0 ? '#fcd34d' : '#6ee7b7')))
          }}
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '380px',
          padding: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px' }}>
              <Database size={18} color="#34d399" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '15px' }}>Offline Cache &amp; Cloud Sync</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Dexie IndexedDB + Cloudflare D1</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Network & Queue Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
          <div style={{ padding: '10px', background: '#1e293b', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Network Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: isOnline ? '#34d399' : '#fbbf24' }}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div style={{ padding: '10px', background: '#1e293b', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Outbox Queue</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#60a5fa' }}>
              <HardDrive size={14} />
              <span>{pendingCount} Pending</span>
            </div>
          </div>
        </div>

        {/* Local IndexedDB Stores Overview */}
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Cached KOT Orders:</span>
            <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{stats.kotCount} records</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Active Table Sessions:</span>
            <span style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>{stats.sessionCount} tables</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Offline Menu Catalog:</span>
            <span style={{ fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{stats.menuCount} dishes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '6px', fontSize: '11px' }}>
            <span>Last Remote Sync:</span>
            <span>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('en-IN') : 'Just now'}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={() => {
              triggerManualSync();
              onClose();
            }}
            disabled={isSyncing || !isOnline}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: '#059669',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: (isSyncing || !isOnline) ? 'not-allowed' : 'pointer',
              opacity: (isSyncing || !isOnline) ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now with Cloudflare D1'}</span>
          </button>

          {failedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                retryFailed();
                onClose();
              }}
              style={{
                padding: '10px 14px',
                background: '#e11d48',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry ({failedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
