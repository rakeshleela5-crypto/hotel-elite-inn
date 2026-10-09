import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, HelpCircle, Home, Users, UserCheck, 
  ArrowRight, Save, X, FileText, Check, DollarSign, Calendar
} from 'lucide-react';
import { 
  IdsRateInformationModal, 
  IdsReasonEntryModal, 
  IdsDuplicateGuestModal, 
  IdsPostSaveDialog, 
  IdsPostReceiptsModal 
} from './IdsRateModals';

export function IdsQuickReservationModal({ 
  isOpen, 
  onClose, 
  onSuccessBooking, 
  rooms = [] 
}) {
  const [arrivalDate, setArrivalDate] = useState('14-JAN-2022');
  const [arrivalTime, setArrivalTime] = useState('19:53');
  const [arrivalDay, setArrivalDay] = useState('FRIDAY');
  const [nights, setNights] = useState('2');
  const [departureDate, setDepartureDate] = useState('16-JAN-2022 12:00');
  const [departureDay, setDepartureDay] = useState('SUNDAY');

  const [property, setProperty] = useState('DEMO');
  const [companyCode, setCompanyCode] = useState('COM0007');
  const [companyName, setCompanyName] = useState('Mahindra & Mahindra Limited');
  const [bookerName, setBookerName] = useState('Ajay Yadav');
  const [bookerCode, setBookerCode] = useState('');
  const [roomType, setRoomType] = useState('DELUXE');
  const [mode, setMode] = useState('Phone');
  const [roomsCount, setRoomsCount] = useState('1');
  const [adultCount, setAdultCount] = useState('2');
  const [childCount, setChildCount] = useState('0');
  const [status, setStatus] = useState('Confirmed');

  // Guest Grid
  const [guests, setGuests] = useState([
    { title: 'Mr', lastName: 'Biswakarma', middleName: '', firstName: 'Santosh', selected: true },
    { title: 'Mrs', lastName: 'Rai', middleName: '', firstName: 'Sangeeta', selected: false }
  ]);

  // Pricing
  const [tariffs, setTariffs] = useState({
    currency: 'INR',
    single: '6500.00',
    double: '6500.00',
    triple: '0.00',
    qud: '0.00',
    extAdult: '1000.00',
    extChild: '0.00'
  });

  // Sub-Dialog States
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [postSaveOpen, setPostSaveOpen] = useState(false);
  const [receiptsOpen, setReceiptsOpen] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);
  const [activeGuestTab, setActiveGuestTab] = useState('Guest Information');

  // Guest Tab fields (Detailed view)
  const [guestDetail, setGuestDetail] = useState({
    name: 'Rai',
    roomNo: '',
    street: 'Parayaganj',
    city: 'Mumbai',
    phone: '',
    state: 'Maharastra',
    mobile: '1234567890',
    country: 'India',
    email: '',
    zip: '741001',
    postHistory: 'Yes',
    guestCode: '',
    sendSms: 'No',
    paxType: 'Adult',
    gender: 'Male',
    nation: 'India',
    smoking: 'No',
    classification: 'Regular',
    gstNo: ''
  });

  if (!isOpen) return null;

  const handleSaveClick = () => {
    setPostSaveOpen(true);
  };

  const handlePostSaveOk = ({ deposits }) => {
    setPostSaveOpen(false);
    if (deposits === 'YES') {
      setReceiptsOpen(true);
    } else {
      if (onSuccessBooking) {
        onSuccessBooking({
          reservationNo: '271',
          guestName: `${guests[0]?.title} ${guests[0]?.firstName} ${guests[0]?.lastName}`,
          roomType,
          arrivalDate,
          departureDate,
          company: companyName
        });
      }
      onClose();
    }
  };

  const handleReceiptsSave = () => {
    setReceiptsOpen(false);
    if (onSuccessBooking) {
      onSuccessBooking({
        reservationNo: '271',
        guestName: `${guests[0]?.title} ${guests[0]?.firstName} ${guests[0]?.lastName}`,
        roomType,
        arrivalDate,
        departureDate,
        company: companyName,
        advancePaid: '5000.00'
      });
    }
    onClose();
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ width: detailedMode ? '1180px' : '620px', maxWidth: '98vw' }}
      >
        {/* Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>
            {detailedMode ? 'Detailed Reservation / Make V6.5.002.20' : 'Quick Reservation / Make V6.5.002.20'}
          </span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Top Action Ribbon (+, Edit, Del, Help, Building, Group, Checkin, Search) */}
        <div className="ids-dialog-top-tools">
          <div className="ids-dialog-action-icon" title="New Reservation">
            <Plus size={20} strokeWidth={2.5} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Amend Reservation">
            <Edit2 size={18} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Cancel Reservation">
            <Trash2 size={18} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Help / Info">
            <HelpCircle size={18} color="#111" />
          </div>
          <div 
            className="ids-dialog-action-icon" 
            title={detailedMode ? "Switch to Quick Reservation" : "Switch to Detailed Reservation"}
            onClick={() => setDetailedMode(!detailedMode)}
            style={{ background: detailedMode ? '#DFDBC9' : 'transparent', border: '1px solid #716F64' }}
          >
            <Home size={18} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Group Booking">
            <Users size={18} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Check-In">
            <UserCheck size={18} color="#111" />
          </div>
          <div className="ids-dialog-action-icon" title="Duplicate Guest Check" onClick={() => setDuplicateModalOpen(true)}>
            <ArrowRight size={18} color="#111" />
          </div>
        </div>

        {/* Dialog Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: detailedMode ? '520px 1fr' : '1fr', padding: '10px 14px', gap: '14px', maxHeight: '82vh', overflowY: 'auto' }}>
          
          {/* Left Form: Quick Reservation Core */}
          <div>
            {/* Arrival & Departure Block */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 100px 50px 70px 50px 45px', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Arrival</span>
              <input className="ids-input" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
              <input className="ids-input" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
              <input className="ids-input" value={arrivalDay} readOnly style={{ background: '#EDEAE0' }} />
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Nights</span>
              <input className="ids-input" value={nights} onChange={(e) => setNights(e.target.value)} style={{ textAlign: 'center' }} />

              <span style={{ fontWeight: 600 }}>Departure</span>
              <input className="ids-input" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} style={{ gridColumn: 'span 2' }} />
              <input className="ids-input" value={departureDay} readOnly style={{ background: '#EDEAE0', gridColumn: 'span 2' }} />
            </div>

            {/* Property & Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 1fr', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Property</span>
              <select className="ids-select" value={property} onChange={(e) => setProperty(e.target.value)}>
                <option value="DEMO">DEMO</option>
                <option value="ELITE">ELITE</option>
              </select>
              <span style={{ fontWeight: 700, color: '#333' }}>DEMO HOTEL ELITE INN</span>

              <span style={{ fontWeight: 600 }}>Company</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <input className="ids-input" style={{ width: '65px' }} value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} />
                <button className="ids-btn-classic" style={{ minWidth: '18px', padding: '1px 4px' }}>?</button>
              </div>
              <span style={{ fontWeight: 600, fontSize: '11px', color: '#0A246A' }}>{companyName}</span>
            </div>

            {/* Booker Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 100px 70px 1fr', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Booker Type</span>
              <input className="ids-input" defaultValue="" />
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Booker Code</span>
              <input className="ids-input" value={bookerCode} onChange={(e) => setBookerCode(e.target.value)} />

              <span style={{ fontWeight: 600 }}>Booker Name</span>
              <input className="ids-input" style={{ gridColumn: 'span 3' }} value={bookerName} onChange={(e) => setBookerName(e.target.value)} />
            </div>

            {/* Room Type & Occupancy */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 110px 50px 1fr', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Room Type</span>
              <select className="ids-select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="DELUXE">DELUXE</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
                <option value="PENTHOUSE">PENTHOUSE</option>
                <option value="SUITE">SUITE</option>
                <option value="Special">Special</option>
              </select>
              <span style={{ fontWeight: 600, textAlign: 'right' }}>Mode</span>
              <input className="ids-input" value={mode} onChange={(e) => setMode(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontWeight: 600, width: '64px' }}>Rooms</span>
              <input className="ids-input" style={{ width: '35px', textAlign: 'center' }} value={roomsCount} onChange={(e) => setRoomsCount(e.target.value)} />
              <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '1px 4px', color: 'green', fontWeight: 900 }}>✓</button>

              <span style={{ fontWeight: 600, marginLeft: '6px' }}>Adult</span>
              <input className="ids-input" style={{ width: '35px', textAlign: 'center' }} value={adultCount} onChange={(e) => setAdultCount(e.target.value)} />

              <span style={{ fontWeight: 600, marginLeft: '6px' }}>Child</span>
              <input className="ids-input" style={{ width: '35px', textAlign: 'center' }} value={childCount} onChange={(e) => setChildCount(e.target.value)} />

              <button className="ids-btn-classic" style={{ marginLeft: 'auto', fontSize: '10px' }}>Room Details</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '32px' }}>HP</button>
              <button className="ids-btn-classic" style={{ minWidth: '32px' }}>AG</button>
              <button className="ids-btn-classic" style={{ minWidth: '32px' }}>DP</button>
              <span style={{ fontWeight: 600, marginLeft: '6px' }}>Status</span>
              <select className="ids-select" style={{ width: '100px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Confirmed">Confirmed</option>
                <option value="Waitlist">Waitlist</option>
                <option value="Tentative">Tentative</option>
              </select>

              <button 
                className="ids-btn-classic" 
                style={{ marginLeft: 'auto', minWidth: '60px', fontWeight: 800, color: '#0A246A' }}
                onClick={() => setRateModalOpen(true)}
              >
                Rate
              </button>
            </div>

            {/* Guest Grid Table */}
            <div style={{ marginTop: '10px', border: '1px solid #716F64', background: '#FFF' }}>
              <table className="ids-grid-table">
                <thead>
                  <tr>
                    <th style={{ width: '24px' }}></th>
                    <th style={{ width: '45px' }}>Title</th>
                    <th>Last Name</th>
                    <th>Middle Name</th>
                    <th>First Name</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g, idx) => (
                    <tr key={idx} style={{ background: g.selected ? '#CCE0FF' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={g.selected} onChange={() => {
                          setGuests(prev => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
                        }} />
                      </td>
                      <td>{g.title}</td>
                      <td style={{ fontWeight: 600 }}>{g.lastName}</td>
                      <td>{g.middleName}</td>
                      <td>{g.firstName}</td>
                    </tr>
                  ))}
                  <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
                </tbody>
              </table>
            </div>

            {/* Tariff Breakdown Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '8px' }}>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Currency</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.currency} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Single</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.single} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Double</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.double} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Triple</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.triple} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Qud</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.qud} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Ext. Adult</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.extAdult} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#555' }}>Ext. Child</span>
                <input className="ids-input" style={{ width: '100%' }} value={tariffs.extChild} readOnly />
              </div>
            </div>

            {/* Action Buttons: F9, F10, Floppy Save, Big X Cancel, Right Arrow */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #B0AB9A', paddingTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#444' }}>
                <span>F9 - Guest Note</span>
                <span>F10 - Documents</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="ids-icon-save-btn" title="Save Reservation (Floppy Disk)" onClick={handleSaveClick}>
                  <Save size={20} color="#0A246A" />
                </button>
                <button className="ids-icon-cancel-btn" title="Cancel / Close" onClick={onClose}>
                  ✕
                </button>
                <button className="ids-icon-next-btn" title="Proceed to Detailed Reservation" onClick={() => setDetailedMode(!detailedMode)}>
                  ➔
                </button>
              </div>
            </div>
          </div>

          {/* Right Sub-Panel: Detailed Reservation Extension (Frame 008) */}
          {detailedMode && (
            <div style={{ borderLeft: '1px solid #B0AB9A', paddingLeft: '14px', display: 'flex', flexDirection: 'column' }}>
              {/* Tab Selector Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {['Guest Information', 'Pickup & Drop', 'Privilege & Credit Cards', 'Passport & Visa', 'Vehicle Information', 'Likes / Dislikes', 'Guest Trace'].map(tab => (
                  <button 
                    key={tab}
                    className="ids-btn-classic"
                    style={{ 
                      fontSize: '10px', 
                      padding: '2px 8px', 
                      background: activeGuestTab === tab ? '#D5D1BD' : '#ECE9D8',
                      fontWeight: activeGuestTab === tab ? 800 : 500
                    }}
                    onClick={() => setActiveGuestTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Guest Information Tab Content */}
              {activeGuestTab === 'Guest Information' && (
                <div style={{ background: '#F8F7F0', border: '1px solid #B0AB9A', padding: '10px', borderRadius: '2px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 70px 1fr', rowGap: '6px', columnGap: '8px', alignItems: 'center' }}>
                    <span>Name</span>
                    <input className="ids-input" value={guestDetail.name} onChange={(e) => setGuestDetail({ ...guestDetail, name: e.target.value })} />
                    <span>Room #</span>
                    <input className="ids-input" value={guestDetail.roomNo} onChange={(e) => setGuestDetail({ ...guestDetail, roomNo: e.target.value })} />

                    <span>Street</span>
                    <input className="ids-input" style={{ gridColumn: 'span 3' }} value={guestDetail.street} onChange={(e) => setGuestDetail({ ...guestDetail, street: e.target.value })} />

                    <span>City</span>
                    <input className="ids-input" value={guestDetail.city} onChange={(e) => setGuestDetail({ ...guestDetail, city: e.target.value })} />
                    <span>Phone</span>
                    <input className="ids-input" value={guestDetail.phone} onChange={(e) => setGuestDetail({ ...guestDetail, phone: e.target.value })} />

                    <span>State</span>
                    <input className="ids-input" value={guestDetail.state} onChange={(e) => setGuestDetail({ ...guestDetail, state: e.target.value })} />
                    <span>Mobile</span>
                    <input className="ids-input" value={guestDetail.mobile} onChange={(e) => setGuestDetail({ ...guestDetail, mobile: e.target.value })} />

                    <span>Country</span>
                    <input className="ids-input" value={guestDetail.country} onChange={(e) => setGuestDetail({ ...guestDetail, country: e.target.value })} />
                    <span>e-mail</span>
                    <input className="ids-input" value={guestDetail.email} onChange={(e) => setGuestDetail({ ...guestDetail, email: e.target.value })} />

                    <span>Zip</span>
                    <input className="ids-input" value={guestDetail.zip} onChange={(e) => setGuestDetail({ ...guestDetail, zip: e.target.value })} />
                    <span>Post History</span>
                    <select className="ids-select" value={guestDetail.postHistory} onChange={(e) => setGuestDetail({ ...guestDetail, postHistory: e.target.value })}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>

                    <span>Pax Type</span>
                    <select className="ids-select" value={guestDetail.paxType} onChange={(e) => setGuestDetail({ ...guestDetail, paxType: e.target.value })}>
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                    </select>
                    <span>Gender</span>
                    <select className="ids-select" value={guestDetail.gender} onChange={(e) => setGuestDetail({ ...guestDetail, gender: e.target.value })}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    <span>Nation</span>
                    <select className="ids-select" value={guestDetail.nation} onChange={(e) => setGuestDetail({ ...guestDetail, nation: e.target.value })}>
                      <option value="India">India</option>
                      <option value="Foreigner">Foreigner</option>
                    </select>
                    <span>Smoking</span>
                    <select className="ids-select" value={guestDetail.smoking} onChange={(e) => setGuestDetail({ ...guestDetail, smoking: e.target.value })}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>

                    <span>GST No</span>
                    <input className="ids-input" style={{ gridColumn: 'span 3' }} value={guestDetail.gstNo} onChange={(e) => setGuestDetail({ ...guestDetail, gstNo: e.target.value })} placeholder="GSTIN (e.g. 21AAAAA0000A1Z5)" />
                  </div>
                </div>
              )}

              {/* Bottom Room Category & Rates Matrix (Frame 008) */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '3px' }}>Tier Tariffs & Taxes Matrix</div>
                <table className="ids-grid-table" style={{ fontSize: '10px' }}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Single</th>
                      <th>Double</th>
                      <th>Tax</th>
                      <th>Exb Adt</th>
                      <th>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>DLX Room</td><td>3500</td><td>3500</td><td>798</td><td>1000</td><td>804</td></tr>
                    <tr><td>EXE Room</td><td>5000</td><td>5000</td><td>798</td><td>1000</td><td>804</td></tr>
                    <tr><td>PNH Room</td><td>7499</td><td>7499</td><td>798</td><td>1000</td><td>804</td></tr>
                    <tr style={{ background: '#FFF3CD' }}><td>SUI Room</td><td>6500</td><td>6500</td><td>798</td><td>1000</td><td>804</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Sub-Action Buttons */}
              <div style={{ marginTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button className="ids-btn-classic">Guest Note</button>
                <button className="ids-btn-classic">Documents</button>
                <button className="ids-btn-classic">Extra Charges</button>
                <button className="ids-btn-classic">Revenue Discount</button>
                <button className="ids-btn-classic">Trace</button>
                <button className="ids-btn-classic">Re-Confirm</button>
                <button className="ids-btn-classic" onClick={() => setReceiptsOpen(true)}>Deposits</button>
                <button className="ids-btn-classic">Audit</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Modals */}
      <IdsRateInformationModal 
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onConfirm={(rates) => {
          setTariffs(prev => ({
            ...prev,
            single: rates.singleTariff,
            double: rates.doubleTariff,
            extAdult: rates.extraAdult
          }));
          setRateModalOpen(false);
          if (parseFloat(rates.discPercent) > 0) {
            setReasonModalOpen(true);
          }
        }}
      />

      <IdsReasonEntryModal 
        isOpen={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={() => setReasonModalOpen(false)}
        reasonFor="DISCOUNT"
      />

      <IdsDuplicateGuestModal 
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        guestName={`${guests[0]?.lastName} ${guests[0]?.firstName}`}
      />

      <IdsPostSaveDialog 
        isOpen={postSaveOpen}
        onClose={() => setPostSaveOpen(false)}
        onOk={handlePostSaveOk}
        reservationNo="271"
      />

      <IdsPostReceiptsModal 
        isOpen={receiptsOpen}
        onClose={() => setReceiptsOpen(false)}
        onSave={handleReceiptsSave}
        reservationNo="271"
        guestName={`${guests[0]?.title} ${guests[0]?.lastName} ${guests[0]?.firstName}`}
        roomNo={guestDetail.roomNo || '101'}
      />
    </div>
  );
}
