import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Building, Utensils, FileText, Printer, Check, X, 
  RotateCcw, DollarSign, Split, Info, Download, ShieldCheck
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

export const CORPORATE_ENTITIES = [
  { 
    code: 'VEDANTA', 
    name: 'Vedanta Limited (Lanjigarh Alumina Refinery)', 
    gstin: '21AAACV1234F1Z8', 
    address: 'Post Lanjigarh, Dist. Kalahandi, Odisha - 766027',
    stateCode: '21',
    state: 'Odisha'
  },
  { 
    code: 'JKPAPER', 
    name: 'JK Paper Mills Ltd (Jaykaypur, Rayagada)', 
    gstin: '21AAACJ5678B1Z2', 
    address: 'PO Jaykaypur, Dist. Rayagada, Odisha - 765017',
    stateCode: '21',
    state: 'Odisha'
  },
  { 
    code: 'UTKAL', 
    name: 'Utkal Alumina International Ltd (Doraguda)', 
    gstin: '21AAACU9012E1Z4', 
    address: 'At/PO Doraguda, Rayagada, Odisha - 765015',
    stateCode: '21',
    state: 'Odisha'
  },
  { 
    code: 'DIRECT', 
    name: 'Direct Corporate FIT / Custom Company', 
    gstin: '21AAACD9999A1Z1', 
    address: 'Station Road, Muniguda, Rayagada - 765020',
    stateCode: '21',
    state: 'Odisha'
  }
];

export default function IdsCorporateSplitBillingModal({
  isOpen,
  onClose,
  initialRoomNo = '206',
  guestName = 'Mr. P Jena',
  accountingDate = '11-OCT-2026',
  onInvoicesGenerated
}) {
  const [selectedCorpCode, setSelectedCorpCode] = useState('VEDANTA');
  const [employeeId, setEmployeeId] = useState('VED-ENG-9041');
  const [claimPoNumber, setClaimPoNumber] = useState('PO-2026-OCT-881');
  const [activePreviewTab, setActivePreviewTab] = useState('ROOM'); // 'ROOM' | 'RESTAURANT'
  const [roomNights, setRoomNights] = useState(2);
  const [roomTariffPerNight, setRoomTariffPerNight] = useState(2200);

  // F&B Items consumed during stay
  const [fbItems, setFbItems] = useState([
    { code: '101', name: 'Executive Breakfast Buffet (Day 1)', qty: 1, rate: 250, gstRate: 5 },
    { code: '102', name: 'Odia Thali & Dal Maharani Dinner', qty: 1, rate: 380, gstRate: 5 },
    { code: '103', name: 'Mineral Water & Beverages (Day 1)', qty: 2, rate: 40, gstRate: 5 },
    { code: '104', name: 'Working Executive Lunch (Day 2)', qty: 1, rate: 350, gstRate: 5 },
    { code: '105', name: 'Room Service Dinner & Breads (Day 2)', qty: 1, rate: 420, gstRate: 5 }
  ]);

  const activeCorp = useMemo(() => {
    return CORPORATE_ENTITIES.find(c => c.code === selectedCorpCode) || CORPORATE_ENTITIES[0];
  }, [selectedCorpCode]);

  const [corporateGstin, setCorporateGstin] = useState(activeCorp.gstin);
  React.useEffect(() => {
    setCorporateGstin(activeCorp.gstin);
  }, [activeCorp]);

  // Calculations for Room Accommodation Invoice (SAC 996311)
  const roomTaxableAmount = useMemo(() => roomNights * roomTariffPerNight, [roomNights, roomTariffPerNight]);
  const roomGstPercent = roomTaxableAmount / roomNights > 7500 ? 18 : 12;
  const roomCgst = (roomTaxableAmount * (roomGstPercent / 2)) / 100;
  const roomSgst = (roomTaxableAmount * (roomGstPercent / 2)) / 100;
  const roomTotalInvoice = roomTaxableAmount + roomCgst + roomSgst;

  // Calculations for Restaurant / Food Allowance Invoice (SAC 996331 - 5% Flat Restaurant GST)
  const fbTaxableAmount = useMemo(() => {
    return fbItems.reduce((acc, itm) => acc + (itm.qty * itm.rate), 0);
  }, [fbItems]);
  const fbCgst = (fbTaxableAmount * 2.5) / 100;
  const fbSgst = (fbTaxableAmount * 2.5) / 100;
  const fbTotalInvoice = fbTaxableAmount + fbCgst + fbSgst;

  const grandConsolidatedTotal = roomTotalInvoice + fbTotalInvoice;

  if (!isOpen) return null;

  const handlePrintActiveInvoice = () => {
    playReceptionChime();
    window.print();
  };

  const handleFinalizeSplitInvoices = () => {
    playSuccessChime();
    const result = {
      roomInvoice: {
        invoiceNo: `HEI-RM-${initialRoomNo}-401`,
        sacCode: '996311',
        description: 'Room Accommodation / Lodging Allowance',
        taxable: roomTaxableAmount,
        cgst: roomCgst,
        sgst: roomSgst,
        total: roomTotalInvoice,
        corporateName: activeCorp.name,
        gstin: activeCorp.gstin
      },
      restaurantInvoice: {
        invoiceNo: `HEI-FB-${initialRoomNo}-892`,
        sacCode: '996331',
        description: 'F&B Restaurant / Daily Boarding Food Allowance',
        taxable: fbTaxableAmount,
        cgst: fbCgst,
        sgst: fbSgst,
        total: fbTotalInvoice,
        corporateName: activeCorp.name,
        gstin: activeCorp.gstin
      }
    };
    if (onInvoicesGenerated) onInvoicesGenerated(result);
    alert(`✓ Successfully generated 2 distinct corporate tax invoices:\n1. Room Bill: HEI-RM-${initialRoomNo}-401 (₹${roomTotalInvoice.toFixed(2)})\n2. Restaurant Bill: HEI-FB-${initialRoomNo}-892 (₹${fbTotalInvoice.toFixed(2)})\n\nGuest can now claim Accommodation and Food Allowance separately under ${activeCorp.name}!`);
    onClose();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Authentic IDS FortuneNEXT Win32 Dialog Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '1120px', 
          maxWidth: '96vw', 
          height: '670px', 
          maxHeight: '94vh',
          display: 'flex', 
          flexDirection: 'column',
          background: '#ECE9D8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.65)'
        }}
      >
        {/* Win32 Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ids-logo-badge" style={{ background: '#7A1C1C' }}>CORP SPLIT</span>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>
              IDS FortuneNEXT - Corporate Split Billing & Dual Folio Bifurcation (Room vs Food Invoices)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button className="ids-win-btn" onClick={handlePrintActiveInvoice} title="Print Invoice">🖨️</button>
            <button className="ids-win-btn close" onClick={onClose} title="Close (Esc)">✕</button>
          </div>
        </div>

        {/* Corporate Header & Problem Context Ribbon */}
        <div style={{ 
          background: '#FFF7E6', 
          borderBottom: '1px solid #716F64', 
          padding: '6px 12px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#B34700', fontSize: '12px' }}>
              BIFURCATED CORPORATE TAX INVOICES: ROOM LODGING (SAC 996311) vs RESTAURANT FOOD (SAC 996331)
            </div>
            <div style={{ color: '#555', fontSize: '10px' }}>
              Strictly for Corporate Executives (Vedanta Lanjigarh & JK Paper Rayagada) requiring independent hotel vs food allowance claim bills.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ background: '#E0DEC8', padding: '2px 8px', border: '1px solid #999', fontWeight: 700 }}>
              Rm #{initialRoomNo} • {guestName}
            </span>
            <span style={{ background: '#0A246A', color: '#FFF', padding: '2px 8px', borderRadius: '2px', fontWeight: 700 }}>
              Grand Total: ₹{grandConsolidatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Corporate Tagging & Policy Selector Form */}
        <div style={{ 
          padding: '8px 12px', 
          background: '#ECE9D8', 
          borderBottom: '1px solid #ACA899', 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr 1fr', 
          gap: '10px',
          fontSize: '11px' 
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Corporate Entity / Billed To:</label>
            <select 
              className="ids-input" 
              style={{ width: '100%', height: '23px', fontWeight: 600 }}
              value={selectedCorpCode}
              onChange={e => setSelectedCorpCode(e.target.value)}
            >
              {CORPORATE_ENTITIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Corporate GSTIN:</label>
            <input 
              type="text" 
              className="ids-input" 
              style={{ width: '100%', height: '23px', fontWeight: 700, fontFamily: 'monospace' }}
              value={corporateGstin} 
              onChange={e => setCorporateGstin(e.target.value)}
              placeholder="e.g. 21AAACV1234F1Z8"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Employee ID / Staff Code:</label>
            <input 
              type="text" 
              className="ids-input" 
              style={{ width: '100%', height: '23px' }}
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px' }}>Travel Claim / PO Ref #:</label>
            <input 
              type="text" 
              className="ids-input" 
              style={{ width: '100%', height: '23px' }}
              value={claimPoNumber}
              onChange={e => setClaimPoNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Dual Folio Workspace: Split Folio Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#E0DEC8', 
          borderBottom: '1px solid #716F64', 
          padding: '4px 8px 0 8px',
          gap: '4px'
        }}>
          <button 
            onClick={() => setActivePreviewTab('ROOM')}
            style={{ 
              padding: '5px 14px', 
              fontSize: '11px', 
              fontWeight: 700, 
              border: '1px solid #716F64', 
              borderBottom: activePreviewTab === 'ROOM' ? '1px solid #FFF' : '1px solid #716F64',
              background: activePreviewTab === 'ROOM' ? '#FFF' : '#ECE9D8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏨 INVOICE A: Room Accommodation Bill</span>
            <span style={{ background: '#2E7D32', color: '#FFF', padding: '1px 5px', borderRadius: '2px', fontSize: '10px' }}>
              ₹{roomTotalInvoice.toFixed(2)}
            </span>
          </button>

          <button 
            onClick={() => setActivePreviewTab('RESTAURANT')}
            style={{ 
              padding: '5px 14px', 
              fontSize: '11px', 
              fontWeight: 700, 
              border: '1px solid #716F64', 
              borderBottom: activePreviewTab === 'RESTAURANT' ? '1px solid #FFF' : '1px solid #716F64',
              background: activePreviewTab === 'RESTAURANT' ? '#FFF' : '#ECE9D8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🍽️ INVOICE B: Food Allowance / Restaurant Bill</span>
            <span style={{ background: '#C62828', color: '#FFF', padding: '1px 5px', borderRadius: '2px', fontSize: '10px' }}>
              ₹{fbTotalInvoice.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Tab Workspace Body */}
        <div style={{ flex: 1, padding: '10px', background: '#FFF', overflowY: 'auto' }}>
          {activePreviewTab === 'ROOM' ? (
            /* =========================================================================
               TAB A: ROOM ACCOMMODATION TAX INVOICE (SAC 996311)
               ========================================================================= */
            <div style={{ border: '1px solid #999', padding: '14px 18px', background: '#FAFAFA', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#A02020' }}>HOTEL ELITE INN</div>
                  <div style={{ fontSize: '10px', color: '#333' }}>Station Road, Muniguda, Rayagada, Odisha - 765020</div>
                  <div style={{ fontSize: '10px', fontWeight: 600 }}>GSTIN: 21ABCDE1234F1Z5 • State Code: 21</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#003366' }}>TAX INVOICE - ACCOMMODATION</div>
                  <div style={{ fontWeight: 700 }}>Invoice #: HEI-RM-{initialRoomNo}-401</div>
                  <div>Invoice Date: {accountingDate}</div>
                </div>
              </div>

              {/* Billed To Corporate Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#FFF', border: '1px solid #DDD', padding: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#666', fontSize: '10px' }}>BILLED TO (CORPORATE):</div>
                  <div style={{ fontWeight: 800, fontSize: '12px' }}>{activeCorp.name}</div>
                  <div>{activeCorp.address}</div>
                  <div><strong>Corporate GSTIN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activeCorp.gstin}</span></div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#666', fontSize: '10px' }}>GUEST & STAY DETAILS:</div>
                  <div><strong>Guest:</strong> {guestName} (Room #{initialRoomNo})</div>
                  <div><strong>Employee ID:</strong> {employeeId}</div>
                  <div><strong>Claim PO Ref:</strong> {claimPoNumber}</div>
                  <div><strong>Nights:</strong> {roomNights} Night(s) @ ₹{roomTariffPerNight.toFixed(2)}/night</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '12px' }} border="1" cellPadding="6">
                <thead>
                  <tr style={{ background: '#ECE9D8' }}>
                    <th style={{ width: '40px' }}>Sl.</th>
                    <th>Description of Service</th>
                    <th style={{ width: '80px' }}>SAC Code</th>
                    <th style={{ width: '50px' }}>Qty</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Tariff/Night</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Taxable Amt</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>CGST ({roomGstPercent/2}%)</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>SGST ({roomGstPercent/2}%)</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td>
                      <strong>Room Accommodation Charges - Deluxe Executive</strong><br />
                      <span style={{ fontSize: '10px', color: '#555' }}>
                        Eligible for Corporate Hotel Lodging Claim (Vedanta / JK Paper policy)
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>996311</td>
                    <td style={{ textAlign: 'center' }}>{roomNights}</td>
                    <td style={{ textAlign: 'right' }}>₹{roomTariffPerNight.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{roomTaxableAmount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{roomCgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{roomSgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0A246A' }}>₹{roomTotalInvoice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', border: '1px solid #716F64', background: '#FFF', padding: '6px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Taxable Value:</span>
                    <span>₹{roomTaxableAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>CGST ({roomGstPercent/2}%):</span>
                    <span>₹{roomCgst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>SGST ({roomGstPercent/2}%):</span>
                    <span>₹{roomSgst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '4px', fontWeight: 800, fontSize: '12px', color: '#2E7D32' }}>
                    <span>Invoice Total:</span>
                    <span>₹{roomTotalInvoice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               TAB B: RESTAURANT / FOOD ALLOWANCE TAX INVOICE (SAC 996331)
               ========================================================================= */
            <div style={{ border: '1px solid #999', padding: '14px 18px', background: '#FAFAFA', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#A02020' }}>HOTEL ELITE INN • ELITE RESTAURANT</div>
                  <div style={{ fontSize: '10px', color: '#333' }}>Station Road, Muniguda, Rayagada, Odisha - 765020</div>
                  <div style={{ fontSize: '10px', fontWeight: 600 }}>GSTIN: 21ABCDE1234F1Z5 • F&B SAC: 996331 (5% Standalone)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#990000' }}>TAX INVOICE - FOOD & RESTAURANT</div>
                  <div style={{ fontWeight: 700 }}>Invoice #: HEI-FB-{initialRoomNo}-892</div>
                  <div>Invoice Date: {accountingDate}</div>
                </div>
              </div>

              {/* Billed To Corporate Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#FFF', border: '1px solid #DDD', padding: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#666', fontSize: '10px' }}>BILLED TO (CORPORATE):</div>
                  <div style={{ fontWeight: 800, fontSize: '12px' }}>{activeCorp.name}</div>
                  <div>{activeCorp.address}</div>
                  <div><strong>Corporate GSTIN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activeCorp.gstin}</span></div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#666', fontSize: '10px' }}>FOOD ALLOWANCE BENEFICIARY:</div>
                  <div><strong>Employee Name:</strong> {guestName}</div>
                  <div><strong>Employee ID:</strong> {employeeId}</div>
                  <div><strong>Claim PO Ref:</strong> {claimPoNumber}</div>
                  <div><strong>Claim Head:</strong> Daily Food & Boarding Allowance</div>
                </div>
              </div>

              {/* Itemized F&B Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '12px' }} border="1" cellPadding="6">
                <thead>
                  <tr style={{ background: '#ECE9D8' }}>
                    <th style={{ width: '35px' }}>Sl.</th>
                    <th style={{ width: '60px' }}>Code</th>
                    <th>Food & Dining Description</th>
                    <th style={{ width: '75px' }}>SAC</th>
                    <th style={{ width: '40px' }}>Qty</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Rate</th>
                    <th style={{ width: '85px', textAlign: 'right' }}>Taxable Amt</th>
                    <th style={{ width: '65px', textAlign: 'right' }}>CGST (2.5%)</th>
                    <th style={{ width: '65px', textAlign: 'right' }}>SGST (2.5%)</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {fbItems.map((item, idx) => {
                    const lineVal = item.qty * item.rate;
                    const cgst = (lineVal * 0.025);
                    const sgst = (lineVal * 0.025);
                    const lineTotal = lineVal + cgst + sgst;
                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{item.code}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>996331</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.rate.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{lineVal.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>₹{cgst.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>₹{sgst.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', border: '1px solid #716F64', background: '#FFF', padding: '6px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Food Taxable Value:</span>
                    <span>₹{fbTaxableAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>CGST (2.5%):</span>
                    <span>₹{fbCgst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>SGST (2.5%):</span>
                    <span>₹{fbSgst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '4px', fontWeight: 800, fontSize: '12px', color: '#C62828' }}>
                    <span>Restaurant Bill Total:</span>
                    <span>₹{fbTotalInvoice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Win32 Bottom Command Actions */}
        <div className="ids-dialog-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8', padding: '6px 12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '130px', background: '#316AC5', color: '#FFF' }}
              onClick={handleFinalizeSplitInvoices}
            >
              ✓ Generate 2 Invoices
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '100px', background: '#FFF7CC' }}
              onClick={handlePrintActiveInvoice}
            >
              🖨️ Print Active Bill
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={onClose}>
              Close (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
