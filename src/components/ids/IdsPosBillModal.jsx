import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Printer, Check, X, Search, FileText, ChevronRight, AlertCircle, ArrowRight
} from 'lucide-react';
import { HOTEL_CONFIG } from '../../data/hotelData';
import IdsPosBillSettlementModal from './IdsPosBillSettlementModal';

export default function IdsPosBillModal({
  isOpen,
  onClose,
  initialTableNo = '10',
  accountingDate = '03-FEB-2022',
  outlet = 'RESTAURANT',
  session = 'General',
  steward = 'Manash',
  kots = [],
  onBillPrinted,
  onBillSettled,
  onOpenCrystalReport
}) {
  const [tableNo, setTableNo] = useState(initialTableNo);
  const [covers, setCovers] = useState('2');
  const [memberCode, setMemberCode] = useState('');
  const [selectedBillIdx, setSelectedBillIdx] = useState(0);
  const [itemsViewVisible, setItemsViewVisible] = useState(true);
  const [billNumber, setBillNumber] = useState('');
  const [printSuccessMsg, setPrintSuccessMsg] = useState(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  // Default sample KOT matching Video 03 if none provided
  const activeKot = useMemo(() => {
    const found = kots.find(k => k.tableNo === tableNo);
    if (found) return found;
    return {
      kotNo: '1312',
      tableNo: tableNo,
      server: steward,
      outlet: outlet,
      items: [
        { code: '1', name: 'Classic Russian Salad .', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '2', name: 'Red Beans Peanut _Dry', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '3', name: 'Sprouted Moong Peanut D', quantity: 1.0, rate: 199.0, value: 199.0 }
      ],
      totalAmount: 597.0,
      cgst: 14.93,
      sgst: 14.93,
      nettAmount: 627.0
    };
  }, [kots, tableNo, steward, outlet]);

  // Calculations matching Video 03 Frame 024
  const billCalculations = useMemo(() => {
    const rawValue = activeKot.items.reduce((acc, it) => acc + (it.value || (it.quantity * it.rate)), 0);
    const tax = Number((rawValue * 0.05).toFixed(2)); // 5% GST (2.5% CGST + 2.5% SGST)
    const exactNett = rawValue + tax;
    const roundedNett = Math.round(exactNett);
    const roundOff = Number((roundedNett - exactNett).toFixed(2));
    return {
      value: rawValue,
      discount: '0.00 / 0.00%',
      tax: tax,
      roundOff: roundOff,
      nettValue: roundedNett
    };
  }, [activeKot]);

  // Format red text string matching Video 03 Frame 027
  const kotsDisplayString = useMemo(() => {
    return activeKot.items.map(it => `${activeKot.kotNo} ${it.name} ${Math.round(it.quantity)}`).join(', ');
  }, [activeKot]);

  const handlePrintBill = (isProvisional = false) => {
    const generatedBillNo = billNumber || `B-${Math.floor(1000 + Math.random() * 9000)}`;
    setBillNumber(generatedBillNo);

    if (onBillPrinted) {
      onBillPrinted({
        billNo: generatedBillNo,
        tableNo: tableNo,
        outlet: outlet,
        steward: steward,
        items: activeKot.items,
        value: billCalculations.value,
        tax: billCalculations.tax,
        nettValue: billCalculations.nettValue,
        isProvisional: isProvisional
      });
    }

    setPrintSuccessMsg(`Bill #${generatedBillNo} Generated & Sent to Printer!`);
    setTimeout(() => setPrintSuccessMsg(null), 3000);

    if (onOpenCrystalReport) {
      onOpenCrystalReport({
        reportType: 'pos-bill',
        data: {
          billNo: generatedBillNo,
          tableNo: tableNo,
          server: steward,
          outlet: outlet,
          accountingDate: accountingDate,
          items: activeKot.items,
          subTotal: billCalculations.value,
          cgst: Number((billCalculations.tax / 2).toFixed(2)),
          sgst: Number((billCalculations.tax / 2).toFixed(2)),
          total: billCalculations.nettValue,
          isProvisional: isProvisional
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Dialog Window matching Video 03 Frame 021 & Frame 024 */}
      <div 
        className="ids-modal-container" 
        style={{ 
          width: '740px', 
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

        {/* Header Controls (Video 03 Frame 021) */}
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
              <button className="ids-btn" style={{ padding: '1px 5px', fontSize: '11px', fontWeight: 700 }}>?</button>
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
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', height: '20px' }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <label style={{ width: '50px', fontWeight: 600 }}>Server</label>
            <input 
              type="text" 
              readOnly 
              value={steward} 
              style={{ width: '100px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
            />
            <input 
              type="text" 
              readOnly 
              value={steward.toUpperCase()} 
              style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
            />
          </div>

          {/* Orange Accent Divider Bar (Frame 021) */}
          <div style={{ height: '8px', background: '#FFE4B5', border: '1px solid #FFB871', margin: '4px 0 8px 0' }}></div>
        </div>

        {/* Feedback message banner */}
        {printSuccessMsg && (
          <div style={{ background: '#D4EDDA', borderBottom: '1px solid #C3E6CB', color: '#155724', padding: '3px 12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{printSuccessMsg}</span>
          </div>
        )}

        {/* Main Bill Table Grid (Video 03 Frame 024) */}
        <div style={{ padding: '0 12px', background: '#ECE9D8' }}>
          <div style={{ height: '220px', background: '#FFF', border: '1px solid #808080', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#FFE4B5', borderBottom: '1px solid #808080' }}>
                <tr>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '38px', textAlign: 'center' }}>Bill</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '38px' }}>RES</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '42px' }}>Cur.</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px' }}>Bill #</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '70px', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '90px', textAlign: 'center' }}>Discount</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '65px', textAlign: 'right' }}>Tax</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #D0D0D0', width: '55px', textAlign: 'right' }}>Rnd.off</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', width: '80px' }}>Nett Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Active Selected Bill Row */}
                <tr style={{ background: '#CCFFFF', borderBottom: '1px solid #E0E0E0' }}>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'center', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <ArrowRight size={12} color="#000080" />
                      <span>1</span>
                    </div>
                  </td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6' }}>RES</td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6' }}>INR</td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', fontWeight: 700, color: '#000080' }}>
                    {billNumber || '-'}
                  </td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                    {billCalculations.value.toFixed(2)}
                  </td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'center' }}>
                    {billCalculations.discount}
                  </td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                    {billCalculations.tax.toFixed(2)}
                  </td>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #B0E0E6', textAlign: 'right' }}>
                    {billCalculations.roundOff >= 0 ? `.${Math.round(billCalculations.roundOff * 100)}` : `-.${Math.abs(Math.round(billCalculations.roundOff * 100))}`}
                  </td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#000080' }}>
                    {billCalculations.nettValue.toFixed(2)}
                  </td>
                </tr>

                {/* Empty Grid Rows to maintain authentic height */}
                {Array.from({ length: 8 }).map((_, i) => (
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

          {/* Note Banner below Grid (Video 03 Frame 027) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#555', padding: '4px 0' }}>
            <span style={{ background: '#DDD', padding: '1px 4px', border: '1px solid #AAA', borderRadius: '2px' }}>⚠️</span>
            <span>Note : Click on &lt;A&gt; button to Select all Bills for Printing. Click on Net Value column to View KOTS</span>
          </div>

          {/* Red KOT Items Display (Video 03 Frame 027) */}
          {itemsViewVisible && (
            <div style={{ color: '#D00', fontSize: '11px', fontWeight: 600, padding: '2px 0 6px 0', minHeight: '18px' }}>
              {kotsDisplayString}
            </div>
          )}

          {/* Member Code input */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', margin: '4px 0 8px 0', fontSize: '11px' }}>
            <label style={{ fontWeight: 600 }}>Member Code</label>
            <input 
              type="text" 
              value={memberCode} 
              onChange={e => setMemberCode(e.target.value)}
              style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
            />
          </div>
        </div>

        {/* Bottom Command Buttons matching Video 03 Frame 024 */}
        <div style={{ padding: '8px 12px', background: '#ECE9D8', borderTop: '1px solid #BBB', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
          <button className="ids-btn" onClick={() => handlePrintBill(true)} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Provisional Bill
          </button>
          <button className="ids-btn" onClick={() => handlePrintBill(false)} style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D' }}>
            Print Bill
          </button>
          <button 
            className="ids-btn" 
            onClick={() => {
              const generatedBillNo = billNumber || `B-${Math.floor(1000 + Math.random() * 9000)}`;
              setBillNumber(generatedBillNo);
              if (onBillPrinted) {
                onBillPrinted({
                  billNo: generatedBillNo,
                  tableNo: tableNo,
                  outlet: outlet,
                  steward: steward,
                  items: activeKot.items,
                  value: billCalculations.value,
                  tax: billCalculations.tax,
                  nettValue: billCalculations.nettValue
                });
              }
              setSettleModalOpen(true);
            }} 
            style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, color: '#800080' }}
          >
            Bill &amp; Settle
          </button>
          <button className="ids-btn" onClick={() => alert("Split Bill Routine")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Split Bill
          </button>
          <button className="ids-btn" onClick={() => alert("Split Qty Routine")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Split Qty
          </button>
          <button className="ids-btn" onClick={() => alert("Split Equal Routine")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Split Equal
          </button>
          <button className="ids-btn" onClick={() => alert("Discount Option")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Discount
          </button>
          <button className="ids-btn" onClick={() => alert("Tax Exemption Routine")} style={{ fontSize: '10px', padding: '3px 6px' }}>
            Tax Exemption
          </button>
          <button className="ids-btn" onClick={() => setItemsViewVisible(!itemsViewVisible)} style={{ fontSize: '10px', padding: '3px 6px', fontWeight: 600 }}>
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

      {/* Bill Settlement V6.5.008.30 (Video 04) */}
      <IdsPosBillSettlementModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        initialBillNo={billNumber || '4'}
        accountingDate={accountingDate}
        outlet={outlet}
        session={session}
        steward={steward}
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
