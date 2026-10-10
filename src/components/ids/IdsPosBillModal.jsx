import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Printer, Check, X, Search, FileText, ChevronRight, AlertCircle, ArrowRight,
  Split, Layers, RotateCcw, Info, CheckSquare, Square, DollarSign, Percent
} from 'lucide-react';
import { HOTEL_CONFIG } from '../../data/hotelData';
import IdsPosBillSettlementModal from './IdsPosBillSettlementModal';

// Authentic Pending KOTs Registry for Bill Printing (Videos 03 & 09)
export const DEFAULT_BILL_KOTS = [
  {
    tableNo: '14',
    kotNo: '1314',
    server: 'Biren',
    outlet: 'RESTAURANT',
    session: 'General',
    accountingDate: '03-FEB-2022',
    covers: '1',
    items: [
      { code: '1', kotNo: '1314', name: 'CLASSIC RUSSIAN SALAD', type: 'Food', group: 'SALAD BAR', quantity: 2.0, rate: 199.0, value: 398.0 },
      { code: '2', kotNo: '1314', name: 'RED BEANS PEANUT & DRY FRUIT', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '3', kotNo: '1314', name: 'SPROUTED MOONG PEANUT DRY', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '4', kotNo: '1314', name: 'CAESAR SALAD (VEG)', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 245.0, value: 245.0 }
    ],
    totalAmount: 1041.0,
    cgst: 26.04,
    sgst: 26.04,
    nettAmount: 1093.0
  },
  {
    tableNo: '11',
    kotNo: '1315',
    server: 'Biren',
    outlet: 'RESTAURANT',
    session: 'General',
    accountingDate: '03-FEB-2022',
    covers: '1',
    items: [
      { code: '1', kotNo: '1315', name: 'Russian Salad', originalName: 'CLASSIC RUSSIAN SALAD', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0, isRenamed: true },
      { code: '2', kotNo: '1315', name: 'Peanut', originalName: 'RED BEANS PEANUT & DRY FRUIT', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0, isRenamed: true }
    ],
    totalAmount: 398.0,
    cgst: 9.96,
    sgst: 9.96,
    nettAmount: 418.0
  },
  {
    tableNo: '10',
    kotNo: '1312',
    server: 'Manash',
    outlet: 'RESTAURANT',
    session: 'General',
    accountingDate: '03-FEB-2022',
    covers: '2',
    items: [
      { code: '1', kotNo: '1312', name: 'Classic Russian Salad .', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '2', kotNo: '1312', name: 'Red Beans Peanut _Dry', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '3', kotNo: '1312', name: 'Sprouted Moong Peanut D', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 }
    ],
    totalAmount: 597.0,
    cgst: 14.93,
    sgst: 14.93,
    nettAmount: 627.0
  },
  {
    tableNo: '12',
    kotNo: '1316',
    server: 'Biren',
    outlet: 'RESTAURANT',
    session: 'General',
    accountingDate: '03-FEB-2022',
    covers: '2',
    items: [
      { code: '1', kotNo: '1316', name: 'CLASSIC RUSSIAN SALAD', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '2', kotNo: '1316', name: 'RED BEANS PEANUT & DRY FRUIT', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '3', kotNo: '1316', name: 'SPROUTED MOONG PEANUT DRY', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
      { code: '4', kotNo: '1316', name: 'CAESAR SALAD (VEG)', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 245.0, value: 245.0 }
    ],
    totalAmount: 842.0,
    cgst: 21.05,
    sgst: 21.05,
    nettAmount: 884.0
  }
];

export default function IdsPosBillModal({
  isOpen,
  onClose,
  initialTableNo = '14',
  accountingDate = '03-FEB-2022',
  outlet = 'RESTAURANT',
  session = 'General',
  steward = 'Biren',
  kots = [],
  onBillPrinted,
  onBillSettled,
  onOpenCrystalReport
}) {
  const [tableNo, setTableNo] = useState(initialTableNo);
  const [covers, setCovers] = useState('1');
  const [currentSteward, setCurrentSteward] = useState(steward);
  const [memberCode, setMemberCode] = useState('');
  const [itemsViewVisible, setItemsViewVisible] = useState(true);
  const [billNumber, setBillNumber] = useState('');
  const [printSuccessMsg, setPrintSuccessMsg] = useState(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  // Table Help lookup modal
  const [tableHelpOpen, setTableHelpOpen] = useState(false);
  const [selectedTableLookupIdx, setSelectedTableLookupIdx] = useState(0);

  // Split Assignments Engine (Video 09 Frames 021 - 060)
  // Map of item index -> split number (e.g. { 0: 1, 1: 1, 2: 1, 3: 1 })
  const [itemSplitAssignments, setItemSplitAssignments] = useState({ 0: 1, 1: 1, 2: 1, 3: 1 });
  const [splitBillNumbers, setSplitBillNumbers] = useState({});
  const [activeBillIdx, setActiveBillIdx] = useState(0);
  const [selectedBillIndices, setSelectedBillIndices] = useState([1]); // Array of selected split IDs

  // Modal Dialog states matching Video 09
  const [splitBillModalOpen, setSplitBillModalOpen] = useState(false);
  const [tempSplitAssignments, setTempSplitAssignments] = useState({ 0: 1, 1: 1, 2: 1, 3: 1 });
  const [viewKotModalOpen, setViewKotModalOpen] = useState(false);
  const [viewKotSelectedSplitId, setViewKotSelectedSplitId] = useState(null);
  const [gstInfoModalOpen, setGstInfoModalOpen] = useState(false);
  const [gstInfoBillData, setGstInfoBillData] = useState(null);
  const [splitQtyModalOpen, setSplitQtyModalOpen] = useState(false);
  const [splitEqualModalOpen, setSplitEqualModalOpen] = useState(false);
  const [equalSplitCount, setEqualSplitCount] = useState(2);

  // Determine active KOT based on selected table
  const activeKot = useMemo(() => {
    // 1. Check passed kots from props
    const propFound = kots.find(k => String(k.tableNo) === String(tableNo));
    if (propFound) return propFound;

    // 2. Check DEFAULT_BILL_KOTS registry (Table 14 Video 09 or Table 10 Video 03)
    const defaultFound = DEFAULT_BILL_KOTS.find(k => String(k.tableNo) === String(tableNo));
    if (defaultFound) return defaultFound;

    // 3. Fallback to Table 14 Salad Bar items (Video 09 Frame 018)
    return DEFAULT_BILL_KOTS[0];
  }, [kots, tableNo]);

  // Sync covers and steward when activeKot changes
  useEffect(() => {
    if (activeKot) {
      if (activeKot.covers) setCovers(String(activeKot.covers));
      if (activeKot.server) setCurrentSteward(activeKot.server);
      // Reset split assignments to 1 when changing tables
      const initialMap = {};
      activeKot.items.forEach((_, idx) => { initialMap[idx] = 1; });
      setItemSplitAssignments(initialMap);
      setSelectedBillIndices([1]);
      setActiveBillIdx(0);
    }
  }, [activeKot]);

  // Dynamic Split Bills Partition Engine (Video 09 Frames 025 - 058)
  const splitBillsList = useMemo(() => {
    if (!activeKot || !activeKot.items) return [];

    const groups = {};
    activeKot.items.forEach((item, idx) => {
      const splitId = Number(itemSplitAssignments[idx]) || 1;
      if (!groups[splitId]) {
        groups[splitId] = {
          splitId,
          items: [],
          totalQty: 0,
          value: 0
        };
      }
      const itemVal = item.value || (item.quantity * item.rate);
      groups[splitId].items.push({ ...item, itemIndex: idx });
      groups[splitId].totalQty += (Number(item.quantity) || 1);
      groups[splitId].value += itemVal;
    });

    const sortedGroupKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
    return sortedGroupKeys.map((splitId, index) => {
      const g = groups[splitId];
      const rawValue = g.value;
      const tax = Number((rawValue * 0.05).toFixed(2)); // 5% GST (2.5% CGST + 2.5% SGST)
      const exactNett = rawValue + tax;
      const roundedNett = Math.round(exactNett);
      const roundOff = Number((roundedNett - exactNett).toFixed(2));
      const displayBillNo = splitBillNumbers[splitId] || (billNumber ? `${billNumber}${sortedGroupKeys.length > 1 ? `-${splitId}` : ''}` : '');

      return {
        splitId,
        billSeq: index + 1,
        items: g.items,
        totalQty: g.totalQty,
        value: rawValue,
        discount: '0.00 / 0.00%',
        tax,
        cgst: Number((tax / 2).toFixed(2)),
        sgst: Number((tax / 2).toFixed(2)),
        roundOff,
        nettValue: roundedNett,
        billNo: displayBillNo
      };
    });
  }, [activeKot, itemSplitAssignments, splitBillNumbers, billNumber]);

  // Ensure active bill index is within bounds
  const currentActiveBill = useMemo(() => {
    if (splitBillsList.length === 0) return null;
    return splitBillsList[activeBillIdx] || splitBillsList[0];
  }, [splitBillsList, activeBillIdx]);

  // Red KOT items string for the currently focused bill (Frame 027)
  const kotsDisplayString = useMemo(() => {
    if (!currentActiveBill || !currentActiveBill.items) return '';
    return currentActiveBill.items.map(it => `${activeKot.kotNo} ${it.name} ${Math.round(it.quantity)}`).join(', ');
  }, [currentActiveBill, activeKot]);

  // Toggle <A> (Select All Bills) matching Video 09 Frame 033 - 034
  const handleToggleSelectAll = () => {
    if (selectedBillIndices.length === splitBillsList.length) {
      // If all currently selected, deselect all except active bill
      const activeSplitId = currentActiveBill?.splitId || 1;
      setSelectedBillIndices([activeSplitId]);
    } else {
      // Select all split bills
      setSelectedBillIndices(splitBillsList.map(b => b.splitId));
    }
  };

  // Toggle selection for an individual bill row
  const handleToggleRowSelection = (splitId, index) => {
    setActiveBillIdx(index);
    if (selectedBillIndices.includes(splitId)) {
      if (selectedBillIndices.length > 1) {
        setSelectedBillIndices(prev => prev.filter(id => id !== splitId));
      }
    } else {
      setSelectedBillIndices(prev => [...prev, splitId]);
    }
  };

  // Open View KOT Modal for a specific split bill or general
  const handleOpenViewKot = (splitId = null) => {
    setViewKotSelectedSplitId(splitId);
    setViewKotModalOpen(true);
  };

  // Items to show in View KOT Modal
  const viewKotDisplayItems = useMemo(() => {
    if (viewKotSelectedSplitId !== null) {
      const found = splitBillsList.find(b => b.splitId === viewKotSelectedSplitId);
      if (found) return { items: found.items, totalQty: found.totalQty, splitId: found.splitId };
    }
    if (currentActiveBill) {
      return { items: currentActiveBill.items, totalQty: currentActiveBill.totalQty, splitId: currentActiveBill.splitId };
    }
    return { items: activeKot.items, totalQty: activeKot.items.reduce((s, it) => s + it.quantity, 0), splitId: 1 };
  }, [viewKotSelectedSplitId, splitBillsList, currentActiveBill, activeKot]);

  // Open Split Bill modal (Frame 021)
  const handleOpenSplitBill = () => {
    setTempSplitAssignments({ ...itemSplitAssignments });
    setSplitBillModalOpen(true);
  };

  // Apply Split Bill assignments (Frame 025 & 058)
  const handleApplySplitBill = () => {
    setItemSplitAssignments(tempSplitAssignments);
    setSplitBillModalOpen(false);

    const uniqueSplits = Array.from(new Set(Object.values(tempSplitAssignments).map(Number)));
    setSelectedBillIndices(uniqueSplits);
    setActiveBillIdx(0);

    if (uniqueSplits.length === 1) {
      setPrintSuccessMsg('Bills Merged into Single Bill #1!');
    } else {
      setPrintSuccessMsg(`Bill successfully split into ${uniqueSplits.length} parts!`);
    }
    setTimeout(() => setPrintSuccessMsg(null), 3500);
  };

  // Apply Equal Split
  const handleApplyEqualSplit = (count) => {
    const newMap = {};
    activeKot.items.forEach((_, idx) => {
      newMap[idx] = (idx % count) + 1;
    });
    setItemSplitAssignments(newMap);
    setSplitEqualModalOpen(false);
    const uniqueSplits = Array.from({ length: count }, (_, i) => i + 1);
    setSelectedBillIndices(uniqueSplits);
    setActiveBillIdx(0);
    setPrintSuccessMsg(`Bill split equally into ${count} parts!`);
    setTimeout(() => setPrintSuccessMsg(null), 3500);
  };

  // Print Bill Routine for Selected Bills (Frames 034 & 037)
  const handlePrintBills = (isProvisional = false) => {
    const billsToPrint = splitBillsList.filter(b => selectedBillIndices.includes(b.splitId));
    if (billsToPrint.length === 0) return;

    const newBillNumbers = { ...splitBillNumbers };
    const printedBillNos = [];

    billsToPrint.forEach((bill, idx) => {
      const generatedBillNo = bill.billNo || `B-${Math.floor(1000 + Math.random() * 9000)}${billsToPrint.length > 1 ? `-${bill.splitId}` : ''}`;
      newBillNumbers[bill.splitId] = generatedBillNo;
      printedBillNos.push(generatedBillNo);

      if (onBillPrinted) {
        onBillPrinted({
          billNo: generatedBillNo,
          tableNo: tableNo,
          outlet: outlet,
          steward: currentSteward,
          items: bill.items,
          value: bill.value,
          tax: bill.tax,
          nettValue: bill.nettValue,
          isProvisional: isProvisional,
          splitId: bill.splitId
        });
      }

      if (onOpenCrystalReport) {
        onOpenCrystalReport({
          reportType: 'pos-bill',
          data: {
            billNo: generatedBillNo,
            tableNo: tableNo,
            server: currentSteward,
            outlet: outlet,
            accountingDate: accountingDate,
            items: bill.items,
            subTotal: bill.value,
            cgst: bill.cgst,
            sgst: bill.sgst,
            total: bill.nettValue,
            isProvisional: isProvisional,
            splitPart: billsToPrint.length > 1 ? `${idx + 1} of ${billsToPrint.length}` : null
          }
        });
      }
    });

    setSplitBillNumbers(newBillNumbers);
    if (!billNumber && printedBillNos.length > 0) {
      setBillNumber(printedBillNos[0]);
    }

    setPrintSuccessMsg(`${isProvisional ? 'Provisional ' : ''}Bill(s) #${printedBillNos.join(', ')} Generated & Sent to Printer!`);
    setTimeout(() => setPrintSuccessMsg(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Dialog Window matching Video 03 Frame 021 & Video 09 Frame 016 */}
      <div 
        className="ids-modal-container" 
        style={{ 
          width: '760px', 
          maxWidth: '96vw', 
          background: '#ECE9D8', 
          border: '2px solid #808080', 
          boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' 
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '3px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '12px' }}>Bill</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
        </div>

        {/* Header Controls (Video 09 Frame 016) */}
        <div style={{ padding: '8px 12px', background: '#ECE9D8', fontSize: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 1fr', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '50px', fontWeight: 600 }}>Table #</label>
              <input 
                type="text" 
                value={tableNo} 
                onChange={e => setTableNo(e.target.value)}
                style={{ width: '45px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
              />
              <button 
                className="ids-btn" 
                title="Lookup Pending Tables"
                onClick={() => setTableHelpOpen(true)}
                style={{ padding: '1px 5px', fontSize: '11px', fontWeight: 700 }}
              >
                ?
              </button>
            </div>
            <div style={{ textAlign: 'center', fontWeight: 700 }}>{accountingDate}</div>
            <div style={{ textAlign: 'center', fontWeight: 700 }}>{outlet}</div>
            <div style={{ textAlign: 'center', fontWeight: 700 }}>{session}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '50px', fontWeight: 600 }}>Covers</label>
              <input 
                type="text" 
                value={covers} 
                onChange={e => setCovers(e.target.value)}
                style={{ width: '40px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
              <button className="ids-btn" style={{ padding: '1px 4px', fontSize: '10px', fontWeight: 600 }}>RD</button>
            </div>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', height: '20px', padding: '2px 6px', fontSize: '11px', color: '#555' }}>
              {activeKot?.guestName || ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <label style={{ width: '50px', fontWeight: 600 }}>Server</label>
            <input 
              type="text" 
              readOnly 
              value={currentSteward} 
              style={{ width: '100px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
            />
            <input 
              type="text" 
              readOnly 
              value={currentSteward.toUpperCase()} 
              style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
            />
          </div>

          {/* Orange Accent Divider Bar (Video 09 Frame 016) */}
          <div style={{ height: '8px', background: '#FFE4B5', border: '1px solid #FFB871', margin: '4px 0 8px 0' }}></div>
        </div>

        {/* Feedback message banner */}
        {printSuccessMsg && (
          <div style={{ background: '#D4EDDA', borderBottom: '1px solid #C3E6CB', color: '#155724', padding: '3px 12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{printSuccessMsg}</span>
          </div>
        )}

        {/* Main Bill Table Grid (Video 09 Frames 021, 029, 034, 054) */}
        <div style={{ padding: '0 12px', background: '#ECE9D8' }}>
          <div style={{ height: '215px', background: '#FFF', border: '1px solid #808080', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#FFE4B5', borderBottom: '1px solid #808080', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '3px 4px', borderRight: '1px solid #D0D0D0', width: '42px', textAlign: 'center' }}>
                    Bill
                  </th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '38px' }}>RES</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '42px' }}>Cur.</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '75px' }}>Bill #</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '75px', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '90px', textAlign: 'center' }}>Discount</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Tax</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '55px', textAlign: 'right' }}>Rnd.off</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', width: '85px' }}>Nett Value</th>
                </tr>
              </thead>
              <tbody>
                {splitBillsList.map((bill, index) => {
                  const isSelected = selectedBillIndices.includes(bill.splitId);
                  const isActive = activeBillIdx === index;
                  return (
                    <tr 
                      key={bill.splitId} 
                      onClick={() => handleToggleRowSelection(bill.splitId, index)}
                      style={{ 
                        background: isSelected ? '#CCFFFF' : '#FFFFFF', 
                        borderBottom: '1px solid #E0E0E0',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '3px 4px', borderRight: '1px solid #B0E0E6', textAlign: 'center', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          {isSelected && <ArrowRight size={13} color="#000080" strokeWidth={2.5} />}
                          <span>{bill.billSeq}</span>
                        </div>
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6' }}>RES</td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6' }}>INR</td>
                      <td 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setGstInfoBillData(bill);
                          setGstInfoModalOpen(true);
                        }}
                        title="Double-click to view GST information"
                        style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', fontWeight: 700, color: '#000080', cursor: 'help' }}
                      >
                        {bill.billNo || '-'}
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                        {bill.value.toFixed(2)}
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'center' }}>
                        {bill.discount}
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                        {bill.tax.toFixed(2)}
                      </td>
                      <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                        {bill.roundOff >= 0 ? `.${Math.round(bill.roundOff * 100)}` : `-.${Math.abs(Math.round(bill.roundOff * 100))}`}
                      </td>
                      <td 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenViewKot(bill.splitId);
                        }}
                        title="Click to View KOT items for this split bill"
                        style={{ 
                          padding: '3px 6px', 
                          textAlign: 'right', 
                          fontWeight: 700, 
                          color: '#000080', 
                          textDecoration: 'underline', 
                          cursor: 'pointer' 
                        }}
                      >
                        {bill.nettValue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {/* Empty Grid Rows to maintain authentic Fortune NEXT height */}
                {Array.from({ length: Math.max(1, 8 - splitBillsList.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: '22px', borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Authentic Note Banner with <A> Button below Grid (Video 09 Frames 033 - 034) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#333', padding: '6px 0', borderBottom: '1px solid #D0D0D0' }}>
            <button 
              className="ids-btn" 
              onClick={handleToggleSelectAll}
              title="Click <A> to Select/Deselect all Bills for Printing"
              style={{ 
                padding: '1px 6px', 
                fontSize: '11px', 
                fontWeight: 700, 
                background: selectedBillIndices.length === splitBillsList.length ? '#C1D2EE' : '#ECE9D8',
                borderColor: selectedBillIndices.length === splitBillsList.length ? '#316AC5' : undefined
              }}
            >
              &lt;A&gt;
            </button>
            <span style={{ fontSize: '10px', color: '#444' }}>
              Note : Click on &lt;A&gt; button to Select all Bills for Printing. Click on Net Value column to View KOTS
            </span>
          </div>

          {/* Red KOT Items Display (Video 03 Frame 027 & Video 09 Frame 027) */}
          {itemsViewVisible && (
            <div style={{ color: '#D00', fontSize: '11px', fontWeight: 600, padding: '3px 0 4px 0', minHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {kotsDisplayString}
            </div>
          )}

          {/* Member Code input & Double-click hint (Video 09 Frame 016) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 6px 0', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <label style={{ fontWeight: 600 }}>Member Code</label>
              <input 
                type="text" 
                value={memberCode} 
                onChange={e => setMemberCode(e.target.value)}
                style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
              Double Click Bill # View the GST Info..
            </div>
          </div>
        </div>

        {/* Bottom Command Buttons matching Video 09 Frame 021 */}
        <div style={{ padding: '6px 12px 10px 12px', background: '#ECE9D8', borderTop: '1px solid #BBB', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
          <button className="ids-btn" onClick={() => handlePrintBills(true)} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Provisional Bill
          </button>
          <button 
            className="ids-btn" 
            onClick={() => handlePrintBills(false)} 
            style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D' }}
          >
            Print Bill
          </button>
          <button 
            className="ids-btn" 
            onClick={() => {
              if (currentActiveBill) {
                const targetBillNo = currentActiveBill.billNo || billNumber || `B-${Math.floor(1000 + Math.random() * 9000)}`;
                setBillNumber(targetBillNo);
                setSettleModalOpen(true);
              }
            }} 
            style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, color: '#800080' }}
          >
            Bill &amp; Settle
          </button>
          <button 
            className="ids-btn" 
            onClick={handleOpenSplitBill} 
            title="Split POS Bill Item Wise (Video 09)"
            style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, background: '#FFF3CD', borderColor: '#856404' }}
          >
            Split Bill
          </button>
          <button 
            className="ids-btn" 
            onClick={() => setSplitQtyModalOpen(true)} 
            style={{ fontSize: '10px', padding: '3px 6px' }}
          >
            Split Qty
          </button>
          <button 
            className="ids-btn" 
            onClick={() => setSplitEqualModalOpen(true)} 
            style={{ fontSize: '10px', padding: '3px 6px' }}
          >
            Split Equal
          </button>
          <button className="ids-btn" onClick={() => alert("Discount Option")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Discount
          </button>
          <button className="ids-btn" onClick={() => alert("Tax Exemption Routine")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Tax Exemption
          </button>
          <button 
            className="ids-btn" 
            onClick={() => handleOpenViewKot(null)} 
            style={{ fontSize: '10px', padding: '3px 6px', fontWeight: 600 }}
          >
            View
          </button>
          <button className="ids-btn" onClick={() => setMemberCode('')} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Clear
          </button>
          <button className="ids-btn" onClick={() => alert("Panel Options")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Panel
          </button>
          <button className="ids-btn" onClick={onClose} style={{ fontSize: '10px', padding: '3px 8px' }}>
            Exit
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. WIN32 SPLIT BILL MODAL (Video 09 Frame 021 - Frame 025 & Frame 058)     */}
      {/* ========================================================================= */}
      {splitBillModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '710px', 
              maxWidth: '96vw', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            {/* Split Bill Title Bar */}
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Split Bill</span>
              <button className="ids-win-btn close" onClick={() => setSplitBillModalOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            {/* Instruction Banner & Quick Action Buttons */}
            <div style={{ padding: '8px 12px', background: '#ECE9D8', fontSize: '11px' }}>
              <div style={{ background: '#FFF8E7', border: '1px solid #E0B86B', padding: '4px 8px', marginBottom: '8px', borderRadius: '2px', color: '#6A4E00', fontSize: '11px' }}>
                <strong>Instruction:</strong> Manually add number of bill in how many parts you want to split your Bill. <em>(Enter same number in all items to merge).</em>
              </div>

              {/* Quick Presets matching Video 09 */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '10px', color: '#555' }}>Video 09 Actions:</span>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const preset = { 0: 1, 1: 1, 2: 2, 3: 2 };
                    setTempSplitAssignments(preset);
                  }}
                  style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 600, background: '#E6F0FA' }}
                >
                  2-Way Split (1, 1, 2, 2)
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const preset = { 0: 1, 1: 2, 2: 3, 3: 4 };
                    setTempSplitAssignments(preset);
                  }}
                  style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 600, background: '#FFF0F5' }}
                >
                  4-Way Item-Wise (1, 2, 3, 4)
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const preset = { 0: 1, 1: 1, 2: 1, 3: 1 };
                    setTempSplitAssignments(preset);
                  }}
                  style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 600, background: '#E8F5E9' }}
                >
                  Merge All to Bill 1 (1, 1, 1, 1)
                </button>
              </div>

              {/* Grid Table matching Frame 023 */}
              <div style={{ height: '220px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#FFE4B5', borderBottom: '1px solid #808080', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0D0D0', width: '45px', textAlign: 'center' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '220px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '55px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '85px', textAlign: 'left' }}>Group</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '60px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Value</th>
                      <th style={{ padding: '3px 4px', width: '50px', textAlign: 'center', background: '#FFD39B' }}>Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeKot.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EBEBEB', background: idx % 2 === 0 ? '#FFF' : '#FBFBFB' }}>
                        <td style={{ padding: '3px 4px', borderRight: '1px solid #DDD', textAlign: 'center' }}>{item.kotNo || activeKot.kotNo}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', color: '#555' }}>{item.type || 'Food'}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', color: '#555' }}>{item.group || 'SALAD BAR'}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>{Number(item.quantity).toFixed(3)}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right', fontWeight: 600 }}>{Number(item.value || (item.quantity * item.rate)).toFixed(2)}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <input 
                            type="number"
                            min="1"
                            max="9"
                            value={tempSplitAssignments[idx] ?? 1}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setTempSplitAssignments(prev => ({ ...prev, [idx]: val }));
                            }}
                            style={{ 
                              width: '38px', 
                              textAlign: 'center', 
                              background: '#FFF', 
                              border: '1px solid #316AC5', 
                              padding: '1px 2px',
                              fontWeight: 700,
                              color: '#000080'
                            }}
                          />
                        </td>
                      </tr>
                    ))}

                    {/* Empty Grid filler rows */}
                    {Array.from({ length: Math.max(1, 6 - activeKot.items.length) }).map((_, i) => (
                      <tr key={`fill-${i}`} style={{ height: '22px', borderBottom: '1px solid #F5F5F5' }}>
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

              {/* Table Footer with Total Quantity and [Ok] [Cancel] (Frame 023) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '11px' }}>Total Quantity</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeKot.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0).toFixed(3)} 
                    style={{ width: '60px', textAlign: 'right', background: '#ECE9D8', border: '1px solid #7F9DB9', padding: '2px 4px', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="ids-btn" 
                    onClick={handleApplySplitBill} 
                    style={{ minWidth: '60px', fontWeight: 700 }}
                  >
                    Ok
                  </button>
                  <button 
                    className="ids-btn" 
                    onClick={() => setSplitBillModalOpen(false)} 
                    style={{ minWidth: '60px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WIN32 VIEW KOT MODAL (Video 09 Frame 018, Frame 049 & Frame 060)        */}
      {/* ========================================================================= */}
      {viewKotModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '710px', 
              maxWidth: '96vw', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            {/* View KOT Title Bar */}
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>
                View KOT {viewKotDisplayItems.splitId ? `(Split Bill #${viewKotDisplayItems.splitId})` : ''}
              </span>
              <button className="ids-win-btn close" onClick={() => setViewKotModalOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '8px 12px', background: '#ECE9D8', fontSize: '11px' }}>
              {/* Header orange accent */}
              <div style={{ height: '6px', background: '#FFE4B5', border: '1px solid #FFB871', marginBottom: '8px' }}></div>

              {/* Grid Table matching Frame 018 & Frame 049 */}
              <div style={{ height: '220px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#FFE4B5', borderBottom: '1px solid #808080', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '3px 4px', borderRight: '1px solid #D0D0D0', width: '45px', textAlign: 'center' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '220px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '55px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '85px', textAlign: 'left' }}>Group</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '60px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Value</th>
                      <th style={{ padding: '3px 4px', width: '50px', textAlign: 'center' }}>Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewKotDisplayItems.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EBEBEB', background: idx % 2 === 0 ? '#FFF' : '#FBFBFB' }}>
                        <td style={{ padding: '3px 4px', borderRight: '1px solid #DDD', textAlign: 'center' }}>{item.kotNo || activeKot.kotNo}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', color: '#555' }}>{item.type || 'Food'}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', color: '#555' }}>{item.group || 'SALAD BAR'}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>{Number(item.quantity).toFixed(3)}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right', fontWeight: 600 }}>{Number(item.value || (item.quantity * item.rate)).toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center', color: '#000080', fontWeight: 700 }}>
                          {itemSplitAssignments[item.itemIndex ?? idx] || 1}
                        </td>
                      </tr>
                    ))}

                    {/* Empty Grid filler rows */}
                    {Array.from({ length: Math.max(1, 6 - viewKotDisplayItems.items.length) }).map((_, i) => (
                      <tr key={`fill-${i}`} style={{ height: '22px', borderBottom: '1px solid #F5F5F5' }}>
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

              {/* Table Footer with Total Quantity and [Ok] [Cancel] */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '11px' }}>Total Quantity</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={viewKotDisplayItems.totalQty.toFixed(3)} 
                    style={{ width: '60px', textAlign: 'right', background: '#ECE9D8', border: '1px solid #7F9DB9', padding: '2px 4px', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="ids-btn" 
                    onClick={() => setViewKotModalOpen(false)} 
                    style={{ minWidth: '60px', fontWeight: 700 }}
                  >
                    Ok
                  </button>
                  <button 
                    className="ids-btn" 
                    onClick={() => setViewKotModalOpen(false)} 
                    style={{ minWidth: '60px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WIN32 GST BREAKDOWN MODAL ("Double Click Bill # View the GST Info..")    */}
      {/* ========================================================================= */}
      {gstInfoModalOpen && gstInfoBillData && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '420px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>
                GST Info - Bill #{gstInfoBillData.billNo || gstInfoBillData.billSeq}
              </span>
              <button className="ids-win-btn close" onClick={() => setGstInfoModalOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px' }}>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px', marginBottom: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>HSN / SAC Code:</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700, color: '#000080' }}>996331 (Restaurant Services)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Taxable Value:</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{gstInfoBillData.value.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>CGST @ 2.5%:</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{gstInfoBillData.cgst.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>SGST @ 2.5%:</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{gstInfoBillData.sgst.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Total GST (5.0%):</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹{gstInfoBillData.tax.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Round Off:</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>
                        {gstInfoBillData.roundOff >= 0 ? `+₹${gstInfoBillData.roundOff.toFixed(2)}` : `-₹${Math.abs(gstInfoBillData.roundOff).toFixed(2)}`}
                      </td>
                    </tr>
                    <tr style={{ background: '#FFE4B5' }}>
                      <td style={{ padding: '4px', fontWeight: 700 }}>Nett Payable:</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700, color: '#000080' }}>₹{gstInfoBillData.nettValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setGstInfoModalOpen(false)} 
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WIN32 SPLIT EQUAL MODAL                                                */}
      {/* ========================================================================= */}
      {splitEqualModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '360px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Split Equal Parts</span>
              <button className="ids-win-btn close" onClick={() => setSplitEqualModalOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
                  Select Number of Equal Splits:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      className="ids-btn"
                      onClick={() => setEqualSplitCount(num)}
                      style={{ 
                        flex: 1, 
                        padding: '6px', 
                        fontWeight: 700, 
                        background: equalSplitCount === num ? '#C1D2EE' : '#ECE9D8',
                        borderColor: equalSplitCount === num ? '#316AC5' : undefined
                      }}
                    >
                      {num} Parts
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => handleApplyEqualSplit(equalSplitCount)} 
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setSplitEqualModalOpen(false)} 
                  style={{ minWidth: '65px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WIN32 SPLIT QUANTITY MODAL                                             */}
      {/* ========================================================================= */}
      {splitQtyModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '560px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Split Quantity Across Bills</span>
              <button className="ids-win-btn close" onClick={() => setSplitQtyModalOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px' }}>
              <div style={{ background: '#FFF8E7', border: '1px solid #E0B86B', padding: '4px 8px', marginBottom: '8px', color: '#6A4E00' }}>
                Allocate items with quantity &gt; 1 into separate split line items.
              </div>

              <div style={{ height: '160px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto', marginBottom: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ background: '#FFE4B5', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #DDD' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #DDD', width: '60px' }}>Total Qty</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', width: '90px' }}>Bill 1 Qty</th>
                      <th style={{ padding: '3px 6px', textAlign: 'center', width: '90px' }}>Bill 2 Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeKot.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #DDD' }}>{item.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #DDD' }}>{Number(item.quantity).toFixed(1)}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'center' }}>
                          <input 
                            type="text" 
                            readOnly 
                            value={Number(item.quantity) > 1 ? '1.0' : '1.0'} 
                            style={{ width: '40px', textAlign: 'center', background: '#F5F5F5', border: '1px solid #BBB' }} 
                          />
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center' }}>
                          <input 
                            type="text" 
                            readOnly 
                            value={Number(item.quantity) > 1 ? '1.0' : '0.0'} 
                            style={{ width: '40px', textAlign: 'center', background: '#F5F5F5', border: '1px solid #BBB' }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    // Automatically configure 2-way split
                    setItemSplitAssignments({ 0: 1, 1: 1, 2: 2, 3: 2 });
                    setSplitQtyModalOpen(false);
                    setPrintSuccessMsg('Split Qty Routine Configured (2-Way Bill Split)!');
                    setTimeout(() => setPrintSuccessMsg(null), 3500);
                  }} 
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setSplitQtyModalOpen(false)} 
                  style={{ minWidth: '65px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. WIN32 TABLE HELP LOOKUP MODAL (?)                                      */}
      {/* ========================================================================= */}
      {tableHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container"
            style={{ 
              width: '380px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 18px rgba(0,0,0,0.7)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Table Help Lookup</span>
              <button className="ids-win-btn close" onClick={() => setTableHelpOpen(false)} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ height: '170px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto', marginBottom: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ width: '65px', padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #DDD' }}>Table #</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #DDD' }}>Server</th>
                      <th style={{ padding: '3px 6px', textAlign: 'right', width: '65px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_BILL_KOTS.map((t, idx) => {
                      const isSelected = selectedTableLookupIdx === idx;
                      return (
                        <tr 
                          key={t.tableNo}
                          onClick={() => setSelectedTableLookupIdx(idx)}
                          onDoubleClick={() => {
                            setTableNo(t.tableNo);
                            setTableHelpOpen(false);
                          }}
                          style={{ 
                            background: isSelected ? '#316AC5' : '#FFF', 
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer',
                            borderBottom: '1px solid #EEE'
                          }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #DDD' }}>{t.tableNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD' }}>{t.server} ({t.outlet})</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>₹{t.nettAmount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const sel = DEFAULT_BILL_KOTS[selectedTableLookupIdx];
                    if (sel) setTableNo(sel.tableNo);
                    setTableHelpOpen(false);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Select
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setTableHelpOpen(false)} 
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Settlement V6.5.008.30 (Video 04) */}
      <IdsPosBillSettlementModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        initialBillNo={currentActiveBill?.billNo || billNumber || '4'}
        accountingDate={accountingDate}
        outlet={outlet}
        session={session}
        steward={currentSteward}
        onBillSettled={(settlementRecord) => {
          if (onBillSettled) onBillSettled(settlementRecord);
          setSettleModalOpen(false);
          onClose();
        }}
        onOpenCrystalReport={onOpenCrystalReport}
      />
    </div>
  );
}
