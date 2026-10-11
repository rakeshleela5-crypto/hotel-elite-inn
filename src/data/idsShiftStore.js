/**
 * HOTEL ELITE INN — IDS FORTUNE NEXT 6.5 & 7.0
 * 3-Shift Handover, Drawer Float (Dryer Float) Management & Morning Flash Analytics Store
 * 
 * Supports:
 * - 3 Daily Shifts: Morning (07:00-15:30), Evening (15:00-23:30), Night (23:00-07:30)
 * - Receptionists / Cashiers: Ranjan Kumar Dash (FO-01), Sneha Mohapatra (FO-02), Manash Ranjan Sahu (FO-03)
 * - Tender Collection Split: Cash, UPI, Card, BTC (Bill to Company), Complimentary/NC
 * - Note Denomination Counter (500, 200, 100, 50, 20, 10, coins)
 * - Opening Drawer Float (Dryer Float) Carryover & Safe Drop
 * - Shift Lock with 4-Digit Security PIN
 * - Daily Operations Flash Briefing Report matching the exact client WhatsApp/Notebook template
 */

export const SHIFT_DEFINITIONS = [
  {
    id: 'shift1',
    name: 'Shift 1 — Morning',
    label: 'Morning Shift (07:00 AM – 03:30 PM)',
    shortTime: '07:00 - 15:30',
    cashierName: 'Ranjan Kumar Dash',
    cashierCode: 'FO-01',
    role: 'Sr. Front Desk Cashier',
    phone: '+91 94370 11001',
    defaultFloat: 2000
  },
  {
    id: 'shift2',
    name: 'Shift 2 — Evening',
    label: 'Evening Shift (03:00 PM – 11:30 PM)',
    shortTime: '15:00 - 23:30',
    cashierName: 'Sneha Mohapatra',
    cashierCode: 'FO-02',
    role: 'Front Desk Executive',
    phone: '+91 94370 11002',
    defaultFloat: 2000
  },
  {
    id: 'shift3',
    name: 'Shift 3 — Night',
    label: 'Night Shift / Day-End Audit (11:00 PM – 07:30 AM)',
    shortTime: '23:00 - 07:30',
    cashierName: 'Manash Ranjan Sahu',
    cashierCode: 'FO-03',
    role: 'Night Auditor & Duty Receptionist',
    phone: '+91 94370 11003',
    defaultFloat: 2000
  }
];

// Baseline Authentic Hotel Elite Inn Daily Record (Oct 02, 2026 as shared by client)
export const DEFAULT_SHIFT_RECORDS = {
  '02-10-2026': {
    reportDate: '02-10-2026',
    activeShiftId: 'shift1',
    shift1: {
      shiftId: 'shift1',
      shiftName: 'Shift 1 — Morning',
      cashierName: 'Ranjan Kumar Dash',
      cashierCode: 'FO-01',
      status: 'LOCKED',
      lockedAt: '02-10-2026 15:30',
      lockedBy: 'Ranjan Kumar Dash',
      pin: '7650',
      drawerFloat: 2000,
      safeDrop: 8500,
      denominations: { n500: 16, n200: 5, n100: 15, n50: 0, n20: 0, n10: 0, coins: 0 },
      physicalCash: 10500, // 2000 float + 8500 collections
      collections: {
        cash: 8500,
        upi: 12400,
        card: 4500,
        btc: 0,
        complimentary: 0,
        total: 25400
      },
      fnbSplit: {
        roomService: 250,
        restaurant: 8400,
        takeAway: 1200
      },
      handoverNotes: 'Morning checkouts cleared. Cashier safe drop ₹8,500 deposited in front office drop vault. Float ₹2,000 handed to Sneha.'
    },
    shift2: {
      shiftId: 'shift2',
      shiftName: 'Shift 2 — Evening',
      cashierName: 'Sneha Mohapatra',
      cashierCode: 'FO-02',
      status: 'LOCKED',
      lockedAt: '02-10-2026 23:30',
      lockedBy: 'Sneha Mohapatra',
      pin: '7650',
      drawerFloat: 2000,
      safeDrop: 14200,
      denominations: { n500: 28, n200: 10, n100: 2, n50: 0, n20: 0, n10: 0, coins: 0 },
      physicalCash: 16200, // 2000 float + 14200 collections
      collections: {
        cash: 14200,
        upi: 16251,
        card: 3137,
        btc: 0,
        complimentary: 5,
        total: 33588
      },
      fnbSplit: {
        roomService: 555,
        restaurant: 20251,
        takeAway: 3137
      },
      handoverNotes: 'Peak dinner rush handled. Restaurant compliments: 5 tea/coffee for Vedanta GM visit. Drawer float ₹2,000 passed to Manash.'
    },
    shift3: {
      shiftId: 'shift3',
      shiftName: 'Shift 3 — Night',
      cashierName: 'Manash Ranjan Sahu',
      cashierCode: 'FO-03',
      status: 'LOCKED',
      lockedAt: '03-10-2026 07:30',
      lockedBy: 'Manash Ranjan Sahu',
      pin: '7650',
      drawerFloat: 2000,
      safeDrop: 2000,
      denominations: { n500: 8, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, coins: 0 },
      physicalCash: 4000, // 2000 float + 2000 late night room deposit
      collections: {
        cash: 2000,
        upi: 0,
        card: 0,
        btc: 0,
        complimentary: 0,
        total: 2000
      },
      fnbSplit: {
        roomService: 0,
        restaurant: 0,
        takeAway: 0
      },
      handoverNotes: 'Night audit completed. Day-end rollover sealed. Morning briefing flash report broadcasted to management WhatsApp group.'
    },
    // The master daily rollup matching client's exact data
    dailyRollup: {
      reportDate: '02-10-2026',
      totalRoomsAvailable: 22,
      totalRoomsSaleable: 5,
      arrActual: 1611,
      occupancy: 18,
      mgmHold: 0,
      underMaintenance: 0,
      outOfOrder: 0.0,
      roomService: 805.00,
      restaurant: 28651.00,
      takeAway: 4337.00,
      totalRevenueActual: 33793.00,
      mtdFbRevenueActual: 53690.00,
      restaurantComplimentary: 5.00,
      totalBtcAmount: 0.00,
      totalCashCollected: 24700.00,
      totalUpiCollected: 28651.00,
      totalCardCollected: 7637.00,
      drawerFloatBal: 2000.00
    }
  }
};

const STORAGE_KEY_SHIFTS = 'ids_shift_handover_records';
const STORAGE_KEY_ACTIVE_SHIFT = 'ids_current_active_shift';

export function getStoredShiftRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHIFTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load shift records from localStorage', e);
  }
  return DEFAULT_SHIFT_RECORDS;
}

export function saveStoredShiftRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save shift records to localStorage', e);
  }
}

export function getStoredActiveShiftId() {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_SHIFT);
    if (active && ['shift1', 'shift2', 'shift3'].includes(active)) {
      return active;
    }
  } catch (e) {
    console.warn(e);
  }
  return 'shift1';
}

export function saveStoredActiveShiftId(shiftId) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHIFT, shiftId);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Compute the authentic WhatsApp / Notebook string matching client's exact format
 */
export function formatClientMorningBriefing(rollup) {
  const r = rollup || DEFAULT_SHIFT_RECORDS['02-10-2026'].dailyRollup;

  const dateStr = r.reportDate || '02-10-2026';
  const availStr = String(r.totalRoomsAvailable ?? 22).padStart(2, '0');
  const saleableStr = String(r.totalRoomsSaleable ?? 5).padStart(2, '0');
  const arrStr = String(Math.round(r.arrActual ?? 1611));
  const occStr = String(r.occupancy ?? 18);
  const mgmStr = String(r.mgmHold ?? 0).padStart(2, '0');
  const maintStr = String(r.underMaintenance ?? 0).padStart(2, '0');
  const oooStr = Number(r.outOfOrder ?? 0).toFixed(1);

  const rsActual = Number(r.roomService ?? 805).toFixed(2);
  const resActual = Number(r.restaurant ?? 28651).toFixed(2);
  const takeAwayActual = Number(r.takeAway ?? 4337).toFixed(2);

  const totRev = Number(r.totalRevenueActual ?? 33793).toFixed(2);
  const mtdFb = Number(r.mtdFbRevenueActual ?? 53690).toFixed(2);
  const compStr = Number(r.restaurantComplimentary ?? 5).toFixed(2);
  const btcStr = Number(r.totalBtcAmount ?? 0).toFixed(2);

  return `* Good morning, all!!!
* Report Date:- ${dateStr}
* Total rooms available:-${availStr}
* Total rooms saleable:-${saleableStr}
* ARR Actual:-${arrStr}
. Occupancy :-${occStr}%                      MGM Hold:-${mgmStr}
* under Maintenance:${maintStr}
* Out Of Order :${oooStr} 
  ...............................................................                                                                                                                                                                                                                                                                         
* F&B Room service actual:${rsActual}
  .  Restaurant Actual:-${resActual} 
*.Take Away Actual:-${takeAwayActual} 
  ...............................................................
* Total Revenue Actual:${totRev}
* MTD F&B Revenue Actual:-${mtdFb}    
* Restaurant Complimentary:${compStr} .Total BTC Amount.${btcStr}`;
}
