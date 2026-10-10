// Authentic Crystal Reports 8.5/9.0 Viewer Modal for IDS Fortune NEXT
import React, { useState } from 'react';
import { HOTEL_CONFIG } from '../../data/hotelData';

export default function IdsCrystalReportModal({
  isOpen,
  onClose,
  reportType = 'rule46-bill', // 'rule46-bill' | 'advance-receipt' | 'paid-out' | 'reg-card' | 'forex-cert'
  data = {}
}) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'advance-receipt': return 'Front Office Advance Money Receipt';
      case 'paid-out': return 'Front Office Paid-Out Cash Refund Voucher';
      case 'reg-card': return 'Guest Registration Card (Crystal Report)';
      case 'forex-cert': return 'Foreign Currency Encashment Certificate (Form FLM)';
      case 'laundry-bill': return 'Laundry & Dry Cleaning Statutory Tax Invoice (SAC 999791)';
      case 'room-verification': return 'Housekeeping Room Verification & Discrepancy Audit Report';
      case 'pos-bill': return 'Restaurant / Bar POS Guest Tax Invoice (SAC 996331)';
      case 'pos-nc-bill': return 'Non-Chargeable (NC) F&B Departmental Cost Voucher (SAC 996331)';
      case 'rule46-bill':
      default: return 'Rule 46 Statutory GST Tax Invoice';
    }
  };

  return (
    <div 
      className="ids-modal-overlay" 
      style={{ 
        zIndex: 1500, 
        background: 'rgba(0, 0, 0, 0.65)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'flex-start',
        padding: '20px 0',
        overflowY: 'auto'
      }}
    >
      {/* Crystal Reports Viewer Outer Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '840px', 
          maxWidth: '96vw', 
          background: '#ECE9D8', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-dialog-titlebar plain" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>🖨️</span>
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>
              Crystal Report Viewer - [{getReportTitle()}]
            </span>
          </div>
          <button 
            type="button"
            className="ids-win-btn close" 
            onClick={onClose} 
            style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
          >
            ✕
          </button>
        </div>

        {/* Crystal Reports Toolbar matching Video 35 & 36 */}
        <div 
          style={{ 
            background: '#ECE9D8', 
            borderBottom: '1px solid #716F64', 
            padding: '4px 8px', 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            fontSize: '11px',
            flexWrap: 'wrap'
          }}
        >
          <button 
            type="button"
            className="ids-btn-classic" 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
          >
            <span>🖨️</span> Print
          </button>

          <button 
            type="button"
            className="ids-btn-classic" 
            onClick={() => alert("Report Exported to PDF successfully.")}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>💾</span> Export (PDF)
          </button>

          <div style={{ width: '1px', height: '18px', background: '#999', margin: '0 4px' }} />

          <button 
            type="button"
            className="ids-btn-classic" 
            onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
            style={{ padding: '1px 6px' }}
          >
            -
          </button>
          <span style={{ fontWeight: 600 }}>{zoomLevel}%</span>
          <button 
            type="button"
            className="ids-btn-classic" 
            onClick={() => setZoomLevel(prev => Math.min(130, prev + 15))}
            style={{ padding: '1px 6px' }}
          >
            +
          </button>

          <div style={{ width: '1px', height: '18px', background: '#999', margin: '0 4px' }} />

          <button type="button" className="ids-btn-classic" disabled style={{ padding: '1px 6px', color: '#888' }}>⏮</button>
          <button type="button" className="ids-btn-classic" disabled style={{ padding: '1px 6px', color: '#888' }}>◀</button>
          <span style={{ fontSize: '10.5px' }}>Page 1 of 1</span>
          <button type="button" className="ids-btn-classic" disabled style={{ padding: '1px 6px', color: '#888' }}>▶</button>
          <button type="button" className="ids-btn-classic" disabled style={{ padding: '1px 6px', color: '#888' }}>⏭</button>

          <button 
            type="button"
            className="ids-btn-classic" 
            onClick={onClose}
            style={{ marginLeft: 'auto', minWidth: '60px' }}
          >
            Close
          </button>
        </div>

        {/* Paper Canvas Container */}
        <div 
          style={{ 
            background: '#808080', 
            padding: '20px', 
            overflowY: 'auto', 
            display: 'flex', 
            justifyContent: 'center',
            flexGrow: 1
          }}
        >
          {/* White A4 Sheet */}
          <div 
            style={{ 
              width: `${(680 * zoomLevel) / 100}px`, 
              background: '#FFF', 
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)', 
              padding: '24px 28px', 
              color: '#000',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '11.5px',
              lineHeight: '1.4'
            }}
          >
            {/* Header matching Videos 08, 14, 15, 35, 36 */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {HOTEL_CONFIG.name}
              </div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                {HOTEL_CONFIG.address}
              </div>
              <div style={{ fontSize: '10.5px', marginTop: '1px' }}>
                Phone: {HOTEL_CONFIG.phone} | Email: {HOTEL_CONFIG.email}
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, marginTop: '2px' }}>
                GSTIN: {HOTEL_CONFIG.gstin} | PAN: {HOTEL_CONFIG.pan} | State Code: 21 (Odisha)
              </div>
            </div>

            {/* Document Specific Body */}
            {reportType === 'rule46-bill' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, textDecoration: 'underline' }}>
                    TAX INVOICE (RULE 46 - GST)
                  </span>
                  <span style={{ fontSize: '10px', fontStyle: 'italic', border: '1px solid #000', padding: '1px 6px' }}>
                    ORIGINAL FOR RECIPIENT
                  </span>
                </div>

                {/* Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', border: '1px solid #000', padding: '8px', marginBottom: '12px', fontSize: '11px' }}>
                  <div>
                    <div><strong>Bill No:</strong> {data.billNo || '503'}</div>
                    <div><strong>Date & Time:</strong> {data.billDate || '25-JAN-2026'} {data.time || '14:20'}</div>
                    <div><strong>Room No:</strong> {data.roomNo || '314'} (Folio: {data.folioNo || '314/1'})</div>
                    <div><strong>Guest Name:</strong> {data.guestName || 'MR RAJESH SHARMA'}</div>
                  </div>
                  <div>
                    <div><strong>Company:</strong> {data.companyName || 'Tata Consultancy Services Ltd'}</div>
                    <div><strong>Client GSTIN:</strong> {data.gstin || '27AAACT2727Q1ZB'}</div>
                    <div><strong>Arrival:</strong> {data.arrivalDate || '23-JAN-2026'}</div>
                    <div><strong>Departure:</strong> {data.departureDate || '25-JAN-2026'}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000', background: '#F5F5F5' }}>
                      <th style={{ textAlign: 'left', padding: '4px' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '4px' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '4px' }}>SAC</th>
                      <th style={{ textAlign: 'right', padding: '4px' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px dotted #CCC' }}>
                      <td style={{ padding: '4px' }}>23-JAN-2026</td>
                      <td style={{ padding: '4px' }}>Room Tariff (Executive AC)</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>996311</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>2,050.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px dotted #CCC' }}>
                      <td style={{ padding: '4px' }}>24-JAN-2026</td>
                      <td style={{ padding: '4px' }}>Room Tariff (Executive AC)</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>996311</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>2,050.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px dotted #CCC' }}>
                      <td style={{ padding: '4px' }}>24-JAN-2026</td>
                      <td style={{ padding: '4px' }}>Restaurant Room Service (POS-5)</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>996332</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>850.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals & Tax Calculation */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div style={{ width: '280px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>Gross Amount:</span>
                      <span>₹{Number(data.grossAmount || 4950).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>CGST (6%):</span>
                      <span>₹{Number(data.cgst || 297).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>SGST (6%):</span>
                      <span>₹{Number(data.sgst || 297).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 900, padding: '4px 0', fontSize: '12px' }}>
                      <span>Grand Total:</span>
                      <span>₹{Number(data.grandTotal || 5544).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#555' }}>
                      <span>Less: Advance Adjusted:</span>
                      <span>-₹{Number(data.depositAmount || 2000).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '2px 0' }}>
                      <span>Net Balance Paid:</span>
                      <span>₹{Number((data.grandTotal || 5544) - (data.depositAmount || 2000)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'advance-receipt' && (
              <div>
                <div style={{ textAlign: 'center', fontWeight: 900, textDecoration: 'underline', marginBottom: '12px' }}>
                  ADVANCE MONEY RECEIPT (MONEY VOUCHER)
                </div>

                <div style={{ border: '1px solid #000', padding: '12px', marginBottom: '14px', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>Receipt No:</strong> {data.receiptNo || 'RCP-1042'}</span>
                    <span><strong>Date:</strong> {data.date || '25-JAN-2026'}</span>
                  </div>
                  <div><strong>Room No:</strong> {data.roomNo || '201'} (Folio: {data.folioNo || '201/1'})</div>
                  <div><strong>Received With Thanks From:</strong> {data.guestName || 'MR VIKRAM SINGHANIA'}</div>
                  <div><strong>The Sum of Rupees:</strong> ₹{Number(data.amount || 5000).toLocaleString('en-IN')}.00</div>
                  <div><strong>Mode of Settlement:</strong> {data.tenderMode || 'Credit Card (Visa)'}</div>
                  <div><strong>Towards:</strong> Advance Deposit against Accommodation / Room Charges</div>
                </div>
              </div>
            )}

            {reportType === 'paid-out' && (
              <div>
                <div style={{ textAlign: 'center', fontWeight: 900, textDecoration: 'underline', marginBottom: '12px' }}>
                  PAID-OUT CASH REFUND VOUCHER
                </div>

                <div style={{ border: '1px solid #000', padding: '12px', marginBottom: '14px', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>Voucher No:</strong> {data.voucherNo || 'PO-2026-089'}</span>
                    <span><strong>Date:</strong> {data.date || '25-JAN-2026'}</span>
                  </div>
                  <div><strong>Room No:</strong> {data.roomNo || '203'} (Folio: {data.folioNo || '203/1'})</div>
                  <div><strong>Paid To Guest:</strong> {data.guestName || 'MR K. S. PATNAIK'}</div>
                  <div><strong>Refund Amount:</strong> ₹{Number(data.excessAmount || 2500).toLocaleString('en-IN')}.00</div>
                  <div><strong>Reason:</strong> {data.reason || 'Advance deposit excess refund on checkout settlement'}</div>
                  <div><strong>Authorized By:</strong> {data.authorizedBy || 'DUTY MANAGER'}</div>
                </div>
              </div>
            )}

            {reportType === 'laundry-bill' && (
              <div>
                <div style={{ textAlign: 'center', fontWeight: 900, textDecoration: 'underline', marginBottom: '12px' }}>
                  LAUNDRY & DRY CLEANING STATUTORY TAX INVOICE (SAC 999791)
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div><strong>Invoice No:</strong> {data.billNo || 'LAU-BL-205-2026'}</div>
                    <div><strong>Date:</strong> {data.billDate || '27-JAN-2026'}</div>
                    <div><strong>SAC Code:</strong> {data.sacCode || '999791'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Room No:</strong> {data.roomNo || '205'}</div>
                    <div><strong>Guest Name:</strong> {data.guestName || 'Mr Kumar Anil'}</div>
                    <div><strong>Settlement:</strong> {data.payMode || 'Room Folio'}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F0F0F0', borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Description</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '80px' }}>Gross</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>Disc</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>CGST 9%</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>SGST 9%</th>
                      <th style={{ padding: '4px', textAlign: 'right', width: '90px' }}>Net Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <td style={{ padding: '6px', borderRight: '1px solid #000' }}>{data.serviceDesc || 'Laundry & Steam Press Services'}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>₹{Number(data.grossAmount || 200).toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>₹{Number(data.discount || 0).toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>₹{Number(data.cgstAmount || 18).toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>₹{Number(data.sgstAmount || 18).toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>₹{Number(data.netTotal || 236).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'room-verification' && (
              <div>
                <div style={{ textAlign: 'center', fontWeight: 900, textDecoration: 'underline', marginBottom: '8px' }}>
                  HOUSEKEEPING ROOM VERIFICATION & DISCREPANCY AUDIT REPORT
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '10px' }}>
                  <div>
                    <div><strong>Audit Date:</strong> {data.auditDate || '27-JAN-2026'}</div>
                    <div><strong>Audit Shift:</strong> {data.shift || 'Morning Shift (07:00 - 15:30)'}</div>
                    <div><strong>Audited By:</strong> {data.auditor || 'Executive Housekeeper / Floor Supervisor'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Total Inspected Rooms:</strong> 55</div>
                    <div><strong>Matched Rooms:</strong> 54</div>
                    <div><strong>Discrepancies Flagged:</strong> <span style={{ color: '#C00', fontWeight: 'bold' }}>1</span></div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', marginBottom: '12px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Room#</th>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Type</th>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Front Office Status</th>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Housekeeping Status</th>
                      <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>FO Pax</th>
                      <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>HK Pax</th>
                      <th style={{ padding: '4px', textAlign: 'left' }}>Variance / Audit Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>201</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>EXE</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Occupied (Sharma Raj)</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Do Not Disturb (DND)</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>2+0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>1+0</td>
                      <td style={{ padding: '4px', color: '#008000', fontWeight: 'bold' }}>MATCH (Verified via Call)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>203</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>DLX</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Vacant</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Vacant Dirty</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', color: '#008000' }}>MATCH (Pending Cleaning)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>204</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>DLX</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Vacant</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Vacant Clean</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', color: '#008000' }}>MATCH</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>205</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>DLX</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Occupied (Kumar Anil)</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Occupied Clean</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>1+0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>2+0</td>
                      <td style={{ padding: '4px', color: '#C00', fontWeight: 'bold' }}>DISCREPANCY: +1 EXTRA PAX (2 Pax in Room)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>206</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>DLX</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Out of Order (OOO)</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Out of Order (AC Repair)</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', color: '#008000' }}>MATCH (Blocked by Maintenance)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>207</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>DLX</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Vacant</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Inspected Ready</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>0</td>
                      <td style={{ padding: '4px', color: '#008000' }}>MATCH (Available for Sale)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 'bold' }}>301</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>EXE</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Occupied (Biswakarma)</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Occupied Clean</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>1+0</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>1+0</td>
                      <td style={{ padding: '4px', color: '#008000' }}>MATCH</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* POS Restaurant / Bar Bill Format (Video 03 Frame 033 / 036) */}
            {reportType === 'pos-bill' && (
              <div style={{ marginTop: '10px', fontSize: '11px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div>
                    <div><strong>Bill No:</strong> {data.billNo || 'B-1042'}</div>
                    <div><strong>Table No:</strong> {data.tableNo || '10'}</div>
                    <div><strong>Covers:</strong> {data.covers || '2'}</div>
                    <div><strong>Outlet:</strong> {data.outlet || 'RESTAURANT'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Date:</strong> {data.accountingDate || '03-FEB-2026'}</div>
                    <div><strong>Session:</strong> {data.session || 'General'}</div>
                    <div><strong>Steward:</strong> {data.server || 'Manash'}</div>
                    <div><strong>HSN/SAC:</strong> 996331 (Restaurant Services)</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '15px' }}>
                  <thead>
                    <tr style={{ background: '#E0E0E0', borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Item Description</th>
                      <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000', width: '50px' }}>Qty</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>Rate (₹)</th>
                      <th style={{ padding: '4px', textAlign: 'right', width: '80px' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.items || [
                      { name: 'Classic Russian Salad .', quantity: 1, rate: 199.0, value: 199.0 },
                      { name: 'Red Beans Peanut _Dry', quantity: 1, rate: 199.0, value: 199.0 },
                      { name: 'Sprouted Moong Peanut D', quantity: 1, rate: 199.0, value: 199.0 }
                    ]).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #DDD' }}>
                        <td style={{ padding: '4px', borderRight: '1px solid #000' }}>{it.name}</td>
                        <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>{Number(it.quantity || 1).toFixed(0)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>{Number(it.rate || it.value || 0).toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{Number(it.value || (it.quantity * it.rate) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold' }}>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>Sub Total (Item Value)</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{Number(data.subTotal || 597.0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>Central GST @ 2.50%</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{Number(data.cgst || 14.93).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>State GST @ 2.50%</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{Number(data.sgst || 14.93).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #000', background: '#F0F0F0', fontSize: '13px', fontWeight: 'bold' }}>
                      <td colSpan={3} style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>NET TOTAL AMOUNT PAYABLE</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#000080' }}>₹{Number(data.total || 627.0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* POS Non-Chargeable (NC) Bill / Departmental Cost Voucher (Video 08 Frames 018-026) */}
            {reportType === 'pos-nc-bill' && (
              <div style={{ marginTop: '10px', fontSize: '11px' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#800000', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  NON-CHARGEABLE (NC) BILL / DEPARTMENTAL COST DEBIT VOUCHER
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div>
                    <div><strong>Voucher No:</strong> {data.voucherNo || 'NC-107'}</div>
                    <div><strong>Table No:</strong> {data.tableNo || '10'}</div>
                    <div><strong>Department:</strong> {data.department || 'Managers (MGR)'}</div>
                    <div><strong>Guest / Requisitioner:</strong> {data.guestName || 'MANAGER.IT'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Date:</strong> {data.accountingDate || '03-FEB-2026'}</div>
                    <div><strong>Outlet / Session:</strong> {data.outlet || 'RESTAURANT'} / {data.session || 'General'}</div>
                    <div><strong>Steward:</strong> {data.server || 'Biren'}</div>
                    <div><strong>SAC / HSN Code:</strong> 996331 (F&B Internal Requisition)</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '15px' }}>
                  <thead>
                    <tr style={{ background: '#EAEAEA', borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Item Description</th>
                      <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000', width: '50px' }}>Qty</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>Menu Rate (₹)</th>
                      <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', width: '70px' }}>Cost Rate (₹)</th>
                      <th style={{ padding: '4px', textAlign: 'right', width: '80px' }}>Dept Debit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.items || [
                      { name: 'MILK SHAKE WITH ICE CREAM', quantity: 1, rate: 150.0, costRate: 45.0, value: 45.0 },
                      { name: 'BLUEBERRY COLD CHEESE CAKE', quantity: 1, rate: 165.0, costRate: 49.5, value: 49.5 }
                    ]).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #DDD' }}>
                        <td style={{ padding: '4px', borderRight: '1px solid #000' }}>{it.name}</td>
                        <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>{Number(it.quantity || 1).toFixed(0)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>{Number(it.rate || 0).toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>{Number(it.costRate || it.value || 0).toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{Number(it.value || (it.quantity * (it.costRate || it.rate)) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold', background: '#F8F8F8' }}>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>Total Standard Menu Valuation</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{Number(data.menuTotal || 315.0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>Central GST (0.00% - Rule 28/31 Internal Transfer)</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000' }}>State GST (0.00% - Rule 28/31 Internal Transfer)</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #000', background: '#F0F0F0', fontSize: '13px', fontWeight: 'bold' }}>
                      <td colSpan={4} style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000' }}>TOTAL COST DEBITED TO DEPARTMENT [{data.deptCode || 'MGR'}]</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#800000' }}>₹{Number(data.totalCost || 94.50).toFixed(2)}</td>
                    </tr>
                    <tr style={{ background: '#FFF8E7', fontSize: '12px', fontWeight: 'bold' }}>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #000', color: '#008000' }}>NET PAYABLE BY GUEST</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#008000' }}>₹0.00 (COMPLIMENTARY)</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#555', border: '1px dashed #999', padding: '6px', background: '#FAFAFA', marginBottom: '10px' }}>
                  <strong>Statutory & Accounting Compliance Note:</strong> This voucher records Non-Chargeable internal F&B consumption under IDS Fortune NEXT 6.5/7.0 protocol. Debited to Department Cost Center [{data.department || 'Managers (MGR)'}]. Excluded from outward commercial tax invoice turnover under CGST Act 2017.
                </div>
              </div>
            )}

            {/* Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #000' }}>
                <div style={{ fontSize: '10px', paddingTop: '4px' }}>
                  {reportType === 'pos-nc-bill' ? `Requisitioner (${data.guestName || 'MANAGER.IT'})` : 'Guest Signature'}
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #000' }}>
                <div style={{ fontSize: '10px', paddingTop: '4px' }}>
                  {reportType === 'pos-nc-bill' ? 'F&B Manager / Authorized Signatory' : 'Authorized Signatory / Cashier'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '9px', color: '#666', marginTop: '20px' }}>
              Thank you for staying at Hotel Elite Inn, Muniguda! This is a system-generated document.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
