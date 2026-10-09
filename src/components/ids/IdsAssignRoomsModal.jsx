import React, { useState, useMemo } from 'react';
import { Search, X, Check, Calendar, ArrowRightLeft, User, Building, ShieldCheck } from 'lucide-react';

/* 1. SCAN BOOKING MODAL (Frame 004) */
export function IdsScanBookingModal({ 
  isOpen, 
  onClose, 
  onSelectBooking,
  bookings = [] 
}) {
  const [filterMode, setFilterMode] = useState('Arrival Date');
  const [arrivalDate, setArrivalDate] = useState('14/01/2022');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample or live reservation records matching video Frame 014
  const activeBookings = useMemo(() => {
    if (bookings && bookings.length > 0) return bookings;
    return [
      { resNo: '270', title: 'Mr', guestName: 'Biswakarma Santosh', companyName: 'Quality Pharma Products Pvt Ltd.', companyCode: 'COM0009', roomNo: '515', type: 'EXE', confirm: '1+0+0', provisional: '0+0+0', pax: '1+0+0', arrivalDate: '14-JAN-2022 20:07', departureDate: '17-JAN-2022 12:00', depositAmount: 2000, status: 'Repeat Guest', blocked: true },
      { resNo: '271', title: 'Mr', guestName: 'Biswakarma Santosh', companyName: 'Mahindra & Mahindra Limited', companyCode: 'COM0007', roomNo: '516', type: 'SUI', confirm: '0+1+0', provisional: '0+0+0', pax: '2+0+0', arrivalDate: '14-JAN-2022 19:56', departureDate: '16-JAN-2022 12:00', depositAmount: 0, status: 'VIP', blocked: true },
      { resNo: '269', title: 'Mr', guestName: 'P Ashok', companyName: 'Linde India Ltd', companyCode: 'COM0004', roomNo: '201', type: 'DLX', confirm: '1+0+0', provisional: '0+0+0', pax: '1+0+0', arrivalDate: '14-JAN-2022 14:00', departureDate: '15-JAN-2022 12:00', depositAmount: 1500, status: 'Checked In', blocked: false },
      { resNo: '268', title: 'Mrs', guestName: 'Anjali Sharma', companyName: 'Direct FIT', companyCode: '', roomNo: '', type: 'DLX', confirm: '0+0+0', provisional: '1+0+0', pax: '2+0+0', arrivalDate: '15-JAN-2022 12:00', departureDate: '18-JAN-2022 12:00', depositAmount: 0, status: 'Waitlist', blocked: false }
    ];
  }, [bookings]);

  const [selectedRow, setSelectedRow] = useState(() => activeBookings[0]);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (selectedRow) {
      onSelectBooking(selectedRow);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Repeat Guest': return '#B0E2FF';
      case 'Waitlist': return '#FFD8A8';
      case 'VIP': return '#FFA8A8';
      case 'Checked In': return '#D0D0FF';
      default: return 'transparent';
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '98vw' }}>
        {/* Title bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Scan Booking V6.5.002.2</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Selections Section */}
          <div style={{ border: '1px solid #B0AB9A', padding: '8px 12px', background: '#F8F7F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>Based On</span>
              <select className="ids-select" style={{ width: '130px' }}>
                <option value="Reservations">Reservations</option>
                <option value="In-House">In-House</option>
                <option value="History">History</option>
              </select>
            </div>

            {/* Radio Filter Matrix (Exact from Frame 004) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, auto)', gap: '6px 12px', fontSize: '11px' }}>
              {[
                'Guest Name', 'Company Name', 'Group Name', 'Arrival Date', 'Departure Date', 'Length of Stay', 'Market Segment',
                'Reserved On', 'Reservation #', 'Reference', 'CRS Link #', 'Arrival Flight', 'Pay Mode', 'Business Source'
              ].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="filterMode" 
                    checked={filterMode === opt} 
                    onChange={() => setFilterMode(opt)} 
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {/* Filter Input Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span style={{ fontWeight: 600 }}>{filterMode}</span>
              <input 
                className="ids-input" 
                style={{ width: '110px' }} 
                value={filterMode === 'Arrival Date' ? arrivalDate : searchQuery} 
                onChange={(e) => filterMode === 'Arrival Date' ? setArrivalDate(e.target.value) : setSearchQuery(e.target.value)} 
              />
              <select className="ids-select" style={{ width: '90px' }} defaultValue="None">
                <option value="None">None</option>
              </select>
              <input className="ids-input" style={{ width: '110px' }} defaultValue="" />
              <select className="ids-select" style={{ width: '90px' }} defaultValue="None">
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Table Grid (Frame 004) */}
          <div style={{ marginTop: '10px', height: '280px', overflowY: 'auto', border: '1px solid #716F64', background: '#FFF' }}>
            <table className="ids-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '55px' }}>Res.#</th>
                  <th style={{ width: '40px' }}>Title</th>
                  <th>Guest Name</th>
                  <th>Company Name</th>
                  <th style={{ width: '55px' }}>Room #</th>
                  <th style={{ width: '45px' }}>Type</th>
                  <th style={{ width: '50px' }}>Confirm</th>
                  <th style={{ width: '60px' }}>Provisional</th>
                  <th style={{ width: '35px' }}>Pax</th>
                  <th style={{ width: '85px' }}>Arrival Date</th>
                  <th style={{ width: '85px' }}>Departure Date</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((b) => {
                  const isSelected = selectedRow?.resNo === b.resNo;
                  return (
                    <tr 
                      key={b.resNo}
                      onClick={() => setSelectedRow(b)}
                      onDoubleClick={() => onSelectBooking(b)}
                      style={{ 
                        background: isSelected ? '#316AC5' : getStatusColor(b.status),
                        color: isSelected ? '#FFFFFF' : '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>{b.resNo}</td>
                      <td>{b.title}</td>
                      <td style={{ fontWeight: 600 }}>{b.guestName}</td>
                      <td>{b.companyName}</td>
                      <td>{b.roomNo || '-'}</td>
                      <td>{b.type}</td>
                      <td style={{ textAlign: 'center' }}>{b.confirm}</td>
                      <td style={{ textAlign: 'center' }}>{b.provisional}</td>
                      <td style={{ textAlign: 'center' }}>{b.pax}</td>
                      <td>{b.arrivalDate}</td>
                      <td>{b.departureDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Legend and Action Buttons */}
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Status Legend */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '14px', height: '14px', background: '#B0E2FF', border: '1px solid #716F64', display: 'inline-block' }}></span>
                Repeat Guest
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '14px', height: '14px', background: '#FFD8A8', border: '1px solid #716F64', display: 'inline-block' }}></span>
                Waitlist
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '14px', height: '14px', background: '#FFA8A8', border: '1px solid #716F64', display: 'inline-block' }}></span>
                VIP
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '14px', height: '14px', background: '#D0D0FF', border: '1px solid #716F64', display: 'inline-block' }}></span>
                Checked In
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '75px', fontWeight: 700 }} onClick={handleSearch}>
                Search
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={onClose}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. ASSIGN GUEST ROOMS MODAL (Frame 006) */
export function IdsAssignGuestRoomsModal({ 
  isOpen, 
  onClose, 
  booking = { resNo: '270', type: 'EXECUTIVE', guestName: 'Mr Biswakarma Santosh', arrivalDate: '14-JAN-2022 20:07', departureDate: '17-JAN-2022 12:00' },
  onConfirmAssignment 
}) {
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [assignedRoom, setAssignedRoom] = useState(booking.roomNo || '');
  const [selectedCell, setSelectedCell] = useState('301');

  // Rooms Inventory list organized by Block & Floor (Frame 006)
  const roomInventory = [
    { block: 'BA-FF02', roomNo: '201', type: 'EXE', status: 'Dirty', statusCode: 'DY' },
    { block: 'BA-FF02', roomNo: '215', type: 'EXE', status: 'Dirty', statusCode: 'DY' },
    { block: 'BA-FF03', roomNo: '301', type: 'EXE', status: 'Vacant', statusCode: '' },
    { block: 'BA-FF03', roomNo: '315', type: 'EXE', status: 'Vacant', statusCode: '' },
    { block: 'BA-FF04', roomNo: '401', type: 'EXE', status: 'Vacant', statusCode: '' },
    { block: 'BA-FF04', roomNo: '415', type: 'EXE', status: 'Vacant', statusCode: '' },
    { block: 'BA-FF05', roomNo: '501', type: 'EXE', status: 'Vacant', statusCode: '' },
    { block: 'BA-FF05', roomNo: '515', type: 'EXE', status: 'Vacant', statusCode: '' }
  ];

  // Days list across Tape Chart
  const days = [
    { day: 'F', date: 14 }, { day: 'S', date: 15 }, { day: 'S', date: 16 }, { day: 'M', date: 17 },
    { day: 'T', date: 18 }, { day: 'W', date: 19 }, { day: 'T', date: 20 }, { day: 'F', date: 21 },
    { day: 'S', date: 22 }, { day: 'S', date: 23 }, { day: 'M', date: 24 }, { day: 'T', date: 25 },
    { day: 'W', date: 26 }, { day: 'T', date: 27 }, { day: 'F', date: 28 }, { day: 'S', date: 29 }, { day: 'S', date: 30 }
  ];

  if (!isOpen) return null;

  const handleAssignClick = () => {
    if (selectedCell) {
      setAssignedRoom(selectedCell);
    }
  };

  const handleReleaseClick = () => {
    setAssignedRoom('');
  };

  const handleSave = () => {
    if (onConfirmAssignment) {
      onConfirmAssignment({
        resNo: booking.resNo,
        roomNo: assignedRoom || selectedCell,
        guestName: booking.guestName
      });
    }
    alert(`✅ Room #${assignedRoom || selectedCell} successfully assigned to ${booking.guestName}!`);
    onClose();
  };

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '1020px', maxWidth: '98vw' }}>
        {/* Title bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Assign Guest Rooms V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Top Form Fields (Frame 006) */}
          <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 80px 110px 60px 140px 65px 140px 50px 1fr', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Resv. #</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <input className="ids-input" style={{ width: '55px', fontWeight: 700 }} value={booking.resNo || '270'} readOnly />
              <button className="ids-btn-classic" style={{ minWidth: '18px', padding: '1px 4px' }}>?</button>
            </div>

            <span style={{ fontWeight: 600, textAlign: 'right' }}>Room Type</span>
            <input className="ids-input" value={booking.type || 'EXECUTIVE'} readOnly style={{ fontWeight: 700 }} />

            <span style={{ fontWeight: 600, textAlign: 'right' }}>Arrival</span>
            <input className="ids-input" value={booking.arrivalDate || '14-JAN-2022 20:07'} readOnly />

            <span style={{ fontWeight: 600, textAlign: 'right' }}>Departure</span>
            <input className="ids-input" value={booking.departureDate || '17-JAN-2022 12:00'} readOnly />

            <span style={{ fontWeight: 600, textAlign: 'right' }}>Group</span>
            <input className="ids-input" defaultValue="" />
          </div>

          {/* Filter & Action Buttons Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: '#DFDBC9', padding: '5px 10px', border: '1px solid #B0AB9A' }}>
            <span style={{ fontWeight: 600 }}>Block</span>
            <select className="ids-select" style={{ width: '80px' }} value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)}>
              <option value="All">All</option>
              <option value="BA">Block A</option>
              <option value="BB">Block B</option>
            </select>

            <span style={{ fontWeight: 600 }}>Floors</span>
            <select className="ids-select" style={{ width: '80px' }} value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
              <option value="All">All</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              <button className="ids-btn-classic">Feature</button>
              <button className="ids-btn-classic" style={{ fontWeight: 700, color: '#0A246A' }} onClick={handleAssignClick}>
                Assign
              </button>
              <button className="ids-btn-classic" onClick={handleReleaseClick}>
                Release
              </button>
            </div>
          </div>

          {/* Main Workspace: Left Stats & Guest List | Right Tape Chart Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '10px', marginTop: '10px' }}>
            
            {/* Left Column */}
            <div>
              {/* Blocked / Check-In / Balance / Assigned Table */}
              <table className="ids-grid-table" style={{ textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Blocked</th>
                    <th>Check-In</th>
                    <th>Balance</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, textAlign: 'left' }}>Room</td>
                    <td>1</td>
                    <td>0</td>
                    <td>{assignedRoom ? 0 : 1}</td>
                    <td style={{ fontWeight: 700, color: assignedRoom ? '#2E7D32' : '#000' }}>{assignedRoom ? 1 : 0}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, textAlign: 'left' }}>Pax</td>
                    <td>1</td>
                    <td>0</td>
                    <td>{assignedRoom ? 0 : 1}</td>
                    <td style={{ fontWeight: 700, color: assignedRoom ? '#2E7D32' : '#000' }}>{assignedRoom ? 1 : 0}</td>
                  </tr>
                </tbody>
              </table>

              {/* Guest Roster Table */}
              <div style={{ marginTop: '10px', border: '1px solid #716F64', background: '#FFF' }}>
                <table className="ids-grid-table">
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th style={{ width: '60px' }}>Room#</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#CCE0FF' }}>
                      <td style={{ fontWeight: 600 }}>{booking.guestName || 'Mr Biswakarma Santosh'}</td>
                      <td style={{ fontWeight: 700, color: '#0A246A', textAlign: 'center' }}>
                        {assignedRoom || '-'}
                      </td>
                    </tr>
                    <tr><td>&nbsp;</td><td></td></tr>
                    <tr><td>&nbsp;</td><td></td></tr>
                    <tr><td>&nbsp;</td><td></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Month Tape Chart Calendar Grid (Frame 006) */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', overflowX: 'auto' }}>
              <div style={{ background: '#DFDBC9', padding: '4px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #B0AB9A' }}>
                JAN'2022
              </div>

              <table className="ids-grid-table" style={{ fontSize: '10px', width: '100%', minWidth: '600px' }}>
                <thead>
                  {/* Days Row */}
                  <tr>
                    <th style={{ width: '80px', background: '#DFDBC9' }}>Room#</th>
                    {days.map((d, idx) => (
                      <th key={idx} style={{ textAlign: 'center', padding: '2px 4px', width: '26px', background: '#DFDBC9' }}>
                        <div>{d.day}</div>
                        <div style={{ fontWeight: 800 }}>{d.date}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roomInventory.map((r, rIdx) => {
                    const isSelected = selectedCell === r.roomNo;
                    const isAssignedToThis = assignedRoom === r.roomNo;
                    return (
                      <tr key={rIdx}>
                        <td style={{ fontWeight: 700, background: '#EDEAE0', whiteSpace: 'nowrap' }}>
                          {r.roomNo} / {r.type}
                        </td>
                        {days.map((d, dIdx) => {
                          const isBookingDate = d.date >= 14 && d.date <= 16;
                          let cellBg = '#FFFFFF';
                          let cellText = '';

                          if (r.status === 'Dirty' && d.date === 14) {
                            cellBg = '#FFFF00'; // Yellow
                            cellText = 'DY';
                          } else if (isAssignedToThis && isBookingDate) {
                            cellBg = '#00CED1'; // Cyan / Reservation
                            cellText = 'RES';
                          } else if (isSelected && isBookingDate) {
                            cellBg = '#90EE90'; // Light Green Assignable
                            cellText = 'SEL';
                          }

                          return (
                            <td 
                              key={dIdx}
                              onClick={() => setSelectedCell(r.roomNo)}
                              style={{ 
                                textAlign: 'center', 
                                background: cellBg,
                                fontWeight: 700,
                                fontSize: '9px',
                                cursor: 'pointer',
                                border: isSelected && r.roomNo === selectedCell ? '2px solid #0A246A' : '1px solid #E0DEC8'
                              }}
                            >
                              {cellText}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Status Legend Strip (Frame 006) */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', fontSize: '10px', background: '#F8F7F0', padding: '6px 10px', border: '1px solid #B0AB9A' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#FFF', border: '1px solid #888' }}></span> Vacant</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#FFFF00', border: '1px solid #888' }}></span> Dirty</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#FF0000', border: '1px solid #888' }}></span> Occupied</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#800080', border: '1px solid #888' }}></span> OOS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#8B5A2B', border: '1px solid #888' }}></span> OOO</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#00CED1', border: '1px solid #888' }}></span> Reservation</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#FFC0CB', border: '1px solid #888' }}></span> Departure</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '12px', height: '12px', background: '#90EE90', border: '1px solid #888' }}></span> Assignable</span>
          </div>

          {/* Bottom Action Command Strip */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="ids-btn-classic" style={{ fontWeight: 800, color: '#0A246A' }} onClick={handleSave}>
              Save
            </button>
            <button className="ids-btn-classic" onClick={() => setAssignedRoom('')}>
              Clear
            </button>
            <button className="ids-btn-classic">Panel</button>
            <button className="ids-btn-classic" onClick={onClose}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
