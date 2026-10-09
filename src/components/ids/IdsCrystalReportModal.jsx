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
                    <div><strong>Date & Time:</strong> {data.billDate || '25-JAN-2022'} {data.time || '14:20'}</div>
                    <div><strong>Room No:</strong> {data.roomNo || '314'} (Folio: {data.folioNo || '314/1'})</div>
                    <div><strong>Guest Name:</strong> {data.guestName || 'MR RAJESH SHARMA'}</div>
                  </div>
                  <div>
                    <div><strong>Company:</strong> {data.companyName || 'Tata Consultancy Services Ltd'}</div>
                    <div><strong>Client GSTIN:</strong> {data.gstin || '27AAACT2727Q1ZB'}</div>
                    <div><strong>Arrival:</strong> {data.arrivalDate || '23-JAN-2022'}</div>
                    <div><strong>Departure:</strong> {data.departureDate || '25-JAN-2022'}</div>
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
                      <td style={{ padding: '4px' }}>23-JAN-2022</td>
                      <td style={{ padding: '4px' }}>Room Tariff (Executive AC)</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>996311</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>2,050.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px dotted #CCC' }}>
                      <td style={{ padding: '4px' }}>24-JAN-2022</td>
                      <td style={{ padding: '4px' }}>Room Tariff (Executive AC)</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>996311</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>2,050.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px dotted #CCC' }}>
                      <td style={{ padding: '4px' }}>24-JAN-2022</td>
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
                    <span><strong>Date:</strong> {data.date || '25-JAN-2022'}</span>
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
                    <span><strong>Voucher No:</strong> {data.voucherNo || 'PO-2022-089'}</span>
                    <span><strong>Date:</strong> {data.date || '25-JAN-2022'}</span>
                  </div>
                  <div><strong>Room No:</strong> {data.roomNo || '203'} (Folio: {data.folioNo || '203/1'})</div>
                  <div><strong>Paid To Guest:</strong> {data.guestName || 'MR K. S. PATNAIK'}</div>
                  <div><strong>Refund Amount:</strong> ₹{Number(data.excessAmount || 2500).toLocaleString('en-IN')}.00</div>
                  <div><strong>Reason:</strong> {data.reason || 'Advance deposit excess refund on checkout settlement'}</div>
                  <div><strong>Authorized By:</strong> {data.authorizedBy || 'DUTY MANAGER'}</div>
                </div>
              </div>
            )}

            {/* Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '180px', borderTop: '1px solid #000' }}>
                <div style={{ fontSize: '10px', paddingTop: '4px' }}>Guest Signature</div>
              </div>
              <div style={{ textAlign: 'center', width: '180px', borderTop: '1px solid #000' }}>
                <div style={{ fontSize: '10px', paddingTop: '4px' }}>Authorized Signatory / Cashier</div>
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
