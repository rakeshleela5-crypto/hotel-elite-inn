import React, { useState } from 'react';
import { 
  Building2, Users, Check, X, Calendar, DollarSign, 
  Search, RefreshCw, Printer, FileText, ChevronRight, BedDouble, Sparkles, ArrowRightLeft
} from 'lucide-react';

/* =========================================================================
   VIDEO 06: EXPRESS CHECK-IN FOR SINGLE ROOM IN IDS FORTUNE NEXT 6.5 & 7.0
   Replication of:
   1. "Processing Check-in Information, Please wait.." loader (Frame 010)
   2. Express Check-In Console Split Window (Frames 012–020)
   3. Checkbox selection with tooltip:
      "Select Check box &Drag to right sideWindow for Check-in" (Frame 015)
   4. Room 401 Preview interior photograph (Frame 018–020)
   5. Room Availability Tape Chart matrix (Frame 012)
   6. "Check-in Progress, Please wait..." dialog (Frame 022)
   7. Express Check-in Confirmation Summary Table (Frame 024):
      Res # 274, Room 401, Khan Pravez (Reg # 585), Khan Pavez (Reg # 586)
   8. Live desktop statistics synchronization (Frame 028)
   ========================================================================= */

export default function IdsExpressCheckInModal({
  isOpen,
  onClose,
  onCompleteExpressCheckin,
  onOpenStandardCheckin
}) {
  const [activeTab, setActiveTab] = useState('Expected Arrivals'); // 'Expected Arrivals' | 'No Show' | 'Next Day Arrivals'
  const [displayFilter, setDisplayFilter] = useState('ALL');
  const [searchGuestName, setSearchGuestName] = useState('');
  const [selectedArrivalRes, setSelectedArrivalRes] = useState('274');
  const [checkedArrivals, setCheckedArrivals] = useState({ '274': true });
  const [rightViewMode, setRightViewMode] = useState('tape'); // 'tape' | 'preview'
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmSummaryOpen, setConfirmSummaryOpen] = useState(false);
  const [checkedInSuccessfully, setCheckedInSuccessfully] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('401');

  // Arrivals dataset matching Video 06 Frame 012
  const initialArrivalsList = [
    { resNo: '272', title: 'MS', guestName: 'Basu Anirudh', isRepeat: true, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '272', title: 'MR', guestName: 'Anirudh', isRepeat: false, roomType: 'DLX', roomNo: '', pax: 1 },
    { resNo: '274', title: 'Mr', guestName: 'Khan Pravez', isRepeat: false, roomType: 'EXE', roomNo: '401', pax: 2, companion: 'Khan Pavez' },
    { resNo: '274', title: 'Mrs', guestName: 'Khan Pavez', isRepeat: false, roomType: 'EXE', roomNo: '401', pax: 2, isCompanion: true }
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
      setSelectedRoomNumber('401');
      setRightViewMode('preview');
    }
  };

  const executeExpressCheckIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmSummaryOpen(true);
    }, 800);
  };

  const handleConfirmSummaryOk = () => {
    setConfirmSummaryOpen(false);
    setCheckedInSuccessfully(true);

    // Remove Res # 274 from arrivals
    setArrivals(prev => prev.filter(a => a.resNo !== '274'));

    if (onCompleteExpressCheckin) {
      onCompleteExpressCheckin({
        resNo: '274',
        roomNo: '401',
        type: 'EXE',
        regNo1: '585',
        regNo2: '586',
        guest1: { title: 'Mr', name: 'Khan Pravez' },
        guest2: { title: 'Mrs', name: 'Khan Pavez' },
        pax: 2,
        arrivalDate: '16-JAN-2022',
        departureDate: '18-JAN-2022',
        rate: '4,500.00',
        planAmt: '500.00'
      });
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1100 }}>
      {/* Express Check-In Main Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '1080px', 
          maxWidth: '98vw', 
          height: '640px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700 }}>Express Check-In V6.5.002.1</span>
            <span style={{ fontSize: '11px', color: '#333' }}>[Front Desk Rapid Allocation]</span>
          </div>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Window Content: 2 Columns (Left: Arrivals / Right: Tape Chart & Preview) */}
        <div style={{ flex: 1, display: 'flex', padding: '6px', gap: '6px', overflow: 'hidden', background: '#ECE9D8' }}>
          
          {/* =========================================================================
              LEFT PANEL: EXPECTED ARRIVALS & RESERVATIONS LIST (Frame 012 & Frame 015)
              ========================================================================= */}
          <div style={{ width: '370px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <option value="Corporate">Corporate BTC</option>
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
                placeholder="Search guest..."
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

            {/* Left Data Grid (Frame 012 & Frame 015) */}
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
                    return (
                      <tr 
                        key={idx}
                        onClick={() => {
                          setSelectedArrivalRes(row.resNo);
                          if (row.roomNo) setSelectedRoomNumber(row.roomNo);
                        }}
                        style={{
                          background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFFFFF' : '#F9F8F2',
                          color: isSelected ? '#FFFFFF' : '#000000',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ fontWeight: 600 }}>{row.resNo}</td>
                        <td>{row.title}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {row.isRepeat && <span style={{ color: isSelected ? '#FFF' : '#BD5317', fontWeight: 800 }}>•</span>}
                          <span style={{ fontWeight: row.resNo === '274' ? 700 : 500 }}>{row.guestName}</span>
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
                        <td style={{ fontWeight: 700, color: isSelected ? '#FFF' : row.roomNo ? '#0A246A' : '#777' }}>
                          {row.roomNo || row.roomType}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Checkbox Interactive Instruction Tooltip (Frame 015) */}
            <div style={{ background: '#FFFDE8', border: '1px solid #C4BE82', padding: '4px 8px', fontSize: '10px', color: '#685D00' }}>
              💡 <strong>IDS Tip:</strong> Select Check box &amp; Drag to right sideWindow for Check-in, or click the <ArrowRightLeft size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Express Check-In icon.
            </div>
          </div>

          {/* =========================================================================
              RIGHT PANEL: TAPE CHART / ROOM PREVIEW (Frames 012, 018, 020)
              ========================================================================= */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Top Filter Strip & Action Icons (Frame 012) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: '#DFDBC9', padding: '3px 8px', border: '1px solid #B0AB9A' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Room Type</span>
                  <select className="ids-select" style={{ width: '60px' }}>
                    <option value="ALL">ALL</option>
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
                  title="Express Check-in Selected Guest to Assigned Room"
                  onClick={executeExpressCheckIn}
                >
                  <ArrowRightLeft size={12} />
                  <span style={{ fontSize: '10px' }}>Check-In</span>
                </button>
                <button 
                  className={`ids-btn-classic ${rightViewMode === 'preview' ? 'active' : ''}`}
                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Preview Room Picture (Frame 018)"
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
                    alt="Room 401 Executive Suite"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Floating Room Tag matching Frame 018 */}
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
                    <span style={{ fontWeight: 800, color: '#FFD700', fontSize: '13px' }}>Room 401 (Executive Suite)</span>
                    <span>•</span>
                    <span>Assigned: <strong>Mr Khan Pravez &amp; Mrs Khan Pavez</strong></span>
                  </div>

                  {/* Drag / Drop target overlay */}
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
                /* Room Availability Tape Chart Matrix (Frame 012 & Frame 026) */
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
                    {/* BA-FF03 Header */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF03 (Floor 3)</td>
                    </tr>
                    <tr><td style={{ fontWeight: 600 }}>312 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>314 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>316 SUI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>

                    {/* BA-FF04 Header */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF04 (Floor 4)</td>
                    </tr>
                    <tr 
                      style={{ background: '#FFF7E6', cursor: 'pointer' }}
                      onClick={() => setRightViewMode('preview')}
                      title="Click to view Room 401 Interior Photo"
                    >
                      <td style={{ fontWeight: 700, color: '#A02020' }}>401 EXE</td>
                      {checkedInSuccessfully ? (
                        <td colSpan={2} style={{ background: '#F15A24', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                          KHAN (OCCUPIED)
                        </td>
                      ) : (
                        <td colSpan={2} style={{ background: '#00AEEF', color: '#FFF', fontWeight: 700, textAlign: 'center' }}>
                          KHAN,KH (RES #274)
                        </td>
                      )}
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr><td style={{ fontWeight: 600 }}>405 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>406 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>407 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>408 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>410 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>411 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>412 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>414 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>415 EXE</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>416 SUI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>

                    {/* BA-FF05 Header */}
                    <tr style={{ background: '#DFDBC9', fontWeight: 700 }}>
                      <td colSpan={8}>BA-FF05 (Floor 5)</td>
                    </tr>
                    <tr><td style={{ fontWeight: 600 }}>501 EXE</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>506 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>507 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>508 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>509 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td style={{ fontWeight: 600 }}>510 DLX</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM LEGEND STRIP (Frame 012 & Frame 015)
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
            BOTTOM COMMAND BUTTONS (Frame 012 & Frame 026)
            ========================================================================= */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #716F64', padding: '6px 12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="ids-btn-classic" style={{ minWidth: '90px' }}>
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
              Assigning Registration # 585 &amp; 586 to Room 401...
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EXPRESS CHECK-IN CONFIRMATION SUMMARY MODAL (Frame 024)
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
                      <td style={{ fontWeight: 700, color: '#A02020' }}>401</td>
                      <td style={{ fontWeight: 700 }}>Khan Pravez</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>585</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ fontWeight: 600 }}>274</td>
                      <td>1</td>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>401</td>
                      <td style={{ fontWeight: 700 }}>Khan Pavez</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0A246A' }}>586</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons from Frame 024 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '85px' }}
                  onClick={() => alert('📄 Folio # 1 Preview: Room 401 tariff 4,500.00 + GST generated!')}
                >
                  Bill Preview
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '95px' }}
                  onClick={() => window.print()}
                >
                  Print Reg Card
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={handleConfirmSummaryOk}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
