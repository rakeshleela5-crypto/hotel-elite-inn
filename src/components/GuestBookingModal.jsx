import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Calendar, Users, MapPin, Phone, Mail, ShieldCheck, 
  Sparkles, Bed, Utensils, CreditCard, QrCode, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Share2, Printer, Clock, FileText, ChevronRight
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { 
  getStoredAccountingDate, 
  pmsDateToInputFormat, 
  inputFormatToPmsDate, 
  addDaysToPmsDate,
  calculateRoomNights 
} from '../data/idsPmsStore';
import { playSuccessChime, playReceptionChime } from '../utils/soundAlert';

export default function GuestBookingModal({
  isOpen,
  onClose,
  initialTier = null,
  initialRoomNumber = null,
  initialCheckIn = null,
  initialCheckOut = null,
  onConfirmBooking,
  rooms = []
}) {
  // Step navigation: 1: Selection & Dates | 2: Guest Details | 3: Review & Payment | 4: Confirmed Voucher
  const [step, setStep] = useState(1);

  // Selected Room Tier
  const [selectedTier, setSelectedTier] = useState(() => initialTier || ROOM_TIERS[1] || ROOM_TIERS[0]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(initialRoomNumber || '');

  // Dates & Occupancy
  const activePmsDate = getStoredAccountingDate();
  const defaultCheckInIso = useMemo(() => {
    if (initialCheckIn) return initialCheckIn;
    return pmsDateToInputFormat(activePmsDate);
  }, [initialCheckIn, activePmsDate]);

  const defaultCheckOutIso = useMemo(() => {
    if (initialCheckOut) return initialCheckOut;
    return pmsDateToInputFormat(addDaysToPmsDate(activePmsDate, 1));
  }, [initialCheckOut, activePmsDate]);

  const [checkInDate, setCheckInDate] = useState(defaultCheckInIso);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOutIso);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [mealPlan, setMealPlan] = useState('CP'); // 'EP' (Room Only) | 'CP' (Free Breakfast) | 'MAP' (+Dinner)

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Payment Selection
  const [paymentOption, setPaymentOption] = useState('PAY_AT_HOTEL'); // 'PAY_AT_HOTEL' | 'PAY_ONLINE_UPI'
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTier) setSelectedTier(initialTier);
      if (initialRoomNumber) setSelectedRoomNumber(initialRoomNumber);
      if (initialCheckIn) setCheckInDate(initialCheckIn);
      if (initialCheckOut) setCheckOutDate(initialCheckOut);
      setStep(1);
      setErrorMsg('');
      setConfirmedBooking(null);
    }
  }, [isOpen, initialTier, initialRoomNumber, initialCheckIn, initialCheckOut]);

  // Available room numbers for selected tier
  const availableRoomsForTier = useMemo(() => {
    if (!rooms || rooms.length === 0) return ['102', '104', '202', '204', '302'];
    const matched = rooms.filter(r => {
      const isMatch = r.tier === selectedTier.name || 
        r.tierId === selectedTier.id || 
        (selectedTier.tierAliases && selectedTier.tierAliases.includes(r.tier));
      return isMatch && (r.status === 'Available' || r.status === 'Vacant Clean' || r.status === 'Clean');
    });
    return matched.map(r => r.roomNumber);
  }, [rooms, selectedTier]);

  // Set default room number if available
  useEffect(() => {
    if (availableRoomsForTier.length > 0 && !selectedRoomNumber) {
      setSelectedRoomNumber(availableRoomsForTier[0]);
    }
  }, [availableRoomsForTier, selectedRoomNumber]);

  // Calculate nights
  const nights = useMemo(() => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return Math.max(1, isNaN(diff) ? 1 : diff);
    } catch (e) {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  // Pricing breakdown
  const nightlyRate = Number(selectedTier?.tariff || selectedTier?.singleTariff || 1750);
  const baseRoomTariff = nightlyRate * nights;

  // Meal Plan Add-on calculation
  const mealPlanAddon = useMemo(() => {
    if (mealPlan === 'MAP') {
      return 600 * adults * nights; // ₹600/person/night for dinner
    }
    return 0; // EP / CP has no extra charge over standard tariff
  }, [mealPlan, adults, nights]);

  const grossAmount = baseRoomTariff + mealPlanAddon;
  const gstAmount = Math.round(grossAmount * 0.12 * 100) / 100; // 12% GST SAC 996311
  const totalAmount = grossAmount + gstAmount;

  if (!isOpen) return null;

  // Validation
  const handleProceedToDetails = () => {
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }
    setErrorMsg('');
    setStep(2);
    playReceptionChime();
  };

  const handleProceedToReview = () => {
    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for booking SMS & WhatsApp confirmation.');
      return;
    }
    setErrorMsg('');
    setStep(3);
    playReceptionChime();
  };

  // Final Confirmation
  const handleFinalBooking = () => {
    const bookingId = `HEI-RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalRoomNo = selectedRoomNumber || availableRoomsForTier[0] || '203';

    const bookingPayload = {
      bookingId,
      roomNumber: String(finalRoomNo),
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || `${guestPhone.trim()}@guest.hotel-elite-inn.com`,
      guestCity: guestCity.trim() || 'Rayagada',
      tier: selectedTier.name,
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children,
      mealPlan,
      baseTotal: baseRoomTariff,
      mealPlanTotal: mealPlanAddon,
      gstAmount,
      totalAmount,
      advanceDeposit: paymentOption === 'PAY_ONLINE_UPI' ? totalAmount : 0,
      balanceDue: paymentOption === 'PAY_ONLINE_UPI' ? 0 : totalAmount,
      paymentMode: paymentOption === 'PAY_ONLINE_UPI' ? 'UPI Online' : 'Pay at Hotel',
      specialRequests: specialRequests.trim(),
      status: 'Confirmed',
      source: 'Online Direct Website',
      createdAt: new Date().toISOString()
    };

    setConfirmedBooking(bookingPayload);
    playSuccessChime();

    if (onConfirmBooking) {
      onConfirmBooking(bookingPayload);
    }

    setStep(4);
  };

  const handleWhatsAppShare = () => {
    if (!confirmedBooking) return;
    const msg = encodeURIComponent(
      `🏨 *Booking Confirmation - Hotel Elite Inn, Muniguda*\n` +
      `• Booking ID: ${confirmedBooking.bookingId}\n` +
      `• Guest Name: ${confirmedBooking.guestName}\n` +
      `• Room: ${confirmedBooking.tier} (Room ${confirmedBooking.roomNumber})\n` +
      `• Check-In: ${confirmedBooking.checkInDate} (24-Hr Flexible)\n` +
      `• Check-Out: ${confirmedBooking.checkOutDate}\n` +
      `• Duration: ${confirmedBooking.nights} Night(s) | ${confirmedBooking.adults} Adults\n` +
      `• Meal Plan: ${confirmedBooking.mealPlan} (Satvik Dining Included)\n` +
      `• Total Amount: ₹${confirmedBooking.totalAmount.toLocaleString('en-IN')}\n` +
      `• Payment Mode: ${confirmedBooking.paymentMode}\n\n` +
      `📍 *Location*: Opp. Railway Station Main Road, Muniguda, Odisha\n` +
      `📞 *Helpdesk*: +91-6370757541`
    );
    window.open(`https://wa.me/916370757541?text=${msg}`, '_blank');
  };

  return (
    <div 
      className="guest-booking-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        backgroundColor: 'rgba(5, 12, 24, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overflowY: 'auto'
      }}
    >
      <div 
        className="guest-booking-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '94vh',
          background: 'linear-gradient(165deg, #0F172A 0%, #090E17 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          color: '#F8FAFC',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              <Bed size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                Online Room Reservation
              </h2>
              <p style={{ fontSize: '11.5px', margin: 0, color: '#94A3B8' }}>
                Hotel Elite Inn • Direct Guest Booking Guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#CBD5E1',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Close Reservation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (Hidden on Confirmation Step) */}
        {step < 4 && (
          <div style={{ padding: '12px 20px 0 20px', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
              <span style={{ color: step >= 1 ? '#D4AF37' : '#64748B' }}>1. Room &amp; Dates</span>
              <span style={{ color: step >= 2 ? '#D4AF37' : '#64748B' }}>2. Guest Info</span>
              <span style={{ color: step >= 3 ? '#D4AF37' : '#64748B' }}>3. Payment &amp; Review</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${(step / 3) * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #D4AF37, #F59E0B)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {errorMsg && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              borderRadius: '8px', 
              padding: '10px 14px', 
              color: '#FCA5A5', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: ROOM SELECTION & DATES
              ========================================================================= */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Room Tier Cards */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>
                  Select Preferred Room Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  {ROOM_TIERS.map(t => {
                    const isSelected = selectedTier.id === t.id || selectedTier.name === t.name;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTier(t)}
                        style={{
                          background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '2px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#D4AF37' }}>
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#F8FAFC' : '#CBD5E1', marginBottom: '3px' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#D4AF37' }}>
                          ₹{t.tariff.toLocaleString('en-IN')}
                          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 400 }}> /night</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                          {t.bedType}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Stay Pickers */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                borderRadius: '12px', 
                padding: '14px' 
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  
                  {/* Check-In */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Calendar size={13} color="#D4AF37" /> Check-In Date
                    </label>
                    <input 
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Check-Out */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Calendar size={13} color="#D4AF37" /> Check-Out Date
                    </label>
                    <input 
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Duration Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '8px', padding: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Stay Duration</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#D4AF37' }}>
                      {nights} Night{nights > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Guests and Meal Plan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  
                  {/* Adults */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Adults (12+ Yrs)
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '13px'
                      }}
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults (+Extra Bed)</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>

                  {/* Children */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Children (0-11 Yrs)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '13px'
                      }}
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                    </select>
                  </div>

                  {/* Meal Plan */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Dining Plan
                    </label>
                    <select
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '13px'
                      }}
                    >
                      <option value="CP">CP (Free Buffet Breakfast)</option>
                      <option value="EP">EP (Room Only)</option>
                      <option value="MAP">MAP (+Pure Veg Dinner ₹600/pax)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Complimentary Amenities Included */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '10px 14px', fontSize: '11.5px', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} />
                <div>
                  <b>Included with your direct booking:</b> Complimentary Buffet Breakfast • 1L Mineral Water • Free High-Speed Wi-Fi • 24-Hour Flexible Check-in/Check-out cycle.
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 2: GUEST DETAILS & CONTACT
              ========================================================================= */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '12px', color: '#E2E8F0' }}>
                Booking for <b>{selectedTier.name}</b> • {nights} Night{nights > 1 ? 's' : ''} ({checkInDate} to {checkOutDate})
              </div>

              {/* Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Full Name (Primary Guest) *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Sunil Mohanty"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '13px'
                  }}
                  autoFocus
                />
              </div>

              {/* Mobile Phone & WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                    Mobile Number (10-Digit) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', overflow: 'hidden' }}>
                    <span style={{ padding: '0 10px', color: '#94A3B8', fontSize: '13px', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>+91</span>
                    <input 
                      type="tel"
                      maxLength={10}
                      placeholder="94370 00000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px 12px',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                    Email Address (Optional)
                  </label>
                  <input 
                    type="email"
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#F8FAFC',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* City / State */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  City / Hometown
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Rayagada / Bhubaneswar / Visakhapatnam"
                  value={guestCity}
                  onChange={(e) => setGuestCity(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Special Requests */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Special Requests / Arrival Notes (Optional)
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Arriving via train around 4:00 PM; require quiet room or early baggage drop."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '12.5px',
                    resize: 'none'
                  }}
                />
              </div>

              {/* WhatsApp Notification Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#CBD5E1' }}>
                <input 
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                <span>Send instant booking confirmation &amp; check-in slip to my WhatsApp</span>
              </label>

            </div>
          )}

          {/* =========================================================================
              STEP 3: PRICE BREAKDOWN & PAYMENT METHOD
              ========================================================================= */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Summary Card */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px', marginBottom: '10px' }}>
                  Reservation Summary
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Guest:</span> <b style={{ color: '#F8FAFC' }}>{guestName}</b>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Phone:</span> <b style={{ color: '#F8FAFC' }}>+91 {guestPhone}</b>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Room:</span> <b style={{ color: '#D4AF37' }}>{selectedTier.name}</b>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Dates:</span> <b style={{ color: '#F8FAFC' }}>{checkInDate} to {checkOutDate} ({nights} nt)</b>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.12)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                    <span>Room Tariff ({nights} Night{nights > 1 ? 's' : ''} × ₹{nightlyRate.toLocaleString('en-IN')})</span>
                    <span>₹{baseRoomTariff.toLocaleString('en-IN')}</span>
                  </div>

                  {mealPlanAddon > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                      <span>Dinner Plan Add-on (MAP)</span>
                      <span>₹{mealPlanAddon.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                    <span>GST (12% Hotel Accommodation SAC 996311)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '8px', marginTop: '4px', fontSize: '15px', fontWeight: 800 }}>
                    <span style={{ color: '#F8FAFC' }}>Total Payable:</span>
                    <span style={{ color: '#D4AF37' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Mode Options */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>
                  Choose How You Want to Pay
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Option 1: Pay at Hotel */}
                  <div 
                    onClick={() => setPaymentOption('PAY_AT_HOTEL')}
                    style={{
                      background: paymentOption === 'PAY_AT_HOTEL' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: paymentOption === 'PAY_AT_HOTEL' ? '2px solid #22C55E' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: '#22C55E' }}>
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                          Pay at Hotel upon Arrival (Recommended)
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          No advance payment required. Instant reservation confirmation.
                        </div>
                      </div>
                    </div>
                    {paymentOption === 'PAY_AT_HOTEL' && <CheckCircle2 size={18} color="#22C55E" />}
                  </div>

                  {/* Option 2: Pay Online UPI */}
                  <div 
                    onClick={() => setPaymentOption('PAY_ONLINE_UPI')}
                    style={{
                      background: paymentOption === 'PAY_ONLINE_UPI' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: paymentOption === 'PAY_ONLINE_UPI' ? '2px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: '#D4AF37' }}>
                        <QrCode size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                          Pay via UPI / QR / Card Online
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          Instant online payment receipt with zero check-in delays.
                        </div>
                      </div>
                    </div>
                    {paymentOption === 'PAY_ONLINE_UPI' && <CheckCircle2 size={18} color="#D4AF37" />}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 4: INSTANT BOOKING CONFIRMATION VOUCHER
              ========================================================================= */}
          {step === 4 && confirmedBooking && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', padding: '10px 0' }}>
              
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)'
                }}
              >
                <Check size={32} strokeWidth={3} />
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px 0' }}>
                  Reservation Confirmed!
                </h3>
                <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0 }}>
                  We are delighted to welcome you to Hotel Elite Inn, Muniguda.
                </p>
              </div>

              {/* Confirmation Voucher Box */}
              <div 
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Confirmation Number:</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.5px' }}>
                      {confirmedBooking.bookingId}
                    </div>
                  </div>
                  <span style={{ background: '#22C55E', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    GUARANTEED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
                  <div><b>Guest:</b> {confirmedBooking.guestName}</div>
                  <div><b>Phone:</b> +91 {confirmedBooking.guestPhone}</div>
                  <div><b>Room:</b> {confirmedBooking.tier} (Room {confirmedBooking.roomNumber})</div>
                  <div><b>Duration:</b> {confirmedBooking.nights} Night(s)</div>
                  <div><b>Check-In:</b> {confirmedBooking.checkInDate}</div>
                  <div><b>Check-Out:</b> {confirmedBooking.checkOutDate}</div>
                  <div><b>Meal Plan:</b> {confirmedBooking.mealPlan}</div>
                  <div><b>Total:</b> ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '12px', paddingTop: '10px', fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#D4AF37" />
                  Opposite Railway Station Main Road, Muniguda, Rayagada, Odisha
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                <button
                  onClick={handleWhatsAppShare}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    background: '#22C55E',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <Share2 size={16} /> WhatsApp Voucher
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={16} /> Print Slip
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div 
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.85)'
          }}
        >
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  color: '#94A3B8',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToDetails}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}
              >
                Next: Guest Info <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  color: '#94A3B8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="button"
                onClick={handleProceedToReview}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}
              >
                Review &amp; Pay <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  color: '#94A3B8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="button"
                onClick={handleFinalBooking}
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
                }}
              >
                <Check size={18} /> Confirm My Booking
              </button>
            </>
          )}

          {step === 4 && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Done / Close
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
