import React, { useState, useEffect } from 'react';
import { getStoredTouchScreenGroups } from './IdsTouchScreenGroupsModal';
import { getStoredMenuGroups } from './IdsMenuGroupsModal';

/**
 * IDS Fortune NEXT 6.5 & 7.0 - Menu Master V6.5.002.3
 * Video 20 Implementation (POS_20_LrN_NkxlU24.mp4)
 * Frames 001 - 137: Setup -> Menu Master item configuration, Touch Screen Classification,
 * Tax Structures, Multi-Portion U.O.M (POR / Portions, BTL, PLT), and Order Entry Integration.
 */

export const DEFAULT_TAX_STRUCTURES = [
  { code: '902', name: 'SGST_CGST@5%', applicableFrom: '15-SEP-2021', module: 'RES', rate: 5, status: 'Active' },
  { code: '904', name: 'SGST_CGST@12%', applicableFrom: '15-SEP-2021', module: 'RES', rate: 12, status: 'Active' },
  { code: '906', name: 'SGST_CGST@18%', applicableFrom: '15-SEP-2021', module: 'RES', rate: 18, status: 'Active' },
  { code: '908', name: 'SGST_CGST@28%', applicableFrom: '15-SEP-2021', module: 'RES', rate: 28, status: 'Active' },
  { code: '100', name: 'Vat@6%', applicableFrom: '25-SEP-2021', module: 'RES', rate: 6, status: 'Active' }
];

export const DEFAULT_TOUCH_SCREEN_CLASSIFICATIONS = [
  { code: '60', name: 'REFRESHERS', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '61', name: 'THE D JUICE', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '62', name: 'TEA, SNACKS & BREAKFAST', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '63', name: 'CHAT', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '64', name: 'SOUP', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '65', name: 'KEBAB', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '66', name: 'INDIAN MAIN COURSE', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '67', name: 'LENTILS', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '68', name: 'RICE/PULAO', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '69', name: 'INDIAN BREADS', applicableFrom: '01-FEB-2022', status: 'Active' },
  { code: '70', name: 'CONDIMENTS', applicableFrom: '01-FEB-2022', status: 'Active' }
];

export const UOM_DEFINITIONS = [
  { code: 'POR', name: 'PORTIONS (Standard Single/Multiple Portions)' },
  { code: 'BTL', name: 'BOTTLE (Mineral Water / Beverages / Wine)' },
  { code: 'PLT', name: 'PLATE (Starters / Platters / Rice)' },
  { code: 'GLS', name: 'GLASS (Juice / Soft Drinks / Drinks)' },
  { code: 'PEG', name: 'PEG (30ml / 60ml Liquor measures)' },
  { code: 'PCS', name: 'PIECES (Bakery / Snacks / Eggs)' },
  { code: 'KGS', name: 'KILOGRAMS (Bulk / Sweets / Weight items)' }
];

export const DEFAULT_MENU_ITEMS = [
  {
    itemCode: '1',
    applicableFrom: '22-FEB-2022',
    outletName: 'RESTAURANT',
    name: 'Rice',
    shortName: 'Rice',
    otherLanguage: '',
    otherLanguageShort: '',
    kotPrintGroup: '',
    classification: '68', // RICE/PULAO
    classificationName: 'RICE/PULAO',
    menuGroup: '68',
    discountFlag: 'Allowed',
    availableHoursFrom: '00:00',
    availableHoursTo: '00:00',
    costPercent: '30.00',
    glCode: '',
    level1: '',
    level2: '',
    level3: '',
    taxStructure: '902',
    taxStructureName: 'SGST_CGST@5%',
    menuType: 'Food',
    subStoreCode: 'MKT',
    defaultBill: '1',
    printOrder: '1',
    ncFlag: 'Yes',
    kotPrinter: '',
    prepTime: '00:00',
    remarks: '',
    itemType: 'SAC',
    sacHsnNo: '996331',
    taxType: 'Regular GST',
    currencyCode: 'INR',
    portions: [
      { code: '01', description: 'Plain', quantity: '1.000', uom: 'POR', rate: '120.00', otherLanguage: '' },
      { code: '02', description: 'Jeera', quantity: '1.000', uom: 'POR', rate: '150.00', otherLanguage: '' },
      { code: '03', description: 'Lemon', quantity: '1.000', uom: 'POR', rate: '140.00', otherLanguage: '' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '22-FEB-2022 19:56'
  },
  {
    itemCode: '2',
    applicableFrom: '22-FEB-2022',
    outletName: 'RESTAURANT',
    name: 'Tandoori Chicken',
    shortName: 'Tandoori',
    otherLanguage: '',
    otherLanguageShort: '',
    kotPrintGroup: '',
    classification: '65', // KEBAB
    classificationName: 'KEBAB',
    menuGroup: '65',
    discountFlag: 'Allowed',
    availableHoursFrom: '00:00',
    availableHoursTo: '00:00',
    costPercent: '30.00',
    glCode: '',
    level1: '',
    level2: '',
    level3: '',
    taxStructure: '902',
    taxStructureName: 'SGST_CGST@5%',
    menuType: 'Food',
    subStoreCode: 'MKT',
    defaultBill: '1',
    printOrder: '1',
    ncFlag: 'Yes',
    kotPrinter: '',
    prepTime: '00:00',
    remarks: '',
    itemType: 'SAC',
    sacHsnNo: '996331',
    taxType: 'Regular GST',
    currencyCode: 'INR',
    portions: [
      { code: '01', description: 'Half', quantity: '1.000', uom: 'POR', rate: '350.00', otherLanguage: '' },
      { code: '02', description: 'Full', quantity: '1.000', uom: 'POR', rate: '650.00', otherLanguage: '' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '22-FEB-2022 19:58'
  },
  {
    itemCode: '3',
    applicableFrom: '22-FEB-2022',
    outletName: 'RESTAURANT',
    name: 'Mineral Water',
    shortName: 'Mineral Wa',
    otherLanguage: '',
    otherLanguageShort: '',
    kotPrintGroup: '',
    classification: '60', // REFRESHERS
    classificationName: 'REFRESHERS',
    menuGroup: '60',
    discountFlag: 'Allowed',
    availableHoursFrom: '00:00',
    availableHoursTo: '00:00',
    costPercent: '20.00',
    glCode: '',
    level1: '',
    level2: '',
    level3: '',
    taxStructure: '906',
    taxStructureName: 'SGST_CGST@18%',
    menuType: 'Beverage',
    subStoreCode: 'MKT',
    defaultBill: '1',
    printOrder: '1',
    ncFlag: 'Yes',
    kotPrinter: '',
    prepTime: '00:00',
    remarks: '',
    itemType: 'HSN',
    sacHsnNo: '2201',
    taxType: 'Regular GST',
    currencyCode: 'INR',
    portions: [
      { code: '01', description: '1 Litre', quantity: '1.000', uom: 'BTL', rate: '40.00', otherLanguage: '' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '22-FEB-2022 19:59'
  }
];

const STORAGE_KEY = 'ids_fortune_next_pos_menu_master_items';

export const getStoredMenuItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored menu items', e);
  }
  return DEFAULT_MENU_ITEMS;
};

export const saveStoredMenuItems = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save menu items', e);
  }
};

export default function IdsMenuMasterModal({
  isOpen,
  onClose,
  accountingDate = '22-FEB-2022',
  currentUser = 'MANAGER',
  onOpenOrderEntryWithItem = null
}) {
  const [items, setItems] = useState(() => getStoredMenuItems());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formMode, setFormMode] = useState('VIEW'); // 'VIEW', 'ADD', 'MODIFY'
  const [activeTab, setActiveTab] = useState('LOCAL'); // 'LOCAL', 'FOREIGN'
  const [statusMsg, setStatusMsg] = useState(null);

  // Form Fields (Frames 015 - 050)
  const [applicableFrom, setApplicableFrom] = useState(accountingDate);
  const [outletName, setOutletName] = useState('RESTAURANT');
  const [itemCode, setItemCode] = useState('1');
  const [name, setName] = useState('Rice');
  const [shortName, setShortName] = useState('Rice');
  const [otherLanguage, setOtherLanguage] = useState('');
  const [otherLanguageShort, setOtherLanguageShort] = useState('');
  const [kotPrintGroup, setKotPrintGroup] = useState('');
  const [classification, setClassification] = useState('68');
  const [menuGroup, setMenuGroup] = useState('68');
  const [discountFlag, setDiscountFlag] = useState('Allowed');
  const [availableHoursFrom, setAvailableHoursFrom] = useState('00:00');
  const [availableHoursTo, setAvailableHoursTo] = useState('00:00');
  const [costPercent, setCostPercent] = useState('30.00');
  const [glCode, setGlCode] = useState('');
  const [level1, setLevel1] = useState('');
  const [level2, setLevel2] = useState('');
  const [level3, setLevel3] = useState('');
  const [taxStructure, setTaxStructure] = useState('902');
  const [menuType, setMenuType] = useState('Food');
  const [subStoreCode, setSubStoreCode] = useState('MKT');
  const [defaultBill, setDefaultBill] = useState('1');
  const [printOrder, setPrintOrder] = useState('1');
  const [ncFlag, setNcFlag] = useState('Yes');
  const [kotPrinter, setKotPrinter] = useState('');
  const [prepTime, setPrepTime] = useState('00:00');
  const [remarks, setRemarks] = useState('');
  const [itemType, setItemType] = useState('SAC');
  const [sacHsnNo, setSacHsnNo] = useState('996331');
  const [taxType, setTaxType] = useState('Regular GST');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [portions, setPortions] = useState([
    { code: '01', description: 'Plain', quantity: '1.000', uom: 'POR', rate: '120.00', otherLanguage: '' },
    { code: '02', description: 'Jeera', quantity: '1.000', uom: 'POR', rate: '150.00', otherLanguage: '' },
    { code: '03', description: 'Lemon', quantity: '1.000', uom: 'POR', rate: '140.00', otherLanguage: '' }
  ]);
  const [status, setStatus] = useState('Active');
  const [user, setUser] = useState(currentUser);
  const [lastUpdated, setLastUpdated] = useState(`${accountingDate} 19:56`);

  // Popups & Lookups
  const [taxLookupOpen, setTaxLookupOpen] = useState(false);
  const [classLookupOpen, setClassLookupOpen] = useState(false);
  const [itemSelectionHelpOpen, setItemSelectionHelpOpen] = useState(false);
  const [itemSearchText, setItemSearchText] = useState('');
  const [uomHelpOpen, setUomHelpOpen] = useState(false);
  const [activePortionRowIdx, setActivePortionRowIdx] = useState(0);

  // Sync state when currentIndex changes or items reload
  useEffect(() => {
    if (formMode === 'VIEW' && items.length > 0 && items[currentIndex]) {
      const cur = items[currentIndex];
      setApplicableFrom(cur.applicableFrom || accountingDate);
      setOutletName(cur.outletName || 'RESTAURANT');
      setItemCode(cur.itemCode || '');
      setName(cur.name || '');
      setShortName(cur.shortName || '');
      setOtherLanguage(cur.otherLanguage || '');
      setOtherLanguageShort(cur.otherLanguageShort || '');
      setKotPrintGroup(cur.kotPrintGroup || '');
      setClassification(cur.classification || '68');
      setMenuGroup(cur.menuGroup || '68');
      setDiscountFlag(cur.discountFlag || 'Allowed');
      setAvailableHoursFrom(cur.availableHoursFrom || '00:00');
      setAvailableHoursTo(cur.availableHoursTo || '00:00');
      setCostPercent(cur.costPercent || '30.00');
      setGlCode(cur.glCode || '');
      setLevel1(cur.level1 || '');
      setLevel2(cur.level2 || '');
      setLevel3(cur.level3 || '');
      setTaxStructure(cur.taxStructure || '902');
      setMenuType(cur.menuType || 'Food');
      setSubStoreCode(cur.subStoreCode || 'MKT');
      setDefaultBill(cur.defaultBill || '1');
      setPrintOrder(cur.printOrder || '1');
      setNcFlag(cur.ncFlag || 'Yes');
      setKotPrinter(cur.kotPrinter || '');
      setPrepTime(cur.prepTime || '00:00');
      setRemarks(cur.remarks || '');
      setItemType(cur.itemType || 'SAC');
      setSacHsnNo(cur.sacHsnNo || '996331');
      setTaxType(cur.taxType || 'Regular GST');
      setCurrencyCode(cur.currencyCode || 'INR');
      setPortions(cur.portions || []);
      setStatus(cur.status || 'Active');
      setUser(cur.user || currentUser);
      setLastUpdated(cur.lastUpdated || `${accountingDate} 19:56`);
    }
  }, [currentIndex, items, formMode, accountingDate, currentUser]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Action: Add (Video 20 Frame 065)
  const handleAdd = () => {
    setFormMode('ADD');
    const codes = items.map(i => parseInt(i.itemCode, 10)).filter(n => !isNaN(n));
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    const formattedCode = String(nextNum);

    setItemCode(formattedCode);
    setApplicableFrom(accountingDate);
    setName('');
    setShortName('');
    setOtherLanguage('');
    setClassification('68');
    setMenuGroup('68');
    setDiscountFlag('Allowed');
    setCostPercent('30.00');
    setTaxStructure('902');
    setMenuType('Food');
    setSubStoreCode('MKT');
    setDefaultBill('1');
    setPrintOrder('1');
    setNcFlag('Yes');
    setItemType('SAC');
    setSacHsnNo('996331');
    setTaxType('Regular GST');
    setCurrencyCode('INR');
    setPortions([
      { code: '01', description: 'Regular', quantity: '1.000', uom: 'POR', rate: '100.00', otherLanguage: '' }
    ]);
    setStatus('Active');
    setUser(currentUser);
    setLastUpdated(`${accountingDate} 20:00`);
    showNotification(`Add Mode: Enter details for Item Code ${formattedCode} and click Save.`);
  };

  // Action: Modify
  const handleModify = () => {
    if (items.length === 0) return;
    setFormMode('MODIFY');
    showNotification(`Modify Mode: Editing Item ${itemCode} (${name}).`);
  };

  // Action: Delete
  const handleDelete = () => {
    if (items.length === 0) return;
    const curCode = itemCode;
    if (window.confirm(`Are you sure you want to delete Menu Item Code "${curCode}" (${name})?`)) {
      const filtered = items.filter(i => i.itemCode !== curCode);
      setItems(filtered);
      saveStoredMenuItems(filtered);
      const newIdx = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIdx);
      setFormMode('VIEW');
      showNotification(`Item "${curCode}" deleted.`);
    }
  };

  // Action: Save (Frame 030 / Frame 065)
  const handleSave = () => {
    if (!itemCode.trim() || !name.trim()) {
      alert('Please enter both Item Code and Name!');
      return;
    }

    const updatedRecord = {
      itemCode: itemCode.trim(),
      applicableFrom: applicableFrom.trim() || accountingDate,
      outletName,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().slice(0, 10),
      otherLanguage,
      otherLanguageShort,
      kotPrintGroup,
      classification,
      classificationName: DEFAULT_TOUCH_SCREEN_CLASSIFICATIONS.find(c => c.code === classification)?.name || 'GENERAL',
      menuGroup,
      discountFlag,
      availableHoursFrom,
      availableHoursTo,
      costPercent,
      glCode,
      level1,
      level2,
      level3,
      taxStructure,
      taxStructureName: DEFAULT_TAX_STRUCTURES.find(t => t.code === taxStructure)?.name || 'Regular GST',
      menuType,
      subStoreCode,
      defaultBill,
      printOrder,
      ncFlag,
      kotPrinter,
      prepTime,
      remarks,
      itemType,
      sacHsnNo,
      taxType,
      currencyCode,
      portions,
      status,
      user: currentUser,
      lastUpdated: `${accountingDate} 20:00`
    };

    let nextItems;
    if (formMode === 'ADD') {
      const exists = items.some(i => i.itemCode === itemCode.trim());
      if (exists) {
        alert(`Item Code "${itemCode}" already exists! Please choose another code.`);
        return;
      }
      nextItems = [...items, updatedRecord];
      setItems(nextItems);
      saveStoredMenuItems(nextItems);
      setCurrentIndex(nextItems.length - 1);
      showNotification(`Item ${itemCode} (${name}) added successfully.`);
    } else {
      nextItems = items.map(i => i.itemCode === itemCode.trim() ? updatedRecord : i);
      setItems(nextItems);
      saveStoredMenuItems(nextItems);
      showNotification(`Item ${itemCode} (${name}) saved successfully.`);
    }

    setFormMode('VIEW');
  };

  // Navigation
  const handlePrevious = () => {
    if (items.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    if (items.length === 0) return;
    setFormMode('VIEW');
    setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
  };

  // Portions Table Handling (Frame 055)
  const handlePortionChange = (idx, field, value) => {
    const updated = portions.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    setPortions(updated);
  };

  const handleAddPortionRow = () => {
    const nextCode = String(portions.length + 1).padStart(2, '0');
    setPortions([
      ...portions,
      { code: nextCode, description: 'Portion', quantity: '1.000', uom: 'POR', rate: '100.00', otherLanguage: '' }
    ]);
  };

  const handleRemovePortionRow = (idx) => {
    if (portions.length <= 1) {
      alert('At least one portion is required for a menu item.');
      return;
    }
    setPortions(portions.filter((_, i) => i !== idx));
  };

  // Reset to Video 20 Defaults
  const handleResetVideo20Defaults = () => {
    setItems(DEFAULT_MENU_ITEMS);
    saveStoredMenuItems(DEFAULT_MENU_ITEMS);
    setCurrentIndex(0);
    setFormMode('VIEW');
    showNotification('Restored Video 20 Menu Items: Rice, Tandoori Chicken, Mineral Water!');
  };

  const filteredHelpItems = items.filter(i => {
    if (!itemSearchText.trim()) return true;
    const q = itemSearchText.toLowerCase();
    return i.itemCode.toLowerCase().includes(q) || i.name.toLowerCase().includes(q);
  });

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      <div 
        className="ids-modal-container"
        style={{
          width: '780px',
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
            <span style={{ fontSize: '13px' }}>🍽️</span>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>
              Menu Master V6.5.002.3
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

          {/* Top Row: Applicable From, Copy Menu, Outlet Name (Frame 015) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 100px 1.5fr', gap: '8px', alignItems: 'center', background: '#F5F4EC', padding: '4px 6px', border: '1px solid #D0CEBE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: '#000', width: '90px' }}>Applicable From</span>
              <input 
                type="text" 
                value={applicableFrom} 
                onChange={e => setApplicableFrom(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ width: '85px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
              <button className="ids-btn" title="Calendar" style={{ padding: '1px 4px', fontSize: '10px' }}>?</button>
            </div>

            <div>
              <button 
                className="ids-btn"
                style={{ width: '100%', fontSize: '11px', padding: '2px 6px', fontWeight: 600 }}
                onClick={() => alert('Copy Menu: Allows duplicating item catalog across outlets (RES -> BAR / BANQ).')}
              >
                Copy Menu
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ fontWeight: 600, color: '#000' }}>Outlet Name</span>
              <select 
                value={outletName} 
                onChange={e => setOutletName(e.target.value)}
                disabled={formMode === 'VIEW'}
                style={{ width: '150px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="ROOM SERVICE">ROOM SERVICE</option>
                <option value="BANQUET">BANQUET</option>
              </select>
            </div>
          </div>

          {/* Master Form Grid (Frames 015 - 045) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '6px 12px', 
              background: '#FFF', 
              border: '1px solid #7F9DB9', 
              padding: '8px' 
            }}
          >
            {/* Col 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Item Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Item Code</span>
                <input 
                  type="text" 
                  value={itemCode} 
                  onChange={e => setItemCode(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setItemSelectionHelpOpen(true)}
                  title="Search Items (Item Selection Help)"
                  style={{ padding: '1px 5px', fontSize: '10px' }}
                >
                  ?
                </button>
              </div>

              {/* Kot Print Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Kot Print Group</span>
                <input 
                  type="text" 
                  value={kotPrintGroup} 
                  onChange={e => setKotPrintGroup(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 5px', fontSize: '10px' }}>?</button>
              </div>

              {/* Classification (Touch Screen Group Frame 020 & 105) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Classification</span>
                <input 
                  type="text" 
                  value={classification} 
                  onChange={e => setClassification(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700, color: '#0A246A' }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setClassLookupOpen(true)}
                  title="Touch Screen Groups V6.5.002.1"
                  style={{ padding: '1px 5px', fontSize: '10px' }}
                >
                  ?
                </button>
              </div>

              {/* Available Hours */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Available Hours</span>
                <input 
                  type="text" 
                  value={availableHoursFrom} 
                  onChange={e => setAvailableHoursFrom(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '38px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '10px' }}
                />
                <span>-</span>
                <input 
                  type="text" 
                  value={availableHoursTo} 
                  onChange={e => setAvailableHoursTo(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '38px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '10px' }}
                />
              </div>

              {/* Sub Store Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Sub Store Code</span>
                <input 
                  type="text" 
                  value={subStoreCode} 
                  onChange={e => setSubStoreCode(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 5px', fontSize: '10px' }}>?</button>
              </div>

              {/* KOT Printer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>KOT Printer</span>
                <input 
                  type="text" 
                  value={kotPrinter} 
                  onChange={e => setKotPrinter(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  placeholder="KITCHEN_1"
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Prep Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Preparation Time</span>
                <input 
                  type="text" 
                  value={prepTime} 
                  onChange={e => setPrepTime(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '50px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Item Type (HSN / SAC) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '90px', fontWeight: 600 }}>Item Type</span>
                <select 
                  value={itemType} 
                  onChange={e => setItemType(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '65px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="SAC">SAC</option>
                  <option value="HSN">HSN</option>
                </select>
              </div>
            </div>

            {/* Col 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Name</span>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => {
                    setName(e.target.value);
                    if (formMode === 'ADD' || !shortName) {
                      setShortName(e.target.value.slice(0, 10));
                    }
                  }}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              {/* Other Language */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Other Lang.</span>
                <input 
                  type="text" 
                  value={otherLanguage} 
                  onChange={e => setOtherLanguage(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Menu Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Menu Group</span>
                <input 
                  type="text" 
                  value={menuGroup} 
                  onChange={e => setMenuGroup(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '50px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 5px', fontSize: '10px' }}>?</button>
              </div>

              {/* Cost % */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Cost %</span>
                <input 
                  type="text" 
                  value={costPercent} 
                  onChange={e => setCostPercent(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <span>%</span>
              </div>

              {/* Tax Structure (Frame 035) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Tax Structure</span>
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
                  title="Tax Structures V6.5.002.1"
                  style={{ padding: '1px 5px', fontSize: '10px' }}
                >
                  ?
                </button>
              </div>

              {/* Menu Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Menu Type</span>
                <select 
                  value={menuType} 
                  onChange={e => setMenuType(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '90px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="Food">Food</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Liquor">Liquor</option>
                  <option value="Tobacco">Tobacco</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Default Bill & Print Order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Default Bill</span>
                <input 
                  type="text" 
                  value={defaultBill} 
                  onChange={e => setDefaultBill(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '30px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <span style={{ marginLeft: '6px', fontWeight: 600 }}>Print Order</span>
                <input 
                  type="text" 
                  value={printOrder} 
                  onChange={e => setPrintOrder(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '30px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Remarks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Remarks</span>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* HSN / SAC No */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>{itemType} No</span>
                <input 
                  type="text" 
                  value={sacHsnNo} 
                  onChange={e => setSacHsnNo(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  placeholder="996331"
                  style={{ width: '90px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>
            </div>

            {/* Col 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Short Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Short Name</span>
                <input 
                  type="text" 
                  value={shortName} 
                  onChange={e => setShortName(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Other Lang Short */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Lang. Short</span>
                <input 
                  type="text" 
                  value={otherLanguageShort} 
                  onChange={e => setOtherLanguageShort(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Discount Flag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Discount Flag</span>
                <select 
                  value={discountFlag} 
                  onChange={e => setDiscountFlag(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '95px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="Allowed">Allowed</option>
                  <option value="Not Allowed">Not Allowed</option>
                </select>
              </div>

              {/* GL Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>GL Code</span>
                <input 
                  type="text" 
                  value={glCode} 
                  onChange={e => setGlCode(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '60px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 5px', fontSize: '10px' }}>?</button>
              </div>

              {/* Levels (Pricing Tiers) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Level 1 / 2</span>
                <input 
                  type="text" 
                  value={level1} 
                  onChange={e => setLevel1(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  placeholder="L1"
                  style={{ width: '35px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '10px' }}
                />
                <input 
                  type="text" 
                  value={level2} 
                  onChange={e => setLevel2(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  placeholder="L2"
                  style={{ width: '35px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '10px' }}
                />
              </div>

              {/* NC Flag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>NC Flag</span>
                <select 
                  value={ncFlag} 
                  onChange={e => setNcFlag(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ width: '70px', background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Tax Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '80px', fontWeight: 600 }}>Tax Type</span>
                <select 
                  value={taxType} 
                  onChange={e => setTaxType(e.target.value)}
                  disabled={formMode === 'VIEW'}
                  style={{ flex: 1, background: formMode === 'VIEW' ? '#F0F0F0' : '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="Regular GST">Regular GST</option>
                  <option value="Composite GST">Composite GST</option>
                  <option value="Exempted">Exempted</option>
                  <option value="Non-GST">Non-GST</option>
                </select>
              </div>
            </div>
          </div>

          {/* Currency Tabs & Portions Grid (Frame 055) */}
          <div style={{ border: '1px solid #7F9DB9', background: '#ECE9D8', padding: '4px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #7F9DB9', marginBottom: '4px' }}>
              <button 
                onClick={() => setActiveTab('LOCAL')}
                style={{
                  background: activeTab === 'LOCAL' ? '#FFF' : '#E0DFE3',
                  border: '1px solid #7F9DB9',
                  borderBottom: activeTab === 'LOCAL' ? '1px solid #FFF' : '1px solid #7F9DB9',
                  padding: '3px 12px',
                  fontSize: '11px',
                  fontWeight: activeTab === 'LOCAL' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Local Currency
              </button>
              <button 
                onClick={() => setActiveTab('FOREIGN')}
                style={{
                  background: activeTab === 'FOREIGN' ? '#FFF' : '#E0DFE3',
                  border: '1px solid #7F9DB9',
                  borderBottom: activeTab === 'FOREIGN' ? '1px solid #FFF' : '1px solid #7F9DB9',
                  padding: '3px 12px',
                  fontSize: '11px',
                  fontWeight: activeTab === 'FOREIGN' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Foreign Currency
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ background: '#FFF', padding: '6px', border: '1px solid #D0CEBE' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Currency Code</span>
                  <input 
                    type="text" 
                    value={currencyCode} 
                    onChange={e => setCurrencyCode(e.target.value)}
                    disabled={formMode === 'VIEW'}
                    style={{ width: '50px', background: '#F0F0F0', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {formMode !== 'VIEW' && (
                    <>
                      <button 
                        className="ids-btn" 
                        onClick={handleAddPortionRow}
                        style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 600 }}
                      >
                        + Add Portion
                      </button>
                      <button 
                        className="ids-btn" 
                        onClick={() => setUomHelpOpen(true)}
                        style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 600, color: '#0A246A' }}
                      >
                        U.O.M Help (F1)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Portions Grid (Frame 055) */}
              <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ width: '45px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Code</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Description</th>
                      <th style={{ width: '65px', padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Quantity</th>
                      <th style={{ width: '65px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>U.O.M</th>
                      <th style={{ width: '80px', padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Rate</th>
                      <th style={{ width: '90px', padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Other Language</th>
                      {formMode !== 'VIEW' && <th style={{ width: '35px', padding: '2px 4px', textAlign: 'center' }}>Act</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {portions.map((p, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          background: idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                          borderBottom: '1px solid #EEE'
                        }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE', fontWeight: 700 }}>
                          {p.code}
                        </td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>
                          {formMode === 'VIEW' ? (
                            p.description
                          ) : (
                            <input 
                              type="text" 
                              value={p.description} 
                              onChange={e => handlePortionChange(idx, 'description', e.target.value)}
                              style={{ width: '95%', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '11px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          {formMode === 'VIEW' ? (
                            p.quantity
                          ) : (
                            <input 
                              type="text" 
                              value={p.quantity} 
                              onChange={e => handlePortionChange(idx, 'quantity', e.target.value)}
                              style={{ width: '50px', textAlign: 'right', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '11px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>
                          {formMode === 'VIEW' ? (
                            <span style={{ fontWeight: 700, color: '#0A246A' }}>{p.uom}</span>
                          ) : (
                            <select 
                              value={p.uom} 
                              onChange={e => handlePortionChange(idx, 'uom', e.target.value)}
                              style={{ border: '1px solid #7F9DB9', padding: '1px 2px', fontSize: '10px' }}
                            >
                              <option value="POR">POR</option>
                              <option value="BTL">BTL</option>
                              <option value="PLT">PLT</option>
                              <option value="GLS">GLS</option>
                              <option value="PEG">PEG</option>
                              <option value="PCS">PCS</option>
                              <option value="KGS">KGS</option>
                            </select>
                          )}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006400' }}>
                          {formMode === 'VIEW' ? (
                            p.rate
                          ) : (
                            <input 
                              type="text" 
                              value={p.rate} 
                              onChange={e => handlePortionChange(idx, 'rate', e.target.value)}
                              style={{ width: '65px', textAlign: 'right', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '11px', fontWeight: 700, color: '#006400' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>
                          {formMode === 'VIEW' ? (
                            p.otherLanguage || '-'
                          ) : (
                            <input 
                              type="text" 
                              value={p.otherLanguage || ''} 
                              onChange={e => handlePortionChange(idx, 'otherLanguage', e.target.value)}
                              style={{ width: '90%', border: '1px solid #7F9DB9', padding: '1px 3px', fontSize: '11px' }}
                            />
                          )}
                        </td>
                        {formMode !== 'VIEW' && (
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleRemovePortionRow(idx)}
                              style={{ background: '#F2DEDE', border: '1px solid #A94442', color: '#A94442', fontSize: '9px', cursor: 'pointer', padding: '0 3px' }}
                              title="Delete Portion"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtitle Highlight (Frame 055) */}
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#555', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>POR</strong> stands for <strong>"PORTIONS"</strong>. Press <strong>F1</strong> to view more units of measurement (U.O.M).
                </span>
                <span style={{ color: '#0A246A', fontWeight: 600 }}>
                  Showing {portions.length} portion tier(s)
                </span>
              </div>
            </div>
          </div>

          {/* Audit Status Strip (Frame 015) */}
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

          {/* Win32 Bottom Toolbar Action Strip (Frame 010 / Frame 065) */}
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
                disabled={formMode === 'MODIFY' || items.length === 0}
                style={{ minWidth: '45px', fontWeight: formMode === 'MODIFY' ? 700 : 400 }}
              >
                Modify
              </button>
              <button 
                className="ids-btn" 
                onClick={handleDelete}
                disabled={items.length === 0}
                style={{ minWidth: '45px' }}
              >
                Delete
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setItemSelectionHelpOpen(true)}
                style={{ minWidth: '45px' }}
              >
                Browse
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="ids-btn" 
                onClick={handlePrevious}
                disabled={items.length <= 1}
                style={{ minWidth: '55px' }}
              >
                Previous
              </button>
              <button 
                className="ids-btn" 
                onClick={handleNext}
                disabled={items.length <= 1}
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

          {/* Video 20 Quick Flow Banner */}
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
                Video 20: Menu Master V6.5.002.3 Configuration
              </span>
              <span style={{ fontSize: '10px', color: '#666' }}>
                Item {currentIndex + 1} of {items.length} (Code {itemCode})
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#444' }}>
              <strong>Demonstrated Flow:</strong> Item Code &rarr; Name &rarr; Classification (Touch Screen Group) &rarr; Tax Structure (SGST/CGST) &rarr; Portions Grid (POR/U.O.M & Rates).
              All items created here load directly into Order Entry screen (Frame 130 <em>"Loading items: RES/3"</em>).
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <button 
                className="ids-btn" 
                onClick={handleResetVideo20Defaults}
                style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                🔄 Restore Video 20 Items (Rice, Tandoori Chicken, Mineral Water)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* LOOKUP 1: Tax Structures V6.5.002.1 (Frame 035) */}
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
                <button className="ids-btn" onClick={() => setTaxLookupOpen(false)} style={{ minWidth: '60px' }}>Select</button>
                <button className="ids-btn" onClick={() => setTaxLookupOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOOKUP 2: Touch Screen Groups V6.5.002.1 (Frame 105) */}
      {classLookupOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Touch Screen Groups V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => setClassLookupOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Menu Grouping</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Applicable From</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Name</th>
                      <th style={{ padding: '2px 4px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_TOUCH_SCREEN_CLASSIFICATIONS.map((c, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          setClassification(c.code);
                          setMenuGroup(c.code);
                          setClassLookupOpen(false);
                          showNotification(`Selected Classification ${c.code} (${c.name}).`);
                        }}
                        style={{ cursor: 'pointer', background: classification === c.code ? '#CCE8FF' : idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #EEE' }}>{c.code}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{c.applicableFrom}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{c.name}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', color: '#006400', fontWeight: 600 }}>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setClassLookupOpen(false)} style={{ minWidth: '60px' }}>Select</button>
                <button className="ids-btn" onClick={() => setClassLookupOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOOKUP 3: Item Selection Help (Frame 120) */}
      {itemSelectionHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '500px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Item Selection Help</span>
              <button className="ids-win-btn close" onClick={() => setItemSelectionHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Search Help:</span>
                <input 
                  type="text" 
                  value={itemSearchText} 
                  onChange={e => setItemSearchText(e.target.value)}
                  placeholder="Filter by code or description..."
                  style={{ flex: 1, border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ width: '70px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Item Code</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Description</th>
                      <th style={{ width: '90px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Applicable From</th>
                      <th style={{ width: '60px', padding: '2px 4px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHelpItems.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          const realIdx = items.findIndex(i => i.itemCode === item.itemCode);
                          if (realIdx !== -1) setCurrentIndex(realIdx);
                          setItemSelectionHelpOpen(false);
                          showNotification(`Loaded Item Code ${item.itemCode} (${item.name}).`);
                        }}
                        style={{ cursor: 'pointer', background: itemCode === item.itemCode ? '#CCE8FF' : idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #EEE' }}>{item.itemCode}</td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>{item.name}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{item.applicableFrom}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center', color: '#006400', fontWeight: 600 }}>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setItemSelectionHelpOpen(false)} style={{ minWidth: '60px' }}>Select</button>
                <button className="ids-btn" onClick={() => setItemSelectionHelpOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOOKUP 4: U.O.M Lookup (F1) */}
      {uomHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '400px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)' }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Unit of Measurements (U.O.M) - F1</span>
              <button className="ids-win-btn close" onClick={() => setUomHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9' }}>
                      <th style={{ width: '60px', padding: '2px 4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Code</th>
                      <th style={{ padding: '2px 4px', textAlign: 'left' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {UOM_DEFINITIONS.map((u, idx) => (
                      <tr 
                        key={idx} 
                        style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #EEE' }}
                        onClick={() => {
                          handlePortionChange(activePortionRowIdx, 'uom', u.code);
                          setUomHelpOpen(false);
                          showNotification(`Set U.O.M to ${u.code}`);
                        }}
                      >
                        <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #EEE' }}>{u.code}</td>
                        <td style={{ padding: '2px 4px' }}>{u.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button className="ids-btn" onClick={() => setUomHelpOpen(false)} style={{ minWidth: '60px' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
