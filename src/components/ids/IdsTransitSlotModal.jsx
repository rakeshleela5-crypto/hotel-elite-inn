import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Train, Clock, ShieldAlert, CheckCircle, AlertTriangle, 
  Printer, DollarSign, Calendar, User, Phone, MapPin, X
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { createFastApiTransitSlot } from '../../utils/backendApi';

// Authentic Train List arriving at Muniguda Junction (Rayagada Line)
export const MUNIGUDA_JUNCTION_TRAINS = [
  { no: '18518', name: 'Visakhapatnam - Korba Express', scheduledArrival: '07:15 AM' },
  { no: '18447', name: 'Hirakhand Express (Bhubaneswar - Jagdalpur)', scheduledArrival: '06:30 AM' },
  { no: '12807', name: 'Samata Express (Visakhapatnam - Hazrat Nizamuddin)', scheduledArrival: '11:45 AM' },
  { no: '18573', name: 'Visakhapatnam - Bhagat Ki Kothi Express', scheduledArrival: '09:20 AM' },
  { no: '18005', name: 'Samaleshwari Express (Howrah - Jagdalpur)', scheduledArrival: '14:10 PM' },
  { no: '08528', name: 'Visakhapatnam - Raipur Passenger Special', scheduledArrival: '16:45 PM' }
];

export const AVAILABLE_TRANSIT_ROOMS = [
  { roomNo: '108', type: 'STD', cleanStatus: 'Inspected Clean', floor: '1st Floor' },
  { roomNo: '110', type: 'STD', cleanStatus: 'Inspected Clean', floor: '1st Floor' },
  { roomNo: '208', type: 'DLX', cleanStatus: 'Inspected Clean', floor: '2nd Floor' },
  { roomNo: '210', type: 'DLX', cleanStatus: 'Inspected Clean', floor: '2nd Floor' }
];

export default function IdsTransitSlotModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  onTransitCheckInCompleted
}) {
  // Current time state (defaults to morning 08:30 AM for realistic testing)
  const [checkInHour, setCheckInHour] = useState(8); // 8 AM
  const [checkInMinute, setCheckInMinute] = useState(30);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Passenger Details
  const [selectedRoom, setSelectedRoom] = useState('108');
  const [guestName, setGuestName] = useState('K. S. Narayana');
  const [mobile, setMobile] = useState('9849012845');
  const [age, setAge] = useState('34');
  const [arrivedTrain, setArrivedTrain] = useState('18518 (Visakhapatnam - Korba Express)');
  const [pnrNumber, setPnrNumber] = useState('6421980123');
  const [rateBracket, setRateBracket] = useState(500); // ₹500 or ₹600
  const [destination, setDestination] = useState('Vedanta Alumina, Lanjigarh');
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);

  // Strict Daytime Validation Logic (06:00 AM to 18:00 PM)
  // 6:00 AM = 6.00 hrs, 6:00 PM = 18.00 hrs
  const isDaytimeValid = useMemo(() => {
    const timeDecimal = checkInHour + (checkInMinute / 60);
    return timeDecimal >= 6.0 && timeDecimal <= 18.0;
  }, [checkInHour, checkInMinute]);

  // Formatted Time Strings
  const checkInTimeString = useMemo(() => {
    const h = checkInHour.toString().padStart(2, '0');
    const m = checkInMinute.toString().padStart(2, '0');
    const ampm = checkInHour >= 12 ? 'PM' : 'AM';
    const displayH = checkInHour % 12 === 0 ? 12 : checkInHour % 12;
    return `${displayH}:${m} ${ampm} (${h}:${m} hrs)`;
  }, [checkInHour, checkInMinute]);

  // Exact 3-Hour Check-Out Calculation
  const checkOutTimeString = useMemo(() => {
    const outH = (checkInHour + 3) % 24;
    const m = checkInMinute.toString().padStart(2, '0');
    const ampm = outH >= 12 ? 'PM' : 'AM';
    const displayH = outH % 12 === 0 ? 12 : outH % 12;
    return `${displayH}:${m} ${ampm} (${outH.toString().padStart(2, '0')}:${m} hrs)`;
  }, [checkInHour, checkInMinute]);

  if (!isOpen) return null;

  const handleConfirmTransitCheckIn = (e) => {
    e.preventDefault();
    if (!isDaytimeValid) {
      alert("❌ Front Desk Rule Violation (Error 7120):\n3-Hour Transit Slot is strictly restricted to daytime arrivals (06:00 AM to 06:00 PM).\nNight check-in cannot be booked under ₹500-₹600 transit rate!");
      return;
    }

    playSuccessChime();
    const transitRecord = {
      roomNo: selectedRoom,
      guestName,
      mobile,
      age,
      rate: rateBracket,
      checkInTime: `${accountingDate} ${checkInTimeString}`,
      checkOutTime: `${accountingDate} ${checkOutTimeString}`,
      durationHours: 3,
      train: arrivedTrain,
      pnr: pnrNumber,
      destination,
      status: 'Active Transit'
    };

    // Auto-persist to Railway PostgreSQL database
    createFastApiTransitSlot({
      room_number: selectedRoom,
      guest_name: guestName,
      mobile: mobile,
      age: parseInt(age, 10) || 30,
      train_number: arrivedTrain,
      pnr_number: pnrNumber,
      destination: destination,
      rate_bracket: parseFloat(rateBracket),
      check_in_time: `${accountingDate} ${checkInTimeString}`,
      expected_check_out: `${accountingDate} ${checkOutTimeString}`,
      status: 'Occupied'
    }).catch(err => console.warn('[TransitSlot] Cloud sync failed:', err));

    if (onTransitCheckInCompleted) {
      onTransitCheckInCompleted(transitRecord);
    }

    setIsPrintSlipOpen(true);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Authentic IDS FortuneNEXT Win32 Dialog Window */}
      <div 
        className={`ids-dialog-window ${isMaximized ? 'maximized' : ''}`}
        style={{ 
          width: isMaximized ? '1120px' : '1040px', 
          maxWidth: isMaximized ? '96vw' : '94vw', 
          height: isMaximized ? '680px' : '620px',
          maxHeight: isMaximized ? '92vh' : '88vh',
          background: '#ECE9D8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Win32 Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ids-logo-badge" style={{ background: '#E65100' }}>TRANSIT</span>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>
              IDS FortuneNEXT - Muniguda Junction 3-Hour Transit Slot (Audio 4: 68:46-81:10)
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className="ids-win-btn" title="Minimize to Normal Window" onClick={() => setIsMaximized(false)} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize (Compact Window)"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="ids-win-btn close" onClick={onClose} title="Close (Esc)" style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* Operational Context Header Banner */}
        <div style={{ 
          background: '#FFF3E0', 
          borderBottom: '1px solid #FFE0B2', 
          padding: '6px 12px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Train size={18} color="#E65100" />
            <div>
              <strong style={{ color: '#E65100' }}>MUNIGUDA RAILWAY JUNCTION TRANSIT FRESH-UP (3 HOURS):</strong>
              <div style={{ color: '#666', fontSize: '10px' }}>
                For passengers from Vizag-Raipur train routes. Tariff: ₹500 - ₹600. <strong>Strictly restricted to 6:00 AM - 6:00 PM daytime.</strong>
              </div>
            </div>
          </div>
          <div style={{ background: '#FFF', border: '1px solid #FFB74D', padding: '2px 8px', borderRadius: '2px', fontWeight: 700, fontSize: '11px' }}>
            Tariff Code: TRN-3HR (₹{rateBracket})
          </div>
        </div>

        {/* Validation Warning Strip */}
        <div style={{ 
          padding: '6px 12px', 
          background: isDaytimeValid ? '#E8F5E9' : '#FFCDD2', 
          borderBottom: '1px solid #999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isDaytimeValid ? (
              <CheckCircle size={16} color="#2E7D32" />
            ) : (
              <AlertTriangle size={16} color="#C62828" />
            )}
            <span style={{ fontWeight: 700, color: isDaytimeValid ? '#2E7D32' : '#C62828' }}>
              {isDaytimeValid 
                ? '✓ DAYTIME POLICY COMPLIANT: Check-in falls within allowed 06:00 AM – 18:00 PM railway transit window.'
                : '⛔ VIOLATION (Error 7120): Transit slot prohibited between 18:00 PM and 06:00 AM. Apply standard 24-hr tariff!'}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#333' }}>
            Check-In: <strong>{checkInTimeString}</strong> ➔ Expiry: <strong>{checkOutTimeString}</strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmTransitCheckIn} style={{ padding: '12px 14px', fontSize: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            {/* Left: Timing & Slot Controls */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', marginBottom: '8px' }}>
                1. Arrival Time & 3-Hour Slot Window (6 AM - 6 PM Rule):
              </div>

              {/* Time Control */}
              <div style={{ marginBottom: '10px', background: '#F5F5F5', padding: '8px', border: '1px solid #DDD' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>
                  Select Check-In Arrival Time (Hour: 00-23):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="range" 
                    min={0} 
                    max={23} 
                    value={checkInHour} 
                    onChange={e => setCheckInHour(Number(e.target.value))}
                    style={{ flex: 1, accentColor: isDaytimeValid ? '#2E7D32' : '#C62828' }}
                  />
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 800, 
                    fontSize: '13px',
                    padding: '2px 8px',
                    background: isDaytimeValid ? '#C8E6C9' : '#FFCDD2',
                    color: isDaytimeValid ? '#1B5E20' : '#B71C1C'
                  }}>
                    {checkInHour.toString().padStart(2, '0')}:{checkInMinute.toString().padStart(2, '0')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#777', marginTop: '2px' }}>
                  <span>00:00 (Night)</span>
                  <span style={{ color: '#2E7D32', fontWeight: 700 }}>06:00 AM (Allowed)</span>
                  <span style={{ color: '#2E7D32', fontWeight: 700 }}>12:00 PM</span>
                  <span style={{ color: '#2E7D32', fontWeight: 700 }}>18:00 PM (Cutoff)</span>
                  <span>23:59 (Night)</span>
                </div>
              </div>

              {/* Quick Time Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button 
                  type="button" 
                  className="ids-btn-classic" 
                  style={{ flex: 1, fontSize: '10px' }}
                  onClick={() => { setCheckInHour(7); setCheckInMinute(15); }}
                >
                  07:15 AM (Morning Train)
                </button>
                <button 
                  type="button" 
                  className="ids-btn-classic" 
                  style={{ flex: 1, fontSize: '10px' }}
                  onClick={() => { setCheckInHour(11); setCheckInMinute(45); }}
                >
                  11:45 AM (Samata Exp)
                </button>
                <button 
                  type="button" 
                  className="ids-btn-classic" 
                  style={{ flex: 1, fontSize: '10px', color: '#B71C1C' }}
                  onClick={() => { setCheckInHour(20); setCheckInMinute(30); }}
                >
                  08:30 PM (Night Test - Blocked)
                </button>
              </div>

              {/* Rate & Room Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '2px' }}>Transit Rate Tier:</label>
                  <select 
                    className="ids-input" 
                    style={{ width: '100%', fontWeight: 700 }}
                    value={rateBracket}
                    onChange={e => setRateBracket(Number(e.target.value))}
                  >
                    <option value={500}>₹500 (Standard Fresh-Up - 3 Hrs)</option>
                    <option value={600}>₹600 (Deluxe AC Fresh-Up - 3 Hrs)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '2px' }}>Assigned Clean Room:</label>
                  <select 
                    className="ids-input" 
                    style={{ width: '100%', fontWeight: 700 }}
                    value={selectedRoom}
                    onChange={e => setSelectedRoom(e.target.value)}
                  >
                    {AVAILABLE_TRANSIT_ROOMS.map(r => (
                      <option key={r.roomNo} value={r.roomNo}>
                        Room {r.roomNo} ({r.type} - {r.cleanStatus})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Passenger & Railway Details */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', marginBottom: '8px' }}>
                2. Railway Passenger & KYC Verification:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>Passenger Name:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%', fontWeight: 600 }}
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>Mobile No:</label>
                  <input 
                    type="tel" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>Arrived by Train (Vizag - Raipur route):</label>
                <select 
                  className="ids-input" 
                  style={{ width: '100%' }}
                  value={arrivedTrain}
                  onChange={e => setArrivedTrain(e.target.value)}
                >
                  {MUNIGUDA_JUNCTION_TRAINS.map(t => (
                    <option key={t.no} value={`${t.no} (${t.name})`}>
                      {t.no} - {t.name} (Arr: {t.scheduledArrival})
                    </option>
                  ))}
                  <option value="Road Vehicle / Taxi">Road Vehicle / Taxi</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>PNR / Ticket Ref:</label>
                  <input 
                    type="text" 
                    className="ids-input" 
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    value={pnrNumber}
                    onChange={e => setPnrNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>Next Destination:</label>
                  <input 
                    type="text" 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: '#F5F5F5', padding: '6px 8px', border: '1px solid #DDD', fontSize: '10px', color: '#555' }}>
                <strong>Statutory Check:</strong> 3-Hour stay covers hot water, clean towel, and room amenity fresh-up. Housekeeping auto-alert triggered 20 mins prior to checkout.
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #999', paddingTop: '8px' }}>
            <div style={{ fontSize: '10.5px' }}>
              <strong>Stay Duration:</strong> Exactly 3 Hours • <strong>Tariff Payable:</strong> ₹{rateBracket}.00
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="submit"
                disabled={!isDaytimeValid}
                className="ids-btn-classic" 
                style={{ 
                  minWidth: '170px', 
                  fontWeight: 700, 
                  background: isDaytimeValid ? '#E65100' : '#CCC', 
                  color: isDaytimeValid ? '#FFF' : '#666',
                  cursor: isDaytimeValid ? 'pointer' : 'not-allowed'
                }}
              >
                {isDaytimeValid ? '✓ Confirm 3-Hr Transit' : '⛔ Blocked (Outside 6AM-6PM)'}
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SUB-MODAL: PRINTABLE TRANSIT BOARDING PASS SLIP */}
      {isPrintSlipOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '480px', background: '#FFF', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Muniguda Jn Railway Transit Fresh-Up Pass</span>
              <button className="ids-win-btn close" onClick={() => { setIsPrintSlipOpen(false); onClose(); }}>✕</button>
            </div>

            <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5, color: '#000' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>HOTEL ELITE INN</div>
                <div>Station Road, Muniguda Junction</div>
                <div><strong>3-HOUR RAILWAY TRANSIT FRESH-UP PASS</strong></div>
              </div>

              <div><strong>Date:</strong> {accountingDate}</div>
              <div><strong>Assigned Room:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedRoom}</span></div>
              <div><strong>Passenger:</strong> {guestName} ({mobile})</div>
              <div><strong>Train Arrived:</strong> {arrivedTrain}</div>
              <div><strong>PNR Ref:</strong> {pnrNumber}</div>
              <div style={{ margin: '8px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
                <div><strong>Check-In Time:</strong> {checkInTimeString}</div>
                <div><strong>Strict Check-Out:</strong> <span style={{ color: '#C62828', fontWeight: 'bold' }}>{checkOutTimeString}</span></div>
                <div><strong>Stay Duration:</strong> 3 HOURS FIXED</div>
                <div><strong>Rate Paid:</strong> ₹{rateBracket}.00 (All Inclusive)</div>
              </div>
              <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '10px' }}>
                * Muniguda Police Thana Manifest updated.<br />
                Thank you for choosing Hotel Elite Inn!
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: '#ECE9D8', borderTop: '1px solid #999', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="ids-btn-classic" onClick={() => window.print()} style={{ fontWeight: 700, background: '#316AC5', color: '#FFF' }}>
                Print Slip
              </button>
              <button className="ids-btn-classic" onClick={() => { setIsPrintSlipOpen(false); onClose(); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
