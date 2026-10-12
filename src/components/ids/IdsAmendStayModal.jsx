import React, { useState, useEffect } from 'react';
import { amendFastApiStay } from '../../utils/backendApi';
import { 
  getRoomStayTimer, 
  recordAuditedStayExtension, 
  getStayExtensionAuditLogs 
} from '../../utils/stayFraudTracker';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

/* =========================================================================
   IDS FORTUNE NEXT V6.5.002.1 - AUDITED STAY EXTENSION & RFID KEYCARD RE-ENCODER
   Replication of:
   1. Win32 Amend Stay Dialog (Video 12 Frames 018–020 & 035)
   2. Live 2-Hour Stay Expiry Countdown & 30-Minute Keycard Cutoff Detector
   3. Extension Types: Hourly Day-Use (+1h, +2h, +4h) & Full Days (+1d, +2d, +3d, +5d)
   4. Anti-Fraud Mandatory Payment Proof Verification (Voucher #, UPI UTR, Card Slip)
   5. RFID Keycard Re-Authorization and Immutable Manager Audit Ledger
   ========================================================================= */

export default function IdsAmendStayModal({
  isOpen,
  onClose,
  initialRoomNo = '102',
  inhouseGuests = [],
  onOpenRoomHelpLookup,
  onSaveAmendStay
}) {
  const [selectedRoomNo, setSelectedRoomNo] = useState(initialRoomNo);
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  // Extension Config
  const [extensionMode, setExtensionMode] = useState('hours'); // 'hours' | 'days'
  const [extensionUnits, setExtensionUnits] = useState(2);     // 2 hours or 1 day
  const [customDays, setCustomDays] = useState(1);
  const [departureDate, setDepartureDate] = useState('11-OCT-2026');
  const [departureTime, setDepartureTime] = useState('14:00');
  
  // Mandatory Anti-Fraud Payment Proof Fields
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paymentProofRef, setPaymentProofRef] = useState('');
  const [tariffAmount, setTariffAmount] = useState(500);
  const [cashierName, setCashierName] = useState('Duty Manager');
  const [cashierPin, setCashierPin] = useState('1234');
  const [remarks, setRemarks] = useState('Official guest request for stay extension');

  // UI States
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [roomTimer, setRoomTimer] = useState(() => getRoomStayTimer(initialRoomNo || '102'));

  useEffect(() => {
    if (initialRoomNo) {
      setSelectedRoomNo(initialRoomNo);
    }
  }, [initialRoomNo, isOpen]);

  // Sync active guest and room stay timer
  useEffect(() => {
    const found = inhouseGuests.find(g => g.roomNo === selectedRoomNo) || inhouseGuests[0];
    if (found) {
      setSelectedGuest(found);
      if (found.departure) {
        const parts = found.departure.split(' ');
        setDepartureDate(parts[0] || '11-OCT-2026');
        setDepartureTime(parts[1] || '12:00');
      }
    }
    const timer = getRoomStayTimer(selectedRoomNo);
    setRoomTimer(timer);

    // Default tariff calculation based on room category
    const baseRate = timer.tariffRate || 1750;
    if (extensionMode === 'hours') {
      // Hourly day-use: 2 hours = ₹500, 4 hours = ₹800
      setTariffAmount(extensionUnits <= 2 ? 500 : extensionUnits <= 4 ? 800 : 1200);
    } else {
      // Full day: standard room rate
      setTariffAmount(baseRate * (Number(extensionUnits) || 1));
    }
  }, [selectedRoomNo, inhouseGuests, extensionMode, extensionUnits, isOpen]);

  // Live countdown ticker inside modal
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setRoomTimer(getRoomStayTimer(selectedRoomNo));
    } , 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedRoomNo]);

  if (!isOpen) return null;

  const handleRoomChange = (e) => {
    const val = e.target.value;
    setSelectedRoomNo(val);
    const found = inhouseGuests.find(g => g.roomNo === val);
    if (found) setSelectedGuest(found);
    setRoomTimer(getRoomStayTimer(val));
    setErrorMessage('');
  };

  const handleSelectHourlyPreset = (hrs, amt) => {
    playReceptionChime();
    setExtensionMode('hours');
    setExtensionUnits(hrs);
    setTariffAmount(amt);
    setErrorMessage('');
  };

  const handleSelectDaysPreset = (days) => {
    playReceptionChime();
    setExtensionMode('days');
    setExtensionUnits(days);
    const base = roomTimer.tariffRate || 1750;
    setTariffAmount(base * days);
    setErrorMessage('');
  };

  const handleSaveAndReEncode = () => {
    // 1. Mandatory Payment Proof Validation (Strict Anti-Fraud Enforcement)
    if (!paymentProofRef || paymentProofRef.trim().length < 3) {
      setErrorMessage('SECURITY BLOCK: You MUST enter verified Payment Proof (Voucher No / UPI UTR / Card Slip) to extend stay and re-encode RFID keycard!');
      playReceptionChime();
      return;
    }

    try {
      // 2. Commit Audited Stay Extension
      const result = recordAuditedStayExtension({
        roomNo: selectedRoomNo,
        guestName: selectedGuest?.guestName || selectedGuest?.lastName || `Guest Room ${selectedRoomNo}`,
        extensionType: extensionMode,
        extensionUnits,
        tariffAmount,
        paymentMode,
        paymentProofRef,
        cashierName,
        cashierPin,
        remarks
      });

      // 3. FastAPI backend synchronization (Option A)
      amendFastApiStay({
        room_number: selectedRoomNo,
        new_departure_date: departureDate,
        new_departure_time: departureTime,
        additional_nights: extensionMode === 'days' ? extensionUnits : 0,
        reason: `[Audited Extension] ${result.durationDescription} | Paid: ₹${tariffAmount} (${paymentMode}) | Proof: ${paymentProofRef}`,
        amended_by: cashierName
      }).catch(err => console.warn('[FastAPI] Amend stay error:', err));

      // 4. Update Desktop Shell in-house list & statistics
      if (onSaveAmendStay && selectedGuest) {
        onSaveAmendStay({
          roomNo: selectedRoomNo,
          departure: `${departureDate} ${departureTime}`,
          roomNights: (selectedGuest.roomNights || 1) + (extensionMode === 'days' ? extensionUnits : 0),
          guestBalance: (selectedGuest.balance || 0) + Number(tariffAmount)
        });
      }

      playSuccessChime();
      setSaveSuccessMessage({
        voucherNo: result.voucherNo,
        duration: result.durationDescription,
        newTime: new Date(result.newCheckoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        newDate: new Date(result.newCheckoutTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
        tariff: tariffAmount,
        ref: paymentProofRef.trim()
      });

      setTimeout(() => {
        setSaveSuccessMessage(null);
        onClose();
      }, 2500);

    } catch (err) {
      setErrorMessage(err.message || 'Failed to process stay extension');
    }
  };

  const handleOpenAuditHistory = () => {
    playReceptionChime();
    setAuditLogsList(getStayExtensionAuditLogs());
    setShowAuditLogs(true);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '880px', minHeight: '560px', maxWidth: '96vw', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', background: '#ECE9D8' }}
      >
        {/* Title Bar matching authentic Fortune NEXT Frame 018 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
            Amend Stay V6.5.002.1 — Audited Stay Extension & Keycard Re-Encoder
          </span>
          <button className="ids-win-btn close" onClick={onClose} title="Exit (Esc)">✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px', color: '#000' }}>
          
          {/* Anti-Fraud Security Header Banner */}
          <div style={{
            background: roomTimer.isKeycardCutoff ? '#FFEBEB' : roomTimer.isExpiringSoon ? '#FFF9E6' : '#F0F4E8',
            border: `1px solid ${roomTimer.isKeycardCutoff ? '#D32F2F' : roomTimer.isExpiringSoon ? '#F57C00' : '#388E3C'}`,
            padding: '6px 8px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>
                {roomTimer.isKeycardCutoff ? '🔒' : roomTimer.isExpiringSoon ? '⏳' : '🛡️'}
              </span>
              <div>
                <strong style={{ color: roomTimer.isKeycardCutoff ? '#C62828' : roomTimer.isExpiringSoon ? '#B78103' : '#1B5E20' }}>
                  {roomTimer.isKeycardCutoff 
                    ? `KEYCARD CUTOFF ACTIVE (Less than 30m remaining) — Room ${selectedRoomNo} RFID Key Locked!` 
                    : roomTimer.isExpiringSoon 
                      ? `STAY EXPIRING WITHIN 2 HOURS — Room ${selectedRoomNo} Stay Countdown Active` 
                      : `ANTI-FRAUD AUDIT PROTOCOL — All Extensions Require Mandatory Payment Proof`}
                </strong>
                <div style={{ fontSize: '10px', color: '#444', marginTop: '1px' }}>
                  Policy: Guests cannot extend stay or re-activate keycards off-the-books. Staff must log verified payment.
                </div>
              </div>
            </div>

            {/* Live Countdown Badge */}
            <div style={{
              background: roomTimer.isKeycardCutoff ? '#D32F2F' : roomTimer.isExpiringSoon ? '#E65100' : '#2E7D32',
              color: '#FFF',
              padding: '3px 8px',
              fontWeight: 800,
              borderRadius: '2px',
              fontFamily: 'Courier New, monospace',
              fontSize: '13px',
              letterSpacing: '0.5px'
            }}>
              {roomTimer.formattedCountdown}
            </div>
          </div>

          {/* Success Message Banner */}
          {saveSuccessMessage && (
            <div style={{ background: '#E6FFE6', border: '2px solid #2E7D32', padding: '8px 10px', marginBottom: '8px', color: '#1B5E20' }}>
              <div style={{ fontWeight: 800, fontSize: '12px' }}>
                ✓ STAY EXTENSION & KEYCARD RE-ENCODED SUCCESSFULLY!
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                • Extension: <strong>{saveSuccessMessage.duration}</strong> | Fee: <strong>₹{saveSuccessMessage.tariff}</strong><br />
                • New Checkout: <strong>{saveSuccessMessage.newDate} at {saveSuccessMessage.newTime}</strong><br />
                • Audit Voucher: <strong>{saveSuccessMessage.voucherNo}</strong> | Payment Ref: <strong>{saveSuccessMessage.ref}</strong>
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div style={{ background: '#FFEBEE', border: '1px solid #D32F2F', padding: '6px 8px', marginBottom: '8px', color: '#C62828', fontWeight: 700 }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Room Selection & Lookup Strip matching Frame 018 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', background: '#DFDBC9', padding: '5px 8px', border: '1px solid #B0AB9A' }}>
            <span style={{ fontWeight: 700 }}>Room No:</span>
            <input 
              className="ids-input" 
              value={selectedRoomNo} 
              onChange={handleRoomChange}
              style={{ width: '60px', fontWeight: 700, background: '#FFF', textAlign: 'center' }} 
            />
            <button 
              className="ids-btn-classic" 
              style={{ padding: '0 6px', fontWeight: 700 }}
              onClick={onOpenRoomHelpLookup}
              title="Search in-house room (Frame 015)"
            >
              ?
            </button>

            <span style={{ marginLeft: '10px', fontWeight: 600 }}>Guest:</span>
            <span style={{ fontWeight: 700, color: '#0A246A' }}>
              {selectedGuest ? (selectedGuest.guestName || `${selectedGuest.title} ${selectedGuest.lastName}`) : 'N/A'}
            </span>

            <span style={{ marginLeft: '10px', color: '#666' }}>Category:</span>
            <span style={{ fontWeight: 700 }}>{roomTimer.roomCategory} ({roomTimer.tariffRate} INR/day)</span>

            <div style={{ marginLeft: 'auto' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontSize: '10px', padding: '1px 8px', background: '#FFF', fontWeight: 700 }}
                onClick={handleOpenAuditHistory}
              >
                📋 Extension Logs ({getStayExtensionAuditLogs().length})
              </button>
            </div>
          </div>

          {/* Guest In-House Stay Detail Strip */}
          <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '6px 8px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 140px', gap: '8px', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#777', fontSize: '10px', display: 'block' }}>Folio No:</span>
                <strong>{selectedGuest?.folioNo || '102 / 1'}</strong>
              </div>
              <div>
                <span style={{ color: '#777', fontSize: '10px', display: 'block' }}>Company / Source:</span>
                <strong>{selectedGuest?.companyName || 'Direct Walk-In (FIT)'}</strong>
              </div>
              <div>
                <span style={{ color: '#777', fontSize: '10px', display: 'block' }}>Check-In:</span>
                <span>{selectedGuest?.arrival || '10-OCT 14:00'}</span>
              </div>
              <div>
                <span style={{ color: '#777', fontSize: '10px', display: 'block' }}>Scheduled Checkout:</span>
                <span style={{ color: '#C00', fontWeight: 700 }}>
                  {roomTimer.expectedCheckoutTime ? new Date(roomTimer.expectedCheckoutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '11-OCT 12:00'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Extension Duration Mode Selection */}
          <div style={{ border: '1px solid #716F64', background: '#F8F7F0', padding: '8px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⏱️ STEP 1: SELECT EXTENSION DURATION</span>
              <span style={{ fontSize: '10px', color: '#666', fontWeight: 400 }}>(Select Extra Hours for day-use or Full Days)</span>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 700 }}>
                <input 
                  type="radio" 
                  name="extMode" 
                  checked={extensionMode === 'hours'} 
                  onChange={() => { setExtensionMode('hours'); setExtensionUnits(2); setTariffAmount(500); }} 
                />
                Extra Hours (Late Checkout / Day-Use)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 700, marginLeft: '12px' }}>
                <input 
                  type="radio" 
                  name="extMode" 
                  checked={extensionMode === 'days'} 
                  onChange={() => { setExtensionMode('days'); setExtensionUnits(1); setTariffAmount(roomTimer.tariffRate || 1750); }} 
                />
                Full Days Extension (+1, +2, +3 Days)
              </label>
            </div>

            {/* Hourly Extension Presets */}
            {extensionMode === 'hours' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: '#FFF', padding: '6px', border: '1px inset #DDD' }}>
                <span style={{ fontWeight: 600 }}>Quick Hours:</span>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 1 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 1 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectHourlyPreset(1, 300)}
                >
                  +1 Hour (₹300)
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 2 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 2 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectHourlyPreset(2, 500)}
                >
                  +2 Hours (₹500)
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 4 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 4 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectHourlyPreset(4, 800)}
                >
                  +4 Hours (₹800)
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 6 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 6 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectHourlyPreset(6, 1200)}
                >
                  +6 Hours (₹1,200)
                </button>
              </div>
            )}

            {/* Daily Extension Presets */}
            {extensionMode === 'days' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: '#FFF', padding: '6px', border: '1px inset #DDD' }}>
                <span style={{ fontWeight: 600 }}>Quick Days:</span>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 1 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 1 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectDaysPreset(1)}
                >
                  +1 Day (₹{roomTimer.tariffRate || 1750})
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 2 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 2 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectDaysPreset(2)}
                >
                  +2 Days (₹{(roomTimer.tariffRate || 1750) * 2})
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 3 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 3 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectDaysPreset(3)}
                >
                  +3 Days (₹{(roomTimer.tariffRate || 1750) * 3})
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: extensionUnits === 5 ? '#316AC5' : '#ECE9D8', color: extensionUnits === 5 ? '#FFF' : '#000', fontWeight: 700 }}
                  onClick={() => handleSelectDaysPreset(5)}
                >
                  +5 Days (₹{(roomTimer.tariffRate || 1750) * 5})
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Anti-Fraud Mandatory Payment Proof Verification */}
          <div style={{ border: '2px solid #0A246A', background: '#F0F4FC', padding: '8px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💳 STEP 2: MANDATORY PAYMENT PROOF (ANTI-THEFT LOCK)</span>
              <span style={{ background: '#C00', color: '#FFF', padding: '1px 6px', fontSize: '9px', fontWeight: 800 }}>REQUIRED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '90px 140px 100px 1fr', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Payment Mode:</span>
              <select 
                className="ids-select" 
                value={paymentMode} 
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{ fontWeight: 700 }}
              >
                <option value="CASH">CASH (Physical Drawer)</option>
                <option value="UPI">UPI (GooglePay / PhonePe)</option>
                <option value="CARD">CARD (POS Machine)</option>
                <option value="BTC">BTC (Company Direct Bill)</option>
              </select>

              <span style={{ fontWeight: 600, textAlign: 'right' }}>Amount to Collect:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  className="ids-input" 
                  type="number"
                  value={tariffAmount} 
                  onChange={(e) => setTariffAmount(e.target.value)}
                  style={{ width: '80px', fontWeight: 700, color: '#0A246A', textAlign: 'right' }} 
                />
                <span style={{ fontWeight: 700 }}>INR</span>
              </div>
            </div>

            {/* Payment Proof Reference Field - Hard Block if Empty */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, color: '#900' }}>Proof Ref No.*:</span>
              <input 
                className="ids-input" 
                placeholder={paymentMode === 'CASH' ? 'Cash Voucher # (e.g. CV-402, RCT-1092)' : paymentMode === 'UPI' ? 'UPI UTR / Reference No. (e.g. 428901847120)' : 'Card Approval Code / Slip No.'}
                value={paymentProofRef}
                onChange={(e) => { setPaymentProofRef(e.target.value); setErrorMessage(''); }}
                style={{
                  fontWeight: 700,
                  background: paymentProofRef ? '#FFF' : '#FFF9D7',
                  border: paymentProofRef ? '1px solid #7F9DB9' : '2px solid #D32F2F',
                  padding: '3px 6px'
                }}
              />
            </div>

            {/* Cashier and Duty Manager Stamp */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 140px 80px 1fr', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Cashier / Duty:</span>
              <input 
                className="ids-input" 
                value={cashierName} 
                onChange={(e) => setCashierName(e.target.value)}
                style={{ fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 600, textAlign: 'right' }}>Remarks:</span>
              <input 
                className="ids-input" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Guest requested extra time before train"
              />
            </div>
          </div>

          {/* Step 3: RFID Keycard Re-Encoder Status Strip */}
          <div style={{ background: '#ECE9D8', border: '1px solid #716F64', padding: '6px 8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔑</span>
              <div>
                <strong style={{ fontSize: '11px' }}>RFID Digital Keycard Encoder:</strong>
                <span style={{ marginLeft: '6px', color: paymentProofRef ? '#1B5E20' : '#C00', fontWeight: 700 }}>
                  {paymentProofRef ? 'READY TO RE-ENCODE VALIDITY' : 'LOCKED (Awaiting Payment Proof)'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: '#555' }}>
              Encoder: <strong>COM3 / USB RFID DESK ENCODER</strong>
            </div>
          </div>

          {/* Bottom Command Buttons matching Frame 018 & Frame 035 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>
              * Extension record is permanently logged for Director & Owner Audit.
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ 
                  minWidth: '120px', 
                  fontWeight: 800,
                  background: paymentProofRef ? '#2E7D32' : '#C0C0C0',
                  color: paymentProofRef ? '#FFF' : '#666',
                  cursor: paymentProofRef ? 'pointer' : 'not-allowed'
                }}
                onClick={handleSaveAndReEncode}
                title={paymentProofRef ? "Save Extension and Re-encode RFID Keycard (F10)" : "Enter Payment Proof to Enable Save"}
              >
                💾 Save & Re-Encode Keycard
              </button>

              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={() => {
                  setPaymentProofRef('');
                  setRemarks('');
                  setErrorMessage('');
                }}
              >
                Clear
              </button>

              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={onClose}
              >
                Exit
              </button>
            </div>
          </div>

        </div>

        {/* Audit Log Modal View */}
        {showAuditLogs && (
          <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
            <div className="ids-dialog-window" style={{ width: '680px', maxWidth: '96vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
              <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Stay Extension Official Audit Ledger (Anti-Fraud Register)</span>
                <button className="ids-win-btn close" onClick={() => setShowAuditLogs(false)}>✕</button>
              </div>

              <div style={{ padding: '8px 10px', fontSize: '11px' }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Voucher #</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Room</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Guest</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Duration</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Amount</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Mode</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Payment Proof</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px' }}>Cashier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogsList.length > 0 ? (
                        auditLogsList.map((log, idx) => (
                          <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                            <td style={{ border: '1px solid #CCC', padding: '3px', fontWeight: 700 }}>{log.voucherNo}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px', textAlign: 'center', fontWeight: 700 }}>{log.roomNo}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px' }}>{log.guestName}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px' }}>{log.durationDescription}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>₹{log.tariffAmount}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px', textAlign: 'center' }}>{log.paymentMode}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px', fontWeight: 700, color: '#C00' }}>{log.paymentProofRef}</td>
                            <td style={{ border: '1px solid #CCC', padding: '3px' }}>{log.cashierName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                            No extension vouchers recorded yet. All stay extensions logged will appear here permanently.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button className="ids-btn-classic" onClick={() => setShowAuditLogs(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
