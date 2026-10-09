import React, { useState, useEffect, useRef } from 'react';

/* =========================================================================
   VIDEO 09: QUICK SCAN / LOAD PGM DIALOG (Frames 012 & 038)
   Replication of:
   1. Window Title: "Quick Scan"
   2. Search query input with auto-filtering
   3. Program list (House Keeping Room Status, Room Status, Clear Rooms, etc.)
   4. Selection highlight in blue (#316AC5)
   5. Action buttons: [ Load ] and [ Cancel ]
   ========================================================================= */

export default function IdsQuickScanModal({
  isOpen,
  onClose,
  onSelectProgram
}) {
  const [searchTerm, setSearchTerm] = useState('room s');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const programs = [
    { id: 'room-status', label: 'Room Status', code: 'RS01' },
    { id: 'clear-rooms', label: 'Clear Rooms', code: 'CR01' },
    { id: 'housekeeping-room-status', label: 'House Keeping Room Status', code: 'HK01' },
    { id: 'room-status-reports', label: 'Room Status Reports', code: 'RSR01' },
    { id: 'room-sales', label: 'Room Sales', code: 'RS02' },
    { id: 'express-checkin', label: 'Express Check-in', code: 'EX01' },
    { id: 'reservation-checkin', label: 'Reservation Check-in', code: 'RC01' },
    { id: 'room-booking', label: 'Room Booking', code: 'RB01' }
  ];

  const filtered = programs.filter(p => 
    p.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleLoad = () => {
    const selected = filtered[selectedIndex] || filtered[0];
    if (selected) {
      onSelectProgram(selected.id);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleLoad();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '260px', 
          maxWidth: '92vw', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          background: '#ECE9D8'
        }}
      >
        {/* Title Bar matching Frame 012 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Quick Scan</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          {/* Input text field */}
          <input 
            ref={inputRef}
            className="ids-input" 
            style={{ width: '100%', marginBottom: '6px', fontWeight: 600 }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type 'room s' or 'clear'..."
          />

          {/* Filtered list matching Frame 012 & Frame 038 */}
          <div 
            style={{ 
              height: '160px', 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              overflowY: 'auto'
            }}
          >
            {filtered.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                onDoubleClick={handleLoad}
                style={{ 
                  padding: '2px 6px', 
                  cursor: 'pointer',
                  background: idx === selectedIndex ? '#316AC5' : 'transparent',
                  color: idx === selectedIndex ? '#FFF' : '#000',
                  fontSize: '11px',
                  fontWeight: idx === selectedIndex ? 600 : 400
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px', fontWeight: 700 }}
              onClick={handleLoad}
            >
              <u>L</u>oad
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px' }}
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
