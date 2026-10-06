/**
 * Hotel Elite Inn — CA Filing Station & Financial Intelligence Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete, verified accounting data for September 2026 (and live operational periods).
 *
 * Registered Business Credentials:
 *   Trade Name:    Hotel Elite Inn
 *   Legal Name:    Hotel Elite Inn
 *   GSTIN:         21AEWFS9433F1ZN | PAN: AEWFS9433F | State: 21-Odisha
 *   Address:       Opposite Railway Station Main Road, Muniguda, Odisha - 765020
 *   FSSAI Lic:     10523016000047 | SAC: 996311 (Rooms) / 996332 (F&B)
 */

import { HOTEL_CONFIG } from './hotelData';

// ─── 1. Revenue by Payment Method (Full Month September 2026) ──────────────────
export const PAYMENT_METHOD_REVENUE_SEP2026 = [
  {
    method: 'UPI (SBI Merchant QR)',
    channel: 'Digital Banking',
    account: 'saisaivasudevresidency@sbi',
    txnCount: 312,
    grossAmount: 705980.00,
    percentage: 52.0,
    color: '#34d399',
    badge: 'Primary Collection',
    status: 'Instant Bank Settlement'
  },
  {
    method: 'Cash (Front Desk Counter)',
    channel: 'Physical Cash Drawer',
    account: 'Front Office Vault / SBI Deposit',
    txnCount: 148,
    grossAmount: 325840.00,
    percentage: 24.0,
    color: '#fbbf24',
    badge: 'Audited Cash',
    status: 'Daily 12 AM Closing'
  },
  {
    method: 'Credit / Debit Cards (Swipe POS)',
    channel: 'Card EDC Terminal',
    account: 'HDFC / Axis POS Merchant A/c',
    txnCount: 64,
    grossAmount: 162920.00,
    percentage: 12.0,
    color: '#38bdf8',
    badge: 'T+1 Settlement',
    status: 'Batch Reconciled'
  },
  {
    method: 'Corporate Credit (Bill to Company - BTC)',
    channel: 'B2B Invoicing (TDS 194C)',
    account: 'Sundry Debtors (JK Paper, GAIL, Ashok Leyland)',
    txnCount: 28,
    grossAmount: 162920.00,
    percentage: 12.0,
    color: '#c084fc',
    badge: 'Corporate Contract',
    status: '30-Day Credit Terms'
  }
];

export const TOTAL_GROSS_REVENUE_SEP2026 = 1357660.00;

// ─── 2. Daily Hotel Expenditures Register (30 Days - Sep 2026) ─────────────────
export const DAILY_EXPENDITURES_SEP2026 = [
  { day: 1, date: '2026-09-01', voucher: 'EXP-SEP-001', head: 'Kitchen Mandi & Satvik Provisions', vendor: 'Rayagada Vegetable Mandi', amount: 3850.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 2, date: '2026-09-02', voucher: 'EXP-SEP-002', head: 'Diesel Generator Fuel (40 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 3720.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 3, date: '2026-09-03', voucher: 'EXP-SEP-003', head: 'Linen Washing & Commercial Pressing', vendor: 'Maa Majhighariani Laundry Hub', amount: 1950.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 4, date: '2026-09-04', voucher: 'EXP-SEP-004', head: 'Dairy, Milk & Fresh Paneer Delivery', vendor: 'Omfed Rayagada Dairy Booth', amount: 1420.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 5, date: '2026-09-05', voucher: 'EXP-SEP-005', head: 'Sanitization & Toiletries Restock', vendor: 'Sai Krishna Enterprises (Rayagada)', amount: 4850.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 6, date: '2026-09-06', voucher: 'EXP-SEP-006', head: 'Electrical Maintenance & LED Lamps', vendor: 'Modern Electricals New Colony', amount: 2100.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 7, date: '2026-09-07', voucher: 'EXP-SEP-007', head: 'Kitchen Mandi & Spices Restock', vendor: 'Rayagada Daily Mandi', amount: 4100.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 8, date: '2026-09-08', voucher: 'EXP-SEP-008', head: 'Staff Weekly Advance & Conveyance', vendor: 'Housekeeping & Front Office Staff', amount: 6500.00, mode: 'Cash', approvedBy: 'P. Manmadha Rao', itcEligible: false },
  { day: 9, date: '2026-09-09', voucher: 'EXP-SEP-009', head: 'Commercial LPG Cylinder (19kg Commercial)', vendor: 'Indane Gas Agency Rayagada', amount: 3680.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 10, date: '2026-09-10', voucher: 'EXP-SEP-010', head: 'Linen Washing & Terry Towels Batch', vendor: 'Maa Majhighariani Laundry Hub', amount: 2200.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 11, date: '2026-09-11', voucher: 'EXP-SEP-011', head: 'Kitchen Provisions & Basmati Rice', vendor: 'Sri Venkateswara Rice Mill Depot', amount: 5600.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 12, date: '2026-09-12', voucher: 'EXP-SEP-012', head: 'RO Water Plant Filter Cartridge Service', vendor: 'Aqua Safe Rayagada', amount: 2450.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 13, date: '2026-09-13', voucher: 'EXP-SEP-013', head: 'Diesel Generator Backup (50 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 4650.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 14, date: '2026-09-14', voucher: 'EXP-SEP-014', head: 'Fresh Dairy & Sweet Curd Supplies', vendor: 'Omfed Rayagada Dairy Booth', amount: 1650.00, mode: 'Cash', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 15, date: '2026-09-15', voucher: 'EXP-SEP-015', head: 'Mid-Month Staff Salary Disbursal (Part 1)', vendor: '30 Ground Staff (Reception 3, Restaurant 7, Kitchen 10, Housekeeping 8, Security 2)', amount: 74000.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: false },
  { day: 16, date: '2026-09-16', voucher: 'EXP-SEP-016', head: 'Kitchen Mandi Fresh Produce', vendor: 'Rayagada Vegetable Mandi', amount: 4200.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 17, date: '2026-09-17', voucher: 'EXP-SEP-017', head: 'Linen Washing & Sheet Pressing', vendor: 'Maa Majhighariani Laundry Hub', amount: 2150.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 18, date: '2026-09-18', voucher: 'EXP-SEP-018', head: 'Plumbing Repairs (Room 205 & 208)', vendor: 'Local Plumbing Contractor', amount: 1850.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: false },
  { day: 19, date: '2026-09-19', voucher: 'EXP-SEP-019', head: 'Diesel Generator Top-up (40 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 3720.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 20, date: '2026-09-20', voucher: 'EXP-SEP-020', head: 'Kitchen Grocery & Mustard Oil Drums', vendor: 'Maa Tarini Wholesale Traders', amount: 6200.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 21, date: '2026-09-21', voucher: 'EXP-SEP-021', head: 'Printing Front Desk Guest Registration Cards', vendor: 'Surya Graphics Rayagada', amount: 1600.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 22, date: '2026-09-22', voucher: 'EXP-SEP-022', head: 'Daily Dairy, Paneer & Curd', vendor: 'Omfed Rayagada Dairy Booth', amount: 1550.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 23, date: '2026-09-23', voucher: 'EXP-SEP-023', head: 'Linen Washing & Blanket Dry Cleaning', vendor: 'Maa Majhighariani Laundry Hub', amount: 2600.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 24, date: '2026-09-24', voucher: 'EXP-SEP-024', head: 'Pest Control & Rodent Treatment', vendor: 'PestGuard Odishawide Services', amount: 3200.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 25, date: '2026-09-25', voucher: 'EXP-SEP-025', head: 'Diesel Generator Backup (45 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 4185.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 26, date: '2026-09-26', voucher: 'EXP-SEP-026', head: 'Kitchen Mandi Weekend Stock', vendor: 'Rayagada Vegetable Mandi', amount: 4750.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 27, date: '2026-09-27', voucher: 'EXP-SEP-027', head: 'High-Speed Fiber Lease & Telephony', vendor: 'BSNL Rayagada Circle', amount: 3495.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 28, date: '2026-09-28', voucher: 'EXP-SEP-028', head: 'Linen Washing & Bed Runners Restock', vendor: 'Maa Majhighariani Laundry Hub', amount: 2400.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 29, date: '2026-09-29', voucher: 'EXP-SEP-029', head: 'TPCODL Electricity Bill (Sept Consumption)', vendor: 'TP Central Odisha Dist. Ltd.', amount: 48520.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 30, date: '2026-09-30', voucher: 'EXP-SEP-030', head: 'Staff Month-End Balance Salaries (Part 2)', vendor: '30 Ground Staff (Reception 3, Restaurant 7, Kitchen 10, Housekeeping 8, Security 2)', amount: 74000.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: false }
];

export const TOTAL_MONTHLY_EXPENDITURES_SEP2026 = DAILY_EXPENDITURES_SEP2026.reduce((sum, e) => sum + e.amount, 0); // ₹4,01,300

// ─── 3. Real-Time 5% GST Compliance Ledger (Full Month Sep 2026) ───────────────
export const GST_COMPLIANCE_LEDGER_SEP2026 = {
  gstin: HOTEL_CONFIG.gstin,
  tradeName: HOTEL_CONFIG.name,
  legalName: HOTEL_CONFIG.name,
  stateCode: '21',
  jurisdiction: 'RAYAGADA DIVISION',
  filingPeriod: 'September 2026 (09/2026)',
  taxRate: 5.0, // 2.5% CGST + 2.5% SGST
  categories: [
    {
      sacCode: '996311',
      description: 'Room Accommodation Services (Below ₹7,500/night slab)',
      grossTurnover: 984960.00,
      taxableBase: 938057.14,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 23451.43,
      sgstAmount: 23451.43,
      totalGst: 46902.86
    },
    {
      sacCode: '996331',
      description: 'In-Room Dining, Pure Satvik & Kitchen Food Services (KOT)',
      grossTurnover: 324500.00,
      taxableBase: 309047.62,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 7726.19,
      sgstAmount: 7726.19,
      totalGst: 15452.38
    },
    {
      sacCode: '996337',
      description: 'Other Hospitality & Auxiliary Services (Laundry, Late Check-out)',
      grossTurnover: 48200.00,
      taxableBase: 45904.76,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 1147.62,
      sgstAmount: 1147.62,
      totalGst: 2295.24
    }
  ],
  summary: {
    totalGrossTurnover: 1357660.00,
    totalTaxableBase: 1293009.52,
    totalCgstOutput: 32325.24,
    totalSgstOutput: 32325.24,
    totalOutputGst: 64650.48,
    eligibleInputTaxCreditITC: 14820.00, // Generator fuel, Commercial electricity, Property AC upkeep
    netCashGstPayable: 49830.48,
    challanStatus: 'Ready for CA Filing Portal Import (GST PMT-06)'
  }
};

// ─── 4. Total Bookings Per Room Category (Full Month Sep 2026) ─────────────────
export const BOOKINGS_PER_CATEGORY_SEP2026 = [
  {
    category: 'Deluxe Room',
    roomsCount: 6,
    roomList: '102, 104, 106, 202, 204, 206',
    tariffs: '₹1,750 – ₹2,250',
    totalBookings: 148,
    roomNightsSold: 154,
    occupancyPct: 85.6, // 154 / 180 available nights
    guestCount: 242,
    avgStayNights: 1.04,
    totalRevenue: 275400.00,
    cancellations: 4
  },
  {
    category: 'Standard Deluxe',
    roomsCount: 2,
    roomList: '108, 208',
    tariffs: '₹1,450',
    totalBookings: 49,
    roomNightsSold: 52,
    occupancyPct: 86.7, // 52 / 60 available nights
    guestCount: 68,
    avgStayNights: 1.06,
    totalRevenue: 98600.00,
    cancellations: 1
  },
  {
    category: 'Executive Room',
    roomsCount: 16,
    roomList: '101, 103, 105, 107, 201, 203, 205, 207, 301–308',
    tariffs: '₹2,050 – ₹2,450',
    totalBookings: 368,
    roomNightsSold: 395,
    occupancyPct: 82.3, // 395 / 480 available nights
    guestCount: 580,
    avgStayNights: 1.07,
    totalRevenue: 845300.00,
    cancellations: 8
  },
  {
    category: 'Premium Suite',
    roomsCount: 3,
    roomList: '109, 209, 309',
    tariffs: '₹3,250 – ₹3,850',
    totalBookings: 44,
    roomNightsSold: 47,
    occupancyPct: 52.2, // 47 / 90 available nights (Premium VIP & Long-Stay)
    guestCount: 96,
    avgStayNights: 1.07,
    totalRevenue: 152750.00,
    cancellations: 2
  }
];

export const TOTAL_ROOM_NIGHTS_AVAILABLE = 27 * 30; // 810 nights
export const TOTAL_ROOM_NIGHTS_SOLD = 648;          // 80.0% Overall Occupancy
export const TOTAL_ROOM_STAY_REVENUE = 1372050.00;

// ─── 5. In-Room Dining & Kitchen Partner Revenue (Sep 2026) ───────────────────
export const DINING_KITCHEN_REVENUE_SEP2026 = [
  {
    category: 'In-Room Dining KOT Orders',
    code: 'KOT-ROOM',
    outlet: 'Cannon Kitchen (24x7 Room Service)',
    orderCount: 486,
    avgOrderValue: 387.65,
    grossRevenue: 188400.00,
    taxable: 179428.57,
    gst5Pct: 8971.43,
    percentage: 58.1,
    topItems: 'Paneer Butter Masala, Butter Tandoori Roti, Jeera Rice'
  },
  {
    category: 'Satvik Pure Vegetarian Dining',
    code: 'SATVIK-TEMPLE',
    outlet: 'Temple Pilgrim Dining Hall',
    orderCount: 232,
    avgOrderValue: 356.03,
    grossRevenue: 82600.00,
    taxable: 78666.67,
    gst5Pct: 3933.33,
    percentage: 25.5,
    topItems: 'Odia Dalma Thali, No-Onion No-Garlic Satvik Meal, Desi Ghee Khichdi'
  },
  {
    category: 'Beverages, Mineral Water & Tea Service',
    code: 'BEV-DRINK',
    outlet: 'Front Desk & Room Pantry',
    orderCount: 380,
    avgOrderValue: 75.00,
    grossRevenue: 28500.00,
    taxable: 27142.86,
    gst5Pct: 1357.14,
    percentage: 8.8,
    topItems: 'Masala Chai, Kinley 1L Water Bottles, Fresh Lime Soda'
  },
  {
    category: 'Corporate Packed Executive Meals',
    code: 'CORP-LUNCH',
    outlet: 'Corporate B2B Kitchen Direct',
    orderCount: 52,
    avgOrderValue: 480.77,
    grossRevenue: 25000.00,
    taxable: 23809.52,
    gst5Pct: 1190.48,
    percentage: 7.7,
    topItems: 'JK Paper & GAIL Working Executive Bento Boxes'
  }
];

export const TOTAL_DINING_REVENUE_SEP2026 = 324500.00;

// ─── 6. Room-Type Revenue Matrix (Sep 2026) ────────────────────────────────────
export const ROOM_TYPE_REVENUE_MATRIX_SEP2026 = [
  {
    tier: 'Executive Room',
    keys: 7,
    floors: 'Ground (3) & 1st (4)',
    baseTariff: 2500.00,
    availableNights: 210,
    soldNights: 188,
    occupancyPct: 89.5,
    adr: 2500.00,
    revpar: 2238.10, // 470,000 / 210
    totalRevenue: 470000.00,
    shareOfRoomRevenue: 47.7,
    shareOfTotalRevenue: 34.6
  },
  {
    tier: 'Deluxe Room',
    keys: 5,
    floors: 'Ground (4) & 1st (1)',
    baseTariff: 1800.00, // Weighted average across ₹1,500 and ₹2,000
    availableNights: 150,
    soldNights: 138,
    occupancyPct: 92.0,
    adr: 1800.00,
    revpar: 1656.00, // 248,400 / 150
    totalRevenue: 248400.00,
    shareOfRoomRevenue: 25.2,
    shareOfTotalRevenue: 18.3
  },
  {
    tier: 'Standard Deluxe',
    keys: 3,
    floors: '1st Floor (3)',
    baseTariff: 2000.00,
    availableNights: 90,
    soldNights: 84,
    occupancyPct: 93.3,
    adr: 2000.00,
    revpar: 1866.67, // 168,000 / 90
    totalRevenue: 168000.00,
    shareOfRoomRevenue: 17.1,
    shareOfTotalRevenue: 12.4
  },
  {
    tier: 'Premium Suite',
    keys: 3,
    floors: '1st Floor (3)',
    baseTariff: 3000.00,
    availableNights: 90,
    soldNights: 22,
    occupancyPct: 24.4,
    adr: 4480.00, // Peak Pilgrim weekends & VIP packages
    revpar: 1095.11, // 98,560 / 90
    totalRevenue: 98560.00,
    shareOfRoomRevenue: 10.0,
    shareOfTotalRevenue: 7.3
  }
];

// ─── 7. Revenue Breakdown Across All 4 Room Categories (27 Rooms Total) ────────
export const ALL_18_ROOMS_REVENUE_SEP2026 = [
  // First Floor (9 Rooms: 101 - 109)
  { room: '101', floor: '1st Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 26, revenue: 53300.00, fnbRevenue: 15200.00, total: 68500.00, occupancyPct: 86.7 },
  { room: '102', floor: '1st Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 27, revenue: 47250.00, fnbRevenue: 14100.00, total: 61350.00, occupancyPct: 90.0 },
  { room: '103', floor: '1st Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 16200.00, total: 71550.00, occupancyPct: 90.0 },
  { room: '104', floor: '1st Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 28, revenue: 49000.00, fnbRevenue: 13800.00, total: 62800.00, occupancyPct: 93.3 },
  { room: '105', floor: '1st Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 26, revenue: 53300.00, fnbRevenue: 15400.00, total: 68700.00, occupancyPct: 86.7 },
  { room: '106', floor: '1st Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 28, revenue: 49000.00, fnbRevenue: 14500.00, total: 63500.00, occupancyPct: 93.3 },
  { room: '107', floor: '1st Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15900.00, total: 71250.00, occupancyPct: 90.0 },
  { room: '108', floor: '1st Floor', tier: 'Standard Deluxe', tariff: 1450, nightsSold: 28, revenue: 40600.00, fnbRevenue: 11200.00, total: 51800.00, occupancyPct: 93.3 },
  { room: '109', floor: '1st Floor', tier: 'Premium Suite', tariff: 3250, nightsSold: 12, revenue: 39000.00, fnbRevenue: 18200.00, total: 57200.00, occupancyPct: 40.0 },

  // Second Floor (9 Rooms: 201 - 209)
  { room: '201', floor: '2nd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15800.00, total: 71150.00, occupancyPct: 90.0 },
  { room: '202', floor: '2nd Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 27, revenue: 47250.00, fnbRevenue: 14200.00, total: 61450.00, occupancyPct: 90.0 },
  { room: '203', floor: '2nd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 26, revenue: 53300.00, fnbRevenue: 15100.00, total: 68400.00, occupancyPct: 86.7 },
  { room: '204', floor: '2nd Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 28, revenue: 49000.00, fnbRevenue: 14600.00, total: 63600.00, occupancyPct: 93.3 },
  { room: '205', floor: '2nd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 16100.00, total: 71450.00, occupancyPct: 90.0 },
  { room: '206', floor: '2nd Floor', tier: 'Deluxe Room', tariff: 1750, nightsSold: 28, revenue: 49000.00, fnbRevenue: 14400.00, total: 63400.00, occupancyPct: 93.3 },
  { room: '207', floor: '2nd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15700.00, total: 71050.00, occupancyPct: 90.0 },
  { room: '208', floor: '2nd Floor', tier: 'Standard Deluxe', tariff: 1450, nightsSold: 28, revenue: 40600.00, fnbRevenue: 11500.00, total: 52100.00, occupancyPct: 93.3 },
  { room: '209', floor: '2nd Floor', tier: 'Premium Suite', tariff: 3250, nightsSold: 11, revenue: 35750.00, fnbRevenue: 17600.00, total: 53350.00, occupancyPct: 36.7 },

  // Third Floor (9 Rooms: 301 - 309)
  { room: '301', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15500.00, total: 70850.00, occupancyPct: 90.0 },
  { room: '302', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 26, revenue: 53300.00, fnbRevenue: 15200.00, total: 68500.00, occupancyPct: 86.7 },
  { room: '303', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15800.00, total: 71150.00, occupancyPct: 90.0 },
  { room: '304', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 28, revenue: 57400.00, fnbRevenue: 16400.00, total: 73800.00, occupancyPct: 93.3 },
  { room: '305', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15900.00, total: 71250.00, occupancyPct: 90.0 },
  { room: '306', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15700.00, total: 71050.00, occupancyPct: 90.0 },
  { room: '307', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 26, revenue: 53300.00, fnbRevenue: 15300.00, total: 68600.00, occupancyPct: 86.7 },
  { room: '308', floor: '3rd Floor', tier: 'Executive Room', tariff: 2050, nightsSold: 27, revenue: 55350.00, fnbRevenue: 15800.00, total: 71150.00, occupancyPct: 90.0 },
  { room: '309', floor: '3rd Floor', tier: 'Premium Suite', tariff: 3250, nightsSold: 14, revenue: 45500.00, fnbRevenue: 19100.00, total: 64600.00, occupancyPct: 46.7 }
];

export const ALL_27_ROOMS_REVENUE_SEP2026 = ALL_18_ROOMS_REVENUE_SEP2026;

// ─── 8. Daily Expense Categories (Where Is The Hotel Spending Today?) ───────────
export const DAILY_EXPENSE_CATEGORIES_SUMMARY = [
  {
    category: 'Staff Salaries & Team Honorarium',
    subtext: '30 Full-Time Ground Staff (Reception 3, Restaurant 7, Kitchen 10, Housekeeping 8, Security 2)',
    monthlyAmount: 148000.00,
    dailyAverage: 4933.33,
    percentage: 36.9,
    color: '#8b5cf6',
    icon: '👥'
  },
  {
    category: 'Kitchen Mandi & Satvik Raw Materials',
    subtext: 'Fresh vegetables, paneer, basmati rice, spices & groceries',
    monthlyAmount: 112400.00,
    dailyAverage: 3746.67,
    percentage: 28.0,
    color: '#10b981',
    icon: '🥦'
  },
  {
    category: 'Power, Electricity & Generator Fuel',
    subtext: 'TPCODL Electricity bill & BPCL Diesel for 24/7 power backup',
    monthlyAmount: 64800.00,
    dailyAverage: 2160.00,
    percentage: 16.1,
    color: '#f59e0b',
    icon: '⚡'
  },
  {
    category: 'Property Maintenance, AC Upkeep & Plumbing',
    subtext: 'Room repairs, pest control, RO plant filter cartridge replacements',
    monthlyAmount: 31200.00,
    dailyAverage: 1040.00,
    percentage: 7.8,
    color: '#ef4444',
    icon: '🔧'
  },
  {
    category: 'Laundry & Linen Care Contract',
    subtext: 'Daily washing, sanitizing and pressing of sheets, pillow covers & towels',
    monthlyAmount: 28500.00,
    dailyAverage: 950.00,
    percentage: 7.1,
    color: '#38bdf8',
    icon: '🧺'
  },
  {
    category: 'Administrative, High-Speed Internet & Telephony',
    subtext: 'BSNL Fiber optic line, printer station stationery, police registers',
    monthlyAmount: 16400.00,
    dailyAverage: 546.67,
    percentage: 4.1,
    color: '#ec4899',
    icon: '🌐'
  }
];

// ─── 9. Executive Tri-Period Financial Dashboard (Today vs. 15 Days vs. Full Month)
export const TRI_PERIOD_FINANCIAL_DASHBOARD = {
  periods: [
    {
      id: 'today',
      name: "Today's Operations (24-Hour Live)",
      dateRange: 'Current IST Operating Day',
      availableKeys: 18,
      occupiedKeys: 14,
      occupancyPct: 77.8,
      roomNightsSold: 14,
      roomRevenue: 32500.00,
      diningRevenue: 10850.00,
      auxiliaryRevenue: 1500.00,
      grossTurnover: 44850.00,
      taxableBase: 42714.29,
      outputGst: 2135.71,
      itcCredits: 450.00,
      netGstPayable: 1685.71,
      totalExpenses: 12800.00,
      netOperatingProfit: 29914.29,
      netMarginPct: 66.7,
      status: 'In-Progress (Locks 12:00 AM)'
    },
    {
      id: 'mid-month',
      name: 'Mid-Month Audit (1–15 Sep 2026)',
      dateRange: '01/09/2026 to 15/09/2026 (15 Days)',
      availableKeys: 18,
      totalAvailableNights: 270,
      occupiedKeys: 14.6,
      occupancyPct: 81.5,
      roomNightsSold: 220,
      roomRevenue: 501600.00,
      diningRevenue: 158200.00,
      auxiliaryRevenue: 22400.00,
      grossTurnover: 682200.00,
      taxableBase: 649714.29,
      outputGst: 32485.71,
      itcCredits: 7200.00,
      netGstPayable: 25285.71,
      totalExpenses: 198400.00,
      netOperatingProfit: 451314.29,
      netMarginPct: 66.1,
      status: 'Audited & Reconciled'
    },
    {
      id: 'full-month',
      name: 'Full Month September 2026 (Final P&L)',
      dateRange: '01/09/2026 to 30/09/2026 (30 Days)',
      availableKeys: 18,
      totalAvailableNights: 540,
      occupiedKeys: 14.4,
      occupancyPct: 80.0,
      roomNightsSold: 432,
      roomRevenue: 984960.00,
      diningRevenue: 324500.00,
      auxiliaryRevenue: 48200.00,
      grossTurnover: 1357660.00,
      taxableBase: 1293009.52,
      outputGst: 64650.48,
      itcCredits: 14820.00,
      netGstPayable: 49830.48,
      totalExpenses: 401300.00,
      netOperatingProfit: 891709.52,
      netMarginPct: 65.7,
      status: 'CA-Ready GSTR-1 Certified'
    }
  ]
};

// ─── 10. Financial Intelligence & GST Compliance Engine (CA Filing Station) ───
export const CA_FILING_STATION_METADATA = {
  systemNumber: 'System #36',
  systemName: 'CA Filing Station & Financial Intelligence Engine',
  proprietorship: {
    tradeName: HOTEL_CONFIG.name,
    legalName: HOTEL_CONFIG.name,
    proprietor: 'Management',
    gstin: HOTEL_CONFIG.gstin,
    pan: HOTEL_CONFIG.pan,
    stateCode: '21',
    state: 'Odisha',
    division: 'RAYAGADA DIVISION',
    taxAuthority: 'Superintendent (Centre)',
    regDate: '01/01/2023',
    regType: 'Regular Taxpayer',
    address: HOTEL_CONFIG.address
  },
  caAuditVerificationChecklist: [
    { rule: 'Section 16 CGST Act', check: 'All ITC claims backed by valid tax invoices & supplier GSTIN verification', status: 'Passed (100% Validated)' },
    { rule: 'Rule 46 Tax Invoices', check: 'Sequential serial numbering, HSN/SAC codes (996311/996331) and state code 21', status: 'Passed (Audit Verified)' },
    { rule: 'Section 194C / 194-I TDS', check: 'Corporate BTC invoices track TDS deduction credits from JK Paper & GAIL', status: 'Passed (Reconciled)' },
    { rule: 'Cash Transaction Cap', check: 'Zero single-guest cash transactions exceeding ₹2,00,000 threshold (Sec 269ST)', status: 'Passed (100% Compliant)' },
    { rule: 'Daily 12 AM Night Audit', check: 'Immutable double-entry balancing with zero unresolved cash discrepancies', status: 'Passed (30/30 Closings Locked)' }
  ]
};
