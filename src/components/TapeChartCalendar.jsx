import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, 
  Plus, Search, Filter, AlertCircle, CheckCircle2, 
  FileText, ArrowRight, Eye, RefreshCw, Zap
} from 'lucide-react';

export default function TapeChartCalendar({
  rooms = [],
  bookings = [],
  onOpenBookingModal,
  onOpenWalkInModal,
  onViewFolio,
  onOpenReceipt
}) {
  // Base date for the 14-day window (defaults to today)
  const [timelineStartDate, setTimelineStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Filters
  const [selectedFloor, setSelectedFloor] = useState('all'); // 'all', 1, 2, 3
  const [selectedTier, setSelectedTier] = useState('all'); // 'all', 'Executive', 'Deluxe', 'Suite'
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [activeTooltipPos, setActiveTooltipPos] = useState({ x: 0, y: 0 });

  // Generate 14 continuous dates starting from timelineStartDate
  const daysArray = useMemo(() => {
    const dates = [];
    const base = new Date(timelineStartDate);
    
    // Safety check for invalid date
    if (isNaN(base.getTime())) {
      const fallback = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(fallback);
        d.setDate(fallback.getDate() + i);
        dates.push(formatDayObject(d));
      }
      return dates;
    }

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(formatDayObject(d));
    }
    return dates;
  }, [timelineStartDate]);

  function formatDayObject(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${dayNum}`;
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = isoDate === todayStr;

    return {
      dateObj: d,
      isoDate,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
      year: d.getFullYear(),
      isToday,
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    };
  }

  // Navigation handlers
  const handleShiftDays = (amount) => {
    const curr = new Date(timelineStartDate);
    curr.setDate(curr.getDate() + amount);
    setTimelineStartDate(curr.toISOString().split('T')[0]);
  };

  const handleResetToday = () => {
    const today = new Date();
    setTimelineStartDate(today.toISOString().split('T')[0]);
  };

  const handleQuickMonth = (targetYear, targetMonthIndex) => {
    const d = new Date(targetYear, targetMonthIndex, 1);
    // If target month is current month, start from today
    const now = new Date();
    if (now.getFullYear() === targetYear && now.getMonth() === targetMonthIndex) {
      setTimelineStartDate(now.toISOString().split('T')[0]);
    } else {
      setTimelineStartDate(d.toISOString().split('T')[0]);
    }
  };

  // Range label for header (e.g., "7 Oct - 20 Oct 2026")
  const dateRangeLabel = useMemo(() => {
    if (daysArray.length === 0) return '';
    const first = daysArray[0];
    const last = daysArray[daysArray.length - 1];
    return `${first.dayNumber} ${first.monthName} – ${last.dayNumber} ${last.monthName} ${last.year}`;
  }, [daysArray]);

  // Quick Month options: Current month + next 4 months
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = d.getFullYear();
      const mIdx = d.getMonth();
      const label = `${monthNames[mIdx]} ${y}`;
      list.push({ label, year: y, monthIndex: mIdx });
    }
    return list;
  }, []);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Floor filter
      if (selectedFloor !== 'all' && Number(room.floor) !== Number(selectedFloor)) {
        return false;
      }
      // Tier filter
      if (selectedTier !== 'all') {
        const t = (room.tier || '').toLowerCase();
        if (!t.includes(selectedTier.toLowerCase())) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const rNum = String(room.roomNumber).toLowerCase();
        const rTier = String(room.tier || '').toLowerCase();
        const rGuest = String(room.currentGuestName || room.effectiveGuestName || '').toLowerCase();
        if (!rNum.includes(q) && !rTier.includes(q) && !rGuest.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, selectedFloor, selectedTier, searchQuery]);

  // Cell status resolver for any room on any specific date
  const resolveCellData = (room, day) => {
    const dateStr = day.isoDate;
    const rNum = String(room.roomNumber);

    // 1. Check live in-house stay for TODAY
    if (day.isToday) {
      const roomStatus = String(room.effectiveStatus || room.status || '').toLowerCase();
      const hasGuest = Boolean(
        (room.currentGuestName && room.currentGuestName !== '—' && room.currentGuestName !== 'Available') ||
        (room.effectiveGuestName && room.effectiveGuestName !== '—' && room.effectiveGuestName !== 'Available')
      );
      if (roomStatus.includes('occupied') || roomStatus.includes('stay') || hasGuest) {
        return {
          status: 'occupied',
          type: 'Occupied (In-House)',
          guestName: room.effectiveGuestName || room.currentGuestName || 'In-House Guest',
          guestPhone: room.effectivePhone || room.phone || '+91 94370 22555',
          company: room.company || 'Direct Guest',
          bookingId: `FMBIL2627-${rNum}`,
          isToday: true
        };
      }
      if (roomStatus.includes('maintenance') || roomStatus.includes('ooo') || roomStatus.includes('blocked')) {
        return {
          status: 'maintenance',
          type: 'Maintenance / OOO',
          reason: 'Maintenance & OOO Blocker Active'
        };
      }
      if (roomStatus.includes('dirty') || roomStatus.includes('cleaning')) {
        return {
          status: 'housekeeping',
          type: 'Housekeeping Cleaning',
          reason: 'Turnover in progress'
        };
      }
    }

    // 2. Check bookings database for this room covering dateStr
    const matched = bookings.find(b => {
      if (String(b.roomNumber || b.room_number) !== rNum) return false;
      if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Checked Out') return false;
      const cIn = b.checkInDate || b.check_in_date;
      const cOut = b.checkOutDate || b.check_out_date;
      if (!cIn) return false;

      // Check if date falls within [checkInDate, checkOutDate)
      // If checkInDate equals checkOutDate, count as 1 night
      if (cIn === cOut) return dateStr === cIn;
      return dateStr >= cIn && dateStr < cOut;
    });

    if (matched) {
      const bStatus = String(matched.bookingStatus || matched.status || 'Confirmed').toLowerCase();
      if (bStatus.includes('in-house') || bStatus.includes('checked in')) {
        return {
          status: 'occupied',
          type: 'Occupied (In-House)',
          guestName: matched.guestName || matched.guest_name || 'In-House Guest',
          guestPhone: matched.guestPhone || matched.guest_phone || '—',
          company: matched.company || 'Direct Guest',
          bookingId: matched.bookingId || matched.id,
          checkIn: matched.checkInDate,
          checkOut: matched.checkOutDate,
          nights: matched.nights || 1,
          tariff: matched.tariffPerNight || matched.tariff || room.tariff,
          source: matched.source || matched.bookingSource || 'Direct / Front Desk',
          bookingObj: matched
        };
      }
      if (bStatus.includes('hold')) {
        return {
          status: 'hold',
          type: 'Online Hold (15m)',
          guestName: matched.guestName || 'Pending Guest',
          bookingId: matched.bookingId || matched.id,
          source: 'Website Online Hold'
        };
      }
      return {
        status: 'confirmed',
        type: 'Confirmed Reservation',
        guestName: matched.guestName || matched.guest_name || 'Advance Guest',
        guestPhone: matched.guestPhone || matched.guest_phone || '—',
        company: matched.company || 'Direct Booking',
        bookingId: matched.bookingId || matched.id,
        checkIn: matched.checkInDate,
        checkOut: matched.checkOutDate,
        nights: matched.nights || 1,
        tariff: matched.tariffPerNight || matched.tariff || room.tariff,
        source: matched.source || 'Advance Phone / Online',
        bookingObj: matched
      };
    }

    // 3. Otherwise completely Free / Available
    return {
      status: 'available',
      type: 'Free / Available'
    };
  };

  // Cell click handler
  const handleCellClick = (room, day, cellData) => {
    if (cellData.status === 'available') {
      // 1-Click Advance Booking or Walk-in for that date & room
      const nextDay = new Date(day.dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      if (day.isToday && onOpenWalkInModal) {
        onOpenWalkInModal(room.roomNumber, room);
      } else if (onOpenBookingModal) {
        onOpenBookingModal({
          roomNumber: room.roomNumber,
          checkInDate: day.isoDate,
          checkOutDate: nextDayStr,
          tier: room.tier,
          tariff: room.tariff
        });
      }
    } else if (cellData.bookingObj && onViewFolio) {
      onViewFolio(room, cellData.bookingObj);
    }
  };

  // Hover handlers for rich floating tooltip
  const handleCellMouseEnter = (e, cellData, room, day) => {
    if (cellData.status !== 'available') {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveTooltipPos({
        x: Math.min(window.innerWidth - 320, rect.left + window.scrollX),
        y: rect.bottom + window.scrollY + 6
      });
      setHoveredBooking({
        ...cellData,
        roomNumber: room.roomNumber,
        tier: room.tier,
        dateStr: day.isoDate
      });
    }
  };

  const handleCellMouseLeave = () => {
    setHoveredBooking(null);
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #060e1a 0%, #0a1727 100%)',
      borderRadius: '14px',
      border: '1.5px solid rgba(212, 175, 55, 0.35)',
      padding: '1.25rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
      position: 'relative'
    }}>
      {/* TOP HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Left Titles */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid #d4af37',
            borderRadius: '6px',
            padding: '3px 10px',
            color: '#fbbf24',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '0.4rem'
          }}>
            <Calendar size={13} /> INTERACTIVE 14-DAY RESERVATION TAPE CHART
          </div>
          <h2 style={{
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: 900,
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.01em'
          }}>
            Front Desk Multi-Day Occupancy Calendar
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.82rem',
            margin: 0
          }}>
            Visual room rack timeline. Click any available cell to create a walk-in or advance booking.
          </p>
        </div>

        {/* Right Navigation & Date Picker Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
          {/* Timeline Navigation Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Shift 7 Days Back */}
            <button
              type="button"
              onClick={() => handleShiftDays(-7)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
              title="Shift 7 days back"
            >
              <ChevronLeft size={16} /> 7 Days
            </button>

            {/* Snap to Today */}
            <button
              type="button"
              onClick={handleResetToday}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)'
              }}
              title="Jump to Today's date"
            >
              <Zap size={14} /> Today
            </button>

            {/* Shift 7 Days Forward */}
            <button
              type="button"
              onClick={() => handleShiftDays(7)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
              title="Shift 7 days forward"
            >
              7 Days <ChevronRight size={16} />
            </button>

            {/* Date Range Badge */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              color: '#facc15',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.02em'
            }}>
              {dateRangeLabel}
            </div>
          </div>

          {/* Jump To Future Date Picker & Quick Month Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
              📅 Jump to Date:
            </span>
            <input
              type="date"
              value={timelineStartDate}
              onChange={(e) => {
                if (e.target.value) setTimelineStartDate(e.target.value);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '0.25rem 0.55rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            />

            {/* Quick Month Shortcuts */}
            <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '0.25rem' }}>
              {monthOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickMonth(opt.year, opt.monthIndex)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '5px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.color = '#fbbf24';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATUS LEGEND & QUICK FILTER BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'rgba(10, 20, 35, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '0.55rem 0.85rem',
        marginBottom: '1rem'
      }}>
        {/* Status Legends */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.76rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: 'rgba(15, 23, 42, 0.9)', border: '1.5px solid rgba(255, 255, 255, 0.2)' }} />
            <span style={{ color: '#94a3b8' }}>Free / Available</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#ef4444' }} />
            <span style={{ color: '#fca5a5', fontWeight: 600 }}>Occupied (In-House)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#38bdf8' }} />
            <span style={{ color: '#7dd3fc', fontWeight: 600 }}>Confirmed Reservation</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#f97316' }} />
            <span style={{ color: '#fdba74', fontWeight: 600 }}>Online Hold (15m)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#eab308' }} />
            <span style={{ color: '#fde047', fontWeight: 600 }}>Housekeeping Cleaning</span>
          </div>
        </div>

        {/* Tip text on the right */}
        <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>💡 Tip: Click any available cell to create booking • Hover over booked bars for guest details</span>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        {/* Floor & Tier Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginRight: '0.2rem' }}>Floor:</span>
          {['all', 1, 2, 3].map(fl => (
            <button
              key={fl}
              type="button"
              onClick={() => setSelectedFloor(fl)}
              style={{
                background: selectedFloor === fl ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedFloor === fl ? '#fbbf24' : '#94a3b8',
                border: selectedFloor === fl ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {fl === 'all' ? 'All Floors' : `Floor ${fl}`}
            </button>
          ))}

          <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: '0.5rem', marginRight: '0.2rem' }}>Tier:</span>
          {['all', 'Executive', 'Deluxe', 'Suite'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTier(t)}
              style={{
                background: selectedTier === t ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedTier === t ? '#38bdf8' : '#94a3b8',
                border: selectedTier === t ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t === 'all' ? 'All Tiers' : t}
            </button>
          ))}
        </div>

        {/* Quick Room Search */}
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search room (e.g. 101, 204)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem 0.3rem 1.8rem',
              color: '#ffffff',
              fontSize: '0.76rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* MATRIX TABLE CONTAINER */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#040913',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 1080,
          tableLayout: 'fixed'
        }}>
          {/* COLUMN HEADER */}
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1.5px solid rgba(212, 175, 55, 0.3)' }}>
              {/* Leftmost Column: Room Inventory */}
              <th style={{
                width: 220,
                padding: '0.75rem 0.85rem',
                textAlign: 'left',
                borderRight: '1.5px solid rgba(255, 255, 255, 0.12)',
                position: 'sticky',
                left: 0,
                background: '#07101e',
                zIndex: 10
              }}>
                <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Room Inventory
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500, marginTop: '2px' }}>
                  {filteredRooms.length} Luxury Units ({rooms.length} Total Keys)
                </div>
              </th>

              {/* 14 Calendar Day Columns */}
              {daysArray.map((day) => (
                <th
                  key={day.isoDate}
                  style={{
                    padding: '0.55rem 0.25rem',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    background: day.isToday ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    borderTop: day.isToday ? '2px solid #facc15' : 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: day.isToday ? '#facc15' : day.isWeekend ? '#fb923c' : '#94a3b8',
                    textTransform: 'uppercase'
                  }}>
                    {day.dayName}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: day.isToday ? '#facc15' : '#ffffff',
                    margin: '1px 0'
                  }}>
                    {day.dayNumber}
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: day.isToday ? '#facc15' : '#64748b',
                    fontWeight: 600
                  }}>
                    {day.monthName}
                  </div>

                  {day.isToday && (
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                      color: '#000000',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      borderRadius: '3px',
                      padding: '1px 5px',
                      marginTop: '2px',
                      letterSpacing: '0.03em'
                    }}>
                      TODAY
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY (27 ROOMS X 14 DAYS) */}
          <tbody>
            {filteredRooms.map((room, rIdx) => {
              const rowBg = rIdx % 2 === 0 ? 'rgba(6, 12, 22, 0.95)' : 'rgba(10, 18, 30, 0.95)';
              return (
                <tr key={room.roomNumber} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {/* Left Column: Room Card */}
                  <td style={{
                    padding: '0.55rem 0.85rem',
                    borderRight: '1.5px solid rgba(255, 255, 255, 0.12)',
                    position: 'sticky',
                    left: 0,
                    background: rowBg,
                    zIndex: 5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {/* Room Badge */}
                      <div style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        textAlign: 'center',
                        minWidth: 46
                      }}>
                        <div style={{ fontSize: '0.58rem', color: '#fbbf24', fontWeight: 800 }}>ROOM</div>
                        <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 900 }}>{room.roomNumber}</div>
                      </div>

                      {/* Room Info */}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}>
                          {room.tier || `Deluxe Room ${room.roomNumber}`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            textTransform: 'uppercase'
                          }}>
                            Floor {room.floor || (String(room.roomNumber)[0])}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 14 Daily Grid Cells */}
                  {daysArray.map((day) => {
                    const cellData = resolveCellData(room, day);
                    const isAvail = cellData.status === 'available';
                    const isOcc = cellData.status === 'occupied';
                    const isConf = cellData.status === 'confirmed';
                    const isHold = cellData.status === 'hold';
                    const isHk = cellData.status === 'housekeeping';

                    return (
                      <td
                        key={day.isoDate}
                        onClick={() => handleCellClick(room, day, cellData)}
                        onMouseEnter={(e) => handleCellMouseEnter(e, cellData, room, day)}
                        onMouseLeave={handleCellMouseLeave}
                        style={{
                          height: 48,
                          padding: '3px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                          background: day.isToday ? 'rgba(212, 175, 55, 0.04)' : 'transparent',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* 1. FREE / AVAILABLE CELL (Completely clean, NO PRICES, visual interactive slot) */}
                        {isAvail && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              borderRadius: '5px',
                              background: 'rgba(15, 23, 42, 0.45)',
                              border: '1px dashed rgba(255, 255, 255, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(52, 211, 153, 0.18)';
                              e.currentTarget.style.borderColor = '#34d399';
                              e.currentTarget.style.boxShadow = '0 0 8px rgba(52, 211, 153, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            title={`Room ${room.roomNumber} is Available on ${day.dayNumber} ${day.monthName}. Click to book!`}
                          >
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.25)',
                              fontSize: '0.8rem',
                              fontWeight: 700
                            }}>
                              +
                            </span>
                          </div>
                        )}

                        {/* 2. OCCUPIED (IN-HOUSE) BAR */}
                        {isOcc && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              borderRadius: '5px',
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                              overflow: 'hidden'
                            }}
                            title={`Occupied: ${cellData.guestName}`}
                          >
                            <div style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <User size={10} />
                              <span>{cellData.guestName}</span>
                            </div>
                          </div>
                        )}

                        {/* 3. CONFIRMED RESERVATION BAR */}
                        {isConf && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              borderRadius: '5px',
                              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px',
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                              overflow: 'hidden'
                            }}
                            title={`Confirmed Booking: ${cellData.guestName}`}
                          >
                            <div style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Calendar size={10} />
                              <span>{cellData.guestName}</span>
                            </div>
                          </div>
                        )}

                        {/* 4. ONLINE HOLD BAR */}
                        {isHold && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              borderRadius: '5px',
                              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px'
                            }}
                            title="Online Hold (15m)"
                          >
                            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>⏳ Hold</span>
                          </div>
                        )}

                        {/* 5. HOUSEKEEPING CLEANING */}
                        {isHk && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              borderRadius: '5px',
                              background: 'rgba(234, 179, 8, 0.25)',
                              border: '1px solid #eab308',
                              color: '#facc15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px'
                            }}
                            title="Housekeeping Cleaning"
                          >
                            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>🧹 Dirty</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FLOATING HOVER TOOLTIP POPOVER */}
      {hoveredBooking && (
        <div style={{
          position: 'fixed',
          left: activeTooltipPos.x,
          top: activeTooltipPos.y,
          background: 'rgba(6, 14, 26, 0.98)',
          border: '1.5px solid #d4af37',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.3)',
          zIndex: 9999,
          pointerEvents: 'none',
          minWidth: 260,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              background: hoveredBooking.status === 'occupied' ? '#ef4444' : '#0284c7',
              color: '#fff',
              textTransform: 'uppercase'
            }}>
              {hoveredBooking.type}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 800 }}>
              Room {hoveredBooking.roomNumber}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>
            {hoveredBooking.guestName}
          </div>

          {hoveredBooking.guestPhone && hoveredBooking.guestPhone !== '—' && (
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Phone size={11} color="#38bdf8" /> {hoveredBooking.guestPhone}
            </div>
          )}

          {hoveredBooking.checkIn && hoveredBooking.checkOut && (
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '4px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '4px' }}>
              <div><strong>Check-In:</strong> {hoveredBooking.checkIn}</div>
              <div><strong>Check-Out:</strong> {hoveredBooking.checkOut} ({hoveredBooking.nights} Nights)</div>
            </div>
          )}

          {hoveredBooking.bookingId && (
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', marginTop: '3px' }}>
              Ref: {hoveredBooking.bookingId}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
