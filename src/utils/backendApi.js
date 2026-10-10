/**
 * Hotel Elite Inn - FastAPI & PostgreSQL Cloud Backend Connector
 * Connects PMS & POS frontend directly to the Railway production engine:
 * https://hotel-elite-inn-backend-api-production-0dc9.up.railway.app
 */

export const FASTAPI_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FASTAPI_BACKEND_URL
) ? import.meta.env.VITE_FASTAPI_BACKEND_URL : 'https://hotel-elite-inn-backend-api-production-0dc9.up.railway.app';

export const SWAGGER_DOCS_URL = `${FASTAPI_BASE_URL}/docs`;
export const REDOC_URL = `${FASTAPI_BASE_URL}/redoc`;

/**
 * Check backend API health and connectivity
 */
export async function checkFastApiHealth() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Health check unreachable:', err.message);
    return { status: 'offline', error: err.message };
  }
}

/**
 * Fetch real-time Executive Dashboard stats
 */
export async function getFastApiDashboardStats() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/stats/dashboard`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Dashboard stats fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch all rooms from PostgreSQL
 */
export async function getFastApiRooms() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/rooms`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Rooms fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch all restaurant tables
 */
export async function getFastApiTables() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/restaurant/tables`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Tables fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch all inventory items
 */
export async function getFastApiInventory() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Inventory fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch corporate debtors and outstanding balances
 */
export async function getFastApiCorporateAccounts() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/corporate`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Corporate accounts fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch active room maintenance issues & defects
 */
export async function getFastApiRoomDefects() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/defects`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Defects fetch failed:', err.message);
    return null;
  }
}

/**
 * Void an item from an active POS order (Audio 4 requirement)
 */
export async function voidFastApiOrderItem(orderId, itemCode, reason, pin = '4321') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/void-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_code: itemCode, reason, manager_pin: pin })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Void item error:', err.message);
    throw err;
  }
}

/**
 * Merge two tables for a single bill (Audio 4 requirement)
 */
export async function mergeFastApiTables(sourceTable, targetTable, pin = '4321') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/orders/merge-tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_table: sourceTable, target_table: targetTable, manager_pin: pin })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Merge tables error:', err.message);
    throw err;
  }
}

/**
 * Settle a POS order
 */
export async function settleFastApiOrder(orderId, paymentMethod = 'CASH', pin = '4321') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_method: paymentMethod, manager_pin: pin })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Settle order error:', err.message);
    throw err;
  }
}

/**
 * Fetch official property profile, tariffs, wifi, and intercom directory
 */
export async function getFastApiPropertyInfo() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/property/info`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Property info fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch official F&B restaurant menu items
 */
export async function getFastApiMenu(category = null) {
  try {
    const url = category 
      ? `${FASTAPI_BASE_URL}/api/restaurant/menu?category=${encodeURIComponent(category)}`
      : `${FASTAPI_BASE_URL}/api/restaurant/menu`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Menu fetch failed:', err.message);
    return null;
  }
}

/**
 * Trigger master data sync on PostgreSQL
 */
export async function syncFastApiMasterData() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/system/sync-master-data`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Master data sync failed:', err.message);
    throw err;
  }
}

/**
 * Fetch authentic sample thermal receipt (Photo 2 - R.S/2913)
 */
export async function getFastApiSampleThermalReceipt() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/thermal-receipt/sample`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Thermal receipt fetch failed:', err.message);
    return null;
  }
}

