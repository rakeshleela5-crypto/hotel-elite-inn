import React, { useState, useEffect } from 'react';

/* =========================================================================
   VIDEO 13: HOW TO DO ROOM TRANSFER IN IDS 6.5 & 7.0 SOFTWARE
   Replication of:
   1. Room Transfer V6.5.002.1 Dialog (Frames 009, 013, 015, 024, 029)
   2. Radio options: "Room Change" vs "Swap Rooms"
   3. From Room# lookup, [ ? ] help button, room category indicator
   4. Transfer To room input and [ Show Rooms ] Room Rack modal (Frame 011, 027)
   5. Stay details table (Folio #, Reg. #, Guest Name, Arrival, Departure)
   6. Alert Confirmation Dialog: "Room Transfer operation is complete. If you want to change tariff use change tariff menu option." (ID: FOMT260, MSG CODE: 1427) (Frame 016, 031)
   7. Real-time Rack synchronization: Source room -> Dirty (yellow D/EXE), Target room -> Occupied (red O/EXE) (Frame 018)
   ========================================================================= */

export const VACANT_ROOMS_CATALOG = [
  { no: '201', type: 'EXE', block: 'BA-FF02', floor: '2' },
  { no: '203', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '204', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '205', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '206', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '207', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '208', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '209', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '210', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '211', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '212', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '214', type: 'DLX', block: 'BA-FF02', floor: '2' },
  { no: '215', type: 'EXE', block: 'BA-FF02', floor: '2' },
  { no: '216', type: 'SUI', block: 'BA-FF02', floor: '2' },
  { no: '308', type: 'DLX', block: 'BA-FF03', floor: '3' },
  { no: '309', type: 'DLX', block: 'BA-FF03', floor: '3' },
  { no: '416', type: 'SUI', block: 'BA-FF04', floor: '4' },
  { no: '509', type: 'DLX', block: 'BA-FF05', floor: '5' },
  { no: '510', type: 'DLX', block: 'BA-FF05', floor: '5' },
  { no: '511', type: 'DLX', block: 'BA-FF05', floor: '5' },
  { no: '512', type: 'DLX', block: 'BA-FF05', floor: '5' },
  { no: '514', type: 'DLX', block: 'BA-FF05', floor: '5' },
  { no: '601', type: 'PNH', block: 'BA-FF06', floor: '6' }
];

export default function IdsRoomTransferModal({
  isOpen,
  onClose,
  initialRoomNo = '415',
  inhouseGuests = [],
  onOpenRoomHelpLookup,
  onSaveRoomTransfer
}) {
  const [transferMode, setTransferMode] = useState('roomChange'); // 'roomChange' or 'swapRooms'
  const [fromRoomNo, setFromRoomNo] = useState(initialRoomNo || '415');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [toRoomNo, setToRoomNo] = useState('201');
  const [toRoomType, setToRoomType] = useState('EXE');
  const [showRoomRackPicker, setShowRoomRackPicker] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [rackTab, setRackTab] = useState('Vacant'); // 'Vacant', 'Occupied', 'Dirty', 'All'

  // Sync initial room and find guest
  useEffect(() => {
    if (initialRoomNo) {
      setFromRoomNo(initialRoomNo);
    }
  }, [initialRoomNo, isOpen]);

  useEffect(() => {
    const found = inhouseGuests.find(g => g.roomNo === fromRoomNo) || inhouseGuests[0];
    if (found) {
      setSelectedGuest(found);
      // Auto suggest matching or next room type based on Video 13 examples
      if (found.roomNo === '415') {
        setToRoomNo('201');
        setToRoomType('EXE');
      } else if (found.roomNo === '301') {
        setToRoomNo('215');
        setToRoomType('EXE');
      }
    }
  }, [fromRoomNo, inhouseGuests]);

  if (!isOpen) return null;

  const handleFromRoomChange = (e) => {
    const val = e.target.value;
    setFromRoomNo(val);
    const found = inhouseGuests.find(g => g.roomNo === val);
    if (found) {
      setSelectedGuest(found);
    }
  };

  const handleToRoomChange = (e) => {
    const val = e.target.value;
    setToRoomNo(val);
    const match = VACANT_ROOMS_CATALOG.find(r => r.no === val);
    if (match) {
      setToRoomType(match.type);
    }
  };

  const handleSelectVacantRoom = (room) => {
    setToRoomNo(room.no);
    setToRoomType(room.type);
    setShowRoomRackPicker(false);
  };

  const handleSave = () => {
    if (!fromRoomNo || !toRoomNo) {
      alert('Please specify both From Room and Transfer To Room.');
      return;
    }
    if (fromRoomNo === toRoomNo) {
      alert('Destination room must be different from source room.');
      return;
    }

    // Trigger authentic confirmation alert (Frame 016 & Frame 031)
    setShowSuccessAlert(true);
  };

  const handleAlertConfirm = () => {
    setShowSuccessAlert(false);

    if (onSaveRoomTransfer && selectedGuest) {
      onSaveRoomTransfer({
        fromRoom: fromRoomNo,
        toRoom: toRoomNo,
        toRoomType,
        guest: selectedGuest
      });
    }

    onClose();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1240 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '680px', maxWidth: '96vw', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#ECE9D8', position: 'relative' }}
      >
        {/* Title Bar matching Frame 009 & Frame 029 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Transfer V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          
          {/* Top Radio Selector matching Frame 009 */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: transferMode === 'roomChange' ? 700 : 400 }}>
              <input 
                type="radio" 
                name="transferMode" 
                checked={transferMode === 'roomChange'} 
                onChange={() => setTransferMode('roomChange')} 
              />
              Room Change
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: transferMode === 'swapRooms' ? 700 : 400 }}>
              <input 
                type="radio" 
                name="transferMode" 
                checked={transferMode === 'swapRooms'} 
                onChange={() => setTransferMode('swapRooms')} 
              />
              Swap Rooms
            </label>
          </div>

          {/* Group Box: Room Change */}
          <div className="ids-groupbox" style={{ marginBottom: '10px', padding: '8px' }}>
            <span className="ids-groupbox-title">Room Change</span>

            {/* Room Transfer Fields Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>Room#</span>
              <input 
                className="ids-input" 
                value={fromRoomNo} 
                onChange={handleFromRoomChange}
                style={{ width: '65px', fontWeight: 700, background: '#FFF' }} 
              />
              <button 
                className="ids-btn-classic" 
                style={{ padding: '0 6px', fontWeight: 700 }}
                onClick={onOpenRoomHelpLookup}
                title="Search occupied room in house (Frame 024)"
              >
                ?
              </button>
              <input 
                className="ids-input" 
                value={selectedGuest?.roomType || 'EXE'} 
                readOnly 
                style={{ width: '60px', background: '#EBEBE4', fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 600, marginLeft: '14px' }}>Transfer To</span>
              <input 
                className="ids-input" 
                value={toRoomNo} 
                onChange={handleToRoomChange}
                style={{ width: '70px', fontWeight: 700, color: '#0A246A', background: '#FFF' }} 
              />
              <input 
                className="ids-input" 
                value={toRoomType} 
                readOnly 
                style={{ width: '60px', background: '#EBEBE4', fontWeight: 600 }} 
              />
            </div>

            {/* Stay Details Table matching Frame 009 & Frame 029 */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', maxHeight: '180px', minHeight: '140px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ width: '50px', border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Folio #</th>
                    <th style={{ width: '60px', border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Reg. #</th>
                    <th style={{ width: '220px', border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Guest Name</th>
                    <th style={{ width: '130px', border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Arrival</th>
                    <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Departure</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGuest ? (
                    <tr style={{ background: '#FFFDF0' }}>
                      <td style={{ border: '1px solid #CCC', padding: '3px 4px', fontWeight: 600 }}>
                        {selectedGuest.folioNo?.split('/')[1]?.trim() || '1'}
                      </td>
                      <td style={{ border: '1px solid #CCC', padding: '3px 4px', fontWeight: 600 }}>
                        {selectedGuest.regNo || '613'}
                      </td>
                      <td style={{ border: '1px solid #CCC', padding: '3px 4px', fontWeight: 700, color: '#0A246A' }}>
                        {selectedGuest.guestName || `${selectedGuest.title} ${selectedGuest.lastName || ''} ${selectedGuest.firstName || ''}`}
                      </td>
                      <td style={{ border: '1px solid #CCC', padding: '3px 4px' }}>
                        {selectedGuest.arrival || '16-JAN-2022 12:02'}
                      </td>
                      <td style={{ border: '1px solid #CCC', padding: '3px 4px' }}>
                        {selectedGuest.departure || '18-JAN-2022 12:00'}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '10px', color: '#888' }}>
                        Select an occupied room to view details.
                      </td>
                    </tr>
                  )}
                  {/* Empty rows matching authentic Fortune NEXT table layout */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={`empty-${i}`} style={{ height: '20px' }}>
                      <td style={{ border: '1px solid #F0F0F0' }}></td>
                      <td style={{ border: '1px solid #F0F0F0' }}></td>
                      <td style={{ border: '1px solid #F0F0F0' }}></td>
                      <td style={{ border: '1px solid #F0F0F0' }}></td>
                      <td style={{ border: '1px solid #F0F0F0' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Command Bar matching Frame 009 & Frame 029 */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '105px', fontWeight: 700 }}
              onClick={() => setShowRoomRackPicker(true)}
              title="Show Room Rack to pick vacant room (Frame 011 & 027)"
            >
              Show Rooms
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px', fontWeight: 700 }}
                onClick={handleSave}
              >
                <u>S</u>ave
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={() => {
                  setToRoomNo('');
                  setToRoomType('');
                }}
              >
                Clear
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={onClose}
              >
                Exit
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROOM RACK V6.5.002.2 SELECTION MODAL (Frame 011 & 027)
            ========================================================================= */}
        {showRoomRackPicker && (
          <div 
            className="ids-modal-overlay" 
            style={{ zIndex: 1260 }} 
            onClick={() => setShowRoomRackPicker(false)}
          >
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '96vw', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', background: '#ECE9D8' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Rack V6.5.002.2</span>
                <button className="ids-win-btn close" onClick={() => setShowRoomRackPicker(false)}>✕</button>
              </div>

              <div style={{ padding: '8px 10px', fontSize: '11px' }}>
                {/* Header Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span>Room#</span>
                  <input className="ids-input" style={{ width: '80px' }} placeholder="Filter..." />
                  
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                    <button className="ids-btn-classic" style={{ padding: '2px 6px' }} title="Bridge">🌉</button>
                    <button className="ids-btn-classic" style={{ padding: '2px 6px' }} title="Transfer">🔄</button>
                    <button className="ids-btn-classic" style={{ padding: '2px 6px' }} title="Beds">🛏️</button>
                    <button className="ids-btn-classic" style={{ padding: '2px 8px' }} onClick={() => setShowRoomRackPicker(false)}>Exit</button>
                  </div>
                </div>

                {/* Tabs matching Frame 011 */}
                <div style={{ display: 'flex', borderBottom: '1px solid #7F9DB9', marginBottom: '6px' }}>
                  {['Vacant', 'Occupied', 'Dirty', 'All'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRackTab(tab)}
                      style={{
                        padding: '4px 14px',
                        border: '1px solid #7F9DB9',
                        borderBottom: rackTab === tab ? '1px solid #ECE9D8' : '1px solid #7F9DB9',
                        background: rackTab === tab ? '#ECE9D8' : '#D4D0C8',
                        fontWeight: rackTab === tab ? 700 : 400,
                        cursor: 'pointer',
                        fontSize: '11px',
                        marginBottom: '-1px'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Vacant Rooms List Grid matching Frame 011 */}
                <div style={{ border: '1px solid #7F9DB9', background: '#FFF', maxHeight: '240px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ width: '100px', border: '1px solid #CCC', padding: '3px 6px', textAlign: 'left' }}>Room#</th>
                        <th style={{ width: '60px', border: '1px solid #CCC', padding: '3px 6px', textAlign: 'left' }}>Type</th>
                        <th style={{ width: '80px', border: '1px solid #CCC', padding: '3px 6px', textAlign: 'left' }}>Block</th>
                        <th style={{ width: '60px', border: '1px solid #CCC', padding: '3px 6px', textAlign: 'left' }}>Floor</th>
                        <th style={{ border: '1px solid #CCC', padding: '3px 6px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VACANT_ROOMS_CATALOG.filter(r => r.no !== fromRoomNo).map(r => (
                        <tr 
                          key={r.no}
                          style={{ cursor: 'pointer', background: toRoomNo === r.no ? '#316AC5' : '#FFF', color: toRoomNo === r.no ? '#FFF' : '#000' }}
                          onDoubleClick={() => handleSelectVacantRoom(r)}
                        >
                          <td style={{ border: '1px solid #E0E0E0', padding: '4px 6px', fontWeight: 700 }}>
                            {r.no}
                          </td>
                          <td style={{ border: '1px solid #E0E0E0', padding: '4px 6px' }}>
                            {r.type}
                          </td>
                          <td style={{ border: '1px solid #E0E0E0', padding: '4px 6px' }}>
                            {r.block}
                          </td>
                          <td style={{ border: '1px solid #E0E0E0', padding: '4px 6px' }}>
                            {r.floor}
                          </td>
                          <td style={{ border: '1px solid #E0E0E0', padding: '2px 4px', textAlign: 'center' }}>
                            <button 
                              className="ids-btn-classic" 
                              style={{ fontSize: '10px', padding: '1px 8px' }}
                              onClick={() => handleSelectVacantRoom(r)}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#555' }}>
                    💡 Double-click any room to assign as Transfer To room.
                  </span>
                  <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setShowRoomRackPicker(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONFIRMATION POPUP ALERT (Frame 016 & Frame 031)
            ========================================================================= */}
        {showSuccessAlert && (
          <div 
            className="ids-modal-overlay" 
            style={{ zIndex: 1280 }}
          >
            <div 
              className="ids-dialog-window" 
              style={{ width: '420px', maxWidth: '94vw', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', background: '#FFFFE1', border: '2px solid #808080' }}
            >
              {/* Alert Title Bar matching Frame 016 */}
              <div className="ids-dialog-titlebar plain" style={{ background: '#ECE9D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>Room Transfer V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={handleAlertConfirm}>✕</button>
              </div>

              <div style={{ padding: '14px 16px', fontSize: '11px', background: '#FFFFF0' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  {/* Yellow Warning Triangle Icon matching Frame 016 */}
                  <span style={{ fontSize: '28px', color: '#F5B041', lineHeight: 1 }}>⚠️</span>
                  <div style={{ lineHeight: '1.4', color: '#000' }}>
                    Room Transfer operation is complete. If you want to change tariff use change tariff menu option.
                  </div>
                </div>

                {/* Footer matching Frame 016 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#333' }}>
                    <span>ID: FOMT260</span>
                    <span style={{ marginLeft: '16px' }}>MSG CODE: 1427</span>
                  </div>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '60px', fontWeight: 700 }}
                    onClick={handleAlertConfirm}
                  >
                    Exit
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
