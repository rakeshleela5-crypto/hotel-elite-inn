import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  ArrowDownLeft, DollarSign, CheckCircle2, AlertTriangle, 
  Search, Printer, Check, X, RefreshCw, LayoutGrid, Receipt, ArrowRight
} from 'lucide-react';

/* =========================================================================
   VIDEO 44: HOW TO PAID-OUT EXCESS AMOUNT TO GUEST IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Titles:
      - Check-out V6.5.002.6 (Frames 075 & 106)
      - Paidouts V6.5.008.30 (Frame 085)
      - Quick Balances V6.5.002.2 (Frame 045)
   2. Entry Points (Frames 006, 075, 085):
      - Cashiering.. -> Paidouts (Excess Advance Refund)
      - Cashiering.. -> Check-out (Negative balance detection)
      - Quick Scan (Load Pgm) -> Type "paidouts" or "paid out" -> [ Load ]
      - 44-Video Tutorial Player -> Video 44 -> Launch Interactive Feature Clone
   3. Key PMS Logic & Rule (Frame 075):
      - Guest paid ₹5,000.00 Advance at check-in.
      - Total Tariff + GST is ₹3,500.00.
      - Net Balance is -₹1,500.00 (Negative Amount).
      - "Note: Whenever there is Negative amount you are not able to settle the bill.
         Bill Amount should always have Positive or 0 amount."
      - [ Bill Settle ] button is locked until Paidout is executed.
   4. Paidouts V6.5.008.30 Window (Frame 085):
      - (o) Rooms | ( ) City Ledger
      - Room#: 201 | Reg #: 1925 | Folio #: 1 | Guest: Mr Arnab Sharma
      - Mode: (o) Cash Paidout | ( ) Credit Card Paidout | ( ) Cheque Paidout
      - Currency: INR | Exchange Rate: 1.00
      - Paid out Amount: 1500.00 ("Enter the Negative amount noted on Check-out Screen")
      - Particulars: Excess Advance Refund
      - Paidout Reason: Excess Advance Amount Refund
      - User: MANAGER | Click [ Save ]
   5. Resolution & Bill Settlement (Frame 100 & 106):
      - Line 5 added: POT (POT) Excess Advance Amount: 1,500.00
      - Folio Net Amount is now ₹0.00.
      - Click [ Settle Bill ] -> Room 201 successfully checked out!
   ========================================================================= */

export default function IdsPaidOutModal({
  isOpen,
  onClose,
  accountingDate = '26-MAR-2026',
  onCheckOutComplete,
  onOpenRoomRack,
  onOpenCrystalReport
}) {
  // Navigation tabs: 'checkoutNegative' | 'paidOutForm' | 'checkoutZero' | 'completed'
  const [currentStep, setCurrentStep] = useState('checkoutNegative');

  // Folio state
  const [roomNo, setRoomNo] = useState('201');
  const [regNo, setRegNo] = useState('1925');
  const [folioNo, setFolioNo] = useState('1');
  const [guestName, setGuestName] = useState('Mr. Arnab Sharma');
  const [roomType, setRoomType] = useState('EXE');
  
  // Financial numbers from Video 44 Frame 075
  const advanceAmount = 5000.00;
  const roomTariff = 3125.00;
  const taxes = 375.00; // CGST 187.50 + SGST 187.50
  const totalCharges = roomTariff + taxes; // 3500.00
  const negativeBalance = totalCharges - advanceAmount; // -1500.00

  // Paidout form fields matching Frame 085
  const [paidOutAmount, setPaidOutAmount] = useState('1500');
  const [paymentMode, setPaymentMode] = useState('Cash Paidout');
  const [particulars, setParticulars] = useState('Excess Advance Refund');
  const [paidOutReason, setPaidOutReason] = useState('Excess Advance Amount Refund');
  const [paidOutExecuted, setPaidOutExecuted] = useState(false);
  const [voucherNo, setVoucherNo] = useState('POT/2026/02');
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Execute Paid-Out matching Frame 085
  const handleSavePaidOut = () => {
    const amt = parseFloat(paidOutAmount) || 0;
    if (amt <= 0) {
      alert('Please enter a valid positive paid-out amount.');
      return;
    }

    setPaidOutExecuted(true);
    setStatusMessage(`Paid-Out Voucher #${voucherNo} for ₹${amt.toFixed(2)} saved! Folio balance is now ₹0.00.`);
    setCurrentStep('checkoutZero');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Final Bill Settlement matching Frame 106
  const handleSettleAndCheckOut = () => {
    setCurrentStep('completed');

    if (onCheckOutComplete) {
      onCheckOutComplete({
        roomNo,
        guestName,
        folioNo,
        totalTariff: totalCharges,
        advance: advanceAmount,
        paidOutRefund: parseFloat(paidOutAmount) || 1500.00,
        finalBalance: 0.00
      });
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: currentStep === 'paidOutForm' ? '740px' : '820px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar */}
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
            <ArrowDownLeft size={14} />
            <span>
              {currentStep === 'paidOutForm' 
                ? `Paidouts V6.5.008.30 — Excess Advance Refund` 
                : currentStep === 'completed'
                ? `Check-out Completed — Room ${roomNo} Successfully Settled`
                : `Check-out V6.5.002.6 — Bill Settlement & Excess Advance Handling`}
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
            PHASE 1: CHECK-OUT WITH NEGATIVE AMOUNT (-1500.00) (Video 44 Frame 075)
            ========================================================================= */}
        {currentStep === 'checkoutNegative' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Header info */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '6px 10px', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 60px 50px 70px 60px 1fr 70px 90px', gap: '6px 8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Room#</span>
                <input className="ids-input" value={roomNo} readOnly style={{ width: '50px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Reg. #</span>
                <input className="ids-input" value={regNo} readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Guest</span>
                <input className="ids-input" value={guestName} readOnly style={{ width: '100%', fontWeight: 700, color: '#0A246A' }} />

                <span style={{ fontWeight: 600 }}>Accounting</span>
                <input className="ids-input" value={accountingDate} readOnly style={{ width: '90px' }} />
              </div>
            </div>

            {/* Bill Summary Table matching Frame 075 */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '35px' }}>Select</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '35px' }}>Srl #</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Room#</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '70px' }}>Rate</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '65px' }}>Charges</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '60px' }}>Taxes</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '75px' }}>Receipts</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '85px' }}>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#FFF7CC', borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>Yes</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>1</td>
                    <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{roomNo}</td>
                    <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{guestName}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{roomTariff.toFixed(2)}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹0.00</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{taxes.toFixed(2)}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #E0E0E0', color: '#137333', fontWeight: 700 }}>
                      -₹{advanceAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 900, color: '#C5221F', fontSize: '11px' }}>
                      -₹{Math.abs(negativeBalance).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Crucial Explanatory Callout from Video 44 Frame 075 */}
            <div style={{ background: '#FFF5F5', border: '2px solid #E24B4A', padding: '10px 14px', borderRadius: '4px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C5221F', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                <AlertTriangle size={18} />
                <span>Notice: Negative Folio Balance Detected (-₹1,500.00)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#B3261E', lineHeight: '1.4' }}>
                <strong>Note: Whenever there is a Negative amount you are not able to settle the bill.</strong>
                <br />
                Bill Amount must always have Positive or 0.00 amount. You must pay out the excess advance amount of <strong>₹1,500.00</strong> to the guest using the <strong>Paidouts (POT)</strong> program before settlement.
              </div>
            </div>

            {/* Bottom buttons matching Frame 075 */}
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
              <div style={{ fontWeight: 700 }}>
                Grand Total: <span style={{ color: '#C5221F', fontWeight: 900 }}>-₹1,500.00</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#C5221F', color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setCurrentStep('paidOutForm')}
                >
                  <ArrowDownLeft size={12} /> Pay-Out Excess Amount (₹1,500)
                </button>
                <button className="ids-btn-classic" disabled title="Disabled because balance is negative!" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  Bill Settle
                </button>
                <button className="ids-btn-classic" onClick={onClose}>Back</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 2: PAIDOUTS V6.5.008.30 WINDOW (Video 44 Frame 085)
            ========================================================================= */}
        {currentStep === 'paidOutForm' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Top Selection matching Frame 085 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <input type="radio" name="entityType" defaultChecked /> Rooms
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                  <input type="radio" name="entityType" /> City Ledger
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '85px 80px 80px 70px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Room#</span>
                <input className="ids-input" value={roomNo} readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Folio #</span>
                <input className="ids-input" value={folioNo} readOnly style={{ width: '40px' }} />

                <div></div>

                <span style={{ fontWeight: 600 }}>Registration #</span>
                <input className="ids-input" value={regNo} readOnly style={{ width: '80px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Guest Name</span>
                <input className="ids-input" value={guestName} readOnly style={{ width: '100%', fontWeight: 700, gridColumn: 'span 2' }} />

                <span style={{ fontWeight: 600 }}>Accounting</span>
                <input className="ids-input" value={accountingDate} readOnly style={{ width: '90px' }} />
              </div>
            </div>

            {/* Payment Method Radio Group matching Frame 085 */}
            <div style={{ display: 'flex', gap: '20px', padding: '6px 12px', background: '#D4D0C8', border: '1px solid #999', marginBottom: '8px' }}>
              {['Cash Paidout', 'Credit Card Paidout', 'Cheque Paidout'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: paymentMode === m ? 700 : 500 }}>
                  <input type="radio" name="paidMode" checked={paymentMode === m} onChange={() => setPaymentMode(m)} /> {m}
                </label>
              ))}
            </div>

            {/* Cash Details Box matching Frame 085 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 12px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '6px' }}>Cash Details</div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 110px', gap: '6px 10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Currency Code</span>
                <input className="ids-input" value="INR" readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Exchange Rate</span>
                <input className="ids-input" value="1.000000" readOnly style={{ width: '80px' }} />

                <span style={{ fontWeight: 600, color: '#C5221F' }}>Paid out Amount</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    className="ids-input" 
                    value={paidOutAmount} 
                    onChange={(e) => setPaidOutAmount(e.target.value)} 
                    style={{ width: '100px', fontWeight: 900, color: '#C5221F', fontSize: '13px', background: '#FFF7CC' }} 
                  />
                  <span style={{ fontSize: '10px', color: '#666' }}>(Excess Advance)</span>
                </div>

                <span style={{ fontWeight: 600 }}>User</span>
                <input className="ids-input" value="MANAGER" readOnly style={{ width: '90px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Particulars</span>
                <input className="ids-input" value={particulars} onChange={(e) => setParticulars(e.target.value)} style={{ width: '100%', gridColumn: 'span 3' }} />

                <span style={{ fontWeight: 600 }}>Paidout Reason</span>
                <input className="ids-input" value={paidOutReason} onChange={(e) => setPaidOutReason(e.target.value)} style={{ width: '100%', gridColumn: 'span 3', background: '#FFF' }} />
              </div>
            </div>

            {/* Subtitle guidance from Video 44 Frame 085 */}
            <div style={{ fontSize: '10.5px', color: '#555', fontStyle: 'italic', marginBottom: '10px' }}>
              💡 Enter the Negative amount (₹1,500.00) which you have noted on the Check-out screen.
            </div>

            {/* Action ribbon matching Frame 085 */}
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
                onClick={handleSavePaidOut}
              >
                Save
              </button>
              <button className="ids-btn-classic" onClick={() => setCurrentStep('checkoutNegative')}>Cancel</button>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 3: CHECK-OUT WITH 0.00 BALANCE (Video 44 Frame 100 & 106)
            ========================================================================= */}
        {currentStep === 'checkoutZero' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Success notification */}
            <div style={{ background: '#E6F4EA', border: '1px solid #137333', padding: '6px 10px', color: '#137333', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✓ Excess Amount of ₹1,500.00 paid out to guest in cash. Bill balance is now ₹0.00!</span>
              <button className="ids-btn-classic" style={{ fontSize: '10px', background: '#FFF' }} onClick={() => setVoucherModalOpen(true)}>
                <Receipt size={10} /> View Paid-Out Voucher
              </button>
            </div>

            {/* Detailed 5-line ledger table matching Frame 100 */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
              <div style={{ background: '#ECE9D8', padding: '3px 6px', fontWeight: 700, fontSize: '10px', borderBottom: '1px solid #CCC' }}>
                View Bill / Folio Transactions (Room 201 — {guestName})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '2px 4px', textAlign: 'left', width: '30px' }}>SL#</th>
                    <th style={{ padding: '2px 4px', textAlign: 'left', width: '105px' }}>Date</th>
                    <th style={{ padding: '2px 4px', textAlign: 'left', width: '50px' }}>RevCod</th>
                    <th style={{ padding: '2px 4px', textAlign: 'left' }}>Particulars</th>
                    <th style={{ padding: '2px 4px', textAlign: 'right', width: '80px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '2px 4px' }}>1</td>
                    <td style={{ padding: '2px 4px' }}>26-MAR-2026 10:22</td>
                    <td style={{ padding: '2px 4px', fontWeight: 700 }}>ADV</td>
                    <td style={{ padding: '2px 4px' }}>Advance (Cash)</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', color: '#137333', fontWeight: 700 }}>-5,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '2px 4px' }}>2</td>
                    <td style={{ padding: '2px 4px' }}>26-MAR-2026 10:22</td>
                    <td style={{ padding: '2px 4px', fontWeight: 700 }}>TRF</td>
                    <td style={{ padding: '2px 4px' }}>Tariff 201</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right' }}>3,125.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '2px 4px' }}>3</td>
                    <td style={{ padding: '2px 4px' }}>26-MAR-2026 10:22</td>
                    <td style={{ padding: '2px 4px', fontWeight: 700 }}>CGT</td>
                    <td style={{ padding: '2px 4px' }}>Central GST</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right' }}>187.50</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '2px 4px' }}>4</td>
                    <td style={{ padding: '2px 4px' }}>26-MAR-2026 10:22</td>
                    <td style={{ padding: '2px 4px', fontWeight: 700 }}>SGT</td>
                    <td style={{ padding: '2px 4px' }}>State GST</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right' }}>187.50</td>
                  </tr>
                  <tr style={{ background: '#FFF7CC', borderBottom: '1px solid #E0E0E0' }}>
                    <td style={{ padding: '2px 4px' }}>5</td>
                    <td style={{ padding: '2px 4px' }}>26-MAR-2026 10:24</td>
                    <td style={{ padding: '2px 4px', fontWeight: 900, color: '#C5221F' }}>POT</td>
                    <td style={{ padding: '2px 4px', fontWeight: 700, color: '#C5221F' }}>(POT) Excess Advance Amount</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 900, color: '#C5221F' }}>1,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bill Summary Table matching Frame 106 */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 6px', textAlign: 'left', width: '35px' }}>Select</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', width: '55px' }}>Room#</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left' }}>Guest Name</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '70px' }}>Rate</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '65px' }}>Charges</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '60px' }}>Taxes</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '75px' }}>Receipts</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', width: '85px' }}>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#E6F4EA' }}>
                    <td style={{ padding: '3px 6px', textAlign: 'center' }}>Yes</td>
                    <td style={{ padding: '3px 6px', fontWeight: 700 }}>{roomNo}</td>
                    <td style={{ padding: '3px 6px', fontWeight: 700 }}>{guestName}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>₹3,125.00</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#C5221F' }}>₹1,500.00</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>₹375.00</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>-₹5,000.00</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 900, color: '#137333', fontSize: '12px' }}>
                      ₹0.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Settle Action Bar matching Frame 106 */}
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
              <div style={{ fontWeight: 700 }}>
                Grand Total: <span style={{ color: '#137333', fontWeight: 900 }}>₹0.00 (Ready to Settle)</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#137333', color: '#FFF', fontWeight: 800, minWidth: '90px' }}
                  onClick={handleSettleAndCheckOut}
                >
                  Bill Settle & Check-Out
                </button>
                <button className="ids-btn-classic" onClick={onClose}>Exit</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 4: CHECK-OUT COMPLETED
            ========================================================================= */}
        {currentStep === 'completed' && (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#E6F4EA', borderRadius: '50%', color: '#137333', marginBottom: '12px' }}>
              <CheckCircle2 size={44} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', marginBottom: '6px' }}>
              Room 201 Checked-Out & Settled Successfully!
            </div>

            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px 18px', maxWidth: '440px', margin: '0 auto 16px auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
                <div><strong>Guest Name:</strong></div>
                <div>{guestName}</div>
                <div><strong>Advance Collected:</strong></div>
                <div>₹5,000.00</div>
                <div><strong>Total Charges + Tax:</strong></div>
                <div>₹3,500.00</div>
                <div><strong>Excess Amount Paid:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>₹1,500.00 in Cash (POT/2026/02)</div>
                <div><strong>Final Folio Balance:</strong></div>
                <div style={{ fontWeight: 900, color: '#137333' }}>₹0.00 (Balanced)</div>
                <div><strong>Room Status:</strong></div>
                <div style={{ fontWeight: 700, color: '#B06000' }}>Updated to 201 D/EXE (Dirty / Vacant)</div>
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

        {/* =========================================================================
            PAID-OUT CASH VOUCHER PRINT MODAL
            ========================================================================= */}
        {voucherModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setVoucherModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '540px', maxWidth: '94vw', background: '#FFF', border: '2px solid #000', boxShadow: '0 8px 24px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#0A246A', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Paid-Out Voucher #{voucherNo}</span>
                <button className="ids-win-btn close" onClick={() => setVoucherModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '16px 20px', fontSize: '11px', color: '#111', fontFamily: 'monospace' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900 }}>HOTEL ELITE INN</div>
                  <div style={{ fontSize: '10px' }}>FRONT OFFICE CASH PAID-OUT VOUCHER</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div><strong>Voucher #:</strong> {voucherNo}</div>
                  <div><strong>Date:</strong> {accountingDate}</div>
                </div>

                <div style={{ border: '1px dashed #444', padding: '8px', marginBottom: '10px' }}>
                  <div><strong>Paid To:</strong> {guestName} (Room {roomNo})</div>
                  <div><strong>Reason:</strong> {paidOutReason}</div>
                  <div><strong>Particulars:</strong> {particulars}</div>
                  <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 900, color: '#0A246A' }}>
                    Amount Paid: ₹{parseFloat(paidOutAmount).toFixed(2)} (Cash)
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <div>Guest Signature: _______________</div>
                  <div>Cashier: MANAGER</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '16px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, background: '#DCE6F1' }}
                    onClick={() => {
                      if (onOpenCrystalReport) {
                        onOpenCrystalReport('paid-out', {
                          voucherNo,
                          guestName,
                          roomNo,
                          amount: paidOutAmount,
                          reason: paidOutReason,
                          particulars
                        });
                        setVoucherModalOpen(false);
                      } else {
                        window.print();
                      }
                    }}
                  >
                    Crystal Reports Print
                  </button>
                  <button className="ids-btn-classic" onClick={() => window.print()}>Quick Print</button>
                  <button className="ids-btn-classic" onClick={() => setVoucherModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
