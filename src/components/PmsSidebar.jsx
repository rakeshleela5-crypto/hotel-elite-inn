import React, { useState, useEffect } from 'react';
import { 
  Hotel, Utensils, DollarSign, ShoppingBag, Layers, 
  Moon, TrendingUp, Scale, QrCode, Database, 
  ChevronLeft, ChevronRight, LogOut, Search, 
  Sparkles, ShieldCheck, UserCheck, Bell, Clock
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function PmsSidebar({
  isCollapsed = false,
  onToggleCollapse,
  activeDepartment = 'reception',
  onSelectDepartment,
  activeRole = 'owner',
  onChangeRole,
  cashCollected = 0,
  liveKotCount = 0,
  pendingHkCount = 0,
  onOpenRoomSearch,
  onOpenRestaurantPOS,
  onOpenAccountsLedger,
  onOpenStoreInventory,
  onOpenRevenueManagement,
  onOpenNightAuditModal,
  onOpenDirectorPortal,
  onOpenCaFilingStation,
  onOpenAuditedSalesRegister,
  onOpenAuditedRestaurantRegister,
  onOpenQrHub,
  onExitPMS
}) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Keyboard shortcut '[' to toggle sidebar collapse
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '[' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        if (onToggleCollapse) onToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onToggleCollapse]);

  const departmentItems = [
    {
      id: 'reception',
      label: 'Front Desk & Rooms',
      shortLabel: 'Front Desk',
      icon: Hotel,
      color: '#38bdf8',
      desc: '27-Room Matrix & Tape Chart',
      badge: null,
      hotkey: 'F1',
      onClick: () => onSelectDepartment('reception')
    },
    {
      id: 'restaurant',
      label: 'Cannon Kitchen POS',
      shortLabel: 'Kitchen POS',
      icon: Utensils,
      color: '#fbbf24',
      desc: 'In-Room Dining & Live KOTs',
      badge: liveKotCount > 0 ? `${liveKotCount} KOT` : null,
      badgeColor: '#ef4444',
      hotkey: 'F2',
      onClick: () => {
        onSelectDepartment('restaurant');
        if (onOpenRestaurantPOS) onOpenRestaurantPOS();
      }
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping & Care',
      shortLabel: 'Housekeeping',
      icon: Layers,
      color: '#facc15',
      desc: 'Turnover & Room Sanitation',
      badge: pendingHkCount > 0 ? `${pendingHkCount} Dirty` : null,
      badgeColor: '#f59e0b',
      hotkey: 'F3',
      onClick: () => onSelectDepartment('housekeeping')
    },
    {
      id: 'accounts',
      label: 'Accounts & GST Ledger',
      shortLabel: 'Accounts',
      icon: DollarSign,
      color: '#34d399',
      desc: '26-Col Register & Day Book',
      badge: null,
      hotkey: 'F4',
      onClick: () => {
        onSelectDepartment('accounts');
        if (onOpenAccountsLedger) onOpenAccountsLedger('tally-erp');
      }
    },
    {
      id: 'store',
      label: 'Mandi Store Inventory',
      shortLabel: 'Store',
      icon: ShoppingBag,
      color: '#a78bfa',
      desc: 'Stock Requisition & Items',
      badge: null,
      hotkey: 'F5',
      onClick: () => {
        onSelectDepartment('store');
        if (onOpenStoreInventory) onOpenStoreInventory();
      }
    },
    {
      id: 'night-audit',
      label: 'Night Audit & Closing',
      shortLabel: 'Night Audit',
      icon: Moon,
      color: '#c084fc',
      desc: 'Midnight Roll & D1 Sync',
      badge: 'D1 Live',
      badgeColor: 'rgba(192, 132, 252, 0.25)',
      hotkey: 'F6',
      onClick: () => {
        onSelectDepartment('night-audit');
        if (onOpenNightAuditModal) onOpenNightAuditModal();
      }
    },
    {
      id: 'revenue',
      label: 'G3 RMS Yield Engine',
      shortLabel: 'G3 Yield',
      icon: TrendingUp,
      color: '#f59e0b',
      desc: 'Dynamic Tier Micro-Rates',
      badge: null,
      hotkey: 'F7',
      onClick: () => {
        if (onOpenRevenueManagement) onOpenRevenueManagement();
      }
    },
    {
      id: 'ca-filing',
      label: 'CA Tax Filing Station',
      shortLabel: 'CA Station',
      icon: Scale,
      color: '#fbbf24',
      desc: 'Rule 46 & 10 Tax Reports',
      badge: '#36',
      badgeColor: 'rgba(251, 191, 36, 0.2)',
      hotkey: 'F8',
      onClick: () => {
        if (onOpenCaFilingStation) onOpenCaFilingStation();
      }
    },
    {
      id: 'qr-hub',
      label: 'Digital QR Hub & Key',
      shortLabel: 'QR Hub',
      icon: QrCode,
      color: '#10b981',
      desc: 'Steward Mobile & Room QR',
      badge: null,
      hotkey: 'F9',
      onClick: () => {
        if (onOpenQrHub) onOpenQrHub();
      }
    }
  ];

  const roleOptions = [
    { id: 'owner', label: '👑 Raju Anna & GM', color: '#fbbf24', desc: 'Full Unrestricted Access' },
    { id: 'receptionist', label: '👤 Receptionist', color: '#38bdf8', desc: 'Active Shift Cash Drawer' },
    { id: 'accounts', label: '💼 Accounts Lead', color: '#34d399', desc: 'Day Book & Tax Reconciliation' },
    { id: 'steward', label: '🍽️ Dining Steward', color: '#f97316', desc: 'Kitchen KOTs Only' },
    { id: 'housekeeping', label: '🧹 Housekeeping Lead', color: '#a855f7', desc: 'Room Turnovers Only' }
  ];

  const currentRoleObj = roleOptions.find(r => r.id === activeRole) || roleOptions[0];

  return (
    <aside
      className={`pms-adaptive-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      style={{
        width: isCollapsed ? '68px' : '250px',
        minWidth: isCollapsed ? '68px' : '250px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'linear-gradient(180deg, rgba(8, 14, 26, 0.98) 0%, rgba(4, 8, 16, 0.99) 100%)',
        borderRight: '1px solid rgba(212, 175, 55, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        userSelect: 'none',
        boxShadow: '4px 0 25px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}
    >
      {/* 1. BRAND HEADER & COLLAPSE TOGGLE */}
      <div style={{
        padding: isCollapsed ? '0.85rem 0.5rem' : '1rem 1.15rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        background: 'rgba(212, 175, 55, 0.03)'
      }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)',
              flexShrink: 0
            }}>
              <Hotel size={18} color="#000" />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                HOTEL ELITE INN
              </div>
              <div style={{
                fontSize: '0.64rem',
                color: 'var(--gold-glow)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Rayagada • 5★ ERP
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)'
          }}>
            <Hotel size={18} color="#000" />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar (Shortcut: [)" : "Collapse to Rail (Shortcut: [)"}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            borderRadius: '6px',
            padding: '4px',
            cursor: 'pointer',
            display: isCollapsed ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* 2. SPOTLIGHT SEARCH BUTTON */}
      <div style={{ padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 0.85rem' }}>
        <button
          type="button"
          onClick={() => {
            if (onOpenRoomSearch) onOpenRoomSearch();
          }}
          title="Spotlight Search 27 Rooms, Guests & Vouchers (Ctrl+K)"
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            padding: isCollapsed ? '0.6rem 0' : '0.55rem 0.75rem',
            color: '#cbd5e1',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Search size={14} color="var(--gold-glow)" />
            {!isCollapsed && <span>Quick Search...</span>}
          </div>
          {!isCollapsed && (
            <kbd style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '0.62rem',
              color: 'var(--gold-glow)'
            }}>
              Ctrl+K
            </kbd>
          )}
        </button>
      </div>

      {/* 3. DEPARTMENT NAVIGATION ITEMS */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isCollapsed ? '0.25rem 0.4rem' : '0.25rem 0.65rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        scrollbarWidth: 'none'
      }}>
        {!isCollapsed && (
          <div style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0.35rem 0.5rem 0.2rem'
          }}>
            Departments &amp; Consoles
          </div>
        )}

        {departmentItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeDepartment === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              title={`${item.label} — ${item.desc}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isCollapsed ? '0.65rem 0' : '0.6rem 0.75rem',
                borderRadius: '8px',
                border: isActive 
                  ? '1px solid rgba(212, 175, 55, 0.45)' 
                  : '1px solid transparent',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.05) 100%)' 
                  : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '18%',
                  bottom: '18%',
                  width: '3.5px',
                  borderRadius: '0 3px 3px 0',
                  background: 'var(--gold-glow)',
                  boxShadow: '0 0 8px var(--gold-glow)'
                }} />
              )}

              <div style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? item.color : '#94a3b8',
                flexShrink: 0
              }}>
                <Icon size={15} />
              </div>

              {!isCollapsed && (
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#fff' : '#cbd5e1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{item.shortLabel}</span>
                      {item.hotkey && (
                        <kbd style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '3px',
                          padding: '0px 3px',
                          fontSize: '0.55rem',
                          color: 'var(--gold-glow)',
                          fontFamily: 'monospace'
                        }}>
                          {item.hotkey}
                        </kbd>
                      )}
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: item.badgeColor || 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        letterSpacing: '0.02em'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: isActive ? 'var(--gold-glow)' : '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.desc}
                  </div>
                </div>
              )}

              {isCollapsed && item.badge && (
                <div style={{
                  position: 'absolute',
                  top: 4,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ef4444'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. FOOTER: CASHIER DRAWER & OPERATOR PROFILE */}
      <div style={{
        padding: isCollapsed ? '0.65rem 0.4rem' : '0.85rem 0.95rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem'
      }}>
        {/* Live Cashier Shift Drawer Tally */}
        {!isCollapsed ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            padding: '0.45rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.9rem' }}>💵</span>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>Shift Drawer Cash</div>
                <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 900 }}>
                  ₹{Number(cashCollected || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.6rem', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
              LIVE
            </span>
          </div>
        ) : (
          <div
            title={`Shift Drawer Cash: ₹${Number(cashCollected || 0).toLocaleString('en-IN')}`}
            style={{
              textAlign: 'center',
              padding: '4px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800
            }}
          >
            ₹
          </div>
        )}

        {/* Operator Profile Selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(prev => !prev)}
            title={`Active Operator: ${currentRoleObj.label} (${currentRoleObj.desc})`}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '0.5rem',
              padding: isCollapsed ? '0.5rem 0' : '0.45rem 0.6rem',
              borderRadius: '7px',
              border: `1px solid ${currentRoleObj.color}40`,
              background: 'rgba(255, 255, 255, 0.04)',
              color: currentRoleObj.color,
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem' }}>{currentRoleObj.label.slice(0, 2)}</span>
              {!isCollapsed && (
                <div style={{ textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentRoleObj.color, fontWeight: 800 }}>
                    {currentRoleObj.label.slice(2)}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                    Click to switch role
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>▾</span>}
          </button>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '105%',
              left: 0,
              width: isCollapsed ? '210px' : '100%',
              background: '#09111e',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '8px',
              padding: '0.35rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', padding: '3px 6px', fontWeight: 800 }}>
                SELECT OPERATIONAL ROLE:
              </div>
              {roleOptions.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (onChangeRole) onChangeRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '5px',
                    border: 'none',
                    background: activeRole === r.id ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                    color: activeRole === r.id ? r.color : '#cbd5e1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exit PMS Button */}
        {onExitPMS && (
          <button
            type="button"
            onClick={onExitPMS}
            title="Exit Front Desk PMS and Return to Guest Portal (Esc)"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={13} color="#fca5a5" />
            {!isCollapsed && <span>Exit PMS (Esc)</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
