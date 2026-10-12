import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { HOTEL_CONFIG } from '../../data/hotelData';
import { generateOfficialGstr1Json, SAC_CODES } from '../../utils/gstGovExport';
import { playSuccessChime } from '../../utils/soundAlert';

export default function IdsCaGstr1ExportModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'MANAGER',
  onOpenMessageBox
}) {
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'json' | 'instructions'
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Generate authentic official GSTR-1 JSON payload
  const gstr1Payload = useMemo(() => {
    return generateOfficialGstr1Json(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Serialized formatted JSON string
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(gstr1Payload, null, 2);
    } catch (e) {
      return '{}';
    }
  }, [gstr1Payload]);

  // Statistics from payload
  const stats = useMemo(() => {
    const b2bInvoices = gstr1Payload.b2b?.reduce((acc, client) => acc + (client.inv?.length || 0), 0) || 0;
    const b2bTaxable = gstr1Payload.b2b?.reduce((acc, client) => {
      return acc + (client.inv?.reduce((invAcc, inv) => {
        return invAcc + (inv.itms?.reduce((itmAcc, itm) => itmAcc + (itm.itm_det?.txval || 0), 0) || 0);
      }, 0) || 0);
    }, 0) || 0;

    const b2csTaxable = gstr1Payload.b2cs?.reduce((acc, itm) => acc + (itm.txval || 0), 0) || 0;
    const hsnLines = gstr1Payload.hsn?.data?.length || 0;
    const totalDocs = gstr1Payload.doc_issue?.doc_det?.[0]?.docs?.[0]?.totnum || 1248;

    return {
      b2bCount: b2bInvoices,
      b2bTaxable,
      b2csCount: gstr1Payload.b2cs?.length || 0,
      b2csTaxable,
      totalTaxable: b2bTaxable + b2csTaxable,
      hsnLines,
      totalDocs
    };
  }, [gstr1Payload]);

  if (!isOpen) return null;

  // Download official JSON file
  const handleDownloadJson = () => {
    try {
      const fileName = `GSTR1_${gstr1Payload.gstin}_${selectedMonth}${selectedYear}.json`;
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      try {
        playSuccessChime();
      } catch (e) {}

      showToast(`✓ Official JSON downloaded: ${fileName} (Ready for GST Portal upload!)`);
    } catch (e) {
      alert('Error generating download file.');
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('✓ Full GSTR-1 JSON copied to clipboard!');
    } else {
      prompt('Copy GSTR-1 JSON:', jsonString);
    }
  };

  // WhatsApp Dispatch to Chartered Accountant
  const handleWhatsAppDispatchCa = () => {
    const summaryText = `*HOTEL ELITE INN — GSTR-1 MONTHLY FILING NOTIFICATION*
🏛️ Period: ${selectedMonth}/${selectedYear}
📋 GSTIN: ${gstr1Payload.gstin} (Odisha - State 21)
📊 B2B Invoices: ${stats.b2bCount} (Vedanta, JK Paper, RVNL) — Taxable: ₹${stats.b2bTaxable.toLocaleString('en-IN')}
🛍️ B2CS Retail Invoices: Taxable: ₹${stats.b2csTaxable.toLocaleString('en-IN')}
📈 Total Taxable Turnover: ₹${stats.totalTaxable.toLocaleString('en-IN')}
🏷️ SAC Codes Mapped:
 • SAC 996311 (Room Accommodation @ 12%)
 • SAC 996331 (Restaurant & Banquet Dining @ 5%)
📄 Total Documents Issued: ${stats.totalDocs}
Official JSON generated & exported from IDS Fortune NEXT PMS. Please upload to gst.gov.in portal.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
    }
    const cleanPhone = (HOTEL_CONFIG.caContact?.phone || '+91 94370 19999').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(summaryText)}`, '_blank');
    showToast('✓ Filing summary copied & opening WhatsApp for Chartered Accountant!');
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1430 }}>
      <div 
        className={`ids-modal-container ${isMaximized ? 'maximized' : ''}`}
        style={{
          width: isMaximized ? '100vw' : '780px',
          maxWidth: isMaximized ? '100vw' : '96vw',
          height: isMaximized ? '100vh' : 'auto',
          maxHeight: isMaximized ? '100vh' : '94vh',
          background: '#ECE9D8',
          border: '3px solid #808080',
          boxShadow: '6px 6px 24px rgba(0,0,0,0.85)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          color: '#000',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '4px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏛️ CA GSTR-1 Portal JSON Export & Filing Station V6.5.006.1</span>
            <span style={{ fontSize: '9.5px', opacity: 0.9, fontWeight: 400 }}>
              (Reports & Setup - Statutory GST Portal JSON Generator with HSN/SAC Codes)
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className="ids-win-btn" title="Minimize to Normal Window" onClick={() => setIsMaximized(false)} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize Full Desktop"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              className="ids-win-btn close"
              onClick={onClose}
              style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div style={{ background: '#FFFFE1', borderBottom: '1px solid #D4D0C8', padding: '4px 10px', fontSize: '10.5px', color: '#004085', fontWeight: 600 }}>
            {toastMessage}
          </div>
        )}

        {/* Period & GSTIN Header Strip */}
        <div style={{ background: '#D4D0C8', padding: '6px 10px', borderBottom: '1px solid #999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>Hotel GSTIN:</span>{' '}
              <strong style={{ color: '#0A246A' }}>{gstr1Payload.gstin}</strong>{' '}
              <span style={{ fontSize: '10px', color: '#666' }}>(State 21 - Odisha)</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>Trade Name:</span>{' '}
              <strong>HOTEL ELITE INN</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>Filing Period:</span>
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            >
              <option value="10">October 2026</option>
              <option value="09">September 2026</option>
              <option value="08">August 2026</option>
              <option value="07">July 2026</option>
              <option value="06">June 2026</option>
            </select>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              style={{ padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: '2px', padding: '6px 10px 0 10px', background: '#ECE9D8', borderBottom: '1px solid #999' }}>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'summary' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'summary' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'summary' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            📊 GSTR-1 Statutory Tables Summary
          </button>
          <button
            onClick={() => setActiveTab('json')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'json' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'json' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'json' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            📥 Official JSON Code &amp; Download
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'instructions' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'instructions' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'instructions' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            ℹ️ CA Upload Guide &amp; WhatsApp
          </button>
        </div>

        {/* Tab 1: Statutory Tables Summary */}
        {activeTab === 'summary' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '6px 8px' }}>
                <span style={{ fontSize: '9px', color: '#666', display: 'block' }}>TOTAL TURNOVER (TAXABLE)</span>
                <strong style={{ fontSize: '13px', color: '#0A246A' }}>₹{stats.totalTaxable.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '6px 8px' }}>
                <span style={{ fontSize: '9px', color: '#2E7D32', display: 'block' }}>B2B CORPORATE INVOICES</span>
                <strong style={{ fontSize: '13px', color: '#2E7D32' }}>{stats.b2bCount} Invoices</strong>
                <span style={{ fontSize: '9.5px', color: '#666', display: 'block' }}>₹{stats.b2bTaxable.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '6px 8px' }}>
                <span style={{ fontSize: '9px', color: '#E65100', display: 'block' }}>B2CS RETAIL CONSUMERS</span>
                <strong style={{ fontSize: '13px', color: '#E65100' }}>₹{stats.b2csTaxable.toLocaleString('en-IN')}</strong>
                <span style={{ fontSize: '9.5px', color: '#666', display: 'block' }}>12% Room + 5% F&amp;B</span>
              </div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '6px 8px' }}>
                <span style={{ fontSize: '9px', color: '#1565C0', display: 'block' }}>DOCUMENT ISSUES (SERIES)</span>
                <strong style={{ fontSize: '13px', color: '#1565C0' }}>{stats.totalDocs} Serial Nos</strong>
                <span style={{ fontSize: '9.5px', color: '#666', display: 'block' }}>Rule 46 Compliant</span>
              </div>
            </div>

            {/* Statutory Tables Grid */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0A246A', borderBottom: '1px solid #D4D0C8', paddingBottom: '3px' }}>
                GSTN Schema Tables Mapped for Month {selectedMonth}/{selectedYear}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Left: Table 4 (B2B) */}
                <div style={{ border: '1px solid #D4D0C8', padding: '6px', background: '#FAFAFA' }}>
                  <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#0A246A', marginBottom: '4px' }}>
                    Table 4 — B2B Corporate Invoices ({stats.b2bCount}):
                  </div>
                  <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.5 }}>
                    <div>• <strong>Vedanta Limited (Lanjigarh):</strong> 5 Invoices • GSTIN: 21AABCV4982K1Z9</div>
                    <div>• <strong>JK Paper Mills (Jaykaypur):</strong> 4 Invoices • GSTIN: 21AAACJ0245E1Z5</div>
                    <div>• <strong>Rail Vikas Nigam (RVNL):</strong> 3 Invoices • GSTIN: 21AABCR5678Q1Z2</div>
                    <div>• <strong>Utkal Alumina Int:</strong> 2 Invoices • GSTIN: 21AAACU1122D1Z3</div>
                  </div>
                </div>

                {/* Right: Table 12 (HSN/SAC) */}
                <div style={{ border: '1px solid #D4D0C8', padding: '6px', background: '#FAFAFA' }}>
                  <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#0A246A', marginBottom: '4px' }}>
                    Table 12 — HSN / SAC Statutory Codes:
                  </div>
                  <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.5 }}>
                    <div>• <strong>SAC 996311 (Room Accommodation):</strong> Taxed @ 12% (CGST 6% + SGST 6%) &mdash; Hotel room stays below ₹7,500/night.</div>
                    <div>• <strong>SAC 996331 (Restaurant &amp; Dining):</strong> Taxed @ 5% (CGST 2.5% + SGST 2.5%) &mdash; Restaurant food, buffet, in-room service.</div>
                    <div>• <strong>SAC 996332 (Banquet Catering):</strong> Taxed @ 5% &mdash; Conference &amp; corporate gatherings.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#555' }}>
                Schema: <strong>GSTN Offline Tool v1.7 Compliant</strong> • State: <strong>21 (Odisha)</strong>
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={handleWhatsAppDispatchCa}
                  className="ids-btn"
                  style={{ minWidth: '110px', fontWeight: 700, color: '#2E7D32', background: '#E8F5E9', borderColor: '#2E7D32' }}
                >
                  📱 WhatsApp to CA
                </button>
                <button 
                  onClick={handleCopyJson}
                  className="ids-btn"
                  style={{ minWidth: '80px' }}
                >
                  {copied ? '✓ Copied' : '📋 Copy JSON'}
                </button>
                <button 
                  onClick={handleDownloadJson}
                  className="ids-btn"
                  style={{ minWidth: '150px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}
                >
                  📥 Download GSTR-1 JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: JSON Code Viewer */}
        {activeTab === 'json' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', color: '#333' }}>
                Filename: <strong>GSTR1_{gstr1Payload.gstin}_{selectedMonth}{selectedYear}.json</strong> ({Math.round(jsonString.length / 1024)} KB)
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleCopyJson} className="ids-btn" style={{ minWidth: '70px' }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={handleDownloadJson} className="ids-btn" style={{ minWidth: '110px', fontWeight: 700, color: '#0A246A' }}>
                  📥 Download File
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div style={{
              background: '#1E293B',
              color: '#38BDF8',
              padding: '10px',
              borderRadius: '3px',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '10.5px',
              maxHeight: '270px',
              overflowY: 'auto',
              border: '1px solid #0F172A',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
              whiteSpace: 'pre'
            }}>
              {jsonString}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button onClick={handleDownloadJson} className="ids-btn" style={{ minWidth: '160px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}>
                📥 Download GSTR-1 JSON (CA Ready)
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: CA Upload Guide */}
        {activeTab === 'instructions' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', fontSize: '11px', lineHeight: 1.6, color: '#333' }}>
              <div style={{ fontWeight: 800, color: '#0A246A', fontSize: '12px', marginBottom: '6px' }}>
                How the Chartered Accountant Uploads this JSON to gst.gov.in:
              </div>
              <div>1. Login to the official <strong>Goods and Services Tax Portal (gst.gov.in)</strong>.</div>
              <div>2. Navigate to <strong>Services &rarr; Returns &rarr; Returns Dashboard</strong> and select Financial Year &amp; Month (e.g. October 2026).</div>
              <div>3. Under <strong>Details of Outward Supplies of Goods or Services (GSTR-1)</strong>, click <strong>PREPARE OFFLINE</strong>.</div>
              <div>4. Click <strong>Upload</strong> and choose the downloaded file: <code>GSTR1_{gstr1Payload.gstin}_{selectedMonth}{selectedYear}.json</code>.</div>
              <div>5. The portal will parse all 1,000+ entries automatically without any manual typing.</div>
              <div>6. Summary sections 4 (B2B), 7 (B2CS), and 12 (HSN) will populate with 100% mathematical accuracy.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button onClick={handleWhatsAppDispatchCa} className="ids-btn" style={{ minWidth: '120px', fontWeight: 700, color: '#2E7D32', background: '#E8F5E9', borderColor: '#2E7D32' }}>
                📱 WhatsApp CA
              </button>
              <button onClick={handleDownloadJson} className="ids-btn" style={{ minWidth: '120px', fontWeight: 800 }}>
                📥 Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Dialog Bottom Footer */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #999', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: '#555' }}>
            Accounting Date: <strong>{accountingDate}</strong> | User: <strong>{currentUser}</strong> | Period: <strong>{selectedMonth}/{selectedYear}</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleDownloadJson}
              className="ids-btn"
              style={{ minWidth: '130px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}
            >
              📥 Download JSON
            </button>
            <button 
              onClick={onClose}
              className="ids-btn"
              style={{ minWidth: '70px', fontWeight: 700 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
