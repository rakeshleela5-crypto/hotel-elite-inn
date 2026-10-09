import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  DollarSign, Calendar, Check, X, Info, 
  HelpCircle, ChevronDown, ChevronRight, FileText, AlertCircle, ShieldCheck, Printer, RefreshCw, Percent
} from 'lucide-react';

/* =========================================================================
   VIDEO 24: HOW TO USE BILL ALLOWANCE OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Entry Points:
      - Room Status V6.5.002.1 Rack Console -> Right click 201 O/EXE Kumar -> Bill Allowance (Frames 015–022)
      - Cashiering.. -> Bill Allowance Option (Dispute Waiver / Multi-Day Discount)
   2. Bill Allowance V6.5.002.4 Primary Dialog (Frames 025–070):
      - Header: Room# 201, Folio # 1, Reg. # 613, Outlet: TRF
      - Name: Kumar Anil, Classification: Regular, Nationality: India
      - Arrival: 16-JAN-2022 12:02, Departure: 26-JAN-2022 12:00
   3. Select Revenue Dialog (Frames 025–038):
      - Radio: (•) Insert  ( ) Delete
      - From Date: 16-JAN-2022
      - To Date: 26-JAN-2022
      - Revenue Code: TRF (Tariff) / CP / MIB / LAR / RES
      - [ Ok ], [ Back ]
   4. Multi-Day Grid Loading & Apply Discount Dialog (Frames 040–054):
      - Day 1: 16-JAN-2022 | Tariff | 4,250.00
      - Day 2: 23-JAN-2022 | Tariff | 4,250.00
      - Day 3: 25-JAN-2022 | Tariff | 4,250.00
      - Clicking [ Apply Discount ] opens modal:
        * Radio: (•) Percentage  ( ) Amount
        * Percentage: 10
        * [ Apply ], [ Back ]
      - Automatic calculation applies 10% (425.00) to each date!
      - GST 6% CGT (25.50) + 6% SGT (25.50) calculated per row
   5. Authorization Dialog (Frames 055–065):
      - Reason: Guest Requested
      - Remarks: Discount
      - Authorized By: MANAGER
      - [ Confirm ], [ Cancel ]
      - Confirmation Prompt: "Do you want to save allowance details? [ Yes ] [ No ]"
   6. Integrated Folio Verification (Frames 075–100):
      - Check out V6.5.002.6 / View Bill for Room 201
      - 19 ledger rows showing 9 discount credit lines (Rows 11 to 19):
        * Bill #2 (16-JAN): TRF (-425.00), CGT (-25.50), SGT (-25.50)
        * Bill #3 (23-JAN): TRF (-425.00), CGT (-25.50), SGT (-25.50)
        * Bill #4 (25-JAN): TRF (-425.00), CGT (-25.50), SGT (-25.50)
      - Total Concession: ₹1,428.00 deducted from balance!
   ========================================================================= */

export const BATCH_ALLOWANCE_ROOMS = [
  {
    roomNo: '201',
    category: 'EXECUTIVE (EXE)',
    guestName: 'Kumar Anil',
    regNo: '613',
    folioNo: '1',
    resvNo: '276',
    arrival: '16-JAN-2022 12:02',
    departure: '26-JAN-2022 12:00',
    classification: 'Regular',
    nationality: 'India',
    outlet: 'TRF',
    postedDays: [
      { date: '16-JAN-2022', description: 'Tariff', amount: 4250.00, billRef: '2' },
      { date: '23-JAN-2022', description: 'Tariff', amount: 4250.00, billRef: '3' },
      { date: '25-JAN-2022', description: 'Tariff', amount: 4250.00, billRef: '4' }
    ]
  },
  {
    roomNo: '311',
    category: 'DELUXE (DLX)',
    guestName: 'DEURI HEMCHANDRA',
    regNo: '566',
    folioNo: '1',
    resvNo: '245',
    arrival: '02-DEC-2021 12:47',
    departure: '26-JAN-2022 12:00',
    classification: 'Regular',
    nationality: 'India',
    outlet: 'TRF',
    postedDays: [
      { date: '23-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '2' },
      { date: '24-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '3' },
      { date: '25-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '4' }
    ]
  },
  {
    roomNo: '312',
    category: 'DELUXE (DLX)',
    guestName: 'BASU ANIRUDH',
    regNo: '587',
    folioNo: '1',
    resvNo: '246',
    arrival: '16-JAN-2022 11:49',
    departure: '27-JAN-2022 12:00',
    classification: 'Regular',
    nationality: 'India',
    outlet: 'TRF',
    postedDays: [
      { date: '22-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '2' },
      { date: '24-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '3' },
      { date: '25-JAN-2022', description: 'Tariff', amount: 3500.00, billRef: '4' }
    ]
  }
];

export const REVENUE_CODES = [
  { code: 'TRF', name: 'Tariff', taxRate: 0.12 },
  { code: 'CP', name: 'Continental Plan', taxRate: 0.12 },
  { code: 'TRV', name: 'Travel Desk', taxRate: 0.05 },
  { code: 'LAR', name: 'Laundry Room', taxRate: 0.12 },
  { code: 'MIB', name: 'Minibar', taxRate: 0.18 },
  { code: 'RES', name: 'Restaurant POS', taxRate: 0.05 }
];

export default function IdsBillAllowanceOptionModal({
  isOpen,
  onClose,
  initialRoomNo = '201',
  accountingDate = '26-JAN-2022',
  onSaveAllowance
}) {
  // Active window view: 'bill-allowance' | 'view-folio'
  const [currentView, setCurrentView] = useState('bill-allowance');

  // Room Context
  const [selectedRoomNo, setSelectedRoomNo] = useState(initialRoomNo || '201');
  const activeRoom = BATCH_ALLOWANCE_ROOMS.find(r => r.roomNo === selectedRoomNo) || BATCH_ALLOWANCE_ROOMS[0];

  // Dialog Visibility states
  const [showSelectRevenue, setShowSelectRevenue] = useState(false);
  const [showApplyDiscount, setShowApplyDiscount] = useState(false);
  const [showAuthorization, setShowAuthorization] = useState(false);
  const [showSaveConfirmPrompt, setShowSaveConfirmPrompt] = useState(false);

  // Select Revenue Dialog State (Frames 025–038)
  const [actionType, setActionType] = useState('Insert'); // 'Insert' | 'Delete'
  const [fromDate, setFromDate] = useState('16-JAN-2022');
  const [toDate, setToDate] = useState('26-JAN-2022');
  const [selectedRevenueCode, setSelectedRevenueCode] = useState('TRF');

  // Day-wise Grid Rows State (Frames 040–060)
  const [gridRows, setGridRows] = useState([
    {
      id: 1,
      date: '16-JAN-2022',
      description: 'Tariff',
      amount: 4250.00,
      allowance: 0.00,
      type: 'Discount',
      option: '-',
      tax: 'Yes',
      billRef: '2'
    },
    {
      id: 2,
      date: '23-JAN-2022',
      description: 'Tariff',
      amount: 4250.00,
      allowance: 0.00,
      type: 'Discount',
      option: '-',
      tax: 'Yes',
      billRef: '3'
    },
    {
      id: 3,
      date: '25-JAN-2022',
      description: 'Tariff',
      amount: 4250.00,
      allowance: 0.00,
      type: 'Discount',
      option: '-',
      tax: 'Yes',
      billRef: '4'
    }
  ]);

  // Apply Discount Popup State (Frames 048–054)
  const [discountMode, setDiscountMode] = useState('Percentage'); // 'Percentage' | 'Amount'
  const [discountValue, setDiscountValue] = useState('10'); // Default 10%

  // Authorization Form State (Frames 055–065)
  const [authReason, setAuthReason] = useState('Guest Requested');
  const [authRemarks, setAuthRemarks] = useState('Discount');
  const [authorizedBy, setAuthorizedBy] = useState('MANAGER');

  // Notice Message
  const [statusNotice, setStatusNotice] = useState('');

  // Folio state for Room 201
  const [isDiscountSaved, setIsDiscountSaved] = useState(false);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      const room = BATCH_ALLOWANCE_ROOMS.find(r => r.roomNo === initialRoomNo) || BATCH_ALLOWANCE_ROOMS[0];
      setSelectedRoomNo(room.roomNo);
      setFromDate(room.arrival ? room.arrival.split(' ')[0] : '16-JAN-2022');
      setToDate(accountingDate || '26-JAN-2022');
      setCurrentView('bill-allowance');
      setShowSelectRevenue(false);
      setShowApplyDiscount(false);
      setShowAuthorization(false);
      setShowSaveConfirmPrompt(false);
      setStatusNotice('');
      
      // Load initial rows from room data
      if (room.postedDays) {
        setGridRows(room.postedDays.map((d, idx) => ({
          id: idx + 1,
          date: d.date,
          description: d.description,
          amount: d.amount,
          allowance: 0.00,
          type: 'Discount',
          option: '-',
          tax: 'Yes',
          billRef: d.billRef
        })));
      }
    }
  }, [isOpen, initialRoomNo, accountingDate]);

  if (!isOpen) return null;

  // Revenue calculation helper
  const currentRevenue = REVENUE_CODES.find(r => r.code === selectedRevenueCode) || REVENUE_CODES[0];
  const taxRate = currentRevenue.taxRate; // 0.12

  // Totals computed across rows
  const totalBaseAllowance = gridRows.reduce((sum, r) => sum + (parseFloat(r.allowance) || 0), 0);
  const totalCgt = gridRows.reduce((sum, r) => {
    const allow = parseFloat(r.allowance) || 0;
    return sum + (r.tax === 'Yes' ? Math.round(allow * (taxRate / 2) * 100) / 100 : 0);
  }, 0);
  const totalSgt = gridRows.reduce((sum, r) => {
    const allow = parseFloat(r.allowance) || 0;
    return sum + (r.tax === 'Yes' ? Math.round(allow * (taxRate / 2) * 100) / 100 : 0);
  }, 0);
  const grandTotalDiscount = totalBaseAllowance + totalCgt + totalSgt;

  // Handle Select Revenue confirmation (Frames 035–040)
  const handleConfirmSelectRevenue = () => {
    setShowSelectRevenue(false);
    if (activeRoom.postedDays) {
      setGridRows(activeRoom.postedDays.map((d, idx) => ({
        id: idx + 1,
        date: d.date,
        description: currentRevenue.name,
        amount: d.amount,
        allowance: 0.00,
        type: 'Discount',
        option: '-',
        tax: 'Yes',
        billRef: d.billRef
      })));
    }
    setStatusNotice(`Loaded ${activeRoom.postedDays ? activeRoom.postedDays.length : 3} stay dates for ${selectedRevenueCode} between ${fromDate} and ${toDate}`);
  };

  // Handle Apply Discount calculation (Frames 048–054)
  const handleExecuteApplyDiscount = () => {
    const val = parseFloat(discountValue) || 0;
    if (val <= 0) {
      alert('Please enter a valid discount percentage or amount.');
      return;
    }

    setGridRows(prev => prev.map(row => {
      let computedAllowance = 0;
      if (discountMode === 'Percentage') {
        computedAllowance = Math.round((row.amount * (val / 100)) * 100) / 100;
      } else {
        computedAllowance = Math.min(row.amount, val);
      }
      return {
        ...row,
        allowance: computedAllowance
      };
    }));

    setShowApplyDiscount(false);
    setStatusNotice(`Applied ${discountMode === 'Percentage' ? `${val}%` : `₹${val}`} discount across all ${gridRows.length} transaction rows`);
  };

  // Handle Row Allowance change directly
  const handleRowAllowanceChange = (id, newAllowance) => {
    setGridRows(prev => prev.map(r => r.id === id ? { ...r, allowance: parseFloat(newAllowance) || 0 } : r));
  };

  // Handle Row Tax toggle (Yes/No)
  const handleRowTaxToggle = (id, newTax) => {
    setGridRows(prev => prev.map(r => r.id === id ? { ...r, tax: newTax } : r));
  };

  // Step 5: Save clicked -> Opens Authorization dialog (Frame 055)
  const handleSaveClick = () => {
    if (totalBaseAllowance <= 0) {
      alert('Please apply or enter allowance amount before saving.');
      return;
    }
    setShowAuthorization(true);
  };

  // Step 6: Authorization confirm -> Opens Confirmation prompt (Frame 065)
  const handleConfirmAuthorization = () => {
    setShowAuthorization(false);
    setShowSaveConfirmPrompt(true);
  };

  // Step 7: Final Save confirmation -> Posts to Folio and clears form (Frames 065–070)
  const handleFinalSaveConfirm = () => {
    setShowSaveConfirmPrompt(false);
    setIsDiscountSaved(true);

    if (onSaveAllowance) {
      onSaveAllowance({
        roomNo: selectedRoomNo,
        guestName: activeRoom.guestName,
        revenueCode: selectedRevenueCode,
        rows: gridRows,
        totalBaseAllowance,
        totalCgt,
        totalSgt,
        grandTotalDiscount,
        reason: authReason,
        remarks: authRemarks,
        authorizedBy: authorizedBy,
        date: accountingDate
      });
    }

    // Clear grid matching Video 24 Frame 070
    setGridRows([]);
    setStatusNotice(`Bill Allowance saved successfully! ₹${grandTotalDiscount.toFixed(2)} posted to Room ${selectedRoomNo} folio across ${gridRows.length} days.`);
  };

  return (
    <div 
      className="ids-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '10px'
      }}
    >
      {/* Primary Window Container */}
      <div 
        className="ids-window"
        style={{
          width: '940px',
          maxWidth: '98vw',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 6px 20px rgba(0,0,0,0.6)',
          backgroundColor: '#ECE9D8',
          border: '2px solid #002D96',
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        {/* Windows XP Classic Title Bar */}
        <div 
          className="ids-window-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFFFFF',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="#FFF" />
            <span>
              {currentView === 'bill-allowance' 
                ? 'Bill Allowance V6.5.002.4 (Multi-Day Batch Discount)' 
                : 'Check-out V6.5.002.6 - View Bill (Room 201 Folio Verification)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            <button 
              className="ids-titlebar-btn"
              style={{
                width: '18px',
                height: '18px',
                lineHeight: '14px',
                textAlign: 'center',
                background: '#D4D0C8',
                border: '1px outset #FFF',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: '11px'
              }}
              onClick={onClose}
              title="Close Window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video 24 Navigation & View Switcher Bar */}
        <div 
          style={{ 
            background: '#E4DFD0', 
            padding: '4px 10px', 
            borderBottom: '1px solid #999', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#0A246A' }}>Select Video 24 Preset:</span>
            {BATCH_ALLOWANCE_ROOMS.map(r => (
              <button
                key={r.roomNo}
                className="ids-btn-classic"
                style={{
                  padding: '2px 8px',
                  fontWeight: selectedRoomNo === r.roomNo ? 700 : 400,
                  background: selectedRoomNo === r.roomNo ? '#C1D2EE' : '#ECE9D8',
                  borderColor: selectedRoomNo === r.roomNo ? '#316AC5' : '#716F64'
                }}
                onClick={() => {
                  setSelectedRoomNo(r.roomNo);
                  setFromDate(r.arrival ? r.arrival.split(' ')[0] : '16-JAN-2022');
                  setToDate('26-JAN-2022');
                  if (r.postedDays) {
                    setGridRows(r.postedDays.map((d, idx) => ({
                      id: idx + 1,
                      date: d.date,
                      description: d.description,
                      amount: d.amount,
                      allowance: 0.00,
                      type: 'Discount',
                      option: '-',
                      tax: 'Yes',
                      billRef: d.billRef
                    })));
                  }
                  setIsDiscountSaved(false);
                }}
              >
                Room {r.roomNo} ({r.guestName.split(' ')[0]})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="ids-btn-classic"
              style={{
                padding: '2px 10px',
                fontWeight: currentView === 'bill-allowance' ? 700 : 400,
                background: currentView === 'bill-allowance' ? '#FFE8A1' : '#ECE9D8'
              }}
              onClick={() => setCurrentView('bill-allowance')}
            >
              1. Allowance Screen (Frames 025–070)
            </button>
            <button
              className="ids-btn-classic"
              style={{
                padding: '2px 10px',
                fontWeight: currentView === 'view-folio' ? 700 : 400,
                background: currentView === 'view-folio' ? '#B8F4B8' : '#ECE9D8',
                color: currentView === 'view-folio' ? '#004D00' : '#000'
              }}
              onClick={() => setCurrentView('view-folio')}
            >
              2. View Bill Folio (Frames 075–100)
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div 
            style={{ 
              background: '#FFFFCC', 
              color: '#002D96', 
              padding: '3px 10px', 
              borderBottom: '1px solid #CCCCCC',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Info size={13} color="#002D96" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {currentView === 'bill-allowance' ? (
            /* =========================================================================
               VIEW 1: BILL ALLOWANCE V6.5.002.4 (Video 24 Frames 025–070)
               ========================================================================= */
            <div>
              {/* Guest & Room Details Header Grid matching Frames 025 & 040 */}
              <div 
                style={{ 
                  background: '#F0ECE0', 
                  border: '1px inset #D0C8B8', 
                  padding: '8px 12px', 
                  marginBottom: '10px',
                  display: 'grid',
                  gridTemplateColumns: '80px 180px 100px 1fr',
                  rowGap: '6px',
                  columnGap: '12px',
                  fontSize: '11px'
                }}
              >
                {/* Row 1 */}
                <div style={{ fontWeight: 700, color: '#333' }}>Room#</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.roomNo} 
                    style={{ width: '80px', background: '#FFF', border: '1px inset #999', padding: '1px 4px', fontWeight: 700 }}
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ padding: '0 5px', fontSize: '10px' }}
                    onClick={() => setShowSelectRevenue(true)}
                    title="Change Date Range / Revenue Code"
                  >
                    ?
                  </button>
                </div>

                <div style={{ fontWeight: 700, color: '#333' }}>Name</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.guestName} 
                    style={{ width: '100%', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>

                {/* Row 2 */}
                <div style={{ fontWeight: 700, color: '#333' }}>Folio #</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.folioNo} 
                    style={{ width: '50px', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                  <button className="ids-btn-classic" style={{ padding: '0 6px', fontSize: '10px' }}>
                    How..
                  </button>
                </div>

                <div style={{ fontWeight: 700, color: '#333' }}>Classification</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.classification} 
                    style={{ width: '100%', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>

                {/* Row 3 */}
                <div style={{ fontWeight: 700, color: '#333' }}>Reg. #</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.regNo} 
                    style={{ width: '80px', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>

                <div style={{ fontWeight: 700, color: '#333' }}>Nationality</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.nationality} 
                    style={{ width: '100%', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>

                {/* Row 4 */}
                <div style={{ fontWeight: 700, color: '#333' }}>Outlet</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedRevenueCode} 
                    style={{ width: '80px', background: '#FFF', border: '1px inset #999', padding: '1px 4px', fontWeight: 700 }}
                  />
                </div>

                <div style={{ fontWeight: 700, color: '#333' }}>Arrival</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.arrival} 
                    style={{ width: '160px', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>

                {/* Row 5 */}
                <div></div>
                <div></div>
                <div style={{ fontWeight: 700, color: '#333' }}>Departure</div>
                <div>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeRoom.departure} 
                    style={{ width: '160px', background: '#FFF', border: '1px inset #999', padding: '1px 4px' }}
                  />
                </div>
              </div>

              {/* Day-Wise Multi-Row Transaction Table matching Frames 040–060 */}
              <div 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #7F9DB9', 
                  minHeight: '220px', 
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginBottom: '10px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ borderBottom: '1px solid #ACA899' }}>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '45px' }}>Ref. #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '90px' }}>Date</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8' }}>Description</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '90px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '90px', textAlign: 'right', background: '#FFF7D6' }}>Allowance</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '75px' }}>Type</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '55px', textAlign: 'center' }}>Option</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'center' }}>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridRows.length > 0 ? (
                      gridRows.map((row) => (
                        <tr 
                          key={row.id}
                          style={{ 
                            borderBottom: '1px solid #E5E5E5',
                            background: row.allowance > 0 ? '#F0FFF0' : '#FFFFFF'
                          }}
                        >
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8', color: '#666' }}>
                            {row.id}
                          </td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8', fontWeight: 600 }}>
                            {row.date}
                          </td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8' }}>
                            {row.description}
                          </td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8', textAlign: 'right', fontWeight: 600 }}>
                            {row.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '2px 4px', borderRight: '1px solid #ECE9D8', textAlign: 'right', background: '#FFFBEA' }}>
                            <input 
                              type="number"
                              value={row.allowance}
                              onChange={(e) => handleRowAllowanceChange(row.id, e.target.value)}
                              style={{ 
                                width: '100%', 
                                textAlign: 'right', 
                                border: '1px inset #999', 
                                padding: '1px 3px',
                                fontWeight: 700,
                                color: row.allowance > 0 ? '#006600' : '#000'
                              }}
                            />
                          </td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8' }}>
                            <select 
                              value={row.type} 
                              disabled 
                              style={{ width: '100%', fontSize: '10px', border: 'none', background: 'transparent' }}
                            >
                              <option>Discount</option>
                            </select>
                          </td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #ECE9D8', textAlign: 'center' }}>
                            {row.option}
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <select 
                              value={row.tax} 
                              onChange={(e) => handleRowTaxToggle(row.id, e.target.value)}
                              style={{ 
                                fontSize: '10px', 
                                border: '1px inset #ACA899',
                                background: '#FFF',
                                padding: '1px 2px'
                              }}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
                          No transactions loaded. Click <strong>[ ? ]</strong> near Room# to load date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Video 24 Statutory Proportion Summary Strip */}
              <div 
                style={{ 
                  background: '#EAE6D6', 
                  border: '1px solid #A49F90', 
                  padding: '6px 12px', 
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                <div>
                  <span style={{ color: '#555' }}>Rows Loaded: </span>
                  <strong>{gridRows.length} Days</strong>
                  <span style={{ margin: '0 8px', color: '#CCC' }}>|</span>
                  <span style={{ color: '#555' }}>Base Allowance: </span>
                  <strong>₹{totalBaseAllowance.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#555' }}>CGT (6%): </span>
                    <strong style={{ color: '#006600' }}>₹{totalCgt.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#555' }}>SGT (6%): </span>
                    <strong style={{ color: '#006600' }}>₹{totalSgt.toFixed(2)}</strong>
                  </div>
                  <div style={{ background: '#FFF7CC', padding: '3px 8px', border: '1px solid #D4B106', borderRadius: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#A00' }}>Total Concession: </span>
                    <strong style={{ color: '#A00', fontSize: '12px' }}>₹{grandTotalDiscount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Command Buttons matching Video 24 Frame 045 */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '6px', 
                  paddingTop: '6px',
                  borderTop: '1px solid #D0C8B8'
                }}
              >
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '85px' }}
                  onClick={() => alert('F&B Break calculation option')}
                >
                  F&B Break
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ 
                    width: '105px', 
                    fontWeight: 700, 
                    color: '#0A246A',
                    background: '#FFE8A1',
                    borderColor: '#316AC5'
                  }}
                  onClick={() => setShowApplyDiscount(true)}
                  title="Apply Batch Discount to All Loaded Rows (Video 24 Frame 048)"
                >
                  Apply Discount
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px', fontWeight: 700 }}
                  onClick={handleSaveClick}
                  disabled={totalBaseAllowance <= 0}
                >
                  Save
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px' }}
                  onClick={() => {
                    setGridRows(prev => prev.map(r => ({ ...r, allowance: 0 })));
                    setStatusNotice('Cleared entered allowances');
                  }}
                >
                  Clear
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px' }}
                  onClick={() => alert('Panel Option')}
                >
                  Panel
                </button>

                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px' }}
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               VIEW 2: CHECK-OUT V6.5.002.6 / VIEW BILL (Video 24 Frames 075–100)
               ========================================================================= */
            <div>
              {/* Check-out V6.5.002.6 Filter Bar matching Frames 078–085 */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  border: '1px solid #ACA899', 
                  padding: '6px 10px', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>Company: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Group: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Room Type: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Floor: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Room #: <strong style={{ color: '#0A246A' }}>201</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                    onClick={() => alert('Viewing Room 201 Guest Bill')}
                  >
                    <Printer size={13} />
                    View Bill
                  </button>
                  <button className="ids-btn-classic" onClick={() => setCurrentView('bill-allowance')}>
                    Back to Allowance
                  </button>
                </div>
              </div>

              {/* Guest Folio Summary Top Header matching Frame 090 */}
              <div 
                style={{ 
                  background: '#F7F5EB', 
                  border: '1px solid #D0C8B8', 
                  padding: '6px 10px', 
                  marginBottom: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ color: '#666' }}>Room# / Folio</div>
                  <strong>201 / Folio 1</strong>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Guest Name</div>
                  <strong>Mr. Kumar Anil</strong>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Billing Mode</div>
                  <strong>1 / Direct</strong>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Stay Period</div>
                  <strong>16-JAN-2022 to 26-JAN-2022</strong>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Allowance Concession</div>
                  <strong style={{ color: '#006600' }}>
                    {isDiscountSaved ? '- ₹1,428.00 (9 Lines)' : '₹0.00'}
                  </strong>
                </div>
              </div>

              {/* Complete 19-Line Folio Table matching Video 24 Frame 090 */}
              <div 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #7F9DB9', 
                  maxHeight: '340px', 
                  overflowY: 'auto',
                  marginBottom: '8px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0, zIndex: 5 }}>
                    <tr style={{ borderBottom: '1px solid #ACA899' }}>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '30px' }}>Sl #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '125px' }}>Date</th>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '40px' }}>Resv#</th>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '45px' }}>Room#</th>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '40px' }}>Reg#</th>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '50px' }}>RevCod</th>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0C8B8', width: '35px' }}>Bill #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8' }}>Particulars</th>
                      <th style={{ padding: '3px 6px', width: '75px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Stay Charges (Lines 1 to 10) */}
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>1</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>415</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Tariff 415</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>4,250.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>2</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>415</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Central GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>3</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>16-JAN-2022 18:56</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>415</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*State GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE', background: '#F8FFF8' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>4</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>17-JAN-2022 19:13</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>ADV</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>168</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>Advance(Cash)</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', color: '#006600' }}>- 2,000.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>5</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>23-JAN-2022 15:49</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Tariff 201</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>4,250.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>6</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>23-JAN-2022 15:49</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Central GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>7</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>23-JAN-2022 15:49</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*State GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>8</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>25-JAN-2022 16:01</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Tariff 201</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>4,250.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>9</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>25-JAN-2022 16:01</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*Central GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>10</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>25-JAN-2022 16:01</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 600 }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}></td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>*State GST</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right' }}>255.00</td>
                    </tr>

                    {/* Newly Posted Bill Allowance Rows (Lines 11 to 19 matching Frame 090) */}
                    {/* Bill 2 (16-JAN discount) */}
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>11</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>2</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#006600' }}>Tariff 201/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 425.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>12</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>2</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>Central GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>13</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>2</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>State GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>

                    {/* Bill 3 (23-JAN discount) */}
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>14</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>3</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#006600' }}>Tariff 201/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 425.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>15</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>3</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>Central GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>16</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>3</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>State GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>

                    {/* Bill 4 (25-JAN discount) */}
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>17</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>TRF</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>4</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', fontWeight: 600, color: '#006600' }}>Tariff 201/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 425.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>18</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>CGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>4</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>Central GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD', background: '#F0FFF0' }}>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>19</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>26-JAN-2022 16:05</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>276</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>201</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE' }}>613</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700, color: '#006600' }}>SGT</td>
                      <td style={{ padding: '2px 4px', borderRight: '1px solid #EEE', fontWeight: 700 }}>4</td>
                      <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE', color: '#006600' }}>State GST/Discount</td>
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#006600' }}>- 25.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructional Note matching Frame 090 */}
              <div 
                style={{ 
                  background: '#FFFFEE', 
                  border: '1px solid #E0DBBF', 
                  padding: '5px 10px', 
                  marginBottom: '8px',
                  fontSize: '10px',
                  color: '#444',
                  textAlign: 'center'
                }}
              >
                Note: Double click on POS Outlet Bill Details to View Details for F&B transactions. Press F2 to Rename Revenue Description
              </div>

              {/* View Bill Command Buttons matching Frame 090 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="ids-btn-classic" style={{ width: '120px' }} onClick={() => alert('Reprint POS Bill')}>
                  Reprint POS Bill
                </button>
                <button className="ids-btn-classic" style={{ width: '90px' }} onClick={() => alert('Calculator')}>
                  Calculator
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '90px', fontWeight: 700 }} 
                  onClick={() => setCurrentView('bill-allowance')}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Windows XP Status Bar */}
        <div 
          className="ids-statusbar"
          style={{
            background: '#ECE9D8',
            borderTop: '1px solid #ACA899',
            padding: '3px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#444'
          }}
        >
          <div>
            System Date: <strong>{accountingDate}</strong> | User: <strong>IT ADMIN</strong>
          </div>
          <div>
            IDS Fortune NEXT V6.5.002.4 • Video 24 (Bill Allowance Batch Option)
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL POPUP 1: SELECT REVENUE DIALOG (Video 24 Frames 025–038)
          ========================================================================= */}
      {showSelectRevenue && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '380px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Select Revenue</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowSelectRevenue(false)}
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: '12px', fontSize: '11px' }}>
              {/* Insert / Delete Radio buttons */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', paddingLeft: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="actionType" 
                    checked={actionType === 'Insert'} 
                    onChange={() => setActionType('Insert')} 
                  />
                  <span>Insert</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="actionType" 
                    checked={actionType === 'Delete'} 
                    onChange={() => setActionType('Delete')} 
                  />
                  <span>Delete</span>
                </label>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: '8px', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>From Date</div>
                <div>
                  <input 
                    type="text" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ width: '150px', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                  />
                </div>

                <div style={{ fontWeight: 600 }}>To Date</div>
                <div>
                  <input 
                    type="text" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ width: '150px', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                  />
                </div>

                <div style={{ fontWeight: 600 }}>Revenue Code</div>
                <div>
                  <select 
                    value={selectedRevenueCode}
                    onChange={(e) => setSelectedRevenueCode(e.target.value)}
                    style={{ width: '150px', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                  >
                    {REVENUE_CODES.map(rc => (
                      <option key={rc.code} value={rc.code}>{rc.code} - {rc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dialog Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '70px', fontWeight: 700 }}
                  onClick={handleConfirmSelectRevenue}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '70px' }}
                  onClick={() => setShowSelectRevenue(false)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL POPUP 2: APPLY DISCOUNT DIALOG (Video 24 Frames 048–054)
          ========================================================================= */}
      {showApplyDiscount && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '320px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Apply Discount</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowApplyDiscount(false)}
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: '14px', fontSize: '11px' }}>
              {/* Radio options matching Frame 050 */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', paddingLeft: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="discountMode" 
                    checked={discountMode === 'Percentage'} 
                    onChange={() => {
                      setDiscountMode('Percentage');
                      setDiscountValue('10');
                    }} 
                  />
                  <span>Percentage</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="discountMode" 
                    checked={discountMode === 'Amount'} 
                    onChange={() => {
                      setDiscountMode('Amount');
                      setDiscountValue('425');
                    }} 
                  />
                  <span>Amount</span>
                </label>
              </div>

              {/* Dynamic Value Input matching Frame 050 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '80px', fontWeight: 600 }}>
                  {discountMode === 'Percentage' ? 'Percentage' : 'Amount'}
                </div>
                <div style={{ flex: 1 }}>
                  <input 
                    type="number" 
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '3px 6px', background: '#FFF', fontWeight: 700 }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Command Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px', fontWeight: 700 }}
                  onClick={handleExecuteApplyDiscount}
                >
                  Apply
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px' }}
                  onClick={() => setShowApplyDiscount(false)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL POPUP 3: AUTHORIZATION DIALOG (Video 24 Frames 055–065)
          ========================================================================= */}
      {showAuthorization && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '380px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Authorization</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowAuthorization(false)}
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: '14px', fontSize: '11px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: '8px', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Reason</div>
                <div>
                  <input 
                    type="text" 
                    value={authReason}
                    onChange={(e) => setAuthReason(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                  />
                </div>

                <div style={{ fontWeight: 600 }}>Remarks</div>
                <div>
                  <input 
                    type="text" 
                    value={authRemarks}
                    onChange={(e) => setAuthRemarks(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                  />
                </div>

                <div style={{ fontWeight: 600 }}>Authorized By</div>
                <div>
                  <input 
                    type="text" 
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '2px 4px', background: '#FFF', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Buttons matching Frame 060 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '80px', fontWeight: 700 }}
                  onClick={handleConfirmAuthorization}
                >
                  Confirm
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '80px' }}
                  onClick={() => setShowAuthorization(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL POPUP 4: SAVE CONFIRMATION PROMPT (Video 24 Frame 065)
          ========================================================================= */}
      {showSaveConfirmPrompt && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '320px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Bill Allowance V6.5.002.4</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowSaveConfirmPrompt(false)}
              >
                ✕
              </button>
            </div>

            {/* Prompt Content */}
            <div style={{ padding: '16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={28} color="#002D96" style={{ flexShrink: 0 }} />
              <div>
                Do you want to save allowance details for Room {selectedRoomNo}?
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: '14px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ width: '70px', fontWeight: 700 }}
                onClick={handleFinalSaveConfirm}
              >
                Yes
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ width: '70px' }}
                onClick={() => setShowSaveConfirmPrompt(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
