import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { HOTEL_STAFF_MEMBERS, OPERATIONAL_QR_BADGES } from '../../data/hotelStaffData';

// Default initial servers matching authentic 7 Restaurant Staff (1 Manager + 6 Stewards)
const DEFAULT_SERVERS = HOTEL_STAFF_MEMBERS
  .filter(s => s.department === 'Restaurant')
  .map(s => ({
    serverCode: s.serverCode,
    applicableFrom: '08-FEB-2026',
    name: s.shortName,
    fullName: s.name,
    shortName: s.shortName,
    employeeNo: s.id,
    status: s.status,
    role: s.role,
    user: 'MANAGER',
    lastUpdated: '08-FEB-2026 18:53',
    badge: s.stewardBadge || s.serverCode,
    phone: s.phone
  }));

export function getStoredServers() {
  try {
    const raw = localStorage.getItem('ids_pos_servers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 7 && parsed.some(s => s.serverCode === '007')) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load ids_pos_servers', e);
  }
  return DEFAULT_SERVERS;
}

export function saveStoredServers(list) {
  try {
    localStorage.setItem('ids_pos_servers', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save ids_pos_servers', e);
  }
}

// Preview card for scannable QR badge inside Server Master Win32 Dialog
function IdsStewardQrPreview({ badge, onOpenOperationalBadges }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}${badge.urlPath}`;
    QRCode.toDataURL(fullUrl, {
      width: 180,
      margin: 1,
      color: { dark: badge.darkColor || '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    }).then(setQrUrl).catch(console.error);
  }, [badge]);

  const handleCopy = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}${badge.urlPath}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=450,height=580');
    if (!win) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Elite Inn - Steward Badge: ${badge.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .badge { width: 300px; border: 2px solid #0f172a; border-radius: 8px; background: #fff; padding: 16px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
            .hotel-name { font-size: 15px; font-weight: 900; letter-spacing: 1.5px; color: #0f172a; }
            .hotel-sub { font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 10px; }
            .qr-box { margin: 8px auto; width: 150px; height: 150px; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; }
            .name { font-size: 16px; font-weight: 800; margin-top: 8px; color: #0f172a; }
            .role { font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px; }
            .pill { display: inline-block; margin-top: 6px; padding: 2px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 10.5px; font-weight: 800; color: #0a246a; }
            .meta { font-size: 10px; color: #64748b; margin-top: 4px; }
            .foot { margin-top: 10px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 9px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="hotel-name">HOTEL ELITE INN</div>
            <div class="hotel-sub">RESTAURANT STEWARD FLOOR MOBILE PASS</div>
            <div class="qr-box"><img src="${qrUrl}" width="140" height="140" alt="QR" /></div>
            <div class="name">${badge.name}</div>
            <div class="role">${badge.role}</div>
            <div class="pill">BADGE: ${badge.code} • SERVER CODE: ${badge.serverCode}</div>
            <div class="meta">${badge.shift} • Phone: ${badge.phone}</div>
            <div class="foot">Scan with smartphone camera to take live table orders.</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = `${origin}${badge.urlPath}`;

  return (
    <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #E0DFE3', paddingBottom: '4px', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A' }}>
          🍽️ BADGE: {badge.code} • SERVER: {badge.serverCode}
        </span>
        <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '2px', border: '1px solid #FCD34D' }}>
          STEWARD ORDER PAD
        </span>
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', width: '100%' }}>
        <div style={{ border: '1px solid #CBD5E1', padding: '4px', background: '#FFF', borderRadius: '4px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {qrUrl ? (
            <img src={qrUrl} alt={badge.name} width="112" height="112" style={{ display: 'block' }} />
          ) : (
            <span style={{ fontSize: '10px', color: '#888' }}>Rendering QR...</span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>{badge.name}</div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{badge.role}</div>
          <div style={{ fontSize: '10px', color: '#0A246A', fontWeight: 700 }}>
            Server Code: {badge.serverCode} • Phone: {badge.phone}
          </div>
          <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>
            Shift: {badge.shift}
          </div>
          <div style={{ fontSize: '9px', color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 6px', borderRadius: '2px', marginTop: '4px', wordBreak: 'break-all' }}>
            <strong>URL Path:</strong> <code>{badge.urlPath}</code>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '10px' }}>
        <button
          onClick={handlePrint}
          className="ids-btn"
          style={{ flex: 1, padding: '3px 6px', fontSize: '10px', fontWeight: 700, background: '#F8FAFC' }}
        >
          🖨️ Print Badge
        </button>
        <button
          onClick={handleCopy}
          className="ids-btn"
          style={{ flex: 1, padding: '3px 6px', fontSize: '10px' }}
        >
          {copied ? '✓ Copied' : '🔗 Copy Link'}
        </button>
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="ids-btn"
          style={{ flex: 1, padding: '3px 6px', fontSize: '10px', textDecoration: 'none', textAlign: 'center', color: '#000', lineHeight: '18px' }}
        >
          🚀 Test Link
        </a>
      </div>
    </div>
  );
}

/**
 * IdsServersModal - Video 18: Servers V6.5.002.1
 * Win32 MDI Dialog replicating Server Master in IDS Fortune NEXT 6.5 & 7.0 POS Setup
 */
export default function IdsServersModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2026',
  currentUser = 'MANAGER',
  onSelectServerForOrder,
  onOpenOperationalBadges
}) {
  const [servers, setServers] = useState(() => getStoredServers());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Steward QR Badge state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedStewardId, setSelectedStewardId] = useState('SADANANDA');

  // Form Fields (Video 18 Frames 010–028)
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [serverCode, setServerCode] = useState('001');
  const [name, setName] = useState('Kaushik');
  const [shortName, setShortName] = useState('Kaushik');
  const [employeeNo, setEmployeeNo] = useState('EMP-001');
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState('08-FEB-2026 18:53');

  // Form Modes: 'VIEW' | 'ADD' | 'MODIFY'
  const [formMode, setFormMode] = useState('VIEW');
  const [statusMsg, setStatusMsg] = useState(null);

  // Browse Popup (Video 18 Frame 032)
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [selectedBrowseIdx, setSelectedBrowseIdx] = useState(0);

  // Delete Alert Window V6.5.002.1
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetCode, setDeleteTargetCode] = useState(null);

  // Server Panel / Roster View
  const [rosterPanelOpen, setRosterPanelOpen] = useState(false);

  // Load record at currentIndex
  useEffect(() => {
    if (servers.length > 0 && formMode === 'VIEW') {
      const idx = Math.min(currentIndex, servers.length - 1);
      const s = servers[idx];
      if (s) {
        setApplicableFrom(s.applicableFrom || accountingDate);
        setServerCode(s.serverCode || '');
        setName(s.name || '');
        setShortName(s.shortName || '');
        setEmployeeNo(s.employeeNo || '');
        setStatus(s.status || 'Active');
        setUser(s.user || currentUser);
        setLastUpdated(s.lastUpdated || '08-FEB-2026 18:53');
      }
    }
  }, [currentIndex, servers, formMode, accountingDate, currentUser]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Action: Add (Video 18 Frame 015)
  const handleAdd = () => {
    setFormMode('ADD');
    // Auto-generate next 3-digit code
    const codes = servers.map(s => parseInt(s.serverCode, 10)).filter(n => !isNaN(n));
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    const formattedCode = String(nextNum).padStart(3, '0');

    setServerCode(formattedCode);
    setApplicableFrom(accountingDate);
    setName('');
    setShortName('');
    setEmployeeNo(`EMP-${formattedCode}`);
    setStatus('Active');
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 18:55`);
    showNotification(`New Server mode active. Fill details and click Save.`);
  };

  // Action: Modify (Video 19 Frames 010 & 012 - Select Waiter/Waitress to remove)
  const handleModify = () => {
    if (servers.length === 0) return;
    setFormMode('MODIFY');
    setBrowseOpen(true);
    showNotification(`Select Waiter/Waitress Name to remove / set status to Passive (Video 19).`);
  };

  // Quick Deactivate / Toggle for Video 19
  const handleToggleRahulPassive = () => {
    const rahul = servers.find(s => s.serverCode === '004' || s.name.toLowerCase() === 'rahul');
    const newStatus = rahul?.status === 'Passive' ? 'Active' : 'Passive';
    const updated = servers.map(s => {
      if (s.serverCode === '004' || s.name.toLowerCase() === 'rahul') {
        return { ...s, status: newStatus, lastUpdated: `${accountingDate} 19:02` };
      }
      return s;
    });
    setServers(updated);
    saveStoredServers(updated);
    const idx = updated.findIndex(s => s.serverCode === '004' || s.name.toLowerCase() === 'rahul');
    if (idx !== -1) setCurrentIndex(idx);
    setFormMode('VIEW');
    showNotification(`Server 004 (Rahul) status set to ${newStatus}. ${newStatus === 'Passive' ? 'Rahul will not be visible in Order Entry screen.' : 'Rahul is now visible in Order Entry screen.'}`);
  };

  // Action: Delete (Alert Window V6.5.002.1)
  const handleDelete = () => {
    if (servers.length === 0) return;
    const current = servers[currentIndex];
    const code = current?.serverCode || serverCode;
    setDeleteTargetCode(code);
    setDeleteConfirmOpen(true);
  };

  const executeDeleteRecord = () => {
    const code = deleteTargetCode || serverCode;
    const filtered = servers.filter(s => s.serverCode !== code);
    setServers(filtered);
    saveStoredServers(filtered);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormMode('VIEW');
    setDeleteConfirmOpen(false);
    showNotification(`Server Code "${code}" deleted successfully.`);
  };

  // Action: Save (Video 18 Frame 030 & Video 19 Frame 018)
  const handleSave = () => {
    if (!serverCode.trim() || !name.trim()) {
      alert('Please enter both Server Code and Server Name!');
      return;
    }

    const cleanCode = serverCode.trim().padStart(3, '0');
    const updatedRecord = {
      serverCode: cleanCode,
      applicableFrom: applicableFrom.trim() || accountingDate,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().slice(0, 4),
      employeeNo: employeeNo.trim() || `EMP-${cleanCode}`,
      status: status || 'Active',
      user: currentUser,
      lastUpdated: `${accountingDate} 19:02`
    };

    let nextServers;
    if (formMode === 'ADD') {
      const exists = servers.some(s => s.serverCode === cleanCode);
      if (exists) {
        alert(`Server Code "${cleanCode}" already exists! Please choose another code.`);
        return;
      }
      nextServers = [...servers, updatedRecord];
      setServers(nextServers);
      saveStoredServers(nextServers);
      setCurrentIndex(nextServers.length - 1);
      showNotification(`Server ${cleanCode} (${name}) added successfully.`);
    } else {
      nextServers = servers.map(s => s.serverCode === cleanCode ? updatedRecord : s);
      setServers(nextServers);
      saveStoredServers(nextServers);
      showNotification(`Server ${cleanCode} (${name}) updated to ${status}. ${status === 'Passive' ? 'Passive names will not be visible in Order Entry Screen.' : ''}`);
    }

    setFormMode('VIEW');
  };

  // Navigation: Previous / Next
  const handlePrevious = () => {
    if (servers.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : servers.length - 1));
  };

  const handleNext = () => {
    if (servers.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev < servers.length - 1 ? prev + 1 : 0));
  };

  // Select from Browse (Video 19 Frame 012 & 016)
  const handleSelectBrowse = (idx) => {
    const filtered = getFilteredBrowse();
    const item = filtered[idx];
    if (item) {
      const realIdx = servers.findIndex(s => s.serverCode === item.serverCode);
      if (realIdx !== -1) {
        setCurrentIndex(realIdx);
        const s = servers[realIdx];
        setApplicableFrom(s.applicableFrom || accountingDate);
        setServerCode(s.serverCode || '');
        setName(s.name || '');
        setShortName(s.shortName || '');
        setEmployeeNo(s.employeeNo || '');
        setStatus(s.status || 'Active');
        setUser(s.user || currentUser);
        setLastUpdated(s.lastUpdated || `${accountingDate} 19:02`);

        if (formMode === 'MODIFY') {
          showNotification(`Modifying ${s.serverCode} (${s.name}). Set Status to Passive to deactivate.`);
        } else {
          setFormMode('VIEW');
          if (onSelectServerForOrder) {
            onSelectServerForOrder(item);
          }
        }
      }
    }
    setBrowseOpen(false);
  };

  const getFilteredBrowse = () => {
    if (!browseSearch.trim()) return servers;
    const q = browseSearch.toLowerCase();
    return servers.filter(s =>
      s.serverCode.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.shortName && s.shortName.toLowerCase().includes(q))
    );
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      {/* Main Win32 MDI Dialog: Servers V6.5.002.1 */}
      <div 
        className="ids-modal-container"
        style={{
          width: '540px',
          background: '#ECE9D8',
          border: '2px solid #808080',
          boxShadow: '4px 4px 16px rgba(0,0,0,0.6)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          color: '#000'
        }}
      >
        {/* Title Bar matching Video 18 Frame 010 */}
        <div 
          className="ids-modal-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🤵 Servers V6.5.002.1</span>
            <span style={{ fontSize: '9px', opacity: 0.85, fontWeight: 400 }}>
              (Setup - Servers & Stewards Master)
            </span>
          </div>
          <button 
            className="ids-win-btn close"
            onClick={onClose}
            style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
          >
            ✕
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div style={{ background: '#FFFFE1', borderBottom: '1px solid #D4D0C8', padding: '3px 8px', fontSize: '10px', color: '#004085' }}>
            {statusMsg}
          </div>
        )}

        {/* Dialog Body */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Inner Form Card */}
          <div 
            style={{ 
              background: '#FFF', 
              border: '1px solid #7F9DB9', 
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* 1. Applicable From (Frame 010) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Applicable From</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={applicableFrom} 
                  onChange={e => setApplicableFrom(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ 
                    width: '100px', 
                    background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                    border: '1px solid #7F9DB9', 
                    padding: '2px 4px', 
                    fontSize: '11px' 
                  }}
                />
                <button 
                  className="ids-btn" 
                  title="Calendar Lookup" 
                  onClick={() => setApplicableFrom(accountingDate)}
                  style={{ padding: '0 5px', fontSize: '10px', fontWeight: 700 }}
                >
                  ?
                </button>
              </div>
            </div>

            {/* 2. Server Code (Frames 010 & 015) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Server Code</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={serverCode} 
                  onChange={e => setServerCode(e.target.value)}
                  placeholder="e.g. 001, 002"
                  disabled={formMode === 'VIEW'}
                  style={{ 
                    width: '70px', 
                    textAlign: 'center', 
                    background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                    border: '1px solid #7F9DB9', 
                    padding: '2px 4px', 
                    fontSize: '11px', 
                    fontWeight: 800,
                    color: '#0A246A'
                  }}
                />
                <button 
                  className="ids-btn" 
                  title="Lookup Server Records" 
                  onClick={() => setBrowseOpen(true)}
                  style={{ padding: '0 5px', fontSize: '10px', fontWeight: 700 }}
                >
                  ?
                </button>
                <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>
                  ({servers.length > 0 ? currentIndex + 1 : 0} of {servers.length} Servers)
                </span>
              </div>
            </div>

            {/* 3. Name (Frames 015 & 020) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Name</span>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Full Server / Steward Name"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '260px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px',
                  fontWeight: 600
                }}
              />
            </div>

            {/* 4. Short Name (Frames 024 & 028) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Short Name</span>
              <input 
                type="text" 
                value={shortName} 
                onChange={e => setShortName(e.target.value)}
                placeholder="Abbreviated name"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '130px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px' 
                }}
              />
            </div>

            {/* 5. Employee No. */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Employee No.</span>
              <input 
                type="text" 
                value={employeeNo} 
                onChange={e => setEmployeeNo(e.target.value)}
                placeholder="HR / Staff ID"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '110px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px' 
                }}
              />
            </div>

            {/* 6. Status (Frame 010) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Status</span>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '90px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px',
                  fontWeight: 600,
                  color: status === 'Active' ? '#006400' : '#8B0000'
                }}
              >
                <option value="Active">Active</option>
                <option value="Passive">Passive</option>
              </select>
            </div>

            {/* 7. User */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>User</span>
              <input 
                type="text" 
                value={user} 
                onChange={(e) => setUser(e.target.value)}
                style={{ 
                  width: '110px', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  color: '#333' 
                }}
              />
            </div>

            {/* 8. Last Updated */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Last Updated</span>
              <input 
                type="text" 
                value={lastUpdated} 
                onChange={(e) => setLastUpdated(e.target.value)}
                style={{ 
                  width: '140px', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  color: '#333' 
                }}
              />
            </div>
          </div>

          {/* Win32 Bottom Toolbar Action Strip (Video 18 Frame 010) */}
          <div 
            style={{ 
              background: '#ECE9D8', 
              border: '1px solid #999', 
              padding: '4px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                className="ids-btn" 
                onClick={handleAdd}
                style={{ minWidth: '45px', fontWeight: formMode === 'ADD' ? 700 : 400, background: formMode === 'ADD' ? '#C1D2EE' : undefined }}
              >
                Add
              </button>
              <button 
                className="ids-btn" 
                onClick={handleModify}
                style={{ minWidth: '45px', fontWeight: formMode === 'MODIFY' ? 700 : 400, background: formMode === 'MODIFY' ? '#C1D2EE' : undefined }}
              >
                Modify
              </button>
              <button 
                className="ids-btn" 
                onClick={handleDelete}
                style={{ minWidth: '45px', color: '#A00' }}
              >
                Delete
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setBrowseOpen(true)}
                style={{ minWidth: '45px' }}
              >
                Browse
              </button>
              <button 
                className="ids-btn" 
                onClick={handlePrevious}
                disabled={formMode !== 'VIEW'}
                style={{ minWidth: '45px' }}
              >
                Previous
              </button>
              <button 
                className="ids-btn" 
                onClick={handleNext}
                disabled={formMode !== 'VIEW'}
                style={{ minWidth: '45px' }}
              >
                Next
              </button>
              <button 
                className="ids-btn" 
                onClick={handleSave}
                disabled={formMode === 'VIEW'}
                style={{ 
                  minWidth: '45px', 
                  fontWeight: 700, 
                  background: formMode !== 'VIEW' ? '#DFF0D8' : undefined, 
                  borderColor: formMode !== 'VIEW' ? '#3C763D' : undefined 
                }}
              >
                Save
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setRosterPanelOpen(true)}
                title="View Stewards Roster Panel"
                style={{ minWidth: '45px', background: '#FFF2CC', borderColor: '#D6B656', color: '#665200', fontWeight: 600 }}
              >
                Panel
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  const match = OPERATIONAL_QR_BADGES.find(b => b.badgeType === 'steward' && (b.serverCode === serverCode || b.name.toLowerCase().includes(name.toLowerCase())));
                  if (match) setSelectedStewardId(match.id);
                  setQrModalOpen(true);
                }}
                title="View / Print Scannable Steward Mobile QR Badge (6 Floor Stewards)"
                style={{ minWidth: '65px', background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A', fontWeight: 700 }}
              >
                📱 QR Badge
              </button>
              <button 
                className="ids-btn" 
                onClick={onClose}
                style={{ minWidth: '45px' }}
              >
                Exit
              </button>
            </div>
          </div>

          {/* Subtitle Red / Yellow Banner Note (Video 18 & Video 19) */}
          <div 
            style={{ 
              background: '#FFFBE6', 
              border: '1px solid #FFE58F', 
              padding: '8px 12px', 
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#0A246A', fontWeight: 700, fontSize: '12px' }}>
                Server / Steward Master & Deactivation (Video 18 & Video 19)
              </span>
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                Kaushik (001), Ajay (002), Bijay (003), Rahul (004)
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#444', lineHeight: '1.4' }}>
              <strong>Video 19 Deactivation Protocol:</strong> Click <strong>Modify</strong> &rarr; Select Waiter &rarr; Change Status to <strong style={{ color: '#8B0000' }}>Passive</strong> &rarr; Click <strong>Save</strong>. In IDS Fortune NEXT, Passive servers remain in historical audit logs but are strictly excluded from live Order Entry.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button 
                className="ids-btn" 
                onClick={handleToggleRahulPassive}
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  fontWeight: 700,
                  background: servers.find(s => s.serverCode === '004')?.status === 'Passive' ? '#DFF0D8' : '#F2DEDE',
                  borderColor: servers.find(s => s.serverCode === '004')?.status === 'Passive' ? '#3C763D' : '#A94442',
                  color: servers.find(s => s.serverCode === '004')?.status === 'Passive' ? '#3C763D' : '#A94442'
                }}
              >
                {servers.find(s => s.serverCode === '004')?.status === 'Passive'
                  ? '✅ Rahul (004) is PASSIVE — Click to Restore Active'
                  : '⚠️ Deactivate Rahul (004) to PASSIVE (Video 19 Demo)'}
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setBrowseOpen(true)}
                style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                Browse Records (F8) →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROWSE POPUP DIALOG (Video 18 Frame 032) */}
      {browseOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Servers V6.5.002.1 - Browse</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setBrowseOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Filter:</span>
                <input 
                  type="text" 
                  value={browseSearch} 
                  onChange={e => setBrowseSearch(e.target.value)} 
                  placeholder="Type Server Code or Name..." 
                  style={{ flex: 1, padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                />
              </div>

              {/* Grid matching Frame 032 */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC', width: '90px' }}>Server Code</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC', width: '110px' }}>Applicable From</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', width: '60px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBrowse().map((item, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => setSelectedBrowseIdx(idx)}
                        onDoubleClick={() => handleSelectBrowse(idx)}
                        style={{
                          background: selectedBrowseIdx === idx ? '#0A246A' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'),
                          color: selectedBrowseIdx === idx ? '#FFF' : '#000',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0DFE3', fontWeight: 700 }}>{item.serverCode}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0DFE3' }}>{item.applicableFrom}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0DFE3', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', color: selectedBrowseIdx === idx ? '#FFF' : (item.status === 'Active' ? '#006400' : '#8B0000'), fontWeight: 700 }}>
                          {item.status}
                        </td>
                      </tr>
                    ))}
                    {getFilteredBrowse().length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                          No server records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => handleSelectBrowse(selectedBrowseIdx)}
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Select
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setBrowseOpen(false)} 
                  style={{ minWidth: '65px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ALERT WINDOW V6.5.002.1 - DELETE CONFIRMATION (Video 17 Frame 018) */}
      {deleteConfirmOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '240px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 14px rgba(0,0,0,0.7)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Alert Window V6.5.002.1</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setDeleteConfirmOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#000', textAlign: 'center' }}>
                Delete Record
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="ids-btn" 
                  autoFocus
                  onClick={executeDeleteRecord}
                  style={{ minWidth: '55px', padding: '2px 14px', fontSize: '11px', fontWeight: 700 }}
                >
                  Yes
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setDeleteConfirmOpen(false)}
                  style={{ minWidth: '55px', padding: '2px 14px', fontSize: '11px' }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ROSTER & DIRECTORY PANEL */}
      {rosterPanelOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1370 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '560px', background: '#ECE9D8', border: '3px solid #808080', boxShadow: '6px 6px 20px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>
                📋 Servers & Stewards Roster Panel
              </span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setRosterPanelOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', marginBottom: '6px' }}>
                  Active Stewards on Floor Duty
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {servers.map((s, idx) => (
                    <div 
                      key={idx}
                      style={{
                        border: '1px solid #D4D0C8',
                        padding: '6px 8px',
                        background: s.status === 'Active' ? '#F4F9F4' : '#FFF0F0',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0A246A', fontSize: '12px' }}>
                        Code: {s.serverCode}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '11px', color: '#333' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        Short: {s.shortName || '-'} | {s.employeeNo || '-'}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: s.status === 'Active' ? '#006400' : '#8B0000', marginTop: '2px' }}>
                        ● {s.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setRosterPanelOpen(false)}
                  style={{ minWidth: '70px', fontWeight: 700 }}
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STEWARD QR BADGE MODAL (6 Stewards) */}
      {qrModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1380 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '500px', background: '#ECE9D8', border: '3px solid #808080', boxShadow: '6px 6px 22px rgba(0,0,0,0.85)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '11px' }}>
                <span>📱 Servers V6.5.002.1 — Steward Mobile Order Pad QR Badge</span>
              </div>
              <button 
                className="ids-win-btn close" 
                onClick={() => setQrModalOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#333' }}>
                Select any of the <strong>6 Floor Stewards</strong> to generate instant scannable mobile badge:
              </div>

              {/* 6 Steward Selector Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#FFF', padding: '6px', border: '1px solid #7F9DB9' }}>
                {OPERATIONAL_QR_BADGES.filter(b => b.badgeType === 'steward').map(st => {
                  const isSel = selectedStewardId === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStewardId(st.id)}
                      className="ids-btn"
                      style={{
                        fontSize: '9.5px',
                        padding: '3px 4px',
                        fontWeight: isSel ? 700 : 400,
                        background: isSel ? '#0A246A' : '#ECE9D8',
                        color: isSel ? '#FFF' : '#000',
                        border: isSel ? '1px solid #000' : '1px outset #FFF',
                        textAlign: 'left'
                      }}
                    >
                      {st.code}: {st.shortName} ({st.serverCode})
                    </button>
                  );
                })}
              </div>

              {/* QR Preview Card */}
              {(() => {
                const badge = OPERATIONAL_QR_BADGES.find(b => b.id === selectedStewardId) || OPERATIONAL_QR_BADGES[0];
                return (
                  <IdsStewardQrPreview 
                    badge={badge} 
                    onOpenOperationalBadges={() => {
                      setQrModalOpen(false);
                      if (onOpenOperationalBadges) onOpenOperationalBadges();
                    }}
                  />
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <button
                  className="ids-btn"
                  onClick={() => {
                    setQrModalOpen(false);
                    if (onOpenOperationalBadges) onOpenOperationalBadges();
                  }}
                  style={{ fontSize: '10px', fontWeight: 700, color: '#0A246A', background: '#FFF' }}
                >
                  📋 Open Full 9 Badges Sheet (Staff Master) →
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setQrModalOpen(false)}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
