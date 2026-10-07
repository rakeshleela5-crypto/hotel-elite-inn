import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Clock, User, 
  RotateCcw, ShieldCheck, Bed, Wrench, Search, RefreshCw, X, Phone,
  Bell, Check, ChevronRight, Droplets, Coffee, MessageSquare, ArrowRight,
  ClipboardList, AlertCircle, Users, Shirt, Layers, Send, HelpCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { playHousekeepingChime } from '../utils/soundAlert';
import { openWhatsAppLink } from '../utils/whatsappDispatch';

// 8 Official Housekeeping Staff Roster of Hotel Elite Inn
const DEFAULT_STAFF_ROSTER = [
  { id: 'HK-01', name: 'Anita Majhi', phone: '+91 98611 52365', role: 'Housekeeping Manager', shift: 'Morning', floor: 'All', status: 'Present' },
  { id: 'HK-02', name: 'Bikram Mohanty', phone: '+91 63707 57541', role: 'Floor Supervisor', shift: 'Morning', floor: '1st Floor', status: 'Present' },
  { id: 'HK-03', name: 'Siddu Rao', phone: '+91 94371 00214', role: 'Room Attendant', shift: 'Morning', floor: '2nd Floor', status: 'Present' },
  { id: 'HK-04', name: 'Sakti Majhi', phone: '+91 98610 55431', role: 'Room Attendant', shift: 'Morning', floor: '3rd Floor', status: 'Present' },
  { id: 'HK-05', name: 'Sabitri Majhi', phone: '+91 98611 62366', role: 'Linen Sorter & Maid', shift: 'Morning', floor: '1st Floor', status: 'Present' },
  { id: 'HK-06', name: 'Kuni Nayak', phone: '+91 98611 72367', role: 'Commercial Laundry Lead', shift: 'Morning', floor: 'Laundry Deck', status: 'Present' },
  { id: 'HK-07', name: 'Parvati Sabar', phone: '+91 98611 82368', role: 'Linen Pressing Attendant', shift: 'Evening', floor: 'Laundry Deck', status: 'Present' },
  { id: 'HK-08', name: 'Monnu Pradhan', phone: '+91 63702 44901', role: 'Utility & Minibar Porter', shift: 'Evening', floor: 'All Floors', status: 'Present' }
];

// Initial Linen & Commercial Laundry Inventory
const INITIAL_LINEN_INVENTORY = [
  { id: 'double_sheets', name: 'Double Bed Sheets (White Satin Striped)', cleanStock: 54, inRoom: 27, inLaundry: 18, total: 99 },
  { id: 'single_sheets', name: 'Single Bed Sheets (Twin Beds)', cleanStock: 32, inRoom: 16, inLaundry: 10, total: 58 },
  { id: 'bath_towels', name: 'Plush Terry Bath Towels (650 GSM)', cleanStock: 80, inRoom: 54, inLaundry: 26, total: 160 },
  { id: 'hand_towels', name: 'Face & Hand Towels', cleanStock: 60, inRoom: 30, inLaundry: 14, total: 104 },
  { id: 'pillow_covers', name: 'Sanitized Pillow Covers', cleanStock: 110, inRoom: 60, inLaundry: 30, total: 200 },
  { id: 'bath_mats', name: 'Heavy Cotton Anti-Slip Bath Mats', cleanStock: 45, inRoom: 27, inLaundry: 12, total: 84 },
  { id: 'duvet_covers', name: 'Microfiber Duvet Covers', cleanStock: 36, inRoom: 27, inLaundry: 15, total: 78 }
];

// Chemical & Sanitization Consumables
const INITIAL_CHEMICAL_STOCK = [
  { id: 'r1', name: 'Diversey Taski R1 (Bathroom Sanitizer Concentrate)', stock: '14 Ltr', minLevel: '5 Ltr', status: 'Optimal' },
  { id: 'r2', name: 'Diversey Taski R2 (Hygienic Hard Surface Cleaner)', stock: '18 Ltr', minLevel: '6 Ltr', status: 'Optimal' },
  { id: 'r3', name: 'Diversey Taski R3 (Glass & Mirror Clear Shiner)', stock: '9 Ltr', minLevel: '3 Ltr', status: 'Optimal' },
  { id: 'r6', name: 'Diversey Taski R6 (Heavy Toilet Bowl Descaler)', stock: '12 Ltr', minLevel: '4 Ltr', status: 'Optimal' },
  { id: 'ozone', name: 'Ozone Air Sanitizer & Odor Neutralizer Tablets', stock: '48 Tabs', minLevel: '15 Tabs', status: 'Optimal' },
  { id: 'toiletries', name: 'Ayurvedic Herbal Soap & Dental Kits', stock: '120 Kits', minLevel: '30 Kits', status: 'Optimal' },
  { id: 'water', name: 'Elite Inn 500ml Bottled Drinking Water', stock: '240 Bottles', minLevel: '50 Bottles', status: 'Optimal' }
];

export default function HousekeepingPortal({
  isOpen,
  onClose,
  rooms = [],
  onUpdateRoomStatus
}) {
  if (!isOpen) return null;

  // 1. Role Mode State: 'supervisor' (Floor Operations & SLA) vs 'manager' (Executive Governance & Final Release)
  const [portalRole, setPortalRole] = useState('supervisor'); // 'supervisor' | 'manager'

  // Selected floor filter
  const [selectedFloor, setSelectedFloor] = useState('all'); // 'all', '1', '2', '3'
  const [statusFilterTab, setStatusFilterTab] = useState('dirty'); // 'dirty', 'cleaning', 'inspected', 'available', 'maintenance', 'all'
  const [selectedAttendant, setSelectedAttendant] = useState('Bikram Mohanty');

  // Staff Roster & Inventory States (persisted)
  const [staffRoster, setStaffRoster] = useState(() => {
    try {
      const s = localStorage.getItem('hei_hk_staff_roster');
      if (s) return JSON.parse(s);
    } catch {}
    return DEFAULT_STAFF_ROSTER;
  });

  const [linenInventory, setLinenInventory] = useState(() => {
    try {
      const l = localStorage.getItem('hei_hk_linen_inventory');
      if (l) return JSON.parse(l);
    } catch {}
    return INITIAL_LINEN_INVENTORY;
  });

  const [chemicalStock, setChemicalStock] = useState(() => {
    try {
      const c = localStorage.getItem('hei_hk_chemical_stock');
      if (c) return JSON.parse(c);
    } catch {}
    return INITIAL_CHEMICAL_STOCK;
  });

  // Guest QR Service Requests Stream
  const [serviceRequests, setServiceRequests] = useState(() => {
    try {
      const r = localStorage.getItem('hei_hk_service_requests');
      if (r) return JSON.parse(r);
    } catch {}
    return [];
  });

  // Turnaround Timers Store: { [roomNumber]: checkoutTimestamp }
  const [turnaroundTimers, setTurnaroundTimers] = useState(() => {
    try {
      const t = localStorage.getItem('hei_hk_turnaround_timers');
      if (t) return JSON.parse(t);
    } catch {}
    return {};
  });

  // Room DND States: { [roomNumber]: boolean }
  const [dndStates, setDndStates] = useState(() => {
    try {
      const d = localStorage.getItem('hei_hk_dnd_states');
      if (d) return JSON.parse(d);
    } catch {}
    return {};
  });

  // Inspection Drawer & Modal States
  const [inspectingRoom, setInspectingRoom] = useState(null);
  const [inspectionChecklist, setInspectionChecklist] = useState({
    linenChanged: true,
    washroomSanitized: true,
    terryTowelsPlaced: true,
    ayurvedicToiletriesRestocked: true,
    beverageTrayRestocked: true,
    acLightsChecked: true,
    wardrobeHangersPlaced: true
  });
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Maintenance Defect Modal State
  const [defectRoom, setDefectRoom] = useState(null);
  const [defectCategory, setDefectCategory] = useState('HVAC / AC');
  const [defectPriority, setDefectPriority] = useState('High');
  const [defectNotes, setDefectNotes] = useState('');

  // Lost & Found Modal State
  const [lostFoundRoom, setLostFoundRoom] = useState(null);
  const [lostFoundItem, setLostFoundItem] = useState('');
  const [lostFoundLocation, setLostFoundLocation] = useState('Bedside Table');

  const [feedbackToast, setFeedbackToast] = useState('');
  const channelRef = useRef(null);

  // Helper for toast messages
  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (inspectingRoom) setInspectingRoom(null);
        else if (defectRoom) setDefectRoom(null);
        else if (lostFoundRoom) setLostFoundRoom(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingRoom, defectRoom, lostFoundRoom, onClose]);

  // Persist Rosters & Inventory
  useEffect(() => {
    localStorage.setItem('hei_hk_staff_roster', JSON.stringify(staffRoster));
  }, [staffRoster]);

  useEffect(() => {
    localStorage.setItem('hei_hk_linen_inventory', JSON.stringify(linenInventory));
  }, [linenInventory]);

  useEffect(() => {
    localStorage.setItem('hei_hk_turnaround_timers', JSON.stringify(turnaroundTimers));
  }, [turnaroundTimers]);

  useEffect(() => {
    localStorage.setItem('hei_hk_service_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('hei_hk_dnd_states', JSON.stringify(dndStates));
  }, [dndStates]);

  // Real-Time BroadcastChannel Bus: Synchronize with Front Desk & In-Room Guest Portal
  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('hotel_elite_inn_housekeeping');
      channelRef.current.onmessage = (event) => {
        const { type, payload } = event.data || {};

        if (type === 'ROOM_CHECKOUT' || type === 'ROOM_DIRTY') {
          // Checkout completed at front desk -> mark room dirty & start 45m SLA timer
          const rNo = String(payload?.roomNumber);
          setTurnaroundTimers(prev => ({ ...prev, [rNo]: Date.now() }));
          playHousekeepingChime();
          showToast(`🚨 URGENT: Room ${rNo} checked out! 45-min cleaning SLA started.`);
        }

        if (type === 'ROOM_SERVICE_REQUEST') {
          // In-Room Guest QR scan request
          const newReq = {
            id: payload.requestId || `SR-${Date.now().toString().slice(-5)}`,
            roomNumber: payload.roomNumber,
            serviceType: payload.serviceType || 'Guest Service',
            description: payload.description || '',
            priority: payload.priority || 'Normal',
            guestName: payload.guestName || `Room ${payload.roomNumber}`,
            status: 'Pending',
            requestedAt: new Date().toISOString()
          };
          setServiceRequests(prev => [newReq, ...prev]);
          playHousekeepingChime();
          showToast(`🔔 Room ${payload.roomNumber}: Requested "${payload.serviceType}"`);
        }

        if (type === 'ROOM_DND_TOGGLE') {
          setDndStates(prev => ({
            ...prev,
            [payload.roomNumber]: Boolean(payload.isDnd)
          }));
        }
      };
    } catch (e) {
      console.warn('Housekeeping BroadcastChannel error:', e);
    }

    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  // Compute Active Room Categories
  const dirtyRooms = useMemo(() => rooms.filter(r => r.status === 'Dirty' || r.status === 'Vacant Dirty'), [rooms]);
  const cleaningRooms = useMemo(() => rooms.filter(r => r.status === 'Cleaning' || r.status === 'Under Cleaning'), [rooms]);
  const inspectedRooms = useMemo(() => rooms.filter(r => r.status === 'Clean & Inspected' || r.status === 'Inspected'), [rooms]);
  const availableRooms = useMemo(() => rooms.filter(r => r.status === 'Available'), [rooms]);
  const maintenanceRooms = useMemo(() => rooms.filter(r => r.status === 'Maintenance' || r.status === 'Out of Order'), [rooms]);
  const occupiedRooms = useMemo(() => rooms.filter(r => r.status === 'Occupied' || r.status === 'Occupied Clean'), [rooms]);

  // Cleanliness Index KPI
  const cleanlinessIndex = useMemo(() => {
    if (rooms.length === 0) return 100;
    const cleanCount = availableRooms.length + inspectedRooms.length + occupiedRooms.length;
    return Math.round((cleanCount / rooms.length) * 100);
  }, [rooms, availableRooms, inspectedRooms, occupiedRooms]);

  // Filtered Rooms for Display
  const displayedRooms = useMemo(() => {
    let list = rooms;

    // Filter by floor
    if (selectedFloor !== 'all') {
      list = list.filter(r => String(r.floor || r.roomNumber[0]) === selectedFloor);
    }

    // Filter by status tab
    if (statusFilterTab === 'dirty') list = list.filter(r => r.status === 'Dirty' || r.status === 'Vacant Dirty');
    else if (statusFilterTab === 'cleaning') list = list.filter(r => r.status === 'Cleaning' || r.status === 'Under Cleaning');
    else if (statusFilterTab === 'inspected') list = list.filter(r => r.status === 'Clean & Inspected' || r.status === 'Inspected');
    else if (statusFilterTab === 'available') list = list.filter(r => r.status === 'Available');
    else if (statusFilterTab === 'maintenance') list = list.filter(r => r.status === 'Maintenance' || r.status === 'Out of Order');
    else if (statusFilterTab === 'occupied') list = list.filter(r => r.status === 'Occupied' || r.status === 'Occupied Clean');

    return list;
  }, [rooms, selectedFloor, statusFilterTab]);

  // =========================================================================
  // ACTIONS: SUPERVISOR & MANAGER WORKFLOWS
  // =========================================================================

  // Broadcast helper
  const broadcastHkEvent = (type, payload) => {
    try {
      const ch = new BroadcastChannel('hotel_elite_inn_housekeeping');
      ch.postMessage({ type, payload });
      ch.close();
    } catch (e) {
      console.warn('Broadcast error:', e);
    }
  };

  // Sync to Cloudflare D1
  const syncHkToD1 = (roomNumber, newStatus, previousStatus, notes) => {
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_housekeeping_status',
        payload: {
          roomNumber,
          newStatus,
          previousStatus,
          attendantName: selectedAttendant,
          notes: notes || `Updated by ${selectedAttendant}`
        }
      })
    }).catch(err => console.warn('Offline D1 sync fallback:', err));
  };

  // 1. Supervisor: Start Cleaning
  const handleStartCleaning = (roomNum) => {
    if (onUpdateRoomStatus) onUpdateRoomStatus(roomNum, 'Under Cleaning');
    broadcastHkEvent('ROOM_STATUS_UPDATE', { roomNumber: roomNum, newStatus: 'Cleaning', updatedBy: selectedAttendant });
    syncHkToD1(roomNum, 'Under Cleaning', 'Vacant Dirty', `Cleaning started by ${selectedAttendant}`);
    showToast(`🧹 Room ${roomNum} marked 'Under Cleaning' by ${selectedAttendant}`);
  };

  // 2. Supervisor: Verify 7-Point Audit Checklist & Mark Inspected
  const handleCompleteInspection = () => {
    if (!inspectingRoom) return;
    const rNo = inspectingRoom.roomNumber;

    if (onUpdateRoomStatus) onUpdateRoomStatus(rNo, 'Clean & Inspected');
    broadcastHkEvent('ROOM_INSPECTED', { roomNumber: rNo, inspectedBy: selectedAttendant });
    syncHkToD1(rNo, 'Clean & Inspected', 'Under Cleaning', inspectionNotes || '7-point hygiene audit cleared.');

    // Clear turnaround timer
    setTurnaroundTimers(prev => {
      const copy = { ...prev };
      delete copy[rNo];
      return copy;
    });

    setInspectingRoom(null);
    setInspectionNotes('');
    showToast(`✨ Room ${rNo} verified by Supervisor ${selectedAttendant}! Queued for Manager Release.`);
  };

  // 3. Manager: Final Release to Front Desk (Available & Green)
  const handleManagerRelease = (roomNum) => {
    if (onUpdateRoomStatus) onUpdateRoomStatus(roomNum, 'Available', null, null);
    broadcastHkEvent('ROOM_CLEANED', { roomNumber: roomNum, cleanedBy: 'Anita Majhi (Manager Released)' });
    syncHkToD1(roomNum, 'Available', 'Clean & Inspected', 'Manager authorized release to Front Desk.');
    playHousekeepingChime();
    showToast(`✓ Room ${roomNum} RELEASED TO FRONT DESK! Status is now Available (Green).`);
  };

  // 4. Manager: Bulk Release All Inspected Rooms
  const handleReleaseAllInspected = () => {
    if (inspectedRooms.length === 0) return;
    inspectedRooms.forEach(r => {
      if (onUpdateRoomStatus) onUpdateRoomStatus(r.roomNumber, 'Available', null, null);
      broadcastHkEvent('ROOM_CLEANED', { roomNumber: r.roomNumber, cleanedBy: 'Anita Majhi (Bulk Released)' });
      syncHkToD1(r.roomNumber, 'Available', 'Clean & Inspected', 'Manager bulk release.');
    });
    playHousekeepingChime();
    showToast(`✓ All ${inspectedRooms.length} inspected rooms released to Front Desk!`);
  };

  // 5. Supervisor: Log Maintenance Defect
  const handleLogDefect = () => {
    if (!defectRoom) return;
    const rNo = defectRoom.roomNumber;

    if (onUpdateRoomStatus) onUpdateRoomStatus(rNo, 'Maintenance', 'MAINTENANCE BLOCKED', null);
    broadcastHkEvent('ROOM_MAINTENANCE', {
      roomNumber: rNo,
      category: defectCategory,
      priority: defectPriority,
      notes: defectNotes,
      reportedBy: selectedAttendant
    });
    syncHkToD1(rNo, 'Maintenance', defectRoom.status, `Defect: ${defectCategory} - ${defectNotes}`);

    setDefectRoom(null);
    setDefectNotes('');
    showToast(`⚠️ Room ${rNo} placed under Maintenance (${defectCategory}). Front desk alerted.`);
  };

  // 6. Supervisor: Log Lost & Found & WhatsApp Guest
  const handleLogLostAndFound = () => {
    if (!lostFoundRoom || !lostFoundItem) return;
    const rNo = lostFoundRoom.roomNumber;
    const guestName = lostFoundRoom.currentGuestName || 'Valued Guest';
    const guestPhone = lostFoundRoom.phone || '+91 6305202068';

    const msg = `🏨 *${HOTEL_CONFIG.name} - Housekeeping Lost & Found Alert*\n\n` +
      `Dear ${guestName},\n` +
      `During room inspection of *Room ${rNo}*, our housekeeping staff (*${selectedAttendant}*) found the following item left behind:\n\n` +
      `📦 Item: *${lostFoundItem}*\n` +
      `📍 Found At: *${lostFoundLocation}*\n\n` +
      `Your item has been securely tagged and stored at the Front Desk drop safe. Please contact us at ${HOTEL_CONFIG.phone} to arrange collection or dispatch.\n\n` +
      `Best regards,\n${HOTEL_CONFIG.name}, Muniguda`;

    openWhatsAppLink(guestPhone, msg);
    showToast(`📱 Lost & Found logged for Room ${rNo}! WhatsApp notification sent to ${guestName}.`);
    setLostFoundRoom(null);
    setLostFoundItem('');
  };

  // 7. Resolve Guest QR Service Request
  const handleCompleteServiceRequest = (reqId, roomNum, type) => {
    setServiceRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Delivered' } : r));
    showToast(`✓ ${type} for Room ${roomNum} marked Delivered!`);
  };

  // Calculate Elapsed SLA Minutes for a room
  const getSlaInfo = (roomNum) => {
    const started = turnaroundTimers[roomNum];
    if (!started) return { elapsedMinutes: 15, isOverdue: false, minutesRemaining: 30 };
    const elapsedMinutes = Math.floor((Date.now() - started) / 60000);
    const minutesRemaining = Math.max(0, 45 - elapsedMinutes);
    const isOverdue = elapsedMinutes > 45;
    return { elapsedMinutes, isOverdue, minutesRemaining };
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#090e1a',
        border: '1.5px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1080px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 70px rgba(0,0,0,0.85), 0 0 35px rgba(16, 185, 129, 0.15)',
        overflow: 'hidden',
        color: '#fff'
      }}>
        {/* TOP COMMAND HEADER RIBBON */}
        <div style={{
          padding: '1.1rem 1.5rem',
          background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.98))',
          borderBottom: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Brand Identity & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))',
              border: '1.5px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '0.3px' }}>
                  HOUSEKEEPING OPERATIONS CONSOLE
                </h2>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  color: '#34d399',
                  border: '1px solid #10b981',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 900
                }}>
                  {cleanlinessIndex}% PROPERTY CLEAN
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                {HOTEL_CONFIG.name} • 27 Keys • 45-Min Turnover SLA &amp; Real-Time Front Desk Bridge
              </div>
            </div>
          </div>

          {/* DUAL-ROLE SWITCHER & CLOSE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Role Toggle */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <button
                type="button"
                onClick={() => setPortalRole('supervisor')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: portalRole === 'supervisor' ? '#38bdf8' : 'transparent',
                  color: portalRole === 'supervisor' ? '#000' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                👨‍🔧 Supervisor Deck
              </button>
              <button
                type="button"
                onClick={() => setPortalRole('manager')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: portalRole === 'manager' ? '#10b981' : 'transparent',
                  color: portalRole === 'manager' ? '#000' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                👩‍💼 Manager Governance
              </button>
            </div>

            {/* Attendant Quick Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.06)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <User size={14} color="#34d399" />
              <select
                value={selectedAttendant}
                onChange={(e) => setSelectedAttendant(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {staffRoster.map(s => (
                  <option key={s.id} value={s.name} style={{ background: '#0a0e1a', color: '#fff' }}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#94a3b8',
                borderRadius: '8px',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST BANNER */}
        {feedbackToast && (
          <div style={{
            background: 'linear-gradient(90deg, #10b981, #059669)',
            color: '#fff',
            padding: '0.55rem 1.5rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={16} />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* BODY CONTAINER: SUPERVISOR VIEW VS MANAGER VIEW */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* =========================================================================
              VIEW A: THE SUPERVISOR OPERATIONAL DECK
             ========================================================================= */}
          {portalRole === 'supervisor' ? (
            <>
              {/* 1. FILTER CONTROLS: FLOORS + STATUS CATEGORIES */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                {/* Floor Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>FLOOR:</span>
                  {[
                    { id: 'all', label: 'All 27 Keys' },
                    { id: '1', label: 'Fl 1 (101-109)' },
                    { id: '2', label: 'Fl 2 (201-209)' },
                    { id: '3', label: 'Fl 3 (301-309)' }
                  ].map(fl => (
                    <button
                      key={fl.id}
                      onClick={() => setSelectedFloor(fl.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: selectedFloor === fl.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                        border: selectedFloor === fl.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                        color: selectedFloor === fl.id ? '#38bdf8' : '#94a3b8'
                      }}
                    >
                      {fl.label}
                    </button>
                  ))}
                </div>

                {/* Status Category Badges */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'dirty', label: '🚨 Dirty / Turnover', count: dirtyRooms.length, color: '#ef4444' },
                    { id: 'cleaning', label: '🧹 In Cleaning', count: cleaningRooms.length, color: '#f59e0b' },
                    { id: 'inspected', label: '🔍 Inspected', count: inspectedRooms.length, color: '#38bdf8' },
                    { id: 'available', label: '✓ Clean Available', count: availableRooms.length, color: '#10b981' },
                    { id: 'maintenance', label: '🔧 Defect / Maint', count: maintenanceRooms.length, color: '#a855f7' },
                    { id: 'all', label: 'All Rooms', count: rooms.length, color: '#cbd5e1' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilterTab(tab.id)}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: statusFilterTab === tab.id ? `${tab.color}25` : 'rgba(255,255,255,0.03)',
                        border: statusFilterTab === tab.id ? `1.5px solid ${tab.color}` : '1px solid rgba(255,255,255,0.08)',
                        color: statusFilterTab === tab.id ? tab.color : '#94a3b8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        background: statusFilterTab === tab.id ? tab.color : 'rgba(255,255,255,0.1)',
                        color: statusFilterTab === tab.id ? '#000' : '#fff',
                        fontSize: '0.66rem',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        fontWeight: 900
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. URGENT CHECKOUT TURNOVER QUEUE WITH 45-MIN SLA COUNTDOWN */}
              {dirtyRooms.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.15))',
                  border: '1.5px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} color="#ef4444" />
                      <strong style={{ fontSize: '0.88rem', color: '#fff' }}>
                        URGENT VACANT DIRTY QUEUE ({dirtyRooms.length} Rooms Awaiting Turnover)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
                      Standard Cleaning SLA: 45 Minutes per Key
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                    {dirtyRooms.map(r => {
                      const sla = getSlaInfo(r.roomNumber);
                      return (
                        <div
                          key={r.roomNumber}
                          style={{
                            background: '#0a0f1d',
                            border: sla.isOverdue ? '1.5px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--gold-glow)' }}>
                                Room {r.roomNumber}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                (Fl {r.floor || r.roomNumber[0]})
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: sla.isOverdue ? '#ef4444' : '#f59e0b', marginTop: '0.2rem', fontWeight: 700 }}>
                              {sla.isOverdue 
                                ? `⚠️ SLA BREACH (+${sla.elapsedMinutes - 45}m)` 
                                : `⏱️ ${sla.minutesRemaining}m remaining (${sla.elapsedMinutes}m elapsed)`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleStartCleaning(r.roomNumber)}
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: '#000',
                              border: 'none',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Clock size={13} /> Assign &amp; Clean
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. GUEST IN-ROOM MOBILE QR SERVICE REQUESTS STREAM */}
              {serviceRequests.filter(s => s.status === 'Pending').length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(14, 165, 233, 0.12))',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  padding: '0.9rem 1.15rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bell size={16} color="#38bdf8" />
                      <strong style={{ fontSize: '0.84rem', color: '#fff' }}>
                        LIVE GUEST QR SERVICE CALLS ({serviceRequests.filter(s => s.status === 'Pending').length} Pending)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      In-Room Bedside QR Stream
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {serviceRequests.filter(s => s.status === 'Pending').map(req => (
                      <div
                        key={req.id}
                        style={{
                          background: '#070f1e',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          minWidth: '220px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.4rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>Room {req.roomNumber}</strong>
                            <span style={{ fontSize: '0.68rem', color: req.priority === 'Urgent' ? '#ef4444' : '#cbd5e1' }}>
                              {req.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                            {req.serviceType}
                          </div>
                          {req.description && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                              "{req.description}"
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCompleteServiceRequest(req.id, req.roomNumber, req.serviceType)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid #10b981',
                            color: '#34d399',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Mark Delivered
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MAIN ROOM CARDS GRID */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.85rem'
              }}>
                {displayedRooms.map(r => {
                  const isDirty = r.status === 'Dirty' || r.status === 'Vacant Dirty';
                  const isCleaning = r.status === 'Cleaning' || r.status === 'Under Cleaning';
                  const isInspected = r.status === 'Clean & Inspected' || r.status === 'Inspected';
                  const isAvailable = r.status === 'Available';
                  const isOccupied = r.status === 'Occupied' || r.status === 'Occupied Clean';
                  const isMaint = r.status === 'Maintenance' || r.status === 'Out of Order';
                  const isDnd = Boolean(dndStates[r.roomNumber]);

                  return (
                    <div
                      key={r.roomNumber}
                      style={{
                        background: isDirty 
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.2))'
                          : isCleaning
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(180, 83, 9, 0.25))'
                          : isInspected
                          ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(14, 165, 233, 0.25))'
                          : isAvailable
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2))'
                          : isMaint
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(126, 34, 206, 0.25))'
                          : 'rgba(30, 41, 59, 0.4)',
                        border: isDirty 
                          ? '1.5px solid #ef4444' 
                          : isCleaning 
                          ? '1.5px solid #f59e0b'
                          : isInspected
                          ? '1.5px solid #38bdf8'
                          : isAvailable 
                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                          : isMaint
                          ? '1.5px solid #a855f7'
                          : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Top Info */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                            Room {r.roomNumber}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: isDirty ? '#ef4444' : isCleaning ? '#f59e0b' : isInspected ? '#38bdf8' : isAvailable ? '#10b981' : isMaint ? '#a855f7' : '#e2e8f0',
                            color: (isCleaning || isInspected || isOccupied) ? '#000' : '#fff'
                          }}>
                            {isDirty ? '🚨 DIRTY' : isCleaning ? '🧹 CLEANING' : isInspected ? '🔍 INSPECTED' : isAvailable ? '✓ READY' : isMaint ? '🔧 DEFECT' : 'OCCUPIED'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {r.tier || 'Executive AC'} • Floor {r.floor || r.roomNumber[0]}
                        </div>

                        {/* DND Indicator */}
                        {isDnd && (
                          <div style={{
                            marginTop: '0.35rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.25)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ⛔ DND ACTIVE (Do Not Disturb)
                          </div>
                        )}

                        {r.currentGuestName && (
                          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                            Guest: <strong style={{ color: '#fbbf24' }}>{r.currentGuestName}</strong>
                          </div>
                        )}
                      </div>

                      {/* Action Dock */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {/* Dirty -> Start Cleaning */}
                        {isDirty && (
                          <button
                            type="button"
                            onClick={() => handleStartCleaning(r.roomNumber)}
                            style={{
                              padding: '0.55rem',
                              borderRadius: '7px',
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: '#000',
                              border: 'none',
                              fontWeight: 900,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Clock size={14} /> Start Cleaning
                          </button>
                        )}

                        {/* Cleaning -> Open 7-Point Inspection */}
                        {isCleaning && (
                          <button
                            type="button"
                            onClick={() => setInspectingRoom(r)}
                            style={{
                              padding: '0.55rem',
                              borderRadius: '7px',
                              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                              color: '#000',
                              border: 'none',
                              fontWeight: 900,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <CheckCircle2 size={14} /> ✨ 7-Point Audit Checklist
                          </button>
                        )}

                        {/* Inspected -> Waiting for Manager Release */}
                        {isInspected && (
                          <div style={{
                            padding: '0.4rem',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textAlign: 'center'
                          }}>
                            ✓ Inspected • Awaiting Manager Release
                          </div>
                        )}

                        {/* Available -> Ready for front desk */}
                        {isAvailable && (
                          <div style={{ fontSize: '0.72rem', color: '#34d399', textAlign: 'center', fontWeight: 800 }}>
                            ✓ Ready for Front Desk Walk-In
                          </div>
                        )}

                        {/* Utility Action Buttons: Defect & Lost & Found */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <button
                            type="button"
                            onClick={() => setDefectRoom(r)}
                            style={{
                              flex: 1,
                              padding: '0.3rem',
                              borderRadius: '4px',
                              background: 'rgba(168, 85, 247, 0.15)',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              color: '#c084fc',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px'
                            }}
                            title="Log Maintenance Defect"
                          >
                            <Wrench size={11} /> Defect
                          </button>

                          <button
                            type="button"
                            onClick={() => setLostFoundRoom(r)}
                            style={{
                              flex: 1,
                              padding: '0.3rem',
                              borderRadius: '4px',
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: 'var(--gold-glow)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px'
                            }}
                            title="Log Lost & Found Item"
                          >
                            <ShieldCheck size={11} /> Lost &amp; Found
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* =========================================================================
               VIEW B: THE MANAGER GOVERNANCE DECK
               ========================================================================= */
            <>
              {/* 1. EXECUTIVE CLEANLINESS KPI DASHBOARD */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem'
              }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800 }}>PROPERTY CLEANLINESS INDEX</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>{cleanlinessIndex}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>27 Keys Property Aggregate</div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>AWAITING MANAGER RELEASE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>{inspectedRooms.length} Keys</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Supervisor Inspected</div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800 }}>ACTIVE DIRTY BACKLOG</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>{dirtyRooms.length} Keys</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>45m SLA Active</div>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 800 }}>OPEN DEFECTS / MAINTENANCE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c084fc', marginTop: '0.2rem' }}>{maintenanceRooms.length} Keys</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Out of Order</div>
                </div>
              </div>

              {/* 2. MANAGER MASTER AUTHORIZATION & RELEASE STRIP */}
              {inspectedRooms.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.18))',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                      Authorization Required: {inspectedRooms.length} Rooms Ready for Front Desk Release
                    </strong>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: '#cbd5e1' }}>
                      Verified by Supervisor {selectedAttendant}. Releasing turns rooms Available (Green) across Modern Cards, Tabular Matrix &amp; Master Ledger.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {inspectedRooms.map(ins => (
                      <button
                        key={ins.roomNumber}
                        type="button"
                        onClick={() => handleManagerRelease(ins.roomNumber)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.25)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Release Rm {ins.roomNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleReleaseAllInspected}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      ⚡ Authorize &amp; Release All
                    </button>
                  </div>
                </div>
              )}

              {/* 3. COMMERCIAL LINEN & LAUNDRY INVENTORY LEDGER */}
              <div style={{
                background: 'rgba(12, 22, 38, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shirt size={18} color="#38bdf8" />
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                      COMMERCIAL LINEN &amp; LAUNDRY CIRCULATION LEDGER
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Standard Par Stock: 3.5x Par
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Linen Item</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', color: '#34d399' }}>Clean In Stock</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', color: '#fbbf24' }}>In-Room Active</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', color: '#ef4444' }}>In Laundry Deck</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Total Par</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linenInventory.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.55rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</td>
                          <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 800, color: '#34d399' }}>{item.cleanStock}</td>
                          <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 800, color: '#fbbf24' }}>{item.inRoom}</td>
                          <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 800, color: '#ef4444' }}>{item.inLaundry}</td>
                          <td style={{ padding: '0.55rem', textAlign: 'center', color: '#cbd5e1' }}>{item.total}</td>
                          <td style={{ padding: '0.55rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setLinenInventory(prev => prev.map(l => l.id === item.id ? {
                                  ...l,
                                  cleanStock: l.cleanStock + 5,
                                  inLaundry: Math.max(0, l.inLaundry - 5)
                                } : l));
                                showToast(`✓ Received 5 clean ${item.name} from Laundry`);
                              }}
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginRight: '4px'
                              }}
                            >
                              +5 Clean
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLinenInventory(prev => prev.map(l => l.id === item.id ? {
                                  ...l,
                                  cleanStock: Math.max(0, l.cleanStock - 5),
                                  inLaundry: l.inLaundry + 5
                                } : l));
                                showToast(`🧺 Dispatched 5 soiled ${item.name} to Laundry`);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              +5 Soiled
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. CHEMICAL & SANITIZATION CONSUMABLES */}
              <div style={{
                background: 'rgba(12, 22, 38, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={18} color="#10b981" />
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                      DIVERSEY CHEMICALS &amp; CONSUMABLE STOCK LEDGER
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34d399' }}>All Stocks Above Min-Level</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {chemicalStock.map(chem => (
                    <div
                      key={chem.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '0.75rem',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f8fafc' }}>{chem.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.35rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399' }}>{chem.stock}</span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Min: {chem.minLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. STAFF SHIFT DUTY ROSTER & ATTENDANCE */}
              <div style={{
                background: 'rgba(12, 22, 38, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="#fbbf24" />
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                      STAFF SHIFT DUTY ROSTER &amp; ATTENDANCE
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    8 Total Staff Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.65rem' }}>
                  {staffRoster.map(staff => (
                    <div
                      key={staff.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        padding: '0.7rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#fff' }}>{staff.name}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{staff.role} • {staff.floor}</div>
                        <div style={{ fontSize: '0.68rem', color: '#fbbf24' }}>Shift: {staff.shift}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStaffRoster(prev => prev.map(s => s.id === staff.id ? {
                            ...s,
                            status: s.status === 'Present' ? 'On Leave' : 'Present'
                          } : s));
                          showToast(`Updated attendance for ${staff.name}`);
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: staff.status === 'Present' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                          color: staff.status === 'Present' ? '#34d399' : '#f87171',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {staff.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(6, 10, 18, 0.98)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.76rem',
          color: '#94a3b8'
        }}>
          <div>
            Active Attendant: <strong style={{ color: '#fff' }}>{selectedAttendant}</strong> • Real-time Sync Active
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline-gold"
            style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
          >
            Close Console
          </button>
        </div>

      </div>

      {/* =========================================================================
          SUB-MODAL 1: 7-POINT ROOM HYGIENE AUDIT DRAWER
         ========================================================================= */}
      {inspectingRoom && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0c1524',
            border: '1.5px solid #38bdf8',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 900 }}>SUPERVISOR HYGIENE AUDIT</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
                  Room {inspectingRoom.roomNumber} Inspection Checklist
                </h3>
              </div>
              <button onClick={() => setInspectingRoom(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
              {[
                { key: 'linenChanged', label: '1. Fresh bed linen & duvet aligned' },
                { key: 'washroomSanitized', label: '2. Bathroom descaled & ozone sanitized' },
                { key: 'terryTowelsPlaced', label: '3. 4x fresh terry towels & bath mat' },
                { key: 'ayurvedicToiletriesRestocked', label: '4. Ayurvedic toiletries & dental kit replenished' },
                { key: 'beverageTrayRestocked', label: '5. 2x mineral water & electric kettle tea tray restocked' },
                { key: 'acLightsChecked', label: '6. AC remote & TV tested (working condition)' },
                { key: 'wardrobeHangersPlaced', label: '7. Wardrobe hangers & laundry bag placed' }
              ].map(chk => (
                <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inspectionChecklist[chk.key]}
                    onChange={(e) => setInspectionChecklist(prev => ({ ...prev, [chk.key]: e.target.checked }))}
                  />
                  <span style={{ color: inspectionChecklist[chk.key] ? '#f1f5f9' : '#94a3b8' }}>
                    {chk.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Supervisor Notes / Sanitization Audit</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ozone cycle completed, aroma fresh"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.45rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setInspectingRoom(null)} className="btn-outline-gold" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteInspection}
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  color: '#000',
                  border: 'none',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                ✓ Mark Supervisor Inspected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-MODAL 2: LOG MAINTENANCE DEFECT
         ========================================================================= */}
      {defectRoom && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f1322',
            border: '1.5px solid #a855f7',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '460px',
            padding: '1.5rem',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                🔧 Report Maintenance Defect - Room {defectRoom.roomNumber}
              </h3>
              <button onClick={() => setDefectRoom(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Defect Category</label>
              <select
                className="form-select"
                value={defectCategory}
                onChange={(e) => setDefectCategory(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="HVAC / AC">HVAC / AC Not Cooling</option>
                <option value="Plumbing / Geyser">Plumbing / Geyser No Hot Water</option>
                <option value="Electrical / Lighting">Electrical / TV / Lighting Defect</option>
                <option value="Carpentry / Lock">Door / Keycard Smart Lock Issue</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority</label>
              <select
                className="form-select"
                value={defectPriority}
                onChange={(e) => setDefectPriority(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="High">High (Immediate Room Block)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Technician Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Geyser valve dripping, needs washer change"
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.45rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setDefectRoom(null)} className="btn-outline-gold" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogDefect}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                ⚠️ Flag Room Out of Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-MODAL 3: LOG LOST & FOUND
         ========================================================================= */}
      {lostFoundRoom && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f1322',
            border: '1.5px solid var(--gold-glow)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '460px',
            padding: '1.5rem',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                📦 Log Lost &amp; Found Item - Room {lostFoundRoom.roomNumber}
              </h3>
              <button onClick={() => setLostFoundRoom(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Item Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Titan Wristwatch, iPhone Lightning Cable"
                value={lostFoundItem}
                onChange={(e) => setLostFoundItem(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Location Found</label>
              <select
                className="form-select"
                value={lostFoundLocation}
                onChange={(e) => setLostFoundLocation(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="Bedside Table">Bedside Table</option>
                <option value="Bathroom Shelf">Bathroom Shelf</option>
                <option value="Wardrobe Drawer">Wardrobe Drawer</option>
                <option value="Under the Bed">Under the Bed</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setLostFoundRoom(null)} className="btn-outline-gold" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogLostAndFound}
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                  color: '#000',
                  border: 'none',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                📲 Log &amp; Send WhatsApp Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
