import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { HOTEL_CONFIG, CORPORATE_PARTNERS } from '../../data/hotelData';
import { sendDebtorStatementWhatsApp } from '../../utils/whatsappDispatch';
import { playSuccessChime } from '../../utils/soundAlert';
import { getFastApiCorporateDebtorsAging, settleFastApiCorporateInvoice } from '../../utils/backendApi';

// Authentic Corporate BTC Partners & Ledger Entries for Hotel Elite Inn (Muniguda / Rayagada)
export const CORPORATE_BTC_ACCOUNTS = [
  {
    code: 'CORP-01',
    companyCode: 'COM0004',
    name: 'Vedanta Limited',
    unit: 'Lanjigarh Alumina Refinery',
    gstin: '21AABCV4982K1Z9',
    pan: 'AABCV4982K',
    contactPerson: 'Mr. Pradeep Mohanty (Sr. Admin Manager)',
    phone: '+91 94370 18001',
    email: 'admin.lanjigarh@vedanta.co.in',
    creditLimit: 250000,
    creditDays: 30,
    currentBalance: 142850,
    aging: {
      days0_30: 84200,
      days31_60: 42150,
      days61_90: 16500,
      days90_plus: 0
    },
    invoices: [
      { invoiceNo: 'BTC-2026-089', date: '28-SEP-2026', guestName: 'Santosh Biswakarma (Project Lead)', roomNo: '101', stay: '25-SEP to 28-SEP', amount: 8200, paid: 0, pending: 8200, ageDays: 14, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-082', date: '21-SEP-2026', guestName: 'Rajesh Senapati (Auditor)', roomNo: '105', stay: '18-SEP to 21-SEP', amount: 9450, paid: 0, pending: 9450, ageDays: 21, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-071', date: '08-SEP-2026', guestName: 'Executive Team (4 Rooms Group)', roomNo: '201, 203, 205, 207', stay: '05-SEP to 08-SEP', amount: 66550, paid: 0, pending: 66550, ageDays: 34, bracket: '31-60', status: 'Pending' },
      { invoiceNo: 'BTC-2026-060', date: '22-AUG-2026', guestName: 'Dr. Debasis Panda (Plant Doctor)', roomNo: '109', stay: '19-AUG to 22-AUG', amount: 42150, paid: 0, pending: 42150, ageDays: 51, bracket: '31-60', status: 'Pending' },
      { invoiceNo: 'BTC-2026-045', date: '02-AUG-2026', guestName: 'K. S. Rao (Safety Consultant)', roomNo: '206', stay: '30-JUL to 02-AUG', amount: 16500, paid: 0, pending: 16500, ageDays: 71, bracket: '61-90', status: 'Overdue' }
    ]
  },
  {
    code: 'CORP-02',
    companyCode: 'COM0002',
    name: 'JK Paper Mills Limited',
    unit: 'Jaykaypur Plant / Rayagada',
    gstin: '21AAACJ0245E1Z5',
    pan: 'AAACJ0245E',
    contactPerson: 'Mr. Arvind Singhania (Commercial Head)',
    phone: '+91 94370 18002',
    email: 'accounts.jaykaypur@jkpaper.com',
    creditLimit: 150000,
    creditDays: 30,
    currentBalance: 88400,
    aging: {
      days0_30: 52400,
      days31_60: 26000,
      days61_90: 10000,
      days90_plus: 0
    },
    invoices: [
      { invoiceNo: 'BTC-2026-088', date: '27-SEP-2026', guestName: 'Anil Kumar (Technical Lead)', roomNo: '206', stay: '24-SEP to 27-SEP', amount: 14500, paid: 0, pending: 14500, ageDays: 15, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-081', date: '20-SEP-2026', guestName: 'P. K. Jena (Quality Inspector)', roomNo: '203', stay: '17-SEP to 20-SEP', amount: 37900, paid: 0, pending: 37900, ageDays: 22, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-068', date: '05-SEP-2026', guestName: 'Mechanical Vendor Delegation', roomNo: '301, 303', stay: '02-SEP to 05-SEP', amount: 26000, paid: 0, pending: 26000, ageDays: 37, bracket: '31-60', status: 'Pending' },
      { invoiceNo: 'BTC-2026-042', date: '28-JUL-2026', guestName: 'S. N. Mishra (Electrical Engg)', roomNo: '102', stay: '25-JUL to 28-JUL', amount: 10000, paid: 0, pending: 10000, ageDays: 76, bracket: '61-90', status: 'Overdue' }
    ]
  },
  {
    code: 'CORP-03',
    companyCode: 'COM0007',
    name: 'Rail Vikas Nigam Limited (RVNL)',
    unit: 'Muniguda Junction Doubling Project',
    gstin: '21AABCR5678Q1Z2',
    pan: 'AABCR5678Q',
    contactPerson: 'Er. R. K. Behera (Chief Project Manager)',
    phone: '+91 94370 18003',
    email: 'cpm.muniguda@rvnl.gov.in',
    creditLimit: 100000,
    creditDays: 45,
    currentBalance: 64200,
    aging: {
      days0_30: 28400,
      days31_60: 21800,
      days61_90: 14000,
      days90_plus: 0
    },
    invoices: [
      { invoiceNo: 'BTC-2026-086', date: '25-SEP-2026', guestName: 'Track Inspection Engineers (3 Pax)', roomNo: '202, 204', stay: '22-SEP to 25-SEP', amount: 28400, paid: 0, pending: 28400, ageDays: 17, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-074', date: '12-SEP-2026', guestName: 'Signalling Consultant', roomNo: '108', stay: '09-SEP to 12-SEP', amount: 21800, paid: 0, pending: 21800, ageDays: 30, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-050', date: '10-AUG-2026', guestName: 'Safety Audit Commission Team', roomNo: '109', stay: '07-AUG to 10-AUG', amount: 14000, paid: 0, pending: 14000, ageDays: 63, bracket: '61-90', status: 'Overdue' }
    ]
  },
  {
    code: 'CORP-04',
    companyCode: 'COM0005',
    name: 'Utkal Alumina International Ltd',
    unit: 'Tikiri Operations / Rayagada',
    gstin: '21AAACU1122D1Z3',
    pan: 'AAACU1122D',
    contactPerson: 'Mr. Subash Pradhan (Liaison Officer)',
    phone: '+91 94370 18004',
    email: 'liaison.tikiri@adityabirla.com',
    creditLimit: 100000,
    creditDays: 30,
    currentBalance: 42100,
    aging: {
      days0_30: 17450,
      days31_60: 24650,
      days61_90: 0,
      days90_plus: 0
    },
    invoices: [
      { invoiceNo: 'BTC-2026-084', date: '23-SEP-2026', guestName: 'Mining Survey Officers', roomNo: '103', stay: '20-SEP to 23-SEP', amount: 17450, paid: 0, pending: 17450, ageDays: 19, bracket: '0-30', status: 'Pending' },
      { invoiceNo: 'BTC-2026-065', date: '01-SEP-2026', guestName: 'Heavy Equipment Technicians', roomNo: '106', stay: '28-AUG to 01-SEP', amount: 24650, paid: 0, pending: 24650, ageDays: 41, bracket: '31-60', status: 'Pending' }
    ]
  },
  {
    code: 'CORP-05',
    companyCode: 'COM0001',
    name: 'Ashok Leyland Limited',
    unit: 'Commercial Fleet Hub / Regional Office',
    gstin: '21AAACA9876P1Z1',
    pan: 'AAACA9876P',
    contactPerson: 'Mr. Rajesh Sharma (Area Service Manager)',
    phone: '+91 94370 18005',
    email: 'service.odisha@ashokleyland.com',
    creditLimit: 75000,
    creditDays: 30,
    currentBalance: 31500,
    aging: {
      days0_30: 0,
      days31_60: 0,
      days61_90: 11500,
      days90_plus: 20000
    },
    invoices: [
      { invoiceNo: 'BTC-2026-048', date: '08-AUG-2026', guestName: 'Regional Audit Officer', roomNo: '102', stay: '05-AUG to 08-AUG', amount: 11500, paid: 0, pending: 11500, ageDays: 65, bracket: '61-90', status: 'Overdue' },
      { invoiceNo: 'BTC-2026-030', date: '25-JUN-2026', guestName: 'Fleet Service Engineers', roomNo: '104', stay: '22-JUN to 25-JUN', amount: 20000, paid: 0, pending: 20000, ageDays: 109, bracket: '90+', status: 'Overdue' }
    ]
  }
];

export default function IdsCorporateBtcAgingModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'MANAGER',
  onOpenMessageBox
}) {
  const [corporates, setCorporates] = useState(() => CORPORATE_BTC_ACCOUNTS);
  const [selectedCorpCode, setSelectedCorpCode] = useState('CORP-01');
  const [activeTab, setActiveTab] = useState('aging'); // 'aging' | 'invoices' | 'settlement'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBracketFilter, setSelectedBracketFilter] = useState('ALL'); // 'ALL', '0-30', '31-60', '61-90', '90+'
  const [toastMessage, setToastMessage] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  // Settlement Form State
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMode, setSettleMode] = useState('NEFT');
  const [settleRef, setSettleRef] = useState('');
  const [settleBank, setSettleBank] = useState('SBI Rayagada Main Branch');
  const [settleNotes, setSettleNotes] = useState('');

  // Sync live debtor aging from Railway PostgreSQL backend
  React.useEffect(() => {
    if (!isOpen) return;
    getFastApiCorporateDebtorsAging()
      .then(apiData => {
        if (Array.isArray(apiData) && apiData.length > 0) {
          // Merge API balances with existing structured accounts
          setCorporates(prev => prev.map(c => {
            const match = apiData.find(a => (a.company_name || '').toLowerCase().includes(c.name.toLowerCase()));
            if (match) {
              return {
                ...c,
                currentBalance: Number(match.total_outstanding) || c.currentBalance,
                aging: {
                  days0_30: Number(match.days_0_30) || c.aging.days0_30,
                  days31_60: Number(match.days_31_60) || c.aging.days31_60,
                  days61_90: Number(match.days_61_90) || c.aging.days61_90,
                  days90_plus: Number(match.days_90_plus) || c.aging.days90_plus
                }
              };
            }
            return c;
          }));
        }
      })
      .catch(err => console.warn('[FastAPI] Debtor aging fetch error:', err));
  }, [isOpen]);

  const currentCorp = useMemo(() => {
    return corporates.find(c => c.code === selectedCorpCode) || corporates[0];
  }, [corporates, selectedCorpCode]);

  // Total Portfolio Summaries
  const portfolioSummary = useMemo(() => {
    let totalOutstanding = 0;
    let days0_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let days90_plus = 0;

    corporates.forEach(c => {
      totalOutstanding += c.currentBalance;
      days0_30 += c.aging.days0_30;
      days31_60 += c.aging.days31_60;
      days61_90 += c.aging.days61_90;
      days90_plus += c.aging.days90_plus;
    });

    return { totalOutstanding, days0_30, days31_60, days61_90, days90_plus };
  }, [corporates]);

  // Filtered Invoices for selected company
  const filteredInvoices = useMemo(() => {
    if (!currentCorp) return [];
    return currentCorp.invoices.filter(inv => {
      const matchBracket = selectedBracketFilter === 'ALL' || inv.bracket === selectedBracketFilter;
      const matchSearch = !searchQuery.trim() || 
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.roomNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBracket && matchSearch;
    });
  }, [currentCorp, selectedBracketFilter, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (!isOpen) return null;

  // Handle Payment Settlement
  const handleRecordPayment = () => {
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment settlement amount!');
      return;
    }
    if (amt > currentCorp.currentBalance) {
      alert(`Settlement amount (₹${amt}) cannot exceed current outstanding balance (₹${currentCorp.currentBalance})!`);
      return;
    }

    const updated = corporates.map(c => {
      if (c.code === selectedCorpCode) {
        const newBal = c.currentBalance - amt;
        // Distribute payment to reduce aging from oldest to newest
        let remainingToDeduct = amt;
        let new90 = c.aging.days90_plus;
        let new61 = c.aging.days61_90;
        let new31 = c.aging.days31_60;
        let new0 = c.aging.days0_30;

        if (remainingToDeduct > 0 && new90 > 0) {
          const deduct = Math.min(remainingToDeduct, new90);
          new90 -= deduct;
          remainingToDeduct -= deduct;
        }
        if (remainingToDeduct > 0 && new61 > 0) {
          const deduct = Math.min(remainingToDeduct, new61);
          new61 -= deduct;
          remainingToDeduct -= deduct;
        }
        if (remainingToDeduct > 0 && new31 > 0) {
          const deduct = Math.min(remainingToDeduct, new31);
          new31 -= deduct;
          remainingToDeduct -= deduct;
        }
        if (remainingToDeduct > 0 && new0 > 0) {
          const deduct = Math.min(remainingToDeduct, new0);
          new0 -= deduct;
          remainingToDeduct -= deduct;
        }

        return {
          ...c,
          currentBalance: newBal,
          aging: { days0_30: new0, days31_60: new31, days61_90: new61, days90_plus: new90 }
        };
      }
      return c;
    });

    setCorporates(updated);
    setSettleAmount('');
    setSettleRef('');
    setSettleNotes('');
    setActiveTab('aging');

    try {
      playSuccessChime();
    } catch (e) {}

    showToast(`✓ Payment of ₹${amt.toLocaleString('en-IN')} successfully credited to ${currentCorp.name} via ${settleMode}!`);

    // Asynchronously dispatch payment settlement to Railway PostgreSQL
    settleFastApiCorporateInvoice({
      company_name: currentCorp.name,
      amount: amt,
      settlement_mode: settleMode,
      ref_no: settleRef || `REF-${Date.now()}`,
      bank_name: settleBank,
      notes: settleNotes
    }).catch(err => console.warn('[FastAPI] Corporate settlement error:', err));
  };

  // WhatsApp Debtor Statement Dispatch
  const handleSendWhatsAppStatement = () => {
    try {
      const summaryText = `*HOTEL ELITE INN — CORPORATE DEBTOR STATEMENT*
🏢 Client: ${currentCorp.name} (${currentCorp.unit})
📋 GSTIN: ${currentCorp.gstin}
💰 Total Outstanding: ₹${currentCorp.currentBalance.toLocaleString('en-IN')}
⏳ 0-30 Days: ₹${currentCorp.aging.days0_30.toLocaleString('en-IN')}
⏳ 31-60 Days: ₹${currentCorp.aging.days31_60.toLocaleString('en-IN')}
⚠️ 61-90 Days: ₹${currentCorp.aging.days61_90.toLocaleString('en-IN')}
🚨 90+ Days Overdue: ₹${currentCorp.aging.days90_plus.toLocaleString('en-IN')}
Credit Limit: ₹${currentCorp.creditLimit.toLocaleString('en-IN')}
Please arrange NEFT clearance to:
Bank: State Bank of India (SBI), Rayagada Branch
A/C: 3891002100049281 | IFSC: SBIN0000172`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(summaryText);
      }
      const cleanPhone = currentCorp.phone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(summaryText);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
      showToast(`Statement copied & opening WhatsApp for ${currentCorp.contactPerson}!`);
    } catch (e) {
      alert('Error opening WhatsApp dispatch.');
    }
  };

  // Print Crystal Report Aging Sheet
  const handlePrintAgingSheet = () => {
    const win = window.open('', '_blank', 'width=800,height=750');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Elite Inn - Corporate BTC Aging Analysis Statement</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; font-size: 11px; color: #000; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
            .hotel-name { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
            .sub { font-size: 10px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #777; padding: 5px 8px; }
            th { background: #EEE; font-weight: bold; }
            .right { text-align: right; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .summary-box { display: flex; justify-content: space-between; border: 1px solid #000; padding: 8px; margin-top: 14px; background: #FAFAFA; }
            .sign { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hotel-name">HOTEL ELITE INN</div>
            <div class="sub">Near Railway Station, Muniguda, Rayagada, Odisha • GSTIN: ${HOTEL_CONFIG.gstin}</div>
            <div style="font-weight: bold; font-size: 12px; margin-top: 4px;">CORPORATE BILL TO COMPANY (BTC) AGING ANALYSIS &amp; DEBTOR SUMMARY</div>
            <div class="sub">As on PMS Accounting Date: ${accountingDate} • Prepared by: ${currentUser}</div>
          </div>

          <div style="margin-bottom: 10px;">
            <strong>Corporate Client:</strong> ${currentCorp.name} (${currentCorp.unit})<br/>
            <strong>GSTIN:</strong> ${currentCorp.gstin} | <strong>Credit Limit:</strong> ₹${currentCorp.creditLimit.toLocaleString('en-IN')} | <strong>Terms:</strong> Net ${currentCorp.creditDays} Days
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Invoice Date</th>
                <th>Guest Name &amp; Stay</th>
                <th>Room</th>
                <th>Age (Days)</th>
                <th>Bracket</th>
                <th class="right">Invoice Total</th>
                <th class="right">Pending Balance</th>
              </tr>
            </thead>
            <tbody>
              ${currentCorp.invoices.map(inv => `
                <tr>
                  <td class="bold">${inv.invoiceNo}</td>
                  <td>${inv.date}</td>
                  <td>${inv.guestName} (${inv.stay})</td>
                  <td class="center">${inv.roomNo}</td>
                  <td class="center">${inv.ageDays}</td>
                  <td class="center">${inv.bracket} Days</td>
                  <td class="right">₹${inv.amount.toLocaleString('en-IN')}</td>
                  <td class="right bold">₹${inv.pending.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr style="background: #EEE; font-weight: bold;">
                <td colspan="7">TOTAL OUTSTANDING BALANCE</td>
                <td class="right bold">₹${currentCorp.currentBalance.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-box">
            <div>Current (0-30d): <strong>₹${currentCorp.aging.days0_30.toLocaleString('en-IN')}</strong></div>
            <div>31-60 Days: <strong>₹${currentCorp.aging.days31_60.toLocaleString('en-IN')}</strong></div>
            <div>61-90 Days: <strong>₹${currentCorp.aging.days61_90.toLocaleString('en-IN')}</strong></div>
            <div style="color: #A00;">90+ Overdue: <strong>₹${currentCorp.aging.days90_plus.toLocaleString('en-IN')}</strong></div>
          </div>

          <div class="sign">
            <div>___________________<br/>Prepared by (Front Desk)</div>
            <div>___________________<br/>Verified by (Accounts Officer)</div>
            <div>___________________<br/>General Manager Sign</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1420 }}>
      <div 
        className={`ids-modal-container ${isMaximized ? 'maximized' : ''}`}
        style={{
          width: isMaximized ? '880px' : '780px',
          maxWidth: isMaximized ? '880px' : '96vw',
          height: isMaximized ? '520px' : 'auto',
          maxHeight: isMaximized ? '520px' : '94vh',
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
            <span>🏢 Corporate BTC Accounts & Outstanding Aging V6.5.004.1</span>
            <span style={{ fontSize: '9.5px', opacity: 0.9, fontWeight: 400 }}>
              (Cashiering - Bill to Company (BTC) Ledger & Aging Analysis)
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className="ids-win-btn" title="Minimize to Normal Window" onClick={() => setIsMaximized(false)} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize (Compact Window)"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
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

        {/* Top KPI Strip: Portfolio Outstanding */}
        <div style={{ background: '#D4D0C8', padding: '8px 10px', borderBottom: '1px solid #999', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#666', display: 'block' }}>TOTAL PORTFOLIO BTC</span>
            <strong style={{ fontSize: '13px', color: '#0A246A' }}>₹{portfolioSummary.totalOutstanding.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#2E7D32', display: 'block' }}>0-30 DAYS (CURRENT)</span>
            <strong style={{ fontSize: '12px', color: '#2E7D32' }}>₹{portfolioSummary.days0_30.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#E65100', display: 'block' }}>31-60 DAYS</span>
            <strong style={{ fontSize: '12px', color: '#E65100' }}>₹{portfolioSummary.days31_60.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#C62828', display: 'block' }}>61-90 DAYS</span>
            <strong style={{ fontSize: '12px', color: '#C62828' }}>₹{portfolioSummary.days61_90.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#880E4F', display: 'block' }}>90+ DAYS OVERDUE</span>
            <strong style={{ fontSize: '12px', color: '#880E4F' }}>₹{portfolioSummary.days90_plus.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Corporate Client Selector Strip */}
        <div style={{ background: '#ECE9D8', padding: '6px 10px', borderBottom: '1px solid #999', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {corporates.map(c => {
            const isSelected = selectedCorpCode === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCorpCode(c.code)}
                className="ids-btn"
                style={{
                  padding: '3px 8px',
                  fontSize: '10.5px',
                  fontWeight: isSelected ? 800 : 500,
                  background: isSelected ? '#0A246A' : '#FFF',
                  color: isSelected ? '#FFF' : '#000',
                  borderColor: isSelected ? '#000' : '#808080'
                }}
              >
                {c.name.split(' ')[0]} (₹{(c.currentBalance / 1000).toFixed(1)}k)
              </button>
            );
          })}
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: '2px', padding: '6px 10px 0 10px', background: '#ECE9D8', borderBottom: '1px solid #999' }}>
          <button
            onClick={() => setActiveTab('aging')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'aging' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'aging' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'aging' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            📊 Corporate Aging Breakdown
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'invoices' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'invoices' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'invoices' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            📋 Invoices & Folios Ledger ({currentCorp.invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            style={{
              padding: '4px 12px',
              border: '1px solid #999',
              borderBottom: activeTab === 'settlement' ? '1px solid #ECE9D8' : '1px solid #999',
              background: activeTab === 'settlement' ? '#ECE9D8' : '#D4D0C8',
              fontWeight: activeTab === 'settlement' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            💳 Record Payment Settlement
          </button>
        </div>

        {/* Tab 1: Aging Breakdown & Summary Card */}
        {activeTab === 'aging' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Corporate Master Card */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0A246A' }}>
                  {currentCorp.name}
                </span>
                <span style={{ fontSize: '11px', color: '#555', marginLeft: '6px' }}>({currentCorp.unit})</span>
                <div style={{ fontSize: '10.5px', color: '#333', marginTop: '4px' }}>
                  <strong>GSTIN:</strong> <code>{currentCorp.gstin}</code> • <strong>PAN:</strong> {currentCorp.pan}
                </div>
                <div style={{ fontSize: '10.5px', color: '#555', marginTop: '2px' }}>
                  <strong>Coordinator:</strong> {currentCorp.contactPerson} • {currentCorp.phone}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#666' }}>OUTSTANDING BALANCE:</span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#C62828' }}>
                  ₹{currentCorp.currentBalance.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                  Credit Limit: ₹{currentCorp.creditLimit.toLocaleString('en-IN')} | Credit Terms: {currentCorp.creditDays} Days
                </div>
              </div>
            </div>

            {/* Credit Limit Usage Progress Bar */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Credit Limit Utilization:</span>
                <span>
                  <strong>{Math.round((currentCorp.currentBalance / currentCorp.creditLimit) * 100)}%</strong> of ₹{currentCorp.creditLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, Math.round((currentCorp.currentBalance / currentCorp.creditLimit) * 100))}%`, 
                    height: '100%', 
                    background: (currentCorp.currentBalance / currentCorp.creditLimit) > 0.8 ? '#D32F2F' : '#2E7D32' 
                  }} 
                />
              </div>
            </div>

            {/* Aging Matrix for Current Company */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', display: 'block', marginBottom: '8px' }}>
                Aging Period Distribution (Days from Invoice Date):
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div style={{ background: '#F1F8E9', border: '1px solid #C5E1A5', padding: '8px', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#2E7D32' }}>0-30 DAYS (CURRENT)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
                    ₹{currentCorp.aging.days0_30.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#666', marginTop: '2px' }}>Within normal credit cycle</div>
                </div>

                <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', padding: '8px', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#F57F17' }}>31-60 DAYS</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#F57F17', marginTop: '4px' }}>
                    ₹{currentCorp.aging.days31_60.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#666', marginTop: '2px' }}>1st statement dispatched</div>
                </div>

                <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', padding: '8px', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#C62828' }}>61-90 DAYS</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
                    ₹{currentCorp.aging.days61_90.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#666', marginTop: '2px' }}>Urgent payment follow-up</div>
                </div>

                <div style={{ background: '#FCE4EC', border: '1px solid #F8BBD0', padding: '8px', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#880E4F' }}>90+ DAYS OVERDUE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#880E4F', marginTop: '4px' }}>
                    ₹{currentCorp.aging.days90_plus.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#666', marginTop: '2px' }}>Critical / Stop credit hold</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab('invoices')}
                className="ids-btn"
                style={{ fontSize: '10.5px' }}
              >
                View Detailed Invoices ({currentCorp.invoices.length}) →
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={handleSendWhatsAppStatement}
                  className="ids-btn"
                  style={{ minWidth: '120px', fontWeight: 700, background: '#E8F5E9', borderColor: '#2E7D32', color: '#2E7D32' }}
                >
                  📱 WhatsApp Statement
                </button>
                <button 
                  onClick={handlePrintAgingSheet}
                  className="ids-btn"
                  style={{ minWidth: '90px', fontWeight: 700 }}
                >
                  🖨️ Print Statement
                </button>
                <button 
                  onClick={() => setActiveTab('settlement')}
                  className="ids-btn"
                  style={{ minWidth: '110px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}
                >
                  💳 Settle Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Detailed Invoices Table */}
        {activeTab === 'invoices' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', '0-30', '31-60', '61-90', '90+'].map(bracket => (
                  <button
                    key={bracket}
                    onClick={() => setSelectedBracketFilter(bracket)}
                    className="ids-btn"
                    style={{
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: selectedBracketFilter === bracket ? 700 : 400,
                      background: selectedBracketFilter === bracket ? '#0A246A' : '#FFF',
                      color: selectedBracketFilter === bracket ? '#FFF' : '#000'
                    }}
                  >
                    {bracket === 'ALL' ? 'All Invoices' : `${bracket} Days`}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Search invoice or guest..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '160px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
            </div>

            {/* Sunken Grid */}
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999' }}>
                  <tr>
                    <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Invoice No</th>
                    <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Date</th>
                    <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Guest & Stay</th>
                    <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Room</th>
                    <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Age</th>
                    <th style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #CCC' }}>Bracket</th>
                    <th style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #CCC' }}>Total</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{inv.invoiceNo}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE' }}>{inv.date}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE' }}>{inv.guestName} <span style={{ color: '#888', fontSize: '9px' }}>({inv.stay})</span></td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{inv.roomNo}</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>{inv.ageDays}d</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #EEE' }}>
                        <span style={{
                          padding: '1px 5px',
                          borderRadius: '2px',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          background: inv.bracket === '0-30' ? '#E8F5E9' : (inv.bracket === '31-60' ? '#FFF3E0' : '#FFEBEE'),
                          color: inv.bracket === '0-30' ? '#2E7D32' : (inv.bracket === '31-60' ? '#E65100' : '#C62828')
                        }}>
                          {inv.bracket}
                        </span>
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right', borderRight: '1px solid #EEE' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 800, color: '#C62828' }}>₹{inv.pending.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '16px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        No invoices found matching current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#555' }}>
                Showing {filteredInvoices.length} invoices • Total: <strong>₹{currentCorp.currentBalance.toLocaleString('en-IN')}</strong>
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handlePrintAgingSheet} className="ids-btn" style={{ minWidth: '90px' }}>
                  🖨️ Print List
                </button>
                <button onClick={() => setActiveTab('settlement')} className="ids-btn" style={{ minWidth: '100px', fontWeight: 700, color: '#0A246A' }}>
                  💳 Settle Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Record Payment Settlement */}
        {activeTab === 'settlement' && (
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0A246A', borderBottom: '1px solid #D4D0C8', paddingBottom: '4px' }}>
                Post Corporate Ledger Settlement for {currentCorp.name}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Current Outstanding:</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#C62828' }}>₹{currentCorp.currentBalance.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>Settlement Amount:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>₹</span>
                  <input 
                    type="number" 
                    value={settleAmount}
                    onChange={e => setSettleAmount(e.target.value)}
                    placeholder="Enter received amount"
                    style={{ width: '130px', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9', fontWeight: 700 }}
                  />
                  <button 
                    onClick={() => setSettleAmount(String(currentCorp.currentBalance))}
                    className="ids-btn"
                    style={{ fontSize: '10px' }}
                  >
                    Full Balance
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Payment Mode:</span>
                <select 
                  value={settleMode} 
                  onChange={e => setSettleMode(e.target.value)}
                  style={{ width: '140px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                >
                  <option value="NEFT">NEFT / RTGS</option>
                  <option value="CHEQUE">Corporate Cheque</option>
                  <option value="UPI">Company UPI / QR</option>
                  <option value="TDS_ADJUST">TDS Adjustment Credit</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>UTR / Cheque Ref No:</span>
                <input 
                  type="text" 
                  value={settleRef}
                  onChange={e => setSettleRef(e.target.value)}
                  placeholder="e.g. UTR-AXIS-20261011004"
                  style={{ width: '200px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Deposited Bank A/C:</span>
                <input 
                  type="text" 
                  value={settleBank}
                  onChange={e => setSettleBank(e.target.value)}
                  style={{ width: '240px', padding: '2px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Remarks & Notes:</span>
                <textarea 
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  placeholder="e.g. Cleared 2 pending September invoices against PO-4402..."
                  rows={2}
                  style={{ width: '100%', padding: '3px', fontSize: '11px', border: '1px solid #7F9DB9', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button 
                onClick={() => setActiveTab('aging')}
                className="ids-btn"
                style={{ minWidth: '70px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRecordPayment}
                className="ids-btn"
                style={{ minWidth: '130px', fontWeight: 800, background: '#DFF0D8', borderColor: '#3C763D', color: '#3C763D' }}
              >
                ✓ Confirm Settlement
              </button>
            </div>
          </div>
        )}

        {/* Dialog Bottom Footer */}
        <div style={{ background: '#ECE9D8', borderTop: '1px solid #999', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: '#555' }}>
            A/C Date: <strong>{accountingDate}</strong> | User: <strong>{currentUser}</strong> | Selected: <strong>{currentCorp.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleSendWhatsAppStatement}
              className="ids-btn"
              style={{ minWidth: '100px', fontWeight: 700, color: '#2E7D32' }}
            >
              📱 WhatsApp
            </button>
            <button 
              onClick={handlePrintAgingSheet}
              className="ids-btn"
              style={{ minWidth: '80px', fontWeight: 600 }}
            >
              🖨️ Print
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
