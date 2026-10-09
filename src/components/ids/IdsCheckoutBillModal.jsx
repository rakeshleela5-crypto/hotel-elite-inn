import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { Printer, Search, Scissors, DollarSign, X, Check, FileText } from 'lucide-react';

/* =========================================================================
   VIDEO 15: CHECKOUT & SETTLE FRONT OFFICE BILL WITH SPLIT BILL PROCESS
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT V6.5 & V7.0
   Replication of:
   1. Check-out V6.5.002.6 Console (Frame 010 & Frame 031)
   2. Bill Summary V6.5.002.6 Dialog (Frame 013 & Frame 014)
   3. Bill Split Dialog (Frame 020 & Frame 025)
   4. View Bill Line-Item Detail Dialog (Frame 022)
   5. FO Bill Print Crystal Dialog & Invoice Preview (Frame 030)
   6. Settlements V6.5.008.30 Dialog (Frame 035, 038, 048, 055, 058, 060)
   7. Settlement Sub-popups: Cash, Credit Card, Company (Frames 048, 055, 058)
   8. Bill # Lookup Dialog (Frame 036)
   ========================================================================= */

// All 16 Expected Departures matching Frame 010
export const DEFAULT_EXPECTED_DEPARTURES = [
  { roomNo: '305', time: '00:00', date: '17-JAN-2022', guest: 'KAKATI', type: 'DLX', company: 'ALL' },
  { roomNo: '403', time: '00:00', date: '17-JAN-2022', guest: 'DEKA', type: 'DLX', company: 'ALL' },
  { roomNo: '404', time: '00:00', date: '17-JAN-2022', guest: 'DAS', type: 'DLX', company: 'ALL' },
  { roomNo: '303', time: '12:00', date: '17-JAN-2022', guest: 'CHETIA', type: 'DLX', company: 'Mr. Gaurav Baruah' },
  { roomNo: '304', time: '12:00', date: '17-JAN-2022', guest: 'CHETIA', type: 'DLX', company: 'Mr. Gaurav Baruah' },
  { roomNo: '306', time: '12:00', date: '17-JAN-2022', guest: 'SINGH', type: 'DLX', company: 'ALL' },
  { roomNo: '307', time: '12:00', date: '17-JAN-2022', guest: 'SINGH', type: 'DLX', company: 'ALL' },
  { roomNo: '310', time: '12:00', date: '17-JAN-2022', guest: 'WAHLANG', type: 'DLX', company: 'ALL' },
  { roomNo: '311', time: '12:00', date: '17-JAN-2022', guest: 'DEURI', type: 'DLX', company: 'ALL' },
  { roomNo: '315', time: '12:00', date: '17-JAN-2022', guest: 'Khan', type: 'EXE', company: 'Corporate FIT' },
  { roomNo: '409', time: '12:00', date: '17-JAN-2022', guest: 'BHATTASALI', type: 'DLX', company: 'ALL' },
  { roomNo: '503', time: '12:00', date: '17-JAN-2022', guest: 'NATRAJ', type: 'DLX', company: 'ALL' },
  { roomNo: '504', time: '12:00', date: '17-JAN-2022', guest: 'MENAN', type: 'DLX', company: 'ALL' },
  { roomNo: '505', time: '12:00', date: '17-JAN-2022', guest: 'BEDI', type: 'DLX', company: 'ALL' },
  { roomNo: '516', time: '12:00', date: '17-JAN-2022', guest: 'Biswakarma', type: 'SUI', company: 'Mahindra & Mahindra' },
  { roomNo: '401', time: '23:00', date: '17-JAN-2022', guest: 'Khan', type: 'EXE', company: 'Corporate FIT' },
  // Target Room 314 matching Frame 011 & 013
  { roomNo: '314', time: '12:00', date: '18-JAN-2022', guest: 'Anirudh', type: 'DLX', company: 'COM0015 / Indian Bank', isGroup: true }
];

// Target Room 314 Bill Profile matching Video 15 Frame 013 & 020
export const TARGET_ROOM_314_BILL = {
  roomNo: '314',
  regNo: '589',
  resNo: '272',
  guestName: 'MR. Anirudh',
  folioNo: '1',
  companyCode: 'COM0015',
  companyName: 'Indian Bank',
  billing: '1 / Direct',
  payMode: 'Cash',
  specialIns: '',
  arrival: '16-JAN-2022 11:50',
  departure: '18-JAN-2022 12:00',
  rate: 3500.00,
  plan: 0.00,
  charges: 765.66,
  taxes: 458.34,
  receipts: 0.00,
  netAmount: 4724.00,
  billNo: '501'
};

export default function IdsCheckoutBillModal({
  isOpen,
  onClose,
  initialRoomNo = '314',
  initialMode = 'checkout', // 'checkout' | 'settlement'
  onCompleteCheckout,
  checkedOutRooms = []
}) {
  // Navigation View: 'selector' | 'bill-summary' | 'settlements'
  const [activeScreen, setActiveScreen] = useState(initialMode === 'settlement' ? 'settlements' : 'selector');
  
  // Selection Filters (Frame 010)
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterRoomType, setFilterRoomType] = useState('ALL');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterBlock, setFilterBlock] = useState('ALL');
  const [searchRoomInput, setSearchRoomInput] = useState(initialRoomNo || '314');

  // Currently Selected Checkout Room & Bill Data
  const [currentRoom, setCurrentRoom] = useState(initialRoomNo || '314');
  const [billData, setBillData] = useState(TARGET_ROOM_314_BILL);

  // Split Bill State (Frames 020 & 025)
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
  
  // Settlements V6.5.008.30 State (Frames 035, 038, 060)
  const [settlementBillNo, setSettlementBillNo] = useState('501');
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
  const [cardAmountInput, setCardAmountInput] = useState('4000.00');
  const [cardTipInput, setCardTipInput] = useState('0.00');
  const [cardRemarksInput, setCardRemarksInput] = useState('Settled via POS Terminal #1');

  const [companyCodeInput, setCompanyCodeInput] = useState('COM0015');
  const [companyNameInput, setCompanyNameInput] = useState('Indian Bank');
  const [companyAmountInput, setCompanyAmountInput] = useState('4724.00');

  const [statusMessage, setStatusMessage] = useState('');
  const [isSavingCheckout, setIsSavingCheckout] = useState(false);

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'settlement') {
        setActiveScreen('settlements');
        setSettlementBillNo('501');
        setSettlementLoaded(true);
      } else {
        setActiveScreen(initialRoomNo ? 'bill-summary' : 'selector');
        setSearchRoomInput(initialRoomNo || '314');
        setCurrentRoom(initialRoomNo || '314');
      }
      setStatusMessage('');
      setIsSavingCheckout(false);
    }
  }, [isOpen, initialMode, initialRoomNo]);

  if (!isOpen) return null;

  // Filter Departures
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
    if (roomNo === '314') {
      setBillData(TARGET_ROOM_314_BILL);
    } else {
      const found = DEFAULT_EXPECTED_DEPARTURES.find(d => d.roomNo === roomNo);
      setBillData({
        ...TARGET_ROOM_314_BILL,
        roomNo,
        guestName: found?.guest ? `MR. ${found.guest}` : 'Guest',
        rate: found?.type === 'SUI' ? 6500 : found?.type === 'EXE' ? 4500 : 3500,
        charges: 0,
        taxes: 420.00,
        receipts: 0.00,
        netAmount: found?.type === 'SUI' ? 7280 : found?.type === 'EXE' ? 5040 : 3920
      });
    }
    setActiveScreen('bill-summary');
  };

  // Merge split bills
  const handleMergeSplitBills = () => {
    // Merges Bill 3 (Food taxes) into Bill 2 (RMS/GN / FOOD) matching Frame 025
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

  // Execute checkout & settlement
  const handleSaveSettlement = () => {
    if (currentBalance > 0.01) {
      alert(`Balance ₹${currentBalance.toFixed(2)} is remaining. Please settle the full amount of ₹${totalBillNet.toFixed(2)}.`);
      return;
    }

    setIsSavingCheckout(true);
    setStatusMessage('UPDATING ROOM MASTER...');

    setTimeout(() => {
      if (onCompleteCheckout) {
        onCompleteCheckout(currentRoom, {
          billNo: settlementBillNo,
          netAmount: totalBillNet,
          settlementOptions,
          guestName: billData.guestName,
          checkoutTime: new Date().toLocaleTimeString()
        });
      }
      setIsSavingCheckout(false);
      onClose();
    }, 800);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* =========================================================================
          SCREEN 1: CHECK-OUT V6.5.002.6 SELECTION CONSOLE (Frame 010 & Frame 031)
          ========================================================================= */}
      {activeScreen === 'selector' && (
        <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Check-out V6.5.002.6</span>
            <button className="ids-win-btn close" onClick={onClose}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Header Filters Strip matching Frame 010 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', background: '#ECE9D8', padding: '4px', borderBottom: '1px solid #CCC', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Company</span>
                <select className="ids-select" style={{ width: '120px', background: '#316AC5', color: '#FFF', fontWeight: 700 }} value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
                  <option value="ALL">ALL</option>
                  <option value="Indian Bank">COM0015 / Indian Bank</option>
                  <option value="Corporate FIT">COM0005 / Corporate FIT</option>
                  <option value="Mahindra">COM0007 / Mahindra</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#000' }}>Group</span>
                <select className="ids-select" style={{ width: '80px', background: '#316AC5', color: '#FFF' }} value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                  <option value="ALL">ALL</option>
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
                  placeholder="314"
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

            {/* Title Centered above tile matrix */}
            <div style={{ textAlign: 'center', fontWeight: 700, color: '#333', margin: '8px 0 4px 0', fontSize: '11px' }}>
              {searchRoomInput.trim() ? 'All Rooms' : 'Expected Departures'}
            </div>

            {/* Expected Departures Green Tile Matrix matching Frame 010 & 031 */}
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
              {departuresList.map((card) => (
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
                    transition: 'transform 0.1s, box-shadow 0.1s'
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
              ))}
            </div>

            {/* Bottom buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '85px' }}>Cut Off Date</button>
              <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={() => setSearchRoomInput('')}>Refresh</button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={onClose}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: BILL SUMMARY DIALOG (Video 15 Frame 013 & Frame 014)
          ========================================================================= */}
      {activeScreen === 'bill-summary' && (
        <div className="ids-dialog-window" style={{ width: '940px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Summary</span>
            <button className="ids-win-btn close" onClick={() => setActiveScreen('selector')}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Header Form matching Frame 013 */}
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
              <div style={{ display: 'grid', gridTemplateColumns: '70px 180px 24px 70px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>Billing</span>
                <input className="ids-input" readOnly value={billData.billing} style={{ background: '#F5F5F5' }} />
                <button className="ids-btn-classic" style={{ padding: '0', height: '20px', width: '20px', fontWeight: 700 }}>?</button>
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

            {/* Folio Grid matching Frame 013 & Frame 024 */}
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
                  {!isBillSplitted ? (
                    // Single Unsplit Bill (Frame 013)
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
                    // Splitted Bill (Frame 024: 2 Sub-bills)
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
                  {[...Array(isBillSplitted ? 3 : 4)].map((_, idx) => (
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

            {/* Total Strip & Red Helper Text matching Frame 013 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 4px 0', fontSize: '11px' }}>
              <span style={{ color: '#D00', fontStyle: 'italic', fontSize: '10px' }}>
                Click Net Amount Column to View Bill Details.
              </span>
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

            {/* Status Strip matching Frame 029 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginBottom: '8px' }}>
              <span style={{ color: '#555' }}>Status</span>
              <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', padding: '2px 6px', height: '20px', fontSize: '10px', color: '#0A246A', fontWeight: 600 }}>
                {statusMessage || 'Ready for settlement or split...'}
              </div>
            </div>

            {/* Bottom Buttons matching Frame 013 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }}>GST FB</button>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setViewBillOpen(true)}>Details</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px', fontWeight: 700 }}
                  onClick={() => {
                    setStatusMessage('Updating OTT Table 589');
                    setTimeout(() => {
                      setStatusMessage('Printing Bill # 501');
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
                  title="Bill Split (Video 15 Frame 020)"
                >
                  ✂️ Split Bill...
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '75px', fontWeight: 700, background: '#C8E6C9', color: '#004D40' }}
                  onClick={() => {
                    setSettlementBillNo('501');
                    setSettlementLoaded(true);
                    setActiveScreen('settlements');
                  }}
                  title="Open Settlement V6.5.008.30 (Video 15 Frame 035)"
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
          SCREEN 3: SETTLEMENTS V6.5.008.30 DIALOG (Video 15 Frames 035, 038, 060)
          ========================================================================= */}
      {activeScreen === 'settlements' && (
        <div className="ids-dialog-window" style={{ width: '820px', maxWidth: '98vw' }}>
          <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px' }}>Settlements V6.5.008.30</span>
            <button className="ids-win-btn close" onClick={() => setActiveScreen('bill-summary')}>✕</button>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Top Form Section matching Frame 035 & Frame 038 */}
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
                        Cash: currentBalance > 0 ? currentBalance : 4724.00
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
                  <input className="ids-input" readOnly value={settlementLoaded ? 'Anirudh' : ''} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '75px' }}>User</span>
                  <input className="ids-input" readOnly value="MANAGER" style={{ width: '100px', background: '#F5F5F5', fontWeight: 600 }} />
                </div>
              </div>
            </div>

            {/* Fieldset: Settlement Options (Frame 035 & Frame 060) */}
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
                    {/* Rows matching Frame 035: Cash, Credit Card, Companies, Staff, Cheque, Bills On Hold, Foreign Exchange, Complimentary */}
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

            {/* Quick Presets matching Video 15 Frame 060 (Split Cash ₹724 + Card ₹4,000) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '11px', background: '#FFF7CC', padding: '4px 8px', border: '1px solid #DDD' }}>
              <span style={{ fontWeight: 700, color: '#856404' }}>Video 15 Exact Walkthrough:</span>
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
                  setStatusMessage('Applied: Cash ₹724.00 + Credit Card ₹4,000.00 (Frame 060)');
                }}
              >
                Apply Video 15 Split: Cash ₹724 + Card ₹4,000
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
              <button 
                className="ids-btn-classic" 
                style={{ fontSize: '10px', padding: '2px 8px' }}
                onClick={() => {
                  setSettlementOptions({
                    Cash: 0,
                    CreditCard: 0,
                    Companies: 4724.00,
                    Staff: 0,
                    Cheque: 0,
                    BillsOnHold: 0,
                    ForeignExchange: 0,
                    Complimentary: 0
                  });
                  setStatusMessage('Applied: Direct Company BTC ₹4,724.00 (Indian Bank)');
                }}
              >
                Company BTC ₹4,724.00
              </button>
            </div>

            {/* Bottom Status strip */}
            <div style={{ height: '22px', border: '1px solid #7F9DB9', background: '#FFF', padding: '2px 8px', fontSize: '11px', color: '#0A246A', fontWeight: 700, marginBottom: '8px' }}>
              {statusMessage || (isSavingCheckout ? 'UPDATING ROOM MASTER...' : 'Select receipt type to enter settlement')}
            </div>

            {/* Bottom Action buttons matching Frame 035 & 060 */}
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
          SUB-POPUP 1: BILL SPLIT DIALOG (Video 15 Frame 020 & Frame 025)
          ========================================================================= */}
      {splitBillOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '560px', maxWidth: '95vw', background: '#ECE9D8' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Split</span>
              <button className="ids-win-btn close" onClick={() => setSplitBillOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', maxHeight: '520px', overflowY: 'auto' }}>
              {/* Bill 1 Box */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', marginBottom: '8px' }}>
                <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '11px' }}>
                  <span>Bill —&gt; 1 ({billData.roomNo})</span>
                  <span>
                    {splitItems.bill1.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </span>
                </div>
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
                        <td>{item.roomNo}</td>
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

              {/* Bill 2 Box */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', marginBottom: '8px' }}>
                <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '11px' }}>
                  <span>Bill —&gt; 2 ({billData.roomNo})</span>
                  <span>
                    {splitItems.bill2.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </span>
                </div>
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
                    {splitItems.bill2.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>{item.date}</td>
                        <td>{item.roomNo}</td>
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

              {/* Bill 3 Box (if any items) */}
              {splitItems.bill3.length > 0 && (
                <div style={{ border: '1px solid #7F9DB9', background: '#FFF', marginBottom: '8px' }}>
                  <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '11px' }}>
                    <span>Bill —&gt; 3 ({billData.roomNo})</span>
                    <span>
                      {splitItems.bill3.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </span>
                  </div>
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
                      {splitItems.bill3.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td>{item.date}</td>
                          <td>{item.roomNo}</td>
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
              )}

              {/* Action Buttons matching Frame 020 & 025 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#FFF7CC' }}
                  onClick={handleMergeSplitBills}
                  title="Merge Taxes into F&B Bill (Video 15 Frame 025)"
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
                    {/* Rows matching Video 15 Frame 022 */}
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>1</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>TRF</td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* Tariff 314</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>3,500.00</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>2</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>CGT</td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* Central GST</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>210.00</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>3</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>SGT</td>
                      <td style={{ borderRight: '1px solid #EEE' }}></td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* State GST</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>210.00</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>4</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>17-JAN-2022 14:10</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>POS</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* RMS/GN / FOOD</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>765.66</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>5</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>17-JAN-2022 14:10</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>CGT</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* Central GST (F&amp;B)</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>19.17</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr style={{ background: '#FFF' }}>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #EEE' }}>6</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>17-JAN-2022 14:10</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>272</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>314</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>589</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>SGT</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>1</td>
                      <td style={{ borderRight: '1px solid #EEE' }}>* State GST (F&amp;B)</td>
                      <td style={{ textAlign: 'right', borderRight: '1px solid #EEE' }}>19.17</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note matching Frame 022 */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', margin: '8px 0', border: '1px solid #CCC', padding: '4px', background: '#FFF' }}>
                Note : Double click on POS Outlet Bill Details, to View Details for F&amp;B transactions..<br />
                Press F2 to Rename Revenue Description
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '110px' }}>Reprint POS Bill</button>
                <button className="ids-btn-classic" style={{ minWidth: '85px' }}>Calculator</button>
                <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setViewBillOpen(false)}>Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-POPUP 3: FO BILL PRINT CRYSTAL DIALOG & PREVIEW (Video 15 Frame 030)
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
                  ✓ <b>Bill # 501</b> sent to {crystalPrinter}. Crystal Report Detailed Bill rendered successfully.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700, background: '#316AC5', color: '#FFF' }}
                  onClick={() => {
                    setCrystalPrintSuccess(true);
                    setStatusMessage('Bill # 501 printed via Crystal Reports.');
                    setTimeout(() => {
                      setPrintCrystalOpen(false);
                      setCrystalPrintSuccess(false);
                    }, 1200);
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
          SUB-POPUP 4: BILL # LOOKUP DIALOG (Video 15 Frame 036 & 037)
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
                    <tr 
                      style={{ background: '#316AC5', color: '#FFF', cursor: 'pointer', fontWeight: 700 }}
                      onDoubleClick={() => {
                        setSettlementBillNo('501');
                        setSettlementLoaded(true);
                        setBillLookupOpen(false);
                      }}
                    >
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>501</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>17-JAN-2022</td>
                      <td style={{ borderRight: '1px solid #4477DD' }}>PENDING</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>314</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>1</td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #4477DD' }}>589</td>
                      <td style={{ textAlign: 'right' }}>4,724.00</td>
                    </tr>
                    {[...Array(4)].map((_, i) => (
                      <tr key={`blank-${i}`} style={{ height: '20px' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    setSettlementBillNo('501');
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
          SUB-POPUP 6: CREDIT CARD SETTLEMENT DIALOG (Video 15 Frame 055)
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
                <button className="ids-btn-classic" style={{ width: '20px', height: '20px', padding: 0 }}>?</button>
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
                <button className="ids-btn-classic" style={{ width: '20px', height: '20px', padding: 0 }}>?</button>
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
