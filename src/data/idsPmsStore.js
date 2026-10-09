// IDS Fortune NEXT Unified Relational PMS State & Accounting Store
// Single source of truth for all 44 video modules & live hotel operations

import { HOTEL_CONFIG } from './hotelData';

export const INITIAL_ACCOUNTING_DATE = '25-JAN-2022';
export const NEXT_ACCOUNTING_DATE = '26-JAN-2022';

// 1. Corporate Master Directory (Videos 28, 31, 32, 43)
export const INITIAL_COMPANIES = [
  {
    code: 'COM0001',
    name: 'Tata Consultancy Services Ltd',
    shortName: 'TCS',
    address: 'TCS House, Raveline Street, Fort, Mumbai - 400001',
    gstin: '27AAACT2727Q1ZB',
    pan: 'AAACT2727Q',
    contactPerson: 'Mr. Rajesh Verma',
    designation: 'Admin Manager',
    phone: '022-67789999',
    email: 'travel.desk@tcs.com',
    creditLimit: 200000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC', // Bill to Company
    status: 'Active',
    linkedRateTable: '100'
  },
  {
    code: 'COM0002',
    name: 'Infosys Limited',
    shortName: 'INFOSYS',
    address: 'Electronics City, Hosur Road, Bangalore - 560100',
    gstin: '29AAACI4818K1ZW',
    pan: 'AAACI4818K',
    contactPerson: 'Ms. Priya Nair',
    designation: 'Procurement Lead',
    phone: '080-28520261',
    email: 'hotels@infosys.com',
    creditLimit: 150000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '101'
  },
  {
    code: 'COM0003',
    name: 'Vedanta Limited (Alumina Refinery)',
    shortName: 'VEDANTA',
    address: 'Lanjigarh, Dist. Kalahandi / Rayagada, Odisha - 766027',
    gstin: '21AAACV0552Q1ZN',
    pan: 'AAACV0552Q',
    contactPerson: 'Mr. S. Mohanty',
    designation: 'General Manager - Admin',
    phone: '06677-247000',
    email: 'admin.lanjigarh@vedanta.co.in',
    creditLimit: 300000,
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
    designation: 'Senior Manager',
    phone: '06856-222048',
    email: 'guestrelations@jkpaper.com',
    creditLimit: 250000,
    creditDays: 30,
    segment: 'CVG',
    billingType: 'BTC',
    status: 'Active',
    linkedRateTable: '100'
  }
];

// 2. Business Sources Master (Video 29)
export const INITIAL_BUSINESS_SOURCES = [
  { code: 'OTA', name: 'Online Travel Agent', shortName: 'OTA', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'WAL', name: 'Walk-In Direct', shortName: 'WALKIN', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'WEB', name: 'Hotel Direct Website (hotel-elite-inn.pages.dev)', shortName: 'DIRECT-WEB', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'URO', name: 'Unit Reservation Office', shortName: 'URO', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'USO', name: 'Unit Sales Office', shortName: 'USO', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'MMT', name: 'MakeMyTrip / Goibibo Direct OTA', shortName: 'MMT', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'BKG', name: 'Booking.com B.V.', shortName: 'BOOKING', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'DIR', name: 'Direct Call / Front Desk Telephone', shortName: 'PHONE', applicableFrom: '01-JAN-2022', status: 'Active' }
];

// 3. Market Segments Master (Video 30)
export const INITIAL_MARKET_SEGMENTS = [
  { code: 'CVG', name: 'Corporate Business / Commercial', shortName: 'CORP', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'FIT', name: 'Free Individual Traveler (Leisure/Direct)', shortName: 'FIT', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'GRP', name: 'Group Tour & Marriage Delegation', shortName: 'GROUP', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'GOV', name: 'Government Official / PSU Protocol', shortName: 'GOVT', applicableFrom: '01-JAN-2022', status: 'Active' },
  { code: 'AIR', name: 'Railway / Airlines Crew Accommodation', shortName: 'CREW', applicableFrom: '01-JAN-2022', status: 'Active' }
];

// 4. Negotiated Corporate Contract Rates (Videos 31 & 32)
export const INITIAL_CONTRACT_RATES = [
  {
    tableNo: '100',
    description: 'TCS & JK Paper Corporate Preferred Tariff',
    companyCode: 'COM0001',
    validFrom: '01-JAN-2022',
    validTo: '31-DEC-2022',
    rates: {
      standard: { single: 1200, double: 1200 },
      deluxe: { single: 1500, double: 1800 },
      executive: { single: 1800, double: 2200 },
      suite: { single: 2800, double: 3200 }
    },
    plan: 'CP', // Continental Plan (Includes Buffet Breakfast)
    taxInclusive: false
  },
  {
    tableNo: '101',
    description: 'Infosys Special Corporate Tariff',
    companyCode: 'COM0002',
    validFrom: '01-JAN-2022',
    validTo: '31-DEC-2022',
    rates: {
      standard: { single: 1250, double: 1250 },
      deluxe: { single: 1550, double: 1900 },
      executive: { single: 1900, double: 2300 },
      suite: { single: 2900, double: 3400 }
    },
    plan: 'CP',
    taxInclusive: false
  },
  {
    tableNo: '102',
    description: 'Vedanta Alumina Resident Vendor Agreement',
    companyCode: 'COM0003',
    validFrom: '01-JAN-2022',
    validTo: '31-DEC-2022',
    rates: {
      standard: { single: 1400, double: 1400 },
      deluxe: { single: 1700, double: 2100 },
      executive: { single: 2000, double: 2400 },
      suite: { single: 3000, double: 3500 }
    },
    plan: 'MAP', // Modified American Plan (Breakfast + Dinner)
    taxInclusive: false
  }
];

// 5. Package Rates Master (Video 40)
export const INITIAL_PACKAGE_RATES = [
  {
    code: 'PKG-CORP',
    name: 'Corporate Executive Bed & Board Package',
    tier: 'executive',
    totalTariff: 2950,
    split: {
      roomTariff: 2050,
      buffetBreakfast: 300,
      dinnerBuffet: 600
    },
    sacCode: '996311',
    taxRate: 12
  },
  {
    code: 'PKG-TEMPLE',
    name: 'Maa Majhighariani Darshan Pilgrimage Package',
    tier: 'deluxe',
    totalTariff: 3600,
    split: {
      roomTariff: 1750,
      breakfast: 250,
      darshanCabAssistance: 1200,
      eveningSnacks: 400
    },
    sacCode: '996311',
    taxRate: 12
  }
];

// 6. In-House Occupied Rooms & Active Guest Folios (Videos 05, 10, 14, 15, 18, 21–27, 44)
export const INITIAL_INHOUSE_GUESTS = [
  {
    roomNo: '314',
    folioNo: '314/1',
    regNo: '612',
    guestName: 'MR RAJESH SHARMA',
    gender: 'M',
    phone: '+91-9845012345',
    email: 'r.sharma@tcs.com',
    companyCode: 'COM0001',
    companyName: 'Tata Consultancy Services Ltd',
    gstin: '27AAACT2727Q1ZB',
    pax: 1,
    paxList: ['MR RAJESH SHARMA'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: '23-JAN-2022',
    departureDate: '26-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 5650,
    totalCharges: 7650,
    depositAmount: 2000,
    stopPosting: false,
    vipStatus: 'VIP-2',
    idType: 'Aadhaar Card',
    idNumber: '7845-9012-3456',
    remarks: 'High floor, early breakfast required'
  },
  {
    roomNo: '312',
    folioNo: '312/1',
    regNo: '615',
    guestName: 'MS BASU ANIRUDH',
    gender: 'F',
    phone: '+91-9437012389',
    email: 'basu.anirudh@gmail.com',
    companyCode: '',
    companyName: '',
    gstin: '',
    pax: 1,
    paxList: ['MS BASU ANIRUDH'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2500,
    discountPct: 0,
    planCode: 'EP',
    arrivalDate: '24-JAN-2022',
    departureDate: '26-JAN-2022',
    expectedCheckoutTime: '11:00',
    balance: 13460,
    totalCharges: 13460,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Passport',
    idNumber: 'Z5891240',
    remarks: 'Second occupant arriving evening'
  },
  {
    roomNo: '311',
    folioNo: '311/1',
    regNo: '617',
    guestName: 'MRS DEURI KABITA',
    gender: 'F',
    phone: '+91-9778019922',
    email: 'kabita.deuri@vedanta.co.in',
    companyCode: 'COM0003',
    companyName: 'Vedanta Limited',
    gstin: '21AAACV0552Q1ZN',
    pax: 1,
    paxList: ['MRS DEURI KABITA'],
    tier: 'deluxe',
    roomType: 'DLX',
    tariff: 1750,
    discountPct: 10,
    planCode: 'CP',
    arrivalDate: '24-JAN-2022',
    departureDate: '27-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 3500,
    totalCharges: 3500,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Driving License',
    idNumber: 'OD-05-2018-9901',
    remarks: 'Quiet room away from lift'
  },
  {
    roomNo: '201',
    folioNo: '201/1',
    regNo: '608',
    guestName: 'MR VIKRAM SINGHANIA',
    gender: 'M',
    phone: '+91-9937088122',
    email: 'vikram.singhania@jkpaper.com',
    companyCode: 'COM0004',
    companyName: 'JK Paper Mills Ltd',
    gstin: '21AAACJ0118P1ZX',
    pax: 1,
    paxList: ['MR VIKRAM SINGHANIA'],
    tier: 'suite',
    roomType: 'SUI',
    tariff: 3250,
    discountPct: 0,
    planCode: 'MAP',
    arrivalDate: '22-JAN-2022',
    departureDate: '26-JAN-2022',
    expectedCheckoutTime: '10:00',
    balance: 4250,
    totalCharges: 9250,
    depositAmount: 5000,
    stopPosting: true, // Video 27: Stop Posting Active!
    vipStatus: 'VIP-1',
    idType: 'Aadhaar Card',
    idNumber: '8910-1122-3344',
    remarks: 'Stop posting applied due to bill threshold limit'
  },
  {
    roomNo: '202',
    folioNo: '202/1',
    regNo: '610',
    guestName: 'MR SUNIL ROY',
    gender: 'M',
    phone: '+91-9861044321',
    email: 'sunilroy@infosys.com',
    companyCode: 'COM0002',
    companyName: 'Infosys Limited',
    gstin: '29AAACI4818K1ZW',
    pax: 1,
    paxList: ['MR SUNIL ROY'],
    tier: 'deluxe',
    roomType: 'DLX',
    tariff: 1750,
    discountPct: 0,
    planCode: 'EP',
    arrivalDate: '23-JAN-2022',
    departureDate: '25-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 2500,
    totalCharges: 2500,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Aadhaar Card',
    idNumber: '3344-5566-7788',
    remarks: ''
  },
  {
    roomNo: '205',
    folioNo: '205/1',
    regNo: '614',
    guestName: 'MR ANAND VERMA',
    gender: 'M',
    phone: '+91-9437199001',
    email: 'anand.verma@gmail.com',
    companyCode: '',
    companyName: '',
    gstin: '',
    pax: 1,
    paxList: ['MR ANAND VERMA'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 2050,
    discountPct: 0,
    planCode: 'CP',
    arrivalDate: '24-JAN-2022',
    departureDate: '26-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 5190,
    totalCharges: 5190,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Voter ID',
    idNumber: 'OD/27/102/09912',
    remarks: ''
  },
  {
    roomNo: '406',
    folioNo: '406/1',
    regNo: '601',
    guestName: 'SHARMA GROUP (DELEGATION LEAD)',
    gender: 'M',
    phone: '+91-9811099233',
    email: 'events@sharmagroup.com',
    companyCode: '',
    companyName: 'Sharma Group & Family',
    gstin: '',
    pax: 10,
    paxList: ['MR DEEPAK SHARMA', 'MR ASHOK SHARMA', 'MS RITU SHARMA'],
    tier: 'executive',
    roomType: 'EXE',
    tariff: 20500,
    discountPct: 15,
    planCode: 'CP',
    arrivalDate: '21-JAN-2022',
    departureDate: '25-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 0,
    totalCharges: 61500,
    depositAmount: 61500,
    stopPosting: false,
    vipStatus: 'Group Master',
    idType: 'PAN Card',
    idNumber: 'AALPS9011F',
    remarks: 'Video 16: Bulk checkout ready for 10 rooms'
  },
  {
    roomNo: '415',
    folioNo: '415/1',
    regNo: '609',
    guestName: 'MR DEEPAK JOSHI',
    gender: 'M',
    phone: '+91-9438012999',
    email: 'deepak.joshi@gmail.com',
    companyCode: '',
    companyName: '',
    gstin: '',
    pax: 1,
    paxList: ['MR DEEPAK JOSHI'],
    tier: 'deluxe',
    roomType: 'DLX',
    tariff: 1750,
    discountPct: 0,
    planCode: 'EP',
    arrivalDate: '23-JAN-2022',
    departureDate: '26-JAN-2022',
    expectedCheckoutTime: '12:00',
    balance: 3500,
    totalCharges: 3500,
    depositAmount: 0,
    stopPosting: false,
    vipStatus: 'Regular',
    idType: 'Aadhaar Card',
    idNumber: '1122-3344-5566',
    remarks: 'Video 13: Room transfer target room (AC cooling issue)'
  }
];

// 7. Active Advance Deposit Receipts (Videos 14, 35, 39)
export const INITIAL_DEPOSITS_LOG = [
  {
    receiptNo: 'RCP-1042',
    date: '24-JAN-2022',
    time: '14:30',
    roomNo: '201',
    folioNo: '201/1',
    guestName: 'MR VIKRAM SINGHANIA',
    amount: 5000,
    tenderMode: 'Credit Card (Visa)',
    cardLast4: '4112',
    cashier: 'IT ADMIN',
    remarks: 'Advance collected towards 4-night stay'
  },
  {
    receiptNo: 'RCP-1043',
    date: '23-JAN-2022',
    time: '11:15',
    roomNo: '314',
    folioNo: '314/1',
    guestName: 'MR RAJESH SHARMA',
    amount: 2000,
    tenderMode: 'UPI / QR',
    upiRef: '202401239912@upi',
    cashier: 'DUTY MANAGER',
    remarks: 'Partial advance deposit'
  },
  {
    receiptNo: 'RCP-1040',
    date: '21-JAN-2022',
    time: '09:00',
    roomNo: '406',
    folioNo: '406/1',
    guestName: 'SHARMA GROUP',
    amount: 61500,
    tenderMode: 'NEFT / Bank Transfer',
    bankRef: 'UTR99102456',
    cashier: 'IT ADMIN',
    remarks: 'Full group advance paid'
  }
];

// 8. Paid-Out Cash Refund Vouchers (Videos 44, 35)
export const INITIAL_PAID_OUTS_LOG = [
  {
    voucherNo: 'PO-2022-089',
    date: '25-JAN-2022',
    time: '16:45',
    roomNo: '203',
    folioNo: '203/1',
    guestName: 'MR K. S. PATNAIK',
    excessAmount: 2500,
    refundMode: 'Cash from FO Cashier Till',
    authorizedBy: 'DUTY MANAGER',
    cashier: 'IT ADMIN',
    reason: 'Advance deposit excess refund on early checkout'
  }
];

// 9. Foreign Currency Encashment Log (Video 42)
export const INITIAL_FOREX_LOG = [
  {
    certNo: 'FLM-2022-004',
    date: '25-JAN-2022',
    guestName: 'MR ROBERT JOHN SMITH',
    nationality: 'United Kingdom',
    passportNo: '984120391',
    roomNo: '301',
    currency: 'USD',
    foreignAmount: 200,
    exchangeRate: 74.50,
    grossInr: 14900,
    commissionPct: 1.0,
    commissionAmount: 149,
    netInrPaid: 14751,
    authorizedBy: 'IT ADMIN'
  }
];

// 10. Statutory GST Tax Invoices Log (Rule 46) (Videos 15, 36, 43)
export const INITIAL_SETTLED_BILLS = [
  {
    billNo: '503',
    billDate: '24-JAN-2022',
    roomNo: '204',
    guestName: 'MR ARVIND MEHTA',
    companyName: 'L&T Construction',
    gstin: '27AAACL0123P1ZQ',
    roomTariff: 4500,
    fnbTotal: 850,
    travelTotal: 0,
    discount: 450,
    taxableAmount: 4900,
    cgst: 294, // 6%
    sgst: 294, // 6%
    grandTotal: 5488,
    payMode: 'Credit Card',
    settledBy: 'IT ADMIN',
    status: 'Settled'
  },
  {
    billNo: '511',
    billDate: '25-JAN-2022',
    roomNo: '201',
    guestName: 'MR VIKRAM SINGHANIA',
    companyName: 'JK Paper Mills Ltd',
    gstin: '21AAACJ0118P1ZX',
    roomTariff: 3250,
    fnbTotal: 420,
    travelTotal: 0,
    discount: 0,
    taxableAmount: 3670,
    cgst: 220.20,
    sgst: 220.20,
    grandTotal: 4110.40,
    payMode: 'Cash',
    settledBy: 'IT ADMIN',
    status: 'Reinstate Candidate' // Video 26 target
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
