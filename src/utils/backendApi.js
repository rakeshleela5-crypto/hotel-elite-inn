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
 * Update room status (clean, dirty, occupied, maintenance) on Railway PostgreSQL
 */
export async function updateFastApiRoomStatus(roomId, newStatus) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/rooms/${roomId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ status: newStatus.toLowerCase() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Update room status error:', err.message);
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
export async function settleFastApiOrder(orderId, paymentMethod = 'CASH', pin = '4321', options = {}) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method: paymentMethod,
        discount_amount: Number(options.discountAmount || 0),
        room_number: options.roomNumber ? String(options.roomNumber) : null,
        cost_center: options.costCenter ? String(options.costCenter) : null,
        auth_officer: options.authOfficer ? String(options.authOfficer) : null,
        reason: options.reason ? String(options.reason) : null,
        is_management_nc: Boolean(options.isManagementNc || false),
        month: options.month || 'OCTOBER-2026'
      })
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
 * Create a new POS / KOT order on PostgreSQL
 */
export async function createFastApiPosOrder(orderData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pos/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create POS order error:', err.message);
    return null;
  }
}

/**
 * Fetch all POS orders from PostgreSQL
 */
export async function getFastApiPosOrders(statusFilter = null) {
  try {
    const url = statusFilter
      ? `${FASTAPI_BASE_URL}/api/pos/orders?status_filter=${encodeURIComponent(statusFilter)}`
      : `${FASTAPI_BASE_URL}/api/pos/orders`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get POS orders error:', err.message);
    return [];
  }
}

/**
 * Fetch official property profile, tariffs, wifi, and intercom directory
 */
/**
 * Seal night audit and roll over business date on PostgreSQL
 */
export async function sealFastApiNightAudit(auditDate, managerPin = '4321', sealedBy = 'IT ADMIN') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/night-audit/seal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ audit_date: auditDate, manager_pin: managerPin, sealed_by: sealedBy })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Seal night audit error:', err.message);
    return null;
  }
}

/**
 * Fetch night audit historical run logs
 */
export async function getFastApiNightAuditLogs() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/night-audit/logs`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get night audit logs error:', err.message);
    return [];
  }
}

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

// -------------------------------------------------------------
// GST GSTR-1 Statutory Filing Integration
// -------------------------------------------------------------
export async function getFastApiGstFilings(returnPeriod) {
  try {
    const url = returnPeriod 
      ? `${FASTAPI_BASE_URL}/api/gst/filings?return_period=${encodeURIComponent(returnPeriod)}`
      : `${FASTAPI_BASE_URL}/api/gst/filings`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GST filings fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiGstFiling(filingData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/gst/filings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(filingData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create GST invoice failed:', err.message);
    throw err;
  }
}

export async function getFastApiGstr1Summary(returnPeriod = 'OCT-2026') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/gst/summary/${encodeURIComponent(returnPeriod)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GSTR-1 summary fetch failed:', err.message);
    return null;
  }
}

// -------------------------------------------------------------
// Staff Roster & Attendance Integration
// -------------------------------------------------------------
export async function getFastApiStaffRoster() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/staff/roster`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Staff roster fetch failed:', err.message);
    return [];
  }
}

export async function getFastApiStaffAttendance(date) {
  try {
    const url = date 
      ? `${FASTAPI_BASE_URL}/api/staff/attendance?attendance_date=${encodeURIComponent(date)}`
      : `${FASTAPI_BASE_URL}/api/staff/attendance`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Staff attendance fetch failed:', err.message);
    return [];
  }
}

export async function punchFastApiStaffAttendance(punchData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/staff/attendance/punch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(punchData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Staff attendance punch failed:', err.message);
    throw err;
  }
}

// -------------------------------------------------------------
// Laundry Orders & Service Integration
// -------------------------------------------------------------
export async function getFastApiLaundryRates() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/laundry/rates`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Laundry rates fetch failed:', err.message);
    return [];
  }
}

export async function getFastApiLaundryOrders(status, roomNumber) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('order_status', status);
    if (roomNumber) params.append('room_number', roomNumber);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${FASTAPI_BASE_URL}/api/laundry/orders${qs}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Laundry orders fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiLaundryOrder(orderData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/laundry/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create laundry order failed:', err.message);
    throw err;
  }
}

export async function updateFastApiLaundryStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/laundry/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ order_status: newStatus })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Update laundry status failed:', err.message);
    throw err;
  }
}

// =============================================================
// IDS FortuneNext PMS Client Connectors (67 Modals Backend Support)
// =============================================================

/**
 * 1. Folio Management, Post Charges & Settle
 */
export async function getFastApiRoomFolio(roomNumber, folioNumber = 1) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}?folio_number=${folioNumber}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Get folio for Room ${roomNumber} failed:`, err.message);
    return null;
  }
}

export async function postFastApiFolioCharge(chargeData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/folios/post-charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(chargeData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Post folio charge failed:', err.message);
    throw err;
  }
}

export async function settleFastApiRoomFolio(roomNumber, folioNumber = 1, paymentMode = 'Cash', managerPin = '4321') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}/settle?folio_number=${folioNumber}&payment_mode=${encodeURIComponent(paymentMode)}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Settle folio for Room ${roomNumber} failed:`, err.message);
    throw err;
  }
}

export async function reinstateFastApiRoomFolio(roomNumber, folioNumber = 1, managerPin = '4321') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}/reinstate?folio_number=${folioNumber}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Reinstate folio for Room ${roomNumber} failed:`, err.message);
    throw err;
  }
}

/**
 * 2. Advance Deposits
 */
export async function getFastApiAdvanceDeposits(roomNumber = null, status = null) {
  try {
    let url = `${FASTAPI_BASE_URL}/api/pms/deposits`;
    const params = [];
    if (roomNumber) params.push(`room_number=${encodeURIComponent(roomNumber)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get advance deposits failed:', err.message);
    return [];
  }
}

export async function createFastApiAdvanceDeposit(depositData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/deposits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(depositData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create advance deposit failed:', err.message);
    throw err;
  }
}

export async function deleteFastApiAdvanceDeposit(receiptNumber, reason = 'Cancellation') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/deposits/${encodeURIComponent(receiptNumber)}?reason=${encodeURIComponent(reason)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Delete deposit ${receiptNumber} failed:`, err.message);
    throw err;
  }
}

/**
 * 3. Front Office Paid-Outs
 */
export async function getFastApiPaidOuts() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/paid-outs`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get paid outs failed:', err.message);
    return [];
  }
}

export async function createFastApiPaidOut(paidOutData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/paid-outs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(paidOutData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create paid out failed:', err.message);
    throw err;
  }
}

/**
 * 4. Foreign Exchange Encashment (Form FLM)
 */
export async function getFastApiForexList() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/forex`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get forex list failed:', err.message);
    return [];
  }
}

export async function createFastApiForex(forexData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/forex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(forexData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create forex encashment failed:', err.message);
    throw err;
  }
}

/**
 * 5. Housekeeping Lost & Found
 */
export async function getFastApiLostAndFound(status = null) {
  try {
    const url = status 
      ? `${FASTAPI_BASE_URL}/api/pms/lost-found?status=${encodeURIComponent(status)}`
      : `${FASTAPI_BASE_URL}/api/pms/lost-found`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get lost & found failed:', err.message);
    return [];
  }
}

export async function createFastApiLostAndFound(itemData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/lost-found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create lost & found item failed:', err.message);
    throw err;
  }
}

export async function claimFastApiLostAndFound(trackingNo, claimant) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/lost-found/${encodeURIComponent(trackingNo)}/claim`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ claimed_by: claimant, claim_date: new Date().toLocaleDateString() })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Claim lost & found item ${trackingNo} failed:`, err.message);
    throw err;
  }
}

/**
 * 6. Front Desk Room Transfers & Stay Amendments
 */
export async function getFastApiRoomTransfers() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/room-transfers`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get room transfers failed:', err.message);
    return [];
  }
}

export async function transferFastApiRoom(transferData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/room-transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(transferData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Transfer room failed:', err.message);
    throw err;
  }
}

export async function amendFastApiStay(amendData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/stay/amend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(amendData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Amend stay failed:', err.message);
    throw err;
  }
}

/**
 * 7. Corporate Contract Rates
 */
export async function getFastApiContractRates() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/contract-rates`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get contract rates failed:', err.message);
    return [];
  }
}

export async function linkFastApiCorporateRate(rateData) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/pms/contract-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(rateData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Link corporate rate failed:', err.message);
    throw err;
  }
}

/**
 * 8. Monthly Audited Sales Reports (June Month & Live Ledgers)
 */
export async function getFastApiHotelSaleMonthlyReport(month = 'JUNE-2026') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/reports/hotel-sale-monthly?month=${encodeURIComponent(month)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Hotel sale report fetch failed:', err.message);
    return null;
  }
}

export async function getFastApiRestaurantSaleMonthlyReport(month = 'JUNE-2026', outlet = 'ALL') {
  try {
    const url = outlet && outlet !== 'ALL'
      ? `${FASTAPI_BASE_URL}/api/reports/restaurant-sale-monthly?month=${encodeURIComponent(month)}&pos_outlet=${encodeURIComponent(outlet)}`
      : `${FASTAPI_BASE_URL}/api/reports/restaurant-sale-monthly?month=${encodeURIComponent(month)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Restaurant sale report fetch failed:', err.message);
    return null;
  }
}

export async function getFastApiRestaurantMgmReport(month = 'JUNE-2026') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/reports/restaurant-mgm-monthly?month=${encodeURIComponent(month)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Restaurant MGM report fetch failed:', err.message);
    return null;
  }
}

export async function postFastApiHotelSaleRecord(record) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/reports/hotel-sale-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        serial_no: Number(record.sNo || record.serial_no || 1),
        date: String(record.date || ''),
        bill_no: String(record.billNo || record.bill_no || ''),
        room_number: String(record.roomNo || record.room_number || ''),
        rent: Number(record.rent || 0),
        cgst: Number(record.cgst || 0),
        sgst: Number(record.sgst || 0),
        misc: Number(record.misc || 0),
        laundry: Number(record.laundry || 0),
        minibar: Number(record.minB || record.minibar || 0),
        room_service: Number(record.rs || record.room_service || 0),
        net_amount: Number(record.netAmt || record.net_amount || 0),
        advance: Number(record.advanc || record.advance || 0),
        discount: Number(record.discount || 0),
        complimentary: Number(record.complt || record.complimentary || 0),
        void_amount: Number(record.void || record.void_amount || 0),
        allowances: Number(record.allowances || 0),
        paid_out: Number(record.paidOut || record.paid_out || 0),
        cash: Number(record.cash || 0),
        btc: Number(record.btc || 0),
        credit_card: Number(record.cc || record.credit_card || 0),
        online: Number(record.online || 0),
        remark: String(record.remark || ''),
        guest_name: String(record.guestName || record.guest_name || ''),
        company: String(record.company || 'FIT'),
        gstin: record.gstin || null,
        month: record.month || 'JUNE-2026'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Post hotel sale record failed:', err.message);
    return null;
  }
}

export async function postFastApiRestaurantSaleRecord(record) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/reports/restaurant-sale-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        running_no: Number(record.no || record.running_no || 1),
        date: String(record.date || ''),
        bill_no: String(record.billNo || record.bill_no || ''),
        amount: Number(record.amount || 0),
        food: Number(record.food || 0),
        beverage: Number(record.beverage || 0),
        cgst: Number(record.cgst || 0),
        sgst: Number(record.sgst || 0),
        discount: Number(record.discount || 0),
        total: Number(record.total || 0),
        pos_outlet: String(record.pos || record.pos_outlet || 'RESTAURANT'),
        table_room: String(record.tableRoom || record.table_room || ''),
        cost_center: String(record.costCenter || record.cost_center || ''),
        auth_officer: String(record.authOfficer || record.auth_officer || ''),
        reason: String(record.reason || ''),
        settlement_mode: String(record.settlementMode || record.settlement_mode || 'Cash'),
        is_management_nc: Boolean(record.is_management_nc || record.pos === 'MANAGEMENT'),
        month: record.month || 'JUNE-2026'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Post restaurant sale record failed:', err.message);
    return null;
  }
}

export async function getFastApiGstr3bStatutorySummary(month = 'JUNE-2026') {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/reports/gstr3b-statutory-summary?month=${encodeURIComponent(month)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GSTR-3B summary fetch failed:', err.message);
    return null;
  }
}

/**
 * Check-out a guest on Railway PostgreSQL and auto-generate HotelSaleRecord
 */
export async function checkOutFastApiGuest(bookingId) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/bookings/${bookingId}/check-out`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Check-out guest failed:', err.message);
    return null;
  }
}

/**
 * Store Inventory & Procurement APIs
 */
export async function getFastApiStorePurchases() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory/purchases`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get store purchases failed:', err.message);
    return [];
  }
}

export async function postFastApiStorePurchase(purchase) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(purchase)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Post store purchase failed:', err.message);
    return null;
  }
}

export async function getFastApiKitchenRequisitions() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory/requisitions`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get kitchen requisitions failed:', err.message);
    return [];
  }
}

export async function postFastApiKitchenRequisition(req) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Post kitchen requisition failed:', err.message);
    return null;
  }
}

export async function getFastApiVendorPayables() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/inventory/vendors`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Get vendor payables failed:', err.message);
    return [];
  }
}

/**
 * Query current Hotel Wi-Fi IP restriction status
 */
export async function getHotelIpStatus() {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/system/ip-status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { client_ip: 'unknown', is_hotel_wifi: true, error: err.message };
  }
}

/**
 * Register or update Hotel Elite Inn Wi-Fi static IP
 */
export async function setHotelStaticIp(managerPin = '4321', targetIp = null, enableRestriction = true) {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/system/set-hotel-ip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        manager_pin: managerPin,
        ip: targetIp,
        enable_restriction: enableRestriction
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}




