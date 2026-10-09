// Authentic Windows 98/2000/XP MessageBox Modal for IDS Fortune NEXT
import React, { useEffect } from 'react';

export default function IdsMessageBox({
  isOpen,
  title = 'IDS Fortune NEXT',
  message = '',
  type = 'info', // 'info' | 'warning' | 'error' | 'question'
  buttons = 'ok', // 'ok' | 'yesno' | 'okcancel'
  onOk,
  onCancel,
  onYes,
  onNo
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (buttons === 'yesno' && onNo) onNo();
        else if (onCancel) onCancel();
        else if (onOk) onOk();
      } else if (e.key === 'Enter') {
        if (buttons === 'yesno' && onYes) onYes();
        else if (onOk) onOk();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, buttons, onOk, onCancel, onYes, onNo]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F1C40F',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            !
          </div>
        );
      case 'error':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#C0392B',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ✕
          </div>
        );
      case 'question':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2980B9',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ?
          </div>
        );
      case 'info':
      default:
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2980B9',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'serif',
            flexShrink: 0
          }}>
            i
          </div>
        );
    }
  };

  return (
    <div 
      className="ids-modal-overlay" 
      style={{ 
        zIndex: 2000, 
        background: 'rgba(0, 0, 0, 0.45)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '380px', 
          maxWidth: '90vw', 
          background: '#ECE9D8', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-dialog-titlebar plain" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: '#0A246A',
            color: '#FFF',
            padding: '2px 6px'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
            {title}
          </span>
          <button 
            type="button"
            className="ids-win-btn close" 
            onClick={buttons === 'yesno' ? onNo : (onCancel || onOk)} 
            style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '16px 18px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {renderIcon()}
          <div style={{ fontSize: '11px', color: '#000', lineHeight: '1.45', paddingTop: '4px', wordBreak: 'break-word' }}>
            {message}
          </div>
        </div>

        {/* Buttons Bar */}
        <div 
          style={{ 
            background: '#E4DFD0', 
            padding: '8px 14px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px',
            borderTop: '1px solid #D0CAB8'
          }}
        >
          {buttons === 'ok' && (
            <button 
              type="button"
              className="ids-btn-classic" 
              onClick={onOk}
              autoFocus
              style={{ minWidth: '75px', height: '23px', fontWeight: 700, border: '2px outset #5DADE2' }}
            >
              OK
            </button>
          )}

          {buttons === 'yesno' && (
            <>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onYes}
                autoFocus
                style={{ minWidth: '75px', height: '23px', fontWeight: 700, border: '2px outset #5DADE2' }}
              >
                Yes
              </button>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onNo}
                style={{ minWidth: '75px', height: '23px' }}
              >
                No
              </button>
            </>
          )}

          {buttons === 'okcancel' && (
            <>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onOk}
                autoFocus
                style={{ minWidth: '75px', height: '23px', fontWeight: 700, border: '2px outset #5DADE2' }}
              >
                OK
              </button>
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={onCancel}
                style={{ minWidth: '75px', height: '23px' }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
