import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, Users, Calendar, DollarSign, Clock, RefreshCw, 
  Phone, Briefcase, Box, Utensils, Clipboard, Wrench, Settings,
  LogOut, Play, Film, CheckCircle2, AlertCircle, Search, FileText
} from 'lucide-react';
import { IdsQuickReservationModal } from './IdsReservationForms';
import { IdsScanBookingModal, IdsAssignGuestRoomsModal } from './IdsAssignRoomsModal';
import { 
  IdsCancelBookingDialog, 
  IdsDepositWarningDialog, 
  IdsDepositRefundModal, 
  IdsCancelReasonModal, 
  IdsBlockedRoomWarningDialog, 
  IdsCancelVoucherPromptDialog, 
  IdsCancellationVoucherModal 
} from './IdsCancelBookingModal';
import { 
  IdsReservationCheckinPromptModal, 
  IdsCheckinGuestListModal, 
  IdsCheckInRegistrationModal, 
  IdsCheckedInPositionModal, 
  IdsRoomRackConsoleModal 
} from './IdsCheckInForms';
import IdsExpressCheckInModal from './IdsExpressCheckInModal';
import IdsClearRoomsModal from './IdsClearRoomsModal';
import IdsQuickScanModal from './IdsQuickScanModal';
import { 
  IdsGuestManagementModal, 
  IdsRoomHelpLookupModal, 
  IdsChangeGuestInfoModal, 
  IdsGuestInformationModal, 
  INITIAL_INHOUSE_GUESTS 
} from './IdsGuestManagementModal';
import IdsChangeRateModal, { DEFAULT_ROOM_TARIFFS } from './IdsChangeRateModal';
import IdsAmendStayModal from './IdsAmendStayModal';
import IdsRoomTransferModal from './IdsRoomTransferModal';
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
  
  // Dynamic Live Reservations List matching Videos 01, 02, 03 & 04
  const [reservations, setReservations] = useState([
    { 
      resNo: '270', 
      title: 'Mr', 
      guestName: 'Biswakarma Santosh', 
      companyName: 'Quality Pharma Products Pvt Ltd.', 
      companyCode: 'COM0009', 
      roomNo: '515', 
      type: 'EXE', 
      confirm: '1+0+0', 
      provisional: '0+0+0', 
      pax: '1+0+0', 
      arrivalDate: '14-JAN-2022 20:07', 
      departureDate: '17-JAN-2022 12:00', 
      depositAmount: 2000, 
      status: 'Repeat Guest', 
      blocked: true,
      isCancelled: false 
    },
    { 
      resNo: '271', 
      title: 'Mr', 
      guestName: 'Biswakarma Santosh', 
      companyName: 'Mahindra & Mahindra Limited', 
      companyCode: 'COM0007', 
      roomNo: '516', 
      type: 'SUI', 
      confirm: '0+1+0', 
      provisional: '0+0+0', 
      pax: '2+0+0', 
      arrivalDate: '14-JAN-2022 19:56', 
      departureDate: '16-JAN-2022 12:00', 
      depositAmount: 0, 
      status: 'VIP', 
      blocked: true,
      isCancelled: false 
    },
    { 
      resNo: '274', 
      title: 'Mr', 
      guestName: 'Khan Pravez', 
      companyName: 'Corporate FIT', 
      companyCode: 'COM0005', 
      roomNo: '401', 
      type: 'EXE', 
      confirm: '1+0+0', 
      provisional: '0+0+0', 
      pax: '2+0+0', 
      arrivalDate: '16-JAN-2022 14:00', 
      departureDate: '18-JAN-2022 12:00', 
      depositAmount: 0, 
      status: 'Confirmed', 
      blocked: true,
      isCancelled: false 
    },
    { 
      resNo: '276', 
      title: 'Mr', 
      guestName: 'Anil Kumar Group', 
      contactPerson: 'Mr. Anil Kumar',
      booker: 'Mr Sharma',
      groupCode: '003',
      groupName: 'Anil Kumar Group',
      companyName: 'Varun Beverages Ltd', 
      companyCode: 'COM0003', 
      roomNo: '415, 501, 515', 
      rooms: ['415', '501', '515'],
      type: 'EXE', 
      confirm: '0+5+0', 
      provisional: '0+0+0', 
      pax: '10+3+0', 
      arrivalDate: '16-JAN-2022 14:00', 
      departureDate: '18-JAN-2022 12:00', 
      depositAmount: 0, 
      rate: '4,250.00',
      status: 'Confirmed Group', 
      blocked: false,
      isCancelled: false,
      isGroup: true
    },
    { 
      resNo: '269', 
      title: 'Mr', 
      guestName: 'P Ashok', 
      companyName: 'Linde India Ltd', 
      companyCode: 'COM0004', 
      roomNo: '201', 
      type: 'DLX', 
      confirm: '1+0+0', 
      provisional: '0+0+0', 
      pax: '1+0+0', 
      arrivalDate: '14-JAN-2022 14:00', 
      departureDate: '15-JAN-2022 12:00', 
      depositAmount: 1500, 
      status: 'Checked In', 
      blocked: false,
      isCancelled: false 
    },
    { 
      resNo: '268', 
      title: 'Mrs', 
      guestName: 'Anjali Sharma', 
      companyName: 'Direct FIT', 
      companyCode: '', 
      roomNo: '', 
      type: 'DLX', 
      confirm: '0+0+0', 
      provisional: '1+0+0', 
      pax: '2+0+0', 
      arrivalDate: '15-JAN-2022 12:00', 
      departureDate: '18-JAN-2022 12:00', 
      depositAmount: 0, 
      status: 'Waitlist', 
      blocked: false,
      isCancelled: false 
    }
  ]);

  // Modals & Navigation
  const [quickReservationOpen, setQuickReservationOpen] = useState(false);
  const [quickReservationCancelOpen, setQuickReservationCancelOpen] = useState(false);
  const [scanBookingModalOpen, setScanBookingModalOpen] = useState(false);
  const [scanPurpose, setScanPurpose] = useState('assign'); // 'assign' | 'amend' | 'cancel'
  const [assignRoomsModalOpen, setAssignRoomsModalOpen] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState(null);
  const [amendBookingModalOpen, setAmendBookingModalOpen] = useState(false);
  const [selectedBookingForAmend, setSelectedBookingForAmend] = useState(null);
  const [tutorialPlayerOpen, setTutorialPlayerOpen] = useState(false);
  const [selectedTutorialVideoId, setSelectedTutorialVideoId] = useState('01');
  const [activeTool, setActiveTool] = useState('front-office');

  // Video 04: Cancel Workflow States
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [depositWarningOpen, setDepositWarningOpen] = useState(false);
  const [depositRefundOpen, setDepositRefundOpen] = useState(false);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [blockedRoomWarningOpen, setBlockedRoomWarningOpen] = useState(false);
  const [cancelVoucherPromptOpen, setCancelVoucherPromptOpen] = useState(false);
  const [cancellationVoucherOpen, setCancellationVoucherOpen] = useState(false);
  const [completedCancelRecord, setCompletedCancelRecord] = useState(null);
  const [cancellationContext, setCancellationContext] = useState({});

  // Video 05 & 06: Check-In Workflow States
  const [checkinPromptOpen, setCheckinPromptOpen] = useState(false);
  const [selectedBookingForCheckin, setSelectedBookingForCheckin] = useState(null);
  const [checkinGuestListOpen, setCheckinGuestListOpen] = useState(false);
  const [checkInRegistrationOpen, setCheckInRegistrationOpen] = useState(false);
  const [checkedInList, setCheckedInList] = useState([]);
  const [detailedPositionOpen, setDetailedPositionOpen] = useState(false);
  const [roomRackConsoleOpen, setRoomRackConsoleOpen] = useState(false);
  const [expressCheckInOpen, setExpressCheckInOpen] = useState(false);

  // Video 09: Clear Rooms & Quick Scan States (Frames 012–060)
  const [clearRoomsModalOpen, setClearRoomsModalOpen] = useState(false);
  const [quickScanModalOpen, setQuickScanModalOpen] = useState(false);
  const [clearedDirtyRooms, setClearedDirtyRooms] = useState([]);

  // Video 10: Guest Management & Change Guest Details States (Frames 008–072)
  const [guestManagementOpen, setGuestManagementOpen] = useState(false);
  const [roomHelpLookupOpen, setRoomHelpLookupOpen] = useState(false);
  const [changeGuestInfoOpen, setChangeGuestInfoOpen] = useState(false);
  const [guestInformationModalOpen, setGuestInformationModalOpen] = useState(false);
  const [inhouseGuestsList, setInhouseGuestsList] = useState(INITIAL_INHOUSE_GUESTS);
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState(INITIAL_INHOUSE_GUESTS[0]);
  
  // Video 11: Change Room Rate / Change Tariff States (Frames 024–048)
  const [changeRateModalOpen, setChangeRateModalOpen] = useState(false);
  const [selectedRoomForRate, setSelectedRoomForRate] = useState('312');
  const [roomTariffs, setRoomTariffs] = useState(DEFAULT_ROOM_TARIFFS);

  // Video 12: Modify Guest Departure / Amend Stay States (Frames 018–045)
  const [amendStayModalOpen, setAmendStayModalOpen] = useState(false);
  const [selectedRoomForAmendStay, setSelectedRoomForAmendStay] = useState('301');
  const [amendedDepartures, setAmendedDepartures] = useState({});

  // Video 13: Room Transfer / Shift States (Frames 009–031)
  const [roomTransferModalOpen, setRoomTransferModalOpen] = useState(false);
  const [selectedRoomForTransfer, setSelectedRoomForTransfer] = useState('415');
  const [transferredRooms, setTransferredRooms] = useState({});

  // Real-time statistics computed dynamically (Frame 004, 030, Video 06 Frame 028, Video 07 Frame 040 & 060, Video 08 Frame 008 & 058, Video 12 Frames 022 & 035 sync)
  const stats = useMemo(() => {
    const has316CheckedIn = checkedInList.some(c => c.roomNo === '316');
    const hasGroupCheckedIn = checkedInList.some(c => c.resNo === '276');
    const has401CheckedIn = checkedInList.some(c => c.roomNo === '401');
    const has301Amended = !!amendedDepartures['301'];
    const checkedInCount = checkedInList.length;

    // Video 12 Frame 022 & Frame 035: If Room 301 departure is extended, Expected Departures drops from 17 to 16, Rooms to sell drops from 40 to 39.
    if (has301Amended || Object.keys(amendedDepartures).length > 0) {
      return {
        expectedArrivals: 0,
        expectedDepartures: 16,
        checkInRooms: 0,
        walkInRooms: 0,
        roomsToSell: 39,
        registeredComplaints: 0,
        inhouseRoomsGuests: '34/61',
        extraAdultChild: '0/0',
        inhouseForeigners: '0/0',
        guestBlocks: 0
      };
    }

    // Video 11 Frame 010 & Video 12 Frame 010 baseline
    if (inhouseGuestsList.length >= 10) {
      return {
        expectedArrivals: 0,
        expectedDepartures: 17,
        checkInRooms: 0,
        walkInRooms: 0,
        roomsToSell: 40,
        registeredComplaints: 0,
        inhouseRoomsGuests: '34/61',
        extraAdultChild: '0/0',
        inhouseForeigners: '0/0',
        guestBlocks: 0
      };
    }

    let expectedArrivals = 7;
    let roomsToSell = 36;
    let checkInRooms = 1;
    let inhouseRoomsGuests = '16/25';

    if (has316CheckedIn) {
      expectedArrivals = 3;
      roomsToSell = 36;
      checkInRooms = 19;
      inhouseRoomsGuests = '34/61';
    } else if (hasGroupCheckedIn && has401CheckedIn) {
      expectedArrivals = 3;
      roomsToSell = 47;
      checkInRooms = 5;
      inhouseRoomsGuests = '20/33';
    } else if (hasGroupCheckedIn) {
      expectedArrivals = 4;
      roomsToSell = 36;
      checkInRooms = 18;
      inhouseRoomsGuests = '33/59';
    } else if (has401CheckedIn) {
      expectedArrivals = 6;
      roomsToSell = 51;
      checkInRooms = 2;
      inhouseRoomsGuests = '17/27';
    } else if (checkedInCount === 0) {
      expectedArrivals = 7;
      roomsToSell = 36;
      checkInRooms = 1;
      inhouseRoomsGuests = '16/25';
    }

    return {
      expectedArrivals,
      expectedDepartures: 2,
      checkInRooms,
      walkInRooms: 0,
      roomsToSell,
      registeredComplaints: 0,
      inhouseRoomsGuests,
      extraAdultChild: '0/0',
      inhouseForeigners: '0/0',
      guestBlocks: has401CheckedIn ? 0 : 1
    };
  }, [reservations, checkedInList, inhouseGuestsList, amendedDepartures]);

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
      { label: 'Group Room Booking', videoId: '07', action: () => setQuickReservationOpen(true) },
      { 
        label: 'Assign Guest Rooms', 
        videoId: '02', 
        action: () => {
          setScanPurpose('assign');
          setScanBookingModalOpen(true);
        } 
      },
      { 
        label: 'Amend Booking', 
        videoId: '03', 
        action: () => {
          setScanPurpose('amend');
          setScanBookingModalOpen(true);
        } 
      },
      { 
        label: 'Cancel Booking', 
        videoId: '04', 
        action: () => {
          setScanPurpose('cancel');
          setScanBookingModalOpen(true);
        } 
      },
      { label: 'Room Type Booking', videoId: '01', action: () => setQuickReservationOpen(true) },
      { 
        label: 'Room Rack Console', 
        videoId: '02', 
        action: () => setRoomRackConsoleOpen(true) 
      },
      { label: 'Reserved Guest Messages', videoId: '01', action: () => openTutorial('01') },
      { 
        label: 'Retentions-Cancel/No Show', 
        videoId: '04', 
        action: () => {
          setScanPurpose('cancel');
          setScanBookingModalOpen(true);
        } 
      },
      { label: 'Close Room Inventory', videoId: '01', action: () => openTutorial('01') }
    ],
    'Registrations..': [
      { label: 'Express Check-in', videoId: '06', action: () => setExpressCheckInOpen(true) },
      { label: 'Group Express Check-in', videoId: '07', action: () => setExpressCheckInOpen(true) },
      { label: 'Upgrade Room Express Check-in', videoId: '08', action: () => setExpressCheckInOpen(true) },
      { 
        label: 'Reservation Check-in', 
        videoId: '05', 
        action: () => {
          setScanPurpose('checkin');
          setScanBookingModalOpen(true);
        } 
      },
      { label: 'Walk-ins', videoId: '17', action: () => openTutorial('17') },
      { label: 'Special Rooms Checkin', videoId: '08', action: () => openTutorial('08') },
      { label: 'Room Floor Plan Display', videoId: '33', action: () => openTutorial('33') },
      { label: 'Guest Management', videoId: '10', action: () => setGuestManagementOpen(true) },
      { label: 'Guest Services', videoId: '21', action: () => openTutorial('21') },
      { label: 'Guest Photo (In-House)', videoId: '10', action: () => setRoomHelpLookupOpen(true) },
      { label: 'Guest Photo Reg. Card', videoId: '10', action: () => setRoomHelpLookupOpen(true) },
      { label: 'Guest Reg Card (Crystal)', videoId: '35', action: () => openTutorial('35') },
      { label: 'Invoice by Arrival', videoId: '36', action: () => openTutorial('36') },
      { label: 'Mask Guests', videoId: '10', action: () => openTutorial('10') },
      { label: 'Turn Away / Walkout Guest', videoId: '04', action: () => openTutorial('04') },
      { label: 'Room Instructions', videoId: '10', action: () => openTutorial('10') },
      { 
        label: 'Change Rate', 
        videoId: '11', 
        action: () => {
          setSelectedRoomForRate('312');
          setChangeRateModalOpen(true);
        } 
      }
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
      { label: 'House Keeping Room Status', videoId: '09', action: () => setRoomRackConsoleOpen(true) },
      { label: 'Clear Dirty Room from Room Status', videoId: '09', action: () => setClearRoomsModalOpen(true) },
      { 
        label: 'Change Guest Details In-House', 
        videoId: '10', 
        action: () => {
          setSelectedGuestForEdit(inhouseGuestsList.find(g => g.roomNo === '301') || inhouseGuestsList[0]);
          setChangeGuestInfoOpen(true);
        } 
      },
      { 
        label: 'Modify Guest Departure / Extension', 
        videoId: '12', 
        action: () => {
          setSelectedRoomForAmendStay('301');
          setAmendStayModalOpen(true);
        } 
      },
      { 
        label: 'Room Transfer / Shift', 
        videoId: '13', 
        action: () => {
          setSelectedRoomForTransfer('415');
          setRoomTransferModalOpen(true);
        } 
      },
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
      { 
        label: 'Change Room Rate / Tariff Override', 
        videoId: '11', 
        action: () => {
          setSelectedRoomForRate('312');
          setChangeRateModalOpen(true);
        } 
      }
    ],
    'Lookups..': [
      { label: 'Room Status', videoId: '09', action: () => setRoomRackConsoleOpen(true) },
      { label: 'Clear Rooms Program', videoId: '09', action: () => setClearRoomsModalOpen(true) },
      { label: 'Room Status Matrix Lookup', videoId: '09', action: () => setRoomRackConsoleOpen(true) },
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

  // Video 04: Cancel Workflow Handlers
  const handleInitiateCancel = (b) => {
    setSelectedBookingForCancel(b);
    setCancellationContext({
      booking: b,
      depositAmount: b.depositAmount || 0,
      refundMode: 'Refund Amount',
      payMode: 'Cash',
      refundAmount: b.depositAmount || 0,
      retentionCharges: 0,
      reason: 'Cancelled by Customer',
      authorizedBy: 'Manager',
      callerDetails: `${b.title || 'Mr'} ${b.guestName}`,
      mobileNumber: '1234567890'
    });
    setQuickReservationCancelOpen(true);
    setCancelBookingModalOpen(true);
  };

  const handleCancelProceed = ({ cancelYes }) => {
    if (cancelYes === 'No') {
      setCancelBookingModalOpen(false);
      setQuickReservationCancelOpen(false);
      return;
    }
    setCancelBookingModalOpen(false);
    if ((selectedBookingForCancel?.depositAmount || 0) > 0) {
      setDepositWarningOpen(true);
    } else {
      setCancelReasonOpen(true);
    }
  };

  const handleRefundConfirm = (refundData) => {
    setCancellationContext(prev => ({
      ...prev,
      refundMode: refundData.refundMode,
      payMode: refundData.payMode,
      refundAmount: refundData.refundMode === 'Refund Amount' ? refundData.amount : 0,
      retentionCharges: refundData.refundMode === 'Retention Charges' ? refundData.amount : 0,
      refundReason: refundData.reason
    }));
    setDepositRefundOpen(false);
    setCancelReasonOpen(true);
  };

  const handleReasonConfirm = (reasonData) => {
    setCancellationContext(prev => ({
      ...prev,
      reason: reasonData.reason,
      authorizedBy: reasonData.authorizedBy,
      callerDetails: reasonData.callerDetails,
      mobileNumber: reasonData.mobileNumber
    }));
    setCancelReasonOpen(false);
    if (selectedBookingForCancel?.roomNo || selectedBookingForCancel?.blocked) {
      setBlockedRoomWarningOpen(true);
    } else {
      setCancelVoucherPromptOpen(true);
    }
  };

  const handleExecuteCancellation = (shouldPrintVoucher) => {
    const finalRecord = {
      cancellationNo: `CAN-2022-0${selectedBookingForCancel?.resNo || '270'}`,
      resNo: selectedBookingForCancel?.resNo || '270',
      title: selectedBookingForCancel?.title || 'Mr',
      guestName: selectedBookingForCancel?.guestName || 'Biswakarma Santosh',
      companyName: selectedBookingForCancel?.companyName || 'Quality Pharma Products Pvt Ltd.',
      type: selectedBookingForCancel?.type || 'EXE',
      roomNo: selectedBookingForCancel?.roomNo || '515',
      arrivalDate: selectedBookingForCancel?.arrivalDate || '14-JAN-2022',
      departureDate: selectedBookingForCancel?.departureDate || '17-JAN-2022',
      depositAmount: selectedBookingForCancel?.depositAmount || 2000,
      refundAmount: cancellationContext.refundAmount ?? 2000,
      retentionCharges: cancellationContext.retentionCharges ?? 0,
      payMode: cancellationContext.payMode || 'CASH',
      reason: cancellationContext.reason || 'Cancelled by Customer',
      authorizedBy: cancellationContext.authorizedBy || 'Manager',
      callerDetails: cancellationContext.callerDetails || 'Mr Biswakarma Santosh',
      mobileNumber: cancellationContext.mobileNumber || '1234567890'
    };

    setCompletedCancelRecord(finalRecord);

    // Update reservations state (release room & mark cancelled)
    setReservations(prev => prev.map(r => {
      if (r.resNo === selectedBookingForCancel?.resNo) {
        return {
          ...r,
          isCancelled: true,
          status: 'Cancelled',
          blocked: false,
          roomNo: ''
        };
      }
      return r;
    }));

    if (shouldPrintVoucher) {
      setCancellationVoucherOpen(true);
    }
    setQuickReservationCancelOpen(false);
  };

  // Video 05: Check-In Workflow Handlers
  const handleInitiateCheckin = (b) => {
    setSelectedBookingForCheckin(b);
    setCheckinPromptOpen(true);
  };

  const handleConfirmCheckinPrompt = () => {
    setCheckinPromptOpen(false);
    setCheckinGuestListOpen(true);
  };

  const handleSelectGuestForRegistration = (guest, idx) => {
    setCheckinGuestListOpen(false);
    setCheckInRegistrationOpen(true);
  };

  const handleCompleteCheckIn = (checkInData) => {
    setCheckInRegistrationOpen(false);
    const checkedInRecord = {
      resNo: checkInData.resNo || '271',
      roomNo: checkInData.roomNo || '516',
      regNo: checkInData.regNo || '581',
      type: selectedBookingForCheckin?.type || 'SUI',
      guestName: `${checkInData.guest1?.title || 'Mr'} ${checkInData.guest1?.lastName || 'Biswakarma'} ${checkInData.guest1?.firstName || 'Santosh'}`,
      companyName: selectedBookingForCheckin?.companyName || 'Mahindra & Mahindra Limited',
      rate: checkInData.rate || '6,500.00',
      planAmt: checkInData.planAmt || '700.00',
      arrivalDate: checkInData.arrivalDate || '14-JAN-2022',
      departureDate: checkInData.departureDate || '16-JAN-2022',
      nation: 'IND',
      user: 'MANAGER',
      totalGuests: checkInData.totalGuests || 2
    };

    setCheckedInList(prev => [checkedInRecord, ...prev]);

    // Update reservations state: mark as checked in, remove from pending arrivals, unblock
    setReservations(prev => prev.map(r => {
      if (r.resNo === checkInData.resNo) {
        return {
          ...r,
          isCheckedIn: true,
          status: 'Checked In',
          blocked: false
        };
      }
      return r;
    }));
  };

  // Video 06: Express Check-In Workflow Handlers
  const handleCompleteExpressCheckin = (data) => {
    const record = {
      resNo: data.resNo || '274',
      roomNo: data.roomNo || '401',
      regNo: data.regNo1 || '585',
      type: data.type || 'EXE',
      guestName: `${data.guest1?.title || 'Mr'} ${data.guest1?.name || 'Khan Pravez'}`,
      companyName: 'Corporate FIT',
      rate: data.rate || '4,500.00',
      planAmt: data.planAmt || '500.00',
      arrivalDate: data.arrivalDate || '16-JAN-2022',
      departureDate: data.departureDate || '18-JAN-2022',
      nation: 'IND',
      user: 'MANAGER',
      totalGuests: data.pax || 2
    };

    setCheckedInList(prev => [record, ...prev]);

    setReservations(prev => prev.map(r => {
      if (r.resNo === data.resNo) {
        return {
          ...r,
          isCheckedIn: true,
          status: 'Checked In',
          blocked: false,
          roomNo: data.roomNo
        };
      }
      return r;
    }));
  };

  // Video 07: Group Express Check-In Workflow Handler
  const handleCompleteGroupCheckin = (data) => {
    const rooms = data.rooms || ['415', '501', '515'];
    const newRecords = [
      {
        resNo: data.resNo || '276',
        roomNo: '415',
        regNo: '613',
        type: data.type || 'EXE',
        guestName: 'Kumar Anil',
        companyName: data.company || 'COM0003 - Varun Beverages Ltd',
        rate: '4,250.00',
        planAmt: '0.00',
        arrivalDate: data.arrivalDate || '16-JAN-2022',
        departureDate: data.departureDate || '18-JAN-2022',
        nation: 'IND',
        user: 'MANAGER',
        totalGuests: 2
      },
      {
        resNo: data.resNo || '276',
        roomNo: '501',
        regNo: '615',
        type: data.type || 'EXE',
        guestName: 'Anil Kumar Group',
        companyName: data.company || 'COM0003 - Varun Beverages Ltd',
        rate: '4,250.00',
        planAmt: '0.00',
        arrivalDate: data.arrivalDate || '16-JAN-2022',
        departureDate: data.departureDate || '18-JAN-2022',
        nation: 'IND',
        user: 'MANAGER',
        totalGuests: 2
      },
      {
        resNo: data.resNo || '276',
        roomNo: '515',
        regNo: '617',
        type: data.type || 'EXE',
        guestName: 'Anil Kumar Group',
        companyName: data.company || 'COM0003 - Varun Beverages Ltd',
        rate: '4,250.00',
        planAmt: '0.00',
        arrivalDate: data.arrivalDate || '16-JAN-2022',
        departureDate: data.departureDate || '18-JAN-2022',
        nation: 'IND',
        user: 'MANAGER',
        totalGuests: 2
      }
    ];

    setCheckedInList(prev => [...newRecords, ...prev]);

    setReservations(prev => prev.map(r => {
      if (r.resNo === (data.resNo || '276')) {
        return {
          ...r,
          isCheckedIn: true,
          status: 'Checked In',
          blocked: false,
          rooms: rooms
        };
      }
      return r;
    }));
  };

  // Video 08: Room Category Upgrade Express Check-In Workflow Handler
  const handleCompleteUpgradeCheckin = (data) => {
    const record = {
      resNo: data.resNo || '276',
      roomNo: data.roomNo || '316',
      regNo: data.regNo || '619',
      type: data.roomType || 'SUI',
      guestName: data.guestName || 'Anil Kumar Group',
      companyName: data.company || 'COM0003 - Varun Beverages Ltd',
      rate: data.rate || '4,250.00',
      planAmt: '0.00',
      arrivalDate: data.arrivalDate || '16-JAN-2022',
      departureDate: data.departureDate || '18-JAN-2022',
      nation: 'IND',
      user: 'MANAGER',
      totalGuests: 2,
      isUpgrade: true,
      upgradeCategory: data.roomType || 'SUI',
      bookedCategory: data.bookedType || 'EXE',
      authorisedBy: data.authorisedBy || 'Manager',
      remarks: data.remarks || 'Executive'
    };

    setCheckedInList(prev => [record, ...prev]);

    setReservations(prev => prev.map(r => {
      if (r.resNo === (data.resNo || '276')) {
        return {
          ...r,
          isCheckedIn: true,
          status: 'Checked In',
          blocked: false,
          roomNo: '316',
          category: 'SUI'
        };
      }
      return r;
    }));
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
              <div 
                className="ids-stat-card"
                style={{ cursor: 'pointer' }}
                title="Click to view Detailed Position - Already checked-in (Frame 032)"
                onClick={() => setDetailedPositionOpen(true)}
              >
                <div className="ids-stat-val" style={{ color: stats.checkInRooms > 0 ? '#0066CC' : 'inherit' }}>
                  {stats.checkInRooms}
                </div>
                <div className="ids-stat-lbl">Check-in Rooms</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.walkInRooms}</div>
                <div className="ids-stat-lbl">Walk-in Rooms</div>
              </div>

              {/* Row 3 */}
              <div 
                className="ids-stat-card"
                style={{ cursor: 'pointer' }}
                title="Click to view Room Status Rack Console (Frame 034)"
                onClick={() => setRoomRackConsoleOpen(true)}
              >
                <div className="ids-stat-val green">{stats.roomsToSell}</div>
                <div className="ids-stat-lbl">Rooms to sell</div>
              </div>
              <div className="ids-stat-card">
                <div className="ids-stat-val">{stats.registeredComplaints}</div>
                <div className="ids-stat-lbl">Registered<br />complaint</div>
              </div>

              {/* Row 4 */}
              <div 
                className="ids-stat-card"
                style={{ cursor: 'pointer' }}
                title="Click to view Room Status Rack Console (Frame 034)"
                onClick={() => setRoomRackConsoleOpen(true)}
              >
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
          <button 
            className="ids-btn-classic"
            onClick={() => setGuestInformationModalOpen(true)}
            title="Guest Information Lookup (Video 10 Frame 068)"
          >
            GI
          </button>
          <button 
            className="ids-btn-classic" 
            onClick={() => setQuickScanModalOpen(true)}
            title="Quick Scan / Load Pgm (Video 09)"
          >
            Load Pgm
          </button>
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
        mode="make"
        onOpenScanBooking={(purpose) => {
          setScanPurpose(purpose);
          setScanBookingModalOpen(true);
        }}
        onOpenCancelBooking={(b) => {
          setQuickReservationOpen(false);
          handleInitiateCancel(b);
        }}
        onSuccessBooking={(bookingData) => {
          if (bookingData.isGroup) {
            setReservations(prev => [
              {
                resNo: bookingData.reservationNo || '276',
                title: 'Mr',
                guestName: bookingData.guestName || 'Anil Kumar Group',
                contactPerson: bookingData.contactPerson || 'Mr. Anil Kumar',
                booker: bookingData.booker || 'Mr Sharma',
                groupCode: bookingData.groupCode || '003',
                groupName: bookingData.groupName || 'Anil Kumar Group',
                companyName: bookingData.company || 'Varun Beverages Ltd',
                companyCode: bookingData.companyCode || 'COM0003',
                roomNo: '415, 501, 515',
                rooms: ['415', '501', '515'],
                type: 'EXE',
                confirm: '0+5+0',
                provisional: '0+0+0',
                pax: '10+3+0',
                arrivalDate: bookingData.arrivalDate || '16-JAN-2022 14:00',
                departureDate: bookingData.departureDate || '18-JAN-2022 12:00',
                depositAmount: 0,
                rate: bookingData.rate || '4,250.00',
                status: 'Confirmed Group',
                blocked: false,
                isCancelled: false,
                isGroup: true
              },
              ...prev.filter(r => r.resNo !== (bookingData.reservationNo || '276'))
            ]);
            alert(`✅ Group Reservation #${bookingData.reservationNo || '276'} (Group: ${bookingData.groupName || 'Anil Kumar Group'}) confirmed with 5 Executive Rooms!`);
          } else {
            setReservations(prev => [
              {
                resNo: bookingData.reservationNo || `${272 + prev.length}`,
                title: 'Mr',
                guestName: bookingData.guestName,
                companyName: bookingData.company || 'FIT',
                companyCode: 'COM0001',
                roomNo: '',
                type: bookingData.roomType || 'DLX',
                confirm: '1+0+0',
                provisional: '0+0+0',
                pax: `${bookingData.adults || 1}+0+0`,
                arrivalDate: bookingData.arrivalDate || '14-JAN-2022',
                departureDate: bookingData.departureDate || '16-JAN-2022',
                depositAmount: parseFloat(bookingData.advancePaid) || 0,
                status: 'Confirmed',
                blocked: false,
                isCancelled: false
              },
              ...prev
            ]);
            alert(`✅ Reservation #${bookingData.reservationNo} confirmed for ${bookingData.guestName}!`);
          }
          if (onNewBooking) onNewBooking(bookingData);
        }}
      />

      {/* Video 02, 03 & 04: Scan Booking Modal (Frame 004 & Frame 014) */}
      <IdsScanBookingModal 
        isOpen={scanBookingModalOpen}
        onClose={() => setScanBookingModalOpen(false)}
        bookings={reservations.filter(r => !r.isCancelled)}
        onSelectBooking={(b) => {
          setScanBookingModalOpen(false);
          if (scanPurpose === 'amend') {
            setSelectedBookingForAmend(b);
            setAmendBookingModalOpen(true);
          } else if (scanPurpose === 'cancel') {
            handleInitiateCancel(b);
          } else if (scanPurpose === 'checkin') {
            handleInitiateCheckin(b);
          } else {
            setSelectedBookingForAssignment(b);
            setAssignRoomsModalOpen(true);
          }
        }}
      />

      {/* Video 03: Quick Reservation in Modify Mode (Frame 006 & Frame 008) */}
      {amendBookingModalOpen && (
        <IdsQuickReservationModal 
          isOpen={amendBookingModalOpen}
          onClose={() => setAmendBookingModalOpen(false)}
          mode="modify"
          initialBooking={selectedBookingForAmend}
          rooms={rooms}
          onOpenScanBooking={(purpose) => {
            setScanPurpose(purpose);
            setScanBookingModalOpen(true);
          }}
          onOpenCancelBooking={(b) => {
            setAmendBookingModalOpen(false);
            handleInitiateCancel(b);
          }}
          onSuccessBooking={(updated) => {
            setAmendBookingModalOpen(false);
            setReservations(prev => prev.map(r => r.resNo === updated.reservationNo ? { ...r, ...updated } : r));
            alert(`✅ Reservation #${updated.reservationNo || '270'} successfully amended & updated!`);
          }}
        />
      )}

      {/* Video 04: Quick Reservation in Cancel Mode (Frame 016) */}
      {quickReservationCancelOpen && (
        <IdsQuickReservationModal 
          isOpen={quickReservationCancelOpen}
          onClose={() => setQuickReservationCancelOpen(false)}
          mode="cancel"
          initialBooking={selectedBookingForCancel}
          rooms={rooms}
          onOpenScanBooking={(purpose) => {
            setScanPurpose(purpose);
            setScanBookingModalOpen(true);
          }}
          onOpenCancelBooking={(b) => {
            handleInitiateCancel(b);
          }}
        />
      )}

      {/* Video 04: Cancel Booking Dialog (Frame 018) */}
      <IdsCancelBookingDialog 
        isOpen={cancelBookingModalOpen}
        onClose={() => {
          setCancelBookingModalOpen(false);
          setQuickReservationCancelOpen(false);
        }}
        booking={selectedBookingForCancel}
        onProceed={handleCancelProceed}
      />

      {/* Video 04: Deposit Warning Dialog (Frame 020) */}
      <IdsDepositWarningDialog 
        isOpen={depositWarningOpen}
        onClose={() => {
          setDepositWarningOpen(false);
          setQuickReservationCancelOpen(false);
        }}
        onRefund={() => {
          setDepositWarningOpen(false);
          setDepositRefundOpen(true);
        }}
        onProceedWithoutRefund={() => {
          setDepositWarningOpen(false);
          setCancelReasonOpen(true);
        }}
      />

      {/* Video 04: Deposit Refund Modal (Frame 022, 024, 026) */}
      <IdsDepositRefundModal 
        isOpen={depositRefundOpen}
        onClose={() => {
          setDepositRefundOpen(false);
          setCancelReasonOpen(true);
        }}
        booking={selectedBookingForCancel}
        onCompleteRefund={handleRefundConfirm}
      />

      {/* Video 04: Reason Entry Modal (Frame 030, 032, 034) */}
      <IdsCancelReasonModal 
        isOpen={cancelReasonOpen}
        onClose={() => {
          setCancelReasonOpen(false);
          setQuickReservationCancelOpen(false);
        }}
        onConfirm={handleReasonConfirm}
      />

      {/* Video 04: Blocked Room Release Warning Dialog (Detail 05) */}
      <IdsBlockedRoomWarningDialog 
        isOpen={blockedRoomWarningOpen}
        onOk={() => {
          setBlockedRoomWarningOpen(false);
          setCancelVoucherPromptOpen(true);
        }}
      />

      {/* Video 04: Print Voucher Prompt Dialog (Detail 06) */}
      <IdsCancelVoucherPromptDialog 
        isOpen={cancelVoucherPromptOpen}
        onYes={() => handleExecuteCancellation(true)}
        onNo={() => handleExecuteCancellation(false)}
      />

      {/* Video 04: Printable Cancellation Voucher Preview Modal */}
      <IdsCancellationVoucherModal 
        isOpen={cancellationVoucherOpen}
        onClose={() => setCancellationVoucherOpen(false)}
        cancelRecord={completedCancelRecord}
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

      {/* Video 05: Reservation Check-in Prompt Modal (Frame 008) */}
      <IdsReservationCheckinPromptModal 
        isOpen={checkinPromptOpen}
        onClose={() => setCheckinPromptOpen(false)}
        booking={selectedBookingForCheckin}
        onContinue={handleConfirmCheckinPrompt}
      />

      {/* Video 05: Check-in Guest List Modal (Frame 010) */}
      <IdsCheckinGuestListModal 
        isOpen={checkinGuestListOpen}
        onClose={() => setCheckinGuestListOpen(false)}
        booking={selectedBookingForCheckin}
        onSelectGuest={handleSelectGuestForRegistration}
        onRelease={(b) => {
          alert(`Room ${b?.roomNo || '516'} released from assignment.`);
          setCheckinGuestListOpen(false);
        }}
      />

      {/* Video 05: Check-In V6.5002.5 Main Registration Modal (Frames 012–028) */}
      <IdsCheckInRegistrationModal 
        isOpen={checkInRegistrationOpen}
        onClose={() => setCheckInRegistrationOpen(false)}
        booking={selectedBookingForCheckin}
        onCompleteCheckIn={handleCompleteCheckIn}
      />

      {/* Video 05: Detailed Position - Already Checked-in Modal (Frame 032) */}
      <IdsCheckedInPositionModal 
        isOpen={detailedPositionOpen}
        onClose={() => setDetailedPositionOpen(false)}
        checkedInList={checkedInList}
      />

      {/* Video 05, 06, 08 & 09: Room Status V6.5.002.1 Rack Console Modal (Frames 018–035 & 060) */}
      <IdsRoomRackConsoleModal 
        isOpen={roomRackConsoleOpen}
        onClose={() => setRoomRackConsoleOpen(false)}
        checkedInList={checkedInList}
        occupiedRoom={checkedInList.length > 0 ? checkedInList[0].roomNo : '516'}
        guestName={checkedInList.length > 0 ? checkedInList[0].guestName.split(' ').pop() : 'Biswakarma'}
        clearedRooms={clearedDirtyRooms}
        onClearSingleRoom={(roomNo) => {
          setClearedDirtyRooms(prev => Array.from(new Set([...prev, roomNo])));
        }}
        onOpenClearRoomsModal={() => setClearRoomsModalOpen(true)}
        onOpenChangeRate={(roomNo) => {
          setSelectedRoomForRate(roomNo);
          setChangeRateModalOpen(true);
        }}
        onOpenGuestInfo={(roomNo) => {
          setGuestInformationModalOpen(true);
        }}
        onOpenChangeGuestInfo={(roomNo) => {
          const g = inhouseGuestsList.find(x => x.roomNo === roomNo) || inhouseGuestsList[0];
          setSelectedGuestForEdit(g);
          setChangeGuestInfoOpen(true);
        }}
        onOpenAmendStay={(roomNo) => {
          setSelectedRoomForAmendStay(roomNo);
          setAmendStayModalOpen(true);
        }}
        onOpenRoomTransfer={(roomNo) => {
          setSelectedRoomForTransfer(roomNo);
          setRoomTransferModalOpen(true);
        }}
        transferredRooms={transferredRooms}
      />

      {/* Video 09: Clear Rooms V6.5.002.1 Bulk Modal (Frames 042–054) */}
      <IdsClearRoomsModal 
        isOpen={clearRoomsModalOpen}
        onClose={() => setClearRoomsModalOpen(false)}
        clearedRooms={clearedDirtyRooms}
        onClearAllDirtyRooms={(allRoomNos) => {
          setClearedDirtyRooms(prev => Array.from(new Set([...prev, ...allRoomNos])));
        }}
        onOpenRoomRack={() => setRoomRackConsoleOpen(true)}
      />

      {/* Video 09: Quick Scan Load Pgm Modal (Frames 012 & 038) */}
      <IdsQuickScanModal 
        isOpen={quickScanModalOpen}
        onClose={() => setQuickScanModalOpen(false)}
        onSelectProgram={(programId) => {
          if (programId === 'room-status' || programId === 'housekeeping-room-status') {
            setRoomRackConsoleOpen(true);
          } else if (programId === 'clear-rooms') {
            setClearRoomsModalOpen(true);
          } else if (programId === 'guest-management') {
            setGuestManagementOpen(true);
          } else if (programId === 'guest-information') {
            setGuestInformationModalOpen(true);
          } else if (programId === 'change-guest-info') {
            setRoomHelpLookupOpen(true);
          } else if (programId === 'change-rate') {
            setSelectedRoomForRate('312');
            setChangeRateModalOpen(true);
          } else if (programId === 'amend-stay' || programId === 'modify-departure') {
            setSelectedRoomForAmendStay('301');
            setAmendStayModalOpen(true);
          } else if (programId === 'room-transfer') {
            setSelectedRoomForTransfer('415');
            setRoomTransferModalOpen(true);
          } else if (programId === 'express-checkin') {
            setExpressCheckInOpen(true);
          } else if (programId === 'reservation-checkin') {
            setScanPurpose('checkin');
            setScanBookingModalOpen(true);
          } else if (programId === 'room-booking') {
            setQuickReservationOpen(true);
          }
        }}
      />

      {/* Video 11: Change Rate V6.5002.2 Modal (Frames 024–048) */}
      <IdsChangeRateModal 
        isOpen={changeRateModalOpen}
        onClose={() => setChangeRateModalOpen(false)}
        initialRoomNo={selectedRoomForRate}
        roomTariffs={roomTariffs}
        onOpenRoomHelpLookup={() => setRoomHelpLookupOpen(true)}
        onSaveTariffChange={(updatedTariff) => {
          setRoomTariffs(prev => ({
            ...prev,
            [updatedTariff.roomNo]: {
              ...(prev[updatedTariff.roomNo] || {}),
              currentRate: updatedTariff.newRate,
              extraAdult: updatedTariff.extraAdult,
              extraChild: updatedTariff.extraChild,
              remarks: updatedTariff.remarks,
              reason: updatedTariff.reason,
              authorizedBy: updatedTariff.authorizedBy
            }
          }));

          // Also sync into inhouseGuestsList so Guest Information reflects new rate
          setInhouseGuestsList(prev => prev.map(g => {
            if (g.roomNo === updatedTariff.roomNo) {
              return {
                ...g,
                rate: `Discount (₹${updatedTariff.newRate.toFixed(2)})`
              };
            }
            return g;
          }));
        }}
      />

      {/* Video 10: Guest Management Modal (Frame 012) */}
      <IdsGuestManagementModal 
        isOpen={guestManagementOpen}
        onClose={() => setGuestManagementOpen(false)}
        onOpenChangeGuestInfo={() => {
          setGuestManagementOpen(false);
          setRoomHelpLookupOpen(true);
        }}
        onOpenRoomTransfer={() => {
          setGuestManagementOpen(false);
          setSelectedRoomForTransfer('301');
          setRoomTransferModalOpen(true);
        }}
        onOpenAmendStay={() => {
          setGuestManagementOpen(false);
          setSelectedRoomForAmendStay('301');
          setAmendStayModalOpen(true);
        }}
      />

      {/* Video 10: Room Help Lookup Modal (Frame 016) */}
      <IdsRoomHelpLookupModal 
        isOpen={roomHelpLookupOpen}
        onClose={() => setRoomHelpLookupOpen(false)}
        guests={inhouseGuestsList}
        onSelectGuest={(guest) => {
          setSelectedGuestForEdit(guest);
          setRoomHelpLookupOpen(false);
          setChangeGuestInfoOpen(true);
        }}
      />

      {/* Video 10: Change Guest Information Modal (Frames 022–060) */}
      <IdsChangeGuestInfoModal 
        isOpen={changeGuestInfoOpen}
        onClose={() => setChangeGuestInfoOpen(false)}
        guest={selectedGuestForEdit}
        onSaveGuest={(updated) => {
          setInhouseGuestsList(prev => prev.map(g => g.roomNo === updated.roomNo ? updated : g));
          setSelectedGuestForEdit(updated);
        }}
      />

      {/* Video 10: Guest Information Shortcut Modal ("GI" Frame 068) */}
      <IdsGuestInformationModal 
        isOpen={guestInformationModalOpen}
        onClose={() => setGuestInformationModalOpen(false)}
        guests={inhouseGuestsList}
      />

      {/* Video 12: Amend Stay V6.5.002.1 Modal (Frames 018–045) */}
      <IdsAmendStayModal 
        isOpen={amendStayModalOpen}
        onClose={() => setAmendStayModalOpen(false)}
        initialRoomNo={selectedRoomForAmendStay}
        inhouseGuests={inhouseGuestsList}
        onOpenRoomHelpLookup={() => setRoomHelpLookupOpen(true)}
        onSaveAmendStay={({ roomNo, departure, roomNights, guestBalance }) => {
          setAmendedDepartures(prev => ({
            ...prev,
            [roomNo]: { departure, roomNights, guestBalance }
          }));

          // Sync into inhouseGuestsList so Guest Information reflects new departure, nights, and balance
          setInhouseGuestsList(prev => prev.map(g => {
            if (g.roomNo === roomNo) {
              return {
                ...g,
                departure,
                roomNights,
                balance: guestBalance
              };
            }
            return g;
          }));
        }}
      />

      {/* Video 13: Room Transfer V6.5.002.1 Modal (Frames 009–031) */}
      <IdsRoomTransferModal 
        isOpen={roomTransferModalOpen}
        onClose={() => setRoomTransferModalOpen(false)}
        initialRoomNo={selectedRoomForTransfer}
        inhouseGuests={inhouseGuestsList}
        onOpenRoomHelpLookup={() => setRoomHelpLookupOpen(true)}
        onSaveRoomTransfer={({ fromRoom, toRoom, toRoomType, guest }) => {
          setTransferredRooms(prev => ({
            ...prev,
            [fromRoom]: {
              toRoom,
              toRoomType,
              guest,
              guestName: guest.lastName || guest.guestName?.split(' ').pop() || 'Kumar'
            }
          }));

          // Update in-house guests database: update roomNo and folio
          setInhouseGuestsList(prev => prev.map(g => {
            if (g.roomNo === fromRoom) {
              return {
                ...g,
                roomNo: toRoom,
                roomType: toRoomType || g.roomType,
                folioNo: `${toRoom} / ${g.folioNo?.split('/')[1]?.trim() || '1'}`
              };
            }
            return g;
          }));
        }}
      />

      {/* Video 06, 07 & 08: Express Check-In Modal (Frames 012–060) */}
      <IdsExpressCheckInModal 
        isOpen={expressCheckInOpen}
        onClose={() => setExpressCheckInOpen(false)}
        onCompleteExpressCheckin={handleCompleteExpressCheckin}
        onCompleteGroupCheckin={handleCompleteGroupCheckin}
        onCompleteUpgradeCheckin={handleCompleteUpgradeCheckin}
        onOpenStandardCheckin={() => {
          setExpressCheckInOpen(false);
          setScanPurpose('checkin');
          setScanBookingModalOpen(true);
        }}
      />

      {/* Built-In 44-Video Tutorial Player Modal */}
      <IdsTutorialPlayerModal 
        isOpen={tutorialPlayerOpen}
        onClose={() => setTutorialPlayerOpen(false)}
        initialVideoId={selectedTutorialVideoId}
      />
    </div>
  );
}
