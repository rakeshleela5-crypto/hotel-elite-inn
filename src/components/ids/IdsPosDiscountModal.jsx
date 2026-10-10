import React, { useState } from 'react';

/**
 * IdsPosDiscountModal - Win32 Dialog: Bill Discount & Allowance V6.5.002.1
 * Replicating statutory Manager Discretion & Corporate Discount routines in IDS Fortune NEXT POS
 */
export default function IdsPosDiscountModal({
  isOpen,
  onClose,
  billNo = 'RES-B-00101',
  tableNo = '10',
  grossTotal = 1100.00,
  taxRate = 5.0, // 5% GST (2.5% CGST + 2.5% SGST)
  currentUser = 'MANAGER',
  onApplyDiscount
}) {
  const [discountMode, setDiscountMode] = useState('PERCENT'); // 'PERCENT' | 'FLAT'
  const [discountPercent, setDiscountPercent] = useState(10);
  const [discountFlat, setDiscountFlat] = useState(110.00);
  const [presetScheme, setPresetScheme] = useState('MGR-10');
  const [reasonCode, setReasonCode] = useState('Manager Discretion');
  const [remarks, setRemarks] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePresetChange = (scheme) => {
    setPresetScheme(scheme);
    if (scheme === 'MGR-10') {
      setDiscountMode('PERCENT');
      setDiscountPercent(10);
      setReasonCode('Manager Discretion');
    } else if (scheme === 'CORP-15') {
      setDiscountMode('PERCENT');
      setDiscountPercent(15);
      setReasonCode('Corporate Contract Discount');
    } else if (scheme === 'VIP-20') {
      setDiscountMode('PERCENT');
      setDiscountPercent(20);
      setReasonCode('Club VIP Member Privilege');
    } else if (scheme === 'STAY-15') {
      setDiscountMode('PERCENT');
      setDiscountPercent(15);
      setReasonCode('In-House Long Stay Guest');
    } else if (scheme === 'STAFF-50') {
      setDiscountMode('PERCENT');
      setDiscountPercent(50);
      setReasonCode('Staff Welfare Concession');
    } else if (scheme === 'COMP-100') {
      setDiscountMode('PERCENT');
      setDiscountPercent(100);
      setReasonCode('Food Quality Compensation');
    } else {
      setPresetScheme('CUSTOM');
    }
  };

  // Calculations
  const calcDiscountAmt = discountMode === 'PERCENT'
    ? (grossTotal * (Number(discountPercent) || 0)) / 100
    : (Number(discountFlat) || 0);

  const clampedDiscountAmt = Math.min(grossTotal, Math.max(0, calcDiscountAmt));
  const revisedTaxable = Math.max(0, grossTotal - clampedDiscountAmt);
  const revisedCgst = (revisedTaxable * 0.025);
  const revisedSgst = (revisedTaxable * 0.025);
  const rawRevisedTotal = revisedTaxable + revisedCgst + revisedSgst;
  const revisedRoundOff = Math.round(rawRevisedTotal) - rawRevisedTotal;
  const revisedGrandTotal = Math.round(rawRevisedTotal);

  const handleApply = () => {
    setErrorMsg('');
    if (!reasonCode) {
      setErrorMsg('Mandatory Reason Code must be selected.');
      return;
    }
    // Validate manager PIN (default 1234 or non-empty)
    if (clampedDiscountAmt > 0 && !authPin) {
      setErrorMsg('Supervisor / Manager Authorization PIN is required.');
      return;
    }
    if (authPin && authPin !== '1234' && authPin !== '9999') {
      setErrorMsg('Invalid Supervisor PIN. Enter 1234 for approval.');
      return;
    }

    if (onApplyDiscount) {
      onApplyDiscount({
        discountAmount: clampedDiscountAmt,
        discountPercent: discountMode === 'PERCENT' ? Number(discountPercent) : (clampedDiscountAmt / grossTotal) * 100,
        reason: reasonCode,
        remarks: remarks || reasonCode,
        revisedTaxable,
        revisedCgst,
        revisedSgst,
        revisedRoundOff,
        revisedGrandTotal,
        authBy: currentUser
      });
    }
    onClose();
  };

  return (
    <div
      className="ids-modal-overlay"
      style={{
        zIndex: 1550,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}
    >
      <div
        className="ids-dialog-window"
        style={{
          width: '540px',
          maxWidth: '96vw',
          background: '#ECE9D8',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column'
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
            <span style={{ fontSize: '12px' }}>🏷️</span>
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.4px' }}>
              Bill Discount & Allowance V6.5.002.1 — Table {tableNo} ({billNo})
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#D4D0C8',
              border: '1px solid #FFF',
              borderRightColor: '#404040',
              borderBottomColor: '#404040',
              width: '18px',
              height: '18px',
              lineHeight: '14px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '12px 14px', fontSize: '11px' }}>
          {/* Header Summary */}
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div>Table No: <b>{tableNo}</b> | Bill Ref: <b>{billNo}</b></div>
              <div style={{ color: '#555', marginTop: '2px' }}>GST SAC: <b>996331 (Restaurant Service)</b></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#888' }}>Current Gross Total:</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A246A' }}>₹{grossTotal.toFixed(2)}</div>
            </div>
          </div>

          {/* Preset Schemes Selector */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Standard Discount Schemes:</label>
            <select
              value={presetScheme}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            >
              <option value="MGR-10">Manager Discretion — 10%</option>
              <option value="CORP-15">Corporate Tie-up Contract — 15%</option>
              <option value="VIP-20">Elite Club VIP Member Privilege — 20%</option>
              <option value="STAY-15">In-House Long Stay Guest Courtesy — 15%</option>
              <option value="STAFF-50">Staff Welfare Concession — 50%</option>
              <option value="COMP-100">Food Quality / Service Apology — 100% (Full Waiver)</option>
              <option value="CUSTOM">Custom Percentage or Flat Value</option>
            </select>
          </div>

          {/* Mode & Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#F8F8F8', border: '1px solid #D4D0C8', padding: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="discMode"
                  checked={discountMode === 'PERCENT'}
                  onChange={() => { setDiscountMode('PERCENT'); setPresetScheme('CUSTOM'); }}
                />
                Percentage Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                disabled={discountMode !== 'PERCENT'}
                value={discountPercent}
                onChange={(e) => { setDiscountPercent(e.target.value); setPresetScheme('CUSTOM'); }}
                style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
            </div>

            <div style={{ background: '#F8F8F8', border: '1px solid #D4D0C8', padding: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '6px' }}>
                <input
                  type="radio"
                  name="discMode"
                  checked={discountMode === 'FLAT'}
                  onChange={() => { setDiscountMode('FLAT'); setPresetScheme('CUSTOM'); }}
                />
                Flat Deduction Amount (INR)
              </label>
              <input
                type="number"
                min="0"
                max={grossTotal}
                step="1"
                disabled={discountMode !== 'FLAT'}
                value={discountFlat}
                onChange={(e) => { setDiscountFlat(e.target.value); setPresetScheme('CUSTOM'); }}
                style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
            </div>
          </div>

          {/* Reason Code (Mandatory) */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Statutory Reason for Allowance: <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            >
              <option value="Manager Discretion">Manager Discretion</option>
              <option value="Corporate Contract Discount">Corporate Contract Discount</option>
              <option value="Club VIP Member Privilege">Club VIP Member Privilege</option>
              <option value="In-House Long Stay Guest">In-House Long Stay Guest</option>
              <option value="Food Quality Compensation">Food Quality Compensation</option>
              <option value="Staff Welfare Concession">Staff Welfare Concession</option>
              <option value="Promotional Voucher Campaign">Promotional Voucher Campaign</option>
              <option value="Other / Management Approval">Other / Management Approval</option>
            </select>
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Remarks & Authorization Reference:</label>
            <input
              type="text"
              placeholder="e.g. Approved by GM Mr. Rao on oral directive"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9' }}
            />
          </div>

          {/* Supervisor Auth PIN */}
          <div style={{ marginBottom: '10px', background: '#FFF8E7', border: '1px solid #FFE082', padding: '6px 10px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Supervisor Authorization PIN (Default: <code>1234</code>): <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="password"
              placeholder="Enter PIN"
              value={authPin}
              onChange={(e) => setAuthPin(e.target.value)}
              style={{ width: '120px', padding: '3px 6px', fontSize: '11px', border: '1px solid #7F9DB9' }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: '#B00', fontWeight: 600, marginBottom: '8px', fontSize: '11px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Recalculated Summary Table */}
          <div style={{ background: '#ECE9D8', border: '1px solid #716F64', padding: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Original Gross:</span>
              <span>₹{grossTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#B00' }}>
              <span>Discount Allowed:</span>
              <span>- ₹{clampedDiscountAmt.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 600 }}>
              <span>Revised Taxable Value:</span>
              <span>₹{revisedTaxable.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
              <span>CGST (2.5%) + SGST (2.5%):</span>
              <span>₹{(revisedCgst + revisedSgst).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#777' }}>
              <span>Round Off:</span>
              <span>{revisedRoundOff >= 0 ? `+₹${revisedRoundOff.toFixed(2)}` : `-₹${Math.abs(revisedRoundOff).toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #716F64', paddingTop: '4px', fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>
              <span>Revised Net Payable:</span>
              <span>₹{revisedGrandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            background: '#ECE9D8',
            borderTop: '2px solid #FFF',
            padding: '8px 14px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <button
            onClick={handleApply}
            style={{
              background: '#0A246A',
              color: '#FFF',
              border: '2px solid #FFF',
              borderRightColor: '#001040',
              borderBottomColor: '#001040',
              padding: '4px 16px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Apply Discount
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#ECE9D8',
              border: '2px solid #FFF',
              borderRightColor: '#716F64',
              borderBottomColor: '#716F64',
              padding: '4px 14px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
