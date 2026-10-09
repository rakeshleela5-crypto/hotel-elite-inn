import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { RefreshCw, Check, X, Calendar, DollarSign, Clock, ShieldCheck, AlertCircle, Info, ChevronRight, Play } from 'lucide-react';

/* =========================================================================
   VIDEO 19: NIGHT AUDIT PROCESS IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. 1st Step: Post Room Rate (Frames 015–040)
      - Cashiering.. -> Posting V6.5.002.1 -> [ Room Rate ]
      - Post Room Rate V6.5.002.1 Dialog
      - Radio: Individual / All Rooms (default)
      - Accounting Date: 25-JAN-2022
      - Status animation: "Deleting old Trn/Tax records...", "Add 201", "Add 311", "Add 312", etc.
   2. 2nd Step: Create Guest Balance (Frames 045–055)
      - Day End process.. -> Create Guest Balance V6.5.002.1 Dialog
      - Accounting Date: 25-JAN-2022
      - Status: "Processing Tax Records(Inhouse) For Reg#566"
      - "Updating FOM Gst Number.. Invoice # : 503"
      - "Processing: GST GSTR1 Consolidation"
   3. 3rd Step: Create Night Balance (Frames 060–065)
      - Day End process.. -> Create Night Balance
      - PENDING KOT'S Dialog (BAR GN, RES BF, RES LN by User BIREN)
      - [ Continue ], [ Exit ]
   4. 4th Step: Open New Date (Frames 070–085)
      - Day End process.. -> Open New Date V6.5002.2 Dialog
      - Current A/c Date: 25-JAN-2022
      - New Date: 26-JAN-2022
      - Confirm New Date: 26-JAN-2022
      - Status animation: "Posting HPTTBL Information", "Executing: FOMPURG"
   5. System Date Verification via "Info.." Dialog (Frames 090–092)
      - Fortune NEXT 6.5 Logo & License Info
      - Accounting Date: 26-JAN-2022 16:02
      - Server Date: 26-JAN-2022 16:02
      - Login Date: 26-JAN-2022 15:46
      - Help Desk: +91 80 6772 0000 / techsupport@idsnext.com
   ========================================================================= */

export const PENDING_KOTS_DATA = [
  { restaurant: 'BAR', session: 'GN', billNo: '', user: 'BIREN' },
  { restaurant: 'RES', session: 'BF', billNo: '', user: 'BIREN' },
  { restaurant: 'RES', session: 'LN', billNo: '', user: 'BIREN' }
];

export const INHOUSE_AUDIT_ROOMS = [
  { roomNo: '201', guest: 'Kumar', regNo: '613', rate: '3,800.00' },
  { roomNo: '311', guest: 'DEURI', regNo: '566', rate: '3,200.00' },
  { roomNo: '312', guest: 'BASU', regNo: '587', rate: '3,500.00' },
  { roomNo: '315', guest: 'Khan', regNo: '583', rate: '4,000.00' },
  { roomNo: '316', guest: 'Anil Kumar Group', regNo: '619', rate: '6,500.00' },
  { roomNo: '405', guest: 'Anirudh', regNo: '591', rate: '3,500.00' },
  { roomNo: '501', guest: 'Anil Kumar Group', regNo: '615', rate: '4,500.00' },
  { roomNo: '515', guest: 'Anil Kumar Group', regNo: '617', rate: '4,500.00' }
];

export default function IdsNightAuditModal({
  isOpen,
  onClose,
  currentAccountingDate = '25-JAN-2022',
  onCompleteNightAudit,
  initialStep = 'full-wizard' // 'step1' | 'step2' | 'step3' | 'step4' | 'full-wizard' | 'info'
}) {
  // Wizard active step: 1 | 2 | 3 | 4 | 'completed' | 'info'
  const [activeStep, setActiveStep] = useState(1);

  // Dates
  const [acDate, setAcDate] = useState(currentAccountingDate);
  const [nextDate, setNextDate] = useState('26-JAN-2022');
  const [confirmNextDate, setConfirmNextDate] = useState('26-JAN-2022');

  // Step 1: Post Room Rate State
  const [postMode, setPostMode] = useState('all'); // 'individual' | 'all'
  const [step1Running, setStep1Running] = useState(false);
  const [step1Log, setStep1Log] = useState('');
  const [step1Done, setStep1Done] = useState(false);

  // Step 2: Create Guest Balance State
  const [step2Running, setStep2Running] = useState(false);
  const [step2Log, setStep2Log] = useState('');
  const [step2SubLog, setStep2SubLog] = useState('');
  const [step2Done, setStep2Done] = useState(false);

  // Step 3: Pending KOTs State
  const [kotsList, setKotsList] = useState(PENDING_KOTS_DATA);
  const [step3Done, setStep3Done] = useState(false);

  // Step 4: Open New Date State
  const [step4Running, setStep4Running] = useState(false);
  const [step4Activity, setStep4Activity] = useState('');
  const [step4Done, setStep4Done] = useState(false);

  // Info Dialog
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Set initial step if specified
  useEffect(() => {
    if (isOpen) {
      if (initialStep === 'step1') setActiveStep(1);
      else if (initialStep === 'step2') setActiveStep(2);
      else if (initialStep === 'step3') setActiveStep(3);
      else if (initialStep === 'step4') setActiveStep(4);
      else if (initialStep === 'info') setShowInfoModal(true);
      else setActiveStep(1);
    }
  }, [isOpen, initialStep]);

  // Synchronize next date based on acDate
  useEffect(() => {
    if (acDate.startsWith('25-JAN')) {
      setNextDate('26-JAN-2022');
      setConfirmNextDate('26-JAN-2022');
    } else {
      const parts = acDate.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const nextDay = String(day + 1).padStart(2, '0');
        const calculatedNext = `${nextDay}-${parts[1]}-${parts[2]}`;
        setNextDate(calculatedNext);
        setConfirmNextDate(calculatedNext);
      }
    }
  }, [acDate]);

  // Execute Step 1: Post Room Rate Animation
  const handleExecuteStep1 = () => {
    setStep1Running(true);
    setStep1Log('Deleting old Trn/Tax records for selected room........');

    const rooms = ['201', '311', '312', '315', '316', '405', '501', '515'];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < rooms.length) {
        setStep1Log(`Add ${rooms[idx]}`);
        idx++;
      } else {
        clearInterval(interval);
        setStep1Log('✓ Room rates and statutory taxes posted successfully for all in-house rooms!');
        setStep1Running(false);
        setStep1Done(true);
      }
    }, 350);
  };

  // Execute Step 2: Create Guest Balance Animation
  const handleExecuteStep2 = () => {
    setStep2Running(true);
    setStep2Log('Processing Tax Records(Inhouse) For Reg#566');
    setStep2SubLog('From Date: 25/01/22  To Date: 25/01/22');

    setTimeout(() => {
      setStep2Log('Updating FOM Gst Number.. Invoice # : 503');
    }, 700);

    setTimeout(() => {
      setStep2Log('Processing: GST GSTR1 Consolidation');
    }, 1400);

    setTimeout(() => {
      setStep2Log('✓ Guest ledger closing balances calculated & reconciled successfully.');
      setStep2SubLog('');
      setStep2Running(false);
      setStep2Done(true);
    }, 2100);
  };

  // Execute Step 3: Acknowledge Pending KOTs
  const handleExecuteStep3 = () => {
    setStep3Done(true);
    setActiveStep(4);
  };

  // Execute Step 4: Open New Date Animation
  const handleExecuteStep4 = () => {
    setStep4Running(true);
    setStep4Activity('Posting HPTTBL Information');

    setTimeout(() => {
      setStep4Activity('Executing: FOMPURG');
    }, 800);

    setTimeout(() => {
      setStep4Activity('Archiving Daily Audits & Updating General Ledger');
    }, 1600);

    setTimeout(() => {
      setStep4Activity('✓ Date Rollover Complete: New Business Date is ' + nextDate);
      setStep4Running(false);
      setStep4Done(true);

      if (onCompleteNightAudit) {
        onCompleteNightAudit({
          previousDate: acDate,
          newDate: nextDate,
          timestamp: new Date().toLocaleTimeString(),
          auditor: 'IT ADMIN',
          roomsAudited: INHOUSE_AUDIT_ROOMS.length
        });
      }
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Top Tutorial Walkthrough Banner */}
      <div 
        style={{
          width: '740px',
          maxWidth: '96vw',
          margin: '0 auto 6px auto',
          background: 'linear-gradient(180deg, #1A365D 0%, #0F2942 100%)',
          color: '#FFF',
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #4A90E2',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <span style={{ background: '#FF9800', color: '#000', padding: '1px 5px', borderRadius: '2px', fontSize: '10px' }}>
              VIDEO 19
            </span>
            <span>Night Audit Process in IDS 6.5 & 7.0 Software (Full 4-Step Rollover)</span>
          </div>
          <span style={{ fontSize: '10px', color: '#BEE3F8' }}>Current A/c Date: {step4Done ? nextDate : acDate}</span>
        </div>

        {/* Stepper Navigation */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '2px' }}>
          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              fontSize: '10px', 
              padding: '2px 8px', 
              background: activeStep === 1 ? '#C2E0C6' : '#ECE9D8', 
              fontWeight: activeStep === 1 ? 700 : 400 
            }}
            onClick={() => setActiveStep(1)}
          >
            {step1Done ? '✓ ' : '1. '}Post Room Rate
          </button>
          <span style={{ color: '#A0AEC0' }}>→</span>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              fontSize: '10px', 
              padding: '2px 8px', 
              background: activeStep === 2 ? '#C2E0C6' : '#ECE9D8', 
              fontWeight: activeStep === 2 ? 700 : 400 
            }}
            onClick={() => setActiveStep(2)}
          >
            {step2Done ? '✓ ' : '2. '}Create Guest Balance
          </button>
          <span style={{ color: '#A0AEC0' }}>→</span>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              fontSize: '10px', 
              padding: '2px 8px', 
              background: activeStep === 3 ? '#C2E0C6' : '#ECE9D8', 
              fontWeight: activeStep === 3 ? 700 : 400 
            }}
            onClick={() => setActiveStep(3)}
          >
            {step3Done ? '✓ ' : '3. '}Create Night Balance
          </button>
          <span style={{ color: '#A0AEC0' }}>→</span>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              fontSize: '10px', 
              padding: '2px 8px', 
              background: activeStep === 4 ? '#C2E0C6' : '#ECE9D8', 
              fontWeight: activeStep === 4 ? 700 : 400 
            }}
            onClick={() => setActiveStep(4)}
          >
            {step4Done ? '✓ ' : '4. '}Open New Date
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              fontSize: '10px', 
              padding: '2px 8px', 
              marginLeft: 'auto',
              background: '#316AC5',
              color: '#FFF',
              fontWeight: 700
            }}
            onClick={() => setShowInfoModal(true)}
          >
            ℹ Verify in Info.. (Frame 090)
          </button>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: POST ROOM RATE V6.5.002.1 (Frames 020–040)
          ========================================================================= */}
      {activeStep === 1 && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '640px', 
            maxWidth: '96vw', 
            background: '#ECE9D8', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar matching Video 19 Frame 025 */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>💰</span>
              <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                Post Room Rate V6.5.002.1 {step1Running ? '(Executing...)' : ''}
              </span>
            </div>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '12px 14px', fontSize: '11px', color: '#000' }}>
            {/* Step Explanation Banner */}
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', padding: '6px 10px', marginBottom: '12px', fontSize: '10.5px' }}>
              <span style={{ fontWeight: 700, color: '#D4380D' }}>1st Step: Post Room Rate</span> — Debits daily tariff, GST/luxury taxes, and meal package charges to all active in-house guest folios before end-of-day ledger closure.
            </div>

            {/* Selection Radios & Date */}
            <div style={{ border: '1px solid #7F9DB9', padding: '12px 16px', background: '#F8F7F3', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '40px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="postScope" 
                    checked={postMode === 'individual'} 
                    onChange={() => setPostMode('individual')} 
                  />
                  <span>Individual</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
                  <input 
                    type="radio" 
                    name="postScope" 
                    checked={postMode === 'all'} 
                    onChange={() => setPostMode('all')} 
                  />
                  <span>All Rooms</span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, width: '110px' }}>Accounting Date</span>
                <input 
                  className="ids-input" 
                  value={acDate} 
                  readOnly 
                  style={{ width: '130px', fontWeight: 700, background: '#EBEBE4' }} 
                />
              </div>
            </div>

            {/* Status Output Box matching Frame 030 & 035 */}
            <div 
              style={{ 
                minHeight: '70px', 
                border: '1px solid #999', 
                background: '#FFF', 
                padding: '8px 10px', 
                marginBottom: '12px',
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: step1Done ? '#2E7D32' : '#0A246A'
              }}
            >
              <div style={{ fontWeight: 600, color: '#555', marginBottom: '4px' }}>System Activity Log:</div>
              {step1Log ? (
                <div>{step1Log}</div>
              ) : (
                <div style={{ color: '#888' }}>Ready. Click [ Save ] to post room rate charges for all rooms.</div>
              )}
            </div>

            {/* Bottom Buttons matching Frame 025 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={handleExecuteStep1}
                disabled={step1Running}
                style={{ minWidth: '70px', fontWeight: 700, color: '#0A246A' }}
              >
                {step1Running ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button"
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={() => alert('Panel details: 8 in-house rooms queued for tariff posting.')}
              >
                Panel
              </button>
              {step1Done && (
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  style={{ minWidth: '85px', background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                  onClick={() => setActiveStep(2)}
                >
                  Next Step ➔
                </button>
              )}
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: CREATE GUEST BALANCE V6.5.002.1 (Frames 045–055)
          ========================================================================= */}
      {activeStep === 2 && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '620px', 
            maxWidth: '96vw', 
            background: '#ECE9D8', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar matching Video 19 Frame 045 */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>📊</span>
              <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                Create Guest Balance V6.5.002.1
              </span>
            </div>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '12px 14px', fontSize: '11px', color: '#000' }}>
            {/* Step Explanation Banner */}
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', padding: '6px 10px', marginBottom: '10px', fontSize: '10.5px' }}>
              <span style={{ fontWeight: 700, color: '#D4380D' }}>2nd Step: Create Guest Balance</span> — Consolidates guest ledgers, checks advance deposits against posted transactions, and derives closing balances.
            </div>

            {/* Instruction Box matching Frame 045 */}
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '10px 12px', 
                lineHeight: '1.45',
                color: '#333',
                marginBottom: '12px'
              }}
            >
              Ensure that all postings like tariff and other manual entries for rooms are carried out before executing this menu. This option derives individual closing balances for all inhouse and checkout rooms.
            </div>

            {/* Accounting Date Field matching Frame 045 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>Accounting Date</span>
              <input 
                className="ids-input" 
                value={acDate} 
                readOnly 
                style={{ width: '130px', fontWeight: 700, background: '#EBEBE4' }} 
              />
            </div>

            {/* Progress Output Box matching Frame 045 & 050 */}
            <div 
              style={{ 
                minHeight: '65px', 
                border: '1px solid #999', 
                background: '#F9F9F6', 
                padding: '8px 10px', 
                marginBottom: '12px',
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: step2Done ? '#2E7D32' : '#0A246A'
              }}
            >
              {step2Log ? (
                <div>
                  <div style={{ fontWeight: 600 }}>{step2Log}</div>
                  {step2SubLog && <div style={{ color: '#555', marginTop: '2px' }}>{step2SubLog}</div>}
                </div>
              ) : (
                <div style={{ color: '#888' }}>Ready. Click [ Continue ] to execute guest balance calculation.</div>
              )}
            </div>

            {/* Bottom Buttons matching Frame 045 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={handleExecuteStep2}
                disabled={step2Running}
                style={{ minWidth: '70px', fontWeight: 700, color: '#0A246A' }}
              >
                {step2Running ? 'Calculating...' : 'Continue'}
              </button>
              <button 
                type="button"
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={() => alert('Panel: Inhouse balance consolidation ledger active.')}
              >
                Panel
              </button>
              {step2Done && (
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  style={{ minWidth: '85px', background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                  onClick={() => setActiveStep(3)}
                >
                  Next Step ➔
                </button>
              )}
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: PENDING KOT'S (CREATE NIGHT BALANCE) (Frames 060–065)
          ========================================================================= */}
      {activeStep === 3 && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '560px', 
            maxWidth: '96vw', 
            background: '#ECE9D8', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar matching Video 19 Frame 060 */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#0A246A',
              color: '#FFF',
              padding: '2px 6px'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '11px' }}>PENDING KOT'S</span>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '10px 12px', fontSize: '11px', color: '#000' }}>
            {/* Step Explanation Banner */}
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', padding: '6px 10px', marginBottom: '8px', fontSize: '10.5px' }}>
              <span style={{ fontWeight: 700, color: '#D4380D' }}>3rd Step: Create Night Balance</span> — System checks for unbilled POS/restaurant kitchen order tickets (KOTs) to verify outlet revenues prior to closing.
            </div>

            {/* Pending KOTs Grid matching Frame 060 */}
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                maxHeight: '180px', 
                overflowY: 'auto',
                marginBottom: '12px'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #999', textAlign: 'left', fontWeight: 700 }}>
                    <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '110px' }}>Restaurant</th>
                    <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '80px' }}>Session</th>
                    <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '90px' }}>Bill #</th>
                    <th style={{ padding: '4px 8px' }}>User</th>
                  </tr>
                </thead>
                <tbody>
                  {kotsList.map((kot, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        background: idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                        borderBottom: '1px solid #EFEFEF'
                      }}
                    >
                      <td style={{ padding: '3px 8px', borderRight: '1px solid #E0E0E0', fontWeight: 600 }}>{kot.restaurant}</td>
                      <td style={{ padding: '3px 8px', borderRight: '1px solid #E0E0E0' }}>{kot.session}</td>
                      <td style={{ padding: '3px 8px', borderRight: '1px solid #E0E0E0', color: '#888' }}>{kot.billNo || '(Pending)'}</td>
                      <td style={{ padding: '3px 8px', fontWeight: 600 }}>{kot.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Buttons matching Frame 060 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={handleExecuteStep3}
                style={{ minWidth: '70px', fontWeight: 700, color: '#0A246A' }}
              >
                Continue
              </button>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: OPEN NEW DATE V6.5002.2 (Frames 070–085)
          ========================================================================= */}
      {activeStep === 4 && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '640px', 
            maxWidth: '96vw', 
            background: '#ECE9D8', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar matching Video 19 Frame 070 */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>📅</span>
              <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                Open New Date V6.5002.2
              </span>
            </div>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '12px 14px', fontSize: '11px', color: '#000' }}>
            {/* Step Explanation Banner */}
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', padding: '6px 10px', marginBottom: '10px', fontSize: '10.5px' }}>
              <span style={{ fontWeight: 700, color: '#D4380D' }}>4th Step: Open New Date</span> — Finalizes day closure, locks transactions for the previous date, purges work tables (FOMPURG), and increments PMS Accounting Date to 26-JAN-2022.
            </div>

            {/* Instruction Warning Box matching Frame 070 */}
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '10px 12px', 
                lineHeight: '1.45',
                color: '#333',
                marginBottom: '12px'
              }}
            >
              Confirm that all transactions are posted and checked. Guest ledger balance creation and Create Night audit should be executed. After this run, the system will restrict modifications/deletions for previous dates.
            </div>

            {/* Date Configuration Fields matching Frame 070 */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '130px 140px', 
                rowGap: '6px', 
                columnGap: '8px', 
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px 0 14px 0'
              }}
            >
              <label style={{ fontWeight: 600 }}>Current A/c Date</label>
              <input 
                className="ids-input" 
                value={acDate} 
                readOnly 
                style={{ width: '130px', fontWeight: 700, background: '#EBEBE4' }} 
              />

              <label style={{ fontWeight: 600 }}>New Date</label>
              <input 
                className="ids-input" 
                value={nextDate} 
                readOnly 
                style={{ width: '130px', fontWeight: 700, background: '#EBEBE4', color: '#0A246A' }} 
              />

              <label style={{ fontWeight: 600 }}>Confirm New Date</label>
              <input 
                className="ids-input" 
                value={confirmNextDate} 
                readOnly 
                style={{ width: '130px', fontWeight: 700, background: '#EBEBE4', color: '#0A246A' }} 
              />
            </div>

            {/* Activity Status Bar matching Frame 070 & 080 */}
            <div 
              style={{ 
                background: '#F5F4EE', 
                border: '1px solid #CCC', 
                padding: '6px 10px', 
                fontSize: '11px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontWeight: 600 }}>Activity:</span>
              <span style={{ color: step4Done ? '#2E7D32' : (step4Running ? '#D4380D' : '#555'), fontWeight: 700, fontFamily: 'monospace' }}>
                {step4Activity || 'Idle. Ready to advance business date.'}
              </span>
            </div>

            {/* Bottom Buttons matching Frame 070 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={handleExecuteStep4}
                disabled={step4Running || step4Done}
                style={{ minWidth: '70px', fontWeight: 700, color: step4Done ? '#888' : '#0A246A' }}
              >
                {step4Running ? 'Opening...' : 'Open'}
              </button>
              {step4Done && (
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  style={{ minWidth: '100px', background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                  onClick={() => setShowInfoModal(true)}
                >
                  Verify in Info ➔
                </button>
              )}
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VERIFICATION MODAL: "Info.." DIALOG (Frames 090–092)
          ========================================================================= */}
      {showInfoModal && (
        <div 
          className="ids-modal-overlay" 
          style={{ zIndex: 1350, background: 'rgba(0,0,0,0.45)' }}
        >
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '450px', 
              maxWidth: '92vw', 
              background: '#ECE9D8',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              border: '2px solid #FFF',
              borderRightColor: '#716F64',
              borderBottomColor: '#716F64',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}
          >
            {/* Title Bar matching Frame 090 */}
            <div 
              className="ids-dialog-titlebar plain" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#0A246A',
                color: '#FFF',
                padding: '2px 6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px' }}>📄</span>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Info..</span>
              </div>
              <button 
                className="ids-win-btn close" 
                style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
                onClick={() => setShowInfoModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', fontSize: '11px', color: '#000' }}>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                {/* Fortune NEXT Logo Badge matching Frame 090 */}
                <div style={{ width: '120px', flexShrink: 0, textAlign: 'center', paddingTop: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#333', letterSpacing: '0.5px' }}>FORTUNE NEXT</div>
                  <div style={{ fontSize: '38px', fontWeight: 900, color: '#319795', lineHeight: '1.1', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                    6.5
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 700, color: '#C0392B' }}>
                    IDS <span style={{ color: '#27AE60' }}>NEXT</span>
                  </div>
                </div>

                {/* License and Date Information Box matching Frame 090 */}
                <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px', fontSize: '10.5px' }}>
                  <div style={{ fontWeight: 700, borderBottom: '1px solid #CCC', paddingBottom: '3px', marginBottom: '6px' }}>
                    License Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', rowGap: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Accounting Date</span>
                    <span style={{ fontWeight: 700, color: '#0A246A' }}>
                      {step4Done ? '26-JAN-2022 16:02' : `${acDate} 15:46`}
                    </span>

                    <span style={{ fontWeight: 600 }}>Server Date</span>
                    <span>{step4Done ? '26-JAN-2022 16:02' : `${acDate} 15:46`}</span>

                    <span style={{ fontWeight: 600 }}>Login Date</span>
                    <span>26-JAN-2022 15:46</span>
                  </div>

                  <div style={{ borderTop: '1px solid #EEE', marginTop: '6px', paddingTop: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#555', marginBottom: '2px' }}>Help Desk:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr' }}>
                      <span>Phone #</span>
                      <span style={{ fontWeight: 600 }}>+91 80 6772 0000</span>
                      <span>Email Id</span>
                      <span style={{ color: '#0066CC' }}>techsupport@idsnext.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright & Link Bar matching Frame 090 */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid #CCC', 
                  paddingTop: '6px', 
                  fontSize: '9.5px', 
                  color: '#666' 
                }}
              >
                <span>© IDS Next Business Solutions Pvt. Ltd. All Rights Reserved.</span>
                <span style={{ color: '#0A246A', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                  Click here to connect ReizNest
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={() => setShowInfoModal(false)}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
