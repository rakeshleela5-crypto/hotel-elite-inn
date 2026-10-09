import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Receipt, FileText, Search, Printer, Download, 
  Calendar, CheckCircle2, ChevronRight, X, ArrowLeft,
  Building2, DollarSign, ShieldCheck, CreditCard, LayoutList
} from 'lucide-react';

/* =========================================================================
   VIDEO 36: HOW TO REPRINT FRONT OFFICE BILL IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Reprint FO Bill \ FMCRYBL V6.5.002.1 (Frames 020–040)
   2. Entry Points (Frames 010 & 018):
      - Reports.. -> Reprint Front Office Bill (Rule 46 GST)
      - Quick Scan (Load Pgm) -> Type "reprint" -> "Reprint FO Bill" -> [ Load ]
      - 44-Video Tutorial Player -> Video 36 -> Launch Interactive Feature Clone
   3. Step 1 Window (Frame 022):
      - Month/Year: FEB-2022
      - Bill #: 512 with [ ? ] lookup
      - [ Continue ], [ Panel ], [ Exit ]
   4. Step 2 Details Window (Frame 026):
      - Bill #: 512 | Bill Date: 24-FEB-2022
      - Room#: 205 | Reg. #: 625 | Folio #: 1
      - Guest Name: Mr Kumar Anil
      - Company: Mahindra & Mahindra Ltd
      - Arrival Date: 27-JAN-2022 19:07 | Group: FIT
      - Departure Date: 24-FEB-2022 18:03 | Net Amount: 16,360.00
      - [ Details ], [ Print ], [ Panel ], [ Back ]
   5. Rule 46 GST Tax Invoice Print Preview & PDF Export (Frames 030 & 034)
   ========================================================================= */

export const INITIAL_BILLS_DATABASE = [
  {
    billNo: '512',
    billDate: '24-FEB-2022',
    roomNo: '205',
    regNo: '625',
    folioNo: '1',
    guestName: 'Mr Kumar Anil',
    companyName: 'Mahindra & Mahindra Ltd',
    gstin: '27AABCM8822P1ZX',
    arrivalDate: '27-JAN-2022 19:07',
    departureDate: '24-FEB-2022 18:03',
    group: 'FIT',
    roomType: 'DLX',
    ratePlan: 'CP',
    netAmount: 16360.00,
    baseAmount: 13864.40,
    cgst: 1247.80,
    sgst: 1247.80,
    payMode: 'Credit Card / Visa',
    cashier: 'MANAGER',
    lineItems: [
      { date: '21-FEB-2022', description: 'Room Tariff - Deluxe Room (3 Nights)', sac: '996311', amount: 9300.00, tax: 1674.00 },
      { date: '22-FEB-2022', description: 'Cannon Restaurant - In-Room Dining', sac: '996331', amount: 2450.00, tax: 122.50 },
      { date: '23-FEB-2022', description: 'Laundry Services (Dry Clean & Press)', sac: '999799', amount: 850.00, tax: 153.00 },
      { date: '24-FEB-2022', description: 'Travel Desk Airport Drop', sac: '996412', amount: 1264.40, tax: 63.20 },
      { date: '24-FEB-2022', description: 'CGST 9% (Accommodation) + 2.5% (F&B)', sac: 'TAX', amount: 0.00, tax: 1247.80 },
      { date: '24-FEB-2022', description: 'SGST 9% (Accommodation) + 2.5% (F&B)', sac: 'TAX', amount: 0.00, tax: 1247.80 }
    ],
    payments: [
      { date: '27-JAN-2022', mode: 'Advance Deposit', ref: 'REC-0091', amount: 3000.00 },
      { date: '24-FEB-2022', mode: 'Credit Card Settlement', ref: 'POS-897612', amount: 13360.00 }
    ]
  },
  {
    billNo: '511',
    billDate: '23-FEB-2022',
    roomNo: '201',
    regNo: '624',
    folioNo: '1',
    guestName: 'Mr Sharma Raj',
    companyName: 'Tata Motors Limited',
    gstin: '27AABCT3518Q1ZY',
    arrivalDate: '20-FEB-2022 14:00',
    departureDate: '23-FEB-2022 12:00',
    group: 'Corporate',
    roomType: 'EXE',
    ratePlan: 'MAP',
    netAmount: 11200.00,
    baseAmount: 9491.52,
    cgst: 854.24,
    sgst: 854.24,
    payMode: 'Corporate Direct Bill (BTC)',
    cashier: 'MANAGER',
    lineItems: [
      { date: '20-FEB-2022', description: 'Room Tariff - Executive Room (3 Nights)', sac: '996311', amount: 8997.00, tax: 1619.46 },
      { date: '21-FEB-2022', description: 'Room Service Beverages', sac: '996331', amount: 494.52, tax: 24.73 }
    ],
    payments: [
      { date: '20-FEB-2022', mode: 'Advance Deposit', ref: 'REC-0088', amount: 5000.00 },
      { date: '23-FEB-2022', mode: 'Bill to Company (BTC)', ref: 'INV-511-BTC', amount: 6200.00 }
    ]
  },
  {
    billNo: '510',
    billDate: '22-FEB-2022',
    roomNo: '301',
    regNo: '620',
    folioNo: '1',
    guestName: 'Ms Desai Priya',
    companyName: 'Infosys Technologies',
    gstin: '29AAACI1234K1ZB',
    arrivalDate: '19-FEB-2022 18:30',
    departureDate: '22-FEB-2022 11:30',
    group: 'Corporate',
    roomType: 'EXE',
    ratePlan: 'EP',
    netAmount: 8496.00,
    baseAmount: 7200.00,
    cgst: 648.00,
    sgst: 648.00,
    payMode: 'UPI / QR Code',
    cashier: 'MANAGER',
    lineItems: [
      { date: '19-FEB-2022', description: 'Room Tariff - Executive Room (3 Nights)', sac: '996311', amount: 7200.00, tax: 1296.00 }
    ],
    payments: [
      { date: '22-FEB-2022', mode: 'UPI Settlement', ref: 'UPI-984210', amount: 8496.00 }
    ]
  }
];

export default function IdsReprintBillModal({
  isOpen,
  onClose,
  accountingDate = '24-FEB-2022'
}) {
  const [stage, setStage] = useState('input'); // 'input' | 'details'
  const [monthYear, setMonthYear] = useState('FEB-2022');
  const [billNoInput, setBillNoInput] = useState('512');
  const [activeBill, setActiveBill] = useState(INITIAL_BILLS_DATABASE[0]);

  // Lookup & Preview States
  const [billLookupOpen, setBillLookupOpen] = useState(false);
  const [lineItemsDetailsOpen, setLineItemsDetailsOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [searchBillTerm, setSearchBillTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Continue to Stage 2
  const handleContinue = () => {
    const found = INITIAL_BILLS_DATABASE.find(b => b.billNo === billNoInput.trim());
    if (found) {
      setActiveBill(found);
      setStage('details');
      setStatusMessage(`Loaded Bill #${found.billNo} for Room ${found.roomNo} (${found.guestName})`);
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      alert(`Bill #${billNoInput} not found. Please click [ ? ] to lookup available bills.`);
    }
  };

  const handleSelectFromLookup = (bill) => {
    setBillNoInput(bill.billNo);
    setActiveBill(bill);
    setBillLookupOpen(false);
    setStage('details');
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: stage === 'input' ? '460px' : '620px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8',
          transition: 'width 0.2s ease'
        }}
      >
        {/* Titlebar matching Frame 022 */}
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
            <Receipt size={14} />
            <span>Reprint FO Bill \ FMCRYBL V6.5.002.1 — IDS Fortune NEXT PMS</span>
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
            STAGE 1: INPUT MONTH/YEAR & BILL # (Frame 022)
            ========================================================================= */}
        {stage === 'input' && (
          <div style={{ padding: '16px 20px', fontSize: '11px' }}>
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '14px 16px', marginBottom: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px 12px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Month/Year</span>
                <input 
                  className="ids-input" 
                  value={monthYear} 
                  onChange={(e) => setMonthYear(e.target.value)}
                  style={{ width: '130px', fontWeight: 700 }}
                />

                <span style={{ fontWeight: 600 }}>Bill #</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    className="ids-input" 
                    value={billNoInput} 
                    onChange={(e) => setBillNoInput(e.target.value)}
                    placeholder="e.g. 512"
                    style={{ width: '110px', fontWeight: 700, background: '#FFF7CC' }}
                    autoFocus
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '24px' }} 
                    onClick={() => setBillLookupOpen(true)}
                    title="Lookup Bills"
                  >
                    ?
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Action Ribbon matching Frame 022 */}
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
                onClick={handleContinue}
              >
                Continue
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setBillLookupOpen(true)}>Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: BILL DETAILS & ACTIONS (Frame 026)
            ========================================================================= */}
        {stage === 'details' && activeBill && (
          <div style={{ padding: '14px 18px', fontSize: '11px' }}>
            
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '12px 14px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 140px 90px 1fr', gap: '8px 12px', alignItems: 'center' }}>
                
                <span style={{ fontWeight: 600 }}>Bill #</span>
                <input className="ids-input" value={activeBill.billNo} readOnly style={{ width: '100px', fontWeight: 700, background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Bill Date</span>
                <input className="ids-input" value={activeBill.billDate} readOnly style={{ width: '120px', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Room#</span>
                <input className="ids-input" value={activeBill.roomNo} readOnly style={{ width: '80px', fontWeight: 700, color: '#0A246A', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Reg. #</span>
                <input className="ids-input" value={activeBill.regNo} readOnly style={{ width: '100px', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Folio #</span>
                <input className="ids-input" value={activeBill.folioNo} readOnly style={{ width: '80px', background: '#F0F0F0' }} />

                <span></span>
                <div></div>

                <span style={{ fontWeight: 600 }}>Guest Name</span>
                <input className="ids-input" value={activeBill.guestName} readOnly style={{ gridColumn: 'span 3', width: '100%', fontWeight: 700, background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Company</span>
                <input className="ids-input" value={activeBill.companyName || '-'} readOnly style={{ gridColumn: 'span 3', width: '100%', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Arrival Date</span>
                <input className="ids-input" value={activeBill.arrivalDate} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Group</span>
                <input className="ids-input" value={activeBill.group} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Departure Date</span>
                <input className="ids-input" value={activeBill.departureDate} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Net Amount</span>
                <input 
                  className="ids-input" 
                  value={activeBill.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
                  readOnly 
                  style={{ width: '120px', fontWeight: 900, color: '#0A246A', background: '#FFF7CC', fontSize: '12px' }} 
                />

              </div>
            </div>

            {/* Bottom Action Ribbon matching Frame 026 */}
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
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setLineItemsDetailsOpen(true)}
              >
                <LayoutList size={12} /> Details
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setPrintPreviewOpen(true)}
              >
                <Printer size={12} /> Print
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }} 
                onClick={() => setStage('input')}
              >
                Back
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            LOOKUP: BILL SEARCH LOOKUP MODAL
            ========================================================================= */}
        {billLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBillLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Bill Information Help V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setBillLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Bill:</span>
                  <input 
                    className="ids-input" 
                    value={searchBillTerm} 
                    onChange={(e) => setSearchBillTerm(e.target.value)} 
                    placeholder="Search by Bill #, Guest Name or Room #..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Bill #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Bill Date</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Room</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '80px' }}>Net Amount</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '100px' }}>Pay Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_BILLS_DATABASE
                        .filter(b => 
                          b.billNo.includes(searchBillTerm) || 
                          b.guestName.toLowerCase().includes(searchBillTerm.toLowerCase()) ||
                          b.roomNo.includes(searchBillTerm)
                        )
                        .map((b, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => handleSelectFromLookup(b)}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{b.billNo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.billDate}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{b.roomNo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.guestName}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>
                              ₹{b.netAmount.toFixed(2)}
                            </td>
                            <td style={{ padding: '3px 6px' }}>{b.payMode}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setBillLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP: LINE ITEMS DETAILS MODAL
            ========================================================================= */}
        {lineItemsDetailsOpen && activeBill && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setLineItemsDetailsOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '620px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Bill Line Item Details — Bill #{activeBill.billNo}</span>
                <button className="ids-win-btn close" onClick={() => setLineItemsDetailsOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '80px', borderRight: '1px solid #B0AB9A' }}>Date</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px', borderRight: '1px solid #B0AB9A' }}>SAC</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '70px', borderRight: '1px solid #B0AB9A' }}>Amount</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '65px' }}>Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeBill.lineItems || []).map((item, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.date}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.description}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.sac}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>{item.amount.toFixed(2)}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right' }}>{item.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => setLineItemsDetailsOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            RULE 46 GST TAX INVOICE PRINT PREVIEW MODAL (Frames 030 & 034)
            ========================================================================= */}
        {printPreviewOpen && activeBill && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setPrintPreviewOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#FFF', border: '2px outset #ECE9D8', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Window Titlebar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '11px' }}>
                  <FileText size={13} />
                  <span>GST Tax Invoice (Rule 46) — Bill #{activeBill.billNo} Reprint</span>
                </div>
                <button className="ids-win-btn close" onClick={() => setPrintPreviewOpen(false)}>✕</button>
              </div>

              {/* Authentic Rule 46 GST Bill Layout */}
              <div style={{ padding: '18px 22px', fontFamily: 'Courier New, monospace', fontSize: '11.5px', color: '#000' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>HOTEL ELITE INN & SUITES</div>
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>TAX INVOICE (RULE 46 OF CGST RULES, 2017)</div>
                  <div style={{ fontSize: '10px', color: '#333' }}>
                    Plot 12, CST Road, Santacruz East, Mumbai 400098 | GSTIN: 27AABCT3518Q1ZY
                  </div>
                  <div style={{ fontSize: '10px', color: '#333' }}>State: 27 - Maharashtra | State Code: 27 | Email: accounts@hoteleliteinn.com</div>
                  <div style={{ marginTop: '4px', display: 'inline-block', border: '1px solid #000', padding: '1px 8px', fontWeight: 700, fontSize: '11px' }}>
                    ORIGINAL FOR RECIPIENT (DUPLICATE REPRINT)
                  </div>
                </div>

                {/* Bill & Guest Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', marginBottom: '10px', fontSize: '10.5px' }}>
                  <div><strong>Invoice / Bill #:</strong> {activeBill.billNo}</div>
                  <div><strong>Invoice Date:</strong> {activeBill.billDate}</div>
                  <div><strong>Guest Name:</strong> {activeBill.guestName}</div>
                  <div><strong>Room #:</strong> {activeBill.roomNo} ({activeBill.roomType})</div>
                  <div><strong>Company:</strong> {activeBill.companyName || 'FIT Guest'}</div>
                  <div><strong>Guest GSTIN:</strong> {activeBill.gstin || 'UNREGISTERED'}</div>
                  <div><strong>Arrival:</strong> {activeBill.arrivalDate}</div>
                  <div><strong>Departure:</strong> {activeBill.departureDate}</div>
                  <div><strong>Folio #:</strong> {activeBill.folioNo} / Reg #: {activeBill.regNo}</div>
                  <div><strong>Cashier:</strong> {activeBill.cashier}</div>
                </div>

                {/* Line Items Table */}
                <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                    <thead style={{ background: '#F0F0F0', borderBottom: '1px solid #000', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 4px', textAlign: 'left', width: '70px', borderRight: '1px solid #000' }}>Date</th>
                        <th style={{ padding: '3px 4px', textAlign: 'left', borderRight: '1px solid #000' }}>Description</th>
                        <th style={{ padding: '3px 4px', textAlign: 'center', width: '55px', borderRight: '1px solid #000' }}>SAC</th>
                        <th style={{ padding: '3px 4px', textAlign: 'right', width: '75px', borderRight: '1px solid #000' }}>Taxable</th>
                        <th style={{ padding: '3px 4px', textAlign: 'right', width: '65px' }}>GST Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeBill.lineItems || []).map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{it.date}</td>
                          <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{it.description}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #000' }}>{it.sac}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #000' }}>{it.amount > 0 ? it.amount.toFixed(2) : '-'}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{it.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#F9F9F9', fontWeight: 900, borderTop: '1px solid #000' }}>
                        <td colSpan={3} style={{ padding: '4px', borderRight: '1px solid #000', textAlign: 'right' }}>
                          TOTAL INVOICE VALUE (INR):
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>
                          ₹{activeBill.baseAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right', fontSize: '11px', color: '#0A246A' }}>
                          ₹{activeBill.netAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Settlement Summary */}
                <div style={{ background: '#F4F4F4', border: '1px solid #CCC', padding: '6px 8px', marginBottom: '10px', fontSize: '10.5px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>Settlement & Payment Details:</div>
                  {(activeBill.payments || []).map((pm, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {pm.date} — {pm.mode} ({pm.ref})</span>
                      <strong>₹{pm.amount.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '8px' }}>
                  <div style={{ textAlign: 'center', width: '160px', borderTop: '1px dashed #000', paddingTop: '3px', fontSize: '9.5px' }}>
                    Guest Signature
                  </div>
                  <div style={{ textAlign: 'center', width: '160px', borderTop: '1px dashed #000', paddingTop: '3px', fontSize: '9.5px' }}>
                    For HOTEL ELITE INN (Auth Signatory)
                  </div>
                </div>

              </div>

              {/* Print Modal Footer */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  borderTop: '1px solid #999', 
                  padding: '8px 14px', 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '6px' 
                }}
              >
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, background: '#DCE6F1', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    window.print();
                  }}
                >
                  <Printer size={12} /> Send to Printer
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    alert(`Tax Invoice PDF saved as: FO_Bill_${activeBill.billNo}.pdf (Frame 034)`);
                    setPrintPreviewOpen(false);
                  }}
                >
                  <Download size={12} /> Save PDF (Frame 034)
                </button>
                <button className="ids-btn-classic" onClick={() => setPrintPreviewOpen(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
