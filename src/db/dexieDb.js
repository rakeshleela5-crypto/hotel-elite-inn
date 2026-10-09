// src/db/dexieDb.js
// Enterprise Offline-First IndexedDB Layer for Hotel Elite Inn
// Powered by Dexie.js with Automatic Cloudflare D1 Background Outbox Sync

import Dexie from 'dexie';
import { RESTAURANT_MENU } from '../data/hotelData';

// 1. Initialize Dexie Database
export const db = new Dexie('HotelEliteInnDB');

// Define database schema
db.version(1).stores({
  kots: '&id, orderId, kotNumber, tableNumber, roomNumber, orderType, status, steward, timestamp, syncStatus, is_jain_satvik',
  tableSessions: '&tableNumber, sessionId, status, netTotal, updatedAt',
  menuCatalog: '&id, itemCode, name, category, subcategory, price, isVeg, isChefSpecial',
  outboxQueue: '++id, action, endpoint, status, retries, timestamp',
  syncMetadata: '&key, value, updatedAt'
});

// Sync State Listener Subscribers
const syncSubscribers = new Set();
let isFlushing = false;
let syncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  failedCount: 0,
  isSyncing: false,
  lastSyncedAt: null,
  lastError: null
};

function notifySubscribers() {
  const current = { ...syncState };
  syncSubscribers.forEach(cb => {
    try { cb(current); } catch (e) { console.error('Sync subscriber error:', e); }
  });
}

export function subscribeSyncState(callback) {
  syncSubscribers.add(callback);
  callback({ ...syncState });
  return () => syncSubscribers.delete(callback);
}

/**
 * Normalizes an order from any source for consistent Dexie storage
 */
export function normalizeKotForDexie(raw) {
  if (!raw) return null;
  const orderId = raw.id || raw.kotId || raw.orderId || raw.order_id || `KOT-${Date.now().toString().slice(-4)}`;
  const orderType = raw.orderType || (raw.roomNumber || raw.room_number ? 'room' : 'dining');
  const roomNumber = raw.roomNumber || raw.room_number || (orderType === 'room' ? (raw.tableNumber || raw.table_number) : null);
  const tableNumber = orderType === 'room' ? null : (raw.tableNumber || raw.table_number || raw.tableId || null);
  const totalAmount = Number(raw.totalAmount !== undefined ? raw.totalAmount : (raw.total_amount !== undefined ? raw.total_amount : (raw.amount || 0)));
  const guestName = raw.guestName || raw.guest_name || (roomNumber ? `Room ${roomNumber} Guest` : (tableNumber ? `Table ${tableNumber} Guest` : 'Walk-In Guest'));
  const outlet = raw.outlet || (orderType === 'room' ? 'In-Room Dining (Cannon Kitchen)' : (orderType === 'bar' ? 'Drop In Bar' : (orderType === 'terrace' ? 'Terrace Dining' : 'Cannon Kitchen')));
  const status = raw.status || 'Received';
  const createdAt = raw.timestamp || raw.created_at || raw.createdAt || new Date().toISOString();
  const captain = raw.steward || raw.captain || raw.captainName || 'KOTI';
  const isJainSatvik = raw.is_jain_satvik !== undefined ? (raw.is_jain_satvik ? 1 : 0) : (raw.dietaryTag === 'jain' || raw.dietaryTag === 'satvik' ? 1 : 0);

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
    roomNumber: roomNumber ? String(roomNumber) : null,
    tableNumber: tableNumber ? String(tableNumber) : null,
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
    syncStatus: raw.syncStatus || 'pending'
  };
}

/**
 * 2. Pre-seed database on first startup
 */
export async function initDexieDb() {
  if (typeof window === 'undefined') return;

  try {
    // Check menu catalog count
    const menuCount = await db.menuCatalog.count();
    if (menuCount === 0 && Array.isArray(RESTAURANT_MENU) && RESTAURANT_MENU.length > 0) {
      const menuEntries = RESTAURANT_MENU.map((m, idx) => ({
        id: m.id || idx + 1,
        itemCode: m.itemCode || String(m.id || idx + 1),
        name: m.name || 'Menu Item',
        category: m.category || 'Main Course',
        subcategory: m.subcategory || '',
        price: Number(m.price || 0),
        isVeg: Boolean(m.isVeg),
        isChefSpecial: Boolean(m.isChefSpecial)
      }));
      await db.menuCatalog.bulkPut(menuEntries);
    }

    // Check KOTs count and migrate from localStorage if Dexie is empty
    const kotCount = await db.kots.count();
    if (kotCount === 0) {
      const localKotsRaw = localStorage.getItem('hotel_elite_inn_live_kots');
      if (localKotsRaw) {
        try {
          const parsed = JSON.parse(localKotsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map(normalizeKotForDexie).filter(Boolean);
            await db.kots.bulkPut(normalized);
          }
        } catch (e) {
          console.warn('Dexie KOT migration warning:', e);
        }
      }
    }

    // Check table sessions count and migrate from localStorage if Dexie is empty
    const sessionCount = await db.tableSessions.count();
    if (sessionCount === 0) {
      const localSessionsRaw = localStorage.getItem('hotel_elite_inn_table_sessions');
      if (localSessionsRaw) {
        try {
          const parsed = JSON.parse(localSessionsRaw);
          const entries = Object.entries(parsed).map(([tNum, session]) => ({
            tableNumber: String(tNum),
            ...session,
            updatedAt: new Date().toISOString()
          }));
          if (entries.length > 0) {
            await db.tableSessions.bulkPut(entries);
          }
        } catch (e) {
          console.warn('Dexie table session migration warning:', e);
        }
      }
    }

    // Update pending count in syncState
    await refreshPendingCounts();

    // Auto-flush pending outbox if online
    if (navigator.onLine) {
      flushDexieOutbox();
    }
  } catch (err) {
    console.error('Dexie initialization error:', err);
  }
}

/**
 * Refreshes pending & failed counts from outboxQueue
 */
export async function refreshPendingCounts() {
  try {
    const pending = await db.outboxQueue.where('status').equals('pending').count();
    const failed = await db.outboxQueue.where('status').equals('failed').count();
    syncState.pendingCount = pending;
    syncState.failedCount = failed;
    syncState.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    notifySubscribers();
  } catch (e) {
    // DB might still be initializing
  }
}

/**
 * 3. Save KOT to Dexie with outbox queue
 */
export async function saveKotToDexie(rawKot) {
  const kot = normalizeKotForDexie(rawKot);
  if (!kot) return;

  try {
    // 1. Write to Dexie persistent storage
    await db.kots.put(kot);

    // 2. Add to outbox queue for Cloudflare D1 sync
    await db.outboxQueue.add({
      action: 'create_live_kot',
      endpoint: '/api/sync',
      payload: kot,
      status: 'pending',
      retries: 0,
      timestamp: new Date().toISOString(),
      entityId: kot.id
    });

    // 3. Keep localStorage & BroadcastChannel in sync for legacy listeners
    try {
      const allKots = await db.kots.orderBy('timestamp').reverse().limit(100).toArray();
      localStorage.setItem('hotel_elite_inn_live_kots', JSON.stringify(allKots));
    } catch (e) {}

    await refreshPendingCounts();

    // 4. Trigger background flush
    flushDexieOutbox();

    return kot;
  } catch (err) {
    console.error('saveKotToDexie error:', err);
    throw err;
  }
}

/**
 * 4. Update KOT Status in Dexie
 */
export async function updateKotStatusInDexie(orderId, newStatus) {
  try {
    const existing = await db.kots.get(orderId);
    if (existing) {
      await db.kots.update(orderId, {
        status: newStatus,
        syncStatus: 'pending'
      });
    }

    // Add to outbox queue
    await db.outboxQueue.add({
      action: 'update_order_status',
      endpoint: '/api/sync',
      payload: { orderId, status: newStatus },
      status: 'pending',
      retries: 0,
      timestamp: new Date().toISOString(),
      entityId: orderId
    });

    // Update localStorage mirror
    try {
      const allKots = await db.kots.orderBy('timestamp').reverse().limit(100).toArray();
      localStorage.setItem('hotel_elite_inn_live_kots', JSON.stringify(allKots));
    } catch (e) {}

    await refreshPendingCounts();
    flushDexieOutbox();
  } catch (err) {
    console.error('updateKotStatusInDexie error:', err);
  }
}

/**
 * 5. Save Table Session to Dexie
 */
export async function saveTableSessionToDexie(tableNumber, sessionData) {
  const tStr = String(tableNumber);
  const entry = {
    ...sessionData,
    tableNumber: tStr,
    updatedAt: new Date().toISOString()
  };

  try {
    await db.tableSessions.put(entry);

    // Enqueue for Cloudflare D1 sync
    await db.outboxQueue.add({
      action: 'save_running_table_session',
      endpoint: '/api/sync',
      payload: entry,
      status: 'pending',
      retries: 0,
      timestamp: new Date().toISOString(),
      entityId: entry.sessionId || `SESSION-${tStr}`
    });

    // Mirror to localStorage
    try {
      const allSessions = await db.tableSessions.toArray();
      const sessionMap = {};
      allSessions.forEach(s => { sessionMap[s.tableNumber] = s; });
      localStorage.setItem('hotel_elite_inn_table_sessions', JSON.stringify(sessionMap));
    } catch (e) {}

    await refreshPendingCounts();
    flushDexieOutbox();
  } catch (err) {
    console.error('saveTableSessionToDexie error:', err);
  }
}

/**
 * 6. Settle Table Session in Dexie
 */
export async function settleTableSessionInDexie(tableNumber, settlementData = {}) {
  const tStr = String(tableNumber);
  try {
    const existing = await db.tableSessions.get(tStr);
    if (existing) {
      await db.tableSessions.update(tStr, {
        status: 'SETTLED',
        settledAt: new Date().toISOString(),
        paymentMode: settlementData.paymentMode || 'Cash'
      });
    }

    await db.outboxQueue.add({
      action: 'settle_running_table_session',
      endpoint: '/api/sync',
      payload: {
        tableNumber: tStr,
        sessionId: existing?.sessionId || '',
        paymentMode: settlementData.paymentMode || 'Cash',
        ...settlementData
      },
      status: 'pending',
      retries: 0,
      timestamp: new Date().toISOString(),
      entityId: `SETTLE-${tStr}`
    });

    // Mirror to localStorage
    try {
      const allSessions = await db.tableSessions.toArray();
      const sessionMap = {};
      allSessions.forEach(s => {
        if (s.status !== 'SETTLED') sessionMap[s.tableNumber] = s;
      });
      localStorage.setItem('hotel_elite_inn_table_sessions', JSON.stringify(sessionMap));
    } catch (e) {}

    await refreshPendingCounts();
    flushDexieOutbox();
  } catch (err) {
    console.error('settleTableSessionInDexie error:', err);
  }
}

/**
 * 7. Outbox Sync Engine: Flushes pending queue to Cloudflare D1
 */
export async function flushDexieOutbox() {
  if (typeof window === 'undefined') return;
  if (!navigator.onLine) {
    syncState.isOnline = false;
    notifySubscribers();
    return;
  }

  if (isFlushing) return;
  isFlushing = true;
  syncState.isSyncing = true;
  notifySubscribers();

  try {
    const pendingItems = await db.outboxQueue
      .where('status')
      .equals('pending')
      .limit(20)
      .toArray();

    if (pendingItems.length === 0) {
      isFlushing = false;
      syncState.isSyncing = false;
      await refreshPendingCounts();
      return;
    }

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';

    for (const item of pendingItems) {
      try {
        const response = await fetch(item.endpoint || '/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminPin
          },
          body: JSON.stringify({
            action: item.action,
            payload: item.payload
          })
        });

        if (response.ok) {
          // Success! Delete item from outbox
          await db.outboxQueue.delete(item.id);

          // If it was a KOT, mark syncStatus = 'synced' in Dexie
          if (item.action === 'create_live_kot' && item.entityId) {
            await db.kots.update(item.entityId, { syncStatus: 'synced' }).catch(() => {});
          }
          syncState.lastSyncedAt = new Date().toISOString();
        } else {
          // Server returned error (e.g., 500 or 400)
          const errorText = await response.text().catch(() => 'Server Error');
          const newRetries = (item.retries || 0) + 1;
          const newStatus = newRetries >= 5 ? 'failed' : 'pending';

          await db.outboxQueue.update(item.id, {
            retries: newRetries,
            status: newStatus,
            lastError: `${response.status}: ${errorText.slice(0, 100)}`
          });
        }
      } catch (networkErr) {
        // Network dropped mid-transmission
        console.warn('Dexie outbox network drop:', networkErr.message);
        await db.outboxQueue.update(item.id, {
          retries: (item.retries || 0) + 1,
          lastError: networkErr.message
        });
        // Break loop if network is truly down
        if (!navigator.onLine) break;
      }
    }
  } catch (err) {
    console.error('flushDexieOutbox fatal error:', err);
    syncState.lastError = err.message;
  } finally {
    isFlushing = false;
    syncState.isSyncing = false;
    await refreshPendingCounts();
  }
}

/**
 * 8. Manual retry for failed outbox entries
 */
export async function retryFailedOutboxItems() {
  try {
    const failed = await db.outboxQueue.where('status').equals('failed').toArray();
    for (const item of failed) {
      await db.outboxQueue.update(item.id, {
        status: 'pending',
        retries: 0,
        lastError: null
      });
    }
    await refreshPendingCounts();
    return flushDexieOutbox();
  } catch (e) {
    console.error('retryFailedOutboxItems error:', e);
  }
}

/**
 * 9. Hook & Event Listeners
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncState.isOnline = true;
    notifySubscribers();
    flushDexieOutbox();
  });

  window.addEventListener('offline', () => {
    syncState.isOnline = false;
    notifySubscribers();
  });

  // Background heartbeat every 20 seconds to retry pending queue
  setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      refreshPendingCounts().then(() => {
        if (syncState.pendingCount > 0) {
          flushDexieOutbox();
        }
      });
    }
  }, 20000);

  // Initialize DB on script load
  initDexieDb();
}
