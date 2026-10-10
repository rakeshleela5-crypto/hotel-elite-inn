import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Trash2, DollarSign, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldCheck, UserX, LayoutGrid, Check, X, RefreshCw
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

/* =========================================================================
   VIDEO 39: HOW TO DELETE DEPOSIT BEFORE CANCEL CHECK IN IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Titles:
      - Post Receipts FOR GUESTS (Frames 036–054)
      - Cancel Check-Ins V6.5.002.1 (Frames 060–076)
   2. Entry Points (Frames 006 & 036):
      - Cashiering.. -> Delete Deposit Before Cancel Check in
      - Registrations.. -> Delete Deposit Before Cancel Check in
      - Quick Scan (Load Pgm) -> Type "delete deposit" -> [ Load ]
      - 44-Video Tutorial Player -> Video 39 -> Launch Interactive Feature Clone
   3. Step 1: Post Receipts FOR GUESTS (Frames 036–054):
      - Room# 1002 / 202 (Mr Sourab Raj / Mr Sharma Raj)
      - Receipt # 1, Received Amount: 1,500.00 (or 5,000.00), Particulars: Room Advance
      - [ Delete ] -> Alert Window V6.5.002.1: "Delete Record? [ Yes ] [ No ]"
      - Click [ Save ] to confirm deletion of deposit
   4. Step 2: Cancel Check-Ins V6.5.002.1 (Frames 060–076):
      - Reg # 2 | Room 1002 | Mr Sourab Raj | Arrival: 26-FEB-2026 | Departure: 27-FEB-2026
      - Click ERASE (X)
      - Reason Entry: Reason: Guest Cancel | Authorized By: Manager -> [ Ok ]
   5. Step 3: Room Status Sync (Frames 070–076):
      - Room turns Vacant (Green: 1002 V/DLX), Occupied count decrements, Vacant count increments!
   ========================================================================= */

export const INITIAL_DEPOSITS_CHECKIN_LIST = [
  {
    roomNo: '1002',
    roomType: 'DLX',
    regNo: '2',
    guestName: 'Mr Sourab Raj',
    company: '',
    arrival: '26-FEB-2026',
    departure: '27-FEB-2026',
    group: 'FIT',
    depositReceiptNo: '1',
    depositAmount: 1500.00,
    depositParticulars: 'Room Advance (Cash)',
    payMode: 'Cash',
    isDepositDeleted: false,
    isCheckedIn: true
  },
  {
    roomNo: '201',
    roomType: 'EXE',
    regNo: '624',
    guestName: 'Mr Sharma Raj',
    company: 'Tata Motors Limited',
    arrival: '25-FEB-2026',
    departure: '26-FEB-2026',
    group: 'Corporate',
    depositReceiptNo: '3',
    depositAmount: 5000.00,
    depositParticulars: 'Advance Reservation Deposit',
    payMode: 'Cash',
    isDepositDeleted: false,
    isCheckedIn: true
  }
];

export default function IdsDeleteDepositModal({
  isOpen,
  onClose,
  accountingDate = '26-FEB-2026',
  onCancelCheckInSuccess,
  onOpenRoomRack
}) {
  const [activeStep, setActiveStep] = useState('deleteDeposit'); // 'deleteDeposit' | 'cancelCheckIn' | 'completed'
  const [depositsList, setDepositsList] = useState(INITIAL_DEPOSITS_CHECKIN_LIST);
  const [selectedItem, setSelectedItem] = useState(INITIAL_DEPOSITS_CHECKIN_LIST[0]);

  // Step 1 Delete Deposit States
  const [showConfirmDeleteAlert, setShowConfirmDeleteAlert] = useState(false);
  const [depositMarkedForDelete, setDepositMarkedForDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Step 2 Cancel Check-In States
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState('Guest Cancel');
  const [authorizedBy, setAuthorizedBy] = useState('Manager');

  if (!isOpen) return null;

  // Step 1: Click [ Delete ] in Post Receipts
  const handleDeleteButtonClick = () => {
    setShowConfirmDeleteAlert(true);
  };

  // Step 1: Confirm Delete Record
  const handleConfirmDeleteAlert = () => {
    setShowConfirmDeleteAlert(false);
    setDepositMarkedForDelete(true);
    setStatusMessage('Record marked for deletion. Click [ Save ] to confirm.');
  };

  // Step 1: Click [ Save ] to finalize deletion
  const handleSaveDeleteDeposit = () => {
    if (!depositMarkedForDelete) {
      alert('Please click [ Delete ] first to mark deposit for deletion.');
      return;
    }

    setDepositsList(prev => prev.map(item => 
      item.roomNo === selectedItem.roomNo 
        ? { ...item, depositAmount: 0.00, isDepositDeleted: true }
        : item
    ));

    setSelectedItem(prev => ({ ...prev, depositAmount: 0.00, isDepositDeleted: true }));
    setStatusMessage(`Deposit of ₹1,500.00 deleted successfully for Room ${selectedItem.roomNo}! You can now proceed to Cancel Check-Ins.`);
    setTimeout(() => {
      setActiveStep('cancelCheckIn');
    }, 1200);
  };

  // Step 2: Click ERASE (X) in Cancel Check-Ins
  const handleInitiateEraseCheckIn = (item) => {
    if (!item.isDepositDeleted && item.depositAmount > 0) {
      alert(`Cannot Cancel Check-In: Room ${item.roomNo} has an active deposit of ₹${item.depositAmount.toFixed(2)}. Please delete the deposit first!`);
      return;
    }
    setReasonModalOpen(true);
  };

  // Step 2: Finalize Cancel Check-In
  const handleConfirmReason = () => {
    setReasonModalOpen(false);

    setDepositsList(prev => prev.filter(item => item.roomNo !== selectedItem.roomNo));
    setActiveStep('completed');

    if (onCancelCheckInSuccess) {
      onCancelCheckInSuccess({
        roomNo: selectedItem.roomNo,
        regNo: selectedItem.regNo,
        guestName: selectedItem.guestName
      });
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: activeStep === 'deleteDeposit' ? '760px' : '720px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 39 */}
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
            <Trash2 size={14} />
            <span>
              {activeStep === 'deleteDeposit' 
                ? `Post Receipts FOR GUESTS — Delete Deposit (Room ${selectedItem.roomNo})` 
                : activeStep === 'cancelCheckIn'
                ? `Cancel Check-Ins V6.5.002.1 — Step 2 Check-In Removal`
                : `Check-In & Deposit Cancelled — Room ${selectedItem.roomNo}`}
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
            STEP 1: POST RECEIPTS FOR GUESTS — DELETE DEPOSIT (Frames 036–054)
            ========================================================================= */}
        {activeStep === 'deleteDeposit' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Step Flow Indicator */}
            <div style={{ background: '#FFFDE6', border: '1px solid #E6D043', padding: '6px 10px', fontSize: '11px', color: '#7D5700', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Step 1 of 2:</strong> Delete active deposit receipt before cancelling check-in for <strong>Room {selectedItem.roomNo}</strong> ({selectedItem.guestName}).
              </div>
              <button 
                className="ids-btn-classic" 
                style={{ fontSize: '10px', fontWeight: 700 }}
                onClick={() => setActiveStep('cancelCheckIn')}
              >
                Go to Cancel Check-Ins <ArrowRight size={10} style={{ display: 'inline' }} />
              </button>
            </div>

            {/* Form Fields matching Frame 036 & Frame 052 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 14px', marginBottom: '10px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 80px 140px 1fr', gap: '6px 10px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Room#</span>
                <input className="ids-input" value={selectedItem.roomNo} readOnly style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} />

                <span style={{ fontWeight: 600 }}>Folio #</span>
                <input className="ids-input" value="1" readOnly style={{ width: '60px' }} />

                <div></div>

                <span style={{ fontWeight: 600 }}>Reservation #</span>
                <input className="ids-input" value="-" readOnly style={{ width: '80px' }} />

                <span style={{ fontWeight: 600 }}>Guest Name</span>
                <input className="ids-input" value={selectedItem.guestName} readOnly style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />

                <span style={{ fontWeight: 600 }}>Company Code</span>
                <input className="ids-input" value={selectedItem.company || '-'} readOnly style={{ width: '80px' }} />

                <span style={{ fontWeight: 600 }}>Company Name</span>
                <input className="ids-input" value={selectedItem.company || '-'} readOnly style={{ width: '100%' }} />
              </div>

              {/* Payment Mode Selector Tabs */}
              <div style={{ display: 'flex', gap: '6px', margin: '8px 0', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
                <button className="ids-btn-classic" style={{ background: '#316AC5', color: '#FFF', fontWeight: 700 }} onClick={() => { playReceptionChime(); }}>Cash</button>
                <button className="ids-btn-classic" onClick={() => { playReceptionChime(); alert("Payment mode: Credit Card"); }}>Credit Card</button>
                <button className="ids-btn-classic" onClick={() => { playReceptionChime(); alert("Payment mode: Cheque"); }}>Cheque</button>
              </div>

              {/* Currency & Received Amount matching Frame 052 */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 140px 100px 1fr', gap: '6px 10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Currency Code</span>
                <input className="ids-input" value="INR" readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Exchange Rate</span>
                <input className="ids-input" value="0.00" readOnly style={{ width: '60px' }} />

                <span style={{ fontWeight: 600 }}>Received Amount</span>
                <input 
                  className="ids-input" 
                  value={depositMarkedForDelete ? '0.00' : selectedItem.depositAmount.toFixed(2)} 
                  readOnly 
                  style={{ width: '120px', fontWeight: 900, color: depositMarkedForDelete ? '#999' : '#C5221F', background: '#FFF7CC', textDecoration: depositMarkedForDelete ? 'line-through' : 'none' }} 
                />

                <span style={{ fontWeight: 600 }}>Receipt #</span>
                <input className="ids-input" value={selectedItem.depositReceiptNo} readOnly style={{ width: '60px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Particulars</span>
                <input className="ids-input" value={selectedItem.depositParticulars} readOnly style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>Accounting Date</span>
                <input className="ids-input" value={accountingDate} readOnly style={{ width: '100px' }} />
              </div>

            </div>

            {/* Bottom Action Ribbon matching Frame 036 */}
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
              <div style={{ color: '#444', fontSize: '10px' }}>
                Click <strong>[ Delete ]</strong> then <strong>[ Save ]</strong> to erase deposit receipt.
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => { playReceptionChime(); alert("Add new deposit entry mode."); }}>Add</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => { playReceptionChime(); alert("Modify deposit receipt mode."); }}>Modify</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ 
                    fontWeight: 700, 
                    minWidth: '60px', 
                    background: depositMarkedForDelete ? '#E6F4EA' : '#FCE8E6', 
                    color: '#C5221F' 
                  }}
                  onClick={handleDeleteButtonClick}
                >
                  Delete
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => { playReceptionChime(); alert("Browse deposit ledger transactions."); }}>Browse</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, minWidth: '60px', background: '#DCE6F1' }}
                  onClick={handleSaveDeleteDeposit}
                >
                  Save
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => { playReceptionChime(); alert("PMS Navigation Panel: Cashier Deposit Manager."); }}>Panel</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={onClose}>Back</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 2: CANCEL CHECK-INS (Frames 060–076)
            ========================================================================= */}
        {activeStep === 'cancelCheckIn' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            <div style={{ background: '#E6F4EA', border: '1px solid #137333', color: '#137333', padding: '6px 10px', fontSize: '11px', fontWeight: 600, marginBottom: '10px' }}>
              ✓ Deposit deleted for Room {selectedItem.roomNo}! Click the red <strong>[ ✕ ]</strong> button under ERASE to cancel check-in.
            </div>

            {/* Cancel Check-in Grid matching Frame 068 */}
            <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Reg #</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Room#</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '120px' }}>Company</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Arrival</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Departure</th>
                    <th style={{ padding: '3px 6px', textAlign: 'center', width: '60px' }}>ERASE</th>
                  </tr>
                </thead>
                <tbody>
                  {depositsList.map((item, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{item.regNo}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 700, color: '#C5221F', borderRight: '1px solid #E0E0E0' }}>{item.roomNo}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{item.guestName}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.company || '-'}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.arrival}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{item.departure}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                        <button 
                          className="ids-btn-classic" 
                          style={{ 
                            background: '#FCE8E6', 
                            color: '#C5221F', 
                            border: '1px solid #D93025', 
                            fontWeight: 900, 
                            padding: '1px 8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleInitiateEraseCheckIn(item)}
                          title="Erase / Cancel Check-In"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Ribbon */}
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
                onClick={() => setActiveStep('deleteDeposit')}
              >
                ← Back to Delete Deposit
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" onClick={() => { playReceptionChime(); alert("FortuneNext Panel Selector: Front Desk Cashier View."); }}>Panel</button>
                <button className="ids-btn-classic" onClick={onClose}>Exit</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 3: COMPLETED SUCCESS VIEW (Frames 070–076)
            ========================================================================= */}
        {activeStep === 'completed' && (
          <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#E6F4EA', borderRadius: '50%', color: '#137333', marginBottom: '12px' }}>
              <CheckCircle2 size={42} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', marginBottom: '6px' }}>
              Deposit Deleted & Check-In Cancelled Successfully!
            </div>

            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px 18px', maxWidth: '460px', margin: '0 auto 16px auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
                <div><strong>Room Number:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Room {selectedItem.roomNo} ({selectedItem.roomType})</div>
                <div><strong>Guest Name:</strong></div>
                <div>{selectedItem.guestName}</div>
                <div><strong>Deposit Refunded:</strong></div>
                <div style={{ fontWeight: 700, color: '#137333' }}>₹1,500.00 (Cash)</div>
                <div><strong>Reason:</strong></div>
                <div>{reasonText} (Auth: {authorizedBy})</div>
                <div><strong>Room Status Rack:</strong></div>
                <div style={{ fontWeight: 700, color: '#137333' }}>Reverted to Vacant ({selectedItem.roomNo} V/DLX)</div>
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
                  <LayoutGrid size={13} /> View Room Status Rack (Frame 076)
                </button>
              )}
              <button className="ids-btn-classic" onClick={onClose}>
                Close PMS Window
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ALERT DIALOG 1: "Delete Record? [ Yes ] [ No ]" (Frame 052)
            ========================================================================= */}
        {showConfirmDeleteAlert && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '280px', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Alert Window V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setShowConfirmDeleteAlert(false)}>✕</button>
              </div>
              <div style={{ padding: '14px 16px', textAlign: 'center', fontSize: '11px' }}>
                <div style={{ fontWeight: 700, marginBottom: '14px' }}>Delete Record?</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '60px', background: '#DCE6F1' }}
                    onClick={handleConfirmDeleteAlert}
                    autoFocus
                  >
                    Yes
                  </button>
                  <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setShowConfirmDeleteAlert(false)}>
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ALERT DIALOG 2: REASON ENTRY FOR CANCEL CHECK-IN (Frame 068)
            ========================================================================= */}
        {reasonModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '400px', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Reason Entry — Cancel Check-In</span>
                <button className="ids-win-btn close" onClick={() => setReasonModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '14px 16px', fontSize: '11px' }}>
                <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px 12px', marginBottom: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px 10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Reason</span>
                    <input 
                      className="ids-input" 
                      value={reasonText} 
                      onChange={(e) => setReasonText(e.target.value)}
                      style={{ width: '100%', fontWeight: 600 }}
                      autoFocus
                    />

                    <span style={{ fontWeight: 600 }}>Authorized By</span>
                    <input 
                      className="ids-input" 
                      value={authorizedBy} 
                      onChange={(e) => setAuthorizedBy(e.target.value)}
                      style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '60px', background: '#DCE6F1' }}
                    onClick={handleConfirmReason}
                  >
                    Ok
                  </button>
                  <button className="ids-btn-classic" onClick={() => setReasonModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
