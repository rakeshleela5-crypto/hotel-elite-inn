import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  UserCheck, History, Calendar, Check, X, Search, 
  DollarSign, CheckCircle2, ShieldCheck, Building2, 
  FileText, Sparkles, User, Users, CreditCard, LayoutGrid
} from 'lucide-react';

/* =========================================================================
   VIDEO 37: HOW TO WALK IN REGULAR GUEST IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Room Rack V6.5.002.2 (Frames 010–020)
   2. Entry Points (Frame 006):
      - Registrations.. -> Walk-ins -> Regular Guest History Flow
      - Registrations.. -> How to Walk In Regular Guest
      - Guest History.. -> Regular Guest Walk-in
      - Quick Scan (Load Pgm) -> Type "regular guest" / "walk-in" -> [ Load ]
      - 44-Video Tutorial Player -> Video 37 -> Launch Interactive Feature Clone
   3. F1 Guest History Lookup (Frames 012 & 018):
      - After typing Last Name (e.g. Singh / Bedi), press [ F1 - Guest History ]
      - Auto-populates Title: MR, Last Name: BEDI, Middle Name: SINGH, First Name: GURKANWAR
   4. Walk-in Registration Console for Room 202 (Frame 026):
      - Auto-filled Profile:
        * Address: ( LSR LOGISTICS )
        * City: PORK M... | State: ARUNACHAL PRADESH | Country: INDIA | Zip: 791113
        * Mobile #: 09779330784 | Email ID: gurkanwar@lsrlogistics.com
        * Gender: Male | GST No: 12AABCL7890Q1ZX | Classification: Regular | Status: REG
        * Company: TRA0001 | Plan: CP | Rate: Discount | PayMode: CAS
   5. Rate Details & Confirmation Dialog (Frame 026):
      - Tax Structure: 798 / 804 | Reason: DISCOUNT | [ Confirm ] -> [ Save ]
   6. Live Sync with Room Status Rack (Frame 034):
      - Room 202 turns Occupied (Orange) showing "202 O/EXE BEDI"
   ========================================================================= */

export const REGULAR_GUEST_PROFILES_DATABASE = [
  {
    profileId: 'GH-00108',
    title: 'MR',
    lastName: 'BEDI',
    middleName: 'SINGH',
    firstName: 'GURKANWAR',
    address: '( LSR LOGISTICS )',
    city: 'PORK M...',
    state: 'ARUNACHAL PRADESH',
    country: 'INDIA',
    zip: '791113',
    telephone: '0360-224455',
    mobile: '09779330784',
    email: 'gurkanwar@lsrlogistics.com',
    gender: 'Male',
    gstNo: '12AABCL7890Q1ZX',
    classification: 'Regular',
    guestStatus: 'REG',
    nationality: 'IND',
    paxType: 'Adult',
    checkOutTime: '12 Noon',
    sendSms: 'No',
    smoking: 'No',
    companyCode: 'TRA0001',
    companyName: 'LSR Logistics & Transport Corp',
    billInst: '1',
    businessSource: 'WKN',
    marketSegment: 'FIT',
    payMode: 'CAS',
    planCode: 'CP',
    rateCode: 'Discount',
    discountAmount: 2800.00,
    rackRate: 3500.00,
    visitsCount: 14,
    lastVisitDate: '15-JAN-2026',
    vipStatus: 'VIP 2 (Regular Guest)'
  },
  {
    profileId: 'GH-00102',
    title: 'MR',
    lastName: 'SHARMA',
    middleName: '',
    firstName: 'RAJ',
    address: '42, Marine Drive, Nariman Point',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    country: 'INDIA',
    zip: '400021',
    telephone: '022-66554433',
    mobile: '09820012345',
    email: 'raj.sharma@tatamotors.com',
    gender: 'Male',
    gstNo: '27AABCT3518Q1ZY',
    classification: 'Corporate VIP',
    guestStatus: 'REG',
    nationality: 'IND',
    paxType: 'Adult',
    checkOutTime: '12 Noon',
    sendSms: 'Yes',
    smoking: 'No',
    companyCode: 'COM0001',
    companyName: 'Tata Motors Limited',
    billInst: '1',
    businessSource: 'OTA',
    marketSegment: 'CVG',
    payMode: 'BTC',
    planCode: 'MAP',
    rateCode: 'Contract',
    discountAmount: 3200.00,
    rackRate: 3999.00,
    visitsCount: 22,
    lastVisitDate: '20-FEB-2026',
    vipStatus: 'VIP 1 (Corporate Key Account)'
  },
  {
    profileId: 'GH-00105',
    title: 'MR',
    lastName: 'KUMAR',
    middleName: '',
    firstName: 'ANIL',
    address: 'Sector 18, Vashi',
    city: 'NAVI MUMBAI',
    state: 'MAHARASHTRA',
    country: 'INDIA',
    zip: '400703',
    telephone: '022-27891234',
    mobile: '09821198765',
    email: 'anil.kumar@mahindra.com',
    gender: 'Male',
    gstNo: '27AABCM8822P1ZX',
    classification: 'Regular',
    guestStatus: 'REG',
    nationality: 'IND',
    paxType: 'Adult',
    checkOutTime: '12 Noon',
    sendSms: 'No',
    smoking: 'No',
    companyCode: 'COM0002',
    companyName: 'Mahindra & Mahindra Ltd',
    billInst: '1',
    businessSource: 'WKN',
    marketSegment: 'FIT',
    payMode: 'CAS',
    planCode: 'CP',
    rateCode: 'Discount',
    discountAmount: 2500.00,
    rackRate: 2999.00,
    visitsCount: 8,
    lastVisitDate: '27-JAN-2026',
    vipStatus: 'Regular Corporate'
  }
];

export default function IdsRegularGuestWalkInModal({
  isOpen,
  onClose,
  initialRoomNo = '202',
  accountingDate = '25-FEB-2026',
  onCompleteWalkIn,
  onOpenRoomRack
}) {
  const [currentStep, setCurrentStep] = useState('roomRack'); // 'roomRack' | 'walkInForm' | 'rateConfirmation' | 'completed'

  // Room Rack Search State (Frames 012 & 018)
  const [roomNo, setRoomNo] = useState(initialRoomNo);
  const [departureDate, setDepartureDate] = useState('26-FEB-2026');
  const [departureTime, setDepartureTime] = useState('12:00');
  const [guestTitle, setGuestTitle] = useState('MR');
  const [guestLastName, setGuestLastName] = useState('Singh');
  const [guestMiddleName, setGuestMiddleName] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');

  // Selected Profile
  const [selectedProfile, setSelectedProfile] = useState(REGULAR_GUEST_PROFILES_DATABASE[0]);
  const [historyLookupOpen, setHistoryLookupOpen] = useState(false);
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('Singh');

  // Walk-In Form State (Frame 026)
  const [formData, setFormData] = useState(REGULAR_GUEST_PROFILES_DATABASE[0]);
  const [rateDetailsOpen, setRateDetailsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [assignedRegNo, setAssignedRegNo] = useState('626');

  if (!isOpen) return null;

  // Trigger F1 History Lookup
  const handleOpenF1Lookup = () => {
    setSearchHistoryTerm(guestLastName || 'Singh');
    setHistoryLookupOpen(true);
  };

  // Select Guest Profile from History
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setGuestTitle(profile.title);
    setGuestLastName(profile.lastName);
    setGuestMiddleName(profile.middleName);
    setGuestFirstName(profile.firstName);
    setFormData(profile);
    setHistoryLookupOpen(false);
    setStatusMessage(`Auto-filled past guest profile for ${profile.title} ${profile.firstName} ${profile.lastName} (${profile.vipStatus})`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Proceed from Room Rack to Walk-in Form (Frame 018 -> Frame 026)
  const handleProceedToWalkIn = () => {
    setCurrentStep('walkInForm');
  };

  // Open Rate Confirmation Dialog
  const handleOpenRateConfirm = () => {
    setRateDetailsOpen(true);
  };

  // Save Walk-in Registration (Frame 026 -> Frame 034)
  const handleSaveWalkIn = () => {
    const regNum = '626';
    setAssignedRegNo(regNum);
    setCurrentStep('completed');

    const completedRecord = {
      roomNo,
      roomType: 'EXE',
      regNo: regNum,
      folioNo: '1',
      guestName: `${formData.title} ${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
      displayTag: formData.lastName,
      companyName: formData.companyName,
      arrivalDate: `${accountingDate} 20:18`,
      departureDate: `${departureDate} ${departureTime}`,
      pax: 1,
      rate: formData.discountAmount || 2800.00,
      planCode: formData.planCode || 'CP',
      payMode: formData.payMode || 'CAS',
      status: 'Occupied'
    };

    if (onCompleteWalkIn) {
      onCompleteWalkIn(completedRecord);
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: currentStep === 'walkInForm' ? '760px' : '720px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 37 Frame 012 & Frame 026 */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
            color: '#FFF', 
            padding: '4px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
            <UserCheck size={14} />
            <span>
              {currentStep === 'walkInForm' 
                ? `Walk-Ins V6.5002.5 — Registration for Room ${roomNo}` 
                : currentStep === 'completed'
                ? `Walk-in Registration Completed — Room ${roomNo}`
                : `Room Rack V6.5.002.2 — Walk In Regular Guest`}
            </span>
          </div>
          <button 
            className="ids-win-btn close" 
            onClick={onClose}
            style={{ 
              background: '#C75050', 
              color: '#FFF', 
              border: '1px outset #FFF', 
              fontWeight: 700, 
              width: '18px', 
              height: '18px', 
              lineHeight: '14px', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: ROOM RACK V6.5.002.2 & F1 GUEST HISTORY LOOKUP (Frames 012–018)
            ========================================================================= */}
        {currentStep === 'roomRack' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Top Controls: Room#, Departure, Name fields */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 12px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 100px 90px 120px 70px 1fr', gap: '8px 10px', alignItems: 'center', marginBottom: '10px' }}>
                
                <span style={{ fontWeight: 600 }}>Room#</span>
                <input 
                  className="ids-input" 
                  value={roomNo} 
                  onChange={(e) => setRoomNo(e.target.value)}
                  style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} 
                />

                <span style={{ fontWeight: 600 }}>Departure</span>
                <input 
                  className="ids-input" 
                  value={departureDate} 
                  onChange={(e) => setDepartureDate(e.target.value)}
                  style={{ width: '100px', fontWeight: 700 }} 
                />

                <input 
                  className="ids-input" 
                  value={departureTime} 
                  onChange={(e) => setDepartureTime(e.target.value)}
                  style={{ width: '60px', fontWeight: 700 }} 
                />
                
                <div></div>
              </div>

              {/* Guest Name Line with F1 Hint (Frame 012) */}
              <div style={{ display: 'grid', gridTemplateColumns: '50px 60px 130px 130px 1fr', gap: '6px 10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Name</span>
                
                <input 
                  className="ids-input" 
                  value={guestTitle} 
                  onChange={(e) => setGuestTitle(e.target.value)}
                  style={{ width: '50px', fontWeight: 700 }} 
                />

                <div>
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>Last Name:</div>
                  <input 
                    className="ids-input" 
                    value={guestLastName} 
                    onChange={(e) => setGuestLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{ width: '100%', fontWeight: 700, background: '#FFF7CC' }} 
                  />
                </div>

                <div>
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>Middle Name:</div>
                  <input 
                    className="ids-input" 
                    value={guestMiddleName} 
                    onChange={(e) => setGuestMiddleName(e.target.value)}
                    placeholder="Middle Name"
                    style={{ width: '100%' }} 
                  />
                </div>

                <div>
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>First Name:</div>
                  <input 
                    className="ids-input" 
                    value={guestFirstName} 
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    placeholder="First Name"
                    style={{ width: '100%', fontWeight: 700 }} 
                  />
                </div>
              </div>

              {/* Keyboard Instruction Bar from Video 37 Frame 012 */}
              <div style={{ marginTop: '8px', padding: '6px 10px', background: '#FFFDE6', border: '1px solid #E6D043', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#9E6A00', fontWeight: 700 }}>
                  💡 After entering Guest Last Name, press F1 from keyboard or click button to fetch Guest History.
                </div>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, background: '#DCE6F1', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={handleOpenF1Lookup}
                >
                  <History size={12} /> Press F1 (Guest History)
                </button>
              </div>

            </div>

            {/* Room Rack Grid Snapshot matching Frame 012 */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '10px', fontWeight: 700 }}>
                <span style={{ background: '#FFF', padding: '2px 8px', border: '1px solid #999' }}>Vacant: 56</span>
                <span style={{ background: '#FFF', padding: '2px 8px', border: '1px solid #999' }}>Occupied: 1</span>
                <span style={{ background: '#FFF', padding: '2px 8px', border: '1px solid #999' }}>Expected Departures: 1</span>
              </div>

              <div style={{ height: '140px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                    <tr>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Room #</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '70px' }}>FRI-25-02</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '70px' }}>SAT-26-02</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '70px' }}>SUN-27-02</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '70px' }}>MON-28-02</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Status / Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { r: '201', t: 'EXE', s: 'Occupied (Sharma)', occ: true },
                      { r: '202', t: 'EXE', s: 'Vacant (Selected)', sel: true },
                      { r: '203', t: 'DLX', s: 'Vacant' },
                      { r: '204', t: 'DLX', s: 'Vacant' },
                      { r: '205', t: 'DLX', s: 'Vacant' }
                    ].map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          background: row.sel ? '#FFF7CC' : row.occ ? '#FFE6CC' : '#FFF', 
                          borderBottom: '1px solid #EEE' 
                        }}
                      >
                        <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>
                          {row.r} {row.t}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0', color: row.occ ? '#C5221F' : '#137333', fontWeight: 700 }}>
                          {row.occ ? 'O' : 'V'}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>V</td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>V</td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>V</td>
                        <td style={{ padding: '3px 6px', fontWeight: 600 }}>{row.s}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions matching Video 37 Frame 018 */}
            <div 
              style={{ 
                background: '#D4D0C8', 
                border: '1px solid #808080', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '6px'
              }}
            >
              <button className="ids-btn-classic" onClick={handleProceedToWalkIn}>Express Walk-in</button>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '80px', background: '#DCE6F1' }}
                onClick={handleProceedToWalkIn}
              >
                Walk-in
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 2: WALK-INS REGISTRATION CONSOLE (Video 37 Frame 026)
            ========================================================================= */}
        {currentStep === 'walkInForm' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Header: Registration for 202, Pax: 1, Folio #: 1 */}
            <div style={{ background: '#ECE9D8', border: '2px groove #ECE9D8', padding: '6px 10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#0A246A', fontSize: '12px' }}>
                Registration for {roomNo} (Executive Room)
              </div>
              <div style={{ display: 'flex', gap: '14px', fontWeight: 700 }}>
                <span>Pax: 1</span>
                <span>Folio #: 1</span>
                <span style={{ color: '#137333' }}>Status: REGULAR GUEST (AUTO-FILLED)</span>
              </div>
            </div>

            {/* 2-Column Registration Form matching Frame 026 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 12px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* Left Column: Personal Profile & Address */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                    
                    <span style={{ fontWeight: 600 }}>Title / Name</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input className="ids-input" value={formData.title} readOnly style={{ width: '40px', fontWeight: 700 }} />
                      <input className="ids-input" value={`${formData.lastName} ${formData.middleName} ${formData.firstName}`.trim()} readOnly style={{ flex: 1, fontWeight: 700, background: '#FFF7CC' }} />
                    </div>

                    <span style={{ fontWeight: 600 }}>Address</span>
                    <input className="ids-input" value={formData.address} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>City</span>
                    <input className="ids-input" value={formData.city} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>State</span>
                    <input className="ids-input" value={formData.state} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>Country</span>
                    <input className="ids-input" value={formData.country} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>Zip</span>
                    <input className="ids-input" value={formData.zip} readOnly style={{ width: '100px', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>Mobile #</span>
                    <input className="ids-input" value={formData.mobile} readOnly style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>Email ID</span>
                    <input className="ids-input" value={formData.email} readOnly style={{ width: '100%', background: '#F0F0F0' }} />

                    <span style={{ fontWeight: 600 }}>GST No</span>
                    <input className="ids-input" value={formData.gstNo || '12AABCL7890Q1ZX'} readOnly style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />

                  </div>
                </div>

                {/* Right Column: Billing, Market & Rate Details */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                    
                    <span style={{ fontWeight: 600 }}>Classification</span>
                    <input className="ids-input" value={formData.classification || 'Regular'} readOnly style={{ width: '100%', fontWeight: 600 }} />

                    <span style={{ fontWeight: 600 }}>Guest Status</span>
                    <input className="ids-input" value={formData.guestStatus || 'REG'} readOnly style={{ width: '80px', fontWeight: 700 }} />

                    <span style={{ fontWeight: 600 }}>Nationality</span>
                    <input className="ids-input" value={formData.nationality || 'IND'} readOnly style={{ width: '80px' }} />

                    <span style={{ fontWeight: 600 }}>Company</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input className="ids-input" value={formData.companyCode || 'TRA0001'} readOnly style={{ width: '80px', fontWeight: 700 }} />
                      <input className="ids-input" value={formData.companyName || 'LSR Logistics'} readOnly style={{ flex: 1, background: '#F0F0F0' }} />
                    </div>

                    <span style={{ fontWeight: 600 }}>Business Source</span>
                    <input className="ids-input" value={formData.businessSource || 'WKN'} readOnly style={{ width: '80px', fontWeight: 700 }} />

                    <span style={{ fontWeight: 600 }}>Market Segment</span>
                    <input className="ids-input" value={formData.marketSegment || 'FIT'} readOnly style={{ width: '80px', fontWeight: 700 }} />

                    <span style={{ fontWeight: 600 }}>Plan / Rate</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input className="ids-input" value={formData.planCode || 'CP'} readOnly style={{ width: '40px', fontWeight: 700 }} />
                      <input className="ids-input" value={`₹${formData.discountAmount || 2800}.00 (Discount)`} readOnly style={{ width: '140px', fontWeight: 900, color: '#0A246A', background: '#FFF7CC' }} />
                      <button className="ids-btn-classic" onClick={handleOpenRateConfirm} style={{ fontWeight: 700 }}>Rate..</button>
                    </div>

                    <span style={{ fontWeight: 600 }}>Pay Mode</span>
                    <input className="ids-input" value={formData.payMode || 'CAS'} readOnly style={{ width: '80px', fontWeight: 700 }} />

                    <span style={{ fontWeight: 600 }}>Scanty Baggage</span>
                    <select className="ids-input" value={formData.scantyBaggage || 'No'} readOnly style={{ width: '80px' }}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>

                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action Ribbon matching Frame 026 */}
            <div 
              style={{ 
                background: '#D4D0C8', 
                border: '1px solid #808080', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="ids-btn-classic" onClick={() => alert('Special instructions recorded')}>Spl. Inst...</button>
                <button className="ids-btn-classic" onClick={() => alert('Local address dialog')}>Local Add...</button>
                <button className="ids-btn-classic" onClick={() => alert('Other guest details')}>Others...</button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                  onClick={handleSaveWalkIn}
                >
                  Save
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setCurrentStep('roomRack')}>Clear</button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setCurrentStep('roomRack')}>Back</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 3: COMPLETED CONFIRMATION & LIVE STATS SYNC (Frame 034)
            ========================================================================= */}
        {currentStep === 'completed' && (
          <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#E6F4EA', borderRadius: '50%', color: '#137333', marginBottom: '12px' }}>
              <CheckCircle2 size={42} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', marginBottom: '6px' }}>
              Regular Guest Walk-In Check-In Successful!
            </div>

            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px 18px', maxWidth: '480px', margin: '0 auto 16px auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px' }}>
                <div><strong>Registration #:</strong></div>
                <div style={{ fontWeight: 700, color: '#0A246A' }}>REG/2026/{assignedRegNo}</div>
                <div><strong>Assigned Room:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Room {roomNo} (Executive Room)</div>
                <div><strong>Guest Name:</strong></div>
                <div>{formData.title} {formData.firstName} {formData.middleName} {formData.lastName}</div>
                <div><strong>VIP Category:</strong></div>
                <div style={{ color: '#137333', fontWeight: 700 }}>{formData.vipStatus}</div>
                <div><strong>Room Tariff Plan:</strong></div>
                <div>{formData.planCode} (₹{formData.discountAmount || 2800}.00)</div>
                <div><strong>Room Status Rack:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Changed to 202 O/EXE BEDI (Occupied)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {onOpenRoomRack && (
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#DCE6F1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    onClose();
                    onOpenRoomRack();
                  }}
                >
                  <LayoutGrid size={13} /> View in Room Status Rack (Frame 034)
                </button>
              )}
              <button className="ids-btn-classic" onClick={onClose}>
                Close PMS Window
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP 1: F1 GUEST HISTORY LOOKUP MODAL (Video 37 Frame 012 & 018)
            ========================================================================= */}
        {historyLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setHistoryLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Guest History Lookup \ GHLOOKUP V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setHistoryLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Guest History:</span>
                  <input 
                    className="ids-input" 
                    value={searchHistoryTerm} 
                    onChange={(e) => setSearchHistoryTerm(e.target.value)} 
                    placeholder="Search by Last Name, Mobile or City..."
                    style={{ flex: 1, padding: '2px 6px', fontWeight: 700 }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '70px' }}>Profile ID</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Full Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '100px' }}>Mobile #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '90px' }}>City</th>
                        <th style={{ padding: '3px 6px', textAlign: 'center', width: '50px' }}>Visits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REGULAR_GUEST_PROFILES_DATABASE
                        .filter(p => 
                          p.lastName.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
                          p.firstName.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
                          p.mobile.includes(searchHistoryTerm) ||
                          p.city.toLowerCase().includes(searchHistoryTerm.toLowerCase())
                        )
                        .map((prof, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => handleSelectProfile(prof)}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{prof.profileId}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>
                              {prof.title} {prof.lastName} {prof.middleName} {prof.firstName}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{prof.mobile}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{prof.city}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'center', fontWeight: 700, color: '#137333' }}>{prof.visitsCount}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setHistoryLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP 2: RATE DETAILS CONFIRMATION MODAL (Video 37 Frame 026)
            ========================================================================= */}
        {rateDetailsOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setRateDetailsOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '480px', maxWidth: '90vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Rate Details V6.5.002.5</span>
                <button className="ids-win-btn close" onClick={() => setRateDetailsOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Plan</span>
                  <input className="ids-input" value="CP" readOnly style={{ width: '60px', fontWeight: 700 }} />

                  <span style={{ fontWeight: 600 }}>Currency</span>
                  <input className="ids-input" value="INR" readOnly style={{ width: '60px' }} />

                  <span style={{ fontWeight: 600 }}>Rate / Rack ID</span>
                  <input className="ids-input" value="1" readOnly style={{ width: '60px' }} />

                  <span style={{ fontWeight: 600 }}>Reason For</span>
                  <input className="ids-input" value="DISCOUNT" readOnly style={{ width: '120px', fontWeight: 700 }} />

                  <span style={{ fontWeight: 600 }}>Reason</span>
                  <select className="ids-input" value="No Reason / Not applicable" readOnly style={{ width: '100%' }}>
                    <option value="No Reason / Not applicable">No Reason / Not applicable</option>
                  </select>

                  <span style={{ fontWeight: 600 }}>Tax Structure</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input className="ids-input" value="798" readOnly style={{ width: '60px' }} />
                    <input className="ids-input" value="804" readOnly style={{ width: '60px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button className="ids-btn-classic" style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }} onClick={() => setRateDetailsOpen(false)}>Confirm</button>
                  <button className="ids-btn-classic" onClick={() => setRateDetailsOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
