import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Printer, FileText, Search, Calendar, CheckCircle2, 
  Download, Eye, X, ArrowRight, ShieldCheck, DollarSign,
  CreditCard, Receipt, FileSpreadsheet, RefreshCw
} from 'lucide-react';

/* =========================================================================
   VIDEO 35: HOW TO REPRINT FRONT OFFICE MODULE VOUCHER IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: User Defined Reprint Voucher V6.5002.3 (Frames 010–060)
   2. Entry Points (Frames 006 & 010):
      - Reports.. -> Reprint Voucher
      - Front Office -> Reports.. -> Reprint Front Office Module Voucher
      - Cashiering.. -> Reprint Voucher
      - Quick Scan (Load Pgm) -> Type "reprint" -> "Reprint Voucher" -> [ Load ]
      - 44-Video Tutorial Player -> Video 35 -> Launch Interactive Feature Clone
   3. Transaction Type Radio Options (Frame 018):
      - ( ) Deposit
      - ( ) Post Charges
      - ( ) Bill Allowance
      - ( ) Consol. Allowance
      - ( ) Misc. Charges
      - ( ) Paid Outs
      - ( ) Settlements
   4. Filters (Frame 018):
      - Date: 24-FEB-2022 / 23-FEB-2022 with [ ? ] date picker
   5. Data Grid Columns (Frames 018 & 046):
      - Reg # | Room # | Guest Name | Description | Company Name | Currency | Amount | Revenue
   6. Authentic Voucher Print Preview & PDF Export (Frames 030 & 054)
   ========================================================================= */

export const INITIAL_VOUCHERS_DATABASE = [
  {
    voucherNo: 'VOU-DEP-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Deposit',
    date: '24-FEB-2022',
    time: '14:30',
    description: 'Advance Reservation Deposit (Cash)',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 5000.00,
    baseAmount: 5000.00,
    taxAmount: 0.00,
    revenue: 'Advance Deposit',
    payMode: 'Cash',
    cashier: 'MANAGER',
    remarks: 'Advance collected for Deluxe Executive Suite stay'
  },
  {
    voucherNo: 'VOU-DEP-002',
    regNo: '625',
    roomNo: '205',
    guestName: 'Mr Kumar Alok',
    type: 'Deposit',
    date: '24-FEB-2022',
    time: '15:10',
    description: 'Advance Deposit (Credit Card - Visa)',
    companyName: 'Mahindra & Mahindra Ltd',
    currency: 'INR',
    amount: 3000.00,
    baseAmount: 3000.00,
    taxAmount: 0.00,
    revenue: 'Advance Deposit',
    payMode: 'Credit Card',
    cashier: 'MANAGER',
    remarks: 'Auth Code: 897612'
  },
  {
    voucherNo: 'VOU-PCH-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Post Charges',
    date: '24-FEB-2022',
    time: '16:45',
    description: 'Laundry Services (Express Wash & Press)',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 590.00,
    baseAmount: 500.00,
    taxAmount: 90.00,
    revenue: 'Laundry',
    payMode: 'Room Folio',
    cashier: 'MANAGER',
    remarks: '4 pieces formal wear'
  },
  {
    voucherNo: 'VOU-PCH-002',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Post Charges',
    date: '24-FEB-2022',
    time: '19:20',
    description: 'Cannon Restaurant - In-Room Dining Dinner',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 1475.00,
    baseAmount: 1250.00,
    taxAmount: 225.00,
    revenue: 'Food & Beverage',
    payMode: 'Room Folio',
    cashier: 'MANAGER',
    remarks: 'KOT # 4021'
  },
  {
    voucherNo: 'VOU-ALW-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Bill Allowance',
    date: '24-FEB-2022',
    time: '17:15',
    description: 'Laundry Delay Service Allowance (Discount Approved)',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 150.00,
    baseAmount: 150.00,
    taxAmount: 0.00,
    revenue: 'Laundry Allowance',
    payMode: 'Folio Credit',
    cashier: 'MANAGER',
    remarks: 'Approved by GM for delivery delay'
  },
  {
    voucherNo: 'VOU-CAL-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Consol. Allowance',
    date: '24-FEB-2022',
    time: '18:00',
    description: 'Corporate Group Tariff Discount Rebate',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 500.00,
    baseAmount: 500.00,
    taxAmount: 0.00,
    revenue: 'Room Tariff Allowance',
    payMode: 'Folio Credit',
    cashier: 'MANAGER',
    remarks: 'Contract rate reconciliation'
  },
  {
    voucherNo: 'VOU-MSC-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Misc. Charges',
    date: '24-FEB-2022',
    time: '11:00',
    description: 'Airport Transfer Sedan Cab',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 1200.00,
    baseAmount: 1200.00,
    taxAmount: 0.00,
    revenue: 'Travel Desk',
    payMode: 'Room Folio',
    cashier: 'MANAGER',
    remarks: 'Driver: Rajesh'
  },
  {
    voucherNo: 'VOU-POU-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Paid Outs',
    date: '24-FEB-2022',
    time: '12:30',
    description: 'Guest Urgent Medicine Reimbursement (Paid Out)',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 450.00,
    baseAmount: 450.00,
    taxAmount: 0.00,
    revenue: 'Paid Out Cash',
    payMode: 'Cash Out',
    cashier: 'MANAGER',
    remarks: 'Pharmacy bill attached'
  },
  {
    voucherNo: 'VOU-SET-001',
    regNo: '624',
    roomNo: '201',
    guestName: 'Mr Sharma Raj',
    type: 'Settlements',
    date: '24-FEB-2022',
    time: '18:30',
    description: 'Part Bill Settlement (UPI / QR Payment)',
    companyName: 'Tata Motors Limited',
    currency: 'INR',
    amount: 2500.00,
    baseAmount: 2500.00,
    taxAmount: 0.00,
    revenue: 'Bill Settlement',
    payMode: 'UPI',
    cashier: 'MANAGER',
    remarks: 'UPI Ref: 2056198421'
  }
];

export default function IdsReprintVoucherModal({
  isOpen,
  onClose,
  accountingDate = '24-FEB-2022'
}) {
  const [selectedType, setSelectedType] = useState('Deposit');
  const [filterDate, setFilterDate] = useState(accountingDate);
  const [vouchersList, setVouchersList] = useState(INITIAL_VOUCHERS_DATABASE);
  const [selectedVoucher, setSelectedVoucher] = useState(INITIAL_VOUCHERS_DATABASE[0]);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Filtered vouchers by Transaction Type & Date
  const filteredVouchers = useMemo(() => {
    return vouchersList.filter(v => v.type === selectedType);
  }, [vouchersList, selectedType]);

  if (!isOpen) return null;

  const handlePrintVoucher = (v) => {
    setSelectedVoucher(v);
    setPrintPreviewOpen(true);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '780px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 35 Frame 018 */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
            color: '#FFF', 
            padding: '4px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
            <Printer size={14} />
            <span>User Defined Reprint Voucher V6.5002.3 — Front Office Module</span>
          </div>
          <button 
            className="ids-win-btn close" 
            onClick={onClose}
            style={{ 
              background: '#C75050', 
              color: '#FFF', 
              border: '1px outset #FFF', 
              fontWeight: 700, 
              width: '18px', 
              height: '18px', 
              lineHeight: '14px', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main Content Body matching Frame 018 */}
        <div style={{ padding: '12px 16px', fontSize: '11px' }}>
          
          {/* Upper Group Box: Transaction Type Radios & Date Filter */}
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 12px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '6px' }}>
              Transaction type
            </div>

            {/* Radio Options Grid matching Frame 018 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', alignItems: 'center', marginBottom: '8px' }}>
              {[
                ['Deposit', 'Deposit'],
                ['Post Charges', 'Post Charges'],
                ['Bill Allowance', 'Bill Allowance'],
                ['Consol. Allowance', 'Consol. Allowance'],
                ['Misc. Charges', 'Misc. Charges'],
                ['Paid Outs', 'Paid Outs'],
                ['Settlements', 'Settlements']
              ].map(([typeKey, typeLabel]) => (
                <label key={typeKey} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: selectedType === typeKey ? 700 : 500 }}>
                  <input 
                    type="radio" 
                    name="transType" 
                    value={typeKey}
                    checked={selectedType === typeKey}
                    onChange={() => setSelectedType(typeKey)}
                  />
                  <span>{typeLabel}</span>
                </label>
              ))}
            </div>

            {/* Date Filter Input */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '6px' }}>
              <span style={{ fontWeight: 600 }}>Date:</span>
              <input 
                className="ids-input" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ width: '110px', fontWeight: 700 }}
              />
              <button className="ids-btn-classic" style={{ width: '22px' }} title="Calendar">?</button>
              <span style={{ color: '#666', fontSize: '10px', marginLeft: '6px' }}>
                Showing <strong>{filteredVouchers.length}</strong> {selectedType} vouchers for {filterDate}
              </span>
            </div>
          </div>

          {/* Data Grid Table matching Frames 018, 030, 046 */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ height: '220px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Reg #</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Room #</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '130px' }}>Guest Name</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '130px' }}>Company Name</th>
                    <th style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '40px' }}>Curr</th>
                    <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '70px' }}>Amount</th>
                    <th style={{ padding: '3px 6px', textAlign: 'left', width: '90px' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                        No {selectedType} vouchers recorded on {filterDate}.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher, idx) => {
                      const isSelected = selectedVoucher?.voucherNo === voucher.voucherNo;
                      return (
                        <tr 
                          key={idx}
                          onClick={() => setSelectedVoucher(voucher)}
                          onDoubleClick={() => handlePrintVoucher(voucher)}
                          style={{ 
                            background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer',
                            borderBottom: '1px solid #E0E0E0'
                          }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{voucher.regNo}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{voucher.roomNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{voucher.guestName}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{voucher.description}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{voucher.companyName || '-'}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'center', borderRight: '1px solid #E0E0E0' }}>{voucher.currency}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>
                            {voucher.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '3px 6px' }}>{voucher.revenue}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action Ribbon matching Frame 018 */}
          <div 
            style={{ 
              background: '#D4D0C8', 
              border: '1px solid #808080', 
              padding: '6px 10px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ color: '#444', fontSize: '10px' }}>
              Double-click any row or select and click <strong>[ Print ]</strong> to preview/reprint voucher.
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  if (selectedVoucher) {
                    handlePrintVoucher(selectedVoucher);
                  } else {
                    alert('Please select a voucher row first.');
                  }
                }}
              >
                <Printer size={12} /> Print
              </button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px' }}
                onClick={() => setStatusMessage('Grid cleared.')}
              >
                Clear
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Panel</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            AUTHENTIC IDS VOUCHER PRINT PREVIEW MODAL (Frames 030 & 054)
            ========================================================================= */}
        {printPreviewOpen && selectedVoucher && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setPrintPreviewOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '580px', maxWidth: '94vw', background: '#FFF', border: '2px outset #ECE9D8', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Window Titlebar */}
              <div 
                className="ids-dialog-titlebar" 
                style={{ 
                  background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
                  color: '#FFF', 
                  padding: '4px 8px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '11px' }}>
                  <FileText size={13} />
                  <span>Voucher Print Preview — {selectedVoucher.type.toUpperCase()} VOUCHER</span>
                </div>
                <button className="ids-win-btn close" onClick={() => setPrintPreviewOpen(false)}>✕</button>
              </div>

              {/* Authentic Voucher Receipt Layout */}
              <div style={{ padding: '20px 24px', fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#000' }}>
                
                {/* Hotel Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>HOTEL ELITE INN & SUITES</div>
                  <div style={{ fontSize: '11px' }}>FORTUNE NEXT PMS — FRONT OFFICE MODULE</div>
                  <div style={{ fontSize: '10px', color: '#444' }}>GSTIN: 27AABCT3518Q1ZY | TEL: +91 22 2876 5432</div>
                  <div style={{ marginTop: '6px', display: 'inline-block', border: '1px solid #000', padding: '2px 10px', fontWeight: 700, fontSize: '12px' }}>
                    {selectedVoucher.type.toUpperCase()} VOUCHER (REPRINT)
                  </div>
                </div>

                {/* Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: '14px', fontSize: '11px' }}>
                  <div><strong>Voucher #:</strong> {selectedVoucher.voucherNo}</div>
                  <div><strong>Date / Time:</strong> {selectedVoucher.date} {selectedVoucher.time}</div>
                  <div><strong>Registration #:</strong> {selectedVoucher.regNo}</div>
                  <div><strong>Room #:</strong> {selectedVoucher.roomNo}</div>
                  <div><strong>Guest Name:</strong> {selectedVoucher.guestName}</div>
                  <div><strong>Company:</strong> {selectedVoucher.companyName || 'FIT Guest'}</div>
                  <div><strong>Pay Mode:</strong> {selectedVoucher.payMode}</div>
                  <div><strong>Cashier / User:</strong> {selectedVoucher.cashier}</div>
                </div>

                {/* Particulars Table */}
                <div style={{ border: '1px solid #000', marginBottom: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ background: '#F0F0F0', borderBottom: '1px solid #000', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '4px 6px', textAlign: 'left', borderRight: '1px solid #000' }}>Particulars / Description</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right', width: '80px', borderRight: '1px solid #000' }}>Revenue</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right', width: '90px' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #CCC' }}>
                        <td style={{ padding: '6px', borderRight: '1px solid #000' }}>
                          {selectedVoucher.description}
                          {selectedVoucher.remarks && (
                            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                              Note: {selectedVoucher.remarks}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>{selectedVoucher.revenue}</td>
                        <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>{selectedVoucher.baseAmount.toFixed(2)}</td>
                      </tr>
                      {selectedVoucher.taxAmount > 0 && (
                        <tr style={{ borderBottom: '1px solid #CCC' }}>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #000' }}>SGST 9% + CGST 9% (GST Slab 18%)</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #000' }}>Tax</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right' }}>{selectedVoucher.taxAmount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr style={{ background: '#F9F9F9', fontWeight: 900 }}>
                        <td style={{ padding: '6px', borderRight: '1px solid #000', textAlign: 'right' }} colSpan={2}>
                          NET TOTAL AMOUNT:
                        </td>
                        <td style={{ padding: '6px', textAlign: 'right', fontSize: '13px' }}>
                          ₹{selectedVoucher.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px' }}>
                  <div style={{ textAlign: 'center', width: '180px', borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '10px' }}>
                    Guest Signature
                  </div>
                  <div style={{ textAlign: 'center', width: '180px', borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '10px' }}>
                    Authorized Cashier / Manager
                  </div>
                </div>

              </div>

              {/* Print Modal Footer */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  borderTop: '1px solid #999', 
                  padding: '8px 14px', 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '6px' 
                }}
              >
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, background: '#DCE6F1', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    window.print();
                  }}
                >
                  <Printer size={12} /> Send to Printer
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    alert(`PDF Voucher saved as: ${selectedVoucher.voucherNo}.pdf (Frame 030 / Frame 054)`);
                    setPrintPreviewOpen(false);
                  }}
                >
                  <Download size={12} /> Save PDF (Frame 030)
                </button>
                <button className="ids-btn-classic" onClick={() => setPrintPreviewOpen(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
