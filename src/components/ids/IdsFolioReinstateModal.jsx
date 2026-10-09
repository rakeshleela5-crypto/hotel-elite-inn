import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  RotateCcw, Check, X, Info, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronRight, FileText, AlertCircle, ShieldCheck, Printer, RefreshCw, CheckCircle2
} from 'lucide-react';

/* =========================================================================
   VIDEO 26: HOW TO USE FOLIO REINSTATE OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Operational Prerequisite (Frames 025–040):
      - "Before doing Folio Reinstate make sure your room is clean."
      - Check room status: Room 201 is D/EXE (Dirty Vacant)
      - Right click 201 -> Clear Room -> Status: Clean -> [ Save ]
      - Room becomes V/EXE (Vacant Clean)
   2. Entry Points:
      - Quick Scan -> Search "folio" -> Select "Folio Re-instate" -> [ Load ] (Frame 050)
      - Cashiering.. -> Folio Reinstate Option
      - Room Status V6.5.002.1 Rack Console -> Context Menu
   3. Folio Re-Instate V6.5.002.1 Dialog (Frames 055–060):
      - Header Title: Folio Re-Instate
      - Re-Instate filter: Transaction (s)
      - Grid Columns:
        Bill # | Room # | Reg # | Guest Name | Bill Amount | Settlement | C/O Bill #
        Row 1: 511 | 201 | 624 | Mr Sharma Raj | 5190 | Cash | 511
      - Legend:
        [ ] In-house (Part Bill)  [ ] Room Occupied  [ ] Link Room Bill
      - Note: Double click on Bill# to view room details
      - Buttons: [ Re-Instate ], [ Exit ]
   4. Execution & Room Status Restoration (Frames 060–080):
      - Clicking [ Re-Instate ]:
        * Folio reinstated into active in-house billing
        * Room 201 restored to Occupied (201 O/EXE Sharma)
        * Statistics increment Inhouse Rooms/Guests (1/1)
   ========================================================================= */

export const DEFAULT_CHECKED_OUT_FOLIOS = [
  {
    billNo: '511',
    roomNo: '201',
    category: 'EXECUTIVE (EXE)',
    regNo: '624',
    guestName: 'Mr Sharma Raj',
    billAmount: 5190.00,
    settlement: 'Cash',
    coBillNo: '511',
    checkoutDate: '27-JAN-2022 18:55',
    arrivalDate: '27-JAN-2022 12:00',
    departureDate: '27-JAN-2022 18:55',
    folioType: 'Full Checkout'
  },
  {
    billNo: '508',
    roomNo: '314',
    category: 'DELUXE (DLX)',
    regNo: '570',
    guestName: 'Mr John Doe',
    billAmount: 8400.00,
    settlement: 'Credit Card',
    coBillNo: '508',
    checkoutDate: '26-JAN-2022 12:00',
    arrivalDate: '24-JAN-2022 14:00',
    departureDate: '26-JAN-2022 12:00',
    folioType: 'Full Checkout'
  },
  {
    billNo: '509',
    roomNo: '406',
    category: 'DELUXE (DLX)',
    regNo: '575',
    guestName: 'Sharma Group Master',
    billAmount: 45000.00,
    settlement: 'Direct Bill/BTC',
    coBillNo: '509',
    checkoutDate: '26-JAN-2022 11:30',
    arrivalDate: '22-JAN-2022 11:00',
    departureDate: '26-JAN-2022 12:00',
    folioType: 'Group Folio'
  }
];

export default function IdsFolioReinstateModal({
  isOpen,
  onClose,
  initialRoomNo = '201',
  accountingDate = '27-JAN-2022',
  clearedRooms = [],
  onClearRoom,
  onReinstateFolio
}) {
  // Current view tab: 'reinstate-dialog' | 'room-clean-check' | 'bill-details'
  const [currentView, setCurrentView] = useState('reinstate-dialog');

  // Selected Folio row
  const [selectedBillNo, setSelectedBillNo] = useState('511');

  // Filter mode
  const [reinstateType, setReinstateType] = useState('Transaction (s)');

  // Available Folios
  const [foliosList, setFoliosList] = useState(DEFAULT_CHECKED_OUT_FOLIOS);

  // Status message notice
  const [statusNotice, setStatusNotice] = useState('');

  // Confirmation prompt popup
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Detail popup
  const [activeDetailFolio, setActiveDetailFolio] = useState(null);

  // Synchronize on open
  useEffect(() => {
    if (isOpen) {
      setSelectedBillNo('511');
      setCurrentView('reinstate-dialog');
      setShowConfirmModal(false);
      setStatusNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedFolio = foliosList.find(f => f.billNo === selectedBillNo) || foliosList[0];
  const isRoomDirty = selectedFolio && !clearedRooms.includes(selectedFolio.roomNo);

  // Handle Reinstate Click
  const handleReinstateClick = () => {
    if (!selectedFolio) {
      alert('Please select a folio row to reinstate.');
      return;
    }

    // Video 26 Frame 035 prerequisite check
    if (isRoomDirty) {
      setCurrentView('room-clean-check');
      return;
    }

    setShowConfirmModal(true);
  };

  // Perform Final Reinstatement
  const handleExecuteReinstate = () => {
    setShowConfirmModal(false);

    if (onReinstateFolio) {
      onReinstateFolio({
        billNo: selectedFolio.billNo,
        roomNo: selectedFolio.roomNo,
        guestName: selectedFolio.guestName,
        regNo: selectedFolio.regNo,
        billAmount: selectedFolio.billAmount,
        settlement: selectedFolio.settlement,
        accountingDate
      });
    }

    // Remove reinstated folio from checked out list
    setFoliosList(prev => prev.filter(f => f.billNo !== selectedFolio.billNo));
    setStatusNotice(`Folio Bill #${selectedFolio.billNo} for Room ${selectedFolio.roomNo} (${selectedFolio.guestName}) has been successfully REINSTATED in-house!`);
  };

  return (
    <div 
      className="ids-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '10px'
      }}
    >
      {/* Primary Window Container */}
      <div 
        className="ids-window"
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 6px 20px rgba(0,0,0,0.6)',
          backgroundColor: '#ECE9D8',
          border: '2px solid #002D96',
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        {/* Windows XP Classic Title Bar */}
        <div 
          className="ids-window-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFFFFF',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={14} color="#FFF" />
            <span>Folio Re-Instate V6.5.002.1 (Reinstate Checked-Out Room to In-House)</span>
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            <button 
              className="ids-titlebar-btn"
              style={{
                width: '18px',
                height: '18px',
                lineHeight: '14px',
                textAlign: 'center',
                background: '#D4D0C8',
                border: '1px outset #FFF',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: '11px'
              }}
              onClick={onClose}
              title="Close Window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video 26 Operational Rule Banner (Frame 035) */}
        <div 
          style={{ 
            background: '#FFF3CD', 
            borderBottom: '1px solid #FFEBAA', 
            padding: '5px 12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D9534F', fontWeight: 700 }}>
            <AlertTriangle size={15} color="#D9534F" />
            <span>Operational Rule (Video 26 Frame 035): Before doing Folio Reinstate make sure your room is clean.</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {selectedFolio && (
              <span style={{ 
                padding: '1px 6px', 
                background: clearedRooms.includes(selectedFolio.roomNo) ? '#D4EDDA' : '#F8D7DA',
                color: clearedRooms.includes(selectedFolio.roomNo) ? '#155724' : '#721C24',
                border: '1px solid',
                borderColor: clearedRooms.includes(selectedFolio.roomNo) ? '#C3E6CB' : '#F5C6CB',
                borderRadius: '2px',
                fontWeight: 700
              }}>
                Room {selectedFolio.roomNo}: {clearedRooms.includes(selectedFolio.roomNo) ? 'Clean (Ready)' : 'Dirty (Requires Clear Room)'}
              </span>
            )}
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div 
            style={{ 
              background: '#D4EDDA', 
              color: '#155724', 
              padding: '4px 10px', 
              borderBottom: '1px solid #C3E6CB',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={13} color="#155724" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Main Content Area matching Video 26 Frame 055 */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {currentView === 'reinstate-dialog' ? (
            <div>
              {/* Header Title & Filter Dropdown matching Frame 055 */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '10px' 
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A', textDecoration: 'underline' }}>
                  Folio Re-Instate
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600 }}>Re-Instate:</span>
                  <select 
                    value={reinstateType}
                    onChange={(e) => setReinstateType(e.target.value)}
                    style={{ 
                      width: '140px', 
                      background: '#FFF', 
                      border: '1px inset #999', 
                      padding: '2px 4px',
                      fontSize: '11px'
                    }}
                  >
                    <option value="Transaction (s)">Transaction (s)</option>
                    <option value="All Checked-Out">All Checked-Out</option>
                  </select>
                </div>
              </div>

              {/* Folio Grid Table matching Frame 055 */}
              <div 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #7F9DB9', 
                  minHeight: '220px', 
                  maxHeight: '280px',
                  overflowY: 'auto',
                  marginBottom: '10px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0, zIndex: 5 }}>
                    <tr style={{ borderBottom: '1px solid #ACA899' }}>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '55px' }}>Bill #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '65px' }}>Room #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '55px' }}>Reg #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8' }}>Guest Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '85px', textAlign: 'right' }}>Bill Amount</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '85px' }}>Settlement</th>
                      <th style={{ padding: '3px 6px', width: '70px', textAlign: 'center' }}>C/O Bill #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foliosList.length > 0 ? (
                      foliosList.map(folio => {
                        const isSelected = folio.billNo === selectedBillNo;
                        return (
                          <tr 
                            key={folio.billNo}
                            style={{ 
                              borderBottom: '1px solid #EEE',
                              background: isSelected ? '#316AC5' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#000000',
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectedBillNo(folio.billNo)}
                            onDoubleClick={() => setActiveDetailFolio(folio)}
                          >
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8', fontWeight: 700 }}>
                              {folio.billNo}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8', fontWeight: 600 }}>
                              {folio.roomNo}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8' }}>
                              {folio.regNo}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8', fontWeight: 600 }}>
                              {folio.guestName}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8', textAlign: 'right', fontWeight: 700 }}>
                              {folio.billAmount.toFixed(0)}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: isSelected ? '1px solid #5A8BD8' : '1px solid #ECE9D8' }}>
                              {folio.settlement}
                            </td>
                            <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                              {folio.coBillNo}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                          No checked-out folios pending reinstatement. All rooms are in-house.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Lower Section: Instruction Note + Legend Checkboxes matching Frame 055 */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  fontSize: '11px',
                  marginBottom: '16px'
                }}
              >
                {/* Note */}
                <div style={{ color: '#555', fontStyle: 'italic', paddingTop: '4px' }}>
                  Note: Double click on Bill# to view room details
                </div>

                {/* Legend matching Frame 055 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', background: '#00FFFF', border: '1px solid #000' }}></span>
                    <span>In-house (Part Bill)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', background: '#808080', border: '1px solid #000' }}></span>
                    <span>Room Occupied</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', background: '#FFFFFF', border: '1px solid #000' }}></span>
                    <span>Link Room Bill</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons matching Frame 055 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ 
                    width: '90px', 
                    fontWeight: 700, 
                    color: '#0A246A',
                    background: '#FFE8A1',
                    borderColor: '#316AC5'
                  }}
                  onClick={handleReinstateClick}
                  disabled={foliosList.length === 0}
                  title="Reinstate selected folio (Video 26 Frame 060)"
                >
                  Re-Instate
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ width: '80px' }}
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               VIEW 2: ROOM STATUS CLEAN CHECK / CLEAR ROOM POPUP (Frames 025–040)
               ========================================================================= */
            <div style={{ background: '#FFF', border: '1px solid #ACA899', padding: '16px', borderRadius: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#D9534F' }}>
                <AlertTriangle size={24} color="#D9534F" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>
                    Room Status Check: Room {selectedFolio.roomNo} is Dirty (D/EXE)
                  </div>
                  <div style={{ fontSize: '11px', color: '#555' }}>
                    In IDS 6.5 & 7.0 PMS (Video 26 Frame 035), you must clear the room before Folio Reinstate can execute.
                  </div>
                </div>
              </div>

              {/* Clear Room mini dialog replica matching Frame 035 */}
              <div 
                style={{ 
                  background: '#F0ECE0', 
                  border: '1px inset #999', 
                  padding: '12px', 
                  fontSize: '11px',
                  display: 'grid',
                  gridTemplateColumns: '120px 180px 100px 1fr',
                  rowGap: '10px',
                  columnGap: '8px',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontWeight: 600 }}>Room#</div>
                <div>
                  <input type="text" readOnly value={selectedFolio.roomNo} style={{ width: '80px', background: '#FFF', border: '1px inset #999', padding: '2px 4px', fontWeight: 700 }} />
                </div>

                <div style={{ fontWeight: 600 }}>Room Status</div>
                <div>
                  <select style={{ width: '120px', background: '#FFF', border: '1px inset #999', padding: '2px 4px', fontWeight: 700, color: '#006600' }}>
                    <option value="Clean">Clean</option>
                  </select>
                </div>

                <div style={{ fontWeight: 600 }}>House Keeping Staff</div>
                <div>
                  <input type="text" readOnly value="Jayanta Chetia" style={{ width: '160px', background: '#FFF', border: '1px inset #999', padding: '2px 4px' }} />
                </div>

                <div style={{ fontWeight: 600 }}>Authorized by</div>
                <div>
                  <input type="text" readOnly value="SUP" style={{ width: '80px', background: '#FFF', border: '1px inset #999', padding: '2px 4px', fontWeight: 700 }} />
                </div>

                <div style={{ fontWeight: 600 }}>Remarks</div>
                <div style={{ gridColumn: 'span 3' }}>
                  <input type="text" readOnly value="Cleared for folio reinstatement" style={{ width: '100%', background: '#FFF', border: '1px inset #999', padding: '2px 4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, color: '#006600', background: '#D4EDDA' }}
                  onClick={() => {
                    if (onClearRoom) onClearRoom(selectedFolio.roomNo);
                    setCurrentView('reinstate-dialog');
                    setStatusNotice(`Room ${selectedFolio.roomNo} marked CLEAN (V/EXE). Now ready for Folio Reinstate!`);
                  }}
                >
                  ✓ Clear Room & Proceed to Reinstate
                </button>
                <button 
                  className="ids-btn-classic"
                  onClick={() => setCurrentView('reinstate-dialog')}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Windows XP Status Bar */}
        <div 
          className="ids-statusbar"
          style={{
            background: '#ECE9D8',
            borderTop: '1px solid #ACA899',
            padding: '3px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#444'
          }}
        >
          <div>
            System Date: <strong>{accountingDate}</strong> | User: <strong>IT ADMIN</strong>
          </div>
          <div>
            IDS Fortune NEXT V6.5.002.1 • Video 26 (Folio Reinstate Option)
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL POPUP 1: CONFIRMATION PROMPT (Video 26 Frame 060)
          ========================================================================= */}
      {showConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '360px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Folio Re-Instate V6.5.002.1</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HelpCircle size={30} color="#002D96" style={{ flexShrink: 0 }} />
              <div>
                Do you want to Reinstate Bill #<strong>{selectedFolio.billNo}</strong> for Room #<strong>{selectedFolio.roomNo}</strong> ({selectedFolio.guestName})?
                <div style={{ marginTop: '6px', color: '#666', fontSize: '10px' }}>
                  This will reopen the folio and restore Room {selectedFolio.roomNo} to In-House Occupied status.
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: '14px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ width: '75px', fontWeight: 700 }}
                onClick={handleExecuteReinstate}
              >
                Yes
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ width: '75px' }}
                onClick={() => setShowConfirmModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL POPUP 2: DOUBLE-CLICK FOLIO DETAILS (Frame 055 Note)
          ========================================================================= */}
      {activeDetailFolio && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '400px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Folio Details - Bill #{activeDetailFolio.billNo}</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setActiveDetailFolio(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Room Number:</span>
                <strong>{activeDetailFolio.roomNo} ({activeDetailFolio.category})</strong>

                <span style={{ fontWeight: 600 }}>Guest Name:</span>
                <strong>{activeDetailFolio.guestName}</strong>

                <span style={{ fontWeight: 600 }}>Registration #:</span>
                <span>{activeDetailFolio.regNo}</span>

                <span style={{ fontWeight: 600 }}>Settled Bill Amount:</span>
                <strong>₹{activeDetailFolio.billAmount.toFixed(2)}</strong>

                <span style={{ fontWeight: 600 }}>Settlement Mode:</span>
                <span>{activeDetailFolio.settlement}</span>

                <span style={{ fontWeight: 600 }}>Arrival / Departure:</span>
                <span>{activeDetailFolio.arrivalDate} to {activeDetailFolio.departureDate}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '80px' }}
                  onClick={() => setActiveDetailFolio(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
