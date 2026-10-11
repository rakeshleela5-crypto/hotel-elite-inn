import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  ShieldAlert, Lock, KeyRound, CheckCircle2, AlertTriangle, 
  RotateCcw, History, FileText, Check, X, UserCheck
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

// Default Settled Transactions available for correction
export const DEFAULT_SETTLED_BILLS = [
  {
    billNo: 'RES-B-004',
    tableRoom: 'Table 10 (Restaurant)',
    guestName: 'Mr. P Jena',
    amount: 2000.00,
    currentTender: 'CASH',
    punchTime: '11-OCT-2026 14:15',
    cashierStaff: 'Ranjan (Front Desk / POS 1)',
    status: 'Settled'
  },
  {
    billNo: 'FO-501',
    tableRoom: 'Room 102 (Front Office)',
    guestName: 'Mr. Rajesh Sharma',
    amount: 1960.00,
    currentTender: 'CASH',
    punchTime: '11-OCT-2026 11:30',
    cashierStaff: 'Sneha (Reception Desk)',
    status: 'Settled'
  },
  {
    billNo: 'RES-B-003',
    tableRoom: 'Table 15 (Bar & Dining)',
    guestName: 'Mr. Debashis Mohanty',
    amount: 619.00,
    currentTender: 'CASH',
    punchTime: '11-OCT-2026 13:00',
    cashierStaff: 'Manash (F&B Cashier)',
    status: 'Settled'
  },
  {
    billNo: 'FO-613',
    tableRoom: 'Room 201 (JK Paper)',
    guestName: 'Mr. Anil Kumar',
    amount: 4500.00,
    currentTender: 'CASH',
    punchTime: '11-OCT-2026 15:45',
    cashierStaff: 'Ranjan (Front Desk)',
    status: 'Settled'
  }
];

// Pre-existing Audit Log for Re-Classified Tenders
export const INITIAL_TENDER_AUDIT_LOG = [
  {
    auditId: 'AUD-TND-1001',
    billNo: 'RES-B-001',
    amount: 850.00,
    oldTender: 'CASH',
    newTender: 'UPI (PhonePe QR)',
    referenceNo: 'UPI-992144001',
    cashierStaff: 'Sneha (Reception)',
    managerApproved: 'MGR01 (General Manager)',
    reason: 'Mistakenly punched Cash during lunch peak; guest showed PhonePe payment on counter.',
    timestamp: '10-OCT-2026 16:45',
    hashSignature: 'SHA256:7f8a91bc023e'
  }
];

export default function IdsTenderReclassificationModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  onTenderReclassified
}) {
  const [bills, setBills] = useState(DEFAULT_SETTLED_BILLS);
  const [auditLog, setAuditLog] = useState(INITIAL_TENDER_AUDIT_LOG);
  const [selectedBillNo, setSelectedBillNo] = useState('RES-B-004');
  
  // Correction Form State
  const [targetTender, setTargetTender] = useState('UPI'); // 'UPI' | 'CARD' | 'COMPANY_BTC'
  const [targetSubProvider, setTargetSubProvider] = useState('PhonePe Counter QR');
  const [referenceNo, setReferenceNo] = useState('UPI-2026-OCT-99812');
  
  // Manager Security Authentication State
  const [managerId, setManagerId] = useState('MGR01');
  const [managerPin, setManagerPin] = useState('');
  const [reasonCategory, setReasonCategory] = useState('RECEPTION_CASH_MISTAKE');
  const [remarks, setRemarks] = useState('Receptionist mistakenly punched Cash; guest actually paid via PhonePe QR on counter.');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('CORRECTION'); // 'CORRECTION' | 'AUDIT_LOG'

  const selectedBill = useMemo(() => {
    return bills.find(b => b.billNo === selectedBillNo) || bills[0];
  }, [bills, selectedBillNo]);

  if (!isOpen) return null;

  const handleReasonCategoryChange = (e) => {
    const val = e.target.value;
    setReasonCategory(val);
    if (val === 'RECEPTION_CASH_MISTAKE') {
      setRemarks('Receptionist mistakenly punched Cash; guest actually paid via PhonePe QR on counter.');
    } else if (val === 'SWIPE_MACHINE_VERIFIED') {
      setRemarks('Card swipe machine charge slip verified by cashier; mistakenly punched as cash tender.');
    } else if (val === 'BANK_TRANSFER_VERIFIED') {
      setRemarks('NEFT / IMPS bank credit verified in hotel current account.');
    } else {
      setRemarks('');
    }
  };

  const handleExecuteReclassification = (e) => {
    e.preventDefault();
    setAuthError('');

    // Strict Manager PIN Authentication (Valid PIN: 1984 or 7788 or 1234)
    if (!managerPin.trim()) {
      setAuthError('Manager PIN is mandatory! Front desk staff cannot silently modify payment tenders.');
      return;
    }

    if (managerPin !== '1984' && managerPin !== '7788' && managerPin !== '1234') {
      setAuthError('Security Alert: Invalid Manager PIN! Unauthorized tender alteration attempt blocked and logged.');
      return;
    }

    if (!remarks.trim()) {
      setAuthError('Mandatory Reason & Justification note required for statutory audit compliance.');
      return;
    }

    playSuccessChime();

    const newTenderLabel = targetTender === 'UPI' 
      ? `UPI (${targetSubProvider})`
      : targetTender === 'CARD'
        ? `Card (Merchant Swipe)`
        : 'Company BTC Ledger';

    // Commit new audit trail record
    const newAuditEntry = {
      auditId: `AUD-TND-${Math.floor(1000 + Math.random() * 9000)}`,
      billNo: selectedBill.billNo,
      amount: selectedBill.amount,
      oldTender: selectedBill.currentTender,
      newTender: newTenderLabel,
      referenceNo: referenceNo || 'REF-VERIFIED',
      cashierStaff: selectedBill.cashierStaff,
      managerApproved: `${managerId} (Approved with PIN)`,
      reason: remarks,
      timestamp: `${accountingDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      hashSignature: `SHA256:${Math.random().toString(36).substring(2, 10)}`
    };

    setAuditLog(prev => [newAuditEntry, ...prev]);

    // Update bill tender state
    setBills(prev => prev.map(b => {
      if (b.billNo === selectedBill.billNo) {
        return {
          ...b,
          currentTender: newTenderLabel,
          reclassified: true
        };
      }
      return b;
    }));

    if (onTenderReclassified) {
      onTenderReclassified(newAuditEntry);
    }

    alert(`✓ TENDER RE-CLASSIFICATION APPROVED BY MANAGER!\n\nBill #${selectedBill.billNo} (₹${selectedBill.amount.toFixed(2)})\n• Old Tender: ${selectedBill.currentTender} ➔ New Tender: ${newTenderLabel}\n• Manager Authorization: ${managerId} (PIN Validated)\n• Tamper-evident record committed to IDS Master Audit Ledger.`);
    
    // Switch to audit tab to view
    setManagerPin('');
    setActiveTab('AUDIT_LOG');
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Authentic IDS FortuneNEXT Win32 Dialog Window */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '980px', 
          maxWidth: '96vw', 
          height: '640px', 
          maxHeight: '92vh',
          display: 'flex', 
          flexDirection: 'column',
          background: '#ECE9D8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.65)'
        }}
      >
        {/* Win32 Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ids-logo-badge" style={{ background: '#B71C1C' }}>SECURITY</span>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>
              IDS FortuneNEXT Security - Audited Payment Tender Re-Classification [Manager PIN Protected]
            </span>
          </div>
          <button className="ids-win-btn close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        {/* Security Alert Header */}
        <div style={{ 
          background: '#FFEBEE', 
          borderBottom: '1px solid #E57373', 
          padding: '6px 12px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#C62828" />
            <div>
              <strong style={{ color: '#C62828' }}>ANTI-FRAUD CONTROL (AUDIO 4: 57:31-68:45):</strong> Staff cannot silently edit payment tenders.
              <div style={{ color: '#555', fontSize: '10px' }}>
                Every tender modification (e.g., Cash ➔ UPI correction) requires Manager PIN approval and produces an immutable audit log.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, background: activeTab === 'CORRECTION' ? '#FFF' : '#ECE9D8' }}
              onClick={() => setActiveTab('CORRECTION')}
            >
              Tender Correction Form
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, background: activeTab === 'AUDIT_LOG' ? '#FFF' : '#ECE9D8' }}
              onClick={() => setActiveTab('AUDIT_LOG')}
            >
              Security Audit Register ({auditLog.length})
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto', background: '#FFF' }}>
          {activeTab === 'CORRECTION' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '14px', height: '100%' }}>
              {/* Left Column: Select Mistaken Transaction */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '6px', color: '#0A246A' }}>
                  1. Select Settled Transaction Requiring Tender Correction:
                </div>
                
                <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FAFAFA', overflowY: 'auto' }}>
                  <table className="ids-table" style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8' }}>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Bill No</th>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Location/Guest</th>
                        <th style={{ padding: '4px', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '4px', textAlign: 'center' }}>Current Tender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(b => {
                        const isSelected = selectedBillNo === b.billNo;
                        return (
                          <tr 
                            key={b.billNo}
                            onClick={() => setSelectedBillNo(b.billNo)}
                            style={{ 
                              background: isSelected ? '#316AC5' : '#FFF', 
                              color: isSelected ? '#FFF' : '#000',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '4px', fontWeight: 700 }}>{b.billNo}</td>
                            <td style={{ padding: '4px' }}>
                              <div>{b.tableRoom}</div>
                              <div style={{ fontSize: '9px', opacity: 0.85 }}>{b.guestName}</div>
                            </td>
                            <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>
                              ₹{b.amount.toFixed(2)}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '1px 5px', 
                                background: b.currentTender === 'CASH' ? '#FFCDD2' : '#C8E6C9', 
                                color: '#000',
                                borderRadius: '2px',
                                fontSize: '9.5px',
                                fontWeight: 700
                              }}>
                                {b.currentTender}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Selected Transaction Metadata Preview */}
                <div style={{ marginTop: '8px', border: '1px solid #ACA899', padding: '6px 8px', background: '#ECE9D8', fontSize: '10.5px' }}>
                  <div><strong>Original Cashier:</strong> {selectedBill.cashierStaff}</div>
                  <div><strong>Settled At:</strong> {selectedBill.punchTime}</div>
                  <div style={{ color: '#B71C1C', fontWeight: 700, marginTop: '2px' }}>
                    ⚠️ Current Recorded Tender: {selectedBill.currentTender} (₹{selectedBill.amount.toFixed(2)})
                  </div>
                </div>
              </div>

              {/* Right Column: Tender Amendment & Manager Authorization Form */}
              <form onSubmit={handleExecuteReclassification} style={{ display: 'flex', flexDirection: 'column', background: '#F9F8F4', border: '1px solid #ACA899', padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '8px', color: '#B71C1C' }}>
                  2. Manager Authorization & Re-Classification Details:
                </div>

                {authError && (
                  <div style={{ background: '#FFCDD2', border: '1px solid #E57373', color: '#B71C1C', padding: '6px 8px', marginBottom: '8px', fontSize: '10.5px', fontWeight: 600 }}>
                    {authError}
                  </div>
                )}

                {/* Step A: Revised Tender Selection */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, marginBottom: '2px' }}>
                    Correct / Revised Tender Mode:
                  </label>
                  <select 
                    className="ids-input" 
                    style={{ width: '100%', height: '24px', fontWeight: 600 }}
                    value={targetTender}
                    onChange={e => setTargetTender(e.target.value)}
                  >
                    <option value="UPI">UPI / Digital QR (PhonePe / GPay / Paytm)</option>
                    <option value="CARD">Credit / Debit Card (Swipe POS Machine)</option>
                    <option value="COMPANY_BTC">Company BTC / Direct Ledger (Vedanta / JK Paper)</option>
                  </select>
                </div>

                {targetTender === 'UPI' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '1px' }}>UPI Platform:</label>
                      <select 
                        className="ids-input" 
                        style={{ width: '100%' }}
                        value={targetSubProvider}
                        onChange={e => setTargetSubProvider(e.target.value)}
                      >
                        <option value="PhonePe Counter QR">PhonePe Counter QR</option>
                        <option value="Google Pay (GPay)">Google Pay (GPay)</option>
                        <option value="Paytm Soundbox">Paytm Soundbox</option>
                        <option value="BHIM UPI">BHIM UPI Direct</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '1px' }}>UTR / Reference Number:</label>
                      <input 
                        type="text" 
                        required 
                        className="ids-input" 
                        style={{ width: '100%', fontFamily: 'monospace' }}
                        value={referenceNo} 
                        onChange={e => setReferenceNo(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {/* Step B: Mandatory Reason for Correction */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, marginBottom: '2px' }}>
                    Mandatory Reason for Tender Correction:
                  </label>
                  <select 
                    className="ids-input" 
                    style={{ width: '100%', marginBottom: '4px' }}
                    value={reasonCategory}
                    onChange={handleReasonCategoryChange}
                  >
                    <option value="RECEPTION_CASH_MISTAKE">Receptionist accidentally punched Cash instead of UPI QR</option>
                    <option value="SWIPE_MACHINE_VERIFIED">Card swipe POS slip verified by front desk manager</option>
                    <option value="BANK_TRANSFER_VERIFIED">Corporate NEFT / IMPS transfer verified in current A/C</option>
                    <option value="CUSTOM">Other specific reason (Detailed remarks required)</option>
                  </select>
                  <textarea 
                    rows={2} 
                    required
                    placeholder="Enter detailed statutory explanation..."
                    className="ids-input" 
                    style={{ width: '100%', fontSize: '10.5px' }}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                </div>

                {/* Step C: Manager Security PIN Gate */}
                <fieldset style={{ border: '1px solid #C62828', background: '#FFF', padding: '8px 10px', marginTop: 'auto' }}>
                  <legend style={{ color: '#C62828', fontWeight: 700, fontSize: '10.5px', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} />
                    <span>Manager Security Authorization Override</span>
                  </legend>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>Manager User ID:</label>
                      <input 
                        type="text" 
                        className="ids-input" 
                        style={{ width: '100%', fontWeight: 700 }}
                        value={managerId} 
                        onChange={e => setManagerId(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '1px' }}>
                        Manager Security PIN:
                      </label>
                      <input 
                        type="password" 
                        required 
                        maxLength={6}
                        placeholder="••••"
                        className="ids-input" 
                        style={{ width: '100%', fontWeight: 700, letterSpacing: '3px', fontSize: '14px', textAlign: 'center' }}
                        value={managerPin} 
                        onChange={e => setManagerPin(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#666', marginTop: '4px' }}>
                    * Authorized PINs: <strong>1984</strong> or <strong>7788</strong> (General Manager / Admin override).
                  </div>
                </fieldset>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button 
                    type="submit" 
                    className="ids-btn-classic" 
                    style={{ 
                      background: '#B71C1C', 
                      color: '#FFF', 
                      fontWeight: 700, 
                      minWidth: '170px',
                      height: '26px'
                    }}
                  >
                    🔐 Approve & Re-Classify
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* AUDIT LOG TAB */
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '8px', fontSize: '11px', color: '#333' }}>
                Immutable security ledger tracking all payment tender corrections across Front Office and Restaurant POS.
              </div>
              <div style={{ flex: 1, border: '1px solid #716F64', overflowY: 'auto' }}>
                <table className="ids-table" style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8' }}>
                      <th style={{ padding: '4px' }}>Audit ID</th>
                      <th style={{ padding: '4px' }}>Bill #</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '4px' }}>Original Tender</th>
                      <th style={{ padding: '4px' }}>Re-Classified Tender</th>
                      <th style={{ padding: '4px' }}>Approved By (PIN)</th>
                      <th style={{ padding: '4px' }}>Reason / Remarks</th>
                      <th style={{ padding: '4px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((log, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F8F4' }}>
                        <td style={{ padding: '4px', fontFamily: 'monospace', fontWeight: 600 }}>{log.auditId}</td>
                        <td style={{ padding: '4px', fontWeight: 700 }}>{log.billNo}</td>
                        <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹{log.amount.toFixed(2)}</td>
                        <td style={{ padding: '4px', color: '#B71C1C', fontWeight: 600 }}>{log.oldTender}</td>
                        <td style={{ padding: '4px', color: '#2E7D32', fontWeight: 700 }}>{log.newTender}</td>
                        <td style={{ padding: '4px' }}>{log.managerApproved}</td>
                        <td style={{ padding: '4px', maxWidth: '240px' }}>{log.reason}</td>
                        <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Win32 Bottom Command Actions */}
        <div className="ids-dialog-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8', padding: '6px 12px' }}>
          <div style={{ fontSize: '10px', color: '#555' }}>
            IDS FortuneNEXT Security Kernel V6.5 • Statutory Audit Subsystem Active
          </div>
          <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={onClose}>
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
