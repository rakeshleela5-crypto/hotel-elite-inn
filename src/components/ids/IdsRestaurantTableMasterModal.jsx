import React, { useState, useEffect } from 'react';

/**
 * IDS Fortune NEXT 6.5 & 7.0 - Restaurant Table Master V6.5.002.1
 * Video 16 Implementation (POS_16_jodO4sIJKpE.mp4)
 * Frames 001 - 052: Setup -> Restaurant Table Master (RESTAURANT & LIQUOR BAR table creation)
 */

export const DEFAULT_RESTAURANT_TABLES = [
  // RESTAURANT Outlet Tables (Video 16 Frames 015–035)
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: 'T1', maxCovers: 6, locationView: 'AC MAIN HALL', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:55', status: 'Vacant' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: 'T2', maxCovers: 6, locationView: 'AC MAIN HALL', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: 'T3', maxCovers: 6, locationView: 'WINDOW SIDE', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: 'T4', maxCovers: 6, locationView: 'WINDOW SIDE', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: 'T5', maxCovers: 6, locationView: 'GARDEN VIEW', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: '10', maxCovers: 4, locationView: 'CENTRAL DINING', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:30', status: 'Occupied' },
  { outlet: 'RESTAURANT', outletCode: 'RES', tableNo: '14', maxCovers: 4, locationView: 'BALCONY TERRACE', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:30', status: 'Occupied' },

  // LIQUOR BAR Outlet Tables (Video 16 Frames 040–047)
  { outlet: 'LIQUOR BAR', outletCode: 'BAR', tableNo: 'B1', maxCovers: 6, locationView: 'BAR COUNTER', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'LIQUOR BAR', outletCode: 'BAR', tableNo: 'B2', maxCovers: 6, locationView: 'LOUNGE BOOTH', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },
  { outlet: 'LIQUOR BAR', outletCode: 'BAR', tableNo: 'B3', maxCovers: 6, locationView: 'VIP SECTION', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:56', status: 'Vacant' },

  // OLIVE HALL Banquet / Private Dining Tables
  { outlet: 'OLIVE HALL', outletCode: 'OLIVE', tableNo: 'OH-1', maxCovers: 10, locationView: 'HEAD TABLE', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:50', status: 'Vacant' },
  { outlet: 'OLIVE HALL', outletCode: 'OLIVE', tableNo: 'OH-2', maxCovers: 8, locationView: 'ROUND TABLE 1', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:50', status: 'Vacant' },
  { outlet: 'OLIVE HALL', outletCode: 'OLIVE', tableNo: 'OH-3', maxCovers: 8, locationView: 'ROUND TABLE 2', user: 'MANAGER', lastUpdated: '08-FEB-2022 18:50', status: 'Vacant' }
];

const STORAGE_KEY = 'ids_fortune_next_pos_restaurant_tables';

export const getStoredRestaurantTables = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse restaurant tables', e);
  }
  return DEFAULT_RESTAURANT_TABLES;
};

export const saveStoredRestaurantTables = (tables) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch (e) {
    console.warn('Failed to save restaurant tables', e);
  }
};

export default function IdsRestaurantTableMasterModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2022',
  currentUser = 'MANAGER',
  initialOutlet = 'RESTAURANT',
  onSelectTableForOrder
}) {
  const [tables, setTables] = useState(() => getStoredRestaurantTables());
  const [selectedOutlet, setSelectedOutlet] = useState(initialOutlet);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form Fields (Frames 010–015)
  const [tableNo, setTableNo] = useState('T1');
  const [maxCovers, setMaxCovers] = useState('6');
  const [locationView, setLocationView] = useState('');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState('08-FEB-2022 18:55');

  // Form Modes: 'VIEW' | 'ADD' | 'MODIFY'
  const [formMode, setFormMode] = useState('VIEW');
  const [statusMsg, setStatusMsg] = useState(null);

  // Browse Popup (Frames 035 & 047)
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [selectedBrowseIdx, setSelectedBrowseIdx] = useState(0);

  // Floor Plan / Table View Panel
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);

  // Filter tables by active outlet
  const outletTables = tables.filter(t => t.outlet === selectedOutlet);

  // Sync form when active outlet or currentIndex changes in VIEW mode
  useEffect(() => {
    if (outletTables.length > 0 && formMode === 'VIEW') {
      const safeIdx = Math.min(Math.max(0, currentIndex), outletTables.length - 1);
      const curr = outletTables[safeIdx];
      if (curr) {
        setTableNo(curr.tableNo || '');
        setMaxCovers(String(curr.maxCovers || 6));
        setLocationView(curr.locationView || '');
        setUser(curr.user || currentUser);
        setLastUpdated(curr.lastUpdated || `${accountingDate} 18:55`);
      }
    } else if (outletTables.length === 0 && formMode === 'VIEW') {
      setTableNo('');
      setMaxCovers('6');
      setLocationView('');
    }
  }, [currentIndex, selectedOutlet, tables, formMode, accountingDate, currentUser]);

  const showNotification = (msg, duration = 3000) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), duration);
  };

  // Action: Add (Frames 015, 020, 025, 030, 040)
  const handleAdd = () => {
    setFormMode('ADD');
    const prefix = selectedOutlet === 'LIQUOR BAR' ? 'B' : (selectedOutlet === 'OLIVE HALL' ? 'OH-' : 'T');
    const existingNums = outletTables
      .map(t => parseInt(t.tableNo.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    setTableNo(`${prefix}${nextNum}`);
    setMaxCovers('6');
    setLocationView('');
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 18:56`);
    showNotification(`New Table record initiated for ${selectedOutlet}.`);
  };

  // Action: Modify
  const handleModify = () => {
    if (outletTables.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Editing Table ${tableNo} in ${selectedOutlet}.`);
  };

  // Action: Delete
  const handleDelete = () => {
    if (outletTables.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete Table "${tableNo}" from ${selectedOutlet}?`);
    if (!confirmDelete) return;

    const filtered = tables.filter(t => !(t.outlet === selectedOutlet && t.tableNo === tableNo));
    setTables(filtered);
    saveStoredRestaurantTables(filtered);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormMode('VIEW');
    showNotification(`Table ${tableNo} deleted successfully.`);
  };

  // Action: Save (Frames 025, 045)
  const handleSave = () => {
    if (!tableNo.trim()) {
      alert('Please enter a valid Table Number!');
      return;
    }

    const outletCode = selectedOutlet === 'LIQUOR BAR' ? 'BAR' : (selectedOutlet === 'OLIVE HALL' ? 'OLIVE' : 'RES');
    const cleanTableNo = tableNo.trim().toUpperCase();
    const coversNum = parseInt(maxCovers, 10) || 6;

    const updatedRecord = {
      outlet: selectedOutlet,
      outletCode,
      tableNo: cleanTableNo,
      maxCovers: coversNum,
      locationView: locationView.trim().toUpperCase(),
      user: currentUser,
      lastUpdated: `${accountingDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Vacant'
    };

    let updatedList;
    const existingIdx = tables.findIndex(t => t.outlet === selectedOutlet && t.tableNo === cleanTableNo);

    if (existingIdx >= 0) {
      updatedList = [...tables];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...updatedRecord };
    } else {
      updatedList = [...tables, updatedRecord];
    }

    setTables(updatedList);
    saveStoredRestaurantTables(updatedList);
    setFormMode('VIEW');
    showNotification(`Table ${cleanTableNo} saved successfully for ${selectedOutlet}!`);
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
    if (currentIndex < outletTables.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFormMode('VIEW');
    }
  };

  // Handle Outlet Change (Frames 010 -> 040)
  const handleOutletChange = (newOutlet) => {
    setSelectedOutlet(newOutlet);
    setCurrentIndex(0);
    setFormMode('VIEW');
  };

  // Browse Selection (Frames 035 & 047)
  const handleSelectBrowse = (idx) => {
    const item = filteredBrowseTables[idx];
    if (item) {
      if (item.outlet !== selectedOutlet) {
        setSelectedOutlet(item.outlet);
      }
      const matchIdx = tables.filter(t => t.outlet === item.outlet).findIndex(t => t.tableNo === item.tableNo);
      if (matchIdx >= 0) {
        setCurrentIndex(matchIdx);
      }
      setBrowseOpen(false);
      setFormMode('VIEW');
    }
  };

  const filteredBrowseTables = tables.filter(t =>
    (!browseSearch ||
      t.tableNo.toLowerCase().includes(browseSearch.toLowerCase()) ||
      t.outlet.toLowerCase().includes(browseSearch.toLowerCase()) ||
      t.outletCode.toLowerCase().includes(browseSearch.toLowerCase()) ||
      (t.locationView && t.locationView.toLowerCase().includes(browseSearch.toLowerCase())))
  );

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1260 }}>
      {/* Main Win32 Dialog: Restaurant Table Master V6.5.002.1 */}
      <div 
        className="ids-modal-container" 
        style={{ width: '540px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
      >
        {/* Title Bar (Frame 010) */}
        <div 
          className="ids-modal-titlebar" 
          style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
            Restaurant Table Master V6.5.002.1
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
              gap: '9px' 
            }}
          >
            {/* 1. Restaurant (Outlet Selection Dropdown - Frames 010 & 040) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Restaurant</span>
              <select 
                value={selectedOutlet} 
                onChange={e => handleOutletChange(e.target.value)}
                style={{ 
                  width: '180px', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  fontWeight: 700,
                  color: '#0A246A'
                }}
              >
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="OLIVE HALL">OLIVE HALL</option>
              </select>
            </div>

            {/* 2. Table # (Frames 015 & 020) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Table #</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={tableNo} 
                  onChange={e => setTableNo(e.target.value)}
                  placeholder="e.g. T1, T2, 10, B1"
                  disabled={formMode === 'VIEW'}
                  style={{ 
                    width: '80px', 
                    textAlign: 'center', 
                    background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                    border: '1px solid #7F9DB9', 
                    padding: '2px 4px', 
                    fontSize: '11px', 
                    fontWeight: 800,
                    color: '#8B0000'
                  }}
                />
                <button 
                  className="ids-btn" 
                  title="Lookup Tables for this Outlet" 
                  onClick={() => setBrowseOpen(true)}
                  style={{ padding: '0 5px', fontSize: '10px', fontWeight: 700 }}
                >
                  ?
                </button>
                <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>
                  ({outletTables.length > 0 ? currentIndex + 1 : 0} of {outletTables.length} in {selectedOutlet})
                </span>
              </div>
            </div>

            {/* 3. Maximum Covers (Frame 020) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Maximum Covers</span>
              <input 
                type="number" 
                min="1"
                max="50"
                value={maxCovers} 
                onChange={e => setMaxCovers(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '50px', 
                  textAlign: 'center',
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  fontWeight: 700 
                }}
              />
            </div>

            {/* 4. Location View (Section/Zone) */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Location View</span>
              <input 
                type="text" 
                value={locationView} 
                onChange={e => setLocationView(e.target.value)}
                placeholder="e.g. WINDOW SIDE, AC MAIN HALL, BAR COUNTER, BALCONY"
                disabled={formMode === 'VIEW'}
                style={{ 
                  width: '90%', 
                  background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', 
                  border: '1px solid #7F9DB9', 
                  padding: '2px 6px', 
                  fontSize: '11px' 
                }}
              />
            </div>

            {/* 5. User */}
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

            {/* 6. Last Updated */}
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

          {/* Win32 Bottom Toolbar Action Strip (Frames 010 & 025) */}
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
                disabled={currentIndex >= outletTables.length - 1}
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
                onClick={() => setFloorPlanOpen(true)}
                title="View Restaurant Floor Plan / Table View"
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

          {/* Subtitle Red / Yellow Banner Note (Video 16 Frame 015) */}
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
              <span style={{ color: '#D00', fontWeight: 700, fontSize: '12px' }}>
                Select your Outlet to create Restaurant Table Numbers.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>
                Tables defined in Table Master directly populate Table Status (Shift+F3), Table Transfer (Shift+F4), and Table Link (Shift+F6).
              </span>
              <button 
                className="ids-btn" 
                onClick={() => setFloorPlanOpen(true)}
                style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                Floor Plan View →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROWSE POPUP DIALOG (Video 16 Frames 035 & 047) */}
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
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Restaurant Table Master V6.5.002.1 - Browse</span>
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
                  placeholder="Filter by table #, outlet, or location..."
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px' }}
                />
              </div>

              {/* Exact 4-Column Table Matching Frame 035 & Frame 047 */}
              <div style={{ height: '190px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '90px' }}>Restaurant</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '70px' }}>Table #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'center', width: '100px' }}>Maximum Covers</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrowseTables.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '20px 8px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                          No matching tables found.
                        </td>
                      </tr>
                    ) : (
                      filteredBrowseTables.map((tbl, idx) => {
                        const isSelected = selectedBrowseIdx === idx;
                        return (
                          <tr 
                            key={`${tbl.outlet}-${tbl.tableNo}`}
                            onClick={() => setSelectedBrowseIdx(idx)}
                            onDoubleClick={() => handleSelectBrowse(idx)}
                            style={{ 
                              borderBottom: '1px solid #EEE',
                              background: isSelected ? '#316AC5' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'),
                              color: isSelected ? '#FFF' : '#000',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #EEE' }}>{tbl.outletCode || tbl.outlet}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{tbl.tableNo}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{tbl.maxCovers}</td>
                            <td style={{ padding: '3px 6px' }}>{tbl.user}</td>
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

      {/* 3. FLOOR PLAN / TABLE VIEW PANEL DIALOG */}
      {floorPlanOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1370 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '640px', background: '#ECE9D8', border: '3px solid #808080', boxShadow: '6px 6px 20px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>
                🍽️ Restaurant Floor Plan & Table Matrix - {selectedOutlet}
              </span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setFloorPlanOpen(false)}
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['RESTAURANT', 'LIQUOR BAR', 'OLIVE HALL'].map(out => (
                    <button 
                      key={out}
                      className="ids-btn"
                      onClick={() => setSelectedOutlet(out)}
                      style={{ 
                        padding: '3px 8px', 
                        fontSize: '11px', 
                        fontWeight: selectedOutlet === out ? 800 : 500,
                        background: selectedOutlet === out ? '#C1D2EE' : undefined
                      }}
                    >
                      {out}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#2E7D32', display: 'inline-block' }}></span> Vacant
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#C62828', display: 'inline-block' }}></span> Occupied
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#1565C0', display: 'inline-block' }}></span> Billed
                  </span>
                </div>
              </div>

              {/* Floor Plan Tables Grid */}
              <div 
                style={{ 
                  background: '#F5F5F0', 
                  border: '2px groove #FFF', 
                  padding: '12px', 
                  minHeight: '220px', 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '10px' 
                }}
              >
                {outletTables.map(t => {
                  const isOccupied = t.tableNo === '10' || t.tableNo === '14';
                  const bg = isOccupied ? '#FFEBEE' : '#E8F5E9';
                  const border = isOccupied ? '#C62828' : '#2E7D32';
                  const badgeBg = isOccupied ? '#C62828' : '#2E7D32';

                  return (
                    <div 
                      key={t.tableNo}
                      onClick={() => {
                        if (onSelectTableForOrder) {
                          onSelectTableForOrder(t.tableNo);
                          setFloorPlanOpen(false);
                          onClose();
                        }
                      }}
                      style={{ 
                        background: bg, 
                        border: `2px solid ${border}`, 
                        borderRadius: '4px', 
                        padding: '8px', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: '1px 1px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#000' }}>
                          Table {t.tableNo}
                        </span>
                        <span style={{ fontSize: '9px', background: badgeBg, color: '#FFF', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>
                          {isOccupied ? 'OCCUPIED' : 'VACANT'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', textAlign: 'left' }}>
                        👥 Covers: <b>{t.maxCovers}</b> max
                      </div>
                      <div style={{ fontSize: '9px', color: '#777', marginTop: '2px', textAlign: 'left' }}>
                        📍 {t.locationView || 'General Section'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setFloorPlanOpen(false)} 
                  style={{ minWidth: '70px', fontWeight: 600 }}
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
