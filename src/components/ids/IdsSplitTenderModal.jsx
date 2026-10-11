import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  CreditCard, Banknote, QrCode, Building, Check, X, 
  RotateCcw, DollarSign, Calculator, AlertCircle, ShieldCheck
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

export default function IdsSplitTenderModal({
  isOpen,
  onClose,
  billNo = 'RES-B-4500',
  tableOrRoom = 'Table 14 / Room 206',
  guestName = 'Mr. Anil Kumar (JK Paper)',
  totalBillAmount = 4500.00,
  accountingDate = '11-OCT-2026',
  onSettlementComplete
}) {
  // Pre-configured split amounts matching user's exact scenario:
  // Bill ₹4,500 = ₹2,000 UPI + ₹1,500 Card + ₹1,000 Cash
  const [tenders, setTenders] = useState({
    upi: {
      enabled: true,
      amount: 2000.00,
      provider: 'PhonePe QR',
      refNo: 'UPI-98214490812'
    },
    card: {
      enabled: true,
      amount: 1500.00,
      bank: 'State Bank Of India (SBI)',
      cardLast4: '4821',
      authCode: 'AUTH-7712'
    },
    cash: {
      enabled: true,
      amount: 1000.00,
      received: 1000.00,
      changeReturn: 0.00
    },
    companyLedger: {
      enabled: false,
      amount: 0.00,
      company: 'JK Paper Mills Ltd',
      ref: ''
    }
  });

  const totalTendered = useMemo(() => {
    let sum = 0;
    if (tenders.upi.enabled) sum += Number(tenders.upi.amount) || 0;
    if (tenders.card.enabled) sum += Number(tenders.card.amount) || 0;
    if (tenders.cash.enabled) sum += Number(tenders.cash.amount) || 0;
    if (tenders.companyLedger.enabled) sum += Number(tenders.companyLedger.amount) || 0;
    return Number(sum.toFixed(2));
  }, [tenders]);

  const balanceDue = useMemo(() => {
    return Number((totalBillAmount - totalTendered).toFixed(2));
  }, [totalBillAmount, totalTendered]);

  const isBalanced = Math.abs(balanceDue) < 0.01;

  if (!isOpen) return null;

  const handleUpdateUpi = (field, val) => {
    setTenders(prev => ({
      ...prev,
      upi: { ...prev.upi, [field]: val }
    }));
  };

  const handleUpdateCard = (field, val) => {
    setTenders(prev => ({
      ...prev,
      card: { ...prev.card, [field]: val }
    }));
  };

  const handleUpdateCash = (field, val) => {
    setTenders(prev => {
      const updated = { ...prev.cash, [field]: val };
      if (field === 'received' || field === 'amount') {
        const rec = field === 'received' ? Number(val) || 0 : Number(prev.cash.received) || 0;
        const amt = field === 'amount' ? Number(val) || 0 : Number(prev.cash.amount) || 0;
        updated.changeReturn = Math.max(0, rec - amt);
      }
      return { ...prev, cash: updated };
    });
  };

  const handleConfirmSettlement = () => {
    if (!isBalanced) {
      alert(`Cannot Settle: Total Tendered (₹${totalTendered.toFixed(2)}) must exactly equal Bill Amount (₹${totalBillAmount.toFixed(2)})!\nRemaining Balance Due: ₹${balanceDue.toFixed(2)}`);
      return;
    }
    playSuccessChime();
    const settlementData = {
      billNo,
      totalBillAmount,
      totalTendered,
      splits: [
        { mode: 'UPI', amount: tenders.upi.amount, ref: tenders.upi.refNo, provider: tenders.upi.provider },
        { mode: 'Card', amount: tenders.card.amount, ref: tenders.card.authCode, bank: tenders.card.bank, cardNo: tenders.card.cardLast4 },
        { mode: 'Cash', amount: tenders.cash.amount, received: tenders.cash.received, change: tenders.cash.changeReturn }
      ],
      settledAt: new Date().toISOString(),
      accountingDate
    };

    if (onSettlementComplete) onSettlementComplete(settlementData);
    alert(`✓ Bill No. ${billNo} Successfully Settled via Split Tender!\n• UPI: ₹${tenders.upi.amount.toFixed(2)}\n• Card: ₹${tenders.card.amount.toFixed(2)}\n• Cash: ₹${tenders.cash.amount.toFixed(2)}\n\nRespective Accounts & Cash Drawers credited accurately.`);
    onClose();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
      {/* Authentic IDS FortuneNEXT Win32 Dialog Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '840px', 
          maxWidth: '96vw', 
          background: '#ECE9D8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.65)'
        }}
      >
        {/* Win32 Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ids-logo-badge" style={{ background: '#2E7D32' }}>MULTI-PAY</span>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>
              IDS FortuneNEXT V6.5 - Split-Tender Settlement (Multi-Pay Mode) [Audio 4: 57:31-68:45]
            </span>
          </div>
          <button className="ids-win-btn close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        {/* Bill Summary Banner */}
        <div style={{ 
          background: '#FFF', 
          borderBottom: '1px solid #716F64', 
          padding: '8px 14px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0A246A' }}>
              Bill #{billNo} • {tableOrRoom}
            </div>
            <div style={{ color: '#555', fontSize: '10px' }}>
              Guest: <strong>{guestName}</strong> • Accounting Date: {accountingDate}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#666', fontWeight: 600 }}>NET PAYABLE AMOUNT:</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#C62828' }}>
              ₹{totalBillAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Split Tender Input Matrix */}
        <div style={{ padding: '10px 14px', fontSize: '11px' }}>
          <div style={{ 
            background: '#E8F5E9', 
            border: '1px solid #A5D6A7', 
            padding: '6px 10px', 
            marginBottom: '10px',
            fontSize: '10.5px',
            color: '#1B5E20'
          }}>
            💡 <strong>Multi-Pay Settlement:</strong> Split the total ₹{totalBillAmount.toFixed(2)} across multiple payment modes (e.g., ₹2,000 UPI + ₹1,500 Card + ₹1,000 Cash).
          </div>

          {/* MODE 1: UPI / QR PAYMENT */}
          <fieldset style={{ border: '1px solid #7F9DB9', padding: '8px 12px', marginBottom: '8px', background: '#FFF' }}>
            <legend style={{ fontWeight: 700, color: '#0A246A', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📱 Tender 1: UPI / QR (PhonePe / Google Pay / BHIM)</span>
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 180px 1fr', gap: '8px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Amount (₹):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="ids-input" 
                  style={{ width: '100%', fontWeight: 700, fontSize: '12px', textAlign: 'right' }}
                  value={tenders.upi.amount} 
                  onChange={e => handleUpdateUpi('amount', Number(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>UPI Platform / QR:</label>
                <select 
                  className="ids-input" 
                  style={{ width: '100%' }}
                  value={tenders.upi.provider}
                  onChange={e => handleUpdateUpi('provider', e.target.value)}
                >
                  <option value="PhonePe QR">PhonePe Counter QR</option>
                  <option value="Google Pay (GPay)">Google Pay (GPay)</option>
                  <option value="Paytm Soundbox">Paytm Soundbox QR</option>
                  <option value="BHIM UPI">BHIM / Static QR</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>UTR / Reference Number:</label>
                <input 
                  type="text" 
                  placeholder="e.g. 98214490812"
                  className="ids-input" 
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  value={tenders.upi.refNo} 
                  onChange={e => handleUpdateUpi('refNo', e.target.value)} 
                />
              </div>
            </div>
          </fieldset>

          {/* MODE 2: CREDIT / DEBIT CARD */}
          <fieldset style={{ border: '1px solid #7F9DB9', padding: '8px 12px', marginBottom: '8px', background: '#FFF' }}>
            <legend style={{ fontWeight: 700, color: '#6A1B9A', padding: '0 4px' }}>
              💳 Tender 2: Credit / Debit Card (Swipe Machine)
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 180px 100px 1fr', gap: '8px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Amount (₹):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="ids-input" 
                  style={{ width: '100%', fontWeight: 700, fontSize: '12px', textAlign: 'right' }}
                  value={tenders.card.amount} 
                  onChange={e => handleUpdateCard('amount', Number(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Merchant POS Bank:</label>
                <select 
                  className="ids-input" 
                  style={{ width: '100%' }}
                  value={tenders.card.bank}
                  onChange={e => handleUpdateCard('bank', e.target.value)}
                >
                  <option value="State Bank Of India (SBI)">State Bank Of India (SBI)</option>
                  <option value="HDFC Bank Ltd.">HDFC Bank Ltd.</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Last 4 Digits:</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="4821"
                  className="ids-input" 
                  style={{ width: '100%', textAlign: 'center', fontFamily: 'monospace' }}
                  value={tenders.card.cardLast4} 
                  onChange={e => handleUpdateCard('cardLast4', e.target.value)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>POS Auth Code:</label>
                <input 
                  type="text" 
                  placeholder="AUTH-7712"
                  className="ids-input" 
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  value={tenders.card.authCode} 
                  onChange={e => handleUpdateCard('authCode', e.target.value)} 
                />
              </div>
            </div>
          </fieldset>

          {/* MODE 3: CASH PAYMENT */}
          <fieldset style={{ border: '1px solid #7F9DB9', padding: '8px 12px', marginBottom: '8px', background: '#FFF' }}>
            <legend style={{ fontWeight: 700, color: '#2E7D32', padding: '0 4px' }}>
              💵 Tender 3: Cash (Physical Currency / Cash Drawer)
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 130px 1fr', gap: '8px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Amount to Apply (₹):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="ids-input" 
                  style={{ width: '100%', fontWeight: 700, fontSize: '12px', textAlign: 'right' }}
                  value={tenders.cash.amount} 
                  onChange={e => handleUpdateCash('amount', Number(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Cash Received (₹):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="ids-input" 
                  style={{ width: '100%', textAlign: 'right' }}
                  value={tenders.cash.received} 
                  onChange={e => handleUpdateCash('received', Number(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>Change Return (₹):</label>
                <input 
                  type="text" 
                  readOnly 
                  className="ids-input" 
                  style={{ width: '100%', background: '#F5F5F5', textAlign: 'right', fontWeight: 700, color: '#C62828' }}
                  value={`₹${tenders.cash.changeReturn.toFixed(2)}`} 
                />
              </div>
              <div style={{ fontSize: '10px', color: '#666', paddingTop: '14px' }}>
                * Credited directly to Reception Cash Drawer shift ledger.
              </div>
            </div>
          </fieldset>

          {/* Mathematical Reconciliation Box */}
          <div style={{ 
            background: isBalanced ? '#E8F5E9' : '#FFEBEE', 
            border: `1px solid ${isBalanced ? '#81C784' : '#E57373'}`, 
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '11px', color: isBalanced ? '#2E7D32' : '#C62828' }}>
                {isBalanced ? '✓ TENDERS FULLY RECONCILED (BALANCE ₹0.00)' : `⚠️ DISCREPANCY: BALANCE DUE ₹${balanceDue.toFixed(2)}`}
              </div>
              <div style={{ fontSize: '10px', color: '#444' }}>
                UPI: ₹{tenders.upi.amount.toFixed(2)} + Card: ₹{tenders.card.amount.toFixed(2)} + Cash: ₹{tenders.cash.amount.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#666' }}>Total Tendered: </span>
                <strong style={{ fontSize: '14px' }}>₹{totalTendered.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#666' }}>Balance Remaining: </span>
                <strong style={{ fontSize: '14px', color: isBalanced ? '#2E7D32' : '#C62828' }}>
                  ₹{balanceDue.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Win32 Bottom Command Actions */}
        <div className="ids-dialog-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8', padding: '8px 12px' }}>
          <div>
            <button 
              className="ids-btn-classic" 
              onClick={() => {
                setTenders({
                  upi: { enabled: true, amount: 2000.00, provider: 'PhonePe QR', refNo: 'UPI-98214490812' },
                  card: { enabled: true, amount: 1500.00, bank: 'State Bank Of India (SBI)', cardLast4: '4821', authCode: 'AUTH-7712' },
                  cash: { enabled: true, amount: 1000.00, received: 1000.00, changeReturn: 0.00 },
                  companyLedger: { enabled: false, amount: 0.00, company: 'JK Paper', ref: '' }
                });
              }}
            >
              Reset to 2k/1.5k/1k
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ 
                minWidth: '130px', 
                fontWeight: 700, 
                background: isBalanced ? '#316AC5' : '#CCC', 
                color: isBalanced ? '#FFF' : '#666',
                cursor: isBalanced ? 'pointer' : 'not-allowed'
              }}
              disabled={!isBalanced}
              onClick={handleConfirmSettlement}
            >
              ✓ Settle Split Bill
            </button>
            <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
