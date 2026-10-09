import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  UserX, AlertTriangle, CheckCircle2, ShieldAlert, 
  Trash2, X, RefreshCw, LayoutGrid, Check, Search, ShieldCheck
} from 'lucide-react';

/* =========================================================================
   VIDEO 38: HOW TO REMOVE OR CANCEL CHECK-IN IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Cancel Check-Ins V6.5.002.1 (Frames 024–040)
   2. Entry Points (Frames 006 & 024):
      - Registrations.. -> Cancel Check-Ins
      - Front Office -> Registrations.. -> Remove or Cancel Check-In
      - Quick Scan (Load Pgm) -> Type "cancel check" -> "Cancel Check-Ins" -> [ Load ]
      - 44-Video Tutorial Player -> Video 38 -> Launch Interactive Feature Clone
   3. In-House Check-In List Grid (Frame 028):
      - Reg # | Room# | Guest Name | Company | Arrival | Departure | Group | ERASE
      - Row 1: Reg # 627 | Room 202 | MR CHOWKHANI PRATICK | 25-FEB-2022 | 26-FEB-2022 | ERASE (X)
      - Row 2: Reg # 626 | Room 202 | MR GURKANWAR SINGH BEDI | 25-FEB-2022 | 26-FEB-2022 | ERASE (X)
   4. Reason Entry & Authorization Dialog (Frame 032):
      - Reason: Guest request / wrong room assigned / walkout
      - Authorized By: MANAGER
      - Important Business Rule Note: "If any amount or Transaction is posted to the Guest Folio then Cancel Check-Ins Option will not work, you can go for Check-Out Option."
   5. Live Sync with Room Status Rack (Frame 040):
      - Room 202 reverts from Occupied (Orange) to Vacant (Green: 202 V/EXE)
      - Vacant room count increments from 56 to 57!
   ========================================================================= */

export const INITIAL_CHECKINS_DATABASE = [
  {
    regNo: '627',
    roomNo: '202',
    roomType: 'EXE',
    guestName: 'MR CHOWKHANI PRATICK',
    company: '',
    arrival: '25-FEB-2022',
    departure: '26-FEB-2022',
    group: 'FIT',
    rate: 2800.00,
    hasTransactions: false,
    balance: 0.00,
    status: 'In-House'
  },
  {
    regNo: '626',
    roomNo: '203',
    roomType: 'DLX',
    guestName: 'MR GURKANWAR SINGH BEDI',
    company: 'LSR Logistics',
    arrival: '25-FEB-2022',
    departure: '26-FEB-2022',
    group: 'FIT',
    rate: 2800.00,
    hasTransactions: false,
    balance: 0.00,
    status: 'In-House'
  },
  {
    regNo: '624',
    roomNo: '201',
    roomType: 'EXE',
    guestName: 'MR SHARMA RAJ',
    company: 'Tata Motors Limited',
    arrival: '20-FEB-2022',
    departure: '23-FEB-2022',
    group: 'Corporate',
    rate: 3999.00,
    hasTransactions: true,
    balance: 590.00,
    status: 'In-House'
  }
];

export default function IdsCancelCheckInModal({
  isOpen,
  onClose,
  accountingDate = '25-FEB-2022',
  onCancelCheckInSuccess,
  onOpenRoomRack
}) {
  const [checkinsList, setCheckinsList] = useState(INITIAL_CHECKINS_DATABASE);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState('Guest request to cancel check-in at desk');
  const [authorizedBy, setAuthorizedBy] = useState('MANAGER');
  const [statusMessage, setStatusMessage] = useState('');
  const [transactionBlockedError, setTransactionBlockedError] = useState('');

  if (!isOpen) return null;

  // Click ERASE on a row
  const handleInitiateErase = (row) => {
    setSelectedRow(row);
    setTransactionBlockedError('');
    setReasonModalOpen(true);
  };

  // Confirm Reason & Execute Cancel Check-In
  const handleConfirmCancelCheckIn = () => {
    if (!selectedRow) return;

    // Check Rule in Video 38 Frame 032
    if (selectedRow.hasTransactions || selectedRow.balance > 0) {
      setTransactionBlockedError(
        `Note: Folio for Room ${selectedRow.roomNo} has active posted transactions (₹${selectedRow.balance.toFixed(2)}). Cancel Check-In cannot proceed until deposits/charges are deleted (Video 39) or settled via Check-Out.`
      );
      return;
    }

    // Process cancellation
    const cancelledRoomNo = selectedRow.roomNo;
    const cancelledGuestName = selectedRow.guestName;
    const cancelledRegNo = selectedRow.regNo;

    setCheckinsList(prev => prev.filter(item => item.regNo !== cancelledRegNo));
    setReasonModalOpen(false);

    setStatusMessage(`Check-in for Room ${cancelledRoomNo} (${cancelledGuestName}) cancelled successfully! Room reverted to Vacant (202 V/EXE).`);

    if (onCancelCheckInSuccess) {
      onCancelCheckInSuccess({
        roomNo: cancelledRoomNo,
        regNo: cancelledRegNo,
        guestName: cancelledGuestName,
        reason: reasonText,
        authorizedBy
      });
    }

    setTimeout(() => setStatusMessage(''), 5000);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '740px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 38 Frame 028 */}
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
            <UserX size={14} />
            <span>Cancel Check-Ins V6.5.002.1 — Front Office Module</span>
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

        {/* Main Content Body matching Video 38 Frame 028 */}
        <div style={{ padding: '12px 16px', fontSize: '11px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: '#0A246A' }}>
              Active In-House Registrations Available for Check-In Cancellation:
            </div>
            <div style={{ fontSize: '10.5px', color: '#555' }}>
              Accounting Date: <strong>{accountingDate}</strong>
            </div>
          </div>

          {/* Grid Table matching Frame 028 */}
          <div style={{ height: '220px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                <tr>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Reg #</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Room#</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '130px' }}>Company</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '85px' }}>Arrival</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '85px' }}>Departure</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Group</th>
                  <th style={{ padding: '3px 6px', textAlign: 'center', width: '60px' }}>ERASE</th>
                </tr>
              </thead>
              <tbody>
                {checkinsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                      No active check-in registrations found for cancellation.
                    </td>
                  </tr>
                ) : (
                  checkinsList.map((row, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        background: idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                        borderBottom: '1px solid #E0E0E0'
                      }}
                    >
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{row.regNo}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 700, color: '#C5221F', borderRight: '1px solid #E0E0E0' }}>{row.roomNo}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{row.guestName}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.company || '-'}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.arrival}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.departure}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{row.group}</td>
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
                          onClick={() => handleInitiateErase(row)}
                          title="Erase / Cancel Check-In"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Guidance Alert matching Video 38 Frame 032 */}
          <div style={{ background: '#FFFDE6', border: '1px solid #E6D043', padding: '6px 10px', fontSize: '10.5px', color: '#7D5700', marginBottom: '10px' }}>
            <strong>Note:</strong> If any amount or transaction is posted to the Guest Folio then Cancel Check-Ins option will not work. You can delete deposit or settle via Check-Out option.
          </div>

          {/* Bottom Action Ribbon matching Frame 028 */}
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
            <div>
              {onOpenRoomRack && (
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    onClose();
                    onOpenRoomRack();
                  }}
                >
                  <LayoutGrid size={12} /> View Room Status Rack (Frame 040)
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            REASON ENTRY & AUTHORIZATION MODAL (Video 38 Frame 032)
            ========================================================================= */}
        {reasonModalOpen && selectedRow && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setReasonModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '440px', maxWidth: '92vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Reason Entry — Cancel Check-In for Room {selectedRow.roomNo}</span>
                <button className="ids-win-btn close" onClick={() => setReasonModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '14px 16px', fontSize: '11px' }}>
                
                <div style={{ marginBottom: '10px' }}>
                  Are you sure you want to cancel check-in for <strong>{selectedRow.guestName}</strong> in <strong>Room {selectedRow.roomNo}</strong> (Reg #{selectedRow.regNo})?
                </div>

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

                {transactionBlockedError && (
                  <div style={{ background: '#FCE8E6', border: '1px solid #D93025', color: '#C5221F', padding: '6px 8px', fontSize: '10px', marginBottom: '10px', fontWeight: 600 }}>
                    {transactionBlockedError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                    onClick={handleConfirmCancelCheckIn}
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
