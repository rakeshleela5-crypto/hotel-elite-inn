import React, { useState } from 'react';
import { 
  AlertTriangle, HelpCircle, Check, X, Printer, 
  DollarSign, FileText, ArrowRight, ShieldCheck, UserCheck 
} from 'lucide-react';

/* =========================================================================
   VIDEO 04: HOW TO CANCEL ROOM BOOKING IN IDS FORTUNE NEXT 6.5 & 7.0
   Replication of:
   1. Cancel Booking Dialog (Frame 018)
   2. Deposit Warning Dialog (Frame 020)
   3. Deposit Refund V6.5.002.4 Modal (Frame 022)
   4. Reason Entry Modal (Frame 030 & 034)
   5. Blocked Room Warning Dialog (Frame detail_05)
   6. Print Voucher Dialog (Frame detail_06)
   7. Printable Cancellation Voucher
   8. Free Flow Reason Modal
   ========================================================================= */

// 1. CANCEL BOOKING DIALOG (Frame 018)
export function IdsCancelBookingDialog({ 
  isOpen, 
  onClose, 
  booking, 
  onProceed 
}) {
  const [cancelYes, setCancelYes] = useState('Yes');

  if (!isOpen || !booking) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1100 }}>
      <div className="ids-dialog-window" style={{ width: '640px', maxWidth: '98vw' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Cancel Booking</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Booking Summary Grid from Frame 018 */}
          <div style={{ border: '1px solid #716F64', background: '#FFFFFF', maxHeight: '180px', overflowY: 'auto' }}>
            <table className="ids-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Cancel</th>
                  <th style={{ width: '55px' }}>Property</th>
                  <th style={{ width: '50px' }}>Type</th>
                  <th>Guest Name</th>
                  <th style={{ width: '80px' }}>Arrival</th>
                  <th style={{ width: '80px' }}>Departure</th>
                  <th style={{ width: '45px' }}>Rooms</th>
                  <th style={{ width: '45px' }}>Guest</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#A02020' }}>
                    <select 
                      className="ids-select" 
                      style={{ padding: '0px 2px', height: '20px', fontSize: '11px', fontWeight: 700 }}
                      value={cancelYes}
                      onChange={(e) => setCancelYes(e.target.value)}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>DEM</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{booking.type || 'EXE'}</td>
                  <td style={{ fontWeight: 600, color: '#0A246A' }}>{booking.title || 'Mr'} {booking.guestName}</td>
                  <td>{booking.arrivalDate ? booking.arrivalDate.split(' ')[0] : '14-JAN-2022'}</td>
                  <td>{booking.departureDate ? booking.departureDate.split(' ')[0] : '17-JAN-2022'}</td>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td style={{ textAlign: 'center' }}>{booking.pax || '1'}</td>
                </tr>
                {/* Empty filler rows matching IDS UI */}
                {[1, 2, 3, 4].map(idx => (
                  <tr key={idx} style={{ height: '20px' }}>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom OK / Cancel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '70px', fontWeight: 700 }}
              onClick={() => onProceed({ cancelYes })}
            >
              Ok
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '70px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. DEPOSIT WARNING DIALOG (Frame 020)
export function IdsDepositWarningDialog({ 
  isOpen, 
  onClose, 
  onRefund, 
  onProceedWithoutRefund 
}) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="ids-dialog-window" style={{ width: '420px', border: '2px solid #0055EA' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(180deg, #0A246A 0%, #3A6EA5 100%)', color: '#FFF' }}>
          <span style={{ fontWeight: 700 }}>Warning</span>
          <button className="ids-win-btn close" style={{ color: '#FFF' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '16px 18px', background: '#ECE9D8' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: '#F5A623', color: '#FFF', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', flexShrink: 0 
            }}>
              !
            </div>
            <div style={{ fontSize: '11px', color: '#000', lineHeight: 1.4, fontWeight: 500 }}>
              Deposit has been Received for this Reservation, Proceed with Cancellation?
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '75px', fontWeight: 700, color: '#A02020' }}
              onClick={onRefund}
            >
              Refund
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={onProceedWithoutRefund}
            >
              Ok
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. DEPOSIT REFUND V6.5.002.4 MODAL (Frame 022, 024, 026)
export function IdsDepositRefundModal({ 
  isOpen, 
  onClose, 
  booking, 
  onCompleteRefund 
}) {
  const [refundMode, setRefundMode] = useState('Refund Amount'); // 'Refund Amount' vs 'Retention Charges'
  const [payMode, setPayMode] = useState('Cash'); // 'Cash' | 'Credit' | 'Cheque'
  const depositAmount = Number(booking?.depositAmount || 2000).toFixed(2);
  const [amount, setAmount] = useState(depositAmount);
  const [balanceAmount, setBalanceAmount] = useState(depositAmount);
  const [reason, setReason] = useState('Change Visit Plan');
  const [reference, setReference] = useState('');

  if (!isOpen || !booking) return null;

  const handleSave = () => {
    onCompleteRefund({
      refundMode,
      payMode,
      amount: parseFloat(amount) || 0,
      balanceAmount: parseFloat(balanceAmount) || 0,
      reason,
      reference
    });
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
      <div className="ids-dialog-window" style={{ width: '840px', maxWidth: '98vw' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Deposit Refund V6.5.002.4</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Header Row: Type & Res.# */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600 }}>Type</span>
              <select className="ids-select" style={{ width: '130px' }} defaultValue="Reservation">
                <option value="Reservation">Reservation</option>
                <option value="Banquet">Banquet</option>
                <option value="General">General</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 600 }}>Res.#</span>
              <input 
                className="ids-input" 
                style={{ width: '80px', fontWeight: 700, textAlign: 'center' }} 
                value={booking.resNo || '270'} 
                readOnly 
              />
              <button className="ids-btn-classic" style={{ minWidth: '20px', padding: '1px 5px' }}>?</button>
            </div>
          </div>

          {/* Guest Information Box */}
          <div style={{ border: '1px solid #716F64', padding: '8px 10px', background: '#F8F7F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 70px', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Guest Name</span>
              <input 
                className="ids-input" 
                value={`${booking.title || 'Mr'} ${booking.guestName}`} 
                readOnly 
                style={{ fontWeight: 600 }}
              />
              <button className="ids-btn-classic" style={{ padding: '2px 6px' }}>Details...</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Company</span>
              <input className="ids-input" value={booking.companyCode || 'COM0009'} readOnly style={{ fontWeight: 600 }} />
              <input className="ids-input" value={booking.companyName || 'QUALITY PHARMA PRODUCTS PVT LTD.'} readOnly />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 110px 100px 110px', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Arrival Date</span>
              <input className="ids-input" value={booking.arrivalDate ? booking.arrivalDate.split(' ')[0] : '14-JAN-2022'} readOnly />
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Departure Date</span>
              <input className="ids-input" value={booking.departureDate ? booking.departureDate.split(' ')[0] : '17-JAN-2022'} readOnly />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 60px 80px 60px 100px 1fr', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Pax</span>
              <input className="ids-input" value={booking.pax || '1'} readOnly style={{ textAlign: 'center' }} />
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Rooms</span>
              <input className="ids-input" value="1" readOnly style={{ textAlign: 'center' }} />
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Deposit Amount</span>
              <input className="ids-input" value={depositAmount} readOnly style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 180px', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Reference</span>
              <input className="ids-input" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>

          {/* Refund vs Retention Radios */}
          <div style={{ display: 'flex', gap: '40px', padding: '8px 12px', borderBottom: '1px solid #D0CDC0', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="radio" 
                name="refundMode" 
                checked={refundMode === 'Refund Amount'} 
                onChange={() => setRefundMode('Refund Amount')} 
              />
              <span>Refund Amount</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="radio" 
                name="refundMode" 
                checked={refundMode === 'Retention Charges'} 
                onChange={() => setRefundMode('Retention Charges')} 
              />
              <span>Retention Charges</span>
            </label>
          </div>

          {/* Payment Mode Radios */}
          <div style={{ display: 'flex', gap: '40px', padding: '6px 12px', borderBottom: '1px solid #D0CDC0' }}>
            {['Cash', 'Credit', 'Cheque'].map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="payMode" 
                  checked={payMode === m} 
                  onChange={() => setPayMode(m)} 
                />
                <span>{m}</span>
              </label>
            ))}
          </div>

          {/* Payment Mode Details Panel & Taxes Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '14px', marginTop: '10px' }}>
            {/* Left Details Box */}
            <fieldset style={{ border: '1px solid #716F64', padding: '10px 12px', background: '#F8F7F0' }}>
              <legend style={{ fontWeight: 700, padding: '0 4px' }}>{payMode} Details</legend>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 140px 40px', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Amount</span>
                <input 
                  className="ids-input" 
                  style={{ textAlign: 'right', fontWeight: 700 }} 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
                <span style={{ fontWeight: 700 }}>INR</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 140px', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Balance Amount</span>
                <input 
                  className="ids-input" 
                  style={{ textAlign: 'right', fontWeight: 700, background: '#EDEAE0' }} 
                  value={balanceAmount} 
                  readOnly 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Reason</span>
                <input 
                  className="ids-input" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                />
              </div>
            </fieldset>

            {/* Right Tax Table */}
            <div style={{ border: '1px solid #716F64', background: '#FFF' }}>
              <table className="ids-grid-table">
                <thead>
                  <tr>
                    <th>Rev.Code</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{refundMode === 'Retention Charges' ? 'ROOM_RET' : 'ADV_REFUND'}</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                  </tr>
                  <tr>
                    <td>CGST-REF</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                  </tr>
                  <tr>
                    <td>SGST-REF</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status info bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: '#444' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>User: <strong>MANAGER</strong></span>
            </div>
            <div>
              <span>Last Updated: <strong>14-JAN-2022 20:14</strong></span>
            </div>
          </div>

          {/* Bottom Action Ribbon from Frame 022 & 028 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #D0CDC0' }}>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Add</button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Modify</button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Delete</button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Browse</button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }} disabled>Previous</button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }} disabled>Next</button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px', fontWeight: 700, color: '#0A246A' }}
              onClick={handleSave}
            >
              <u>S</u>ave
            </button>
            <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Panel</button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '55px' }}
              onClick={onClose}
            >
              <u>E</u>xit
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '35px' }}>GI</button>
              <button className="ids-btn-classic" style={{ minWidth: '70px' }}>Load Pgm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. REASON ENTRY MODAL (Frame 030, 032, 034)
export function IdsCancelReasonModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}) {
  const [reason, setReason] = useState('Cancelled by Customer');
  const [authorizedBy, setAuthorizedBy] = useState('Manager');
  const [callerDetails, setCallerDetails] = useState('Mr Biswakarma Santosh');
  const [mobileNumber, setMobileNumber] = useState('1234567890');
  const [freeFlowOpen, setFreeFlowOpen] = useState(false);
  const [customReasonText, setCustomReasonText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      reason: customReasonText || reason,
      authorizedBy,
      callerDetails,
      mobileNumber
    });
  };

  return (
    <>
      <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
        <div className="ids-dialog-window" style={{ width: '460px' }}>
          {/* Title Bar */}
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Reason Entry</span>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 28px', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Reason</span>
              <select 
                className="ids-select" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="No Reason / Not applicable">No Reason / Not applicable</option>
                <option value="Cancelled by Customer">Cancelled by Customer</option>
                <option value="Cancelled by Hotel">Cancelled by Hotel</option>
                <option value="Customer Find better deal">Customer Find better deal</option>
                <option value="Customer was not satisfied">Customer was not satisfied</option>
                <option value="Customer does not arrived on given time">Customer does not arrived on given time</option>
                <option value="Customer changed the dates">Customer changed the dates</option>
                <option value="Customer cancelled this booking">Customer cancelled this booking</option>
              </select>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '24px', padding: '1px 4px', fontWeight: 700 }}
                title="Enter Free Flow Reason"
                onClick={() => setFreeFlowOpen(true)}
              >
                ...
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Authorized By</span>
              <input 
                className="ids-input" 
                value={authorizedBy} 
                onChange={(e) => setAuthorizedBy(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Caller Details</span>
              <input 
                className="ids-input" 
                value={callerDetails} 
                onChange={(e) => setCallerDetails(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Mobile Number</span>
              <input 
                className="ids-input" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
              />
            </div>

            {/* Note text matching exact frame 030 footnote */}
            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '10px', color: '#555', fontStyle: 'italic' }}>
              Note:- Press Button to Enter Free Flow Reason
            </div>

            {/* OK button from frame 030 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '80px', fontWeight: 700 }}
                onClick={handleConfirm}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Free Flow Reason Sub-Popup */}
      {freeFlowOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1500 }}>
          <div className="ids-dialog-window" style={{ width: '380px' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Free Flow Reason</span>
              <button className="ids-win-btn close" onClick={() => setFreeFlowOpen(false)}>✕</button>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Detailed Cancellation Explanation:</span>
              <textarea 
                className="ids-input" 
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
                placeholder="Enter custom remarks..."
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button className="ids-btn-classic" onClick={() => setFreeFlowOpen(false)}>Ok</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 5. BLOCKED ROOM RELEASE WARNING DIALOG (detail_05)
export function IdsBlockedRoomWarningDialog({ 
  isOpen, 
  onOk 
}) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
      <div className="ids-dialog-window" style={{ width: '420px', border: '2px solid #D0CDC0' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 60%, #D4D0C8 100%)' }}>
          <span style={{ fontWeight: 700 }}>Warning</span>
          <button className="ids-win-btn close" onClick={onOk}>✕</button>
        </div>

        <div style={{ padding: '16px 20px', background: '#ECE9D8' }}>
          <div style={{ fontSize: '11px', color: '#000', lineHeight: 1.45, fontWeight: 500 }}>
            Room(s) have been blocked for this Reservation Amending/Cancelling will release the blocked Rooms.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '70px', fontWeight: 700 }}
              onClick={onOk}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. PRINT VOUCHER DIALOG (detail_06)
export function IdsCancelVoucherPromptDialog({ 
  isOpen, 
  onYes, 
  onNo 
}) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1500 }}>
      <div className="ids-dialog-window" style={{ width: '380px', border: '1px solid #716F64' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(180deg, #FFFFFF 0%, #D4D0C8 100%)' }}>
          <span style={{ fontWeight: 700 }}>Operation Cancelled.</span>
          <button className="ids-win-btn close" onClick={onNo}>✕</button>
        </div>

        <div style={{ padding: '16px 20px', background: '#ECE9D8' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: '#0055EA', color: '#FFF', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', flexShrink: 0 
            }}>
              ?
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>
              Do you want to Print Voucher ?
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '18px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px', fontWeight: 700 }}
              onClick={onYes}
            >
              Yes
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={onNo}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. PRINTABLE CANCELLATION VOUCHER MODAL
export function IdsCancellationVoucherModal({ 
  isOpen, 
  onClose, 
  cancelRecord 
}) {
  if (!isOpen || !cancelRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1600 }}>
      <div className="ids-dialog-window" style={{ width: '680px', maxWidth: '98vw', background: '#FFFFFF' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', background: '#ECE9D8' }}>
          <span style={{ fontWeight: 700 }}>Cancellation Voucher Preview - V6.5.002.20</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Paper Document Layout */}
        <div style={{ padding: '24px 28px', color: '#000000', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>HOTEL ELITE INN</div>
            <div style={{ fontSize: '11px' }}>Luxury Boutique Stays & Corporate Executive Suites</div>
            <div style={{ fontSize: '10px', color: '#555' }}>GSTIN: 27AAAAA0000A1Z5 | Phone: +91 22 2847 9000</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px', textDecoration: 'underline' }}>
              RESERVATION CANCELLATION VOUCHER
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', fontSize: '11px' }}>
            <div><strong>Cancellation No:</strong> {cancelRecord.cancellationNo || 'CAN-2022-0270'}</div>
            <div><strong>Date & Time:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Original Res. #:</strong> {cancelRecord.resNo || '270'}</div>
            <div><strong>Status:</strong> <span style={{ color: '#A02020', fontWeight: 700 }}>CANCELLED</span></div>
          </div>

          <div style={{ borderTop: '1px dashed #777', margin: '10px 0' }}></div>

          {/* Guest & Room Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '4px', fontSize: '11px' }}>
            <span>Guest Name:</span>
            <strong>{cancelRecord.title || 'Mr'} {cancelRecord.guestName}</strong>

            <span>Company:</span>
            <span>{cancelRecord.companyName || 'QUALITY PHARMA PRODUCTS PVT LTD.'}</span>

            <span>Room Category:</span>
            <span>{cancelRecord.type || 'EXECUTIVE'} (Room #{cancelRecord.roomNo || '515'} - Inventory Released)</span>

            <span>Arrival Date:</span>
            <span>{cancelRecord.arrivalDate || '14-JAN-2022'}</span>

            <span>Departure Date:</span>
            <span>{cancelRecord.departureDate || '17-JAN-2022'}</span>

            <span>Reason:</span>
            <strong>{cancelRecord.reason || 'Cancelled by Customer'}</strong>

            <span>Authorized By:</span>
            <span>{cancelRecord.authorizedBy || 'Manager'}</span>

            <span>Caller Contact:</span>
            <span>{cancelRecord.callerDetails || 'Guest'} ({cancelRecord.mobileNumber || '1234567890'})</span>
          </div>

          <div style={{ borderTop: '1px dashed #777', margin: '10px 0' }}></div>

          {/* Refund Breakdown */}
          <div style={{ background: '#F8F7F0', border: '1px solid #CCC', padding: '10px 14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Deposit Collected:</span>
              <span>INR {Number(cancelRecord.depositAmount || 2000).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Retention Charges:</span>
              <span>INR {Number(cancelRecord.retentionCharges || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', paddingTop: '4px', fontWeight: 700 }}>
              <span>Total Disbursed Refund ({cancelRecord.payMode || 'CASH'}):</span>
              <span style={{ color: '#0A246A' }}>INR {Number(cancelRecord.refundAmount || 2000).toFixed(2)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '150px', borderTop: '1px solid #000', marginBottom: '4px' }}></div>
              <span style={{ fontSize: '10px' }}>Guest Signature</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '150px', borderTop: '1px solid #000', marginBottom: '4px' }}></div>
              <span style={{ fontSize: '10px' }}>Duty Manager / Front Office</span>
            </div>
          </div>
        </div>

        {/* Voucher Action Footer */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #D0CDC0', padding: '10px 14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button 
            className="ids-btn-classic" 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            onClick={handlePrint}
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button 
            className="ids-btn-classic" 
            style={{ minWidth: '70px' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
