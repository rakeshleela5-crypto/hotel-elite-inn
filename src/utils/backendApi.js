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
 * Secure Fetch Connector
 * Automatically attaches Authorization: Bearer <token> from active staff shift sessions.
 */
async function secureFetch(url, options = {}) {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('hei_staff_token_steward') ||
            localStorage.getItem('hei_staff_token_housekeeping') ||
            localStorage.getItem('hei_staff_token_kds') ||
            localStorage.getItem('hei_staff_token_frontdesk') ||
            localStorage.getItem('hei_staff_token_manager');
  }

  const headers = { ...(options.headers || {}) };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}


/**
 * Check backend API health and connectivity
 */
export async function checkFastApiHealth() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/health`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/stats/dashboard`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/rooms`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/rooms/${roomId}/status`, {
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
 * Create a new guest reservation or walk-in booking on Railway PostgreSQL
 */
export async function createFastApiBooking(bookingData) {
  try {
    const roomNumber = String(bookingData.roomNumber || bookingData.room_number || '201');
    let roomId = Number(bookingData.roomId || bookingData.room_id);
    if (!roomId || isNaN(roomId)) {
      const num = parseInt(roomNumber, 10);
      if (num >= 201 && num <= 209) roomId = num - 191; // 201 -> 10
      else if (num >= 301 && num <= 309) roomId = num - 282; // 301 -> 19
      else if (num >= 101 && num <= 109) roomId = num - 100; // 101 -> 1
      else roomId = 10;
    }

    const payload = {
      guest_name: bookingData.guestName || bookingData.guest_name || 'Guest',
      guest_phone: bookingData.guestPhone || bookingData.phone || bookingData.guest_phone || '9999999999',
      guest_email: bookingData.guestEmail || bookingData.email || bookingData.guest_email || null,
      guest_id_type: bookingData.idProofType || bookingData.id_type || 'Aadhaar Card',
      guest_id_number: bookingData.idProofNumber || bookingData.idProofMasked || bookingData.guest_id_number || null,
      room_id: roomId,
      check_in_date: bookingData.checkInDate ? (bookingData.checkInDate.includes('T') ? bookingData.checkInDate : `${bookingData.checkInDate}T12:00:00`) : new Date().toISOString(),
      check_out_date: bookingData.checkOutDate ? (bookingData.checkOutDate.includes('T') ? bookingData.checkOutDate : `${bookingData.checkOutDate}T11:00:00`) : new Date(Date.now() + 86400000).toISOString(),
      advance_paid: Number(bookingData.advanceDeposit || bookingData.advance_paid || 0),
      corporate_account_id: bookingData.corporateAccountId || null,
      grc_number: bookingData.grcNo || bookingData.grc_number || null,
      num_pax: Number(bookingData.pax || bookingData.num_pax || 1),
      second_pax_name: bookingData.secondPaxName || null,
      second_pax_phone: bookingData.secondPaxPhone || null,
      second_pax_id: bookingData.secondPaxId || null,
      plan_code: bookingData.mealPlan || bookingData.plan_code || 'EP',
      billing_mode: bookingData.paymentMode || bookingData.billing_mode || 'Cash',
      vehicle_no: bookingData.vehicleNo || null,
      purpose_of_visit: bookingData.purposeOfVisit || 'Business Visit',
      nationality: bookingData.nationality || 'India',
      arrival_from: bookingData.arrivalFrom || bookingData.arrival_from || null,
      proceeding_to: bookingData.proceedingTo || bookingData.proceeding_to || null,
      identification_no: bookingData.identificationNo || bookingData.identification_no || null,
      company_name: bookingData.companyName || bookingData.company_name || null,
      rate_authorized_by: bookingData.rateAuthorizedBy || bookingData.rate_authorized_by || 'MANAGER',
      special_instructions: bookingData.specialInstructions || bookingData.special_instructions || null,
      guest_status: bookingData.guestStatus || bookingData.guest_status || 'WLK',
      rate_amount: Number(bookingData.rateAmount || bookingData.rate_amount || 0),
      rate_option: bookingData.rateOption || bookingData.rate_option || 'DISCOUNT'
    };

    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      // Ensure room status updates to occupied
      updateFastApiRoomStatus(roomId, 'occupied').catch(() => {});
      return data;
    }
    const errText = await res.text().catch(() => '');
    console.warn('[FastAPI] Create booking returned non-200:', res.status, errText);
    return { success: false, status: res.status, error: errText };
  } catch (err) {
    console.warn('[FastAPI] Create booking network error:', err.message);
    return null;
  }
}

/**
 * Fetch all reservations from Railway PostgreSQL
 */
export async function getFastApiBookings(statusFilter = null) {
  try {
    const url = statusFilter
      ? `${FASTAPI_BASE_URL}/api/bookings?status_filter=${encodeURIComponent(statusFilter)}`
      : `${FASTAPI_BASE_URL}/api/bookings`;
    const res = await secureFetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Bookings fetch failed:', err.message);
    return [];
  }
}


/**
 * Fetch all restaurant tables
 */
export async function getFastApiTables() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/tables`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/corporate-accounts`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/housekeeping/defects`, {
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
export async function voidFastApiOrderItem(orderId, itemId, reason, pin = '4321') {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/items/${itemId}/void`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, manager_pin: pin })
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/tables/merge`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/settle`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders`, {
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
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/night-audit/seal`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/night-audit/logs`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/property/info`, {
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
    const res = await secureFetch(url, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/system/sync-master-data`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/thermal-receipt/sample`, {
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
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GST filings fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiGstFiling(filingData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/gst/filings`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/gst/summary/${encodeURIComponent(returnPeriod)}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/staff/roster`, { headers: { 'Accept': 'application/json' } });
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
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Staff attendance fetch failed:', err.message);
    return [];
  }
}

export async function punchFastApiStaffAttendance(punchData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/staff/attendance/punch`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/laundry/rates`, { headers: { 'Accept': 'application/json' } });
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/laundry/orders${qs}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Laundry orders fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiLaundryOrder(orderData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/laundry/orders`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/laundry/orders/${orderId}/status`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}?folio_number=${folioNumber}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/post-charge`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}/settle?folio_number=${folioNumber}&payment_mode=${encodeURIComponent(paymentMode)}&manager_pin=${managerPin}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/${encodeURIComponent(roomNumber)}/reinstate?folio_number=${folioNumber}&manager_pin=${managerPin}`, {
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

    const res = await secureFetch(url, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/deposits`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/deposits/${encodeURIComponent(receiptNumber)}?reason=${encodeURIComponent(reason)}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/paid-outs`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/paid-outs`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/forex`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/forex`, {
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
    const res = await secureFetch(url, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/lost-found`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/lost-found/${encodeURIComponent(trackingNo)}/claim`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/room-transfers`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/room-transfers`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/stay/amend`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/contract-rates`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/contract-rates`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/hotel-sale-monthly?month=${encodeURIComponent(month)}`, {
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
    const res = await secureFetch(url, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/restaurant-mgm-monthly?month=${encodeURIComponent(month)}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/hotel-sale-record`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/restaurant-sale-record`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/gstr3b-statutory-summary?month=${encodeURIComponent(month)}`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/bookings/${bookingId}/check-out`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/purchases`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/purchases`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/requisitions`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/requisitions`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/vendors`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/system/ip-status`, {
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
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/system/set-hotel-ip`, {
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

// =============================================================
// Category 1: Front Office PMS & Guest Management Connectors
// =============================================================
export async function getFastApiPoliceManifest(statusFilter = null) {
  try {
    const url = statusFilter
      ? `${FASTAPI_BASE_URL}/api/pms/police-manifest?status_filter=${encodeURIComponent(statusFilter)}`
      : `${FASTAPI_BASE_URL}/api/pms/police-manifest`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Police manifest fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiPoliceManifest(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/police-manifest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Police manifest post failed:', err.message);
    return null;
  }
}

export async function getFastApiForeignerFormC() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/foreigner-form-c`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Form C fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiForeignerFormC(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/foreigner-form-c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Form C post failed:', err.message);
    return null;
  }
}

export async function uploadFastApiGuestKyc(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/guest-kyc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Guest KYC upload failed:', err.message);
    return null;
  }
}

export async function getFastApiCashierShifts(accountingDate = null) {
  try {
    const url = accountingDate
      ? `${FASTAPI_BASE_URL}/api/pms/cashier/shifts?accounting_date=${encodeURIComponent(accountingDate)}`
      : `${FASTAPI_BASE_URL}/api/pms/cashier/shifts`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Cashier shifts fetch failed:', err.message);
    return [];
  }
}

export async function openFastApiCashierShift(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/cashier/shifts/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Open cashier shift failed:', err.message);
    return null;
  }
}

export async function closeFastApiCashierShift(shiftId, payload, accountingDate = null) {
  try {
    const url = accountingDate
      ? `${FASTAPI_BASE_URL}/api/pms/cashier/shifts/${encodeURIComponent(shiftId)}/close?accounting_date=${encodeURIComponent(accountingDate)}`
      : `${FASTAPI_BASE_URL}/api/pms/cashier/shifts/${encodeURIComponent(shiftId)}/close`;
    const res = await secureFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Close cashier shift failed:', err.message);
    return null;
  }
}

export async function getFastApiMorningBriefing(accountingDate = null) {
  try {
    const url = accountingDate
      ? `${FASTAPI_BASE_URL}/api/pms/cashier/morning-briefing?accounting_date=${encodeURIComponent(accountingDate)}`
      : `${FASTAPI_BASE_URL}/api/pms/cashier/morning-briefing`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Morning briefing fetch failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 2: Folio Accounting & Adjustments Connectors
// =============================================================
export async function transferFastApiFolioCharge(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Folio transfer failed:', err.message);
    return null;
  }
}

export async function createFastApiBillAllowance(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/bill-allowance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Bill allowance post failed:', err.message);
    return null;
  }
}

export async function createFastApiCorporateSplitBilling(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/split-billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Corporate split billing post failed:', err.message);
    return null;
  }
}

export async function toggleFastApiStopPosting(roomNumber, stopPosting = true, managerPin = '4321') {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/folios/stop-posting?room_number=${encodeURIComponent(roomNumber)}&stop_posting=${stopPosting}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Stop posting toggle failed:', err.message);
    return null;
  }
}

export async function getFastApiBlockedRooms() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/rooms/blocked`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Blocked rooms fetch failed:', err.message);
    return [];
  }
}

export async function blockFastApiRoom(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/rooms/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Room block failed:', err.message);
    return null;
  }
}

export async function bulkClearFastApiRooms(roomNumbers, targetStatus = 'clean', managerPin = '4321') {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/rooms/bulk-clear?target_status=${encodeURIComponent(targetStatus)}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(roomNumbers)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Bulk clear rooms failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 3: POS, F&B & Banquet Connectors
// =============================================================
export async function settleFastApiSplitTender(orderId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/split-tender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Split tender post failed:', err.message);
    return null;
  }
}

export async function applyFastApiPosDiscount(orderId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] POS discount post failed:', err.message);
    return null;
  }
}

export async function reclassifyFastApiTender(orderId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/orders/${orderId}/reclassify-tender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Tender reclassify failed:', err.message);
    return null;
  }
}

export async function getFastApiBanquetEvents() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/banquets/events`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Banquet events fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiBanquetEvent(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/banquets/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Banquet event create failed:', err.message);
    return null;
  }
}

export async function settleFastApiBanquetEvent(eventId, paymentMode = 'Card', managerPin = '4321') {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/banquets/events/${encodeURIComponent(eventId)}/settle?payment_mode=${encodeURIComponent(paymentMode)}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Banquet settle failed:', err.message);
    return null;
  }
}

export async function getFastApiServers() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/servers`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Servers fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiServer(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create server failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 4: Store, Materials & Inventory Connectors
// =============================================================
export async function getFastApiPurchaseOrders() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/purchase-orders`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Purchase orders fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiPurchaseOrder(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Purchase order post failed:', err.message);
    return null;
  }
}

export async function getFastApiGoodsReceiptNotes() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/grn`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GRN fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiGoodsReceiptNote(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/grn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GRN post failed:', err.message);
    return null;
  }
}

export async function getFastApiStoreIssueVouchers() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/store-issues`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Store issues fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiStoreIssueVoucher(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/store-issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Store issue voucher post failed:', err.message);
    return null;
  }
}

export async function getFastApiStockLedger() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/stock-ledger`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Stock ledger fetch failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 5: Housekeeping, Linen & Asset Connectors
// =============================================================
export async function getFastApiLinenInventory() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/hk/linen-inventory`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Linen inventory fetch failed:', err.message);
    return [];
  }
}

export async function createOrUpdateFastApiLinenItem(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/hk/linen-inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Linen item update failed:', err.message);
    return null;
  }
}

export const createFastApiLinenItem = createOrUpdateFastApiLinenItem;

export async function getFastApiRoomAmenities() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/hk/room-amenities`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Room amenities fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiHousekeepingInspection(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/hk/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Housekeeping inspection post failed:', err.message);
    return null;
  }
}

export async function getFastApiHousekeepingInspections() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/hk/inspections`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Housekeeping inspections fetch failed:', err.message);
    return [];
  }
}

// =============================================================
// Category 6: Night Audit Engine Connectors
// =============================================================
export async function autoPostFastApiRoomRent(auditDate = null, managerPin = '4321') {
  try {
    const url = auditDate
      ? `${FASTAPI_BASE_URL}/api/night-audit/auto-post-room-rent?audit_date=${encodeURIComponent(auditDate)}&manager_pin=${managerPin}`
      : `${FASTAPI_BASE_URL}/api/night-audit/auto-post-room-rent?manager_pin=${managerPin}`;
    const res = await secureFetch(url, { method: 'POST', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Auto-post room rent failed:', err.message);
    return null;
  }
}

export async function getFastApiNightAuditTrialBalance(date = null) {
  try {
    const url = date
      ? `${FASTAPI_BASE_URL}/api/night-audit/trial-balance?date=${encodeURIComponent(date)}`
      : `${FASTAPI_BASE_URL}/api/night-audit/trial-balance`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Trial balance fetch failed:', err.message);
    return null;
  }
}

export async function rolloverFastApiNightAudit(previousDate, newDate, managerPin = '4321') {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/night-audit/rollover?previous_date=${encodeURIComponent(previousDate)}&new_date=${encodeURIComponent(newDate)}&manager_pin=${managerPin}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Rollover night audit failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 7: Corporate BTC, Aging & Statutory Tax Connectors
// =============================================================
export async function getFastApiCorporateDebtorsAging() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/corporate/debtors-aging`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Corporate debtors aging fetch failed:', err.message);
    return [];
  }
}

export async function settleFastApiCorporateInvoice(companyName, amountPaid, paymentRef = 'NEFT', managerPin = '4321') {
  try {
    const url = `${FASTAPI_BASE_URL}/api/corporate/settle-invoice?company_name=${encodeURIComponent(companyName)}&amount_paid=${amountPaid}&payment_ref=${encodeURIComponent(paymentRef)}&manager_pin=${managerPin}`;
    const res = await secureFetch(url, { method: 'POST', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Settle corporate invoice failed:', err.message);
    return null;
  }
}

export async function getFastApiTdsTcsSummary() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/tds-tcs-summary`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] TDS summary fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiTdsTcsRecord(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/tds-tcs-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] TDS record post failed:', err.message);
    return null;
  }
}

export async function getFastApiBankReconciliations() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/bank-reconciliation`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Bank reconciliations fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiBankReconciliation(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/reports/bank-reconciliation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Bank reconciliation post failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 8: Table Master, Menu Master, Transit & Promotions
// =============================================================
export async function createFastApiTable(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create table failed:', err.message);
    return null;
  }
}

export async function updateFastApiTable(tableId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Update table failed:', err.message);
    return null;
  }
}

export async function deleteFastApiTable(tableId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/tables/${tableId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Delete table failed:', err.message);
    return null;
  }
}

export async function createFastApiMenuItem(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/restaurant/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create menu item failed:', err.message);
    return null;
  }
}

export async function updateFastApiMenuItem(itemId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/restaurant/menu/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Update menu item failed:', err.message);
    return null;
  }
}

export async function deleteFastApiMenuItem(itemId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/restaurant/menu/${itemId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Delete menu item failed:', err.message);
    return null;
  }
}

export async function getFastApiTransitSlots() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/transit-slots`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Transit slots fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiTransitSlot(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/transit-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create transit slot failed:', err.message);
    return null;
  }
}

export async function checkoutFastApiTransitSlot(slotId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/transit-slots/${slotId}/checkout`, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Checkout transit slot failed:', err.message);
    return null;
  }
}

export async function getFastApiPromotions() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/promotions`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Promotions fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiPromotion(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create promotion failed:', err.message);
    return null;
  }
}

export async function deleteFastApiPromotion(promoId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pos/promotions/${promoId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Delete promotion failed:', err.message);
    return null;
  }
}

export async function createFastApiCorporateAccount(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/corporate-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create corporate account failed:', err.message);
    return null;
  }
}

export async function updateFastApiCorporateAccount(companyId, payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/corporate-accounts/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Update corporate account failed:', err.message);
    return null;
  }
}

// =============================================================
// Category 9: Business Sources, Market Segments, Packages & Complaints Connectors
// =============================================================
export async function getFastApiBusinessSources() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/business-sources`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Business sources fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiBusinessSource(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/business-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create business source failed:', err.message);
    return null;
  }
}

export async function getFastApiMarketSegments() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/market-segments`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Market segments fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiMarketSegment(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/market-segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create market segment failed:', err.message);
    return null;
  }
}

export async function getFastApiPackageRates() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/package-rates`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Package rates fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiPackageRate(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/pms/package-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create package rate failed:', err.message);
    return null;
  }
}

export async function getFastApiLaundryRateMaster(serviceType = null) {
  try {
    const url = serviceType 
      ? `${FASTAPI_BASE_URL}/api/laundry/rate-master?service_type=${encodeURIComponent(serviceType)}`
      : `${FASTAPI_BASE_URL}/api/laundry/rate-master`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Laundry rate master fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiLaundryRate(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/laundry/rate-master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create laundry rate failed:', err.message);
    return null;
  }
}

export async function getFastApiGuestComplaints(statusFilter = null) {
  try {
    const url = statusFilter
      ? `${FASTAPI_BASE_URL}/api/guest/complaints?status_filter=${encodeURIComponent(statusFilter)}`
      : `${FASTAPI_BASE_URL}/api/guest/complaints`;
    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Guest complaints fetch failed:', err.message);
    return [];
  }
}

export async function createFastApiGuestComplaint(payload) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/guest/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create guest complaint failed:', err.message);
    return null;
  }
}

export async function resolveFastApiGuestComplaint(complaintId, attendedBy = 'Duty Manager', actionTaken = 'Issue resolved') {
  try {
    const url = `${FASTAPI_BASE_URL}/api/guest/complaints/${encodeURIComponent(complaintId)}/resolve?attended_by=${encodeURIComponent(attendedBy)}&action_taken=${encodeURIComponent(actionTaken)}`;
    const res = await secureFetch(url, { method: 'PATCH', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Resolve complaint failed:', err.message);
    return null;
  }
}

/**
 * Operations History with Role-Based Slicing & Historical Date Range Filtering
 * Range: 'today', '7d', '15d', '30d', '1y', 'custom'
 * Role: 'staff' (up to 15 days, no sensitive financials) vs 'owner' (up to 1 year + full financials)
 */
export async function getFastApiOperationsHistory(rangeFilter = 'today', role = 'staff', startDate = null, endDate = null) {
  try {
    let url = `${FASTAPI_BASE_URL}/api/operations/history?range_filter=${encodeURIComponent(rangeFilter)}&role=${encodeURIComponent(role)}`;
    if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;

    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Operations history fetch failed:', err.message);
    return null;
  }
}

/**
 * Cloudflare R2 Automated Backup Health & Status
 */
export async function getFastApiBackupStatus() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/admin/backup/status`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Backup status fetch failed:', err.message);
    return {
      provider: 'Cloudflare R2',
      is_configured: false,
      schedule: 'Nightly at 02:00 AM UTC',
      recent_backups: []
    };
  }
}

/**
 * Trigger Live Cloud-to-Cloud Database Backup to Cloudflare R2
 */
export async function triggerFastApiCloudflareR2Backup() {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/admin/backup/cloud-r2`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Cloudflare R2 backup trigger failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Owner Self-Service Export ("Download Today's Data Archive")
 * Downloads a complete JSON snapshot to the local client PC for immediate peace of mind
 */
export async function downloadFastApiDailyArchive(archiveDate = null) {
  try {
    const url = archiveDate
      ? `${FASTAPI_BASE_URL}/api/admin/export/daily-archive?archive_date=${encodeURIComponent(archiveDate)}`
      : `${FASTAPI_BASE_URL}/api/admin/export/daily-archive`;

    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Trigger browser file download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `hotel_elite_inn_archive_${data.export_date || 'latest'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    return { success: true, count: Object.keys(data).length };
  } catch (err) {
    console.warn('[FastAPI] Daily archive download failed:', err.message);
    return { success: false, error: err.message };
  }
}


// =============================================================
// Category 11: Missing Endpoint Connectors (Audit Fix Oct-2026)
// =============================================================

/**
 * Adjust inventory stock level for an item (POST /api/inventory/{item_id}/adjust)
 */
export async function adjustFastApiInventoryItem(itemId, adjustmentData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/${itemId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(adjustmentData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Inventory adjustment failed:', err.message);
    return null;
  }
}

/**
 * Record a corporate BTC payment (POST /api/corporate-accounts/{company_id}/payment)
 */
export async function recordFastApiCorporatePayment(companyId, paymentData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/corporate-accounts/${companyId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Corporate payment recording failed:', err.message);
    return null;
  }
}

/**
 * Resolve a room defect / maintenance issue (PATCH /api/housekeeping/defects/{defect_id}/resolve)
 */
export async function resolveFastApiDefect(defectId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/housekeeping/defects/${defectId}/resolve`, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Defect resolution failed:', err.message);
    return null;
  }
}

/**
 * Update GST filing status (PUT /api/gst/filings/{filing_id}/status)
 */
export async function updateFastApiGstFilingStatus(filingId, newStatus) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/gst/filings/${filingId}/status?new_status=${encodeURIComponent(newStatus)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ filing_status: newStatus, new_status: newStatus })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] GST filing status update failed:', err.message);
    return null;
  }
}

/**
 * Check-in a reserved guest on Railway PostgreSQL (POST /api/bookings/{booking_id}/check-in)
 */
export async function checkInFastApiGuest(bookingId) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/bookings/${bookingId}/check-in`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastAPI] Check-in guest #${bookingId} failed:`, err.message);
    return null;
  }
}

/**
 * Create a new physical hotel room on PostgreSQL (POST /api/rooms)
 */
export async function createFastApiRoom(roomData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(roomData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create room failed:', err.message);
    return null;
  }
}

/**
 * Create or update vendor payable ledger record (POST /api/inventory/vendors)
 */
export async function createFastApiVendorPayable(vendorData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/inventory/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Create vendor record failed:', err.message);
    return null;
  }
}

/**
 * Staff authentication login (POST /api/auth/staff-login)
 */
export async function staffLoginFastApi(loginData) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/auth/staff-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(loginData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Staff login failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Verify staff JWT session token (GET /api/auth/verify-session)
 */
export async function verifyFastApiSession(token) {
  try {
    const res = await secureFetch(`${FASTAPI_BASE_URL}/api/auth/verify-session`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Session verification failed:', err.message);
    return { valid: false, error: err.message };
  }
}

/**
 * Operations History V1 endpoint connector (GET /api/v1/operations/history)
 */
export async function getFastApiOperationsHistoryV1(rangeFilter = 'today', role = 'staff', startDate = null, endDate = null) {
  try {
    let url = `${FASTAPI_BASE_URL}/api/v1/operations/history?range_filter=${encodeURIComponent(rangeFilter)}&role=${encodeURIComponent(role)}`;
    if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;

    const res = await secureFetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] Operations history V1 fetch failed:', err.message);
    return null;
  }
}

export const fetchFastApiOperationsHistoryV1 = getFastApiOperationsHistoryV1;
