import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Check, DollarSign, CreditCard, Smartphone, Building2, 
  Receipt, AlertCircle, CheckCircle2, ArrowRight, Printer,
  Sparkles, Clock, User, BedDouble, Utensils, ShieldCheck, MessageCircle,
  Search, RefreshCw, Key, QrCode, AlertTriangle, ArrowDownLeft, ArrowUpRight,
  ClipboardCheck, Building, Coffee, HelpCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { sendCheckoutSplitWhatsApp } from '../utils/whatsappDispatch';

export default function CheckoutSplitModal({
  isOpen,
  onClose,
  room,
  rooms = [],
  bookings = [],
  onConfirmCheckout
}) {
  if (!isOpen) return null;

  // 1. Room Selection & Typeahead State
  // Can be initialized from clicked room, or empty for receptionist to type any room
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(room?.roomNumber || '');
  const [roomSearchInput, setRoomSearchInput] = useState(room?.roomNumber || '');
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const roomInputRef = useRef(null);

  // Synchronize when room prop changes
  useEffect(() => {
    if (room?.roomNumber) {
      setSelectedRoomNumber(room.roomNumber);
      setRoomSearchInput(room.roomNumber);
    } else if (rooms.length > 0) {
      // If no room specified, default to first Occupied room or room 101
      const firstOccupied = rooms.find(r => (r.effectiveStatus || r.status || '').includes('Occupied'));
      if (firstOccupied) {
        setSelectedRoomNumber(firstOccupied.roomNumber);
        setRoomSearchInput(firstOccupied.roomNumber);
      }
    }
  }, [room, rooms]);

  // Find the active room object
  const activeRoom = useMemo(() => {
    if (!selectedRoomNumber) return null;
    const cleanNo = String(selectedRoomNumber).replace(/^#/, '').trim();
    return rooms.find(r => String(r.roomNumber) === cleanNo) || null;
  }, [selectedRoomNumber, rooms]);

  // Check room status & active occupancy
  const roomStatus = activeRoom ? (activeRoom.effectiveStatus || activeRoom.status || 'Available') : '';
  const statusLower = String(roomStatus).toLowerCase();
  const hasGuestAssigned = Boolean(
    (activeRoom?.currentGuestName && activeRoom.currentGuestName !== '—' && activeRoom.currentGuestName !== 'Available' && String(activeRoom.currentGuestName).trim() !== '') ||
    (activeRoom?.effectiveGuestName && activeRoom.effectiveGuestName !== '—' && activeRoom.effectiveGuestName !== 'Available' && String(activeRoom.effectiveGuestName).trim() !== '')
  );
  const isRoomOccupied = statusLower.includes('occupied') ||
    statusLower.includes('stay') ||
    statusLower.includes('in-house') ||
    statusLower.includes('due out') ||
    statusLower.includes('checked in') ||
    hasGuestAssigned;

  // List of all currently occupied rooms for quick chips
  const occupiedRooms = useMemo(() => {
    return rooms.filter(r => {
      const st = String(r.effectiveStatus || r.status || '').toLowerCase();
      const hasGuest = Boolean(
        (r.currentGuestName && r.currentGuestName !== '—' && r.currentGuestName !== 'Available' && String(r.currentGuestName).trim() !== '') ||
        (r.effectiveGuestName && r.effectiveGuestName !== '—' && r.effectiveGuestName !== 'Available' && String(r.effectiveGuestName).trim() !== '')
      );
      return st.includes('occupied') || st.includes('stay') || st.includes('in-house') || st.includes('due out') || st.includes('checked in') || hasGuest;
    });
  }, [rooms]);

  // Filtered room matches for the typeahead input
  const roomMatches = useMemo(() => {
    const q = roomSearchInput.replace(/^#/, '').trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(r => 
      String(r.roomNumber).includes(q) ||
      String(r.currentGuestName || '').toLowerCase().includes(q) ||
      String(r.tier || '').toLowerCase().includes(q)
    );
  }, [roomSearchInput, rooms]);

  // Find matching booking for this room
  const matchedBooking = useMemo(() => {
    if (!activeRoom) return null;
    const rNo = String(activeRoom.roomNumber);
    const found = bookings.find(b => String(b.roomNumber) === rNo && b.status !== 'Checked Out');
    if (found) return found;

    return {
      bookingId: `FMBIL2627-${rNo}`,
      billNo: `FMBIL2627-${rNo}`,
      roomNumber: rNo,
      guestName: activeRoom.effectiveGuestName || activeRoom.currentGuestName || 'In-House Guest',
      guestPhone: activeRoom.effectivePhone || activeRoom.phone || '+91 94370 22555',
      company: activeRoom.effectiveCompany || activeRoom.company || 'Direct Walk-In',
      corporateGstin: activeRoom.corporateGstin || (activeRoom.company?.includes('Linde') ? '21AAACB2528H1ZA' : ''),
      tier: activeRoom.tier || 'Executive AC',
      tariff: Number(activeRoom.effectiveTariff || activeRoom.tariff || 2199),
      advancePaid: Number(activeRoom.advancePaid || 0),
      checkInDate: activeRoom.checkInDate || new Date().toISOString().split('T')[0],
      checkInTime: activeRoom.checkInTime || '11:00 AM'
    };
  }, [activeRoom, bookings]);

  // 2. Real-Time In-Stay Consumption: Fetch Real Food Orders from Live KOT Bus
  const liveFoodOrders = useMemo(() => {
    if (!activeRoom) return [];
    try {
      const stored = localStorage.getItem('hotel_elite_inn_live_kots');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      const rNo = String(activeRoom.roomNumber);
      return parsed.filter(o => 
        (String(o.roomNumber) === rNo || String(o.room_number) === rNo || (o.orderType === 'room' && String(o.roomNumber) === rNo)) &&
        o.status !== 'Cancelled' && o.status !== 'Void'
      );
    } catch (e) {
      console.warn('Error reading live KOTs:', e);
      return [];
    }
  }, [activeRoom]);

  // Aggregate real food amount and itemized dishes
  const foodSummary = useMemo(() => {
    let totalAmt = 0;
    const itemsList = [];

    liveFoodOrders.forEach(ord => {
      totalAmt += Number(ord.totalAmount || 0);
      if (Array.isArray(ord.items)) {
        ord.items.forEach(i => {
          itemsList.push({
            kotId: ord.id || ord.orderId || ord.kotNumber,
            name: i.name || 'Dish',
            qty: Number(i.quantity || 1),
            price: Number(i.price || 0),
            total: Number(i.quantity || 1) * Number(i.price || 0)
          });
        });
      }
    });

    // If active room has existing food balance in folio or booking
    if (totalAmt === 0 && matchedBooking && Number(matchedBooking.foodAmount || 0) > 0) {
      totalAmt = Number(matchedBooking.foodAmount);
    }

    return { totalAmt, itemsList };
  }, [liveFoodOrders, matchedBooking]);

  // 3. Dynamic Stay Duration & Room Tariff
  const stayDuration = useMemo(() => {
    if (!matchedBooking) return { nights: 1, checkInStr: 'Today', isLateCheckout: false, lateHours: 0 };
    
    const checkInStr = matchedBooking.checkInDate || activeRoom?.checkInDate || new Date().toISOString().split('T')[0];
    const inDate = new Date(checkInStr);
    const now = new Date();
    const diffTime = Math.max(0, now - inDate);
    const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const nights = matchedBooking.nights ? Math.max(1, Number(matchedBooking.nights)) : calculatedNights;

    // Late checkout calculation: standard checkout is 12:00 PM (noon)
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const isLate = currentHour > 12 || (currentHour === 12 && currentMin > 15);
    const lateHours = isLate ? Math.max(0, currentHour - 12 + (currentMin / 60)) : 0;

    return {
      nights,
      checkInStr,
      isLateCheckout: isLate,
      lateHours: Math.round(lateHours * 10) / 10
    };
  }, [matchedBooking, activeRoom]);

  // 4. Operational Financial States
  const [lateCheckoutFeeType, setLateCheckoutFeeType] = useState('waived'); // 'waived' | 'half' | 'full'
  const lateCheckoutAmount = useMemo(() => {
    if (!stayDuration.isLateCheckout) return 0;
    const baseTariff = Number(matchedBooking?.tariff || activeRoom?.tariff || 2199);
    if (lateCheckoutFeeType === 'half') return Math.round(baseTariff / 2);
    if (lateCheckoutFeeType === 'full') return baseTariff;
    return 0; // 'waived'
  }, [stayDuration.isLateCheckout, lateCheckoutFeeType, matchedBooking, activeRoom]);

  const roomTariffTotal = Number(matchedBooking?.tariff || activeRoom?.tariff || 2199) * stayDuration.nights;
  const foodChargesTotal = foodSummary.totalAmt;
  const advancePaidTotal = Number(matchedBooking?.advancePaid || activeRoom?.advancePaid || 0);

  const grossBillTotal = roomTariffTotal + foodChargesTotal + lateCheckoutAmount;
  const netPayable = grossBillTotal - advancePaidTotal;
  const isRefundDue = netPayable < -0.01;
  const refundAmount = Math.abs(netPayable);

  // 5. Checklist: Physical Key Return & Housekeeping Inspection
  const [keyReturned, setKeyReturned] = useState(true);
  const [roomInspected, setRoomInspected] = useState(true);

  // 6. Multi-tender split states
  const [upiAmount, setUpiAmount] = useState('');
  const [upiRef, setUpiRef] = useState(`UPI-${Date.now().toString().slice(-6)}`);
  const [upiProvider, setUpiProvider] = useState('PhonePe');

  const [cashAmount, setCashAmount] = useState('');
  const [cashierName, setCashierName] = useState('Front Desk Cashier');

  const [cardAmount, setCardAmount] = useState('');
  const [cardAuth, setCardAuth] = useState('AUTH-9412');

  const [btcAmount, setBtcAmount] = useState('');
  const [btcCompany, setBtcCompany] = useState(matchedBooking?.company || 'Linde India Ltd');

  // Refund Mode State (If excess advance paid)
  const [refundMode, setRefundMode] = useState('Cash'); // 'Cash' | 'UPI'
  const [refundRef, setRefundRef] = useState(`REF-${Date.now().toString().slice(-6)}`);

  // UI Modes
  const [checkoutMode, setCheckoutMode] = useState('tenders'); // 'tenders' | 'split-invoices'
  const [openReceiptAfter, setOpenReceiptAfter] = useState(true);
  const [isNonGstBill, setIsNonGstBill] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-allocate net balance whenever active room or netPayable changes
  useEffect(() => {
    setErrorMsg('');
    if (isRefundDue || netPayable <= 0) {
      setUpiAmount('');
      setCashAmount('');
      setCardAmount('');
      setBtcAmount('');
    } else {
      // Default to 100% UPI PhonePe
      setUpiAmount(netPayable.toFixed(2));
      setCashAmount('');
      setCardAmount('');
      setBtcAmount('');
    }
  }, [activeRoom?.roomNumber, netPayable, isRefundDue]);

  // Total allocated sum
  const numUpi = Number(upiAmount) || 0;
  const numCash = Number(cashAmount) || 0;
  const numCard = Number(cardAmount) || 0;
  const numBtc = Number(btcAmount) || 0;

  const totalAllocated = numUpi + numCash + numCard + numBtc;
  const variance = Math.round((netPayable - totalAllocated) * 100) / 100;
  const isBalanced = isRefundDue ? true : (Math.abs(variance) < 0.01);

  // Quick Presets
  const applyPreset = (type) => {
    setErrorMsg('');
    if (netPayable <= 0) return;

    if (type === '100-upi') {
      setUpiAmount(netPayable.toFixed(2));
      setCashAmount('');
      setCardAmount('');
      setBtcAmount('');
    } else if (type === '100-cash') {
      setCashAmount(netPayable.toFixed(2));
      setUpiAmount('');
      setCardAmount('');
      setBtcAmount('');
    } else if (type === '50-50') {
      const half = (netPayable / 2).toFixed(2);
      const remainingHalf = (netPayable - Number(half)).toFixed(2);
      setUpiAmount(half);
      setCashAmount(remainingHalf);
      setCardAmount('');
      setBtcAmount('');
    } else if (type === 'corporate-split') {
      // Room tariff to Corporate BTC, Food charges to Guest UPI
      const roomDue = Math.max(0, roomTariffTotal + lateCheckoutAmount - advancePaidTotal);
      const foodDue = foodChargesTotal;
      setBtcAmount(roomDue.toFixed(2));
      setUpiAmount(foodDue.toFixed(2));
      setCashAmount('');
      setCardAmount('');
    }
  };

  // Submit Checkout & Synchronize Across PMS
  const handleCheckoutSubmit = (e, receiptTarget = 'a4') => {
    if (e && e.preventDefault) e.preventDefault();

    if (!activeRoom) {
      setErrorMsg('Please select a valid room number to check out.');
      return;
    }

    // Auto-allocate remaining balance if variance exists
    let effectiveNumCash = numCash;
    let effectiveNumUpi = numUpi;
    let effectiveNumCard = numCard;
    let effectiveNumBtc = numBtc;
    let effectiveUpiRef = upiRef;
    let effectiveUpiProvider = upiProvider;

    if (!isRefundDue && Math.abs(variance) >= 0.01) {
      if (effectiveNumCash > 0 && effectiveNumUpi === 0) {
        effectiveNumCash = Math.round((effectiveNumCash + variance) * 100) / 100;
        setCashAmount(effectiveNumCash.toFixed(2));
      } else if (effectiveNumBtc > 0 && effectiveNumUpi === 0 && effectiveNumCash === 0) {
        effectiveNumBtc = Math.round((effectiveNumBtc + variance) * 100) / 100;
        setBtcAmount(effectiveNumBtc.toFixed(2));
      } else {
        effectiveNumUpi = Math.round((effectiveNumUpi + variance) * 100) / 100;
        setUpiAmount(effectiveNumUpi.toFixed(2));
      }
    }

    if (!isRoomOccupied && !hasGuestAssigned) {
      const confirmProceed = window.confirm(
        `Notice: Room ${activeRoom.roomNumber} is currently marked as '${roomStatus}'. Do you want to proceed with checking out and printing the folio for this room?`
      );
      if (!confirmProceed) return;
    }

    if (!keyReturned) {
      if (!window.confirm(`Warning: Physical key for Room ${activeRoom.roomNumber} is NOT marked as returned. Do you want to proceed anyway?`)) {
        return;
      }
    }

    const tendersSummary = [];
    if (isRefundDue) {
      tendersSummary.push(`Refund Given: ₹${refundAmount.toLocaleString('en-IN')} via ${refundMode} (Ref: ${refundRef})`);
    } else {
      if (effectiveNumCash > 0) tendersSummary.push(`Cash: ₹${effectiveNumCash.toLocaleString('en-IN')}`);
      if (effectiveNumUpi > 0) tendersSummary.push(`${effectiveUpiProvider} (UPI): ₹${effectiveNumUpi.toLocaleString('en-IN')} [Ref: ${effectiveUpiRef}]`);
      if (effectiveNumCard > 0) tendersSummary.push(`Card: ₹${effectiveNumCard.toLocaleString('en-IN')} [Auth: ${cardAuth}]`);
      if (effectiveNumBtc > 0) tendersSummary.push(`Corporate BTC (${btcCompany}): ₹${effectiveNumBtc.toLocaleString('en-IN')}`);
    }

    const settlementPayload = {
      roomNumber: activeRoom.roomNumber,
      guestName: activeRoom.effectiveGuestName || activeRoom.currentGuestName || matchedBooking.guestName,
      guestPhone: matchedBooking.guestPhone || activeRoom.phone || '+91 94370 22555',
      company: matchedBooking.company || activeRoom.company || 'Direct Guest',
      corporateGstin: matchedBooking.corporateGstin || '',
      tier: activeRoom.tier,
      totalAmount: grossBillTotal,
      billTotal: grossBillTotal,
      netDue: netPayable,
      advancePaid: advancePaidTotal,
      roomAmount: roomTariffTotal,
      foodAmount: foodChargesTotal,
      foodItems: foodSummary.itemsList,
      nights: stayDuration.nights,
      checkInDate: stayDuration.checkInStr,
      checkOutDate: new Date().toISOString().split('T')[0],
      billNo: matchedBooking.billNo || `FMBIL2627-${activeRoom.roomNumber}`,
      settlementTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      settlementDate: new Date().toLocaleDateString('en-IN'),
      isRefund: isRefundDue,
      refundAmount: isRefundDue ? refundAmount : 0,
      refundMode: isRefundDue ? refundMode : null,
      refundRef: isRefundDue ? refundRef : null,
      lateCheckoutSurcharge: lateCheckoutAmount,
      keyReturned,
      roomInspected,
      tenders: {
        cash: isRefundDue ? 0 : effectiveNumCash,
        upi: isRefundDue ? 0 : effectiveNumUpi,
        upiRef: effectiveUpiRef,
        upiProvider: effectiveUpiProvider,
        card: effectiveNumCard,
        cardAuth,
        btc: effectiveNumBtc,
        btcCompany
      },
      tendersSummary,
      openReceiptAfter,
      isNonGstBill,
      openEditor: receiptTarget === 'editor',
      targetReceiptType: receiptTarget === 'editor' ? 'a4' : receiptTarget
    };

    // Auto-dispatch WhatsApp digital receipt if phone is available
    if (settlementPayload.guestPhone) {
      try {
        sendCheckoutSplitWhatsApp({
          billType: isNonGstBill ? 'Non-GST Tax Receipt' : 'Official Tax Invoice',
          billNo: settlementPayload.billNo,
          companyOrGuest: settlementPayload.company && settlementPayload.company !== 'Direct Guest' 
            ? `${settlementPayload.guestName} (${settlementPayload.company})` 
            : settlementPayload.guestName,
          gstin: settlementPayload.corporateGstin,
          roomNumber: activeRoom.roomNumber,
          period: `${stayDuration.checkInStr} to Today (${stayDuration.nights} Nights)`,
          amount: grossBillTotal,
          recipientPhone: settlementPayload.guestPhone
        });
      } catch (err) {
        console.warn('WhatsApp checkout dispatch error:', err);
      }
    }

    onConfirmCheckout(settlementPayload);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.94)',
      backdropFilter: 'blur(12px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0c182b 0%, #060e1a 100%)',
        border: '1.5px solid rgba(212, 175, 55, 0.45)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '94vh',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.15)',
        color: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '1.15rem 1.5rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, rgba(19, 34, 61, 0.95), rgba(12, 24, 43, 0.95))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> EXPRESS CHECKOUT STATION
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Stage 4: Folio Settlement &amp; Turnover
              </span>
            </div>

            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Checkout &amp; Settlement: Room {selectedRoomNumber || '—'}
              {activeRoom && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isRoomOccupied ? 'rgba(234, 88, 12, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isRoomOccupied ? '#fb923c' : '#34d399',
                  border: `1px solid ${isRoomOccupied ? '#fb923c' : '#34d399'}60`
                }}>
                  {roomStatus}
                </span>
              )}
            </h3>
          </div>

          {/* Mode Switcher & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0,0,0,0.4)',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <button
                type="button"
                onClick={() => setCheckoutMode('tenders')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: checkoutMode === 'tenders' ? 'var(--gold-glow)' : 'transparent',
                  color: checkoutMode === 'tenders' ? '#000' : '#94a3b8'
                }}
              >
                💳 Multi-Tender
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode('split-invoices')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: checkoutMode === 'split-invoices' ? '#38bdf8' : 'transparent',
                  color: checkoutMode === 'split-invoices' ? '#000' : '#94a3b8'
                }}
              >
                📑 Corporate Split (Room/Food)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>

          {/* 1. UNIVERSAL ROOM NUMBER INPUT & QUICK OCCUPIED ROOM CHIPS */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '0.9rem 1.15rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Search size={14} /> TYPE ROOM NUMBER TO JUMP &amp; SETTLE:
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {occupiedRooms.length} Occupied Room{occupiedRooms.length === 1 ? '' : 's'} Active In-House
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  ref={roomInputRef}
                  type="text"
                  value={roomSearchInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoomSearchInput(val);
                    const clean = val.replace(/^#/, '').trim();
                    if (clean && rooms.some(r => String(r.roomNumber) === clean)) {
                      setSelectedRoomNumber(clean);
                    }
                    setIsRoomDropdownOpen(true);
                  }}
                  onFocus={() => setIsRoomDropdownOpen(true)}
                  placeholder="Type Room No. (e.g. 101, 204, 301)..."
                  style={{
                    width: '100%',
                    background: '#070b14',
                    border: '1.5px solid rgba(212, 175, 55, 0.5)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    letterSpacing: '0.5px'
                  }}
                />

                {/* Dropdown suggestions */}
                {isRoomDropdownOpen && roomSearchInput && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    left: 0,
                    right: 0,
                    background: '#091322',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 2600,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
                  }}>
                    {roomMatches.length === 0 ? (
                      <div style={{ padding: '0.65rem', color: '#94a3b8', fontSize: '0.75rem' }}>No room found matching "{roomSearchInput}"</div>
                    ) : (
                      roomMatches.map(r => {
                        const isOcc = (r.effectiveStatus || r.status || '').includes('Occupied');
                        return (
                          <div
                            key={r.roomNumber}
                            onClick={() => {
                              setSelectedRoomNumber(r.roomNumber);
                              setRoomSearchInput(r.roomNumber);
                              setIsRoomDropdownOpen(false);
                            }}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: r.roomNumber === selectedRoomNumber ? 'rgba(212, 175, 55, 0.15)' : 'transparent'
                            }}
                          >
                            <div>
                              <strong style={{ color: 'var(--gold-glow)' }}>Room {r.roomNumber}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', marginLeft: '0.5rem' }}>
                                {r.effectiveGuestName || r.currentGuestName || 'Vacant'}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isOcc ? 'rgba(234, 88, 12, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                              color: isOcc ? '#fb923c' : '#34d399'
                            }}>
                              {r.effectiveStatus || r.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Clear / Reset button */}
              <button
                type="button"
                onClick={() => {
                  setRoomSearchInput('');
                  setIsRoomDropdownOpen(true);
                }}
                className="btn-outline-gold"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
              >
                Clear
              </button>
            </div>

            {/* Quick Chips of In-House Occupied Rooms */}
            {occupiedRooms.length > 0 && (
              <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Occupied Rooms:</span>
                {occupiedRooms.map(occ => (
                  <button
                    key={occ.roomNumber}
                    type="button"
                    onClick={() => {
                      setSelectedRoomNumber(occ.roomNumber);
                      setRoomSearchInput(occ.roomNumber);
                      setIsRoomDropdownOpen(false);
                    }}
                    style={{
                      background: occ.roomNumber === selectedRoomNumber ? 'linear-gradient(135deg, #d4af37, #f59e0b)' : 'rgba(234, 88, 12, 0.15)',
                      color: occ.roomNumber === selectedRoomNumber ? '#000' : '#fb923c',
                      border: occ.roomNumber === selectedRoomNumber ? '1px solid #d4af37' : '1px solid rgba(234, 88, 12, 0.4)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Room {occ.roomNumber} ({occ.effectiveGuestName?.split(' ')[0] || 'Guest'})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WARNING IF ROOM IS NOT OCCUPIED */}
          {!isRoomOccupied && activeRoom && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid #ef4444',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#fca5a5'
            }}>
              <AlertTriangle size={22} color="#ef4444" />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>
                  Room {activeRoom.roomNumber} is currently "{roomStatus}"
                </strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem' }}>
                  Checkout is only applicable to occupied rooms. Please choose an occupied room from the list above, or return to front desk.
                </p>
              </div>
            </div>
          )}

          {/* 2. SYNCHRONIZED GUEST PROFILE & STAY DETAILS */}
          {activeRoom && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              background: 'rgba(10, 18, 33, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1rem 1.25rem'
            }}>
              {/* Guest Profile */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  In-House Guest Profile
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                  {activeRoom.effectiveGuestName || activeRoom.currentGuestName || matchedBooking?.guestName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  📞 {matchedBooking?.guestPhone || activeRoom.phone || 'Phone on file'}
                </div>
                {matchedBooking?.company && matchedBooking.company !== 'Direct Guest' && (
                  <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                    🏢 {matchedBooking.company} {matchedBooking.corporateGstin ? `• GSTIN: ${matchedBooking.corporateGstin}` : ''}
                  </div>
                )}
              </div>

              {/* Stay & Room Info */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Room Tier &amp; Stay Duration
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                  {activeRoom.tier} (Room {activeRoom.roomNumber})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  📅 Check-In: {stayDuration.checkInStr} • {stayDuration.nights} Night{stayDuration.nights > 1 ? 's' : ''} Stay
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--gold-glow)', marginTop: '0.25rem' }}>
                  Tariff: ₹{Number(matchedBooking?.tariff || activeRoom.tariff || 2199).toLocaleString('en-IN')}/night (SAC 996311)
                </div>
              </div>

              {/* Late Checkout Grace Engine */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Departure Policy
                </div>
                {stayDuration.isLateCheckout ? (
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{
                      background: 'rgba(234, 88, 12, 0.25)',
                      border: '1px solid #ea580c',
                      color: '#fb923c',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      ⏰ LATE CHECKOUT (+{stayDuration.lateHours}h)
                    </span>
                    <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="lateCheck"
                          checked={lateCheckoutFeeType === 'waived'}
                          onChange={() => setLateCheckoutFeeType('waived')}
                        />
                        <span>Courtesy Manager Waiver (₹0.00)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="lateCheck"
                          checked={lateCheckoutFeeType === 'half'}
                          onChange={() => setLateCheckoutFeeType('half')}
                        />
                        <span>Half-Day Surcharge (+₹{Math.round(Number(activeRoom.tariff || 2199) / 2)})</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="lateCheck"
                          checked={lateCheckoutFeeType === 'full'}
                          onChange={() => setLateCheckoutFeeType('full')}
                        />
                        <span>Full-Day Extension (+₹{Number(activeRoom.tariff || 2199)})</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.3rem' }}>
                    ✓ Standard 12:00 PM On-Time Departure
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SYNCHRONIZED FINANCIAL BREAKDOWN: ROOM + FOOD + ADVANCE */}
          <div style={{
            background: 'rgba(7, 14, 27, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                SYNCHRONIZED MASTER FOLIO CHARGES
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Bill No: <strong style={{ color: '#fff' }}>{matchedBooking?.billNo || `FMBIL2627-${selectedRoomNumber}`}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* Room Tariff Line */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1. Room Accommodation</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                  ₹{roomTariffTotal.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {stayDuration.nights} Ngt @ ₹{Number(activeRoom?.tariff || 2199)}
                </div>
              </div>

              {/* F&B Dining Line (Real Live KOTs) */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>2. Fenugreek Restaurant</span>
                  <span style={{ color: '#38bdf8' }}>{foodSummary.itemsList.length} KOT item{foodSummary.itemsList.length === 1 ? '' : 's'}</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                  ₹{foodChargesTotal.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {foodChargesTotal > 0 ? 'Live KDS Billed (SAC 996331)' : 'No Food Ordered (₹0.00)'}
                </div>
              </div>

              {/* Late Checkout Line */}
              {lateCheckoutAmount > 0 && (
                <div style={{ background: 'rgba(234, 88, 12, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#fb923c' }}>3. Late Checkout</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c', marginTop: '0.2rem' }}>
                    ₹{lateCheckoutAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    +{stayDuration.lateHours}h Surcharge
                  </div>
                </div>
              )}

              {/* Advance Paid Deposit */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Less: Advance Deposit</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                  ₹{advancePaidTotal.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Check-in / Pre-auth deposit
                </div>
              </div>

              {/* Net Balance Due / Refund Due */}
              <div style={{
                background: isRefundDue 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))' 
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(245, 158, 11, 0.18))',
                padding: '0.75rem',
                borderRadius: '8px',
                border: isRefundDue ? '1.5px solid #10b981' : '1.5px solid rgba(212, 175, 55, 0.5)'
              }}>
                <div style={{ fontSize: '0.7rem', color: isRefundDue ? '#34d399' : 'var(--gold-glow)', fontWeight: 800 }}>
                  {isRefundDue ? 'REFUND DUE TO GUEST' : 'NET PAYABLE AT CHECKOUT'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isRefundDue ? '#34d399' : '#fff', marginTop: '0.15rem' }}>
                  ₹{(isRefundDue ? refundAmount : Math.max(0, netPayable)).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                  {isRefundDue ? 'Excess deposit return' : 'Final settlement due'}
                </div>
              </div>
            </div>

            {/* Itemized Food Dishes List (If food was ordered) */}
            {foodSummary.itemsList.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  🍴 In-Room Dining KOT Line Items:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {foodSummary.itemsList.map((item, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#e2e8f0',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}>
                      {item.qty}x {item.name} (₹{item.total})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. STATUTORY KEY RETURN & HOUSEKEEPING INSPECTION CHECKLIST */}
          <div style={{
            background: 'rgba(10, 20, 35, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                Statutory Room Turnover Handover Checklist:
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                <input
                  type="checkbox"
                  checked={keyReturned}
                  onChange={(e) => setKeyReturned(e.target.checked)}
                />
                <span style={{ color: keyReturned ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  🔑 Physical Key Received &amp; Revoked
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                <input
                  type="checkbox"
                  checked={roomInspected}
                  onChange={(e) => setRoomInspected(e.target.checked)}
                />
                <span style={{ color: roomInspected ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                  🧹 Room Linen &amp; Amenities Cleared
                </span>
              </label>
            </div>
          </div>

          {/* 5. MULTI-TENDER PAYMENT SETTLEMENT OR REFUND ENGINE */}
          {checkoutMode === 'tenders' ? (
            <div style={{
              background: 'rgba(12, 22, 38, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem'
            }}>
              {/* If Refund Due */}
              {isRefundDue ? (
                <div>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1.5px solid #10b981',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399' }}>
                      <ArrowDownLeft size={22} />
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>Excess Advance Return: ₹{refundAmount.toFixed(2)}</strong>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                          Guest deposited ₹{advancePaidTotal.toFixed(2)}, but total charges were ₹{grossBillTotal.toFixed(2)}. Issue refund below to balance folio to ₹0.00.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Refund Payment Mode</label>
                      <select
                        className="form-select"
                        value={refundMode}
                        onChange={(e) => setRefundMode(e.target.value)}
                      >
                        <option value="Cash">Cash (Front Desk Drawer Outflow)</option>
                        <option value="UPI">PhonePe / UPI Return Transfer</option>
                        <option value="Original Payment Method">Original Payment Reversal</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Refund Reference / Voucher ID</label>
                      <input
                        type="text"
                        className="form-input"
                        value={refundRef}
                        onChange={(e) => setRefundRef(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : netPayable > 0 ? (
                /* Multi-Tender Payment Allocation */
                <div>
                  {/* Preset Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-glow)' }}>
                      TENDER ALLOCATION (Net Due: ₹{netPayable.toFixed(2)})
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => applyPreset('100-upi')} className="btn-outline-gold" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                        100% PhonePe UPI
                      </button>
                      <button type="button" onClick={() => applyPreset('100-cash')} className="btn-outline-gold" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                        100% Cash
                      </button>
                      <button type="button" onClick={() => applyPreset('50-50')} className="btn-outline-gold" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                        50-50 Split
                      </button>
                      {matchedBooking?.company && (
                        <button type="button" onClick={() => applyPreset('corporate-split')} className="btn-outline-gold" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#38bdf8', borderColor: '#38bdf8' }}>
                          🏢 Room BTC + Food UPI
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Multi-Tender Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                    {/* PhonePe UPI */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: numUpi > 0 ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Smartphone size={13} /> PhonePe / UPI (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={upiAmount}
                        onChange={(e) => setUpiAmount(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.35rem' }}
                      />
                      <input
                        type="text"
                        placeholder="UPI Ref ID"
                        value={upiRef}
                        onChange={(e) => setUpiRef(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.35rem' }}
                      />
                    </div>

                    {/* Cash */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: numCash > 0 ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={13} /> Cash Drawer (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.35rem' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                        Auto-increments Shift Drawer
                      </span>
                    </div>

                    {/* Card */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: numCard > 0 ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ fontSize: '0.74rem', color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={13} /> POS Card (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cardAmount}
                        onChange={(e) => setCardAmount(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.35rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Card Auth Code"
                        value={cardAuth}
                        onChange={(e) => setCardAuth(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.35rem' }}
                      />
                    </div>

                    {/* Corporate BTC Credit */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: numBtc > 0 ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> Bill to Company (BTC ₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={btcAmount}
                        onChange={(e) => setBtcAmount(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.35rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={btcCompany}
                        onChange={(e) => setBtcCompany(e.target.value)}
                        style={{ width: '100%', background: '#070b14', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.35rem' }}
                      />
                    </div>
                  </div>

                  {/* Variance / Balance Bar */}
                  <div style={{
                    marginTop: '0.85rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isBalanced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: isBalanced ? '1px solid #10b981' : '1px solid #ef4444'
                  }}>
                    <span style={{ fontSize: '0.78rem', color: isBalanced ? '#34d399' : '#f87171', fontWeight: 700 }}>
                      {isBalanced 
                        ? '✓ Total Allocated Equals Net Payable (Folio Balanced to ₹0.00)' 
                        : `⚠️ Variance: ₹${Math.abs(variance).toFixed(2)} ${variance > 0 ? 'Remaining to Allocate' : 'Over-allocated'}`}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      Allocated: <strong>₹{totalAllocated.toFixed(2)}</strong> / ₹{netPayable.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.85rem', textAlign: 'center', color: '#34d399', fontSize: '0.9rem', fontWeight: 700 }}>
                  ✓ Zero Balance Outstanding. Folio is fully settled.
                </div>
              )}
            </div>
          ) : (
            /* Corporate Split Invoices View (Room vs Food) */
            <div style={{
              background: 'rgba(12, 22, 38, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="#38bdf8" />
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#fff' }}>Corporate Two-Tier Invoicing Protocol</strong>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                    Separates Room Lodging for company claim and Personal Dining for guest reimbursement.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* INVOICE A: ROOM LODGING */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <span style={{ fontSize: '0.7rem', background: '#38bdf8', color: '#000', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                    BILL A: ROOM TARIFF
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
                    ₹{roomTariffTotal.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    SAC 996311 • Billed To: {matchedBooking?.company || 'Linde India Ltd'}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCheckoutSubmit(e, 'room-split')}
                    className="btn-outline-gold"
                    style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.4rem', cursor: 'pointer' }}
                  >
                    📄 Print Room Bill No. 01499
                  </button>
                </div>

                {/* INVOICE B: RESTAURANT FOOD */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <span style={{ fontSize: '0.7rem', background: '#34d399', color: '#000', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                    BILL B: FENUGREEK FOOD
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', marginTop: '0.5rem' }}>
                    ₹{foodChargesTotal.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    SAC 996331 • Billed To: {activeRoom?.effectiveGuestName || 'Guest'}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCheckoutSubmit(e, 'food-split')}
                    className="btn-outline-gold"
                    style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.4rem', borderColor: '#34d399', color: '#34d399', cursor: 'pointer' }}
                  >
                    🍽️ Print Food Bill No. 01500
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(6, 12, 22, 0.98)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem' }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Money Receipt Voucher Button */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'money-receipt')}
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.22)',
                color: '#38bdf8',
                border: '1.5px solid #38bdf8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
                transition: 'all 0.15s ease'
              }}
              title="Settle folio & print Money Receipt Voucher (Page 5)"
            >
              <Receipt size={16} /> 🧾 Money Receipt Voucher (Page 5)
            </button>

            {/* 80mm POS Slip */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'pos')}
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#f1f5f9',
                border: '1.5px solid rgba(255, 255, 255, 0.28)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.15s ease'
              }}
              title="Settle folio & print 80mm Thermal Receipt Slip"
            >
              <Printer size={16} /> 🖨️ 80mm Slip
            </button>

            {/* Settle & Consolidated Tax Invoice (Default Master Action) */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'a4')}
              style={{
                padding: '0.65rem 1.45rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                color: '#000',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.45)',
                transition: 'all 0.15s ease'
              }}
              title="Settle folio & print Consolidated Tax Invoice"
            >
              <Check size={18} /> ⚡ Complete Checkout &amp; Print Tax Invoice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
