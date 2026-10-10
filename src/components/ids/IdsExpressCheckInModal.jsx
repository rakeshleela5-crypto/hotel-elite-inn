import React, { useState } from 'react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { 
  Building2, Users, Check, X, Calendar, DollarSign, 
  Search, RefreshCw, Printer, FileText, ChevronRight, BedDouble, Sparkles, ArrowRightLeft
} from 'lucide-react';
import { INITIAL_ACCOUNTING_DATE, NEXT_ACCOUNTING_DATE } from '../../data/idsPmsStore';

/* =========================================================================
   VIDEOS 06 & 07: EXPRESS CHECK-IN (SINGLE & GROUP MULTI-ROOM) IN IDS 6.5 & 7.0
   Replication of:
   1. Express Check-In Console Split Window (Video 06 & Video 07 Frames 012 & 044)
   2. Single Room Express Check-In: Res # 274, Room 102 (Sharma Rajesh & Sharma Sunita)
   3. Group Multi-Room Check-In: Res # 276 (Group 003: Anil Kumar Group, 5 Rooms, 13 Pax)
   4. Group Allocation Console with summary & room assigning grid (Video 07 Frame 048)
   5. Room Type filter to 'EXE' and Room Availability Tape Chart (Frame 048–052)
   6. Progress overlay "Check-in Progress, Please wait..." (Frame 022)
   7. Confirmation Tables:
      - Single: Res # 274, Room 102, Reg # 585 & 586 (Video 06 Frame 024)
      - Group: Res # 276, Rooms 201, 205, 207, Reg # 613–618 (Video 07 Frame 056)
   8. Live desktop statistics & Room Rack Console synchronization (Frame 060)
   ========================================================================= */

export default function IdsExpressCheckInModal({
  isOpen,
  onClose,
  onCompleteExpressCheckin,
  onCompleteGroupCheckin,
  onCompleteUpgradeCheckin,
  onOpenStandardCheckin
}) {
  const [activeTab, setActiveTab] = useState('Expected Arrivals'); // 'Expected Arrivals' | 'No Show' | 'Next Day Arrivals'
  const [displayFilter, setDisplayFilter] = useState('ALL');
  const [searchGuestName, setSearchGuestName] = useState('');
  
  // Selection state
  const [selectedArrivalRes, setSelectedArrivalRes] = useState('276'); // Default to Group 276 or 274
  const [checkedArrivals, setCheckedArrivals] = useState({ '274': false, '276': true });
  const [rightViewMode, setRightViewMode] = useState('tape'); // 'tape' | 'preview'
  const [roomTypeFilter, setRoomTypeFilter] = useState('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmSummaryOpen, setConfirmSummaryOpen] = useState(false);
  const [groupSummaryOpen, setGroupSummaryOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('102');

  // Video 08: Room Category Upgrade & Reg Card States (Frames 012–050)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [regCardModalOpen, setRegCardModalOpen] = useState(false);
  const [upgradeOption, setUpgradeOption] = useState('Upgrade'); // 'None' | 'Upgrade' | 'Upselling'
  const [upgradeAuthorisedBy, setUpgradeAuthorisedBy] = useState('Manager');
  const [upgradeRemarks, setUpgradeRemarks] = useState('Executive');
  const [printRegCardOpt, setPrintRegCardOpt] = useState('GUEST PHOTO REG.CA');
  const [is309Upgraded, setIs309Upgraded] = useState(false);
  const [hoveredRoomNo, setHoveredRoomNo] = useState('309');
  const [selectedArrivalRowIndex, setSelectedArrivalRowIndex] = useState(6); // Default row for Res 276 Anil Kumar Group (EXE)

  // Video 07: Mode toggle between Main Arrivals Grid vs Group Allocation Panel
  const [groupAllocationMode, setGroupAllocationMode] = useState(false);

  // Group 276 Room Allocations matching Video 07 Frame 048–052
  const [groupRoomAssignments, setGroupRoomAssignments] = useState([
    { id: 1, name: 'Mr Kumar Anil', roomNo: '201' },
    { id: 2, name: 'MR Anil Kumar Group', roomNo: '201' },
    { id: 3, name: 'MR Anil Kumar Group', roomNo: '205' },
    { id: 4, name: 'MR Anil Kumar Group', roomNo: '205' },
    { id: 5, name: 'MR Anil Kumar Group', roomNo: '207' },
    { id: 6, name: 'MR Anil Kumar Group', roomNo: '207' },
    { id: 7, name: 'MR Anil Kumar Group', roomNo: '207' },
    { id: 8, name: 'MR Anil Kumar Group', roomNo: '207' },
    { id: 9, name: 'MR Anil Kumar Group', roomNo: '207' },
    { id: 10, name: 'MR Anil Kumar Group', roomNo: '207' }
  ]);

  // Quick edit inputs for guest names in Group Allocation (Frame 048)
  const [editGuestNo, setEditGuestNo] = useState('1');
  const [editTitle, setEditTitle] = useState('Mr');
  const [editLastName, setEditLastName] = useState('Kumar');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editFirstName, setEditFirstName] = useState('Anil');

  // Arrivals dataset matching Video 06 Frame 012, Video 07 Frame 044, Video 08 Frame 012
  const initialArrivalsList = [
    { resNo: '272', title: 'MR', guestName: 'Sharma Rajesh', isRepeat: true, roomType: 'EXE', roomNo: '102', pax: 1, isPartial: false },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: 'DLX', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: 'DLX', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: 'DLX', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: 'DLX', pax: 1 },
    { resNo: '274', title: 'Mr', guestName: 'Sharma Rajesh', isRepeat: false, roomType: 'EXE', roomNo: '102', pax: 2, companion: 'Sharma Sunita' },
    { resNo: '276', title: 'Mr', guestName: 'Kumar Anil', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: '415', pax: 2, isPartial: true },
    { resNo: '276', title: 'MR', guestName: 'Anil Kumar Group', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: 'EXE', pax: 2, isCompanion: false },
    { resNo: '276', title: 'MR', guestName: 'Anil Kumar Group', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: 'EXE', pax: 2, isCompanion: true },
    { resNo: '276', title: 'MR', guestName: 'Anil Kumar Group', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: 'EXE', pax: 2, isCompanion: true },
    { resNo: '276', title: 'MR', guestName: 'Anil Kumar Group', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: 'EXE', pax: 2, isCompanion: true },
    { resNo: '276', title: 'MR', guestName: 'Anil Kumar Group', isRepeat: false, isGroup: true, groupName: 'Anil Kumar Group', roomType: 'EXE', roomNo: 'EXE', pax: 2, isCompanion: true }
  ];

  const [arrivals, setArrivals] = useState(initialArrivalsList);

  if (!isOpen) return null;

  const handleCheckboxToggle = (resNo) => {
    setCheckedArrivals(prev => ({
      ...prev,
      [resNo]: !prev[resNo]
    }));
    setSelectedArrivalRes(resNo);
    if (resNo === '274') {
      setSelectedRoomNumber('102');
      setRightViewMode('preview');
      setGroupAllocationMode(false);
      setRoomTypeFilter('ALL');
    } else if (resNo === '276') {
      setGroupAllocationMode(true);
      setRoomTypeFilter('EXE');
    }
  };

  const handleRowClick = (row) => {
    setSelectedArrivalRes(row.resNo);
    if (row.resNo === '276') {
      setGroupAllocationMode(true);
      setRoomTypeFilter('EXE');
    } else {
      setGroupAllocationMode(false);
      if (row.roomNo === '102') {
        setSelectedRoomNumber('102');
        setRightViewMode('preview');
      } else {
        setRightViewMode('tape');
      }
    }
  };

  const executeExpressCheckIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (selectedArrivalRes === '276' || groupAllocationMode) {
        setGroupSummaryOpen(true);
      } else {
        setConfirmSummaryOpen(true);
      }
    }, 700);
  };

  const handleConfirmSingleOk = () => {
    setConfirmSummaryOpen(false);
    setArrivals(prev => prev.filter(a => a.resNo !== '274'));

    if (onCompleteExpressCheckin) {
      onCompleteExpressCheckin({
        resNo: '274',
        roomNo: '102',
        type: 'EXE',
        regNo1: '585',
        regNo2: '586',
        guest1: { title: 'Mr', name: 'Sharma Rajesh' },
        guest2: { title: 'Mrs', name: 'Sharma Sunita' },
        pax: 2,
        arrivalDate: INITIAL_ACCOUNTING_DATE,
        departureDate: NEXT_ACCOUNTING_DATE,
        rate: '4,500.00',
        planAmt: '500.00'
      });
    }
  };

  const handleConfirmGroupOk = () => {
    setGroupSummaryOpen(false);
    setArrivals(prev => prev.filter(a => a.resNo !== '276'));
    setGroupAllocationMode(false);

    if (onCompleteGroupCheckin) {
      onCompleteGroupCheckin({
        resNo: '276',
        groupCode: '003',
        groupName: 'JK Paper Delegation',
        company: 'COM0003 - JK Paper Mills Ltd',
        rooms: ['201', '205', '207'],
        type: 'EXE',
        guests: [
          { roomNo: '201', name: 'Mr Sunil Mohapatra', regNo: '613' },
          { roomNo: '201', name: 'JK Paper Delegation', regNo: '614' },
          { roomNo: '205', name: 'JK Paper Delegation', regNo: '615' },
          { roomNo: '205', name: 'JK Paper Delegation', regNo: '616' },
          { roomNo: '207', name: 'JK Paper Delegation', regNo: '617' },
          { roomNo: '207', name: 'JK Paper Delegation', regNo: '618' }
        ],
        arrivalDate: INITIAL_ACCOUNTING_DATE,
        departureDate: NEXT_ACCOUNTING_DATE,
        totalRooms: 3,
        totalGuests: 6
      });
    }
  };

  const updateGroupRoomNumber = (idx, newRoom) => {
    setGroupRoomAssignments(prev => prev.map((item, i) => i === idx ? { ...item, roomNo: newRoom } : item));
  };

  // Video 08: Room Category Upgrade Handlers
  const handleTriggerUpgradeFor309 = (rowIndex) => {
    if (typeof rowIndex === 'number') {
      setSelectedArrivalRowIndex(rowIndex);
    }
    setHoveredRoomNo('309');
    setUpgradeOption('Upgrade');
    setUpgradeAuthorisedBy('Manager');
    setUpgradeRemarks('Executive');
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgradeOk = () => {
    setUpgradeModalOpen(false);
    setRegCardModalOpen(true);
  };

  const handleConfirmRegCardSelect = () => {
    setRegCardModalOpen(false);
    setIs309Upgraded(true);

    // Update the arrivals list row
    setArrivals(prev => prev.map((a, idx) => {
      if (idx === selectedArrivalRowIndex || (a.resNo === '276' && a.roomNo === 'EXE')) {
        return {
          ...a,
          roomNo: '309',
          roomType: 'SUI',
          isUpgraded: true
        };
      }
      return a;
    }));

    if (onCompleteUpgradeCheckin) {
      onCompleteUpgradeCheckin({
        resNo: '276',
        roomNo: '309',
        roomType: 'SUI',
        bookedType: 'EXE',
        regNo: '619',
        guestName: 'Anil Kumar Group',
        company: 'COM0002 - Utkal Alumina International Ltd',
        upgradeType: upgradeOption,
        authorisedBy: upgradeAuthorisedBy || 'Manager',
        remarks: upgradeRemarks || 'Executive',
        printOpt: printRegCardOpt
      });
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1100 }}>
      {/* Express Check-In Main Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '1090px', 
          maxWidth: '98vw', 
          height: '650px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Title Bar (Video 08 Frame 012 shows V6.5.002.4) */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700 }}>Express Check-in V6.5.002.4</span>
            <span style={{ fontSize: '11px', color: '#333' }}>
              {groupAllocationMode ? '[Group Allocation Console - Res # 276]' : '[Front Desk Rapid Check-In]'}
            </span>
          </div>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Window Content: 2 Columns (Left: Arrivals or Group Console / Right: Tape Chart & Preview) */}
        <div style={{ flex: 1, display: 'flex', padding: '6px', gap: '6px', overflow: 'hidden', background: '#ECE9D8' }}>
          
          {/* =========================================================================
              LEFT PANEL:
              Mode A: EXPECTED ARRIVALS (Video 06 Frame 012 & Video 07 Frame 044)
              Mode B: GROUP ALLOCATION CONSOLE (Video 07 Frame 048 & Frame 052)
              ========================================================================= */}
          <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            
            {!groupAllocationMode ? (
              /* MODE A: STANDARD ARRIVALS LIST */
              <>
                {/* Display Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600 }}>Display</span>
                  <select 
                    className="ids-select" 
                    style={{ width: '130px', fontWeight: 600 }}
                    value={displayFilter}
                    onChange={(e) => setDisplayFilter(e.target.value)}
                  >
                    <option value="ALL">ALL</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="VIP">VIP Only</option>
                    <option value="Group">Group Bookings</option>
                  </select>
                </div>

                {/* 3 Top Tabs: Expected Arrivals | No Show | Next Day Arrivals */}
                <div style={{ display: 'flex', borderBottom: '2px solid #716F64', background: '#D6D3C4' }}>
                  {['Expected Arrivals', 'No Show', 'Next Day Arrivals'].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? '#ECE9D8' : '#D6D3C4',
                          border: '1px solid #716F64',
                          borderBottom: isActive ? '2px solid #ECE9D8' : 'none',
                          marginBottom: isActive ? '-2px' : '0',
                          cursor: 'pointer',
                          color: isActive ? '#000' : '#444'
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Guest Name Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600, width: '70px' }}>Guest Name</span>
                  <input 
                    className="ids-input" 
                    style={{ flex: 1 }}
                    placeholder="Search guest or group..."
                    value={searchGuestName}
                    onChange={(e) => setSearchGuestName(e.target.value)}
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
                    title="Clear Search"
                    onClick={() => setSearchGuestName('')}
                  >
                    C
                  </button>
                </div>

                {/* Left Data Grid (Frame 012 & Frame 044) */}
                <div style={{ flex: 1, border: '1px solid #716F64', background: '#FFFFFF', overflowY: 'auto' }}>
                  <table className="ids-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '42px' }}>Res.#</th>
                        <th style={{ width: '38px' }}>Title</th>
                        <th>Guest Name</th>
                        <th style={{ width: '28px', textAlign: 'center' }}>☑</th>
                        <th style={{ width: '50px' }}>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrivals.map((row, idx) => {
                        const isChecked = checkedArrivals[row.resNo] || false;
                        const isSelected = selectedArrivalRes === row.resNo;
                        const isPartialCheckIn = row.isPartial;
                        const isUpgradedRow = row.isUpgraded || (row.roomNo === '309');

                        return (
                          <tr 
                            key={idx}
                            onClick={() => {
                              setSelectedArrivalRowIndex(idx);
                              handleRowClick(row);
                            }}
                            style={{
                              background: isPartialCheckIn 
                                ? '#A6EDF9' 
                                : isSelected 
                                  ? '#316AC5' 
                                  : isUpgradedRow 
                                    ? '#FFF2D6' 
                                    : idx % 2 === 0 ? '#FFFFFF' : '#F9F8F2',
                              color: isSelected && !isPartialCheckIn ? '#FFFFFF' : '#000000',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ fontWeight: 600 }}>{row.resNo}</td>
                            <td>{row.title}</td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {row.isRepeat && <span style={{ color: isSelected && !isPartialCheckIn ? '#FFF' : '#BD5317', fontWeight: 800 }}>•</span>}
                              {row.isGroup && <span style={{ color: isSelected && !isPartialCheckIn ? '#FFF' : '#A02020', fontWeight: 800, fontSize: '9px' }}>[GRP]</span>}
                              <span style={{ fontWeight: row.resNo === '276' || row.resNo === '274' ? 700 : 500 }}>
                                {row.guestName}
                              </span>
                              {row.resNo === '276' && row.roomType === 'EXE' && !isUpgradedRow && (
                                <button 
                                  className="ids-btn-classic" 
                                  style={{ fontSize: '9px', padding: '0 4px', background: '#FFD700', fontWeight: 700, marginLeft: 'auto', border: '1px solid #716F64' }}
                                  title="Upgrade Room Category to 309 SUI (Video 08)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTriggerUpgradeFor309(idx);
                                  }}
                                >
                                  Upgrade
                                </button>
                              )}
                            </td>
                            <td 
                              style={{ textAlign: 'center' }}
                              title="Select Check box &Drag to right sideWindow for Check-in"
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxToggle(row.resNo);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ fontWeight: 700, color: isUpgradedRow ? '#D9381E' : isSelected && !isPartialCheckIn ? '#FFF' : row.roomNo ? '#0A246A' : '#777' }}>
                              {isUpgradedRow ? '309 SUI 🚪➔' : row.roomNo || row.roomType}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#FFFDE8', border: '1px solid #C4BE82', padding: '4px 8px', fontSize: '10px', color: '#685D00' }}>
                  💡 <strong>Tip:</strong> Click on <strong>Res # 276 (Group 003)</strong> to open the Group Multi-Room Allocation Console!
                </div>
              </>
            ) : (
              /* MODE B: GROUP ALLOCATION CONSOLE (Video 07 Frames 048–052) */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* Header Information Strip */}
                <div style={{ border: '1px solid #716F64', background: '#F8F7F0', padding: '4px 6px', fontSize: '10px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', textAlign: 'center' }}>
                  <div><span style={{ color: '#666', display: 'block' }}>Reservation</span><strong>276</strong></div>
                  <div><span style={{ color: '#666', display: 'block' }}>Serial #</span><strong>1</strong></div>
                  <div><span style={{ color: '#666', display: 'block' }}>Arrival</span><strong>16-JAN-22</strong></div>
                  <div><span style={{ color: '#666', display: 'block' }}>Departure</span><strong>18-JAN-22</strong></div>
                  <div><span style={{ color: '#666', display: 'block' }}>Type</span><strong>EXE</strong></div>
                </div>

                {/* Summary Box matching Frame 048 */}
                <div style={{ border: '1px solid #716F64', background: '#FFFFFF', padding: '4px 6px', fontSize: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                        <th style={{ textAlign: 'left', padding: '2px 4px' }}>DESCRP</th>
                        <th>Total</th>
                        <th>Checked-In</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>Rooms</td>
                        <td>5[0+5+0+0]</td>
                        <td style={{ color: '#0A246A', fontWeight: 700 }}>0</td>
                        <td style={{ fontWeight: 700 }}>5</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>Persons</td>
                        <td>13</td>
                        <td style={{ color: '#0A246A', fontWeight: 700 }}>0</td>
                        <td style={{ fontWeight: 700 }}>13</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Quick Guest Name Input Editor (Frame 048) */}
                <div style={{ border: '1px solid #716F64', background: '#F8F7F0', padding: '4px', fontSize: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '25px 40px 1fr 1fr', gap: '3px', alignItems: 'center' }}>
                    <input className="ids-input" value={editGuestNo} onChange={(e) => setEditGuestNo(e.target.value)} style={{ width: '100%', textAlign: 'center' }} />
                    <input className="ids-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: '100%' }} />
                    <input className="ids-input" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last Name" style={{ width: '100%' }} />
                    <input className="ids-input" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First Name" style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '3px' }}>
                    <button 
                      className="ids-btn-classic" 
                      style={{ minWidth: '40px', padding: '1px 6px', fontSize: '10px' }}
                      onClick={() => {
                        playReceptionChime();
                        alert(`Guest profile updated for Pax ${editGuestNo || '1'}: ${editTitle} ${editFirstName} ${editLastName}`);
                      }}
                    >Ok</button>
                    <button 
                      className="ids-btn-classic" 
                      style={{ minWidth: '40px', padding: '1px 6px', fontSize: '10px' }}
                      onClick={() => {
                        playReceptionChime();
                        setEditFirstName('');
                        setEditLastName('');
                      }}
                    >Clear</button>
                  </div>
                </div>

                {/* Room Assignment List matching Frame 048–052 */}
                <div style={{ flex: 1, border: '1px solid #716F64', background: '#FFFFFF', overflowY: 'auto' }}>
                  <table className="ids-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '24px' }}>#</th>
                        <th>Guest Name</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>Room #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupRoomAssignments.map((item, idx) => (
                        <tr key={item.id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9F8F2' }}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.id}</td>
                          <td style={{ fontWeight: idx === 0 ? 700 : 500 }}>{item.name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <select 
                              className="ids-select" 
                              style={{ width: '60px', fontWeight: 700, color: '#A02020' }}
                              value={item.roomNo}
                              onChange={(e) => updateGroupRoomNumber(idx, e.target.value)}
                            >
                              <option value="415">415</option>
                              <option value="205">205</option>
                              <option value="515">515</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Allocation Action Strip (Frame 048) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '70px', fontWeight: 600 }}
                    onClick={() => {
                      setGroupAllocationMode(false);
                      setRoomTypeFilter('ALL');
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '90px', background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                    onClick={executeExpressCheckIn}
                  >
                    Checkin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT PANEL: TAPE CHART / ROOM PREVIEW (Frames 012, 018, 048, 052)
              ========================================================================= */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Top Filter Strip & Action Icons (Frame 012 & Frame 048) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: '#DFDBC9', padding: '3px 8px', border: '1px solid #B0AB9A' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Room Type</span>
                  <select 
                    className="ids-select" 
                    style={{ width: '65px', fontWeight: 700, background: roomTypeFilter === 'EXE' ? '#316AC5' : '#FFF', color: roomTypeFilter === 'EXE' ? '#FFF' : '#000' }}
                    value={roomTypeFilter}
                    onChange={(e) => setRoomTypeFilter(e.target.value)}
                  >
                    <option value="ALL">ALL</option>
                    <option value="EXE">EXE</option>
                    <option value="DLX">DLX</option>
                    <option value="SUI">SUI</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Floor</span>
                  <select className="ids-select" style={{ width: '60px' }}>
                    <option value="ALL">ALL</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Block</span>
                  <select className="ids-select" style={{ width: '60px' }}>
                    <option value="ALL">ALL</option>
                  </select>
                </div>

                {/* Video 08 Frame 020/030/045 Header indicator */}
                <span 
                  style={{ fontWeight: 700, color: '#A02020', fontSize: '11px', margin: '0 6px', background: '#F8F7F0', padding: '1px 6px', border: '1px solid #CCC' }}
                  title="Hovered / Target Room"
                >
                  Room #{hoveredRoomNo}
                </span>
              </div>

              {/* 3 Authentic IDS Toolbar action buttons on top right (Frame 012) */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className={`ids-btn-classic ${rightViewMode === 'tape' ? 'active' : ''}`}
                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="View Room Tape Chart"
                  onClick={() => setRightViewMode('tape')}
                >
                  <BedDouble size={12} color="#A02020" />
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>Tape</span>
                </button>
                <button 
                  className="ids-btn-classic"
                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px', background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                  title="Express Check-in"
                  onClick={executeExpressCheckIn}
                >
                  <ArrowRightLeft size={12} />
                  <span style={{ fontSize: '10px' }}>Check-In</span>
                </button>
                <button 
                  className={`ids-btn-classic ${rightViewMode === 'preview' ? 'active' : ''}`}
                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Preview Room Picture"
                  onClick={() => setRightViewMode(rightViewMode === 'preview' ? 'tape' : 'preview')}
                >
                  <Sparkles size={12} color="#BD5317" />
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>Room Photo</span>
                </button>
              </div>
            </div>

            {/* Right Main Display Area */}
            <div style={{ flex: 1, border: '1px solid #716F64', background: '#FFFFFF', position: 'relative', overflow: 'auto' }}>
              {rightViewMode === 'preview' ? (
                /* Room Photo Preview matching Frame 018–020 */
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#222' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" 
                    alt="Room 102 Executive AC"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      left: '12px', 
                      background: 'rgba(0,0,0,0.75)', 
                      color: '#FFF', 
                      padding: '6px 12px', 
                      borderRadius: '3px',
                      border: '1px solid #FFF',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#FFD700', fontSize: '13px' }}>Room 102 (Executive AC)</span>
                    <span>•</span>
                    <span>Assigned: <strong>Mr Sharma Rajesh &amp; Mrs Sharma Sunita</strong></span>
                  </div>

                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      background: 'rgba(49, 106, 197, 0.9)',
                      color: '#FFF',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={executeExpressCheckIn}
                  >
                    <span>Click Here to Complete Express Check-In</span>
                    <span>➔</span>
                  </div>
                </div>
              ) : (
                /* Room Availability Tape Chart Matrix (Frame 012 & Frame 048) */
                <table className="ids-grid-table" style={{ fontSize: '10px', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>Room #</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Sun-16-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Mon-17-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Tue-18-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Wed-19-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Thu-20-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Fri-21-01</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Sat-22-01</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* BA-FF03 (Floor 3) matching Video 08 Frame 012, 020, 045 */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF03 (Floor 3)</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>302 DLX</td>
                      <td colSpan={2} style={{ background: '#F15A24', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        SHARMA
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>314 DLX</td>
                      <td colSpan={2} style={{ background: '#F15A24', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        ANIRUDH
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr 
                      style={{ 
                        background: is309Upgraded ? '#FFEBE6' : '#FFFFFF', 
                        cursor: 'pointer' 
                      }}
                      onMouseEnter={() => setHoveredRoomNo('309')}
                      onClick={() => handleTriggerUpgradeFor309()}
                      title="Click & Drag RoomGrid against the Room no. for Check-in"
                    >
                      <td style={{ fontWeight: 700, color: '#0A246A' }}>309 SUI</td>
                      {is309Upgraded ? (
                        <td colSpan={2} style={{ background: '#F15A24', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <span style={{ fontSize: '11px' }}>🚪➔</span>
                            <span>KUMAR GROUP</span>
                          </span>
                        </td>
                      ) : (
                        <td colSpan={2} style={{ background: '#FFFFFF', color: '#0A246A', textAlign: 'center', fontWeight: 600, border: '1px dashed #316AC5' }}>
                          [ Click to Assign / Upgrade Room 309 SUI ]
                        </td>
                      )}
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>

                    {/* BA-FF04 Header */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF01 (Floor 1)</td>
                    </tr>
                    <tr 
                      style={{ background: '#FFF7E6', cursor: 'pointer' }}
                      onClick={() => setRightViewMode('preview')}
                      onMouseEnter={() => setHoveredRoomNo('102')}
                      title="Room 102 EXE"
                    >
                      <td style={{ fontWeight: 700, color: '#A02020' }}>102 EXE</td>
                      <td colSpan={2} style={{ background: '#00AEEF', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        KHAN,KH (RES #274)
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr style={{ background: '#E6F0FA' }} onMouseEnter={() => setHoveredRoomNo('415')}>
                      <td style={{ fontWeight: 700, color: '#0A246A' }}>201 EXE</td>
                      <td colSpan={2} style={{ background: '#58B957', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        KUMAR (ALLOCATED)
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>

                    {/* BA-FF05 Header */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF02 (Floor 2)</td>
                    </tr>
                    <tr style={{ background: '#E6F0FA' }} onMouseEnter={() => setHoveredRoomNo('205')}>
                      <td style={{ fontWeight: 700, color: '#0A246A' }}>205 EXE</td>
                      <td colSpan={2} style={{ background: '#58B957', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        ANIL KUMAR G (ALLOCATED)
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr style={{ background: '#E6F0FA' }} onMouseEnter={() => setHoveredRoomNo('515')}>
                      <td style={{ fontWeight: 700, color: '#0A246A' }}>207 EXE</td>
                      <td colSpan={2} style={{ background: '#58B957', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        ANIL KUMAR G (ALLOCATED)
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr onMouseEnter={() => setHoveredRoomNo('309')}>
                      <td style={{ fontWeight: 700 }}>301 EXE</td>
                      <td colSpan={2} style={{ background: '#F15A24', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                        BISWAKARMA (OCCUPIED)
                      </td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM LEGEND STRIP (Frame 012 & Frame 044)
            ========================================================================= */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #716F64', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
          {/* Left Guest Category Legend */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #B0AB9A', padding: '2px 6px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#F8B9C8', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>VIP Guest</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#316AC5', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Guest Messages</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#663399', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>F9-Guest Note &amp; F10-Document</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ color: '#BD5317', fontWeight: 900 }}>•</span>
              <span>Repeat Guest</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#00AEEF', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Partial Check-in</span>
            </div>
          </div>

          {/* Right Room Status Legend */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #B0AB9A', padding: '2px 6px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#FFFFFF', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Clean</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#E8E137', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Dirty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#F15A24', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#663399', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>OOS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#888888', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>OOO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', background: '#00AEEF', display: 'inline-block', border: '1px solid #999' }}></span>
              <span>Reservation</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM COMMAND BUTTONS (Frame 012 & Frame 044)
            ========================================================================= */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #716F64', padding: '6px 12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button 
            className="ids-btn-classic" 
            style={{ minWidth: '90px' }}
            onClick={() => {
              playReceptionChime();
              alert("Hotel Room Position Summary:\n• Total Rooms: 30\n• Occupied: 14\n• Expected Arrivals: 6\n• Expected Departures: 4\n• Available: 10\n• Housekeeping Clean: 22, Dirty: 8");
            }}
          >
            Hotel Position
          </button>
          <button 
            className="ids-btn-classic" 
            style={{ minWidth: '120px' }}
            onClick={() => {
              onClose();
              if (onOpenStandardCheckin) onOpenStandardCheckin();
            }}
          >
            Reservation Check-In
          </button>
          <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => setArrivals(initialArrivalsList)}>
            Refresh
          </button>
          <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={onClose}>
            Exit
          </button>
        </div>
      </div>

      {/* =========================================================================
          PROCESSING CHECK-IN PROGRESS MODAL (Frame 022)
          ========================================================================= */}
      {isProcessing && (
        <div className="ids-modal-overlay" style={{ zIndex: 1250, background: 'rgba(0,0,0,0.3)' }}>
          <div className="ids-dialog-window" style={{ width: '320px', padding: '24px', textAlign: 'center', background: '#FFFFFF' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>
              Check-in Progress, Please wait...
            </div>
            <div style={{ width: '100%', height: '12px', background: '#E0E0E0', border: '1px solid #999', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'repeating-linear-gradient(45deg, #316AC5, #316AC5 10px, #4B8CF5 10px, #4B8CF5 20px)',
                  animation: 'idsPulse 1s linear infinite'
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
              Assigning Registration folios to selected rooms...
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SINGLE CHECK-IN CONFIRMATION MODAL (Video 06 Frame 024)
          ========================================================================= */}
      {confirmSummaryOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '560px', maxWidth: '98vw' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Express Check-In Completed</span>
              <button className="ids-win-btn close" onClick={() => setConfirmSummaryOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '14px 16px', background: '#ECE9D8' }}>
              <div style={{ border: '1px solid #716F64', background: '#FFFFFF', maxHeight: '180px', overflowY: 'auto' }}>
                <table className="ids-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>Res #</th>
                      <th style={{ width: '40px' }}>Srl #</th>
                      <th style={{ width: '55px' }}>Room #</th>
                      <th>Guest Name</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Reg #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#F8F7F0' }}>
                      <td style={{ fontWeight: 600 }}>274</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>102</td>
                      <td style={{ fontWeight: 700 }}>Sharma Rajesh</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>585</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 600 }}>274</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>102</td>
                      <td style={{ fontWeight: 700 }}>Sharma Sunita</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>586</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '85px' }} onClick={() => alert('Folio generated.')}>Bill Preview</button>
                <button className="ids-btn-classic" style={{ minWidth: '95px' }} onClick={() => window.print()}>Print Reg Card</button>
                <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={handleConfirmSingleOk}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GROUP CHECK-IN CONFIRMATION MODAL (Video 07 Frame 056)
          ========================================================================= */}
      {groupSummaryOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '580px', maxWidth: '98vw' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Group Check-In Completed (Res # 276)</span>
              <button className="ids-win-btn close" onClick={() => setGroupSummaryOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '14px 16px', background: '#ECE9D8' }}>
              <div style={{ border: '1px solid #716F64', background: '#FFFFFF', maxHeight: '200px', overflowY: 'auto' }}>
                <table className="ids-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>Res.#</th>
                      <th style={{ width: '35px' }}>Srl #</th>
                      <th style={{ width: '55px' }}>Room #</th>
                      <th>Guest Name</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Reg #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#F8F7F0' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>415</td>
                      <td style={{ fontWeight: 700 }}>Mr Kumar Anil</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>613</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>415</td>
                      <td>MR Anil Kumar Group</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>614</td>
                    </tr>
                    <tr style={{ background: '#F8F7F0' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>201</td>
                      <td>MR Anil Kumar Group</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>615</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>201</td>
                      <td>MR Anil Kumar Group</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>616</td>
                    </tr>
                    <tr style={{ background: '#F8F7F0' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>515</td>
                      <td>MR Anil Kumar Group</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>617</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 600 }}>276</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>515</td>
                      <td>MR Anil Kumar Group</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>618</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons matching Frame 056 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '80px' }}
                  onClick={() => {
                    playReceptionChime();
                    alert("Guest GST Profile Lookup:\nBilled to: Anil Kumar Group\nGSTIN: 27AABCT2345Q1ZX\nState Code: 27 (Maharashtra)\nReverse Charge: No");
                  }}
                >Gst Profile</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px' }}
                  onClick={() => {
                    playReceptionChime();
                    const comment = prompt("Enter Guest Billing / Stay Comment:", "VIP Group - Complimentary welcome drinks");
                    if (comment) alert("Guest Comment Saved: " + comment);
                  }}
                >Gst Cmt</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={handleConfirmGroupOk}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIDEO 08: UPGRADE / UPSELLING MODAL (Frame 030 & Frame 035)
          ========================================================================= */}
      {upgradeModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '380px', 
              maxWidth: '96vw', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* Title Bar */}
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Upgrade/Upselling</span>
              <button className="ids-win-btn close" onClick={() => setUpgradeModalOpen(false)}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: '12px 14px', background: '#ECE9D8', fontSize: '11px' }}>
              {/* Radio Group in single row */}
              <div style={{ border: '1px solid #716F64', padding: '8px 12px', background: '#F8F7F0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="upgradeOption" 
                    value="None" 
                    checked={upgradeOption === 'None'} 
                    onChange={() => setUpgradeOption('None')} 
                  />
                  <span>None</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: upgradeOption === 'Upgrade' ? 700 : 400 }}>
                  <input 
                    type="radio" 
                    name="upgradeOption" 
                    value="Upgrade" 
                    checked={upgradeOption === 'Upgrade'} 
                    onChange={() => setUpgradeOption('Upgrade')} 
                  />
                  <span>Upgrade</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="upgradeOption" 
                    value="Upselling" 
                    checked={upgradeOption === 'Upselling'} 
                    onChange={() => setUpgradeOption('Upselling')} 
                  />
                  <span>Upselling</span>
                </label>
              </div>

              {/* Input Fields */}
              <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Authorised By</span>
                <input 
                  className="ids-input" 
                  value={upgradeAuthorisedBy} 
                  onChange={(e) => setUpgradeAuthorisedBy(e.target.value)} 
                  style={{ width: '100%', fontWeight: 600 }}
                />

                <span style={{ fontWeight: 600 }}>Remarks</span>
                <input 
                  className="ids-input" 
                  value={upgradeRemarks} 
                  onChange={(e) => setUpgradeRemarks(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>

              {/* Status Notice (matching Frame 030/035) */}
              <div style={{ marginTop: '8px', padding: '4px 6px', background: '#FFF9D7', border: '1px solid #D4B106', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                Check-in Progress, Please wait..
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '60px', fontWeight: 700 }}
                  onClick={handleConfirmUpgradeOk}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '60px' }}
                  onClick={() => setUpgradeModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIDEO 08: SELECT PRINT REG.CARD OPT MODAL (Frame 040)
          ========================================================================= */}
      {regCardModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '320px', 
              maxWidth: '96vw', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* Title Bar */}
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Select print reg.card opt</span>
              <button className="ids-win-btn close" onClick={() => setRegCardModalOpen(false)}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: '12px 14px', background: '#ECE9D8', fontSize: '11px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Print Reg.card</span>
                <select 
                  className="ids-select" 
                  value={printRegCardOpt} 
                  onChange={(e) => setPrintRegCardOpt(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, color: '#0A246A' }}
                >
                  <option value="GUEST PHOTO REG.CA">GUEST PHOTO REG.CA</option>
                  <option value="STANDARD REG. CARD">STANDARD REG. CARD</option>
                  <option value="EXPRESS REG. CARD">EXPRESS REG. CARD</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '60px', fontWeight: 700 }}
                  onClick={handleConfirmRegCardSelect}
                >
                  Select
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '60px' }}
                  onClick={() => setRegCardModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
