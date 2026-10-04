import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, QrCode, Smartphone, ChefHat, UserCheck, Copy, Check, 
  Printer, ExternalLink, Sparkles, ShieldCheck 
} from 'lucide-react';
import { RECOGNIZED_STEWARDS } from './StewardMobileOrderPad';

export default function StewardQrManagerModal({ isOpen, onClose }) {
  const [selectedTab, setSelectedTab] = useState('stewards'); // 'stewards', 'kitchen'
  const [activeStewardId, setActiveStewardId] = useState('SADANANDA');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hotel-elite-inn.pages.dev';

  const currentSteward = RECOGNIZED_STEWARDS.find(s => s.id === activeStewardId) || RECOGNIZED_STEWARDS[0];

  const targetUrl = selectedTab === 'stewards'
    ? `${origin}/?view=steward&staff=${currentSteward.id}`
    : `${origin}/?view=kds`;

  // Generate QR Code data URL
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: selectedTab === 'stewards' ? '#0f172a' : '#7f1d1d',
        light: '#ffffff'
      }
    })
    .then(url => setQrDataUrl(url))
    .catch(err => console.error('QR generation error:', err));
  }, [isOpen, selectedTab, activeStewardId, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '1rem',
      backdropFilter: 'blur(6px)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div className="glass-panel emil-modal-enter" style={{
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c1220',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.35rem' }}>📱</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                Steward &amp; Kitchen Mobile QR Badges
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Scan to open instant mobile portals without typing passwords
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Stewards vs Kitchen KDS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setSelectedTab('stewards')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: selectedTab === 'stewards' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'stewards' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'stewards' ? '#fbbf24' : '#94a3b8'
            }}
          >
            <Smartphone size={16} />
            <span>Steward Floor Order Pads ({RECOGNIZED_STEWARDS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('kitchen')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: selectedTab === 'kitchen' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'kitchen' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'kitchen' ? '#f87171' : '#94a3b8'
            }}
          >
            <ChefHat size={16} />
            <span>Master Kitchen Display (KDS)</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Left Column: Steward Badges Selector */}
          {selectedTab === 'stewards' && (
            <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>
                SELECT STEWARD BADGE:
              </div>
              {RECOGNIZED_STEWARDS.map(stw => (
                <button
                  key={stw.id}
                  type="button"
                  onClick={() => setActiveStewardId(stw.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    background: activeStewardId === stw.id ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.03)',
                    border: activeStewardId === stw.id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.06)',
                    color: activeStewardId === stw.id ? '#fbbf24' : '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>👨‍🍳</span>
                    <div>
                      <div style={{ fontSize: '0.88rem' }}>{stw.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Badge: {stw.code}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Scan QR ➔</span>
                </button>
              ))}
            </div>
          )}

          {/* Right Column / Center: QR Card Preview */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            {/* Laminated Badge Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              color: selectedTab === 'stewards' ? '#fbbf24' : '#f87171'
            }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', fontWeight: 800 }}>
                HOTEL ELITE INN • MUNIGUDA
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                {selectedTab === 'stewards' ? `STEWARD: ${currentSteward.name.toUpperCase()}` : 'CHEF KITCHEN DISPLAY (KDS)'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {selectedTab === 'stewards' ? `Floor Order Pad • Badge ${currentSteward.code}` : 'Live Kitchen Orders Feed'}
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{
              background: '#fff',
              padding: '10px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              marginBottom: '1rem'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Portal QR Code" style={{ width: 190, height: 190, display: 'block' }} />
              ) : (
                <div style={{ width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  Generating QR...
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '280px', marginBottom: '1rem', lineHeight: 1.4 }}>
              📷 <strong>Scan with any mobile camera:</strong> Instantly opens the portal with zero login required.
            </div>

            {/* Actions: Copy Link & Open */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '6px',
                  background: copied ? '#10b981' : 'rgba(255,255,255,0.08)',
                  border: copied ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '6px',
                  background: '#2563eb',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <ExternalLink size={14} />
                <span>Open View</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#fbbf24',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={15} />
            <span>Print Laminated Badge Sheet (A4)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#334155',
              border: 'none',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
