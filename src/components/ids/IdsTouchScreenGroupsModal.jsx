import React, { useState, useEffect } from 'react';
import { getStoredMenuGroups } from './IdsMenuGroupsModal';

/**
 * IDS Fortune NEXT 6.5 & 7.0 - Touch Screen Groups V6.5.002.1
 * Video 15 Implementation (POS_15_5f1edu5Om_U.mp4)
 * Frames 001 - 049: Setup -> Touch Screen Groups Creation & Terminal Tile Configuration
 */

export const DEFAULT_TOUCH_SCREEN_GROUPS = [
  { code: 1, menuGroupCode: 1, applicableFrom: '08-FEB-2026', name: 'MAIN COURSE', shortName: 'MAIN C', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:51' },
  { code: 2, menuGroupCode: 2, applicableFrom: '08-FEB-2026', name: 'TANDOOR ITEMS', shortName: 'TAND', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:51' },
  { code: 3, menuGroupCode: 3, applicableFrom: '08-FEB-2026', name: 'STARTERS', shortName: 'STARTE', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:52' },
  { code: 4, menuGroupCode: 4, applicableFrom: '08-FEB-2026', name: 'SOUP', shortName: 'SOUP', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:52' },
  { code: 5, menuGroupCode: 5, applicableFrom: '08-FEB-2026', name: 'SALAD', shortName: 'SALAD', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:52' },
  { code: 6, menuGroupCode: 6, applicableFrom: '08-FEB-2026', name: 'APPETISERS', shortName: 'APPE', otherLangName: '', otherLangShort: '', status: 'Active', user: 'MANAGER', lastUpdated: '08-FEB-2026 18:52' }
];

const STORAGE_KEY = 'ids_fortune_next_pos_touch_screen_groups';

export const getStoredTouchScreenGroups = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse touch screen groups', e);
  }
  return DEFAULT_TOUCH_SCREEN_GROUPS;
};

export const saveStoredTouchScreenGroups = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.warn('Failed to save touch screen groups', e);
  }
};

export default function IdsTouchScreenGroupsModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2026',
  currentUser = 'MANAGER',
  initialMenuGroupCode = null,
  onOpenMenuGroups
}) {
  const [groups, setGroups] = useState(() => getStoredTouchScreenGroups());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form Fields (Frames 010–015)
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [menuGrouping, setMenuGrouping] = useState('1');
  const [groupName, setGroupName] = useState('MAIN COURSE');
  const [otherLanguageName, setOtherLanguageName] = useState('');
  const [shortName, setShortName] = useState('MAIN C');
  const [otherLanguageShort, setOtherLanguageShort] = useState('');
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState('08-FEB-2026 18:51');

  // Form Mode: 'VIEW' | 'ADD' | 'MODIFY'
  const [formMode, setFormMode] = useState('VIEW');
  const [statusMsg, setStatusMsg] = useState(null);

  // Browse / Lookup Popup (Video 15 Browse button)
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [selectedBrowseIdx, setSelectedBrowseIdx] = useState(0);

  // Menu Groups Lookup Popup (when clicking (?) next to Menu Grouping)
  const [menuGroupLookupOpen, setMenuGroupLookupOpen] = useState(false);
  const [menuGroupSearch, setMenuGroupSearch] = useState('');

  // Touch Screen POS Terminal Visual Preview Dialog
  const [previewTerminalOpen, setPreviewTerminalOpen] = useState(false);

  // Initialize or handle preloaded menu group
  useEffect(() => {
    if (initialMenuGroupCode) {
      const matchIdx = groups.findIndex(g => String(g.menuGroupCode) === String(initialMenuGroupCode));
      if (matchIdx >= 0) {
        setCurrentIndex(matchIdx);
      } else {
        // Pre-fill as new entry
        handleAdd();
        setMenuGrouping(String(initialMenuGroupCode));
        const menuGroups = getStoredMenuGroups();
        const foundMg = menuGroups.find(m => String(m.code) === String(initialMenuGroupCode));
        if (foundMg) {
          setGroupName(foundMg.name || '');
          setShortName(foundMg.shortName || foundMg.name?.substring(0, 6) || '');
        }
      }
    }
  }, [initialMenuGroupCode, isOpen]);

  // Sync current record into form fields in VIEW mode
  useEffect(() => {
    if (groups.length > 0 && formMode === 'VIEW') {
      const safeIdx = Math.min(Math.max(0, currentIndex), groups.length - 1);
      const curr = groups[safeIdx];
      if (curr) {
        setApplicableFrom(curr.applicableFrom || accountingDate);
        setMenuGrouping(String(curr.menuGroupCode ?? curr.code));
        setGroupName(curr.name || '');
        setOtherLanguageName(curr.otherLangName || '');
        setShortName(curr.shortName || '');
        setOtherLanguageShort(curr.otherLangShort || '');
        setStatus(curr.status || 'Active');
        setUser(curr.user || currentUser);
        setLastUpdated(curr.lastUpdated || `${accountingDate} 18:51`);
      }
    }
  }, [currentIndex, groups, formMode, accountingDate, currentUser]);

  const showNotification = (msg, duration = 3000) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), duration);
  };

  // Action: Add (Frames 010, 020, 030, 040)
  const handleAdd = () => {
    setFormMode('ADD');
    const nextCode = groups.length > 0 ? Math.max(...groups.map(g => Number(g.code) || 0)) + 1 : 1;
    setMenuGrouping(String(nextCode));
    setGroupName('');
    setOtherLanguageName('');
    setShortName('');
    setOtherLanguageShort('');
    setStatus('Active');
    setApplicableFrom(accountingDate);
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 18:52`);
    showNotification(`New Touch Screen Group #${nextCode} entry initiated.`);
  };

  // Action: Modify
  const handleModify = () => {
    if (groups.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Editing Touch Screen Group #${menuGrouping} (${groupName}).`);
  };

  // Action: Delete
  const handleDelete = () => {
    if (groups.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete Touch Screen Group #${menuGrouping} - "${groupName}"?`);
    if (!confirmDelete) return;

    const filtered = groups.filter(g => String(g.code) !== String(menuGrouping) && String(g.menuGroupCode) !== String(menuGrouping));
    setGroups(filtered);
    saveStoredTouchScreenGroups(filtered);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormMode('VIEW');
    showNotification(`Touch Screen Group #${menuGrouping} successfully removed.`);
  };

  // Action: Save (Frame 045)
  const handleSave = () => {
    if (!groupName.trim()) {
      alert('Please enter a Touch Screen Group Name!');
      return;
    }

    const mgNum = Number(menuGrouping) || (groups.length + 1);
    const updatedRecord = {
      code: mgNum,
      menuGroupCode: mgNum,
      applicableFrom: applicableFrom || accountingDate,
      name: groupName.trim().toUpperCase(),
      shortName: shortName.trim().toUpperCase() || groupName.trim().substring(0, 6).toUpperCase(),
      otherLangName: otherLanguageName.trim(),
      otherLangShort: otherLanguageShort.trim(),
      status,
      user,
      lastUpdated: `${accountingDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    };

    let updatedList;
    const existingIdx = groups.findIndex(g => Number(g.code) === mgNum || Number(g.menuGroupCode) === mgNum);

    if (existingIdx >= 0) {
      updatedList = [...groups];
      updatedList[existingIdx] = updatedRecord;
      setCurrentIndex(existingIdx);
    } else {
      updatedList = [...groups, updatedRecord].sort((a, b) => Number(a.code) - Number(b.code));
      const targetIdx = updatedList.findIndex(g => Number(g.code) === mgNum);
      setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
    }

    setGroups(updatedList);
    saveStoredTouchScreenGroups(updatedList);
    setFormMode('VIEW');
    showNotification(`Touch Screen Group #${mgNum} ("${updatedRecord.name}") saved & active on POS terminals!`);
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

  // Handle selecting from Menu Groups lookup popup
  const handleSelectMenuGroup = (mg) => {
    setMenuGrouping(String(mg.code));
    setGroupName(mg.name || '');
    setShortName(mg.shortName || mg.name?.substring(0, 6) || '');
    setMenuGroupLookupOpen(false);
    showNotification(`Linked to Menu Group #${mg.code} (${mg.name})`);
  };

  // Handle selecting from Browse popup
  const handleSelectBrowse = (idx) => {
    const item = filteredBrowseGroups[idx];
    if (item) {
      const originalIdx = groups.findIndex(g => g.code === item.code);
      if (originalIdx >= 0) {
        setCurrentIndex(originalIdx);
      }
      setBrowseOpen(false);
      setFormMode('VIEW');
    }
  };

  const filteredBrowseGroups = groups.filter(g =>
    !browseSearch ||
    g.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
    g.shortName.toLowerCase().includes(browseSearch.toLowerCase()) ||
    String(g.code).includes(browseSearch) ||
    String(g.menuGroupCode).includes(browseSearch)
  );

  const availableMenuGroups = getStoredMenuGroups().filter(mg =>
    !menuGroupSearch ||
    mg.name.toLowerCase().includes(menuGroupSearch.toLowerCase()) ||
    String(mg.code).includes(menuGroupSearch)
  );

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1260 }}>
      {/* Main Win32 Dialog: Touch Screen Groups V6.5.002.1 */}
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
            Touch Screen Groups V6.5.002.1
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

          {/* Inner Recessed Groupbox (Frames 010–015) */}
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

            {/* 2. Menu Grouping (Links to Video 14 Menu Groups) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Menu Grouping</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={menuGrouping} 
                  onChange={e => setMenuGrouping(e.target.value)}
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
                  title="Lookup Menu Groups (Video 14)" 
                  onClick={() => setMenuGroupLookupOpen(true)}
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

            {/* 4. Other Language (Name) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Other Language</span>
              <input 
                type="text" 
                value={otherLanguageName} 
                onChange={e => setOtherLanguageName(e.target.value)}
                placeholder="Optional Regional / Second Language"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '92%', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 6px', 
                  fontSize: '11px' 
                }}
              />
            </div>

            {/* 5. Short Name (Terminal Button Tile Label) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Short Name</span>
              <input 
                type="text" 
                value={shortName} 
                onChange={e => setShortName(e.target.value)}
                placeholder="MAIN C / TAND / APPE"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '140px', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px',
                  fontWeight: 700
                }}
              />
            </div>

            {/* 6. Other Language (Short Name) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Other Language</span>
              <input 
                type="text" 
                value={otherLanguageShort} 
                onChange={e => setOtherLanguageShort(e.target.value)}
                placeholder="Optional Short Label in Second Language"
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

            {/* 7. Status */}
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

            {/* 8. User */}
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

            {/* 9. Last Updated */}
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
                onClick={() => setPreviewTerminalOpen(true)}
                title="Preview Touch POS Buttons"
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

          {/* Subtitle Red / Yellow Banner Note (Video 15 Frames 015–045) */}
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
                Before adding Touch Screen Group First Create Menu Group.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>
                Touch Screen Groups link directly to existing Menu Groups to generate terminal category tiles.
              </span>
              {onOpenMenuGroups && (
                <button 
                  className="ids-btn" 
                  onClick={onOpenMenuGroups}
                  style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
                >
                  ← Open Menu Groups
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROWSE POPUP (Touch Screen Groups V6.5.002.1) */}
      {browseOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '520px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Touch Screen Groups V6.5.002.1 - Browse</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setBrowseOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                <span style={{ fontWeight: 600 }}>Filter:</span>
                <input 
                  type="text" 
                  autoFocus
                  value={browseSearch} 
                  onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Search TS group name, short name or code..."
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px' }}
                />
              </div>

              <div style={{ height: '190px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '60px' }}>Code</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '65px' }}>Menu Grp</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '80px' }}>Short Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', width: '55px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrowseGroups.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px 8px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                          No matching Touch Screen Groups found.
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
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{grp.menuGroupCode}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>{grp.name}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{grp.shortName}</td>
                            <td style={{ padding: '3px 6px' }}>{grp.status}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

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

      {/* 3. MENU GROUP LOOKUP POPUP (Video 14 Integration) */}
      {menuGroupLookupOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1370 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '440px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Select Menu Group (Video 14 Master)</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setMenuGroupLookupOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                autoFocus
                value={menuGroupSearch} 
                onChange={e => setMenuGroupSearch(e.target.value)}
                placeholder="Search Menu Groups..."
                style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px' }}
              />

              <div style={{ height: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '50px' }}>Code</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Group Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', width: '80px' }}>Short Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableMenuGroups.map((mg, idx) => (
                      <tr 
                        key={mg.code}
                        onClick={() => handleSelectMenuGroup(mg)}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #EEE', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5F1FB'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#FFF' : '#F9F9F9'}
                      >
                        <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{mg.code}</td>
                        <td style={{ padding: '4px 6px', fontWeight: 600, borderRight: '1px solid #EEE' }}>{mg.name}</td>
                        <td style={{ padding: '4px 6px' }}>{mg.shortName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setMenuGroupLookupOpen(false)} 
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOUCH POS TERMINAL PREVIEW DIALOG */}
      {previewTerminalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1380 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '580px', background: '#333', border: '3px solid #000', borderRadius: '4px', boxShadow: '6px 6px 24px rgba(0,0,0,0.8)', color: '#FFF' }}
          >
            <div style={{ background: '#111', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444' }}>
              <span style={{ fontWeight: 700, fontSize: '12px', color: '#4CAF50' }}>
                🖥️ IDS Fortune NEXT Touch Screen POS Terminal View
              </span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setPreviewTerminalOpen(false)}
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: '#BBB' }}>
                Terminal Category Header Tiles configured by <b>Touch Screen Groups V6.5.002.1</b>:
              </div>

              {/* Touch Screen Tiles Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {groups.map(g => (
                  <div 
                    key={g.code}
                    style={{ 
                      background: g.status === 'Active' ? 'linear-gradient(180deg, #3A6073 0%, #16222F 100%)' : '#444', 
                      border: '2px solid #5C93B2', 
                      borderRadius: '6px', 
                      padding: '12px 8px', 
                      textAlign: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                      opacity: g.status === 'Active' ? 1 : 0.5
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', letterSpacing: '0.5px' }}>
                      {g.shortName || g.name}
                    </div>
                    <div style={{ fontSize: '9px', color: '#8FD3FE', marginTop: '4px' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: '8px', color: '#AAA', marginTop: '2px' }}>
                      Group #{g.menuGroupCode}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setPreviewTerminalOpen(false)} 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
