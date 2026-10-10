import React, { useState, useEffect } from 'react';
import { getStoredMenuItems } from './IdsMenuMasterModal';
import { DEFAULT_TAX_STRUCTURES } from './IdsMenuMasterModal';

/**
 * IDS Fortune NEXT 6.5 & 7.0 - Sales Promotion Master V6.5.002.1
 * Video 21 Implementation (POS_21_Pq6QJd_sleY.mp4)
 * Frames 001 - 069: Setup -> Sales Promotion Master (Packages, Combos, Buy 2 Get 1 Free, EAT AS U LIKE)
 * and Order Entry Package Punching (Ctrl + Shift + F4).
 */

export const DEFAULT_PROMOTIONS = [
  {
    promotionCode: '1',
    applicableFrom: '23-FEB-2026',
    restaurant: 'LIQUOR BAR',
    promotionName: 'Buy 2 Get 1 Free',
    covers: 1,
    promotionValue: '280.00',
    calculationType: 'None',
    taxStructure: '100',
    taxStructureName: 'Vat@6%',
    availableDays: {
      Sunday: true,
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true
    },
    mainItems: [
      { group: 'BEER', itemCode: '1', itemName: 'KingFisher Strong 650ML', quantity: '2.000', rate: '175.00' }
    ],
    additionalItems: [],
    complimentaryItems: [
      { group: 'BEER', itemCode: '1', itemName: 'KingFisher Strong 650ML', quantity: '1.000', rate: '0.00' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 10:16'
  },
  {
    promotionCode: '2',
    applicableFrom: '23-FEB-2026',
    restaurant: 'RESTAURANT',
    promotionName: 'Happy Hour Tandoori Feast',
    covers: 2,
    promotionValue: '450.00',
    calculationType: 'None',
    taxStructure: '902',
    taxStructureName: 'SGST_CGST@5%',
    availableDays: {
      Sunday: true,
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true
    },
    mainItems: [
      { group: 'KEBAB', itemCode: '2', itemName: 'Tandoori Chicken', quantity: '1.000', rate: '350.00' },
      { group: 'RICE', itemCode: '1', itemName: 'Rice', quantity: '1.000', rate: '120.00' }
    ],
    additionalItems: [],
    complimentaryItems: [
      { group: 'REFRESHERS', itemCode: '3', itemName: 'Mineral Water', quantity: '1.000', rate: '0.00' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 10:20'
  }
];

const STORAGE_KEY = 'ids_fortune_next_pos_sales_promotions';

export const getStoredPromotions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored promotions', e);
  }
  return DEFAULT_PROMOTIONS;
};

export const saveStoredPromotions = (promos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promos));
  } catch (e) {
    console.warn('Failed to save promotions', e);
  }
};

export default function IdsSalesPromotionMasterModal({
  isOpen,
  onClose,
  accountingDate = '23-FEB-2026',
  currentUser = 'MANAGER',
  onSelectPromotionForOrder = null
}) {
  const [promotions, setPromotions] = useState(() => getStoredPromotions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formMode, setFormMode] = useState('VIEW'); // 'VIEW', 'ADD', 'MODIFY'
  const [activeItemTab, setActiveItemTab] = useState('MAIN'); // 'MAIN', 'ADDITIONAL', 'COMPLIMENTARY'
  const [statusMsg, setStatusMsg] = useState(null);

  // Form Fields (Frames 010 - 030)
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [restaurant, setRestaurant] = useState('LIQUOR BAR');
  const [promotionCode, setPromotionCode] = useState('1');
  const [promotionName, setPromotionName] = useState('Buy 2 Get 1 Free');
  const [covers, setCovers] = useState(1);
  const [promotionValue, setPromotionValue] = useState('280.00');
  const [calculationType, setCalculationType] = useState('None');
  const [taxStructure, setTaxStructure] = useState('100');
  const [availableDays, setAvailableDays] = useState({
    Sunday: true,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true
  });

  // Items lists by tab
  const [mainItems, setMainItems] = useState([
    { group: 'BEER', itemCode: '1', itemName: 'KingFisher Strong 650ML', quantity: '2.000', rate: '175.00' }
  ]);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [complimentaryItems, setComplimentaryItems] = useState([
    { group: 'BEER', itemCode: '1', itemName: 'KingFisher Strong 650ML', quantity: '1.000', rate: '0.00' }
  ]);

  // Sub-form editor inputs (above grid Frame 010)
  const [editGroup, setEditGroup] = useState('');
  const [editItemCode, setEditItemCode] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1.000');
  const [selectedGridRowIdx, setSelectedGridRowIdx] = useState(null);

  // Audit
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState(`${accountingDate} 10:16`);

  // Popups
  const [taxLookupOpen, setTaxLookupOpen] = useState(false);
  const [menuMasterLookupOpen, setMenuMasterLookupOpen] = useState(false);
  const [promoBrowseOpen, setPromoBrowseOpen] = useState(false);

  // Sync state when currentIndex changes or promotions reload
  useEffect(() => {
    if (formMode === 'VIEW' && promotions.length > 0 && promotions[currentIndex]) {
      const cur = promotions[currentIndex];
      setApplicableFrom(cur.applicableFrom || accountingDate);
      setRestaurant(cur.restaurant || 'LIQUOR BAR');
      setPromotionCode(cur.promotionCode || '1');
      setPromotionName(cur.promotionName || '');
      setCovers(cur.covers || 1);
      setPromotionValue(cur.promotionValue || '0.00');
      setCalculationType(cur.calculationType || 'None');
      setTaxStructure(cur.taxStructure || '100');
      setAvailableDays(cur.availableDays || {
        Sunday: true, Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true
      });
      setMainItems(cur.mainItems || []);
      setAdditionalItems(cur.additionalItems || []);
      setComplimentaryItems(cur.complimentaryItems || []);
      setStatus(cur.status || 'Active');
      setUser(cur.user || currentUser);
      setLastUpdated(cur.lastUpdated || `${accountingDate} 10:16`);
      setSelectedGridRowIdx(null);
    }
  }, [currentIndex, promotions, formMode, accountingDate, currentUser]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const currentTabItems = activeItemTab === 'MAIN' 
    ? mainItems 
    : activeItemTab === 'ADDITIONAL' 
      ? additionalItems 
      : complimentaryItems;

  const setCurrentTabItems = (newItems) => {
    if (activeItemTab === 'MAIN') setMainItems(newItems);
    else if (activeItemTab === 'ADDITIONAL') setAdditionalItems(newItems);
    else setComplimentaryItems(newItems);
  };

  // Action: Add (Frames 010 / 020)
  const handleAdd = () => {
    setFormMode('ADD');
    const codes = promotions.map(p => parseInt(p.promotionCode, 10)).filter(n => !isNaN(n));
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    const formattedCode = String(nextNum);

    setPromotionCode(formattedCode);
    setApplicableFrom(accountingDate);
    setPromotionName('');
    setCovers(1);
    setPromotionValue('0.00');
    setCalculationType('None');
    setTaxStructure('100');
    setMainItems([]);
    setAdditionalItems([]);
    setComplimentaryItems([]);
    setEditGroup('');
    setEditItemCode('');
    setEditItemName('');
    setEditQuantity('1.000');
    setStatus('Active');
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 10:30`);
    showNotification(`Add Mode: Enter details for Promotion Code ${formattedCode} and click Save.`);
  };

  // Action: Modify
  const handleModify = () => {
    if (promotions.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Modify Mode: Editing Promotion ${promotionCode} (${promotionName}).`);
  };

  // Action: Delete
  const handleDelete = () => {
    if (promotions.length === 0) return;
    const curCode = promotionCode;
    if (window.confirm(`Are you sure you want to delete Promotion "${curCode}" (${promotionName})?`)) {
      const filtered = promotions.filter(p => p.promotionCode !== curCode);
      setPromotions(filtered);
      saveStoredPromotions(filtered);
      const newIdx = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIdx);
      setFormMode('VIEW');
      showNotification(`Promotion "${curCode}" deleted.`);
    }
  };

  // Action: Save (Frame 035)
  const handleSave = () => {
    if (!promotionCode.trim() || !promotionName.trim()) {
      alert('Please enter both Promotion Code and Promotion Name!');
      return;
    }

    const updatedRecord = {
      promotionCode: promotionCode.trim(),
      applicableFrom: applicableFrom.trim() || accountingDate,
      restaurant,
      promotionName: promotionName.trim(),
      covers: Number(covers) || 1,
      promotionValue: promotionValue.trim() || '0.00',
      calculationType,
      taxStructure,
      taxStructureName: DEFAULT_TAX_STRUCTURES.find(t => t.code === taxStructure)?.name || 'Vat@6%',
      availableDays,
      mainItems,
      additionalItems,
      complimentaryItems,
      status,
      user: currentUser,
      lastUpdated: `${accountingDate} 10:30`
    };

    let nextPromos;
    if (formMode === 'ADD') {
      const exists = promotions.some(p => p.promotionCode === promotionCode.trim());
      if (exists) {
        alert(`Promotion Code "${promotionCode}" already exists! Please choose another code.`);
        return;
      }
      nextPromos = [...promotions, updatedRecord];
      setPromotions(nextPromos);
      saveStoredPromotions(nextPromos);
      setCurrentIndex(nextPromos.length - 1);
      showNotification(`Promotion ${promotionCode} (${promotionName}) added successfully.`);
    } else {
      nextPromos = promotions.map(p => p.promotionCode === promotionCode.trim() ? updatedRecord : p);
      setPromotions(nextPromos);
      saveStoredPromotions(nextPromos);
      showNotification(`Promotion ${promotionCode} (${promotionName}) saved successfully.`);
    }

    setFormMode('VIEW');
  };

  // Navigation
  const handlePrevious = () => {
    if (promotions.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : promotions.length - 1));
  };

  const handleNext = () => {
    if (promotions.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev < promotions.length - 1 ? prev + 1 : 0));
  };

  // Add / Confirm item row in current tab
  const handleConfirmItemRow = () => {
    if (!editItemCode.trim() || !editItemName.trim()) {
      alert('Please select an item code and name before confirming!');
      return;
    }

    const newItem = {
      group: editGroup.trim() || 'GENERAL',
      itemCode: editItemCode.trim(),
      itemName: editItemName.trim(),
      quantity: editQuantity.trim() || '1.000',
      rate: '0.00'
    };

    if (selectedGridRowIdx !== null) {
      const updated = [...currentTabItems];
      updated[selectedGridRowIdx] = newItem;
      setCurrentTabItems(updated);
      setSelectedGridRowIdx(null);
    } else {
      setCurrentTabItems([...currentTabItems, newItem]);
    }

    setEditGroup('');
    setEditItemCode('');
    setEditItemName('');
    setEditQuantity('1.000');
    showNotification(`Item ${newItem.itemName} confirmed in ${activeItemTab} tab.`);
  };

  const handleDeleteItemRow = () => {
    if (selectedGridRowIdx === null) {
      alert('Please select a row from the grid to delete!');
      return;
    }
    const filtered = currentTabItems.filter((_, idx) => idx !== selectedGridRowIdx);
    setCurrentTabItems(filtered);
    setSelectedGridRowIdx(null);
    setEditGroup('');
    setEditItemCode('');
    setEditItemName('');
    setEditQuantity('1.000');
  };

  const handleDayToggle = (day) => {
    if (formMode === 'VIEW') return;
    setAvailableDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // Reset to Video 21 Demo Defaults
  const handleResetVideo21Defaults = () => {
    setPromotions(DEFAULT_PROMOTIONS);
    saveStoredPromotions(DEFAULT_PROMOTIONS);
    setCurrentIndex(0);
    setFormMode('VIEW');
    showNotification('Restored Video 21 Promotions: Buy 2 Get 1 Free (KingFisher Strong 650ML)!');
  };

  const allMenuItems = getStoredMenuItems();

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      <div 
        className="ids-modal-container"
        style={{
          width: '740px',
          background: '#ECE9D8',
          border: '2px solid #808080',
          boxShadow: '4px 4px 18px rgba(0,0,0,0.7)',
          fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Titlebar */}
        <div 
          className="ids-modal-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>🎁</span>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>
              Sales Promotion Master V6.5.002.1
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

        {/* Notification Toast */}
        {statusMsg && (
          <div style={{ background: '#FFF2B2', borderBottom: '1px solid #D4B106', padding: '3px 8px', fontSize: '10px', color: '#614700', fontWeight: 600 }}>
            {statusMsg}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* Header Form Grid (Frames 010 - 020) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.2fr 1fr', 
              gap: '6px 16px', 
              background: '#FFF', 
              border: '1px solid #7F9DB9', 
              padding: '8px' 
            }}
          >
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Applicable From */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Applicable From</span>
                <input 
                  type="text" 
                  value={applicableFrom} 
                  onChange={e => setApplicableFrom(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '85px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 4px', fontSize: '10px' }}>?</button>
              </div>

              {/* Restaurant */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Restaurant</span>
                <select 
                  value={restaurant} 
                  onChange={e => setRestaurant(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '130px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="LIQUOR BAR">LIQUOR BAR</option>
                  <option value="RESTAURANT">RESTAURANT</option>
                  <option value="ROOM SERVICE">ROOM SERVICE</option>
                  <option value="BANQUET">BANQUET</option>
                </select>
              </div>

              {/* Promotion Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Promotion Code</span>
                <input 
                  type="text" 
                  value={promotionCode} 
                  onChange={e => setPromotionCode(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setPromoBrowseOpen(true)}
                  style={{ padding: '1px 5px', fontSize: '10px' }}
                >
                  ?
                </button>
              </div>

              {/* Promotion Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Promotion Name</span>
                <input 
                  type="text" 
                  value={promotionName} 
                  onChange={e => setPromotionName(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700, color: '#0A246A' }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Covers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Covers</span>
                <input 
                  type="number" 
                  value={covers} 
                  onChange={e => setCovers(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Promotion Value */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Promotion Value</span>
                <input 
                  type="text" 
                  value={promotionValue} 
                  onChange={e => setPromotionValue(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '80px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700, color: '#006400' }}
                />
                <span style={{ color: '#666', fontSize: '10px' }}>INR</span>
              </div>

              {/* Calculation Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Calculation Type</span>
                <select 
                  value={calculationType} 
                  onChange={e => setCalculationType(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '90px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="None">None</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>

              {/* Tax Structure (Frame 020) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '100px', fontWeight: 600 }}>Tax Structure</span>
                <input 
                  type="text" 
                  value={taxStructure} 
                  onChange={e => setTaxStructure(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '50px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700, color: '#8B0000' }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setTaxLookupOpen(true)}
                  style={{ padding: '1px 5px', fontSize: '10px' }}
                >
                  ?
                </button>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  {DEFAULT_TAX_STRUCTURES.find(t => t.code === taxStructure)?.name || 'Vat@6%'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-form item editor fields (above grid Frame 010) */}
          {formMode !== 'VIEW' && (
            <div style={{ background: '#F5F4EC', border: '1px solid #D0CEBE', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>Group</span>
                <input 
                  type="text" 
                  value={editGroup} 
                  onChange={e => setEditGroup(e.target.value)}
                  placeholder="BEER"
                  style={{ width: '60px', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>Item Code</span>
                <input 
                  type="text" 
                  value={editItemCode} 
                  onChange={e => setEditItemCode(e.target.value)}
                  style={{ width: '45px', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '10px' }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setMenuMasterLookupOpen(true)}
                  style={{ padding: '0 4px', fontSize: '9px' }}
                >
                  ?
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1 }}>
                <span style={{ fontWeight: 600 }}>Item Name</span>
                <input 
                  type="text" 
                  value={editItemName} 
                  onChange={e => setEditItemName(e.target.value)}
                  placeholder="Select from Menu Master..."
                  style={{ flex: 1, border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>Quantity</span>
                <input 
                  type="text" 
                  value={editQuantity} 
                  onChange={e => setEditQuantity(e.target.value)}
                  style={{ width: '50px', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '10px', textAlign: 'right' }}
                />
              </div>

              <button 
                className="ids-btn" 
                onClick={handleConfirmItemRow}
                style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 700, color: '#006400' }}
              >
                Confirm
              </button>
              <button 
                className="ids-btn" 
                onClick={handleDeleteItemRow}
                style={{ fontSize: '10px', padding: '1px 6px', color: '#A94442' }}
              >
                Delete
              </button>
            </div>
          )}

          {/* Vertical Tabs & Matrix Area (Frames 010 - 030) */}
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px', gap: '6px', border: '1px solid #7F9DB9', background: '#ECE9D8', padding: '4px' }}>
            {/* Left Vertical Tabs (Frame 010) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button 
                onClick={() => { setActiveItemTab('MAIN'); setSelectedGridRowIdx(null); }}
                style={{
                  background: activeItemTab === 'MAIN' ? '#FFF' : '#E0DFE3',
                  border: '1px solid #7F9DB9',
                  padding: '6px 4px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: activeItemTab === 'MAIN' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Main Items ({mainItems.length})
              </button>
              <button 
                onClick={() => { setActiveItemTab('ADDITIONAL'); setSelectedGridRowIdx(null); }}
                style={{
                  background: activeItemTab === 'ADDITIONAL' ? '#FFF' : '#E0DFE3',
                  border: '1px solid #7F9DB9',
                  padding: '6px 4px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: activeItemTab === 'ADDITIONAL' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Additional Items ({additionalItems.length})
              </button>
              <button 
                onClick={() => { setActiveItemTab('COMPLIMENTARY'); setSelectedGridRowIdx(null); }}
                style={{
                  background: activeItemTab === 'COMPLIMENTARY' ? '#FFF' : '#E0DFE3',
                  border: '1px solid #7F9DB9',
                  padding: '6px 4px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: activeItemTab === 'COMPLIMENTARY' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Complimentary ({complimentaryItems.length})
              </button>
            </div>

            {/* Middle Grid */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '160px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                    <th style={{ width: '70px', padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Group</th>
                    <th style={{ width: '65px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Item Code</th>
                    <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Item Name</th>
                    <th style={{ width: '65px', padding: '2px 4px', textAlign: 'right' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTabItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        No items defined in {activeItemTab} tab.
                      </td>
                    </tr>
                  ) : (
                    currentTabItems.map((item, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => {
                          setSelectedGridRowIdx(idx);
                          setEditGroup(item.group || '');
                          setEditItemCode(item.itemCode || '');
                          setEditItemName(item.itemName || '');
                          setEditQuantity(item.quantity || '1.000');
                        }}
                        style={{
                          background: selectedGridRowIdx === idx ? '#CCE8FF' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                          borderBottom: '1px solid #EEE',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{item.group}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE', fontWeight: 700, color: '#0A246A' }}>{item.itemCode}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{item.itemName}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{item.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Available Days Checkboxes (Frame 010) */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ fontWeight: 700, fontSize: '10px', borderBottom: '1px solid #CCC', paddingBottom: '2px', color: '#000' }}>
                Available Days
              </div>
              {Object.keys(availableDays).map(day => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', cursor: formMode === 'VIEW' ? 'default' : 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={availableDays[day]} 
                    onChange={() => handleDayToggle(day)}
                    disabled={formMode === 'VIEW'}
                    style={{ margin: 0 }}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Audit Status Strip (Frame 010) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5F4EC', padding: '3px 8px', border: '1px solid #D0CEBE', fontSize: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>Status:</span>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ fontSize: '10px', border: '1px solid #7F9DB9', padding: '1px 3px' }}
              >
                <option value="Active">Active</option>
                <option value="Passive">Passive</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>User:</span>
              <input type="text" readOnly value={user} style={{ width: '70px', background: '#E0DFE3', border: '1px solid #7F9DB9', fontSize: '10px', padding: '1px 3px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>Last Updated:</span>
              <input type="text" readOnly value={lastUpdated} style={{ width: '120px', background: '#E0DFE3', border: '1px solid #7F9DB9', fontSize: '10px', padding: '1px 3px' }} />
            </div>
          </div>

          {/* Win32 Bottom Toolbar Action Strip (Frame 010) */}
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
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="ids-btn" 
                onClick={handleAdd}
                disabled={formMode === 'ADD'}
                style={{ minWidth: '45px', fontWeight: formMode === 'ADD' ? 700 : 400 }}
              >
                Add
              </button>
              <button 
                className="ids-btn" 
                onClick={handleModify}
                disabled={formMode === 'MODIFY' || promotions.length === 0}
                style={{ minWidth: '45px', fontWeight: formMode === 'MODIFY' ? 700 : 400 }}
              >
                Modify
              </button>
              <button 
                className="ids-btn" 
                onClick={handleDelete}
                disabled={promotions.length === 0}
                style={{ minWidth: '45px' }}
              >
                Delete
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setPromoBrowseOpen(true)}
                style={{ minWidth: '45px' }}
              >
                Browse
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="ids-btn" 
                onClick={handlePrevious}
                disabled={promotions.length <= 1}
                style={{ minWidth: '55px' }}
              >
                Previous
              </button>
              <button 
                className="ids-btn" 
                onClick={handleNext}
                disabled={promotions.length <= 1}
                style={{ minWidth: '45px' }}
              >
                Next
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="ids-btn" 
                onClick={handleSave}
                disabled={formMode === 'VIEW'}
                style={{ 
                  minWidth: '45px', 
                  fontWeight: 700, 
                  color: formMode !== 'VIEW' ? '#006400' : '#888',
                  borderColor: formMode !== 'VIEW' ? '#006400' : '#CCC'
                }}
              >
                Save
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setFormMode('VIEW');
                  showNotification('Returned to View panel.');
                }}
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

          {/* Video 21 Quick Action Banner */}
          <div 
            style={{ 
              background: '#FFFBE6', 
              border: '1px solid #FFE58F', 
              padding: '6px 10px', 
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0A246A', fontWeight: 700, fontSize: '11px' }}>
                Video 21: Sales Promotion &amp; "EAT AS U LIKE" Package Punching
              </span>
              <span style={{ fontSize: '10px', color: '#666' }}>
                Promo {currentIndex + 1} of {promotions.length} (Code {promotionCode})
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#444' }}>
              <strong>Demonstrated Flow:</strong> Define promotion name, value (280.00), tax structure, and bundle items across Main (2x KingFisher Strong) and Complimentary (1x KingFisher Strong).
              Inside Order Entry, press <strong>Ctrl + Shift + F4</strong> to punch package with zero-charge constituents!
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <button 
                className="ids-btn" 
                onClick={handleResetVideo21Defaults}
                style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                🔄 Restore Video 21 Demo Promo (Buy 2 Get 1 Free - KingFisher Strong 650ML)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* LOOKUP 1: Menu Master Items (Frame 025) */}
      {menuMasterLookupOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '520px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Menu Master V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => setMenuMasterLookupOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ width: '60px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Outlet Name</th>
                      <th style={{ width: '55px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Item Code</th>
                      <th style={{ width: '85px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Applicable From</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Name</th>
                      <th style={{ width: '55px', padding: '2px 4px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { outlet: 'BAR', code: '1', applicableFrom: '23-FEB-2026', name: 'KingFisher Strong 650ML', status: 'Active', group: 'BEER' },
                      ...allMenuItems.map(m => ({
                        outlet: m.outletName === 'LIQUOR BAR' ? 'BAR' : 'RES',
                        code: m.itemCode,
                        applicableFrom: m.applicableFrom || accountingDate,
                        name: m.name,
                        status: m.status || 'Active',
                        group: m.classificationName || 'FOOD'
                      }))
                    ].map((m, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => {
                          setEditGroup(m.group);
                          setEditItemCode(m.code);
                          setEditItemName(m.name);
                          setMenuMasterLookupOpen(false);
                          showNotification(`Selected ${m.name} from Menu Master.`);
                        }}
                        style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{m.outlet}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #EEE' }}>{m.code}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{m.applicableFrom}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{m.name}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', color: '#006400', fontWeight: 600 }}>{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setMenuMasterLookupOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOOKUP 2: Tax Structures (Frame 020) */}
      {taxLookupOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Tax Structures V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => setTaxLookupOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Applicable From</th>
                      <th style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Module</th>
                      <th style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Tax Structure</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Description</th>
                      <th style={{ padding: '2px 4px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_TAX_STRUCTURES.map((t, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          setTaxStructure(t.code);
                          setTaxLookupOpen(false);
                          showNotification(`Selected Tax Structure ${t.code} (${t.name}).`);
                        }}
                        style={{ cursor: 'pointer', background: taxStructure === t.code ? '#CCE8FF' : idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                      >
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{t.applicableFrom}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{t.module}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#8B0000', borderRight: '1px solid #EEE' }}>{t.code}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{t.name}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', color: '#006400', fontWeight: 600 }}>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setTaxLookupOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOOKUP 3: Promotion Browse */}
      {promoBrowseOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Sales Promotions List</span>
              <button className="ids-win-btn close" onClick={() => setPromoBrowseOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ width: '50px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Code</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Name</th>
                      <th style={{ width: '90px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Outlet</th>
                      <th style={{ width: '70px', padding: '2px 4px', textAlign: 'right' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((p, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setPromoBrowseOpen(false);
                          showNotification(`Loaded Promotion ${p.promotionCode} (${p.promotionName}).`);
                        }}
                        style={{ cursor: 'pointer', background: promotionCode === p.promotionCode ? '#CCE8FF' : idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #EEE' }}>{p.promotionCode}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{p.promotionName}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{p.restaurant}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700, color: '#006400' }}>{p.promotionValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setPromoBrowseOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
