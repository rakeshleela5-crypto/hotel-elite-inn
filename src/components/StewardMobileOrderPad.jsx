import React, { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, Search, Plus, Minus, Send, CheckCircle2, AlertTriangle, 
  UserCheck, Flame, X, ArrowLeft, RefreshCw, Bell, Hash, Sparkles 
} from 'lucide-react';
import { RESTAURANT_MENU } from '../data/hotelData';
import { playSuccessChime, playOrderAlert } from '../utils/soundAlert';

export const RECOGNIZED_STEWARDS = [
  { id: 'SADANANDA', name: 'Sadananda', code: 'STW-01', phone: '94370 12001' },
  { id: 'KOTI', name: 'Koti', code: 'STW-02', phone: '94370 12002' },
  { id: 'DEEPAK', name: 'Deepak', code: 'STW-03', phone: '94370 12003' },
  { id: 'BIJAY', name: 'Bijay', code: 'STW-04', phone: '94370 12004' },
  { id: 'RAMESH', name: 'Ramesh', code: 'STW-05', phone: '94370 12005' },
  { id: 'SANTOSH', name: 'Santosh', code: 'STW-06', phone: '94370 12006' }
];

export default function StewardMobileOrderPad({ 
  onClose, 
  initialSteward = null,
  initialTable = '1' 
}) {
  // Check URL params for pre-selected staff or table
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const staffParam = urlParams?.get('staff') || urlParams?.get('steward') || initialSteward;
  const tableParam = urlParams?.get('table') || initialTable;

  const [activeSteward, setActiveSteward] = useState(() => {
    if (staffParam) {
      const match = RECOGNIZED_STEWARDS.find(s => s.id.toLowerCase() === staffParam.toLowerCase());
      if (match) return match.id;
    }
    return localStorage.getItem('hotel_elite_inn_active_steward') || 'SADANANDA';
  });

  const [tableNumber, setTableNumber] = useState(tableParam || '1');
  const [orderType, setOrderType] = useState('dining'); // 'dining', 'terrace', 'bar', 'takeaway', 'room'
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [cookingNote, setCookingNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedKot, setLastSubmittedKot] = useState(null);
  const [showStewardSelector, setShowStewardSelector] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showRunningTabModal, setShowRunningTabModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Running Table Folios (Shared with Desktop POS & Kitchen KDS)
  const [runningTableSessions, setRunningTableSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_elite_inn_table_sessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // 86 Out of stock status
  const [outOfStockItems, setOutOfStockItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_elite_inn_pos_86_items');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Listen to 86 changes & BroadcastChannel for running table sessions
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved86 = localStorage.getItem('hotel_elite_inn_pos_86_items');
        if (saved86) setOutOfStockItems(JSON.parse(saved86));
        const savedSessions = localStorage.getItem('hotel_elite_inn_table_sessions');
        if (savedSessions) setRunningTableSessions(JSON.parse(savedSessions));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);

    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('hotel_elite_inn_live_kds');
      channel.onmessage = (event) => {
        const { type, tableSessions, settledTable } = event.data || {};
        if (type === 'TABLE_SESSIONS_UPDATE' && tableSessions) {
          setRunningTableSessions(tableSessions);
        } else if (type === 'TABLE_SETTLED' && settledTable) {
          setRunningTableSessions(prev => {
            const next = { ...prev };
            delete next[settledTable];
            return next;
          });
        } else if (type === 'NEW_KOT_ORDER') {
          try {
            const saved = localStorage.getItem('hotel_elite_inn_table_sessions');
            if (saved) setRunningTableSessions(JSON.parse(saved));
          } catch (e) {}
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectSteward = (stewardId) => {
    setActiveSteward(stewardId);
    try {
      localStorage.setItem('hotel_elite_inn_active_steward', stewardId);
    } catch (e) {}
    setShowStewardSelector(false);
    showToast(`✓ Switched to Steward: ${stewardId}`);
  };

  // Add Item to cart
  const handleAddItem = (dish) => {
    if (outOfStockItems[dish.itemCode]) {
      playOrderAlert();
      showToast(`⚠️ CANNOT ORDER: "${dish.name}" is 86 (SOLD OUT)!`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item => 
          item.dish.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { dish, quantity: 1, note: '' }];
    });

    playSuccessChime();
    showToast(`+ Added ${dish.name}`);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleUpdateQty = (dishId, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Filter menu items
  const filteredDishes = useMemo(() => {
    return RESTAURANT_MENU.filter(dish => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        dish.name.toLowerCase().includes(q) || 
        dish.itemCode.includes(q) ||
        dish.category.toLowerCase().includes(q);

      // Diet
      const matchDiet = 
        dietFilter === 'all' || 
        (dietFilter === 'veg' && dish.isVeg) || 
        (dietFilter === 'nonveg' && !dish.isVeg);

      // Category
      const matchCat = categoryFilter === 'all' || dish.category === categoryFilter;

      return matchSearch && matchDiet && matchCat;
    });
  }, [searchQuery, dietFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(RESTAURANT_MENU.map(m => m.category));
    return ['all', ...Array.from(set)];
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Running KOT Session for selected table
  const currentTableSession = runningTableSessions[tableNumber];
  const isTableOccupied = Boolean(currentTableSession && currentTableSession.status === 'OCCUPIED' && (currentTableSession.kots?.length > 0));
  const nextKotNumber = isTableOccupied ? (currentTableSession.kots?.length || 1) + 1 : 1;

  // Dispatch Live KOT to Kitchen & Reception
  const handleDispatchKot = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const kotId = `KOT-${Date.now().toString().slice(-6)}`;
    const newKotOrder = {
      id: kotId,
      kotNumber: nextKotNumber,
      kotId: kotId,
      tableNumber: tableNumber,
      orderType: orderType,
      steward: activeSteward,
      captain: activeSteward,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Preparing',
      isRunningKot: isTableOccupied,
      runningKotIndex: nextKotNumber,
      items: cart.map(c => ({
        id: c.dish.id,
        itemCode: c.dish.itemCode,
        name: c.dish.name,
        quantity: c.quantity,
        rate: c.dish.price,
        price: c.dish.price,
        isVeg: c.dish.isVeg,
        note: c.note || cookingNote || ''
      })),
      totalAmount: cartTotal,
      generalNote: cookingNote
    };

    try {
      // 1. Update running table sessions (Multi-KOT running folio)
      const existingSessions = JSON.parse(localStorage.getItem('hotel_elite_inn_table_sessions') || '{}');
      const tableSession = existingSessions[tableNumber] || {
        sessionId: `SES-T${tableNumber}-${Date.now().toString().slice(-4)}`,
        tableNumber: tableNumber,
        outlet: orderType === 'terrace' ? 'Terrace Dining' : orderType === 'bar' ? 'Drop In Bar' : 'Cannon Kitchen',
        guestName: `Table ${tableNumber} Guest`,
        cover: 2,
        status: 'OCCUPIED',
        firstKotTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        captain: activeSteward,
        kots: [],
        cumulativeItems: [],
        subtotal: 0,
        gst: 0,
        netTotal: 0
      };

      // Append new KOT
      tableSession.status = 'OCCUPIED';
      tableSession.kots = [...(tableSession.kots || []), newKotOrder];

      // Merge cumulative items
      const cumMap = {};
      (tableSession.cumulativeItems || []).forEach(it => {
        cumMap[it.name] = { ...it, quantity: Number(it.quantity) || 1 };
      });
      newKotOrder.items.forEach(it => {
        if (cumMap[it.name]) {
          cumMap[it.name].quantity += it.quantity;
        } else {
          cumMap[it.name] = { name: it.name, quantity: it.quantity, price: it.rate };
        }
      });
      tableSession.cumulativeItems = Object.values(cumMap);

      // Recompute running financial totals (5% GST for F&B)
      const newGross = tableSession.cumulativeItems.reduce((acc, it) => acc + (it.quantity * (it.price || it.rate || 0)), 0);
      tableSession.subtotal = Math.round((newGross / 1.05) * 100) / 100;
      tableSession.gst = Math.round((newGross - tableSession.subtotal) * 100) / 100;
      tableSession.netTotal = newGross;

      const updatedSessions = {
        ...existingSessions,
        [tableNumber]: tableSession
      };
      localStorage.setItem('hotel_elite_inn_table_sessions', JSON.stringify(updatedSessions));
      setRunningTableSessions(updatedSessions);

      // 2. Save to live KOTs list
      const existingKots = JSON.parse(localStorage.getItem('hotel_elite_inn_live_kots') || '[]');
      const updatedKots = [newKotOrder, ...existingKots].slice(0, 100);
      localStorage.setItem('hotel_elite_inn_live_kots', JSON.stringify(updatedKots));

      // 3. Broadcast via BroadcastChannel (zero-latency instant sync to KDS & Reception)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('hotel_elite_inn_live_kds');
        channel.postMessage({
          type: 'NEW_KOT_ORDER',
          order: newKotOrder,
          tableSessions: updatedSessions
        });
        channel.close();
      }

      // 4. Dispatch to Cloudflare D1 Sync
      const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
        body: JSON.stringify({
          action: 'create_live_kot',
          payload: newKotOrder
        })
      }).catch(err => console.warn('Offline KOT sync fallback:', err));

      // 5. Success UI
      playSuccessChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 100, 200]);
      }
      setLastSubmittedKot(newKotOrder);
      setCart([]);
      setCookingNote('');
      showToast(isTableOccupied 
        ? `🔥 Running KOT #${nextKotNumber} sent to Kitchen for Table ${tableNumber}! Running: ₹${newGross}` 
        : `🚀 KOT #1 sent to Kitchen for Table ${tableNumber}!`
      );
    } catch (err) {
      console.error('Error dispatching KOT:', err);
      showToast('⚠️ Could not dispatch order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#090d16',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999999,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      userSelect: 'none'
    }}>
      {/* Top Mobile Header */}
      <header style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--gold-glow, #fbbf24)', fontWeight: 700, letterSpacing: '0.04em' }}>
              CANNON KITCHEN • STEWARD PAD
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              Hotel Elite Inn
            </div>
          </div>
        </div>

        {/* Active Steward Chip */}
        <button
          type="button"
          onClick={() => setShowStewardSelector(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <UserCheck size={14} />
          <span>{activeSteward}</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>▼</span>
        </button>
      </header>

      {/* Table & Section Quick-Bar */}
      <div style={{
        background: '#070b14',
        padding: '0.5rem 0.85rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <button
          type="button"
          onClick={() => setShowTableSelector(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#1e293b',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <span>🪑 Table: {tableNumber}</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({orderType})</span>
          <span style={{ fontSize: '0.7rem' }}>▼</span>
        </button>

        {/* 2-Diet Filter Toggle (Requirement: Street food waiter 2-item toggle) */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: dietFilter === 'veg' ? '#10b981' : 'rgba(255,255,255,0.06)',
              color: dietFilter === 'veg' ? '#fff' : '#94a3b8',
              border: dietFilter === 'veg' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            🟢 Veg
          </button>
          <button
            type="button"
            onClick={() => setDietFilter(dietFilter === 'nonveg' ? 'all' : 'nonveg')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: dietFilter === 'nonveg' ? '#ef4444' : 'rgba(255,255,255,0.06)',
              color: dietFilter === 'nonveg' ? '#fff' : '#94a3b8',
              border: dietFilter === 'nonveg' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            🔴 Non-Veg
          </button>
        </div>
      </div>

      {/* Running KOT Active Banner */}
      {isTableOccupied && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(217, 119, 6, 0.24))',
          borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
          padding: '0.45rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔥 RUNNING KOT ACTIVE</span>
              <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '10px', fontWeight: 900 }}>
                Next: KOT #{nextKotNumber}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '2px' }}>
              {currentTableSession.kots?.length} prior ticket(s) • Running Total: <strong style={{ color: '#38bdf8' }}>₹{currentTableSession.netTotal || currentTableSession.subtotal}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRunningTabModal(true)}
            style={{
              background: '#f59e0b',
              border: 'none',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.72rem',
              padding: '5px 9px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}
          >
            <span>📋 View Tab</span>
            <span style={{ background: '#000', color: '#fbbf24', padding: '1px 5px', borderRadius: '8px', fontSize: '0.62rem' }}>
              {currentTableSession.cumulativeItems?.length || 0}
            </span>
          </button>
        </div>
      )}

      {/* Fast Dish Search Bar */}
      <div style={{ padding: '0.5rem 0.85rem 0.35rem', background: '#090d16' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#131b2e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '0.35rem 0.65rem'
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Type item code (e.g. 102) or dish name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        overflowX: 'auto',
        padding: '0.3rem 0.85rem 0.5rem',
        scrollbarWidth: 'none'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '3px 9px',
              borderRadius: '16px',
              fontSize: '0.7rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: categoryFilter === cat ? '#38bdf8' : 'rgba(255,255,255,0.05)',
              color: categoryFilter === cat ? '#000' : '#cbd5e1',
              border: categoryFilter === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {cat === 'all' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      {/* Dishes Scrollable List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.35rem 0.85rem 5.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        {filteredDishes.map(dish => {
          const inCartItem = cart.find(c => c.dish.id === dish.id);
          const is86 = !!outOfStockItems[dish.itemCode];

          return (
            <div
              key={dish.id}
              onClick={() => !is86 && handleAddItem(dish)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                background: inCartItem 
                  ? 'rgba(56, 189, 248, 0.12)' 
                  : is86 
                  ? 'rgba(239, 68, 68, 0.08)' 
                  : 'rgba(255,255,255,0.03)',
                border: inCartItem 
                  ? '1px solid #38bdf8' 
                  : is86 
                  ? '1px dashed rgba(239, 68, 68, 0.4)' 
                  : '1px solid rgba(255,255,255,0.07)',
                opacity: is86 ? 0.55 : 1,
                cursor: is86 ? 'not-allowed' : 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.15)',
                  padding: '2px 5px',
                  borderRadius: '4px'
                }}>
                  #{dish.itemCode}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem' }}>
                      {dish.isVeg ? '🟢' : '🔴'}
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: is86 ? '#94a3b8' : '#fff' }}>
                      {dish.name}
                    </strong>
                    {is86 && (
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>
                        86 SOLD OUT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    ₹{dish.price} • {dish.category}
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div>
                {!is86 ? (
                  inCartItem ? (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', borderRadius: '6px', padding: '2px 4px' }}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(dish.id, -1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', padding: '2px 4px', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>
                        {inCartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(dish.id, 1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', padding: '2px 4px', cursor: 'pointer' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddItem(dish);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + ADD
                    </button>
                  )
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>Unavailable</span>
                )}
              </div>
            </div>
          );
        })}

        {filteredDishes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <Utensils size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <div>No matching dishes found.</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Try searching by item code (e.g. 102) or clear filters.</div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart & Punch Bar */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#0b1324',
          borderTop: '1px solid rgba(56, 189, 248, 0.4)',
          padding: '0.75rem 1rem',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.8)',
          zIndex: 1000000
        }}>
          {/* Quick Cooking Instructions Input */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Cooking note (e.g. Less spicy, extra gravy)..."
              value={cookingNote}
              onChange={(e) => setCookingNote(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: '#040711',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
            {['Less Spicy', 'Extra Spicy', 'No Onion'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setCookingNote(prev => prev ? `${prev}, ${preset}` : preset)}
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                +{preset}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Table <strong>{tableNumber}</strong> • {cartItemCount} item{cartItemCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8' }}>
                ₹{cartTotal}
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDispatchKot}
              style={{
                flex: 1,
                background: isTableOccupied
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: isTableOccupied ? '#000' : '#fff',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: isTableOccupied ? '0 4px 15px rgba(245, 158, 11, 0.4)' : '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Send size={16} />
              <span>
                {isSubmitting
                  ? 'Dispatching...'
                  : isTableOccupied
                  ? `➕ SEND RUNNING KOT #${nextKotNumber}`
                  : '🚀 SEND KOT #1 TO KITCHEN'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Steward Selector Modal */}
      {showStewardSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: 360,
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                👨‍🍳 Select Active Steward
              </div>
              <button
                type="button"
                onClick={() => setShowStewardSelector(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {RECOGNIZED_STEWARDS.map(stw => (
                <button
                  key={stw.id}
                  type="button"
                  onClick={() => handleSelectSteward(stw.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: activeSteward === stw.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: activeSteward === stw.id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
                    color: activeSteward === stw.id ? '#fbbf24' : '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>👨‍🍳</span>
                    <div>
                      <div style={{ fontSize: '0.9rem' }}>{stw.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Badge: {stw.code}</div>
                    </div>
                  </div>
                  {activeSteward === stw.id && <CheckCircle2 size={18} color="#fbbf24" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      {showTableSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: 400,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                🪑 Select Dining Table / Section
              </div>
              <button
                type="button"
                onClick={() => setShowTableSelector(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Ground Floor Tables */}
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem' }}>
                GROUND FLOOR DINING (TABLES 1 - 18)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                {Array.from({ length: 18 }, (_, i) => String(i + 1)).map(num => {
                  const sess = runningTableSessions[num];
                  const hasActive = Boolean(sess && sess.status === 'OCCUPIED' && (sess.kots?.length > 0));
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setTableNumber(num);
                        setOrderType('dining');
                        setShowTableSelector(false);
                        showToast(`Selected Table ${num}${hasActive ? ` (Running Tab ₹${sess.netTotal || sess.subtotal})` : ''}`);
                      }}
                      style={{
                        padding: '0.55rem 0.35rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        background: tableNumber === num 
                          ? '#38bdf8' 
                          : hasActive 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(255,255,255,0.06)',
                        color: tableNumber === num ? '#000' : hasActive ? '#fbbf24' : '#fff',
                        border: tableNumber === num 
                          ? '1.5px solid #38bdf8' 
                          : hasActive 
                          ? '1.5px solid #f59e0b' 
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>T-{num}</span>
                      {hasActive && (
                        <span style={{ fontSize: '0.6rem', color: tableNumber === num ? '#000' : '#fde047', fontWeight: 700 }}>
                          ₹{sess.netTotal || sess.subtotal}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Terrace Dining */}
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem' }}>
                TERRACE DINING (1A - 13A)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                {Array.from({ length: 13 }, (_, i) => `${i + 1}A`).map(num => {
                  const sess = runningTableSessions[num];
                  const hasActive = Boolean(sess && sess.status === 'OCCUPIED' && (sess.kots?.length > 0));
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setTableNumber(num);
                        setOrderType('terrace');
                        setShowTableSelector(false);
                        showToast(`Selected Terrace Table ${num}`);
                      }}
                      style={{
                        padding: '0.55rem 0.35rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        background: tableNumber === num 
                          ? '#10b981' 
                          : hasActive 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(255,255,255,0.06)',
                        color: tableNumber === num ? '#000' : hasActive ? '#fbbf24' : '#fff',
                        border: tableNumber === num 
                          ? '1.5px solid #10b981' 
                          : hasActive 
                          ? '1.5px solid #f59e0b' 
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{num}</span>
                      {hasActive && (
                        <span style={{ fontSize: '0.6rem', color: tableNumber === num ? '#000' : '#fde047', fontWeight: 700 }}>
                          ₹{sess.netTotal || sess.subtotal}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bar Lounge & Specials */}
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem' }}>
                DROP IN BAR &amp; STREET PARCEL
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                {['1B', '2B', '3B', 'PARCEL', 'ROOM-SVC'].map(item => {
                  const sess = runningTableSessions[item];
                  const hasActive = Boolean(sess && sess.status === 'OCCUPIED' && (sess.kots?.length > 0));
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setTableNumber(item);
                        setOrderType(item === 'PARCEL' ? 'takeaway' : item === 'ROOM-SVC' ? 'room' : 'bar');
                        setShowTableSelector(false);
                        showToast(`Selected ${item}`);
                      }}
                      style={{
                        padding: '0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: tableNumber === item 
                          ? '#a855f7' 
                          : hasActive 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(255,255,255,0.06)',
                        color: tableNumber === item ? '#000' : hasActive ? '#fbbf24' : '#fff',
                        border: tableNumber === item 
                          ? '1.5px solid #a855f7' 
                          : hasActive 
                          ? '1.5px solid #f59e0b' 
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer'
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Running Tab Modal (Guest asks: "Humara bill kitna hua?") */}
      {showRunningTabModal && currentTableSession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000000,
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: 420,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🪑 Table {tableNumber} Running Tab</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Started: {currentTableSession.firstKotTime || 'Earlier'} • Captain: {currentTableSession.captain || activeSteward}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRunningTabModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Previous KOT Tickets Accordion */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '2px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                KOT TICKETS DISPATCHED ({currentTableSession.kots?.length || 0})
              </div>

              {(currentTableSession.kots || []).map((k, idx) => (
                <div key={k.id || idx} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '0.65rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24' }}>
                      KOT #{k.kotNumber || idx + 1} ({k.timeFormatted || k.time || 'Logged'})
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      By {k.steward || k.captain}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {(k.items || []).map((item, itemIdx) => (
                      <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span style={{ color: '#fff', fontWeight: 700 }}>₹{(Number(item.quantity) * Number(item.rate || item.price || 0)).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Cumulative Items Summary */}
              <div style={{
                marginTop: '0.5rem',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, marginBottom: '0.4rem' }}>
                  CUMULATIVE CONSUMPTION TOTALS
                </div>
                {(currentTableSession.cumulativeItems || []).map((ci, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '2px' }}>
                    <span>{ci.quantity}x {ci.name}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>₹{(Number(ci.quantity) * Number(ci.price || ci.rate || 0)).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '0.75rem',
              marginTop: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' }}>
                <span>Subtotal (Food):</span>
                <span>₹{currentTableSession.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                <span>GST (5% F&B):</span>
                <span>₹{currentTableSession.gst?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>
                <span>Running Net Bill:</span>
                <span style={{ color: '#10b981' }}>₹{currentTableSession.netTotal?.toFixed(0) || '0'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRunningTabModal(false)}
              style={{
                marginTop: '0.85rem',
                width: '100%',
                padding: '0.65rem',
                background: '#334155',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close Running Tab
            </button>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38bdf8',
          color: '#fff',
          padding: '0.55rem 1.1rem',
          borderRadius: '30px',
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 8px 25px rgba(0,0,0,0.8)',
          zIndex: 3000000,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
