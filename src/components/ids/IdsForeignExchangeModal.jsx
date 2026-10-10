import React, { useState } from 'react';
import './idsFortuneNext.css';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { 
  Globe, DollarSign, Printer, CheckCircle2, 
  Search, ShieldCheck, ArrowRight, RefreshCw, 
  FileText, Plus, Trash2, Check, X, AlertCircle
} from 'lucide-react';

/* =========================================================================
   VIDEO 42: HOW TO DO FOREIGN EXCHANGE ENTRY IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Foreign Exchange Entry V6.5.002.2 (Frames 018–074)
   2. Entry Points (Frames 006 & 018):
      - Reports.. -> Foreign Exchange Entry (RBI Encashment)
      - Cashiering.. -> Foreign Currency Encashment (Forex Entry)
      - Quick Scan (Load Pgm) -> Type "foreign exchange" or "forex" -> [ Load ]
      - 44-Video Tutorial Player -> Video 42 -> Launch Interactive Feature Clone
   3. Header Controls (Frames 018–048):
      - Currency: United States of Dollar (USD - 77.75), Euro (EUR - 85.50), GBP (99.20), AED (21.15)
      - Particulars: Money Exchange
      - Exg. Amount: 2,000.00 | Voucher: 3 with [ ? ] lookup
      - Encashment #: ENC/2026/003 | Accounting Date: 17-MAR-2026
      - [ Reprint ] button
   4. Guest KYC & Passport Profile (Frame 048):
      - Room#: 1002 / 201 | Name: Mr Gomes | Passport #: S1234567
      - Nationality: USA | Address: New York, USA
      - Outlet: FO | Bill Amount: 0.00 | Paid out: 0.00
   5. Denomination Breakdown Matrix (Frame 074):
      - Quantity: 20 | Description: Hundred Dollars | Denomination: 100.00 | [ Confirm ]
      - Table: 20 | Hundred Dollars | 100.00 | $2,000.00 | ₹1,55,500.00 INR
   6. Monetary Computation (Frame 074):
      - Amount Received: $2,000.00 | Exchange Rate: 77.750000 | Value: ₹1,55,500.00
      - Tax Amount: ₹319.96 (GST Rule 32(2)) | Net Amount: ₹1,55,500.00 INR
   7. Encashment Certificate Printout (RBI Form ECF / Hotel FFMC Licence):
      - Authentic statutory Foreign Currency Encashment Certificate
   ========================================================================= */

export const CURRENCY_RATES = {
  'USD': { name: 'United States of Dollar', symbol: '$', rate: 77.750000 },
  'EUR': { name: 'Euro', symbol: '€', rate: 85.500000 },
  'GBP': { name: 'Pound Sterling', symbol: '£', rate: 99.200000 },
  'AED': { name: 'UAE Dirham', symbol: 'AED', rate: 21.150000 },
  'SGD': { name: 'Singapore Dollar', symbol: 'S$', rate: 57.250000 },
  'AUD': { name: 'Australian Dollar', symbol: 'A$', rate: 55.400000 },
  'CAD': { name: 'Canadian Dollar', symbol: 'C$', rate: 60.800000 }
};

export const INITIAL_ENCASHMENTS_DATABASE = [
  {
    voucherNo: '3',
    encashmentNo: 'ENC/2026/003',
    accountingDate: '17-MAR-2026',
    currencyCode: 'USD',
    currencyName: 'United States of Dollar',
    roomNo: '1002',
    guestName: 'Mr Gomes',
    passportNo: 'S1234567',
    nationality: 'USA',
    address: 'New York, USA',
    particulars: 'Money Exchange',
    exchangeRate: 77.750000,
    amountReceived: 2000.00,
    denominations: [
      { quantity: 20, description: 'Hundred Dollars', denomination: 100.00, amount: 2000.00, localAmount: 155500.00 }
    ],
    grossValueInr: 155500.00,
    taxAmountInr: 319.96,
    commissionInr: 0.00,
    netPaidInr: 155500.00,
    cashier: 'IT ADMIN',
    status: 'Active'
  },
  {
    voucherNo: '2',
    encashmentNo: 'ENC/2026/002',
    accountingDate: '16-MAR-2026',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    roomNo: '201',
    guestName: 'Mr David Miller',
    passportNo: 'P8832109',
    nationality: 'GBR',
    address: 'London, United Kingdom',
    particulars: 'Foreign Currency Encashment',
    exchangeRate: 85.500000,
    amountReceived: 500.00,
    denominations: [
      { quantity: 10, description: 'Fifty Euros', denomination: 50.00, amount: 500.00, localAmount: 42750.00 }
    ],
    grossValueInr: 42750.00,
    taxAmountInr: 88.00,
    commissionInr: 0.00,
    netPaidInr: 42750.00,
    cashier: 'MANAGER',
    status: 'Active'
  }
];

export default function IdsForeignExchangeModal({
  isOpen,
  onClose,
  accountingDate = '17-MAR-2026',
  onOpenCrystalReport
}) {
  const [encashmentsList, setEncashmentsList] = useState(INITIAL_ENCASHMENTS_DATABASE);
  const [selectedVoucher, setSelectedVoucher] = useState(INITIAL_ENCASHMENTS_DATABASE[0]);

  // Form State matching Frames 018 & 048
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [particulars, setParticulars] = useState('Money Exchange');
  const [voucherNo, setVoucherNo] = useState('3');
  const [encashmentNo, setEncashmentNo] = useState('ENC/2026/003');
  const [roomNo, setRoomNo] = useState('1002');
  const [guestName, setGuestName] = useState('Mr Gomes');
  const [passportNo, setPassportNo] = useState('S1234567');
  const [nationality, setNationality] = useState('USA');
  const [address, setAddress] = useState('New York, USA');
  
  // Denomination Grid state matching Frame 074
  const [inputQty, setInputQty] = useState('20');
  const [inputDesc, setInputDesc] = useState('Hundred Dollars');
  const [inputDenom, setInputDenom] = useState('100.00');
  const [denominations, setDenominations] = useState([
    { quantity: 20, description: 'Hundred Dollars', denomination: 100.00, amount: 2000.00, localAmount: 155500.00 }
  ]);

  // Sub-dialogs
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const currentRateObj = CURRENCY_RATES[currencyCode] || CURRENCY_RATES['USD'];
  const exchangeRate = currentRateObj.rate;

  // Calculate totals from denominations
  const totalForeignAmount = denominations.reduce((sum, d) => sum + d.amount, 0);
  const grossInrValue = totalForeignAmount * exchangeRate;
  const gstTaxAmount = Math.min(Math.max(grossInrValue * 0.0018, 45), 5000) * 0.18; // Rule 32(2) Forex GST
  const netPaidInr = grossInrValue;

  // Add denomination line item
  const handleAddDenomination = () => {
    const qty = parseInt(inputQty, 10) || 1;
    const denom = parseFloat(inputDenom) || 100.0;
    const amount = qty * denom;
    const localAmount = amount * exchangeRate;

    const newItem = {
      quantity: qty,
      description: inputDesc || `${denom} ${currencyCode}`,
      denomination: denom,
      amount,
      localAmount
    };

    setDenominations(prev => [...prev, newItem]);
    setInputQty('1');
    setInputDesc('');
  };

  // Save Encashment Entry
  const handleSaveEncashment = () => {
    const newRecord = {
      voucherNo,
      encashmentNo: `ENC/2026/00${voucherNo}`,
      accountingDate,
      currencyCode,
      currencyName: currentRateObj.name,
      roomNo,
      guestName,
      passportNo,
      nationality,
      address,
      particulars,
      exchangeRate,
      amountReceived: totalForeignAmount,
      denominations,
      grossValueInr: grossInrValue,
      taxAmountInr: gstTaxAmount,
      commissionInr: 0.00,
      netPaidInr,
      cashier: 'IT ADMIN',
      status: 'Active'
    };

    setEncashmentsList(prev => {
      const idx = prev.findIndex(e => e.voucherNo === voucherNo);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [newRecord, ...prev];
    });

    setSelectedVoucher(newRecord);
    setStatusMessage(`Encashment Voucher #${voucherNo} for ${guestName} (${currentRateObj.symbol}${totalForeignAmount.toFixed(2)} = ₹${netPaidInr.toFixed(2)}) saved successfully!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '820px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 42 Frame 018 */}
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
            <Globe size={14} />
            <span>Foreign Exchange Entry V6.5.002.2 — RBI Currency Encashment</span>
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

        {/* Main Content Form matching Video 42 Frame 018 & Frame 048 */}
        <div style={{ padding: '12px 16px', fontSize: '11px' }}>
          
          {/* Top Currency & Voucher Controls */}
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 12px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 180px 70px 100px 90px 1fr', gap: '6px 10px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 600 }}>Currency</span>
              <select 
                className="ids-input" 
                value={currencyCode} 
                onChange={(e) => setCurrencyCode(e.target.value)}
                style={{ fontWeight: 700, background: '#FFF7CC' }}
              >
                {Object.keys(CURRENCY_RATES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCY_RATES[code].name} ({code})
                  </option>
                ))}
              </select>

              <span style={{ fontWeight: 600 }}>Voucher</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} style={{ width: '45px', fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ width: '22px' }} onClick={() => setBrowseModalOpen(true)}>?</button>
              </div>

              <span style={{ fontWeight: 600 }}>Accounting Date</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input className="ids-input" value={accountingDate} readOnly style={{ width: '95px', fontWeight: 700 }} />
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#DCE6F1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setCertificateModalOpen(true)}
                >
                  <Printer size={11} /> Reprint
                </button>
              </div>

              <span style={{ fontWeight: 600 }}>Particulars</span>
              <input className="ids-input" value={particulars} onChange={(e) => setParticulars(e.target.value)} style={{ width: '100%', fontWeight: 600 }} />

              <span style={{ fontWeight: 600 }}>Encashment #</span>
              <input className="ids-input" value={encashmentNo} readOnly style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />

              <span style={{ fontWeight: 600 }}>Exg. Amount</span>
              <input className="ids-input" value={totalForeignAmount.toFixed(2)} readOnly style={{ width: '100px', fontWeight: 900, color: '#0A246A', background: '#FFF7CC' }} />
            </div>
          </div>

          {/* Middle Columns: Left (Guest Profile) & Right (Denominations Table) */}
          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '10px', marginBottom: '8px' }}>
            
            {/* Left: Guest Profile & Passport Info matching Frame 048 */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px' }}>
              <div style={{ fontWeight: 700, color: '#0A246A', borderBottom: '1px solid #CCC', paddingBottom: '3px', marginBottom: '6px' }}>
                Guest Profile & KYC Passport Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '75px 1fr', gap: '4px 6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Room#</span>
                <input className="ids-input" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} style={{ width: '70px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Name</span>
                <input className="ids-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} style={{ width: '100%', fontWeight: 700, background: '#FFF7CC' }} />

                <span style={{ fontWeight: 600 }}>Passport #</span>
                <input className="ids-input" value={passportNo} onChange={(e) => setPassportNo(e.target.value)} style={{ width: '100%', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Outlet</span>
                <input className="ids-input" value="FO" readOnly style={{ width: '40px' }} />

                <span style={{ fontWeight: 600 }}>Nationality</span>
                <input className="ids-input" value={nationality} onChange={(e) => setNationality(e.target.value)} style={{ width: '70px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Address</span>
                <input className="ids-input" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>Bill Amount</span>
                <input className="ids-input" value="0.00" readOnly style={{ width: '80px' }} />

                <span style={{ fontWeight: 600 }}>Paid out</span>
                <input className="ids-input" value="0.00" readOnly style={{ width: '80px' }} />
              </div>
            </div>

            {/* Right: Currency Denominations & Local Amount Table matching Frame 074 */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px' }}>
              
              {/* Denomination Add Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '55px 130px 85px 1fr', gap: '4px 6px', alignItems: 'center', marginBottom: '6px', background: '#ECE9D8', padding: '4px 6px', border: '1px solid #CCC' }}>
                <input className="ids-input" placeholder="Qty" value={inputQty} onChange={(e) => setInputQty(e.target.value)} style={{ width: '100%', fontWeight: 700 }} />
                <input className="ids-input" placeholder="Description" value={inputDesc} onChange={(e) => setInputDesc(e.target.value)} style={{ width: '100%' }} />
                <input className="ids-input" placeholder="Denom" value={inputDenom} onChange={(e) => setInputDenom(e.target.value)} style={{ width: '100%', fontWeight: 700 }} />
                <button className="ids-btn-classic" onClick={handleAddDenomination} style={{ fontWeight: 700 }}>
                  Confirm
                </button>
              </div>

              {/* Denomination Table Grid */}
              <div style={{ height: '110px', overflowY: 'auto', background: '#FFF', border: '1px solid #CCC', marginBottom: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                    <tr>
                      <th style={{ padding: '2px 4px', textAlign: 'left', width: '35px', borderRight: '1px solid #B0AB9A' }}>Qty</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                      <th style={{ padding: '2px 4px', textAlign: 'right', width: '60px', borderRight: '1px solid #B0AB9A' }}>Denom</th>
                      <th style={{ padding: '2px 4px', textAlign: 'right', width: '70px', borderRight: '1px solid #B0AB9A' }}>Amount</th>
                      <th style={{ padding: '2px 4px', textAlign: 'right', width: '85px' }}>Local (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {denominations.map((d, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '2px 4px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{d.quantity}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #E0E0E0' }}>{d.description}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>{d.denomination.toFixed(2)}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>
                          {currentRateObj.symbol}{d.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700, color: '#137333' }}>
                          ₹{d.localAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sub-Total / Subtitle Note from Video 42 Frame 048 */}
              <div style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>
                E.g.: 20 Notes of $100 each, Total is $2000.00 = ₹1,55,500.00 INR
              </div>

            </div>

          </div>

          {/* Bottom Monetary Summary matching Frame 074 */}
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '6px 12px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 110px 100px 120px 90px 1fr', gap: '4px 8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Amount Received</span>
              <input className="ids-input" value={`${currentRateObj.symbol}${totalForeignAmount.toFixed(2)}`} readOnly style={{ width: '100px', fontWeight: 900, color: '#0A246A' }} />

              <span style={{ fontWeight: 600 }}>Total (INR)</span>
              <input className="ids-input" value={`₹${grossInrValue.toFixed(2)}`} readOnly style={{ width: '110px', fontWeight: 900, color: '#0A246A' }} />

              <span style={{ fontWeight: 600 }}>Exchange Rate</span>
              <input className="ids-input" value={exchangeRate.toFixed(6)} readOnly style={{ width: '90px', fontWeight: 700 }} />

              <span style={{ fontWeight: 600 }}>GST Tax (Rule 32)</span>
              <input className="ids-input" value={`₹${gstTaxAmount.toFixed(2)}`} readOnly style={{ width: '80px', color: '#C5221F' }} />

              <span style={{ fontWeight: 600 }}>Less Commission</span>
              <input className="ids-input" value="0.00" readOnly style={{ width: '70px' }} />

              <span style={{ fontWeight: 600 }}>Net Paid to Guest</span>
              <input className="ids-input" value={`₹${netPaidInr.toFixed(2)}`} readOnly style={{ width: '130px', fontWeight: 900, color: '#137333', background: '#FFF7CC', fontSize: '12px' }} />
            </div>
          </div>

          {/* Bottom Action Ribbon matching Frame 018 */}
          <div 
            style={{ 
              background: '#D4D0C8', 
              border: '1px solid #808080', 
              padding: '6px 10px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button 
              className="ids-btn-classic" 
              style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setCertificateModalOpen(true)}
            >
              <FileText size={12} /> Print RBI Encashment Certificate (Form ECF)
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={() => {
                  playReceptionChime();
                  alert("Ready to enter new Foreign Exchange Encashment transaction.");
                }}
              >Add</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={() => {
                  playReceptionChime();
                  alert("Foreign Currency Exchange Record loaded for modification.");
                }}
              >Modify</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={() => {
                  playReceptionChime();
                  alert("Selected Foreign Exchange entry deleted from cashier session.");
                }}
              >Delete</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => setBrowseModalOpen(true)}>Browse</button>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '65px', background: '#DCE6F1' }}
                onClick={handleSaveEncashment}
              >
                Save
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={() => {
                  playReceptionChime();
                  alert("Forex Cashier Control Panel: Total USD $2,000.00 encashed today.");
                }}
              >Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RBI FORM ECF: FOREIGN CURRENCY ENCASHMENT CERTIFICATE MODAL
            ========================================================================= */}
        {certificateModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setCertificateModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '96vw', background: '#FFF', border: '2px solid #000', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#0A246A', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>RBI Form ECF — Certificate of Encashment of Foreign Currency</span>
                <button className="ids-win-btn close" onClick={() => setCertificateModalOpen(false)}>✕</button>
              </div>

              {/* Statutory Certificate Print Preview */}
              <div style={{ padding: '16px 20px', fontSize: '11px', color: '#111', fontFamily: 'monospace' }}>
                
                <div style={{ textAlign: 'center', borderBottom: '2px double #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900 }}>HOTEL ELITE INN</div>
                  <div style={{ fontSize: '10px' }}>Opposite Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) - 765020</div>
                  <div style={{ fontSize: '10px' }}>RBI AUTHORIZED MONEY CHANGER (FFMC) • Licence No: RL/BBSR/2026/1084 | GSTIN: 21AEWFS9433F1ZN</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, marginTop: '4px', textDecoration: 'underline' }}>
                    CERTIFICATE OF ENCASHMENT (FORM E.C.F.)
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div><strong>Encashment Slip #:</strong> {encashmentNo}</div>
                  <div><strong>Date:</strong> {accountingDate}</div>
                </div>

                <div style={{ border: '1px solid #000', padding: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '4px' }}>
                    <div><strong>Guest Name:</strong></div>
                    <div>{guestName} (Room {roomNo})</div>
                    <div><strong>Passport Number:</strong></div>
                    <div>{passportNo} ({nationality})</div>
                    <div><strong>Address Abroad:</strong></div>
                    <div>{address}</div>
                    <div><strong>Foreign Currency:</strong></div>
                    <div style={{ fontWeight: 700 }}>{currentRateObj.name} ({currencyCode})</div>
                    <div><strong>Amount Encash:</strong></div>
                    <div style={{ fontWeight: 700 }}>{currentRateObj.symbol}{totalForeignAmount.toFixed(2)}</div>
                    <div><strong>Conversion Rate:</strong></div>
                    <div>1 {currencyCode} = ₹{exchangeRate.toFixed(4)} INR</div>
                    <div><strong>Gross Equivalent:</strong></div>
                    <div>₹{grossInrValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div><strong>GST under Rule 32:</strong></div>
                    <div>₹{gstTaxAmount.toFixed(2)}</div>
                    <div><strong>Net INR Paid to Guest:</strong></div>
                    <div style={{ fontWeight: 900, fontSize: '12px' }}>₹{netPaidInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div style={{ fontSize: '9.5px', color: '#444', marginBottom: '14px', lineHeight: '1.3' }}>
                  * We hereby certify that we have purchased foreign currency from the person named above and paid in Indian Rupees at the approved RBI market rate in full compliance with FEMA regulations.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #666' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '140px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                    <div>Guest Signature</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '140px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                    <div>Authorized Cashier (IT ADMIN)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '16px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, background: '#DCE6F1' }} 
                    onClick={() => {
                      if (onOpenCrystalReport) {
                        onOpenCrystalReport('forex', {
                          certNo: encashmentNo,
                          guestName,
                          nationality,
                          passportNo,
                          roomNo,
                          currency: currencyCode,
                          foreignAmount: totalForeignAmount,
                          exchangeRate,
                          grossInr: grossInrValue,
                          commissionPct: 0,
                          commissionAmount: gstTaxAmount,
                          netInrPaid: netPaidInr
                        });
                        setCertificateModalOpen(false);
                      } else {
                        window.print();
                      }
                    }}
                  >
                    Crystal Reports Print
                  </button>
                  <button className="ids-btn-classic" onClick={() => window.print()}>
                    Quick Print
                  </button>
                  <button className="ids-btn-classic" onClick={() => setCertificateModalOpen(false)}>
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            BROWSE LOOKUP MODAL
            ========================================================================= */}
        {browseModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBrowseModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '600px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Foreign Exchange Vouchers Help</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>Voucher</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '70px', borderRight: '1px solid #B0AB9A' }}>Room#</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>Cur</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '70px', borderRight: '1px solid #B0AB9A' }}>Amount</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '85px' }}>Net INR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {encashmentsList.map((e, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setVoucherNo(e.voucherNo);
                            setEncashmentNo(e.encashmentNo);
                            setCurrencyCode(e.currencyCode);
                            setParticulars(e.particulars);
                            setRoomNo(e.roomNo);
                            setGuestName(e.guestName);
                            setPassportNo(e.passportNo);
                            setNationality(e.nationality);
                            setAddress(e.address);
                            setDenominations(e.denominations);
                            setSelectedVoucher(e);
                            setBrowseModalOpen(false);
                          }}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{e.voucherNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{e.roomNo}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{e.guestName}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{e.currencyCode}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>{e.amountReceived.toFixed(2)}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#137333' }}>₹{e.netPaidInr.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setBrowseModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
