import React, { useState, useEffect, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  SHIFT_DEFINITIONS, 
  getStoredShiftRecords, 
  saveStoredShiftRecords, 
  getStoredActiveShiftId, 
  saveStoredActiveShiftId,
  formatClientMorningBriefing,
  DEFAULT_SHIFT_RECORDS
} from '../../data/idsShiftStore';
import { playSuccessChime, playReceptionChime } from '../../utils/soundAlert';
import { 
  getFastApiCashierShifts, 
  closeFastApiCashierShift, 
  openFastApiCashierShift, 
  getFastApiMorningBriefing,
  downloadFastApiDailyArchive
} from '../../utils/backendApi';

/**
 * IdsCashierShiftHandoverModal - V6.5.008.1
 * Win32 MDI Dialog replicating Front Office Cashier Shift Handover & Morning Flash Briefing
 * Synchronizes 3 shifts: Morning (FO-01), Evening (FO-02), Night (FO-03)
 */
export default function IdsCashierShiftHandoverModal({
  isOpen,
  onClose,
  accountingDate = '02-10-2026',
  currentUser = 'MANAGER',
  initialTab = 'handover', // 'handover' | 'flash-report' | 'history'
  onOpenMessageBox
}) {
  const [records, setRecords] = useState(() => getStoredShiftRecords());
  const [selectedDate, setSelectedDate] = useState('02-10-2026');
  const [activeShiftId, setActiveShiftId] = useState(() => getStoredActiveShiftId());
  const [activeTab, setActiveTab] = useState(initialTab || 'handover'); // 'handover' | 'flash-report' | 'history'
  const [toastMessage, setToastMessage] = useState('');
  const [authPin, setAuthPin] = useState('7650');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync tab if changed externally or when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'handover');
    }
  }, [initialTab, isOpen]);

  // Ensure record exists for selectedDate
  const currentDayData = useMemo(() => {
    if (records[selectedDate]) return records[selectedDate];
    return records['02-10-2026'] || {};
  }, [records, selectedDate]);

  // Current active shift data
  const shiftData = useMemo(() => {
    return currentDayData[activeShiftId] || {
      shiftId: activeShiftId,
      shiftName: SHIFT_DEFINITIONS.find(s => s.id === activeShiftId)?.name || 'Morning',
      cashierName: SHIFT_DEFINITIONS.find(s => s.id === activeShiftId)?.cashierName || 'Cashier',
      cashierCode: SHIFT_DEFINITIONS.find(s => s.id === activeShiftId)?.cashierCode || 'FO-01',
      status: 'OPEN',
      drawerFloat: 2000,
      safeDrop: 0,
      denominations: { n500: 4, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, coins: 0 },
      physicalCash: 2000,
      collections: { cash: 0, upi: 0, card: 0, btc: 0, complimentary: 0, total: 0 },
      fnbSplit: { roomService: 0, restaurant: 0, takeAway: 0 },
      handoverNotes: ''
    };
  }, [currentDayData, activeShiftId]);

  // Local editable form fields for active shift
  const [drawerFloat, setDrawerFloat] = useState(shiftData.drawerFloat || 2000);
  const [collCash, setCollCash] = useState(shiftData.collections?.cash || 0);
  const [collUpi, setCollUpi] = useState(shiftData.collections?.upi || 0);
  const [collCard, setCollCard] = useState(shiftData.collections?.card || 0);
  const [collBtc, setCollBtc] = useState(shiftData.collections?.btc || 0);
  const [collComp, setCollComp] = useState(shiftData.collections?.complimentary || 0);
  const [safeDrop, setSafeDrop] = useState(shiftData.safeDrop || 0);
  const [handoverNotes, setHandoverNotes] = useState(shiftData.handoverNotes || '');

  // Denominations
  const [denoms, setDenoms] = useState(shiftData.denominations || {
    n500: 4, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, coins: 0
  });

  // Daily Rollup (Flash Report) state
  const [rollup, setRollup] = useState(currentDayData.dailyRollup || {
    reportDate: selectedDate,
    totalRoomsAvailable: 22,
    totalRoomsSaleable: 5,
    arrActual: 1611,
    occupancy: 18,
    mgmHold: 0,
    underMaintenance: 0,
    outOfOrder: 0.0,
    roomService: 805.00,
    restaurant: 28651.00,
    takeAway: 4337.00,
    totalRevenueActual: 33793.00,
    mtdFbRevenueActual: 53690.00,
    restaurantComplimentary: 5.00,
    totalBtcAmount: 0.00
  });

  // Re-sync local form when activeShiftId or selectedDate changes
  useEffect(() => {
    if (shiftData) {
      setDrawerFloat(shiftData.drawerFloat ?? 2000);
      setCollCash(shiftData.collections?.cash ?? 0);
      setCollUpi(shiftData.collections?.upi ?? 0);
      setCollCard(shiftData.collections?.card ?? 0);
      setCollBtc(shiftData.collections?.btc ?? 0);
      setCollComp(shiftData.collections?.complimentary ?? 0);
      setSafeDrop(shiftData.safeDrop ?? 0);
      setHandoverNotes(shiftData.handoverNotes ?? '');
      setDenoms(shiftData.denominations ?? { n500: 0, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, coins: 0 });
    }
    if (currentDayData.dailyRollup) {
      setRollup(currentDayData.dailyRollup);
    }
  }, [activeShiftId, selectedDate, shiftData, currentDayData]);

  // Physical cash computed from denominations
  const totalPhysicalCash = useMemo(() => {
    return (
      (Number(denoms.n500) || 0) * 500 +
      (Number(denoms.n200) || 0) * 200 +
      (Number(denoms.n100) || 0) * 100 +
      (Number(denoms.n50) || 0) * 50 +
      (Number(denoms.n20) || 0) * 20 +
      (Number(denoms.n10) || 0) * 10 +
      (Number(denoms.coins) || 0)
    );
  }, [denoms]);

  // Total collections
  const totalCollections = useMemo(() => {
    return (Number(collCash) || 0) + (Number(collUpi) || 0) + (Number(collCard) || 0) + (Number(collBtc) || 0);
  }, [collCash, collUpi, collCard, collBtc]);

  // Expected cash in drawer = Opening Drawer Float + Cash Collections - Safe Drop
  const expectedCashInDrawer = useMemo(() => {
    return (Number(drawerFloat) || 0) + (Number(collCash) || 0) - (Number(safeDrop) || 0);
  }, [drawerFloat, collCash, safeDrop]);

  // Variance between physical cash and expected drawer cash
  const cashVariance = useMemo(() => {
    return totalPhysicalCash - expectedCashInDrawer;
  }, [totalPhysicalCash, expectedCashInDrawer]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="ids-minimized-dock-pill"
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '34px',
          left: '1000px',
          zIndex: 99999,
          background: 'linear-gradient(180deg, #ECE9D8 0%, #D8D4C0 100%)',
          border: '2px outset #FFFFFF',
          borderRadius: '3px 3px 0 0',
          padding: '4px 10px',
          fontSize: '11px',
          fontFamily: 'Tahoma, sans-serif',
          fontWeight: 'bold',
          color: '#0A246A',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.4)'
        }}
        title="Restore Cashier Shift Handover V6.5.008.1"
      >
        <span>💰 🗕 Cashier Handover ({shiftData.shiftName})</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            background: '#C00',
            color: '#FFF',
            border: 'none',
            borderRadius: '2px',
            fontSize: '9px',
            padding: '1px 4px',
            cursor: 'pointer'
          }}
          title="Close Dialog"
        >✕</button>
      </div>
    );
  }

  // Handle Denomination Change
  const handleDenomChange = (field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setDenoms(prev => ({ ...prev, [field]: num }));
  };

  // Save current shift draft
  const handleSaveDraft = () => {
    const updated = {
      ...records,
      [selectedDate]: {
        ...currentDayData,
        reportDate: selectedDate,
        activeShiftId,
        [activeShiftId]: {
          ...shiftData,
          drawerFloat: Number(drawerFloat) || 0,
          safeDrop: Number(safeDrop) || 0,
          denominations: denoms,
          physicalCash: totalPhysicalCash,
          collections: {
            cash: Number(collCash) || 0,
            upi: Number(collUpi) || 0,
            card: Number(collCard) || 0,
            btc: Number(collBtc) || 0,
            complimentary: Number(collComp) || 0,
            total: totalCollections
          },
          handoverNotes
        }
      }
    };
    setRecords(updated);
    saveStoredShiftRecords(updated);
    showToast(`Draft saved for ${shiftData.shiftName}!`);
  };

  // Lock Shift with PIN verification
  const handleOpenLockModal = () => {
    setPinInput('');
    setPinModalOpen(true);
  };

  const handleExecuteShiftLock = () => {
    if (pinInput !== '7650' && pinInput !== '1234') {
      alert('Invalid Receptionist / Duty Manager Security PIN! (Default: 7650 or 1234)');
      return;
    }

    const nextShiftMap = {
      shift1: 'shift2',
      shift2: 'shift3',
      shift3: 'shift1'
    };
    const nextShiftId = nextShiftMap[activeShiftId];
    const nextDef = SHIFT_DEFINITIONS.find(s => s.id === nextShiftId);

    const lockedShift = {
      ...shiftData,
      status: 'LOCKED',
      lockedAt: `${selectedDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      lockedBy: currentUser === 'MANAGER' ? shiftData.cashierName : currentUser,
      pin: pinInput,
      drawerFloat: Number(drawerFloat) || 0,
      safeDrop: Number(safeDrop) || 0,
      denominations: denoms,
      physicalCash: totalPhysicalCash,
      collections: {
        cash: Number(collCash) || 0,
        upi: Number(collUpi) || 0,
        card: Number(collCard) || 0,
        btc: Number(collBtc) || 0,
        complimentary: Number(collComp) || 0,
        total: totalCollections
      },
      handoverNotes
    };

    // Auto-transfer drawer float to incoming shift
    const incomingShiftData = currentDayData[nextShiftId] || {};
    const updatedIncomingShift = {
      ...incomingShiftData,
      shiftId: nextShiftId,
      shiftName: nextDef?.name || 'Next Shift',
      cashierName: nextDef?.cashierName || 'Incoming Cashier',
      cashierCode: nextDef?.cashierCode || 'FO-02',
      status: 'OPEN',
      drawerFloat: Number(drawerFloat) || 2000 // Carried over from locked shift
    };

    const updatedRecords = {
      ...records,
      [selectedDate]: {
        ...currentDayData,
        reportDate: selectedDate,
        activeShiftId: nextShiftId,
        [activeShiftId]: lockedShift,
        [nextShiftId]: updatedIncomingShift
      }
    };

    setRecords(updatedRecords);
    saveStoredShiftRecords(updatedRecords);
    saveStoredActiveShiftId(nextShiftId);
    setActiveShiftId(nextShiftId);
    setPinModalOpen(false);

    try {
      playSuccessChime();
    } catch (e) {}

    showToast(`🔒 ${shiftData.shiftName} locked! Drawer Float ₹${Number(drawerFloat).toLocaleString('en-IN')} handed over to ${nextDef?.cashierName}.`);

    // Asynchronously dispatch shift close and open to Railway PostgreSQL
    closeFastApiCashierShift(shiftData.cashierCode || 'FO-01', {
      shift_id: activeShiftId,
      shift_name: shiftData.shiftName,
      cashier_code: shiftData.cashierCode || 'FO-01',
      cashier_name: shiftData.cashierName,
      status: 'LOCKED',
      drawer_float: Number(drawerFloat) || 0,
      safe_drop: Number(safeDrop) || 0,
      physical_cash: totalPhysicalCash,
      cash_collections: Number(collCash) || 0,
      upi_collections: Number(collUpi) || 0,
      card_collections: Number(collCard) || 0,
      btc_collections: Number(collBtc) || 0,
      complimentary_collections: Number(collComp) || 0,
      total_collections: totalCollections,
      notes: handoverNotes,
      pin: pinInput,
      denominations: denoms
    }, selectedDate).catch(err => console.warn('[FastAPI] Close shift error:', err));

    openFastApiCashierShift({
      shift_id: nextShiftId,
      shift_name: nextDef?.name || 'Next Shift',
      cashier_code: nextDef?.cashierCode || 'FO-02',
      cashier_name: nextDef?.cashierName || 'Incoming Cashier',
      accounting_date: selectedDate,
      opening_drawer_float: Number(drawerFloat) || 2000
    }).catch(err => console.warn('[FastAPI] Open shift error:', err));
  };

  // Copy WhatsApp Formatted Message
  const handleCopyWhatsAppBriefing = () => {
    const text = formatClientMorningBriefing(rollup);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('✓ WhatsApp Briefing copied to clipboard! Ready to paste into group.');
    } else {
      prompt('Copy the WhatsApp Briefing Report:', text);
    }
  };

  // Auto-calculate Total Revenue from F&B Outlets + Room revenue
  const handleAutoCalcFlashTotals = () => {
    const rs = parseFloat(rollup.roomService) || 0;
    const rest = parseFloat(rollup.restaurant) || 0;
    const take = parseFloat(rollup.takeAway) || 0;
    const totalFb = rs + rest + take;
    setRollup(prev => ({
      ...prev,
      totalRevenueActual: totalFb
    }));
    try { playSuccessChime(); } catch (e) {}
    showToast(`✓ Total Revenue synchronized: ₹${totalFb.toLocaleString('en-IN')}`);
  };

  // Reset Flash Report metrics to default Night Audit rollups
  const handleResetFlashDefaults = () => {
    const def = DEFAULT_SHIFT_RECORDS['02-10-2026']?.dailyRollup || {
      reportDate: selectedDate,
      totalRoomsAvailable: 22,
      totalRoomsSaleable: 5,
      arrActual: 1611,
      occupancy: 18,
      mgmHold: 0,
      underMaintenance: 0,
      outOfOrder: 0.0,
      roomService: 805.00,
      restaurant: 28651.00,
      takeAway: 4337.00,
      totalRevenueActual: 33793.00,
      mtdFbRevenueActual: 53690.00,
      restaurantComplimentary: 5.00,
      totalBtcAmount: 0.00
    };
    setRollup(def);
    try { playReceptionChime(); } catch (e) {}
    showToast('✓ Operational metrics reset to Night Audit benchmark figures.');
  };

  // Print Handover Voucher
  const handlePrintHandoverVoucher = () => {
    const win = window.open('', '_blank', 'width=550,height=720');
    if (!win) return;

    const shiftDef = SHIFT_DEFINITIONS.find(s => s.id === activeShiftId);
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Elite Inn - Cashier Shift Handover Voucher [${activeShiftId.toUpperCase()}]</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 13px; color: #000; background: #fff; }
            .center { text-align: center; }
            .title { font-weight: bold; font-size: 16px; letter-spacing: 1px; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .grid { display: flex; justify-content: space-between; margin: 3px 0; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
            .box { border: 1px solid #000; padding: 8px; margin: 10px 0; }
            .sign { margin-top: 30px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">HOTEL ELITE INN</div>
            <div>Near Railway Station, Muniguda, Rayagada, Odisha</div>
            <div class="bold">FRONT OFFICE CASHIER SHIFT HANDOVER VOUCHER</div>
          </div>
          <div class="line"></div>
          <div class="grid"><span>Report Date:</span><span class="bold">${selectedDate}</span></div>
          <div class="grid"><span>Shift:</span><span class="bold">${shiftDef?.label}</span></div>
          <div class="grid"><span>Outgoing Cashier:</span><span class="bold">${shiftData.cashierName} (${shiftData.cashierCode})</span></div>
          <div class="grid"><span>Shift Status:</span><span class="bold">${shiftData.status}</span></div>
          <div class="line"></div>
          <div class="bold">1. CASH DRAWER & FLOAT RECONCILIATION:</div>
          <div class="grid"><span>Opening Drawer Float (Dryer):</span><span>₹${Number(drawerFloat).toFixed(2)}</span></div>
          <div class="grid"><span>Cash Collections:</span><span>₹${Number(collCash).toFixed(2)}</span></div>
          <div class="grid"><span>Less Safe Drop to Vault:</span><span>(₹${Number(safeDrop).toFixed(2)})</span></div>
          <div class="grid bold"><span>Expected Drawer Balance:</span><span>₹${Number(expectedCashInDrawer).toFixed(2)}</span></div>
          <div class="grid bold"><span>Physical Count:</span><span>₹${Number(totalPhysicalCash).toFixed(2)}</span></div>
          <div class="grid"><span>Variance (Short/Excess):</span><span class="bold">${cashVariance === 0 ? '₹0.00 (Balanced)' : (cashVariance > 0 ? `+₹${cashVariance.toFixed(2)} (Excess)` : `-₹${Math.abs(cashVariance).toFixed(2)} (Shortage)`)}</span></div>
          <div class="line"></div>
          <div class="bold">2. DIGITAL & NON-CASH COLLECTIONS:</div>
          <div class="grid"><span>UPI / QR Collections:</span><span>₹${Number(collUpi).toFixed(2)}</span></div>
          <div class="grid"><span>Card POS Collections:</span><span>₹${Number(collCard).toFixed(2)}</span></div>
          <div class="grid"><span>Bill To Company (BTC):</span><span>₹${Number(collBtc).toFixed(2)}</span></div>
          <div class="grid"><span>Complimentary / NC:</span><span>${collComp} Items</span></div>
          <div class="grid bold"><span>Total Shift Collections:</span><span>₹${Number(totalCollections).toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="box">
            <div class="bold">Handover Notes:</div>
            <div>${handoverNotes || 'Drawer float verified and keys handed over.'}</div>
          </div>
          <div class="sign">
            <div>___________________<br/>Outgoing Cashier Sign<br/>(${shiftData.cashierName})</div>
            <div>___________________<br/>Incoming Cashier Sign<br/>(Float Received)</div>
            <div>___________________<br/>Duty Manager / Auditor</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
      <div 
        className={`ids-modal-container ${isMaximized ? 'maximized' : ''}`}
        style={{
          width: isMaximized ? '1040px' : '960px',
          maxWidth: isMaximized ? '98vw' : '96vw',
          height: isMaximized ? '660px' : '620px',
          maxHeight: isMaximized ? '95vh' : '90vh',
          background: '#ECE9D8',
          border: '3px solid #808080',
          boxShadow: '6px 6px 24px rgba(0,0,0,0.85)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          color: '#000',
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
            padding: '4px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💰 Cashier Shift Handover & Morning Flash Report V6.5.008.1</span>
            <span style={{ fontSize: '9.5px', opacity: 0.9, fontWeight: 400 }}>
              (Front Office Cashiering - Shift Handover, Dryer Float & Lock)
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className="ids-win-btn" title="Minimize to Desktop Taskbar" onClick={() => setIsMinimized(true)} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize (Compact Window)"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              className="ids-win-btn close"
              onClick={onClose}
              style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {toastMessage && (
          <div style={{ background: '#FFFFE1', borderBottom: '1px solid #D4D0C8', padding: '4px 10px', fontSize: '10.5px', color: '#004085', fontWeight: 600 }}>
            {toastMessage}
          </div>
        )}

        {/* 3 Shifts Selector Strip */}
        <div style={{ background: '#D4D0C8', padding: '6px 10px', borderBottom: '1px solid #999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {SHIFT_DEFINITIONS.map(s => {
              const sData = currentDayData[s.id] || {};
              const isSelected = activeShiftId === s.id;
              const isLocked = sData.status === 'LOCKED';

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveShiftId(s.id);
                    saveStoredActiveShiftId(s.id);
                  }}
                  className={`ids-btn ${isSelected ? 'info' : (isLocked ? 'success' : '')}`}
                  style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 600,
                    border: isSelected ? '2px inset #FFF' : '2px outset #FFF',
                    background: isSelected ? '#0A246A' : (isLocked ? '#DCFCE7' : '#ECE9D8'),
                    color: isSelected ? '#FFF' : (isLocked ? '#14532D' : '#000'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{isLocked ? '🔒' : '🟢'}</span>
                  <span>{s.name}</span>
                  <span style={{ fontSize: '9.5px', opacity: 0.85 }}>({s.cashierName.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>Report Date:</span>
            <input 
              type="text" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              style={{ width: '85px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            />
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: '2px', padding: '6px 10px 0 10px', background: '#ECE9D8', borderBottom: '1px solid #716F64' }}>
          <button
            onClick={() => setActiveTab('handover')}
            className={`ids-tab-btn ${activeTab === 'handover' ? 'active' : ''}`}
            style={{
              padding: '5px 14px',
              border: '2px outset #FFFFFF',
              borderBottom: activeTab === 'handover' ? '2px solid #ECE9D8' : '1px solid #716F64',
              background: activeTab === 'handover' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'handover' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              color: activeTab === 'handover' ? '#0A246A' : '#333'
            }}
          >
            💵 Shift Handover & Float Count
          </button>
          <button
            onClick={() => setActiveTab('flash-report')}
            className={`ids-tab-btn ${activeTab === 'flash-report' ? 'active' : ''}`}
            style={{
              padding: '5px 14px',
              border: '2px outset #FFFFFF',
              borderBottom: activeTab === 'flash-report' ? '2px solid #ECE9D8' : '1px solid #716F64',
              background: activeTab === 'flash-report' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'flash-report' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              color: activeTab === 'flash-report' ? '#0A246A' : '#333'
            }}
          >
            📊 Daily Operations Flash Report (Client Format)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`ids-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            style={{
              padding: '5px 14px',
              border: '2px outset #FFFFFF',
              borderBottom: activeTab === 'history' ? '2px solid #ECE9D8' : '1px solid #716F64',
              background: activeTab === 'history' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              color: activeTab === 'history' ? '#0A246A' : '#333'
            }}
          >
            📜 3-Shift Synchronization Ledger
          </button>
        </div>

        {/* Tab 1: Handover & Float */}
        {activeTab === 'handover' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Cashier Status Card */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#0A246A' }}>
                  {shiftData.shiftName} — {shiftData.cashierName} ({shiftData.cashierCode})
                </span>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '1px' }}>
                  Duty Hours: {SHIFT_DEFINITIONS.find(s => s.id === activeShiftId)?.shortTime} • Phone: {SHIFT_DEFINITIONS.find(s => s.id === activeShiftId)?.phone}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '2px',
                  fontWeight: 800,
                  fontSize: '11px',
                  background: shiftData.status === 'LOCKED' ? '#E8F5E9' : '#FFF3E0',
                  color: shiftData.status === 'LOCKED' ? '#2E7D32' : '#E65100',
                  border: shiftData.status === 'LOCKED' ? '1px solid #A5D6A7' : '1px solid #FFE082'
                }}>
                  {shiftData.status === 'LOCKED' ? '🔒 SHIFT LOCKED & VERIFIED' : '🟢 ACTIVE CASHIER SESSION'}
                </span>
                {shiftData.status === 'LOCKED' && shiftData.lockedAt && (
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    at {shiftData.lockedAt}
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Handover Body: Left = Collections & Float | Right = Note Denominations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Left Column: Drawer Float & Tender Breakdown */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0A246A', borderBottom: '1px solid #D4D0C8', paddingBottom: '3px' }}>
                  1. Drawer Float ("Dryer Float") & Tender Collections
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Opening Dryer Float:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={drawerFloat} 
                      onChange={e => setDrawerFloat(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 700 }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#666' }}>(Passed from prior shift)</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Cash Collections:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={collCash} 
                      onChange={e => setCollCash(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>UPI / QR Collections:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={collUpi} 
                      onChange={e => setCollUpi(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#666' }}>(GPay/PhonePe)</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Card POS Collections:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={collCard} 
                      onChange={e => setCollCard(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#666' }}>(EDC Swipe)</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Bill to Company (BTC):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={collBtc} 
                      onChange={e => setCollBtc(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Safe Drop to Vault:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={safeDrop} 
                      onChange={e => setSafeDrop(e.target.value)}
                      disabled={shiftData.status === 'LOCKED'}
                      style={{ width: '90px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', color: '#A00', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#A00' }}>(Drop Safe)</span>
                  </div>
                </div>

                <div style={{ background: '#F5F4EC', padding: '6px 8px', border: '1px solid #D0CDC0', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ fontWeight: 600 }}>Total Collections:</span>
                    <span style={{ fontWeight: 800, color: '#0A246A' }}>₹{totalCollections.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>Expected Drawer Cash:</span>
                    <span style={{ fontWeight: 800, color: '#008000' }}>₹{expectedCashInDrawer.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Physical Denominations Calculator */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0A246A', borderBottom: '1px solid #D4D0C8', paddingBottom: '3px' }}>
                  2. Cash Drawer Denomination Counter
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹500 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n500} 
                    onChange={e => handleDenomChange('n500', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n500) || 0) * 500).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹200 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n200} 
                    onChange={e => handleDenomChange('n200', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n200) || 0) * 200).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹100 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n100} 
                    onChange={e => handleDenomChange('n100', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n100) || 0) * 100).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹50 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n50} 
                    onChange={e => handleDenomChange('n50', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n50) || 0) * 50).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹20 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n20} 
                    onChange={e => handleDenomChange('n20', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n20) || 0) * 20).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>₹10 ×</span>
                  <input 
                    type="number" 
                    value={denoms.n10} 
                    onChange={e => handleDenomChange('n10', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{((Number(denoms.n10) || 0) * 10).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 10px 1fr', alignItems: 'center', gap: '4px' }}>
                  <span>Coins:</span>
                  <input 
                    type="number" 
                    value={denoms.coins} 
                    onChange={e => handleDenomChange('coins', e.target.value)} 
                    disabled={shiftData.status === 'LOCKED'}
                    style={{ width: '45px', padding: '1px 3px', fontSize: '11px', border: '1px solid #7F9DB9' }} 
                  />
                  <span>=</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{(Number(denoms.coins) || 0).toLocaleString('en-IN')}</span>
                </div>

                {/* Variance Check Bar */}
                <div style={{ 
                  background: cashVariance === 0 ? '#E8F5E9' : (cashVariance > 0 ? '#E3F2FD' : '#FFEBEE'),
                  border: `1px solid ${cashVariance === 0 ? '#A5D6A7' : (cashVariance > 0 ? '#90CAF9' : '#EF9A9A')}`,
                  padding: '6px 8px',
                  borderRadius: '2px',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Physical Cash Total:</span>
                    <span>₹{totalPhysicalCash.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginTop: '2px', color: cashVariance === 0 ? '#2E7D32' : (cashVariance > 0 ? '#1565C0' : '#C62828') }}>
                    <span>Drawer Reconciliation:</span>
                    <span style={{ fontWeight: 800 }}>
                      {cashVariance === 0 ? '✓ Balanced (₹0.00)' : (cashVariance > 0 ? `+₹${cashVariance.toFixed(2)} Excess` : `-₹${Math.abs(cashVariance).toFixed(2)} Shortage`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Handover Notes */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 10px' }}>
              <span style={{ fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                Shift Handover Log & Keys Transfer Notes:
              </span>
              <textarea 
                value={handoverNotes} 
                onChange={e => setHandoverNotes(e.target.value)}
                disabled={shiftData.status === 'LOCKED'}
                placeholder="Enter notes on pending cash drops, guest room balance queries, or keys handed over..."
                rows={2}
                style={{ width: '100%', border: '1px solid #7F9DB9', padding: '4px', fontSize: '11px', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: '#666' }}>
                Next Incoming Shift: <strong>{activeShiftId === 'shift1' ? 'Shift 2 (Sneha)' : (activeShiftId === 'shift2' ? 'Shift 3 (Manash)' : 'Shift 1 (Ranjan)')}</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {shiftData.status !== 'LOCKED' && (
                  <button 
                    onClick={handleSaveDraft}
                    className="ids-btn success save"
                    style={{ minWidth: '70px' }}
                  >
                    Save Draft
                  </button>
                )}
                <button 
                  onClick={handlePrintHandoverVoucher}
                  className="ids-btn print info"
                  style={{ minWidth: '80px', fontWeight: 600 }}
                >
                  🖨️ Print Voucher
                </button>
                <button 
                  onClick={() => {
                    downloadFastApiDailyArchive(selectedDate)
                      .then(() => setToastMessage('✓ Daily Archive (.JSON) downloaded directly to your PC (Downloads)!'))
                      .catch(err => setToastMessage('Archive error: ' + err.message));
                  }}
                  className="ids-btn info"
                  style={{ minWidth: '120px', fontWeight: 700 }}
                  title="Download today's complete hotel books & shift transactions (.JSON) directly to local PC"
                >
                  📥 Export Daily Archive (.JSON)
                </button>
                {shiftData.status !== 'LOCKED' ? (
                  <button 
                    onClick={handleOpenLockModal}
                    className="ids-btn success confirm"
                    style={{ minWidth: '130px', fontWeight: 800 }}
                  >
                    🔒 Lock Shift & Handover
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      // Switch to next shift view
                      const next = activeShiftId === 'shift1' ? 'shift2' : (activeShiftId === 'shift2' ? 'shift3' : 'shift1');
                      setActiveShiftId(next);
                      saveStoredActiveShiftId(next);
                    }}
                    className="ids-btn info"
                    style={{ minWidth: '130px', fontWeight: 700 }}
                  >
                    Switch to Next Shift →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Flash Report (Win32 Structured Operational DataGrid & WhatsApp Broadcast) */}
        {activeTab === 'flash-report' && (
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
            
            {/* Top Operational KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Card 1: Room Inventory & Occupancy */}
              <div style={{ background: '#FFF', border: '2px outset #FFF', padding: '6px 8px', boxShadow: 'inset 0 0 0 1px #808080' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D4D0C8', paddingBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: '10.5px', color: '#0A246A' }}>🏨 ROOMS &amp; OCCUPANCY</span>
                  <span style={{ fontSize: '9.5px', color: '#666' }}>FO Rack Sync</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E20' }}>{rollup.occupancy}% Occ</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A246A' }}>ARR: ₹{Math.round(rollup.arrActual || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }}>
                  Avail: <strong>{rollup.totalRoomsAvailable}</strong> | Saleable: <strong>{rollup.totalRoomsSaleable}</strong> | Hold: <strong>{rollup.mgmHold ?? 0}</strong> | Maint: <strong>{rollup.underMaintenance ?? 0}</strong>
                </div>
              </div>

              {/* Card 2: Food & Beverage Outlets */}
              <div style={{ background: '#FFF', border: '2px outset #FFF', padding: '6px 8px', boxShadow: 'inset 0 0 0 1px #808080' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D4D0C8', paddingBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: '10.5px', color: '#0A246A' }}>🍽️ F&amp;B OUTLETS BREAKDOWN</span>
                  <span style={{ fontSize: '9.5px', color: '#666' }}>POS Rollover</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#B71C1C' }}>
                    ₹{((Number(rollup.roomService) || 0) + (Number(rollup.restaurant) || 0) + (Number(rollup.takeAway) || 0)).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '10px', color: '#666' }}>Comp: <strong>{rollup.restaurantComplimentary ?? 5}</strong></span>
                </div>
                <div style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }}>
                  Dine-In: ₹{Number(rollup.restaurant || 0).toLocaleString('en-IN')} | Parcel: ₹{Number(rollup.takeAway || 0).toLocaleString('en-IN')} | RS: ₹{Number(rollup.roomService || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Card 3: Financial Rollup & MTD */}
              <div style={{ background: '#FFF', border: '2px outset #FFF', padding: '6px 8px', boxShadow: 'inset 0 0 0 1px #808080' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D4D0C8', paddingBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: '10.5px', color: '#0A246A' }}>💰 DAILY REVENUE &amp; MTD</span>
                  <span style={{ fontSize: '9.5px', color: '#2E7D32', fontWeight: 700 }}>07:30 AM Verified</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0D47A1' }}>₹{Number(rollup.totalRevenueActual || 0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#4A148C' }}>MTD: ₹{Number(rollup.mtdFbRevenueActual || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }}>
                  Corporate BTC: ₹{Number(rollup.totalBtcAmount || 0).toLocaleString('en-IN')} | Date: <strong>{selectedDate}</strong>
                </div>
              </div>
            </div>

            {/* Split Section: Left = Win32 Table Grid | Right = WhatsApp Broadcast */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '8px', minHeight: '340px' }}>
              
              {/* Left Column: Win32 Structured Operational DataGrid */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'linear-gradient(180deg, #ECE9D8 0%, #D4D0C8 100%)', borderBottom: '1px solid #999', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A' }}>
                    📊 Operational Flash Metrics &amp; Audit Overrides (Excel Grid Style)
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#555' }}>Double-click to edit cell values</span>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, maxHeight: '275px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#F0EDE5', borderBottom: '1px solid #808080', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC', fontSize: '10px', color: '#333' }}>Metric Category / Field</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #CCC', width: '100px', fontSize: '10px', color: '#333' }}>Current Value</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '130px', fontSize: '10px', color: '#333' }}>Sync Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Section 1: Room Inventory & Occupancy */}
                      <tr style={{ background: '#E3F2FD', fontWeight: 700, color: '#0A246A', borderBottom: '1px solid #BBDEFB' }}>
                        <td colSpan={3} style={{ padding: '3px 6px', fontSize: '10.5px' }}>1. ROOM INVENTORY &amp; OCCUPANCY YIELD</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Total Rooms Available</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.totalRoomsAvailable} 
                            onChange={e => setRollup(prev => ({ ...prev, totalRoomsAvailable: parseInt(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Hotel Elite Master (22)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Total Rooms Saleable</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.totalRoomsSaleable} 
                            onChange={e => setRollup(prev => ({ ...prev, totalRoomsSaleable: parseInt(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Vacant Ready (5)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>ARR Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.arrActual} 
                            onChange={e => setRollup(prev => ({ ...prev, arrActual: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Average Room Rate (₹1611)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Occupancy (%)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.occupancy} 
                            onChange={e => setRollup(prev => ({ ...prev, occupancy: parseInt(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 700, color: '#1B5E20' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Night Audit Closed (18%)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Management Hold / Maintenance / OOO</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <span style={{ fontSize: '10px', color: '#555' }}>
                            {rollup.mgmHold ?? 0} / {rollup.underMaintenance ?? 0} / {Number(rollup.outOfOrder ?? 0).toFixed(1)}
                          </span>
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Housekeeping Rack Sync</td>
                      </tr>

                      {/* Section 2: Food & Beverage Outlets */}
                      <tr style={{ background: '#FFF3E0', fontWeight: 700, color: '#E65100', borderBottom: '1px solid #FFE0B2' }}>
                        <td colSpan={3} style={{ padding: '3px 6px', fontSize: '10.5px' }}>2. FOOD &amp; BEVERAGE (F&amp;B) OUTLETS BREAKDOWN</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Room Service Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.roomService} 
                            onChange={e => setRollup(prev => ({ ...prev, roomService: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>In-Room Dining KOT</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Restaurant Dine-In Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.restaurant} 
                            onChange={e => setRollup(prev => ({ ...prev, restaurant: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Elite Dine Restaurant POS</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Take Away / Parcel Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.takeAway} 
                            onChange={e => setRollup(prev => ({ ...prev, takeAway: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Parcel / Counter Sale</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Restaurant Complimentary Items</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.restaurantComplimentary} 
                            onChange={e => setRollup(prev => ({ ...prev, restaurantComplimentary: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Management NC / VIP Tea</td>
                      </tr>

                      {/* Section 3: Revenue Aggregation & Ledger */}
                      <tr style={{ background: '#E8F5E9', fontWeight: 700, color: '#1B5E20', borderBottom: '1px solid #C8E6C9' }}>
                        <td colSpan={3} style={{ padding: '3px 6px', fontSize: '10.5px' }}>3. FINANCIAL TOTALS &amp; CUMULATIVE (MTD)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#F1F8E9' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 700 }}>Total Revenue Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.totalRevenueActual} 
                            onChange={e => setRollup(prev => ({ ...prev, totalRevenueActual: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 800, color: '#1B5E20' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#2E7D32', fontWeight: 600 }}>Daily Gross Master (₹33,793)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>MTD F&amp;B Revenue Actual (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.mtdFbRevenueActual} 
                            onChange={e => setRollup(prev => ({ ...prev, mtdFbRevenueActual: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Month-to-Date (₹53,690)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>Total BTC Amount (₹)</td>
                        <td style={{ padding: '2px 4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>
                          <input 
                            type="number" 
                            value={rollup.totalBtcAmount} 
                            onChange={e => setRollup(prev => ({ ...prev, totalBtcAmount: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '1px 3px', textAlign: 'right', fontSize: '11px', border: '1px solid #7F9DB9' }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#666' }}>Bill to Company Ledger</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table Bottom Action Toolbar */}
                <div style={{ background: '#ECE9D8', borderTop: '1px solid #D4D0C8', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={handleAutoCalcFlashTotals}
                      className="ids-btn info"
                      style={{ fontSize: '10.5px', padding: '2px 6px', fontWeight: 600 }}
                      title="Automatically sum up F&B room service, restaurant, and takeaway outlets"
                    >
                      ⚡ Auto-Sum Outlets
                    </button>
                    <button 
                      onClick={handleResetFlashDefaults}
                      className="ids-btn warning modify"
                      style={{ fontSize: '10.5px', padding: '2px 6px' }}
                      title="Reset numbers to authentic benchmark Night Audit figures"
                    >
                      🔄 Reset Benchmark
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = {
                        ...records,
                        [selectedDate]: {
                          ...currentDayData,
                          dailyRollup: rollup
                        }
                      };
                      setRecords(updated);
                      saveStoredShiftRecords(updated);
                      try { playSuccessChime(); } catch (e) {}
                      showToast('✓ Operational metrics saved & synchronized to database!');
                    }}
                    className="ids-btn success save"
                    style={{ fontSize: '10.5px', padding: '2px 10px', fontWeight: 800 }}
                  >
                    💾 Save Metrics
                  </button>
                </div>
              </div>

              {/* Right Column: WhatsApp Official Management Broadcast Card */}
              <div style={{ background: '#0B141A', border: '1px solid #2A3942', borderRadius: '4px', display: 'flex', flexDirection: 'column', boxShadow: '2px 2px 8px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                <div style={{ background: '#1F2C34', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2A3942' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>📱</span>
                    <div>
                      <div style={{ color: '#E9EDEF', fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                        WhatsApp Morning Briefing
                      </div>
                      <div style={{ color: '#8696A0', fontSize: '9px' }}>
                        Hotel Elite Inn — GM &amp; Management Group (07:30 AM)
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#00A884', color: '#111B21', fontWeight: 800, fontSize: '9px', padding: '1px 5px', borderRadius: '3px' }}>
                    LIVE
                  </span>
                </div>

                {/* Monospace Preview Box matching Client's Format */}
                <div style={{ 
                  flex: 1, 
                  padding: '10px 12px', 
                  fontFamily: 'Consolas, Courier New, monospace', 
                  fontSize: '11px', 
                  lineHeight: '1.45', 
                  color: '#25D366', 
                  background: '#111B21',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  userSelect: 'text'
                }}>
                  {formatClientMorningBriefing(rollup)}
                </div>

                {/* WhatsApp Card Footer */}
                <div style={{ background: '#1F2C34', borderTop: '1px solid #2A3942', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8696A0', fontSize: '9.5px' }}>
                    ● 100% formatted for clipboard
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={handleCopyWhatsAppBriefing}
                      className="ids-btn success"
                      style={{ 
                        background: '#00A884', 
                        color: '#FFF', 
                        fontWeight: 800, 
                        fontSize: '10.5px', 
                        padding: '3px 8px',
                        borderColor: '#02735E'
                      }}
                      title="Copy exact formatted morning report text to clipboard"
                    >
                      📋 Copy WhatsApp Briefing
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status / Tip Line */}
            <div style={{ background: '#F5F4EC', padding: '4px 8px', border: '1px solid #D0CDC0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#555' }}>
              <div>
                💡 <strong>Audit Routine:</strong> At 07:30 AM, Shift 3 Night Auditor verifies Room Rack, seals POS day-end, and copies this Briefing directly to hotel WhatsApp group.
              </div>
              <div style={{ fontWeight: 600 }}>
                Status: <span style={{ color: '#2E7D32' }}>● Synchronized with Shift 3 Handover</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History & Synchronization */}
        {activeTab === 'history' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '280px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999' }}>
                  <tr>
                    <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Shift</th>
                    <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Cashier</th>
                    <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Status</th>
                    <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Opening Float</th>
                    <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Cash Coll.</th>
                    <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>UPI / Digital</th>
                    <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Safe Drop</th>
                    <th style={{ padding: '4px', textAlign: 'left' }}>Locked Time</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIFT_DEFINITIONS.map(def => {
                    const s = currentDayData[def.id] || {};
                    const isLocked = s.status === 'LOCKED';

                    return (
                      <tr key={def.id} style={{ borderBottom: '1px solid #EEE', background: isLocked ? '#F9FFF9' : '#FFF' }}>
                        <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{def.name}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE' }}>{s.cashierName || def.cashierName} ({s.cashierCode || def.cashierCode})</td>
                        <td style={{ padding: '4px', textAlign: 'center', fontWeight: 800, color: isLocked ? '#2E7D32' : '#E65100', borderRight: '1px solid #EEE' }}>
                          {isLocked ? '🔒 LOCKED' : '🟢 OPEN'}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>₹{(s.drawerFloat || 2000).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>₹{(s.collections?.cash || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>₹{((s.collections?.upi || 0) + (s.collections?.card || 0)).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '4px', textAlign: 'right', color: '#A00', borderRight: '1px solid #EEE' }}>₹{(s.safeDrop || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '4px 6px', fontSize: '9.5px', color: '#666' }}>{s.lockedAt || 'In Session'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#F5F4EC', padding: '8px 10px', border: '1px solid #D0CDC0', fontSize: '10.5px', lineHeight: 1.5 }}>
              <div>• <strong>Chain of Custody:</strong> Morning Shift float (₹2,000) automatically rolls over to Evening & Night Shift upon lock.</div>
              <div>• <strong>Safe Drop Vault:</strong> Physical cash above the ₹2,000 drawer float is deposited in the Front Office Drop Vault before lock.</div>
              <div>• <strong>Audit Signature:</strong> Locked shifts are stamped with Duty Manager PIN and cannot be retrospectively altered.</div>
            </div>
          </div>
        )}

        {/* Dialog Bottom Footer */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #999', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: '#555' }}>
            A/C Date: <strong>{selectedDate}</strong> | Active: <strong>{shiftData.shiftName}</strong> | Cashier: <strong>{shiftData.cashierName}</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleCopyWhatsAppBriefing}
              className="ids-btn info"
              style={{ minWidth: '90px' }}
            >
              📋 Copy Flash
            </button>
            <button 
              onClick={handlePrintHandoverVoucher}
              className="ids-btn print info"
              style={{ minWidth: '80px' }}
            >
              🖨️ Print Slip
            </button>
            <button 
              onClick={onClose}
              className="ids-btn exit danger"
              style={{ minWidth: '70px', fontWeight: 700 }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* PIN Verification Modal */}
        {pinModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
            <div 
              className="ids-modal-container"
              style={{ width: '280px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.8)' }}
            >
              <div 
                className="ids-modal-titlebar"
                style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>🔒 Sign & Lock Shift</span>
                <button className="ids-win-btn close" onClick={() => setPinModalOpen(false)}>✕</button>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#333' }}>
                  Enter 4-Digit Duty Manager / Cashier PIN to verify Drawer Float and Lock <strong>{shiftData.shiftName}</strong>:
                </div>
                <input 
                  type="password" 
                  maxLength={4}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="PIN (Default: 7650)"
                  autoFocus
                  style={{ padding: '4px 8px', fontSize: '14px', letterSpacing: '4px', textAlign: 'center', border: '1px solid #7F9DB9' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button 
                    onClick={handleExecuteShiftLock} 
                    className="ids-btn success confirm"
                    style={{ fontWeight: 700, minWidth: '60px' }}
                  >
                    Confirm Lock
                  </button>
                  <button 
                    onClick={() => setPinModalOpen(false)} 
                    className="ids-btn danger cancel"
                    style={{ minWidth: '50px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
