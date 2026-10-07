import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Filter,
  Layers,
  DoorOpen,
  FileText,
  Receipt,
  Key,
  Sparkles,
  Wrench,
  QrCode,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

/**
 * Normalizes user queries by stripping any leading hash symbols (#)
 * and trimming whitespace to eliminate hashtag ambiguity.
 */
export function normalizeRoomQuery(query = '') {
  return String(query).replace(/^#+/, '').trim().toLowerCase();
}

/**
 * UnifiedRoomSearchBar
 * Universal room search, selection, and multi-floor filter bar
 * shared across Master Tabular Ledger, Tabular Matrix, and Modern Cards.
 */
export default function UnifiedRoomSearchBar({
  rooms = [],
  searchTerm = '',
  onSearchChange = () => {},
  selectedFloor = 'all',
  onFloorChange = () => {},
  statusFilter = 'all',
  onStatusFilterChange = () => {},
  tapeChartViewMode = 'table',
  onViewModeChange = () => {},
  onOpenFolio = () => {},
  onOpenGrc = () => {},
  onExpressWalkIn = () => {},
  onMarkClean = () => {},
  onOpenWorkOrder = () => {},
  onOpenQr = () => {},
  expiringRoomsCount = 0,
  filterExpiringOnly = false,
  onToggleFilterExpiringOnly = () => {}
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const cleanQuery = useMemo(() => normalizeRoomQuery(searchTerm), [searchTerm]);

  // Global keyboard shortcut ('/' to focus search, Esc to close/clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not trigger if user is typing in another input or textarea
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else if (searchTerm) {
          onSearchChange('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, searchTerm, onSearchChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter matching rooms for the quick-dropdown switcher
  const dropdownMatches = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    if (!cleanQuery) return rooms.slice(0, 12); // Show first 12 as quick suggestions

    return rooms.filter(r => {
      const roomNum = String(r.roomNumber || '').toLowerCase();
      const guestName = String(r.effectiveGuestName || r.currentGuestName || '').toLowerCase();
      const company = String(r.effectiveCompany || '').toLowerCase();
      const tier = String(r.tier || '').toLowerCase();
      const status = String(r.effectiveStatus || r.status || '').toLowerCase();
      const phone = String(r.effectivePhone || '').toLowerCase();

      return (
        roomNum.includes(cleanQuery) ||
        guestName.includes(cleanQuery) ||
        company.includes(cleanQuery) ||
        tier.includes(cleanQuery) ||
        status.includes(cleanQuery) ||
        phone.includes(cleanQuery)
      );
    });
  }, [rooms, cleanQuery]);

  // Smooth scroll to room in active view
  const scrollToRoom = (roomNum) => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      const el = document.querySelector(`[data-room-id="${roomNum}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        el.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.9)';
        el.style.transform = 'scale(1.02)';
        setTimeout(() => {
          el.style.boxShadow = '';
          el.style.transform = '';
        }, 1800);
      }
    }, 100);
  };

  // Keyboard navigation for dropdown
  const handleInputKeyDown = (e) => {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsDropdownOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < dropdownMatches.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : dropdownMatches.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && dropdownMatches[highlightedIndex]) {
        scrollToRoom(dropdownMatches[highlightedIndex].roomNumber);
      } else if (dropdownMatches.length === 1) {
        scrollToRoom(dropdownMatches[0].roomNumber);
      }
    }
  };

  // Floor stats
  const floorCounts = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, total: rooms.length };
    rooms.forEach(r => {
      if (stats[r.floor] !== undefined) stats[r.floor]++;
    });
    return stats;
  }, [rooms]);

  // Status counts
  const statusCounts = useMemo(() => {
    let clean = 0;
    let occupied = 0;
    let dirty = 0;
    let maint = 0;
    rooms.forEach(r => {
      const s = r.effectiveStatus || r.status || '';
      if (s === 'Available') clean++;
      else if (s.includes('Occupied')) occupied++;
      else if (s === 'Cleaning' || s === 'Vacant Dirty') dirty++;
      else if (s === 'Maintenance' || s === 'VIP Hold') maint++;
    });
    return { clean, occupied, dirty, maint };
  }, [rooms]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(24, 34, 53, 0.98))',
      border: '1.5px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '12px',
      padding: '0.85rem 1.25rem',
      marginBottom: '1.25rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
      position: 'relative'
    }}>
      {/* Top Header Row: Title, Quick View Switcher, and Room Count Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
            color: '#000',
            fontWeight: 900,
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            letterSpacing: '0.5px'
          }}>
            <Building size={14} /> ROOM COMMAND DOCK
          </div>
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
            Unified 27-Room Selection, Ledger Matrix & Floor Filter
          </span>
          {cleanQuery && (
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px'
            }}>
              Filtered by: "{cleanQuery}" ({dropdownMatches.length} match{dropdownMatches.length === 1 ? '' : 'es'})
            </span>
          )}
        </div>

        {/* View Mode Switcher: Master Ledger / Tabular Matrix / Modern Cards */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(6, 14, 26, 0.85)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          gap: '4px'
        }}>
          <button
            type="button"
            className={`enterprise-tab-pill ${tapeChartViewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
          >
            📋 Master Tabular Ledger
          </button>
          <button
            type="button"
            className={`enterprise-tab-pill ${tapeChartViewMode === 'mysoft' ? 'active' : ''}`}
            onClick={() => onViewModeChange('mysoft')}
            style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
          >
            📊 Tabular Matrix
          </button>
          <button
            type="button"
            className={`enterprise-tab-pill ${tapeChartViewMode === 'modern' ? 'active' : ''}`}
            onClick={() => onViewModeChange('modern')}
            style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
          >
            🏢 Modern Cards
          </button>
        </div>
      </div>

      {/* Main Controls Row: Universal Search Input + Floor Filter Chips + Status Filter Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Search Input with Interactive Typeahead Dropdown */}
        <div style={{ position: 'relative', flex: '1 1 320px', minWidth: '280px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                color: cleanQuery ? 'var(--gold-glow)' : 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => {
                const rawVal = e.target.value;
                // Normalize query automatically so typing #101 or 101 searches 101 smoothly
                onSearchChange(rawVal);
                setIsDropdownOpen(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search Room (e.g. 101, 204), Guest, Deluxe, Vacant... (Press '/' to focus)"
              style={{
                width: '100%',
                paddingLeft: '2.4rem',
                paddingRight: searchTerm ? '4.5rem' : '3rem',
                height: '42px',
                fontSize: '0.88rem',
                background: 'rgba(7, 18, 36, 0.95)',
                border: cleanQuery ? '1.5px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '8px',
                color: '#fff',
                boxShadow: cleanQuery ? '0 0 12px rgba(212, 175, 55, 0.25)' : 'none'
              }}
            />

            {/* Quick Clear or Keyboard Shortcut Pill */}
            <div style={{
              position: 'absolute',
              right: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <span
                style={{
                  fontSize: '0.7rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#94a3b8',
                  userSelect: 'none'
                }}
              >
                /
              </span>
            </div>
          </div>

          {/* Interactive Room Quick-Select Dropdown Menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '48px',
                left: 0,
                right: 0,
                background: '#071224',
                border: '1.5px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '10px',
                maxHeight: '340px',
                overflowY: 'auto',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
                zIndex: 9999,
                padding: '0.4rem 0'
              }}
            >
              <div style={{
                padding: '0.4rem 0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: '#94a3b8'
              }}>
                <span>
                  {cleanQuery ? `Matches for "${cleanQuery}":` : 'Quick Jump to Room:'}
                </span>
                <span>
                  {dropdownMatches.length} room{dropdownMatches.length === 1 ? '' : 's'} available
                </span>
              </div>

              {dropdownMatches.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No rooms match "{cleanQuery}".
                  <div style={{ marginTop: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-outline-gold"
                      onClick={() => onSearchChange('')}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              ) : (
                dropdownMatches.map((room, idx) => {
                  const s = room.effectiveStatus || room.status || '';
                  const isVacant = s === 'Available';
                  const isOccupied = s.includes('Occupied');
                  const isDirty = s === 'Cleaning' || s === 'Vacant Dirty';
                  const isMaint = s === 'Maintenance' || s === 'VIP Hold';

                  const statusBg = isVacant
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isOccupied
                      ? 'rgba(234, 88, 12, 0.2)'
                      : isDirty
                        ? 'rgba(234, 179, 8, 0.2)'
                        : 'rgba(148, 163, 184, 0.2)';

                  const statusColor = isVacant
                    ? '#34d399'
                    : isOccupied
                      ? '#fb923c'
                      : isDirty
                        ? '#facc15'
                        : '#94a3b8';

                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <div
                      key={room.roomNumber}
                      style={{
                        padding: '0.6rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isHighlighted ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => scrollToRoom(room.roomNumber)}
                    >
                      {/* Left: Room Badge + Tier + Floor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          background: 'rgba(212, 175, 55, 0.18)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          color: 'var(--gold-glow)',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          letterSpacing: '0.5px'
                        }}>
                          Room {room.roomNumber}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>
                            Floor {room.floor} • {room.tier || 'Standard Deluxe'}
                          </div>
                          {isOccupied ? (
                            <div style={{ fontSize: '0.73rem', color: '#fb923c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>👤 {room.effectiveGuestName || room.currentGuestName || 'In-House Guest'}</span>
                              {room.effectiveCompany && (
                                <span style={{ color: '#94a3b8' }}>({room.effectiveCompany})</span>
                              )}
                              {room.effectiveBalanceDue > 0 && (
                                <span style={{ color: '#ef4444', fontWeight: 700 }}>• Due ₹{room.effectiveBalanceDue}</span>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              ₹{room.effectiveTariff || room.tariff || 2199}/night • {isVacant ? 'Ready for Check-In' : s}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Pill & Direct Action Dock */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          background: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusColor}50`,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px'
                        }}>
                          {s.toUpperCase()}
                        </span>

                        {/* Quick 1-Click Action Buttons */}
                        {isOccupied && (
                          <button
                            type="button"
                            className="btn-outline-gold"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDropdownOpen(false);
                              onOpenFolio(room);
                            }}
                            title="Open Room Folio"
                          >
                            <FileText size={12} /> Folio
                          </button>
                        )}

                        {isOccupied && (
                          <button
                            type="button"
                            className="btn-outline-gold"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDropdownOpen(false);
                              onOpenGrc(room);
                            }}
                            title="Print GRC / Official Money Receipt"
                          >
                            <Receipt size={12} /> GRC
                          </button>
                        )}

                        {isVacant && (
                          <button
                            type="button"
                            className="btn-gold"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#000' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDropdownOpen(false);
                              onExpressWalkIn(room.roomNumber);
                            }}
                            title="Express Walk-In Check-In"
                          >
                            <Key size={12} /> Walk-In
                          </button>
                        )}

                        {isDirty && (
                          <button
                            type="button"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.72rem',
                              background: 'rgba(16, 185, 129, 0.25)',
                              border: '1px solid #10b981',
                              color: '#34d399',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDropdownOpen(false);
                              onMarkClean(room.roomNumber);
                            }}
                            title="Mark Room Clean"
                          >
                            <Sparkles size={12} /> Clean
                          </button>
                        )}

                        <button
                          type="button"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            borderRadius: '4px',
                            padding: '0.25rem 0.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                            onOpenQr(room.roomNumber);
                          }}
                          title="Room Guest Portal QR"
                        >
                          <QrCode size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Floor Quick-Filter Chips: All Floors / Floor 1 / Floor 2 / Floor 3 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
            Floor:
          </span>
          <button
            type="button"
            onClick={() => onFloorChange('all')}
            className={`enterprise-tab-pill ${selectedFloor === 'all' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            All Floors ({floorCounts.total})
          </button>
          <button
            type="button"
            onClick={() => onFloorChange(1)}
            className={`enterprise-tab-pill ${selectedFloor === 1 ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            1st Floor (101-109)
          </button>
          <button
            type="button"
            onClick={() => onFloorChange(2)}
            className={`enterprise-tab-pill ${selectedFloor === 2 ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            2nd Floor (201-209)
          </button>
          <button
            type="button"
            onClick={() => onFloorChange(3)}
            className={`enterprise-tab-pill ${selectedFloor === 3 ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            3rd Floor (301-309)
          </button>
        </div>

        {/* Status Lifecycle Quick Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
            Status:
          </span>
          {[
            { id: 'all', label: `All (${floorCounts.total})`, color: '#f1f5f9' },
            { id: 'Available', label: `Vacant Clean (${statusCounts.clean})`, color: '#34d399' },
            { id: 'Occupied', label: `Occupied (${statusCounts.occupied})`, color: '#fb923c' },
            { id: 'Vacant Dirty', label: `Dirty (${statusCounts.dirty})`, color: '#facc15' },
            { id: 'Maintenance', label: `OOO / Maint (${statusCounts.maint})`, color: '#f87171' }
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => onStatusFilterChange(st.id)}
              className={`enterprise-tab-pill ${statusFilter === st.id ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                borderColor: statusFilter === st.id ? st.color : undefined
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
