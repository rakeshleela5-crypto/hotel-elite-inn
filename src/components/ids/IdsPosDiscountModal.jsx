import React, { useState, useEffect } from 'react';

/**
 * IdsPosDiscountModal - Win32 Dialog: Bill Discount & Allowance V6.5.002.1
 * Statutory Manager Discretion & Anti-Theft Discount Routine
 * Rule: Cashier can grant up to 5% courtesy discount.
 * Any discount > 5% (6% - 15%+) strictly mandates Supervisor / Manager PIN (1234).
 */
export default function IdsPosDiscountModal({
  isOpen,
  onClose,
  billNo = 'RES-B-00101',
  tableNo = '10',
  grossTotal = 1100.00,
  taxRate = 5.0, // 5% GST (2.5% CGST + 2.5% SGST)
  currentUser = 'CASHIER',
  currentDiscount = null,
  onApplyDiscount,
  onRemoveDiscount
}) {
  const [discountMode, setDiscountMode] = useState('PERCENT'); // 'PERCENT' | 'FLAT'
  const [discountPercent, setDiscountPercent] = useState(5);
  const [discountFlat, setDiscountFlat] = useState(55.00);
  const [presetScheme, setPresetScheme] = useState('COURTESY-5');
  const [reasonCode, setReasonCode] = useState('Customer Goodwill / Delay in Service');
  const [remarks, setRemarks] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [showPinMask, setShowPinMask] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Prepopulate if an existing discount is being modified
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setAuthPin('');
      if (currentDiscount && currentDiscount.discountAmount > 0) {
        if (currentDiscount.discountPercent) {
          setDiscountMode('PERCENT');
          setDiscountPercent(currentDiscount.discountPercent);
          setPresetScheme('CUSTOM');
        } else {
          setDiscountMode('FLAT');
          setDiscountFlat(currentDiscount.discountAmount);
          setPresetScheme('CUSTOM');
        }
        if (currentDiscount.reason) setReasonCode(currentDiscount.reason);
        if (currentDiscount.remarks) setRemarks(currentDiscount.remarks);
      } else {
        setDiscountMode('PERCENT');
        setDiscountPercent(5);
        setPresetScheme('COURTESY-5');
        setReasonCode('Customer Goodwill / Delay in Service');
        setRemarks('');
      }
    }
  }, [isOpen, currentDiscount, grossTotal]);

  if (!isOpen) return null;

  const handlePresetChange = (scheme) => {
    setPresetScheme(scheme);
    setErrorMsg('');
    if (scheme === 'COURTESY-5') {
      setDiscountMode('PERCENT');
      setDiscountPercent(5);
      setReasonCode('Customer Goodwill / Delay in Service');
    } else if (scheme === 'MGR-10') {
      setDiscountMode('PERCENT');
      setDiscountPercent(10);
      setReasonCode('Management Discretion (MGR-DISC)');
    } else if (scheme === 'CORP-15') {
      setDiscountMode('PERCENT');
      setDiscountPercent(15);
      setReasonCode('Corporate Food Discount (FD-CORP)');
    } else if (scheme === 'VIP-20') {
      setDiscountMode('PERCENT');
      setDiscountPercent(20);
      setReasonCode('Club VIP Member Privilege');
    } else if (scheme === 'STAY-15') {
      setDiscountMode('PERCENT');
      setDiscountPercent(15);
      setReasonCode('In-House Long Stay Guest Discount');
    } else if (scheme === 'STAFF-50') {
      setDiscountMode('PERCENT');
      setDiscountPercent(50);
      setReasonCode('Staff Welfare Concession');
    } else if (scheme === 'COMP-100') {
      setDiscountMode('PERCENT');
      setDiscountPercent(100);
      setReasonCode('Food Quality Compensation (Full Waiver)');
    } else {
      setPresetScheme('CUSTOM');
    }
  };

  // Calculations
  const numericGross = Number(grossTotal) || 0;
  const calcDiscountAmt = discountMode === 'PERCENT'
    ? (numericGross * (Number(discountPercent) || 0)) / 100
    : (Number(discountFlat) || 0);

  const clampedDiscountAmt = Math.min(numericGross, Math.max(0, calcDiscountAmt));
  const effectivePercent = numericGross > 0 ? (clampedDiscountAmt / numericGross) * 100 : 0;
  
  // Rule: Cashier can grant up to 5%. More than 5% (6% - 15%+) requires Manager PIN!
  const requiresManagerPin = effectivePercent > 5.001;

  const revisedTaxable = Math.max(0, numericGross - clampedDiscountAmt);
  const revisedCgst = Math.round(revisedTaxable * 0.025 * 100) / 100;
  const revisedSgst = Math.round(revisedTaxable * 0.025 * 100) / 100;
  const rawRevisedTotal = revisedTaxable + revisedCgst + revisedSgst;
  const revisedGrandTotal = Math.round(rawRevisedTotal);
  const revisedRoundOff = Math.round((revisedGrandTotal - rawRevisedTotal) * 100) / 100;

  const handlePinKeypadPress = (val) => {
    setErrorMsg('');
    if (val === 'CLEAR') {
      setAuthPin('');
    } else if (val === 'BACKSPACE') {
      setAuthPin(prev => prev.slice(0, -1));
    } else {
      if (authPin.length < 6) {
        setAuthPin(prev => prev + val);
      }
    }
  };

  const handleApply = () => {
    setErrorMsg('');
    if (!reasonCode) {
      setErrorMsg('Mandatory Reason for Allowance must be selected.');
      return;
    }

    if (clampedDiscountAmt <= 0) {
      setErrorMsg('Discount amount must be greater than zero.');
      return;
    }

    // Anti-theft rule validation:
    // If discount > 5%, Manager PIN is strictly mandatory!
    if (requiresManagerPin) {
      if (!authPin) {
        setErrorMsg(`Discounts above 5% (${effectivePercent.toFixed(1)}%) require Supervisor / Manager PIN approval!`);
        return;
      }
      if (authPin !== '1234' && authPin !== '9999') {
        setErrorMsg('Invalid Supervisor PIN! Authorized Manager PIN (1234) is required for discounts > 5%.');
        return;
      }
    }

    if (onApplyDiscount) {
      onApplyDiscount({
        discountAmount: clampedDiscountAmt,
        discountPercent: effectivePercent,
        reason: reasonCode,
        remarks: remarks || reasonCode,
        revisedTaxable,
        revisedCgst,
        revisedSgst,
        revisedRoundOff,
        revisedGrandTotal,
        authBy: requiresManagerPin ? 'DUTY MANAGER (PIN:1234)' : (currentUser || 'CASHIER'),
        isManagerApproved: requiresManagerPin
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
          width: '840px', minHeight: '540px',
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
            padding: '4px 8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>🏷️</span>
            <span style={{ fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.4px' }}>
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
        <div style={{ padding: '10px 14px', fontSize: '11px', maxHeight: '82vh', overflowY: 'auto' }}>
          
          {/* Header Summary */}
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '8px 10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px' }}>Table No: <b>{tableNo}</b> | Bill Ref: <b>{billNo}</b></div>
              <div style={{ color: '#555', marginTop: '2px', fontSize: '10px' }}>GST SAC: <b>996331 (Restaurant Service)</b></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#888', fontSize: '10px' }}>Current Gross Bill:</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A' }}>₹{numericGross.toFixed(2)}</div>
            </div>
          </div>

          {/* Anti-Theft 5% Threshold Status Banner */}
          <div style={{
            background: requiresManagerPin ? '#FFF5F5' : '#E6F4EA',
            border: `1px solid ${requiresManagerPin ? '#FFCDD2' : '#A8DAB5'}`,
            padding: '6px 10px',
            marginBottom: '8px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: requiresManagerPin ? '#C62828' : '#137333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{requiresManagerPin ? '🔒 Supervisor Lock Active:' : '🟢 Cashier Courtesy Discretion:'}</span>
                <span>{effectivePercent.toFixed(1)}% Discount</span>
              </div>
              <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>
                {requiresManagerPin
                  ? 'Discounts above 5% strictly require Supervisor / Manager PIN (1234) and audit authorization.'
                  : 'Cashier is permitted to grant courtesy discounts up to 5% without Manager PIN approval.'
                }
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '2px',
              background: requiresManagerPin ? '#FFCDD2' : '#C8E6C9',
              color: requiresManagerPin ? '#B71C1C' : '#1B5E20'
            }}>
              {requiresManagerPin ? 'PIN MANDATORY' : 'PIN NOT REQUIRED'}
            </span>
          </div>

          {/* Standard Discount Schemes Preset Selector */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '3px', color: '#000' }}>
              Standard Discount Head / Category:
            </label>
            <select
              value={presetScheme}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF', fontWeight: 600 }}
            >
              <option value="COURTESY-5">Courtesy Discount — 5% (Cashier Discretion)</option>
              <option value="MGR-10">Manager Discretion — 10% (Manager PIN Required)</option>
              <option value="CORP-15">Corporate Food Discount — 15% (FD-CORP)</option>
              <option value="VIP-20">Club VIP Member Privilege — 20%</option>
              <option value="STAY-15">In-House Long Stay Guest — 15%</option>
              <option value="STAFF-50">Staff Welfare Concession — 50%</option>
              <option value="COMP-100">Food Quality Compensation — 100% (Full Waiver)</option>
              <option value="CUSTOM">Custom Percentage (%) or Flat INR Amount</option>
            </select>
          </div>

          {/* Mode & Inputs: Percentage vs Flat Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              background: discountMode === 'PERCENT' ? '#FFF' : '#F5F5F5',
              border: `1px solid ${discountMode === 'PERCENT' ? '#0A246A' : '#CCC'}`,
              padding: '6px 8px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="discMode"
                  checked={discountMode === 'PERCENT'}
                  onChange={() => { setDiscountMode('PERCENT'); setPresetScheme('CUSTOM'); }}
                />
                Percentage Discount (%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  disabled={discountMode !== 'PERCENT'}
                  value={discountPercent}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                    setDiscountPercent(val);
                    setPresetScheme('CUSTOM');
                  }}
                  style={{ width: '80px', padding: '3px 6px', fontSize: '12px', fontWeight: 700, border: '1px solid #7F9DB9', background: discountMode === 'PERCENT' ? '#FFF' : '#EEE' }}
                />
                <span style={{ fontWeight: 700, color: '#555' }}>%</span>
                <span style={{ fontSize: '10px', color: '#888' }}>(= ₹{((numericGross * (Number(discountPercent) || 0)) / 100).toFixed(2)})</span>
              </div>
            </div>

            <div style={{
              background: discountMode === 'FLAT' ? '#FFF' : '#F5F5F5',
              border: `1px solid ${discountMode === 'FLAT' ? '#0A246A' : '#CCC'}`,
              padding: '6px 8px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="discMode"
                  checked={discountMode === 'FLAT'}
                  onChange={() => { setDiscountMode('FLAT'); setPresetScheme('CUSTOM'); }}
                />
                Flat Amount Discount (INR)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 700, color: '#555' }}>₹</span>
                <input
                  type="number"
                  min="0"
                  max={numericGross}
                  step="1"
                  disabled={discountMode !== 'FLAT'}
                  value={discountFlat}
                  onChange={(e) => {
                    const val = Math.min(numericGross, Math.max(0, Number(e.target.value) || 0));
                    setDiscountFlat(val);
                    setPresetScheme('CUSTOM');
                  }}
                  style={{ width: '80px', padding: '3px 6px', fontSize: '12px', fontWeight: 700, border: '1px solid #7F9DB9', background: discountMode === 'FLAT' ? '#FFF' : '#EEE' }}
                />
                <span style={{ fontSize: '10px', color: '#888' }}>(= {numericGross > 0 ? ((Number(discountFlat) / numericGross) * 100).toFixed(1) : 0}%)</span>
              </div>
            </div>
          </div>

          {/* Statutory Reason for Allowance (Mandatory) */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '2px', color: '#000' }}>
              Authorized Reason for Allowance <span style={{ color: '#C62828' }}>*</span>:
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
            >
              <option value="Customer Goodwill / Delay in Service">Customer Goodwill / Delay in Service</option>
              <option value="Management Discretion (MGR-DISC)">Management Discretion (MGR-DISC)</option>
              <option value="Corporate Food Discount (FD-CORP)">Corporate Food Discount (FD-CORP)</option>
              <option value="Club VIP Member Privilege">Club VIP Member Privilege</option>
              <option value="In-House Long Stay Guest Discount">In-House Long Stay Guest Discount</option>
              <option value="Food Quality Compensation (Full Waiver)">Food Quality Compensation (Full Waiver)</option>
              <option value="Staff Welfare Concession">Staff Welfare Concession</option>
              <option value="Promotional Campaign / Voucher">Promotional Campaign / Voucher</option>
              <option value="Other Reason (Specify in Remarks)">Other Reason (Specify in Remarks)</option>
            </select>
          </div>

          {/* Remarks & Justification */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '2px', color: '#000' }}>
              Remarks & Justification / Notes:
            </label>
            <input
              type="text"
              placeholder="e.g. Guest complained about 35 min food delay / Corporate MD visit"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #7F9DB9', boxSizing: 'border-box' }}
            />
          </div>

          {/* Supervisor / Manager PIN (Mandatory for > 5%) */}
          <div style={{
            marginBottom: '8px',
            background: requiresManagerPin ? '#FFF5F5' : '#F8F9FA',
            border: `1px solid ${requiresManagerPin ? '#FFCDD2' : '#D4D0C8'}`,
            padding: '8px',
            borderRadius: '2px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontWeight: 700, color: requiresManagerPin ? '#C62828' : '#555', fontSize: '11px' }}>
                🔑 Supervisor / Manager PIN {requiresManagerPin ? <span style={{ color: '#C62828' }}>*(MANDATORY FOR &gt; 5%)</span> : '(Optional for ≤ 5%)'}:
              </label>
              <span style={{ fontSize: '10px', color: '#666' }}>Default: <strong>1234</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <input
                type={showPinMask ? 'password' : 'text'}
                maxLength={6}
                placeholder={requiresManagerPin ? 'Enter Manager PIN (1234)' : 'PIN Not Needed for ≤ 5%'}
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  border: `2px inset ${requiresManagerPin ? '#EF9A9A' : '#FFF'}`,
                  background: '#FFF'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPinMask(prev => !prev)}
                className="ids-btn-classic"
                style={{ padding: '0 8px', fontSize: '11px', cursor: 'pointer' }}
                title="Toggle PIN Visibility"
              >
                {showPinMask ? '👁️ Show' : '🔒 Hide'}
              </button>
            </div>

            {/* On-Screen Touch Keypad for Touch POS Terminals */}
            {requiresManagerPin && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '240px', margin: '4px auto 0' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACKSPACE'].map(keyVal => (
                  <button
                    key={keyVal}
                    type="button"
                    onClick={() => handlePinKeypadPress(keyVal)}
                    className="ids-btn-classic"
                    style={{
                      padding: '6px 4px',
                      fontSize: keyVal.length > 1 ? '10px' : '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: keyVal === 'CLEAR' ? '#FFF0F0' : keyVal === 'BACKSPACE' ? '#FFF8E7' : '#ECE9D8',
                      color: keyVal === 'CLEAR' ? '#C62828' : '#000'
                    }}
                  >
                    {keyVal === 'CLEAR' ? 'CLR' : keyVal === 'BACKSPACE' ? '⌫' : keyVal}
                  </button>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A', padding: '6px 8px', marginBottom: '8px', fontWeight: 700, fontSize: '11px', borderRadius: '2px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Statutory Recalculation Summary Box (Matches User Screenshot) */}
          <div style={{ background: '#FFF', border: '1px solid #716F64', padding: '8px 10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Gross Bill Amount:</span>
              <span>₹{numericGross.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#C62828', fontWeight: 700 }}>
              <span>Discount Allowed ({effectivePercent.toFixed(1)}%):</span>
              <span>- ₹{clampedDiscountAmt.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 700, borderTop: '1px dashed #CCC', paddingTop: '2px' }}>
              <span>Revised Taxable Value:</span>
              <span>₹{revisedTaxable.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
              <span>CGST (2.5%) + SGST (2.5%):</span>
              <span>₹{(revisedCgst + revisedSgst).toFixed(2)}</span>
            </div>
            {revisedRoundOff !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#777' }}>
                <span>Round Off:</span>
                <span>{revisedRoundOff >= 0 ? `+₹${revisedRoundOff.toFixed(2)}` : `-₹${Math.abs(revisedRoundOff).toFixed(2)}`}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0A246A', paddingTop: '4px', fontSize: '14px', fontWeight: 900, color: '#0A246A' }}>
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
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {currentDiscount && onRemoveDiscount && (
            <button
              onClick={() => {
                onRemoveDiscount();
                onClose();
              }}
              className="ids-btn-classic danger"
              style={{
                padding: '6px 14px',
                marginRight: 'auto'
              }}
            >
              ✕ Remove Discount
            </button>
          )}
          <button
            onClick={handleApply}
            className="ids-btn-classic success confirm"
            style={{
              padding: '6px 18px',
              minWidth: '120px'
            }}
          >
            ✓ Apply Discount
          </button>
          <button
            onClick={onClose}
            className="ids-btn-classic cancel exit danger"
            style={{
              padding: '6px 14px',
              minWidth: '90px'
            }}
          >
            Cancel [Esc]
          </button>
        </div>
      </div>
    </div>
  );
}
