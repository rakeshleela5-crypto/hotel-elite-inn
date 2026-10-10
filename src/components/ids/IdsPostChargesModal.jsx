import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, DollarSign, Calendar, RefreshCw, Check, X, Info, 
  HelpCircle, ChevronDown, ChevronRight, Layers, FileText, ArrowRight, Printer
} from 'lucide-react';

/* =========================================================================
   VIDEO 21: HOW TO USE POST CHARGES / ROOM CHARGES OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Navigation entry points:
      - Cashiering.. -> Posting -> Post Charges (Video 21 Frame 008 & 012)
      - Room Status V6.5.002.1 Rack -> Right Click Occupied Room 312 -> Room Charges (Frames 020-025)
   2. Post Charges V6.5.002.1 Dialog (Frames 012–060):
      - Room# 312, [ Guest Details ], Folio # 1, [ More... ]
      - Registration # 587, Name: MS BASU ANIRUDH
      - Reference Date: 26-JAN-2022, Accounting Date: 26-JAN-2022
      - Revenue Code Dropdown:
        * TRV: TRAVEL DESK (Airport Pickup Drop)
        * MSC: MISCELLENEOUS CHARGES
        * LAR: LAUNDRY FOR ROOM
        * LAC: LAUNDRY CLEAN
        * MIB: MINIBAR
        * RES: RESTAURANT
        * BAR: BAR
        * RMS: ROOM SERVICE
      - Description auto-population
      - Ref. #, Receipt # (225, 226)
      - Particulars: "Airport Pickup Drop", "Miscellenous Charges"
      - Currency: INR, Exchange Rate: 1.000000
      - Tax Inclusive: No / Yes
      - Charges & Total Amount calculations
      - Tax Details Grid: Tax Code | Taxable Amount (SGT, CGT)
      - User: MANAGER, Last Updated: 26-JAN-2022 16:16
      - Buttons: [ Add ], [ Modify ], [ Delete ], [ Browse ], [ Previous ], [ Next ], [ Save ], [ Panel ], [ Exit ]
   3. "DO YOU WANT TO PRINT VOUCHER?" Prompt Dialog (Frames 045 & 060)
   4. Printable Front Office Charge Voucher Preview
   5. Quick Balances V6.5.002.2 Dialog Integration (Frames 065–068):
      - 26-JAN-2022 Debit: 1,700.00
      - Total: 13,460.00
      - Summary: Tariff + 11,760.00, Travel Desk + 1,500.00, Miscellaneous Charges 200.00
   ========================================================================= */

export const REVENUE_CODES_DATA = [
  { code: 'TRV', name: 'TRAVEL DESK', defaultTax: 0.05, particular: 'Airport Pickup Drop', defaultAmt: 1500 },
  { code: 'MSC', name: 'MISCELLENEOUS CHARGES', defaultTax: 0.00, particular: 'Miscellenous Charges', defaultAmt: 200 },
  { code: 'LAR', name: 'LAUNDRY FOR ROOM', defaultTax: 0.18, particular: 'Laundry Express 3 pcs', defaultAmt: 350 },
  { code: 'LAC', name: 'LAUNDRY CLEAN', defaultTax: 0.18, particular: 'Dry Cleaning Service', defaultAmt: 450 },
  { code: 'MIB', name: 'MINIBAR', defaultTax: 0.18, particular: 'Mini Bar Beverages & Dry Fruits', defaultAmt: 500 },
  { code: 'RES', name: 'RESTAURANT', defaultTax: 0.05, particular: 'Cannon Restaurant Dinner Service', defaultAmt: 850 },
  { code: 'BAR', name: 'BAR', defaultTax: 0.18, particular: 'Cocktail & Beverage Service', defaultAmt: 1200 },
  { code: 'RMS', name: 'ROOM SERVICE', defaultTax: 0.05, particular: 'Midnight In-Room Dining', defaultAmt: 650 }
];

export default function IdsPostChargesModal({
  isOpen,
  onClose,
  initialRoomNo = '312',
  accountingDate = '26-JAN-2022',
  initialRevenueCode = 'TRV',
  onSaveCharge
}) {
  // Active window view: 'post-charges' | 'quick-balances'
  const [currentView, setCurrentView] = useState('post-charges');

  // Room & Guest Data
  const [roomNo, setRoomNo] = useState(initialRoomNo || '312');
  const [folioNo, setFolioNo] = useState('1');
  const [regNo, setRegNo] = useState('587');
  const [guestName, setGuestName] = useState('MS BASU ANIRUDH');
  const [refDate, setRefDate] = useState(accountingDate || '26-JAN-2022');
  const [acDate, setAcDate] = useState(accountingDate || '26-JAN-2022');

  // Charge Posting Form State
  const [revenueCode, setRevenueCode] = useState(initialRevenueCode || 'TRV');
  const [description, setDescription] = useState('TRAVEL DESK');
  const [refNo, setRefNo] = useState('');
  const [receiptNo, setReceiptNo] = useState('225');
  const [particulars, setParticulars] = useState('Airport Pickup Drop');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1.000000');
  const [taxInclusive, setTaxInclusive] = useState('No'); // 'No' | 'Yes'
  const [charges, setCharges] = useState('1500.00');

  // Prompts & Voucher preview state
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [showVoucherPreview, setShowVoucherPreview] = useState(false);
  const [savedVoucherData, setSavedVoucherData] = useState(null);

  // Posted charges in this session
  const [postedCharges, setPostedCharges] = useState([
    {
      receiptNo: '225',
      roomNo: '312',
      revenueCode: 'TRV',
      description: 'TRAVEL DESK',
      particulars: 'Airport Pickup Drop',
      charges: 1500,
      tax: 75,
      total: 1575,
      date: '26-JAN-2022'
    },
    {
      receiptNo: '226',
      roomNo: '312',
      revenueCode: 'MSC',
      description: 'MISCELLENEOUS CHARGES',
      particulars: 'Miscellenous Charges',
      charges: 200,
      tax: 0,
      total: 200,
      date: '26-JAN-2022'
    }
  ]);

  // Notice
  const [statusNotice, setStatusNotice] = useState('');

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      setRoomNo(initialRoomNo || '312');
      setAcDate(accountingDate || '26-JAN-2022');
      setRefDate(accountingDate || '26-JAN-2022');
      setCurrentView('post-charges');
      setShowPrintPrompt(false);
      setShowVoucherPreview(false);
      setStatusNotice('');
      
      const found = REVENUE_CODES_DATA.find(r => r.code === initialRevenueCode) || REVENUE_CODES_DATA[0];
      setRevenueCode(found.code);
      setDescription(found.name);
      setParticulars(found.particular);
      setCharges(found.defaultAmt.toFixed(2));
    }
  }, [isOpen, initialRoomNo, accountingDate, initialRevenueCode]);

  // Handle revenue code change
  const handleSelectRevenueCode = (code) => {
    setRevenueCode(code);
    const item = REVENUE_CODES_DATA.find(r => r.code === code);
    if (item) {
      setDescription(item.name);
      setParticulars(item.particular);
      setCharges(item.defaultAmt.toFixed(2));
    }
  };

  // Math Calculations
  const numericCharges = parseFloat(charges) || 0;
  const currentItem = REVENUE_CODES_DATA.find(r => r.code === revenueCode) || REVENUE_CODES_DATA[0];
  const rate = currentItem.defaultTax;

  let baseCharges = numericCharges;
  let taxAmt = 0;
  let totalAmount = numericCharges;

  if (taxInclusive === 'Yes') {
    // Charges is inclusive of tax
    baseCharges = Math.round((numericCharges / (1 + rate)) * 100) / 100;
    taxAmt = Math.round((numericCharges - baseCharges) * 100) / 100;
    totalAmount = numericCharges;
  } else {
    // Charges is exclusive of tax
    taxAmt = Math.round((numericCharges * rate) * 100) / 100;
    totalAmount = Math.round((numericCharges + taxAmt) * 100) / 100;
  }

  const sgtTax = Math.round((taxAmt / 2) * 100) / 100;
  const cgtTax = Math.round((taxAmt / 2) * 100) / 100;

  // Handle [ Add ] Button
  const handleAddNew = () => {
    setCharges('0.00');
    setParticulars('');
    setRefNo('');
    setStatusNotice('Fields cleared for new charge entry.');
  };

  // Handle [ Save ] Button
  const handleSaveCharge = () => {
    const voucher = {
      receiptNo,
      roomNo,
      folioNo,
      regNo,
      guestName,
      revenueCode,
      description,
      particulars,
      charges: baseCharges,
      tax: taxAmt,
      sgt: sgtTax,
      cgt: cgtTax,
      total: totalAmount,
      currency: currencyCode,
      date: acDate,
      user: 'MANAGER',
      timestamp: `${acDate} 16:17`
    };

    setSavedVoucherData(voucher);
    setPostedCharges(prev => [voucher, ...prev]);

    if (onSaveCharge) {
      onSaveCharge(voucher);
    }

    // Next receipt number
    const nextReceipt = String(parseInt(receiptNo, 10) + 1);
    setReceiptNo(nextReceipt);

    // Show confirmation prompt: "DO YOU WANT TO PRINT VOUCHER?" (Frames 045 & 060)
    setShowPrintPrompt(true);
  };

  // Handle Confirm Print Voucher Prompt
  const handleConfirmPrintPrompt = (shouldPrint) => {
    setShowPrintPrompt(false);
    if (shouldPrint) {
      setShowVoucherPreview(true);
    } else {
      setStatusNotice(`✓ Charge Voucher #${savedVoucherData?.receiptNo || receiptNo} posted successfully!`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>


      {/* =====================================================================
          VIEW 1: POST CHARGES V6.5.002.1 DIALOG (Frames 012–060)
          ===================================================================== */}
      {currentView === 'post-charges' && (
        <div 
          className="ids-dialog-window" 
          style={{ width: '740px', maxWidth: '96vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
        >
          {/* Title Bar */}
          <div className="ids-dialog-titlebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ids-logo-badge" style={{ fontSize: '9px', padding: '1px 3px' }}>IDS</span>
              <span>Post Charges V6.5.002.1</span>
            </div>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '8px 14px', fontSize: '11px', color: '#000' }}>
            {/* Status notice */}
            {statusNotice && (
              <div 
                style={{
                  background: '#E6F4EA',
                  color: '#137333',
                  border: '1px solid #34A853',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600
                }}
              >
                <span>{statusNotice}</span>
                <span 
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0A246A' }}
                  onClick={() => setCurrentView('quick-balances')}
                >
                  Verify in Quick Balances ➔
                </span>
              </div>
            )}

            {/* Form Fields Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
              {/* Row 1: Room#, [ Guest Details ], Folio #, [ More... ] */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 85px 22px 105px 50px 70px 1fr', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 600 }}>Room#</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '80px', background: '#FFF' }}
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
                <button type="button" className="ids-btn-classic" style={{ padding: '0 4px' }} title="Lookup Room">?</button>

                <button 
                  type="button" 
                  className="ids-btn-classic" 
                  style={{ padding: '1px 8px', fontWeight: 600 }}
                  onClick={() => alert(`Guest: ${guestName}\nRoom: ${roomNo}\nReg#: ${regNo}\nFolio: ${folioNo}`)}
                >
                  Guest Details
                </button>

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Folio #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '60px', background: '#FFF' }}
                  value={folioNo}
                  onChange={(e) => setFolioNo(e.target.value)}
                />

                <div>
                  <button type="button" className="ids-btn-classic" style={{ padding: '1px 8px' }}>More...</button>
                </div>
              </div>

              {/* Row 2: Registration #, Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr 50px 190px', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 600 }}>Registration #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100px', background: '#EAE8DE' }}
                  value={regNo}
                  readOnly
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Name</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100%', background: '#EAE8DE', fontWeight: 700 }}
                  value={guestName}
                  readOnly
                />
              </div>

              {/* Row 3: Reference Date, Accounting Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr 110px 110px', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 600 }}>Reference Date</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '105px', background: '#EAE8DE', textAlign: 'center' }}
                  value={refDate}
                  readOnly
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Accounting Date</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '105px', background: '#EAE8DE', textAlign: 'center', fontWeight: 700 }}
                  value={acDate}
                  readOnly
                />
              </div>

              {/* Row 4: Revenue Code, [ ? ], Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 90px 22px 1fr 80px 190px', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 700, color: '#0A246A' }}>Revenue Code</label>
                <select 
                  className="ids-select" 
                  style={{ width: '85px', background: '#FFF', fontWeight: 700, color: '#0A246A' }}
                  value={revenueCode}
                  onChange={(e) => handleSelectRevenueCode(e.target.value)}
                >
                  {REVENUE_CODES_DATA.map(r => (
                    <option key={r.code} value={r.code}>{r.code}</option>
                  ))}
                </select>
                <button type="button" className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Description</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100%', background: '#EAE8DE', fontWeight: 600 }}
                  value={description}
                  readOnly
                />
              </div>

              {/* Row 5: Ref. #, Receipt # */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr 80px 110px', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 600 }}>Ref. #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '105px', background: '#FFF' }}
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Receipt #</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '105px', background: '#EAE8DE', textAlign: 'center', fontWeight: 700, color: '#0A246A' }}
                  value={receiptNo}
                  readOnly
                />
              </div>

              {/* Row 6: Particulars */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontWeight: 600 }}>Particulars</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '100%', background: '#FFF' }}
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  placeholder="Enter charge details or item breakdown..."
                />
              </div>

              {/* Middle Section: Currency, Tax Inclusive, Charges, Tax Details Grid & Local Values */}
              <div style={{ display: 'grid', gridTemplateColumns: '270px 220px 1fr', gap: '8px', marginTop: '4px' }}>
                {/* Left: Currency, Exchange, Tax Inclusive, Charges, Total Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontWeight: 600 }}>Currency Code</label>
                    <select 
                      className="ids-select" 
                      style={{ width: '100px' }}
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontWeight: 600 }}>Exchange Rate</label>
                    <input 
                      type="text" 
                      className="ids-input" 
                      style={{ width: '100px', background: '#EAE8DE', textAlign: 'right' }}
                      value={exchangeRate}
                      readOnly
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontWeight: 600 }}>Tax Inclusive</label>
                    <select 
                      className="ids-select" 
                      style={{ width: '100px', background: '#FFF' }}
                      value={taxInclusive}
                      onChange={(e) => setTaxInclusive(e.target.value)}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#0A246A' }}>Charges</label>
                    <input 
                      type="text" 
                      className="ids-input" 
                      style={{ width: '140px', background: '#FFF', textAlign: 'right', fontWeight: 700 }}
                      value={charges}
                      onChange={(e) => setCharges(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontWeight: 700 }}>Total Amount</label>
                    <input 
                      type="text" 
                      className="ids-input" 
                      style={{ width: '140px', background: '#EAE8DE', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}
                      value={totalAmount.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                {/* Middle: Tax Details Box matching Frame 040 */}
                <div style={{ border: '1px solid #716F64', background: '#FFF', padding: '1px' }}>
                  <div style={{ background: '#DFDBC9', padding: '2px 6px', fontWeight: 700, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid #B0AB9A' }}>
                    Tax Details
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #CCC' }}>
                        <th style={{ width: '70px', padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #DDD' }}>Tax Code</th>
                        <th style={{ padding: '2px 4px', textAlign: 'right' }}>Taxable Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxAmt > 0 ? (
                        <>
                          <tr style={{ borderBottom: '1px solid #EEE' }}>
                            <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>SGT</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{sgtTax.toFixed(2)}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #EEE' }}>
                            <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>CGT</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{cgtTax.toFixed(2)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: '8px', textAlign: 'center', color: '#888' }}>
                            No tax applicable
                          </td>
                        </tr>
                      )}
                      <tr style={{ height: '14px' }}><td colSpan="2"></td></tr>
                      <tr style={{ height: '14px' }}><td colSpan="2"></td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Right: Local Value Summaries matching Frame 040 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-start' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      Charges(Local Value)
                    </label>
                    <input 
                      type="text" 
                      className="ids-input" 
                      style={{ width: '130px', background: '#EAE8DE', textAlign: 'right', fontWeight: 600 }}
                      value={baseCharges.toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, display: 'block', marginBottom: '2px', color: '#0A246A' }}>
                      Total (Local Value)
                    </label>
                    <input 
                      type="text" 
                      className="ids-input" 
                      style={{ width: '130px', background: '#EAE8DE', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}
                      value={totalAmount.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row: User & Last Updated */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 140px 1fr 90px 140px', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <label style={{ fontWeight: 600 }}>User</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '130px', background: '#EAE8DE', fontWeight: 600 }}
                  value="MANAGER"
                  readOnly
                />
                <div />

                <label style={{ fontWeight: 600, textAlign: 'right' }}>Last Updated</label>
                <input 
                  type="text" 
                  className="ids-input" 
                  style={{ width: '135px', background: '#EAE8DE', textAlign: 'center' }}
                  value={`${acDate} 16:16`}
                  readOnly
                />
              </div>
            </div>

            {/* Bottom Action Bar matching Frames 012, 040, 060 */}
            <div 
              style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'center',
                background: '#DFDBC9',
                padding: '6px',
                border: '1px solid #716F64',
                marginTop: '8px'
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
                onClick={handleSaveCharge}
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
                title="Verify Folio Ledger in Quick Balances (Video 21 Frame 065)"
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

      {/* =========================================================================
          VIEW 2: QUICK BALANCES V6.5.002.2 DIALOG (Frames 065–068)
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
            {/* Header Information Strip matching Frame 065 */}
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

            {/* Quick Balances Transactions Table matching Frames 065 & 068 */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', maxHeight: '280px', overflowY: 'auto' }}>
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

                  {/* 26-JAN-2022 Row matching Frame 065 (1,700.00) */}
                  <tr style={{ background: '#FFFDF0', borderBottom: '1px solid #CCC' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#0A246A' }}>26-JAN-2022</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}></td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                      1,700.00
                    </td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}></td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                      1,700.00
                    </td>
                  </tr>

                  {/* Grand Total Strip */}
                  <tr style={{ background: '#EDEAE0', borderTop: '2px solid #716F64', fontWeight: 700 }}>
                    <td colSpan="2" style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>
                      Total
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', color: '#0A246A' }}>
                      13,460.00
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A' }}>
                      0.00
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: '#0A246A' }}>
                      13,460.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Breakdown Box matching Frame 068 */}
            <div style={{ marginTop: '6px', border: '1px solid #716F64', background: '#FFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: '#DFDBC9', borderBottom: '1px solid #B0AB9A' }}>
                    <th style={{ padding: '2px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Summary Head</th>
                    <th style={{ width: '140px', padding: '2px 6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>Tariff +</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>11,760.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE', background: '#F5F9FF' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#0066CC' }}>
                      Travel Desk + (Receipt #225)
                    </td>
                    <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 600, color: '#0066CC' }}>
                      1,500.00
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #EEE', background: '#FFFDF0' }}>
                    <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#B7791F' }}>
                      Miscellaneous Charges (Receipt #226)
                    </td>
                    <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 600, color: '#B7791F' }}>
                      200.00
                    </td>
                  </tr>
                  <tr style={{ background: '#EDEAE0', fontWeight: 700 }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #B0AB9A' }}>Total Outstanding Balance</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', color: '#0A246A' }}>13,460.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Instruction Footer matching Frame 068 */}
            <div style={{ textAlign: 'center', padding: '4px', fontSize: '10px', color: '#555', fontStyle: 'italic' }}>
              Double Click on Date /Revenue column to view details
            </div>

            {/* Bottom Actions Bar */}
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
                onClick={() => setCurrentView('post-charges')}
                style={{ fontWeight: 600, color: '#0A246A' }}
              >
                ◀ Post Another Room Charge
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

      {/* =========================================================================
          PROMPT MODAL: "DO YOU WANT TO PRINT VOUCHER?" (Frames 045 & 060)
          ========================================================================= */}
      {showPrintPrompt && (
        <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
          <div 
            className="ids-dialog-window" 
            style={{ width: '380px', maxWidth: '92vw', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', background: '#ECE9D8', border: '2px solid #808080' }}
          >
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Post Charges V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => handleConfirmPrintPrompt(false)}>✕</button>
            </div>

            <div style={{ padding: '16px', fontSize: '11px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', color: '#2B5797' }}>❓</span>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>DO YOU WANT TO PRINT VOUCHER?</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => handleConfirmPrintPrompt(true)}
                >
                  Yes
                </button>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px' }}
                  onClick={() => handleConfirmPrintPrompt(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINTABLE FRONT OFFICE CHARGE VOUCHER PREVIEW
          ========================================================================= */}
      {showVoucherPreview && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div 
            className="ids-dialog-window" 
            style={{ width: '580px', maxWidth: '96vw', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', background: '#FFF' }}
          >
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>
                Charge Voucher Preview - Receipt #{savedVoucherData?.receiptNo || receiptNo}
              </span>
              <button className="ids-win-btn close" onClick={() => setShowVoucherPreview(false)}>✕</button>
            </div>

            <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>HOTEL ELITE INN</h2>
                <div style={{ fontSize: '10px' }}>Opposite Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) - 765020</div>
                <div style={{ fontSize: '10px' }}>GSTIN: 21AEWFS9433F1ZN | State Code: 21 | Phone: +91-6370757541</div>
                <div style={{ fontWeight: 700, marginTop: '6px', fontSize: '13px', textDecoration: 'underline' }}>
                  FRONT OFFICE CHARGE VOUCHER
                </div>
              </div>

              {/* Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '11px' }}>
                <div>
                  <div><strong>Voucher/Receipt #:</strong> {savedVoucherData?.receiptNo || receiptNo}</div>
                  <div><strong>Date / Time:</strong> {savedVoucherData?.timestamp || `${acDate} 16:17`}</div>
                  <div><strong>Room #:</strong> {roomNo}</div>
                  <div><strong>Folio #:</strong> {folioNo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Guest Name:</strong> {guestName}</div>
                  <div><strong>Reg #:</strong> {regNo}</div>
                  <div><strong>Revenue Code:</strong> {savedVoucherData?.revenueCode || revenueCode}</div>
                  <div><strong>Cashier / User:</strong> MANAGER</div>
                </div>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Particulars / Service Description</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0' }}>
                      <strong>{savedVoucherData?.description || description}</strong>
                      <div style={{ fontSize: '10px', color: '#555' }}>{savedVoucherData?.particulars || particulars}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>
                      ₹{parseFloat(savedVoucherData?.charges || baseCharges).toFixed(2)}
                    </td>
                  </tr>
                  {(savedVoucherData?.tax || taxAmt) > 0 && (
                    <>
                      <tr style={{ fontSize: '10px', color: '#555' }}>
                        <td style={{ padding: '2px 0 2px 10px' }}>State GST (SGT)</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>
                          ₹{parseFloat(savedVoucherData?.sgt || sgtTax).toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ fontSize: '10px', color: '#555' }}>
                        <td style={{ padding: '2px 0 2px 10px' }}>Central GST (CGT)</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>
                          ₹{parseFloat(savedVoucherData?.cgt || cgtTax).toFixed(2)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr style={{ borderTop: '1px solid #000', borderBottom: '2px solid #000', fontWeight: 700 }}>
                    <td style={{ padding: '6px 0' }}>TOTAL AMOUNT CHARGED TO ROOM</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', fontSize: '13px' }}>
                      ₹{parseFloat(savedVoucherData?.total || totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '30px', textAlign: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ borderTop: '1px dashed #777', width: '160px', margin: '0 auto 4px auto' }} />
                  <div>Guest Signature</div>
                </div>
                <div>
                  <div style={{ borderTop: '1px dashed #777', width: '160px', margin: '0 auto 4px auto' }} />
                  <div>Duty Manager / Cashier</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#ECE9D8', padding: '8px 12px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #716F64' }}>
              <button 
                type="button" 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, color: '#0A246A' }}
                onClick={() => {
                  alert(`🖨️ Voucher #${savedVoucherData?.receiptNo || receiptNo} printed to Front Desk thermal printer.`);
                  setShowVoucherPreview(false);
                }}
              >
                🖨️ Print Voucher
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                onClick={() => setShowVoucherPreview(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
