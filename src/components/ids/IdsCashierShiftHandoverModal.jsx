import React, { useState, useEffect, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  SHIFT_DEFINITIONS, 
  getStoredShiftRecords, 
  saveStoredShiftRecords, 
  getStoredActiveShiftId, 
  saveStoredActiveShiftId,
  formatClientMorningBriefing 
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
  const [activeTab, setActiveTab] = useState(initialTab); // 'handover' | 'flash-report' | 'history'
  const [toastMessage, setToastMessage] = useState('');
  const [authPin, setAuthPin] = useState('7650');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync tab if changed externally
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
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
          width: isMaximized ? '980px' : '880px',
          maxWidth: isMaximized ? '96vw' : '94vw',
          height: isMaximized ? '620px' : '560px',
          maxHeight: isMaximized ? '92vh' : '88vh',
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
                  className="ids-btn"
                  style={{
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    fontWeight: isSelected ? 800 : 500,
                    background: isSelected ? '#0A246A' : (isLocked ? '#E8F5E9' : '#FFF'),
                    color: isSelected ? '#FFF' : (isLocked ? '#2E7D32' : '#000'),
                    borderColor: isSelected ? '#000' : '#808080',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{isLocked ? '🔒' : '🟢'}</span>
                  <span>{s.name}</span>
                  <span style={{ fontSize: '9px', opacity: 0.85 }}>({s.cashierName.split(' ')[0]})</span>
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
        <div style={{ display: 'flex', gap: '2px', padding: '6px 10px 0 10px', background: '#ECE9D8', borderBottom: '1px solid #999' }}>
          <button
            onClick={() => setActiveTab('handover')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'handover' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'handover' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'handover' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            💵 Shift Handover & Float Count
          </button>
          <button
            onClick={() => setActiveTab('flash-report')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'flash-report' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'flash-report' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'flash-report' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            📊 Daily Operations Flash Report (Client Format)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'history' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'history' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
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
                    className="ids-btn"
                    style={{ minWidth: '70px' }}
                  >
                    Save Draft
                  </button>
                )}
                <button 
                  onClick={handlePrintHandoverVoucher}
                  className="ids-btn"
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
                  className="ids-btn"
                  style={{ minWidth: '120px', fontWeight: 700, background: '#FFF3E0', borderColor: '#E65100', color: '#E65100' }}
                  title="Download today's complete hotel books & shift transactions (.JSON) directly to local PC"
                >
                  📥 Export Daily Archive (.JSON)
                </button>
                {shiftData.status !== 'LOCKED' ? (
                  <button 
                    onClick={handleOpenLockModal}
                    className="ids-btn"
                    style={{ minWidth: '130px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}
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
                    className="ids-btn"
                    style={{ minWidth: '130px', fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
                  >
                    Switch to Next Shift →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Flash Report (Exact Client WhatsApp Format) */}
        {activeTab === 'flash-report' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#B8860B', fontSize: '11.5px' }}>
                  📱 Daily Operations Morning Flash Report (Exact WhatsApp Broadcast)
                </span>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  Generated at 07:30 AM rollover. Click "Copy WhatsApp Briefing" to paste directly into hotel group chats.
                </div>
              </div>
              <button 
                onClick={handleCopyWhatsAppBriefing}
                className="ids-btn"
                style={{ padding: '4px 10px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#2E7D32' }}
              >
                📋 Copy WhatsApp Briefing
              </button>
            </div>

            {/* Display Box matching Notebook Format */}
            <div style={{ background: '#1E293B', color: '#E2E8F0', padding: '14px', borderRadius: '4px', fontFamily: 'Courier New, Courier, monospace', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)' }}>
              {formatClientMorningBriefing(rollup)}
            </div>

            {/* Editable Controls Grid to update metrics */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', borderBottom: '1px solid #D4D0C8', paddingBottom: '3px' }}>
                Operational Metric Overrides (Synchronized with IDS Night Audit & POS):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Available Rooms:</span>
                  <input 
                    type="number" 
                    value={rollup.totalRoomsAvailable} 
                    onChange={e => setRollup(prev => ({ ...prev, totalRoomsAvailable: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Saleable Rooms:</span>
                  <input 
                    type="number" 
                    value={rollup.totalRoomsSaleable} 
                    onChange={e => setRollup(prev => ({ ...prev, totalRoomsSaleable: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>ARR Actual (₹):</span>
                  <input 
                    type="number" 
                    value={rollup.arrActual} 
                    onChange={e => setRollup(prev => ({ ...prev, arrActual: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Occupancy (%):</span>
                  <input 
                    type="number" 
                    value={rollup.occupancy} 
                    onChange={e => setRollup(prev => ({ ...prev, occupancy: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Room Service (₹):</span>
                  <input 
                    type="number" 
                    value={rollup.roomService} 
                    onChange={e => setRollup(prev => ({ ...prev, roomService: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Restaurant Dining (₹):</span>
                  <input 
                    type="number" 
                    value={rollup.restaurant} 
                    onChange={e => setRollup(prev => ({ ...prev, restaurant: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Take Away / Parcel (₹):</span>
                  <input 
                    type="number" 
                    value={rollup.takeAway} 
                    onChange={e => setRollup(prev => ({ ...prev, takeAway: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#666' }}>Total Revenue (₹):</span>
                  <input 
                    type="number" 
                    value={rollup.totalRevenueActual} 
                    onChange={e => setRollup(prev => ({ ...prev, totalRevenueActual: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
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
                  showToast('✓ Flash report updated & synchronized!');
                }}
                className="ids-btn"
                style={{ minWidth: '90px' }}
              >
                Save Metrics
              </button>
              <button 
                onClick={handleCopyWhatsAppBriefing}
                className="ids-btn"
                style={{ minWidth: '110px', fontWeight: 700, color: '#0A246A' }}
              >
                📋 Copy Broadcast
              </button>
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
              className="ids-btn"
              style={{ minWidth: '90px' }}
            >
              📋 Copy Flash
            </button>
            <button 
              onClick={handlePrintHandoverVoucher}
              className="ids-btn"
              style={{ minWidth: '80px' }}
            >
              🖨️ Print Slip
            </button>
            <button 
              onClick={onClose}
              className="ids-btn"
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
                    className="ids-btn"
                    style={{ fontWeight: 700, minWidth: '60px' }}
                  >
                    Confirm Lock
                  </button>
                  <button 
                    onClick={() => setPinModalOpen(false)} 
                    className="ids-btn"
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
