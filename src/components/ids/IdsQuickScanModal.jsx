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
    { id: 'guest-management', label: 'Guest Management', code: 'GM01' },
    { id: 'guest-information', label: 'Guest Information', code: 'GI01' },
    { id: 'change-guest-info', label: 'Change Guest Information', code: 'CG01' },
    { id: 'change-rate', label: 'Change Rate', code: 'CR02' },
    { id: 'hurdle-rate', label: 'Hurdle Rate', code: 'HR01' },
    { id: 'amend-stay', label: 'Amend Stay', code: 'AS01' },
    { id: 'modify-departure', label: 'Modify Guest Departure / Extension', code: 'MD01' },
    { id: 'room-transfer', label: 'Room Transfer / Shift', code: 'RT01' },
    { id: 'post-deposit', label: 'Post Deposit / Advance to Room', code: 'PD01' },
    { id: 'express-checkin', label: 'Express Check-in', code: 'EX01' },
    { id: 'checkout-settle', label: 'Checkout & Settle Front Office Bill', code: 'CO01' },
    { id: 'settlements', label: 'Settlements', code: 'ST01' },
    { id: 'split-bill', label: 'Split Bill Process', code: 'SB01' },
    { id: 'transfer-folio', label: 'Transfer Folios', code: 'TF01' },
    { id: 'pax-transfer', label: 'Pax Transfer', code: 'PT01' },
    { id: 'purge-fo', label: 'Purge FO Transaction', code: 'PF01' },
    { id: 'folio-reinstate', label: 'Folio Re-instate', code: 'FR01' },
    { id: 'folio-reinstate-option', label: 'Folio Reinstate Option', code: 'FR02' },
    { id: 'release-stop-posting', label: 'Release Stop Posting', code: 'SP01' },
    { id: 'release-stop-posting-option', label: 'Release Stop Posting Option', code: 'SP02' },
    { id: 'company-profile', label: 'Company Profile', code: 'CP01' },
    { id: 'company-audit-log', label: 'Company Audit Log', code: 'CAL01' },
    { id: 'business-sources', label: 'Business Sources', code: 'BS01' },
    { id: 'add-business-source', label: 'Add Business Source', code: 'BS02' },
    { id: 'market-segments', label: 'Market Segments', code: 'MS01' },
    { id: 'add-market-segment', label: 'Add Market Segment', code: 'MS02' },
    { id: 'company-contract-rates', label: 'Create Company Contract Rates', code: 'CR01' },
    { id: 'create-contract-rates', label: 'Company Contract Rates', code: 'CR02' },
    { id: 'room-rate-master', label: 'Room Rate Master', code: 'RRM01' },
    { id: 'link-rates-to-company', label: 'Link Rates to Company', code: 'LRC01' },
    { id: 'link-company-rates', label: 'Link Company Rates to Bookings', code: 'LRC02' },
    { id: 'room-master', label: 'Room Master', code: 'RM01' },
    { id: 'add-room-number', label: 'Add Room Numbers in Room Status', code: 'RM02' },
    { id: 'modify-room-master', label: 'Modify Room Master', code: 'RM03' },
    { id: 'reprint-voucher', label: 'Reprint Voucher', code: 'RV01' },
    { id: 'reprint-front-office-voucher', label: 'Reprint Front Office Module Voucher', code: 'RV02' },
    { id: 'print-voucher', label: 'Print Voucher', code: 'PV01' },
    { id: 'reprint-fo-bill', label: 'Reprint FO Bill', code: 'RB01' },
    { id: 'reprint-front-office-bill', label: 'Reprint Front Office Bill (Rule 46 GST)', code: 'RB02' },
    { id: 'regular-guest-walkin', label: 'Walk In Regular Guest (Guest History)', code: 'WG01' },
    { id: 'walkin-regular-guest', label: 'Regular Guest Walk-in', code: 'WG02' },
    { id: 'room-booking', label: 'Room Booking', code: 'RB03' }
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
