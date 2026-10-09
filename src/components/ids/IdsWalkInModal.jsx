import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { User, Users, Calendar, DollarSign, Check, X, FileText, Search, CreditCard, Building, Car } from 'lucide-react';

/* =========================================================================
   VIDEO 17: WALK-IN PROCESS FOR DIRECT GUEST IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Room Rack V6.5.002.2 (Video 17 Frames 010–030)
      - Interactive room timeline calendar matrix
      - Room# 203 selection & Departure: 25-FEB-2022 12:00
      - Guest Title: Mr, Last Name: Sarkar, First Name: Rajesh
      - [ Express Walk-in ], [ Walk-in ], [ Exit ] command buttons
   2. Walk-Ins V6.5002.5 Registration Console (Video 17 Frames 035–075)
      - Registration for 203, Pax: 1 (or 2), Folio #: 1
      - Address (Patna, Bihar, India, 874562), Mobile (1234567890), Email (xyz@gmail.com)
      - Classification: Regular, Guest Status: WLK, Nationality: IND
      - Rate: Discount, 2,500.00 INR display badge
      - Company: COM0010 (Pooja Associates), Bill Inst: 1, Plan Code: CP
   3. Rate Details V6.5.002.5 Dialog (Video 17 Frame 065)
      - Plan CP, Reason Entry: DISCOUNT / No Reason / Not applicable
      - Tax Structure 798 / 804, Exb. Tax Struct 804 / 804
   4. Special Instruction Dialog (Video 17 Frame 080)
   5. Other Details V6.5002.2 Dialog (Video 17 Frame 085)
      - Arrival From: Kolkata, Proceeding To: Bihar, Post History: Yes
      - Credit Card Swipe Grid & Identification details
   6. Room Number203 Folio Selection Dialog (Video 17 Frame 095)
      - Reg # 621, Folio # 1, Pax 1, Sarkar Rajesh
   7. Checkins "Add More Pax To This Room" Dialog (Video 17 Frame 100)
      - Adding Pax 2: Mrs Sharma, Reg # 622
   8. Guest Information V6.5002.2 Master Sheet (Video 17 Frame 110)
      - Displays Room 203 with both Mr Sarkar Rajesh & Mrs Sharma
   ========================================================================= */

export const DEFAULT_WALK_IN_ROOM = {
  roomNo: '203',
  roomType: 'DLX',
  category: 'DELUXE (DLX)',
  rate: 2500.00,
  plan: 'CP',
  departureDate: '25-FEB-2022',
  departureTime: '12:00',
  guest1: {
    title: 'Mr',
    lastName: 'Sarkar',
    middleName: '',
    firstName: 'Rajesh',
    address: 'Patna',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    zip: '874562',
    telephone: '',
    mobile: '1234567890',
    email: 'xyz@gmail.com',
    gender: 'Male',
    gstNo: '',
    designation: '',
    occupation: '',
    classification: 'Regular',
    guestStatus: 'WLK',
    nationality: 'IND',
    paxType: 'Adult',
    checkOutTime: '12 Noon',
    sendSms: 'No',
    smoking: 'No',
    companyCode: 'COM0010',
    companyName: 'Pooja Associates (Contract Division)',
    billInst: '1',
    businessSource: 'WKN',
    marketSegment: 'FIT',
    payMode: 'CAS',
    planCode: 'CP',
    rateCode: 'Discount',
    scantyBaggage: 'No',
    regNo: '621'
  },
  guest2: {
    title: 'Mrs',
    lastName: 'Sharma',
    middleName: '',
    firstName: '',
    gender: 'Female',
    regNo: '622'
  }
};

export default function IdsWalkInModal({
  isOpen,
  onClose,
  onCompleteWalkIn,
  initialRoomNo = '203'
}) {
  // Navigation Flow: 'rack' | 'registration' | 'guest-info'
  const [activeStep, setActiveStep] = useState('rack');

  // Step 1: Room Rack State (Video 17 Frame 010–030)
  const [selectedRoom, setSelectedRoom] = useState(initialRoomNo || '203');
  const [rackDepDate, setRackDepDate] = useState('25-FEB-2022');
  const [rackDepTime, setRackDepTime] = useState('12:00');
  const [rackTitle, setRackTitle] = useState('Mr');
  const [rackLastName, setRackLastName] = useState('Sarkar');
  const [rackMiddleName, setRackMiddleName] = useState('');
  const [rackFirstName, setRackFirstName] = useState('Rajesh');
  const [activeRackTab, setActiveRackTab] = useState('Vacant');

  // Step 2: Walk-Ins Registration Form State (Video 17 Frame 035–075)
  const [currentPax, setCurrentPax] = useState(1);
  const [folioNo] = useState('1');
  const [regNo, setRegNo] = useState('621');

  // Guest 1 form data
  const [guest1Title, setGuest1Title] = useState('Mr');
  const [guest1LastName, setGuest1LastName] = useState('Sarkar');
  const [guest1MiddleName, setGuest1MiddleName] = useState('');
  const [guest1FirstName, setGuest1FirstName] = useState('Rajesh');
  const [address, setAddress] = useState('Patna');
  const [city, setCity] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [country, setCountry] = useState('India');
  const [zip, setZip] = useState('874562');
  const [telephone, setTelephone] = useState('');
  const [mobile, setMobile] = useState('1234567890');
  const [email, setEmail] = useState('xyz@gmail.com');
  const [gender, setGender] = useState('Male');
  const [gstNo, setGstNo] = useState('');
  const [designation, setDesignation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [classification, setClassification] = useState('Regular');
  const [guestStatus, setGuestStatus] = useState('WLK');
  const [nationality, setNationality] = useState('IND');
  const [paxType, setPaxType] = useState('Adult');
  const [checkOutTime, setCheckOutTime] = useState('12 Noon');
  const [sendSms, setSendSms] = useState('No');
  const [smoking, setSmoking] = useState('No');
  const [rateAmount, setRateAmount] = useState(2500.00);

  // Commercials
  const [companyCode, setCompanyCode] = useState('COM0010');
  const [companyName, setCompanyName] = useState('Pooja Associates (Contract Division)');
  const [billInst, setBillInst] = useState('1');
  const [businessSource, setBusinessSource] = useState('WKN');
  const [marketSegment, setMarketSegment] = useState('FIT');
  const [payMode, setPayMode] = useState('CAS');
  const [planCode, setPlanCode] = useState('CP');
  const [rateOption, setRateOption] = useState('Discount');
  const [scantyBaggage, setScantyBaggage] = useState('No');

  // Guest 2 form data (Frame 100)
  const [guest2Title, setGuest2Title] = useState('Mrs');
  const [guest2LastName, setGuest2LastName] = useState('Sharma');
  const [guest2Gender, setGuest2Gender] = useState('Female');

  // Sub-dialogs
  const [rateDetailsOpen, setRateDetailsOpen] = useState(false);
  const [rateDiscountReason, setRateDiscountReason] = useState('No Reason / Not applicable');
  const [rateAuthorizedBy, setRateAuthorizedBy] = useState('MANAGER');

  const [specialInstOpen, setSpecialInstOpen] = useState(false);
  const [specialInstText, setSpecialInstText] = useState('VIP Walk-in guest. Express check-in approved.');

  const [otherDetailsOpen, setOtherDetailsOpen] = useState(false);
  const [arrivalFrom, setArrivalFrom] = useState('Kolkata');
  const [proceedingTo, setProceedingTo] = useState('Bihar');
  const [postHistory, setPostHistory] = useState('Yes');
  const [identificationType, setIdentificationType] = useState('Aadhar Card');
  const [identificationNo, setIdentificationNo] = useState('IND-8921-7721');

  const [roomFolioSelectOpen, setRoomFolioSelectOpen] = useState(false);
  const [addMorePaxOpen, setAddMorePaxOpen] = useState(false);
  const [isSecondPaxActive, setIsSecondPaxActive] = useState(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState('');

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setActiveStep('rack');
      setSelectedRoom(initialRoomNo || '203');
      setRackDepDate('25-FEB-2022');
      setRackDepTime('12:00');
      setRackTitle('Mr');
      setRackLastName('Sarkar');
      setRackMiddleName('');
      setRackFirstName('Rajesh');
      setCurrentPax(1);
      setRegNo('621');
      setIsSecondPaxActive(false);
      setRateDetailsOpen(false);
      setSpecialInstOpen(false);
      setOtherDetailsOpen(false);
      setRoomFolioSelectOpen(false);
      setAddMorePaxOpen(false);
      setStatusMessage('');
    }
  }, [isOpen, initialRoomNo]);

  if (!isOpen) return null;

  // Handle Quick Fill
  const handleAutoFillVideo17 = () => {
    setSelectedRoom('203');
    setRackDepDate('25-FEB-2022');
    setRackDepTime('12:00');
    setRackTitle('Mr');
    setRackLastName('Sarkar');
    setRackFirstName('Rajesh');
    setStatusMessage('Sample walk-in preset loaded: Room 203 for Mr. Rajesh Sarkar.');
  };

  // Move from Rack to Walk-in Registration
  const handleOpenWalkInForm = () => {
    setGuest1Title(rackTitle);
    setGuest1LastName(rackLastName);
    setGuest1FirstName(rackFirstName);
    setActiveStep('registration');
  };

  // Handle Save Registration
  const handleSaveRegistration = () => {
    if (!isSecondPaxActive) {
      // First Pax saved: Open RoomFolio popup (Frame 095)
      setRoomFolioSelectOpen(true);
    } else {
      // Second Pax saved: Finalize and open Guest Information Sheet (Frame 110)
      setActiveStep('guest-info');
    }
  };

  // Complete walk-in process
  const handleFinishWalkIn = () => {
    if (onCompleteWalkIn) {
      onCompleteWalkIn({
        roomNo: selectedRoom,
        roomType: 'DLX',
        pax: isSecondPaxActive ? 2 : 1,
        regNo: '621',
        regNo2: isSecondPaxActive ? '622' : null,
        guestName: isSecondPaxActive ? `${guest1Title} ${guest1LastName} ${guest1FirstName} & ${guest2Title} ${guest2LastName}` : `${guest1Title} ${guest1LastName} ${guest1FirstName}`,
        guests: [
          { name: `${guest1Title} ${guest1LastName} ${guest1FirstName}`, regNo: '621' },
          ...(isSecondPaxActive ? [{ name: `${guest2Title} ${guest2LastName}`, regNo: '622' }] : [])
        ],
        arrival: '23-JAN-2022 20:16',
        departure: `${rackDepDate} ${rackDepTime}`,
        rate: rateAmount,
        company: companyName,
        payMode,
        planCode
      });
    }
    onClose();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* =========================================================================
          SCREEN 1: ROOM RACK V6.5.002.2 (Video 17 Frames 010–030)
          ========================================================================= */}
      {activeStep === 'rack' && (
        <div className="ids-dialog-window" style={{ width: '890px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Rack V6.5.002.2</span>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px' }}>
            {/* Top Form Section matching Frame 015 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', background: '#ECE9D8', padding: '6px', border: '1px solid #CCC' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '50px' }}>Room#</span>
                  <input 
                    className="ids-input" 
                    style={{ width: '80px', fontWeight: 700, background: '#FFF' }} 
                    value={selectedRoom} 
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  />
                  <span style={{ marginLeft: '10px' }}>Departure</span>
                  <input 
                    className="ids-input" 
                    style={{ width: '90px', background: '#FFF' }} 
                    value={rackDepDate} 
                    onChange={(e) => setRackDepDate(e.target.value)}
                  />
                  <input 
                    className="ids-input" 
                    style={{ width: '50px', background: '#FFF' }} 
                    value={rackDepTime} 
                    onChange={(e) => setRackDepTime(e.target.value)}
                  />

                  {/* 3 Authentic Icons matching Frame 015 */}
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                    <button className="ids-btn-classic" style={{ padding: '1px 6px' }} title="Gate / Room Status">⛩️</button>
                    <button className="ids-btn-classic" style={{ padding: '1px 6px' }} title="Room Transfer">⇆</button>
                    <button className="ids-btn-classic" style={{ padding: '1px 6px' }} title="Bedding Type">🛏️</button>
                  </div>
                </div>

                {/* Name Row matching Frame 025 & 030 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '50px' }}>Name</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#555', textAlign: 'center' }}>Title</span>
                    <input 
                      className="ids-input" 
                      style={{ width: '45px' }} 
                      value={rackTitle} 
                      onChange={(e) => setRackTitle(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#555', textAlign: 'center' }}>Last Name</span>
                    <input 
                      className="ids-input" 
                      style={{ width: '130px' }} 
                      value={rackLastName} 
                      onChange={(e) => setRackLastName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#555', textAlign: 'center' }}>Middle Name</span>
                    <input 
                      className="ids-input" 
                      style={{ width: '120px' }} 
                      value={rackMiddleName} 
                      onChange={(e) => setRackMiddleName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#555', textAlign: 'center' }}>First Name</span>
                    <input 
                      className="ids-input" 
                      style={{ width: '130px' }} 
                      value={rackFirstName} 
                      onChange={(e) => setRackFirstName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons on top-right matching Frame 015 & 030 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '110px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 600, padding: '3px 8px' }}
                  onClick={() => alert('Express Walk-in shortcut')}
                >
                  Express Walk-in
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, padding: '4px 8px', background: '#D1E7DD', color: '#0F5132' }}
                  onClick={handleOpenWalkInForm}
                  title="Open Walk-Ins Registration Console (Frame 030)"
                >
                  Walk-in
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '3px 8px' }}
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Tabs matching Frame 015: Vacant, Occupied, Dirty, All */}
            <div style={{ display: 'flex', borderBottom: '1px solid #7F9DB9', background: '#ECE9D8', paddingLeft: '4px' }}>
              {['Vacant', 'Occupied', 'Dirty', 'All'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRackTab(tab)}
                  style={{
                    background: activeRackTab === tab ? '#FFF' : '#ECE9D8',
                    border: '1px solid #7F9DB9',
                    borderBottom: activeRackTab === tab ? '1px solid #FFF' : '1px solid #7F9DB9',
                    padding: '3px 14px',
                    fontSize: '11px',
                    fontWeight: activeRackTab === tab ? 700 : 400,
                    cursor: 'pointer',
                    marginBottom: '-1px'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Timeline Calendar Grid matching Frame 015 */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '220px', overflowY: 'auto' }}>
              <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', color: '#000' }}>
                    <th style={{ width: '70px', borderRight: '1px solid #BBB' }}>Room#</th>
                    {['SUN-23-01', 'MON-24-01', 'TUE-25-01', 'WED-26-01', 'THU-27-01', 'FRI-28-01', 'SAT-29-01', 'SUN-30-01', 'MON-31-01', 'TUE-01-02'].map((col) => (
                      <th key={col} style={{ borderRight: '1px solid #BBB', textAlign: 'center', width: '65px' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* BA-FF01 */}
                  <tr style={{ background: '#F5F5F5', fontWeight: 700, color: '#0A246A' }}>
                    <td colSpan={11} style={{ padding: '2px 4px', borderBottom: '1px solid #DDD' }}>BA-FF01</td>
                  </tr>
                  <tr style={{ height: '18px', borderBottom: '1px solid #EEE' }}>
                    <td style={{ background: '#ECE9D8', fontWeight: 600, borderRight: '1px solid #CCC' }}>7777 ZZZ</td>
                    {[...Array(10)].map((_, i) => <td key={i} style={{ borderRight: '1px solid #EEE' }}></td>)}
                  </tr>
                  <tr style={{ height: '18px', borderBottom: '1px solid #EEE' }}>
                    <td style={{ background: '#ECE9D8', fontWeight: 600, borderRight: '1px solid #CCC' }}>9999 ZZZ</td>
                    {[...Array(10)].map((_, i) => <td key={i} style={{ borderRight: '1px solid #EEE' }}></td>)}
                  </tr>

                  {/* BA-FF02: Target Room 203 DLX matching Video 17 Frame 015 */}
                  <tr style={{ background: '#F5F5F5', fontWeight: 700, color: '#0A246A' }}>
                    <td colSpan={11} style={{ padding: '2px 4px', borderBottom: '1px solid #DDD' }}>BA-FF02</td>
                  </tr>
                  <tr 
                    style={{ 
                      height: '20px', 
                      background: selectedRoom === '203' ? '#FFF7CC' : '#FFF', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid #EEE' 
                    }}
                    onClick={() => { setSelectedRoom('203'); }}
                  >
                    <td style={{ background: selectedRoom === '203' ? '#FFD54F' : '#ECE9D8', fontWeight: 700, borderRight: '1px solid #CCC', color: '#000' }}>
                      203 DLX ★
                    </td>
                    <td style={{ background: '#E8F5E9', borderRight: '1px solid #EEE', textAlign: 'center', color: '#2E7D32', fontSize: '9px' }}>Vacant</td>
                    {[...Array(9)].map((_, i) => (
                      <td key={i} style={{ borderRight: '1px solid #EEE', textAlign: 'center', color: '#888', fontSize: '9px' }}>-</td>
                    ))}
                  </tr>
                  {['204 DLX', '205 DLX', '206 DLX', '207 DLX', '208 DLX', '209 DLX', '210 DLX', '211 DLX', '212 DLX', '214 DLX', '216 SUI'].map((rm) => (
                    <tr 
                      key={rm} 
                      style={{ height: '18px', borderBottom: '1px solid #EEE', cursor: 'pointer' }}
                      onClick={() => setSelectedRoom(rm.split(' ')[0])}
                    >
                      <td style={{ background: '#ECE9D8', fontWeight: 600, borderRight: '1px solid #CCC' }}>{rm}</td>
                      {[...Array(10)].map((_, i) => <td key={i} style={{ borderRight: '1px solid #EEE' }}></td>)}
                    </tr>
                  ))}

                  {/* BA-FF03 */}
                  <tr style={{ background: '#F5F5F5', fontWeight: 700, color: '#0A246A' }}>
                    <td colSpan={11} style={{ padding: '2px 4px', borderBottom: '1px solid #DDD' }}>BA-FF03</td>
                  </tr>
                  {['301 EXE', '308 DLX', '309 DLX', '314 DLX'].map((rm) => (
                    <tr key={rm} style={{ height: '18px', borderBottom: '1px solid #EEE' }}>
                      <td style={{ background: '#ECE9D8', fontWeight: 600, borderRight: '1px solid #CCC' }}>{rm}</td>
                      {[...Array(10)].map((_, i) => <td key={i} style={{ borderRight: '1px solid #EEE' }}></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Filters & Legend matching Frame 015 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>Room Type</span>
                <select className="ids-select" style={{ width: '60px' }}><option>All</option></select>
                <span>Block</span>
                <select className="ids-select" style={{ width: '55px' }}><option>All</option></select>
                <span>Floor</span>
                <select className="ids-select" style={{ width: '55px' }}><option>All</option></select>
              </div>

              {/* Legend matching Frame 015 */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#FFF', border: '1px solid #999', display: 'inline-block' }}></span> Vacant</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#E8E137', display: 'inline-block' }}></span> Dirty</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#F15A24', display: 'inline-block' }}></span> Occupied</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#800080', display: 'inline-block' }}></span> OOS</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#7A5230', display: 'inline-block' }}></span> OOO</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span style={{ width: '10px', height: '10px', background: '#00AEEF', display: 'inline-block' }}></span> Reservation</span>
              </div>
            </div>

            {/* Helper Preset Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ background: '#FFF7CC', fontWeight: 700, color: '#0A246A' }}
                onClick={handleAutoFillVideo17}
              >
                ⚡ Auto-Fill Sample Walk-in: Room 203 (Mr. Rajesh Sarkar)
              </button>
              <div style={{ color: '#0A246A', fontWeight: 600 }}>{statusMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: WALK-INS V6.5002.5 REGISTRATION CONSOLE (Video 17 Frames 035–075)
          ========================================================================= */}
      {activeStep === 'registration' && (
        <div className="ids-dialog-window" style={{ width: '880px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Walk-Ins V6.5002.5</span>
            <button className="ids-win-btn close" onClick={() => setActiveStep('rack')}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px' }}>
            {/* Top Registration Header Strip matching Frame 035 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ border: '1px solid #7F9DB9', padding: '2px 8px', background: '#FFF', fontWeight: 700 }}>
                Registration for {selectedRoom}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Pax</span>
                  <input className="ids-input" readOnly value={currentPax} style={{ width: '35px', textAlign: 'center', fontWeight: 700, background: '#F5F5F5' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Folio #</span>
                  <input className="ids-input" readOnly value={folioNo} style={{ width: '35px', textAlign: 'center', background: '#F5F5F5' }} />
                </div>
              </div>
            </div>

            {/* Name Row matching Frame 035 & 100 */}
            <div style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 180px 140px 1fr', gap: '8px', alignItems: 'center' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: '#555' }}>Title</span>
                  <input 
                    className="ids-input" 
                    value={isSecondPaxActive ? guest2Title : guest1Title} 
                    onChange={(e) => isSecondPaxActive ? setGuest2Title(e.target.value) : setGuest1Title(e.target.value)}
                  />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: '#555' }}>Last Name</span>
                  <input 
                    className="ids-input" 
                    style={{ fontWeight: 700 }}
                    value={isSecondPaxActive ? guest2LastName : guest1LastName} 
                    onChange={(e) => isSecondPaxActive ? setGuest2LastName(e.target.value) : setGuest1LastName(e.target.value)}
                  />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: '#555' }}>Middle Name</span>
                  <input 
                    className="ids-input" 
                    value={guest1MiddleName} 
                    onChange={(e) => setGuest1MiddleName(e.target.value)}
                    disabled={isSecondPaxActive}
                  />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: '#555' }}>First Name</span>
                  <input 
                    className="ids-input" 
                    value={isSecondPaxActive ? '' : guest1FirstName} 
                    onChange={(e) => setGuest1FirstName(e.target.value)}
                    disabled={isSecondPaxActive}
                  />
                </div>
              </div>
            </div>

            {/* Middle Section: 2 Columns matching Frame 035 & 045 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '8px' }}>
              {/* Left Column: Address & Contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Address</span>
                  <input className="ids-input" style={{ flex: 1 }} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>City</span>
                  <input className="ids-input" style={{ flex: 1 }} value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>State</span>
                  <input className="ids-input" style={{ flex: 1 }} value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Country</span>
                  <input className="ids-input" style={{ flex: 1 }} value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Zip</span>
                  <input className="ids-input" style={{ width: '120px' }} value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Telephone #</span>
                  <input className="ids-input" style={{ flex: 1 }} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Mobile #</span>
                  <input className="ids-input" style={{ flex: 1, fontWeight: 700 }} value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Email ID</span>
                  <input className="ids-input" style={{ flex: 1 }} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Gender</span>
                  <select 
                    className="ids-select" 
                    style={{ width: '90px' }} 
                    value={isSecondPaxActive ? guest2Gender : gender} 
                    onChange={(e) => isSecondPaxActive ? setGuest2Gender(e.target.value) : setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>GST No</span>
                  <input className="ids-input" style={{ flex: 1 }} value={gstNo} onChange={(e) => setGstNo(e.target.value)} />
                </div>
              </div>

              {/* Right Column: Profiling, Status & Rate matching Frame 035 & 055 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Designation</span>
                  <select className="ids-select" style={{ flex: 1 }} value={designation} onChange={(e) => setDesignation(e.target.value)}>
                    <option value="">(Select)</option>
                    <option value="Director">Director</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Occupation</span>
                  <input className="ids-input" style={{ flex: 1 }} value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Classification</span>
                  <select className="ids-select" style={{ width: '130px', background: '#316AC5', color: '#FFF' }} value={classification} onChange={(e) => setClassification(e.target.value)}>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Guest Status</span>
                  <input className="ids-input" style={{ width: '60px', fontWeight: 700 }} value={guestStatus} onChange={(e) => setGuestStatus(e.target.value)} />
                  <button className="ids-btn-classic" style={{ width: '20px', height: '20px', padding: 0 }}>?</button>
                  <button className="ids-btn-classic" style={{ padding: '1px 8px', marginLeft: '6px' }}>DW</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Nationality</span>
                  <input className="ids-input" style={{ width: '60px' }} value={nationality} onChange={(e) => setNationality(e.target.value)} />
                  <button className="ids-btn-classic" style={{ width: '20px', height: '20px', padding: 0 }}>?</button>
                  <button className="ids-btn-classic" style={{ padding: '1px 6px', marginLeft: '6px' }}>More...</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Pax Type</span>
                  <select className="ids-select" style={{ width: '90px' }} value={paxType} onChange={(e) => setPaxType(e.target.value)}>
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                  </select>
                  <button 
                    className="ids-btn-classic" 
                    style={{ padding: '1px 10px', marginLeft: '6px', fontWeight: 700, background: '#FFF7CC' }}
                    onClick={() => setRateDetailsOpen(true)}
                    title="Open Rate Details (Video 17 Frame 065)"
                  >
                    Rate
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Check Out</span>
                  <select className="ids-select" style={{ width: '90px' }} value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)}>
                    <option value="12 Noon">12 Noon</option>
                    <option value="24 Hours">24 Hours</option>
                  </select>
                  <button className="ids-btn-classic" style={{ padding: '1px 8px', marginLeft: '6px' }}>Trace</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Send SMS</span>
                  <select className="ids-select" style={{ width: '60px' }} value={sendSms} onChange={(e) => setSendSms(e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  {/* Rate display badge (Frame 075): 2,500.00 INR */}
                  <div style={{ marginLeft: '12px', background: '#F5F5F5', border: '1px solid #7F9DB9', padding: '1px 8px', fontWeight: 700, color: '#0A246A' }}>
                    {rateAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '85px' }}>Smoking</span>
                  <select className="ids-select" style={{ width: '60px' }} value={smoking} onChange={(e) => setSmoking(e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <span title="Car Parking Attached" style={{ marginLeft: '16px', fontSize: '14px', cursor: 'pointer' }}>🚗🚙</span>
                </div>
              </div>
            </div>

            {/* Bottom Form Section: Company, Commercials, Rate details matching Frame 035 & 055 */}
            <div style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Commercials Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Company</span>
                    <input className="ids-input" style={{ width: '90px', fontWeight: 700 }} value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} />
                    <button className="ids-btn-classic" style={{ padding: '1px 6px' }}>Details</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Bill Inst</span>
                    <input className="ids-input" style={{ width: '40px' }} value={billInst} onChange={(e) => setBillInst(e.target.value)} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                    <button className="ids-btn-classic" style={{ padding: '1px 6px', marginLeft: '6px' }}>Bookers</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Business Source</span>
                    <input className="ids-input" style={{ width: '60px' }} value={businessSource} onChange={(e) => setBusinessSource(e.target.value)} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Market Segment</span>
                    <input className="ids-input" style={{ width: '60px' }} value={marketSegment} onChange={(e) => setMarketSegment(e.target.value)} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                  </div>
                </div>

                {/* Commercials Right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Pay Mode</span>
                    <input className="ids-input" style={{ width: '50px' }} value={payMode} onChange={(e) => setPayMode(e.target.value)} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                    <button className="ids-btn-classic" style={{ padding: '1px 6px', marginLeft: '12px' }}>Revenue Discount</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Plan Code</span>
                    <input className="ids-input" style={{ width: '50px' }} value={planCode} onChange={(e) => setPlanCode(e.target.value)} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Rate</span>
                    <select className="ids-select" style={{ width: '90px' }} value={rateOption} onChange={(e) => setRateOption(e.target.value)}>
                      <option value="Discount">Discount</option>
                      <option value="Rack">Rack</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '90px' }}>Scanty Baggage</span>
                    <select className="ids-select" style={{ width: '50px' }} value={scantyBaggage} onChange={(e) => setScantyBaggage(e.target.value)}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Registration Number row */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #EEE' }}>
                <span style={{ fontWeight: 700 }}>Registration Number</span>
                <input 
                  className="ids-input" 
                  readOnly 
                  value={regNo} 
                  style={{ width: '80px', textAlign: 'center', fontWeight: 700, background: '#F5F5F5' }} 
                />
              </div>
            </div>

            {/* Bottom Command Buttons matching Frame 035 & 075 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid #CCC' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px' }}
                  onClick={() => setSpecialInstOpen(true)}
                  title="Open Special Instruction (Video 17 Frame 080)"
                >
                  Spl. Inst...
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '75px' }}>Local Add</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px' }}
                  onClick={() => setOtherDetailsOpen(true)}
                  title="Open Other Details (Video 17 Frame 085)"
                >
                  Others...
                </button>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#D1E7DD', color: '#0F5132' }}
                  onClick={handleSaveRegistration}
                  title="Save Registration & Proceed (Video 17 Frame 075)"
                >
                  <u>S</u>ave
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => alert('Form cleared')}>
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }}>
                  Panel
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setActiveStep('rack')}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 1: RATE DETAILS DIALOG (Video 17 Frame 065)
          ========================================================================= */}
      {rateDetailsOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '400px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Rate Details</span>
              <button className="ids-win-btn close" onClick={() => setRateDetailsOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '70px' }}>Plan</span>
                  <input className="ids-input" readOnly value="CP" style={{ width: '60px', background: '#F5F5F5' }} />
                </div>
                <div style={{ fontSize: '9px', color: '#555', maxWidth: '160px', fontStyle: 'italic' }}>
                  Charges entered here should be as per Total Number of Occupancy.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ width: '70px' }}>Cur</span>
                <input className="ids-input" readOnly value="INR" style={{ width: '60px', background: '#F5F5F5' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ width: '70px' }}>Rate / Rack ID</span>
                <input className="ids-input" readOnly value="1" style={{ width: '35px', textAlign: 'center' }} />
                <input className="ids-input" readOnly value="1" style={{ width: '35px', textAlign: 'center' }} />
              </div>

              {/* Reason Entry Box matching Frame 065 */}
              <fieldset style={{ border: '1px solid #7F9DB9', padding: '6px', marginBottom: '8px' }}>
                <legend style={{ fontWeight: 700, color: '#000' }}>Reason Entry</legend>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '80px' }}>Reason For</span>
                  <input className="ids-input" readOnly value="DISCOUNT" style={{ width: '130px', fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '80px' }}>Reason</span>
                  <select 
                    className="ids-select" 
                    style={{ flex: 1, background: '#316AC5', color: '#FFF' }}
                    value={rateDiscountReason}
                    onChange={(e) => setRateDiscountReason(e.target.value)}
                  >
                    <option value="No Reason / Not applicable">No Reason / Not applicable</option>
                    <option value="Management Courtesy">Management Courtesy</option>
                    <option value="Corporate Agreement">Corporate Agreement</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '80px' }}>Authorized By</span>
                  <input 
                    className="ids-input" 
                    style={{ width: '110px' }} 
                    value={rateAuthorizedBy} 
                    onChange={(e) => setRateAuthorizedBy(e.target.value)}
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ marginLeft: 'auto', padding: '1px 8px', fontWeight: 700 }}
                    onClick={() => {
                      setRateAmount(2500.00);
                      setRateDetailsOpen(false);
                      setStatusMessage('Confirmed Discount Rate ₹2,500.00 INR (CP Plan).');
                    }}
                  >
                    Ok
                  </button>
                </div>
              </fieldset>

              {/* Tax Structure */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '10px' }}>
                <span>Tax Structure</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input className="ids-input" readOnly value="798" style={{ width: '45px', textAlign: 'center' }} />
                  <input className="ids-input" readOnly value="804" style={{ width: '45px', textAlign: 'center' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '10px' }}>
                <span>Exb. Tax Struct.</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input className="ids-input" readOnly value="804" style={{ width: '45px', textAlign: 'center' }} />
                  <input className="ids-input" readOnly value="804" style={{ width: '45px', textAlign: 'center' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => {
                    setRateAmount(2500.00);
                    setRateDetailsOpen(false);
                  }}
                >
                  Confirm
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setRateDetailsOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 2: SPECIAL INSTRUCTION DIALOG (Video 17 Frame 080)
          ========================================================================= */}
      {specialInstOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '380px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Special Instruction</span>
              <button className="ids-win-btn close" onClick={() => setSpecialInstOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 12px', fontSize: '11px' }}>
              <div style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: '#555', display: 'block', marginBottom: '4px' }}>Special Instruction</span>
                <textarea 
                  className="ids-input" 
                  style={{ width: '100%', height: '80px', resize: 'none' }}
                  value={specialInstText}
                  onChange={(e) => setSpecialInstText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => setSpecialInstOpen(false)}>Exit</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '55px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => setSpecialInstOpen(false)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 3: OTHER DETAILS V6.5002.2 DIALOG (Video 17 Frame 085)
          ========================================================================= */}
      {otherDetailsOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '720px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Other Details V6.5002.2</span>
              <button className="ids-win-btn close" onClick={() => setOtherDetailsOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 12px', fontSize: '11px', maxHeight: '500px', overflowY: 'auto' }}>
              {/* Flight & Travel */}
              <div style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span>Arrival From</span>
                  <input className="ids-input" value={arrivalFrom} onChange={(e) => setArrivalFrom(e.target.value)} />
                  <span style={{ textAlign: 'right' }}>Proceeding To</span>
                  <input className="ids-input" value={proceedingTo} onChange={(e) => setProceedingTo(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px 1fr', gap: '6px', alignItems: 'center' }}>
                  <span>Arrival Flight</span>
                  <input className="ids-input" placeholder="AI-724" />
                  <span style={{ textAlign: 'right' }}>Departure Flight</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input className="ids-input" placeholder="6E-201" style={{ flex: 1 }} />
                    <button className="ids-btn-classic" style={{ padding: '0 6px' }}>Drop</button>
                  </div>
                </div>
              </div>

              {/* Preferences & History */}
              <div style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 120px 90px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span>Room Upgrade</span>
                  <input className="ids-input" readOnly value="DLX" style={{ background: '#F5F5F5', fontWeight: 700 }} />
                  <span style={{ textAlign: 'right' }}>Authorized By</span>
                  <input className="ids-input" defaultValue="DUTY MANAGER" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 120px 90px 1fr', gap: '6px', alignItems: 'center' }}>
                  <span>Post History</span>
                  <select className="ids-select" value={postHistory} onChange={(e) => setPostHistory(e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <span style={{ textAlign: 'right' }}>Purpose Of Visit</span>
                  <input className="ids-input" defaultValue="Business Trip" />
                </div>
              </div>

              {/* Identification details */}
              <fieldset style={{ border: '1px solid #7F9DB9', padding: '6px', background: '#FFF', marginBottom: '6px' }}>
                <legend style={{ fontWeight: 700 }}>Identification Details</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span>Identification type</span>
                  <select className="ids-select" value={identificationType} onChange={(e) => setIdentificationType(e.target.value)}>
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                  <button className="ids-btn-classic" style={{ width: '60px' }}>Browse</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                  <span>Identification#</span>
                  <input className="ids-input" value={identificationNo} onChange={(e) => setIdentificationNo(e.target.value)} />
                </div>
              </fieldset>

              {/* Credit card swipe grid matching Frame 085 */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '80px', overflowY: 'auto', marginBottom: '8px' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8' }}>
                      <th>Swipe card</th>
                      <th>Credit Card Type</th>
                      <th>Card Number</th>
                      <th>Expiry Date</th>
                      <th>Authorization #</th>
                      <th>Amount</th>
                      <th>Card Holder Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '20px' }}>
                      <td></td>
                      <td>VISA</td>
                      <td>4582 **** **** 9012</td>
                      <td>12/26</td>
                      <td>AUTH-1092</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                      <td>Rajesh Sarkar</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '60px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => setOtherDetailsOpen(false)}
                >
                  Ok
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setOtherDetailsOpen(false)}>
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setOtherDetailsOpen(false)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 4: ROOM NUMBER203 FOLIO SELECT DIALOG (Video 17 Frame 095)
          ========================================================================= */}
      {roomFolioSelectOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div className="ids-dialog-window" style={{ width: '440px', maxWidth: '95vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Number203</span>
              <button className="ids-win-btn close" onClick={() => setRoomFolioSelectOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', fontSize: '11px' }}>
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', maxHeight: '140px', overflowY: 'auto', marginBottom: '8px' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8' }}>
                      <th style={{ width: '60px', borderRight: '1px solid #BBB' }}>Reg. #</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Folio #</th>
                      <th style={{ width: '40px', borderRight: '1px solid #BBB' }}>Pax</th>
                      <th>Guest Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#316AC5', color: '#FFF', fontWeight: 700 }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #5588EE' }}>621</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #5588EE' }}>1</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #5588EE' }}>1</td>
                      <td>Sarkar Rajesh</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    setRoomFolioSelectOpen(false);
                    // Open Checkins dialog: "Add More Pax To This Room" (Frame 100)
                    setAddMorePaxOpen(true);
                  }}
                >
                  <u>S</u>elect
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px' }}
                  onClick={() => {
                    setRoomFolioSelectOpen(false);
                    setAddMorePaxOpen(true);
                  }}
                >
                  NewFolio
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setRoomFolioSelectOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 5: CHECKINS "ADD MORE PAX TO THIS ROOM" (Video 17 Frame 100)
          ========================================================================= */}
      {addMorePaxOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
          <div className="ids-dialog-window" style={{ width: '320px', maxWidth: '95vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Checkins</span>
              <button className="ids-win-btn close" onClick={() => setAddMorePaxOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '14px 16px', textAlign: 'center', fontSize: '11px' }}>
              <div style={{ marginBottom: '16px', fontWeight: 600 }}>
                Add More Pax To This Room
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '65px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => {
                    setAddMorePaxOpen(false);
                    // Switch to Pax 2 (Video 17 Frame 100)
                    setIsSecondPaxActive(true);
                    setCurrentPax(2);
                    setRegNo('622');
                    setGuest2Title('Mrs');
                    setGuest2LastName('Sharma');
                    setGuest2Gender('Female');
                    setStatusMessage('Entered 2nd Pax: Mrs. Sharma (Reg # 622). Click Save to confirm.');
                  }}
                >
                  <u>Y</u>es
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '65px' }}
                  onClick={() => {
                    setAddMorePaxOpen(false);
                    // Proceed directly to Guest Information Sheet with 1 Pax
                    setActiveStep('guest-info');
                  }}
                >
                  <u>N</u>o
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: GUEST INFORMATION V6.5002.2 (Video 17 Frame 110)
          ========================================================================= */}
      {activeStep === 'guest-info' && (
        <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Guest Information V6.5002.2</span>
            <button className="ids-win-btn close" onClick={handleFinishWalkIn}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px' }}>
            {/* Top Grid matching Frame 110 */}
            <div style={{ border: '1px solid #7F9DB9', padding: '8px', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
                {/* Left Column: Room info & guest master fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Name/Room#</span>
                    <input className="ids-input" readOnly value={selectedRoom} style={{ width: '60px', fontWeight: 700, background: '#F5F5F5' }} />
                    <button className="ids-btn-classic" style={{ width: '18px', height: '18px', padding: 0 }}>?</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Total Pax (ADT/CHD)</span>
                    <input className="ids-input" readOnly value={isSecondPaxActive ? '2 (2/0)' : '1 (1/0)'} style={{ width: '70px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Guest Status</span>
                    <input className="ids-input" readOnly value="WLK" style={{ width: '70px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Nationality</span>
                    <input className="ids-input" readOnly value="India" style={{ width: '180px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Company</span>
                    <input className="ids-input" readOnly value="Pooja Associates (Contract Division)" style={{ flex: 1, background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Com. Remarks</span>
                    <input className="ids-input" readOnly value="" style={{ flex: 1, background: '#F5F5F5' }} />
                  </div>

                  {/* Arrival & Departure dates matching Frame 110 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Arrival</span>
                    <input className="ids-input" readOnly value="23-JAN-2022 20:16 SUNDAY" style={{ width: '180px', background: '#F5F5F5', fontWeight: 600 }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Departure</span>
                    <input className="ids-input" readOnly value={`${rackDepDate} ${rackDepTime} FRIDAY`} style={{ width: '180px', background: '#F5F5F5', fontWeight: 600 }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Room Night(s)</span>
                    <input className="ids-input" readOnly value="33" style={{ width: '40px', textAlign: 'center', background: '#F5F5F5' }} />
                    <span style={{ marginLeft: '12px' }}>Ref. #</span>
                    <input className="ids-input" readOnly value="" style={{ width: '80px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Arrival From</span>
                    <input className="ids-input" readOnly value="Kolkata" style={{ width: '120px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Proceeding To</span>
                    <input className="ids-input" readOnly value="Bihar" style={{ width: '120px', background: '#F5F5F5' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '130px' }}>Plan</span>
                    <input className="ids-input" readOnly value="CP" style={{ width: '50px', background: '#F5F5F5' }} />
                    <span style={{ marginLeft: '12px' }}>Passport #</span>
                    <input className="ids-input" readOnly value="" style={{ width: '100px', background: '#F5F5F5' }} />
                  </div>
                </div>

                {/* Right Column: Guest Name List Box matching Frame 110 */}
                <div>
                  <div style={{ border: '1px solid #7F9DB9', padding: '4px', background: '#FFF', height: '110px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, borderBottom: '1px solid #DDD', paddingBottom: '2px', marginBottom: '4px' }}>
                      Guest Name
                    </div>
                    <div style={{ background: '#316AC5', color: '#FFF', padding: '2px 4px', fontWeight: 700, fontSize: '11px', marginBottom: '2px' }}>
                      Mr Sarkar Rajesh (Reg # 621)
                    </div>
                    {isSecondPaxActive && (
                      <div style={{ background: '#FFF', color: '#000', padding: '2px 4px', fontSize: '11px' }}>
                        Mrs Sharma (Reg # 622)
                      </div>
                    )}
                  </div>

                  {/* Commercials strip */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '70px' }}>Rate</span>
                      <input className="ids-input" readOnly value="2,500.00 - DISCOUNT" style={{ flex: 1, background: '#F5F5F5', fontWeight: 700, color: '#0A246A' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '70px' }}>Plan</span>
                      <input className="ids-input" readOnly value="0.00" style={{ width: '80px', background: '#F5F5F5' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '70px' }}>Guest Bal.</span>
                      <input className="ids-input" readOnly value="0.00" style={{ width: '80px', background: '#F5F5F5' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ width: '70px' }}>Room Type</span>
                      <input className="ids-input" readOnly value="DELUXE (DLX)" style={{ flex: 1, background: '#E8F5E9', fontWeight: 700, color: '#2E7D32' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom check in user badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #CCC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Check in User</span>
                  <input className="ids-input" readOnly value="MANAGER" style={{ width: '90px', background: '#F5F5F5', fontWeight: 700 }} />
                </div>

                {/* Bottom Action buttons matching Frame 110 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => alert('Printing Guest Registration Card...')}>Print</button>
                  <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Previous</button>
                  <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Next</button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                    onClick={handleFinishWalkIn}
                  >
                    Exit &amp; Settle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
