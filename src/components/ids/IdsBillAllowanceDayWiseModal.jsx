import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  DollarSign, Calendar, Check, X, Info, 
  HelpCircle, ChevronDown, ChevronRight, FileText, AlertCircle, ShieldCheck, Printer, RefreshCw
} from 'lucide-react';

/* =========================================================================
   VIDEO 23: BILL ALLOWANCE DAY WISE IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Entry Points:
      - Room Status V6.5.002.1 Rack Console -> Right click 311 O/DLX DEURI -> Bill Allowance (Frames 015–022)
      - Cashiering.. -> Bill Allowance Day Wise (Menu Bar)
   2. Bill Allowance V6.5.002.4 Primary Dialog (Frames 025–060):
      - Header: Room# 311, Folio # 1, Reg. # 566, Outlet: TRF
      - Name: DEURI HEMCHANDRA, Classification: Regular, Nationality: India
      - Arrival: 02-DEC-2021 12:47, Departure: 26-JAN-2022 12:00
   3. Select Revenue Dialog (Frames 025–048):
      - Radio: (•) Insert  ( ) Delete
      - From Date: 25-JAN-2022
      - To Date: 25-JAN-2022 ("Enter Same Date")
      - Revenue Code: TRF (Tariff) / CP / MIB / LAR / RES
      - [ Ok ], [ Back ]
   4. Day-Wise Grid Posting (Frames 050–060):
      - Ref. #, Date (25-JAN-2022), Description (Tariff), Amount (3,500.00)
      - Allowance: 446.40
      - Type: Discount
      - Option: -
      - Tax: Yes
      - Dynamic Tax rebate proportioning:
        * Base Allowance: 446.40
        * CGT (6%): 26.80
        * SGT (6%): 26.80
        * Total Concession: 500.00
      - Buttons: [ F&B Break ], [ Apply Discount ], [ Save ], [ Clear ], [ Panel ], [ Exit ]
   5. Authorization Dialog (Frames 065–080):
      - Reason: Guest Requested
      - Remarks: Discount Given
      - Authorized By: MANAGER
      - [ Confirm ], [ Cancel ]
   6. Integrated Folio Verification (Frames 095–115):
      - Check out V6.5.002.8 / View Bill for Room 311
      - Row 31: 26-JAN-2022 16:08 | TRF | *Tariff 311/Discount | -446.40
      - Row 32: 26-JAN-2022 16:08 | CGT | Central GST/Discount | -26.80
      - Row 33: 26-JAN-2022 16:08 | SGT | State GST/Discount | -26.80
   ========================================================================= */

export const BILL_ALLOWANCE_ROOMS = [
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
    defaultDate: '25-JAN-2022',
    outlet: 'TRF',
    tariffAmt: 3500.00,
    defaultAllowance: 446.40,
    defaultTotalDisc: 500.00,
    cgtTax: 26.80,
    sgtTax: 26.80
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
    defaultDate: '25-JAN-2022',
    outlet: 'TRF',
    tariffAmt: 3500.00,
    defaultAllowance: 312.50,
    defaultTotalDisc: 350.00,
    cgtTax: 18.75,
    sgtTax: 18.75
  },
  {
    roomNo: '315',
    category: 'EXECUTIVE (EXE)',
    guestName: 'KHAN ARIF',
    regNo: '588',
    folioNo: '1',
    resvNo: '248',
    arrival: '22-JAN-2022 14:00',
    departure: '28-JAN-2022 12:00',
    classification: 'Corporate',
    nationality: 'India',
    defaultDate: '25-JAN-2022',
    outlet: 'TRF',
    tariffAmt: 4500.00,
    defaultAllowance: 714.28,
    defaultTotalDisc: 800.00,
    cgtTax: 42.86,
    sgtTax: 42.86
  }
];

export const REVENUE_CODES_ALLOWANCE = [
  { code: 'TRF', name: 'Tariff', taxRate: 0.12 },
  { code: 'CP', name: 'Continental Plan', taxRate: 0.12 },
  { code: 'TRV', name: 'Travel Desk', taxRate: 0.05 },
  { code: 'LAR', name: 'Laundry Room', taxRate: 0.12 },
  { code: 'MIB', name: 'Minibar', taxRate: 0.18 },
  { code: 'RES', name: 'Restaurant POS', taxRate: 0.05 }
];

export default function IdsBillAllowanceDayWiseModal({
  isOpen,
  onClose,
  initialRoomNo = '311',
  accountingDate = '26-JAN-2022',
  onSaveAllowance
}) {
  // Active window view: 'bill-allowance' | 'view-folio'
  const [currentView, setCurrentView] = useState('bill-allowance');

  // Room Context
  const [selectedRoomNo, setSelectedRoomNo] = useState(initialRoomNo || '311');
  const activeRoom = BILL_ALLOWANCE_ROOMS.find(r => r.roomNo === selectedRoomNo) || BILL_ALLOWANCE_ROOMS[0];

  // Dialog Visibility states
  const [showSelectRevenue, setShowSelectRevenue] = useState(false);
  const [showAuthorization, setShowAuthorization] = useState(false);

  // Select Revenue Dialog State (Frames 025–048)
  const [actionType, setActionType] = useState('Insert'); // 'Insert' | 'Delete'
  const [fromDate, setFromDate] = useState('25-JAN-2022');
  const [toDate, setToDate] = useState('25-JAN-2022');
  const [selectedRevenueCode, setSelectedRevenueCode] = useState('TRF');

  // Day-wise Grid Row State (Frames 050–060)
  const [gridLoaded, setGridLoaded] = useState(true);
  const [rowDate, setRowDate] = useState('25-JAN-2022');
  const [rowDescription, setRowDescription] = useState('Tariff');
  const [rowAmount, setRowAmount] = useState('3500.00');
  const [allowanceInput, setAllowanceInput] = useState('446.40');
  const [allowanceType, setAllowanceType] = useState('Discount');
  const [optionType, setOptionType] = useState('-');
  const [taxIncluded, setTaxIncluded] = useState('Yes'); // 'Yes' | 'No'

  // Authorization Form State (Frames 065–080)
  const [authReason, setAuthReason] = useState('Guest Requested');
  const [authRemarks, setAuthRemarks] = useState('Discount Given');
  const [authorizedBy, setAuthorizedBy] = useState('MANAGER');

  // Notice Message
  const [statusNotice, setStatusNotice] = useState('');

  // Saved allowances history for this room session
  const [postedAllowances, setPostedAllowances] = useState([
    {
      date: '26-JAN-2022 16:08',
      resvNo: '245',
      roomNo: '311',
      regNo: '566',
      revCode: 'TRF',
      billNo: '5',
      particulars: '*Tariff 311/Discount',
      amount: -446.40
    },
    {
      date: '26-JAN-2022 16:08',
      resvNo: '245',
      roomNo: '311',
      regNo: '566',
      revCode: 'CGT',
      billNo: '5',
      particulars: 'Central GST/Discount',
      amount: -26.80
    },
    {
      date: '26-JAN-2022 16:08',
      resvNo: '245',
      roomNo: '311',
      regNo: '566',
      revCode: 'SGT',
      billNo: '5',
      particulars: 'State GST/Discount',
      amount: -26.80
    }
  ]);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      const room = BILL_ALLOWANCE_ROOMS.find(r => r.roomNo === initialRoomNo) || BILL_ALLOWANCE_ROOMS[0];
      setSelectedRoomNo(room.roomNo);
      setRowDate(room.defaultDate);
      setFromDate(room.defaultDate);
      setToDate(room.defaultDate);
      setRowAmount(room.tariffAmt.toFixed(2));
      setAllowanceInput(room.defaultAllowance.toFixed(2));
      setTaxIncluded('Yes');
      setCurrentView('bill-allowance');
      setShowSelectRevenue(false);
      setShowAuthorization(false);
      setStatusNotice('');
    }
  }, [isOpen, initialRoomNo]);

  if (!isOpen) return null;

  // Math Calculations for Tax Rebate Proportioning
  const numericAllowance = parseFloat(allowanceInput) || 0;
  const currentRevenue = REVENUE_CODES_ALLOWANCE.find(r => r.code === selectedRevenueCode) || REVENUE_CODES_ALLOWANCE[0];
  const taxRate = currentRevenue.taxRate; // e.g. 0.12 for 12% GST

  let baseAllowance = numericAllowance;
  let cgtRebate = 0;
  let sgtRebate = 0;
  let totalDeduction = numericAllowance;

  if (taxIncluded === 'Yes') {
    // When Tax is Yes, the 446.40 base gets 6% CGT (26.80) and 6% SGT (26.80) to total exactly ₹500.00
    cgtRebate = Math.round((numericAllowance * (taxRate / 2)) * 100) / 100;
    sgtRebate = Math.round((numericAllowance * (taxRate / 2)) * 100) / 100;
    totalDeduction = Math.round((numericAllowance + cgtRebate + sgtRebate) * 100) / 100;
  } else {
    // Pure base discount with 0 tax rebate
    cgtRebate = 0;
    sgtRebate = 0;
    totalDeduction = numericAllowance;
  }

  // Handle Preset Switching
  const handleApplyPreset = (roomNo) => {
    const room = BILL_ALLOWANCE_ROOMS.find(r => r.roomNo === roomNo);
    if (!room) return;
    setSelectedRoomNo(room.roomNo);
    setRowDate(room.defaultDate);
    setFromDate(room.defaultDate);
    setToDate(room.defaultDate);
    setRowAmount(room.tariffAmt.toFixed(2));
    setAllowanceInput(room.defaultAllowance.toFixed(2));
    setTaxIncluded('Yes');
    setStatusNotice(`Loaded Room ${room.roomNo} (${room.guestName}) preset`);
  };

  // Step 1: Open Select Revenue dialog
  const handleOpenSelectRevenue = () => {
    setShowSelectRevenue(true);
  };

  // Step 2: Confirm Select Revenue
  const handleConfirmSelectRevenue = () => {
    setShowSelectRevenue(false);
    setRowDate(fromDate);
    const rev = REVENUE_CODES_ALLOWANCE.find(r => r.code === selectedRevenueCode);
    setRowDescription(rev ? rev.name : 'Tariff');
    setStatusNotice(`Selected revenue code ${selectedRevenueCode} for date ${fromDate}.`);
  };

  // Step 3: Click [ Save ] on grid -> Open Authorization dialog
  const handleInitiateSave = () => {
    if (numericAllowance <= 0) {
      alert('Please enter a valid Allowance amount greater than 0.');
      return;
    }
    setShowAuthorization(true);
  };

  // Step 4: Confirm Authorization -> Finalize Allowance & Sync Folio
  const handleConfirmAuthorization = () => {
    setShowAuthorization(false);

    const newEntries = [
      {
        date: `${accountingDate} 16:08`,
        resvNo: activeRoom.resvNo,
        roomNo: selectedRoomNo,
        regNo: activeRoom.regNo,
        revCode: selectedRevenueCode,
        billNo: '5',
        particulars: `*${rowDescription} ${selectedRoomNo}/${allowanceType}`,
        amount: -baseAllowance
      }
    ];

    if (taxIncluded === 'Yes' && cgtRebate > 0) {
      newEntries.push({
        date: `${accountingDate} 16:08`,
        resvNo: activeRoom.resvNo,
        roomNo: selectedRoomNo,
        regNo: activeRoom.regNo,
        revCode: 'CGT',
        billNo: '5',
        particulars: `Central GST/${allowanceType}`,
        amount: -cgtRebate
      });
      newEntries.push({
        date: `${accountingDate} 16:08`,
        resvNo: activeRoom.resvNo,
        roomNo: selectedRoomNo,
        regNo: activeRoom.regNo,
        revCode: 'SGT',
        billNo: '5',
        particulars: `State GST/${allowanceType}`,
        amount: -sgtRebate
      });
    }

    setPostedAllowances(prev => [...newEntries, ...prev]);

    if (onSaveAllowance) {
      onSaveAllowance({
        roomNo: selectedRoomNo,
        guestName: activeRoom.guestName,
        baseAllowance,
        cgtRebate,
        sgtRebate,
        totalDeduction,
        reason: authReason,
        remarks: authRemarks,
        authorizedBy,
        date: accountingDate
      });
    }

    setStatusNotice(`✓ Allowance of ₹${totalDeduction.toFixed(2)} posted successfully with authorization.`);
    setCurrentView('view-folio');
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Top Tutorial Guidance Banner */}
      <div 
        style={{
          width: '840px',
          maxWidth: '96vw',
          margin: '0 auto 6px auto',
          background: 'linear-gradient(180deg, #1A365D 0%, #0F2942 100%)',
          color: '#FFF',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #3182CE',
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#3182CE', color: '#FFF', padding: '2px 7px', borderRadius: '3px', fontWeight: 800 }}>
            VIDEO 23
          </span>
          <span style={{ fontWeight: 700, color: '#EBF8FF' }}>
            Bill Allowance Day Wise Option in IDS 6.5 & 7.0 PMS
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#A0AEC0', fontSize: '10px' }}>Presets:</span>
          {BILL_ALLOWANCE_ROOMS.map(demo => (
            <button
              key={demo.roomNo}
              onClick={() => handleApplyPreset(demo.roomNo)}
              style={{
                background: selectedRoomNo === demo.roomNo ? '#F6E05E' : '#2D3748',
                color: selectedRoomNo === demo.roomNo ? '#000' : '#FFF',
                border: '1px solid #4A5568',
                padding: '2px 6px',
                fontSize: '10px',
                borderRadius: '2px',
                fontWeight: selectedRoomNo === demo.roomNo ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              Room {demo.roomNo} ({demo.guestName.split(' ')[0]})
            </button>
          ))}
          <button 
            onClick={onClose}
            style={{
              background: '#E53E3E',
              color: '#FFF',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '2px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* =========================================================================
          SCREEN 1: BILL ALLOWANCE V6.5.002.4 (Video 23 Frames 025–060)
         ========================================================================= */}
      {currentView === 'bill-allowance' && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '820px', 
            maxWidth: '96vw', 
            background: '#ECE9D8',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'Tahoma, Arial, sans-serif',
            position: 'relative'
          }}
        >
          {/* Classic Window Titlebar */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} />
              <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
                Bill Allowance V6.5.002.4
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
            </div>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {/* Header Details Form (Video 23 Frames 025 & 050) */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', marginBottom: '8px', borderBottom: '1px solid #716F64', paddingBottom: '8px' }}>
              {/* Left Column */}
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '65px', fontWeight: 600 }}>Room#</span>
                  <input 
                    className="ids-input" 
                    value={selectedRoomNo} 
                    onChange={(e) => setSelectedRoomNo(e.target.value)} 
                    style={{ width: '70px', fontWeight: 700, background: '#FFF' }} 
                  />
                  <button className="ids-btn-classic" onClick={handleOpenSelectRevenue} style={{ width: '22px', height: '20px', padding: 0, fontWeight: 700 }}>?</button>
                  <button className="ids-btn-classic" onClick={handleOpenSelectRevenue} style={{ fontSize: '10px', height: '20px', padding: '1px 5px' }}>Date Filter</button>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '65px', fontWeight: 600 }}>Folio #</span>
                  <input className="ids-input" readOnly value={activeRoom.folioNo} style={{ width: '70px', background: '#F5F5F5' }} />
                  <button className="ids-btn-classic" style={{ fontSize: '10px', height: '20px', padding: '1px 6px' }}>More...</button>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '65px', fontWeight: 600 }}>Reg. #</span>
                  <input className="ids-input" readOnly value={activeRoom.regNo} style={{ width: '70px', background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ width: '65px', fontWeight: 600 }}>Outlet</span>
                  <input className="ids-input" readOnly value={selectedRevenueCode} style={{ width: '70px', fontWeight: 700, background: '#FFF' }} />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '85px', fontWeight: 600 }}>Name</span>
                  <input className="ids-input" readOnly value={activeRoom.guestName} style={{ flex: 1, fontWeight: 700, background: '#FFF' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '85px', fontWeight: 600 }}>Classification</span>
                  <input className="ids-input" readOnly value={activeRoom.classification} style={{ width: '130px', background: '#F5F5F5' }} />
                  <span style={{ width: '70px', fontWeight: 600, textAlign: 'right' }}>Nationality</span>
                  <input className="ids-input" readOnly value={activeRoom.nationality} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ width: '85px', fontWeight: 600 }}>Arrival</span>
                  <input className="ids-input" readOnly value={activeRoom.arrival} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ width: '85px', fontWeight: 600 }}>Departure</span>
                  <input className="ids-input" readOnly value={activeRoom.departure} style={{ flex: 1, background: '#F5F5F5' }} />
                </div>
              </div>
            </div>

            {/* Day-Wise Transactions Table Grid (Video 23 Frames 050–060) */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#E0DFE3', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left', width: '50px' }}>Ref. #</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left', width: '90px' }}>Date</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left', width: '110px' }}>Description</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'right', width: '85px' }}>Amount</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'right', width: '95px' }}>Allowance</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'center', width: '90px' }}>Type</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'center', width: '55px' }}>Option</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'center', width: '60px' }}>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Active Day-Wise Row matching Video 23 Frame 050 & 060 */}
                    <tr style={{ background: '#FFF7CC' }}>
                      <td style={{ border: '1px solid #D4D0C8', padding: '3px 6px', color: '#555' }}>—</td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '3px 6px', fontWeight: 600 }}>{rowDate}</td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '3px 6px', fontWeight: 600 }}>{rowDescription}</td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>
                        {parseFloat(rowAmount).toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '2px 4px', textAlign: 'right' }}>
                        <input 
                          className="ids-input"
                          value={allowanceInput}
                          onChange={(e) => setAllowanceInput(e.target.value)}
                          style={{ width: '85px', textAlign: 'right', fontWeight: 800, color: '#C53030', background: '#FFF' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '2px 4px', textAlign: 'center' }}>
                        <select 
                          className="ids-input"
                          value={allowanceType}
                          onChange={(e) => setAllowanceType(e.target.value)}
                          style={{ width: '80px', fontSize: '10px' }}
                        >
                          <option value="Discount">Discount</option>
                          <option value="Allowance">Allowance</option>
                          <option value="Rebate">Rebate</option>
                          <option value="Correction">Correction</option>
                        </select>
                      </td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '2px 4px', textAlign: 'center' }}>
                        <select 
                          className="ids-input"
                          value={optionType}
                          onChange={(e) => setOptionType(e.target.value)}
                          style={{ width: '45px', fontSize: '10px' }}
                        >
                          <option value="-">-</option>
                          <option value="%">%</option>
                          <option value="Flat">Flat</option>
                        </select>
                      </td>
                      <td style={{ border: '1px solid #D4D0C8', padding: '2px 4px', textAlign: 'center' }}>
                        <select 
                          className="ids-input"
                          value={taxIncluded}
                          onChange={(e) => setTaxIncluded(e.target.value)}
                          style={{ width: '50px', fontWeight: 700, color: taxIncluded === 'Yes' ? '#276749' : '#000' }}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                    {/* Empty rows for visual authentic feel */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} style={{ height: '20px', background: i % 2 === 0 ? '#FAFAFA' : '#FFF' }}>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                        <td style={{ border: '1px solid #EBEBEB' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Tax Proportioning Summary Strip matching Video 23 */}
            <div 
              style={{ 
                border: '1px solid #B0AB9A', 
                background: '#F5F3E9', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px',
                borderRadius: '2px',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ color: '#444' }}>
                  Base Allowance: <strong>₹{baseAllowance.toFixed(2)}</strong>
                </span>
                {taxIncluded === 'Yes' && (
                  <>
                    <span style={{ color: '#2C5282' }}>
                      CGT (6%): <strong>₹{cgtRebate.toFixed(2)}</strong>
                    </span>
                    <span style={{ color: '#2C5282' }}>
                      SGT (6%): <strong>₹{sgtRebate.toFixed(2)}</strong>
                    </span>
                  </>
                )}
                <span style={{ background: '#C53030', color: '#FFF', padding: '1px 6px', borderRadius: '2px', fontWeight: 800 }}>
                  Total Concession: ₹{totalDeduction.toFixed(2)}
                </span>
              </div>
              <button 
                className="ids-btn-classic"
                onClick={() => setCurrentView('view-folio')}
                style={{ fontSize: '10px', fontWeight: 600, color: '#0A246A' }}
              >
                🔍 Inspect Live Folio (View Bill)
              </button>
            </div>

            {/* Bottom Command Buttons matching Video 23 Frame 060 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #716F64', paddingTop: '6px' }}>
              <div style={{ fontSize: '10px', color: '#0A246A', fontStyle: 'italic' }}>
                {statusNotice || 'Click [ Save ] to enter reason & authorized by credentials.'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '70px' }}>F&B Break</button>
                <button 
                  className="ids-btn-classic" 
                  onClick={handleOpenSelectRevenue}
                  style={{ minWidth: '85px' }}
                >
                  Apply Discount
                </button>
                <button 
                  className="ids-btn-classic" 
                  onClick={handleInitiateSave}
                  style={{ minWidth: '70px', fontWeight: 700, color: '#0A246A', background: '#FFF7CC' }}
                  title="Save Allowance with Authorization (Video 23 Frame 060)"
                >
                  Save
                </button>
                <button 
                  className="ids-btn-classic" 
                  onClick={() => setAllowanceInput('0.00')}
                  style={{ minWidth: '60px' }}
                >
                  Clear
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
                <button className="ids-btn-classic" onClick={onClose} style={{ minWidth: '60px', color: '#800' }}>Exit</button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              MODAL POPUP 1: SELECT REVENUE (Video 23 Frames 025–048)
             ========================================================================= */}
          {showSelectRevenue && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300
              }}
            >
              <div 
                style={{
                  width: '320px',
                  background: '#ECE9D8',
                  border: '2px solid #FFF',
                  borderRightColor: '#716F64',
                  borderBottomColor: '#716F64',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
              >
                {/* Title Bar */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                    color: '#FFF',
                    padding: '2px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  <span>Select Revenue</span>
                  <button className="ids-win-btn close" onClick={() => setShowSelectRevenue(false)} style={{ width: '14px', height: '12px', fontSize: '8px' }}>✕</button>
                </div>

                <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                  {/* Radio Buttons (Insert / Delete) */}
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="actType" 
                        checked={actionType === 'Insert'} 
                        onChange={() => setActionType('Insert')} 
                      />
                      <span>Insert</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="actType" 
                        checked={actionType === 'Delete'} 
                        onChange={() => setActionType('Delete')} 
                      />
                      <span>Delete</span>
                    </label>
                  </div>

                  {/* From Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                    <span>From Date</span>
                    <input 
                      className="ids-input"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{ width: '100%', background: '#FFF', fontWeight: 600 }}
                    />
                  </div>

                  {/* To Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                    <span>To Date</span>
                    <input 
                      className="ids-input"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ width: '100%', background: '#FFF', fontWeight: 600 }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#C53030', marginBottom: '6px', textAlign: 'right', fontWeight: 700 }}>
                    * Enter Same Date (Video 23 Frame 035)
                  </div>

                  {/* Revenue Code Dropdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                    <span>Revenue Code</span>
                    <select 
                      className="ids-input"
                      value={selectedRevenueCode}
                      onChange={(e) => setSelectedRevenueCode(e.target.value)}
                      style={{ width: '100%', fontWeight: 700, background: '#FFF' }}
                    >
                      {REVENUE_CODES_ALLOWANCE.map(r => (
                        <option key={r.code} value={r.code}>
                          {r.code} - {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      className="ids-btn-classic" 
                      onClick={handleConfirmSelectRevenue}
                      style={{ minWidth: '65px', height: '24px', fontWeight: 700, color: '#0A246A' }}
                    >
                      Ok
                    </button>
                    <button 
                      className="ids-btn-classic" 
                      onClick={() => setShowSelectRevenue(false)}
                      style={{ minWidth: '65px', height: '24px' }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODAL POPUP 2: AUTHORIZATION (Video 23 Frames 065–080)
             ========================================================================= */}
          {showAuthorization && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1350
              }}
            >
              <div 
                style={{
                  width: '360px',
                  background: '#ECE9D8',
                  border: '2px solid #FFF',
                  borderRightColor: '#716F64',
                  borderBottomColor: '#716F64',
                  boxShadow: '0 8px 26px rgba(0,0,0,0.5)',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
              >
                {/* Title Bar */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                    color: '#FFF',
                    padding: '2px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} />
                    <span>Authorization</span>
                  </div>
                  <button className="ids-win-btn close" onClick={() => setShowAuthorization(false)} style={{ width: '14px', height: '12px', fontSize: '8px' }}>✕</button>
                </div>

                <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                  {/* Reason (Video 23 Frame 075: "Guest Requested") */}
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Reason</span>
                    <input 
                      className="ids-input"
                      value={authReason}
                      onChange={(e) => setAuthReason(e.target.value)}
                      style={{ width: '100%', background: '#FFF', fontWeight: 600 }}
                    />
                  </div>

                  {/* Remarks (Video 23 Frame 075: "Discount Given") */}
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Remarks</span>
                    <input 
                      className="ids-input"
                      value={authRemarks}
                      onChange={(e) => setAuthRemarks(e.target.value)}
                      style={{ width: '100%', background: '#FFF' }}
                    />
                  </div>

                  {/* Authorized By */}
                  <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Authorized By</span>
                    <input 
                      className="ids-input"
                      value={authorizedBy}
                      onChange={(e) => setAuthorizedBy(e.target.value)}
                      style={{ width: '100%', background: '#FFF', fontWeight: 700 }}
                    />
                  </div>

                  {/* Concession Confirmation Note */}
                  <div 
                    style={{ 
                      background: '#FFF7CC', 
                      border: '1px solid #D69E2E', 
                      padding: '5px 8px', 
                      fontSize: '10px', 
                      color: '#744210',
                      marginBottom: '12px',
                      borderRadius: '2px'
                    }}
                  >
                    Will post credit entries totaling ₹{totalDeduction.toFixed(2)} to Room #{selectedRoomNo} folio.
                  </div>

                  {/* Buttons matching Video 23 Frame 065 */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button 
                      className="ids-btn-classic" 
                      onClick={handleConfirmAuthorization}
                      style={{ minWidth: '70px', height: '24px', fontWeight: 700, color: '#0A246A' }}
                    >
                      Confirm
                    </button>
                    <button 
                      className="ids-btn-classic" 
                      onClick={() => setShowAuthorization(false)}
                      style={{ minWidth: '70px', height: '24px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: FOLIO BILL VERIFICATION (Video 23 Frames 095–115)
          Displays Check-out V6.5.002.8 / View Bill with 3 credit lines
         ========================================================================= */}
      {currentView === 'view-folio' && (
        <div 
          className="ids-dialog-window" 
          style={{ 
            width: '840px', 
            maxWidth: '96vw', 
            background: '#ECE9D8',
            border: '2px solid #FFF',
            borderRightColor: '#716F64',
            borderBottomColor: '#716F64',
            boxShadow: '0 10px 32px rgba(0,0,0,0.5)',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}
        >
          {/* Title Bar */}
          <div 
            className="ids-dialog-titlebar plain" 
            style={{ 
              background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
              color: '#FFF',
              padding: '3px 6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
              Check out V6.5.002.8 - View Bill (Room #{selectedRoomNo} - {activeRoom.guestName})
            </span>
            <button className="ids-win-btn close" onClick={onClose} style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>✕</button>
          </div>

          <div style={{ padding: '8px 12px', fontSize: '11px' }}>
            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#F5F3E9', border: '1px solid #716F64', padding: '6px 8px', marginBottom: '8px' }}>
              <div>Room#: <strong>{selectedRoomNo}</strong></div>
              <div>Folio#: <strong>{activeRoom.folioNo} / Direct</strong></div>
              <div>Reg#: <strong>{activeRoom.regNo}</strong></div>
              <div>Resv#: <strong>{activeRoom.resvNo}</strong></div>
            </div>

            {/* View Bill Table Grid (Video 23 Frames 105 & 115) */}
            <div style={{ border: '1px solid #716F64', background: '#FFF', marginBottom: '8px' }}>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#E0DFE3', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '30px' }}>Sl #</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left', width: '110px' }}>Date</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '40px' }}>Resv#</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '40px' }}>Room#</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '40px' }}>Reg#</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '50px' }}>RevCod</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 4px', width: '35px' }}>Bill #</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'left' }}>Particulars</th>
                      <th style={{ border: '1px solid #B0AB9A', padding: '3px 6px', textAlign: 'right', width: '75px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample Prior Ledger Entries matching Video 23 Frame 105 */}
                    {[
                      { sl: 25, date: '25-JAN-2022 16:01', rev: 'TRF', bill: '', part: 'Tariff 311', amt: 3500.00 },
                      { sl: 26, date: '25-JAN-2022 16:01', rev: 'CGT', bill: '', part: 'Central GST', amt: 210.00 },
                      { sl: 27, date: '25-JAN-2022 16:01', rev: 'SGT', bill: '', part: 'State GST', amt: 210.00 },
                      { sl: 28, date: '25-JAN-2022 16:01', rev: 'CP', bill: '', part: 'Continental Plan 311', amt: 500.00 },
                      { sl: 29, date: '25-JAN-2022 16:01', rev: 'SGT', bill: '', part: 'State GST', amt: 30.00 },
                      { sl: 30, date: '25-JAN-2022 16:01', rev: 'CGT', bill: '', part: 'Central GST', amt: 30.00 }
                    ].map(row => (
                      <tr key={row.sl} style={{ background: '#FFF' }}>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{row.sl}</td>
                        <td style={{ border: '1px solid #EBEBEB', padding: '2px 6px' }}>{row.date}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{activeRoom.resvNo}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{selectedRoomNo}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{activeRoom.regNo}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{row.rev}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'center' }}>{row.bill}</td>
                        <td style={{ border: '1px solid #EBEBEB', padding: '2px 6px' }}>{row.part}</td>
                        <td style={{ border: '1px solid #EBEBEB', textAlign: 'right', padding: '2px 6px' }}>{row.amt.toFixed(2)}</td>
                      </tr>
                    ))}

                    {/* Newly Created Day-Wise Allowance Rows (Rows 31, 32, 33) matching Video 23 Frame 105 */}
                    {postedAllowances.map((item, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          background: '#FFF5F5', 
                          fontWeight: 700, 
                          color: '#C53030'
                        }}
                      >
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{31 + idx}</td>
                        <td style={{ border: '1px solid #FEB2B2', padding: '2px 6px' }}>{item.date}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{item.resvNo}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{item.roomNo}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{item.regNo}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{item.revCode}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'center' }}>{item.billNo}</td>
                        <td style={{ border: '1px solid #FEB2B2', padding: '2px 6px' }}>{item.particulars}</td>
                        <td style={{ border: '1px solid #FEB2B2', textAlign: 'right', padding: '2px 6px' }}>
                          {item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Note & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #716F64', paddingTop: '6px' }}>
              <div style={{ fontSize: '10px', color: '#276749', fontWeight: 600 }}>
                ✓ Rows 31–33 show the day-wise allowance credited with automatic GST breakdown.
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="ids-btn-classic" 
                  onClick={() => setCurrentView('bill-allowance')}
                  style={{ fontWeight: 600 }}
                >
                  ← Back to Bill Allowance
                </button>
                <button 
                  className="ids-btn-classic" 
                  onClick={onClose}
                  style={{ fontWeight: 700, color: '#0A246A' }}
                >
                  Close & Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
