import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, DollarSign, Calendar, RefreshCw, Check, X, Info, 
  HelpCircle, ChevronDown, ChevronRight, Layers, FileText, ArrowRight
} from 'lucide-react';

/* =========================================================================
   VIDEO 20: HOW TO USE ADDITIONAL ROOM RATE OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Room Status V6.5.002.1 Right-Click Context Menu:
      - [ Additional Room Rate ] on Occupied Room 312 (MS BASU ANIRUDH)
      - [ Quick Balances ]
   2. Additional Room Rate V6.5.002.1 Dialog (Frames 015–055):
      - 4 Radio options: (•) Rate, ( ) Plan, ( ) Extra bed, ( ) Retention Charge
      - Dynamic labels: TRF Amount, PLN Amount, EXB Amount, RTN Amount
      - [x] With Tax checkbox for Retention Charge
      - Currency: INR, Exchange Rate: 1.000000
      - Room# 312, Folio # 1, Reg # 587, MS BASU ANIRUDH, 26-JAN-2022
      - Tax Details Grid: CGT (Central GST 6%), SGT (State GST 6%)
      - Day Total, Room Count (No/Yes), Local Value
      - Action Bar: [ Add ], [ Modify ], [ Delete ], [ Browse ], [ Previous ], [ Next ], [ Save ], [ Panel ], [ Exit ]
   3. Quick Balances V6.5.002.2 Dialog (Frames 060–065):
      - Room# 312, MS. BASU ANIRUDH, Reg.# 587, Folio # 1
      - Arrival: 16-JAN-2022, Departure: 26-JAN-2022, Status: Regular Guest
      - Date / Revenue Code / Debit / Credit / Balance grid
      - Double Click on Date / Revenue column to expand 26-JAN-2022 breakdown:
        * Travel Desk + : 1,500.00
        * Miscellaneous Charges : 200.00
        * Tariff + : 2,800.00
        * Continental Plan + : 280.00
        * Extra Bed + : 1,680.00
        * Retention Charge + : 2,240.00
        Total: 8,700.00 (Grand Total: 20,460.00)
      - Summary Box breakdown
   ========================================================================= */

export const DEFAULT_ADDITIONAL_POSTINGS = [
  {
    type: 'rate',
    typeName: 'Rate',
    code: 'TRF',
    label: 'TRF Amount',
    amount: 2500,
    tax: 300,
    total: 2800,
    description: 'Previous',
    date: '26-JAN-2022'
  },
  {
    type: 'plan',
    typeName: 'Plan',
    code: 'PLN',
    label: 'PLN Amount',
    amount: 250,
    tax: 30,
    total: 280,
    description: 'Plan Charge',
    date: '26-JAN-2022'
  },
  {
    type: 'extrabed',
    typeName: 'Extra bed',
    code: 'EXB',
    label: 'EXB Amount',
    amount: 1500,
    tax: 180,
    total: 1680,
    description: 'Extra Bed Charge',
    date: '26-JAN-2022'
  },
  {
    type: 'retention',
    typeName: 'Retention Charge',
    code: 'RTN',
    label: 'RTN Amount',
    amount: 2000,
    tax: 240,
    total: 2240,
    description: 'Retention Charge',
    date: '26-JAN-2022'
  }
];

export default function IdsAdditionalRoomRateModal({
  isOpen,
  onClose,
  initialRoomNo = '312',
  accountingDate = '26-JAN-2022',
  initialMode = 'additional-rate', // 'additional-rate' | 'quick-balances'
  onSaveAdditionalCharge
}) {
  // Active window view: 'additional-rate' | 'quick-balances'
  const [currentView, setCurrentView] = useState('additional-rate');

  // Room & Guest Data
  const [roomNo, setRoomNo] = useState(initialRoomNo || '312');
  const [folioNo, setFolioNo] = useState('1');
  const [regNo, setRegNo] = useState('587');
  const [guestName, setGuestName] = useState('MS BASU ANIRUDH');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1.000000');
  const [acDate, setAcDate] = useState(accountingDate || '26-JAN-2022');

  // Charge Category Radio: 'rate' | 'plan' | 'extrabed' | 'retention'
  const [chargeType, setChargeType] = useState('rate');
  const [withTax, setWithTax] = useState(true); // only shown for Retention Charge
  const [amount, setAmount] = useState('2500.00');
  const [description, setDescription] = useState('Previous');
  const [referenceNo, setReferenceNo] = useState('');
  const [roomCount, setRoomCount] = useState('No');

  // Saved Postings List for this guest
  const [postings, setPostings] = useState(DEFAULT_ADDITIONAL_POSTINGS);

  // Status & Feedback Notice
  const [successNotice, setSuccessNotice] = useState('');

  // Quick Balances View State
  const [expandedDate, setExpandedDate] = useState('26-JAN-2022'); // double-clicked expanded row

  // Synchronize initial settings
  useEffect(() => {
    if (isOpen) {
      setRoomNo(initialRoomNo || '312');
      setCurrentView(initialMode === 'quick-balances' ? 'quick-balances' : 'additional-rate');
      setAcDate(accountingDate || '26-JAN-2022');
      setSuccessNotice('');
    }
  }, [isOpen, initialRoomNo, initialMode, accountingDate]);

  // Handle Radio Selection Change
  const handleSelectChargeType = (type) => {
    setChargeType(type);
    if (type === 'rate') {
      setAmount('2500.00');
      setDescription('Previous');
    } else if (type === 'plan') {
      setAmount('250.00');
      setDescription('Plan Charge');
    } else if (type === 'extrabed') {
      setAmount('1500.00');
      setDescription('Extra Bed Charge');
    } else if (type === 'retention') {
      setAmount('2000.00');
      setDescription('Retention Charge');
      setWithTax(true);
    }
  };

  // Get Amount Label
  const getAmountLabel = () => {
    switch (chargeType) {
      case 'rate': return 'TRF Amount';
      case 'plan': return 'PLN Amount';
      case 'extrabed': return 'EXB Amount';
      case 'retention': return 'RTN Amount';
      default: return 'Amount';
    }
  };

  // Calculate GST (12% standard IDS hospitality tax: 6% CGST + 6% SGST)
  const numericAmount = parseFloat(amount) || 0;
  const taxRate = 0.12;
  const taxAmt = Math.round(numericAmount * taxRate * 100) / 100;
  const cgtAmt = Math.round((taxAmt / 2) * 100) / 100;
  const sgtAmt = Math.round((taxAmt / 2) * 100) / 100;
  const dayTotal = numericAmount + taxAmt;

  // Handle [ Add ] Button
  const handleAddNew = () => {
    setAmount('0.00');
    setDescription('');
    setReferenceNo('');
    setSuccessNotice('Cleared form for new posting entry.');
  };

  // Handle [ Save ] Button
  const handleSave = () => {
    const newPosting = {
      type: chargeType,
      typeName: chargeType === 'rate' ? 'Rate' : chargeType === 'plan' ? 'Plan' : chargeType === 'extrabed' ? 'Extra bed' : 'Retention Charge',
      code: chargeType === 'rate' ? 'TRF' : chargeType === 'plan' ? 'PLN' : chargeType === 'extrabed' ? 'EXB' : 'RTN',
      label: getAmountLabel(),
      amount: numericAmount,
      tax: taxAmt,
      total: dayTotal,
      description: description || getAmountLabel(),
      date: acDate
    };

    setPostings(prev => [newPosting, ...prev]);
    setSuccessNotice(`✓ Successfully posted ${getAmountLabel()} of ₹${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Tax ₹${taxAmt.toFixed(2)}) to Room ${roomNo}!`);

    if (onSaveAdditionalCharge) {
      onSaveAdditionalCharge(newPosting);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Top Tutorial Guidance Banner */}
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
              VIDEO 20
            </span>
            <span>How to Use Additional Room Rate Option in IDS 6.5 & 7.0 Software</span>
          </div>
          <span style={{ fontSize: '10px', color: '#BEE3F8' }}>Room: {roomNo} | Date: {acDate}</span>
        </div>

        {/* Preset Workflow Simulator Buttons matching Video 20 */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '2px' }}>
          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              background: currentView === 'additional-rate' && chargeType === 'rate' ? '#FFF7CC' : '#E8EEF5',
              fontSize: '10px',
              fontWeight: chargeType === 'rate' ? 700 : 500,
              color: '#0A246A',
              padding: '2px 8px'
            }}
            onClick={() => {
              setCurrentView('additional-rate');
              handleSelectChargeType('rate');
            }}
          >
            1. Rate (TRF ₹2,500 + ₹300)
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              background: currentView === 'additional-rate' && chargeType === 'plan' ? '#FFF7CC' : '#E8EEF5',
              fontSize: '10px',
              fontWeight: chargeType === 'plan' ? 700 : 500,
              color: '#0A246A',
              padding: '2px 8px'
            }}
            onClick={() => {
              setCurrentView('additional-rate');
              handleSelectChargeType('plan');
            }}
          >
            2. Plan (PLN ₹250 + ₹30)
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              background: currentView === 'additional-rate' && chargeType === 'extrabed' ? '#FFF7CC' : '#E8EEF5',
              fontSize: '10px',
              fontWeight: chargeType === 'extrabed' ? 700 : 500,
              color: '#0A246A',
              padding: '2px 8px'
            }}
            onClick={() => {
              setCurrentView('additional-rate');
              handleSelectChargeType('extrabed');
            }}
          >
            3. Extra Bed (EXB ₹1,500 + ₹180)
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              background: currentView === 'additional-rate' && chargeType === 'retention' ? '#FFF7CC' : '#E8EEF5',
              fontSize: '10px',
              fontWeight: chargeType === 'retention' ? 700 : 500,
              color: '#0A246A',
              padding: '2px 8px'
            }}
            onClick={() => {
              setCurrentView('additional-rate');
              handleSelectChargeType('retention');
            }}
          >
            4. Retention Charge (RTN ₹2,000 + ₹240)
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            style={{ 
              background: currentView === 'quick-balances' ? '#316AC5' : '#D4E6F1',
              color: currentView === 'quick-balances' ? '#FFF' : '#0A246A',
              fontSize: '10px',
              fontWeight: 700,
              marginLeft: 'auto',
              padding: '2px 10px',
              border: '2px outset #5DADE2'
            }}
            onClick={() => setCurrentView(currentView === 'quick-balances' ? 'additional-rate' : 'quick-balances')}
          >
            {currentView === 'quick-balances' ? '◀ Back to Additional Rate' : '🔍 View Quick Balances (₹20,460)'}
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: ADDITIONAL ROOM RATE V6.5.002.1 DIALOG (Frames 015–055)
          ===================================================================== */}
      {currentView === 'additional-rate' && (
        <div 
          className="ids-dialog-window" 
          style={{ width: '740px', maxWidth: '96vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
        >
          {/* Title Bar */}
          <div className="ids-dialog-titlebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ids-logo-badge" style={{ fontSize: '9px', padding: '1px 3px' }}>IDS</span>
              <span>Additional Room Rate V6.5.002.1</span>
            </div>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '10px 14px', fontSize: '11px', color: '#000' }}>
            {/* Success notification strip */}
            {successNotice && (
              <div 
                style={{
                  background: '#E6F4EA',
                  color: '#137333',
                  border: '1px solid #34A853',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600
                }}
              >
                <span>{successNotice}</span>
                <span 
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0A246A' }}
                  onClick={() => setCurrentView('quick-balances')}
                >
                  Verify in Quick Balances ➔
                </span>
              </div>
            )}

            {/* Top Category Radio Group matching Frames 018, 030, 040, 050 */}
            <div 
              style={{
                border: '1px solid #716F64',
                padding: '6px 16px',
                background: '#F0ECE0',
                display: 'flex',
                gap: '32px',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: chargeType === 'rate' ? 700 : 500 }}>
                <input 
                  type="radio" 
                  name="chargeCategory" 
                  checked={chargeType === 'rate'} 
                  onChange={() => handleSelectChargeType('rate')}
                />
                <span>Rate</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: chargeType === 'plan' ? 700 : 500 }}>
                <input 
                  type="radio" 
                  name="chargeCategory" 
                  checked={chargeType === 'plan'} 
                  onChange={() => handleSelectChargeType('plan')}
                />
                <span>Plan</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: chargeType === 'extrabed' ? 700 : 500 }}>
                <input 
                  type="radio" 
                  name="chargeCategory" 
                  checked={chargeType === 'extrabed'} 
                  onChange={() => handleSelectChargeType('extrabed')}
                />
                <span>Extra bed</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: chargeType === 'retention' ? 700 : 500 }}>
                <input 
                  type="radio" 
                  name="chargeCategory" 
                  checked={chargeType === 'retention'} 
                  onChange={() => handleSelectChargeType('retention')}
                />
                <span>Retention Charge</span>
              </label>
            </div>

            {/* Main Form Fields Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {/* Row 1: Room#, Folio #, Reg #, Guest Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 140px 50px 70px 45px 70px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Room#</label>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <input 
                    type="text" 
                    className="ids-input" 
                    style={{ width: '85px', background: '#FFF' }}
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                  />
                  <button type="button" className="ids-btn-classic" style={{ padding: '0 6px' }} title="Lookup Room">?</button>
                </div>

                <label style={{ fontWeight: 600 }}>Folio #</label>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <input 
                    type="text" 
                    className="ids-input" 
                    style={{ width: '40px', background: '#FFF' }}
                    value={folioNo}
                    onChange={(e) => setFolioNo(e.target.value)}
                  />
                  <button type="button" className="ids-btn-classic" style={{ padding: '0 4px' }} title="Lookup Folio">?</button>
                </div>

                <label style={{ fontWeight: 600 }}>Reg #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '60px', background: '#EAE8DE' }}
                  value={regNo}
                  readOnly
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="ids-btn-classic" 
                    style={{ padding: '1px 10px', fontWeight: 600 }}
                    onClick={() => alert(`Guest: ${guestName}\nRoom: ${roomNo}\nReg#: ${regNo}\nFolio: ${folioNo}`)}
                  >
                    Guest Info...
                  </button>
                </div>
              </div>

              {/* Row 2: Guest Name & Accounting Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 110px', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Guest Name</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100%', background: '#EAE8DE', fontWeight: 700 }}
                  value={guestName}
                  readOnly
                />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Accounting Date</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '110px', background: '#EAE8DE', textAlign: 'center', fontWeight: 700 }}
                  value={acDate}
                  readOnly
                />
              </div>

              {/* Row 3: Currency Code, (With Tax checkbox if retention), Exchange Rate */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 140px 1fr 90px 110px', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Currency Code</label>
                <select 
                  className="ids-select" 
                  style={{ width: '130px', background: '#FFF' }}
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>

                <div>
                  {chargeType === 'retention' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 700, color: '#0A246A' }}>
                      <input 
                        type="checkbox" 
                        checked={withTax} 
                        onChange={(e) => setWithTax(e.target.checked)}
                      />
                      <span>With Tax</span>
                    </label>
                  )}
                </div>

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Exchange Rate</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '110px', background: '#EAE8DE', textAlign: 'right' }}
                  value={exchangeRate}
                  readOnly
                />
              </div>

              {/* Row 4: Amount Field with Dynamic Label (TRF/PLN/EXB/RTN), Secondary mirror input, Tax Amt */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 110px 110px 1fr 90px 110px', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 700, color: '#0A246A' }}>{getAmountLabel()}</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100px', background: '#FFF', textAlign: 'right', fontWeight: 700 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100px', background: '#EAE8DE', textAlign: 'right', color: '#666' }}
                  value={numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  readOnly
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Tax Amt</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '110px', background: '#EAE8DE', textAlign: 'right' }}
                  value={taxAmt.toFixed(2)}
                  readOnly
                />
              </div>

              {/* Row 5: Description & Reference # */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 226px 1fr 90px 110px', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Description</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '220px', background: '#FFF' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Reference #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '110px', background: '#FFF' }}
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>

            {/* Tax Details Grid matching Frames 018, 035, 045, 055 */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ background: '#DFDBC9', padding: '3px 8px', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid #B0AB9A', fontSize: '10.5px' }}>
                Tax Details
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8' }}>
                      <th style={{ width: '90px', padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Tax Code</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                      <th style={{ width: '140px', padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>Taxable Amount</th>
                      <th style={{ width: '140px', padding: '3px 6px', textAlign: 'right' }}>Local Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numericAmount > 0 ? (
                      <>
                        <tr style={{ borderBottom: '1px solid #DDD' }}>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>CGT</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Central GST (6%)</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 700 }}>
                            {cgtAmt.toFixed(2)}
                          </td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>
                            {cgtAmt.toFixed(2)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #DDD' }}>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>SGT</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>State GST (6%)</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 700 }}>
                            {sgtAmt.toFixed(2)}
                          </td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>
                            {sgtAmt.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#888' }}>
                          Enter amount to calculate tax split
                        </td>
                      </tr>
                    )}
                    {/* Placeholder rows matching classic Windows look */}
                    <tr style={{ height: '18px' }}><td colSpan="4"></td></tr>
                    <tr style={{ height: '18px' }}><td colSpan="4"></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Totals Row matching Frame 018 */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 130px 1fr 80px 70px 80px 110px', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <label style={{ fontWeight: 700 }}>Day Total</label>
              <input 
                type="text" 
                className="ids-input" 
                style={{ width: '120px', background: '#EAE8DE', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}
                value={dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                readOnly
              />
              <div />

              <label style={{ fontWeight: 600, textAlign: 'right' }}>Room Count</label>
              <select 
                className="ids-select" 
                style={{ width: '65px' }}
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              <label style={{ fontWeight: 600, textAlign: 'right' }}>Local Value</label>
              <input 
                type="text" 
                className="ids-input" 
                style={{ width: '110px', background: '#EAE8DE', textAlign: 'right', fontWeight: 700 }}
                value={dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                readOnly
              />
            </div>

            {/* Bottom Action Bar matching Frames 018, 045, 055 */}
            <div 
              style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'center',
                background: '#DFDBC9',
                padding: '6px',
                border: '1px solid #716F64'
              }}
            >
              <button type="button" className="ids-btn-classic" onClick={handleAddNew} style={{ minWidth: '55px' }}>
                Add
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Modify
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Delete
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Browse
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Previous
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Next
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                style={{ minWidth: '55px', fontWeight: 700, color: '#0A246A' }}
                onClick={handleSave}
              >
                Save
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '55px' }}>
                Panel
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                style={{ minWidth: '95px', background: '#FFF7CC', fontWeight: 700 }}
                onClick={() => setCurrentView('quick-balances')}
                title="Open Quick Balances Window (Video 20 Frame 060)"
              >
                Quick Balances
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={onClose}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: QUICK BALANCES V6.5.002.2 DIALOG (Frames 060–065)
          ===================================================================== */}
      {currentView === 'quick-balances' && (
        <div 
          className="ids-dialog-window" 
          style={{ width: '740px', maxWidth: '96vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
        >
          {/* Title Bar */}
          <div className="ids-dialog-titlebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ids-logo-badge" style={{ fontSize: '9px', padding: '1px 3px' }}>IDS</span>
              <span>Quick Balances V6.5.002.2</span>
            </div>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px', color: '#000' }}>
            {/* Header Information Strip matching Frame 060 */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 20px 80px 1fr 60px 50px 60px 40px',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0',
                borderBottom: '1px solid #B0AB9A',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontWeight: 600 }}>Room#</span>
              <input 
                type="text" 
                className="ids-input" 
                style={{ width: '60px', background: '#FFF' }}
                value={roomNo}
                readOnly
              />
              <button type="button" className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>

              <span style={{ fontWeight: 600 }}>Guest Name</span>
              <span style={{ fontWeight: 700, color: '#0A246A' }}>MS. BASU ANIRUDH</span>

              <span style={{ fontWeight: 600, textAlign: 'right' }}>Reg.#</span>
              <span style={{ fontWeight: 700 }}>587</span>

              <span style={{ fontWeight: 600, textAlign: 'right' }}>Folio #</span>
              <span style={{ fontWeight: 700 }}>1</span>
            </div>

            <div 
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                paddingBottom: '6px',
                fontSize: '10.5px'
              }}
            >
              <div>Arrival: <strong style={{ color: '#0A246A' }}>16-JAN-2022</strong></div>
              <div>Departure: <strong style={{ color: '#0A246A' }}>26-JAN-2022</strong></div>
              <div>Status: <strong>Regular Guest</strong></div>
            </div>

            {/* Quick Balances Transactions Table matching Frames 060 & 065 */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', maxHeight: '330px', overflowY: 'auto' }}>
              <table className="ids-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: '#DFDBC9', borderBottom: '1px solid #B0AB9A', fontWeight: 700 }}>
                    <th style={{ width: '90px', padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Date</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Revenue Code</th>
                    <th style={{ width: '110px', padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>Debit</th>
                    <th style={{ width: '90px', padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>Credit</th>
                    <th style={{ width: '110px', padding: '3px 6px', textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Prior dates */}
                  <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>16-JAN-2022</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}></td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>3,920.00</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}></td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>3,920.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>23-JAN-2022</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}></td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>3,920.00</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}></td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>3,920.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>25-JAN-2022</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}></td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>3,920.00</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}></td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>3,920.00</td>
                  </tr>

                  {/* 26-JAN-2022 Main Aggregate Row (Interactive Expand) */}
                  <tr 
                    style={{ 
                      background: expandedDate === '26-JAN-2022' ? '#FFF7CC' : '#F9F8F5', 
                      cursor: 'pointer',
                      borderBottom: '1px solid #CCC' 
                    }}
                    onDoubleClick={() => setExpandedDate(expandedDate === '26-JAN-2022' ? '' : '26-JAN-2022')}
                    title="Double-click to expand/collapse itemized revenue heads (Frame 065)"
                  >
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#0A246A' }}>
                      26-JAN-2022 {expandedDate === '26-JAN-2022' ? '▼' : '▶'}
                    </td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE', fontStyle: 'italic', color: '#666' }}>
                      (Double click to view 6 sub-postings)
                    </td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                      8,700.00
                    </td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}></td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                      8,700.00
                    </td>
                  </tr>

                  {/* Expanded Sub-Postings matching Frame 065 */}
                  {expandedDate === '26-JAN-2022' && (
                    <>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px dotted #E0E0E0' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>Travel Desk +</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>1,500.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px dotted #E0E0E0' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>Miscellaneous Charges</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>200.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px dotted #E0E0E0' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>Tariff +</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>2,800.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px dotted #E0E0E0' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#C05621' }}>Continental Plan +</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 600 }}>280.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px dotted #E0E0E0' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#2B6CB0' }}>Extra Bed +</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 600 }}>1,680.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                      <tr style={{ background: '#FCFBF7', borderBottom: '1px solid #CCC' }}>
                        <td style={{ padding: '2px 6px 2px 20px', borderRight: '1px solid #EEE', color: '#777' }}>↳ Sub</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#9B2C2C' }}>Retention Charge +</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 600 }}>2,240.00</td>
                        <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>0</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}></td>
                      </tr>
                    </>
                  )}

                  {/* Grand Total Strip */}
                  <tr style={{ background: '#EDEAE0', borderTop: '2px solid #716F64', fontWeight: 700 }}>
                    <td colSpan="2" style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>
                      Total
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', color: '#0A246A' }}>
                      20,460.00
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>
                      0.00
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: '#0A246A' }}>
                      20,460.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Breakdown Box matching Frame 060 */}
            <div style={{ marginTop: '6px', border: '1px solid #716F64', background: '#FFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: '#DFDBC9', borderBottom: '1px solid #B0AB9A' }}>
                    <th style={{ padding: '2px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Revenue Category</th>
                    <th style={{ width: '140px', padding: '2px 6px', textAlign: 'right' }}>Summary Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>Tariff +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>14,560.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>Travel Desk +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>1,500.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>Miscelleneous Charges</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>200.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE', background: '#FFFDF0' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#C05621', fontWeight: 600 }}>Continental Plan +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 600 }}>280.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE', background: '#F5F9FF' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#2B6CB0', fontWeight: 600 }}>Extra Bed +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 600 }}>1,680.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE', background: '#FFF5F5' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#9B2C2C', fontWeight: 600 }}>Retention Charge +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 600 }}>2,240.00</td>
                  </tr>
                  <tr style={{ background: '#EDEAE0', fontWeight: 700 }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #B0AB9A' }}>Total Outstanding Balance</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', color: '#0A246A' }}>20,460.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Instruction Footer matching Frame 060 */}
            <div style={{ textAlign: 'center', padding: '4px', fontSize: '10px', color: '#555', fontStyle: 'italic' }}>
              Double Click on Date /Revenue column to view details
            </div>

            {/* Bottom Actions Bar matching Frame 060 */}
            <div 
              style={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'flex-end',
                background: '#DFDBC9',
                padding: '6px 12px',
                border: '1px solid #716F64'
              }}
            >
              <button 
                type="button" 
                className="ids-btn-classic"
                onClick={() => setCurrentView('additional-rate')}
                style={{ fontWeight: 600, color: '#0A246A' }}
              >
                ◀ Post Another Rate
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '70px' }}>
                Bill Details
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '60px' }}>
                Clear
              </button>
              <button type="button" className="ids-btn-classic" style={{ minWidth: '60px' }}>
                Panel
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                style={{ minWidth: '60px', fontWeight: 700 }}
                onClick={onClose}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
