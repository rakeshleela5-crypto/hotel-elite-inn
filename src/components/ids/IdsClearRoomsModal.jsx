import React, { useState, useEffect } from 'react';

/* =========================================================================
   VIDEO 09: CLEAR ROOMS V6.5.002.1 MODAL (Frames 038–054)
   Replication of:
   1. Window Title: "Clear Rooms V6.5.002.1"
   2. Block & Floor filters (All)
   3. Checkbox "Show only Dirty Room" (checked)
   4. Checkbox "Clean All Rooms" (toggles Status from Dirty to Clean for all loaded rooms)
   5. Interactive Grid Table with Room#, Type, Occupied, Status, HSK Staff, Authorized by,
      Blocked Date & Time, Guest Name / Reason, Last Updated User ID
   6. Command Buttons: [ Load ], [ Save ], [ Clear ], [ Panel ], [ Exit ]
   ========================================================================= */

export default function IdsClearRoomsModal({
  isOpen,
  onClose,
  clearedRooms = [],
  checkedOutRooms = [],
  onClearAllDirtyRooms,
  onOpenRoomRack
}) {
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterFloor, setFilterFloor] = useState('All');
  const [showOnlyDirty, setShowOnlyDirty] = useState(true);
  const [cleanAllRoomsChecked, setCleanAllRoomsChecked] = useState(false);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Master dirty room dataset matching Video 09 Frame 045
  const initialDirtyRooms = [
    { roomNo: '204', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '205', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '206', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '207', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '208', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '209', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'ADMIN' },
    { roomNo: '210', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '211', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '212', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '214', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '215', type: 'EXE', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' },
    { roomNo: '216', type: 'SUI', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'MANORANJAN' },
    { roomNo: '308', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'MANORANJAN' },
    { roomNo: '309', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'DHONSING' },
    { roomNo: '601', type: 'PNH', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'MANORANJAN' }
  ];

  // Video 16 Frame 092: Include any checked-out rooms (e.g. Sharma Group 10 rooms) that are now Dirty
  const checkedOutDirtyRooms = checkedOutRooms
    .filter(r => !clearedRooms.includes(r) && !['201', '203'].includes(r) && !initialDirtyRooms.some(x => x.roomNo === r))
    .map(r => ({
      roomNo: r,
      type: 'DLX',
      occupied: '',
      status: 'Dirty',
      hskStaff: '',
      authorizedBy: '',
      blockedDateTime: '',
      guestReason: '',
      lastUpdated: 'MANAGER'
    }));

  // Include 201 and 203 if they haven't been individually cleaned yet
  const fullInitialList = [
    ...checkedOutDirtyRooms,
    ...(!clearedRooms.includes('201') ? [{ roomNo: '201', type: 'EXE', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' }] : []),
    ...(!clearedRooms.includes('203') ? [{ roomNo: '203', type: 'DLX', occupied: '', status: 'Dirty', hskStaff: '', authorizedBy: '', blockedDateTime: '', guestReason: '', lastUpdated: 'IDS' }] : []),
    ...initialDirtyRooms.filter(r => !clearedRooms.includes(r.roomNo))
  ];

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCleanAllRoomsChecked(false);
      setTableLoaded(false);
      setSaveSuccessMessage(false);
      setRows([]);
    }
  }, [isOpen]);

  const handleLoad = () => {
    setRows(fullInitialList);
    setTableLoaded(true);
    setSaveSuccessMessage(false);
  };

  const handleToggleCleanAll = (checked) => {
    setCleanAllRoomsChecked(checked);
    if (tableLoaded) {
      setRows(prev => prev.map(r => ({
        ...r,
        status: checked ? 'Clean' : 'Dirty',
        authorizedBy: checked ? 'HK SUPERVISOR' : r.authorizedBy,
        hskStaff: checked ? (r.hskStaff || 'Lakshyajit Changmai') : r.hskStaff
      })));
    }
  };

  const handleSave = () => {
    if (onClearAllDirtyRooms) {
      const allRoomNos = rows.map(r => r.roomNo);
      onClearAllDirtyRooms(allRoomNos);
    }
    setSaveSuccessMessage(true);
    setTimeout(() => {
      onClose();
      if (onOpenRoomRack) onOpenRoomRack();
    }, 900);
  };

  const handleClear = () => {
    setRows([]);
    setTableLoaded(false);
    setCleanAllRoomsChecked(false);
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '920px', 
          maxWidth: '96vw', 
          height: '560px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Title Bar matching Frame 042 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Clear Rooms V6.5.002.1</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button className="ids-win-btn" style={{ padding: '0 4px', fontSize: '9px' }}>_</button>
            <button className="ids-win-btn" style={{ padding: '0 4px', fontSize: '9px' }}>□</button>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ECE9D8', padding: '8px 10px', fontSize: '11px', overflow: 'hidden' }}>
          
          {/* Top Filter Strip matching Frame 042 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '40px', fontWeight: 600 }}>Block</span>
                <select 
                  className="ids-select" 
                  value={filterBlock} 
                  onChange={(e) => setFilterBlock(e.target.value)}
                  style={{ width: '80px', fontWeight: 600 }}
                >
                  <option value="All">All</option>
                  <option value="BA">BA</option>
                  <option value="BB">BB</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '40px', fontWeight: 600 }}>Floor</span>
                <select 
                  className="ids-select" 
                  value={filterFloor} 
                  onChange={(e) => setFilterFloor(e.target.value)}
                  style={{ width: '130px', fontWeight: 600 }}
                >
                  <option value="All">All</option>
                  <option value="01">Floor 01</option>
                  <option value="02">Floor 02</option>
                  <option value="03">Floor 03</option>
                  <option value="04">Floor 04</option>
                  <option value="05">Floor 05</option>
                </select>
              </div>
            </div>

            {/* Checkboxes matching Frame 042 & 052 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginRight: '80px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={showOnlyDirty} 
                  onChange={(e) => setShowOnlyDirty(e.target.checked)} 
                />
                Show only Dirty Room
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: '#0A246A' }}>
                <input 
                  type="checkbox" 
                  checked={cleanAllRoomsChecked} 
                  onChange={(e) => handleToggleCleanAll(e.target.checked)} 
                />
                Clean All Rooms
              </label>
            </div>
          </div>

          {/* Table Grid matching Frame 045 & 052 */}
          <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', zIndex: 1, borderBottom: '1px solid #808080' }}>
                <tr>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '55px' }}>Room#</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '45px' }}>Type</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '60px' }}>Occupied</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '60px' }}>Status</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '120px' }}>HSK Staff</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '110px' }}>Authorized by</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700, width: '120px' }}>Blocked Date & Time</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #B5B2AB', fontWeight: 700 }}>Guest Name / Reason</th>
                  <th style={{ padding: '3px 6px', fontWeight: 700, width: '110px' }}>Last Updated User ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                      {tableLoaded ? 'No dirty rooms found in this criteria.' : 'Click [ Load ] below to fetch dirty room list.'}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr 
                      key={row.roomNo} 
                      style={{ 
                        background: idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                        borderBottom: '1px solid #E5E5E5'
                      }}
                    >
                      <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E5E5E5' }}>{row.roomNo}</td>
                      <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #E5E5E5' }}>{row.type}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E5E5E5' }}>{row.occupied}</td>
                      <td style={{ 
                        padding: '3px 6px', 
                        fontWeight: 700, 
                        color: row.status === 'Clean' ? '#008000' : '#000',
                        borderRight: '1px solid #E5E5E5' 
                      }}>
                        {row.status}
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E5E5E5' }}>{row.hskStaff}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E5E5E5' }}>{row.authorizedBy}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E5E5E5' }}>{row.blockedDateTime}</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #E5E5E5' }}>{row.guestReason}</td>
                      <td style={{ padding: '3px 6px' }}>{row.lastUpdated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Success Notification */}
          {saveSuccessMessage && (
            <div style={{ marginTop: '6px', padding: '4px 8px', background: '#DFF0D8', border: '1px solid #D6E9C6', color: '#3C763D', textAlign: 'center', fontWeight: 700 }}>
              ✓ All dirty rooms cleared successfully! Redirecting to Room Status console...
            </div>
          )}

          {/* Bottom Button Bar matching Frame 042 & 052 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px', fontWeight: 700 }}
              onClick={handleLoad}
            >
              <u>L</u>oad
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px', fontWeight: 700 }}
              onClick={handleSave}
              disabled={rows.length === 0}
            >
              <u>S</u>ave
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={handleClear}
            >
              Clear
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
            >
              Panel
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={onClose}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
