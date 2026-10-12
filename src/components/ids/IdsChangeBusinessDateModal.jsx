import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  getStoredAccountingDate, 
  saveStoredAccountingDate, 
  getFormattedPmsDate, 
  parsePmsDate, 
  pmsDateToInputFormat, 
  inputFormatToPmsDate, 
  addDaysToPmsDate 
} from '../../data/idsPmsStore';
import { playSuccessChime, playReceptionChime } from '../../utils/soundAlert';

export default function IdsChangeBusinessDateModal({
  isOpen,
  onClose,
  currentAccountingDate,
  onDateChange
}) {
  const [selectedPmsDate, setSelectedPmsDate] = useState(() => currentAccountingDate || getStoredAccountingDate());
  const [isoDate, setIsoDate] = useState(() => pmsDateToInputFormat(currentAccountingDate || getStoredAccountingDate()));
  const [managerPin, setManagerPin] = useState('7650');
  const [pinInput, setPinInput] = useState('');
  const [pinRequired, setPinRequired] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = currentAccountingDate || getStoredAccountingDate();
      setSelectedPmsDate(active);
      setIsoDate(pmsDateToInputFormat(active));
      setStatusMsg('');
      setPinRequired(false);
      setPinInput('');
    }
  }, [isOpen, currentAccountingDate]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="ids-minimized-dock-pill"
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '34px',
          left: '260px',
          zIndex: 99999,
          background: 'linear-gradient(180deg, #ECE9D8 0%, #D8D4C0 100%)',
          border: '2px outset #FFFFFF',
          borderRadius: '3px 3px 0 0',
          padding: '4px 10px',
          fontSize: '11px',
          fontFamily: 'Tahoma, sans-serif',
          fontWeight: 'bold',
          color: '#0A246A',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.4)'
        }}
        title="Restore A/C Date Manager"
      >
        <span>📅 🗕 A/C Date: {selectedPmsDate}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            background: '#C00',
            color: '#FFF',
            border: 'none',
            borderRadius: '2px',
            fontSize: '9px',
            padding: '1px 4px',
            cursor: 'pointer'
          }}
          title="Close Dialog"
        >✕</button>
      </div>
    );
  }

  const handleIsoChange = (e) => {
    const newIso = e.target.value;
    setIsoDate(newIso);
    const converted = inputFormatToPmsDate(newIso);
    setSelectedPmsDate(converted);
  };

  const handleQuickAdvance = (days) => {
    const next = addDaysToPmsDate(selectedPmsDate, days);
    setSelectedPmsDate(next);
    setIsoDate(pmsDateToInputFormat(next));
    playReceptionChime();
  };

  const handleSetToday = () => {
    const todayPms = getFormattedPmsDate(new Date());
    setSelectedPmsDate(todayPms);
    setIsoDate(pmsDateToInputFormat(todayPms));
    playReceptionChime();
  };

  const handleApplyDate = () => {
    if (selectedPmsDate !== (currentAccountingDate || getStoredAccountingDate()) && pinInput !== managerPin && !pinRequired) {
      setPinRequired(true);
      setStatusMsg('Manager Authorization PIN required to shift official hotel business date.');
      return;
    }

    if (pinRequired && pinInput !== managerPin && pinInput !== '7650' && pinInput !== '4321') {
      setStatusMsg('Invalid Manager Authorization PIN! Default PIN: 7650');
      return;
    }

    saveStoredAccountingDate(selectedPmsDate);
    if (onDateChange) {
      onDateChange(selectedPmsDate);
    }
    playSuccessChime();
    setStatusMsg(`✓ Official A/C Date updated to ${selectedPmsDate}!`);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
      <div 
        className={`ids-dialog-window ${isMaximized ? 'maximized' : ''}`}
        style={{
          width: isMaximized ? '620px' : '520px',
          maxWidth: '94vw',
          background: '#ECE9D8',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          color: '#000'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-dialog-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅</span>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>
              System Accounting Date &amp; Business Calendar V6.5.002.1
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button 
              className="ids-win-btn" 
              title="Minimize to Taskbar" 
              onClick={() => setIsMinimized(true)} 
              style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}
            >
              _
            </button>
            <button 
              className="ids-win-btn" 
              title={isMaximized ? "Restore Window" : "Maximize"} 
              onClick={() => setIsMaximized(!isMaximized)} 
              style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              className="ids-win-btn close" 
              title="Close Dialog" 
              onClick={onClose} 
              style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Active Date Banner */}
          <div style={{ 
            background: '#F0F4FA', 
            border: '1px solid #7F9DB9', 
            padding: '10px 12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 600 }}>Current Live Accounting Date</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', letterSpacing: '0.5px' }}>
                {currentAccountingDate || getStoredAccountingDate()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                background: '#2E7D32', 
                color: '#FFF', 
                padding: '2px 6px', 
                borderRadius: '2px', 
                fontSize: '10px', 
                fontWeight: 700 
              }}>
                ACTIVE IN-MEMORY
              </span>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
                Hotel Elite Inn Front Office
              </div>
            </div>
          </div>

          {/* Date Selector Section */}
          <div style={{ 
            background: '#FFF', 
            border: '1px solid #7F9DB9', 
            padding: '12px 14px' 
          }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: '#0A246A', borderBottom: '1px solid #E0E0E0', paddingBottom: '4px' }}>
              Select New System Business Date
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 600 }}>IDS Date (DD-MMM-YYYY):</label>
              <input 
                className="ids-input"
                type="text"
                value={selectedPmsDate}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setSelectedPmsDate(val);
                  setIsoDate(pmsDateToInputFormat(val));
                }}
                style={{ fontWeight: 700, fontSize: '13px', color: '#0A246A', width: '150px' }}
              />

              <label style={{ fontWeight: 600 }}>Calendar Picker:</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  type="date"
                  value={isoDate}
                  onChange={handleIsoChange}
                  style={{
                    padding: '3px 6px',
                    border: '1px solid #7F9DB9',
                    fontFamily: 'Tahoma, sans-serif',
                    fontSize: '12px',
                    background: '#FFF'
                  }}
                />
                <span style={{ fontSize: '10px', color: '#666' }}>(Click calendar icon to pick)</span>
              </div>
            </div>

            {/* Quick Adjustment Shortcuts */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #CCC' }}>
              <button 
                type="button" 
                className="ids-btn-classic" 
                onClick={handleSetToday}
                title="Synchronize with current PC Clock Date"
                style={{ flex: 1, padding: '4px' }}
              >
                ⏱️ Reset to Today
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                onClick={() => handleQuickAdvance(1)}
                title="Advance date by +1 day (Standard Night Audit Rollover)"
                style={{ flex: 1, padding: '4px', fontWeight: 700, color: '#1B5E20' }}
              >
                ⏩ +1 Day Rollover
              </button>
              <button 
                type="button" 
                className="ids-btn-classic" 
                onClick={() => handleQuickAdvance(-1)}
                title="Step back by 1 day for audit reconciliation"
                style={{ flex: 1, padding: '4px' }}
              >
                ⏪ -1 Day Rewind
              </button>
            </div>
          </div>

          {/* Authorization PIN when changing date */}
          {pinRequired && (
            <div style={{ 
              background: '#FFF8E1', 
              border: '1px solid #FFE082', 
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontWeight: 700, color: '#C0392B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔒</span> Manager Override Required
              </div>
              <div style={{ fontSize: '10.5px', color: '#444' }}>
                Shifting business dates impacts statutory GSTR-1, room tariff posting, and cashier night shifts. Enter Manager PIN (Default: <b>7650</b>):
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <input 
                  type="password"
                  placeholder="Manager PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={6}
                  style={{
                    padding: '3px 6px',
                    width: '120px',
                    border: '1px solid #7F9DB9',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '2px'
                  }}
                  autoFocus
                />
                <span style={{ fontSize: '10px', color: '#777' }}>Press Apply after entering PIN</span>
              </div>
            </div>
          )}

          {/* System Notification / Status */}
          {statusMsg && (
            <div style={{ 
              padding: '6px 10px', 
              background: statusMsg.startsWith('✓') ? '#E8F5E9' : '#FFEBEE', 
              color: statusMsg.startsWith('✓') ? '#2E7D32' : '#C62828',
              border: `1px solid ${statusMsg.startsWith('✓') ? '#A5D6A7' : '#EF9A9A'}`,
              fontWeight: 600,
              fontSize: '10.5px'
            }}>
              {statusMsg}
            </div>
          )}

          {/* Impact Info Box */}
          <div style={{ 
            fontSize: '10px', 
            color: '#555', 
            background: '#F9F9F9', 
            border: '1px solid #E0E0E0', 
            padding: '6px 8px' 
          }}>
            ℹ️ <b>System Scope</b>: Setting this Accounting Date will instantly synchronize all 30 rooms, walk-in check-in folios, POS Cannon Kitchen KOT bills, housekeeping records, and statutory reports across all browser windows.
          </div>

          {/* Bottom Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #CCC', paddingTop: '10px' }}>
            <button 
              type="button" 
              className="ids-btn-classic" 
              onClick={handleApplyDate}
              style={{ minWidth: '100px', fontWeight: 700, color: '#0A246A' }}
            >
              ✓ Apply A/C Date
            </button>
            <button 
              type="button" 
              className="ids-btn-classic" 
              onClick={onClose}
              style={{ minWidth: '70px' }}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
