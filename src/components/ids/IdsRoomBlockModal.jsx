import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_ROOM_BLOCKS } from '../../data/idsPmsStore';

export default function IdsRoomBlockModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2022',
  onBlockChange,
  onOpenMessageBox
}) {
  const [displayFrom, setDisplayFrom] = useState(accountingDate);
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');

  // Blocks State
  const [roomBlocks, setRoomBlocks] = useState(INITIAL_ROOM_BLOCKS);

  // Sub-Dialogs
  const [blockPromptOpen, setBlockPromptOpen] = useState(false);
  const [releasePromptOpen, setReleasePromptOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [saveSuccessMsgOpen, setSaveSuccessMsgOpen] = useState(false);

  // Form for New Block
  const [blockForm, setBlockForm] = useState({
    roomNo: '206',
    blockType: 'OOO', // OOO or OOS
    fromDate: accountingDate,
    toDate: '29-JAN-2022',
    reasonCode: 'AC-REPAIR',
    reasonDescription: 'AC cooling coil replacement & maintenance',
    authorizedBy: 'DUTY MANAGER'
  });

  if (!isOpen) return null;

  // Calendar 30-Day Sequence
  const daysHeader = [
    { day: 'T', date: '27', full: '27-JAN-2022' },
    { day: 'F', date: '28', full: '28-JAN-2022' },
    { day: 'S', date: '29', full: '29-JAN-2022' },
    { day: 'S', date: '30', full: '30-JAN-2022' },
    { day: 'M', date: '31', full: '31-JAN-2022' },
    { day: 'T', date: '01', full: '01-FEB-2022' },
    { day: 'W', date: '02', full: '02-FEB-2022' },
    { day: 'T', date: '03', full: '03-FEB-2022' },
    { day: 'F', date: '04', full: '04-FEB-2022' },
    { day: 'S', date: '05', full: '05-FEB-2022' },
    { day: 'S', date: '06', full: '06-FEB-2022' },
    { day: 'M', date: '07', full: '07-FEB-2022' },
    { day: 'T', date: '08', full: '08-FEB-2022' },
    { day: 'W', date: '09', full: '09-FEB-2022' },
    { day: 'T', date: '10', full: '10-FEB-2022' },
    { day: 'F', date: '11', full: '11-FEB-2022' },
    { day: 'S', date: '12', full: '12-FEB-2022' },
    { day: 'S', date: '13', full: '13-FEB-2022' },
    { day: 'M', date: '14', full: '14-FEB-2022' },
    { day: 'T', date: '15', full: '15-FEB-2022' },
    { day: 'W', date: '16', full: '16-FEB-2022' },
    { day: 'T', date: '17', full: '17-FEB-2022' },
    { day: 'F', date: '18', full: '18-FEB-2022' },
    { day: 'S', date: '19', full: '19-FEB-2022' },
    { day: 'S', date: '20', full: '20-FEB-2022' }
  ];

  const floorsList = [
    {
      floorName: 'BA-FF02 (2nd Floor)',
      rooms: [
        { roomNo: '201', type: 'EXE', occupied: true, occRange: ['27', '28'] },
        { roomNo: '203', type: 'DLX', occupied: false },
        { roomNo: '204', type: 'DLX', occupied: false },
        { roomNo: '205', type: 'DLX', occupied: true, occRange: ['27', '28', '29', '30', '31', '01'] },
        { roomNo: '206', type: 'DLX', occupied: false },
        { roomNo: '207', type: 'DLX', occupied: false },
        { roomNo: '208', type: 'DLX', occupied: false },
        { roomNo: '209', type: 'DLX', occupied: false },
        { roomNo: '210', type: 'DLX', occupied: false },
        { roomNo: '211', type: 'DLX', occupied: false }
      ]
    },
    {
      floorName: 'BA-FF03 (3rd Floor)',
      rooms: [
        { roomNo: '301', type: 'EXE', occupied: true, occRange: ['27', '28'] },
        { roomNo: '303', type: 'DLX', occupied: false },
        { roomNo: '304', type: 'DLX', occupied: false },
        { roomNo: '305', type: 'DLX', occupied: false },
        { roomNo: '306', type: 'DLX', occupied: false },
        { roomNo: '307', type: 'DLX', occupied: false }
      ]
    }
  ];

  const getCellStatus = (room, dateObj) => {
    // Check if blocked
    const activeBlock = roomBlocks.find(b => b.roomNo === room.roomNo && b.status === 'Active');
    if (activeBlock) {
      if (['27', '28', '29'].includes(dateObj.date)) {
        return { type: activeBlock.blockType, label: activeBlock.blockType, block: activeBlock };
      }
    }

    // Check if occupied
    if (room.occupied && room.occRange && room.occRange.includes(dateObj.date)) {
      return { type: 'OCCUPIED', label: 'OC' };
    }

    return { type: 'VACANT', label: '' };
  };

  const handleCellClick = (room, dateObj, cellStatus) => {
    if (cellStatus.type === 'OOO' || cellStatus.type === 'OOS') {
      // Release Block Prompt (Video 10)
      setSelectedCell({ room, dateObj, cellStatus });
      setReleasePromptOpen(true);
    } else if (cellStatus.type === 'VACANT') {
      // Add Block Prompt (Video 09)
      setSelectedCell({ room, dateObj, cellStatus });
      setBlockForm({
        roomNo: room.roomNo,
        blockType: 'OOO',
        fromDate: dateObj.full,
        toDate: '29-JAN-2022',
        reasonCode: 'MAINTENANCE',
        reasonDescription: 'Preventive deep cleaning & AC maintenance',
        authorizedBy: 'DUTY MANAGER'
      });
      setBlockPromptOpen(true);
    }
  };

  const handleConfirmBlock = () => {
    setBlockPromptOpen(false);
    setProgressVisible(true);

    setTimeout(() => {
      setProgressVisible(false);
      const newBlock = {
        blockId: `BLK-${accountingDate.slice(-4)}-${String(roomBlocks.length + 1).padStart(3, '0')}`,
        roomNo: blockForm.roomNo,
        roomType: 'DLX',
        floor: 'BA-FF02',
        blockType: blockForm.blockType,
        fromDate: blockForm.fromDate,
        toDate: blockForm.toDate,
        reasonCode: blockForm.reasonCode,
        reasonDescription: blockForm.reasonDescription,
        authorizedBy: blockForm.authorizedBy,
        remarks: blockForm.reasonDescription,
        status: 'Active'
      };

      const updated = [...roomBlocks, newBlock];
      setRoomBlocks(updated);

      if (onBlockChange) {
        onBlockChange({ type: 'BLOCK_ADDED', block: newBlock, deltaSellable: blockForm.blockType === 'OOO' ? -1 : 0 });
      }

      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Room Block Saved',
          message: `Room ${blockForm.roomNo} successfully blocked as ${blockForm.blockType} (${blockForm.reasonDescription}). Rooms to sell reduced by 1.`,
          type: 'info'
        });
      }
    }, 700);
  };

  const handleConfirmRelease = () => {
    setReleasePromptOpen(false);
    setProgressVisible(true);

    setTimeout(() => {
      setProgressVisible(false);
      const updated = roomBlocks.filter(b => b.roomNo !== selectedCell.room.roomNo);
      setRoomBlocks(updated);

      if (onBlockChange) {
        onBlockChange({ type: 'BLOCK_RELEASED', roomNo: selectedCell.room.roomNo, deltaSellable: 1 });
      }

      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Room Block Released',
          message: `Room ${selectedCell.room.roomNo} block released. Status changed to Vacant Dirty for housekeeping cleaning. Rooms to sell restored.`,
          type: 'info'
        });
      }
    }, 600);
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '920px', 
          backgroundColor: '#ECE9D8',
          border: '2px solid #000',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '3px 6px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          <span>Room Block V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '12px' }}>
          {/* Top Filter Bar (Frame 024) */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '16px', 
              alignItems: 'center', 
              padding: '6px 12px',
              background: '#FFF',
              border: '1px solid #7F9DB9',
              fontSize: '11px',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Display From</span>
              <input 
                type="text" 
                value={displayFrom}
                onChange={(e) => setDisplayFrom(e.target.value)}
                style={{ width: '90px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Room Type</span>
              <select 
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                style={{ padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="All">All</option>
                <option value="DLX">Deluxe (DLX)</option>
                <option value="EXE">Executive (EXE)</option>
                <option value="SUI">Suite (SUI)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Block</span>
              <select 
                value={selectedBlockFilter}
                onChange={(e) => setSelectedBlockFilter(e.target.value)}
                style={{ padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="All">All</option>
                <option value="Main">Main Building</option>
                <option value="Annex">Annex Wing</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Floors</span>
              <select 
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                style={{ padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="All">All</option>
                <option value="2nd">2nd Floor (BA-FF02)</option>
                <option value="3rd">3rd Floor (BA-FF03)</option>
              </select>
            </div>
          </div>

          {/* Master Tape Chart / Calendar Grid (Frame 024 Exactly) */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              maxHeight: '360px', 
              overflowX: 'auto',
              overflowY: 'auto',
              fontSize: '11px' 
            }}
          >
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '880px' }}>
              <thead>
                {/* Month Row */}
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '90px', textAlign: 'left' }}>Room #</th>
                  <th colSpan={daysHeader.length} style={{ padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    JAN'2022 - FEB'2022
                  </th>
                </tr>

                {/* Day Letters Row */}
                <tr style={{ background: '#F0ECE4', borderBottom: '1px solid #CCC' }}>
                  <th style={{ borderRight: '1px solid #CCC' }}></th>
                  {daysHeader.map((d, idx) => (
                    <th key={idx} style={{ padding: '2px', borderRight: '1px solid #EEE', width: '28px', textAlign: 'center', fontSize: '10px', color: d.day === 'S' ? '#C00' : '#333' }}>
                      {d.day}
                    </th>
                  ))}
                </tr>

                {/* Day Numbers Row */}
                <tr style={{ background: '#ECE9D8', borderBottom: '2px solid #7F9DB9' }}>
                  <th style={{ borderRight: '1px solid #CCC' }}></th>
                  {daysHeader.map((d, idx) => (
                    <th key={idx} style={{ padding: '2px', borderRight: '1px solid #CCC', width: '28px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                      {d.date}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {floorsList.map((floor, fIdx) => (
                  <React.Fragment key={fIdx}>
                    {/* Floor Header Bar */}
                    <tr style={{ background: '#DCE6F1', borderBottom: '1px solid #B9CDE5' }}>
                      <td colSpan={daysHeader.length + 1} style={{ padding: '3px 8px', fontWeight: 'bold', color: '#0A246A' }}>
                        {floor.floorName}
                      </td>
                    </tr>

                    {/* Room Rows */}
                    {floor.rooms.map((rm, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #CCC', fontWeight: 'bold', background: '#F8F8F8' }}>
                          {rm.roomNo} / {rm.type}
                        </td>
                        {daysHeader.map((d, dIdx) => {
                          const status = getCellStatus(rm, d);
                          let cellBg = '#FFF';
                          let cellText = '';
                          let textColor = '#000';

                          if (status.type === 'OCCUPIED') {
                            cellBg = '#E65100'; // Orange
                            cellText = 'OC';
                            textColor = '#FFF';
                          } else if (status.type === 'OOO') {
                            cellBg = '#8D6E63'; // Brown Out of Order
                            cellText = 'OOO';
                            textColor = '#FFF';
                          } else if (status.type === 'OOS') {
                            cellBg = '#8E24AA'; // Purple Out of Service
                            cellText = 'OOS';
                            textColor = '#FFF';
                          }

                          return (
                            <td 
                              key={dIdx}
                              onClick={() => handleCellClick(rm, d, status)}
                              title={status.type === 'OOO' ? `Room ${rm.roomNo} Blocked (OOO)` : (status.type === 'OCCUPIED' ? `Room ${rm.roomNo} Occupied` : `Room ${rm.roomNo} Vacant`)}
                              style={{ 
                                padding: '2px', 
                                borderRight: '1px solid #EEE', 
                                textAlign: 'center', 
                                background: cellBg,
                                color: textColor,
                                fontSize: '9px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                height: '22px'
                              }}
                            >
                              {cellText}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color Legend & Command Bar (Frame 024 Exactly) */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '10px',
              padding: '6px 10px',
              background: '#ECE9D8',
              border: '1px solid #7F9DB9'
            }}
          >
            {/* Legend Tiles */}
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#FFF', border: '1px solid #999', display: 'inline-block' }}></span> Vacant
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#FFEB3B', border: '1px solid #999', display: 'inline-block' }}></span> Dirty
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#E65100', border: '1px solid #999', display: 'inline-block' }}></span> Occupied
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#8E24AA', border: '1px solid #999', display: 'inline-block' }}></span> OOS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#8D6E63', border: '1px solid #999', display: 'inline-block' }}></span> OOO
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', background: '#29B6F6', border: '1px solid #999', display: 'inline-block' }}></span> Reservation
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => {}} className="ids-btn" style={{ padding: '3px 12px', fontSize: '11px' }}>Refresh</button>
              <button onClick={() => setSaveSuccessMsgOpen(true)} className="ids-btn" style={{ padding: '3px 12px', fontSize: '11px', fontWeight: 'bold' }}>Save</button>
              <button onClick={onClose} className="ids-btn" style={{ padding: '3px 12px', fontSize: '11px' }}>Exit</button>
            </div>
          </div>
        </div>

        {/* Adding Block Details Progress Overlay (Video 10 Frame 018) */}
        {progressVisible && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '360px', background: '#ECE9D8', border: '2px solid #000', padding: '16px', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>ADDING BLOCK DETAILS ...</div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', height: '18px', padding: '2px' }}>
                <div style={{ background: '#0A246A', height: '100%', width: '70%', animation: 'pulse 1s infinite' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Create Block Sub-Dialog (Video 09) */}
        {blockPromptOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '420px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Block Room {blockForm.roomNo}</span>
                <button onClick={() => setBlockPromptOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px', fontSize: '11px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Block Type</label>
                    <select 
                      value={blockForm.blockType} 
                      onChange={(e) => setBlockForm({ ...blockForm, blockType: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                    >
                      <option value="OOO">OOO (Out of Order - Deduct from Sellable)</option>
                      <option value="OOS">OOS (Out of Service - Cosmetic hold)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>From Date</label>
                    <input type="text" value={blockForm.fromDate} onChange={(e) => setBlockForm({ ...blockForm, fromDate: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>To Date</label>
                    <input type="text" value={blockForm.toDate} onChange={(e) => setBlockForm({ ...blockForm, toDate: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Reason</label>
                    <input type="text" value={blockForm.reasonDescription} onChange={(e) => setBlockForm({ ...blockForm, reasonDescription: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Authorized By</label>
                    <input type="text" value={blockForm.authorizedBy} onChange={(e) => setBlockForm({ ...blockForm, authorizedBy: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <button onClick={handleConfirmBlock} className="ids-btn" style={{ padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}>Save Block</button>
                  <button onClick={() => setBlockPromptOpen(false)} className="ids-btn" style={{ padding: '3px 14px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Release Block Sub-Dialog (Video 10 Frame 018) */}
        {releasePromptOpen && selectedCell && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '420px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Release Block Room - {selectedCell.room.roomNo}</span>
                <button onClick={() => setReleasePromptOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px', fontSize: '11px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    Current Block: <strong style={{ color: '#8D6E63' }}>{selectedCell.cellStatus.type}</strong> ({selectedCell.cellStatus.block?.reasonDescription || 'AC Repair'})
                  </div>
                  <div>
                    Release to Status:
                    <select style={{ width: '100%', marginTop: '4px', padding: '2px', border: '1px solid #7F9DB9' }}>
                      <option value="Vacant Dirty">Vacant Dirty (Requires Housekeeping Cleaning)</option>
                      <option value="Vacant Clean">Vacant Clean (Immediate Check-in Ready)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <button onClick={handleConfirmRelease} className="ids-btn" style={{ padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}>Confirm Release</button>
                  <button onClick={() => setReleasePromptOpen(false)} className="ids-btn" style={{ padding: '3px 14px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentic Win32 MessageBox on Save (HK Video 09 Frame 030 Exactly) */}
        {saveSuccessMsgOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '420px', background: '#ECE9D8', border: '2px solid #FFF', borderRightColor: '#716F64', borderBottomColor: '#716F64', boxShadow: '4px 4px 14px rgba(0,0,0,0.6)', fontFamily: 'Tahoma, Arial, sans-serif' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Room Block V6.5.002.1</span>
                <button onClick={() => { setSaveSuccessMsgOpen(false); onClose(); }} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: '20px 16px', background: '#ECE9D8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px', color: '#E65100', lineHeight: 1 }}>⚠️</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
                    All Records Saved Successfully! Exiting the Routine.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '10px', fontSize: '10px', color: '#555' }}>
                  <span><strong>ID:</strong> FOMK010</span>
                  <span><strong>MSG CODE:</strong> 2056</span>
                  <button 
                    onClick={() => {
                      setSaveSuccessMsgOpen(false);
                      onClose();
                    }} 
                    className="ids-btn" 
                    style={{ minWidth: '70px', padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
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
