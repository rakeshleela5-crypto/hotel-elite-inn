import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  User, Users, Calendar, AlertTriangle, Check, X, Info, 
  HelpCircle, ChevronDown, ChevronRight, FileText, Bed, Key, DoorClosed, Printer
} from 'lucide-react';

/* =========================================================================
   VIDEO 22: HOW TO CHECK-IN 2ND PAX LATER IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Entry Points:
      - Room Status V6.5.002.1 Rack Console (Frames 015–020)
      - Right-click on occupied room (312 O/DLX BASU) -> Walk-in (Frames 035–040)
      - Verification in Guest Information V6.5002.2 (1 Pax: 1(1/0)) (Frames 025–030)
   2. Room Rack V6.5.002.2 Dialog (Frames 042–060):
      - Room# 312, Departure: 27-JAN-2022 12:00
      - Calendar matrix grid (WED-26-01 to FRI-04-02)
      - 2nd Pax Name Fields:
        * Title: Mrs
        * Last Name: Basu
        * Middle Name: (empty)
        * First Name: Anamika
      - Buttons: [ Express Walk-in ], [ Walk-in ], [ Exit ]
   3. Alert Message Dialog (Frames 062–065):
      - Section: Room Info
      - Id: FOMN399, Code: W/968
      - "Room is occupied. Do you want to Abort or Continue?"
      - [ Abort ], [ Continue ]
   4. Room Rack Success Confirmation Dialog (Frames 072–074):
      - Reg.Number: 623
      - Room Number: 312
      - Departure: 27-JAN-2022 12:00
      - [ OK ]
   5. Dynamic Guest Information V6.5002.2 Master Verification (Frames 085–090):
      - Total Pax (ADT/CHD): 2 (2/0) (incremented from 1(1/0))
      - Guest 1: MS BASU ANIRUDH (Reg# 587)
      - Guest 2: Mrs Basu Anamika (Reg# 623)
   ========================================================================= */

export const OCCUPIED_ROOMS_DEMO = [
  {
    roomNo: '312',
    category: 'DELUXE (DLX)',
    primaryGuest: {
      regNo: '587',
      name: 'MS BASU ANIRUDH',
      title: 'Ms',
      lastName: 'Basu',
      firstName: 'Anirudh',
      arrival: '16-JAN-2022 11:49 SUNDAY',
      departure: '27-JAN-2022 12:00 WEDNESDAY',
      rate: '3,500.00 - DISCOUNT',
      balance: 11760.00,
      plan: 'CP',
      company: 'Indian Bank'
    },
    defaultSecondPax: {
      title: 'Mrs',
      lastName: 'Basu',
      middleName: '',
      firstName: 'Anamika',
      regNo: '623',
      relation: 'Spouse',
      phone: '9876543210',
      idType: 'Aadhaar Card',
      idNumber: 'XXXX-XXXX-8921'
    }
  },
  {
    roomNo: '315',
    category: 'EXECUTIVE (EXE)',
    primaryGuest: {
      regNo: '588',
      name: 'MR KHAN ARIF',
      title: 'Mr',
      lastName: 'Khan',
      firstName: 'Arif',
      arrival: '22-JAN-2022 14:00 SATURDAY',
      departure: '28-JAN-2022 12:00 FRIDAY',
      rate: '4,500.00',
      balance: 9000.00,
      plan: 'MAP',
      company: 'Tata Consultancy'
    },
    defaultSecondPax: {
      title: 'Mrs',
      lastName: 'Khan',
      middleName: '',
      firstName: 'Fatima',
      regNo: '624',
      relation: 'Spouse',
      phone: '9845123456',
      idType: 'Passport',
      idNumber: 'Z8941235'
    }
  },
  {
    roomNo: '201',
    category: 'EXECUTIVE (EXE)',
    primaryGuest: {
      regNo: '582',
      name: 'MR KUMAR ROHIT',
      title: 'Mr',
      lastName: 'Kumar',
      firstName: 'Rohit',
      arrival: '20-JAN-2022 10:30 THURSDAY',
      departure: '27-JAN-2022 12:00 THURSDAY',
      rate: '3,800.00',
      balance: 7600.00,
      plan: 'EP',
      company: 'Direct FIT'
    },
    defaultSecondPax: {
      title: 'Mrs',
      lastName: 'Kumar',
      middleName: '',
      firstName: 'Sunita',
      regNo: '625',
      relation: 'Spouse',
      phone: '9123456789',
      idType: 'Driving License',
      idNumber: 'DL-042018-9921'
    }
  }
];

export default function IdsCheckInSecondPaxModal({
  isOpen,
  onClose,
  initialRoomNo = '312',
  accountingDate = '26-JAN-2022',
  onCompleteSecondPaxCheckIn
}) {
  // Active step view: 'room-rack' | 'alert-confirm' | 'success-dialog' | 'guest-info-view'
  const [currentStep, setCurrentStep] = useState('room-rack');

  // Selected Room Context
  const [selectedRoomNo, setSelectedRoomNo] = useState(initialRoomNo || '312');
  const activeRoomData = OCCUPIED_ROOMS_DEMO.find(r => r.roomNo === selectedRoomNo) || OCCUPIED_ROOMS_DEMO[0];

  // Room Rack Form Fields
  const [departureDate, setDepartureDate] = useState('27-JAN-2022');
  const [departureTime, setDepartureTime] = useState('12:00');
  const [title, setTitle] = useState(activeRoomData.defaultSecondPax.title || 'Mrs');
  const [lastName, setLastName] = useState(activeRoomData.defaultSecondPax.lastName || 'Basu');
  const [middleName, setMiddleName] = useState(activeRoomData.defaultSecondPax.middleName || '');
  const [firstName, setFirstName] = useState(activeRoomData.defaultSecondPax.firstName || 'Anamika');
  const [regNo, setRegNo] = useState(activeRoomData.defaultSecondPax.regNo || '623');

  // Timeline rack tab
  const [activeRackTab, setActiveRackTab] = useState('Occupied'); // 'Vacant' | 'Occupied' | 'Dirty' | 'All'
  const [statusMessage, setStatusMessage] = useState('');

  // Guest Information Sheet active pax tab
  const [selectedGuestTab, setSelectedGuestTab] = useState(1); // 0 = primary, 1 = 2nd pax

  // Sync when modal opens or initialRoomNo changes
  useEffect(() => {
    if (isOpen) {
      const room = OCCUPIED_ROOMS_DEMO.find(r => r.roomNo === initialRoomNo) || OCCUPIED_ROOMS_DEMO[0];
      setSelectedRoomNo(room.roomNo);
      setTitle(room.defaultSecondPax.title);
      setLastName(room.defaultSecondPax.lastName);
      setMiddleName(room.defaultSecondPax.middleName);
      setFirstName(room.defaultSecondPax.firstName);
      setRegNo(room.defaultSecondPax.regNo);
      setDepartureDate('27-JAN-2022');
      setCurrentStep('room-rack');
      setStatusMessage('');
      setSelectedGuestTab(1);
    }
  }, [isOpen, initialRoomNo]);

  if (!isOpen) return null;

  // Handle Preset Selection
  const applyPreset = (presetRoomNo) => {
    const room = OCCUPIED_ROOMS_DEMO.find(r => r.roomNo === presetRoomNo);
    if (!room) return;
    setSelectedRoomNo(room.roomNo);
    setTitle(room.defaultSecondPax.title);
    setLastName(room.defaultSecondPax.lastName);
    setMiddleName(room.defaultSecondPax.middleName);
    setFirstName(room.defaultSecondPax.firstName);
    setRegNo(room.defaultSecondPax.regNo);
    setCurrentStep('room-rack');
    setStatusMessage(`Loaded preset for Room ${room.roomNo} (${room.primaryGuest.name})`);
  };

  // Step 1: Click [ Express Walk-in ] -> Trigger Alert Message (Frame 062)
  const handleExpressWalkIn = () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter at least First Name and Last Name for the second pax.');
      return;
    }
    setCurrentStep('alert-confirm');
  };

  // Step 2: Handle Alert Message Buttons
  const handleAbort = () => {
    setCurrentStep('room-rack');
    setStatusMessage('Operation aborted by user.');
  };

  const handleContinue = () => {
    // Proceed to Registration Success Dialog (Frame 072)
    setCurrentStep('success-dialog');
  };

  // Step 3: Handle [ OK ] on Room Rack Success Dialog -> Finalize & Open Guest Info (Frame 088)
  const handleConfirmRegistration = () => {
    const secondPaxRecord = {
      roomNo: selectedRoomNo,
      regNo,
      name: `${title} ${lastName} ${firstName}`.trim(),
      title,
      lastName,
      firstName,
      departure: `${departureDate} ${departureTime}`,
      primaryGuestName: activeRoomData.primaryGuest.name,
      primaryRegNo: activeRoomData.primaryGuest.regNo,
      totalPax: 2,
      checkInTime: `${accountingDate} 15:46`
    };

    if (onCompleteSecondPaxCheckIn) {
      onCompleteSecondPaxCheckIn(secondPaxRecord);
    }

    setCurrentStep('guest-info-view');
    setStatusMessage(`✓ Second Pax (${secondPaxRecord.name}) registered into Room ${selectedRoomNo} successfully! Total Pax is now 2.`);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>


      {/* =========================================================================
          VIEW 1: ROOM RACK V6.5.002.2 (Video 22 Frames 042–060)
         ========================================================================= */}
      {currentStep !== 'guest-info-view' && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '820px', 
            maxWidth: '96vw', 
            background: '#ECE9D8',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'Tahoma, Arial, sans-serif',
            position: 'relative'
          }}
        >
          {/* Classic Window Titlebar */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={13} />
              <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                Room Rack V6.5.002.2
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
            </div>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Top Row: Room# & Departure & Room Type Icons & Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start', marginBottom: '8px' }}>
              {/* Left Details */}
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '11px' }}>Room#</span>
                    <input 
                      className="ids-input"
                      value={selectedRoomNo}
                      onChange={(e) => setSelectedRoomNo(e.target.value)}
                      style={{ width: '70px', fontWeight: 700, background: '#FFF' }}
                    />
                    <span style={{ fontSize: '10px', color: '#0A246A', fontWeight: 600 }}>
                      [ {activeRoomData.category} - Occupied by {activeRoomData.primaryGuest.name} ]
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '11px' }}>Departure</span>
                    <input 
                      className="ids-input"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      style={{ width: '90px', fontWeight: 600, background: '#FFF' }}
                    />
                    <input 
                      className="ids-input"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      style={{ width: '45px', fontWeight: 600, background: '#FFF', textAlign: 'center' }}
                    />
                  </div>

                  {/* Bed/Room Icons */}
                  <div style={{ display: 'flex', gap: '3px', marginLeft: '6px', border: '1px solid #716F64', padding: '2px 4px', background: '#D4D0C8' }}>
                    <Bed size={13} color="#0A246A" title="Room Bed Capacity" />
                    <Key size={13} color="#B7791F" title="Key Assignment" />
                    <DoorClosed size={13} color="#2B6CB0" title="Room Door Status" />
                  </div>
                </div>

                {/* 2nd Pax Name Inputs matching Video 22 Frame 048–058 */}
                <div 
                  style={{ 
                    border: '1px solid #716F64', 
                    padding: '6px 8px', 
                    background: '#F5F3E9',
                    borderRadius: '2px'
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>2nd Pax Registration Details:</span>
                    <span style={{ color: '#0A246A' }}>Room is currently occupied by 1 Pax (1/0)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 140px 110px 1fr', gap: '6px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#333' }}>Title</div>
                      <select 
                        className="ids-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', fontWeight: 700, background: '#FFF' }}
                      >
                        <option value="Mrs">Mrs</option>
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                        <option value="Prof">Prof</option>
                        <option value="Master">Master</option>
                      </select>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: '#333' }}>Last Name</div>
                      <input 
                        className="ids-input"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        style={{ width: '100%', fontWeight: 700, background: '#FFF' }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: '#333' }}>Middle Name</div>
                      <input 
                        className="ids-input"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="(Optional)"
                        style={{ width: '100%', background: '#FFF' }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: '#333' }}>First Name</div>
                      <input 
                        className="ids-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        style={{ width: '100%', fontWeight: 700, background: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Command Buttons matching Video 22 Frame 048–058 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px' }}>
                <button 
                  className="ids-btn-classic" 
                  onClick={handleExpressWalkIn}
                  style={{ 
                    height: '28px', 
                    fontWeight: 700, 
                    background: 'linear-gradient(180deg, #FFF9D2 0%, #FFE57F 100%)',
                    color: '#0A246A',
                    borderColor: '#D4B106',
                    cursor: 'pointer'
                  }}
                  title="Check-in 2nd Pax via Express Walk-in (Video 22 Frame 058)"
                >
                  ⚡ Express Walk-in
                </button>
                <button 
                  className="ids-btn-classic" 
                  onClick={handleExpressWalkIn}
                  style={{ height: '24px', fontWeight: 600, color: '#333' }}
                  title="Detailed Walk-in Registration"
                >
                  Walk-in
                </button>
                <button 
                  className="ids-btn-classic" 
                  onClick={onClose}
                  style={{ height: '24px', fontWeight: 600, color: '#800' }}
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Room Timeline Matrix Grid (Video 22 Frames 042–060) */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', marginBottom: '8px' }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', background: '#D4D0C8', borderBottom: '1px solid #716F64', padding: '2px 4px', gap: '3px' }}>
                {['Vacant', 'Occupied', 'Dirty', 'All'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveRackTab(tab)}
                    style={{
                      padding: '2px 10px',
                      fontSize: '11px',
                      fontWeight: activeRackTab === tab ? 700 : 500,
                      background: activeRackTab === tab ? '#ECE9D8' : '#D4D0C8',
                      border: '1px solid #716F64',
                      borderBottom: activeRackTab === tab ? 'none' : '1px solid #716F64',
                      cursor: 'pointer'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Matrix Table */}
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#E0DFE3', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left', width: '90px' }}>Room#</th>
                      {['WED-26-01', 'THU-27-01', 'FRI-28-01', 'SAT-29-01', 'SUN-30-01', 'MON-31-01', 'TUE-01-02', 'WED-02-02', 'THU-03-02', 'FRI-04-02'].map(date => (
                        <th key={date} style={{ border: '1px solid #B0AB9A', padding: '3px 4px', textAlign: 'center', width: '65px' }}>
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { r: '203', t: 'DLX', status: 'V' },
                      { r: '204', t: 'DLX', status: 'V' },
                      { r: '205', t: 'DLX', status: 'V' },
                      { r: '211', t: 'DLX', status: 'V' },
                      { r: '311', t: 'DLX', status: 'O', guest: 'DEURI HEMCHANDRA' },
                      { r: '312', t: 'DLX', status: 'O', guest: 'BASU ANIRUDH', isTarget: true },
                      { r: '314', t: 'DLX', status: 'V' },
                      { r: '315', t: 'EXE', status: 'O', guest: 'KHAN ARIF' },
                      { r: '316', t: 'SUI', status: 'O', guest: 'ANIL KUMAR G' },
                      { r: '401', t: 'EXE', status: 'V' },
                      { r: '405', t: 'DLX', status: 'O', guest: 'ANIRUDH' },
                      { r: '501', t: 'EXE', status: 'O', guest: 'ANIL KUMAR G' }
                    ].map(row => {
                      const isSelected = row.r === selectedRoomNo;
                      return (
                        <tr 
                          key={row.r} 
                          onClick={() => {
                            if (row.status === 'O') {
                              setSelectedRoomNo(row.r);
                              const room = OCCUPIED_ROOMS_DEMO.find(d => d.roomNo === row.r);
                              if (room) {
                                setTitle(room.defaultSecondPax.title);
                                setLastName(room.defaultSecondPax.lastName);
                                setMiddleName(room.defaultSecondPax.middleName);
                                setFirstName(room.defaultSecondPax.firstName);
                                setRegNo(room.defaultSecondPax.regNo);
                              }
                            }
                          }}
                          style={{ 
                            background: isSelected ? '#316AC5' : (row.status === 'O' ? '#EBF4FF' : '#FFFFFF'),
                            color: isSelected ? '#FFFFFF' : '#000000',
                            cursor: row.status === 'O' ? 'pointer' : 'default',
                            fontWeight: isSelected ? 700 : 400
                          }}
                        >
                          <td style={{ border: '1px solid #D4D0C8', padding: '2px 6px', fontWeight: 600 }}>
                            {row.r} {row.t} {row.isTarget && '⭐'}
                          </td>
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <td 
                              key={idx} 
                              style={{ 
                                border: '1px solid #D4D0C8', 
                                padding: '2px', 
                                textAlign: 'center',
                                background: isSelected ? '#316AC5' : (row.status === 'O' && idx < 2 ? '#C6D9E8' : 'transparent'),
                                color: isSelected ? '#FFF' : '#333'
                              }}
                            >
                              {row.status === 'O' && idx < 2 ? (idx === 0 ? (row.guest?.split(' ')[0] || 'OCC') : 'OCC') : ''}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Status & Filter Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#444' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#38A169', display: 'inline-block', border: '1px solid #22543D' }}></span> Vacant
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#3182CE', display: 'inline-block', border: '1px solid #2A4365' }}></span> Occupied
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#D69E2E', display: 'inline-block', border: '1px solid #744210' }}></span> Dirty
                </span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#0A246A', fontWeight: 600 }}>
                {statusMessage || `Target: Room #${selectedRoomNo} currently occupied by ${activeRoomData.primaryGuest.name}`}
              </div>
            </div>
          </div>

          {/* =========================================================================
              MODAL POPUP 1: ALERT MESSAGE (Video 22 Frames 062 & 065)
             ========================================================================= */}
          {currentStep === 'alert-confirm' && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300
              }}
            >
              <div 
                style={{
                  width: '380px',
                  background: '#ECE9D8',
                  border: '2px solid #FFF',
                  borderRightColor: '#716F64',
                  borderBottomColor: '#716F64',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
              >
                {/* Alert Dialog Title Bar */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                    color: '#FFF',
                    padding: '2px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  <span>Alert Message</span>
                  <button className="ids-win-btn close" onClick={handleAbort} style={{ width: '14px', height: '12px', fontSize: '8px' }}>✕</button>
                </div>

                <div style={{ padding: '12px' }}>
                  {/* Two Column Alert Box (Frames 062 & 065) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', marginBottom: '12px' }}>
                    {/* Left: Room Info */}
                    <fieldset style={{ border: '1px solid #716F64', padding: '6px 8px', margin: 0, fontSize: '11px' }}>
                      <legend style={{ padding: '0 4px', fontWeight: 600 }}>Room Info</legend>
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ color: '#555' }}>Id</span>
                        <input className="ids-input" readOnly value="FOMN399" style={{ width: '100%', background: '#F5F5F5' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '4px' }}>
                        <span style={{ color: '#555' }}>Code</span>
                        <input className="ids-input" readOnly value="W/968" style={{ width: '100%', background: '#F5F5F5' }} />
                      </div>
                    </fieldset>

                    {/* Right: Message Prompt */}
                    <div 
                      style={{ 
                        border: '1px solid #716F64', 
                        background: '#FFF', 
                        padding: '8px', 
                        fontSize: '11px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: '#000',
                        fontWeight: 500
                      }}
                    >
                      <div>Room is occupied. Do you want to Abort or Continue?</div>
                    </div>
                  </div>

                  {/* Buttons matching Video 22 Frame 062 */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                    <button 
                      className="ids-btn-classic" 
                      onClick={handleAbort}
                      style={{ minWidth: '70px', height: '23px', fontWeight: 600 }}
                    >
                      Abort
                    </button>
                    <button 
                      className="ids-btn-classic" 
                      onClick={handleContinue}
                      style={{ minWidth: '70px', height: '23px', fontWeight: 700, color: '#0A246A' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODAL POPUP 2: ROOM RACK REGISTRATION SUCCESS (Video 22 Frames 072 & 074)
             ========================================================================= */}
          {currentStep === 'success-dialog' && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1350
              }}
            >
              <div 
                style={{
                  width: '320px',
                  background: '#ECE9D8',
                  border: '2px solid #FFF',
                  borderRightColor: '#716F64',
                  borderBottomColor: '#716F64',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
              >
                {/* Title Bar */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                    color: '#FFF',
                    padding: '2px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  <span>Room Rack</span>
                  <button className="ids-win-btn close" onClick={handleConfirmRegistration} style={{ width: '14px', height: '12px', fontSize: '8px' }}>✕</button>
                </div>

                <div style={{ padding: '14px 16px', fontSize: '11px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: '#444' }}>Reg.Number:</span>
                    <span style={{ fontWeight: 800, color: '#0A246A' }}>{regNo}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: '#444' }}>Room Number:</span>
                    <span style={{ fontWeight: 800 }}>{selectedRoomNo}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '14px' }}>
                    <span style={{ color: '#444' }}>Departure:</span>
                    <span style={{ fontWeight: 600 }}>{departureDate} {departureTime}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="ids-btn-classic" 
                      onClick={handleConfirmRegistration}
                      style={{ minWidth: '70px', height: '24px', fontWeight: 700, color: '#0A246A' }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: GUEST INFORMATION V6.5002.2 (Video 22 Frames 085–090)
          Displays Room 312 with 2 (2/0) Pax: MS BASU ANIRUDH & Mrs Basu Anamika
         ========================================================================= */}
      {currentStep === 'guest-info-view' && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '820px', 
            maxWidth: '96vw', 
            background: '#ECE9D8',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            boxShadow: '0 10px 32px rgba(0,0,0,0.5)',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
              Guest Information V6.5002.2 - Room #{selectedRoomNo} (2 Pax Active)
            </span>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px' }}>
            {/* Top Grid: Room, Total Pax, and Multi-Pax Guest Selection List */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr 140px', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
              {/* Left Column Controls */}
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, width: '110px' }}>Name/Room#</span>
                  <input className="ids-input" readOnly value={selectedRoomNo} style={{ width: '80px', fontWeight: 700, background: '#FFF' }} />
                  <button className="ids-btn-classic" style={{ width: '22px', height: '20px', padding: 0, fontWeight: 700 }}>?</button>
                </div>

                {/* Video 22 Frame 088: Total Pax displays 2 (2/0) */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, width: '110px' }}>Total Pax (ADT/CHD)</span>
                  <div 
                    style={{ 
                      padding: '2px 8px', 
                      background: '#FFF7CC', 
                      border: '1px solid #D69E2E', 
                      color: '#B7791F', 
                      fontWeight: 800,
                      borderRadius: '2px',
                      fontSize: '11px'
                    }}
                  >
                    2 (2/0) ⭐
                  </div>
                  <span style={{ fontSize: '10px', color: '#276749', fontWeight: 600 }}>✓ 2nd Pax Added Later</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, width: '110px' }}>Guest Status</span>
                  <input className="ids-input" readOnly value="REG" style={{ width: '80px', background: '#FFF' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, width: '110px' }}>Nationality</span>
                  <input className="ids-input" readOnly value="India" style={{ width: '120px', background: '#FFF' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, width: '110px' }}>Company</span>
                  <input className="ids-input" readOnly value={activeRoomData.primaryGuest.company} style={{ width: '160px', background: '#FFF' }} />
                </div>
              </div>

              {/* Center: Guest Name Multi-Pax Selector List (Video 22 Frame 088) */}
              <div>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: '#0A246A' }}>
                  Guest Name (Click to toggle profile):
                </span>
                <div 
                  style={{ 
                    border: '1px solid #716F64', 
                    background: '#FFF', 
                    height: '80px', 
                    overflowY: 'auto',
                    padding: '2px'
                  }}
                >
                  {/* Pax 1 */}
                  <div 
                    onClick={() => setSelectedGuestTab(0)}
                    style={{ 
                      padding: '3px 6px', 
                      background: selectedGuestTab === 0 ? '#316AC5' : 'transparent',
                      color: selectedGuestTab === 0 ? '#FFF' : '#000',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      borderRadius: '1px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>1. {activeRoomData.primaryGuest.name}</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>Reg# {activeRoomData.primaryGuest.regNo}</span>
                  </div>

                  {/* Pax 2 (Checked in later in Video 22) */}
                  <div 
                    onClick={() => setSelectedGuestTab(1)}
                    style={{ 
                      padding: '3px 6px', 
                      background: selectedGuestTab === 1 ? '#316AC5' : 'transparent',
                      color: selectedGuestTab === 1 ? '#FFF' : '#000',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      borderRadius: '1px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '2px'
                    }}
                  >
                    <span>2. {title} {lastName} {firstName} ⭐</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>Reg# {regNo}</span>
                  </div>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>Rate Info</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>Check</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>History</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>Trace</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>Extra Charges</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px' }}>Deposit</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '2px 4px', gridColumn: 'span 2' }}>Fixed Charges</button>
              </div>
            </div>

            {/* Profile Tab Details for the Selected Pax */}
            <div 
              style={{ 
                border: '1px solid #716F64', 
                background: '#F5F3E9', 
                padding: '8px 10px', 
                marginBottom: '8px',
                borderRadius: '2px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #DDD', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#0A246A' }}>
                  {selectedGuestTab === 1 ? `Second Pax Card: ${title} ${lastName} ${firstName} (Reg # ${regNo})` : `Primary Pax Card: ${activeRoomData.primaryGuest.name} (Reg # ${activeRoomData.primaryGuest.regNo})`}
                </span>
                <span style={{ fontSize: '10px', color: '#555' }}>
                  Arrival: {activeRoomData.primaryGuest.arrival} | Departure: {departureDate} {departureTime}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                <div>
                  <span style={{ color: '#555', fontSize: '10px' }}>Rate / Tariff:</span>
                  <div style={{ fontWeight: 700 }}>₹{activeRoomData.primaryGuest.rate}</div>
                </div>
                <div>
                  <span style={{ color: '#555', fontSize: '10px' }}>Room Plan:</span>
                  <div style={{ fontWeight: 700 }}>{activeRoomData.primaryGuest.plan}</div>
                </div>
                <div>
                  <span style={{ color: '#555', fontSize: '10px' }}>Folio Balance:</span>
                  <div style={{ fontWeight: 700, color: '#C53030' }}>₹{activeRoomData.primaryGuest.balance.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ color: '#555', fontSize: '10px' }}>Room Category:</span>
                  <div style={{ fontWeight: 700 }}>{activeRoomData.category}</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #716F64', paddingTop: '6px' }}>
              <div style={{ fontSize: '10px', color: '#276749', fontWeight: 600 }}>
                ✓ Room 312 now has 2 registered guests. Both can receive room keys and billing folios.
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic"
                  onClick={() => setCurrentStep('room-rack')}
                  style={{ fontWeight: 600 }}
                >
                  ← Back to Room Rack
                </button>
                <button 
                  className="ids-btn-classic"
                  onClick={onClose}
                  style={{ fontWeight: 700, color: '#0A246A' }}
                >
                  Close & Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
