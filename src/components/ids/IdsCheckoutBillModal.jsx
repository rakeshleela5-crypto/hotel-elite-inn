import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { Printer, Search, Scissors, DollarSign, X, Check, FileText, Users } from 'lucide-react';
import { INITIAL_ACCOUNTING_DATE, NEXT_ACCOUNTING_DATE } from '../../data/idsPmsStore';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

/* =========================================================================
   VIDEO 15 & 16: CHECKOUT & SETTLE FRONT OFFICE BILL & BULK CHECK OUT
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT V6.5 & V7.0
   ========================================================================= */

// Expected Departures for Hotel Elite Inn
export const DEFAULT_EXPECTED_DEPARTURES = [
  { roomNo: '102', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'SHARMA', type: 'DLX', company: 'Ashok Leyland Ltd' },
  { roomNo: '105', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'MOHANTY', type: 'EXE', company: 'Linde India Ltd' },
  { roomNo: '108', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'SHARMA', type: 'STD', company: 'Direct FIT' },
  { roomNo: '109', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'MOHANTY', type: 'SUI', company: 'AIIMS Consultant' },
  { roomNo: '201', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'KUMAR', type: 'EXE', company: 'JK Paper Mills Ltd' },
  { roomNo: '203', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'PATEL', type: 'EXE', company: 'Utkal Alumina' },
  { roomNo: '205', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'KUMAR', type: 'EXE', company: 'JK Paper Mills Ltd' },
  { roomNo: '206', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'JENA', type: 'DLX', company: 'Vedanta Ltd' },
  { roomNo: '207', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'DELEGATION', type: 'EXE', company: 'JK Paper Mills Ltd' },
  { roomNo: '301', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'RATH', type: 'STD', company: 'Corporate FIT' },
  { roomNo: '303', time: '12:00', date: INITIAL_ACCOUNTING_DATE, guest: 'MISHRA', type: 'DLX', company: 'Direct FIT' }
];

// Video 16: Corporate Group Rooms (JK Paper Technical Delegation)
export const SHARMA_GROUP_ROOMS = [
  { roomNo: '201', regNo: '613', guest: 'Mr. Anil Kumar', billTo: 'BTC', rate: 2050.00, charges: 0, taxes: 246.00, receipts: 0, netAmount: 2296.00, time: '12:00', date: INITIAL_ACCOUNTING_DATE, isLeader: true, selected: true },
  { roomNo: '205', regNo: '615', guest: 'JK Paper Technical Team', billTo: 'BTC', rate: 2050.00, charges: 0, taxes: 246.00, receipts: 0, netAmount: 2296.00, time: '12:00', date: INITIAL_ACCOUNTING_DATE, selected: true },
  { roomNo: '207', regNo: '617', guest: 'JK Paper Delegation', billTo: 'BTC', rate: 2050.00, charges: 0, taxes: 246.00, receipts: 0, netAmount: 2296.00, time: '12:00', date: INITIAL_ACCOUNTING_DATE, selected: true }
];

// Target Single Room 102 Bill Profile
export const TARGET_ROOM_314_BILL = {
  roomNo: '102',
  regNo: '501',
  resNo: '269',
  guestName: 'MR. RAJESH SHARMA',
  groupName: '',
  folioNo: '1',
  companyCode: 'COM0001',
  companyName: 'Ashok Leyland Ltd',
  billing: '1 / Direct',
  payMode: 'Cash',
  specialIns: '',
  arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
  departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
  rate: 1750.00,
  plan: 0.00,
  charges: 0.00,
  taxes: 210.00,
  receipts: 0.00,
  netAmount: 1960.00,
  billNo: '501'
};

// Target Corporate Delegation Consolidated Bill Profile
export const TARGET_SHARMA_GROUP_BILL = {
  roomNo: '201',
  regNo: '613',
  resNo: '276',
  guestName: 'Mr. Anil Kumar',
  groupName: 'JK Paper Delegation',
  folioNo: '1',
  companyCode: 'COM0003',
  companyName: 'JK Paper Mills Ltd',
  billing: '4 / Room to Company Extras Direct',
  payMode: 'BTC',
  specialIns: '',
  arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
  departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
  rate: 2050.00,
  totalRate: 6150.00,
  plan: 0.00,
  charges: 0.00,
  totalTaxes: 738.00,
  receipts: 0.00,
  netAmount: 6888.00,
  billNo: '502'
};

export default function IdsCheckoutBillModal({
  isOpen,
  onClose,
  initialRoomNo = '102',
  initialGroup = '',
  initialMode = 'checkout', // 'checkout' | 'bulk' | 'settlement'
  onCompleteCheckout,
  onCompleteBulkCheckout,
  checkedOutRooms = [],
  onOpenCrystalReport
}) {
  // Navigation View: 'selector' | 'bill-summary' | 'settlements'
  const [activeScreen, setActiveScreen] = useState(
    initialMode === 'settlement' ? 'settlements' : 'selector'
  );
  
  // Is this a group bulk checkout?
  const [isGroupMode, setIsGroupMode] = useState(initialMode === 'bulk' || initialGroup === 'Sharma Group');
  
  // Selection Filters (Video 15 Frame 010 & Video 16 Frame 018/022)
  const [filterCompany, setFilterCompany] = useState(initialMode === 'bulk' ? 'M/S ALKEM LABS. LTD.' : 'ALL');
  const [filterGroup, setFilterGroup] = useState(initialGroup || (initialMode === 'bulk' ? 'Sharma Group' : 'ALL'));
  const [filterRoomType, setFilterRoomType] = useState('ALL');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterBlock, setFilterBlock] = useState('ALL');
  const [searchRoomInput, setSearchRoomInput] = useState(initialMode === 'bulk' ? '' : (initialRoomNo || '314'));

  // Currently Selected Checkout Room & Bill Data
  const [currentRoom, setCurrentRoom] = useState(initialRoomNo || '314');
  const [billData, setBillData] = useState(
    initialMode === 'bulk' || initialGroup === 'Sharma Group' 
      ? TARGET_SHARMA_GROUP_BILL 
      : TARGET_ROOM_314_BILL
  );

  // Group Multi-room selection table (Video 16 Frame 024)
  const [groupRoomsTable, setGroupRoomsTable] = useState(SHARMA_GROUP_ROOMS);
  const [isConsolidatedMasterLine, setIsConsolidatedMasterLine] = useState(false);

  // Split Bill State (Video 15 Frame 020 & Video 16 Frame 032)
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [isBillSplitted, setIsBillSplitted] = useState(false);
  const [splitItems, setSplitItems] = useState({
    bill1: [
      { id: '1', date: '16/01/22', roomNo: '314', refNo: '', desc: 'Tariff 314', amount: 3500.00, checked: false },
      { id: '2', date: '16/01/22', roomNo: '314', refNo: '', desc: 'Central GST', amount: 210.00, checked: false },
      { id: '3', date: '16/01/22', roomNo: '314', refNo: '', desc: 'State GST', amount: 210.00, checked: false }
    ],
    bill2: [
      { id: '4', date: '17/01/22', roomNo: '314', refNo: '1', desc: 'RMS/GN / FOOD', amount: 765.66, checked: false }
    ],
    bill3: [
      { id: '5', date: '17/01/22', roomNo: '314', refNo: '1', desc: 'Central GST', amount: 19.17, checked: false },
      { id: '6', date: '17/01/22', roomNo: '314', refNo: '1', desc: 'State GST', amount: 19.17, checked: false }
    ]
  });

  // Dialog popups
  const [viewBillOpen, setViewBillOpen] = useState(false);
  const [printCrystalOpen, setPrintCrystalOpen] = useState(false);
  const [crystalPrintSuccess, setCrystalPrintSuccess] = useState(false);
  const [crystalReportType, setCrystalReportType] = useState('DETAILED BILL');
  const [crystalPrinter, setCrystalPrinter] = useState('Microsoft Print to PDF');
  const [billLookupOpen, setBillLookupOpen] = useState(false);
  
  // Video 16 Frame 070: Clear Room# Multi-Room Confirmation Popup
  const [clearRoomModalOpen, setClearRoomModalOpen] = useState(false);
  const [bulkClearedStatus, setBulkClearedStatus] = useState({});

  // Settlements V6.5.008.30 State (Video 15 Frame 035 & Video 16 Frame 055)
  const [settlementBillNo, setSettlementBillNo] = useState(initialMode === 'bulk' ? '502' : '501');
  const [settlementLoaded, setSettlementLoaded] = useState(false);
  const [settlementOptions, setSettlementOptions] = useState({
    Cash: 0,
    CreditCard: 0,
    Companies: 0,
    Staff: 0,
    Cheque: 0,
    BillsOnHold: 0,
    ForeignExchange: 0,
    Complimentary: 0
  });
  const [activePaymentModal, setActivePaymentModal] = useState(null); // 'Cash' | 'CreditCard' | 'Companies'
  
  // Sub-modal states
  const [cashAmountInput, setCashAmountInput] = useState('724.00');
  const [cashTipInput, setCashTipInput] = useState('0.00');
  const [cashRemarksInput, setCashRemarksInput] = useState('');

  const [cardRadio, setCardRadio] = useState('Card1');
  const [cardType, setCardType] = useState('VISA / HDFC');
  const [cardNumber, setCardNumber] = useState('4582 9901 2284 3140');
  const [cardAuth, setCardAuth] = useState('AUTH-782104');
  const [cardAmountInput, setCardAmountInput] = useState(initialMode === 'bulk' ? '33320.00' : '4000.00');
  const [cardTipInput, setCardTipInput] = useState('0.00');
  const [cardRemarksInput, setCardRemarksInput] = useState('Settled via POS Terminal #1');

  const [companyCodeInput, setCompanyCodeInput] = useState(initialMode === 'bulk' ? 'COM0006' : 'COM0015');
  const [companyNameInput, setCompanyNameInput] = useState(initialMode === 'bulk' ? 'M/S. ALKEM LABS. LTD.' : 'JK Paper Mills Ltd');
  const [companyAmountInput, setCompanyAmountInput] = useState(initialMode === 'bulk' ? '33320.00' : '4724.00');

  const [statusMessage, setStatusMessage] = useState('');
  const [isSavingCheckout, setIsSavingCheckout] = useState(false);

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'bulk' || initialGroup === 'Sharma Group') {
        setIsGroupMode(true);
        setFilterGroup('Sharma Group');
        setFilterCompany('M/S ALKEM LABS. LTD.');
        setBillData(TARGET_SHARMA_GROUP_BILL);
        setSettlementBillNo('502');
        setCurrentRoom('406');
        setCardAmountInput('33320.00');
        setCompanyAmountInput('33320.00');
        setActiveScreen('selector');
      } else if (initialMode === 'settlement') {
        setActiveScreen('settlements');
        setSettlementBillNo('501');
        setBillData(TARGET_ROOM_314_BILL);
        setSettlementLoaded(true);
      } else {
        setIsGroupMode(false);
        setActiveScreen(initialRoomNo ? 'bill-summary' : 'selector');
        setSearchRoomInput(initialRoomNo || '314');
        setCurrentRoom(initialRoomNo || '314');
        setBillData(TARGET_ROOM_314_BILL);
      }
      setStatusMessage('');
      setIsSavingCheckout(false);
      setClearRoomModalOpen(false);
    }
  }, [isOpen, initialMode, initialGroup, initialRoomNo]);

  if (!isOpen) return null;

  // Active rooms in selector view
  const isSharmaGroupSelected = filterGroup === 'Sharma Group' || filterCompany.includes('ALKEM');

  const departuresList = DEFAULT_EXPECTED_DEPARTURES.filter(item => {
    if (checkedOutRooms.includes(item.roomNo)) return false;
    if (searchRoomInput && searchRoomInput.trim() !== '') {
      return item.roomNo.includes(searchRoomInput.trim());
    }
    if (filterCompany !== 'ALL' && !item.company.includes(filterCompany)) return false;
    if (filterRoomType !== 'ALL' && item.type !== filterRoomType) return false;
    return true;
  });

  // Calculate bill balances
  const totalSettled = Object.values(settlementOptions).reduce((a, b) => a + Number(b || 0), 0);
  const totalBillNet = billData.netAmount;
  const currentBalance = Math.max(0, totalBillNet - totalSettled);

  // Select a room from console
  const handleSelectRoom = (roomNo) => {
    setCurrentRoom(roomNo);
    const isSharmaRoom = SHARMA_GROUP_ROOMS.some(r => r.roomNo === roomNo);

    if (isSharmaRoom || filterGroup === 'Sharma Group') {
      setIsGroupMode(true);
      setBillData(TARGET_SHARMA_GROUP_BILL);
      setSettlementBillNo('502');
      setCardAmountInput('33320.00');
      setCompanyAmountInput('33320.00');
      // Setup Group split items matching Video 16 Frame 032
      setSplitItems({
        bill1: SHARMA_GROUP_ROOMS.flatMap((r, idx) => [
          { id: `${idx}-1`, date: '16/01/22', roomNo: r.roomNo, refNo: '', desc: `Tariff ${r.roomNo}`, amount: 2975.00, checked: false },
          { id: `${idx}-2`, date: '16/01/22', roomNo: r.roomNo, refNo: '', desc: 'Central GST', amount: 178.50, checked: false },
          { id: `${idx}-3`, date: '16/01/22', roomNo: r.roomNo, refNo: '', desc: 'State GST', amount: 178.50, checked: false }
        ]),
        bill2: [],
        bill3: []
      });
    } else if (roomNo === '314') {
      setIsGroupMode(false);
      setBillData(TARGET_ROOM_314_BILL);
      setSettlementBillNo('501');
      setCardAmountInput('4000.00');
      setCompanyAmountInput('4724.00');
    } else {
      setIsGroupMode(false);
      const found = DEFAULT_EXPECTED_DEPARTURES.find(d => d.roomNo === roomNo);
      setBillData({
        ...TARGET_ROOM_314_BILL,
        roomNo,
        guestName: found?.guest ? `MR. ${found.guest}` : 'Guest',
        rate: found?.type === 'SUI' ? 6500 : found?.type === 'EXE' ? 4500 : 3500,
        charges: 0,
        taxes: 420.00,
        receipts: 0.00,
        netAmount: found?.type === 'SUI' ? 7280 : found?.type === 'EXE' ? 5040 : 3920,
        billNo: '503'
      });
      setSettlementBillNo('503');
    }
    setActiveScreen('bill-summary');
  };

  // Merge split bills
  const handleMergeSplitBills = () => {
    if (splitItems.bill3.length > 0) {
      setSplitItems(prev => ({
        ...prev,
        bill2: [...prev.bill2, ...prev.bill3],
        bill3: []
      }));
      setStatusMessage('Sub-bill 3 merged into Bill 2.');
    } else {
      setStatusMessage('Already merged.');
    }
  };

  const handleConfirmSplit = () => {
    setIsBillSplitted(true);
    setSplitBillOpen(false);
    setStatusMessage('Bill split confirmed into multiple sub-bills.');
  };

  // Toggle selection of group rooms in bill summary
  const handleToggleRoomSelected = (roomNo) => {
    setGroupRoomsTable(prev => prev.map(r => r.roomNo === roomNo ? { ...r, selected: !r.selected } : r));
  };

  // Initiate Settlement Save
  const handleSaveSettlement = () => {
    if (currentBalance > 0.01) {
      alert(`Balance ₹${currentBalance.toFixed(2)} is remaining. Please settle the full amount of ₹${totalBillNet.toFixed(2)}.`);
      return;
    }

    if (isGroupMode) {
      // Video 16 Frame 070: Open Clear Room# dialog before executing bulk checkout!
      setClearRoomModalOpen(true);
    } else {
      executeCheckoutExecution([currentRoom]);
    }
  };

  // Execute checkout & update room master
  const executeCheckoutExecution = (roomNosToCheckout) => {
    setIsSavingCheckout(true);
    setStatusMessage('UPDATING ROOM MASTER...');

    setTimeout(() => {
      if (isGroupMode && onCompleteBulkCheckout) {
        onCompleteBulkCheckout(roomNosToCheckout, {
          billNo: settlementBillNo,
          groupName: 'Sharma Group',
          company: 'M/S. ALKEM LABS. LTD.',
          netAmount: totalBillNet,
          settlementOptions,
          checkoutTime: new Date().toLocaleTimeString()
        });
      } else if (onCompleteCheckout) {
        onCompleteCheckout(currentRoom, {
          billNo: settlementBillNo,
          netAmount: totalBillNet,
          settlementOptions,
          guestName: billData.guestName,
          checkoutTime: new Date().toLocaleTimeString()
        });
      }
      setIsSavingCheckout(false);
      setClearRoomModalOpen(false);
      onClose();
    }, 800);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* =========================================================================
          SCREEN 1: CHECK-OUT V6.5.002.6 SELECTION CONSOLE (Video 15 & 16 Frame 010 & 022)
          ========================================================================= */}
      {activeScreen === 'selector' && (
        <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Check-out V6.5.002.6</span>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Header Filters Strip matching Frame 010 & Video 16 Frame 022 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', background: '#ECE9D8', padding: '4px', borderBottom: '1px solid #CCC', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Company</span>
                <select 
                  className="ids-select" 
                  style={{ width: '130px', background: '#316AC5', color: '#FFF', fontWeight: 700 }} 
                  value={filterCompany} 
                  onChange={(e) => {
                    setFilterCompany(e.target.value);
                    if (e.target.value.includes('ALKEM')) {
                      setFilterGroup('Sharma Group');
                      setIsGroupMode(true);
                    }
                  }}
                >
                  <option value="ALL">ALL</option>
                  <option value="JK Paper Mills Ltd">COM0015 / JK Paper Mills Ltd</option>
                  <option value="M/S ALKEM LABS. LTD.">COM0006 / M/S ALKEM LABS. LTD.</option>
                  <option value="Corporate FIT">COM0005 / Corporate FIT</option>
                  <option value="Mahindra">COM0007 / Mahindra</option>
                </select>
              </div>

              {/* Group filter: Video 16 Frame 020: Sharma Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Group</span>
                <select 
                  className="ids-select" 
                  style={{ width: '105px', background: '#316AC5', color: '#FFF', fontWeight: 700 }} 
                  value={filterGroup} 
                  onChange={(e) => {
                    setFilterGroup(e.target.value);
                    if (e.target.value === 'Sharma Group') {
                      setIsGroupMode(true);
                      setSearchRoomInput('');
                    } else {
                      setIsGroupMode(false);
                    }
                  }}
                >
                  <option value="ALL">ALL</option>
                  <option value="Sharma Group">Sharma Group</option>
                  <option value="Anil Kumar Group">Anil Kumar Group</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Room Type</span>
                <select className="ids-select" style={{ width: '60px', background: '#316AC5', color: '#FFF' }} value={filterRoomType} onChange={(e) => setFilterRoomType(e.target.value)}>
                  <option value="ALL">ALL</option>
                  <option value="DLX">DLX</option>
                  <option value="EXE">EXE</option>
                  <option value="SUI">SUI</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Floor</span>
                <select className="ids-select" style={{ width: '50px', background: '#316AC5', color: '#FFF' }} value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}>
                  <option value="ALL">ALL</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Block</span>
                <select className="ids-select" style={{ width: '50px', background: '#316AC5', color: '#FFF' }} value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
                  <option value="ALL">ALL</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Departure Flight</span>
                <select className="ids-select" style={{ width: '65px', background: '#316AC5', color: '#FFF' }}>
                  <option value=""></option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <span style={{ fontWeight: 700 }}>Room #</span>
                <input 
                  className="ids-input" 
                  style={{ width: '65px', fontWeight: 700, textAlign: 'center' }}
                  value={searchRoomInput}
                  onChange={(e) => setSearchRoomInput(e.target.value)}
                  placeholder="406"
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center' }} 
                  title="Print Departure List"
                  onClick={() => alert('Printing Expected Departures Report...')}
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* Title Centered above tile matrix matching Video 16 Frame 022: "Group Rooms" */}
            <div style={{ textAlign: 'center', fontWeight: 700, color: '#333', margin: '8px 0 4px 0', fontSize: '11px' }}>
              {isSharmaGroupSelected ? 'Group Rooms' : searchRoomInput.trim() ? 'All Rooms' : 'Expected Departures'}
            </div>

            {/* Expected Departures Matrix */}
            <div 
              style={{ 
                minHeight: '380px', 
                maxHeight: '440px', 
                overflowY: 'auto', 
                border: '1px solid #7F9DB9', 
                background: '#F7F6F2', 
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
                gap: '4px',
                alignContent: 'flex-start'
              }}
            >
              {/* If Sharma Group is selected (Video 16 Frame 022): render all 10 orange group tiles */}
              {isSharmaGroupSelected ? (
                SHARMA_GROUP_ROOMS.filter(r => !checkedOutRooms.includes(r.roomNo)).map((card) => (
                  <div
                    key={card.roomNo}
                    onClick={() => handleSelectRoom(card.roomNo)}
                    title={`Click to open Bulk Check-out Bill Summary for Sharma Group (${card.roomNo})`}
                    style={{
                      background: '#F15A24',
                      border: '1px solid #C43B08',
                      color: '#000',
                      padding: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      borderRadius: '1px',
                      boxShadow: '1px 1px 2px rgba(0,0,0,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '52px',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span style={{ fontSize: '11px' }}>{card.roomNo}</span>
                      <span title="Sharma Group Booking">👥</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#111' }}>{card.time}</div>
                    <div style={{ fontSize: '9px', color: '#111' }}>{card.date}</div>
                    <div style={{ fontWeight: 700, fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.isLeader ? 'Sharma' : 'Sharma Group'}
                    </div>
                  </div>
                ))
              ) : (
                departuresList.map((card) => (
                  <div
                    key={card.roomNo}
                    onClick={() => handleSelectRoom(card.roomNo)}
                    title={`Click to open Bill Summary for Room ${card.roomNo} (${card.guest})`}
                    style={{
                      background: '#84B02A',
                      border: '1px solid #557715',
                      color: '#000',
                      padding: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      borderRadius: '1px',
                      boxShadow: '1px 1px 2px rgba(0,0,0,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '52px',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span style={{ fontSize: '11px' }}>{card.roomNo}</span>
                      {card.isGroup && <span title="Group Booking">👥</span>}
                    </div>
                    <div style={{ fontSize: '9px', color: '#111' }}>{card.time}</div>
                    <div style={{ fontSize: '9px', color: '#111' }}>{card.date}</div>
                    <div style={{ fontWeight: 700, fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.guest}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#FFF7CC', fontWeight: 700, color: '#0A246A', fontSize: '11px' }}
                  onClick={() => {
                    setFilterGroup('Sharma Group');
                    setFilterCompany('M/S ALKEM LABS. LTD.');
                    setIsGroupMode(true);
                    setSearchRoomInput('');
                  }}
                >
                  👥 Filter Video 16 Sharma Group (10 Rooms)
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '85px' }} onClick={() => { playReceptionChime(); alert("Cut Off Date: Accounting cutoff is 12:00 Noon."); }}>Cut Off Date</button>
                <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={() => { setSearchRoomInput(''); setFilterGroup('ALL'); setFilterCompany('ALL'); setIsGroupMode(false); }}>Refresh</button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={onClose}>Exit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: BILL SUMMARY DIALOG (Video 15 Frame 013 & Video 16 Frame 024/038)
          ========================================================================= */}
      {activeScreen === 'bill-summary' && (
        <div className="ids-dialog-window" style={{ width: '940px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Summary</span>
            <button className="ids-win-btn close" onClick={() => setActiveScreen('selector')}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Header Form matching Frame 013 & Video 16 Frame 024 */}
            <div style={{ border: '1px solid #7F9DB9', padding: '6px 10px', background: '#FFF', fontSize: '11px', marginBottom: '8px' }}>
              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 60px 80px 50px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>Room#</span>
                <input className="ids-input" readOnly value={billData.roomNo} style={{ background: '#F5F5F5', fontWeight: 700 }} />
                <span style={{ color: '#000', textAlign: 'right' }}>Reg. #</span>
                <input className="ids-input" readOnly value={billData.regNo} style={{ background: '#F5F5F5' }} />
                <span style={{ color: '#000', textAlign: 'right' }}>Guest</span>
                <input className="ids-input" readOnly value={billData.guestName} style={{ background: '#F5F5F5', fontWeight: 700 }} />
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 60px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>Folio #</span>
                <input className="ids-input" readOnly value={billData.folioNo} style={{ background: '#F5F5F5' }} />
                <span style={{ color: '#000', textAlign: 'right' }}>Company</span>
                <input className="ids-input" readOnly value={`${billData.companyCode} / ${billData.companyName}`} style={{ background: '#F5F5F5' }} />
              </div>

              {/* Row 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 220px 24px 70px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>Billing</span>
                <input className="ids-input" readOnly value={billData.billing} style={{ background: '#F5F5F5' }} />
                <button className="ids-btn-classic" style={{ padding: '0', height: '20px', width: '20px', fontWeight: 700 }} onClick={() => { playReceptionChime(); alert(`Billing Details: ${billData.billing}\nPay Mode: ${billData.payMode}`); }}>?</button>
                <span style={{ color: '#000', textAlign: 'right' }}>Pay Mode</span>
                <input className="ids-input" readOnly value={billData.payMode} style={{ background: '#F5F5F5' }} />
              </div>

              {/* Row 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>Special Ins.</span>
                <input className="ids-input" readOnly value={billData.specialIns} style={{ background: '#F5F5F5' }} />
              </div>

              {/* Row 5: Arrival / Departure / Rate / Plan */}
              <div style={{ display: 'grid', gridTemplateColumns: '50px 120px 65px 120px 45px 85px 45px 75px', gap: '6px', alignItems: 'center' }}>
                <span>Arrival</span>
                <input className="ids-input" readOnly value={billData.arrival} style={{ background: '#F5F5F5', fontSize: '10px' }} />
                <span style={{ textAlign: 'right' }}>Departure</span>
                <input className="ids-input" readOnly value={billData.departure} style={{ background: '#F5F5F5', fontSize: '10px' }} />
                <span style={{ textAlign: 'right' }}>Rate</span>
                <input className="ids-input" readOnly value={billData.rate.toFixed(2)} style={{ background: '#F5F5F5', textAlign: 'right' }} />
                <span style={{ textAlign: 'right' }}>Plan</span>
                <input className="ids-input" readOnly value={billData.plan.toFixed(2)} style={{ background: '#F5F5F5', textAlign: 'right' }} />
              </div>
            </div>

            {/* Folio Grid matching Video 15 Frame 013 OR Video 16 Frame 024 (10 Rooms) */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '170px', overflowY: 'auto' }}>
              <table className="ids-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', color: '#000' }}>
                    <th style={{ width: '45px', borderRight: '1px solid #BBB' }}>Select</th>
                    <th style={{ width: '45px', borderRight: '1px solid #BBB' }}>Srl #</th>
                    <th style={{ width: '55px', borderRight: '1px solid #BBB' }}>Room#</th>
                    <th style={{ borderRight: '1px solid #BBB' }}>Guest Name</th>
                    <th style={{ width: '70px', borderRight: '1px solid #BBB' }}>Billing</th>
                    <th style={{ width: '70px', borderRight: '1px solid #BBB' }}>Bill To</th>
                    <th style={{ width: '70px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Rate</th>
                    <th style={{ width: '70px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Charges</th>
                    <th style={{ width: '65px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Taxes</th>
                    <th style={{ width: '65px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Receipts</th>
                    <th style={{ width: '85px', textAlign: 'right' }}>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isGroupMode ? (
                    isConsolidatedMasterLine ? (
                      // Video 16 Frame 038: Consolidated Master Line
                      <tr style={{ background: '#E6EFF9', cursor: 'pointer' }} onDoubleClick={() => setViewBillOpen(true)}>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>Yes</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>1</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>406</td>
                        <td style={{ borderRight: '1px solid #CCC' }}>Mr. Sharma Rohir</td>
                        <td style={{ borderRight: '1px solid #CCC' }}></td>
                        <td style={{ borderRight: '1px solid #CCC' }}>DIRECT</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>29,750.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>3,570.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>33,320.00</td>
                      </tr>
                    ) : (
                      // Video 16 Frame 024: 10 Individual Room lines
                      groupRoomsTable.map((row, idx) => (
                        <tr 
                          key={row.roomNo} 
                          style={{ background: row.selected ? '#E6EFF9' : '#FFF', cursor: 'pointer' }}
                          onClick={() => handleToggleRoomSelected(row.roomNo)}
                        >
                          <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>
                            <input type="checkbox" checked={row.selected} onChange={() => handleToggleRoomSelected(row.roomNo)} />
                          </td>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>{idx + 1}</td>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>{row.roomNo}</td>
                          <td style={{ borderRight: '1px solid #CCC' }}>{row.guest}</td>
                          <td style={{ borderRight: '1px solid #CCC' }}></td>
                          <td style={{ borderRight: '1px solid #CCC' }}>{row.billTo}</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{row.rate.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{row.charges.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{row.taxes.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>{row.netAmount.toFixed(2)}</td>
                        </tr>
                      ))
                    )
                  ) : !isBillSplitted ? (
                    // Video 15 Single Unsplit Bill (Frame 013)
                    <tr style={{ background: '#E6EFF9', cursor: 'pointer' }} onDoubleClick={() => setViewBillOpen(true)}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>Yes</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>1</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>{billData.roomNo}</td>
                      <td style={{ borderRight: '1px solid #CCC' }}>{billData.guestName}</td>
                      <td style={{ borderRight: '1px solid #CCC' }}></td>
                      <td style={{ borderRight: '1px solid #CCC' }}>DIRECT</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{billData.rate.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{billData.charges.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>{billData.taxes.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                      <td 
                        style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => setViewBillOpen(true)}
                        title="Click Net Amount Column to View Bill Details"
                      >
                        {billData.netAmount.toFixed(2)}
                      </td>
                    </tr>
                  ) : (
                    // Video 15 Splitted Bill (Frame 024: 2 Sub-bills)
                    <>
                      <tr style={{ background: '#E6EFF9', cursor: 'pointer' }} onDoubleClick={() => setViewBillOpen(true)}>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>Yes</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>1</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>{billData.roomNo}</td>
                        <td style={{ borderRight: '1px solid #CCC' }}>{billData.guestName}</td>
                        <td style={{ borderRight: '1px solid #CCC' }}></td>
                        <td style={{ borderRight: '1px solid #CCC' }}>DIRECT</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>3,500.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>420.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>3,920.00</td>
                      </tr>
                      <tr style={{ background: '#FFF', cursor: 'pointer' }} onDoubleClick={() => setViewBillOpen(true)}>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>Yes</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>2</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>{billData.roomNo}</td>
                        <td style={{ borderRight: '1px solid #CCC' }}>{billData.guestName}</td>
                        <td style={{ borderRight: '1px solid #CCC' }}></td>
                        <td style={{ borderRight: '1px solid #CCC' }}>DIRECT</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>765.66</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>38.34</td>
                        <td style={{ textAlign: 'right', borderRight: '1px solid #CCC' }}>0.00</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>804.00</td>
                      </tr>
                    </>
                  )}
                  {/* Blank filler rows */}
                  {!isGroupMode && [...Array(isBillSplitted ? 3 : 4)].map((_, idx) => (
                    <tr key={`fill-${idx}`} style={{ height: '22px' }}>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Strip & Red Helper Text matching Frame 013 & Video 16 Frame 024 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 4px 0', fontSize: '11px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#D00', fontStyle: 'italic', fontSize: '10px' }}>
                  Click Net Amount Column to View Bill Details.
                </span>
                {isGroupMode && (
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '1px 6px', background: '#E6EFF9', fontWeight: 600 }}
                    onClick={() => setIsConsolidatedMasterLine(!isConsolidatedMasterLine)}
                  >
                    {isConsolidatedMasterLine ? 'Show 10 Room-Wise Lines' : 'Consolidate into 1 Master Line (Frame 038)'}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700 }}>Grand Total</span>
                <input 
                  className="ids-input" 
                  readOnly 
                  value={billData.netAmount.toFixed(2)} 
                  style={{ width: '90px', textAlign: 'right', fontWeight: 700, background: '#FFF' }} 
                />
              </div>
            </div>

            {/* Status Strip matching Frame 029 & Video 16 Frame 038 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginBottom: '8px' }}>
              <span style={{ color: '#555' }}>Status</span>
              <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', padding: '2px 6px', height: '20px', fontSize: '10px', color: '#0A246A', fontWeight: 600 }}>
                {statusMessage || (isGroupMode ? 'Sharma Group (10 Rooms) ready for consolidated settlement...' : 'Ready for settlement or split...')}
              </div>
            </div>

            {/* Bottom Buttons matching Frame 013 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '65px' }}
                onClick={() => {
                  playReceptionChime();
                  alert("GST Folio Balance Breakdown:\n• CGST (6%): ₹" + ((billData?.taxAmount || 0) / 2).toFixed(2) + "\n• SGST (6%): ₹" + ((billData?.taxAmount || 0) / 2).toFixed(2) + "\n• Net Taxable: ₹" + ((billData?.totalCharges || 0) - (billData?.taxAmount || 0)).toFixed(2));
                }}
              >GST FB</button>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setViewBillOpen(true)}>Details</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px', fontWeight: 700 }}
                  onClick={() => {
                    const ottTable = isGroupMode ? '595' : '589';
                    const targetBill = isGroupMode ? '502' : '501';
                    setStatusMessage(`Updating OTT Table ${ottTable}`);
                    setTimeout(() => {
                      setStatusMessage(`Printing Bill # ${targetBill}`);
                      setPrintCrystalOpen(true);
                    }, 400);
                  }}
                >
                  Print Bill...
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={() => alert('Generating Provisional Bill copy...')}>Prov. Bill...</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px', fontWeight: 700, background: '#FFF7CC', color: '#0A246A' }}
                  onClick={() => setSplitBillOpen(true)}
                  title="Bill Split (Video 15 & 16)"
                >
                  ✂️ Split Bill...
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px', fontWeight: 700, background: '#C8E6C9', color: '#004D40' }}
                  onClick={() => {
                    setSettlementBillNo(isGroupMode ? '502' : '501');
                    setSettlementLoaded(true);
                    setActiveScreen('settlements');
                  }}
                  title="Open Settlement V6.5.008.30 (Video 15 Frame 035 & Video 16 Frame 055)"
                >
                  💳 Bill Settle
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => setViewBillOpen(true)}>View Bill...</button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setActiveScreen('selector')}>Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: SETTLEMENTS V6.5.008.30 DIALOG (Video 15 & Video 16 Frame 055)
          ========================================================================= */}
      {activeScreen === 'settlements' && (
        <div className="ids-dialog-window" style={{ width: '820px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Settlements V6.5.008.30</span>
            <button className="ids-win-btn close" onClick={() => setActiveScreen('bill-summary')}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Top Form Section matching Frame 035 & Video 16 Frame 055 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', marginBottom: '8px' }}>
              {/* Left Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '70px' }}>Bill #</span>
                  <input 
                    className="ids-input" 
                    style={{ width: '80px', fontWeight: 700 }}
                    value={settlementBillNo}
                    onChange={(e) => setSettlementBillNo(e.target.value)}
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '22px', height: '21px', padding: 0, fontWeight: 700 }}
                    onClick={() => setBillLookupOpen(true)}
                    title="Lookup Pending Bills (Frame 036)"
                  >
                    ?
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '24px', height: '21px', padding: 0 }}
                    onClick={() => setPrintCrystalOpen(true)}
                    title="Print Bill"
                  >
                    🖨️
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '24px', height: '21px', padding: 0, color: 'green', fontWeight: 700 }}
                    title="Direct Cash Settle"
                    onClick={() => {
                      setSettlementOptions({
                        ...settlementOptions,
                        Cash: currentBalance > 0 ? currentBalance : totalBillNet
                      });
                    }}
                  >
                    💲
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '70px' }}>Room#</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.roomNo : ''} style={{ width: '130px', background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '70px' }}>Folio #</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.folioNo : ''} style={{ width: '130px', background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '70px' }}>Reg. #</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.regNo : ''} style={{ width: '130px', background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '70px' }}>Pay Mode</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.payMode : ''} style={{ width: '130px', background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '70px' }}>Company...</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.companyName : ''} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '75px' }}>Guest Name</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.guestName : ''} style={{ flex: 1, background: '#F5F5F5', fontWeight: 700 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '75px' }}>Net Amount</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? billData.netAmount.toFixed(2) : ''} style={{ width: '120px', background: '#F5F5F5', textAlign: 'right', fontWeight: 700 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '75px' }}>Balance</span>
                  <input 
                    className="ids-input" 
                    readOnly 
                    value={settlementLoaded ? currentBalance.toFixed(2) : ''} 
                    style={{ 
                      width: '120px', 
                      background: currentBalance === 0 ? '#E8F5E9' : '#FFF', 
                      color: currentBalance === 0 ? '#2E7D32' : '#C62828',
                      fontWeight: 700, 
                      textAlign: 'right' 
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '75px' }}>Tip Amount</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? '0.00' : ''} style={{ width: '120px', background: '#F5F5F5', textAlign: 'right' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '75px' }}>Group</span>
                  <input className="ids-input" readOnly value={settlementLoaded ? (billData.groupName || 'Direct') : ''} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '75px' }}>User</span>
                  <input className="ids-input" readOnly value="MANAGER" style={{ width: '100px', background: '#F5F5F5', fontWeight: 600 }} />
                </div>
              </div>
            </div>

            {/* Fieldset: Settlement Options (Video 15 & Video 16 Frame 055) */}
            <fieldset style={{ border: '1px solid #7F9DB9', padding: '6px 8px', margin: '4px 0 8px 0', background: '#FFF' }}>
              <legend style={{ fontSize: '11px', fontWeight: 700, color: '#000', padding: '0 4px' }}>Settlement Options</legend>
              <div style={{ height: '170px', overflowY: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', color: '#000' }}>
                      <th style={{ width: '140px', borderRight: '1px solid #BBB' }}>Receipt Type</th>
                      <th style={{ width: '120px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Amount</th>
                      <th style={{ width: '100px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Paid outs</th>
                      <th style={{ textAlign: 'right' }}>Amt. Diff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'Cash', label: 'Cash', hasModal: true },
                      { key: 'CreditCard', label: 'Credit Card', hasModal: true },
                      { key: 'Companies', label: 'Companies', hasModal: true },
                      { key: 'Staff', label: 'Staff' },
                      { key: 'Cheque', label: 'Cheque' },
                      { key: 'BillsOnHold', label: 'Bills On Hold' },
                      { key: 'ForeignExchange', label: 'Foreign Exchange' },
                      { key: 'Complimentary', label: 'Complimentary' }
                    ].map((row) => {
                      const amount = settlementOptions[row.key];
                      const isFilled = amount > 0;
                      return (
                        <tr 
                          key={row.key}
                          onClick={() => {
                            if (row.hasModal) setActivePaymentModal(row.key);
                          }}
                          style={{ 
                            background: isFilled ? '#E8F5E9' : '#FFF', 
                            cursor: row.hasModal ? 'pointer' : 'default',
                            fontWeight: isFilled ? 700 : 400
                          }}
                          title={row.hasModal ? `Click to enter ${row.label} payment amount` : ''}
                        >
                          <td style={{ borderRight: '1px solid #CCC', padding: '3px 6px' }}>
                            {row.label} {row.hasModal && <span style={{ fontSize: '9px', color: '#0A246A' }}>✎</span>}
                          </td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC', padding: '3px 6px', color: isFilled ? '#2E7D32' : '#000' }}>
                            {isFilled ? amount.toFixed(2) : ''}
                          </td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #CCC', padding: '3px 6px' }}></td>
                          <td style={{ textAlign: 'right', padding: '3px 6px' }}></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </fieldset>

            {/* Quick Presets matching Video 15 Frame 060 & Video 16 Frame 058 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '11px', background: '#FFF7CC', padding: '4px 8px', border: '1px solid #DDD' }}>
              <span style={{ fontWeight: 700, color: '#856404' }}>Quick Settlement Presets:</span>
              {isGroupMode ? (
                <>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700, background: '#D1E7DD', color: '#0F5132' }}
                    onClick={() => {
                      setSettlementOptions({
                        Cash: 0,
                        CreditCard: 33320.00,
                        Companies: 0,
                        Staff: 0,
                        Cheque: 0,
                        BillsOnHold: 0,
                        ForeignExchange: 0,
                        Complimentary: 0
                      });
                      setStatusMessage('Applied settlement: Credit Card VISA ₹33,320.00');
                    }}
                  >
                    ★ Fast-Fill Card: VISA ₹33,320.00
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                    onClick={() => {
                      setSettlementOptions({
                        Cash: 0,
                        CreditCard: 0,
                        Companies: 33320.00,
                        Staff: 0,
                        Cheque: 0,
                        BillsOnHold: 0,
                        ForeignExchange: 0,
                        Complimentary: 0
                      });
                      setStatusMessage('Applied: Direct Company BTC ₹33,320.00 (M/S. ALKEM LABS. LTD.)');
                    }}
                  >
                    Company BTC ₹33,320.00
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700 }}
                    onClick={() => {
                      setSettlementOptions({
                        Cash: 724.00,
                        CreditCard: 4000.00,
                        Companies: 0,
                        Staff: 0,
                        Cheque: 0,
                        BillsOnHold: 0,
                        ForeignExchange: 0,
                        Complimentary: 0
                      });
                      setStatusMessage('Applied split settlement: Cash ₹724.00 + Credit Card ₹4,000.00');
                    }}
                  >
                    ★ Split Settle: Cash ₹724 + Card ₹4,000
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                    onClick={() => {
                      setSettlementOptions({
                        Cash: 4724.00,
                        CreditCard: 0,
                        Companies: 0,
                        Staff: 0,
                        Cheque: 0,
                        BillsOnHold: 0,
                        ForeignExchange: 0,
                        Complimentary: 0
                      });
                      setStatusMessage('Applied: Full Cash ₹4,724.00');
                    }}
                  >
                    Full Cash ₹4,724.00
                  </button>
                </>
              )}
            </div>

            {/* Bottom Status strip */}
            <div style={{ height: '22px', border: '1px solid #7F9DB9', background: '#FFF', padding: '2px 8px', fontSize: '11px', color: '#0A246A', fontWeight: 700, marginBottom: '8px' }}>
              {statusMessage || (isSavingCheckout ? 'UPDATING ROOM MASTER...' : 'Select receipt type to enter settlement')}
            </div>

            {/* Bottom Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '70px', fontWeight: 700, background: currentBalance === 0 ? '#316AC5' : '#ECE9D8', color: currentBalance === 0 ? '#FFF' : '#333' }}
                onClick={handleSaveSettlement}
                disabled={isSavingCheckout}
              >
                <u>S</u>ave
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '65px' }}
                onClick={() => {
                  setSettlementOptions({
                    Cash: 0,
                    CreditCard: 0,
                    Companies: 0,
                    Staff: 0,
                    Cheque: 0,
                    BillsOnHold: 0,
                    ForeignExchange: 0,
                    Complimentary: 0
                  });
                  setStatusMessage('Cleared all settlement entries.');
                }}
              >
                Clear
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setActiveScreen('bill-summary')}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          POPUP: CLEAR ROOM# MULTI-ROOM CONFIRMATION POPUP (Video 16 Frame 070)
          ========================================================================= */}
      {clearRoomModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div className="ids-dialog-window" style={{ width: '480px', maxWidth: '95vw', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Clear Room#</span>
              <button className="ids-win-btn close" onClick={() => setClearRoomModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', fontSize: '11px' }}>
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', maxHeight: '230px', overflowY: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', color: '#000' }}>
                      <th style={{ width: '60px', borderRight: '1px solid #BBB' }}>Room#</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Folio #</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Reg. #</th>
                      <th style={{ borderRight: '1px solid #BBB' }}>Guest Name</th>
                      <th style={{ width: '45px', textAlign: 'center' }}>Clear</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Rows matching Video 16 Frame 070 */}
                    {SHARMA_GROUP_ROOMS.map((r) => (
                      <tr key={r.roomNo} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC', fontWeight: 700 }}>{r.roomNo}</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>1</td>
                        <td style={{ textAlign: 'center', borderRight: '1px solid #CCC' }}>{r.regNo}</td>
                        <td style={{ borderRight: '1px solid #CCC' }}>{r.guest}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#2E7D32' }}>Yes</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Button: [ Ok ] matching Frame 070 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => {
                    executeCheckoutExecution(SHARMA_GROUP_ROOMS.map(r => r.roomNo));
                  }}
                >
                  <u>O</u>k
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setClearRoomModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 1: BILL SPLIT DIALOG (Video 15 Frame 020 & Video 16 Frame 032)
          ========================================================================= */}
      {splitBillOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '580px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Split</span>
              <button className="ids-win-btn close" onClick={() => setSplitBillOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', maxHeight: '520px', overflowY: 'auto' }}>
              {/* Bill 1 Box */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', marginBottom: '8px' }}>
                <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '11px' }}>
                  <span>Bill —&gt; 1 {isGroupMode ? '(Sharma Group)' : `(${billData.roomNo})`}</span>
                  <span>
                    {splitItems.bill1.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F5F5F5' }}>
                        <th style={{ width: '25px' }}>#</th>
                        <th style={{ width: '60px' }}>Date</th>
                        <th style={{ width: '50px' }}>Room #</th>
                        <th style={{ width: '45px' }}>Ref #</th>
                        <th>Description</th>
                        <th style={{ width: '25px', textAlign: 'center' }}>✂️</th>
                        <th style={{ width: '70px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splitItems.bill1.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td>{item.date}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.roomNo}</td>
                          <td>{item.refNo}</td>
                          <td>{item.desc}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={item.checked} onChange={() => {}} />
                          </td>
                          <td style={{ textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons matching Frame 020 & Video 16 Frame 032 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#FFF7CC' }}
                  onClick={handleMergeSplitBills}
                >
                  Merge
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '95px' }} onClick={() => alert('Revenue split active')}>
                  Revenue Split
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => alert('Created new sub-bill')}>
                  New Bill
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={handleConfirmSplit}
                >
                  Confirm
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setSplitBillOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 2: VIEW BILL LINE-ITEM DETAIL DIALOG (Video 15 Frame 022)
          ========================================================================= */}
      {viewBillOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '740px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>View Bill</span>
              <button className="ids-win-btn close" onClick={() => setViewBillOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '240px', overflowY: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', color: '#000' }}>
                      <th style={{ width: '35px', borderRight: '1px solid #BBB' }}>Sl. #</th>
                      <th style={{ width: '115px', borderRight: '1px solid #BBB' }}>Date</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Resv#</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Room#</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Reg#</th>
                      <th style={{ width: '55px', borderRight: '1px solid #BBB' }}>RevCod</th>
                      <th style={{ width: '55px', borderRight: '1px solid #BBB' }}>Bill #</th>
                      <th style={{ borderRight: '1px solid #BBB' }}>Particulars</th>
                      <th style={{ width: '75px', textAlign: 'right', borderRight: '1px solid #BBB' }}>Amount</th>
                      <th style={{ width: '45px', textAlign: 'right' }}>$</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isGroupMode ? (
                      SHARMA_GROUP_ROOMS.flatMap((r, i) => [
                        <tr key={`t-${r.roomNo}`} style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>{i * 3 + 1}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 11:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>276</td>
                          <td style={{ borderRight: '1px solid #EEE', fontWeight: 600 }}>{r.roomNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{r.regNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>TRF</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* Tariff {r.roomNo}</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>2,050.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>,
                        <tr key={`cg-${r.roomNo}`} style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>{i * 3 + 2}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 11:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>276</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{r.roomNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{r.regNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>CGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* Central GST</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>123.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>,
                        <tr key={`sg-${r.roomNo}`} style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>{i * 3 + 3}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 11:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>276</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{r.roomNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{r.regNo}</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>SGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* State GST</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>123.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                      ])
                    ) : (
                      <>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>1</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 18:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>TRF</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* Tariff 102</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>1,750.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>2</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 18:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>CGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* Central GST</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>105.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>3</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 18:56</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>SGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}></td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* State GST</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>105.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>4</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 14:10</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>POS</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* RMS/GN / FOOD</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>450.00</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>5</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 14:10</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>CGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* Central GST (F&amp;B)</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>11.25</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                        <tr style={{ background: '#FFF' }}>
                          <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>6</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>{INITIAL_ACCOUNTING_DATE} 14:10</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>269</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>102</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>501</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>SGT</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                          <td style={{ borderRight: '1px solid #EEE' }}>* State GST (F&amp;B)</td>
                          <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>11.25</td>
                          <td style={{ textAlign: 'right' }}>0.00</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', margin: '8px 0', border: '1px solid #CCC', padding: '4px', background: '#FFF' }}>
                Note : Double click on POS Outlet Bill Details, to View Details for F&amp;B transactions..<br />
                Press F2 to Rename Revenue Description
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '110px' }}
                  onClick={() => {
                    playReceptionChime();
                    alert("Reprinting POS Outlet Bill voucher for Room " + (billData?.roomNo || '101') + "...");
                  }}
                >Reprint POS Bill</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '85px' }}
                  onClick={() => {
                    playReceptionChime();
                    alert("IDS Calculator launched.\nCurrent Folio Balance: ₹" + (billData?.balance || 0).toFixed(2));
                  }}
                >Calculator</button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setViewBillOpen(false)}>Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 3: FO BILL PRINT CRYSTAL DIALOG & PREVIEW (Video 15 & 16 Frame 042)
          ========================================================================= */}
      {printCrystalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '420px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>FO Bill Print Crystal</span>
              <button className="ids-win-btn close" onClick={() => { setPrintCrystalOpen(false); setCrystalPrintSuccess(false); }}>✕</button>
            </div>

            <div style={{ padding: '12px 16px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '80px' }}>Description</span>
                <select 
                  className="ids-select" 
                  style={{ flex: 1, background: '#316AC5', color: '#FFF', fontWeight: 700 }}
                  value={crystalReportType}
                  onChange={(e) => setCrystalReportType(e.target.value)}
                >
                  <option value="DETAILED BILL">DETAILED BILL</option>
                  <option value="SUMMARY BILL">SUMMARY BILL</option>
                  <option value="TAX INVOICE (RULE 46)">TAX INVOICE (RULE 46)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: '80px' }}>Printer</span>
                <select 
                  className="ids-select" 
                  style={{ flex: 1 }}
                  value={crystalPrinter}
                  onChange={(e) => setCrystalPrinter(e.target.value)}
                >
                  <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                  <option value="EPSON POS Receipt Printer">EPSON POS Receipt Printer</option>
                  <option value="HP LaserJet Pro M404">HP LaserJet Pro M404</option>
                </select>
              </div>

              {crystalPrintSuccess && (
                <div style={{ background: '#E8F5E9', border: '1px solid #81C784', padding: '8px', marginBottom: '12px', fontSize: '11px', color: '#2E7D32', borderRadius: '2px' }}>
                  ✓ <b>Bill # {settlementBillNo}</b> sent to {crystalPrinter}. Crystal Report Detailed Bill rendered successfully.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => {
                    setCrystalPrintSuccess(true);
                    setStatusMessage(`Bill # ${settlementBillNo} rendered in Crystal Reports 8.5/9.0.`);
                    if (onOpenCrystalReport) {
                      onOpenCrystalReport('rule46-bill', {
                        billNo: settlementBillNo,
                        billDate: INITIAL_ACCOUNTING_DATE,
                        roomNo: isGroupMode ? '201 (JK Paper Delegation)' : currentRoom,
                        guestName: isGroupMode ? 'JK PAPER TECHNICAL DELEGATION' : billData.guestName,
                        companyName: isGroupMode ? 'JK Paper Mills Ltd' : 'Ashok Leyland Ltd',
                        gstin: isGroupMode ? '21AAACA1028L1ZV' : '',
                        roomType: isGroupMode ? 'EXE' : (billData.roomType || 'DLX'),
                        ratePlan: 'CP',
                        roomTariff: isGroupMode ? 6150.00 : (billData.rate || 1750.00),
                        cgst: isGroupMode ? 369.00 : 105.00,
                        sgst: isGroupMode ? 369.00 : 105.00,
                        grandTotal: totalBillNet,
                        payMode: Object.keys(settlementOptions).filter(k => settlementOptions[k] > 0).join(', ') || 'Cash'
                      });
                      setPrintCrystalOpen(false);
                    } else {
                      setTimeout(() => {
                        setPrintCrystalOpen(false);
                        setCrystalPrintSuccess(false);
                      }, 1200);
                    }
                  }}
                >
                  Print
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => { setPrintCrystalOpen(false); setCrystalPrintSuccess(false); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 4: BILL # LOOKUP DIALOG (Video 15 Frame 036 & Video 16 Frame 055)
          ========================================================================= */}
      {billLookupOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '580px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Settlements</span>
              <button className="ids-win-btn close" onClick={() => setBillLookupOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '140px', overflowY: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', color: '#000' }}>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Bill #</th>
                      <th style={{ width: '80px', borderRight: '1px solid #BBB' }}>Bill Date</th>
                      <th style={{ width: '60px', borderRight: '1px solid #BBB' }}>Status</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Room#</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Folio #</th>
                      <th style={{ width: '50px', borderRight: '1px solid #BBB' }}>Reg. #</th>
                      <th style={{ textAlign: 'right' }}>Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Bill 502 (JK Paper Delegation) */}
                    <tr 
                      style={{ background: settlementBillNo === '502' ? '#316AC5' : '#FFF', color: settlementBillNo === '502' ? '#FFF' : '#000', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => {
                        setSettlementBillNo('502');
                        setIsGroupMode(true);
                        setBillData(TARGET_SHARMA_GROUP_BILL);
                        setCardAmountInput('6888.00');
                        setCompanyAmountInput('6888.00');
                        setSettlementLoaded(true);
                        setBillLookupOpen(false);
                      }}
                    >
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>502</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>{INITIAL_ACCOUNTING_DATE}</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>PENDING</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>201</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>1</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>613</td>
                      <td style={{ textAlign: 'right' }}>6,888.00</td>
                    </tr>
                    {/* Bill 501 (Room 102) */}
                    <tr 
                      style={{ background: settlementBillNo === '501' ? '#316AC5' : '#FFF', color: settlementBillNo === '501' ? '#FFF' : '#000', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => {
                        setSettlementBillNo('501');
                        setIsGroupMode(false);
                        setBillData(TARGET_ROOM_314_BILL);
                        setCardAmountInput('1960.00');
                        setCompanyAmountInput('1960.00');
                        setSettlementLoaded(true);
                        setBillLookupOpen(false);
                      }}
                    >
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>501</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>{INITIAL_ACCOUNTING_DATE}</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>PENDING</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>102</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>1</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>501</td>
                      <td style={{ textAlign: 'right' }}>1,960.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    setSettlementLoaded(true);
                    setBillLookupOpen(false);
                  }}
                >
                  <u>S</u>elect
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setBillLookupOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 5: CASH SETTLEMENT DIALOG (Video 15 Frame 058)
          ========================================================================= */}
      {activePaymentModal === 'Cash' && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '380px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Cash Settlement</span>
              <button className="ids-win-btn close" onClick={() => setActivePaymentModal(null)}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '80px' }}>Amount</span>
                <input 
                  className="ids-input" 
                  style={{ width: '120px', fontWeight: 700, textAlign: 'right' }}
                  value={cashAmountInput}
                  onChange={(e) => setCashAmountInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '80px' }}>Tip Amount</span>
                <input 
                  className="ids-input" 
                  style={{ width: '120px', textAlign: 'right' }}
                  value={cashTipInput}
                  onChange={(e) => setCashTipInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ width: '80px' }}>Remarks</span>
                <input 
                  className="ids-input" 
                  style={{ flex: 1 }}
                  value={cashRemarksInput}
                  onChange={(e) => setCashRemarksInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    const amt = parseFloat(cashAmountInput) || 0;
                    setSettlementOptions(prev => ({ ...prev, Cash: amt }));
                    setActivePaymentModal(null);
                  }}
                >
                  Confirm
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '65px' }}
                  onClick={() => setCashAmountInput('0.00')}
                >
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setActivePaymentModal(null)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 6: CREDIT CARD SETTLEMENT DIALOG (Video 15 & 16 Frame 058)
          ========================================================================= */}
      {activePaymentModal === 'CreditCard' && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '420px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Credit Card</span>
              <button className="ids-win-btn close" onClick={() => setActivePaymentModal(null)}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px' }}>
              {/* Radio options: Card1..Card5 */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', borderBottom: '1px solid #CCC', paddingBottom: '4px' }}>
                {['Card1', 'Card2', 'Card3', 'Card4', 'Card5'].map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                    <input type="radio" name="cc-slot" checked={cardRadio === c} onChange={() => setCardRadio(c)} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '100px' }}>Credit Card Type</span>
                <input className="ids-input" style={{ width: '160px' }} value={cardType} onChange={(e) => setCardType(e.target.value)} />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '20px', height: '20px', padding: 0 }}
                  onClick={() => {
                    playReceptionChime();
                    const ct = prompt("Select Credit Card Type (VISA, MASTERCARD, AMEX, RUPAY):", cardType || "VISA");
                    if (ct) setCardType(ct.toUpperCase());
                  }}
                >?</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '100px' }}>Credit Card #</span>
                <input className="ids-input" style={{ flex: 1 }} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '100px' }}>Authorization #</span>
                <input className="ids-input" style={{ flex: 1 }} value={cardAuth} onChange={(e) => setCardAuth(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '100px' }}>Amount</span>
                <input 
                  className="ids-input" 
                  style={{ width: '120px', fontWeight: 700, textAlign: 'right' }} 
                  value={cardAmountInput} 
                  onChange={(e) => setCardAmountInput(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '100px' }}>Tip Amount</span>
                <input className="ids-input" style={{ width: '120px', textAlign: 'right' }} value={cardTipInput} onChange={(e) => setCardTipInput(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ width: '100px' }}>Remarks</span>
                <input className="ids-input" style={{ flex: 1 }} value={cardRemarksInput} onChange={(e) => setCardRemarksInput(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    const amt = parseFloat(cardAmountInput) || 0;
                    setSettlementOptions(prev => ({ ...prev, CreditCard: amt }));
                    setActivePaymentModal(null);
                  }}
                >
                  Confirm
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setCardAmountInput('0.00')}>
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setActivePaymentModal(null)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 7: COMPANIES BTC SETTLEMENT DIALOG (Video 15 Frame 048)
          ========================================================================= */}
      {activePaymentModal === 'Companies' && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '400px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Company...</span>
              <button className="ids-win-btn close" onClick={() => setActivePaymentModal(null)}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '70px' }}>Company...</span>
                <input className="ids-input" style={{ width: '120px' }} value={companyCodeInput} onChange={(e) => setCompanyCodeInput(e.target.value)} />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '20px', height: '20px', padding: 0 }}
                  onClick={() => {
                    playReceptionChime();
                    const cc = prompt("Select Corporate BTC Account (TCS, INFOSYS, RELIANCE, WIPRO):", companyCodeInput || "CORP001");
                    if (cc) {
                      setCompanyCodeInput(cc.toUpperCase());
                      setCompanyNameInput(cc.toUpperCase() + " TECHNOLOGIES LTD");
                    }
                  }}
                >?</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '70px' }}>Name</span>
                <input className="ids-input" style={{ flex: 1 }} value={companyNameInput} onChange={(e) => setCompanyNameInput(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '70px' }}>Amount</span>
                <input 
                  className="ids-input" 
                  style={{ width: '120px', fontWeight: 700, textAlign: 'right' }} 
                  value={companyAmountInput} 
                  onChange={(e) => setCompanyAmountInput(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    const amt = parseFloat(companyAmountInput) || 0;
                    setSettlementOptions(prev => ({ ...prev, Companies: amt }));
                    setActivePaymentModal(null);
                  }}
                >
                  Confirm
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setCompanyAmountInput('0.00')}>
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setActivePaymentModal(null)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
