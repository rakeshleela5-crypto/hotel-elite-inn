import React, { useState, useEffect } from 'react';

// Default initial servers matching Video 18 Frame 032
const DEFAULT_SERVERS = [
  {
    serverCode: '001',
    applicableFrom: '08-FEB-2022',
    name: 'Kaushik',
    shortName: 'Kaushik',
    employeeNo: 'EMP-001',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '08-FEB-2022 18:53'
  },
  {
    serverCode: '002',
    applicableFrom: '08-FEB-2022',
    name: 'Ajay',
    shortName: 'Ajay',
    employeeNo: 'EMP-002',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '08-FEB-2022 18:54'
  },
  {
    serverCode: '003',
    applicableFrom: '08-FEB-2022',
    name: 'Bijay',
    shortName: 'Bij',
    employeeNo: 'EMP-003',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '08-FEB-2022 18:54'
  },
  {
    serverCode: '004',
    applicableFrom: '08-FEB-2022',
    name: 'Rahul',
    shortName: 'Rah',
    employeeNo: 'EMP-004',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '08-FEB-2022 18:54'
  },
  {
    serverCode: '101',
    applicableFrom: '08-FEB-2022',
    name: 'Biren',
    shortName: 'Bir',
    employeeNo: 'EMP-101',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '08-FEB-2022 19:10'
  }
];

export function getStoredServers() {
  try {
    const raw = localStorage.getItem('ids_pos_servers');
    if (raw) return JSON.parse(raw);
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

/**
 * IdsServersModal - Video 18: Servers V6.5.002.1
 * Win32 MDI Dialog replicating Server Master in IDS Fortune NEXT 6.5 & 7.0 POS Setup
 */
export default function IdsServersModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2022',
  currentUser = 'MANAGER',
  onSelectServerForOrder
}) {
  const [servers, setServers] = useState(() => getStoredServers());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form Fields (Video 18 Frames 010–028)
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [serverCode, setServerCode] = useState('001');
  const [name, setName] = useState('Kaushik');
  const [shortName, setShortName] = useState('Kaushik');
  const [employeeNo, setEmployeeNo] = useState('EMP-001');
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState('08-FEB-2022 18:53');

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
        setLastUpdated(s.lastUpdated || '08-FEB-2022 18:53');
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

  // Action: Modify
  const handleModify = () => {
    if (servers.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Editing Server ${serverCode} (${name}).`);
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

  // Action: Save (Video 18 Frame 030)
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
      lastUpdated: `${accountingDate} 18:55`
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
      showNotification(`Server ${cleanCode} updated successfully.`);
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

  // Select from Browse
  const handleSelectBrowse = (idx) => {
    const filtered = getFilteredBrowse();
    const item = filtered[idx];
    if (item) {
      const realIdx = servers.findIndex(s => s.serverCode === item.serverCode);
      if (realIdx !== -1) {
        setCurrentIndex(realIdx);
        setFormMode('VIEW');
        if (onSelectServerForOrder) {
          onSelectServerForOrder(item);
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

            {/* 5. Employee # */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Employee #</span>
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
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* 7. User */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>User</span>
              <input 
                type="text" 
                readOnly 
                value={user} 
                style={{ 
                  width: '110px', 
                  background: '#E0DFE3', 
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
                readOnly 
                value={lastUpdated} 
                style={{ 
                  width: '140px', 
                  background: '#E0DFE3', 
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
                onClick={onClose}
                style={{ minWidth: '45px' }}
              >
                Exit
              </button>
            </div>
          </div>

          {/* Subtitle Red / Yellow Banner Note */}
          <div 
            style={{ 
              background: '#FFFBE6', 
              border: '1px solid #FFE58F', 
              padding: '8px 12px', 
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#0A246A', fontWeight: 700, fontSize: '12px' }}>
                Server / Steward Master Configuration (Video 18)
              </span>
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                Kaushik (001), Ajay (002), Bijay (003), Rahul (004)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: '#444' }}>
                Servers configured here are assigned during KOT punching, order entry, and settlement billing.
              </span>
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
    </div>
  );
}
