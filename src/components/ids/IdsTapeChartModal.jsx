import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, CalendarRange, ChevronLeft, ChevronRight, Search, 
  Plus, RefreshCw, Printer, X, Maximize2, Minimize2, Check, 
  User, Phone, Building2, CreditCard, Clock, ShieldCheck, 
  HelpCircle, AlertCircle, FileText, Globe, BedDouble, CheckCircle2
} from 'lucide-react';
import { INITIAL_ROOMS_INVENTORY, ROOM_TIERS, HOTEL_CONFIG } from '../../data/hotelData';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { createFastApiBooking, getFastApiBookings } from '../../utils/backendApi';

export default function IdsTapeChartModal({
  isOpen,
  onClose,
  rooms = INITIAL_ROOMS_INVENTORY,
  bookings = [],
  reservations = [],
  onNewBooking = null,
  onOpenFolio = null
}) {
  if (!isOpen) return null;

  // View state: start date & window (7, 14, 30 days)
  const [startDateStr, setStartDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [daysCount, setDaysCount] = useState(14);
  const [isMaximized, setIsMaximized] = useState(true);

  // Filters
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Cloud Refresh State
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);
  const [cloudBookings, setCloudBookings] = useState([]);

  // Detail Popover for existing booking
  const [inspectedBooking, setInspectedBooking] = useState(null);

  // Quick Advance Booking Dialog (For Phone Callers / Walk-in Advance)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({
    roomNumber: '101',
    tier: 'Executive King Bed',
    tariff: 2050,
    checkInDate: startDateStr,
    checkOutDate: '',
    nights: 1,
    title: 'Mr',
    guestName: '',
    guestPhone: '',
    adults: 1,
    source: 'Phone Call Inquiry',
    companyName: '',
    billingMode: 'Cash',
    advanceDeposit: 0,
    purposeOfVisit: 'Business Visit'
  });
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [bookingFeedbackMsg, setBookingFeedbackMsg] = useState('');

  // Initial cloud sync
  useEffect(() => {
    if (isOpen) {
      refreshCloudReservations();
    }
  }, [isOpen]);

  const refreshCloudReservations = async () => {
    setIsRefreshingCloud(true);
    try {
      const data = await getFastApiBookings();
      if (data && Array.isArray(data)) {
        setCloudBookings(data);
      }
    } catch (err) {
      console.warn('[TapeChart] Cloud fetch warning:', err);
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  // Generate Date Array for the Matrix columns
  const dateList = useMemo(() => {
    const dates = [];
    const base = new Date(startDateStr);
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      dates.push({
        dateObj: d,
        dateStr,
        dayName,
        dayNum: dd,
        monthShort,
        isWeekend,
        isToday,
        display: `${dd} ${dayName}`
      });
    }
    return dates;
  }, [startDateStr, daysCount]);

  // Combine All 27 Physical Rooms
  const allRooms = useMemo(() => {
    const list = rooms && rooms.length > 0 ? rooms : INITIAL_ROOMS_INVENTORY;
    // Map with standard sorting: 101-109, 201-209, 301-309
    return [...list].sort((a, b) => parseInt(a.roomNumber, 10) - parseInt(b.roomNumber, 10));
  }, [rooms]);

  // Filtered Rooms according to selected Floor and Category
  const filteredRooms = useMemo(() => {
    return allRooms.filter(r => {
      const rNum = String(r.roomNumber);
      const floor = rNum.charAt(0);
      if (selectedFloor !== 'ALL' && floor !== selectedFloor) return false;

      const cat = (r.roomType || r.category || '').toUpperCase();
      if (selectedCategory === 'STD' && !cat.includes('STD') && !cat.includes('STANDARD')) return false;
      if (selectedCategory === 'EXE' && !cat.includes('EXE') && !cat.includes('EXECUTIVE')) return false;
      if (selectedCategory === 'SUI' && !cat.includes('SUI') && !cat.includes('SUITE')) return false;

      return true;
    });
  }, [allRooms, selectedFloor, selectedCategory]);

  // Normalize Unified Bookings Database
  const unifiedBookings = useMemo(() => {
    const map = [];

    // Helper to normalize date strings to YYYY-MM-DD
    const normalizeDate = (dt) => {
      if (!dt) return '';
      if (dt.includes('T')) return dt.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dt)) return dt;
      // Handle "12-OCT-2026" or "12-OCT-2026 14:00"
      const parts = dt.split(' ')[0].split('-');
      if (parts.length === 3 && parts[1]?.length === 3) {
        const months = { JAN:'01', FEB:'02', MAR:'03', APR:'04', MAY:'05', JUN:'06', JUL:'07', AUG:'08', SEP:'09', OCT:'10', NOV:'11', DEC:'12' };
        const dd = parts[0].padStart(2, '0');
        const mm = months[parts[1].toUpperCase()] || '10';
        const yyyy = parts[2];
        return `${yyyy}-${mm}-${dd}`;
      }
      return dt.slice(0, 10);
    };

    // 1. Live bookings from Railway PostgreSQL
    if (cloudBookings && cloudBookings.length > 0) {
      cloudBookings.forEach(cb => {
        let rNum = '101';
        if (cb.room_number) rNum = String(cb.room_number);
        else if (cb.room_id) {
          if (cb.room_id <= 9) rNum = String(100 + cb.room_id);
          else if (cb.room_id <= 18) rNum = String(191 + cb.room_id);
          else if (cb.room_id <= 27) rNum = String(282 + cb.room_id);
        }
        map.push({
          id: cb.booking_reference || `RAIL-${cb.id}`,
          bookingReference: cb.booking_reference || `HEI-RES-${cb.id}`,
          roomNumber: rNum,
          guestName: cb.guest_name,
          guestPhone: cb.guest_phone || '9999999999',
          checkInDate: normalizeDate(cb.check_in_date),
          checkOutDate: normalizeDate(cb.check_out_date),
          status: cb.status === 'confirmed' ? 'Confirmed' : (cb.status === 'checked_in' ? 'Checked In' : 'Confirmed'),
          totalAmount: cb.total_amount || 2050,
          advancePaid: cb.advance_paid || 0,
          balanceDue: cb.balance_amount || 0,
          billingMode: cb.billing_mode || 'Cash',
          source: 'Railway Cloud (Online/Web)',
          companyName: cb.company_name || '',
          isOnline: true
        });
      });
    }

    // 2. Props bookings from App.jsx
    if (bookings && bookings.length > 0) {
      bookings.forEach(b => {
        if (!map.some(m => m.id === b.bookingId || m.bookingReference === b.bookingId)) {
          map.push({
            id: b.bookingId || `APP-${b.roomNumber}`,
            bookingReference: b.bookingId,
            roomNumber: String(b.roomNumber),
            guestName: b.guestName,
            guestPhone: b.guestPhone,
            checkInDate: normalizeDate(b.checkInDate),
            checkOutDate: normalizeDate(b.checkOutDate),
            status: b.bookingStatus || 'Confirmed',
            totalAmount: b.totalAmount || b.tariffPerNight || 2050,
            advancePaid: b.advanceDeposit || 0,
            balanceDue: b.balanceDue || 0,
            billingMode: b.paymentMode || 'Cash',
            source: b.source || 'Online Portal',
            companyName: b.companyName || '',
            isOnline: true
          });
        }
      });
    }

    // 3. Desktop Shell Reservations
    if (reservations && reservations.length > 0) {
      reservations.forEach(r => {
        if (r.isCancelled) return;
        const assignedRooms = r.rooms || (r.roomNo ? [r.roomNo] : ['101']);
        assignedRooms.forEach(rm => {
          map.push({
            id: `DESK-RES-${r.resNo}-${rm}`,
            bookingReference: `RES-${r.resNo}`,
            roomNumber: String(rm),
            guestName: r.guestName,
            guestPhone: r.guestPhone || '9437012345',
            checkInDate: normalizeDate(r.arrivalDate),
            checkOutDate: normalizeDate(r.departureDate),
            status: r.isCheckedIn ? 'Checked In' : (r.status || 'Confirmed'),
            totalAmount: parseFloat((r.rate || '2050').replace(/,/g, '')),
            advancePaid: r.depositAmount || 0,
            balanceDue: 0,
            billingMode: 'Cash',
            source: r.isGroup ? 'Group Corporate Reservation' : 'Front Desk Phone / Walk-in',
            companyName: r.companyName || '',
            isCorporate: !!r.companyName && r.companyName !== 'Direct FIT',
            isOnline: false
          });
        });
      });
    }

    return map;
  }, [cloudBookings, bookings, reservations]);

  // Lookup helper for a specific cell: (roomNumber, dateStr)
  const getCellBooking = (roomNumber, dateStr) => {
    const rNum = String(roomNumber);
    // Find booking where checkInDate <= dateStr < checkOutDate
    const found = unifiedBookings.find(b => {
      if (String(b.roomNumber) !== rNum) return false;
      const ci = b.checkInDate;
      const co = b.checkOutDate;
      if (!ci || !co) return false;
      return ci <= dateStr && dateStr < co;
    });

    if (found) {
      const isArrival = found.checkInDate === dateStr;
      // Is day before checkout (last night of stay)
      const isDepartureNight = (() => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        const nextStr = d.toISOString().split('T')[0];
        return nextStr === found.checkOutDate;
      })();
      return {
        booking: found,
        isArrival,
        isDepartureNight
      };
    }

    // Check if room has maintenance block
    if (rNum === '104') {
      return {
        booking: {
          id: 'MAINT-104',
          bookingReference: 'MAINT-SERVICING',
          roomNumber: '104',
          guestName: 'AC Overhaul & Painting Servicing',
          status: 'Maintenance Block',
          source: 'Housekeeping Engineering Block',
          isMaintenance: true
        },
        isArrival: false,
        isDepartureNight: false
      };
    }

    return null;
  };

  // Occupancy statistics across the selected window
  const windowStats = useMemo(() => {
    const totalRoomNights = allRooms.length * dateList.length;
    let bookedNights = 0;
    let onlineCount = 0;
    let corporateCount = 0;

    dateList.forEach(d => {
      allRooms.forEach(r => {
        const cell = getCellBooking(r.roomNumber, d.dateStr);
        if (cell) {
          bookedNights++;
          if (cell.booking.isOnline) onlineCount++;
          if (cell.booking.isCorporate) corporateCount++;
        }
      });
    });

    const occRate = totalRoomNights > 0 ? Math.round((bookedNights / totalRoomNights) * 100) : 0;
    return {
      totalRoomNights,
      bookedNights,
      freeNights: totalRoomNights - bookedNights,
      occRate,
      onlineCount,
      corporateCount
    };
  }, [allRooms, dateList, unifiedBookings]);

  // Navigate Date Window
  const handleShiftDate = (days) => {
    const cur = new Date(startDateStr);
    cur.setDate(cur.getDate() + days);
    setStartDateStr(cur.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setStartDateStr(new Date().toISOString().split('T')[0]);
  };

  // Open the "New Advance Reservation" Dialog when clicking a vacant cell
  const handleOpenBookingDialog = (roomNumber, dateStr) => {
    const targetRoom = allRooms.find(r => String(r.roomNumber) === String(roomNumber)) || allRooms[0];
    const tariff = Number(targetRoom.tariff || targetRoom.basePrice || 2050);
    const tierName = targetRoom.roomType || targetRoom.name || 'Executive King Bed';

    const checkIn = dateStr || startDateStr;
    const checkOutDateObj = new Date(checkIn);
    checkOutDateObj.setDate(checkOutDateObj.getDate() + 1);
    const checkOut = checkOutDateObj.toISOString().split('T')[0];

    setBookingDraft({
      roomNumber: String(roomNumber),
      tier: tierName,
      tariff,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: 1,
      title: 'Mr',
      guestName: '',
      guestPhone: '',
      adults: 1,
      source: 'Phone Call Inquiry',
      companyName: '',
      billingMode: 'Cash',
      advanceDeposit: tariff,
      purposeOfVisit: 'Business Visit'
    });
    setBookingFeedbackMsg('');
    setBookingDialogOpen(true);
  };

  // Handle nights change in booking dialog
  const handleNightsChange = (n) => {
    const num = Math.max(1, parseInt(n, 10) || 1);
    const inDate = new Date(bookingDraft.checkInDate || startDateStr);
    inDate.setDate(inDate.getDate() + num);
    const outDate = inDate.toISOString().split('T')[0];
    setBookingDraft(prev => ({
      ...prev,
      nights: num,
      checkOutDate: outDate,
      advanceDeposit: prev.tariff * num
    }));
  };

  // Confirm and Save Advance Booking (Writes to Railway Cloud PostgreSQL + Local Front Desk)
  const handleSaveAdvanceBooking = async () => {
    if (!bookingDraft.guestName.trim()) {
      alert('Please enter guest name to confirm reservation.');
      return;
    }
    if (!bookingDraft.guestPhone.trim()) {
      alert('Please enter mobile number for reservation confirmation.');
      return;
    }

    setIsSavingBooking(true);
    setBookingFeedbackMsg('Submitting reservation to Railway Cloud PostgreSQL...');

    const totalAmt = bookingDraft.tariff * bookingDraft.nights;
    const deposit = Number(bookingDraft.advanceDeposit || 0);

    const bookingPayload = {
      bookingId: `HEI-RES-${Date.now().toString().slice(-6)}`,
      booking_reference: `HEI-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${bookingDraft.roomNumber}`,
      roomNumber: bookingDraft.roomNumber,
      tier: bookingDraft.tier,
      guestName: `${bookingDraft.title} ${bookingDraft.guestName.trim()}`,
      guestPhone: bookingDraft.guestPhone.trim(),
      idProofType: 'Aadhaar Card',
      idProofMasked: 'XXXX-XXXX-8821',
      checkInDate: bookingDraft.checkInDate,
      checkOutDate: bookingDraft.checkOutDate,
      nights: bookingDraft.nights,
      adults: bookingDraft.adults,
      tariffPerNight: bookingDraft.tariff,
      baseTotal: totalAmt,
      totalAmount: totalAmt,
      advanceDeposit: deposit,
      balanceDue: Math.max(0, totalAmt - deposit),
      paymentMode: bookingDraft.billingMode,
      paymentStatus: deposit >= totalAmt ? 'Paid' : 'Partial / Due at Check-out',
      bookingStatus: 'Confirmed',
      source: `Front Desk [${bookingDraft.source}]`,
      companyName: bookingDraft.companyName,
      purposeOfVisit: bookingDraft.purposeOfVisit
    };

    try {
      // 1. Post to live Railway Cloud PostgreSQL database
      const cloudRes = await createFastApiBooking(bookingPayload);
      console.log('[TapeChart] Saved to Railway PostgreSQL:', cloudRes);

      // 2. Notify parent App.jsx & Desktop Shell state
      if (onNewBooking) {
        onNewBooking(bookingPayload);
      }

      playReceptionChime();
      playSuccessChime();

      setBookingFeedbackMsg(`✅ Booking locked on Railway Cloud! Ref: ${bookingPayload.booking_reference}`);

      setTimeout(() => {
        setIsSavingBooking(false);
        setBookingDialogOpen(false);
        refreshCloudReservations();
      }, 1200);

    } catch (err) {
      console.warn('[TapeChart] Save error:', err);
      // Fallback to local
      if (onNewBooking) onNewBooking(bookingPayload);
      playSuccessChime();
      setIsSavingBooking(false);
      setBookingDialogOpen(false);
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="ids-win32-window" 
        style={{
          width: isMaximized ? '98vw' : '92vw',
          height: isMaximized ? '96vh' : '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ECE9D8',
          border: '2px outset #FFFFFF',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          fontFamily: "'Segoe UI', Tahoma, sans-serif"
        }}
      >
        {/* Win32 Window Title Bar */}
        <div 
          className="ids-win-titlebar" 
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFFFFF',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: 700,
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarRange size={16} color="#FFD700" />
            <span>IDS Fortune Suite - Room Tape Chart & Advance Reservation Calendar Matrix [F3]</span>
            <span style={{ fontSize: '10px', background: '#006699', padding: '1px 6px', borderRadius: '2px', color: '#FFF' }}>
              HOTEL ELITE INN · 27 ROOMS
            </span>
            <span style={{ fontSize: '10px', background: '#2E7D32', padding: '1px 6px', borderRadius: '2px', color: '#FFF' }}>
              ● LIVE CLOUD POSTGRESQL SYNC
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setIsMaximized(prev => !prev)} 
              className="ids-win-ctrl-btn" 
              title="Maximize / Restore"
              style={{ width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button 
              onClick={onClose} 
              className="ids-win-ctrl-btn close" 
              title="Close Tape Chart (Esc)"
              style={{ width: '18px', height: '18px', fontSize: '10px', background: '#D32F2F', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Win32 Menu Bar */}
        <div style={{ background: '#ECE9D8', borderBottom: '1px solid #999', padding: '2px 8px', fontSize: '11px', display: 'flex', gap: '14px', color: '#000' }}>
          <span style={{ cursor: 'pointer' }}>File</span>
          <span style={{ cursor: 'pointer' }}>View</span>
          <span style={{ cursor: 'pointer', fontWeight: 700, color: '#0A246A' }}>Tape Chart</span>
          <span style={{ cursor: 'pointer' }}>Filter</span>
          <span style={{ cursor: 'pointer' }}>Advance Booking</span>
          <span style={{ cursor: 'pointer' }}>Railway Sync</span>
          <span style={{ cursor: 'pointer' }}>Reports</span>
          <span style={{ cursor: 'pointer' }}>Help [F1]</span>
        </div>

        {/* Win32 Command Toolbar */}
        <div style={{ background: '#F0ECE1', borderBottom: '1px solid #B0AB9A', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="ids-btn-classic info" 
              onClick={() => handleShiftDate(-7)}
              title="Jump 1 Week Earlier"
              style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}
            >
              <ChevronLeft size={14} /> ◀ Prev Week
            </button>
            <button 
              className="ids-btn-classic" 
              onClick={handleSetToday}
              title="Jump to Today's Date"
              style={{ padding: '3px 8px', background: '#0A246A', color: '#FFF', fontSize: '11px', fontWeight: 700 }}
            >
              📅 Today ({new Date().toLocaleDateString('en-GB')})
            </button>
            <button 
              className="ids-btn-classic info" 
              onClick={() => handleShiftDate(7)}
              title="Jump 1 Week Later"
              style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}
            >
              Next Week ▶ <ChevronRight size={14} />
            </button>

            {/* Direct Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Jump To:</span>
              <input 
                type="date" 
                value={startDateStr} 
                onChange={e => e.target.value && setStartDateStr(e.target.value)}
                style={{ padding: '2px 5px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
              />
            </div>

            {/* Duration View Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px', border: '1px solid #B0AB9A', background: '#E2DEC9', padding: '2px' }}>
              <button 
                onClick={() => setDaysCount(7)}
                style={{ padding: '2px 8px', fontSize: '11px', fontWeight: daysCount === 7 ? 700 : 400, background: daysCount === 7 ? '#0A246A' : 'transparent', color: daysCount === 7 ? '#FFF' : '#000', border: 'none', cursor: 'pointer' }}
              >
                7 Days
              </button>
              <button 
                onClick={() => setDaysCount(14)}
                style={{ padding: '2px 8px', fontSize: '11px', fontWeight: daysCount === 14 ? 700 : 400, background: daysCount === 14 ? '#0A246A' : 'transparent', color: daysCount === 14 ? '#FFF' : '#000', border: 'none', cursor: 'pointer' }}
              >
                14 Days
              </button>
              <button 
                onClick={() => setDaysCount(30)}
                style={{ padding: '2px 8px', fontSize: '11px', fontWeight: daysCount === 30 ? 700 : 400, background: daysCount === 30 ? '#0A246A' : 'transparent', color: daysCount === 30 ? '#FFF' : '#000', border: 'none', cursor: 'pointer' }}
              >
                30 Days (Month)
              </button>
            </div>
          </div>

          {/* Filter & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Floor Filter */}
            <select 
              value={selectedFloor} 
              onChange={e => setSelectedFloor(e.target.value)}
              style={{ fontSize: '11px', padding: '3px 6px', border: '1px solid #7F9DB9' }}
            >
              <option value="ALL">All Floors (1, 2 & 3)</option>
              <option value="1">Floor 1 (Rooms 101–109)</option>
              <option value="2">Floor 2 (Rooms 201–209)</option>
              <option value="3">Floor 3 (Rooms 301–309)</option>
            </select>

            {/* Category Filter */}
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ fontSize: '11px', padding: '3px 6px', border: '1px solid #7F9DB9' }}
            >
              <option value="ALL">All Categories (27 Rooms)</option>
              <option value="STD">Standard Deluxe (STD)</option>
              <option value="EXE">Executive Deluxe (EXE)</option>
              <option value="SUI">Royal Suite (SUI)</option>
            </select>

            {/* Quick Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={12} style={{ position: 'absolute', left: '6px', color: '#666' }} />
              <input 
                type="text" 
                placeholder="Search guest / phone / ref..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '3px 6px 3px 22px', fontSize: '11px', border: '1px solid #7F9DB9', width: '150px' }}
              />
            </div>

            {/* Refresh Cloud Button */}
            <button 
              className="ids-btn-classic refresh info" 
              onClick={refreshCloudReservations}
              disabled={isRefreshingCloud}
              title="Re-query live Railway PostgreSQL database"
              style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={isRefreshingCloud ? 'spin' : ''} />
              <span>{isRefreshingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            {/* Direct Advance Reservation Button */}
            <button 
              className="ids-btn-classic success confirm" 
              onClick={() => handleOpenBookingDialog('101', startDateStr)}
              style={{ padding: '3px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>New Advance Res</span>
            </button>
          </div>
        </div>

        {/* Live Operational KPI & Legend Ribbon */}
        <div style={{ background: '#DFDBC9', borderBottom: '1px solid #B0AB9A', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', flexWrap: 'wrap', gap: '8px' }}>
          {/* KPI Numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: '#0A246A' }}>
              📅 Window: {dateList[0]?.display} — {dateList[dateList.length - 1]?.display} ({daysCount} Days)
            </span>
            <span style={{ color: '#333' }}>|</span>
            <span>Total Rooms: <strong>27</strong></span>
            <span>Total Room-Nights: <strong>{windowStats.totalRoomNights}</strong></span>
            <span>Booked: <strong style={{ color: '#0066CC' }}>{windowStats.bookedNights}</strong></span>
            <span>Free to Sell: <strong style={{ color: '#2E7D32' }}>{windowStats.freeNights}</strong></span>
            <span>Projected Occupancy: <strong style={{ color: windowStats.occRate > 50 ? '#C62828' : '#2E7D32' }}>{windowStats.occRate}%</strong></span>
          </div>

          {/* Color Badges Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#E8F5E9', border: '1px solid #81C784' }}></span>
              Vacant / Available (Click to Book)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#0284C7', border: '1px solid #0369A1' }}></span>
              🌐 Online Web (Railway)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#1E40AF', border: '1px solid #1D4ED8' }}></span>
              📞 Phone / Front Desk Res
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#DC2626', border: '1px solid #B91C1C' }}></span>
              🔑 Occupied / Checked In
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#7C3AED', border: '1px solid #6D28D9' }}></span>
              🏢 Corporate BTC Block
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#475569', border: '1px solid #334155' }}></span>
              🔧 Maintenance Block
            </span>
          </div>
        </div>

        {/* The Matrix Table Canvas (Scrollable) */}
        <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF', position: 'relative' }}>
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '11px',
              fontFamily: "'Segoe UI', Tahoma, monospace",
              userSelect: 'none'
            }}
          >
            {/* Header: Months & Dates */}
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#ECE9D8', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {/* Row 1: Left Columns + Date Headers */}
              <tr>
                <th 
                  style={{ 
                    position: 'sticky', left: 0, zIndex: 12, 
                    background: '#DFDBC9', borderRight: '2px solid #808080', borderBottom: '1px solid #B0AB9A', 
                    padding: '6px 8px', textAlign: 'center', width: '60px', fontWeight: 800, color: '#0A246A'
                  }}
                >
                  ROOM
                </th>
                <th 
                  style={{ 
                    position: 'sticky', left: '60px', zIndex: 12, 
                    background: '#DFDBC9', borderRight: '2px solid #808080', borderBottom: '1px solid #B0AB9A', 
                    padding: '6px 8px', textAlign: 'center', width: '55px', fontWeight: 800, color: '#0A246A' 
                  }}
                >
                  TYPE
                </th>
                <th 
                  style={{ 
                    position: 'sticky', left: '115px', zIndex: 12, 
                    background: '#DFDBC9', borderRight: '2px solid #808080', borderBottom: '1px solid #B0AB9A', 
                    padding: '6px 8px', textAlign: 'right', width: '65px', fontWeight: 800, color: '#0A246A' 
                  }}
                >
                  TARIFF
                </th>

                {/* Date Columns */}
                {dateList.map((d, idx) => (
                  <th 
                    key={d.dateStr}
                    style={{
                      borderRight: '1px solid #C0BCAC',
                      borderBottom: '1px solid #B0AB9A',
                      padding: '4px 2px',
                      minWidth: '85px',
                      textAlign: 'center',
                      background: d.isToday 
                        ? '#FFE082' 
                        : (d.isWeekend ? '#F5EEDA' : '#DFDBC9'),
                      color: d.isToday ? '#B71C1C' : '#000000',
                      fontWeight: d.isToday ? 800 : 600
                    }}
                  >
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', color: d.isToday ? '#B71C1C' : '#666' }}>
                      {d.dayName} {d.isToday && '★'}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>
                      {d.dayNum} {d.monthShort}
                    </div>
                  </th>
                ))}
              </tr>

              {/* Row 2: Daily Availability Counter Summary */}
              <tr style={{ background: '#F1EFE6', borderBottom: '2px solid #808080', fontSize: '9px' }}>
                <th 
                  colSpan={3} 
                  style={{ 
                    position: 'sticky', left: 0, zIndex: 12, 
                    background: '#E4E0D2', borderRight: '2px solid #808080', 
                    padding: '3px 8px', textAlign: 'left', fontWeight: 700, color: '#333'
                  }}
                >
                  AVAILABILITY SUMMARY
                </th>
                {dateList.map(d => {
                  let occOnDay = 0;
                  allRooms.forEach(r => {
                    if (getCellBooking(r.roomNumber, d.dateStr)) occOnDay++;
                  });
                  const freeOnDay = 27 - occOnDay;
                  return (
                    <th 
                      key={d.dateStr}
                      style={{ 
                        borderRight: '1px solid #C0BCAC', 
                        padding: '2px 1px', 
                        textAlign: 'center', 
                        color: freeOnDay < 5 ? '#C62828' : '#2E7D32',
                        fontWeight: 700
                      }}
                    >
                      <div>{freeOnDay} Free</div>
                      <div style={{ color: '#666', fontSize: '8px' }}>{occOnDay} Occ</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: 27 Room Rows */}
            <tbody>
              {filteredRooms.map((r, rIdx) => {
                const rNum = String(r.roomNumber);
                const floor = rNum.charAt(0);
                const isFloorHeader = rIdx === 0 || String(filteredRooms[rIdx - 1]?.roomNumber).charAt(0) !== floor;

                const catCode = rNum.startsWith('3') ? 'SUI' : (rNum.startsWith('2') ? 'EXE' : 'STD');
                const tariffVal = r.tariff || r.basePrice || (catCode === 'SUI' ? 3250 : (catCode === 'EXE' ? 2050 : 1750));

                return (
                  <React.Fragment key={rNum}>
                    {/* Floor Group Divider Header */}
                    {isFloorHeader && (
                      <tr style={{ background: '#0A246A', color: '#FFF' }}>
                        <td 
                          colSpan={3 + dateList.length}
                          style={{ 
                            padding: '3px 10px', 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            letterSpacing: '0.5px'
                          }}
                        >
                          FLOOR {floor} INVENTORY — {floor === '1' ? 'GROUND / 1ST FLOOR (EXECUTIVE & DELUXE)' : (floor === '2' ? '2ND FLOOR (PREMIUM EXECUTIVE DELUXE)' : '3RD FLOOR (ROYAL SUITES & PRESIDENTIAL)')}
                        </td>
                      </tr>
                    )}

                    {/* Room Row */}
                    <tr 
                      style={{ 
                        background: rIdx % 2 === 0 ? '#FFFFFF' : '#FBFBFB',
                        height: '34px'
                      }}
                    >
                      {/* Frozen Col 1: Room Number */}
                      <td 
                        style={{ 
                          position: 'sticky', left: 0, zIndex: 5, 
                          background: rIdx % 2 === 0 ? '#F3F0E6' : '#EBE7D8',
                          borderRight: '1px solid #A09C8D', borderBottom: '1px solid #D0CCC0',
                          padding: '4px 6px', fontWeight: 800, textAlign: 'center', fontSize: '12px',
                          color: '#0A246A'
                        }}
                      >
                        {rNum}
                      </td>

                      {/* Frozen Col 2: Category Code */}
                      <td 
                        style={{ 
                          position: 'sticky', left: '60px', zIndex: 5, 
                          background: rIdx % 2 === 0 ? '#F3F0E6' : '#EBE7D8',
                          borderRight: '1px solid #A09C8D', borderBottom: '1px solid #D0CCC0',
                          padding: '4px 6px', textAlign: 'center', fontSize: '10px', fontWeight: 700,
                          color: catCode === 'SUI' ? '#6B21A8' : (catCode === 'EXE' ? '#006699' : '#333')
                        }}
                      >
                        {catCode}
                      </td>

                      {/* Frozen Col 3: Tariff */}
                      <td 
                        style={{ 
                          position: 'sticky', left: '115px', zIndex: 5, 
                          background: rIdx % 2 === 0 ? '#F3F0E6' : '#EBE7D8',
                          borderRight: '2px solid #808080', borderBottom: '1px solid #D0CCC0',
                          padding: '4px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 600,
                          color: '#004D40'
                        }}
                      >
                        ₹{tariffVal.toLocaleString('en-IN')}
                      </td>

                      {/* Date Cells */}
                      {dateList.map((d) => {
                        const cellData = getCellBooking(rNum, d.dateStr);

                        if (cellData) {
                          const b = cellData.booking;
                          const isOnline = b.isOnline;
                          const isOccupied = b.status === 'Checked In' || b.isCheckedIn;
                          const isCorporate = b.isCorporate;
                          const isMaintenance = b.isMaintenance;

                          // Palette determination
                          let bg = '#1E40AF'; // Default Phone Res (Royal Blue)
                          let border = '#1D4ED8';
                          let tag = '📞';

                          if (isMaintenance) {
                            bg = '#475569';
                            border = '#334155';
                            tag = '🔧';
                          } else if (isOccupied) {
                            bg = '#DC2626'; // Checked-in (Red)
                            border = '#B91C1C';
                            tag = '🔑';
                          } else if (isOnline) {
                            bg = '#0284C7'; // Online Web (Cyan/Sky)
                            border = '#0369A1';
                            tag = '🌐';
                          } else if (isCorporate) {
                            bg = '#7C3AED'; // Corporate Purple
                            border = '#6D28D9';
                            tag = '🏢';
                          }

                          return (
                            <td
                              key={d.dateStr}
                              onClick={() => setInspectedBooking(b)}
                              title={`Click to view reservation folio details:\n• Guest: ${b.guestName}\n• Ref: ${b.bookingReference || b.id}\n• Stay: ${b.checkInDate} to ${b.checkOutDate}\n• Source: ${b.source}\n• Phone: ${b.guestPhone || 'N/A'}`}
                              style={{
                                borderRight: '1px solid #C0BCAC',
                                borderBottom: '1px solid #C0BCAC',
                                padding: '2px',
                                background: bg,
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease',
                                textAlign: 'left'
                              }}
                            >
                              <div 
                                style={{ 
                                  height: '28px', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  justifyContent: 'center', 
                                  padding: '0 4px',
                                  fontSize: '9px',
                                  overflow: 'hidden',
                                  lineHeight: 1.15
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  <span>{tag}</span>
                                  <span>{cellData.isArrival ? '▶ ' : ''}{b.guestName || 'Reserved'}</span>
                                </div>
                                <div style={{ fontSize: '8px', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {b.bookingReference || b.id} {cellData.isDepartureNight ? ' (Dep ◀)' : ''}
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // Empty / Vacant Cell (Click to Book)
                        return (
                          <td 
                            key={d.dateStr}
                            onClick={() => handleOpenBookingDialog(rNum, d.dateStr)}
                            title={`Room ${rNum} is FREE on ${d.display}!\nClick to create advance reservation.`}
                            style={{
                              borderRight: '1px solid #E0DCD0',
                              borderBottom: '1px solid #E0DCD0',
                              padding: '2px',
                              textAlign: 'center',
                              background: d.isToday ? '#FFFDE7' : (d.isWeekend ? '#FAFAF6' : '#FFFFFF'),
                              cursor: 'pointer',
                              transition: 'background 0.1s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#C8E6C9'}
                            onMouseLeave={e => e.currentTarget.style.background = d.isToday ? '#FFFDE7' : (d.isWeekend ? '#FAFAF6' : '#FFFFFF')}
                          >
                            <div style={{ height: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '8px', color: '#2E7D32', fontWeight: 600 }}>FREE</span>
                              <span style={{ fontSize: '8px', color: '#999' }}>₹{tariffVal}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Win32 Status Bar at Bottom */}
        <div 
          style={{ 
            background: '#ECE9D8', 
            borderTop: '1px solid #999', 
            padding: '3px 8px', 
            fontSize: '11px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            color: '#333'
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Hotel Elite Inn Win32 PMS Matrix</span>
            <span>• 27 Rooms Registered</span>
            <span>• Press <strong>F3</strong> to toggle matrix</span>
            <span>• Click any green cell to book phone inquiry</span>
          </div>
          <div>
            <span>FastAPI Server: <strong>https://hotel-elite-inn-backend-api-production-0dc9.up.railway.app</strong></span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL 1: Quick Advance Reservation Dialog (For Phone Calls) */}
        {/* ------------------------------------------------------------- */}
        {bookingDialogOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 10001, background: 'rgba(0,0,0,0.5)' }}>
            <div 
              className="ids-win32-window" 
              style={{
                width: '540px',
                background: '#ECE9D8',
                border: '2px outset #FFFFFF',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            >
              <div 
                className="ids-win-titlebar" 
                style={{
                  background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                <span>➕ New Advance Room Reservation (Front Desk / Phone Call)</span>
                <button 
                  onClick={() => setBookingDialogOpen(false)} 
                  style={{ background: '#D32F2F', color: '#FFF', border: 'none', cursor: 'pointer', padding: '1px 5px', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '12px 16px', fontSize: '11px' }}>
                <div style={{ background: '#E8F5E9', border: '1px solid #81C784', padding: '8px 12px', marginBottom: '12px', borderRadius: '3px', color: '#1B5E20' }}>
                  <strong>Selected Room:</strong> Room {bookingDraft.roomNumber} ({bookingDraft.tier}) &bull; Tariff: ₹{bookingDraft.tariff.toLocaleString('en-IN')}/night
                </div>

                {/* Form Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {/* Check-In Date */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Check-In Date:</label>
                    <input 
                      type="date"
                      value={bookingDraft.checkInDate}
                      onChange={e => {
                        const inD = e.target.value;
                        const outD = new Date(inD);
                        outD.setDate(outD.getDate() + bookingDraft.nights);
                        setBookingDraft(prev => ({ ...prev, checkInDate: inD, checkOutDate: outD.toISOString().split('T')[0] }));
                      }}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    />
                  </div>

                  {/* Nights */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Number of Nights:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30"
                      value={bookingDraft.nights}
                      onChange={e => handleNightsChange(e.target.value)}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    />
                  </div>

                  {/* Check-Out Date (Computed) */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Check-Out Date:</label>
                    <input 
                      type="date"
                      value={bookingDraft.checkOutDate}
                      readOnly
                      style={{ width: '100%', padding: '4px', border: '1px solid #B0AB9A', background: '#F0ECE1' }}
                    />
                  </div>

                  {/* Booking Source */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Booking Source:</label>
                    <select 
                      value={bookingDraft.source} 
                      onChange={e => setBookingDraft(prev => ({ ...prev, source: e.target.value }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Phone Call Inquiry">📞 Phone Call Inquiry (Reception)</option>
                      <option value="Direct Walk-in Advance">🚶 Walk-in Advance Booking</option>
                      <option value="Corporate BTC Account">🏢 Corporate BTC (Direct Billing)</option>
                      <option value="Online Website / WhatsApp">🌐 Online Portal / WhatsApp Direct</option>
                    </select>
                  </div>
                </div>

                {/* Guest Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Title:</label>
                    <select 
                      value={bookingDraft.title} 
                      onChange={e => setBookingDraft(prev => ({ ...prev, title: e.target.value }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Dr">Dr.</option>
                      <option value="Prof">Prof.</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Guest Full Name: *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Ramesh Patnaik"
                      value={bookingDraft.guestName}
                      onChange={e => setBookingDraft(prev => ({ ...prev, guestName: e.target.value }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Mobile Number: *</label>
                    <input 
                      type="tel"
                      placeholder="e.g. 9437012345"
                      value={bookingDraft.guestPhone}
                      onChange={e => setBookingDraft(prev => ({ ...prev, guestPhone: e.target.value }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    />
                  </div>
                </div>

                {/* Corporate Account & Pax */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Company / Organization:</label>
                    <select 
                      value={bookingDraft.companyName}
                      onChange={e => setBookingDraft(prev => ({ ...prev, companyName: e.target.value }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="">Direct FIT (Individual Guest)</option>
                      <option value="Linde India Ltd">Linde India Ltd (COM0004)</option>
                      <option value="JK Paper Mills Ltd">JK Paper Mills Ltd (COM0003)</option>
                      <option value="Utkal Alumina International Ltd">Utkal Alumina International Ltd (COM0005)</option>
                      <option value="Vedanta Alumina Ltd">Vedanta Alumina Ltd (COM0002)</option>
                      <option value="Ashok Leyland Ltd">Ashok Leyland Ltd (COM0001)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Adults / Pax:</label>
                    <select 
                      value={bookingDraft.adults} 
                      onChange={e => setBookingDraft(prev => ({ ...prev, adults: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                    >
                      <option value={1}>1 Pax</option>
                      <option value={2}>2 Pax</option>
                      <option value={3}>3 Pax (Extra Bed)</option>
                    </select>
                  </div>
                </div>

                {/* Billing & Advance Deposit */}
                <div style={{ background: '#F5EEDA', border: '1px solid #C0BCAC', padding: '10px', marginBottom: '12px', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Total Tariff ({bookingDraft.nights} nights &times; ₹{bookingDraft.tariff}):</span>
                    <strong style={{ fontSize: '13px' }}>₹{(bookingDraft.tariff * bookingDraft.nights).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Advance Deposit Collected (₹):</label>
                      <input 
                        type="number"
                        value={bookingDraft.advanceDeposit}
                        onChange={e => setBookingDraft(prev => ({ ...prev, advanceDeposit: Number(e.target.value) }))}
                        style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Payment Mode:</label>
                      <select 
                        value={bookingDraft.billingMode} 
                        onChange={e => setBookingDraft(prev => ({ ...prev, billingMode: e.target.value }))}
                        style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9' }}
                      >
                        <option value="Cash">Cash (Front Desk)</option>
                        <option value="UPI">UPI (QR / GooglePay)</option>
                        <option value="Credit Card">Credit / Debit Card</option>
                        <option value="Corporate BTC">Corporate BTC (Credit Ledger)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feedback message */}
                {bookingFeedbackMsg && (
                  <div style={{ marginBottom: '10px', padding: '6px 10px', background: '#E0F2FE', border: '1px solid #38BDF8', color: '#0369A1', fontWeight: 600 }}>
                    {bookingFeedbackMsg}
                  </div>
                )}

                {/* Dialog Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button 
                    className="ids-btn-classic cancel" 
                    onClick={() => setBookingDialogOpen(false)}
                    disabled={isSavingBooking}
                    style={{ padding: '5px 14px', minWidth: '80px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="ids-btn-classic save success" 
                    onClick={handleSaveAdvanceBooking}
                    disabled={isSavingBooking}
                    style={{ padding: '5px 18px', fontWeight: 700, minWidth: '120px' }}
                  >
                    {isSavingBooking ? 'Saving to Cloud...' : '✔ [F10] Save & Lock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL 2: Inspected Reservation Detail Popover              */}
        {/* ------------------------------------------------------------- */}
        {inspectedBooking && (
          <div className="ids-modal-overlay" style={{ zIndex: 10002, background: 'rgba(0,0,0,0.5)' }}>
            <div 
              className="ids-win32-window" 
              style={{
                width: '480px',
                background: '#ECE9D8',
                border: '2px outset #FFFFFF',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            >
              <div 
                className="ids-win-titlebar" 
                style={{
                  background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                <span>📋 Reservation Folio Inspector — Room {inspectedBooking.roomNumber}</span>
                <button 
                  onClick={() => setInspectedBooking(null)} 
                  style={{ background: '#D32F2F', color: '#FFF', border: 'none', cursor: 'pointer', padding: '1px 5px', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '14px 18px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #B0AB9A', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0A246A' }}>
                      {inspectedBooking.guestName}
                    </div>
                    <div style={{ color: '#666', fontSize: '10px' }}>
                      Booking Ref: <strong>{inspectedBooking.bookingReference || inspectedBooking.id}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span 
                      style={{ 
                        padding: '2px 8px', 
                        borderRadius: '3px', 
                        fontWeight: 700, 
                        fontSize: '10px',
                        background: inspectedBooking.isOnline ? '#E0F2FE' : '#EDE9FE',
                        color: inspectedBooking.isOnline ? '#0369A1' : '#6D28D9'
                      }}
                    >
                      {inspectedBooking.source || 'Advance Reservation'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div><strong>Room Number:</strong> {inspectedBooking.roomNumber}</div>
                  <div><strong>Contact Phone:</strong> {inspectedBooking.guestPhone || '9999999999'}</div>
                  <div><strong>Check-In Date:</strong> {inspectedBooking.checkInDate}</div>
                  <div><strong>Check-Out Date:</strong> {inspectedBooking.checkOutDate}</div>
                  <div><strong>Total Amount:</strong> ₹{Number(inspectedBooking.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Advance Deposit:</strong> ₹{Number(inspectedBooking.advancePaid || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Balance Due:</strong> ₹{Number(inspectedBooking.balanceDue || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Payment Mode:</strong> {inspectedBooking.billingMode || 'Cash'}</div>
                  {inspectedBooking.companyName && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Company:</strong> {inspectedBooking.companyName}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {onOpenFolio && (
                    <button 
                      className="ids-btn-classic folio info" 
                      onClick={() => {
                        onOpenFolio(inspectedBooking.roomNumber);
                        setInspectedBooking(null);
                      }}
                      style={{ fontWeight: 600 }}
                    >
                      View Guest Folio
                    </button>
                  )}
                  <button 
                    className="ids-btn-classic exit danger" 
                    onClick={() => setInspectedBooking(null)}
                    style={{ minWidth: '70px', fontWeight: 700 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
