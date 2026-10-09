import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Bell, BellOff, Volume2, 
  Maximize2, LogOut, ShieldCheck, Clock,
  Calendar, Layers, Sparkles, Scale, FileSpreadsheet
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import DexieSyncIndicator from './DexieSyncIndicator';

export default function PmsControlHeader({
  isSidebarCollapsed = false,
  onToggleSidebar,
  activeDepartment = 'reception',
  activeTab = 'tape-chart',
  onChangeTab,
  activeRole = 'owner',
  cashCollected = 0,
  onOpenRoomSearch,
  onOpenWalkInModal,
  onOpenCaFilingStation,
  onOpenAuditedSalesRegister,
  onExitPMS
}) {
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1-second ticking clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const departmentNames = {
    reception: 'Front Desk & Rooms',
    restaurant: 'Cannon Kitchen Dining & POS',
    housekeeping: 'Housekeeping & Care',
    accounts: 'Accounts & GST Ledger',
    store: 'Mandi Store & Inventory',
    'night-audit': 'Night Audit & Closing',
    revenue: 'G3 RMS Dynamic Yield Rates'
  };

  const timeString = liveTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = liveTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  return (
    <header
      className="pms-control-bar"
      style={{
        height: '48px',
        minHeight: '48px',
        background: 'linear-gradient(90deg, rgba(10, 18, 33, 0.98) 0%, rgba(6, 12, 22, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 850,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)'
      }}
    >
      {/* 1. LEFT: TOGGLE & BREADCRUMBS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar ([)" : "Collapse Sidebar ([)"}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--gold-glow)',
            borderRadius: '6px',
            padding: '5px 7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
        >
          <Menu size={16} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Elite Inn</span>
          <span style={{ color: '#64748b' }}>/</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>
            {departmentNames[activeDepartment] || 'Front Desk'}
          </span>
          {activeDepartment === 'reception' && (
            <>
              <span style={{ color: '#64748b' }}>/</span>
              <span style={{ color: 'var(--gold-glow)', fontWeight: 800 }}>
                {activeTab === 'tape-chart' ? '14-Day Tape Chart' :
                 activeTab === 'd1-database-explorer' ? 'D1 Remote Database' :
                 activeTab === 'cashier-audit' ? 'Shift Cashier Audit' :
                 activeTab === 'housekeeping' ? 'Turnover Matrix' : '27-Room Floor Grid'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. CENTER: GLOBAL SPOTLIGHT SEARCH */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '420px', margin: '0 1rem' }}>
        <button
          type="button"
          onClick={onOpenRoomSearch}
          title="Search Rooms, Guests, Phones & Invoices (Ctrl+K)"
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '4px 12px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
            <Search size={13} color="var(--gold-glow)" />
            <span>Search 27 Rooms, Guests, Bills...</span>
          </div>
          <kbd style={{
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '0.62rem',
            color: 'var(--gold-glow)',
            fontFamily: 'monospace'
          }}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 3. RIGHT: STATS, FAST ACTION PILLS & CLOCK */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Fast Action: Walk-In Check-In */}
        {onOpenWalkInModal && (
          <button
            type="button"
            onClick={onOpenWalkInModal}
            className="btn-primary-gold"
            style={{
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)'
            }}
          >
            <span>+ Walk-In</span>
          </button>
        )}


        {/* Dexie.js Offline Outbox & Cloudflare D1 Synchronization Indicator */}
        <DexieSyncIndicator compact={false} />

        {/* Shift Cash Drawer Pill */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '16px',
          padding: '2px 9px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#34d399'
        }} title="Current Shift Physical Cash Drawer Tally">
          <span>💵</span>
          <span>₹{Number(cashCollected || 0).toLocaleString('en-IN')}</span>
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(prev => !prev)}
          title={soundEnabled ? "Order Alert Sound Enabled (Click to Mute)" : "Sound Muted (Click to Enable)"}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '4px 6px',
            color: soundEnabled ? '#34d399' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {soundEnabled ? <Volume2 size={14} /> : <BellOff size={14} />}
        </button>

        {/* Digital Clock */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          lineHeight: 1.1,
          paddingLeft: '0.35rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
            {timeString}
          </span>
          <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
            {dateString}
          </span>
        </div>

        {/* Exit PMS */}
        {onExitPMS && (
          <button
            type="button"
            onClick={onExitPMS}
            title="Exit Front Desk PMS (Esc)"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '6px',
              padding: '4px 7px',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  );
}
