import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  X, QrCode, Smartphone, ChefHat, UserCheck, Copy, Check, 
  Printer, ExternalLink, Sparkles, ShieldCheck, Building2,
  Utensils, Wifi, Bed, Download
} from 'lucide-react';
import { RECOGNIZED_STEWARDS } from './StewardMobileOrderPad';
import { HOUSEKEEPING_STAFF } from './HousekeepingMobilePortal';
import { HOTEL_CONFIG } from '../data/hotelData';

// All 27 rooms across 3 floors
const ALL_ROOMS = [
  '101','102','103','104','105','106','107','108','109',
  '201','202','203','204','205','206','207','208','209',
  '301','302','303','304','305','306','307','308','309'
];

// Individual QR Card Component (generates its own QR inline)
function QrBadgeCard({ label, sublabel, url, colorAccent = '#fbbf24', icon, badgeCode, darkColor = '#0f172a' }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 260,
      margin: 2,
      color: { dark: darkColor, light: '#ffffff' },
      errorCorrectionLevel: 'H'
    })
    .then(dataUrl => setQrUrl(dataUrl))
    .catch(err => console.error('QR err:', err));
  }, [url, darkColor]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      background: '#0b1120',
      border: `1px solid ${colorAccent}33`,
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.6rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 25px ${colorAccent}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Badge Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '0.62rem', color: '#94a3b8', letterSpacing: '0.06em', fontWeight: 700 }}>
          HOTEL ELITE INN • MUNIGUDA
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 900, color: colorAccent, marginTop: '2px' }}>
          {icon} {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>{sublabel}</div>
        )}
      </div>

      {/* QR Code */}
      <div style={{
        background: '#fff',
        padding: '6px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
      }}>
        {qrUrl ? (
          <img src={qrUrl} alt={`QR: ${label}`} style={{ width: 130, height: 130, display: 'block' }} />
        ) : (
          <div style={{ width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.7rem' }}>
            Generating...
          </div>
        )}
      </div>

      {/* Badge Code */}
      {badgeCode && (
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: colorAccent,
          background: `${colorAccent}15`,
          padding: '2px 8px',
          borderRadius: '10px',
          letterSpacing: '0.04em'
        }}>
          {badgeCode}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            flex: 1,
            padding: '4px 6px',
            borderRadius: '5px',
            background: copied ? '#10b981' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: copied ? '#fff' : '#cbd5e1',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px'
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            flex: 1,
            padding: '4px 6px',
            borderRadius: '5px',
            background: `${colorAccent}20`,
            border: `1px solid ${colorAccent}40`,
            color: colorAccent,
            fontSize: '0.65rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px'
          }}
        >
          <ExternalLink size={10} />
          Open
        </a>
      </div>
    </div>
  );
}

export default function StewardQrManagerModal({ isOpen, onClose, rooms = [] }) {
  const [selectedTab, setSelectedTab] = useState('stewards'); // 'stewards', 'kitchen', 'rooms'
  const [roomFloorFilter, setRoomFloorFilter] = useState('all'); // 'all', '1', '2', '3'

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hotel-elite-inn.pages.dev';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Filtered rooms by floor
  const filteredRooms = roomFloorFilter === 'all' 
    ? ALL_ROOMS 
    : ALL_ROOMS.filter(r => r[0] === roomFloorFilter);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '0.75rem',
      backdropFilter: 'blur(6px)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 960,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c1220',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '14px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <QrCode size={22} color="#fbbf24" />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 900 }}>
                Hotel Elite Inn — Complete QR Code Hub
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                6 Steward Badges + 1 Kitchen KDS + 2 Housekeeping + 27 Room QR Codes — All in One Place
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Tab Switcher: Stewards | Kitchen KDS | Room QR Codes */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setSelectedTab('stewards')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: selectedTab === 'stewards' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'stewards' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'stewards' ? '#fbbf24' : '#94a3b8'
            }}
          >
            <Smartphone size={15} />
            👨‍🍳 Steward Pads ({RECOGNIZED_STEWARDS.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('kitchen')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: selectedTab === 'kitchen' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'kitchen' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'kitchen' ? '#f87171' : '#94a3b8'
            }}
          >
            <ChefHat size={15} />
            🍳 Kitchen KDS (1)
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('housekeeping')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: selectedTab === 'housekeeping' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'housekeeping' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'housekeeping' ? '#34d399' : '#94a3b8'
            }}
          >
            <Sparkles size={15} />
            🧹 Housekeeping (2)
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('rooms')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: selectedTab === 'rooms' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
              border: selectedTab === 'rooms' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              color: selectedTab === 'rooms' ? '#38bdf8' : '#94a3b8'
            }}
          >
            <Building2 size={15} />
            🏨 Room QR Codes ({ALL_ROOMS.length})
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>

          {/* ========== TAB 1: STEWARD QR BADGES ========== */}
          {selectedTab === 'stewards' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={14} />
                INDIVIDUAL STEWARD FLOOR ORDER PAD QR BADGES — Each steward scans their personal QR to open their order pad instantly
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {RECOGNIZED_STEWARDS.map(stw => (
                  <QrBadgeCard
                    key={stw.id}
                    label={`STEWARD: ${stw.name}`}
                    sublabel={`Floor Order Pad • Badge ${stw.code}`}
                    url={`${origin}/?view=steward&staff=${stw.id}`}
                    colorAccent="#fbbf24"
                    icon="👨‍🍳"
                    badgeCode={stw.code}
                    darkColor="#0f172a"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ========== TAB 2: KITCHEN KDS QR ========== */}
          {selectedTab === 'kitchen' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ChefHat size={14} />
                KITCHEN MANAGER DISPLAY (KDS) — Chef scans this QR to see all live incoming orders from stewards in real-time
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
                maxWidth: '600px'
              }}>
                <QrBadgeCard
                  label="CHEF KITCHEN DISPLAY"
                  sublabel="Live Real-Time Orders Feed (KDS)"
                  url={`${origin}/?view=kds`}
                  colorAccent="#ef4444"
                  icon="🍳"
                  badgeCode="KITCHEN-KDS-MASTER"
                  darkColor="#7f1d1d"
                />
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#fca5a5',
                lineHeight: 1.5
              }}>
                <strong>📋 Kitchen Display Instructions:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                  <li>Mount a tablet or spare phone on the kitchen dispatch counter wall.</li>
                  <li>Scan the QR code above or open the link directly.</li>
                  <li>The display will show all KOTs (Kitchen Order Tickets) from stewards in real-time.</li>
                  <li>A <strong>loud bell chime 🔔</strong> will ring whenever a new order arrives.</li>
                  <li>Chef taps <strong>"Food Ready"</strong> when cooking is done — steward sees the update instantly.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ========== TAB 3: ROOM QR CODES ========== */}
          {selectedTab === 'rooms' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={14} />
                IN-ROOM GUEST QR CODES — Place in each room for guests to scan for in-room dining, room service, WiFi & hotel services
              </div>

              {/* Floor Filter Chips */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: `All Floors (${ALL_ROOMS.length})` },
                  { key: '1', label: '1st Floor (101-109)' },
                  { key: '2', label: '2nd Floor (201-209)' },
                  { key: '3', label: '3rd Floor (301-309)' }
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setRoomFloorFilter(f.key)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: roomFloorFilter === f.key ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                      color: roomFloorFilter === f.key ? '#000' : '#cbd5e1',
                      border: roomFloorFilter === f.key ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
                gap: '0.85rem'
              }}>
                {filteredRooms.map(roomNum => {
                  const floor = roomNum[0];
                  const floorColor = floor === '1' ? '#10b981' : floor === '2' ? '#38bdf8' : '#a78bfa';
                  return (
                    <QrBadgeCard
                      key={roomNum}
                      label={`Room ${roomNum}`}
                      sublabel={`${floor === '1' ? '1st' : floor === '2' ? '2nd' : '3rd'} Floor • In-Room Dining`}
                      url={`${origin}/?room=${roomNum}&source=room_qr`}
                      colorAccent={floorColor}
                      icon="🏨"
                      badgeCode={`ROOM-${roomNum}`}
                      darkColor="#0a192f"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ========== TAB 4: HOUSEKEEPING MOBILE PORTALS ========== */}
          {selectedTab === 'housekeeping' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#10b981" />
                HOUSEKEEPING MOBILE PORTAL BADGES — Manager & Supervisor scan their badge to track dirty rooms, receive guest service chimes, and mark rooms clean (turns reception green instantly)
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
                maxWidth: '650px'
              }}>
                <QrBadgeCard
                  label="HK MANAGER: Anita Majhi"
                  sublabel="Housekeeping Manager • Full Turnover Control"
                  url={`${origin}/?view=housekeeping&role=MANAGER`}
                  colorAccent="#10b981"
                  icon="👩‍💼"
                  badgeCode="HK-MGR-01"
                  darkColor="#064e3b"
                />

                <QrBadgeCard
                  label="HK SUPERVISOR: Bikram Mohanty"
                  sublabel="Housekeeping Supervisor • Floor Inspections"
                  url={`${origin}/?view=housekeeping&role=SUPERVISOR`}
                  colorAccent="#38bdf8"
                  icon="👨‍🔧"
                  badgeCode="HK-SUP-01"
                  darkColor="#0c4a6e"
                />
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#6ee7b7',
                lineHeight: 1.5
              }}>
                <strong>✨ How the Housekeeping Turnover Lifecycle Works:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                  <li><strong>Room Checkout:</strong> When Reception checks out a guest, the room turns 🔴 <strong>Vacant Dirty</strong> automatically.</li>
                  <li><strong>Instant Alert:</strong> Manager (Anita Majhi) & Supervisor (Bikram Mohanty) receive an audio chime and notification on their mobile.</li>
                  <li><strong>Turnover:</strong> Staff taps <strong>"Start Cleaning"</strong> (yellow) on their phone.</li>
                  <li><strong>Turnover Cleaned:</strong> When finished, staff taps <strong>"Mark Clean & Inspected"</strong> (green).</li>
                  <li><strong>Zero-Refresh Green on Reception:</strong> The reception desktop turns the room 🟢 <strong>Green (Available)</strong> immediately via BroadcastChannel!</li>
                  <li><strong>Guest QR Requests:</strong> When guests scan the room QR and request towels/water/repairs, a prompt chime alerts the mobile portal.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Print & Summary */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            <strong style={{ color: '#fbbf24' }}>{RECOGNIZED_STEWARDS.length} Steward</strong> + <strong style={{ color: '#ef4444' }}>1 Kitchen</strong> + <strong style={{ color: '#10b981' }}>2 Housekeeping</strong> + <strong style={{ color: '#38bdf8' }}>{ALL_ROOMS.length} Room</strong> QR Codes = <strong style={{ color: '#fff' }}>{RECOGNIZED_STEWARDS.length + 1 + 2 + ALL_ROOMS.length} Total</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#fbbf24',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Printer size={14} />
              Print QR Badge Sheet (A4)
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.45rem 1rem',
                background: '#334155',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
