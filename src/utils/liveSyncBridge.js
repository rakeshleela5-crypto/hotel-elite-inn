// src/utils/liveSyncBridge.js
/**
 * Real-Time Multi-Device Synchronization Bridge for Hotel Elite Inn
 * 
 * Solves Audio 1 & Audio 3/4 Client Requirements:
 * 1. Steward punches order on Mobile -> Immediately pops up on Reception, Kitchen KDS, and IDS Next Touch POS without manual page refresh.
 * 2. Housekeeping updates room on Mobile -> Immediately turns room Green (Available) on Reception and IDS Next Room Rack.
 * 
 * Dual-Sync Protocol:
 * - 0ms Zero-Latency local sync via Web BroadcastChannel (for multiple tabs on same workstation)
 * - 2-3s Network Cloud Sync via Railway FastAPI & PostgreSQL (for separate smartphones, tablets & PCs)
 */

import { 
  createFastApiPosOrder, 
  getFastApiPosOrders, 
  updateFastApiRoomStatus, 
  getFastApiRooms 
} from './backendApi';
import { 
  dispatchKotUnified, 
  normalizeKotOrder, 
  KOT_STORAGE_KEY, 
  KDS_CHANNEL_NAME, 
  TABLE_SESSIONS_KEY,
  getLiveKots,
  saveLiveKots,
  mergeKotIntoTableSessions
} from './kotDataSync';
import { playOrderAlert, playHousekeepingChime } from './soundAlert';

// In-memory sets to prevent duplicate alerts & echoes
const knownOrderIds = new Set();
const knownRoomStatuses = new Map();
const activeListeners = new Set();

let pollingTimer = null;
let isPollingActive = false;
let isInitialized = false;

// Room number to Railway database ID mapping helper (Floors 1, 2, 3)
const ROOM_ID_MAP = {
  '101': 1, '102': 2, '103': 3, '104': 4, '105': 5, '106': 6, '107': 7, '108': 8, '109': 9,
  '201': 10, '202': 11, '203': 12, '204': 13, '205': 14, '206': 15, '207': 16, '208': 17, '209': 18,
  '301': 19, '302': 20, '303': 21, '304': 22, '305': 23, '306': 24, '307': 25, '308': 26, '309': 27
};

/**
 * Initializes known states from current localStorage & initial fetch
 */
function initKnownStates() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const localKots = getLiveKots();
    localKots.forEach(k => {
      if (k.id) knownOrderIds.add(String(k.id));
      if (k.order_number) knownOrderIds.add(String(k.order_number));
      if (k.orderId) knownOrderIds.add(String(k.orderId));
    });
  } catch (e) {}

  // Initial fetch to seed known state without firing false alerts
  getFastApiPosOrders().then(orders => {
    if (Array.isArray(orders)) {
      orders.forEach(o => {
        if (o.id) knownOrderIds.add(String(o.id));
        if (o.order_number) knownOrderIds.add(String(o.order_number));
      });
    }
  }).catch(() => {});

  getFastApiRooms().then(rooms => {
    if (Array.isArray(rooms)) {
      rooms.forEach(r => {
        if (r.number) knownRoomStatuses.set(String(r.number), String(r.status).toLowerCase());
      });
    }
  }).catch(() => {});
}

/**
 * Executes a single cloud synchronization pass against Railway FastAPI
 */
async function performCloudSyncTick() {
  if (isPollingActive) return;
  isPollingActive = true;

  try {
    // 1. Sync POS & Kitchen KOT Orders
    const cloudOrders = await getFastApiPosOrders();
    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      cloudOrders.forEach(co => {
        const orderKey = String(co.order_number || co.id);
        const idKey = String(co.id);

        if (!knownOrderIds.has(orderKey) && !knownOrderIds.has(idKey)) {
          knownOrderIds.add(orderKey);
          knownOrderIds.add(idKey);

          // Convert FastAPI PosOrder response to standard frontend KOT structure
          const convertedItems = (co.items || []).map((it, idx) => ({
            id: it.id || idx + 1,
            name: it.item_name,
            quantity: it.quantity,
            rate: it.rate,
            price: it.rate,
            amount: it.amount || (it.quantity * it.rate),
            isVeg: true
          }));

          const tableNum = co.table_id ? String(co.table_id) : null;
          const roomNum = co.room_number ? String(co.room_number) : null;

          const normalized = normalizeKotOrder({
            id: co.order_number || `KOT-FASTAPI-${co.id}`,
            orderId: co.order_number || `KOT-FASTAPI-${co.id}`,
            kotId: co.order_number || `KOT-FASTAPI-${co.id}`,
            kotNumber: String(co.id || '1'),
            orderType: co.order_type === 'room_service' ? 'room' : 'dining',
            tableNumber: tableNum,
            roomNumber: roomNum,
            totalAmount: co.final_amount || co.subtotal || 0,
            status: co.status === 'open' ? 'Received' : (co.status || 'Received'),
            timestamp: co.created_at || new Date().toISOString(),
            captain: 'STEWARD',
            steward: 'STEWARD',
            items: convertedItems,
            outlet: co.order_type === 'room_service' ? 'In-Room Dining' : 'Cannon Kitchen'
          });

          // Mirror into local storage so offline views and refresh preserve it
          const existing = getLiveKots();
          saveLiveKots([normalized, ...existing.filter(k => k.id !== normalized.id)].slice(0, 100));

          // Ingest and persist into table sessions so Touch POS and bill terminals update
          let cloudTableSessions = null;
          try {
            const rawSessions = localStorage.getItem(TABLE_SESSIONS_KEY);
            const currentSessions = rawSessions ? JSON.parse(rawSessions) : {};
            cloudTableSessions = mergeKotIntoTableSessions(currentSessions, normalized);
            localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(cloudTableSessions));
          } catch (e) {
            console.warn('Error saving cloud table session:', e);
          }

          // Play audible kitchen bell
          playOrderAlert();

          // Broadcast to all active UI subscribers across pages & modals
          notifyListeners({
            type: 'NEW_KOT_ORDER',
            order: normalized,
            tableSessions: cloudTableSessions,
            source: 'CLOUD_FASTAPI'
          });
        }
      });
    }

    // 2. Sync Room Statuses for Housekeeping Turnaround
    const cloudRooms = await getFastApiRooms();
    if (Array.isArray(cloudRooms) && cloudRooms.length > 0) {
      cloudRooms.forEach(cr => {
        const rNum = String(cr.number);
        const currentStatus = String(cr.status).toLowerCase();
        const previousStatus = knownRoomStatuses.get(rNum);

        if (previousStatus && previousStatus !== currentStatus) {
          knownRoomStatuses.set(rNum, currentStatus);

          if (currentStatus === 'clean') {
            playHousekeepingChime();
          }

          let displayStatus = 'Clean';
          if (currentStatus === 'dirty') displayStatus = 'Dirty';
          else if (currentStatus === 'occupied') displayStatus = 'Occupied';
          else if (currentStatus === 'maintenance') displayStatus = 'Out of Order';
          else if (currentStatus === 'dnd') displayStatus = 'Do not Disturb';

          const currentStatuses = getLiveRoomStatuses();
          currentStatuses[rNum] = {
            ...(currentStatuses[rNum] || {}),
            roomNo: rNum,
            status: displayStatus,
            normalizedStatus: currentStatus === 'maintenance' ? 'ooo' : currentStatus,
            updatedAt: new Date().toISOString()
          };
          saveLiveRoomStatuses(currentStatuses);

          notifyListeners({
            type: 'ROOM_STATUS_CHANGED',
            roomNumber: rNum,
            status: displayStatus,
            normalizedStatus: currentStatus === 'maintenance' ? 'ooo' : currentStatus,
            roomStatuses: currentStatuses,
            source: 'CLOUD_FASTAPI'
          });
        } else if (!previousStatus) {
          knownRoomStatuses.set(rNum, currentStatus);
        }
      });
    }
  } catch (err) {
    // Graceful offline degradation
  } finally {
    isPollingActive = false;
  }
}

/**
 * Starts or stops the background cloud poll based on active listener count
 */
function checkPollingState() {
  if (activeListeners.size > 0) {
    if (!pollingTimer) {
      initKnownStates();
      // Poll every 3 seconds for snappy multi-device updates with negligible Railway CPU
      pollingTimer = setInterval(performCloudSyncTick, 3000);
      // Run immediate pass on start
      performCloudSyncTick();
    }
  } else {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }
}

function notifyListeners(event) {
  activeListeners.forEach(listener => {
    try {
      listener(event);
    } catch (e) {
      console.warn('Listener error in liveSyncBridge:', e);
    }
  });
}

/**
 * 🚀 High-Level Steward KOT Dispatcher
 * Dispatches an order from Steward Mobile:
 * 1. Instantly alerts local tabs via BroadcastChannel & Dexie (0ms)
 * 2. Securely writes to FastAPI / PostgreSQL on Railway via HTTPS
 */
export async function syncDispatchKotOrder(newKotOrder, tableSession = null) {
  initKnownStates();

  // 1. Instant local zero-latency dispatch (BroadcastChannel + Dexie)
  const normalized = await dispatchKotUnified(newKotOrder, tableSession);

  if (normalized.id) knownOrderIds.add(String(normalized.id));
  if (normalized.order_number) knownOrderIds.add(String(normalized.order_number));

  // 2. Transmit to Cloud FastAPI & PostgreSQL
  try {
    const rawTable = normalized.tableNumber ? String(normalized.tableNumber).replace(/\D/g, '') : null;
    const tableId = rawTable ? parseInt(rawTable, 10) : null;
    const roomNumber = normalized.roomNumber ? String(normalized.roomNumber) : null;

    const payload = {
      table_id: tableId,
      room_number: roomNumber,
      order_type: normalized.orderType === 'room' ? 'room_service' : 'dine_in',
      items: (normalized.items || []).map(it => ({
        item_name: it.name || it.dishName || 'Food Item',
        quantity: Math.max(1, Number(it.quantity || it.qty || 1)),
        rate: Number(it.rate || it.price || 0)
      }))
    };

    const cloudRes = await createFastApiPosOrder(payload);
    if (cloudRes && cloudRes.order_number) {
      knownOrderIds.add(String(cloudRes.order_number));
      knownOrderIds.add(String(cloudRes.id));
    }
  } catch (err) {
    console.warn('[LiveSyncBridge] Cloud KOT dispatch queued locally:', err.message);
  }

  return normalized;
}

export const HK_ROOM_STATUSES_KEY = 'hotel_elite_inn_room_statuses';

export function getLiveRoomStatuses() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(HK_ROOM_STATUSES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveLiveRoomStatuses(statuses) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HK_ROOM_STATUSES_KEY, JSON.stringify(statuses));
  } catch (e) {}
}

/**
 * 🧹 High-Level Housekeeping Room Status Dispatcher
 * Dispatches a room status change from Housekeeping Mobile:
 * 1. Persists to shared localStorage (hotel_elite_inn_room_statuses)
 * 2. Emits immediately to local tabs (BroadcastChannel)
 * 3. Securely updates PostgreSQL via FastAPI PATCH /api/rooms/{id}/status
 */
export async function syncUpdateRoomStatus(roomNumber, status, optionsOrStaff = 'Housekeeping Staff') {
  initKnownStates();
  const rNumStr = String(roomNumber);
  const rawStatus = String(status);
  const normalizedStatus = rawStatus.toLowerCase();

  const staffName = typeof optionsOrStaff === 'string' 
    ? optionsOrStaff 
    : (optionsOrStaff?.staffName || optionsOrStaff?.attendant || 'Housekeeping Staff');
  const inspectedBy = typeof optionsOrStaff === 'object' && optionsOrStaff !== null 
    ? (optionsOrStaff?.inspectedBy || 'Sunil Mohapatra') 
    : 'Sunil Mohapatra';
  const headcount = typeof optionsOrStaff === 'object' && optionsOrStaff !== null && optionsOrStaff.headcount
    ? optionsOrStaff.headcount
    : { adult: '0', child: '0', infant: '0' };

  let normalizedCode = 'clean';
  if (normalizedStatus.includes('disturb') || normalizedStatus === 'dnd') {
    normalizedCode = 'dnd';
  } else if (normalizedStatus.includes('order') || normalizedStatus === 'ooo' || normalizedStatus.includes('maint')) {
    normalizedCode = 'ooo';
  } else if (normalizedStatus.includes('dirty')) {
    normalizedCode = 'dirty';
  } else if (normalizedStatus.includes('occupied')) {
    normalizedCode = 'occupied';
  } else if (normalizedStatus.includes('inspect')) {
    normalizedCode = 'inspected';
  } else if (normalizedStatus.includes('clean') || normalizedStatus.includes('avail')) {
    normalizedCode = 'clean';
  }

  knownRoomStatuses.set(rNumStr, normalizedCode);

  // 1. Mirror into shared localStorage so all open windows, modals and reloads receive it
  const currentStatuses = getLiveRoomStatuses();
  const roomEntry = {
    roomNo: rNumStr,
    status: rawStatus,
    normalizedStatus: normalizedCode,
    attendant: staffName,
    inspectedBy,
    headcount,
    updatedAt: new Date().toISOString()
  };
  const updatedStatuses = {
    ...currentStatuses,
    [rNumStr]: roomEntry
  };
  saveLiveRoomStatuses(updatedStatuses);

  // 2. BroadcastChannel for same-device tabs (Reception desktop, Room Rack)
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const hkChannel = new BroadcastChannel('hotel_elite_inn_housekeeping');
      hkChannel.postMessage({
        type: 'ROOM_STATUS_CHANGED',
        payload: {
          roomNumber: rNumStr,
          status: rawStatus,
          normalizedStatus: normalizedCode,
          roomEntry,
          roomStatuses: updatedStatuses,
          cleanedBy: staffName,
          updatedBy: staffName,
          inspectedBy,
          cleanedAt: new Date().toISOString()
        }
      });
      hkChannel.close();
    }
  } catch (e) {}

  // 3. Persist to PostgreSQL via FastAPI
  const roomId = ROOM_ID_MAP[rNumStr] || parseInt(rNumStr, 10);
  try {
    let cloudStatus = 'clean';
    if (normalizedCode === 'dirty') cloudStatus = 'dirty';
    else if (normalizedCode === 'occupied' || normalizedCode === 'dnd') cloudStatus = 'occupied';
    else if (normalizedCode === 'ooo') cloudStatus = 'maintenance';
    else cloudStatus = 'clean';

    await updateFastApiRoomStatus(roomId, cloudStatus);
  } catch (err) {
    console.warn('[LiveSyncBridge] Cloud Room status update queued:', err.message);
  }

  return roomEntry;
}

/**
 * 📡 Global Listener Subscription
 * Any component (KitchenDisplayKDS, ReceptionAdmin, IdsTouchPosTerminalModal, IdsDesktopShell)
 * can subscribe to receive real-time notifications with ZERO page refresh.
 */
export function subscribeToLiveSync(callback) {
  initKnownStates();
  activeListeners.add(callback);
  checkPollingState();

  // Also listen to local BroadcastChannel so local tab events are received in 0ms
  let kdsBc = null;
  let hkBc = null;

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      kdsBc = new BroadcastChannel(KDS_CHANNEL_NAME);
      kdsBc.onmessage = (event) => {
        const { type, order, tableSessions } = event.data || {};
        if (type === 'NEW_KOT_ORDER' && order) {
          callback({ type: 'NEW_KOT_ORDER', order, tableSessions, source: 'LOCAL_BROADCAST' });
        }
      };

      hkBc = new BroadcastChannel('hotel_elite_inn_housekeeping');
      hkBc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (payload?.roomNumber) {
          callback({
            type: 'ROOM_STATUS_CHANGED',
            roomNumber: payload.roomNumber,
            status: payload.status || (type === 'ROOM_CLEANED' ? 'Clean' : payload.newStatus || 'Dirty'),
            normalizedStatus: payload.normalizedStatus || 'clean',
            roomStatuses: payload.roomStatuses,
            payload,
            source: 'LOCAL_BROADCAST'
          });
        }
      };
    } catch (e) {}
  }

  // Return unsubscription cleanup
  return () => {
    activeListeners.delete(callback);
    checkPollingState();
    if (kdsBc) kdsBc.close();
    if (hkBc) hkBc.close();
  };
}
