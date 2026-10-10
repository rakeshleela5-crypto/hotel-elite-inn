import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { RefreshCw, Check, X, Calendar, DollarSign, Clock, ShieldCheck, AlertCircle, Info, ChevronRight, Play } from 'lucide-react';
import { 
  INITIAL_ACCOUNTING_DATE, 
  NEXT_ACCOUNTING_DATE, 
  getFormattedPmsDate 
} from '../../data/idsPmsStore';

/* =========================================================================
   VIDEO 19: NIGHT AUDIT PROCESS IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   ========================================================================= */

export const PENDING_KOTS_DATA = [
  { restaurant: 'BAR', session: 'GN', billNo: '', user: 'BIREN' },
  { restaurant: 'RES', session: 'BF', billNo: '', user: 'BIREN' },
  { restaurant: 'RES', session: 'LN', billNo: '', user: 'BIREN' }
];

export const INHOUSE_AUDIT_ROOMS = [
  { roomNo: '102', guest: 'Sharma Rajesh', regNo: '501', rate: '1,750.00' },
  { roomNo: '105', guest: 'Mohanty Sunil', regNo: '502', rate: '2,050.00' },
  { roomNo: '201', guest: 'Kumar Anil', regNo: '613', rate: '2,050.00' },
  { roomNo: '203', guest: 'Patel Vikram', regNo: '503', rate: '2,050.00' },
  { roomNo: '206', guest: 'Jena Subrat', regNo: '504', rate: '2,050.00' },
  { roomNo: '301', guest: 'Rath Amitav', regNo: '505', rate: '1,450.00' },
  { roomNo: '303', guest: 'Mishra Priyadarshi', regNo: '506', rate: '1,750.00' },
  { roomNo: '109', guest: 'Dr. Mohanty S N', regNo: '507', rate: '3,250.00' }
];

export default function IdsNightAuditModal({
  isOpen,
  onClose,
  currentAccountingDate = INITIAL_ACCOUNTING_DATE,
  onCompleteNightAudit,
  initialStep = 'full-wizard' // 'step1' | 'step2' | 'step3' | 'step4' | 'full-wizard' | 'info'
}) {
  // Wizard active step: 1 | 2 | 3 | 4 | 'completed' | 'info'
  const [activeStep, setActiveStep] = useState(1);

  // Dates
  const [acDate, setAcDate] = useState(currentAccountingDate || INITIAL_ACCOUNTING_DATE);
  const [nextDate, setNextDate] = useState(NEXT_ACCOUNTING_DATE);
  const [confirmNextDate, setConfirmNextDate] = useState(NEXT_ACCOUNTING_DATE);

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
    try {
      const parts = acDate.split('-');
      if (parts.length === 3) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const mIdx = months.indexOf(parts[1].toUpperCase());
        const d = new Date(parseInt(parts[2], 10), mIdx >= 0 ? mIdx : 0, parseInt(parts[0], 10));
        d.setDate(d.getDate() + 1);
        const calculatedNext = getFormattedPmsDate(d);
        setNextDate(calculatedNext);
        setConfirmNextDate(calculatedNext);
      } else {
        setNextDate(NEXT_ACCOUNTING_DATE);
        setConfirmNextDate(NEXT_ACCOUNTING_DATE);
      }
    } catch (e) {
      setNextDate(NEXT_ACCOUNTING_DATE);
      setConfirmNextDate(NEXT_ACCOUNTING_DATE);
    }
  }, [acDate]);

  // Execute Step 1: Post Room Rate Animation
  const handleExecuteStep1 = () => {
    setStep1Running(true);
    setStep1Log('Deleting old Trn/Tax records for selected room........');

    const rooms = ['102', '105', '201', '203', '206', '301', '303', '109'];
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
                      {step4Done ? `${nextDate} 16:02` : `${acDate} 15:46`}
                    </span>

                    <span style={{ fontWeight: 600 }}>Server Date</span>
                    <span>{step4Done ? `${nextDate} 16:02` : `${acDate} 15:46`}</span>

                    <span style={{ fontWeight: 600 }}>Login Date</span>
                    <span>{`${acDate} 15:46`}</span>
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
