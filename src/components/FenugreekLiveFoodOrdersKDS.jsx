// src/components/FenugreekLiveFoodOrdersKDS.jsx
// Enterprise Kitchen Display System (KDS) & Live Food Orders Console
// Directly interconnected with Steward Mobile Order Pad, Kitchen Portal, & PMS Master Folios

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Clock, CheckCircle2, Bell, Volume2, VolumeX, RefreshCw, 
  Utensils, ChefHat, Sparkles, Filter, X, Printer, Search, 
  Bed, Check, ArrowRight, DollarSign, AlertCircle, ShoppingBag, 
  ExternalLink, Maximize2, Minimize2, Eye
} from 'lucide-react';
import { playOrderAlert, playSuccessChime } from '../utils/soundAlert';
import { 
  getLiveKots, saveLiveKots, broadcastKotChannel, 
  updateKotStatusUnified, normalizeKotOrder, KOT_STORAGE_KEY, KDS_CHANNEL_NAME 
} from '../utils/kotDataSync';

export default function FenugreekLiveFoodOrdersKDS({
  onBillToRoom,
  onOpenPOS,
  compact = false,
  onClose
}) {
  const [orders, setOrders] = useState(() => getLiveKots());
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'all', 'Received', 'Preparing', 'Ready', 'Delivered'
  const [outletFilter, setOutletFilter] = useState('all'); // 'all', 'dining', 'room', 'bar'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [newOrderNotice, setNewOrderNotice] = useState(null);
  const [kotToPrint, setKotToPrint] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const fetchCloudOrdersRef = useRef(null);

  // Bumped (strike-through) items tracker for line chefs
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

  const seenOrderIds = useRef(new Set(orders.map(o => o.id || o.orderId)));

  // Live timer tick every second for real-time elapsed counter
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // BroadcastChannel & Storage Event synchronization
  useEffect(() => {
    const handleIncomingOrder = (newOrder) => {
      const normalized = normalizeKotOrder(newOrder);
      if (!normalized) return;
      
      const idKey = normalized.id || normalized.orderId;
      setOrders(prev => {
        const exists = prev.some(o => (o.id || o.orderId) === idKey);
        if (exists) {
          return prev.map(o => (o.id || o.orderId) === idKey ? normalized : o);
        }
        return [normalized, ...prev];
      });

      if (!seenOrderIds.current.has(idKey)) {
        seenOrderIds.current.add(idKey);
        const dest = normalized.orderType === 'room' ? `Room ${normalized.roomNumber}` : `Table ${normalized.tableNumber || 'Dining'}`;
        const sourceLabel = normalized.steward === 'In-Room QR Order' || normalized.captain === 'In-Room QR Order' ? '🛎️ In-Room Guest QR' : 'Steward';
        setNewOrderNotice(`🔔 NEW KOT #${normalized.kotNumber} from ${sourceLabel} for ${dest}!`);
        setTimeout(() => setNewOrderNotice(null), 8000);

        if (!isAudioMuted) {
          playOrderAlert();
          setTimeout(() => playOrderAlert(), 450);
        }
      }
    };

    let channel = null;
    let channelKot = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      // Primary KDS Bus
      channel = new BroadcastChannel(KDS_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const { type, order, orderId, status, tableSessions: ts } = event.data || {};
        if (type === 'NEW_KOT_ORDER' && order) {
          handleIncomingOrder(order);
          if (ts) setTableSessions(ts);
        } else if (type === 'KOT_STATUS_UPDATED' && orderId) {
          setOrders(prev => prev.map(o => {
            if ((o.id || o.orderId) === orderId) {
              return { ...o, status };
            }
            return o;
          }));
        } else if (type === 'TABLE_SESSIONS_UPDATE' && ts) {
          setTableSessions(ts);
        }
      };

      // Secondary Reception KOT Bus
      channelKot = new BroadcastChannel('hotel_elite_inn_kot');
      channelKot.onmessage = (event) => {
        const { type, order } = event.data || {};
        if (type === 'NEW_KOT_ORDER' && order) {
          handleIncomingOrder(order);
        }
      };
    }

    const handleStorage = (e) => {
      if ((e.key === KOT_STORAGE_KEY || e.key === 'hotel_elite_inn_food_orders') && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) {
            setOrders(prev => {
              const freshNormalized = fresh.map(normalizeKotOrder).filter(Boolean);
              // Merge maintaining any active states
              const map = new Map();
              freshNormalized.forEach(o => map.set(o.id || o.orderId, o));
              prev.forEach(o => {
                const k = o.id || o.orderId;
                if (!map.has(k)) map.set(k, o);
              });
              return Array.from(map.values());
            });
          }
        } catch (err) {}
      } else if (e.key === 'hotel_elite_inn_table_sessions' && e.newValue) {
        try {
          setTableSessions(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);

    // 3. Real-Time Cloud Network Sync: Bridges orders from Mobile Stewards & Room QRs across internet
    const fetchCloudOrders = async () => {
      try {
        const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
          body: JSON.stringify({ action: 'get_live_kots' })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.kots && Array.isArray(data.kots)) {
          data.kots.forEach(order => {
            handleIncomingOrder(order);
          });
        }
      } catch (err) {
        // silent fallback on network glitch
      }
    };

    fetchCloudOrdersRef.current = fetchCloudOrders;
    fetchCloudOrders();
    const cloudPollInterval = setInterval(fetchCloudOrders, 2500);

    return () => {
      if (channel) channel.close();
      if (channelKot) channelKot.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(cloudPollInterval);
    };
  }, [isAudioMuted]);

  // Toggle item-level bump bar strike-through
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

  // Status transition handler
  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = updateKotStatusUnified(orderId, newStatus);
    setOrders(updated);

    if (newStatus === 'Ready') {
      playSuccessChime();
    } else if (newStatus === 'Preparing') {
      playOrderAlert();
    }

    setFeedbackToast(`KOT ${orderId} marked as ${newStatus}!`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // 1-Click Bill to Room Master Folio
  const handleBillToRoomClick = (order) => {
    const orderId = order.id || order.orderId;
    const roomNum = order.roomNumber;
    
    if (!roomNum) {
      alert("This KOT is assigned to a Dining Table. Please settle via Fenugreek POS Cashier.");
      return;
    }

    if (onBillToRoom) {
      onBillToRoom({
        roomNumber: roomNum,
        kotId: orderId,
        orderId: orderId,
        guestName: order.guestName,
        totalAmount: order.totalAmount,
        subtotal: Math.round((order.totalAmount / 1.05) * 100) / 100,
        gst: Math.round((order.totalAmount - (order.totalAmount / 1.05)) * 100) / 100,
        items: order.items,
        description: `Fenugreek In-Room Dining KOT ${orderId} (${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')})`,
        outlet: order.outlet || 'Fenugreek Restaurant',
        captainName: order.captain || order.steward || 'KOTI'
      });
    }

    // Mark order as billed & delivered
    const all = getLiveKots();
    const updated = all.map(o => {
      if ((o.id || o.orderId) === orderId) {
        return { ...o, payment_status: 'Billed to Room', status: 'Delivered' };
      }
      return o;
    });
    saveLiveKots(updated);
    broadcastKotChannel({
      type: 'KOT_STATUS_UPDATED',
      orderId,
      status: 'Delivered'
    });
    setOrders(updated);

    playSuccessChime();
    setFeedbackToast(`✓ KOT ${orderId} of ₹${order.totalAmount} successfully debited to Room ${roomNum} Master Folio!`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Helper for elapsed duration calculation
  const getElapsedInfo = (timestamp) => {
    if (!timestamp) return { text: '0m', mins: 0, isDelayed: false };
    const orderTime = new Date(timestamp).getTime();
    const diffSecs = Math.max(0, Math.floor((now - orderTime) / 1000));
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    const isDelayed = mins >= 20;

    return {
      text: `${mins}m ${secs.toString().padStart(2, '0')}s`,
      mins,
      isDelayed,
      isAttention: mins >= 10 && mins < 20
    };
  };

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    // Status Filter
    if (statusFilter === 'active') {
      if (order.status === 'Delivered') return false;
    } else if (statusFilter !== 'all') {
      if (order.status !== statusFilter) return false;
    }

    // Outlet Filter
    if (outletFilter === 'room' && order.orderType !== 'room') return false;
    if (outletFilter === 'dining' && order.orderType !== 'dining') return false;
    if (outletFilter === 'bar' && order.orderType !== 'bar') return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = (order.id || order.orderId || '').toLowerCase().includes(q);
      const roomMatch = (order.roomNumber || '').toLowerCase().includes(q);
      const tableMatch = (order.tableNumber || '').toLowerCase().includes(q);
      const guestMatch = (order.guestName || '').toLowerCase().includes(q);
      const stewardMatch = (order.steward || order.captain || '').toLowerCase().includes(q);
      const itemMatch = (order.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      if (!idMatch && !roomMatch && !tableMatch && !guestMatch && !stewardMatch && !itemMatch) return false;
    }

    return true;
  });

  // KPI Counts
  const receivedCount = orders.filter(o => o.status === 'Received').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready' || o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const activeCount = receivedCount + preparingCount + readyCount;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#060a12',
      color: '#f8fafc',
      borderRadius: compact ? '0' : '14px',
      border: compact ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Toast Feedback */}
      {feedbackToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 800,
          fontSize: '0.88rem',
          zIndex: 99999,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} /> {feedbackToast}
        </div>
      )}

      {/* Top Banner Alert when new order comes from Steward */}
      {newOrderNotice && (
        <div style={{
          background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
          color: '#ffffff',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 800,
          fontSize: '0.85rem',
          borderBottom: '2px solid #f87171',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.1rem', animation: 'bounce 1s infinite' }}>🔔</span>
            <span>{newOrderNotice}</span>
          </div>
          <button 
            onClick={() => setNewOrderNotice(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Header & Master KDS Toolbar */}
      <div style={{
        padding: '0.9rem 1.25rem',
        background: 'linear-gradient(135deg, #0d1526 0%, #070d18 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Left Title with Live Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
            border: '1px solid var(--gold-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-glow)',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.25)'
          }}>
            <ChefHat size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Cannon Kitchen Live Food Orders &amp; Production KDS
              </h3>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.68rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                LIVE ZERO-LATENCY SYNC
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Chef Station &amp; Hotel Manager Control • Real-Time Steward Mobile Interconnection
            </div>
          </div>
        </div>

        {/* Right Action Tools: Cloud Sync, Chime Test, POS Button, Audio Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setIsSyncingCloud(true);
              if (fetchCloudOrdersRef.current) {
                fetchCloudOrdersRef.current().finally(() => {
                  setTimeout(() => setIsSyncingCloud(false), 600);
                });
              } else {
                setIsSyncingCloud(false);
              }
              setFeedbackToast('⚡ Synced with Cloud D1: Checked live orders from Mobile Stewards & Room QRs!');
            }}
            title="Force immediate check for new orders from Mobile Stewards & Room QRs"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(14, 165, 233, 0.12))',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '0.42rem 0.85rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.2)'
            }}
          >
            <RefreshCw size={13} style={{ animation: isSyncingCloud ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud Orders'}</span>
          </button>

          <button
            onClick={() => {
              playOrderAlert();
              setFeedbackToast('🔔 Kitchen Order Alert Chime tested successfully!');
            }}
            title="Test Kitchen Alert Sound"
            style={{
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              color: '#fbbf24',
              padding: '0.42rem 0.75rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Bell size={13} /> Chime Test
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? "Unmute Order Sounds" : "Mute Order Sounds"}
            style={{
              background: isAudioMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              border: isAudioMuted ? '1px solid #ef4444' : '1px solid #10b981',
              color: isAudioMuted ? '#f87171' : '#34d399',
              padding: '0.42rem 0.75rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isAudioMuted ? 'Muted' : 'Sound ON'}
          </button>

          {onOpenPOS && (
            <button
              onClick={onOpenPOS}
              className="btn-primary"
              style={{
                padding: '0.42rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)'
              }}
            >
              <Utensils size={14} /> Open Fenugreek POS (F2)
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                padding: '0.42rem',
                borderRadius: '7px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Status Filter Bar & Search */}
      <div style={{
        padding: '0.65rem 1.25rem',
        background: 'rgba(5, 10, 20, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto' }}>
          {[
            { id: 'active', label: '🔥 Active Turnaround', count: activeCount, color: '#38bdf8' },
            { id: 'Received', label: '🚨 Received (New)', count: receivedCount, color: '#ef4444' },
            { id: 'Preparing', label: '👨‍🍳 In Cooking', count: preparingCount, color: '#f59e0b' },
            { id: 'Ready', label: '🛵 Ready / Dispatch', count: readyCount, color: '#06b6d4' },
            { id: 'Delivered', label: '✓ Delivered & Billed', count: deliveredCount, color: '#10b981' },
            { id: 'all', label: 'All KOTs', count: orders.length, color: '#94a3b8' }
          ].map(pill => {
            const isSelected = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id)}
                style={{
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? `1.5px solid ${pill.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? `${pill.color}22` : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? pill.color : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{pill.label}</span>
                <span style={{
                  background: isSelected ? pill.color : 'rgba(255, 255, 255, 0.09)',
                  color: isSelected ? '#000000' : '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '6px'
                }}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Outlet Filter & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Outlet Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { id: 'all', label: 'All Outlets' },
              { id: 'dining', label: '🍽️ Dining Tables' },
              { id: 'room', label: '🛏️ In-Room Dining' },
              { id: 'bar', label: '🍸 Drop In Bar' }
            ].map(out => (
              <button
                key={out.id}
                onClick={() => setOutletFilter(out.id)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: outletFilter === out.id ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: outletFilter === out.id ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                  color: outletFilter === out.id ? 'var(--gold-glow)' : '#94a3b8'
                }}
              >
                {out.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search KOT, Room, Dish..."
              style={{
                width: '100%',
                padding: '0.35rem 0.6rem 0.35rem 1.85rem',
                background: '#0d1526',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main KDS Cards Grid */}
      <div style={{
        padding: '1.25rem',
        overflowY: 'auto',
        maxHeight: compact ? '68vh' : '76vh',
        minHeight: '380px'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Utensils size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: '#fbbf24' }} />
            <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
              No Active KOTs in this Status
            </h4>
            <p style={{ fontSize: '0.82rem', maxWidth: 440, margin: '0 0 1.25rem' }}>
              When a steward punches a new food order on their mobile order pad, or a guest orders from their room QR, it will appear here instantly with live audio chime.
            </p>
            {onOpenPOS && (
              <button
                onClick={onOpenPOS}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                + Punch New Dining / Room Order
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.15rem'
          }}>
            {filteredOrders.map(order => {
              const orderId = order.id || order.orderId;
              const elapsed = getElapsedInfo(order.timestamp || order.created_at);
              const isReceived = order.status === 'Received';
              const isPreparing = order.status === 'Preparing';
              const isReady = order.status === 'Ready' || order.status === 'Out for Delivery';
              const isDelivered = order.status === 'Delivered';

              // Multi-KOT Running table session info
              const tableSession = (order.orderType === 'dining' && order.tableNumber) 
                ? tableSessions[order.tableNumber] 
                : null;

              return (
                <div
                  key={orderId}
                  style={{
                    background: isReceived 
                      ? 'linear-gradient(145deg, #181119 0%, #0d0f18 100%)' 
                      : isPreparing
                      ? 'linear-gradient(145deg, #1a160c 0%, #0d121c 100%)'
                      : 'linear-gradient(145deg, #0e1726 0%, #090e18 100%)',
                    border: isReceived
                      ? '2px solid #ef4444'
                      : isPreparing
                      ? '1.5px solid #f59e0b'
                      : isReady
                      ? '1.5px solid #06b6d4'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: isReceived
                      ? '0 6px 25px rgba(239, 68, 68, 0.25)'
                      : '0 4px 18px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar: KOT Number, Destination & Elapsed Ticker */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: 'var(--gold-glow)',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em'
                      }}>
                        #{orderId}
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {order.outlet || 'Fenugreek Restaurant'}
                      </span>
                    </div>

                    {/* Live Elapsed Counter Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: elapsed.isDelayed 
                        ? 'rgba(239, 68, 68, 0.25)' 
                        : elapsed.isAttention 
                        ? 'rgba(245, 158, 11, 0.2)' 
                        : 'rgba(16, 185, 129, 0.15)',
                      color: elapsed.isDelayed 
                        ? '#f87171' 
                        : elapsed.isAttention 
                        ? '#fbbf24' 
                        : '#34d399',
                      border: elapsed.isDelayed 
                        ? '1px solid #ef4444' 
                        : elapsed.isAttention 
                        ? '1px solid #f59e0b' 
                        : '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <Clock size={11} />
                      <span>{elapsed.text} ago</span>
                      {elapsed.isDelayed && !isDelivered && <span>⚠️ URGENT</span>}
                    </div>
                  </div>

                  {/* Destination (Room / Table) & Guest Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {order.orderType === 'room' || order.roomNumber ? (
                        <div style={{
                          background: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid #38bdf8',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Bed size={13} /> Room {order.roomNumber}
                        </div>
                      ) : (
                        <div style={{
                          background: 'rgba(52, 211, 153, 0.2)',
                          color: '#34d399',
                          border: '1px solid #34d399',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Utensils size={13} /> Table {order.tableNumber || 'Main'}
                        </div>
                      )}

                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>
                        {order.guestName || 'Guest'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: isReceived 
                        ? 'rgba(239, 68, 68, 0.25)' 
                        : isPreparing 
                        ? 'rgba(245, 158, 11, 0.25)' 
                        : isReady 
                        ? 'rgba(6, 182, 212, 0.25)' 
                        : 'rgba(16, 185, 129, 0.2)',
                      color: isReceived 
                        ? '#f87171' 
                        : isPreparing 
                        ? '#fbbf24' 
                        : isReady 
                        ? '#38bdf8' 
                        : '#34d399',
                      border: isReceived 
                        ? '1px solid #ef4444' 
                        : isPreparing 
                        ? '1px solid #f59e0b' 
                        : isReady 
                        ? '1px solid #06b6d4' 
                        : '1px solid #10b981'
                    }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Satvik Pure Veg or Dietary Warning */}
                  {order.is_jain_satvik ? (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      color: '#34d399',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Sparkles size={13} color="#34d399" />
                      <span>Satvik Pure Veg • Strict No Onion / No Garlic</span>
                    </div>
                  ) : null}

                  {/* General Cooking Instructions Callout */}
                  {order.generalNote && (
                    <div style={{
                      background: 'rgba(251, 191, 36, 0.09)',
                      border: '1px dashed rgba(251, 191, 36, 0.4)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      color: '#fbbf24',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      fontStyle: 'italic'
                    }}>
                      Chef Note: {order.generalNote}
                    </div>
                  )}

                  {/* Order Items with Interactive Line-Chef Bump Bar */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>DISH &amp; QUANTITY (Click dish to bump/check off)</span>
                      <span>AMOUNT</span>
                    </div>

                    {(order.items || []).map((it, idx) => {
                      const isBumped = bumpedItems[`${orderId}_${idx}`];

                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleBump(orderId, idx)}
                          title="Click to check off / strike through prepared item"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: '3px 4px',
                            borderRadius: '4px',
                            background: isBumped ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                            <span style={{
                              background: isBumped ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 191, 36, 0.2)',
                              color: isBumped ? '#34d399' : 'var(--gold-glow)',
                              fontWeight: 900,
                              fontSize: '0.75rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              marginTop: '1px'
                            }}>
                              {it.quantity}x
                            </span>
                            <div>
                              <div style={{
                                fontWeight: 700,
                                color: isBumped ? '#64748b' : '#f8fafc',
                                textDecoration: isBumped ? 'line-through' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <span>{it.name}</span>
                                {isBumped && <Check size={12} color="#10b981" />}
                              </div>
                              {it.note && (
                                <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontStyle: 'italic', marginTop: '1px' }}>
                                  Note: {it.note}
                                </div>
                              )}
                            </div>
                          </div>

                          <span style={{
                            color: isBumped ? '#64748b' : '#cbd5e1',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            ₹{(Number(it.price || it.rate || 0) * Number(it.quantity || 1)).toFixed(0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Financial & Steward Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.2rem',
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                  }}>
                    <span>Steward: <strong style={{ color: '#ffffff' }}>{order.steward || order.captain || 'KOTI'}</strong></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>KOT Total:</span>
                      <strong style={{ color: 'var(--gold-glow)', fontSize: '1rem', fontWeight: 900 }}>
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </strong>
                    </div>
                  </div>

                  {/* Multi-KOT Running Table Summary Info */}
                  {tableSession && tableSession.status === 'OCCUPIED' && (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.72rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#fbbf24'
                    }}>
                      <span>Table {order.tableNumber} Running Total ({tableSession.kots?.length || 1} KOTs):</span>
                      <strong style={{ fontSize: '0.85rem' }}>₹{tableSession.netTotal || order.totalAmount}</strong>
                    </div>
                  )}

                  {/* Kitchen Status Progression & Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    {isReceived && (
                      <button
                        onClick={() => handleUpdateStatus(orderId, 'Preparing')}
                        style={{
                          flex: 2,
                          padding: '0.55rem',
                          borderRadius: '7px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#000000',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)'
                        }}
                      >
                        <Flame size={14} /> Start Cooking (Preparing)
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(orderId, 'Ready')}
                        style={{
                          flex: 2,
                          padding: '0.55rem',
                          borderRadius: '7px',
                          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)'
                        }}
                      >
                        <Bell size={14} /> Ready / Dispatch
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(orderId, 'Delivered')}
                        style={{
                          flex: 2,
                          padding: '0.55rem',
                          borderRadius: '7px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        <CheckCircle2 size={14} /> Mark Served &amp; Complete
                      </button>
                    )}

                    {/* 1-Click Bill to Room Master Folio */}
                    {order.roomNumber && order.payment_status !== 'Billed to Room' && (
                      <button
                        onClick={() => handleBillToRoomClick(order)}
                        title={`Charge ₹${order.totalAmount} directly to Room ${order.roomNumber} active folio`}
                        style={{
                          flex: 1.5,
                          padding: '0.55rem',
                          borderRadius: '7px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1.5px solid var(--gold-glow)',
                          color: 'var(--gold-glow)',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <DollarSign size={14} /> Bill Room {order.roomNumber}
                      </button>
                    )}

                    {/* Thermal Print Slip */}
                    <button
                      onClick={() => setKotToPrint(order)}
                      title="Preview & Print 80mm/58mm Kitchen Thermal KOT Ticket"
                      style={{
                        padding: '0.55rem 0.65rem',
                        borderRadius: '7px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Thermal KOT Modal */}
      {kotToPrint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#000000',
            fontFamily: 'monospace',
            width: '100%',
            maxWidth: '360px',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>HOTEL ELITE INN</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>FENUGREEK RESTAURANT KOT</div>
              <div style={{ fontSize: '0.75rem' }}>KOT {kotToPrint.id || kotToPrint.orderId}</div>
              <div style={{ fontSize: '0.75rem' }}>{new Date(kotToPrint.timestamp || Date.now()).toLocaleString('en-IN')}</div>
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <div><strong>{kotToPrint.roomNumber ? `ROOM: ${kotToPrint.roomNumber}` : `TABLE: ${kotToPrint.tableNumber || '1'}`}</strong></div>
              <div>Guest: {kotToPrint.guestName}</div>
              <div>Steward: {kotToPrint.steward || kotToPrint.captain || 'KOTI'}</div>
              <div>Outlet: {kotToPrint.outlet || 'Fenugreek Restaurant'}</div>
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.5rem 0', margin: '0.5rem 0' }}>
              {(kotToPrint.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                  <span>{it.quantity}x {it.name}</span>
                  <span>₹{(Number(it.price || it.rate || 0) * Number(it.quantity || 1)).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.95rem' }}>
              <span>TOTAL ESTIMATE:</span>
              <span>₹{Number(kotToPrint.totalAmount || 0).toFixed(2)}</span>
            </div>

            {kotToPrint.generalNote && (
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic', borderTop: '1px dashed #ccc', paddingTop: '0.3rem' }}>
                Note: {kotToPrint.generalNote}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => {
                  window.print();
                }}
                style={{
                  flex: 1,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Print Thermal KOT
              </button>
              <button
                onClick={() => setKotToPrint(null)}
                style={{
                  flex: 1,
                  background: '#e2e8f0',
                  color: '#000',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontWeight: 700,
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
