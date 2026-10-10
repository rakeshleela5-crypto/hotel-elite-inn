import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_LAUNDRY_ENTRIES, calculateLaundryTax } from '../../data/idsPmsStore';

export default function IdsLaundryBillPrintingModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onOpenCrystalReport,
  onSettleBill,
  onOpenMessageBox
}) {
  const [billTo, setBillTo] = useState('Guest');
  const [roomNo, setRoomNo] = useState('205');
  const [guestName, setGuestName] = useState('Mr Kumar Anil');
  const [option, setOption] = useState('Delivery Date');
  const [departure, setDeparture] = useState('01-FEB-2026 12:00');
  const [classification, setClassification] = useState('Regular');

  // Bills List
  const [bills, setBills] = useState([
    {
      delvDate: '27/01/2026',
      grossValue: 200.00,
      discount: 0.00,
      taxAmount: 36.00,
      netAmount: 236.00,
      selected: true
    }
  ]);

  // Discount Form Modal State (Frame 036)
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    grossAmount: 200.00,
    discountType: 'Percentage',
    factor: '5',
    reason: 'Approved by GM'
  });

  if (!isOpen) return null;

  const handleApplyDiscount = () => {
    const factorNum = Number(discountForm.factor) || 0;
    let discAmt = 0;
    if (discountForm.discountType === 'Percentage') {
      discAmt = (discountForm.grossAmount * factorNum) / 100;
    } else {
      discAmt = factorNum;
    }

    const taxCalc = calculateLaundryTax(discountForm.grossAmount, discAmt);

    const updated = bills.map(b => ({
      ...b,
      discount: discAmt,
      taxAmount: taxCalc.totalTax,
      netAmount: taxCalc.netAmount
    }));

    setBills(updated);
    setDiscountModalOpen(false);

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Discount Applied',
        message: `Discount of ₹${discAmt.toFixed(2)} (${discountForm.factor}% - ${discountForm.reason}) applied. Revised Net Amount: ₹${taxCalc.netAmount.toFixed(2)}.`,
        type: 'info'
      });
    }
  };

  const handlePrint = () => {
    const activeBill = bills.find(b => b.selected) || bills[0];
    const reportPayload = {
      billNo: `LAU-BL-${roomNo}-2026`,
      billDate: accountingDate,
      roomNo,
      guestName,
      sacCode: '999791',
      serviceDesc: 'Laundry & Dry Cleaning Services (SAC 999791)',
      grossAmount: activeBill.grossValue,
      discount: activeBill.discount,
      taxableAmount: activeBill.grossValue - activeBill.discount,
      cgstPct: 9,
      cgstAmount: activeBill.taxAmount / 2,
      sgstPct: 9,
      sgstAmount: activeBill.taxAmount / 2,
      netTotal: activeBill.netAmount,
      payMode: billTo === 'Guest' ? 'Guest In-House Folio 205/1' : 'Corporate City Ledger',
      hotelGstin: '21AAACT2727Q1ZB'
    };

    if (onOpenCrystalReport) {
      onOpenCrystalReport('laundry-bill', reportPayload);
    } else {
      alert(`Printing Rule 46 Laundry Invoice for ${guestName} (Room ${roomNo}). Total: ₹${activeBill.netAmount}`);
    }
  };

  const handleSettle = () => {
    const activeBill = bills.find(b => b.selected) || bills[0];
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Settle Laundry Bill',
        message: `Settle Laundry Bill of ₹${activeBill.netAmount.toFixed(2)} to Room ${roomNo} (${guestName}) Folio?`,
        type: 'question',
        buttons: 'YesNo',
        onYes: () => {
          if (onSettleBill) {
            onSettleBill({
              roomNo,
              guestName,
              amount: activeBill.netAmount,
              billNo: `LAU-BL-${roomNo}-2026`
            });
          }
          if (onOpenMessageBox) {
            onOpenMessageBox({
              title: 'Bill Settled',
              message: `Laundry charge ₹${activeBill.netAmount.toFixed(2)} posted directly to In-House Folio Room ${roomNo}.`,
              type: 'info',
              onOk: onClose
            });
          }
        }
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '740px', 
          backgroundColor: '#ECE9D8',
          border: '2px solid #000',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '3px 6px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          <span>Laundry Bill Printing / LACRYBL V6.5.002.4</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px' }}>
          {/* Top Filter & Guest Context Section */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
              marginBottom: '10px'
            }}
          >
            {/* Bill To & Option */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 'bold' }}>Bill To:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="billTo" checked={billTo === 'Guest'} onChange={() => setBillTo('Guest')} /> Guest
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="billTo" checked={billTo === 'City Ledger'} onChange={() => setBillTo('City Ledger')} /> City Ledger
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Option</span>
                <select 
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                  style={{ padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Delivery Date">Delivery Date</option>
                  <option value="Voucher Date">Voucher Date</option>
                </select>
              </div>
            </div>

            {/* Room & Name & Departure */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <label style={{ width: '50px' }}>Room#</label>
                <input 
                  type="text" 
                  value={roomNo} 
                  onChange={(e) => setRoomNo(e.target.value)}
                  style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
                <button style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}>?</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '45px' }}>Name</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <label>Departure:</label>
                <span style={{ fontWeight: 'bold' }}>{departure}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '10px', color: '#666' }}>
              <span>Classification: <strong>{classification}</strong></span>
            </div>
          </div>

          {/* Pending Bills Grid Table */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              minHeight: '130px', 
              maxHeight: '160px', 
              overflowY: 'auto' 
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '90px' }}>Delv Date</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '100px', textAlign: 'right' }}>Bill Value</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px', textAlign: 'right' }}>Discount</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '90px', textAlign: 'right' }}>GST 18%</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '110px', textAlign: 'right' }}>Net Amount</th>
                  <th style={{ padding: '4px', textAlign: 'center', width: '60px' }}>Select</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{b.delvDate}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{b.grossValue.toFixed(2)}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#900' }}>₹{b.discount.toFixed(2)}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#0A246A' }}>₹{b.taxAmount.toFixed(2)}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>₹{b.netAmount.toFixed(2)}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={b.selected} 
                        onChange={() => {
                          const updated = bills.map((x, i) => i === idx ? { ...x, selected: !x.selected } : x);
                          setBills(updated);
                        }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Strip (Video 06 Frame 036: VAT, Print, Split Bill, Split Qty, Discount, Tax, View) */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              gap: '4px', 
              marginTop: '10px',
              padding: '6px',
              background: '#D4D0C8',
              border: '1px solid #7F9DB9'
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="ids-btn" style={{ padding: '3px 8px', fontSize: '11px' }}>VAT / GST</button>
              <button onClick={handlePrint} className="ids-btn" style={{ padding: '3px 12px', fontSize: '11px', fontWeight: 'bold', background: '#DCE6F1' }}>Print</button>
              <button className="ids-btn" style={{ padding: '3px 8px', fontSize: '11px' }}>Split Bill</button>
              <button className="ids-btn" style={{ padding: '3px 8px', fontSize: '11px' }}>Split Qty</button>
              <button onClick={() => setDiscountModalOpen(true)} className="ids-btn" style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 'bold' }}>Discount</button>
              <button className="ids-btn" style={{ padding: '3px 8px', fontSize: '11px' }}>Tax</button>
              <button className="ids-btn" style={{ padding: '3px 8px', fontSize: '11px' }}>View</button>
            </div>

            <button onClick={handleSettle} className="ids-btn" style={{ padding: '3px 16px', fontSize: '11px', fontWeight: 'bold', background: '#D4EDDA', borderColor: '#28A745' }}>
              Settle to Room
            </button>
          </div>

          {/* Bottom Command Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <button className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Load</button>
            <button className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Clear</button>
            <button className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Panel</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* Discount Form Sub-Modal (Video 06 Frame 036 Exactly) */}
        {discountModalOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '380px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount Form</span>
                <button onClick={() => setDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Gross Amount</label>
                    <input 
                      type="text" 
                      value={discountForm.grossAmount.toFixed(2)} 
                      disabled
                      style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Discount Type</label>
                    <select 
                      value={discountForm.discountType}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Amount">Amount</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Factor</label>
                    <input 
                      type="number" 
                      value={discountForm.factor}
                      onChange={(e) => setDiscountForm({ ...discountForm, factor: e.target.value })}
                      style={{ width: '80px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Reason</label>
                    <select 
                      value={discountForm.reason}
                      onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Approved by GM">Approved by GM</option>
                      <option value="Guest Complaint">Guest Complaint</option>
                      <option value="Corporate Agreement">Corporate Agreement</option>
                      <option value="Long Stay Privilege">Long Stay Privilege</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <button onClick={handleApplyDiscount} className="ids-btn" style={{ minWidth: '70px', padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}>Ok</button>
                  <button onClick={() => setDiscountModalOpen(false)} className="ids-btn" style={{ minWidth: '70px', padding: '3px 14px', fontSize: '11px' }}>Back</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
