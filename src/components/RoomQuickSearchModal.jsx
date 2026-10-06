import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, X, Hotel, Bed, User, Phone, Calendar, DollarSign, 
  CheckCircle2, AlertTriangle, Sparkles, Key, Utensils, 
  FileText, ShieldCheck, ArrowRight, CornerDownLeft, 
  Layers, RefreshCw, MessageCircle, Wrench, Broom, Check
} from 'lucide-react';
import { INITIAL_ROOMS_INVENTORY } from '../data/hotelData';

export default function RoomQuickSearchModal({
  isOpen,
  onClose,
  rooms = [],
  bookings = [],
  onOpenMasterFolio,
  onOpenCannonKitchenPOS,
  onOpenRoomQr,
  onUpdateRoomStatus,
  onOpenHousekeeping,
  onSelectBooking
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFloorFilter, setActiveFloorFilter] = useState('all'); // 'all', '1', '2', '3', 'occupied', 'available', 'dirty'
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');
  const inputRef = useRef(null);

  // Fallback to INITIAL_ROOMS_INVENTORY if rooms array is empty
  const allRooms = useMemo(() => {
    return rooms && rooms.length > 0 ? rooms : INITIAL_ROOMS_INVENTORY;
  }, [rooms]);

  // Map active bookings by room number for instant lookup
  const bookingMap = useMemo(() => {
    const map = {};
    (bookings || []).forEach(b => {
      if (b.roomNumber && (b.bookingStatus === 'Checked In' || b.bookingStatus === 'Confirmed' || !b.bookingStatus)) {
        map[String(b.roomNumber)] = b;
      }
    });
    return map;
  }, [bookings]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    } else {
      setSearchTerm('');
      setActiveFloorFilter('all');
    }
  }, [isOpen]);

  // Keyboard navigation: Escape to close, Arrow keys to cycle rooms
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered rooms based on search term & quick-filter tabs
  const filteredRooms = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return allRooms.filter(r => {
      const roomNum = String(r.roomNumber || '');
      const floorStr = String(r.floor || '');
      const tierStr = (r.tier || r.roomType || '').toLowerCase();
      const statusStr = (r.status || '').toLowerCase();
      const activeBooking = bookingMap[roomNum];
      const guestName = (activeBooking?.guestName || r.currentGuestName || '').toLowerCase();
      const guestPhone = (activeBooking?.guestPhone || '').toLowerCase();
      const company = (activeBooking?.company || '').toLowerCase();

      // Floor / Status Filter
      if (activeFloorFilter === '1' && floorStr !== '1') return false;
      if (activeFloorFilter === '2' && floorStr !== '2') return false;
      if (activeFloorFilter === '3' && floorStr !== '3') return false;
      if (activeFloorFilter === 'occupied' && statusStr !== 'occupied' && !activeBooking) return false;
      if (activeFloorFilter === 'available' && (statusStr === 'occupied' || activeBooking || statusStr === 'dirty')) return false;
      if (activeFloorFilter === 'dirty' && statusStr !== 'dirty' && statusStr !== 'cleaning') return false;

      // Text Query Match
      if (!q) return true;

      return (
        roomNum.includes(q) ||
        `room ${roomNum}`.includes(q) ||
        `floor ${floorStr}`.includes(q) ||
        tierStr.includes(q) ||
        statusStr.includes(q) ||
        guestName.includes(q) ||
        guestPhone.includes(q) ||
        company.includes(q)
      );
    });
  }, [allRooms, searchTerm, activeFloorFilter, bookingMap]);

  // Keep selected room valid
  useEffect(() => {
    if (filteredRooms.length > 0) {
      const exists = filteredRooms.some(r => String(r.roomNumber) === String(selectedRoomNumber));
      if (!exists) {
        setSelectedRoomNumber(String(filteredRooms[0].roomNumber));
      }
    }
  }, [filteredRooms, selectedRoomNumber]);

  // Selected room details
  const currentRoom = useMemo(() => {
    return allRooms.find(r => String(r.roomNumber) === String(selectedRoomNumber)) || allRooms[0];
  }, [allRooms, selectedRoomNumber]);

  const currentBooking = currentRoom ? bookingMap[String(currentRoom.roomNumber)] : null;
  const isOccupied = Boolean(currentBooking || currentRoom?.status?.toLowerCase() === 'occupied');
  const isDirty = Boolean(currentRoom?.status?.toLowerCase() === 'dirty' || currentRoom?.status?.toLowerCase() === 'cleaning');

  if (!isOpen) return null;

  return (
    <div 
      className="official-invoice-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0a101d',
          border: '1.5px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 30px rgba(212, 175, 55, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Top Search Ribbon Header */}
        <div style={{
          padding: '1.1rem 1.25rem 0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 16, 29, 0.98))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d4af37, #b89628)',
                color: '#000',
                padding: '5px',
                borderRadius: '8px',
                display: 'flex'
              }}>
                <Hotel size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>27-ROOM COMMAND NAVIGATOR</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.2)', color: '#fbbf24', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '1px 6px', borderRadius: '10px' }}>
                    FLOORS 1–3
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Instant zero-click room lookup • Master Folio • Housekeeping • Room Service
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                color: '#94a3b8'
              }}>
                ESC to close
              </kbd>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '5px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search Input Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#040711',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
          }}>
            <Search size={18} color="var(--gold-glow, #fbbf24)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search 27 rooms: Type room # (e.g. 104, 205), guest name, tier (Suite), floor, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                fontWeight: 600
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs Strip */}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingTop: '0.65rem',
            scrollbarWidth: 'none'
          }}>
            {[
              { id: 'all', label: `All Rooms (27)` },
              { id: '1', label: `Floor 1 (101–109)` },
              { id: '2', label: `Floor 2 (201–209)` },
              { id: '3', label: `Floor 3 (301–309)` },
              { id: 'occupied', label: `🔴 Occupied` },
              { id: 'available', label: `🟢 Available` },
              { id: 'dirty', label: `🟡 Dirty` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFloorFilter(tab.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '14px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: activeFloorFilter === tab.id ? '#fbbf24' : 'rgba(255, 255, 255, 0.05)',
                  color: activeFloorFilter === tab.id ? '#000' : '#cbd5e1',
                  border: activeFloorFilter === tab.id ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Split Body: Left List + Right 360° Operations Console */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          minHeight: '420px'
        }}>
          {/* LEFT: 27 Rooms Filtered Scroll List */}
          <div style={{
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            overflowY: 'auto',
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, padding: '0 0.25rem 0.25rem' }}>
              MATCHING INVENTORY ({filteredRooms.length} OF 27 KEYS)
            </div>

            {filteredRooms.map(r => {
              const rNum = String(r.roomNumber);
              const b = bookingMap[rNum];
              const isOcc = Boolean(b || r.status?.toLowerCase() === 'occupied');
              const isDirt = Boolean(r.status?.toLowerCase() === 'dirty');
              const isSelected = rNum === String(selectedRoomNumber);

              return (
                <div
                  key={rNum}
                  onClick={() => setSelectedRoomNumber(rNum)}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(15, 23, 42, 0.9))' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected 
                      ? '1.5px solid #fbbf24' 
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.55rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {/* Big Room Number Badge */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: isOcc ? '#7f1d1d' : isDirt ? '#78350f' : '#064e3b',
                      border: isOcc ? '1px solid #ef4444' : isDirt ? '1px solid #f59e0b' : '1px solid #10b981',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900
                    }}>
                      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{rNum}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>F{r.floor || '1'}</span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{r.tier || r.roomType}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isOcc ? '#fca5a5' : '#94a3b8', marginTop: '1px' }}>
                        {isOcc ? (
                          <span>👤 {b?.guestName || r.currentGuestName || 'Occupied Guest'}</span>
                        ) : isDirt ? (
                          <span style={{ color: '#fde047' }}>🟡 Housekeeping Needed</span>
                        ) : (
                          <span style={{ color: '#6ee7b7' }}>🟢 Vacant Clean (₹{r.tariff}/nt)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isOcc ? 'rgba(239, 68, 68, 0.2)' : isDirt ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isOcc ? '#f87171' : isDirt ? '#fbbf24' : '#34d399',
                      border: isOcc ? '1px solid #ef4444' : isDirt ? '1px solid #f59e0b' : '1px solid #10b981'
                    }}>
                      {isOcc ? 'OCCUPIED' : isDirt ? 'DIRTY' : 'READY'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredRooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                <Hotel size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <div>No rooms match your filter.</div>
                <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>Try searching by number (e.g. 101-309).</div>
              </div>
            )}
          </div>

          {/* RIGHT: Selected Room 360° Operations Console */}
          {currentRoom && (
            <div style={{
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: '#0a101d'
            }}>
              {/* Room Snapshot Header Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(11, 17, 32, 0.95))',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '1rem 1.15rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                        ROOM {currentRoom.roomNumber}
                      </span>
                      <span style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#fbbf24',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        FLOOR {currentRoom.floor || 1} • {currentRoom.tier || currentRoom.roomType}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                      Bed: <strong style={{ color: '#cbd5e1' }}>{currentRoom.bedType || 'King Bed'}</strong> • Pax: <strong style={{ color: '#cbd5e1' }}>{currentRoom.pax || '2 Adults'}</strong> • Wi-Fi: <strong style={{ color: '#38bdf8' }}>{currentRoom.wifiSsid || `TP ${currentRoom.floor}ST FLOOR`}</strong>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isOccupied ? '#7f1d1d' : isDirty ? '#78350f' : '#064e3b',
                      color: isOccupied ? '#fca5a5' : isDirty ? '#fde047' : '#6ee7b7',
                      border: isOccupied ? '1.5px solid #ef4444' : isDirty ? '1.5px solid #f59e0b' : '1.5px solid #10b981'
                    }}>
                      {isOccupied ? '🔴 OCCUPIED' : isDirty ? '🟡 HOUSEKEEPING NEEDED' : '🟢 VACANT CLEAN (READY)'}
                    </span>
                  </div>
                </div>

                {/* Tariff Bar */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.85rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Standard Tariff: </span>
                    <strong style={{ color: '#fff' }}>₹{currentRoom.tariff || 1750}/nt</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Double Occupancy: </span>
                    <strong style={{ color: '#fff' }}>₹{currentRoom.doubleTariff || 2250}/nt</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>GST Rate: </span>
                    <strong style={{ color: '#38bdf8' }}>12% Hospitality</strong>
                  </div>
                </div>
              </div>

              {/* Active Occupant Information (If Occupied) */}
              {isOccupied && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={14} />
                    <span>ACTIVE IN-HOUSE GUEST DETAILS</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Guest Name:</div>
                      <div style={{ fontWeight: 800, color: '#fff' }}>
                        {currentBooking?.guestName || currentRoom.currentGuestName || 'In-House Guest'}
                      </div>
                    </div>
                    {currentBooking?.guestPhone && (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Phone:</div>
                        <div style={{ fontWeight: 700, color: '#cbd5e1' }}>{currentBooking.guestPhone}</div>
                      </div>
                    )}
                    {currentBooking?.checkInDate && (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Dates:</div>
                        <div style={{ fontWeight: 700, color: '#cbd5e1' }}>
                          {currentBooking.checkInDate} ➔ {currentBooking.checkOutDate || 'Open'}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Folio Balance Due:</div>
                      <div style={{ fontWeight: 900, color: Number(currentBooking?.balanceDue || currentRoom.balanceDue || 0) > 0 ? '#f87171' : '#10b981' }}>
                        ₹{Number(currentBooking?.balanceDue || currentRoom.balanceDue || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1-CLICK OPERATIONAL ACTION SHORTCUTS (The Core Power) */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={13} />
                  <span>1-CLICK OPERATIONAL ACTIONS FOR ROOM {currentRoom.roomNumber}:</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {/* Action 1: Master Folio */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenMasterFolio) onOpenMasterFolio(currentRoom.roomNumber);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                  >
                    <FileText size={18} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>Master Folio</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Bills, Taxes &amp; Receipts</div>
                    </div>
                  </button>

                  {/* Action 2: Room Service KOT */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCannonKitchenPOS) onOpenCannonKitchenPOS();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                  >
                    <Utensils size={18} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>Room Service KOT</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Cannon Kitchen Dining</div>
                    </div>
                  </button>

                  {/* Action 3: Room QR & Keycard */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenRoomQr) onOpenRoomQr(currentRoom.roomNumber);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                  >
                    <Key size={18} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>Room QR &amp; Keycard</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Guest Wi-Fi &amp; Portal</div>
                    </div>
                  </button>

                  {/* Action 4: Toggle Housekeeping */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = isDirty ? 'Available' : 'Dirty';
                      if (onUpdateRoomStatus) {
                        onUpdateRoomStatus(currentRoom.roomNumber, newStatus, currentRoom.currentGuestName);
                      }
                      onClose();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                  >
                    <Broom size={18} color="#eab308" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#eab308' }}>
                        {isDirty ? 'Mark Room Clean' : 'Mark Room Dirty'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Housekeeping Status</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Direct WhatsApp Messaging to Room Guest */}
              {isOccupied && (currentBooking?.guestPhone || currentRoom.currentGuestName) && (
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Need to message guest in Room {currentRoom.roomNumber}?
                  </div>
                  <a
                    href={`https://wa.me/${(currentBooking?.guestPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste from Hotel Elite Inn Front Desk! Hope you are having a pleasant stay in Room ${currentRoom.roomNumber}. Please let us know if you require any assistance.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#15803d',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp Guest</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
