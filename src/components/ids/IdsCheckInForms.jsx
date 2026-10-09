import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Check, X, Calendar, DollarSign, 
  HelpCircle, Car, ArrowRight, ArrowLeft, Printer, ShieldCheck 
} from 'lucide-react';

/* =========================================================================
   VIDEO 05: RESERVATION CHECK-IN FOR SINGLE ROOM IN IDS FORTUNE NEXT 6.5 & 7.0
   Replication of:
   1. Reservation Check-in Confirmation Dialog (Frame 008)
   2. Guest Details Grid For Res # Rooms : 1 Pax : 2 (Frame 010)
   3. Check-In V6.5002.5 Main Registration Modal (Frames 012–028)
   4. Rate Details Sub-Modal (Frame 022)
   5. Detailed Position - Already checked-in (Frame 032)
   6. Room Status V6.5.002.1 Rack Console (Frame 034)
   ========================================================================= */

// 1. RESERVATION CHECK-IN PROMPT (Frame 008)
export function IdsReservationCheckinPromptModal({ 
  isOpen, 
  onClose, 
  booking, 
  onContinue 
}) {
  if (!isOpen || !booking) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="ids-dialog-window" style={{ width: '380px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Reservation Check-in V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', background: '#ECE9D8', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#000', marginBottom: '20px' }}>
            Reservation Checkin for # {booking.resNo || '271'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '75px', fontWeight: 700 }}
              onClick={onContinue}
            >
              Continue
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '70px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. GUEST DETAILS GRID (Frame 010)
export function IdsCheckinGuestListModal({ 
  isOpen, 
  onClose, 
  booking, 
  onSelectGuest, 
  onRelease 
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen || !booking) return null;

  const guests = booking.guestList || [
    { title: 'Mr', name: 'Biswakarma Santosh', roomNo: booking.roomNo || '516', flag: 'No', refNo: '' },
    { title: 'Mrs', name: 'Rai Sangeeta', roomNo: booking.roomNo || '516', flag: 'No', refNo: '' }
  ];

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      <div className="ids-dialog-window" style={{ width: '560px', maxWidth: '98vw' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>
            Guest Details For Res # {booking.resNo || '271'} Rooms : 1 Pax : {guests.length}
          </span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Guests Table matching Frame 010 */}
          <div style={{ border: '1px solid #716F64', background: '#FFFFFF', height: '170px', overflowY: 'auto' }}>
            <table className="ids-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Guest Name</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Room Number</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Check-in Flag</th>
                  <th>Guest Ref#</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <tr 
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      onDoubleClick={() => onSelectGuest(g, idx)}
                      style={{ 
                        background: isSelected ? '#316AC5' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>{g.title} {g.name}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.roomNo}</td>
                      <td style={{ textAlign: 'center' }}>{g.flag}</td>
                      <td>{g.refNo}</td>
                    </tr>
                  );
                })}
                {/* Empty grid rows for authentic IDS look */}
                {[1, 2, 3, 4].map(i => (
                  <tr key={`empty-${i}`} style={{ height: '20px' }}>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={() => onRelease && onRelease(booking)}
            >
              Release
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px', fontWeight: 700 }}
              onClick={() => onSelectGuest(guests[selectedIdx], selectedIdx)}
            >
              <u>S</u>elect
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CHECK-IN RATE DETAILS MODAL (Frame 022)
export function IdsCheckInRateModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}) {
  const [extraAdult, setExtraAdult] = useState('1,000.00');
  const [extraChild, setExtraChild] = useState('0.00');
  const [tax1, setTax1] = useState('798');
  const [tax2, setTax2] = useState('804');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
      <div className="ids-dialog-window" style={{ width: '460px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Rate Details</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Plan</span>
            <input className="ids-input" value="CP" readOnly style={{ width: '70px', fontWeight: 700 }} />
            <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic', lineHeight: 1.2 }}>
              Charges entered here should be as per Total Number of Occupancy.
            </div>

            <span style={{ fontWeight: 600 }}>Cur</span>
            <input className="ids-input" value="INR" readOnly style={{ width: '70px', fontWeight: 700 }} />
            <div></div>

            <span style={{ fontWeight: 600 }}>Rate / Rack ID</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" value="1" readOnly style={{ width: '35px', textAlign: 'center' }} />
              <input className="ids-input" value="1" readOnly style={{ width: '35px', textAlign: 'center' }} />
            </div>
            <div></div>

            <span style={{ fontWeight: 600 }}>Discount</span>
            <input className="ids-input" defaultValue="0" style={{ width: '70px', textAlign: 'center' }} />
            <div></div>
          </div>

          {/* Table from Frame 022 */}
          <table className="ids-grid-table" style={{ marginTop: '10px', border: '1px solid #716F64' }}>
            <thead>
              <tr>
                <th style={{ width: '140px' }}></th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th style={{ textAlign: 'right' }}>Plan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Charges</td>
                <td style={{ textAlign: 'right' }}></td>
                <td style={{ textAlign: 'right' }}>0</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Extra Bed Adult</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={extraAdult} onChange={(e) => setExtraAdult(e.target.value)} />
                </td>
                <td style={{ textAlign: 'right' }}>0.00</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Extra Bed Child</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={extraChild} onChange={(e) => setExtraChild(e.target.value)} />
                </td>
                <td style={{ textAlign: 'right' }}>0.00</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Tax Structure</td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={tax1} readOnly /></td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={tax2} readOnly /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Exb. Tax Struct</td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={tax2} readOnly /></td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '80px', textAlign: 'right' }} value={tax2} readOnly /></td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={onConfirm}>Confirm</button>
            <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. MAIN CHECK-IN REGISTRATION MODAL (Check-In V6.5002.5, Frames 012–028)
export function IdsCheckInRegistrationModal({ 
  isOpen, 
  onClose, 
  booking, 
  onCompleteCheckIn 
}) {
  const [currentGuestIdx, setCurrentGuestIdx] = useState(0);
  const totalPax = 2;

  // Guest 1 data (Frame 014-024: Biswakarma Santosh)
  const [guest1, setGuest1] = useState({
    title: 'Mr',
    lastName: 'Biswakarma',
    middleName: '',
    firstName: 'Santosh',
    address: 'Jhadsugda',
    city: 'Odisha',
    state: 'Bhubaneshwar',
    country: 'India',
    zip: '1234567',
    telephone: '',
    mobile: '12345677890',
    email: '',
    gender: 'Male',
    gstNo: '',
    designation: '',
    occupation: '',
    classification: 'Regular',
    guestStatus: 'HOL',
    nationality: 'IND',
    paxType: 'Adult',
    checkOut: '12 Noon',
    sendSms: 'No',
    smoking: 'No'
  });

  // Guest 2 data (Frame 028: Mrs Rai Sangeeta)
  const [guest2, setGuest2] = useState({
    title: 'Mrs',
    lastName: 'Rai',
    middleName: '',
    firstName: 'Sangeeta',
    address: 'Parayaganj',
    city: 'Mumbai',
    state: 'Maharastra',
    country: 'India',
    zip: '741001',
    telephone: '',
    mobile: '1234567890',
    email: '',
    gender: 'Female',
    gstNo: '',
    designation: '',
    occupation: '',
    classification: 'Regular',
    guestStatus: 'HOL',
    nationality: 'IND',
    paxType: 'Adult',
    checkOut: '12 Noon',
    sendSms: 'No',
    smoking: 'No'
  });

  // Common Corporate & Billing Data
  const [companyCode, setCompanyCode] = useState('COM0007');
  const [billInst, setBillInst] = useState('1');
  const [businessSource, setBusinessSource] = useState('MUM');
  const [marketSegment, setMarketSegment] = useState('CVT');
  const [payMode, setPayMode] = useState('CAS');
  const [planCode, setPlanCode] = useState('CP');
  const [rateType, setRateType] = useState('Discount');
  const [scantyBaggage, setScantyBaggage] = useState('No');
  const [regNo, setRegNo] = useState('581');
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateConfirmed, setRateConfirmed] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Writing Guest Extras');

  const activeGuest = currentGuestIdx === 0 ? guest1 : guest2;
  const setActiveGuestField = (field, val) => {
    if (currentGuestIdx === 0) {
      setGuest1(prev => ({ ...prev, [field]: val }));
    } else {
      setGuest2(prev => ({ ...prev, [field]: val }));
    }
  };

  if (!isOpen || !booking) return null;

  const handleSave = () => {
    setStatusMessage('Writing Details...');
    setTimeout(() => {
      if (currentGuestIdx === 0 && totalPax > 1) {
        // Move to Guest 2 (Frame 028)
        setCurrentGuestIdx(1);
        setStatusMessage('Writing Guest Extras');
      } else {
        // All guests checked in!
        onCompleteCheckIn({
          resNo: booking.resNo || '271',
          roomNo: booking.roomNo || '516',
          regNo: regNo || '581',
          guest1,
          guest2,
          rate: '6,500.00',
          planAmt: '700.00',
          totalGuests: 2,
          arrivalDate: booking.arrivalDate || '14-JAN-2022',
          departureDate: booking.departureDate || '16-JAN-2022'
        });
      }
    }, 400);
  };

  return (
    <>
      <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
        <div className="ids-dialog-window" style={{ width: '740px', maxWidth: '98vw' }}>
          {/* Title Bar */}
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Check-In V6.5002.5</span>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '10px 14px' }}>
            {/* Top Registration Title & Pax/Folio Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ border: '1px solid #716F64', padding: '3px 8px', background: '#F8F7F0', fontWeight: 700, fontSize: '11px' }}>
                Registration for {booking.roomNo || '516'}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Pax</span>
                  <input className="ids-input" style={{ width: '35px', textAlign: 'center', fontWeight: 700 }} value={currentGuestIdx + 1} readOnly />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Folio #</span>
                  <input className="ids-input" style={{ width: '35px', textAlign: 'center', fontWeight: 700 }} value="1" readOnly />
                </div>
              </div>
            </div>

            {/* Guest Name Row */}
            <div style={{ border: '1px solid #716F64', padding: '6px 8px', background: '#F8F7F0', display: 'grid', gridTemplateColumns: '55px 170px 120px 1fr', gap: '6px', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555' }}>Title</span>
                <input className="ids-input" value={activeGuest.title} onChange={(e) => setActiveGuestField('title', e.target.value)} style={{ width: '100%', fontWeight: 600 }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555' }}>Last Name</span>
                <input className="ids-input" value={activeGuest.lastName} onChange={(e) => setActiveGuestField('lastName', e.target.value)} style={{ width: '100%', fontWeight: 600 }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555' }}>Middle Name</span>
                <input className="ids-input" value={activeGuest.middleName} onChange={(e) => setActiveGuestField('middleName', e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555' }}>First Name</span>
                <input className="ids-input" value={activeGuest.firstName} onChange={(e) => setActiveGuestField('firstName', e.target.value)} style={{ width: '100%', fontWeight: 600 }} />
              </div>
            </div>

            {/* Main Form 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px' }}>
              {/* Left Column: Address & Contact */}
              <div style={{ border: '1px solid #716F64', padding: '8px', background: '#F8F7F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Address</span>
                  <input className="ids-input" value={activeGuest.address} onChange={(e) => setActiveGuestField('address', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>City</span>
                  <input className="ids-input" value={activeGuest.city} onChange={(e) => setActiveGuestField('city', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>State</span>
                  <input className="ids-input" value={activeGuest.state} onChange={(e) => setActiveGuestField('state', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Country</span>
                  <input className="ids-input" value={activeGuest.country} onChange={(e) => setActiveGuestField('country', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Zip</span>
                  <input className="ids-input" value={activeGuest.zip} onChange={(e) => setActiveGuestField('zip', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Telephone #</span>
                  <input className="ids-input" value={activeGuest.telephone} onChange={(e) => setActiveGuestField('telephone', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Mobile #</span>
                  <input className="ids-input" value={activeGuest.mobile} onChange={(e) => setActiveGuestField('mobile', e.target.value)} style={{ fontWeight: 600 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Email ID</span>
                  <input className="ids-input" value={activeGuest.email} onChange={(e) => setActiveGuestField('email', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 100px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Gender</span>
                  <select className="ids-select" value={activeGuest.gender} onChange={(e) => setActiveGuestField('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>GST No</span>
                  <input className="ids-input" value={activeGuest.gstNo} onChange={(e) => setActiveGuestField('gstNo', e.target.value)} />
                </div>
              </div>

              {/* Right Column: Demographics & Rates */}
              <div style={{ border: '1px solid #716F64', padding: '8px', background: '#F8F7F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Designation</span>
                  <input className="ids-input" value={activeGuest.designation} onChange={(e) => setActiveGuestField('designation', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Occupation</span>
                  <input className="ids-input" value={activeGuest.occupation} onChange={(e) => setActiveGuestField('occupation', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Classification</span>
                  <select className="ids-select" value={activeGuest.classification} onChange={(e) => setActiveGuestField('classification', e.target.value)}>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 60px 24px 35px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Guest Status</span>
                  <input className="ids-input" value={activeGuest.guestStatus} onChange={(e) => setActiveGuestField('guestStatus', e.target.value)} style={{ fontWeight: 700 }} />
                  <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                  <button className="ids-btn-classic" style={{ padding: '0 2px', fontSize: '9px' }}>DW</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 60px 24px 50px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Nationality</span>
                  <input className="ids-input" value={activeGuest.nationality} onChange={(e) => setActiveGuestField('nationality', e.target.value)} style={{ fontWeight: 700 }} />
                  <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                  <button className="ids-btn-classic" style={{ padding: '0 2px', fontSize: '10px' }}>More...</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 50px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Pax Type</span>
                  <select className="ids-select" value={activeGuest.paxType} onChange={(e) => setActiveGuestField('paxType', e.target.value)}>
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                  </select>
                  <button className="ids-btn-classic" onClick={() => setRateModalOpen(true)}>Rate</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 50px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Check Out</span>
                  <select className="ids-select" value={activeGuest.checkOut} onChange={(e) => setActiveGuestField('checkOut', e.target.value)}>
                    <option value="12 Noon">12 Noon</option>
                    <option value="11 AM">11 AM</option>
                  </select>
                  <button className="ids-btn-classic">Trace</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 1fr', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Send SMS</span>
                  <select className="ids-select" value={activeGuest.sendSms} onChange={(e) => setActiveGuestField('sendSms', e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  {rateConfirmed && (
                    <span style={{ fontWeight: 700, color: '#0A246A', fontSize: '11px', textAlign: 'right' }}>
                      6,500.00 INR
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 30px', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Smoking</span>
                  <select className="ids-select" value={activeGuest.smoking} onChange={(e) => setActiveGuestField('smoking', e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Vehicle Info">
                    <Car size={16} color="#A02020" />
                  </div>
                </div>
              </div>
            </div>

            {/* Corporate & Billing Strip (Frame 012 bottom) */}
            <div style={{ border: '1px solid #716F64', padding: '6px 8px', background: '#F8F7F0', marginTop: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 60px 60px 70px 60px 24px 1fr', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Company</span>
                <input className="ids-input" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} style={{ fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Details</button>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Bookers</button>

                <span style={{ fontWeight: 600, textAlign: 'right' }}>Pay Mode</span>
                <input className="ids-input" value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '1px 3px' }}>Revenue Discount</button>
                  <button className="ids-btn-classic" style={{ fontSize: '9px', padding: '1px 3px' }}>Extra Chg</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '70px 50px 24px 130px 70px 60px 24px 1fr', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Bill Inst</span>
                <input className="ids-input" value={billInst} onChange={(e) => setBillInst(e.target.value)} style={{ textAlign: 'center' }} />
                <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                <div></div>

                <span style={{ fontWeight: 600, textAlign: 'right' }}>Plan Code</span>
                <input className="ids-input" value={planCode} onChange={(e) => setPlanCode(e.target.value)} style={{ fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                <div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '70px 50px 24px 130px 70px 90px 1fr', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Business Source</span>
                <input className="ids-input" value={businessSource} onChange={(e) => setBusinessSource(e.target.value)} style={{ fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                <div></div>

                <span style={{ fontWeight: 600, textAlign: 'right' }}>Rate</span>
                <select className="ids-select" value={rateType} onChange={(e) => setRateType(e.target.value)}>
                  <option value="Discount">Discount</option>
                  <option value="Rack">Rack</option>
                  <option value="Corporate">Corporate</option>
                </select>
                <div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '70px 50px 24px 1fr 90px 60px 80px', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Market Segment</span>
                <input className="ids-input" value={marketSegment} onChange={(e) => setMarketSegment(e.target.value)} style={{ fontWeight: 700 }} />
                <button className="ids-btn-classic" style={{ padding: '0 2px' }}>?</button>
                <div style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>{statusMessage}</div>

                <span style={{ fontWeight: 600, textAlign: 'right' }}>Scanty Baggage</span>
                <select className="ids-select" value={scantyBaggage} onChange={(e) => setScantyBaggage(e.target.value)}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Guest Details</button>
              </div>
            </div>

            {/* Registration Number Row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              <span style={{ fontWeight: 600 }}>Registration Number</span>
              <input 
                className="ids-input" 
                style={{ width: '80px', textAlign: 'center', fontWeight: 700, color: '#A02020' }} 
                value={regNo} 
                onChange={(e) => setRegNo(e.target.value)} 
              />
            </div>

            {/* Bottom Button Toolbar from Frame 012 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderTop: '1px solid #D0CDC0', paddingTop: '6px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Spl. Inst...</button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Local Add</button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Others...</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '65px', fontWeight: 700, color: '#0A246A' }}
                onClick={handleSave}
              >
                <u>S</u>ave
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Clear</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={onClose}>Exit</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '35px' }}>GI</button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }}>Load Pgm</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Details Sub-Dialog */}
      <IdsCheckInRateModal 
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onConfirm={() => {
          setRateModalOpen(false);
          setRateConfirmed(true);
        }}
      />
    </>
  );
}

// 5. DETAILED POSITION - ALREADY CHECKED-IN (Frame 032)
export function IdsCheckedInPositionModal({ 
  isOpen, 
  onClose, 
  checkedInList = [] 
}) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="ids-dialog-window" style={{ width: '820px', maxWidth: '98vw' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Detailed Position - Already checked-in - 14-JAN-2022</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div style={{ border: '1px solid #716F64', background: '#FFFFFF', height: '260px', overflowY: 'auto' }}>
            <table className="ids-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Room</th>
                  <th style={{ width: '55px' }}>Reg. #</th>
                  <th style={{ width: '45px' }}>Type</th>
                  <th>Guest Name</th>
                  <th style={{ width: '75px', textAlign: 'right' }}>Room Rate</th>
                  <th style={{ width: '65px', textAlign: 'right' }}>Plan Amt</th>
                  <th style={{ width: '80px' }}>Arrival</th>
                  <th style={{ width: '80px' }}>Departure</th>
                  <th style={{ width: '50px' }}>Nation</th>
                  <th style={{ width: '65px' }}>User</th>
                </tr>
              </thead>
              <tbody>
                {checkedInList.map((c, idx) => (
                  <React.Fragment key={idx}>
                    <tr style={{ background: '#F8F7F0' }}>
                      <td style={{ fontWeight: 700, color: '#A02020' }}>{c.roomNo || '516'}</td>
                      <td style={{ fontWeight: 700 }}>{c.regNo || '581'}</td>
                      <td>{c.type || 'SUI'}</td>
                      <td style={{ fontWeight: 600 }}>{c.guestName || 'Mr Biswakarma Santosh'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{c.rate || '6,500.00'}</td>
                      <td style={{ textAlign: 'right' }}>{c.planAmt || '700.00'}</td>
                      <td>{c.arrivalDate ? c.arrivalDate.split(' ')[0] : '14-JAN-2022'}</td>
                      <td>{c.departureDate ? c.departureDate.split(' ')[0] : '16-JAN-2022'}</td>
                      <td>{c.nation || 'IND'}</td>
                      <td>{c.user || 'MANAGER'}</td>
                    </tr>
                    {c.companyName && (
                      <tr style={{ background: '#FFFFFF', fontSize: '10px' }}>
                        <td style={{ color: '#777', fontStyle: 'italic' }}>Company...</td>
                        <td colSpan={9} style={{ color: '#0A246A', fontWeight: 600 }}>{c.companyName}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {/* Empty rows */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={`empty-${i}`} style={{ height: '20px' }}>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '70px', fontWeight: 700 }}
              onClick={onClose}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. ROOM STATUS RACK CONSOLE (Room Status V6.5.002.1, Frame 034)
export function IdsRoomRackConsoleModal({ 
  isOpen, 
  onClose, 
  checkedInList = [],
  occupiedRoom = '516', 
  guestName = 'Biswakarma' 
}) {
  const [filterType, setFilterType] = useState('All');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterFloor, setFilterFloor] = useState('All');

  if (!isOpen) return null;

  const is516Occupied = checkedInList.some(c => c.roomNo === '516') || occupiedRoom === '516';
  const is401Occupied = checkedInList.some(c => c.roomNo === '401');
  const is415Occupied = checkedInList.some(c => c.roomNo === '415');
  const is501Occupied = checkedInList.some(c => c.roomNo === '501');
  const is515Occupied = checkedInList.some(c => c.roomNo === '515');

  // 44 Rooms matching Frame 034 & Frame 060 grid
  const roomsMatrix = [
    { no: '201', type: 'D/EXE', status: 'dirty' },
    { no: '203', type: 'D/DLX', status: 'dirty' },
    { no: '204', type: 'D/DLX', status: 'dirty' },
    { no: '205', type: 'D/DLX', status: 'dirty' },
    { no: '206', type: 'D/DLX', status: 'dirty' },
    { no: '207', type: 'D/DLX', status: 'dirty' },
    { no: '208', type: 'D/DLX', status: 'dirty' },
    { no: '209', type: 'D/DLX', status: 'dirty' },
    { no: '210', type: 'D/DLX', status: 'dirty' },
    { no: '211', type: 'D/DLX', status: 'dirty' },

    { no: '212', type: 'D/DLX', status: 'dirty' },
    { no: '214', type: 'D/DLX', status: 'dirty' },
    { no: '215', type: 'D/EXE', status: 'dirty' },
    { no: '216', type: 'D/SUI', status: 'dirty' },
    { no: '301', type: 'O/EXE', guest: 'Sajin Ahmed', status: 'occupied' },
    { no: '303', type: 'O/DLX', guest: 'CHETIA', status: 'occupied' },
    { no: '304', type: 'O/DLX', guest: 'CHETIA', status: 'occupied' },
    { no: '305', type: 'O/DLX', guest: 'KAKATI', status: 'occupied' },
    { no: '306', type: 'O/DLX', guest: 'SINGH', status: 'occupied' },
    { no: '307', type: 'O/DLX', guest: 'SINGH', status: 'occupied' },

    { no: '308', type: 'D/DLX', status: 'dirty' },
    { no: '309', type: 'D/DLX', status: 'dirty' },
    { no: '310', type: 'O/DLX', guest: 'WAHLANG', status: 'occupied' },
    { no: '311', type: 'O/DLX', guest: 'DEURI', status: 'occupied' },
    { no: '312', type: 'V/DLX', status: 'vacant' },
    { no: '314', type: 'V/DLX', status: 'vacant' },
    { no: '315', type: 'V/EXE', status: 'vacant' },
    { no: '316', type: 'V/SUI', status: 'vacant' },
    { 
      no: '401', 
      type: is401Occupied ? 'O/EXE' : 'V/EXE', 
      guest: is401Occupied ? 'Khan' : undefined, 
      status: is401Occupied ? 'occupied' : 'vacant' 
    },
    { no: '403', type: 'O/DLX', guest: 'DEKA', status: 'occupied' },

    { no: '404', type: 'O/DLX', guest: 'DAS', status: 'occupied' },
    { no: '405', type: 'V/DLX', status: 'vacant' },
    { no: '406', type: 'V/DLX', status: 'vacant' },
    { no: '407', type: 'V/DLX', status: 'vacant' },
    { no: '408', type: 'V/DLX', status: 'vacant' },
    { no: '409', type: 'O/DLX', guest: 'BHATTASALI', status: 'occupied' },
    { no: '410', type: 'V/DLX', status: 'vacant' },
    { no: '411', type: 'V/DLX', status: 'vacant' },
    { no: '412', type: 'V/DLX', status: 'vacant' },
    { no: '414', type: 'V/DLX', status: 'vacant' },

    { 
      no: '415', 
      type: is415Occupied ? 'O/EXE' : 'V/EXE', 
      guest: is415Occupied ? 'Kumar' : undefined, 
      status: is415Occupied ? 'occupied' : 'vacant' 
    },
    { no: '416', type: 'V/SUI', status: 'vacant' },
    { 
      no: '501', 
      type: is501Occupied ? 'O/EXE' : 'V/EXE', 
      guest: is501Occupied ? 'Anil Kumar G' : undefined, 
      status: is501Occupied ? 'occupied' : 'vacant',
      tooltip: is501Occupied ? 'ROOM # 501 IS OCCUPIED BY (DOUBLE CLICK HERE FOR MORE INFORMATION)' : undefined
    },
    { no: '503', type: 'O/DLX', guest: 'NATRAJ', status: 'occupied' },
    { no: '504', type: 'O/DLX', guest: 'MENAN', status: 'occupied' },
    { no: '505', type: 'O/DLX', guest: 'BEDI', status: 'occupied' },
    { no: '506', type: 'V/DLX', status: 'vacant' },
    { no: '507', type: 'V/DLX', status: 'vacant' },
    { no: '508', type: 'V/DLX', status: 'vacant' },
    { no: '509', type: 'V/DLX', status: 'vacant' },

    { no: '510', type: 'V/DLX', status: 'vacant' },
    { no: '511', type: 'V/DLX', status: 'vacant' },
    { no: '512', type: 'V/DLX', status: 'vacant' },
    { no: '514', type: 'V/DLX', status: 'vacant' },
    { 
      no: '515', 
      type: is515Occupied ? 'O/EXE' : 'V/EXE', 
      guest: is515Occupied ? 'Anil Kumar G' : undefined, 
      status: is515Occupied ? 'occupied' : 'vacant' 
    },
    { 
      no: '516', 
      type: is516Occupied ? 'O/SUI' : 'V/SUI', 
      guest: is516Occupied ? (guestName || 'Biswakarma') : undefined, 
      status: is516Occupied ? 'occupied' : 'vacant' 
    },
    { no: '601', type: 'D/PNH', status: 'dirty' }
  ];

  const addedOccupied = (is516Occupied ? 1 : 0) + (is401Occupied ? 1 : 0) + (is415Occupied ? 1 : 0) + (is501Occupied ? 1 : 0) + (is515Occupied ? 1 : 0);
  const occupiedCount = 14 + addedOccupied;
  const vacantCount = Math.max(0, 25 - addedOccupied);

  const getCellBg = (status) => {
    switch (status) {
      case 'occupied': return '#F15A24'; // Vivid orange/red
      case 'vacant': return '#58B957';   // Vivid green
      case 'dirty': return '#E8E137';    // Vivid yellow
      default: return '#E0DEC8';
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="ids-dialog-window" style={{ width: '960px', maxWidth: '98vw' }}>
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Room Status V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 12px' }}>
          {/* Top Filter Strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Room Type</span>
              <select className="ids-select" style={{ width: '70px', background: '#316AC5', color: '#FFF', fontWeight: 700 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Block</span>
              <select className="ids-select" style={{ width: '60px' }} value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
                <option value="All">All</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Floor</span>
              <select className="ids-select" style={{ width: '60px' }} value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}>
                <option value="All">All</option>
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Page 1 of 1</span>
              <span>Special Rooms 🙂</span>
            </div>
          </div>

          {/* Room Rack Console Grid (10 Columns, 6 Rows matching Frame 034) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', background: '#999', padding: '2px', maxHeight: '460px', overflowY: 'auto' }}>
            {roomsMatrix.map((r) => (
              <div 
                key={r.no}
                style={{
                  background: getCellBg(r.status),
                  border: r.no === '401' && is401Occupied ? '2px solid #000080' : '1px solid #777',
                  padding: '3px 4px',
                  minHeight: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: '#000',
                  fontSize: '10px'
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.no}</span>
                  <span>{r.type}</span>
                </div>
                {r.guest && (
                  <div style={{ fontWeight: 700, fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.guest}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Statistics Legend from Frame 034 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '10px', fontSize: '11px', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#58B957', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>{vacantCount}</span>
              <span>Vacant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#00AEEF', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>0</span>
              <span>Reservation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#F15A24', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>{occupiedCount}</span>
              <span>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#E8E137', color: '#000', padding: '1px 5px', fontWeight: 700 }}>17</span>
              <span>Dirty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#7A5230', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>0</span>
              <span>Out of order</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#800080', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>0</span>
              <span>Out of Service</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#ED1C24', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>0</span>
              <span>Mask Guest</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#316AC5', color: '#FFF', padding: '1px 5px', fontWeight: 700 }}>2</span>
              <span>Expected Departure</span>
            </div>
          </div>

          {/* Bottom buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Print</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Previous</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Next</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
