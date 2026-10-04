import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Clock, CheckCircle2, Bell, Volume2, VolumeX, RefreshCw, 
  ArrowLeft, Utensils, AlertTriangle, ChefHat, Sparkles, Filter, X 
} from 'lucide-react';
import { playOrderAlert, playSuccessChime } from '../utils/soundAlert';

export default function KitchenDisplayKDS({ onClose }) {
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

  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'preparing', 'ready', 'all'
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [newOrderNotice, setNewOrderNotice] = useState(null);
  const seenOrderIds = useRef(new Set(orders.map(o => o.id)));

  // Update live clock every second for elapsed kitchen timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for BroadcastChannel & storage events (Instant zero-refresh sync!)
  useEffect(() => {
    const handleNewOrder = (order) => {
      if (!seenOrderIds.current.has(order.id)) {
        seenOrderIds.current.add(order.id);
        setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
        setNewOrderNotice(`🔔 NEW KOT #${order.kotNumber} for TABLE ${order.tableNumber}!`);
        setTimeout(() => setNewOrderNotice(null), 6000);

        if (!isAudioMuted) {
          playOrderAlert();
          // Secondary chime for emphasis
          setTimeout(() => playOrderAlert(), 400);
        }
      }
    };

    // 1. BroadcastChannel API for sub-millisecond local tab & window communication
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('hotel_elite_inn_live_kds');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_KOT_ORDER' && event.data.order) {
          handleNewOrder(event.data.order);
        }
      };
    }

    // 2. Storage event listener (when written by another tab/window)
    const handleStorage = (e) => {
      if (e.key === 'hotel_elite_inn_live_kots' && e.newValue) {
        try {
          const freshKots = JSON.parse(e.newValue);
          freshKots.forEach(order => {
            if (!seenOrderIds.current.has(order.id)) {
              handleNewOrder(order);
            }
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Lightweight 4-second Polling Heartbeat from Cloudflare D1 /api/sync
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
  }, [isAudioMuted]);

  // Update order status
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
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

  // Helper: Elapsed minutes & seconds
  const getElapsed = (timestamp) => {
    const elapsedMs = Math.max(0, now - new Date(timestamp).getTime());
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const isUrgent = mins >= 15;
    const isWarning = mins >= 10;
    return {
      text: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      isUrgent,
      isWarning
    };
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'active') return o.status !== 'Served';
    if (filterStatus === 'preparing') return o.status === 'Preparing';
    if (filterStatus === 'ready') return o.status === 'Ready';
    return true;
  });

  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;

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
      {/* KDS Header */}
      <header style={{
        background: '#0a0f1d',
        borderBottom: '2px solid rgba(239, 68, 68, 0.4)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={16} />
              <span style={{ fontSize: '0.8rem' }}>Exit</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🍳</span>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                CANNON KITCHEN DISPLAY (KDS)
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                  LIVE REAL-TIME
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Auto-synced with Steward Mobiles &amp; Reception Cashier POS
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills & Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filterStatus === 'active' ? '#ef4444' : 'transparent',
                color: filterStatus === 'active' ? '#fff' : '#cbd5e1'
              }}
            >
              Active ({preparingCount + readyCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('preparing')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filterStatus === 'preparing' ? '#f59e0b' : 'transparent',
                color: filterStatus === 'preparing' ? '#000' : '#cbd5e1'
              }}
            >
              Preparing ({preparingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ready')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filterStatus === 'ready' ? '#10b981' : 'transparent',
                color: filterStatus === 'ready' ? '#000' : '#cbd5e1'
              }}
            >
              Ready ({readyCount})
            </button>
          </div>

          {/* Audio Bell Test & Mute Button */}
          <button
            type="button"
            onClick={() => {
              playOrderAlert();
            }}
            title="Test Kitchen Alert Bell"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bell size={14} />
            <span>Test Bell</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? 'Unmute Kitchen Audio' : 'Mute Kitchen Audio'}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: isAudioMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)',
              border: isAudioMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
              color: isAudioMuted ? '#f87171' : '#fff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </header>

      {/* New Order Banner Toast */}
      {newOrderNotice && (
        <div style={{
          background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
          color: '#fff',
          padding: '0.65rem 1rem',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '1rem',
          letterSpacing: '0.04em',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
          animation: 'pulse 1s infinite'
        }}>
          {newOrderNotice}
        </div>
      )}

      {/* KDS Active Tickets Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
        alignContent: 'flex-start'
      }}>
        {filteredOrders.map(order => {
          const elapsed = getElapsed(order.timestamp);
          const isReady = order.status === 'Ready';

          return (
            <div
              key={order.id}
              style={{
                background: '#0b1120',
                border: isReady 
                  ? '2px solid #10b981' 
                  : elapsed.isUrgent 
                  ? '2px solid #ef4444' 
                  : elapsed.isWarning 
                  ? '2px solid #f59e0b' 
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: isReady 
                  ? '0 8px 30px rgba(16, 185, 129, 0.2)' 
                  : elapsed.isUrgent 
                  ? '0 8px 30px rgba(239, 68, 68, 0.3)' 
                  : '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Ticket Top Banner */}
              <div style={{
                background: isReady 
                  ? '#064e3b' 
                  : elapsed.isUrgent 
                  ? '#7f1d1d' 
                  : elapsed.isWarning 
                  ? '#78350f' 
                  : '#1e293b',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    TABLE {order.tableNumber}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '3px' }}>
                    {order.kotNumber} • Steward: <strong style={{ color: '#fbbf24' }}>{order.steward}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: elapsed.isUrgent ? '#fca5a5' : elapsed.isWarning ? '#fde047' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'flex-end'
                  }}>
                    <Clock size={16} />
                    <span>{elapsed.text}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {order.timeFormatted}
                  </div>
                </div>
              </div>

              {/* General Cooking Instructions Note */}
              {order.generalNote && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#fbbf24'
                }}>
                  ⚠️ NOTE: {order.generalNote}
                </div>
              )}

              {/* Items List */}
              <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      borderBottom: idx < order.items.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                      paddingBottom: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <span style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#38bdf8',
                        fontWeight: 900,
                        fontSize: '1.05rem',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px'
                      }}>
                        {it.quantity}x
                      </span>

                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                          {it.isVeg ? '🟢 ' : '🔴 '}{it.name}
                        </div>
                        {it.note && (
                          <div style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 600, marginTop: '2px' }}>
                            👉 {it.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '0.75rem 1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                {order.status === 'Preparing' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'Ready')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>🔔 FOOD READY FOR PICKUP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'Served')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
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
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>
              Kitchen Orders All Clear!
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Waiting for Stewards to punch new KOTs from floor mobiles...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
