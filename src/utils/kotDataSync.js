// src/utils/kotDataSync.js
// Centralized real-time KOT data bus & synchronization across:
// 1. Steward Mobile Order Pad
// 2. Kitchen Display System (KDS)
// 3. Fenugreek Restaurant PMS Tab & CannonKitchenPOS
// 4. Live Orders Drawer Modal & Front Desk Room Master Folio

export const KOT_STORAGE_KEY = 'hotel_elite_inn_live_kots';
export const KDS_CHANNEL_NAME = 'hotel_elite_inn_live_kds';
export const TABLE_SESSIONS_KEY = 'hotel_elite_inn_table_sessions';

/**
 * Normalizes an order from any source (Steward Pad, Guest QR, KDS, POS, Cloudflare D1)
 * into a single unified schema so all UI components render cleanly without undefined errors.
 */
export function normalizeKotOrder(raw) {
  if (!raw) return null;

  const orderId = raw.id || raw.kotId || raw.orderId || raw.order_id || `KOT-${Date.now().toString().slice(-4)}`;
  const orderType = raw.orderType || (raw.roomNumber || raw.room_number ? 'room' : 'dining');
  
  // Room vs Table identification
  const roomNumber = raw.roomNumber || raw.room_number || (orderType === 'room' ? (raw.tableNumber || raw.table_number) : null);
  const tableNumber = orderType === 'room' ? null : (raw.tableNumber || raw.table_number || raw.tableId || null);

  const totalAmount = Number(raw.totalAmount !== undefined ? raw.totalAmount : (raw.total_amount !== undefined ? raw.total_amount : (raw.amount || 0)));
  const guestName = raw.guestName || raw.guest_name || (roomNumber ? `Room ${roomNumber} Guest` : (tableNumber ? `Table ${tableNumber} Guest` : 'Walk-In Guest'));
  
  const outlet = raw.outlet || (orderType === 'room' ? 'In-Room Dining (Fenugreek)' : (orderType === 'bar' ? 'Drop In Bar' : (orderType === 'terrace' ? 'Terrace Dining' : 'Fenugreek Restaurant')));
  const status = raw.status || 'Received';
  const createdAt = raw.timestamp || raw.created_at || raw.createdAt || new Date().toISOString();
  const captain = raw.steward || raw.captain || raw.captainName || 'KOTI';
  
  const isJainSatvik = raw.is_jain_satvik !== undefined 
    ? (raw.is_jain_satvik ? 1 : 0) 
    : (raw.dietaryTag === 'jain' || raw.dietaryTag === 'satvik' ? 1 : 0);

  const items = Array.isArray(raw.items) ? raw.items.map((it, idx) => ({
    id: it.id || it.dishId || idx + 1,
    itemCode: it.itemCode || it.dishCode || String(it.id || idx + 1),
    name: it.name || it.dishName || 'Dish',
    quantity: Number(it.quantity !== undefined ? it.quantity : (it.qty || 1)),
    rate: Number(it.rate !== undefined ? it.rate : (it.price || 0)),
    price: Number(it.price !== undefined ? it.price : (it.rate || 0)),
    isVeg: it.isVeg !== undefined ? it.isVeg : true,
    note: it.note || it.notes || ''
  })) : [];

  return {
    ...raw,
    id: orderId,
    orderId,
    kotId: orderId,
    kotNumber: raw.kotNumber || raw.runningKotIndex || orderId.replace(/\D/g, '').slice(-4) || '1',
    orderType,
    roomNumber,
    tableNumber,
    totalAmount,
    guestName,
    outlet,
    status,
    timestamp: createdAt,
    created_at: createdAt,
    captain,
    steward: captain,
    is_jain_satvik: isJainSatvik,
    items,
    generalNote: raw.generalNote || raw.cookingNote || raw.note || '',
    payment_status: raw.payment_status || (raw.paymentStatus || 'Pending')
  };
}

/**
 * Loads current live KOTs from localStorage with normalization
 */
export function getLiveKots() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(KOT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeKotOrder).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Error reading live KOTs from storage:', err);
  }

  // Realistic default live seed orders (connected to actual Fenugreek restaurant menu)
  const defaultSeeds = [
    {
      id: 'KOT-882101',
      kotNumber: '1',
      tableNumber: '4',
      orderType: 'dining',
      steward: 'SADANANDA',
      captain: 'SADANANDA',
      guestName: 'Dr. Tripathy',
      outlet: 'Fenugreek Restaurant',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      timeFormatted: '08:45 PM',
      status: 'Preparing',
      items: [
        { id: 102, itemCode: '102', name: 'Chicken Dum Biryani (Chef Special)', quantity: 2, rate: 260, price: 260, isVeg: false, note: 'Extra Raita' },
        { id: 215, itemCode: '215', name: 'Paneer Butter Masala', quantity: 1, rate: 210, price: 210, isVeg: true, note: 'Medium Spicy' },
        { id: 309, itemCode: '309', name: 'Butter Tandoori Roti', quantity: 4, rate: 25, price: 25, isVeg: true, note: 'Crispy' }
      ],
      totalAmount: 830,
      generalNote: 'VIP table - Serve Biryani first',
      is_jain_satvik: 0
    },
    {
      id: 'KOT-882102',
      kotNumber: '2',
      tableNumber: '6',
      orderType: 'dining',
      steward: 'KOTI',
      captain: 'KOTI',
      guestName: 'P. K. Mohapatra',
      outlet: 'Fenugreek Restaurant',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      timeFormatted: '08:38 PM',
      status: 'Ready',
      items: [
        { id: 101, itemCode: '101', name: 'Butter Chicken Boneless', quantity: 1, rate: 320, price: 320, isVeg: false, note: '' },
        { id: 307, itemCode: '307', name: 'Plain Steamed Rice', quantity: 2, rate: 90, price: 90, isVeg: true, note: '' }
      ],
      totalAmount: 500,
      generalNote: 'Prompt delivery',
      is_jain_satvik: 0
    },
    {
      id: 'KOT-882103',
      kotNumber: '1',
      roomNumber: '204',
      orderType: 'room',
      steward: 'SADANANDA',
      captain: 'SADANANDA',
      guestName: 'BIJAY PASWAN',
      outlet: 'In-Room Dining (Fenugreek)',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      timeFormatted: '08:42 PM',
      status: 'Received',
      items: [
        { id: 215, itemCode: '215', name: 'Paneer Butter Masala', quantity: 1, rate: 240, price: 240, isVeg: true, note: 'Mild gravy' },
        { id: 309, itemCode: '309', name: 'Butter Tandoori Roti', quantity: 4, rate: 30, price: 30, isVeg: true, note: 'Freshly baked' },
        { id: 308, itemCode: '308', name: 'Jeera Rice', quantity: 1, rate: 160, price: 160, isVeg: true, note: 'Fragrant cumin tadka' }
      ],
      totalAmount: 520,
      generalNote: 'Serve hot in Room 204 with cutlery set',
      is_jain_satvik: 0
    }
  ];

  try {
    localStorage.setItem(KOT_STORAGE_KEY, JSON.stringify(defaultSeeds));
  } catch (e) {}

  return defaultSeeds.map(normalizeKotOrder);
}

/**
 * Saves live KOTs to localStorage and triggers storage event
 */
export function saveLiveKots(kots) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(kots.slice(0, 100));
    localStorage.setItem(KOT_STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Error saving live KOTs:', err);
  }
}

/**
 * Broadcasts an event to all open tabs and windows via BroadcastChannel
 */
export function broadcastKotChannel(message) {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const ch = new BroadcastChannel(KDS_CHANNEL_NAME);
      ch.postMessage(message);
      ch.close();
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }
}

/**
 * Updates a KOT order status across storage, broadcast bus, and remote D1
 */
export function updateKotStatusUnified(orderId, newStatus) {
  const allOrders = getLiveKots();
  const updatedOrders = allOrders.map(o => {
    if (o.id === orderId || o.orderId === orderId) {
      return { ...o, status: newStatus };
    }
    return o;
  });

  saveLiveKots(updatedOrders);
  broadcastKotChannel({
    type: 'KOT_STATUS_UPDATED',
    orderId,
    status: newStatus
  });

  // Background sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_order_status',
        payload: { orderId, status: newStatus }
      })
    }).catch(err => console.debug('Offline status sync:', err));
  }

  return updatedOrders;
}
