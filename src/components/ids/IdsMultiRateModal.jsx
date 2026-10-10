import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  TrendingUp, Calendar, DollarSign, Check, X, 
  Search, CheckCircle2, ShieldCheck, Utensils, 
  Coffee, RefreshCw, Layers, LayoutGrid, HelpCircle
} from 'lucide-react';

/* =========================================================================
   VIDEO 41: HOW TO USE MULTI RATE OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Rate Information V6.5002.5 (Frames 018–035)
   2. Entry Points (Frames 006 & 018):
      - Setup.. -> Multi Rate Option (Weekday vs Weekend)
      - Registrations.. -> Walk-ins -> Multi Rate Option
      - Quick Scan (Load Pgm) -> Type "multi rate" -> [ Load ]
      - 44-Video Tutorial Player -> Video 41 -> Launch Interactive Feature Clone
   3. Top Controls (Frame 018):
      - Room Type: EXE | Rack ID: 1 | Rate: 5000.00 | Plan: CP
      - Meal Plan: CP (Continental Plan)
      - Sessions: [x] B/F (Breakfast), [ ] L/N (Lunch), [ ] D/N (Dinner) | 2 Night/s
      - Rate Type: Discount | Currency: INR | Rate ID: 1 | Rate Desc: Room Rate
   4. Multi Rate Date-Wise Grid (Frames 018 & 030):
      - "You Can Change Rates Date Wise By double click on Particular Date."
      - Row 1: 13-MAR-2026 SUNDAY -> Charges: 5,000.00 | Type: EXE | Plan: CP | B/F: Yes (Weekend Peak)
      - Row 2: 14-MAR-2026 MONDAY -> Charges: 3,500.00 | Type: EXE | Plan: CP | B/F: Yes (Weekday Base)
      - Double-clicking row loads "Selected Rate on <Date>" editor
      - Shortcuts: F2 - Apply rates of Prv. day (RateId), F5 - Clear All Rates
   5. Walk-in Registration Console (Frame 038):
      - Registration for 201 | Guest: Mr Rohit Sharma | Rate: Multi-Rate Discount
      - Click [ Save ] -> Registration saved & Room 201 updated!
   ========================================================================= */

export const INITIAL_MULTI_RATE_DAYS = [
  {
    date: '13-MAR-2026',
    dayName: 'SUNDAY',
    hurdleRate: '',
    roomType: 'EXE',
    planCode: 'CP',
    marketSegment: 'FIT',
    rateType: 'Discount',
    rateId: '1',
    charges: 5000.00,
    hasBreakfast: true,
    hasLunch: false,
    hasDinner: false,
    currency: 'INR',
    extraAdult: 1000.00,
    extraChild: 0.00,
    taxStructure: '798',
    exBedTax: '804'
  },
  {
    date: '14-MAR-2026',
    dayName: 'MONDAY',
    hurdleRate: '',
    roomType: 'EXE',
    planCode: 'CP',
    marketSegment: 'FIT',
    rateType: 'Discount',
    rateId: '1',
    charges: 3500.00,
    hasBreakfast: true,
    hasLunch: false,
    hasDinner: false,
    currency: 'INR',
    extraAdult: 1000.00,
    extraChild: 0.00,
    taxStructure: '798',
    exBedTax: '804'
  },
  {
    date: '15-MAR-2026',
    dayName: 'TUESDAY',
    hurdleRate: '',
    roomType: 'EXE',
    planCode: 'MAP',
    marketSegment: 'FIT',
    rateType: 'Discount',
    rateId: '1',
    charges: 4200.00,
    hasBreakfast: true,
    hasLunch: false,
    hasDinner: true,
    currency: 'INR',
    extraAdult: 1000.00,
    extraChild: 0.00,
    taxStructure: '798',
    exBedTax: '804'
  }
];

export default function IdsMultiRateModal({
  isOpen,
  onClose,
  initialRoomNo = '201',
  accountingDate = '13-MAR-2026',
  onMultiRateSaved,
  onOpenRoomRack
}) {
  const [currentView, setCurrentView] = useState('rateMatrix'); // 'rateMatrix' | 'walkInForm' | 'completed'
  const [roomNo, setRoomNo] = useState(initialRoomNo);
  const [guestTitle, setGuestTitle] = useState('Mr');
  const [guestName, setGuestName] = useState('Rohit Sharma');
  const [mobileNo, setMobileNo] = useState('09820011223');

  // Rate Matrix Grid state
  const [dailyRates, setDailyRates] = useState(INITIAL_MULTI_RATE_DAYS);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);

  // Active selected date form controls
  const activeDateItem = dailyRates[selectedDateIdx] || dailyRates[0];
  const [activeCharges, setActiveCharges] = useState(activeDateItem.charges);
  const [activePlan, setActivePlan] = useState(activeDateItem.planCode);
  const [activeBf, setActiveBf] = useState(activeDateItem.hasBreakfast);
  const [activeLn, setActiveLn] = useState(activeDateItem.hasLunch);
  const [activeDn, setActiveDn] = useState(activeDateItem.hasDinner);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Calculate Total Multi-Rate Amount
  const totalAmount = dailyRates.reduce((sum, item) => sum + item.charges, 0);

  // Select Date Row for Editing
  const handleSelectDateRow = (idx) => {
    setSelectedDateIdx(idx);
    const item = dailyRates[idx];
    setActiveCharges(item.charges);
    setActivePlan(item.planCode);
    setActiveBf(item.hasBreakfast);
    setActiveLn(item.hasLunch);
    setActiveDn(item.hasDinner);
  };

  // Update active date rate in matrix
  const handleApplyCurrentDateChanges = () => {
    setDailyRates(prev => prev.map((item, idx) => 
      idx === selectedDateIdx 
        ? { 
            ...item, 
            charges: parseFloat(activeCharges) || item.charges,
            planCode: activePlan,
            hasBreakfast: activeBf,
            hasLunch: activeLn,
            hasDinner: activeDn
          } 
        : item
    ));

    setStatusMessage(`Updated rate for ${activeDateItem.date} (${activeDateItem.dayName}) to ₹${parseFloat(activeCharges || 0).toFixed(2)} (${activePlan})`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // F2 Shortcut: Copy Previous Day Rate
  const handleApplyPreviousDayRate = () => {
    if (selectedDateIdx === 0) {
      alert('Cannot copy previous rate for the first date of stay.');
      return;
    }
    const prevRate = dailyRates[selectedDateIdx - 1];
    setDailyRates(prev => prev.map((item, idx) => 
      idx === selectedDateIdx 
        ? { ...item, charges: prevRate.charges, planCode: prevRate.planCode, hasBreakfast: prevRate.hasBreakfast, hasLunch: prevRate.hasLunch, hasDinner: prevRate.hasDinner }
        : item
    ));
    setActiveCharges(prevRate.charges);
    setActivePlan(prevRate.planCode);
    setActiveBf(prevRate.hasBreakfast);
    setActiveLn(prevRate.hasLunch);
    setActiveDn(prevRate.hasDinner);
    setStatusMessage(`Applied previous day's rate (₹${prevRate.charges.toFixed(2)}) to ${activeDateItem.date}!`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // F5 Shortcut: Reset Rates to Flat
  const handleResetAllRates = () => {
    setDailyRates(prev => prev.map(item => ({ ...item, charges: 5000.00, planCode: 'CP', hasBreakfast: true, hasLunch: false, hasDinner: false })));
    setActiveCharges(5000.00);
    setActivePlan('CP');
    setActiveBf(true);
    setActiveLn(false);
    setActiveDn(false);
    setStatusMessage('All dates reset to default flat rack rate (₹5,000.00 CP).');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Confirm Multi Rate and go to Walk-in Form (Frame 038)
  const handleConfirmMultiRate = () => {
    setCurrentView('walkInForm');
  };

  // Save Walk-in Registration (Frame 038)
  const handleSaveRegistration = () => {
    setCurrentView('completed');

    const multiRateRecord = {
      roomNo,
      roomType: 'EXE',
      guestName: `${guestTitle} ${guestName}`,
      mobile: mobileNo,
      dailyRates,
      totalRate: totalAmount,
      nights: dailyRates.length,
      averageRate: totalAmount / dailyRates.length,
      planCode: 'MULTI-RATE',
      arrival: `${accountingDate} 18:05`,
      departure: '16-MAR-2026 12:00'
    };

    if (onMultiRateSaved) {
      onMultiRateSaved(multiRateRecord);
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: currentView === 'rateMatrix' ? '780px' : '740px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 41 Frame 018 */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
            color: '#FFF', 
            padding: '4px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
            <TrendingUp size={14} />
            <span>
              {currentView === 'rateMatrix' 
                ? `Rate Information V6.5002.5 — Multi Rate Option (Date-Wise Split)` 
                : currentView === 'walkInForm'
                ? `Walk-Ins V6.5002.5 — Registration for Room ${roomNo} (Multi-Rate)`
                : `Registration Completed — Multi-Rate Room ${roomNo}`}
            </span>
          </div>
          <button 
            className="ids-win-btn close" 
            onClick={onClose}
            style={{ 
              background: '#C75050', 
              color: '#FFF', 
              border: '1px outset #FFF', 
              fontWeight: 700, 
              width: '18px', 
              height: '18px', 
              lineHeight: '14px', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* =========================================================================
            PHASE 1: RATE INFORMATION V6.5002.5 MULTI RATE MATRIX (Frames 018–035)
            ========================================================================= */}
        {currentView === 'rateMatrix' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Header controls for selected date matching Frame 030 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0A246A', marginBottom: '6px' }}>
                Selected Rate on {activeDateItem.date} ({activeDateItem.dayName}):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 110px 80px 110px 70px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Room Type</span>
                <input className="ids-input" value="EXE" readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Rack ID</span>
                <input className="ids-input" value="1" readOnly style={{ width: '50px' }} />

                <span style={{ fontWeight: 600 }}>Rate Type</span>
                <input className="ids-input" value="Discount" readOnly style={{ width: '80px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Meal Plan</span>
                <select className="ids-input" value={activePlan} onChange={(e) => setActivePlan(e.target.value)} style={{ width: '80px', fontWeight: 700 }}>
                  <option value="CP">CP (Breakfast)</option>
                  <option value="MAP">MAP (B/F + Dinner)</option>
                  <option value="AP">AP (All Meals)</option>
                  <option value="EP">EP (Room Only)</option>
                </select>

                <span style={{ fontWeight: 600 }}>Date Tariff</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input 
                    className="ids-input" 
                    type="number"
                    value={activeCharges} 
                    onChange={(e) => setActiveCharges(e.target.value)} 
                    style={{ width: '90px', fontWeight: 900, color: '#0A246A', background: '#FFF7CC' }} 
                  />
                  <button className="ids-btn-classic" onClick={handleApplyCurrentDateChanges} style={{ fontWeight: 700 }}>Apply</button>
                </div>

                <span style={{ fontWeight: 600 }}>Meal Sessions</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', gridColumn: 'span 3' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <input type="checkbox" checked={activeBf} onChange={(e) => setActiveBf(e.target.checked)} /> B/F
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <input type="checkbox" checked={activeLn} onChange={(e) => setActiveLn(e.target.checked)} /> L/N
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <input type="checkbox" checked={activeDn} onChange={(e) => setActiveDn(e.target.checked)} /> D/N
                  </label>
                </div>
              </div>
            </div>

            {/* Instruction Banner from Video 41 Frame 030 */}
            <div style={{ background: '#FFFDE6', border: '1px solid #E6D043', padding: '5px 10px', fontSize: '10.5px', color: '#7D5700', marginBottom: '8px' }}>
              💡 <strong>You Can Change Rates Date Wise</strong> by double-clicking on a particular date row in the matrix below.
            </div>

            {/* Multi Rate Table Grid matching Frames 018 & 030 */}
            <div style={{ height: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '85px' }}>Date</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '75px' }}>Day</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '45px' }}>Type</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '45px' }}>Plan</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '45px' }}>MKT</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '65px' }}>Rate Type</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '75px' }}>Charges</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '35px' }}>B/F</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '35px' }}>L/N</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '35px' }}>D/N</th>
                    <th style={{ padding: '3px 6px', textAlign: 'center', width: '40px' }}>Cur</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRates.map((row, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => handleSelectDateRow(idx)}
                      style={{ 
                        background: selectedDateIdx === idx ? '#FFF7CC' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                        cursor: 'pointer',
                        borderBottom: '1px solid #E0E0E0'
                      }}
                    >
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{row.date}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 600, color: row.dayName === 'SUNDAY' ? '#C5221F' : '#333', borderRight: '1px solid #E0E0E0' }}>{row.dayName}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.roomType}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{row.planCode}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.marketSegment}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.rateType}</td>
                      <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 900, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>
                        ₹{row.charges.toFixed(2)}
                      </td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>{row.hasBreakfast ? '☑' : '☐'}</td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>{row.hasLunch ? '☑' : '☐'}</td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>{row.hasDinner ? '☑' : '☐'}</td>
                      <td style={{ padding: '3px 6px', textAlign: 'center' }}>{row.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total and Shortcut Row matching Frame 018 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#555' }}>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }} onClick={handleApplyPreviousDayRate}>
                  F2 - Apply rates of Prv. day
                </button>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }} onClick={handleResetAllRates}>
                  F5 - Clear All Rates
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Total Stay Amount ({dailyRates.length} Nights):</span>
                <span style={{ fontWeight: 900, color: '#137333', fontSize: '13px' }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bottom Actions matching Frame 018 */}
            <div 
              style={{ 
                background: '#D4D0C8', 
                border: '1px solid #808080', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '6px'
              }}
            >
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '80px', background: '#DCE6F1' }}
                onClick={handleConfirmMultiRate}
              >
                Confirm
              </button>
              <button className="ids-btn-classic">Package Incl</button>
              <button className="ids-btn-classic" onClick={onClose}>Back</button>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 2: WALK-INS REGISTRATION CONSOLE (Video 41 Frame 038)
            ========================================================================= */}
        {currentView === 'walkInForm' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            <div style={{ background: '#ECE9D8', border: '2px groove #ECE9D8', padding: '6px 10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#0A246A', fontSize: '12px' }}>
                Registration for Room {roomNo} (Executive Room)
              </div>
              <div style={{ display: 'flex', gap: '12px', fontWeight: 700 }}>
                <span>Pax: 1</span>
                <span>Folio #: 1</span>
                <span style={{ color: '#137333' }}>Rate: Multi-Rate Dynamic (3 Nights)</span>
              </div>
            </div>

            {/* Form Fields matching Frame 038 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 12px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* Left Column */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Title / Name</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input className="ids-input" value={guestTitle} onChange={(e) => setGuestTitle(e.target.value)} style={{ width: '40px', fontWeight: 700 }} />
                    <input className="ids-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} style={{ flex: 1, fontWeight: 700, background: '#FFF7CC' }} />
                  </div>

                  <span style={{ fontWeight: 600 }}>Mobile #</span>
                  <input className="ids-input" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} style={{ width: '100%', fontWeight: 700 }} />

                  <span style={{ fontWeight: 600 }}>Address</span>
                  <input className="ids-input" value="Bandra West, Mumbai" readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                  <span style={{ fontWeight: 600 }}>City / State</span>
                  <input className="ids-input" value="Mumbai, Maharashtra" readOnly style={{ width: '100%', background: '#F0F0F0' }} />
                </div>

                {/* Right Column */}
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Classification</span>
                  <input className="ids-input" value="Regular" readOnly style={{ width: '100%' }} />

                  <span style={{ fontWeight: 600 }}>Business Source</span>
                  <input className="ids-input" value="WKN" readOnly style={{ width: '80px', fontWeight: 700 }} />

                  <span style={{ fontWeight: 600 }}>Tariff Breakdown</span>
                  <div style={{ fontSize: '10px', color: '#0A246A', fontWeight: 700 }}>
                    Sun: ₹5,000 | Mon: ₹3,500 | Tue: ₹4,200
                  </div>

                  <span style={{ fontWeight: 600 }}>Total Rate</span>
                  <div style={{ fontWeight: 900, color: '#137333', fontSize: '12px' }}>
                    ₹{totalAmount.toFixed(2)} (Avg ₹{(totalAmount / dailyRates.length).toFixed(2)}/night)
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action Ribbon matching Frame 038 */}
            <div 
              style={{ 
                background: '#D4D0C8', 
                border: '1px solid #808080', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '6px'
              }}
            >
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                onClick={handleSaveRegistration}
              >
                Save
              </button>
              <button className="ids-btn-classic" onClick={() => setCurrentView('rateMatrix')}>Modify Rates</button>
              <button className="ids-btn-classic" onClick={onClose}>Exit</button>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 3: COMPLETED SUCCESS VIEW
            ========================================================================= */}
        {currentView === 'completed' && (
          <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#E6F4EA', borderRadius: '50%', color: '#137333', marginBottom: '12px' }}>
              <CheckCircle2 size={42} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', marginBottom: '6px' }}>
              Multi-Rate Check-In Registered Successfully!
            </div>

            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px 18px', maxWidth: '460px', margin: '0 auto 16px auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
                <div><strong>Assigned Room:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Room {roomNo} (Executive Room)</div>
                <div><strong>Guest Name:</strong></div>
                <div>{guestTitle} {guestName}</div>
                <div><strong>Total Multi-Rate:</strong></div>
                <div style={{ fontWeight: 700, color: '#137333' }}>₹{totalAmount.toFixed(2)} for {dailyRates.length} Nights</div>
                <div><strong>Nightly Schedule:</strong></div>
                <div style={{ fontSize: '11px', color: '#555' }}>
                  {dailyRates.map(r => `${r.dayName}: ₹${r.charges.toFixed(2)} (${r.planCode})`).join(' | ')}
                </div>
                <div><strong>Room Status Rack:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Updated to 201 O/EXE {guestName} (Occupied)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {onOpenRoomRack && (
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#DCE6F1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    onClose();
                    onOpenRoomRack();
                  }}
                >
                  <LayoutGrid size={13} /> View in Room Status Rack
                </button>
              )}
              <button className="ids-btn-classic" onClick={onClose}>
                Close PMS Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
