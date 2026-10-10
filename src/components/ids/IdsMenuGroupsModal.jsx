import React, { useState, useEffect } from 'react';

/**
 * IDS Fortune NEXT 6.5 & 7.0 - Menu Groups V6.5.002.1
 * Video 14 Implementation (POS_14_LOgYRe-1TtI.mp4)
 * Frames 001 - 053: Setup -> Menu Groups Creation & Touch Screen Group Linkage
 */

export const DEFAULT_MENU_GROUPS = [
  { code: 1, applicableFrom: '08-FEB-2026', name: 'MAIN COURSE', shortName: 'MAIN', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:47' },
  { code: 2, applicableFrom: '08-FEB-2026', name: 'TANDOOR ITEMS', shortName: 'TAND', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:47' },
  { code: 3, applicableFrom: '08-FEB-2026', name: 'STARTERS', shortName: 'STARTERS', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:47' },
  { code: 4, applicableFrom: '08-FEB-2026', name: 'SOUP', shortName: 'SOUP', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:47' },
  { code: 5, applicableFrom: '08-FEB-2026', name: 'SALAD', shortName: 'SALAD', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:48' }
];

const STORAGE_KEY = 'ids_fortune_next_pos_menu_groups';

export const getStoredMenuGroups = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse menu groups', e);
  }
  return DEFAULT_MENU_GROUPS;
};

export const saveStoredMenuGroups = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.warn('Failed to save menu groups', e);
  }
};

export default function IdsMenuGroupsModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2026',
  currentUser = 'MANAGER',
  onSelectGroup,
  onOpenTouchScreenGroups
}) {
  const [groups, setGroups] = useState(() => getStoredMenuGroups());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form Fields
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [groupCode, setGroupCode] = useState('1');
  const [groupName, setGroupName] = useState('MAIN COURSE');
  const [shortName, setShortName] = useState('MAIN');
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState('08-FEB-2026 18:47');

  // Mode: 'VIEW' | 'ADD' | 'MODIFY'
  const [formMode, setFormMode] = useState('VIEW');
  const [statusMsg, setStatusMsg] = useState(null);

  // Browse / Lookup Popup (Video 14 Frame 040)
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [selectedBrowseIdx, setSelectedBrowseIdx] = useState(0);

  // Touch Screen Group Notification / Modal State
  const [touchGroupAlertOpen, setTouchGroupAlertOpen] = useState(false);

  // Sync current record into form fields
  useEffect(() => {
    if (groups.length > 0 && formMode === 'VIEW') {
      const safeIdx = Math.min(Math.max(0, currentIndex), groups.length - 1);
      const curr = groups[safeIdx];
      if (curr) {
        setApplicableFrom(curr.applicableFrom || accountingDate);
        setGroupCode(String(curr.code));
        setGroupName(curr.name || '');
        setShortName(curr.shortName || '');
        setStatus(curr.status || 'Active');
        setUser(curr.user || currentUser);
        setLastUpdated(curr.lastUpdated || `${accountingDate} 18:47`);
      }
    }
  }, [currentIndex, groups, formMode, accountingDate, currentUser]);

  const showNotification = (msg, duration = 3000) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), duration);
  };

  // Action: Add (Frame 010 & Frame 020)
  const handleAdd = () => {
    setFormMode('ADD');
    const nextCode = groups.length > 0 ? Math.max(...groups.map(g => Number(g.code) || 0)) + 1 : 1;
    setGroupCode(String(nextCode));
    setGroupName('');
    setShortName('');
    setStatus('Active');
    setApplicableFrom(accountingDate);
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 18:48`);
    showNotification(`New Menu Group #${nextCode} entry initiated.`);
  };

  // Action: Modify
  const handleModify = () => {
    if (groups.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Editing Menu Group #${groupCode} (${groupName}).`);
  };

  // Action: Delete
  const handleDelete = () => {
    if (groups.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete Menu Group #${groupCode} - "${groupName}"?`);
    if (!confirmDelete) return;

    const filtered = groups.filter(g => String(g.code) !== String(groupCode));
    setGroups(filtered);
    saveStoredMenuGroups(filtered);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormMode('VIEW');
    showNotification(`Menu Group #${groupCode} successfully deleted.`);
  };

  // Action: Save (Frame 045)
  const handleSave = () => {
    if (!groupName.trim()) {
      alert('Please enter a Menu Group Name!');
      return;
    }

    const codeNum = Number(groupCode) || (groups.length + 1);
    const updatedRecord = {
      code: codeNum,
      applicableFrom: applicableFrom || accountingDate,
      name: groupName.trim().toUpperCase(),
      shortName: shortName.trim().toUpperCase() || groupName.trim().substring(0, 6).toUpperCase(),
      status,
      user,
      lastUpdated: `${accountingDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    };

    let updatedList;
    const existingIdx = groups.findIndex(g => Number(g.code) === codeNum);

    if (existingIdx >= 0) {
      updatedList = [...groups];
      updatedList[existingIdx] = updatedRecord;
      setCurrentIndex(existingIdx);
    } else {
      updatedList = [...groups, updatedRecord].sort((a, b) => Number(a.code) - Number(b.code));
      const targetIdx = updatedList.findIndex(g => Number(g.code) === codeNum);
      setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
    }

    setGroups(updatedList);
    saveStoredMenuGroups(updatedList);
    setFormMode('VIEW');

    // Trigger Video 14 Note requirement: "Touch Screen Group also need to create after Menu Group Creation."
    setTouchGroupAlertOpen(true);
    showNotification(`Menu Group #${codeNum} ("${updatedRecord.name}") saved successfully!`);
  };

  // Navigation: Previous
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFormMode('VIEW');
    }
  };

  // Navigation: Next
  const handleNext = () => {
    if (currentIndex < groups.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFormMode('VIEW');
    }
  };

  // Browse Selection Handler (Frame 040)
  const handleSelectBrowse = (idx) => {
    const item = filteredBrowseGroups[idx];
    if (item) {
      const originalIdx = groups.findIndex(g => g.code === item.code);
      if (originalIdx >= 0) {
        setCurrentIndex(originalIdx);
      }
      setBrowseOpen(false);
      setFormMode('VIEW');
      if (onSelectGroup) onSelectGroup(item);
    }
  };

  const filteredBrowseGroups = groups.filter(g => 
    !browseSearch || 
    g.name.toLowerCase().includes(browseSearch.toLowerCase()) || 
    String(g.code).includes(browseSearch)
  );

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Main Win32 Window: Menu Groups V6.5.002.1 */}
      <div 
        className="ids-modal-container" 
        style={{ width: '560px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
      >
        {/* Title Bar (Frame 010) */}
        <div 
          className="ids-modal-titlebar" 
          style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
            Menu Groups V6.5.002.1
          </span>
          <button 
            className="ids-win-btn close" 
            onClick={onClose} 
            style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Status Message Notification */}
          {statusMsg && (
            <div style={{ background: '#DFF0D8', border: '1px solid #D6E9C6', color: '#3C763D', padding: '3px 8px', fontSize: '10px', fontWeight: 700 }}>
              {statusMsg}
            </div>
          )}

          {/* Inner Recessed Groupbox (Frames 010–014) */}
          <div 
            style={{ 
              border: '2px groove #FFFFFF', 
              padding: '14px 18px', 
              background: '#ECE9D8',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}
          >
            {/* 1. Applicable From */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Applicable From</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={applicableFrom} 
                  onChange={e => setApplicableFrom(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ 
                    width: '120px', 
                    background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                    border: '1px solid #7F9DB9', 
                    padding: '2px 4px', 
                    fontSize: '11px', 
                    fontWeight: 600 
                  }}
                />
                <button 
                  className="ids-btn" 
                  title="Date Lookup / Set Current Date" 
                  onClick={() => setApplicableFrom(accountingDate)}
                  style={{ padding: '0 5px', fontSize: '10px', fontWeight: 700 }}
                >
                  ?
                </button>
              </div>
            </div>

            {/* 2. Menu Group Code */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Menu Group Code</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={groupCode} 
                  onChange={e => setGroupCode(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ 
                    width: '60px', 
                    textAlign: 'center', 
                    background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                    border: '1px solid #7F9DB9', 
                    padding: '2px 4px', 
                    fontSize: '11px', 
                    fontWeight: 700 
                  }}
                />
                <button 
                  className="ids-btn" 
                  title="Browse Menu Groups (Video 14 Frame 040)" 
                  onClick={() => setBrowseOpen(true)}
                  style={{ padding: '0 5px', fontSize: '10px', fontWeight: 700 }}
                >
                  ?
                </button>
                <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>
                  ({currentIndex + 1} of {groups.length})
                </span>
              </div>
            </div>

            {/* 3. Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Name</span>
              <input 
                type="text" 
                value={groupName} 
                onChange={e => setGroupName(e.target.value)}
                placeholder="MAIN COURSE / TANDOOR / STARTERS / SOUP"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '92%', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 6px', 
                  fontSize: '11px', 
                  fontWeight: 700,
                  color: '#000080'
                }}
              />
            </div>

            {/* 4. Short Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Short Name</span>
              <input 
                type="text" 
                value={shortName} 
                onChange={e => setShortName(e.target.value)}
                placeholder="MAIN / TAND / SOUP"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '140px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px' 
                }}
              />
            </div>

            {/* 5. Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Status</span>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '100px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* 6. User */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>User</span>
              <input 
                type="text" 
                readOnly 
                value={user} 
                style={{ 
                  width: '120px', 
                  background: '#E0DFE3', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  color: '#333' 
                }}
              />
            </div>

            {/* 7. Last Updated */}
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

          {/* Win32 Bottom Toolbar Action Strip (Frame 010 & Frame 045) */}
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
                style={{ minWidth: '45px', fontWeight: 600 }}
              >
                Browse
              </button>
            </div>

            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                className="ids-btn" 
                onClick={handlePrevious} 
                disabled={currentIndex <= 0}
                style={{ minWidth: '50px' }}
              >
                Previous
              </button>
              <button 
                className="ids-btn" 
                onClick={handleNext} 
                disabled={currentIndex >= groups.length - 1}
                style={{ minWidth: '45px' }}
              >
                Next
              </button>
            </div>

            <div style={{ display: 'flex', gap: '3px' }}>
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
                onClick={() => { setFormMode('VIEW'); showNotification('Panel refreshed.'); }}
                style={{ minWidth: '45px' }}
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

          {/* Subtitle Red / Yellow Banner Note (Video 14 Frames 014–050) */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: '#FFFF00', color: '#D00', fontWeight: 900, fontSize: '11px', padding: '1px 4px' }}>
                Note:
              </span>
              <span style={{ color: '#D00', fontWeight: 700, fontSize: '11px' }}>
                Touch Screen Group also need to create after Menu Group Creation.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>
                In IDS POS, each Menu Group must be linked to a Touch Screen Group for terminal visibility.
              </span>
              <button 
                className="ids-btn" 
                onClick={() => {
                  if (onOpenTouchScreenGroups) {
                    onOpenTouchScreenGroups(groupCode);
                  } else {
                    setTouchGroupAlertOpen(true);
                  }
                }}
                style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                Link TS Group →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROWSE POPUP DIALOG (Video 14 Frame 040) */}
      {browseOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '460px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            {/* Titlebar */}
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Menu Groups V6.5.002.1</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setBrowseOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Search Filter Box (Frame 040) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                <span style={{ fontWeight: 600 }}>Name</span>
                <input 
                  type="text" 
                  autoFocus
                  value={browseSearch} 
                  onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Filter menu groups..."
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px' }}
                />
              </div>

              {/* Browse Data Grid (Frame 040) */}
              <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '75px' }}>Menu Group</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '100px' }}>Applicable From</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrowseGroups.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '20px 8px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                          No matching Menu Groups found.
                        </td>
                      </tr>
                    ) : (
                      filteredBrowseGroups.map((grp, idx) => {
                        const isSelected = selectedBrowseIdx === idx;
                        return (
                          <tr 
                            key={grp.code}
                            onClick={() => setSelectedBrowseIdx(idx)}
                            onDoubleClick={() => handleSelectBrowse(idx)}
                            style={{ 
                              borderBottom: '1px solid #EEE',
                              background: isSelected ? '#316AC5' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'),
                              color: isSelected ? '#FFF' : '#000',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{grp.code}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{grp.applicableFrom}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>{grp.name}</td>
                            <td style={{ padding: '3px 6px' }}>{grp.status}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Buttons (Frame 040) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
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

      {/* 3. TOUCH SCREEN GROUP LINKAGE DIALOG */}
      {touchGroupAlertOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '440px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Touch Screen Group Linkage</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setTouchGroupAlertOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, color: '#000080', fontSize: '12px' }}>
                IDS POS Workflow Requirement (Video 14):
              </div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 10px', lineHeight: '16px' }}>
                <div>• Menu Group: <b>#{groupCode} - {groupName}</b></div>
                <div>• Touch Screen Group Mapping: <b>TSG-{groupCode.padStart(2, '0')} ({groupName})</b></div>
                <div>• Outlet: <b>RESTAURANT &amp; LIQUOR BAR</b></div>
                <div style={{ color: '#008000', fontWeight: 700, marginTop: '4px' }}>
                  ✓ Touch Screen Group successfully generated and linked to POS Order Entry terminals!
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setTouchGroupAlertOpen(false);
                    showNotification(`Touch Screen Group TSG-${groupCode.padStart(2, '0')} activated on POS terminals!`);
                  }} 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
