import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, Users, Calendar, DollarSign, Clock, RefreshCw, 
  Phone, Briefcase, Box, Utensils, Clipboard, Wrench, Settings,
  LogOut, Play, Film, CheckCircle2, AlertCircle, Search, FileText
} from 'lucide-react';
import { IdsQuickReservationModal } from './IdsReservationForms';
import { IdsScanBookingModal, IdsAssignGuestRoomsModal } from './IdsAssignRoomsModal';
import IdsTutorialPlayerModal, { TUTORIAL_PLAYLIST_DATA } from './IdsTutorialPlayerModal';
import { HOTEL_CONFIG, ROOM_TIERS, INITIAL_ROOMS_INVENTORY } from '../../data/hotelData';

export default function IdsDesktopShell({ 
  rooms = INITIAL_ROOMS_INVENTORY, 
  bookings = [], 
  onExitPMS,
  onNewBooking 
}) {
  const [selectedMaster, setSelectedMaster] = useState('Reservations..');
  const [activeSubItem, setActiveSubItem] = useState('Room Booking');
  
  // Modals
  const [quickReservationOpen, setQuickReservationOpen] = useState(false);
  const [scanBookingModalOpen, setScanBookingModalOpen] = useState(false);
  const [assignRoomsModalOpen, setAssignRoomsModalOpen] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState(null);
  const [tutorialPlayerOpen, setTutorialPlayerOpen] = useState(false);
  const [selectedTutorialVideoId, setSelectedTutorialVideoId] = useState('01');
  const [activeTool, setActiveTool] = useState('front-office');

  // Real-time statistics computed from room & booking inventory
  const stats = useMemo(() => {
    const totalRooms = rooms.length || 27;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const dirtyRooms = rooms.filter(r => r.status === 'dirty' || r.status === 'cleaning').length;
    const availableRooms = totalRooms - occupiedRooms;
    const inhouseGuests = occupiedRooms * 2; // average 2 pax per occupied room

    return {
      expectedArrivals: 2,
      expectedDepartures: 1,
      checkInRooms: occupiedRooms > 0 ? occupiedRooms : 0,
      walkInRooms: 0,
      roomsToSell: availableRooms > 0 ? availableRooms : 56,
      registeredComplaints: 0,
      inhouseRoomsGuests: `${occupiedRooms || 14}/${inhouseGuests || 21}`,
      extraAdultChild: '0/0',
      inhouseForeigners: '0/0',
      guestBlocks: 2
    };
  }, [rooms]);

  // Master Menu Items (Frame 001 & 013)
  const masterMenuItems = [
    { id: 'Registrations..', label: 'Registrations..' },
    { id: 'Reservations..', label: 'Reservations..' },
    { id: 'Cashiering..', label: 'Cashiering..' },
    { id: 'Day End process..', label: 'Day End process..' },
    { id: 'Guest History..', label: 'Guest History..' },
    { id: 'House Keeping..', label: 'House Keeping..' },
    { id: 'Reports..', label: 'Reports..' },
    { id: 'Lookups..', label: 'Lookups..' },
    { id: 'SMS Setup..', label: 'SMS Setup..' },
    { id: 'Setup..', label: 'Setup..' }
  ];

  // Dynamic Submenus for each master category matching 44 videos
  const subMenuMap = {
    'Reservations..': [
      { label: 'Room Booking', videoId: '01', action: () => setQuickReservationOpen(true) },
      { label: 'Assign Guest Rooms', videoId: '02', action: () => setScanBookingModalOpen(true) },
      { label: 'Amend Booking', videoId: '03', action: () => openTutorial('03') },
      { label: 'Cancel Booking', videoId: '04', action: () => openTutorial('04') },
      { label: 'Room Type Booking', videoId: '01', action: () => setQuickReservationOpen(true) },
      { label: 'Room Rack Console', videoId: '02', action: () => setScanBookingModalOpen(true) },
      { label: 'Reserved Guest Messages', videoId: '01', action: () => openTutorial('01') },
      { label: 'Retentions-Cancel/No Show', videoId: '04', action: () => openTutorial('04') },
      { label: 'Close Room Inventory', videoId: '01', action: () => openTutorial('01') }
    ],
    'Registrations..': [
      { label: 'Express Check-in', videoId: '06', action: () => openTutorial('06') },
      { label: 'Reservation Check-in', videoId: '05', action: () => openTutorial('05') },
      { label: 'Walk-ins', videoId: '17', action: () => openTutorial('17') },
      { label: 'Special Rooms Checkin', videoId: '08', action: () => openTutorial('08') },
      { label: 'Room Floor Plan Display', videoId: '33', action: () => openTutorial('33') },
      { label: 'Guest Management', videoId: '10', action: () => openTutorial('10') },
      { label: 'Guest Services', videoId: '21', action: () => openTutorial('21') },
      { label: 'Guest Photo (In-House)', videoId: '10', action: () => openTutorial('10') },
      { label: 'Guest Photo Reg. Card', videoId: '10', action: () => openTutorial('10') },
      { label: 'Guest Reg Card (Crystal)', videoId: '35', action: () => openTutorial('35') },
      { label: 'Invoice by Arrival', videoId: '36', action: () => openTutorial('36') },
      { label: 'Mask Guests', videoId: '10', action: () => openTutorial('10') },
      { label: 'Turn Away / Walkout Guest', videoId: '04', action: () => openTutorial('04') },
      { label: 'Room Instructions', videoId: '10', action: () => openTutorial('10') },
      { label: 'Change Rate', videoId: '11', action: () => openTutorial('11') }
    ],
    'Cashiering..': [
      { label: 'Post Deposit / Advance to Room', videoId: '14', action: () => openTutorial('14') },
      { label: 'Checkout & Settle Front Office Bill (Split Bill)', videoId: '15', action: () => openTutorial('15') },
      { label: 'Bulk Check Out at Once (Group)', videoId: '16', action: () => openTutorial('16') },
      { label: 'Pax Check-Out', videoId: '18', action: () => openTutorial('18') },
      { label: 'Post Charges / Room Charges (Minibar/Laundry)', videoId: '21', action: () => openTutorial('21') },
      { label: 'Bill Allowance Day Wise', videoId: '23', action: () => openTutorial('23') },
      { label: 'Bill Allowance Option (Dispute Waiver)', videoId: '24', action: () => openTutorial('24') },
      { label: 'Transfer Folio to Another Room', videoId: '25', action: () => openTutorial('25') },
      { label: 'Folio Reinstate Option', videoId: '26', action: () => openTutorial('26') },
      { label: 'Release Stop Posting Option', videoId: '27', action: () => openTutorial('27') },
      { label: 'Paid-Out Excess Amount to Guest', videoId: '44', action: () => openTutorial('44') }
    ],
    'House Keeping..': [
      { label: 'Clear Dirty Room from Room Status', videoId: '09', action: () => openTutorial('09') },
      { label: 'Change Guest Details In-House', videoId: '10', action: () => openTutorial('10') },
      { label: 'Modify Guest Departure / Extension', videoId: '12', action: () => openTutorial('12') },
      { label: 'Room Transfer / Shift', videoId: '13', action: () => openTutorial('13') },
      { label: 'Add Room Numbers in Room Status', videoId: '33', action: () => openTutorial('33') },
      { label: 'Modify Room Master', videoId: '34', action: () => openTutorial('34') }
    ],
    'Day End process..': [
      { label: 'Night Audit Process (Midnight Rollover)', videoId: '19', action: () => openTutorial('19') },
      { label: 'Automatic Tariff Debiting', videoId: '19', action: () => openTutorial('19') },
      { label: 'Financial Day Close Lock', videoId: '19', action: () => openTutorial('19') }
    ],
    'Guest History..': [
      { label: 'Create Company Profile Master', videoId: '28', action: () => openTutorial('28') },
      { label: 'Create Company Contract Rates', videoId: '31', action: () => openTutorial('31') },
      { label: 'Link Company Rates to Bookings', videoId: '32', action: () => openTutorial('32') },
      { label: 'Add Company Details & GSTN After Check-out', videoId: '43', action: () => openTutorial('43') }
    ],
    'Reports..': [
      { label: 'Reprint Front Office Module Voucher', videoId: '35', action: () => openTutorial('35') },
      { label: 'Reprint Front Office Bill (Rule 46 GST)', videoId: '36', action: () => openTutorial('36') },
      { label: 'Foreign Exchange Entry (RBI Encashment)', videoId: '42', action: () => openTutorial('42') }
    ],
    'Setup..': [
      { label: 'Add Business Source (OTA/Direct/BTC)', videoId: '29', action: () => openTutorial('29') },
      { label: 'Add Market Segment (Corporate/FIT)', videoId: '30', action: () => openTutorial('30') },
      { label: 'Create / Sell Package Rates', videoId: '40', action: () => openTutorial('40') },
      { label: 'Multi Rate Option (Weekday vs Weekend)', videoId: '41', action: () => openTutorial('41') },
      { label: 'Additional Room Rate Option (Half-Day)', videoId: '20', action: () => openTutorial('20') },
      { label: 'Change Room Rate / Tariff Override', videoId: '11', action: () => openTutorial('11') }
    ],
    'Lookups..': [
      { label: 'Room Status Matrix Lookup', videoId: '09', action: () => openTutorial('09') },
      { label: 'Company Lookup Directory', videoId: '28', action: () => openTutorial('28') }
    ],
    'SMS Setup..': [
      { label: 'Guest Check-In SMS Gateway', videoId: '10', action: () => openTutorial('10') },
      { label: 'Bill Settlement SMS Template', videoId: '15', action: () => openTutorial('15') }
    ]
  };

  const openTutorial = (videoId) => {
    setSelectedTutorialVideoId(videoId);
    setTutorialPlayerOpen(true);
  };

  const currentSubList = subMenuMap[selectedMaster] || [];

  return (
    <div className="ids-desktop-container">
      {/* Master IDS Window */}
      <div className="ids-window">
        {/* Title Bar (Frame 001) */}
        <div className="ids-titlebar">
          <div className="ids-titlebar-left">
            <span className="ids-logo-badge">IDS</span>
            <span>FORTUNE NEXT V6.5.002.2 - {HOTEL_CONFIG.name}</span>
          </div>
          <div className="ids-titlebar-buttons">
            <button className="ids-win-btn" title="Minimize">_</button>
            <button className="ids-win-btn" title="Maximize">□</button>
            <button className="ids-win-btn close" title="Exit PMS" onClick={onExitPMS}>✕</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="ids-menubar">
          <div className="ids-menu-item">User</div>
          <div className="ids-menu-item">Info.</div>
          <div 
            className="ids-menu-item" 
            style={{ fontWeight: 700, color: '#0A246A', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setTutorialPlayerOpen(true)}
          >
            <Film size={12} />
            <span>Tutorial Videos (44 Screen Recordings)</span>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="ids-subbar">
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>BS/GN V(0)</span>
            <span>SP V(0)</span>
          </div>
          <div>IT ADMIN (FRONT DESK DUTY MANAGER)</div>
        </div>

        {/* Top Horizontal Icon Toolbar (12 Authentic Modules from Frame 001) */}
        <div className="ids-icon-toolbar">
          <button 
            className={`ids-tool-btn ${activeTool === 'front-office' ? 'active' : ''}`}
            title="Front Office (Reservations & Registrations)"
            onClick={() => { setActiveTool('front-office'); setSelectedMaster('Reservations..'); }}
          >
            <Building2 size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'cashier' ? 'active' : ''}`}
            title="Cashiering & POS"
            onClick={() => { setActiveTool('cashier'); setSelectedMaster('Cashiering..'); }}
          >
            <DollarSign size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'night-audit' ? 'active' : ''}`}
            title="Night Audit / Day End Process"
            onClick={() => { setActiveTool('night-audit'); setSelectedMaster('Day End process..'); }}
          >
            <RefreshCw size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'rooms' ? 'active' : ''}`}
            title="Housekeeping & Room Rack"
            onClick={() => { setActiveTool('rooms'); setSelectedMaster('House Keeping..'); }}
          >
            <Calendar size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'groups' ? 'active' : ''}`}
            title="Groups & Banquets"
            onClick={() => { setActiveTool('groups'); setSelectedMaster('Registrations..'); }}
          >
            <Users size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'telecom' ? 'active' : ''}`}
            title="EPABX / Telecom"
            onClick={() => { setActiveTool('telecom'); setSelectedMaster('SMS Setup..'); }}
          >
            <Phone size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'accounts' ? 'active' : ''}`}
            title="Financial Accounts & City Ledger"
            onClick={() => { setActiveTool('accounts'); setSelectedMaster('Guest History..'); }}
          >
            <Briefcase size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'store' ? 'active' : ''}`}
            title="Material Management / Store"
            onClick={() => { setActiveTool('store'); setSelectedMaster('Setup..'); }}
          >
            <Box size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'dining' ? 'active' : ''}`}
            title="Food & Beverage / Restaurant"
            onClick={() => { setActiveTool('dining'); setSelectedMaster('Reports..'); }}
          >
            <Utensils size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'hr' ? 'active' : ''}`}
            title="HR & Staff Register"
            onClick={() => { setActiveTool('hr'); setSelectedMaster('Lookups..'); }}
          >
            <Clipboard size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'maint' ? 'active' : ''}`}
            title="Maintenance & Engineering"
            onClick={() => { setActiveTool('maint'); setSelectedMaster('House Keeping..'); }}
          >
            <Wrench size={20} />
          </button>
          <button 
            className={`ids-tool-btn ${activeTool === 'setup' ? 'active' : ''}`}
            title="System Configuration & Setup"
            onClick={() => { setActiveTool('setup'); setSelectedMaster('Setup..'); }}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Main 3-Column Layout: Left Master | Middle Submenu | Right Statistics */}
        <div className="ids-main-layout">
          {/* Column 1: Left Master Menu */}
          <div className="ids-master-menu">
            <div className="ids-column-header">FRONT OFFICE</div>
            {masterMenuItems.map((item) => {
              const isSelected = selectedMaster === item.id;
              return (
                <div 
                  key={item.id}
                  className={`ids-master-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedMaster(item.id)}
                >
                  <span>{item.label}</span>
                  {isSelected && <span style={{ fontSize: '10px' }}>▶</span>}
                </div>
              );
            })}
          </div>

          {/* Column 2: Middle Submenu */}
          <div className="ids-submenu-panel">
            <div style={{ background: '#DFDBC9', padding: '6px 14px', borderBottom: '1px solid #B0AB9A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#0A246A', fontSize: '12px' }}>
                {selectedMaster.replace('..', '')} Workflows
              </span>
              <span style={{ fontSize: '10px', color: '#666' }}>
                {currentSubList.length} Options Available
              </span>
            </div>

            {currentSubList.map((sub, idx) => {
              const isSubActive = activeSubItem === sub.label;
              return (
                <div 
                  key={idx}
                  className={`ids-submenu-item ${isSubActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSubItem(sub.label);
                    if (sub.action) sub.action();
                  }}
                >
                  <span style={{ flex: 1 }}>{sub.label}</span>
                  {sub.videoId && (
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        background: '#ECE9D8', 
                        color: '#333', 
                        padding: '1px 6px', 
                        borderRadius: '2px', 
                        border: '1px solid #B0AB9A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title={`Video ${sub.videoId} Screen Recording`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openTutorial(sub.videoId);
                      }}
                    >
                      <Film size={10} color="#BD5317" />
                      <span>Vid {sub.videoId}</span>
                    </span>
                  )}
                </div>
              );
            })}

            {/* Quick Helper Banner */}
            <div style={{ marginTop: 'auto', padding: '12px', background: '#F5F3EB', borderTop: '1px solid #D5D1BD', fontSize: '11px', color: '#555' }}>
              <div style={{ fontWeight: 700, color: '#333', marginBottom: '4px' }}>💡 Quick Action:</div>
              <div>Click <strong>Room Booking</strong> to open the full Quick & Detailed Reservation modal with meal plans, rate information, and advance receipts!</div>
            </div>
          </div>

          {/* Column 3: Right Statistics KPI Panel (Frame 001 & 013) */}
          <div className="ids-statistics-panel">
            <div className="ids-column-header">Statistics</div>
            <div className="ids-stat-grid">
              {/* Row 1 */}
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.expectedArrivals}</div>
                <div className="ids-stat-lbl">Expected<br />Arrivals</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.expectedDepartures}</div>
                <div className="ids-stat-lbl">Expected<br />Departures</div>
              </div>

              {/* Row 2 */}
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.checkInRooms}</div>
                <div className="ids-stat-lbl">Check-in Rooms</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.walkInRooms}</div>
                <div className="ids-stat-lbl">Walk-in Rooms</div>
              </div>

              {/* Row 3 */}
              <div className="ids-stat-card">
                <div className="ids-stat-val green">{stats.roomsToSell}</div>
                <div className="ids-stat-lbl">Rooms to sell</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.registeredComplaints}</div>
                <div className="ids-stat-lbl">Registered<br />complaint</div>
              </div>

              {/* Row 4 */}
              <div className="ids-stat-card">
                <div className="ids-stat-val orange">{stats.inhouseRoomsGuests}</div>
                <div className="ids-stat-lbl">Inhouse<br />Rooms/Guests</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.extraAdultChild}</div>
                <div className="ids-stat-lbl">Extra<br />Adult/Child</div>
              </div>

              {/* Row 5 */}
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.inhouseForeigners}</div>
                <div className="ids-stat-lbl">Inhouse Forgn.<br />Rooms/Guests</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.guestBlocks}</div>
                <div className="ids-stat-lbl">Guest Block</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Command Strip (Frame 001 & 013) */}
        <div className="ids-bottom-commands">
          <button className="ids-btn-classic">Sys Update</button>
          <button className="ids-btn-classic">HotKey</button>
          <button className="ids-btn-classic">Other</button>
          <button className="ids-btn-classic">Events</button>
          <button className="ids-btn-classic">Last Updated</button>
          <button className="ids-btn-classic">To-Do</button>
          <button className="ids-btn-classic">GI</button>
          <button className="ids-btn-classic">Load Pgm</button>
          <button 
            className="ids-btn-classic" 
            style={{ marginLeft: '12px', background: '#D9534F', color: '#FFF', border: '2px outset #E0706D' }}
            onClick={onExitPMS}
          >
            Exit to Website
          </button>
        </div>
      </div>

      {/* Quick Reservation & Detailed Reservation Window (Video 01) */}
      <IdsQuickReservationModal 
        isOpen={quickReservationOpen}
        onClose={() => setQuickReservationOpen(false)}
        rooms={rooms}
        onSuccessBooking={(bookingData) => {
          if (onNewBooking) onNewBooking(bookingData);
          alert(`✅ Reservation #${bookingData.reservationNo} confirmed for ${bookingData.guestName}!`);
        }}
      />

      {/* Video 02: Scan Booking Modal (Frame 004) */}
      <IdsScanBookingModal 
        isOpen={scanBookingModalOpen}
        onClose={() => setScanBookingModalOpen(false)}
        onSelectBooking={(b) => {
          setSelectedBookingForAssignment(b);
          setScanBookingModalOpen(false);
          setAssignRoomsModalOpen(true);
        }}
      />

      {/* Video 02: Assign Guest Rooms Modal (Frame 006) */}
      {selectedBookingForAssignment && (
        <IdsAssignGuestRoomsModal 
          isOpen={assignRoomsModalOpen}
          onClose={() => setAssignRoomsModalOpen(false)}
          booking={selectedBookingForAssignment}
          onConfirmAssignment={(data) => {
            setAssignRoomsModalOpen(false);
          }}
        />
      )}

      {/* Built-In 44-Video Tutorial Player Modal */}
      <IdsTutorialPlayerModal 
        isOpen={tutorialPlayerOpen}
        onClose={() => setTutorialPlayerOpen(false)}
        initialVideoId={selectedTutorialVideoId}
      />
    </div>
  );
}
