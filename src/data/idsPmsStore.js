// IDS Fortune NEXT Unified Relational PMS State & Accounting Store
// Live source of truth for Hotel Elite Inn Front Office & Staff Operations

import { HOTEL_CONFIG } from './hotelData';

// Dynamic Date Helpers for Live Hotel Operations
export function getFormattedPmsDate(date = new Date()) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getFormattedPmsDateTime(date = new Date()) {
  const d = new Date(date);
  const pmsDate = getFormattedPmsDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${pmsDate} ${hours}:${minutes}`;
}

export function getFormattedPmsMonthYear(date = new Date()) {
  const d = new Date(date);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${month}-${year}`;
}

// Live Current Accounting Date (Dynamic)
export const INITIAL_ACCOUNTING_DATE = getFormattedPmsDate();
export const CURRENT_ACCOUNTING_MONTH_YEAR = getFormattedPmsMonthYear();
const nextDay = new Date();
nextDay.setDate(nextDay.getDate() + 1);
export const NEXT_ACCOUNTING_DATE = getFormattedPmsDate(nextDay);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateYesterday = getFormattedPmsDate(yesterday);

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const dateThreeDaysAgo = getFormattedPmsDate(threeDaysAgo);

const currentYear = new Date().getFullYear();

// 1. Corporate Master Directory (Authentic Rayagada & Regional Industrial Partners)
export const INITIAL_COMPANIES = [
  {
    code: 'COM0001',
    name: 'Ashok Leyland Ltd',
    shortName: 'ASHOK LEYLAND',
    address: 'Regional Transit Office, Rayagada Road, Odisha - 765017',
    gstin: '21AAACA1028L1ZV',
    pan: 'AACA1028L',
    contactPerson: 'Mr. Sunil Mohanty',
    designation: 'Fleet Manager',
    phone: '06856-224410',
    email: 'travel.east@ashokleyland.com',
    creditLimit: 250000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '100'
  },
  {
    code: 'COM0002',
    name: 'Linde India Ltd (Industrial Gases)',
    shortName: 'LINDE INDIA',
    address: 'Oxygen Plant Division, Muniguda Industrial Zone, Rayagada - 765020',
    gstin: '21AAACL2014M1Z2',
    pan: 'AAACL2014M',
    contactPerson: 'Mr. Ramesh Rao',
    designation: 'Site Operations Lead',
    phone: '06856-231900',
    email: 'guestrelations@linde.com',
    creditLimit: 300000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '101'
  },
  {
    code: 'COM0003',
    name: 'Utkal Alumina International Ltd',
    shortName: 'UTKAL ALUMINA',
    address: 'Doraguda, Kucheipadar, Dist. Rayagada, Odisha - 765015',
    gstin: '21AAACU4921K1ZP',
    pan: 'AAACU4921K',
    contactPerson: 'Mr. Vikram Patel',
    designation: 'Procurement & Protocol Head',
    phone: '06856-235000',
    email: 'admin.guest@adityabirla.com',
    creditLimit: 500000,
    creditDays: 45,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '102'
  },
  {
    code: 'COM0004',
    name: 'JK Paper Mills Ltd (Rayagada)',
    shortName: 'JK PAPER',
    address: 'Jaykaypur, Rayagada, Odisha - 765017',
    gstin: '21AAACJ0118P1ZX',
    pan: 'AAACJ0118P',
    contactPerson: 'Mr. B. K. Padhi',
    designation: 'Senior General Manager',
    phone: '06856-222048',
    email: 'guestrelations@jkpaper.com',
    creditLimit: 400000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '100'
  },
  {
    code: 'COM0005',
    name: 'Vedanta Limited (Alumina Refinery)',
    shortName: 'VEDANTA',
    address: 'Lanjigarh, Dist. Kalahandi / Rayagada, Odisha - 766027',
    gstin: '21AAACV0552Q1ZN',
    pan: 'AAACV0552Q',
    contactPerson: 'Mr. S. Mohanty',
    designation: 'General Manager - Admin',
    phone: '06677-247000',
    email: 'admin.lanjigarh@vedanta.co.in',
    creditLimit: 500000,
    creditDays: 45,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '102'
  }
];

// 2. Business Sources Master (Video 29)
export const INITIAL_BUSINESS_SOURCES = [
  { code: 'OTA', name: 'Online Travel Agent', shortName: 'OTA', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'WAL', name: 'Walk-In Direct', shortName: 'WALKIN', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'WEB', name: 'Hotel Direct Website (hotel-elite-inn.pages.dev)', shortName: 'DIRECT-WEB', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'URO', name: 'Unit Reservation Office', shortName: 'URO', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'USO', name: 'Unit Sales Office', shortName: 'USO', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'MMT', name: 'MakeMyTrip / Goibibo Direct OTA', shortName: 'MMT', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'BKG', name: 'Booking.com B.V.', shortName: 'BOOKING', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'DIR', name: 'Direct Call / Front Desk Telephone', shortName: 'PHONE', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' }
];

// 3. Market Segments Master (Video 30)
export const INITIAL_MARKET_SEGMENTS = [
  { code: 'CVG', name: 'Corporate Business / Commercial', shortName: 'CORP', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'FIT', name: 'Free Individual Traveler (Leisure/Direct)', shortName: 'FIT', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'GRP', name: 'Group Tour & Delegation', shortName: 'GROUP', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'GOV', name: 'Government Official / PSU Protocol', shortName: 'GOVT', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' },
  { code: 'AIR', name: 'Railway / Station Transit Guest', shortName: 'TRANSIT', applicableFrom: `01-JAN-${currentYear}`, status: 'Active' }
];

// 4. Negotiated Corporate Contract Rates (Aligned with Hotel Elite Inn authentic room tiers)
export const INITIAL_CONTRACT_RATES = [
  {
    tableNo: '100',
    description: 'Ashok Leyland & JK Paper Corporate Preferred Tariff',
    companyCode: 'COM0001',
    validFrom: `01-JAN-${currentYear}`,
    validTo: `31-DEC-${currentYear}`,
    rates: {
      standard: { single: 1350, double: 1350 },
      deluxe: { single: 1650, double: 2050 },
      executive: { single: 1950, double: 2350 },
      suite: { single: 3000, double: 3500 }
    },
    plan: 'CP', // Continental Plan (Includes Buffet Breakfast)
    taxInclusive: false
  },
  {
    tableNo: '101',
    description: 'Linde India Special Operations Tariff',
    companyCode: 'COM0002',
    validFrom: `01-JAN-${currentYear}`,
    validTo: `31-DEC-${currentYear}`,
    rates: {
      standard: { single: 1350, double: 1350 },
      deluxe: { single: 1650, double: 2050 },
      executive: { single: 1950, double: 2350 },
      suite: { single: 3000, double: 3500 }
    },
    plan: 'CP',
    taxInclusive: false
  },
  {
    tableNo: '102',
    description: 'Utkal Alumina & Vedanta Resident Agreement',
    companyCode: 'COM0003',
    validFrom: `01-JAN-${currentYear}`,
    validTo: `31-DEC-${currentYear}`,
    rates: {
      standard: { single: 1350, double: 1350 },
      deluxe: { single: 1650, double: 2050 },
      executive: { single: 1950, double: 2350 },
      suite: { single: 3000, double: 3500 }
    },
    plan: 'MAP', // Modified American Plan (Breakfast + Dinner)
    taxInclusive: false
  }
];

// 5. Package Rates Master
export const INITIAL_PACKAGE_RATES = [
  {
    code: 'PKG-CORP',
    name: 'Executive Residency Bed & Board Package',
    tier: 'executive',
    totalTariff: 2650,
    split: {
      roomTariff: 2050,
      buffetBreakfast: 200,
      dinnerBuffet: 400
    },
    sacCode: '996311',
    taxRate: 12
  },
  {
    code: 'PKG-TEMPLE',
    name: 'Maa Majhighariani Darshan Pilgrimage Package',
    tier: 'deluxe',
    totalTariff: 3200,
    split: {
      roomTariff: 1750,
      breakfast: 250,
      darshanCabAssistance: 800,
      eveningSnacks: 400
    },
    sacCode: '996311',
    taxRate: 12
  }
];

// 6. In-House Occupied Rooms & Active Guest Folios (27 Authentic Physical Rooms)
export const INITIAL_INHOUSE_GUESTS = [
  {
    roomNo: '102',
    folioNo: '102/1',
    regNo: '501',
    guestName: 'MR SUNIL MOHANTY',
    gender: 'M',
    phone: '+91-9437012345',
    email: 'sunil.mohanty@ashokleyland.com',
    companyCode: 'COM0001',
    companyName: 'Ashok Leyland Ltd',
    gstin: '21AAACA1028L1ZV',
    pax: 1,
    paxList: ['MR SUNIL MOHANTY'],
    tier: 'deluxe',
    roomType: 'DLX',
    tariff: 1750,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: dateYesterday,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 1750,
    totalCharges: 3500,
    depositAmount: 1750,
    stopPosting: false,
    vipStatus: 'Corporate',
    idType: 'Aadhaar Card',
    idNumber: '7845-9012-3456',
    remarks: 'Floor 1, Ground proximity required'
  },
  {
    roomNo: '105',
    folioNo: '105/1',
    regNo: '502',
    guestName: 'MR RAMESH RAO',
    gender: 'M',
    phone: '+91-9861054321',
    email: 'ramesh.rao@linde.com',
    companyCode: 'COM0002',
    companyName: 'Linde India Ltd',
    gstin: '21AAACL2014M1Z2',
    pax: 2,
    paxList: ['MR RAMESH RAO', 'MR K. S. PATNAIK'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: dateYesterday,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 4100,
    totalCharges: 4100,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Corporate',
    idType: 'Aadhaar Card',
    idNumber: '3344-5566-7788',
    remarks: 'Twin Bed Executive setup'
  },
  {
    roomNo: '203',
    folioNo: '203/1',
    regNo: '503',
    guestName: 'MR VIKRAM PATEL',
    gender: 'M',
    phone: '+91-9937088122',
    email: 'vikram.patel@adityabirla.com',
    companyCode: 'COM0003',
    companyName: 'Utkal Alumina International Ltd',
    gstin: '21AAACU4921K1ZP',
    pax: 1,
    paxList: ['MR VIKRAM PATEL'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'MAP',
    arrivalDate: dateThreeDaysAgo,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '11:00',
    balance: 3150,
    totalCharges: 6150,
    depositAmount: 3000,
    stopPosting: false,
    vipStatus: 'VIP-1',
    idType: 'Aadhaar Card',
    idNumber: '8910-1122-3344',
    remarks: 'Late check-in requested on arrival'
  },
  {
    roomNo: '206',
    folioNo: '206/1',
    regNo: '504',
    guestName: 'MS SUBHASHREE JENA',
    gender: 'F',
    phone: '+91-9778019922',
    email: 'subhashree.jena@jkpaper.com',
    companyCode: 'COM0004',
    companyName: 'JK Paper Mills Ltd',
    gstin: '21AAACJ0118P1ZX',
    pax: 1,
    paxList: ['MS SUBHASHREE JENA'],
    tier: 'deluxe',
    roomType: 'DLX',
    tariff: 1750,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: dateYesterday,
    departureDate: INITIAL_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 1750,
    totalCharges: 1750,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Driving License',
    idNumber: 'OD-05-2023-9901',
    remarks: 'Quiet deluxe room'
  },
  {
    roomNo: '301',
    folioNo: '301/1',
    regNo: '505',
    guestName: 'MR TENZING NORBU',
    gender: 'M',
    phone: '+91-9811099233',
    email: 'admin.lanjigarh@vedanta.co.in',
    companyCode: 'COM0005',
    companyName: 'Vedanta Limited',
    gstin: '21AAACV0552Q1ZN',
    pax: 1,
    paxList: ['MR TENZING NORBU'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: dateThreeDaysAgo,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 2050,
    totalCharges: 6150,
    depositAmount: 4100,
    stopPosting: false,
    vipStatus: 'Corporate',
    idType: 'Passport',
    idNumber: 'Z8912401',
    remarks: 'Floor 3, Executive King'
  },
  {
    roomNo: '303',
    folioNo: '303/1',
    regNo: '506',
    guestName: 'MR SATISH MISHRA',
    gender: 'M',
    phone: '+91-9438012999',
    email: 'satish.mishra@dalmiacement.com',
    companyCode: '',
    companyName: 'Dalmia Cement Bharat Ltd',
    gstin: '21AAACD1293K1ZR',
    pax: 1,
    paxList: ['MR SATISH MISHRA'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'EP',
    arrivalDate: dateYesterday,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 2050,
    totalCharges: 2050,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Aadhaar Card',
    idNumber: '1122-3344-5566',
    remarks: 'Executive room, high floor'
  },
  {
    roomNo: '109',
    folioNo: '109/1',
    regNo: '507',
    guestName: 'DR S. N. MOHANTY',
    gender: 'M',
    phone: '+91-9845012345',
    email: 'sn.mohanty@aiims.edu',
    companyCode: '',
    companyName: 'AIIMS Healthcare Consultant',
    gstin: '',
    pax: 2,
    paxList: ['DR S. N. MOHANTY', 'MRS MOHANTY'],
    tier: 'suite',
    roomType: 'SUI',
    tariff: 3250,
    discountPct: 0,
    planCode: 'MAP',
    arrivalDate: dateYesterday,
    departureDate: NEXT_ACCOUNTING_DATE,
    expectedCheckoutTime: '12:00',
    balance: 3250,
    totalCharges: 6500,
    depositAmount: 3250,
    stopPosting: false,
    vipStatus: 'VIP-1',
    idType: 'PAN Card',
    idNumber: 'AAAPM9011F',
    remarks: 'Premium Suite with living room'
  }
];

// 7. Active Advance Deposit Receipts (Live)
export const INITIAL_DEPOSITS_LOG = [
  {
    receiptNo: 'RCP-1042',
    date: INITIAL_ACCOUNTING_DATE,
    time: '14:30',
    roomNo: '102',
    folioNo: '102/1',
    guestName: 'MR SUNIL MOHANTY',
    amount: 1750,
    tenderMode: 'UPI / QR',
    upiRef: `${HOTEL_CONFIG.upiId}`,
    cashier: 'IT ADMIN',
    remarks: 'Advance collected for Deluxe Room 102'
  },
  {
    receiptNo: 'RCP-1043',
    date: dateYesterday,
    time: '11:15',
    roomNo: '109',
    folioNo: '109/1',
    guestName: 'DR S. N. MOHANTY',
    amount: 3250,
    tenderMode: 'Credit Card (Visa)',
    cardLast4: '4112',
    cashier: 'DUTY MANAGER',
    remarks: 'Suite advance deposit'
  },
  {
    receiptNo: 'RCP-1044',
    date: dateThreeDaysAgo,
    time: '09:00',
    roomNo: '301',
    folioNo: '301/1',
    guestName: 'MR TENZING NORBU',
    amount: 4100,
    tenderMode: 'NEFT / Bank Transfer',
    bankRef: 'UTR99102456',
    cashier: 'IT ADMIN',
    remarks: 'Vedanta corporate advance'
  }
];

// 8. Paid-Out Cash Refund Vouchers (Live)
export const INITIAL_PAID_OUTS_LOG = [
  {
    voucherNo: `PO-${currentYear}-001`,
    date: INITIAL_ACCOUNTING_DATE,
    time: '16:45',
    roomNo: '203',
    folioNo: '203/1',
    guestName: 'MR VIKRAM PATEL',
    excessAmount: 500,
    refundMode: 'Cash from FO Cashier Till',
    authorizedBy: 'DUTY MANAGER',
    cashier: 'IT ADMIN',
    reason: 'Advance deposit excess balance settled on checkout'
  }
];

// 9. Foreign Currency Encashment Log (Live)
export const INITIAL_FOREX_LOG = [
  {
    certNo: `FLM-${currentYear}-001`,
    date: INITIAL_ACCOUNTING_DATE,
    guestName: 'MR ROBERT JOHN SMITH',
    nationality: 'United Kingdom',
    passportNo: '984120391',
    roomNo: '301',
    currency: 'USD',
    foreignAmount: 200,
    exchangeRate: 83.50,
    grossInr: 16700,
    commissionPct: 1.0,
    commissionAmount: 167,
    netInrPaid: 16533,
    authorizedBy: 'IT ADMIN'
  }
];

// 10. Statutory GST Tax Invoices Log (Rule 46)
export const INITIAL_SETTLED_BILLS = [
  {
    billNo: '501',
    billDate: dateYesterday,
    roomNo: '106',
    guestName: 'MR ARVIND MEHTA',
    companyName: 'L&T Construction',
    gstin: '21AAACL0123P1ZQ',
    roomTariff: 1750,
    fnbTotal: 450,
    travelTotal: 0,
    discount: 0,
    taxableAmount: 2200,
    cgst: 132, // 6%
    sgst: 132, // 6%
    grandTotal: 2464,
    payMode: 'Credit Card',
    settledBy: 'IT ADMIN',
    status: 'Settled'
  },
  {
    billNo: '502',
    billDate: INITIAL_ACCOUNTING_DATE,
    roomNo: '201',
    guestName: 'MR VIKRAM SINGHANIA',
    companyName: 'JK Paper Mills Ltd',
    gstin: '21AAACJ0118P1ZX',
    roomTariff: 2050,
    fnbTotal: 420,
    travelTotal: 0,
    discount: 0,
    taxableAmount: 2470,
    cgst: 148.20,
    sgst: 148.20,
    grandTotal: 2766.40,
    payMode: 'Cash',
    settledBy: 'IT ADMIN',
    status: 'Settled'
  }
];

// Calculation Helpers
export function calculateGstBreakdown(taxableAmount, ratePct = 12) {
  const halfRate = ratePct / 2;
  const cgst = Number(((taxableAmount * halfRate) / 100).toFixed(2));
  const sgst = Number(((taxableAmount * halfRate) / 100).toFixed(2));
  const total = Number((taxableAmount + cgst + sgst).toFixed(2));
  return { cgst, sgst, ratePct, total };
}

// 11. Laundry Items Master
export const INITIAL_LAUNDRY_ITEMS = [
  {
    itemCode: '1',
    itemName: 'SHIRT',
    shortName: 'SHIRT',
    discountAllowed: 'Yes',
    costPct: '15',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '2',
    itemName: 'TROUSER',
    shortName: 'TROUSER',
    discountAllowed: 'Yes',
    costPct: '15',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '3',
    itemName: 'SUIT (2 PC)',
    shortName: 'SUIT',
    discountAllowed: 'Yes',
    costPct: '20',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '4',
    itemName: 'SAREE (SILK)',
    shortName: 'SAREE',
    discountAllowed: 'Yes',
    costPct: '20',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '5',
    itemName: 'KURTA PAJAMA',
    shortName: 'KURTA',
    discountAllowed: 'Yes',
    costPct: '15',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '6',
    itemName: 'BEDSHEET / LINEN',
    shortName: 'BEDSHT',
    discountAllowed: 'No',
    costPct: '10',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  }
];

// 12. Laundry Item Rate Master
export const INITIAL_LAUNDRY_RATES = [
  {
    itemCode: '1',
    itemName: 'SHIRT',
    applicableFrom: `01-JAN-${currentYear}`,
    serviceType: 'Washing',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 80,
    expressCharge: 120,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '1',
    itemName: 'SHIRT',
    applicableFrom: `01-JAN-${currentYear}`,
    serviceType: 'Pressing',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 40,
    expressCharge: 60,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '2',
    itemName: 'TROUSER',
    applicableFrom: `01-JAN-${currentYear}`,
    serviceType: 'Washing',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 90,
    expressCharge: 135,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '2',
    itemName: 'TROUSER',
    applicableFrom: `01-JAN-${currentYear}`,
    serviceType: 'Pressing',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 50,
    expressCharge: 75,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  },
  {
    itemCode: '3',
    itemName: 'SUIT (2 PC)',
    applicableFrom: `01-JAN-${currentYear}`,
    serviceType: 'Dry Cleaning',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 350,
    expressCharge: 500,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${INITIAL_ACCOUNTING_DATE} 10:00`
  }
];

// 13. House Keeping Staff Master (Authentic Hotel Elite Inn Staff)
export const INITIAL_HOUSEKEEPING_STAFF = [
  { code: '001', name: 'Raju Majhi', designation: 'Room Attendant', status: 'Active' },
  { code: '002', name: 'Santosh Gouda', designation: 'Senior Room Attendant', status: 'Active' },
  { code: '003', name: 'Sunil Nayak', designation: 'Linen Runner', status: 'Active' },
  { code: '004', name: 'Balaram Sahoo', designation: 'Laundry Operator', status: 'Active' },
  { code: '005', name: 'Pradeep Jena', designation: 'Houseman', status: 'Active' },
  { code: '006', name: 'Ashok Kumar', designation: 'Floor Supervisor', status: 'Active' },
  { code: '007', name: 'Geeta Pradhan', designation: 'Lady Room Attendant', status: 'Active' },
  { code: '008', name: 'Pooja Nayak', designation: 'Public Area Cleaner', status: 'Active' },
  { code: '009', name: 'Usha Kumari', designation: 'Linen Room Attendant', status: 'Active' }
];

// 14. Laundry Receipt Entry
export const INITIAL_LAUNDRY_ENTRIES = [
  {
    refNo: `LND-${currentYear}-001`,
    billTo: 'Guest A/C',
    roomNo: '105',
    guestName: 'MR RAMESH RAO',
    guestType: 'Regular',
    guestStatus: 'In-House',
    currency: 'Indian Rupees',
    rcvDate: INITIAL_ACCOUNTING_DATE,
    rcvTime: '09:00',
    deliveryDate: INITIAL_ACCOUNTING_DATE,
    deliveryTime: '18:00',
    collectedBy: '001 Raju Majhi',
    service: 'Pressing',
    rateType: 'Standard',
    remarks: 'Executive steam press requested',
    items: [
      { itemNo: '1', code: '2', name: 'TROUSER', qty: 2, rate: 50, discount: 0, amount: 100, remarks: '' },
      { itemNo: '2', code: '1', name: 'SHIRT', qty: 2, rate: 40, discount: 0, amount: 80, remarks: '' }
    ],
    grossAmount: 180,
    discountAmount: 0,
    taxAmount: 32.40, // 18% GST (SAC 999791)
    netAmount: 212.40,
    status: 'Pending Billing',
    settlementBillNo: '',
    tenderMode: ''
  }
];

// 15. Housekeeping & Guest Complaints
export const INITIAL_HOUSEKEEPING_COMPLAINTS = [
  {
    complaintId: `CMP-${currentYear}-001`,
    scope: 'Room',
    roomNo: '105',
    guestName: 'MR RAMESH RAO',
    arrival: dateYesterday,
    departure: NEXT_ACCOUNTING_DATE,
    department: 'Housekeeping',
    natureOfComplaint: 'Extra bath towels required & tea/coffee refill',
    receivedBy: 'MANAGER',
    date: INITIAL_ACCOUNTING_DATE,
    time: '10:04',
    status: 'Pending',
    attendedBy: '',
    actionTaken: '',
    tatMinutes: '',
    resolvedDate: '',
    resolvedTime: ''
  }
];

// 16. Lost and Found Register
export const INITIAL_LOST_AND_FOUND = [
  {
    refNo: `LF-${currentYear}-001`,
    module: 'Front Office',
    lostDate: dateYesterday,
    place: 'Room 203',
    article: 'Black Leather Men Wallet with PAN & Driving License',
    approxValue: 2500,
    finder: 'Raju Majhi',
    checkedBy: 'IT ADMIN',
    foundDate: dateYesterday,
    foundTime: '14:15',
    custodyLocker: 'HK-LOCKER-B01',
    status: 'In Safe Custody',
    returnedDate: '',
    whom: '',
    authorizedBy: '',
    guestName: 'MR VIKRAM PATEL',
    guestAddress: 'Plot 44, Saheed Nagar, Bhubaneswar, Odisha',
    phone: '+91-9937088122'
  }
];

// 17. Room Blocks Master (104: Deluxe Room maintenance)
export const INITIAL_ROOM_BLOCKS = [
  {
    blockId: `BLK-${currentYear}-001`,
    roomNo: '104',
    roomType: 'DLX',
    floor: 'Floor 1',
    blockType: 'OOO', // OOO (Out of Order)
    fromDate: INITIAL_ACCOUNTING_DATE,
    toDate: NEXT_ACCOUNTING_DATE,
    reasonCode: 'AC-REPAIR',
    reasonDescription: 'AC cooling coil replacement & maintenance servicing',
    authorizedBy: 'DUTY MANAGER',
    remarks: 'Scheduled for technician inspection',
    status: 'Active'
  }
];

// Laundry SAC 999791 GST 18% (9% CGST + 9% SGST)
export function calculateLaundryTax(grossAmount, discountAmount = 0) {
  const taxable = Math.max(0, grossAmount - discountAmount);
  const cgst = Number(((taxable * 9) / 100).toFixed(2));
  const sgst = Number(((taxable * 9) / 100).toFixed(2));
  const totalTax = Number((cgst + sgst).toFixed(2));
  const netAmount = Number((taxable + totalTax).toFixed(2));
  return { taxable, cgst, sgst, totalTax, netAmount };
}
