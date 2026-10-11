// IDS Fortune NEXT Unified Enterprise Transaction & Audit Synchronizer
// Connects Front Desk PMS, F&B POS, and Accounting to all 67 Win32 Modals
import { HOTEL_CONFIG } from '../data/hotelData';
import { HOTEL_JUNE_SALES, HOTEL_JUNE_SUMMARY } from '../data/hotelSaleJuneReportData';
import { RESTAURANT_JUNE_SALES, RESTAURANT_JUNE_MGM_SALES, RESTAURANT_JUNE_SUMMARY } from '../data/restaurantSaleJuneReportData';
import { 
  INITIAL_SETTLED_BILLS, 
  INITIAL_ACCOUNTING_DATE,
  getFormattedPmsDate,
  getFormattedPmsMonthYear 
} from '../data/idsPmsStore';
import { OCTOBER_2026_SEEDED_PMS_DAILY_RECORDS } from './pmsMasterAuditLedger';
import { postFastApiHotelSaleRecord, postFastApiRestaurantSaleRecord } from './backendApi';

const STORAGE_KEY_HOTEL_LIVE = 'ids_unified_hotel_live_sales_v1';
const STORAGE_KEY_REST_LIVE = 'ids_unified_restaurant_live_sales_v1';
const STORAGE_KEY_NC_LIVE = 'ids_unified_nc_live_sales_v1';

// Seeded October 2026 Live Front Office Transactions (Day-to-Date)
const SEEDED_OCT_HOTEL_SALES = [
  {
    sNo: 1,
    date: '01/10/2026',
    billNo: '501',
    roomNo: '106',
    rent: 1750.00,
    cgst: 105.00,
    sgst: 105.00,
    misc: 0.00,
    laundry: 80.00,
    minB: 0.00,
    rs: 320.00,
    netAmt: 2360.00,
    advanc: 1000.00,
    discount: 0.00,
    complt: 0.00,
    void: 0.00,
    allowances: 0.00,
    paidOut: 0.00,
    cash: 0.00,
    btc: 0.00,
    cc: 1360.00,
    online: 0.00,
    remark: 'DLX ROOM - SINGLE OCCUPANCY',
    guestName: 'MR ARVIND MEHTA',
    company: 'L&T Construction',
    gstin: '21AAACL0123P1ZQ'
  },
  {
    sNo: 2,
    date: '02/10/2026',
    billNo: '502',
    roomNo: '201',
    rent: 2050.00,
    cgst: 123.00,
    sgst: 123.00,
    misc: 0.00,
    laundry: 0.00,
    minB: 0.00,
    rs: 420.00,
    netAmt: 2716.00,
    advanc: 0.00,
    discount: 0.00,
    complt: 0.00,
    void: 0.00,
    allowances: 0.00,
    paidOut: 0.00,
    cash: 2716.00,
    btc: 0.00,
    cc: 0.00,
    online: 0.00,
    remark: 'EXE ROOM - CORPORATE RATE',
    guestName: 'MR VIKRAM SINGHANIA',
    company: 'JK Paper Mills Ltd',
    gstin: '21AAACJ0118P1ZX'
  },
  {
    sNo: 3,
    date: '03/10/2026',
    billNo: '503',
    roomNo: '109',
    rent: 3250.00,
    cgst: 195.00,
    sgst: 195.00,
    misc: 0.00,
    laundry: 120.00,
    minB: 0.00,
    rs: 650.00,
    netAmt: 4410.00,
    advanc: 2000.00,
    discount: 0.00,
    complt: 0.00,
    void: 0.00,
    allowances: 0.00,
    paidOut: 0.00,
    cash: 0.00,
    btc: 0.00,
    cc: 0.00,
    online: 2410.00,
    remark: 'SUITE - VIP GUEST CONSULTANT',
    guestName: 'DR S. N. MOHANTY',
    company: 'AIIMS Healthcare Consultant',
    gstin: '21AAAHM9901M1Z1'
  },
  {
    sNo: 4,
    date: '04/10/2026',
    billNo: '504',
    roomNo: '203',
    rent: 2050.00,
    cgst: 123.00,
    sgst: 123.00,
    misc: 0.00,
    laundry: 0.00,
    minB: 0.00,
    rs: 280.00,
    netAmt: 2576.00,
    advanc: 0.00,
    discount: 0.00,
    complt: 0.00,
    void: 0.00,
    allowances: 0.00,
    paidOut: 0.00,
    cash: 0.00,
    btc: 2576.00,
    cc: 0.00,
    online: 0.00,
    remark: 'BILL TO COMPANY - 30 DAYS CREDIT',
    guestName: 'MR VIKRAM PATEL',
    company: 'Utkal Alumina International Ltd',
    gstin: '21AAACU4921K1ZP'
  }
];

// Seeded October 2026 Live Restaurant Orders (Day-to-Date)
const SEEDED_OCT_REST_SALES = [
  {
    no: 1,
    date: '01/10/2026',
    billNo: 'RES-OCT-001',
    amount: 580.00,
    food: 520.00,
    beverage: 60.00,
    cgst: 14.50,
    sgst: 14.50,
    discount: 0.00,
    total: 609.00,
    pos: 'RESTAURANT',
    tableRoom: 'T-04',
    settlementMode: 'Cash'
  },
  {
    no: 2,
    date: '01/10/2026',
    billNo: 'RES-OCT-002',
    amount: 320.00,
    food: 300.00,
    beverage: 20.00,
    cgst: 8.00,
    sgst: 8.00,
    discount: 0.00,
    total: 336.00,
    pos: 'ROOM SERVICE',
    tableRoom: 'R-106',
    settlementMode: 'Room Folio'
  },
  {
    no: 3,
    date: '02/10/2026',
    billNo: 'RES-OCT-003',
    amount: 850.00,
    food: 750.00,
    beverage: 100.00,
    cgst: 21.25,
    sgst: 21.25,
    discount: 0.00,
    total: 892.50,
    pos: 'RESTAURANT',
    tableRoom: 'T-08',
    settlementMode: 'Credit Card'
  },
  {
    no: 4,
    date: '02/10/2026',
    billNo: 'RES-OCT-004',
    amount: 420.00,
    food: 380.00,
    beverage: 40.00,
    cgst: 10.50,
    sgst: 10.50,
    discount: 0.00,
    total: 441.00,
    pos: 'ROOM SERVICE',
    tableRoom: 'R-201',
    settlementMode: 'Room Folio'
  },
  {
    no: 5,
    date: '03/10/2026',
    billNo: 'RES-OCT-005',
    amount: 650.00,
    food: 600.00,
    beverage: 50.00,
    cgst: 16.25,
    sgst: 16.25,
    discount: 0.00,
    total: 682.50,
    pos: 'ROOM SERVICE',
    tableRoom: 'R-109',
    settlementMode: 'Room Folio'
  },
  {
    no: 6,
    date: '04/10/2026',
    billNo: 'RES-OCT-006',
    amount: 480.00,
    food: 430.00,
    beverage: 50.00,
    cgst: 12.00,
    sgst: 12.00,
    discount: 0.00,
    total: 504.00,
    pos: 'TAKE AWAY',
    tableRoom: 'COUNTER-1',
    settlementMode: 'UPI / Online'
  }
];

// Seeded October 2026 Live NC Dining Orders
const SEEDED_OCT_NC_SALES = [
  {
    no: 1,
    date: '01/10/2026',
    billNo: 'NC-OCT-001',
    amount: 350.00,
    food: 320.00,
    beverage: 30.00,
    cgst: 0.00,
    sgst: 0.00,
    discount: 0.00,
    total: 0.00,
    pos: 'MANAGEMENT',
    tableRoom: 'VIP-SALON',
    costCenter: 'General Manager Courtesy',
    authOfficer: 'General Manager',
    reason: 'VIP Client Courtesy - Vedanta Industrial Team'
  },
  {
    no: 2,
    date: '03/10/2026',
    billNo: 'NC-OCT-002',
    amount: 180.00,
    food: 160.00,
    beverage: 20.00,
    cgst: 0.00,
    sgst: 0.00,
    discount: 0.00,
    total: 0.00,
    pos: 'MANAGEMENT',
    tableRoom: 'KITCHEN',
    costCenter: 'Food Tasting & Quality Control',
    authOfficer: 'Executive Chef',
    reason: 'Daily Buffet Standard Tasting'
  }
];

// Local Storage Helpers
function getStoredItems(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`[SyncBridge] Failed to read ${key}:`, err);
    return fallback;
  }
}

function saveStoredItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn(`[SyncBridge] Failed to save ${key}:`, err);
  }
}

// Global Event Dispatcher for cross-modal reactivity
function notifySyncListeners(eventType, data) {
  if (typeof window !== 'undefined') {
    const evt = new CustomEvent('ids-sync-update', {
      detail: { type: eventType, data, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(evt);
  }
}

/**
 * 1. Record a Live Hotel Room Sale (From Check-Out / Night Audit / Front Desk Modals)
 */
export function recordLiveHotelSale(sale) {
  const current = getStoredItems(STORAGE_KEY_HOTEL_LIVE, []);
  const nextNo = (HOTEL_JUNE_SALES.length || 0) + current.length + 1;
  const newRecord = {
    sNo: nextNo,
    date: sale.date || getFormattedPmsDate(),
    billNo: String(sale.billNo || `B-${Date.now().toString().slice(-4)}`),
    roomNo: String(sale.roomNo || '101'),
    rent: Number(sale.rent || 0),
    cgst: Number(sale.cgst || (sale.rent ? sale.rent * 0.06 : 0)),
    sgst: Number(sale.sgst || (sale.rent ? sale.rent * 0.06 : 0)),
    misc: Number(sale.misc || 0),
    laundry: Number(sale.laundry || 0),
    minB: Number(sale.minB || 0),
    rs: Number(sale.rs || 0),
    netAmt: Number(sale.netAmt || 0),
    advanc: Number(sale.advanc || 0),
    discount: Number(sale.discount || 0),
    complt: Number(sale.complt || 0),
    void: Number(sale.void || 0),
    allowances: Number(sale.allowances || 0),
    paidOut: Number(sale.paidOut || 0),
    cash: Number(sale.cash || 0),
    btc: Number(sale.btc || 0),
    cc: Number(sale.cc || 0),
    online: Number(sale.online || 0),
    remark: sale.remark || 'LIVE FRONT OFFICE CHECKOUT',
    guestName: sale.guestName || 'WALK-IN GUEST',
    company: sale.company || '',
    gstin: sale.gstin || ''
  };

  const updated = [newRecord, ...current];
  saveStoredItems(STORAGE_KEY_HOTEL_LIVE, updated);
  notifySyncListeners('HOTEL_SALE_RECORDED', newRecord);
  postFastApiHotelSaleRecord(newRecord).catch(() => null);
  return newRecord;
}

/**
 * 2. Record a Live Restaurant POS Sale (From Touch POS / Order Entry / Bill Settlement)
 */
export function recordLiveRestaurantSale(posOrder) {
  const current = getStoredItems(STORAGE_KEY_REST_LIVE, []);
  const nextNo = (RESTAURANT_JUNE_SALES.length || 0) + current.length + 1;
  const taxable = Number(posOrder.taxable || posOrder.amount || 0);
  const cgst = Number(posOrder.cgst !== undefined ? posOrder.cgst : (taxable * 0.025).toFixed(2));
  const sgst = Number(posOrder.sgst !== undefined ? posOrder.sgst : (taxable * 0.025).toFixed(2));
  const total = Number(posOrder.total || (taxable + cgst + sgst).toFixed(2));

  const newRecord = {
    no: nextNo,
    date: posOrder.date || getFormattedPmsDate(),
    billNo: String(posOrder.billNo || `RES-${Date.now().toString().slice(-4)}`),
    amount: taxable,
    food: Number(posOrder.food || taxable),
    beverage: Number(posOrder.beverage || 0),
    cgst,
    sgst,
    discount: Number(posOrder.discount || 0),
    discountPercent: Number(posOrder.discountPercent || 0),
    discountReason: posOrder.discountReason || '',
    discountAuthBy: posOrder.discountAuthBy || '',
    total,
    pos: posOrder.pos || 'RESTAURANT',
    tableRoom: String(posOrder.tableRoom || posOrder.tableNo || 'T-01'),
    settlementMode: posOrder.settlementMode || posOrder.payMode || 'Cash'
  };

  const updated = [newRecord, ...current];
  saveStoredItems(STORAGE_KEY_REST_LIVE, updated);
  notifySyncListeners('REST_SALE_RECORDED', newRecord);
  postFastApiRestaurantSaleRecord(newRecord).catch(() => null);

  // If charged to Room Folio, automatically update guest folio room service column!
  if (newRecord.settlementMode.toLowerCase().includes('room folio') || newRecord.pos === 'ROOM SERVICE') {
    recordLiveHotelSale({
      billNo: `RS-${newRecord.billNo}`,
      roomNo: newRecord.tableRoom.replace(/^R-?/i, ''),
      rent: 0,
      cgst: newRecord.cgst,
      sgst: newRecord.sgst,
      rs: newRecord.amount,
      netAmt: newRecord.total,
      remark: `IN-ROOM DINING (KOT ${newRecord.billNo})`,
      guestName: 'IN-HOUSE GUEST'
    });
  }

  return newRecord;
}

/**
 * 3. Record a Live NC / Management Dining Voucher
 */
export function recordLiveNcDining(ncRecord) {
  const current = getStoredItems(STORAGE_KEY_NC_LIVE, []);
  const nextNo = (RESTAURANT_JUNE_MGM_SALES.length || 0) + current.length + 1;
  const amount = Number(ncRecord.amount || 0);

  const newRecord = {
    no: nextNo,
    date: ncRecord.date || getFormattedPmsDate(),
    billNo: String(ncRecord.billNo || `NC-${Date.now().toString().slice(-4)}`),
    amount,
    food: Number(ncRecord.food || amount),
    beverage: Number(ncRecord.beverage || 0),
    cgst: 0.00,
    sgst: 0.00,
    discount: 0.00,
    total: 0.00,
    pos: 'MANAGEMENT',
    tableRoom: String(ncRecord.tableRoom || 'MGMT'),
    costCenter: ncRecord.costCenter || 'Complimentary Operations',
    authOfficer: ncRecord.authOfficer || 'MANAGER',
    reason: ncRecord.reason || 'Management Dining Authorization'
  };

  const updated = [newRecord, ...current];
  saveStoredItems(STORAGE_KEY_NC_LIVE, updated);
  notifySyncListeners('NC_DINING_RECORDED', newRecord);
  postFastApiRestaurantSaleRecord({ ...newRecord, is_management_nc: true }).catch(() => null);
  return newRecord;
}

/**
 * 4. Get Available Periods for Multi-Period Synchronization
 */
export function getAvailableSyncMonths() {
  return [
    { id: 'JUNE-2026', label: 'JUNE 2026 (Audited Client Benchmark — 223 Rooms / 1,320 F&B)', badge: 'AUDITED EXCEL' },
    { id: 'OCTOBER-2026', label: 'OCTOBER 2026 (Live Operational Audit & Day-to-Date Ledger)', badge: 'LIVE AUDIT' },
    { id: 'CURRENT-PERIOD', label: `CURRENT PERIOD (${INITIAL_ACCOUNTING_DATE} Live Active Transactions)`, badge: 'REAL-TIME' },
    { id: 'ALL-PERIODS', label: 'ALL PERIODS (Consolidated Enterprise Master Register)', badge: 'CONSOLIDATED' }
  ];
}

/**
 * 5. Get Synchronized Hotel Sales (26 Columns) by Selected Period
 */
export function getSynchronizedHotelSales(period = 'JUNE-2026') {
  const liveItems = getStoredItems(STORAGE_KEY_HOTEL_LIVE, []);

  if (period === 'JUNE-2026') {
    return HOTEL_JUNE_SALES;
  }
  if (period === 'OCTOBER-2026') {
    return [...SEEDED_OCT_HOTEL_SALES, ...liveItems];
  }
  if (period === 'CURRENT-PERIOD') {
    // Current period combines live items and initial settled bills from Front Office
    const pmsSettledFormatted = INITIAL_SETTLED_BILLS.map((b, idx) => ({
      sNo: idx + 1,
      date: b.billDate,
      billNo: b.billNo,
      roomNo: b.roomNo,
      rent: b.roomTariff,
      cgst: b.cgst,
      sgst: b.sgst,
      misc: b.travelTotal || 0,
      laundry: 0,
      minB: 0,
      rs: b.fnbTotal || 0,
      netAmt: b.grandTotal,
      advanc: 0,
      discount: b.discount || 0,
      complt: 0,
      void: 0,
      allowances: 0,
      paidOut: 0,
      cash: b.payMode === 'Cash' ? b.grandTotal : 0,
      btc: b.payMode === 'BTC' ? b.grandTotal : 0,
      cc: b.payMode === 'Credit Card' ? b.grandTotal : 0,
      online: b.payMode === 'Online' ? b.grandTotal : 0,
      remark: 'ACTIVE PMS INVOICE',
      guestName: b.guestName,
      company: b.companyName,
      gstin: b.gstin
    }));
    return [...liveItems, ...pmsSettledFormatted];
  }
  if (period === 'ALL-PERIODS') {
    return [...HOTEL_JUNE_SALES, ...SEEDED_OCT_HOTEL_SALES, ...liveItems];
  }
  return HOTEL_JUNE_SALES;
}

/**
 * 6. Get Synchronized Restaurant Sales (12 Columns) by Selected Period
 */
export function getSynchronizedRestaurantSales(period = 'JUNE-2026', outlet = 'ALL') {
  const liveItems = getStoredItems(STORAGE_KEY_REST_LIVE, []);
  let pool = [];

  if (period === 'JUNE-2026') {
    pool = RESTAURANT_JUNE_SALES;
  } else if (period === 'OCTOBER-2026') {
    pool = [...SEEDED_OCT_REST_SALES, ...liveItems];
  } else if (period === 'CURRENT-PERIOD') {
    pool = liveItems.length > 0 ? liveItems : SEEDED_OCT_REST_SALES;
  } else if (period === 'ALL-PERIODS') {
    pool = [...RESTAURANT_JUNE_SALES, ...SEEDED_OCT_REST_SALES, ...liveItems];
  } else {
    pool = RESTAURANT_JUNE_SALES;
  }

  if (outlet === 'ALL') return pool;
  return pool.filter(r => r.pos === outlet);
}

/**
 * 7. Get Synchronized NC Dining Orders by Selected Period
 */
export function getSynchronizedNcDining(period = 'JUNE-2026') {
  const liveItems = getStoredItems(STORAGE_KEY_NC_LIVE, []);

  if (period === 'JUNE-2026') {
    return RESTAURANT_JUNE_MGM_SALES;
  }
  if (period === 'OCTOBER-2026') {
    return [...SEEDED_OCT_NC_SALES, ...liveItems];
  }
  if (period === 'CURRENT-PERIOD') {
    return liveItems.length > 0 ? liveItems : SEEDED_OCT_NC_SALES;
  }
  if (period === 'ALL-PERIODS') {
    return [...RESTAURANT_JUNE_MGM_SALES, ...SEEDED_OCT_NC_SALES, ...liveItems];
  }
  return RESTAURANT_JUNE_MGM_SALES;
}

/**
 * 8. Dynamic GSTR-3B Table 3.1a Statutory Reconciliation Engine
 * Automatically combines Hotel Room Stay (12% GST) + Restaurant F&B (5% GST non-ITC)
 */
export function getSynchronizedGstr3bSummary(period = 'JUNE-2026') {
  const hotelList = getSynchronizedHotelSales(period);
  const restList = getSynchronizedRestaurantSales(period, 'ALL');
  const ncList = getSynchronizedNcDining(period);

  // 12% Hotel Room Stay
  const roomTaxable = hotelList.reduce((acc, r) => acc + Number(r.rent || 0), 0);
  const roomCgst = hotelList.reduce((acc, r) => acc + Number(r.cgst || 0), 0);
  const roomSgst = hotelList.reduce((acc, r) => acc + Number(r.sgst || 0), 0);
  const roomLaundry = hotelList.reduce((acc, r) => acc + Number(r.laundry || 0), 0);
  const roomServiceInHotel = hotelList.reduce((acc, r) => acc + Number(r.rs || 0), 0);

  // 5% Restaurant F&B
  const fnbTaxable = restList.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const fnbCgst = restList.reduce((acc, r) => acc + Number(r.cgst || 0), 0);
  const fnbSgst = restList.reduce((acc, r) => acc + Number(r.sgst || 0), 0);
  const fnbGross = restList.reduce((acc, r) => acc + Number(r.total || 0), 0);

  // NC Dining Valuation (0% Tax)
  const ncValuation = ncList.reduce((acc, r) => acc + Number(r.amount || 0), 0);

  // Total Outward Supplies (Table 3.1a)
  const totalTaxable = roomTaxable + fnbTaxable + roomLaundry;
  const totalCgst = roomCgst + fnbCgst;
  const totalSgst = roomSgst + fnbSgst;
  const totalTax = totalCgst + totalSgst;
  const grandTurnover = totalTaxable + totalTax;

  return {
    period,
    property: HOTEL_CONFIG.name,
    gstin: HOTEL_CONFIG.gstin,
    stateCode: '21',
    roomTaxable: Number(roomTaxable.toFixed(2)),
    roomCgst: Number(roomCgst.toFixed(2)),
    roomSgst: Number(roomSgst.toFixed(2)),
    roomLaundry: Number(roomLaundry.toFixed(2)),
    roomServiceInHotel: Number(roomServiceInHotel.toFixed(2)),
    fnbTaxable: Number(fnbTaxable.toFixed(2)),
    fnbCgst: Number(fnbCgst.toFixed(2)),
    fnbSgst: Number(fnbSgst.toFixed(2)),
    fnbGross: Number(fnbGross.toFixed(2)),
    ncValuation: Number(ncValuation.toFixed(2)),
    totalTaxable: Number(totalTaxable.toFixed(2)),
    totalCgst: Number(totalCgst.toFixed(2)),
    totalSgst: Number(totalSgst.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTurnover: Number(grandTurnover.toFixed(2)),
    hotelCount: hotelList.length,
    restaurantCount: restList.length,
    ncCount: ncList.length
  };
}

/**
 * 9. Event Listener Hook for React Components
 */
export function subscribeToSyncUpdates(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    if (callback) callback(e.detail);
  };
  window.addEventListener('ids-sync-update', handler);
  return () => {
    window.removeEventListener('ids-sync-update', handler);
  };
}
