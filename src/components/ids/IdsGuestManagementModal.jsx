import React, { useState, useEffect } from 'react';

/* =========================================================================
   VIDEO 10: GUEST MANAGEMENT & CHANGE GUEST INFORMATION IN IDS 6.5 & 7.0
   Replication of:
   1. Guest Management V6.5.002.1 Hub (Video 10 Frame 012)
   2. Room Help V6.5.002.1 / Room# Search & Selector (Video 10 Frame 016)
   3. Change Guest Information V6.5.001.20 Full Editor (Frames 022–060)
   4. Company Information V6.5.002.1 Dialog (Frame 052)
   5. Other Details V6.5.002.2 Dialog (Frame 056)
   6. Guest Information V6.5002.2 ("GI" Bottom Toolbar Shortcut, Frame 068)
   ========================================================================= */

// Default in-house guest database matching Hotel Elite Inn real occupied rooms
export const INITIAL_INHOUSE_GUESTS = [
  {
    roomNo: '102',
    regNo: '501',
    roomType: 'DLX',
    title: 'Mr',
    lastName: 'Mohanty',
    middleName: '',
    firstName: 'Sunil',
    guestName: 'Mr Sunil Mohanty',
    companyName: 'Ashok Leyland Logistics',
    companyCode: 'CORP01',
    resNo: '270',
    arrival: 'Today 14:00',
    departure: 'Tomorrow 12:00',
    folioNo: '102 / 1',
    address: 'Fleet Operations Desk',
    city: 'Rayagada',
    state: 'Odisha',
    country: 'India',
    mobile: '9437012345',
    email: 'sunil.mohanty@ashokleyland.com',
    designation: 'Fleet Manager',
    occupation: 'Logistics',
    guestClassification: 'Corporate',
    guestStatus: 'REG',
    nationality: 'IND',
    paxType: 'Adult',
    checkOutTime: '12 Noon',
    gender: 'Male',
    smoking: 'No',
    billingInstruction: '1 / BTC Direct',
    businessSource: 'CORP',
    marketSegment: 'Corporate FIT',
    payMode: 'BTC',
    planCode: 'CP',
    rate: '1,750.00 - Standard Deluxe',
    specialInstruction: 'Direct Billing Corporate Account'
  },
  {
    roomNo: '105',
    regNo: '502',
    roomType: 'EXE',
    title: 'Mr',
    lastName: 'Rao',
    firstName: 'Ramesh',
    guestName: 'Mr Ramesh Rao',
    companyName: 'Linde India Industrial Gases',
    companyCode: 'CORP02',
    resNo: '271',
    arrival: 'Today 12:00',
    departure: 'Tomorrow 12:00',
    folioNo: '105 / 1',
    city: 'Muniguda',
    state: 'Odisha',
    country: 'India',
    mobile: '9861054321',
    email: 'ramesh.rao@linde.com',
    designation: 'Site Engineer',
    guestClassification: 'Corporate',
    guestStatus: 'REG',
    nationality: 'IND',
    rate: '2,050.00 - Executive Twin',
    planCode: 'CP'
  },
  {
    roomNo: '203',
    regNo: '503',
    roomType: 'EXE',
    title: 'Mr',
    lastName: 'Verma',
    firstName: 'P. K.',
    guestName: 'Mr P. K. Verma',
    companyName: 'Utkal Alumina Int. Ltd (Aditya Birla)',
    companyCode: 'CORP03',
    resNo: '272',
    arrival: 'Today 11:30',
    departure: 'Tomorrow 12:00',
    folioNo: '203 / 1',
    city: 'Tikiri',
    state: 'Odisha',
    country: 'India',
    mobile: '9437198765',
    email: 'pk.verma@adityabirla.com',
    designation: 'Admin VP',
    guestClassification: 'Corporate',
    guestStatus: 'REG',
    nationality: 'IND',
    rate: '2,050.00 - Executive King',
    planCode: 'CP'
  },
  {
    roomNo: '206',
    regNo: '504',
    roomType: 'DLX',
    title: 'Mr',
    lastName: 'Corporate',
    firstName: 'Fleet Admin',
    guestName: 'JK Paper Fleet Desk',
    companyName: 'JK Paper Mills Ltd (Rayagada)',
    companyCode: 'CORP04',
    resNo: '273',
    arrival: 'Today 10:00',
    departure: 'Tomorrow 12:00',
    folioNo: '206 / 1',
    city: 'Jaykaypur',
    state: 'Odisha',
    country: 'India',
    mobile: '6856222000',
    designation: 'Operations Coordinator',
    guestClassification: 'Corporate',
    guestStatus: 'REG',
    nationality: 'IND',
    rate: '1,750.00 - Deluxe King',
    planCode: 'CP'
  },
  {
    roomNo: '301',
    regNo: '505',
    roomType: 'EXE',
    title: 'Mr',
    lastName: 'Sharma',
    firstName: 'Rajesh',
    guestName: 'Mr Rajesh Sharma',
    companyName: '',
    resNo: '274',
    arrival: 'Today 15:00',
    departure: 'Tomorrow 12:00',
    folioNo: '301 / 1',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    mobile: '9437099881',
    guestClassification: 'Regular',
    guestStatus: 'WLK',
    nationality: 'IND',
    rate: '2,050.00 - Executive King',
    planCode: 'CP'
  },
  {
    roomNo: '303',
    regNo: '506',
    roomType: 'EXE',
    title: 'Mr',
    lastName: 'Jena',
    firstName: 'Prakash',
    guestName: 'Mr Prakash Jena',
    companyName: '',
    resNo: '275',
    arrival: 'Today 16:30',
    departure: 'Tomorrow 12:00',
    folioNo: '303 / 1',
    city: 'Rayagada',
    state: 'Odisha',
    country: 'India',
    mobile: '9861011223',
    guestClassification: 'Regular',
    guestStatus: 'REG',
    nationality: 'IND',
    rate: '2,050.00 - Executive King',
    planCode: 'CP'
  },
  {
    roomNo: '109',
    regNo: '507',
    roomType: 'SUI',
    title: 'Mr',
    lastName: 'VIP',
    firstName: 'Patnaik',
    guestName: 'Mr A. K. Patnaik',
    companyName: '',
    resNo: '276',
    arrival: 'Today 18:00',
    departure: 'Day After 12:00',
    folioNo: '109 / 1',
    city: 'Cuttack',
    state: 'Odisha',
    country: 'India',
    mobile: '9437011999',
    guestClassification: 'VIP',
    guestStatus: 'REG',
    nationality: 'IND',
    rate: '3,250.00 - Suite King',
    planCode: 'CP'
  }
];

/* =========================================================================
   1. GUEST MANAGEMENT V6.5.002.1 MODAL (Frame 012)
   ========================================================================= */
export function IdsGuestManagementModal({
  isOpen,
  onClose,
  onOpenChangeGuestInfo,
  onOpenRoomTransfer,
  onOpenAmendStay
}) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '780px', 
          maxWidth: '96vw', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          background: '#ECE9D8'
        }}
      >
        {/* Title Bar matching Frame 012 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Guest Management V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          
          {/* Top Action Tiles matching Frame 012 */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <button 
              className="ids-btn-classic" 
              style={{ padding: '6px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontWeight: 700 }}
              onClick={onOpenChangeGuestInfo}
            >
              <span style={{ fontSize: '14px' }}>👤✏️</span>
              Change Guest Info
            </button>

            <button 
              className="ids-btn-classic" 
              style={{ padding: '6px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              onClick={onOpenRoomTransfer}
            >
              <span style={{ fontSize: '14px' }}>🔄</span>
              Room Transfer
            </button>

            <button 
              className="ids-btn-classic" 
              style={{ padding: '6px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              onClick={onOpenAmendStay}
            >
              <span style={{ fontSize: '14px' }}>📅</span>
              Amend Stay
            </button>

            <button 
              className="ids-btn-classic" 
              style={{ padding: '6px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
            >
              <span style={{ fontSize: '14px' }}>💳</span>
              Credit Limit
            </button>

            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
              <input type="checkbox" />
              Show Special Room
            </label>
          </div>

          {/* Occupancy Group Box matching Frame 012 */}
          <div className="ids-groupbox" style={{ marginBottom: '8px' }}>
            <span className="ids-groupbox-title">Occupancy</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'center', background: '#FFF' }}>
              <thead style={{ background: '#D4D0C8' }}>
                <tr>
                  <th rowSpan={2} style={{ border: '1px solid #999', padding: '2px 4px' }}>Room Type</th>
                  <th colSpan={4} style={{ border: '1px solid #999', padding: '2px 4px' }}>Occupancy</th>
                  <th colSpan={2} style={{ border: '1px solid #999', padding: '2px 4px' }}>Pax</th>
                  <th colSpan={2} style={{ border: '1px solid #999', padding: '2px 4px' }}>Extra Bed</th>
                  <th rowSpan={2} style={{ border: '1px solid #999', padding: '2px 4px' }}>Total Pax</th>
                  <th rowSpan={2} style={{ border: '1px solid #999', padding: '2px 4px' }}>Time Position</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Sgl</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Dbl</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Tpl</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Qud</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Adt</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Chd</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Adult</th>
                  <th style={{ border: '1px solid #999', padding: '1px 3px' }}>Child</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CCC', fontWeight: 700 }}>DLX</td>
                  <td style={{ border: '1px solid #CCC' }}>6</td>
                  <td style={{ border: '1px solid #CCC' }}>20</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>46</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>46</td>
                  <td style={{ border: '1px solid #CCC' }}>29</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', fontWeight: 700 }}>EXE</td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                  <td style={{ border: '1px solid #CCC' }}>5</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>11</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>11</td>
                  <td style={{ border: '1px solid #CCC' }}>3</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', fontWeight: 700 }}>PNH</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', fontWeight: 700 }}>SUI</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>2</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>4</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>4</td>
                  <td style={{ border: '1px solid #CCC' }}>3</td>
                </tr>
                <tr style={{ background: '#ECE9D8', fontWeight: 700 }}>
                  <td style={{ border: '1px solid #999' }}>Total</td>
                  <td style={{ border: '1px solid #999' }}>7</td>
                  <td style={{ border: '1px solid #999' }}>27</td>
                  <td style={{ border: '1px solid #999' }}></td>
                  <td style={{ border: '1px solid #999' }}></td>
                  <td style={{ border: '1px solid #999' }}>61</td>
                  <td style={{ border: '1px solid #999' }}></td>
                  <td style={{ border: '1px solid #999' }}></td>
                  <td style={{ border: '1px solid #999' }}></td>
                  <td style={{ border: '1px solid #999' }}>61</td>
                  <td style={{ border: '1px solid #999' }}>36</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Movements [Current] Group Box matching Frame 012 */}
          <div className="ids-groupbox" style={{ marginBottom: '8px' }}>
            <span className="ids-groupbox-title">Movements [Current]</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'center', background: '#FFF' }}>
              <thead style={{ background: '#D4D0C8' }}>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '2px 4px', textAlign: 'left' }}>Movements</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>DLX</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>EXE</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>PNH</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>SUI</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Room</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Pax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CCC', textAlign: 'left' }}>Expected Checkin</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>2</td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>3</td>
                  <td style={{ border: '1px solid #CCC' }}>9</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', textAlign: 'left' }}>Expected Checkouts</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>2</td>
                  <td style={{ border: '1px solid #CCC' }}>4</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', textAlign: 'left' }}>&Todays Checkout</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', textAlign: 'left' }}>Group Inhouse</td>
                  <td style={{ border: '1px solid #CCC' }}>13</td>
                  <td style={{ border: '1px solid #CCC' }}>3</td>
                  <td style={{ border: '1px solid #CCC' }}></td>
                  <td style={{ border: '1px solid #CCC' }}>1</td>
                  <td style={{ border: '1px solid #CCC', fontWeight: 600 }}>17</td>
                  <td style={{ border: '1px solid #CCC' }}>34</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Guest Count Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="ids-groupbox">
              <span className="ids-groupbox-title">Events</span>
              <div style={{ height: '40px', background: '#FFF', border: '1px solid #999' }}></div>
            </div>

            <div className="ids-groupbox">
              <span className="ids-groupbox-title">Guest Count</span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: '#FFF' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC' }}>Regular</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC', fontWeight: 700 }}>34</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC', fontWeight: 700 }}>61</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC' }}>House Guest</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC' }}></td>
                    <td style={{ padding: '2px 4px', border: '1px solid #CCC' }}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Control Strip */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Refresh</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Forecast</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. ROOM HELP V6.5.002.1 / ROOM# SEARCH & SELECT DIALOG (Frame 016)
   ========================================================================= */
export function IdsRoomHelpLookupModal({
  isOpen,
  onClose,
  guests = INITIAL_INHOUSE_GUESTS,
  onSelectGuest
}) {
  const [selectedRadio, setSelectedRadio] = useState('Room#');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedRoomNo, setSelectedRoomNo] = useState('301');

  if (!isOpen) return null;

  const filteredGuests = guests.filter(g => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    if (selectedRadio === 'Room#') return g.roomNo.toLowerCase().includes(q);
    if (selectedRadio === 'Guest Name') return g.guestName.toLowerCase().includes(q);
    if (selectedRadio === 'Company Name') return (g.companyName || '').toLowerCase().includes(q);
    if (selectedRadio === 'Reg.#') return g.regNo.toLowerCase().includes(q);
    return g.roomNo.toLowerCase().includes(q) || g.guestName.toLowerCase().includes(q);
  });

  const handleSelect = () => {
    const chosen = guests.find(g => g.roomNo === selectedRoomNo) || guests[0];
    if (chosen) {
      onSelectGuest(chosen);
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '740px', 
          maxWidth: '96vw', 
          height: '520px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          background: '#ECE9D8'
        }}
      >
        {/* Title Bar matching Frame 016 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Help V6.5.002.1 / Room#</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Content: Left Search Bar + Right Grid */}
        <div style={{ flex: 1, display: 'flex', padding: '8px', gap: '8px', overflow: 'hidden' }}>
          
          {/* Left Radio Options matching Frame 016 */}
          <div style={{ width: '135px', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', borderRight: '1px solid #B5B2AB', paddingRight: '6px' }}>
            {[
              'Room#', 'Group Name', 'Company Name', 'Nationality',
              'Room Type', 'Guest Name', 'Resv.#', 'Gst. Status',
              'Gst. Clf.', 'Reg.#', 'Passport #', 'Visa #'
            ].map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="roomHelpRadio" 
                  checked={selectedRadio === opt} 
                  onChange={() => setSelectedRadio(opt)} 
                />
                <span>{opt}</span>
              </label>
            ))}

            <input 
              className="ids-input" 
              style={{ width: '100%', marginTop: '6px' }}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search..."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
              <button className="ids-btn-classic" style={{ width: '100%' }}>Scan</button>
              <button 
                className="ids-btn-classic" 
                style={{ width: '100%', fontWeight: 700 }}
                onClick={handleSelect}
              >
                Select
              </button>
              <button className="ids-btn-classic" style={{ width: '100%' }} onClick={onClose}>Exit</button>
            </div>
          </div>

          {/* Right Grid Table matching Frame 016 */}
          <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '2px 4px', borderRight: '1px solid #B5B2AB', width: '55px' }}>Room#</th>
                  <th style={{ padding: '2px 4px', borderRight: '1px solid #B5B2AB', width: '45px' }}>Reg.#</th>
                  <th style={{ padding: '2px 4px', borderRight: '1px solid #B5B2AB', width: '65px' }}>Room Type</th>
                  <th style={{ padding: '2px 4px', borderRight: '1px solid #B5B2AB', width: '160px' }}>Guest Name</th>
                  <th style={{ padding: '2px 4px', borderRight: '1px solid #B5B2AB' }}>Company Name</th>
                  <th style={{ padding: '2px 4px', width: '45px' }}>Resv.#</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g) => {
                  const isSelected = g.roomNo === selectedRoomNo;
                  return (
                    <tr 
                      key={g.roomNo}
                      onClick={() => setSelectedRoomNo(g.roomNo)}
                      onDoubleClick={() => {
                        setSelectedRoomNo(g.roomNo);
                        onSelectGuest(g);
                      }}
                      style={{ 
                        background: isSelected ? '#A6EDF9' : '#FFF', // Authentic cyan selection highlight matching Frame 016
                        cursor: 'pointer',
                        borderBottom: '1px solid #EAEAEA'
                      }}
                    >
                      <td style={{ padding: '2px 4px', fontWeight: 700, borderRight: '1px solid #EAEAEA' }}>{g.roomNo}</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EAEAEA' }}>{g.regNo}</td>
                      <td style={{ padding: '2px 4px', fontWeight: 600, borderRight: '1px solid #EAEAEA' }}>{g.roomType}</td>
                      <td style={{ padding: '2px 4px', fontWeight: 600, borderRight: '1px solid #EAEAEA' }}>{g.guestName}</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EAEAEA' }}>{g.companyName || ''}</td>
                      <td style={{ padding: '2px 4px' }}>{g.resNo || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. CHANGE GUEST INFORMATION V6.5.001.20 MODAL (Frames 022–060)
   ========================================================================= */
export function IdsChangeGuestInfoModal({
  isOpen,
  onClose,
  guest = INITIAL_INHOUSE_GUESTS[0],
  onSaveGuest
}) {
  const [formData, setFormData] = useState(guest);
  const [companyInfoOpen, setCompanyInfoOpen] = useState(false);
  const [otherDetailsOpen, setOtherDetailsOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (guest) {
      setFormData(guest);
      setSaveSuccess(false);
    }
  }, [guest, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    if (onSaveGuest) {
      onSaveGuest(formData);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1210 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '740px', 
          maxWidth: '98vw', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          background: '#ECE9D8'
        }}
      >
        {/* Title Bar matching Frame 022 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Change Guest Information V6.5.001.20</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          
          {/* Top Header Card matching Frame 022 */}
          <div style={{ border: '1px solid #999', padding: '6px', marginBottom: '8px', background: '#F5F4EE' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '45px 120px 100px 1fr', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#555' }}>Title</span>
                <input 
                  className="ids-input" 
                  value={formData.title || 'Mr'} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }} 
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#555' }}>Last Name</span>
                <input 
                  className="ids-input" 
                  value={formData.lastName || ''} 
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }} 
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#555' }}>Middle Name</span>
                <input 
                  className="ids-input" 
                  value={formData.middleName || ''} 
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  style={{ width: '100%' }} 
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#555' }}>First Name</span>
                <input 
                  className="ids-input" 
                  value={formData.firstName || ''} 
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }} 
                />
              </div>
            </div>

            {/* Room / Reg / Dates strip matching Frame 022 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span>Arrival</span>
                <input className="ids-input" value={formData.arrival || '05-JAN-2026 20:28'} readOnly style={{ width: '115px', background: '#EBEBE4' }} />
              </div>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span>Departure</span>
                <input className="ids-input" value={formData.departure || '15-JAN-2026 12:00'} readOnly style={{ width: '115px', background: '#EBEBE4' }} />
              </div>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span>Reg. #</span>
                <input className="ids-input" value={formData.regNo || '580'} readOnly style={{ width: '45px', fontWeight: 700, background: '#EBEBE4' }} />
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Change Tariff</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Amend Stay</button>
              </div>
            </div>

            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span>Room# / Folio #</span>
              <input className="ids-input" value={formData.folioNo || `${formData.roomNo} / 1`} readOnly style={{ width: '70px', fontWeight: 700, background: '#EBEBE4' }} />
            </div>
          </div>

          {/* Middle 2 Columns: Address / Contact (Left) + Classification / Details (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            
            {/* Left Column: Address & Contact matching Frames 030–045 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '4px', alignItems: 'center' }}>
                <span>Address</span>
                <input className="ids-input" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} />

                <span>City</span>
                <input className="ids-input" value={formData.city || ''} onChange={(e) => handleChange('city', e.target.value)} />

                <span>State</span>
                <input className="ids-input" value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} />

                <span>Country</span>
                <input className="ids-input" value={formData.country || ''} onChange={(e) => handleChange('country', e.target.value)} />

                <span>Zip</span>
                <input className="ids-input" value={formData.zip || ''} onChange={(e) => handleChange('zip', e.target.value)} />

                <span>Telephone #</span>
                <input className="ids-input" value={formData.telephone || ''} onChange={(e) => handleChange('telephone', e.target.value)} />

                <span>Mobile</span>
                <input className="ids-input" value={formData.mobile || ''} onChange={(e) => handleChange('mobile', e.target.value)} />

                <span>Email ID</span>
                <input className="ids-input" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} />

                <span>GST No</span>
                <input className="ids-input" value={formData.gstNo || ''} onChange={(e) => handleChange('gstNo', e.target.value)} />
              </div>
            </div>

            {/* Right Column: Profile & Classification matching Frame 022 & 060 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '4px', alignItems: 'center' }}>
                <span>Designation</span>
                <input className="ids-input" value={formData.designation || ''} onChange={(e) => handleChange('designation', e.target.value)} />

                <span>Occupation</span>
                <input className="ids-input" value={formData.occupation || ''} onChange={(e) => handleChange('occupation', e.target.value)} />

                <span>Guest Classification</span>
                <input className="ids-input" value={formData.guestClassification || 'Regular'} readOnly style={{ background: '#EBEBE4' }} />

                <span>Guest Status</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" value={formData.guestStatus || 'WLK'} onChange={(e) => handleChange('guestStatus', e.target.value)} style={{ width: '50px', fontWeight: 700 }} />
                  <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
                  <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Guest Details</button>
                  <button className="ids-btn-classic" style={{ fontSize: '10px' }}>History</button>
                </div>

                <span>Nationality</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" value={formData.nationality || 'IND'} onChange={(e) => handleChange('nationality', e.target.value)} style={{ width: '50px', fontWeight: 700 }} />
                  <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
                  <button className="ids-btn-classic" style={{ fontSize: '10px' }}>More</button>
                  <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Trace</button>
                </div>

                <span>Pax Type</span>
                <select className="ids-select" value={formData.paxType || 'Adult'} onChange={(e) => handleChange('paxType', e.target.value)}>
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                </select>

                <span>Check Out</span>
                <input className="ids-input" value={formData.checkOutTime || '12 Noon'} onChange={(e) => handleChange('checkOutTime', e.target.value)} />

                <span>Gender / Smoke</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select className="ids-select" value={formData.gender || 'Male'} onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <span>Smoking</span>
                  <select className="ids-select" value={formData.smoking || 'No'} onChange={(e) => handleChange('smoking', e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Billing Instruction & Segmentation strip matching Frame 022/060 */}
          <div style={{ borderTop: '1px solid #CCC', paddingTop: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', alignItems: 'center' }}>
              <span>Billing Instruction</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" value={formData.billingInstruction || '1'} onChange={(e) => handleChange('billingInstruction', e.target.value)} style={{ width: '40px' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Business Source</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" value={formData.businessSource || 'WKN'} onChange={(e) => handleChange('businessSource', e.target.value)} style={{ width: '40px' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Market Segment</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" value={formData.marketSegment || 'FIT'} onChange={(e) => handleChange('marketSegment', e.target.value)} style={{ width: '40px' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Pay Mode</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" value={formData.payMode || 'CAS'} onChange={(e) => handleChange('payMode', e.target.value)} style={{ width: '40px' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
              <span>Plan Code</span>
              <input className="ids-input" value={formData.planCode || 'CP'} onChange={(e) => handleChange('planCode', e.target.value)} style={{ width: '60px' }} />

              <span>Rate</span>
              <select className="ids-select" value={formData.rate || 'Discount'} onChange={(e) => handleChange('rate', e.target.value)}>
                <option value="Discount">Discount</option>
                <option value="Rack">Rack</option>
                <option value="Corporate">Corporate</option>
              </select>

              <span>Scanty Baggage</span>
              <select className="ids-select" value={formData.scantyBaggage || 'No'} onChange={(e) => handleChange('scantyBaggage', e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              <span>Group Leader</span>
              <select className="ids-select" value={formData.groupLeader || 'No'} onChange={(e) => handleChange('groupLeader', e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div style={{ padding: '4px 8px', background: '#DFF0D8', border: '1px solid #D6E9C6', color: '#3C763D', textAlign: 'center', fontWeight: 700, marginBottom: '6px' }}>
              ✓ Guest Information for Room #{formData.roomNo} ({formData.lastName || formData.guestName}) Updated Successfully!
            </div>
          )}

          {/* Bottom Action Buttons matching Frame 022/060 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                onClick={() => setCompanyInfoOpen(true)}
              >
                Company Info.
              </button>
              <button className="ids-btn-classic">Local Add.</button>
              <button 
                className="ids-btn-classic" 
                onClick={() => setOtherDetailsOpen(true)}
              >
                Others
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px', fontWeight: 700 }}
                onClick={handleSave}
              >
                <u>S</u>ave
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Back</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      <IdsCompanyInfoModal 
        isOpen={companyInfoOpen} 
        onClose={() => setCompanyInfoOpen(false)} 
        initialCompany={formData.companyName}
      />

      <IdsOtherDetailsModal 
        isOpen={otherDetailsOpen} 
        onClose={() => setOtherDetailsOpen(false)} 
      />
    </div>
  );
}

/* =========================================================================
   4. COMPANY INFORMATION V6.5.002.1 MODAL (Frame 052)
   ========================================================================= */
export function IdsCompanyInfoModal({ isOpen, onClose, initialCompany = '' }) {
  const [compCode, setCompCode] = useState('COM0001');
  const [compName, setCompName] = useState(initialCompany || 'Tawang Trading Corp');
  const [contactPerson, setContactPerson] = useState('Norbu Tenzing');
  const [designation, setDesignation] = useState('Managing Director');
  const [address, setAddress] = useState('Main Bazaar Road');
  const [city, setCity] = useState('Tawang');
  const [state, setState] = useState('Arunachal Pradesh');
  const [country, setCountry] = useState('India');
  const [zip, setZip] = useState('784512');
  const [phone, setPhone] = useState('03794-224466');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '420px', maxWidth: '94vw', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', background: '#ECE9D8' }}
      >
        {/* Title Bar matching Frame 052 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Company Information V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '10px 12px', fontSize: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '4px', alignItems: 'center' }}>
            <span>Company Code</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" value={compCode} onChange={(e) => setCompCode(e.target.value)} style={{ width: '80px', fontWeight: 700 }} />
              <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
            </div>

            <span>Name</span>
            <input className="ids-input" value={compName} onChange={(e) => setCompName(e.target.value)} style={{ fontWeight: 600 }} />

            <span>Contact Person</span>
            <input className="ids-input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />

            <span>Designation</span>
            <input className="ids-input" value={designation} onChange={(e) => setDesignation(e.target.value)} />

            <span>Address</span>
            <input className="ids-input" value={address} onChange={(e) => setAddress(e.target.value)} />

            <span>City</span>
            <input className="ids-input" value={city} onChange={(e) => setCity(e.target.value)} />

            <span>State</span>
            <input className="ids-input" value={state} onChange={(e) => setState(e.target.value)} />

            <span>Country</span>
            <input className="ids-input" value={country} onChange={(e) => setCountry(e.target.value)} />

            <span>Zip</span>
            <input className="ids-input" value={zip} onChange={(e) => setZip(e.target.value)} />

            <span>Phone #</span>
            <input className="ids-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '60px', fontWeight: 700 }} onClick={onClose}>Confirm</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Clear</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. OTHER DETAILS V6.5.002.2 MODAL (Frame 056)
   ========================================================================= */
export function IdsOtherDetailsModal({ isOpen, onClose }) {
  const [arrivalFrom, setArrivalFrom] = useState('Guwahati');
  const [proceedingTo, setProceedingTo] = useState('Tawang');
  const [roomUpgrade, setRoomUpgrade] = useState('EXE');
  const [purposeOfVisit, setPurposeOfVisit] = useState('Business');
  const [postHistory, setPostHistory] = useState('Yes');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '640px', maxWidth: '96vw', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', background: '#ECE9D8' }}
      >
        {/* Title Bar matching Frame 056 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Other Details V6.5002.2</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '10px 12px', fontSize: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '4px', alignItems: 'center' }}>
              <span>Arrival From</span>
              <input className="ids-input" value={arrivalFrom} onChange={(e) => setArrivalFrom(e.target.value)} />

              <span>Arrival Flight</span>
              <input className="ids-input" placeholder="6E-241" />

              <span>Date of Birth</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input className="ids-input" placeholder="DD-MM-YYYY" />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Newspaper</span>
              <select className="ids-select">
                <option>The Assam Tribune</option>
                <option>Times of India</option>
              </select>

              <span>Room Upgrade</span>
              <input className="ids-input" value={roomUpgrade} onChange={(e) => setRoomUpgrade(e.target.value)} style={{ fontWeight: 700 }} />

              <span>Post History</span>
              <select className="ids-select" value={postHistory} onChange={(e) => setPostHistory(e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '4px', alignItems: 'center' }}>
              <span>Proceeding To</span>
              <input className="ids-input" value={proceedingTo} onChange={(e) => setProceedingTo(e.target.value)} />

              <span>Departure Flight</span>
              <input className="ids-input" placeholder="" />

              <span>Place of Birth</span>
              <input className="ids-input" placeholder="Tawang" />

              <span>Language</span>
              <select className="ids-select">
                <option>English</option>
                <option>Hindi</option>
              </select>

              <span>Purpose Of Visit</span>
              <input className="ids-input" value={purposeOfVisit} onChange={(e) => setPurposeOfVisit(e.target.value)} />

              <span>Authorized By</span>
              <input className="ids-input" defaultValue="Manager" />
            </div>
          </div>

          {/* Credit Card Table matching Frame 056 */}
          <div className="ids-groupbox" style={{ marginBottom: '8px' }}>
            <span className="ids-groupbox-title">Credit Card Details</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: '#FFF' }}>
              <thead style={{ background: '#D4D0C8' }}>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Swipe Card</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Credit Card Type</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Card Number</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Expiry Date</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Authorization #</th>
                  <th style={{ border: '1px solid #999', padding: '2px 4px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>VISA</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>XXXX-XXXX-XXXX-4512</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>12/26</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>AUTH9871</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '60px', fontWeight: 700 }} onClick={onClose}>Ok</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Clear</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. GUEST INFORMATION V6.5002.2 (Video 18 Frames 070 & 102, Video 10 Frame 068)
   ========================================================================= */
export function IdsGuestInformationModal({ 
  isOpen, 
  onClose, 
  guests = INITIAL_INHOUSE_GUESTS,
  initialRoomNo = '102',
  paxCheckedOutRooms = [],
  secondPaxCheckedInRooms = []
}) {
  const [searchRoom, setSearchRoom] = useState(initialRoomNo || '102');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedPaxName, setSelectedPaxName] = useState('');

  useEffect(() => {
    if (initialRoomNo) setSearchRoom(String(initialRoomNo));
  }, [initialRoomNo]);

  useEffect(() => {
    const found = guests.find(g => String(g.roomNo) === String(searchRoom)) || guests[0];
    setSelectedGuest(found);
    if (found) {
      setSelectedPaxName(found.guestName || `${found.title || ''} ${found.lastName || ''} ${found.firstName || ''}`);
    }
  }, [searchRoom, guests]);

  if (!isOpen) return null;

  // Determine current pax list for room taking pax check-out and 2nd pax check-in into account
  const isPaxCheckedOut = paxCheckedOutRooms.includes(searchRoom);
  const hasSecondPaxAdded = secondPaxCheckedInRooms.includes(searchRoom);
  const rawPaxList = selectedGuest?.paxList || [selectedGuest?.guestName || 'GUEST'];
  const activePaxList = isPaxCheckedOut 
    ? [rawPaxList[0]] // only primary guest remains
    : (hasSecondPaxAdded ? [...rawPaxList, 'Second Guest'] : rawPaxList);

  const totalPaxDisplay = isPaxCheckedOut || activePaxList.length === 1 ? '1 (1/0)' : '2 (2/0)';

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '780px', 
          maxWidth: '96vw', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)', 
          background: '#ECE9D8',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar matching Video 18 Frame 070 */}
        <div 
          className="ids-dialog-titlebar plain" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 6px'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>Guest Information V6.5002.2</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px', color: '#000' }}>
          {/* Top Row: Name/Room#, Total Pax, and Multi-Pax Guest List (Frames 070 & 102) */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 130px', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
            {/* Left Top Inputs */}
            <div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, width: '90px' }}>Name/Room#</span>
                <input 
                  className="ids-input" 
                  value={searchRoom} 
                  onChange={(e) => setSearchRoom(e.target.value)} 
                  style={{ width: '80px', fontWeight: 700, background: '#FFF' }} 
                />
                <button className="ids-btn-classic" style={{ width: '22px', height: '20px', padding: 0, fontWeight: 700 }}>?</button>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, width: '90px' }}>Total Pax (ADT/CHD)</span>
                <input 
                  className="ids-input" 
                  value={totalPaxDisplay} 
                  readOnly 
                  style={{ width: '80px', background: isPaxCheckedOut ? '#E8F5E9' : '#FFF', fontWeight: 700, color: isPaxCheckedOut ? '#2E7D32' : '#000' }} 
                />
                {isPaxCheckedOut && (
                  <span style={{ fontSize: '10px', color: '#C0392B', fontWeight: 700 }}>[ Pax Checked Out ]</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, width: '90px' }}>Guest Status</span>
                <input className="ids-input" value={selectedGuest?.guestStatus || 'REG'} readOnly style={{ width: '80px', background: '#EBEBE4' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, width: '90px' }}>Nationality</span>
                <input className="ids-input" value={selectedGuest?.nationality || 'India'} readOnly style={{ width: '120px', background: '#EBEBE4' }} />
              </div>
            </div>

            {/* Center: Guest Name List Box (Frames 070 & 102) */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '10px' }}>Guest Name</div>
              <div 
                style={{ 
                  border: '1px solid #7F9DB9', 
                  background: '#FFF', 
                  height: '84px', 
                  overflowY: 'auto',
                  padding: '1px'
                }}
              >
                {activePaxList.map((paxName, idx) => {
                  const isSelected = selectedPaxName === paxName || (idx === 0 && !selectedPaxName);
                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedPaxName(paxName)}
                      style={{ 
                        padding: '2px 6px', 
                        cursor: 'pointer',
                        background: isSelected ? '#0A246A' : 'transparent',
                        color: isSelected ? '#FFF' : '#000',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}
                    >
                      {paxName}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Command Buttons (Frames 070 & 102) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>Rate Info</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>Pckg</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0', gridColumn: 'span 2' }}>Check</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>History</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>Trace</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>Extra Charges</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0' }}>Deposit Details</button>
              <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '2px 0', gridColumn: 'span 2' }}>Fixed Charges</button>
            </div>
          </div>

          {/* Company Row */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, width: '90px' }}>Company</span>
            <input className="ids-input" value={selectedGuest?.companyName || 'JK Paper Mills Ltd'} readOnly style={{ width: '240px', background: '#EBEBE4' }} />
            <span style={{ fontWeight: 600, marginLeft: '12px', width: '90px' }}>Com. Remarks</span>
            <input className="ids-input" value="" readOnly style={{ flex: 1, background: '#EBEBE4' }} />
          </div>

          {/* Main 2-Column Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', border: '1px solid #CCC', padding: '6px 8px', background: '#F8F7F3', marginBottom: '8px' }}>
            {/* Left Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', alignItems: 'center', fontSize: '10.5px' }}>
              <span>Arrival</span>
              <input className="ids-input" value={selectedGuest?.arrival || '16-JAN-2026 11:49 SUNDAY'} readOnly style={{ background: '#EBEBE4' }} />

              <span>Departure</span>
              <input className="ids-input" value={selectedGuest?.departure || '26-JAN-2026 12:00 WEDNESDAY'} readOnly style={{ background: '#EBEBE4' }} />

              <span>Room Night(s)</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input className="ids-input" value={selectedGuest?.roomNights || 10} readOnly style={{ width: '50px', background: '#EBEBE4' }} />
                <span style={{ fontWeight: 600 }}>Ref #</span>
                <input className="ids-input" value="" readOnly style={{ flex: 1, background: '#EBEBE4' }} />
              </div>

              <span>Arrival From</span>
              <input className="ids-input" value="Kolkata" readOnly style={{ background: '#EBEBE4' }} />

              <span>Proceeding To</span>
              <input className="ids-input" value="Bihar" readOnly style={{ background: '#EBEBE4' }} />

              <span>Group</span>
              <input className="ids-input" value={selectedGuest?.group || 'Anirudh'} readOnly style={{ background: '#EBEBE4' }} />

              <span>Plan / Passport#</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="ids-input" value={selectedGuest?.planCode || 'CP'} readOnly style={{ width: '60px', background: '#EBEBE4' }} />
                <input className="ids-input" value="" readOnly style={{ flex: 1, background: '#EBEBE4' }} placeholder="Passport #" />
              </div>

              <span>Bill Inst</span>
              <input className="ids-input" value={selectedGuest?.billInst || 'Direct'} readOnly style={{ background: '#EBEBE4' }} />

              <span>Mkt Segment</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="ids-input" value="FIT" readOnly style={{ width: '60px', background: '#EBEBE4' }} />
                <input className="ids-input" value="FIT" readOnly style={{ flex: 1, background: '#EBEBE4' }} />
              </div>

              <span>Bus Source</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="ids-input" value="WKN" readOnly style={{ width: '60px', background: '#EBEBE4' }} />
                <input className="ids-input" value="WALK IN" readOnly style={{ flex: 1, background: '#EBEBE4' }} />
              </div>
            </div>

            {/* Right Financials Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '4px', alignItems: 'center', fontSize: '10.5px' }}>
              <span>Rate</span>
              <input className="ids-input" value={selectedGuest?.rate || '3,500.00 - DISCOUNT'} readOnly style={{ fontWeight: 700, background: '#EBEBE4' }} />

              <span>Plan</span>
              <input className="ids-input" value="0.00" readOnly style={{ background: '#EBEBE4' }} />

              <span>E.BED RATE</span>
              <input className="ids-input" value="0" readOnly style={{ background: '#EBEBE4' }} />

              <span>E.B.PLAN</span>
              <input className="ids-input" value="0" readOnly style={{ background: '#EBEBE4' }} />

              <span style={{ fontWeight: 700, color: '#0A246A' }}>Guest Balance</span>
              <input className="ids-input" value={selectedGuest?.balance || '11,760.00'} readOnly style={{ fontWeight: 700, background: '#FFF', color: '#0A246A' }} />

              <span>Credit Limit(No)</span>
              <input className="ids-input" value="0.00" readOnly style={{ background: '#EBEBE4' }} />

              <span>Credit Card #</span>
              <input className="ids-input" value="" readOnly style={{ background: '#EBEBE4' }} />

              <span>Expiry Date</span>
              <input className="ids-input" value="" readOnly style={{ background: '#EBEBE4' }} />

              <span style={{ fontWeight: 700 }}>Room Type</span>
              <input className="ids-input" value={selectedGuest?.roomType === 'EXE' ? 'EXECUTIVE (EXE)' : (selectedGuest?.roomType === 'SUI' ? 'SUITE (SUI)' : 'DELUXE (DLX)')} readOnly style={{ fontWeight: 700, background: '#EBEBE4', color: '#7B241C' }} />
            </div>
          </div>

          {/* Bottom Footer Row (Frame 070) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px' }}>
              <span>Check in User: <strong>MANAGER</strong></span>
              <span>VIP Guest: <strong>No</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Room Ins</button>
              <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Display</button>
              <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Messages</button>
              <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Clear</button>
              <button className="ids-btn-classic" style={{ fontSize: '10px', fontWeight: 700 }} onClick={onClose}>Exit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

