import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Printer, Edit3, ArrowRightLeft, Users, BookOpen, Scissors, 
  Trash2, XOctagon, ToggleLeft, ToggleRight, Building, HelpCircle, 
  RotateCcw, Check, X, Search, ChevronRight, CornerDownLeft, CreditCard, FileText
} from 'lucide-react';
import { RESTAURANT_MENU } from '../../data/hotelData';
import { 
  getLiveKots, saveLiveKots, broadcastKotChannel, 
  normalizeKotOrder, KOT_STORAGE_KEY, KDS_CHANNEL_NAME 
} from '../../utils/kotDataSync';
import IdsPosBillModal from './IdsPosBillModal';
import IdsPosBillSettlementModal from './IdsPosBillSettlementModal';

// Authentic NC Department Cost Centers (Video 07 Frame 016)
export const POS_NC_DEPARTMENTS = [
  'Admin & General',
  'Complimentary',
  'Director',
  'Managers',
  'Room Guest',
  'Sales & Marketing',
  'Staff Cafeteria',
  'F&B Production'
];

// Authentic Menu Database from Videos 01, 02, 07 and Hotel Elite Inn
export const POS_MENU_ITEMS = [
  { code: '1', name: 'CLASSIC RUSSIAN SALAD', category: 'SALAD', rate: 199.00 },
  { code: '2', name: 'RED BEANS PEANUT & DRY FRUIT', category: 'SALAD', rate: 199.00 },
  { code: '3', name: 'SPROUTED MOONG PEANUT DRY', category: 'SALAD', rate: 199.00 },
  { code: '4', name: 'CAESAR SALAD (VEG)', category: 'SALAD', rate: 245.00 },
  { code: '5', name: 'CAESAR SALAD (CHICKEN)', category: 'SALAD', rate: 295.00 },
  { code: '189', name: 'MILK SHAKE WITH ICE CREAM(SB)', category: 'BEVERAGE', rate: 150.00 },
  { code: '155', name: 'BLUEBERRY COLD CHEESE CAKE(MC)', category: 'DESSERT', rate: 165.00 },
  { code: '82', name: 'STEAMED RICE', category: 'RICE', rate: 145.00 },
  { code: '54', name: 'DAL MAHARANI', category: 'MAIN COURSE', rate: 200.00 },
  { code: '175', name: 'CHICKEN SHAWARMA', category: 'SNACKS', rate: 150.00 },
  { code: '186', name: 'MINERAL WATER(58)', category: 'BEVERAGE', rate: 120.00 },
  { code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', category: 'APPETIZER', rate: 40.00 },
  { code: '93', name: 'KOLIWADA FISH CURRY WITH MINI', category: 'SEAFOOD', rate: 320.00 },
  { code: '149', name: 'CHICKEN FRIED RICE/NOODLES', category: 'CHINESE', rate: 210.00 },
  { code: '146', name: 'EGG FRIED RICE', category: 'CHINESE', rate: 180.00 },
  { code: '83', name: 'JEERA RICE', category: 'RICE', rate: 160.00 },
  { code: '147', name: 'MIX FRIED RICE/NOODLES (CHICKE', category: 'CHINESE', rate: 240.00 },
  { code: '148', name: 'PRAWN FRIED RICE/NOODLES', category: 'CHINESE', rate: 260.00 },
  { code: '145', name: 'VEGETABLE FRIED RICE/NOODLES', category: 'CHINESE', rate: 170.00 },
  { code: '150', name: 'BAKED GULAB JAMUN PISTACHIO', category: 'DESSERT', rate: 130.00 },
  { code: '169', name: 'BUTTER CHICKEN BURGER', category: 'SNACKS', rate: 190.00 },
  { code: '125', name: 'CHICKEN A LA KING(OINV)', category: 'CONTINENTAL', rate: 280.00 },
  { code: '140', name: 'CHICKEN CHILLI (BONE/BONELESS)', category: 'CHINESE', rate: 230.00 },
  { code: '132', name: 'CHICKEN DIM SUM (FRIED/STEAMED', category: 'CHINESE', rate: 195.00 },
  { code: '60', name: 'CHICKEN MAJEDAR BHARTA', category: 'MAIN COURSE', rate: 250.00 },
  { code: '120', name: 'CHICKEN SHASHLIK(OINV)', category: 'CONTINENTAL', rate: 275.00 },
  // Merge in the Elite Inn 204 item catalog
  ...RESTAURANT_MENU.map(m => ({
    code: m.itemCode || String(m.id).replace('m-', ''),
    name: m.name,
    category: m.category || 'GENERAL',
    rate: Number(m.dineInPrice || m.price || 100)
  }))
];

export const POS_STEWARDS = [
  'Manash',
  'Biren',
  'Pulak',
  'Pranamika',
  'Kangkana',
  'Jalibabu'
];

export const POS_TABLES = [
  '10', '100', '11', '12', 
  '14', '15', '20', '21', 
  '22', '23', '24', '25', 
  '30', '31', '32', '33', 
  '34', '35', '40', '41'
];

// Authentic Statutory KOT Item Deletion / Void Reasons (Video 05 Frame 30 & 32)
export const POS_DELETION_REASONS = [
  'Guest Requested',
  'Cancelled by Guest',
  'Double Entry',
  'Wrongly Made',
  'Food Quality Issue',
  'Long Waiting Time',
  'Complimentary',
  'Corporate Discount',
  'GM Guest',
  'MD Guest',
  'MIXER WITH VODKA',
  'REF MR.DEEP CHANGMAI',
  'MD IPSHITA MAAM,',
  'RD FILLING STATION',
  'RD 119',
  'STAFF TAKE AWAY DISCOUNT',
  'PARTHA SIR',
  'CERTICY GUEST',
  'REF GM SIR',
  'ROOM GUEST DICOUNT',
  'KFC Tax Exemption',
  'More Order',
  'Staff Discount',
  'Travel Agnt Discount',
  'Travel Agnt Spl rate'
];

export default function IdsOrderEntryModal({
  isOpen,
  onClose,
  accountingDate = '03-FEB-2022',
  onKOTCreated,
  onOpenCrystalReport
}) {
  // Outlet selection state (Video 01 Frame 010)
  const [outletConfirmed, setOutletConfirmed] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState('RESTAURANT');
  const [selectedSession, setSelectedSession] = useState('General');

  // Order Header state (Video 01 Frame 015 & 025)
  const [currency, setCurrency] = useState('INR');
  const [tableNo, setTableNo] = useState('10');
  const [kotNo, setKotNo] = useState('AUTO');
  const [covers, setCovers] = useState('2');
  const [server, setServer] = useState('Manash');
  const [guestName, setGuestName] = useState('');
  const [ncDept, setNcDept] = useState('');
  const [ncType, setNcType] = useState('');
  const [isNcMode, setIsNcMode] = useState(false);

  // Active Grid Line Items (Video 01 Frame 025 & 038)
  const [lineItems, setLineItems] = useState([
    { res: 'RES', code: '82', name: 'STEAMED RICE', quantity: 1.0, rate: 145.0, modifier: '' },
    { res: 'RES', code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, modifier: '' },
    { res: 'RES', code: '175', name: 'CHICKEN SHAWARMA', quantity: 1.0, rate: 150.0, modifier: '' },
    { res: 'RES', code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.0, modifier: '' },
    { res: 'RES', code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', quantity: 1.0, rate: 40.0, modifier: '' }
  ]);

  // Dialog states matching Video 01
  const [tableHelpOpen, setTableHelpOpen] = useState(false);
  const [itemHelpOpen, setItemHelpOpen] = useState(false);
  const [itemSearchText, setItemSearchText] = useState('');
  const [activeRowIdx, setActiveRowIdx] = useState(null);
  const [pendingKotOpen, setPendingKotOpen] = useState(false);
  const [tableStatusOpen, setTableStatusOpen] = useState(false);
  const [tableDetailsOpen, setTableDetailsOpen] = useState(false);
  const [selectedTableForDetails, setSelectedTableForDetails] = useState('10');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // KOT Modification, Line Deletion & Entire KOT Deletion State (Videos 02, 05 & Video 06)
  const [editingKotNo, setEditingKotNo] = useState(null);
  const [stagedKotToModify, setStagedKotToModify] = useState(null);
  const [originalKotSnapshot, setOriginalKotSnapshot] = useState(null);
  const [updateConfirmModalOpen, setUpdateConfirmModalOpen] = useState(false);
  const [deleteKotConfirmOpen, setDeleteKotConfirmOpen] = useState(false);
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonModalAction, setReasonModalAction] = useState('SAVE_KOT'); // 'SAVE_KOT' | 'DELETE_KOT'
  const [selectedReason, setSelectedReason] = useState('Double Entry');
  const [integrityCheckOpen, setIntegrityCheckOpen] = useState(false);

  // NC KOT State (Video 07 Frame 016 & Frame 020)
  const [ncModalOpen, setNcModalOpen] = useState(false);
  const [selectedNcDept, setSelectedNcDept] = useState('Managers');
  const [ncGuestNameInput, setNcGuestNameInput] = useState('MANAGER IT');

  // POS Bill Printing & Settlement State (Videos 03 & 04)
  const [posBillModalOpen, setPosBillModalOpen] = useState(false);
  const [posBillSettlementModalOpen, setPosBillSettlementModalOpen] = useState(false);
  const [billedTables, setBilledTables] = useState(['10']);
  const [settledTables, setSettledTables] = useState([]);

  // Live Saved KOTs Registry (Videos 01, 02 & Video 05 Frame 16)
  const [savedKots, setSavedKots] = useState([
    {
      kotNo: '1314',
      accountingDate: '03-FEB-2022',
      tableNo: '14',
      server: 'Biren',
      outlet: 'RESTAURANT',
      items: [
        { code: '82', name: 'STEAMED RICE', quantity: 2.0, rate: 145.0, value: 290.0 },
        { code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, value: 200.0 }
      ],
      totalAmount: 490.0,
      cgst: 12.25,
      sgst: 12.25,
      nettAmount: 515.0
    },
    {
      kotNo: '1316',
      accountingDate: '03-FEB-2022',
      tableNo: '12',
      server: 'Biren',
      outlet: 'RESTAURANT',
      items: [
        { code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '2', name: 'RED BEANS PEANUT & DRY FRUIT', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '3', name: 'SPROUTED MOONG PEANUT DRY', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '4', name: 'CAESAR SALAD VEG', quantity: 1.0, rate: 245.0, value: 245.0 },
        { code: '5', name: 'CAESAR SALAD CHICKEN', quantity: 1.0, rate: 295.0, value: 295.0 }
      ],
      totalAmount: 1137.0,
      cgst: 28.43,
      sgst: 28.43,
      nettAmount: 1194.0
    },
    {
      kotNo: '1311',
      accountingDate: '03-FEB-2022',
      tableNo: '15',
      server: 'Manash',
      outlet: 'RESTAURANT',
      items: [
        { code: '82', name: 'STEAMED RICE', quantity: 1.0, rate: 145.0, value: 145.0 },
        { code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, value: 200.0 },
        { code: '175', name: 'CHICKEN SHAWARMA', quantity: 1.0, rate: 150.0, value: 150.0 },
        { code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.0, value: 120.0 },
        { code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', quantity: 1.0, rate: 40.0, value: 40.0 }
      ],
      totalAmount: 655.0,
      cgst: 16.38,
      sgst: 16.38,
      nettAmount: 688.0
    }
  ]);

  // Financial calculations matching Video 01 Frame 025 & Video 07 Frame 030
  const calculations = useMemo(() => {
    const totalAmount = lineItems.reduce((acc, it) => acc + (it.quantity * it.rate), 0);
    const cgst = Number((totalAmount * 0.025).toFixed(2));
    const sgst = Number((totalAmount * 0.025).toFixed(2));
    const nettAmount = Math.round(totalAmount + cgst + sgst);
    return { totalAmount, cgst, sgst, nettAmount };
  }, [lineItems]);

  // Filtered menu search list for Item Help dialog (Video 01 Frame 021 & Frame 032)
  const filteredMenuItems = useMemo(() => {
    if (!itemSearchText.trim()) return POS_MENU_ITEMS.slice(0, 50);
    const q = itemSearchText.toLowerCase();
    return POS_MENU_ITEMS.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.code.includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [itemSearchText]);

  // Handler to add item from Item Help dialog
  const handleSelectItem = (item) => {
    if (activeRowIdx !== null && activeRowIdx < lineItems.length) {
      setLineItems(prev => {
        const copy = [...prev];
        copy[activeRowIdx] = {
          ...copy[activeRowIdx],
          code: item.code,
          name: item.name,
          rate: item.rate,
          quantity: copy[activeRowIdx].quantity || 1.0
        };
        return copy;
      });
    } else {
      setLineItems(prev => [
        ...prev,
        {
          res: 'RES',
          code: item.code,
          name: item.name,
          quantity: 1.0,
          rate: item.rate,
          modifier: ''
        }
      ]);
    }
    setItemHelpOpen(false);
    setItemSearchText('');
  };

  // Delete item row via <F5> or Delete button (Video 05 Frame 20-22)
  const handleDeleteRow = (targetIdx = selectedRowIdx) => {
    let indexToDelete = targetIdx;
    if (indexToDelete === null || indexToDelete === undefined) {
      if (lineItems.length > 0) {
        indexToDelete = lineItems.length - 1;
      } else {
        return;
      }
    }
    if (indexToDelete >= 0 && indexToDelete < lineItems.length) {
      const removedItem = lineItems[indexToDelete];
      setLineItems(prev => prev.filter((_, idx) => idx !== indexToDelete));
      setSelectedRowIdx(null);
      setSaveSuccessMsg(`Item '${removedItem.name}' removed (<F5>). Click Save to log statutory reason.`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Win32 Keyboard shortcuts matching Video 05: <F5> Deletes selected item row
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteRow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedRowIdx, lineItems]);

  // Handler to Save or Update KOT (Video 01 Frame 038 & Video 05 Frame 30 -> Frame 33)
  const handleSaveKOT = (forcedReason = null) => {
    if (lineItems.length === 0) return;
    const isUpdate = Boolean(editingKotNo);

    // Video 05 Check: Did we delete or reduce items from an already printed KOT?
    if (isUpdate && originalKotSnapshot && !forcedReason) {
      const originalCodes = originalKotSnapshot.items.map(it => it.code);
      const currentCodes = lineItems.map(it => it.code);
      const itemDeleted = originalCodes.some(c => !currentCodes.includes(c));
      
      const qtyReduced = originalKotSnapshot.items.some(orig => {
        const cur = lineItems.find(it => it.code === orig.code);
        return cur && cur.quantity < orig.quantity;
      });

      const totalQtyReduced = lineItems.reduce((acc, it) => acc + it.quantity, 0) < originalKotSnapshot.totalQty;

      if (itemDeleted || qtyReduced || totalQtyReduced) {
        // Must prompt Win32 Statutory Reason dialog (Video 05 Frame 30 & 32)
        setReasonModalOpen(true);
        return;
      }
    }

    const appliedReason = forcedReason || (editingKotNo ? 'Modified' : 'New Order');
    const targetKotNo = isUpdate ? editingKotNo : (kotNo === 'AUTO' ? `13${Math.floor(10 + Math.random() * 89)}` : kotNo);

    const updatedKotRecord = {
      kotNo: targetKotNo,
      accountingDate: accountingDate,
      tableNo: tableNo || (isNcMode ? '10' : '10'),
      server: server,
      outlet: selectedOutlet,
      isNc: isNcMode,
      ncType: isNcMode ? (ncType || 'NC Kot') : '',
      ncDept: isNcMode ? (ncDept || 'Managers') : '',
      guestName: guestName || (isNcMode ? 'MANAGER IT' : 'Walk-In Guest'),
      deletionReason: appliedReason,
      items: lineItems.map(it => ({
        ...it,
        value: it.quantity * it.rate
      })),
      totalAmount: calculations.totalAmount,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      nettAmount: calculations.nettAmount
    };

    if (isUpdate) {
      setSavedKots(prev => prev.map(k => k.kotNo === targetKotNo ? updatedKotRecord : k));
      setSaveSuccessMsg(`KOT #${targetKotNo} on Table ${tableNo} Updated! [Reason: ${appliedReason}]`);
    } else {
      setSavedKots(prev => [updatedKotRecord, ...prev]);
      if (isNcMode) {
        setSaveSuccessMsg(`NC KOT #${targetKotNo} Generated for [${ncDept || 'Managers'}] (Guest: ${guestName || 'MANAGER IT'})!`);
      } else {
        setSaveSuccessMsg(`KOT #${targetKotNo} Generated Successfully on Table ${tableNo}!`);
      }
    }

    // Broadcast into global KDS sync bus
    const syncKot = normalizeKotOrder({
      id: `IDS-${targetKotNo}`,
      tableNumber: tableNo || (isNcMode ? '10' : '10'),
      steward: server,
      outlet: selectedOutlet,
      totalAmount: isNcMode ? 0 : calculations.nettAmount,
      isNc: isNcMode,
      ncDept: ncDept,
      specialInstructions: isNcMode ? `[NC - ${ncDept || 'Managers'}] Guest: ${guestName || 'MANAGER IT'}` : '',
      items: lineItems.map((it, idx) => ({
        id: idx + 1,
        name: it.name,
        qty: it.quantity,
        rate: it.rate
      }))
    });
    const existing = getLiveKots();
    saveLiveKots([syncKot, ...existing]);
    broadcastKotChannel(syncKot);

    if (onKOTCreated) onKOTCreated(updatedKotRecord);

    setTimeout(() => setSaveSuccessMsg(null), 3000);

    // Reset line items and state for next entry (Video 07 Frame 32)
    setLineItems([]);
    setKotNo('AUTO');
    setTableNo('');
    setCovers('');
    setGuestName('');
    setNcDept('');
    setNcType('');
    setIsNcMode(false);
    setEditingKotNo(null);
    setOriginalKotSnapshot(null);
    setSelectedRowIdx(null);
  };

  const handleConfirmReason = () => {
    setReasonModalOpen(false);
    if (reasonModalAction === 'DELETE_KOT') {
      // Video 06 Frame 26 - 30: Delete entire KOT from database
      const kotToDelete = editingKotNo;
      const targetTable = tableNo;

      setSavedKots(prev => prev.filter(k => k.kotNo !== kotToDelete));

      // Notify KDS of KOT cancellation
      const cancelKot = normalizeKotOrder({
        id: `IDS-${kotToDelete}`,
        tableNumber: targetTable,
        steward: server,
        outlet: selectedOutlet,
        status: 'CANCELLED',
        totalAmount: 0,
        items: []
      });
      const existing = getLiveKots().filter(k => k.id !== `IDS-${kotToDelete}`);
      saveLiveKots(existing);
      broadcastKotChannel(cancelKot);

      setSaveSuccessMsg(`KOT #${kotToDelete} on Table ${targetTable} Deleted / Voided! [Reason: ${selectedReason}]`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);

      // Reset Order Entry form back to clean state (Video 06 Frame 28)
      setLineItems([]);
      setKotNo('AUTO');
      setTableNo('');
      setCovers('');
      setEditingKotNo(null);
      setOriginalKotSnapshot(null);
      setSelectedRowIdx(null);
      setReasonModalAction('SAVE_KOT');
    } else {
      handleSaveKOT(selectedReason);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      {/* 1. SELECT OUTLET DIALOG (Video 01 Frame 010) */}
      {!outletConfirmed ? (
        <div 
          className="ids-modal-container" 
          style={{ width: '420px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 10px rgba(0,0,0,0.5)' }}
        >
          <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>Select Outlet</span>
            <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
          </div>
          <div style={{ padding: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Restaurant</label>
              <select 
                value={selectedOutlet}
                onChange={e => setSelectedOutlet(e.target.value)}
                style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="ROOM SERVICE">ROOM SERVICE</option>
                <option value="BANQUET">BANQUET</option>
                <option value="BAR / LOUNGE">BAR / LOUNGE</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Accounting Date</label>
              <input 
                type="text" 
                readOnly 
                value={accountingDate} 
                style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Session</label>
              <select 
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="General">General</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #D0D0D0', paddingTop: '10px' }}>
              <button 
                onClick={() => {
                  setIntegrityCheckOpen(true);
                  setTimeout(() => {
                    setIntegrityCheckOpen(false);
                    setOutletConfirmed(true);
                  }, 600);
                }}
                className="ids-btn"
                style={{ minWidth: '60px', fontWeight: 600 }}
              >
                Ok
              </button>
              <button 
                onClick={onClose}
                className="ids-btn"
                style={{ minWidth: '60px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. ORDER ENTRY V6.5.002.4 MAIN WINDOW (Video 01 Frame 015 - Frame 040) */
        <div 
          className="ids-modal-container" 
          style={{ width: '920px', maxWidth: '98vw', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
        >
          {/* Main Title Bar */}
          <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>Order Entry V6.5.002.4</span>
            <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
          </div>

          {/* Subheader Banner (Frame 015 & Video 07 Frame 022) */}
          <div style={{ background: '#D4D0C8', borderBottom: '1px solid #808080', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#000080' }}>
            <span>{selectedOutlet}</span>
            <span>{selectedSession}</span>
            <span style={{ color: isNcMode ? '#C00000' : '#000080' }}>{isNcMode ? 'NC Kot' : 'Standard KOT'}</span>
            <span>{accountingDate}</span>
          </div>

          {/* 12-Icon Win32 Command Toolbar (Frame 015 & Video 07 Frame 011) */}
          <div style={{ background: '#ECE9D8', borderBottom: '1px solid #999', padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button className="ids-btn" title="Print Bill / Checkout (Video 03 Frame 018)" onClick={() => setPosBillModalOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Printer size={16} />
            </button>
            <button className="ids-btn" title="Bill Settlement V6.5.008.30 (Video 04 Frame 012)" onClick={() => setPosBillSettlementModalOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px', background: posBillSettlementModalOpen ? '#C1D2EE' : undefined }}>
              <CreditCard size={16} color="#008000" />
            </button>
            <button className="ids-btn" title="Modify KOT" onClick={() => setPendingKotOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Edit3 size={16} />
            </button>
            <button className="ids-btn" title="Table Status / Running Tables" onClick={() => setTableStatusOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px', background: tableStatusOpen ? '#C1D2EE' : undefined }}>
              <ArrowRightLeft size={16} color="#000080" />
            </button>
            <button className="ids-btn" title="Waiter Transfer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Users size={16} />
            </button>
            <button className="ids-btn" title="Menu Group / TS Group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <BookOpen size={16} color="#D9822B" />
            </button>
            <button className="ids-btn" title="Split KOT" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Scissors size={16} />
            </button>
            <button className="ids-btn" title="Delete Item & Quantity" onClick={() => { if (lineItems.length > 0) setLineItems(lineItems.slice(0, -1)); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Trash2 size={16} />
            </button>
            <button className="ids-btn" title="Delete Entire KOT" onClick={() => setLineItems([])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <XOctagon size={16} color="#C00" />
            </button>
            <button 
              className="ids-btn" 
              title="Click on NC KOT Icon (Video 07 Frame 011)" 
              onClick={() => setNcModalOpen(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                minWidth: '68px', 
                padding: '2px 6px', 
                color: isNcMode ? '#008000' : '#444', 
                fontWeight: 700,
                background: isNcMode ? '#DFF0D8' : undefined,
                border: isNcMode ? '2px inset #FFF' : undefined
              }}
            >
              <FileText size={16} color={isNcMode ? '#008000' : '#000080'} />
              <span style={{ fontSize: '10px' }}>{isNcMode ? 'NC Kot' : 'NC KOT'}</span>
            </button>
            <button className="ids-btn" title="Room / Guest Info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <Building size={16} />
            </button>
            <button className="ids-btn" title="HotKey Help" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px', padding: '2px 4px' }}>
              <HelpCircle size={16} />
            </button>
            <button className="ids-btn" title="Reprint Last Bill / KOT" onClick={() => setPendingKotOpen(true)} style={{ marginLeft: 'auto', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
              Reprint
            </button>
          </div>

          {/* Form Header Input Controls (Video 01 Frame 015 & Frame 025) */}
          <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px', fontSize: '11px', background: '#ECE9D8', borderBottom: '1px solid #CCC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '45px', fontWeight: 600 }}>Cur</label>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '55px', fontWeight: 600 }}>Table #</label>
              <input 
                type="text" 
                value={tableNo} 
                onChange={e => setTableNo(e.target.value)}
                style={{ width: '60px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
              />
              <button 
                className="ids-btn" 
                onClick={() => setTableHelpOpen(true)}
                title="Lookup Table"
                style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
              >
                ?
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '70px', fontWeight: 600 }}>Guest Name</label>
              <input 
                type="text" 
                value={guestName} 
                onChange={e => setGuestName(e.target.value)}
                placeholder="Walk-In Guest"
                style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '60px', fontWeight: 600 }}>N.C Dept</label>
              <input 
                type="text" 
                value={ncDept} 
                onChange={e => setNcDept(e.target.value)}
                disabled={!isNcMode}
                style={{ flex: 1, background: isNcMode ? '#FFF' : '#E8E8E8', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '45px', fontWeight: 600 }}>KOT #</label>
              <input 
                type="text" 
                value={kotNo} 
                onChange={e => setKotNo(e.target.value)}
                style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
              />
              <button 
                className="ids-btn" 
                onClick={() => setPendingKotOpen(true)}
                title="Pending KOTs Lookup"
                style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
              >
                ?
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '55px', fontWeight: 600 }}>Covers</label>
              <input 
                type="number" 
                value={covers} 
                onChange={e => setCovers(e.target.value)}
                style={{ width: '60px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '70px', fontWeight: 600 }}>Server</label>
              <select 
                value={server} 
                onChange={e => setServer(e.target.value)}
                style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                {POS_STEWARDS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '60px', fontWeight: 600 }}>NC Type</label>
              <input 
                type="text" 
                value={ncType} 
                onChange={e => setNcType(e.target.value)}
                disabled={!isNcMode}
                style={{ flex: 1, background: isNcMode ? '#FFF' : '#E8E8E8', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>
          </div>

          {/* Feedback banner if saved */}
          {saveSuccessMsg && (
            <div style={{ background: '#D4EDDA', borderBottom: '1px solid #C3E6CB', color: '#155724', padding: '4px 12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Dual-Pane Data Grid (Left: Line Entry, Right: Running Bill Computation) */}
          <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', height: '310px', background: '#FFF', borderBottom: '1px solid #808080', overflow: 'hidden' }}>
            {/* Left Data Entry Grid */}
            <div style={{ overflowY: 'auto', borderRight: '1px solid #A0A0A0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                  <tr>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '38px' }}>Res.</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '45px' }}>Code</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '50px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '60px', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '3px 6px', width: '55px', textAlign: 'center' }}>Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const isSelected = selectedRowIdx === idx;
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedRowIdx(idx)}
                        style={{ 
                          background: isSelected ? '#316AC5' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'), 
                          color: isSelected ? '#FFF' : '#000',
                          borderBottom: '1px solid #E0E0E0',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', color: isSelected ? '#FFF' : '#666' }}>{item.res}</td>
                        <td 
                          style={{ 
                            padding: '3px 6px', 
                            borderRight: '1px solid #E0E0E0', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            background: isSelected ? '#0A246A' : undefined,
                            color: isSelected ? '#FFF' : '#000',
                            textDecoration: isSelected ? 'underline' : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowIdx(idx);
                          }}
                          title="Click on Item Code to delete item (Press <F5>)"
                        >
                          {item.code}
                        </td>
                        <td 
                          style={{ 
                            padding: '3px 6px', 
                            borderRight: '1px solid #E0E0E0', 
                            cursor: 'pointer', 
                            color: isSelected ? '#FFF' : '#000080',
                            fontWeight: 500
                          }}
                          onClick={(e) => { 
                            e.stopPropagation();
                            setActiveRowIdx(idx); 
                            setItemHelpOpen(true); 
                          }}
                          title="Click to search / replace item"
                        >
                          {item.name}
                        </td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #E0E0E0', textAlign: 'right' }}>
                          <input 
                            type="number" 
                            step="1" 
                            min="0"
                            value={item.quantity} 
                            onClick={(e) => e.stopPropagation()}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setLineItems(prev => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], quantity: val };
                                return copy;
                              });
                            }}
                            title="Click on Quantity Field to Change Item Quantity"
                            style={{ 
                              width: '46px', 
                              textAlign: 'right', 
                              border: '1px solid #7F9DB9', 
                              fontSize: '11px', 
                              padding: '1px 2px',
                              fontWeight: 600,
                              background: '#FFF',
                              color: '#000'
                            }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', textAlign: 'right' }}>
                          {item.rate.toFixed(2)}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <button 
                            className="ids-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Modifier for ${item.name} (e.g. Less Spicy, Jain)`);
                            }}
                            style={{ fontSize: '10px', padding: '1px 4px', background: '#F0E6D2', color: '#000' }}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Empty rows to maintain authentic Win32 grid height */}
                  {Array.from({ length: Math.max(0, 10 - lineItems.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} style={{ height: '22px', borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #F0F0F0', color: '#BBB' }}>RES</td>
                      <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                      <td 
                        style={{ borderRight: '1px solid #F0F0F0', cursor: 'pointer' }}
                        onClick={() => { setActiveRowIdx(lineItems.length); setItemHelpOpen(true); }}
                      >
                        <span style={{ color: '#AAA', fontStyle: 'italic', paddingLeft: '4px' }}>Click to add item...</span>
                      </td>
                      <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                      <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Billing Summary Pane (Video 01 Frame 025 & Frame 038) */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FCFCFC' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '50px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'right' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EFEFEF' }}>
                        <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EFEFEF' }}>{item.quantity.toFixed(3)}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EFEFEF' }}>{item.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statutory Taxes & Bill Totals */}
              <div style={{ background: '#F5F4EE', borderTop: '2px solid #808080', padding: '6px 10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount:</span>
                  <span style={{ fontWeight: 700 }}>₹{calculations.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#444' }}>
                  <span>Central GST @ 2.50:</span>
                  <span>₹{calculations.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#444' }}>
                  <span>State GST @ 2.50:</span>
                  <span>₹{calculations.sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #CCC', marginTop: '2px', fontSize: '12px', fontWeight: 800, color: '#000080' }}>
                  <span>Nett Amount:</span>
                  <span>₹{calculations.nettAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar matching Video 01 & Video 05/06 */}
          <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#333' }}>
            <span>&lt;F1&gt; @ Qty for Modifier</span>
            <span style={{ fontWeight: 600, color: selectedRowIdx !== null ? '#A00000' : (editingKotNo ? '#C00000' : '#000080') }}>
              {editingKotNo 
                ? (selectedRowIdx !== null
                    ? `Row #${selectedRowIdx + 1} Selected (<F5> to delete item) | Click Delete Button to delete entire KOT #${editingKotNo}`
                    : `Editing KOT #${editingKotNo} on Table ${tableNo} — Click on Delete Button to delete entire KOT`)
                : (selectedRowIdx !== null 
                    ? `Row #${selectedRowIdx + 1} (${lineItems[selectedRowIdx]?.name}) Selected — Press <F5> from keyboard to delete item`
                    : 'Click on Item Code to delete item (<F5>) | Click on Quantity Field to Change Item Quantity')}
            </span>
            <span>&lt;F10&gt; @ MemberCode for Help</span>
          </div>

          {/* Footer Action Buttons matching Video 01 Frame 015 & Video 06 Frame 020 */}
          <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="ids-btn" onClick={() => setItemHelpOpen(true)} style={{ fontWeight: 600 }}>
                + Add Item
              </button>
              <button className="ids-btn" onClick={() => setTableStatusOpen(true)}>
                Table Matrix
              </button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn" 
                onClick={() => handleSaveKOT()} 
                style={{ fontWeight: 700, minWidth: '65px', background: '#DFF0D8', borderColor: '#3C763D' }}
              >
                Save
              </button>
              <button 
                className="ids-btn" 
                onClick={() => { setLineItems([]); setSelectedRowIdx(null); }}
                style={{ minWidth: '60px' }}
              >
                Clear
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  if (editingKotNo) {
                    // Video 06 Frame 020: Delete entire KOT
                    setDeleteKotConfirmOpen(true);
                  } else if (selectedRowIdx !== null) {
                    handleDeleteRow(selectedRowIdx);
                  } else if (lineItems.length > 0) {
                    handleDeleteRow(lineItems.length - 1);
                  }
                }}
                title={editingKotNo ? `Delete entire KOT #${editingKotNo}` : "Delete item (<F5>)"}
                style={{ 
                  minWidth: '60px', 
                  fontWeight: (editingKotNo || selectedRowIdx !== null) ? 700 : 400, 
                  color: (editingKotNo || selectedRowIdx !== null) ? '#C00000' : '#000' 
                }}
              >
                Delete {editingKotNo ? '' : (selectedRowIdx !== null && lineItems[selectedRowIdx] ? `(${lineItems[selectedRowIdx].code})` : '')}
              </button>
              <button 
                className="ids-btn" 
                onClick={() => alert("Touch Screen Panel Toggle")}
                style={{ minWidth: '60px' }}
              >
                Panel
              </button>
              <button 
                className="ids-btn" 
                onClick={() => alert(`Room info lookup for in-house dining`)}
                style={{ minWidth: '65px' }}
              >
                Room info
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setPosBillModalOpen(true)}
                style={{ minWidth: '70px', fontWeight: 600 }}
              >
                Check Out
              </button>
              <button 
                className="ids-btn" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLE # HELP MODAL (Video 01 Frame 015) */}
      {tableHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '280px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table # Help</span>
              <button className="ids-win-btn close" onClick={() => setTableHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ height: '220px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                {POS_TABLES.map(t => (
                  <div 
                    key={t}
                    onClick={() => { setTableNo(t); setTableHelpOpen(false); }}
                    style={{ 
                      padding: '3px 8px', 
                      fontSize: '11px', 
                      cursor: 'pointer', 
                      background: tableNo === t ? '#0A246A' : 'transparent',
                      color: tableNo === t ? '#FFF' : '#000',
                      borderBottom: '1px solid #EEE'
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                <button className="ids-btn" onClick={() => setTableHelpOpen(false)} style={{ minWidth: '55px', fontWeight: 600 }}>Ok</button>
                <button className="ids-btn" onClick={() => setTableHelpOpen(false)} style={{ minWidth: '55px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ITEM HELP SEARCH MODAL (Video 01 Frame 021 & Frame 032) */}
      {itemHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1260 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Item Help</span>
              <button className="ids-win-btn close" onClick={() => setItemHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600 }}>Item Name</label>
                <input 
                  type="text" 
                  autoFocus 
                  value={itemSearchText} 
                  onChange={e => setItemSearchText(e.target.value)}
                  placeholder="Type item name (e.g. Rice, Dal, Chicken)..."
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '3px 6px', fontSize: '11px' }}
                />
              </div>
              <div style={{ height: '240px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #AAA' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', width: '50px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Code</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '70px', textAlign: 'right' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenuItems.map(m => (
                      <tr 
                        key={m.code}
                        onClick={() => handleSelectItem(m)}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5F1FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #EEE' }}>{m.code}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{m.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>₹{m.rate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (filteredMenuItems.length > 0) handleSelectItem(filteredMenuItems[0]);
                  }} 
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Ok
                </button>
                <button className="ids-btn" onClick={() => setItemHelpOpen(false)} style={{ minWidth: '60px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PENDING KOT MODAL (Video 01 Frame 043) */}
      {pendingKotOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1270 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Pending KOT</span>
              <button className="ids-win-btn close" onClick={() => setPendingKotOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Accounting Date</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'center', width: '60px' }}>Table #</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Server</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedKots.map(k => (
                      <tr 
                        key={k.kotNo}
                        onClick={() => {
                          setStagedKotToModify(k);
                          setUpdateConfirmModalOpen(true);
                        }}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5F1FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{k.kotNo}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE' }}>{k.accountingDate}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #EEE', fontWeight: 600 }}>{k.tableNo}</td>
                        <td style={{ padding: '4px 6px' }}>{k.server}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (savedKots.length > 0) {
                      setStagedKotToModify(savedKots[0]);
                      setUpdateConfirmModalOpen(true);
                    }
                  }} 
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Select
                </button>
                <button className="ids-btn" onClick={() => setPendingKotOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5B. WIN32 CONFIRMATION DIALOG (Video 02 Frame 024) */}
      {updateConfirmModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '320px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Message</span>
              <button className="ids-win-btn close" onClick={() => setUpdateConfirmModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '16px', fontSize: '12px' }}>
              <div style={{ marginBottom: '16px', color: '#000', fontWeight: 500 }}>
                Do you want to update this KOT?
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (stagedKotToModify) {
                      setEditingKotNo(stagedKotToModify.kotNo);
                      setKotNo(stagedKotToModify.kotNo);
                      setTableNo(stagedKotToModify.tableNo);
                      setServer(stagedKotToModify.server);
                      setCovers(stagedKotToModify.covers || '2');
                      setOriginalKotSnapshot({
                        kotNo: stagedKotToModify.kotNo,
                        items: JSON.parse(JSON.stringify(stagedKotToModify.items)),
                        totalQty: stagedKotToModify.items.reduce((s, it) => s + (it.quantity || 1), 0),
                        totalAmount: stagedKotToModify.totalAmount
                      });
                      setLineItems(stagedKotToModify.items.map(it => ({
                        res: 'RES',
                        code: it.code,
                        name: it.name,
                        quantity: it.quantity,
                        rate: it.rate,
                        modifier: it.modifier || ''
                      })));
                      setSelectedRowIdx(null);
                    }
                    setUpdateConfirmModalOpen(false);
                    setPendingKotOpen(false);
                  }}
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Yes
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setUpdateConfirmModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5B-2. WIN32 CONFIRM DELETE ENTIRE KOT (Video 06 Frame 021 - Frame 022) */}
      {deleteKotConfirmOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1340 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '320px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Message</span>
              <button className="ids-win-btn close" onClick={() => setDeleteKotConfirmOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '16px', fontSize: '12px' }}>
              <div style={{ marginBottom: '16px', color: '#000', fontWeight: 500 }}>
                Do you want to delete this KOT?
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setDeleteKotConfirmOpen(false);
                    setReasonModalAction('DELETE_KOT');
                    setSelectedReason('Double Entry'); // Video 06 Frame 026 default
                    setReasonModalOpen(true);
                  }}
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Yes
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setDeleteKotConfirmOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS INTEGRITY CHECK MODAL (Video 06 Frame 010) */}
      {integrityCheckOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '380px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>POS integrity Check...</span>
              <button className="ids-win-btn close" onClick={() => { setIntegrityCheckOpen(false); setOutletConfirmed(true); }} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#000' }}>
              PLEASE WAIT... CHECKING TAX STRUCTURE PASSIVE CASES...
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
              <button className="ids-btn" onClick={() => { setIntegrityCheckOpen(false); setOutletConfirmed(true); }} style={{ minWidth: '60px', fontWeight: 600 }}>Ok</button>
            </div>
          </div>
        </div>
      )}

      {/* 5C. WIN32 STATUTORY REASON DIALOG (Video 05 Frame 30 & Video 06 Frame 24 & 26) */}
      {reasonModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '280px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 14px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar matching Video 05 Frame 30 */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Reason</span>
              <button className="ids-win-btn close" onClick={() => setReasonModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ marginBottom: '4px', color: '#333', fontSize: '10px', fontWeight: 600 }}>
                {reasonModalAction === 'DELETE_KOT' 
                  ? 'Select Reason for deleting KOT.' 
                  : 'Select Statutory Reason for Item Cancellation / Reduction:'}
              </div>
              {/* Listbox */}
              <div 
                style={{ 
                  height: '240px', 
                  overflowY: 'auto', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9',
                  marginBottom: '8px'
                }}
              >
                {POS_DELETION_REASONS.map(reason => {
                  const isSelected = selectedReason === reason;
                  return (
                    <div 
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      onDoubleClick={handleConfirmReason}
                      style={{ 
                        padding: '3px 6px', 
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: isSelected ? '#316AC5' : 'transparent',
                        color: isSelected ? '#FFF' : '#000',
                        userSelect: 'none',
                        fontFamily: 'Tahoma, Arial, sans-serif'
                      }}
                    >
                      {reason}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: [...] [ Ok ] [ Cancel ] matching Video 05 Frame 32 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => alert(`Reason details: ${selectedReason}`)}
                  style={{ minWidth: '28px', padding: '2px 4px' }}
                >
                  ...
                </button>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmReason}
                  style={{ minWidth: '55px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setReasonModalOpen(false)}
                  style={{ minWidth: '55px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5D. WIN32 NC KOT DIALOG (Video 07 Frame 016 - Frame 020) */}
      {ncModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '380px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 14px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar matching Video 07 Frame 016 */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>NC KOT</span>
              <button className="ids-win-btn close" onClick={() => setNcModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ color: '#800000', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                Select NC Department & Enter NC Guest name.
              </div>

              {/* Dual Column Table Container */}
              <div 
                style={{ 
                  height: '140px', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9',
                  display: 'grid',
                  gridTemplateColumns: '40% 60%',
                  marginBottom: '10px',
                  overflow: 'hidden'
                }}
              >
                {/* Left Column: NC KOT */}
                <div style={{ borderRight: '1px solid #B0B0B0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: '#ECE9D8', borderBottom: '1px solid #B0B0B0', padding: '3px 6px', fontWeight: 700, fontSize: '11px' }}>
                    NC KOT
                  </div>
                  <div style={{ flex: 1, padding: '4px 6px', background: '#316AC5', color: '#FFF', fontWeight: 600 }}>
                    NC Kot
                  </div>
                </div>

                {/* Right Column: Department */}
                <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  <div style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #B0B0B0', padding: '3px 6px', fontWeight: 700, fontSize: '11px' }}>
                    Department
                  </div>
                  <div>
                    {POS_NC_DEPARTMENTS.map(dept => {
                      const isSelected = selectedNcDept === dept;
                      return (
                        <div 
                          key={dept}
                          onClick={() => setSelectedNcDept(dept)}
                          style={{ 
                            padding: '3px 6px', 
                            cursor: 'pointer',
                            background: isSelected ? '#316AC5' : 'transparent',
                            color: isSelected ? '#FFF' : '#000',
                            fontWeight: isSelected ? 700 : 400,
                            userSelect: 'none'
                          }}
                        >
                          {dept}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Guest Name input field matching Video 07 Frame 020 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <label style={{ width: '75px', fontWeight: 600 }}>Guest Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={ncGuestNameInput}
                  onChange={e => setNcGuestNameInput(e.target.value)}
                  placeholder="e.g. MANAGER.IT"
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px', fontWeight: 600 }}
                />
              </div>

              {/* Action Buttons: [ Ok ] [ Cancel ] */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setIsNcMode(true);
                    setNcType('NC Kot');
                    setNcDept(selectedNcDept);
                    setGuestName(ncGuestNameInput.trim() || 'MANAGER IT');
                    if (!tableNo) setTableNo('10');
                    if (!covers) setCovers('1');
                    if (!server) setServer('Biren');
                    setNcModalOpen(false);
                    setSaveSuccessMsg(`NC Mode Active: [${selectedNcDept}] - Guest: ${ncGuestNameInput.trim() || 'MANAGER IT'}`);
                    setTimeout(() => setSaveSuccessMsg(null), 3500);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setNcModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TABLE STATUS 4x5 MATRIX MODAL (Video 01 Frame 048) */}
      {tableStatusOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1280 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Status</span>
              <button className="ids-win-btn close" onClick={() => setTableStatusOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px' }}>
              {/* 4x5 Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#DDD', padding: '8px', border: '1px solid #808080' }}>
                {POS_TABLES.map(t => {
                  const matchingKot = savedKots.find(k => k.tableNo === t);
                  const isSettled = settledTables.includes(t);
                  const isBilled = !isSettled && billedTables.includes(t);
                  const isOccupied = isBilled || isSettled ? false : Boolean(matchingKot);
                  const statusLetter = isBilled ? 'B' : (isOccupied ? 'O' : 'V');
                  const bgColor = isBilled ? '#0000FF' : (isOccupied ? '#FF0000' : '#008000');
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTableForDetails(t);
                        setTableDetailsOpen(true);
                      }}
                      style={{
                        background: bgColor,
                        color: '#FFF',
                        height: '42px',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: '2px outset #FFF',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.6)'
                      }}
                    >
                      {t}/{statusLetter}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend matching Video 01 Frame 048 & Video 02 Frame 034 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginTop: '10px', fontSize: '11px', fontWeight: 700 }}>
                <div style={{ background: '#0000FF', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  B :- Billed
                </div>
                <div style={{ background: '#800000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  R :- Reserved
                </div>
                <div style={{ background: '#008000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  V :- Vacant
                </div>
                <div style={{ background: '#FF0000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  O :- Occupied
                </div>
              </div>

              {/* Bottom toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #BBB', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬅️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬆️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬇️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>➡️</button>
                </div>
                <button className="ids-btn" onClick={() => setTableStatusOpen(false)} style={{ minWidth: '60px', fontWeight: 600 }}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TABLE DETAILS DIALOG (Video 01 Frame 050 & Video 02 Frame 034) */}
      {tableDetailsOpen && (() => {
        const activeTableKot = savedKots.find(k => k.tableNo === selectedTableForDetails);
        const currentTableItems = activeTableKot ? activeTableKot.items : (lineItems.length > 0 ? lineItems : [
          { name: 'CLASSIC RUSSIAN SALAD ...', quantity: 1.0, value: 199.0 },
          { name: 'RED BEANS PEANUT & DRY FRUIT S...', quantity: 1.0, value: 199.0 },
          { name: 'SPROUTED MOONG PEANUT DRY FRUI...', quantity: 1.0, value: 199.0 },
          { name: 'CAESAR SALAD (VEG) ...', quantity: 1.0, value: 245.0 },
          { name: 'CAESAR SALAD (CHICKEN) ...', quantity: 1.0, value: 295.0 }
        ]);
        const computedTableTotal = currentTableItems.reduce((acc, it) => acc + (it.value || ((it.quantity || 1) * (it.rate || 0))), 0);
        const computedTableCgst = Number((computedTableTotal * 0.025).toFixed(2));
        const computedTableSgst = Number((computedTableTotal * 0.025).toFixed(2));
        const computedTableNett = Math.round(computedTableTotal + computedTableCgst + computedTableSgst);

        return (
          <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
            <div 
              className="ids-modal-container" 
              style={{ width: '520px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
            >
              <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Details</span>
                <button className="ids-win-btn close" onClick={() => setTableDetailsOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
              </div>
              <div style={{ padding: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', background: '#DDD', padding: '6px', border: '1px solid #BBB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Table #</span>
                    <input type="text" readOnly value={selectedTableForDetails} style={{ width: '45px', fontWeight: 700, textAlign: 'center', background: '#FFF', border: '1px solid #7F9DB9' }} />
                    <span style={{ fontWeight: 700 }}>?</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Steward Name</span>
                    <input type="text" readOnly value={activeTableKot?.server || (selectedTableForDetails === '12' ? 'Biren' : server)} style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px' }} />
                  </div>
                </div>

                {/* Items running on table */}
                <div style={{ height: '210px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                      <tr>
                        <th style={{ padding: '3px 6px', width: '55px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>KOT #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                        <th style={{ padding: '3px 6px', width: '60px', textAlign: 'right', borderRight: '1px solid #B0B0B0' }}>Quantity</th>
                        <th style={{ padding: '3px 6px', width: '70px', textAlign: 'right' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableItems.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{activeTableKot?.kotNo || '1316'}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{it.name}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{(it.quantity || 1).toFixed(3)}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{(it.value || ((it.quantity || 1) * (it.rate || 0))).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#F5F5F5', fontWeight: 700, borderTop: '2px solid #808080' }}>
                        <td colSpan={3} style={{ padding: '4px 6px', textAlign: 'right' }}>Total ======&gt;</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{computedTableTotal.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#F5F5F5', color: '#555' }}>
                        <td colSpan={3} style={{ padding: '2px 6px', textAlign: 'right' }}>CGST</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}>{computedTableCgst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#F5F5F5', color: '#555' }}>
                        <td colSpan={3} style={{ padding: '2px 6px', textAlign: 'right' }}>SGST</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}>{computedTableSgst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#E8E8E8', fontWeight: 800, color: '#000080' }}>
                        <td colSpan={3} style={{ padding: '4px 6px', textAlign: 'right' }}>Nett Amount</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{computedTableNett.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button className="ids-btn" onClick={() => setTableDetailsOpen(false)} style={{ minWidth: '60px', fontWeight: 600 }}>
                    Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 8. POS BILL PRINTING MODAL (Video 03 Frame 018 - Frame 036) */}
      <IdsPosBillModal
        isOpen={posBillModalOpen}
        onClose={() => setPosBillModalOpen(false)}
        initialTableNo={tableNo}
        accountingDate={accountingDate}
        outlet={selectedOutlet}
        session={selectedSession}
        steward={server}
        kots={savedKots}
        onOpenCrystalReport={onOpenCrystalReport}
        onBillPrinted={({ billNo, tableNo: bTableNo }) => {
          setBilledTables(prev => Array.from(new Set([...prev, bTableNo])));
        }}
        onBillSettled={(settlementRecord) => {
          const tNo = settlementRecord.tableNo;
          setBilledTables(prev => prev.filter(t => t !== tNo));
          setSettledTables(prev => Array.from(new Set([...prev, tNo])));
          setSavedKots(prev => prev.filter(k => k.tableNo !== tNo));
          setSaveSuccessMsg(`Bill #${settlementRecord.billNo} on Table ${tNo} Settled! Table is now Vacant.`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }}
      />

      {/* 9. BILL SETTLEMENT V6.5.008.30 (Video 04 Frame 016 - Frame 054) */}
      <IdsPosBillSettlementModal
        isOpen={posBillSettlementModalOpen}
        onClose={() => setPosBillSettlementModalOpen(false)}
        initialBillNo="4"
        accountingDate={accountingDate}
        outlet={selectedOutlet}
        session={selectedSession}
        steward={server}
        onBillSettled={(settlementRecord) => {
          const tNo = settlementRecord.tableNo;
          setBilledTables(prev => prev.filter(t => t !== tNo));
          setSettledTables(prev => Array.from(new Set([...prev, tNo])));
          setSavedKots(prev => prev.filter(k => k.tableNo !== tNo));
          setSaveSuccessMsg(`Bill #${settlementRecord.billNo} on Table ${tNo} Settled! Table ${tNo} is now Vacant.`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }}
        onOpenCrystalReport={onOpenCrystalReport}
      />
    </div>
  );
}
