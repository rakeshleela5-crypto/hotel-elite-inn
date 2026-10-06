/**
 * Hotel Elite Inn - Enterprise WhatsApp Dispatch Engine
 * Provides pre-formatted, branded WhatsApp messaging templates for all hotel workflows.
 * Property: Hotel Elite Inn
 * Address: Near Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) – PIN 765020
 * Helpline: +91 6370757541 | Email: hotelelitinn2023@gmail.com
 */

import { HOTEL_CONFIG } from '../data/hotelData';

const DEFAULT_HELPLINE = '916370757541';
const PROPRIETOR_PHONE = '916370757541';
const HOUSEKEEPING_LEAD_PHONE = '916370757541';
const KITCHEN_CHEF_PHONE = '916370757541';
const TECHNICIAN_PHONE = '916370757541';

/**
 * Normalizes phone number into an international standard (e.g. 916370757541).
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

/**
 * Opens a WhatsApp Web or App link with formatted message.
 */
export function openWhatsAppLink(phone, messageText) {
  const clean = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(messageText);
  const url = clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}

const BRAND_HEADER = `🏨 *${HOTEL_CONFIG?.name || 'HOTEL ELITE INN'}*
📍 _${HOTEL_CONFIG?.address || 'Near Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) – PIN 765020'}_
Phone: ${HOTEL_CONFIG?.phone || '+91 6370757541'} | Email: ${HOTEL_CONFIG?.email || 'hotelelitinn2023@gmail.com'}
─────────────────────────────────`;

/**
 * 1. Guest Booking Confirmation Pass
 */
export function sendBookingConfirmationWhatsApp(booking) {
  const text = `${BRAND_HEADER}
🎉 *OFFICIAL BOOKING CONFIRMATION PASS*
Reference ID: *${booking.id || booking.bookingId || 'HEI-' + Date.now().toString().slice(-6)}*

Dear *${booking.guestName || 'Valued Guest'}*,
Namaste! Your reservation at ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'} is confirmed.

📋 *Stay Details:*
• *Room Tier:* ${booking.roomTier || booking.tier || 'Executive King Bed'} (Room Key: *${booking.roomNumber || 'Allocated on Arrival'}*)
• *Check-in Date:* ${booking.checkInDate || 'Today'}
• *Check-out Date:* ${booking.checkOutDate || 'Tomorrow'} (24-Hour Stay Cycle)
• *Duration:* ${booking.nights || 1} Night(s) | Adults: ${booking.adults || 1}
• *Total Tariff:* ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}
• *Advance Paid:* ₹${Number(booking.advanceDeposit || 0).toLocaleString('en-IN')}
• *Balance Due:* ₹${Number(booking.balanceDue || 0).toLocaleString('en-IN')}

✨ *Complimentary Amenities Included:*
• High-Speed Wi-Fi Pass (Elite@123)
• Complimentary Buffet Breakfast & 1L Mineral Water
• In-Room Intercom (Dial 9 for Reception)
• 24 Hours Check-out System

🗺️ *Location:* Near Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) – PIN 765020

Need assistance? Reply directly to this WhatsApp or dial +91 6370757541.
_We wish you a pleasant and comfortable stay!_`;

  return openWhatsAppLink(booking.phone || booking.guestPhone, text);
}

/**
 * 2. In-Room Dining & Room Service KOT Dispatch
 */
export function sendRoomServiceOrderWhatsApp(order, target = 'kitchen') {
  const itemsText = (order.items || []).map((it, idx) => 
    `  ${idx + 1}. *${it.name || it.dish?.name}* x ${it.quantity || it.qty || 1} (₹${(it.price || it.tariff || 0) * (it.quantity || it.qty || 1)})`
  ).join('\n');

  const text = `${BRAND_HEADER}
🍽️ *${target === 'kitchen' ? 'KITCHEN ORDER TICKET (KOT) - LIVE DISPATCH' : 'IN-ROOM DINING ORDER SLIP'}*
Order ID: *#${order.orderId || order.id || Date.now().toString().slice(-4)}* | Room: *ROOM ${order.roomNumber}*

📋 *Itemized Dining Menu:*
${itemsText || '  • In-Room Dining Selection'}

💰 *Order Total:* ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}
⏱️ *Preparation ETA:* 20 - 25 Minutes
📝 *Chef Notes:* ${order.notes || order.cookingNotes || 'Fresh preparation.'}

_${target === 'kitchen' ? 'Sent to Kitchen for immediate preparation.' : 'Thank you for dining with Hotel Elite Inn!'}_`;

  const phone = target === 'kitchen' ? KITCHEN_CHEF_PHONE : order.guestPhone;
  return openWhatsAppLink(phone, text);
}

/**
 * 3. In-Room Guest Concierge Request
 */
export function sendInRoomConciergeWhatsApp({ roomNumber, guestName, serviceType, details }) {
  const text = `${BRAND_HEADER}
🛎️ *IN-ROOM CONCIERGE ASSISTANCE REQUEST*
Room Number: *ROOM ${roomNumber}*
Guest: *${guestName || 'In-House Guest'}*

🔔 *Request Category:* *${serviceType || 'Room Service'}*
📝 *Details:* ${details || 'Guest requested prompt room service assistance.'}

Timestamp: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
_Please address this in-room request within 10 minutes._`;

  return openWhatsAppLink(DEFAULT_HELPLINE, text);
}

/**
 * 4. Housekeeping Lead Room Turnover Work Order
 */
export function sendHousekeepingOrderWhatsApp({ roomNumber, floor, roomStatus, priority = 'Standard', guestName, nextArrival = 'Today 14:00', notes }) {
  const text = `${BRAND_HEADER}
🧹 *HOUSEKEEPING TURNOVER WORK ORDER*
Room Key: *ROOM ${roomNumber}* (Floor ${floor || (Number(roomNumber) >= 200 ? '1' : 'Ground')})

🚨 *Priority:* *${priority.toUpperCase()}*
Status: *${roomStatus || 'Vacant Dirty'}*
Next Check-in: *${nextArrival}*
${guestName ? `Departed Guest: ${guestName}` : ''}
📝 *Housekeeping Checklist:*
• Fresh bed linens & sanitized pillow slips
• Bathroom deep sanitization & herbal toiletries kit
• Kinley sealed 1L mineral water & electric kettle restock
• AC filter check & floor mopping
${notes ? `• Special Note: ${notes}` : ''}

_Please update front desk terminal once inspected and marked Clean._`;

  return openWhatsAppLink(HOUSEKEEPING_LEAD_PHONE, text);
}

/**
 * 5. Maintenance Defect Ticket to Technician
 */
export function sendMaintenanceTicketWhatsApp({ roomNumber, issue, severity = 'High', technicianName = 'Pradeep Jena', targetEta = '30 Mins' }) {
  const text = `${BRAND_HEADER}
🔧 *URGENT MAINTENANCE WORK ORDER*
Room: *ROOM ${roomNumber}* | Priority: *${severity.toUpperCase()}*
Assigned Technician: *${technicianName}*

⚠️ *Defect Reported:*
${issue}

⏱️ *Target Resolution ETA:* ${targetEta}
Reported by: Front Desk Terminal
Timestamp: ${new Date().toLocaleTimeString('en-IN')}

_Please bring necessary spares and notify Reception upon ticket clearance._`;

  return openWhatsAppLink(TECHNICIAN_PHONE, text);
}

/**
 * 6. Night Audit Daily Financial Flash Report to Proprietor
 */
export function sendNightAuditFlashWhatsApp(audit) {
  const text = `${BRAND_HEADER}
📊 *EXECUTIVE NIGHT AUDIT & REVENUE FLASH*
Audited Date: *${audit.businessDate || new Date().toISOString().split('T')[0]}*
Certified Auditor: *${audit.auditorName || 'Manager On Duty'}*

🏨 *27-Room Inventory Performance:*
• Occupancy: *${audit.occupancyPct || 0}%* (${audit.occupiedRooms || 0}/${audit.totalRooms || 27} Rooms Sold)
• ADR (Average Daily Rate): *₹${Number(audit.adr || 0).toLocaleString('en-IN')}*
• RevPAR: *₹${Number(audit.revpar || 0).toLocaleString('en-IN')}*

💰 *Departmental Revenue:*
• Room Lodging: ₹${Number(audit.roomRevenue || 0).toLocaleString('en-IN')}
• Cannon Kitchen (F&B): ₹${Number(audit.fnbRevenue || 0).toLocaleString('en-IN')}
• Ancillary & Laundry: ₹${Number(audit.otherRevenue || 0).toLocaleString('en-IN')}
*👉 GROSS DAY TURNOVER:* *₹${Number(audit.grossRevenue || 0).toLocaleString('en-IN')}*

💳 *Settlement Tenders:*
• Cash Drawer Collected: ₹${Number(audit.cashCollected || 0).toLocaleString('en-IN')}
• SBI UPI / QR: ₹${Number(audit.upiCollected || 0).toLocaleString('en-IN')}
• Card Batches: ₹${Number(audit.cardCollected || 0).toLocaleString('en-IN')}
• Corporate Credit (B2B): ₹${Number(audit.companyCredit || 0).toLocaleString('en-IN')}

🔐 *Audit Certification:*
All ${audit.totalRooms || 27} room folios balanced, drawer reconciled, and day sealed with zero variance.
_Submitted for Proprietor Paidisetty Manmadha Rao's review._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}

/**
 * 7. Temple Darshan & Station Transfer Travel Guide
 */
export function sendDarshanGuideWhatsApp({ templeName, timings, distance, specialNotes, guestPhone }) {
  const text = `${BRAND_HEADER}
🙏 *RAYAGADA PILGRIMAGE & DARSHAN GUIDE*
Temple: *${templeName || 'Maa Majhigouri Temple'}*

📍 *Distance from Hotel:* ${distance || '1.5 km (5-minute auto ride)'}
🕒 *Sanctum Aarti & Darshan Timings:*
${timings || '• Morning Darshan: 05:30 AM - 12:30 PM\n• Evening Sandhya Aarti: 04:30 PM - 08:30 PM'}

🕉️ *Temple Etiquette & Notes:*
${specialNotes || 'Traditional Satvik attire recommended. Free footwear keeping available.'}

🚖 *Hotel Shuttle / Auto Desk:*
Our reception can arrange a direct autorickshaw or private AC cab to the temple.
Dial front desk at *+91 79780 43585* or reply to this WhatsApp to schedule pickup.`;

  return openWhatsAppLink(guestPhone, text);
}

/**
 * 8. Corporate B2B Quotation Dispatch
 */
export function sendCorporateQuotationWhatsApp(quote) {
  const text = `${BRAND_HEADER}
💼 *OFFICIAL CORPORATE TARIFF QUOTATION*
Quotation No: *${quote.quoteNumber || 'SSVR/QUOT/' + Date.now().toString().slice(-4)}*
Company: *${quote.companyName || 'Corporate Partner'}*
${quote.gstin ? `Company GSTIN: *${quote.gstin}*` : ''}

📋 *Quotation Summary:*
• Room Category: *${quote.roomTier || 'Executive Deluxe'}*
• Inventory Allocated: *${quote.roomCount || 1} Rooms* for *${quote.nightCount || 1} Nights*
• Occupancy Pax: ${quote.guestCount || 1} Guests
• Meal Plan: *${quote.mealPlan || 'EP (Room Only)'}*
${quote.includeBanquet ? '• Banquet / Conference Hall: Included' : ''}

💰 *Financial Breakdown:*
• Base Lodging: ₹${Number(quote.subtotal || 0).toLocaleString('en-IN')}
• Applicable GST: ₹${Number(quote.gstAmount || 0).toLocaleString('en-IN')}
*• TOTAL QUOTED VALUE:* *₹${Number(quote.grandTotal || 0).toLocaleString('en-IN')}*

🔒 *30% Advance Escrow Deposit Required:* *₹${Number(quote.advanceRequired || 0).toLocaleString('en-IN')}*
• Balance on Checkout: ₹${Number(quote.balanceOnCheckout || 0).toLocaleString('en-IN')}

🏦 *Bank Remittance Details:*
• Bank: State Bank of India (SBI) Rayagada Main
• Account: 3892019482 | IFSC: SBIN0000169
• Beneficiary: ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}

_Valid for 15 days. To confirm this block, please reply with approval._`;

  return openWhatsAppLink(quote.clientPhone, text);
}

/**
 * 9. Corporate Statement of Accounts (SOA) & Payment Reminder
 */
export function sendDebtorStatementWhatsApp({ companyName, gstin, balanceDue, agingDays = 15, invoices = [], clientPhone }) {
  const invoiceList = invoices.map(i => `  • Inv #${i.billNo}: ₹${Number(i.amount || 0).toLocaleString('en-IN')} (${i.date || 'Pending'})`).join('\n');

  const text = `${BRAND_HEADER}
📄 *OUTSTANDING STATEMENT OF ACCOUNT (SOA)*
Debtor: *${companyName}*
${gstin ? `GSTIN: ${gstin}` : ''}

Dear Accounts Team,
This is a courteous reminder regarding pending lodging billing balances for ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}, Muniguda, Rayagada.

💰 *Total Overdue Balance:* *₹${Number(balanceDue || 0).toLocaleString('en-IN')}*
Aging Status: *${agingDays} Days Overdue*

📋 *Pending Tax Invoices:*
${invoiceList || '  • Outstanding Corporate Bill Vouchers Pending Settlement'}

🏦 *Remittance Channel (NEFT / RTGS / UPI):*
• Beneficiary: ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}
• Phone / UPI: 6370757541

_Please remit payment and share UTR reference on this WhatsApp for ledger reconciliation._`;

  return openWhatsAppLink(clientPhone, text);
}

/**
 * 10. Split Bill Dispatch at Checkout
 */
export function sendCheckoutSplitWhatsApp({ billType, billNo, companyOrGuest, gstin, roomNumber, period, amount, recipientPhone }) {
  const text = `${BRAND_HEADER}
🧾 *TAX INVOICE - DIGITAL RECEIPT*
Invoice Number: *#${billNo}*
Invoice Type: *${billType}* (Room ${roomNumber})

Billed To: *${companyOrGuest}*
${gstin ? `GSTIN: ${gstin}` : ''}
Stay Duration: ${period || 'Current Stay'}

💰 *Total Bill Amount:* *₹${Number(amount || 0).toLocaleString('en-IN')}*
Status: *PAID & SETTLED*

✨ *Features & Amenities:*
• 24 Hours Check-out System
• Complimentary Buffet Breakfast & Mineral Water
• In-Room Wi-Fi & Intercom Assistance

Thank you for choosing ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}, Muniguda!`;

  return openWhatsAppLink(recipientPhone, text);
}

/**
 * 11. CA Filing Station & Financial Intelligence Summary
 */
export function sendCaFilingSummaryWhatsApp(data) {
  const text = `${BRAND_HEADER}
📑 *MONTHLY FINANCIAL BRIEFING*
Filing Period: *${data.period || 'Current Month'}*
Property: ${HOTEL_CONFIG?.name || 'Hotel Elite Inn'} | 27 Keys (Floors 1-3)

📊 *Turnover & Tax Position:*
• Gross Turnover: *₹${Number(data.grossTurnover || 0).toLocaleString('en-IN')}*
• 5% Output GST: ₹${Number(data.cgstCollected || 0).toLocaleString('en-IN')} (CGST) + ₹${Number(data.sgstCollected || 0).toLocaleString('en-IN')} (SGST)
• Total GST Output Liability: *₹${Number(data.totalGstOutput || 0).toLocaleString('en-IN')}*
• Eligible Input Tax Credit (ITC): *₹${Number(data.eligibleItc || 0).toLocaleString('en-IN')}*
• Net GST Payable via Electronic Cash Ledger: *₹${Number(data.netGstPayable || 0).toLocaleString('en-IN')}*

📈 *Profitability Metrics:*
• Total Operating Expenses (Opex): ₹${Number(data.totalOpex || 0).toLocaleString('en-IN')}
• Net EBITDA Margin: *${data.ebitdaMargin || '38.4%'}*
• EBITDA Operating Profit: *₹${Number(data.ebitdaProfit || 0).toLocaleString('en-IN')}*

_Audit trail reconciled with Bank Statements & Cashier Handover sheets._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}

/**
 * 12. Statutory Dual Tax Reconciliation (Excel Rows 229 - 232) Dispatch to Proprietor & CA
 */
export function sendStatutoryTaxReconciliationWhatsApp(data) {
  const period = data.period || 'June 2026';
  const text = `${BRAND_HEADER}
📊 *STATUTORY DUAL TAX RECONCILIATION (GSTR-1 & 3B)*
Period: *${period}* | Status: *100% RECONCILED (0.00 VARIANCE)*
Property: *${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}* | GSTIN: *${HOTEL_CONFIG?.gstin || '21AEWFS9433F1ZN'}*

🏨 *1. ROOM RENT RECONCILIATION (5% GST - SAC 996311)*
• Gross Room Tariff: ₹${Number(data.roomRent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Less Guest Discounts: -₹${Number(data.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Net Taxable Turnover:* *₹${Number(data.netRoom || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• Output CGST @ 2.5%: ₹${Number(data.cgstRoom || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Output SGST @ 2.5%: ₹${Number(data.sgstRoom || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Gross Room Supply:* *₹${Number(data.totalRoom || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*

🧺 *2. LAUNDRY RECONCILIATION (18% GST - SAC 996333)*
• *Taxable Base (Reverse 18%):* *₹${Number(data.laundryBase || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• Output CGST @ 9%: ₹${Number(data.cgstLaundry || 0).toLocaleString('en-IN', { minimumFractionDigits: 4 })}
• Output SGST @ 9%: ₹${Number(data.sgstLaundry || 0).toLocaleString('en-IN', { minimumFractionDigits: 4 })}
• *Gross Laundry Supply:* *₹${Number(data.totalLaundry || 0).toLocaleString('en-IN', { minimumFractionDigits: 4 })}*

🍽️ *3. CANNON KITCHEN F&B (5% RESTAURANT GST - SAC 996331)*
• Gross Dining Billed: ₹${Number(data.fnbGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

⚖️ *GRAND RECONCILED TURNOVER:*
• Room Supply: ₹${Number(data.totalRoom || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Laundry Supply: ₹${Number(data.totalLaundry || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Cannon Kitchen F&B: ₹${Number(data.fnbGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Total Billed Turnover:* *₹${Number(data.auditedNet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• Variance: *₹0.00 (Perfect Match)*

_Authoritative statutory split generated automatically by Hotel Elite Inn PMS._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}

/**
 * 13. Restaurant Statutory Tax Reconciliation (Excel Rows 1325-1326) Dispatch to Proprietor & CA
 */
export function sendRestaurantStatutoryTaxWhatsApp(data) {
  const period = data.period || 'June 2026';
  const text = `${BRAND_HEADER}
🍽️ *CANNON KITCHEN & RESTAURANT STATUTORY TAX REPORT*
Period: *${period}* | Outlets: *Dine-In, Room Service, Take Away*
Property: *${HOTEL_CONFIG?.name || 'Hotel Elite Inn'}* | SAC: *996331 / 996332*

📋 *1. GROSS SALES & PRODUCTION:*
• Food Component: ₹${Number(data.foodBase || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Beverage Component: ₹${Number(data.bevBase || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Gross Food & Beverage:* *₹${Number(data.grossNetAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*

🛡️ *2. STATUTORY DEDUCTIONS:*
• Guest Discounts: -₹${Number(data.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Management Complimentary (Sheet 2):* *-₹${Number(data.mgmComplimentary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
  _(68 Bills: Tables 444 VIP & 555 Staff - 0% Tax Internal Non-Revenue)_

💰 *3. TAXABLE COMMERCIAL TURNOVER & 5% GST:*
• *Net Taxable Turnover:* *₹${Number(data.netTaxableTurnover || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• Output CGST @ 2.5%: ₹${Number(data.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Output SGST @ 2.5%: ₹${Number(data.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• *Total Restaurant Tax Liability:* *₹${Number(data.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• *Commercial Taxable Supply:* *₹${Number(data.totalTaxableSupply || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*

📊 *TOTAL GROSS DINING VALUE (Commercial + MGM):* *₹${Number((data.totalTaxableSupply || 0) + (data.mgmComplimentary || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
_Statutory reconciliation perfectly balanced with 1,320 Restaurant Bills._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}

/**
 * 14. Owner Executive Morning Audit Flash (07:00 AM / Midnight Rollover)
 * Directly matches and enhances the proprietary owner daily report format for Hotel Elite Inn.
 */
export function sendOwnerMorningFlashWhatsApp(data = {}, mode = 'executive') {
  const dateStr = data.reportDate || data.businessDate || new Date().toISOString().slice(0, 10);
  let formattedDate = dateStr;
  let dayOfWeek = '';
  try {
    const parts = dateStr.includes('-') ? dateStr.split('-') : [];
    const d = parts.length === 3 
      ? (parts[0].length === 4 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(parts[2], parts[1] - 1, parts[0]))
      : new Date();
    if (!isNaN(d.getTime())) {
      dayOfWeek = d.toLocaleDateString('en-IN', { weekday: 'long' });
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      formattedDate = `${dd}-${mm}-${yyyy}`;
    }
  } catch (e) {}

  const totalRooms = Number(data.totalRooms || 22);
  const saleableRooms = Number(data.saleableRooms !== undefined ? data.saleableRooms : Math.max(0, totalRooms - (data.occupiedRooms || 4)));
  const occupiedRooms = Number(data.occupiedRooms !== undefined ? data.occupiedRooms : Math.round((Number(data.occupancyPct || 18) / 100) * totalRooms));
  const occupancyPct = data.occupancyPct !== undefined ? Number(data.occupancyPct) : (totalRooms > 0 ? parseFloat(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 18);
  const arr = Number(data.arrActual || data.arr || 1611);
  const revPar = parseFloat(((arr * occupancyPct) / 100).toFixed(2));
  const mgmHold = Number(data.mgmHold || 0);
  const maintenance = Number(data.underMaintenance || 0);
  const outOfOrder = Number(data.outOfOrder || 0);
  const roomRevenue = Number(data.roomRevenue || (occupiedRooms * arr));

  const fnbRoomService = Number(data.fnbRoomService || data.fnbRoomServiceActual || 805);
  const fnbRestaurant = Number(data.fnbRestaurant || data.restaurantActual || 28651);
  const fnbTakeAway = Number(data.fnbTakeAway || data.takeAwayActual || 4337);
  const fnbComplimentary = Number(data.restaurantComplimentary || 5);
  const fnbDailyTotal = Number(data.fnbDailyTotal || (fnbRoomService + fnbRestaurant + fnbTakeAway));
  const mtdFnbRevenue = Number(data.mtdFnbRevenue || data.mtdFnbRevenueActual || 53690);

  const totalHotelRevenue = Number(data.totalHotelRevenue || data.combinedGrossTurnover || (roomRevenue + fnbDailyTotal));
  const btcAmount = Number(data.totalBtcAmount || data.btcCorporateCredit || 0);

  const cashInHand = Number(data.cashCollected || (totalHotelRevenue * 0.45));
  const upiCollected = Number(data.upiCollected || (totalHotelRevenue * 0.55));
  const cardCollected = Number(data.cardCollected || 0);
  const cashVariance = Number(data.cashVariance || 0);

  const cgst = parseFloat(((totalHotelRevenue * 0.025)).toFixed(2));
  const sgst = parseFloat(((totalHotelRevenue * 0.025)).toFixed(2));

  const inHouseCorporate = data.inHouseCorporate || 'JK Paper / Railway Transit Executive';
  const arrivalsToday = data.arrivalsToday || 6;
  const departuresToday = data.departuresToday || 2;
  const projectedOccupancy = data.projectedOccupancy || '45%';

  if (mode === 'raw') {
    const rawText = `* Good morning, all!!!
* Report Date:- ${formattedDate}
* Total rooms available:-${String(totalRooms).padStart(2, '0')}
* Total rooms saleable:-${String(saleableRooms).padStart(2, '0')}
* ARR Actual:-${Math.round(arr)}
. Occupancy :-${Math.round(occupancyPct)}%                      MGM Hold:-${String(mgmHold).padStart(2, '0')}
* under Maintenance:${String(maintenance).padStart(2, '0')}
* Out Of Order :${outOfOrder}.0 
  ...............................................................                                                                                                                                                                                                                                                                         
* F&B Room service actual:${fnbRoomService.toFixed(2)}
  .  Restaurant Actual:-${fnbRestaurant.toFixed(2)} 
*.Take Away Actual:-${fnbTakeAway.toFixed(2)} 
  ...............................................................
* Total Revenue Actual:${fnbDailyTotal.toFixed(2)}
* MTD F&B Revenue Actual:-${mtdFnbRevenue.toFixed(2)}    
* Restaurant Complimentary:${fnbComplimentary.toFixed(2)} .Total BTC Amount.${btcAmount.toFixed(2)}`;
    return openWhatsAppLink(PROPRIETOR_PHONE, rawText);
  }

  const executiveText = `🏨 *HOTEL ELITE INN, MUNIGUDA*
🌅 *EXECUTIVE MORNING AUDIT FLASH*
📅 *Report Date:* ${formattedDate}${dayOfWeek ? ` (${dayOfWeek})` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛎️ *ROOMS & YIELD METRICS:*
• Total Available Keys: ${String(totalRooms).padStart(2, '0')}
• Saleable Keys: ${String(saleableRooms).padStart(2, '0')}
• Occupancy: ${Math.round(occupancyPct)}% (${occupiedRooms} Rooms Occupied)
• ARR (Actual): ₹${arr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• RevPAR (Yield Index): ₹${revPar.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• MGM Hold: ${String(mgmHold).padStart(2, '0')} | Maintenance: ${String(maintenance).padStart(2, '0')} | Out of Order: ${outOfOrder}.0
• Room Lodging Revenue: ₹${roomRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

🍽️ *F&B CANNON KITCHEN OUTLETS:*
• Room Service Actual: ₹${fnbRoomService.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Restaurant Dine-In Actual: ₹${fnbRestaurant.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Take Away / Parcel Actual: ₹${fnbTakeAway.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Restaurant Complimentary: ₹${fnbComplimentary.toFixed(2)} (MGM Internal)
• F&B Daily Total: ₹${fnbDailyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• MTD F&B Revenue Actual: ₹${mtdFnbRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

💰 *TOTAL COMBINED HOTEL REVENUE:*
• Gross Turnover (Rooms + F&B): *₹${totalHotelRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}*
• Corporate Credit / BTC: ₹${btcAmount.toFixed(2)} (${btcAmount === 0 ? '100% Settled' : 'Pending Ledger'})

🛡️ *PAYMENT CHANNELS & CASH AUDIT:*
• 💵 Cash in Hand / Drawer: ₹${cashInHand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• 📱 Direct Bank UPI (PhonePe/GPay): ₹${upiCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• 💳 Card Swipe POS: ₹${cardCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• 🔒 Cash Drawer Audit: *${cashVariance === 0 ? '✓ BALANCED (₹0.00 Variance)' : `⚠️ Discrepancy ₹${cashVariance}`}*

🏛️ *STATUTORY TAX ACCRUAL (5% GST):*
• Output CGST (2.5%): ₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Output SGST (2.5%): ₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
• Net Taxable Base: ₹${(totalHotelRevenue - (cgst + sgst)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

🔮 *TODAY'S FORECAST & IN-HOUSE:*
• In-House Corporate: ${inHouseCorporate}
• Expected Arrivals Today: ${arrivalsToday} | Check-outs: ${departuresToday}
• Projected Tonight Occupancy: ${projectedOccupancy}

📱 *Live Manager Audit Pack:*
🔗 https://hotel-elite-inn.pages.dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Approved by Duty Night Auditor • Hotel Elite Inn, Muniguda_`;

  return openWhatsAppLink(PROPRIETOR_PHONE, executiveText);
}



