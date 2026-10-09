import React, { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, Search, Plus, Minus, Send, CheckCircle2, AlertTriangle, 
  UserCheck, Flame, X, ArrowLeft, RefreshCw, Bell, Hash, Sparkles, LogOut,
  Printer, QrCode, Timer, ShieldAlert, AlertOctagon, Check, Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import { RESTAURANT_MENU } from '../data/hotelData';
import { playSuccessChime, playOrderAlert } from '../utils/soundAlert';
import StaffShiftLoginModal from './StaffShiftLoginModal';
import { getStaffSession, endStaffShiftSession } from '../utils/staffAuthSession';
import DexieSyncIndicator from './DexieSyncIndicator';
import { saveKotToDexie, saveTableSessionToDexie, settleTableSessionInDexie } from '../db/dexieDb';

export const RECOGNIZED_STEWARDS = [
  { id: 'SADANANDA', name: 'Sadananda', code: 'STW-01', phone: '94370 12001' },
  { id: 'KOTI', name: 'Koti', code: 'STW-02', phone: '94370 12002' },
  { id: 'DEEPAK', name: 'Deepak', code: 'STW-03', phone: '94370 12003' },
  { id: 'BIJAY', name: 'Bijay', code: 'STW-04', phone: '94370 12004' },
  { id: 'RAMESH', name: 'Ramesh', code: 'STW-05', phone: '94370 12005' },
  { id: 'SANTOSH', name: 'Santosh', code: 'STW-06', phone: '94370 12006' }
];

export const IN_HOUSE_ROOM_GUESTS = {
  '101': 'Mr. Amitav Roy',
  '102': 'Mrs. Sunita Verma',
  '201': 'Mr. Ramesh Patel',
  '202': 'Ms. Swati Sen',
  '204': 'Mr. Rajesh Sharma',
  '301': 'Dr. K. S. Rao',
  '305': 'Mr. Ananya Das'
};

export default function StewardMobileOrderPad({ 
  onClose, 
  initialSteward = null,
  initialTable = '1' 
}) {
  const [shiftSession, setShiftSession] = useState(() => getStaffSession('steward'));

  // Check URL params for pre-selected staff or table
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const staffParam = urlParams?.get('staff') || urlParams?.get('steward') || initialSteward;
  const tableParam = urlParams?.get('table') || initialTable;

  const [activeSteward, setActiveSteward] = useState(() => {
    if (shiftSession?.staffName) return shiftSession.staffName;
    if (staffParam) {
      const match = RECOGNIZED_STEWARDS.find(s => s.id.toLowerCase() === staffParam.toLowerCase());
      if (match) return match.name;
    }
    return localStorage.getItem('hotel_elite_inn_active_steward') || 'Sadananda';
  });

  const [tableNumber, setTableNumber] = useState(tableParam || '1');
  const [orderType, setOrderType] = useState('dining'); // 'dining', 'terrace', 'bar', 'takeaway', 'room'
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [cookingNote, setCookingNote] = useState('');
  const [dietaryTag, setDietaryTag] = useState(''); // 'jain', 'satvik', 'spicy', 'kids', 'rush'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedKot, setLastSubmittedKot] = useState(null);
  const [showStewardSelector, setShowStewardSelector] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showRunningTabModal, setShowRunningTabModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Table Bill & Dynamic UPI QR Modal
  const [showTableBillModal, setShowTableBillModal] = useState(false);
  const [billModalTab, setBillModalTab] = useState('thermal'); // 'thermal' | 'upi'
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');

  // Food Ready Alert Banner
  const [readyPickupNotice, setReadyPickupNotice] = useState(null);

  // Void / Cancel Item Modal
  const [voidItemModal, setVoidItemModal] = useState(null);
  const [voidReason, setVoidReason] = useState('Guest Delayed (Taking Too Long)');

  // Room Service Folio Check
  const [postToRoomFolio, setPostToRoomFolio] = useState(true);

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

  // Listen to 86 changes & BroadcastChannel for running table sessions & food ready alerts
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
        const { type, tableSessions, settledTable, items, tableNumber: tNum, message, status } = event.data || {};
        if (type === 'TABLE_SESSIONS_UPDATE' && tableSessions) {
          setRunningTableSessions(tableSessions);
        } else if (type === 'TABLE_SETTLED' && settledTable) {
          setRunningTableSessions(prev => {
            const next = { ...prev };
            delete next[settledTable];
            return next;
          });
        } else if (type === '86_ITEMS_UPDATED' && items) {
          setOutOfStockItems(items);
        } else if (type === 'KOT_STATUS_UPDATED' && status === 'Ready') {
          // Food is ready at the pass!
          setReadyPickupNotice({
            tableNumber: tNum || 'Active Table',
            message: message || `🔔 KITCHEN ALERT: Food is READY at Kitchen Pass for Table ${tNum || ''}! Pick up now.`
          });
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
          playSuccessChime();
        } else if (type === 'PICKUP_URGENT_PING') {
          setReadyPickupNotice({
            tableNumber: tNum,
            message: message || `🚨 URGENT: Table ${tNum} food is getting cold at the kitchen pass! Please pick up immediately.`
          });
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([300, 150, 300, 150, 300]);
          }
          playOrderAlert();
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
    const stockState = outOfStockItems[dish.itemCode];
    const isSoldOut = stockState?.soldOut ?? Boolean(stockState);

    if (isSoldOut) {
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
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        dish.name.toLowerCase().includes(q) || 
        dish.itemCode.includes(q) ||
        dish.category.toLowerCase().includes(q);

      const matchDiet = 
        dietFilter === 'all' || 
        (dietFilter === 'veg' && dish.isVeg) || 
        (dietFilter === 'nonveg' && !dish.isVeg);

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

  // Open Table Bill & Dynamic UPI QR Modal
  const handleOpenTableBillModal = async () => {
    const net = currentTableSession?.netTotal || currentTableSession?.subtotal || cartTotal || 0;
    const upiUrl = `upi://pay?pa=hoteleliteinn@icici&pn=Hotel%20Elite%20Inn&am=${Math.round(net)}&cu=INR&tn=Table%20${tableNumber}%20Food%20Bill`;
    try {
      const url = await QRCode.toDataURL(upiUrl, {
        width: 250,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setUpiQrDataUrl(url);
    } catch (e) {
      console.error('Error generating UPI QR:', e);
    }
    setShowTableBillModal(true);
  };

  // Void / Cancel an item from a running table
  const handleConfirmVoidItem = () => {
    if (!voidItemModal || !currentTableSession) return;
    const { item } = voidItemModal;

    // Reduce or remove item from cumulative items
    const updatedCumulative = (currentTableSession.cumulativeItems || []).map(ci => {
      if (ci.name === item.name) {
        const remaining = ci.quantity - 1;
        return remaining > 0 ? { ...ci, quantity: remaining } : null;
      }
      return ci;
    }).filter(Boolean);

    // Recalculate financial totals
    const newGross = updatedCumulative.reduce((acc, it) => acc + (it.quantity * (it.price || it.rate || 0)), 0);
    const newSubtotal = Math.round((newGross / 1.05) * 100) / 100;
    const newGst = Math.round((newGross - newSubtotal) * 100) / 100;

    const updatedSession = {
      ...currentTableSession,
      cumulativeItems: updatedCumulative,
      subtotal: newSubtotal,
      gst: newGst,
      netTotal: newGross
    };

    const updatedSessions = {
      ...runningTableSessions,
      [tableNumber]: updatedSession
    };

    setRunningTableSessions(updatedSessions);
    saveTableSessionToDexie(tableNumber, updatedSession).catch(() => {});
    try {
      localStorage.setItem('hotel_elite_inn_table_sessions', JSON.stringify(updatedSessions));
    } catch (e) {}

    // Broadcast VOID to Kitchen KDS (Kitchen sirens sound so chef stops cooking!)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('hotel_elite_inn_live_kds');
      channel.postMessage({
        type: 'KOT_ITEM_VOIDED',
        voidData: {
          tableNumber,
          itemName: item.name,
          reason: voidReason,
          steward: activeSteward,
          timestamp: new Date().toISOString()
        },
        tableSessions: updatedSessions
      });
      channel.close();
    }

    setVoidItemModal(null);
    playOrderAlert();
    showToast(`🛑 Cancelled 1x ${item.name} & alerted Kitchen KDS!`);
  };

  // Dispatch Live KOT to Kitchen & Reception
  const handleDispatchKot = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const kotId = `KOT-${Date.now().toString().slice(-6)}`;
    const fullNote = [
      dietaryTag ? `[${dietaryTag.toUpperCase()}]` : '',
      cookingNote
    ].filter(Boolean).join(' ');

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
      dietaryTag: dietaryTag || 'regular',
      items: cart.map(c => ({
        id: c.dish.id,
        itemCode: c.dish.itemCode,
        name: c.dish.name,
        quantity: c.quantity,
        rate: c.dish.price,
        price: c.dish.price,
        isVeg: c.dish.isVeg,
        note: c.note || fullNote || ''
      })),
      totalAmount: cartTotal,
      generalNote: fullNote
    };

    try {
      // 1. Update running table sessions (Multi-KOT running folio)
      const existingSessions = JSON.parse(localStorage.getItem('hotel_elite_inn_table_sessions') || '{}');
      const tableSession = existingSessions[tableNumber] || {
        sessionId: `SES-T${tableNumber}-${Date.now().toString().slice(-4)}`,
        tableNumber: tableNumber,
        outlet: orderType === 'terrace' ? 'Terrace Dining' : orderType === 'bar' ? 'Drop In Bar' : orderType === 'room' ? 'Room Service' : 'Cannon Kitchen',
        guestName: orderType === 'room' ? (IN_HOUSE_ROOM_GUESTS[tableNumber] || `Room ${tableNumber} Guest`) : `Table ${tableNumber} Guest`,
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

      // 2. Dual Save to live KOTs list & Live Food Orders register
      const existingKots = JSON.parse(localStorage.getItem('hotel_elite_inn_live_kots') || '[]');
      const updatedKots = [newKotOrder, ...existingKots].slice(0, 100);
      localStorage.setItem('hotel_elite_inn_live_kots', JSON.stringify(updatedKots));

      const existingFoodOrders = JSON.parse(localStorage.getItem('hotel_elite_inn_food_orders') || '[]');
      const updatedFoodOrders = [newKotOrder, ...existingFoodOrders].slice(0, 100);
      localStorage.setItem('hotel_elite_inn_food_orders', JSON.stringify(updatedFoodOrders));

      // 3. Dual Broadcast via BroadcastChannel (Kitchen KDS + Cannon Live Food Orders tab)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        // Channel A: Live KDS Bus (KitchenDisplayKDS & FenugreekLiveFoodOrdersKDS)
        const channelKds = new BroadcastChannel('hotel_elite_inn_live_kds');
        channelKds.postMessage({
          type: 'NEW_KOT_ORDER',
          order: newKotOrder,
          target: 'DUAL_KOT',
          tableSessions: updatedSessions
        });
        channelKds.close();

        // Channel B: Reception Admin Live Orders Bus
        const channelKot = new BroadcastChannel('hotel_elite_inn_kot');
        channelKot.postMessage({
          type: 'NEW_KOT_ORDER',
          order: newKotOrder,
          tableSessions: updatedSessions
        });
        channelKot.close();
      }

      // 4. Dexie.js Persistent IndexedDB & Cloudflare D1 Outbox Background Sync
      saveKotToDexie(newKotOrder).catch(err => console.warn('Dexie KOT save notice:', err));
      saveTableSessionToDexie(tableNumber, tableSession).catch(err => console.warn('Dexie session save notice:', err));

      playSuccessChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 100, 200]);
      }
      setLastSubmittedKot(newKotOrder);
      setCart([]);
      setCookingNote('');
      setDietaryTag('');
      showToast(isTableOccupied 
        ? `⚡ Dual Repeat KOT #${nextKotNumber} sent to Kitchen KDS + Cannon Live Production! Running: ₹${newGross}` 
        : `⚡ Dual KOT #1 sent to Kitchen KDS + Cannon Live Production!`
      );
    } catch (err) {
      console.error('Error dispatching KOT:', err);
      showToast('⚠️ Could not dispatch order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (window.confirm(`Clock out from ${shiftSession?.shift || 'current'} shift and end session?`)) {
      await endStaffShiftSession('steward', shiftSession);
      setShiftSession(null);
    }
  };

  if (!shiftSession) {
    return (
      <StaffShiftLoginModal
        portal="steward"
        onLoginSuccess={(sess) => {
          setShiftSession(sess);
          setActiveSteward(sess.staffName);
        }}
        onCancel={onClose}
      />
    );
  }

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
      <header className="no-print" style={{
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
            <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.04em' }}>
              CANNON KITCHEN • STEWARD PAD
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              Hotel Elite Inn
            </div>
          </div>
        </div>

        {/* Active Steward Chip & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <DexieSyncIndicator compact={true} />

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
            <span>{shiftSession?.shift ? `${shiftSession.shift}: ` : ''}{activeSteward}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>▼</span>
          </button>

          <button
            type="button"
            title="Clock out and end shift"
            onClick={handleClockOut}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '5px 7px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Floating Kitchen Food Ready Notification Banner */}
      {readyPickupNotice && (
        <div className="no-print" style={{
          background: 'linear-gradient(90deg, #065f46 0%, #059669 100%)',
          color: '#fff',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.6)',
          animation: 'pulse 1.2s infinite',
          zIndex: 999999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#fde047" />
            <div style={{ fontSize: '0.82rem', fontWeight: 900 }}>
              {readyPickupNotice.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReadyPickupNotice(null)}
            style={{
              background: '#000',
              border: '1px solid #6ee7b7',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ✓ PICKED UP
          </button>
        </div>
      )}

      {/* Table & Outlet Selector Strip */}
      <div className="no-print" style={{
        background: '#090d16',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0.45rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowTableSelector(true)}
            style={{
              background: isTableOccupied ? '#f59e0b' : '#38bdf8',
              color: '#000',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            <Hash size={14} />
            <span>{orderType === 'room' ? `Room ${tableNumber}` : `Table ${tableNumber}`}</span>
            <span style={{ fontSize: '0.65rem' }}>▼</span>
          </button>

          {/* Quick Order Type Badge */}
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#cbd5e1',
            background: 'rgba(255,255,255,0.06)',
            padding: '3px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase'
          }}>
            {orderType}
          </span>
        </div>

        {/* Quick Diet Filters */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
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

      {/* Running KOT Active Banner with Direct Bill Button */}
      {isTableOccupied && (
        <div className="no-print" style={{
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
              <span>🔥 RUNNING TAB ACTIVE</span>
              <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '10px', fontWeight: 900 }}>
                Next: KOT #{nextKotNumber}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '2px' }}>
              {currentTableSession.kots?.length} prior ticket(s) • Running: <strong style={{ color: '#38bdf8' }}>₹{currentTableSession.netTotal || currentTableSession.subtotal}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {/* Table Bill & UPI QR Button */}
            <button
              type="button"
              onClick={handleOpenTableBillModal}
              style={{
                background: '#10b981',
                border: 'none',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.72rem',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Printer size={12} />
              <span>Bill / UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRunningTabModal(true)}
              style={{
                background: '#f59e0b',
                border: 'none',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.72rem',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>📋 Tab</span>
              <span style={{ background: '#000', color: '#fbbf24', padding: '1px 5px', borderRadius: '8px', fontSize: '0.62rem' }}>
                {currentTableSession.cumulativeItems?.length || 0}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Room Service Guest Banner */}
      {orderType === 'room' && (
        <div className="no-print" style={{
          background: 'rgba(56, 189, 248, 0.1)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '0.4rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem'
        }}>
          <div>
            🏨 Guest: <strong>{IN_HOUSE_ROOM_GUESTS[tableNumber] || 'In-House Guest'}</strong>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#38bdf8', fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={postToRoomFolio}
              onChange={(e) => setPostToRoomFolio(e.target.checked)}
            />
            <span>Post to Room Folio</span>
          </label>
        </div>
      )}

      {/* Fast Dish Search Bar */}
      <div className="no-print" style={{ padding: '0.45rem 0.85rem 0.3rem', background: '#090d16' }}>
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
            placeholder="Search dish name or item code (e.g. 102)..."
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
      <div className="no-print" style={{
        display: 'flex',
        gap: '0.35rem',
        overflowX: 'auto',
        padding: '0.25rem 0.85rem 0.45rem',
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
      <div className="no-print" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.35rem 0.85rem 6.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        {filteredDishes.map(dish => {
          const stockState = outOfStockItems[dish.itemCode];
          const isSoldOut = stockState?.soldOut ?? Boolean(stockState);
          const portionsLeft = stockState?.portionsLeft;
          const inCartItem = cart.find(c => c.dish.id === dish.id);

          return (
            <div
              key={dish.id}
              style={{
                background: isSoldOut ? 'rgba(239, 68, 68, 0.05)' : '#0f172a',
                border: inCartItem 
                  ? '1.5px solid #38bdf8' 
                  : isSoldOut 
                  ? '1px dashed #ef4444' 
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                opacity: isSoldOut ? 0.6 : 1
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem' }}>{dish.isVeg ? '🟢' : '🔴'}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{dish.name}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Code: <strong style={{ color: '#cbd5e1' }}>{dish.itemCode}</strong></span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>₹{dish.price}</span>

                  {/* 86 Live Portion Badge */}
                  {portionsLeft !== undefined && portionsLeft > 0 && !isSoldOut && (
                    <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.62rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                      {portionsLeft} left
                    </span>
                  )}
                  {isSoldOut && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                      86 SOLD OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Add / Quantity Stepper Button */}
              <div>
                {!isSoldOut ? (
                  inCartItem ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #38bdf8',
                      overflow: 'hidden'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(dish.id, -1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex'
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{
                        color: '#38bdf8',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        padding: '0 4px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {inCartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(dish.id, 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddItem(dish)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      + ADD
                    </button>
                  )
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>86 OUT</span>
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
        <div className="no-print" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#0b1324',
          borderTop: '1px solid rgba(56, 189, 248, 0.4)',
          padding: '0.65rem 0.85rem',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.8)',
          zIndex: 1000000
        }}>
          {/* Quick Dietary & Urgency Chips */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginBottom: '0.4rem', scrollbarWidth: 'none' }}>
            {[
              { id: 'jain', label: '🌱 Jain (No Onion/Garlic)' },
              { id: 'satvik', label: '🕉️ Satvik' },
              { id: 'spicy', label: '🌶️ Extra Spicy' },
              { id: 'kids', label: '👶 Mild / Kids' },
              { id: 'rush', label: '⚡ RUSH / Urgent' }
            ].map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setDietaryTag(prev => prev === tag.id ? '' : tag.id)}
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: dietaryTag === tag.id ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                  color: dietaryTag === tag.id ? '#000' : '#cbd5e1',
                  border: dietaryTag === tag.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
                  fontWeight: 800
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Quick Cooking Instructions Input */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.45rem' }}>
            <input
              type="text"
              placeholder="Cooking note (e.g. Less oil, serve hot)..."
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {orderType === 'room' ? `Room ${tableNumber}` : `Table ${tableNumber}`} • {cartItemCount} item{cartItemCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>
                ₹{cartTotal}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDispatchKot}
                style={{
                  width: '100%',
                  background: isTableOccupied
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  boxShadow: isTableOccupied 
                    ? '0 4px 18px rgba(245, 158, 11, 0.45)' 
                    : '0 4px 18px rgba(16, 185, 129, 0.45)',
                  letterSpacing: '0.3px',
                  transition: 'all 0.15s ease'
                }}
                title="Simultaneously dispatch KOT 1 to Kitchen KDS and KOT 2 to Cannon Kitchen Live Food Orders"
              >
                <Zap size={18} fill="#fff" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900 }}>
                    {isSubmitting 
                      ? 'Dispatching Dual Streams...'
                      : isTableOccupied
                      ? `⚡ SEND DUAL REPEAT KOT #${nextKotNumber}`
                      : '⚡ SEND DUAL KOT 1 & KOT 2 INSTANTLY'}
                  </span>
                  <span style={{ fontSize: '0.67rem', opacity: 0.92, fontWeight: 600 }}>
                    Kitchen KDS Hot-Line + Cannon Live Production KDS
                  </span>
                </div>
              </button>

              {/* Status Verification Sub-Chips */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.2rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: 700 }}>
                  <Check size={11} /> KOT 1: Kitchen KDS
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#38bdf8', fontWeight: 700 }}>
                  <Check size={11} /> KOT 2: Cannon Live KDS
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>🔊 Chime Sync</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: TABLE-SIDE THERMAL BILL SLIP & DYNAMIC UPI QR
          ========================================================================= */}
      {showTableBillModal && currentTableSession && (
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
            maxWidth: '390px',
            maxHeight: '92vh',
            borderRadius: '10px',
            overflowY: 'auto',
            padding: '1.25rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            fontFamily: 'monospace, "Courier New", Courier'
          }}>
            {/* Tab Switcher in no-print */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '0.85rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setBillModalTab('thermal')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: billModalTab === 'thermal' ? '#000' : 'transparent',
                  color: billModalTab === 'thermal' ? '#fff' : '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                🖨️ Thermal Bill Slip
              </button>
              <button
                type="button"
                onClick={() => setBillModalTab('upi')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: billModalTab === 'upi' ? '#000' : 'transparent',
                  color: billModalTab === 'upi' ? '#fff' : '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                📲 Table UPI QR
              </button>
            </div>

            {billModalTab === 'thermal' ? (
              <div className="printable-receipt printable-pos-slip thermal-receipt-sheet">
                {/* Bill Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>HOTEL ELITE INN</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>CANNON RESTAURANT &amp; BAR</div>
                  <div style={{ fontSize: '0.72rem' }}>GSTIN: 21AABCH1234F1Z5 • FSSAI: 12022001000145</div>
                  <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>PROVISIONAL TABLE FOLIO</div>
                </div>

                {/* Table Info */}
                <div style={{ fontSize: '0.8rem', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.95rem' }}>
                    <span>{orderType === 'room' ? `ROOM: ${tableNumber}` : `TABLE: ${tableNumber}`}</span>
                    <span>FOLIO #{currentTableSession.sessionId?.slice(-6) || '8820'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CAPTAIN: {currentTableSession.captain || activeSteward}</span>
                    <span>COVERS: {currentTableSession.cover || 2}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>DATE: {new Date().toLocaleDateString('en-IN')}</span>
                    <span>TIME: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Cumulative Dishes Table */}
                <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.75rem', borderBottom: '1px dashed #666', paddingBottom: '3px', marginBottom: '4px' }}>
                    <span style={{ width: '32px' }}>QTY</span>
                    <span style={{ flex: 1 }}>ITEM</span>
                    <span style={{ width: '45px', textAlign: 'right' }}>RATE</span>
                    <span style={{ width: '55px', textAlign: 'right' }}>AMT</span>
                  </div>

                  {(currentTableSession.cumulativeItems || []).map((ci, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span style={{ width: '32px', fontWeight: 800 }}>{ci.quantity}</span>
                      <span style={{ flex: 1, fontWeight: 700 }}>{ci.name}</span>
                      <span style={{ width: '45px', textAlign: 'right' }}>₹{ci.price || ci.rate}</span>
                      <span style={{ width: '55px', textAlign: 'right', fontWeight: 800 }}>₹{(Number(ci.quantity) * Number(ci.price || ci.rate || 0)).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Taxes & Totals */}
                <div style={{ borderBottom: '2px dashed #000', paddingBottom: '6px', marginBottom: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal (Food):</span>
                    <span>₹{currentTableSession.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST @ 2.5%:</span>
                    <span>₹{(Number(currentTableSession.gst || 0) / 2).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SGST @ 2.5%:</span>
                    <span>₹{(Number(currentTableSession.gst || 0) / 2).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', marginTop: '4px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                    <span>NET PAYABLE:</span>
                    <span>₹{currentTableSession.netTotal?.toFixed(0) || '0'}</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444' }}>
                  Thank you for dining at Hotel Elite Inn!<br />
                  For tax invoice &amp; settlement, request front desk.
                </div>
              </div>
            ) : (
              /* Tab 2: Dynamic UPI QR Code for Table-Side Scan */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '4px' }}>
                  SCAN TO PAY TABLE {tableNumber} BILL
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.75rem' }}>
                  ₹{currentTableSession.netTotal?.toFixed(0) || '0'}
                </div>

                {upiQrDataUrl ? (
                  <div style={{ display: 'inline-block', padding: '10px', background: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
                    <img src={upiQrDataUrl} alt="UPI Payment QR" style={{ width: '210px', height: '210px', display: 'block' }} />
                  </div>
                ) : (
                  <div>Generating UPI QR Code...</div>
                )}

                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.85rem' }}>
                  Accepts Google Pay • PhonePe • Paytm • BHIM UPI<br />
                  UPI ID: <strong>hoteleliteinn@icici</strong>
                </div>
              </div>
            )}

            {/* Modal Actions in no-print */}
            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              {billModalTab === 'thermal' && (
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
                  <span>Print Thermal Slip (58/80mm)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTableBillModal(false)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.25rem',
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
          MODAL 2: ITEM-LEVEL VOID / CANCELLATION (With Reason Code & KDS Alert)
          ========================================================================= */}
      {voidItemModal && (
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
            border: '1px solid #ef4444',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '380px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={18} />
                <span>Void / Cancel Item</span>
              </div>
              <button
                type="button"
                onClick={() => setVoidItemModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
              Cancelling <strong>"{voidItemModal.item.name}"</strong> from Table {tableNumber}. This will immediately alert the kitchen KDS to stop cooking.
            </div>

            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              MANDATORY CANCELLATION REASON:
            </label>
            <select
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                outline: 'none'
              }}
            >
              <option value="Guest Delayed (Taking Too Long)">Guest Delayed (Taking Too Long)</option>
              <option value="Guest Changed Mind">Guest Changed Mind</option>
              <option value="Punching Mistake / Wrong Table">Punching Mistake / Wrong Table</option>
              <option value="Dish Not Available / Stockout">Dish Not Available / Stockout</option>
            </select>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleConfirmVoidItem}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                Confirm Void &amp; Alert Kitchen
              </button>
              <button
                type="button"
                onClick={() => setVoidItemModal(null)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
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
                Select Active Steward
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
                  onClick={() => handleSelectSteward(stw.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: activeSteward === stw.name ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: activeSteward === stw.name ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{stw.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Code: {stw.code}</div>
                  </div>
                  {activeSteward === stw.name && (
                    <CheckCircle2 size={16} color="#fbbf24" />
                  )}
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
            maxWidth: 390,
            padding: '1.25rem',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                Select Table / Room Outlet
              </div>
              <button
                type="button"
                onClick={() => setShowTableSelector(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Dining Hall Tables 1-12 */}
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem' }}>
              GROUND DINING HALL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(num => {
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
                      showToast(`Selected Table ${num}`);
                    }}
                    style={{
                      padding: '0.55rem 0.35rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
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

            {/* In-House Rooms */}
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem' }}>
              ROOM SERVICE (IN-HOUSE GUESTS)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
              {['101', '102', '201', '202', '204', '301', '305'].map(rNum => (
                <button
                  key={rNum}
                  type="button"
                  onClick={() => {
                    setTableNumber(rNum);
                    setOrderType('room');
                    setShowTableSelector(false);
                    showToast(`Selected Room ${rNum} (${IN_HOUSE_ROOM_GUESTS[rNum] || 'Guest'})`);
                  }}
                  style={{
                    padding: '0.55rem 0.25rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: tableNumber === rNum ? '#a855f7' : 'rgba(255,255,255,0.06)',
                    color: tableNumber === rNum ? '#fff' : '#cbd5e1',
                    border: tableNumber === rNum ? '1.5px solid #c084fc' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Rm {rNum}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Running Tab Modal */}
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
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24' }}>
                  🪑 Table {tableNumber} Running Tab
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

            {/* Cumulative Items Summary with Item Void Trigger */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '2px' }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, marginBottom: '0.4rem' }}>
                  CUMULATIVE CONSUMPTION TOTALS
                </div>
                {(currentTableSession.cumulativeItems || []).map((ci, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>{ci.quantity}x {ci.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#fff' }}>₹{(Number(ci.quantity) * Number(ci.price || ci.rate || 0)).toFixed(0)}</span>
                      <button
                        type="button"
                        onClick={() => setVoidItemModal({ item: ci, tableNumber })}
                        title="Void 1 portion"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #ef4444',
                          color: '#f87171',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 4px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Void
                      </button>
                    </div>
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowRunningTabModal(false);
                  handleOpenTableBillModal();
                }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: '#10b981',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Printer size={14} />
                <span>Print Bill / UPI QR</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRunningTabModal(false)}
                style={{
                  padding: '0.65rem 1rem',
                  background: '#334155',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="no-print" style={{
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
