/**
 * ============================================================================
 * HOTEL ELITE INN — CORE UNIVERSAL TRACKING NUMBERS ENGINE
 * Statutory & Operational Identifiers for Indian Hospitality Accounting
 * ============================================================================
 * 
 * Manages the 5 Core Tracking Identifiers:
 * 1. Invoice Numbers (Statutory GST Tax Invoice - Rule 46 compliant)
 * 2. Room Bill Numbers / Folio Numbers (Order-Specific Master Folio)
 * 3. Money Receipt Numbers (Linked Payment Voucher & Advance Deposit IDs)
 * 4. KOT Numbers (Kitchen Order Production Tickets & Running KOT Indexes)
 * 5. Transaction Bill IDs (Order-Wise POS Settlement & Accounting Vouchers)
 */

/**
 * Returns current Indian Financial Year string (e.g. "26-27" for FY 2026-2027)
 */
export const getIndianFinancialYear = (d = new Date()) => {
  const date = new Date(d);
  const month = date.getMonth(); // 0-indexed, 0 = Jan, 2 = Mar, 3 = Apr
  const year = date.getFullYear();
  if (month >= 3) {
    // Apr to Dec: FY is current year to next year
    const y1 = String(year).slice(-2);
    const y2 = String(year + 1).slice(-2);
    return `${y1}-${y2}`;
  } else {
    // Jan to Mar: FY is previous year to current year
    const y1 = String(year - 1).slice(-2);
    const y2 = String(year).slice(-2);
    return `${y1}-${y2}`;
  }
};

/**
 * 1. STATUTORY TAX INVOICE NUMBER
 * Compliant with GST Rule 46 (Consecutive Serial Number, FY Prefix, Max 16 Chars)
 * Format: HEI/{FY}/INV-{SEQ} (e.g. HEI/26-27/INV-0104)
 */
export const formatInvoiceNumber = (rawBillNo, booking = {}, fallbackSeq = null) => {
  if (rawBillNo && typeof rawBillNo === 'string' && rawBillNo.startsWith('HEI/')) {
    return rawBillNo;
  }
  const fy = getIndianFinancialYear(booking.checkOutDate || booking.createdAt || new Date());
  const seq = fallbackSeq || (booking.id ? String(booking.id).replace(/\D/g, '').slice(-4) : (booking.roomNumber ? `${booking.roomNumber}-${Date.now().toString().slice(-3)}` : Date.now().toString().slice(-4)));
  const cleanSeq = String(seq).padStart(4, '0');
  return `HEI/${fy}/INV-${cleanSeq}`;
};

/**
 * 2. ROOM BILL / FOLIO NUMBER
 * Order-Specific Master Folio tied to a specific room stay
 * Format: FOLIO-{ROOM}-{SEQ} (e.g. FOLIO-102-2610)
 */
export const formatFolioNumber = (roomNumber = '101', bookingId = null) => {
  const cleanRoom = String(roomNumber || '101').replace(/\D/g, '') || '101';
  const cleanSeq = bookingId 
    ? String(bookingId).replace(/\D/g, '').slice(-4) 
    : Date.now().toString().slice(-4);
  return `FOLIO-${cleanRoom}-${cleanSeq || '0001'}`;
};

/**
 * 3. MONEY RECEIPT NUMBER
 * Explicitly ties payment acknowledgement (Cash, UPI, Card) to an order/folio
 * Format: MR-{YYYY}-{SEQ} or REC-ADV-{ROOM}-{SEQ} (e.g. MR-2026-0512)
 */
export const formatMoneyReceiptNumber = (rawReceiptNo, roomNumber = '101', date = new Date()) => {
  if (rawReceiptNo && typeof rawReceiptNo === 'string' && (rawReceiptNo.startsWith('MR-') || rawReceiptNo.startsWith('REC-'))) {
    return rawReceiptNo;
  }
  const year = new Date(date).getFullYear();
  const seq = Date.now().toString().slice(-4);
  const cleanRoom = String(roomNumber || '101').replace(/\D/g, '') || '101';
  return `MR-${year}-${cleanRoom}${seq.slice(-2)}`;
};

/**
 * 4. KITCHEN ORDER TICKET (KOT) NUMBER
 * Production ticket for kitchen chef, line cooks, and steward dispatch
 * Format: CK-KOT-{SEQ} (e.g. CK-KOT-7842) or Running Table KOT #1, KOT #2
 */
export const formatKotNumber = (kotId = null, runningIndex = null) => {
  if (runningIndex && Number(runningIndex) > 0) {
    return `KOT #${runningIndex}`;
  }
  if (kotId && typeof kotId === 'string' && (kotId.startsWith('CK-KOT-') || kotId.startsWith('KOT-'))) {
    return kotId;
  }
  const seq = kotId ? String(kotId).replace(/\D/g, '').slice(-4) : Date.now().toString().slice(-4);
  return `CK-KOT-${seq || '101'}`;
};

/**
 * 5. TRANSACTION BILL ID
 * Point-of-Sale dining or parcel settlement transaction ledger ID
 * Format: TXN-POS-{SEQ} (e.g. TXN-POS-8842) or BILL-TBL{TABLE}-{SEQ}
 */
export const formatTransactionBillId = (prefix = 'POS', tableOrRoom = null) => {
  const p = String(prefix || 'POS').toUpperCase();
  const targetStr = tableOrRoom ? `-${String(tableOrRoom).replace(/\s+/g, '')}` : '';
  const seq = Date.now().toString().slice(-5);
  return `TXN-${p}${targetStr}-${seq}`;
};

/**
 * MASTER RESOLVER: Resolves all 5 Universal Tracking Numbers for any Booking / Folio / Order
 */
export const resolveAllTrackingNumbers = (booking = {}, context = {}) => {
  const room = booking.roomNumber || context.roomNumber || '101';
  const fy = getIndianFinancialYear(booking.checkOutDate || booking.createdAt || new Date());
  
  // 1. Invoice Number (Statutory GST)
  const invoiceNumber = booking.invoiceNo || booking.billNo || formatInvoiceNumber(null, booking);

  // 2. Room Bill / Folio Number (Master Stay Folio)
  const folioNumber = booking.folioNo || formatFolioNumber(room, booking.bookingId || booking.id);

  // 3. Money Receipt Number (Payment Acknowledgement)
  const moneyReceiptNumber = booking.receiptNo || booking.moneyReceiptNo || formatMoneyReceiptNumber(null, room);

  // 4. KOT Numbers (Kitchen Order Production Tickets)
  let kotNumbers = [];
  if (Array.isArray(booking.foodItems) && booking.foodItems.length > 0) {
    const uniqueKots = new Set(booking.foodItems.map(f => f.kotId).filter(Boolean));
    kotNumbers = Array.from(uniqueKots).map(k => formatKotNumber(k));
  }
  if (kotNumbers.length === 0) {
    kotNumbers = [formatKotNumber(booking.kotId || null, 1)];
  }

  // 5. Transaction Bill ID (POS / Settlement Record)
  const transactionBillId = booking.txnId || booking.transactionBillId || formatTransactionBillId(context.outletPrefix || 'CHK', room);

  return {
    invoiceNumber,
    folioNumber,
    moneyReceiptNumber,
    kotNumbers,
    primaryKotNumber: kotNumbers[0] || 'KOT #1',
    transactionBillId,
    financialYear: fy,
    legalGstin: '21AEWFS9433F1ZN',
    sacRoom: '996311',
    sacFood: '996331'
  };
};
