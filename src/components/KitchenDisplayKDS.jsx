import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Flame, Clock, CheckCircle2, Bell, Volume2, VolumeX, RefreshCw, 
  ArrowLeft, Utensils, AlertTriangle, ChefHat, Sparkles, Filter, X, LogOut,
  Printer, QrCode, AlertOctagon, Timer, RotateCcw, Minus, Plus, Search, Check, ShieldAlert
} from 'lucide-react';
import { playOrderAlert, playSuccessChime } from '../utils/soundAlert';
import StaffShiftLoginModal from './StaffShiftLoginModal';
import { getStaffSession, endStaffShiftSession } from '../utils/staffAuthSession';
import { RESTAURANT_MENU } from '../data/hotelData';

export default function KitchenDisplayKDS({ onClose }) {
  const [shiftSession, setShiftSession] = useState(() => getStaffSession('kds'));
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_elite_inn_live_kots');
      return saved ? JSON.parse(saved) : [
        {
          id: 'KOT-882101',
          kotNumber: 'KOT-882101',
          tableNumber: '4',
          orderType: 'dining',
          steward: 'SADANANDA',
          timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
          timeFormatted: '08:45 PM',
          status: 'Preparing',
          items: [
            { id: 102, itemCode: '102', name: 'Chicken Dum Biryani (Chef Special)', quantity: 2, rate: 260, isVeg: false, note: 'Extra Raita' },
            { id: 215, itemCode: '215', name: 'Paneer Butter Masala', quantity: 1, rate: 210, isVeg: true, note: 'Medium Spicy' },
            { id: 309, itemCode: '309', name: 'Butter Tandoori Roti', quantity: 4, rate: 25, isVeg: true, note: 'Crispy' }
          ],
          totalAmount: 830,
          generalNote: 'VIP table - Serve Biryani first'
        },
        {
          id: 'KOT-882102',
          kotNumber: 'KOT-882102',
          tableNumber: '6',
          orderType: 'dining',
          steward: 'KOTI',
          timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
          readyTimestamp: new Date(Date.now() - 4 * 60000).toISOString(),
          timeFormatted: '08:38 PM',
          status: 'Ready',
          items: [
            { id: 101, itemCode: '101', name: 'Butter Chicken Boneless', quantity: 1, rate: 320, isVeg: false, note: '' },
            { id: 307, itemCode: '307', name: 'Plain Steamed Rice', quantity: 2, rate: 90, isVeg: true, note: '' }
          ],
          totalAmount: 500,
          generalNote: ''
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'preparing', 'ready', 'running', 'all'
  const [stationFilter, setStationFilter] = useState('all'); // 'all', 'tandoor', 'curry', 'starters', 'beverages'
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [newOrderNotice, setNewOrderNotice] = useState(null);
  const [voidAlert, setVoidAlert] = useState(null);
  const seenOrderIds = useRef(new Set(orders.map(o => o.id)));

  // Thermal Print Modals
  const [kotToPrint, setKotToPrint] = useState(null);
  const [showShiftSummaryModal, setShowShiftSummaryModal] = useState(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(() => {
    return localStorage.getItem('kds_auto_print_enabled') === 'true';
  });

  // 86 Sold-Out / Portion Countdown Manager
  const [showStockoutModal, setShowStockoutModal] = useState(false);
  const [stockoutSearch, setStockoutSearch] = useState('');
  const [outOfStockItems, setOutOfStockItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_elite_inn_pos_86_items');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Item-level Bump (Strike-through) Tracking
  const [bumpedItems, setBumpedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kds_bumped_items');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Running Table Folios (Shared with Desktop POS & Steward Mobiles)
  const [tableSessions, setTableSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_elite_inn_table_sessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [expandedTableHistory, setExpandedTableHistory] = useState({});

  // Live timer for kitchen elapsed & pickup wait timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync bumped items to local storage
  const handleToggleBump = (orderId, itemIdx) => {
    setBumpedItems(prev => {
      const key = `${orderId}_${itemIdx}`;
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('kds_bumped_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Broadcast & Sync Handler
  useEffect(() => {
    const handleNewOrder = (order) => {
      if (!seenOrderIds.current.has(order.id)) {
        seenOrderIds.current.add(order.id);
        setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
        setNewOrderNotice(`🔔 NEW KOT #${order.kotNumber || order.runningKotIndex || 1} for TABLE ${order.tableNumber}!`);
        setTimeout(() => setNewOrderNotice(null), 6000);

        if (!isAudioMuted) {
          playOrderAlert();
          setTimeout(() => playOrderAlert(), 400);
        }

        // Auto-print thermal KOT if option enabled
        if (autoPrintEnabled) {
          setKotToPrint(order);
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.print();
            }
          }, 300);
        }
      }
    };

    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('hotel_elite_inn_live_kds');
      channel.onmessage = (event) => {
        const { type, order, orderId, status, tableSessions: ts, items, voidData } = event.data || {};
        if (type === 'NEW_KOT_ORDER' && order) {
          handleNewOrder(order);
          if (ts) setTableSessions(ts);
        } else if (type === 'KOT_STATUS_UPDATED' && orderId) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } else if (type === 'TABLE_SESSIONS_UPDATE' && ts) {
          setTableSessions(ts);
        } else if (type === '86_ITEMS_UPDATED' && items) {
          setOutOfStockItems(items);
        } else if (type === 'KOT_ITEM_VOIDED' && voidData) {
          // Play urgent cancellation alert
          setVoidAlert(voidData);
          playOrderAlert();
          setTimeout(() => playOrderAlert(), 500);
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === 'hotel_elite_inn_live_kots' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) {
            fresh.forEach(o => {
              if (!seenOrderIds.current.has(o.id)) {
                handleNewOrder(o);
              }
            });
            setOrders(fresh);
          }
        } catch (err) {}
      } else if (e.key === 'hotel_elite_inn_table_sessions' && e.newValue) {
        try {
          setTableSessions(JSON.parse(e.newValue));
        } catch (err) {}
      } else if (e.key === 'hotel_elite_inn_pos_86_items' && e.newValue) {
        try {
          setOutOfStockItems(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Fast polling fallback to Cloudflare D1
    const pollInterval = setInterval(() => {
      const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
        body: JSON.stringify({ action: 'get_live_kots' })
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.kots && Array.isArray(data.kots)) {
          data.kots.forEach(order => {
            if (!seenOrderIds.current.has(order.id)) {
              handleNewOrder(order);
            }
          });
        }
      })
      .catch(() => {});
    }, 4000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, [isAudioMuted, autoPrintEnabled]);

  // Update order status with pickup latency timestamp
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const patched = { ...o, status: newStatus };
          if (newStatus === 'Ready') {
            patched.readyTimestamp = new Date().toISOString();
          }
          return patched;
        }
        return o;
      });
      try {
        localStorage.setItem('hotel_elite_inn_live_kots', JSON.stringify(updated));
      } catch (e) {}

      // Broadcast status update
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('hotel_elite_inn_live_kds');
        ch.postMessage({ type: 'KOT_STATUS_UPDATED', orderId, status: newStatus });
        ch.close();
      }

      return updated;
    });

    if (newStatus === 'Ready') {
      playSuccessChime();
    }
  };

  // Ping steward that food is getting cold at the kitchen pass
  const handlePingSteward = (order) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('hotel_elite_inn_live_kds');
      ch.postMessage({
        type: 'PICKUP_URGENT_PING',
        tableNumber: order.tableNumber,
        steward: order.steward,
        kotNumber: order.kotNumber || order.runningKotIndex || 1,
        message: `🚨 PICKUP ALERT: Table ${order.tableNumber} food has been waiting at the pass for over 3 minutes!`
      });
      ch.close();
    }
    playSuccessChime();
    setNewOrderNotice(`📢 PINGED STEWARD ${order.steward.toUpperCase()} FOR TABLE ${order.tableNumber}!`);
    setTimeout(() => setNewOrderNotice(null), 4000);
  };

  // Helper: Elapsed minutes & seconds
  const getElapsed = (timestamp) => {
    const elapsedMs = Math.max(0, now - new Date(timestamp).getTime());
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const isUrgent = mins >= 15;
    const isWarning = mins >= 10;
    return {
      totalSecs,
      text: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      isUrgent,
      isWarning
    };
  };

  // Helper: Pickup Latency (time since marked Ready)
  const getPickupLatency = (readyTimestamp) => {
    if (!readyTimestamp) return { mins: 0, secs: 0, text: '00:00', isOverdue: false };
    const elapsedMs = Math.max(0, now - new Date(readyTimestamp).getTime());
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return {
      mins,
      secs,
      text: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      isOverdue: mins >= 3 // > 3 minutes waiting at the pass is cold food risk
    };
  };

  // 86 Out of Stock Toggle & Portion Counter
  const handleToggle86 = (dish) => {
    const code = dish.itemCode;
    const current = outOfStockItems[code];
    const isSoldOut = current?.soldOut ?? Boolean(current);
    const updated = {
      ...outOfStockItems,
      [code]: {
        soldOut: !isSoldOut,
        portionsLeft: !isSoldOut ? 0 : 10
      }
    };
    setOutOfStockItems(updated);
    try {
      localStorage.setItem('hotel_elite_inn_pos_86_items', JSON.stringify(updated));
    } catch (e) {}

    // Broadcast update to all Steward mobile pads
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('hotel_elite_inn_live_kds');
      ch.postMessage({ type: '86_ITEMS_UPDATED', items: updated });
      ch.close();
    }
  };

  const handleAdjustPortions = (dish, delta) => {
    const code = dish.itemCode;
    const current = outOfStockItems[code] || { soldOut: false, portionsLeft: 10 };
    const currentLeft = current.portionsLeft !== undefined ? current.portionsLeft : 10;
    const newLeft = Math.max(0, currentLeft + delta);
    const updated = {
      ...outOfStockItems,
      [code]: {
        soldOut: newLeft === 0,
        portionsLeft: newLeft
      }
    };
    setOutOfStockItems(updated);
    try {
      localStorage.setItem('hotel_elite_inn_pos_86_items', JSON.stringify(updated));
    } catch (e) {}

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('hotel_elite_inn_live_kds');
      ch.postMessage({ type: '86_ITEMS_UPDATED', items: updated });
      ch.close();
    }
  };

  // Filter orders by status and kitchen station
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (filterStatus === 'active' && o.status === 'Served') return false;
    if (filterStatus === 'preparing' && o.status !== 'Preparing') return false;
    if (filterStatus === 'ready' && o.status !== 'Ready') return false;
    if (filterStatus === 'running') {
      const isRunning = Boolean(o.isRunningKot || o.runningKotIndex > 1 || (tableSessions[o.tableNumber]?.kots?.length > 1));
      if (!isRunning) return false;
    }

    // 2. Station Filter
    if (stationFilter !== 'all') {
      const hasStationItem = (o.items || []).some(it => {
        const name = (it.name || '').toLowerCase();
        if (stationFilter === 'tandoor') return name.includes('roti') || name.includes('naan') || name.includes('kulcha') || name.includes('tikka') || name.includes('kebab');
        if (stationFilter === 'curry') return name.includes('masala') || name.includes('curry') || name.includes('biryani') || name.includes('rice') || name.includes('dal') || name.includes('gravy');
        if (stationFilter === 'starters') return name.includes('chilli') || name.includes('manchurian') || name.includes('fry') || name.includes('65') || name.includes('crispy');
        if (stationFilter === 'beverages') return name.includes('soda') || name.includes('water') || name.includes('tea') || name.includes('coffee') || name.includes('juice') || name.includes('beer');
        return true;
      });
      if (!hasStationItem) return false;
    }

    return true;
  });

  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;
  const runningKotsCount = orders.filter(o => Boolean(o.isRunningKot || o.runningKotIndex > 1 || (tableSessions[o.tableNumber]?.kots?.length > 1))).length;
  const outOfStockCount = Object.values(outOfStockItems).filter(i => (typeof i === 'object' ? i.soldOut : Boolean(i))).length;

  // Shift Closing Metrics
  const shiftMetrics = useMemo(() => {
    const itemMap = {};
    let totalItemsCooked = 0;
    let totalCookTimeSecs = 0;
    let completedCount = 0;

    orders.forEach(o => {
      if (o.status === 'Ready' || o.status === 'Served') {
        completedCount++;
        const elapsedSecs = Math.max(60, (new Date(o.readyTimestamp || o.timestamp).getTime() - new Date(o.timestamp).getTime()) / 1000);
        totalCookTimeSecs += elapsedSecs;
        (o.items || []).forEach(it => {
          totalItemsCooked += it.quantity;
          itemMap[it.name] = (itemMap[it.name] || 0) + it.quantity;
        });
      }
    });

    const avgMins = completedCount > 0 ? (totalCookTimeSecs / completedCount / 60).toFixed(1) : '11.5';
    return {
      totalKots: orders.length,
      completedKots: completedCount,
      totalItemsCooked,
      avgMins,
      dishCounts: Object.entries(itemMap).sort((a, b) => b[1] - a[1])
    };
  }, [orders]);

  const handleClockOut = async () => {
    if (window.confirm(`Clock out from Kitchen ${shiftSession?.shift || 'current'} shift and end session?`)) {
      await endStaffShiftSession('kds', shiftSession);
      setShiftSession(null);
    }
  };

  if (!shiftSession) {
    return (
      <StaffShiftLoginModal
        portal="kds"
        onLoginSuccess={(sess) => setShiftSession(sess)}
        onCancel={onClose}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#060913',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999999,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* KDS Main Header */}
      <header className="no-print" style={{
        background: '#0a0f1d',
        borderBottom: '2px solid rgba(239, 68, 68, 0.4)',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        {/* Left: Branding & Shift Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={20} color="#ef4444" />
              <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.04em', color: '#fff' }}>
                CANNON KITCHEN KDS
              </span>
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                LIVE HOT PASS
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Hotel Elite Inn • Thermal Print Enabled • Zero-Lag Sync
            </div>
          </div>
        </div>

        {/* Center: Status Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.3rem',
          background: 'rgba(255,255,255,0.04)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'active' ? '#ef4444' : 'transparent',
              color: filterStatus === 'active' ? '#fff' : '#94a3b8'
            }}
          >
            🔥 Active ({preparingCount + readyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('preparing')}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'preparing' ? '#3b82f6' : 'transparent',
              color: filterStatus === 'preparing' ? '#fff' : '#94a3b8'
            }}
          >
            🍳 Cooking ({preparingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ready')}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'ready' ? '#10b981' : 'transparent',
              color: filterStatus === 'ready' ? '#fff' : '#94a3b8'
            }}
          >
            ✓ Ready ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('running')}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'running' ? '#f59e0b' : 'transparent',
              color: filterStatus === 'running' ? '#000' : '#fbbf24'
            }}
          >
            ⚡ Repeat ({runningKotsCount})
          </button>
        </div>

        {/* Right: Operational Toolset (Thermal Auto-Print, 86 Stock, Shift Summary) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Auto-Print Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !autoPrintEnabled;
              setAutoPrintEnabled(next);
              localStorage.setItem('kds_auto_print_enabled', String(next));
            }}
            title="Automatically trigger thermal print popup when new KOT arrives"
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              background: autoPrintEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
              border: autoPrintEnabled ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
              color: autoPrintEnabled ? '#10b981' : '#cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Printer size={13} />
            <span>Auto-Print: {autoPrintEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* 86 Out of Stock Manager */}
          <button
            type="button"
            onClick={() => setShowStockoutModal(true)}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              background: outOfStockCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.06)',
              border: outOfStockCount > 0 ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
              color: outOfStockCount > 0 ? '#fca5a5' : '#cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertOctagon size={13} color={outOfStockCount > 0 ? '#ef4444' : '#94a3b8'} />
            <span>86 Stock ({outOfStockCount})</span>
          </button>

          {/* Shift Summary Report */}
          <button
            type="button"
            onClick={() => setShowShiftSummaryModal(true)}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Timer size={13} />
            <span>Shift Recon</span>
          </button>

          {/* Audio Mute & Test */}
          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? 'Unmute Kitchen Audio' : 'Mute Kitchen Audio'}
            style={{
              padding: '5px 7px',
              borderRadius: '6px',
              background: isAudioMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)',
              border: isAudioMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
              color: isAudioMuted ? '#f87171' : '#fff',
              cursor: 'pointer'
            }}
          >
            {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Chef Session Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '3px 7px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fca5a5'
          }}>
            <ChefHat size={13} style={{ color: '#f87171' }} />
            <span>{shiftSession?.staffName || 'Head Chef'}</span>
            <button
              type="button"
              onClick={handleClockOut}
              title="Clock out kitchen shift"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: 'none',
                color: '#fff',
                padding: '2px 4px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginLeft: '2px'
              }}
            >
              <LogOut size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Bar: Kitchen Station Section Filters */}
      <div className="no-print" style={{
        background: '#070b16',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0.35rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, whiteSpace: 'nowrap' }}>
          STATION ROUTE:
        </span>
        {[
          { id: 'all', label: 'All Stations' },
          { id: 'tandoor', label: '🍗 Tandoor & Breads' },
          { id: 'curry', label: '🍛 Main Curries & Biryani' },
          { id: 'starters', label: '🥢 Chinese & Snacks' },
          { id: 'beverages', label: '🍹 Drinks & Bar' }
        ].map(stn => (
          <button
            key={stn.id}
            type="button"
            onClick={() => setStationFilter(stn.id)}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: stationFilter === stn.id ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.04)',
              color: stationFilter === stn.id ? '#fca5a5' : '#94a3b8',
              border: stationFilter === stn.id ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {stn.label}
          </button>
        ))}
      </div>

      {/* Flashing Void / Cancellation Banner (Prevents Food Wastage) */}
      {voidAlert && (
        <div className="no-print" style={{
          background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)',
          color: '#fff',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.7)',
          animation: 'pulse 1s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} color="#fef08a" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                🛑 KOT CANCELLATION: TABLE {voidAlert.tableNumber} CANCELLED "{voidAlert.itemName}"!
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fecaca' }}>
                Reason: <strong>{voidAlert.reason || 'Guest Changed Mind'}</strong> • By Steward: {voidAlert.steward} — DO NOT PREPARE!
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVoidAlert(null)}
            style={{
              background: '#000',
              border: '1px solid #f87171',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✓ ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* New Order Banner Toast */}
      {newOrderNotice && (
        <div className="no-print" style={{
          background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
          color: '#fff',
          padding: '0.55rem 1rem',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '0.9rem',
          letterSpacing: '0.04em',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)'
        }}>
          {newOrderNotice}
        </div>
      )}

      {/* KDS Active Tickets Grid */}
      <div className="no-print" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem',
        alignContent: 'flex-start'
      }}>
        {filteredOrders.map(order => {
          const elapsed = getElapsed(order.timestamp);
          const isReady = order.status === 'Ready';
          const pickupWait = isReady ? getPickupLatency(order.readyTimestamp) : null;
          const isJainOrSpecial = Boolean(order.dietaryTag === 'jain' || order.generalNote?.toLowerCase().includes('jain') || order.generalNote?.toLowerCase().includes('no onion'));

          // Check if all items in order are bumped
          const allBumped = (order.items || []).length > 0 && (order.items || []).every((_, i) => bumpedItems[`${order.id}_${i}`]);

          return (
            <div
              key={order.id}
              style={{
                background: '#0b1120',
                border: isReady 
                  ? pickupWait?.isOverdue
                    ? '2px solid #a855f7' // Pulsing purple for cold food risk!
                    : '2px solid #10b981' 
                  : elapsed.isUrgent 
                  ? '2px solid #ef4444' 
                  : elapsed.isWarning 
                  ? '2px solid #f59e0b' 
                  : isJainOrSpecial
                  ? '2px solid #eab308' // Gold border for Jain/Satvik
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: isReady 
                  ? pickupWait?.isOverdue
                    ? '0 0 25px rgba(168, 85, 247, 0.5)'
                    : '0 8px 30px rgba(16, 185, 129, 0.2)' 
                  : elapsed.isUrgent 
                  ? '0 8px 30px rgba(239, 68, 68, 0.3)' 
                  : '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Ticket Top Banner */}
              <div style={{
                background: isReady 
                  ? pickupWait?.isOverdue ? '#581c87' : '#064e3b' 
                  : elapsed.isUrgent 
                  ? '#7f1d1d' 
                  : elapsed.isWarning 
                  ? '#78350f' 
                  : '#1e293b',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {order.orderType === 'room' ? `ROOM ${order.tableNumber}` : `TABLE ${order.tableNumber}`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px' }}>
                    KOT #{order.kotNumber || order.runningKotIndex || 1} • <strong style={{ color: '#fbbf24' }}>{order.steward}</strong>
                  </div>

                  {Boolean(order.isRunningKot || order.runningKotIndex > 1 || (tableSessions[order.tableNumber]?.kots?.length > 1)) && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f59e0b',
                      color: '#000',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      marginTop: '3px'
                    }}>
                      <span>🔥 REPEAT ROUND #{order.runningKotIndex || order.kotNumber}</span>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  {/* Thermal Slip Print Button */}
                  <button
                    type="button"
                    onClick={() => setKotToPrint(order)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Printer size={12} />
                    <span>Print Slip</span>
                  </button>

                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: elapsed.isUrgent ? '#fca5a5' : elapsed.isWarning ? '#fde047' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <Clock size={14} />
                    <span>{elapsed.text}</span>
                  </div>
                </div>
              </div>

              {/* Overdue Pickup Alert (Cold Food Risk) */}
              {isReady && pickupWait?.isOverdue && (
                <div style={{
                  background: 'linear-gradient(90deg, #6b21a8 0%, #9333ea 100%)',
                  padding: '0.4rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #c084fc'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#fdf4ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Timer size={14} />
                    <span>WAITING AT PASS: {pickupWait.text} MINS (COLD RISK)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePingSteward(order)}
                    style={{
                      background: '#fff',
                      border: 'none',
                      color: '#581c87',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔔 PING STEWARD
                  </button>
                </div>
              )}

              {/* Special Dietary / Cooking Note Banner */}
              {(order.generalNote || isJainOrSpecial) && (
                <div style={{
                  background: isJainOrSpecial ? 'rgba(234, 179, 8, 0.2)' : 'rgba(245, 158, 11, 0.12)',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: isJainOrSpecial ? '#fde047' : '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <AlertTriangle size={14} />
                  <span>{isJainOrSpecial ? '*** STRICT JAIN / SATVIK PREPARATION ***' : `NOTE: ${order.generalNote}`}</span>
                </div>
              )}

              {/* Items List with Individual Bump Checkbox */}
              <div style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800 }}>
                  TAP DISH TO BUMP (STRIKE-THROUGH WHEN PLATED):
                </div>

                {(order.items || []).map((it, idx) => {
                  const isBumped = Boolean(bumpedItems[`${order.id}_${idx}`]);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleBump(order.id, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx < order.items.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                        paddingBottom: '0.45rem',
                        cursor: 'pointer',
                        opacity: isBumped ? 0.45 : 1,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        {/* Checkbox badge */}
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '5px',
                          border: isBumped ? '1.5px solid #10b981' : '1.5px solid rgba(255,255,255,0.3)',
                          background: isBumped ? '#10b981' : 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 900
                        }}>
                          {isBumped ? <Check size={14} /> : `${it.quantity}x`}
                        </div>

                        <div>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#fff',
                            textDecoration: isBumped ? 'line-through' : 'none'
                          }}>
                            {it.isVeg ? '🟢 ' : '🔴 '}{it.name}
                          </div>
                          {it.note && (
                            <div style={{ fontSize: '0.72rem', color: '#fde047', fontWeight: 600 }}>
                              👉 {it.note}
                            </div>
                          )}
                        </div>
                      </div>

                      {isBumped && (
                        <span style={{ fontSize: '0.62rem', background: '#064e3b', color: '#6ee7b7', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          PLATED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ticket Bottom Action Button */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                gap: '0.45rem'
              }}>
                {order.status === 'Preparing' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'Ready')}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '8px',
                      background: allBumped
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: allBumped ? '0 4px 15px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{allBumped ? '✓ ALL PLATED ➔ MARK READY' : '🔔 MARK READY FOR PICKUP'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'Served')}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <span>✓ MARK AS DELIVERED / SERVED</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '4rem 1rem',
            color: '#64748b'
          }}>
            <ChefHat size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#94a3b8' }}>
              Kitchen Line is Clear!
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Waiting for Stewards to punch new KOTs from floor mobiles...
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: THERMAL KOT SLIP PRINTER (58mm / 80mm ESC/POS Monospace)
          ========================================================================= */}
      {kotToPrint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#000000',
            width: '100%',
            maxWidth: '380px',
            maxHeight: '90vh',
            borderRadius: '10px',
            overflowY: 'auto',
            padding: '1.25rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            fontFamily: 'monospace, "Courier New", Courier'
          }}>
            {/* The Print Sheet container matching index.css thermal print engine */}
            <div className="printable-receipt printable-pos-slip thermal-receipt-sheet">
              {/* Slip Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>HOTEL ELITE INN</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>CANNON KITCHEN ORDER TICKET (KOT)</div>
                <div style={{ fontSize: '0.72rem' }}>Ground Floor Hot Pass • Pure Hospitality</div>
              </div>

              {/* Metadata */}
              <div style={{ fontSize: '0.8rem', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px', lineHeight: 1.35 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.95rem' }}>
                  <span>{kotToPrint.orderType === 'room' ? `ROOM: ${kotToPrint.tableNumber}` : `TABLE: ${kotToPrint.tableNumber}`}</span>
                  <span>KOT #{kotToPrint.kotNumber || kotToPrint.runningKotIndex || 1}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>STEWARD: {kotToPrint.steward}</span>
                  <span>TYPE: {(kotToPrint.orderType || 'dining').toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TIME: {kotToPrint.timeFormatted || new Date(kotToPrint.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>DATE: {new Date(kotToPrint.timestamp).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Special Dietary / Rush Alerts */}
              {(kotToPrint.dietaryTag === 'jain' || kotToPrint.generalNote?.toLowerCase().includes('jain')) && (
                <div style={{
                  background: '#000',
                  color: '#fff',
                  padding: '4px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  marginBottom: '8px'
                }}>
                  *** STRICT JAIN PREPARATION ***<br />
                  *** NO ONION / NO GARLIC ***
                </div>
              )}

              {/* Items List */}
              <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.78rem', borderBottom: '1px dashed #666', paddingBottom: '3px', marginBottom: '4px' }}>
                  <span style={{ width: '40px' }}>QTY</span>
                  <span style={{ flex: 1 }}>ITEM DESCRIPTION</span>
                </div>
                {(kotToPrint.items || []).map((it, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ width: '40px', fontWeight: 900, fontSize: '0.95rem' }}>{it.quantity}x</span>
                      <span style={{ flex: 1, fontWeight: 700 }}>{it.name}</span>
                    </div>
                    {it.note && (
                      <div style={{ marginLeft: '40px', fontSize: '0.72rem', fontStyle: 'italic' }}>
                        👉 Note: {it.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* General Cooking Instructions */}
              {kotToPrint.generalNote && (
                <div style={{ fontSize: '0.78rem', fontWeight: 800, borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  CHEF INSTRUCTIONS: {kotToPrint.generalNote}
                </div>
              )}

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#333' }}>
                Dispatched via Steward Mobile Order Pad<br />
                Hotel Elite Inn • Cannon Kitchen Pass
              </div>
            </div>

            {/* Modal Action Controls in no-print */}
            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
                style={{
                  flex: 1,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} />
                <span>Print Thermal Slip (ESC/POS)</span>
              </button>
              <button
                type="button"
                onClick={() => setKotToPrint(null)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: 86 LIST & PORTION COUNTDOWN MANAGER (Chef to Steward Lock)
          ========================================================================= */}
      {showStockoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertOctagon size={18} />
                  <span>86 Out of Stock &amp; Portion Counter</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Lock sold out dishes to prevent stewards from punching them
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStockoutModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search items */}
            <div style={{
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.4rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '0.75rem'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search dish or item code..."
                value={stockoutSearch}
                onChange={(e) => setStockoutSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  flex: 1
                }}
              />
            </div>

            {/* Menu items list */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {RESTAURANT_MENU.filter(m => !stockoutSearch || m.name.toLowerCase().includes(stockoutSearch.toLowerCase()) || m.itemCode.includes(stockoutSearch)).map(dish => {
                const stockState = outOfStockItems[dish.itemCode];
                const isSoldOut = stockState?.soldOut ?? Boolean(stockState);
                const portionsLeft = stockState?.portionsLeft !== undefined ? stockState.portionsLeft : 10;

                return (
                  <div
                    key={dish.itemCode}
                    style={{
                      background: isSoldOut ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSoldOut ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                        {dish.isVeg ? '🟢 ' : '🔴 '}{dish.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        Code: {dish.itemCode} • ₹{dish.price}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Portion Counter Stepper */}
                      {!isSoldOut && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#020617', padding: '2px 5px', borderRadius: '6px', border: '1px solid #334155' }}>
                          <button
                            type="button"
                            onClick={() => handleAdjustPortions(dish, -1)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '1px' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#38bdf8', minWidth: '32px', textAlign: 'center' }}>
                            {portionsLeft} left
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustPortions(dish, 1)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '1px' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}

                      {/* 86 Sold Out Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle86(dish)}
                        style={{
                          background: isSoldOut ? '#ef4444' : 'rgba(255,255,255,0.1)',
                          color: isSoldOut ? '#fff' : '#cbd5e1',
                          border: isSoldOut ? 'none' : '1px solid rgba(255,255,255,0.2)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isSoldOut ? '86 SOLD OUT' : 'AVAILABLE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowStockoutModal(false)}
              style={{
                marginTop: '0.75rem',
                width: '100%',
                padding: '0.65rem',
                background: '#334155',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 800,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Done &amp; Sync with Floor Mobiles
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CHEF SHIFT END RECONCILIATION SLIP (Printable Summary)
          ========================================================================= */}
      {showShiftSummaryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#000000',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            borderRadius: '10px',
            overflowY: 'auto',
            padding: '1.25rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            fontFamily: 'monospace, "Courier New", Courier'
          }}>
            <div className="printable-receipt printable-pos-slip thermal-receipt-sheet">
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>HOTEL ELITE INN</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>KITCHEN SHIFT CLOSING STATEMENT</div>
                <div style={{ fontSize: '0.72rem' }}>Cannon Kitchen • Shift Reconciliation</div>
              </div>

              <div style={{ fontSize: '0.8rem', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                <div>SHIFT: {shiftSession?.shift || 'Evening'} • CHEF: {shiftSession?.staffName || 'Head Chef'}</div>
                <div>DATE: {new Date().toLocaleDateString('en-IN')} • TIME: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>TOTAL KOTS HANDLED: {shiftMetrics.totalKots} (COMPLETED: {shiftMetrics.completedKots})</div>
                <div>AVG PREP TIME: {shiftMetrics.avgMins} MINS PER ORDER</div>
              </div>

              {/* Cooked Dish Breakdown */}
              <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '4px' }}>
                  PORTIONS COOKED BREAKDOWN:
                </div>
                {shiftMetrics.dishCounts.map(([name, count], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                    <span>{name}</span>
                    <span style={{ fontWeight: 900 }}>{count} pts</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, borderTop: '1px dashed #666', paddingTop: '4px', marginTop: '4px' }}>
                  <span>TOTAL DISHES PREPARED:</span>
                  <span>{shiftMetrics.totalItemsCooked} portions</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444' }}>
                Verified by Executive Chef &amp; Hotel Manager<br />
                Signature: __________________________
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
                style={{
                  flex: 1,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} />
                <span>Print Shift Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShiftSummaryModal(false)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
