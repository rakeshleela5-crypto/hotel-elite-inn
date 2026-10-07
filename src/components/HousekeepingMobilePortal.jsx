import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, Clock, User,
  ShieldCheck, Bed, Wrench, Search, RefreshCw, X, Phone,
  Bell, BellRing, Droplets, ChevronRight, Settings, LogOut,
  Wifi, Building2, Check, AlertCircle, ArrowLeft
} from 'lucide-react';
import { HOTEL_CONFIG, INITIAL_ROOMS_INVENTORY } from '../data/hotelData';
import { playHousekeepingChime } from '../utils/soundAlert';
import StaffShiftLoginModal from './StaffShiftLoginModal';
import { getStaffSession, endStaffShiftSession } from '../utils/staffAuthSession';

// Housekeeping Staff Configuration
const HOUSEKEEPING_STAFF = {
  MANAGER: {
    id: 'HK-MANAGER',
    name: 'Anita Majhi',
    role: 'Housekeeping Manager',
    code: 'HK-MGR-01',
    phone: '+91 98611 52365',
    emoji: '👩‍💼',
    color: '#10b981'
  },
  SUPERVISOR: {
    id: 'HK-SUPERVISOR',
    name: 'Bikram Mohanty',
    role: 'Housekeeping Supervisor',
    code: 'HK-SUP-01',
    phone: '+91 63707 57541',
    emoji: '👨‍🔧',
    color: '#38bdf8'
  }
};

export { HOUSEKEEPING_STAFF };

// Room service request types for guest QR scans
const SERVICE_TYPES = [
  { id: 'towels', label: 'Extra Towels', icon: '🧺', priority: 'Normal', eta: '10 min' },
  { id: 'water', label: 'Drinking Water', icon: '💧', priority: 'Normal', eta: '5 min' },
  { id: 'pillow', label: 'Extra Pillow', icon: '🛏️', priority: 'Normal', eta: '10 min' },
  { id: 'blanket', label: 'Extra Blanket', icon: '🛌', priority: 'Normal', eta: '10 min' },
  { id: 'ac_repair', label: 'AC Not Working', icon: '❄️', priority: 'Urgent', eta: '20 min' },
  { id: 'plumbing', label: 'Plumbing Issue', icon: '🚿', priority: 'Urgent', eta: '25 min' },
  { id: 'electrical', label: 'Electrical Issue', icon: '⚡', priority: 'Urgent', eta: '20 min' },
  { id: 'cleaning', label: 'Room Cleaning', icon: '🧹', priority: 'Normal', eta: '15 min' },
  { id: 'toiletries', label: 'Toiletry Kit', icon: '🧴', priority: 'Normal', eta: '5 min' },
  { id: 'checkout_clean', label: 'Express Checkout Clean', icon: '✨', priority: 'High', eta: '30 min' },
  { id: 'iron', label: 'Iron & Ironing Board', icon: '👔', priority: 'Normal', eta: '10 min' },
  { id: 'minibar', label: 'Mini-Bar Refill', icon: '🍺', priority: 'Low', eta: '15 min' }
];

// BroadcastChannel name for housekeeping sync
const HK_CHANNEL = 'hotel_elite_inn_housekeeping';
const STORAGE_KEY = 'hei_hk_room_statuses';
const SERVICE_STORAGE_KEY = 'hei_hk_service_requests';

export default function HousekeepingMobilePortal({ onClose, staffRole = 'MANAGER' }) {
  const [shiftSession, setShiftSession] = useState(() => getStaffSession('housekeeping'));

  const effectiveRole = shiftSession?.role === 'HK_SUPERVISOR' ? 'SUPERVISOR' : (shiftSession?.role === 'HK_MANAGER' ? 'MANAGER' : staffRole);
  const baseStaff = HOUSEKEEPING_STAFF[effectiveRole] || HOUSEKEEPING_STAFF.MANAGER;
  const staff = {
    ...baseStaff,
    name: shiftSession?.staffName || baseStaff.name,
    code: shiftSession?.staffId || baseStaff.code,
    role: shiftSession?.role === 'HK_SUPERVISOR' ? 'Housekeeping Supervisor' : (shiftSession?.role === 'HK_MANAGER' ? 'Housekeeping Manager' : baseStaff.role),
    shift: shiftSession?.shift || 'Morning'
  };
  
  // Room statuses: map of { roomNumber: status }
  const [roomStatuses, setRoomStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Build initial from INITIAL_ROOMS_INVENTORY
    const map = {};
    INITIAL_ROOMS_INVENTORY.forEach(r => { map[r.roomNumber] = r.status || 'Available'; });
    return map;
  });

  // Service requests queue
  const [serviceRequests, setServiceRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(SERVICE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // UI State
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'requests', 'log'
  const [floorFilter, setFloorFilter] = useState('all'); // 'all', '1', '2', '3'
  const [statusFilter, setStatusFilter] = useState('dirty'); // 'all', 'dirty', 'cleaning', 'available', 'occupied'
  const [toast, setToast] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null); // room number for detail view
  const [completionLog, setCompletionLog] = useState(() => {
    try {
      const stored = localStorage.getItem('hei_hk_completion_log');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [createServiceModalOpen, setCreateServiceModalOpen] = useState(false);
  const [newServiceRoom, setNewServiceRoom] = useState('101');
  const [newServiceType, setNewServiceType] = useState('Extra Towels');
  const [newServicePriority, setNewServicePriority] = useState('Normal');
  const [newServiceNotes, setNewServiceNotes] = useState('');
  const channelRef = useRef(null);

  // Show toast helper
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }, []);

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roomStatuses));
  }, [roomStatuses]);

  useEffect(() => {
    localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('hei_hk_completion_log', JSON.stringify(completionLog));
  }, [completionLog]);

  // BroadcastChannel: Listen for events from Reception, Guest QR portals
  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(HK_CHANNEL);

      channelRef.current.onmessage = (event) => {
        const { type, payload } = event.data || {};

        if (type === 'ROOM_CHECKOUT' || type === 'ROOM_DIRTY') {
          // Reception checked out a room -> mark it dirty on our portal
          setRoomStatuses(prev => ({
            ...prev,
            [payload.roomNumber]: 'Dirty'
          }));
          playHousekeepingChime();
          setNotificationCount(prev => prev + 1);
          showToast(`\uD83D\uDEA8 Room ${payload.roomNumber} is now DIRTY - Checkout completed!`);
        }

        if (type === 'ROOM_INSPECTED' && payload?.roomNumber) {
          setRoomStatuses(prev => ({ ...prev, [payload.roomNumber]: 'Clean & Inspected' }));
        }

        if ((type === 'ROOM_CLEANED' || type === 'ROOM_AVAILABLE') && payload?.roomNumber) {
          setRoomStatuses(prev => ({ ...prev, [payload.roomNumber]: 'Available' }));
        }

        if (type === 'ROOM_MAINTENANCE' && payload?.roomNumber) {
          setRoomStatuses(prev => ({ ...prev, [payload.roomNumber]: 'Maintenance' }));
        }

        if (type === 'ROOM_SERVICE_REQUEST') {
          // Guest scanned QR and requested room service
          const newReq = {
            id: `SR-${Date.now().toString().slice(-6)}`,
            roomNumber: payload.roomNumber,
            serviceType: payload.serviceType || 'General Request',
            description: payload.description || '',
            priority: payload.priority || 'Normal',
            guestName: payload.guestName || 'Room Guest',
            status: 'Pending',
            requestedAt: new Date().toISOString()
          };
          setServiceRequests(prev => [newReq, ...prev]);
          playHousekeepingChime();
          setNotificationCount(prev => prev + 1);
          showToast(`🔔 Room ${payload.roomNumber}: ${payload.serviceType || 'Service Request'}`);
        }

        if (type === 'ROOM_STATUS_SYNC') {
          // Full status sync from reception
          if (payload.statuses) {
            setRoomStatuses(prev => ({ ...prev, ...payload.statuses }));
          }
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [showToast]);

  // Polling heartbeat: Sync room statuses from localStorage (cross-tab fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRoomStatuses(prev => {
            // Only update if there are actual changes
            const hasChanges = Object.keys(parsed).some(k => parsed[k] !== prev[k]);
            return hasChanges ? { ...prev, ...parsed } : prev;
          });
        }
        const storedReqs = localStorage.getItem(SERVICE_STORAGE_KEY);
        if (storedReqs) {
          const parsedReqs = JSON.parse(storedReqs);
          setServiceRequests(parsedReqs);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // =================== ACTIONS ===================

  // Mark room as Under Cleaning
  const handleStartCleaning = (roomNum) => {
    setRoomStatuses(prev => ({ ...prev, [roomNum]: 'Cleaning' }));

    // Broadcast to Reception
    try {
      const ch = new BroadcastChannel(HK_CHANNEL);
      ch.postMessage({ type: 'ROOM_STATUS_UPDATE', payload: { roomNumber: roomNum, newStatus: 'Cleaning', updatedBy: staff.name } });
      ch.close();
    } catch {}

    // D1 Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_housekeeping_status',
        payload: { roomNumber: roomNum, newStatus: 'Under Cleaning', previousStatus: 'Dirty', attendantName: staff.name, notes: `Cleaning started by ${staff.name} (${staff.role})` }
      })
    }).catch(err => console.warn('HK offline sync:', err));

    showToast(`\uD83E\uDDF9 Room ${roomNum} marked 'Under Cleaning' by ${staff.name}`);
    setSelectedRoom(null);
  };

  // Mark room as Clean (Available) -> This turns room GREEN on reception desktop
  const handleMarkClean = (roomNum) => {
    setRoomStatuses(prev => ({ ...prev, [roomNum]: 'Available' }));

    // Broadcast to ALL open tabs (reception, other housekeeping portals)
    try {
      const ch = new BroadcastChannel(HK_CHANNEL);
      ch.postMessage({
        type: 'ROOM_CLEANED',
        payload: {
          roomNumber: roomNum,
          newStatus: 'Available',
          cleanedBy: staff.name,
          cleanedAt: new Date().toISOString(),
          role: staff.role
        }
      });
      ch.close();
    } catch {}

    // D1 Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_housekeeping_status',
        payload: { roomNumber: roomNum, newStatus: 'Clean & Inspected', previousStatus: 'Under Cleaning', attendantName: staff.name, notes: `Room inspected & cleaned by ${staff.name}. Ready for guest allocation.` }
      })
    }).catch(err => console.warn('HK offline sync:', err));

    // Add to completion log
    setCompletionLog(prev => [{
      roomNumber: roomNum,
      cleanedBy: staff.name,
      completedAt: new Date().toISOString(),
      role: staff.role
    }, ...prev.slice(0, 99)]);

    showToast(`\u2705 Room ${roomNum} is now CLEAN & AVAILABLE! Reception will see it as GREEN.`);
    setSelectedRoom(null);
  };

  // Accept a service request
  const handleAcceptRequest = (reqId) => {
    setServiceRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, status: 'In Progress', acceptedBy: staff.name, acceptedAt: new Date().toISOString() } : r
    ));
    showToast('\uD83D\uDC4D Request accepted!');
  };

  // Complete a service request
  const handleCompleteRequest = (reqId) => {
    setServiceRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, status: 'Completed', completedBy: staff.name, completedAt: new Date().toISOString() } : r
    ));
    showToast('\u2705 Request completed!');
  };

  // Create a manual service request from mobile portal
  const handleCreateManualServiceRequest = () => {
    const newTicket = {
      id: `SR-${Date.now().toString().slice(-6)}`,
      roomNumber: newServiceRoom,
      serviceType: newServiceType,
      description: newServiceNotes ? `${newServiceNotes} (Logged by ${staff.name})` : `Dispatched by ${staff.name} (${staff.role})`,
      priority: newServicePriority,
      guestName: `Room ${newServiceRoom}`,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      dispatchedBy: staff.name
    };

    setServiceRequests(prev => [newTicket, ...prev]);

    // Broadcast to other open tabs
    try {
      const ch = new BroadcastChannel(HK_CHANNEL);
      ch.postMessage({ type: 'ROOM_SERVICE_REQUEST', payload: newTicket });
      ch.close();
    } catch {}

    // D1 API sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'place_room_service',
        payload: {
          roomNumber: newServiceRoom,
          serviceType: newServiceType,
          description: newTicket.description,
          priority: newServicePriority
        }
      })
    }).catch(err => console.warn('HK manual service sync:', err));

    showToast(`\uD83D\uDECE\uFE0F Service ticket created for Room ${newServiceRoom}: ${newServiceType}`);
    setCreateServiceModalOpen(false);
    setNewServiceNotes('');
  };

  // =================== DERIVED DATA ===================

  const allRoomNumbers = INITIAL_ROOMS_INVENTORY.map(r => r.roomNumber);

  const filteredRooms = allRoomNumbers.filter(rn => {
    if (floorFilter !== 'all' && rn[0] !== floorFilter) return false;
    const status = roomStatuses[rn] || 'Available';
    if (statusFilter === 'all') return true;
    if (statusFilter === 'dirty') return status === 'Dirty' || status === 'Vacant Dirty';
    if (statusFilter === 'cleaning') return status === 'Cleaning' || status === 'Under Cleaning';
    if (statusFilter === 'available') return status === 'Available' || status === 'Clean & Inspected';
    if (statusFilter === 'occupied') return status === 'Occupied' || status === 'Occupied Clean';
    return true;
  });

  const dirtyCount = allRoomNumbers.filter(rn => ['Dirty', 'Vacant Dirty'].includes(roomStatuses[rn])).length;
  const cleaningCount = allRoomNumbers.filter(rn => ['Cleaning', 'Under Cleaning'].includes(roomStatuses[rn])).length;
  const availableCount = allRoomNumbers.filter(rn => ['Available', 'Clean & Inspected'].includes(roomStatuses[rn])).length;
  const occupiedCount = allRoomNumbers.filter(rn => ['Occupied', 'Occupied Clean'].includes(roomStatuses[rn])).length;

  const pendingRequests = serviceRequests.filter(r => r.status === 'Pending').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'In Progress').length;

  // =================== ROOM STATUS HELPERS ===================

  const getStatusColor = (status) => {
    if (status === 'Dirty' || status === 'Vacant Dirty') return '#ef4444';
    if (status === 'Cleaning' || status === 'Under Cleaning') return '#f59e0b';
    if (status === 'Available' || status === 'Clean & Inspected') return '#10b981';
    if (status === 'Occupied' || status === 'Occupied Clean') return '#3b82f6';
    if (status === 'Maintenance' || status === 'Out of Order') return '#6b7280';
    return '#94a3b8';
  };

  const getStatusEmoji = (status) => {
    if (status === 'Dirty' || status === 'Vacant Dirty') return '\uD83D\uDD34';
    if (status === 'Cleaning' || status === 'Under Cleaning') return '\uD83D\uDFE1';
    if (status === 'Available' || status === 'Clean & Inspected') return '\uD83D\uDFE2';
    if (status === 'Occupied' || status === 'Occupied Clean') return '\uD83D\uDD35';
    return '\u26AA';
  };

  const getStatusLabel = (status) => {
    if (status === 'Dirty' || status === 'Vacant Dirty') return 'DIRTY';
    if (status === 'Cleaning' || status === 'Under Cleaning') return 'CLEANING';
    if (status === 'Available' || status === 'Clean & Inspected') return 'CLEAN';
    if (status === 'Occupied' || status === 'Occupied Clean') return 'OCCUPIED';
    return status?.toUpperCase() || 'UNKNOWN';
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // =================== RENDER ===================

  const handleClockOut = async () => {
    if (window.confirm(`Clock out from ${staff.name}'s ${shiftSession?.shift || 'current'} housekeeping shift?`)) {
      await endStaffShiftSession('housekeeping', shiftSession);
      setShiftSession(null);
    }
  };

  if (!shiftSession) {
    return (
      <StaffShiftLoginModal
        portal="housekeeping"
        onLoginSuccess={(sess) => setShiftSession(sess)}
        onCancel={onClose}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617, #0f172a, #020617)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '0.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#fff',
          padding: '0.65rem 1.2rem',
          borderRadius: '10px',
          fontSize: '0.78rem',
          fontWeight: 700,
          zIndex: 99999,
          maxWidth: '90vw',
          textAlign: 'center',
          boxShadow: '0 6px 25px rgba(16, 185, 129, 0.5)',
          animation: 'slideDown 0.3s ease'
        }}>
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        padding: '0.85rem 1rem',
        background: 'rgba(0,0,0,0.6)',
        borderBottom: `2px solid ${staff.color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: `${staff.color}20`,
            border: `2px solid ${staff.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {staff.emoji}
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fff' }}>
              {staff.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: staff.color, fontWeight: 700, letterSpacing: '0.03em' }}>
              {staff.role} | {staff.code}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <Bell size={20} color={notificationCount > 0 ? '#fbbf24' : '#64748b'} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.55rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>

          {/* Clock Out / Shift End Button */}
          <button
            type="button"
            title="Clock out and end shift"
            onClick={handleClockOut}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={13} />
            <span>Clock Out</span>
          </button>

          {onClose && (
            <button type="button" onClick={onClose} title="Exit to portal" style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              <ArrowLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Status Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.35rem',
        padding: '0.65rem 0.5rem',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0
      }}>
        {[
          { label: 'Dirty', count: dirtyCount, color: '#ef4444', filterKey: 'dirty' },
          { label: 'Cleaning', count: cleaningCount, color: '#f59e0b', filterKey: 'cleaning' },
          { label: 'Clean', count: availableCount, color: '#10b981', filterKey: 'available' },
          { label: 'Occupied', count: occupiedCount, color: '#3b82f6', filterKey: 'occupied' }
        ].map(s => (
          <button
            key={s.filterKey}
            type="button"
            onClick={() => { setStatusFilter(s.filterKey); setActiveTab('rooms'); }}
            style={{
              padding: '0.45rem 0.25rem',
              borderRadius: '8px',
              background: statusFilter === s.filterKey ? `${s.color}20` : 'rgba(255,255,255,0.03)',
              border: statusFilter === s.filterKey ? `1.5px solid ${s.color}` : '1px solid rgba(255,255,255,0.08)',
              color: statusFilter === s.filterKey ? s.color : '#94a3b8',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{s.count}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* 3-Tab Navigation: Rooms | Requests | Log */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0
      }}>
        {[
          { key: 'rooms', label: '\uD83C\uDFE8 Rooms', badge: dirtyCount > 0 ? dirtyCount : null },
          { key: 'requests', label: '\uD83D\uDD14 Requests', badge: pendingRequests > 0 ? pendingRequests : null },
          { key: 'log', label: '\uD83D\uDCCB Log', badge: null }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${staff.color}` : '2px solid transparent',
              color: activeTab === tab.key ? '#fff' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                marginLeft: '4px',
                background: '#ef4444',
                color: '#fff',
                padding: '1px 5px',
                borderRadius: '10px',
                fontSize: '0.6rem',
                fontWeight: 900
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', paddingBottom: '4rem' }}>

        {/* ========== TAB 1: ROOMS GRID ========== */}
        {activeTab === 'rooms' && (
          <div>
            {/* Floor Filter */}
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
              {[
                { key: 'all', label: 'All 27' },
                { key: '1', label: '1F (101-109)' },
                { key: '2', label: '2F (201-209)' },
                { key: '3', label: '3F (301-309)' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFloorFilter(f.key)}
                  style={{
                    flex: 1,
                    padding: '0.3rem',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: floorFilter === f.key ? staff.color : 'rgba(255,255,255,0.04)',
                    color: floorFilter === f.key ? '#000' : '#94a3b8',
                    border: 'none'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#475569' }}>
                <Sparkles size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>No rooms match this filter</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.45rem'
              }}>
                {filteredRooms.map(roomNum => {
                  const status = roomStatuses[roomNum] || 'Available';
                  const statusColor = getStatusColor(status);
                  const isDirty = status === 'Dirty' || status === 'Vacant Dirty';
                  const isCleaning = status === 'Cleaning' || status === 'Under Cleaning';

                  return (
                    <button
                      key={roomNum}
                      type="button"
                      onClick={() => (isDirty || isCleaning) ? setSelectedRoom(roomNum) : null}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRadius: '10px',
                        background: `${statusColor}12`,
                        border: `1.5px solid ${statusColor}50`,
                        cursor: (isDirty || isCleaning) ? 'pointer' : 'default',
                        textAlign: 'center',
                        transition: 'transform 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: statusColor }}>
                        {roomNum}
                      </div>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                        {getStatusEmoji(status)} {getStatusLabel(status)}
                      </div>
                      {(isDirty || isCleaning) && (
                        <div style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: statusColor,
                          animation: isDirty ? 'pulse 1.5s ease-in-out infinite' : 'none'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Room Detail Action Sheet */}
            {selectedRoom && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px 16px 0 0',
                padding: '1.25rem',
                zIndex: 9999,
                boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>Room {selectedRoom}</span>
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: `${getStatusColor(roomStatuses[selectedRoom])}20`,
                      color: getStatusColor(roomStatuses[selectedRoom])
                    }}>
                      {getStatusEmoji(roomStatuses[selectedRoom])} {getStatusLabel(roomStatuses[selectedRoom])}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedRoom(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  {(roomStatuses[selectedRoom] === 'Dirty' || roomStatuses[selectedRoom] === 'Vacant Dirty') && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartCleaning(selectedRoom)}
                        style={{
                          width: '100%',
                          padding: '0.85rem',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          border: 'none',
                          color: '#000',
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        \uD83E\uDDF9 Start Cleaning
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkClean(selectedRoom)}
                        style={{
                          width: '100%',
                          padding: '0.85rem',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        \u2705 Mark Clean & Inspected (Skip to GREEN)
                      </button>
                    </>
                  )}

                  {(roomStatuses[selectedRoom] === 'Cleaning' || roomStatuses[selectedRoom] === 'Under Cleaning') && (
                    <button
                      type="button"
                      onClick={() => handleMarkClean(selectedRoom)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      \u2705 CLEANING COMPLETE — Mark Room GREEN
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB 2: SERVICE REQUESTS ========== */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', padding: '0 0.25rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                \uD83D\uDD14 GUEST & STAFF SERVICE REQUESTS ({serviceRequests.length})
              </div>
              <button
                type="button"
                onClick={() => setCreateServiceModalOpen(true)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                \u2795 Log / Dispatch Service
              </button>
            </div>

            {serviceRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#475569' }}>
                <BellRing size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>No service requests yet</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                  When a guest scans their room QR code and submits a request, it will appear here with a chime alert.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {serviceRequests.map(req => {
                  const priorityColor = req.priority === 'Urgent' ? '#ef4444' : req.priority === 'High' ? '#f59e0b' : '#10b981';
                  return (
                    <div key={req.id} style={{
                      background: req.status === 'Completed' ? 'rgba(255,255,255,0.02)' : `${priorityColor}08`,
                      border: `1px solid ${req.status === 'Completed' ? 'rgba(255,255,255,0.06)' : priorityColor + '30'}`,
                      borderRadius: '10px',
                      padding: '0.75rem',
                      opacity: req.status === 'Completed' ? 0.5 : 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>Room {req.roomNumber}</span>
                          <span style={{
                            marginLeft: '0.4rem',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: `${priorityColor}20`,
                            color: priorityColor,
                            textTransform: 'uppercase'
                          }}>
                            {req.priority}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                          {formatTime(req.requestedAt)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.15rem' }}>
                        {req.serviceType}
                      </div>
                      {req.description && (
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          {req.description}
                        </div>
                      )}

                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: '0.4rem' }}>
                        Guest: {req.guestName || 'Room Guest'} | Status: <strong style={{ color: req.status === 'Completed' ? '#10b981' : req.status === 'In Progress' ? '#f59e0b' : '#ef4444' }}>{req.status}</strong>
                      </div>

                      {req.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          \uD83D\uDC4D Accept & Assign to Me
                        </button>
                      )}

                      {req.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => handleCompleteRequest(req.id)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          \u2705 Mark Completed
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== TAB 3: COMPLETION LOG ========== */}
        {activeTab === 'log' && (
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', padding: '0 0.25rem' }}>
              \uD83D\uDCCB CLEANING COMPLETION LOG — Today's Activity
            </div>

            {completionLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#475569' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>No completed cleanings yet today</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {completionLog.map((entry, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10b981' }}>
                        \u2705 Room {entry.roomNumber}
                      </span>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                        Cleaned by {entry.cleanedBy} ({entry.role})
                      </div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {formatTime(entry.completedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Service Request Modal / Drawer */}
        {createServiceModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '85vh',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px 16px 0 0',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#fff' }}>
                    \uD83D\uDECE\uFE0F Dispatch Room Service Option
                  </h4>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    Logged by {staff.name} ({staff.role})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateServiceModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Room Selection */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Target Room
                </label>
                <select
                  value={newServiceRoom}
                  onChange={e => setNewServiceRoom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  {allRoomNumbers.map(rn => (
                    <option key={rn} value={rn}>Room {rn} ({roomStatuses[rn] || 'Available'})</option>
                  ))}
                </select>
              </div>

              {/* Service Type Options Grid */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Select Service Option
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.4rem',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '2px'
                }}>
                  {SERVICE_TYPES.map(st => {
                    const isSelected = newServiceType === st.label;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setNewServiceType(st.label);
                          if (st.priority === 'Urgent') setNewServicePriority('Urgent');
                        }}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                          border: isSelected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                          color: isSelected ? '#34d399' : '#cbd5e1',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{st.icon}</span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {st.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Priority Level
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Normal', 'High', 'Urgent'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewServicePriority(p)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: 'none',
                        background: newServicePriority === p 
                          ? (p === 'Urgent' ? '#ef4444' : p === 'High' ? '#f59e0b' : '#10b981')
                          : '#1e293b',
                        color: '#fff'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Optional Instructions / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra pillow needed on left cot..."
                  value={newServiceNotes}
                  onChange={e => setNewServiceNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCreateManualServiceRequest}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                \uD83D\uDECE\uFE0F Confirm & Dispatch Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hotel Branding Footer */}
      <div style={{
        padding: '0.5rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.5)',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, letterSpacing: '0.05em' }}>
          HOTEL ELITE INN, MUNIGUDA | HOUSEKEEPING MOBILE PORTAL v1.0
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
