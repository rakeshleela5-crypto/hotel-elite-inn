import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Clock, User, 
  RotateCcw, ShieldCheck, Bed, Wrench, Search, RefreshCw, X, Phone
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function HousekeepingPortal({
  isOpen,
  onClose,
  rooms = [],
  onUpdateRoomStatus
}) {
  const [selectedAttendant, setSelectedAttendant] = useState('Bikram Mohanty');
  const [filterTab, setFilterTab] = useState('dirty'); // 'dirty', 'cleaning', 'inspected', 'all'
  const [cleaningChecklist, setCleaningChecklist] = useState({
    linenChanged: true,
    bathroomSanitized: true,
    towelsReplaced: true,
    waterReplenished: true,
    dustingCompleted: true
  });
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');
  const [cleaningNotes, setCleaningNotes] = useState('');

  const ATTENDANTS = [
    { name: 'Bikram Mohanty', phone: '+91 63707 57541', role: 'Floor Lead' },
    { name: 'Siddu Rao', phone: '+91 94371 00214', role: 'Room Attendant' },
    { name: 'Sakti Majhi', phone: '+91 98610 55431', role: 'Room Attendant' },
    { name: 'Krishna Nayak', phone: '+91 94378 12398', role: 'Linen & Laundry' },
    { name: 'Monnu Pradhan', phone: '+91 63702 44901', role: 'Housekeeping Boy' },
    { name: 'Ramesh Gouda', phone: '+91 94382 77112', role: 'General Services' },
    { name: 'Suresh Sabar', phone: '+91 98619 44320', role: 'Night Attendant' }
  ];

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter rooms based on status
  const dirtyRooms = rooms.filter(r => r.status === 'Dirty' || r.status === 'Vacant Dirty');
  const cleaningRooms = rooms.filter(r => r.status === 'Cleaning' || r.status === 'Under Cleaning');
  const cleanRooms = rooms.filter(r => r.status === 'Available' || r.status === 'Clean & Inspected');
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied' || r.status === 'Occupied Clean');
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Out of Order');

  const displayedRooms = filterTab === 'dirty' ? dirtyRooms :
                         filterTab === 'cleaning' ? cleaningRooms :
                         filterTab === 'inspected' ? cleanRooms :
                         filterTab === 'occupied' ? occupiedRooms : rooms;

  const handleStartCleaning = (roomNum) => {
    if (onUpdateRoomStatus) {
      onUpdateRoomStatus(roomNum, 'Cleaning');
    }
    
    // Cloudflare D1 Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_housekeeping_status',
        payload: {
          roomNumber: roomNum,
          newStatus: 'Under Cleaning',
          previousStatus: 'Dirty',
          attendantName: selectedAttendant,
          notes: `Cleaning started by ${selectedAttendant}`
        }
      })
    }).catch(err => console.warn('Housekeeping offline sync:', err));

    showToast(`🧹 Room ${roomNum} marked 'Under Cleaning' by ${selectedAttendant}`);
  };

  const handleCompleteCleanAndInspect = (roomNum) => {
    if (onUpdateRoomStatus) {
      onUpdateRoomStatus(roomNum, 'Available');
    }

    // Cloudflare D1 Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_housekeeping_status',
        payload: {
          roomNumber: roomNum,
          newStatus: 'Clean & Inspected',
          previousStatus: 'Under Cleaning',
          attendantName: selectedAttendant,
          notes: cleaningNotes || '5-point room sanitation verified. Ready for guest allocation.'
        }
      })
    }).catch(err => console.warn('Housekeeping offline sync:', err));

    setSelectedRoomNumber(null);
    setCleaningNotes('');
    showToast(`✓ Room ${roomNum} verified & marked 'CLEAN & INSPECTED'! Now Available for Front Desk.`);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#0a0e1a',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        overflow: 'hidden'
      }}>
        {/* Header Ribbon */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.9), rgba(15, 23, 42, 0.95))',
          borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1.5px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>
                  Mobile Housekeeping Attendant Portal
                </h2>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  color: '#34d399',
                  border: '1px solid #10b981',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}>
                  Live Floor Sync
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {HOTEL_CONFIG.name} • Muniguda • Room Attendant &amp; Turnaround Accountability Console
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <User size={14} color="#34d399" />
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Attendant:</span>
              <select
                value={selectedAttendant}
                onChange={(e) => setSelectedAttendant(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {ATTENDANTS.map(a => (
                  <option key={a.name} value={a.name} style={{ background: '#0f172a', color: '#fff' }}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '8px',
                width: 32,
                height: 32,
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

        {/* Feedback Toast */}
        {feedbackToast && (
          <div style={{
            background: 'linear-gradient(90deg, #10b981, #059669)',
            color: '#fff',
            padding: '0.6rem 1.25rem',
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

        {/* Status Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'dirty', label: '🚨 Dirty (Needs Cleaning)', count: dirtyRooms.length, color: '#ef4444' },
            { id: 'cleaning', label: '🧹 Under Cleaning', count: cleaningRooms.length, color: '#f59e0b' },
            { id: 'inspected', label: '✓ Clean & Available', count: cleanRooms.length, color: '#10b981' },
            { id: 'occupied', label: '🏨 Occupied In-House', count: occupiedRooms.length, color: '#38bdf8' },
            { id: 'all', label: 'All Property Rooms', count: rooms.length, color: '#cbd5e1' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: filterTab === tab.id ? `${tab.color}22` : 'rgba(255,255,255,0.03)',
                border: filterTab === tab.id ? `1.5px solid ${tab.color}` : '1px solid rgba(255,255,255,0.08)',
                color: filterTab === tab.id ? tab.color : '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: filterTab === tab.id ? tab.color : 'rgba(255,255,255,0.1)',
                color: filterTab === tab.id ? '#000' : '#fff',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '8px',
                fontWeight: 900
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Body: Room Cards & Inspection Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedRooms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CheckCircle2 size={42} color="#10b981" />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>No rooms in this category right now!</div>
              <div style={{ fontSize: '0.8rem' }}>All checked-out rooms are either clean or already attended to. Great job team!</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.85rem'
            }}>
              {displayedRooms.map(r => {
                const isDirty = r.status === 'Dirty' || r.status === 'Vacant Dirty';
                const isCleaning = r.status === 'Cleaning' || r.status === 'Under Cleaning';
                const isAvailable = r.status === 'Available' || r.status === 'Clean & Inspected';
                const isOccupied = r.status === 'Occupied' || r.status === 'Occupied Clean';

                return (
                  <div
                    key={r.roomNumber}
                    style={{
                      background: isDirty 
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.2))'
                        : isCleaning
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(180, 83, 9, 0.25))'
                        : isAvailable
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2))'
                        : 'rgba(30, 41, 59, 0.4)',
                      border: isDirty 
                        ? '1.5px solid #ef4444' 
                        : isCleaning 
                        ? '1.5px solid #f59e0b'
                        : isAvailable 
                        ? '1px solid rgba(16, 185, 129, 0.4)' 
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
                          background: isDirty ? '#ef4444' : isCleaning ? '#f59e0b' : isAvailable ? '#10b981' : '#38bdf8',
                          color: isCleaning ? '#000' : '#fff'
                        }}>
                          {isDirty ? '🚨 DIRTY' : isCleaning ? '🧹 CLEANING' : isAvailable ? '✓ READY' : 'OCCUPIED'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {r.tier || 'Executive Room'} • Floor {r.floor || String(r.roomNumber)[0]}
                      </div>

                      {r.currentGuestName && (
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                          Guest: <strong style={{ color: '#fbbf24' }}>{r.currentGuestName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {isDirty && (
                        <button
                          onClick={() => handleStartCleaning(r.roomNumber)}
                          style={{
                            padding: '0.6rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#000',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Clock size={15} /> Start Cleaning
                        </button>
                      )}

                      {isCleaning && (
                        <button
                          onClick={() => setSelectedRoomNumber(r.roomNumber)}
                          style={{
                            padding: '0.6rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <CheckCircle2 size={15} /> Verify &amp; Mark Clean
                        </button>
                      )}

                      {isAvailable && (
                        <div style={{ fontSize: '0.72rem', color: '#34d399', textAlign: 'center', fontWeight: 700 }}>
                          ✓ Ready for Front Desk Allocation
                        </div>
                      )}

                      {isOccupied && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Mark Room ${r.roomNumber} as Checked Out (Dirty)?`)) {
                              if (onUpdateRoomStatus) onUpdateRoomStatus(r.roomNumber, 'Dirty', null, null);
                              showToast(`Room ${r.roomNumber} turned DIRTY upon checkout.`);
                            }
                          }}
                          style={{
                            padding: '0.45rem',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Guest Vacated? ➔ Mark Dirty
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sanitation Checklist Inspection Modal */}
        {selectedRoomNumber && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 10000
          }}>
            <div style={{
              background: '#0d1322',
              border: '1.5px solid #10b981',
              borderRadius: '14px',
              padding: '1.5rem',
              maxWidth: '480px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem', fontWeight: 900 }}>
                  Room {selectedRoomNumber} Sanitation Inspection
                </h3>
                <button
                  onClick={() => setSelectedRoomNumber(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Attendant: <strong style={{ color: '#fbbf24' }}>{selectedAttendant}</strong>
              </div>

              {/* 5-Point Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { key: 'linenChanged', label: '1. Fresh bedsheet & pillow covers fitted crisp' },
                  { key: 'bathroomSanitized', label: '2. Bathroom floors, tiles & commode sanitized' },
                  { key: 'towelsReplaced', label: '3. Fresh dry towels & toiletries placed' },
                  { key: 'waterReplenished', label: '4. Packaged drinking water & glasses ready' },
                  { key: 'dustingCompleted', label: '5. Furniture dusted, AC remote & TV verified' }
                ].map(item => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#f8fafc',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cleaningChecklist[item.key]}
                      onChange={(e) => setCleaningChecklist({ ...cleaningChecklist, [item.key]: e.target.checked })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Floor Attendant Notes / Remarks:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra pillow supplied, Room 100% spotless"
                  value={cleaningNotes}
                  onChange={(e) => setCleaningNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#070a12',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedRoomNumber(null)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCompleteCleanAndInspect(selectedRoomNumber)}
                  style={{
                    flex: 2,
                    padding: '0.65rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ShieldCheck size={16} /> Confirm Clean &amp; Release to Front Desk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
