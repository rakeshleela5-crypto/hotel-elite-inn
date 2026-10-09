import React, { useState, useEffect } from 'react';

/* =========================================================================
   VIDEO 14: HOW TO POST DEPOSIT OR ADVANCE IN A ROOM NUMBER IN IDS 6.5 & 7.0
   Replication of:
   1. Post Receipts FOR GUESTS V6.5.002.1 Window (Video 14 Frames 011–020)
   2. Room# selector, [ ? ] help lookup, and guest autofill
   3. Payment modes: Cash, Credit Card, Cheque
   4. Currency conversion row (INR, Exchange Rate 1.000000)
   5. Cash Details / Particulars editor (Received Amount, Particulars, Receipt #)
   6. Accounting metadata: Date, User (MANAGER), Last Updated
   7. Confirmation prompt: "DO YOU WANT TO PRINT VOUCHER?" (Frame 018)
   8. Authentic printable Front Office Cashiering Deposit Voucher
   ========================================================================= */

export default function IdsPostDepositModal({
  isOpen,
  onClose,
  initialRoomNo = '201',
  inhouseGuests = [],
  onOpenRoomHelpLookup,
  onSaveDeposit
}) {
  const [selectedRoomNo, setSelectedRoomNo] = useState(initialRoomNo);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash', 'card', 'cheque'
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1.000000');
  
  // Form values matching Video 14 Frame 016
  const [receivedAmount, setReceivedAmount] = useState('2000.00');
  const [particulars, setParticulars] = useState('Room Advance Payment');
  const [encashmentNo, setEncashmentNo] = useState('');
  const [receiptNo, setReceiptNo] = useState('168');
  
  // Card / Cheque specific fields
  const [cardNumber, setCardNumber] = useState('4532 **** **** 8821');
  const [cardType, setCardType] = useState('Visa');
  const [cardAuthCode, setCardAuthCode] = useState('AUTH9812');
  const [chequeNo, setChequeNo] = useState('CHQ-89021');
  const [bankName, setBankName] = useState('State Bank of India');

  // Prompts & Voucher preview state
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [showVoucherPreview, setShowVoucherPreview] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    if (initialRoomNo) {
      setSelectedRoomNo(initialRoomNo);
    }
  }, [initialRoomNo, isOpen]);

  useEffect(() => {
    const found = inhouseGuests.find(g => g.roomNo === selectedRoomNo) || inhouseGuests[0];
    if (found) {
      setSelectedGuest(found);
      if (found.roomNo === '201') {
        setReceivedAmount('2000.00');
        setParticulars('Room Advance Payment');
        setReceiptNo('168');
      } else {
        setReceivedAmount('1500.00');
        setParticulars('Advance Deposit');
        setReceiptNo(String(Math.floor(100 + Math.random() * 900)));
      }
    }
  }, [selectedRoomNo, inhouseGuests]);

  if (!isOpen) return null;

  const handleRoomChange = (e) => {
    const val = e.target.value;
    setSelectedRoomNo(val);
    const found = inhouseGuests.find(g => g.roomNo === val);
    if (found) {
      setSelectedGuest(found);
    }
  };

  const handleSave = () => {
    if (!receivedAmount || parseFloat(receivedAmount) <= 0) {
      alert('Please enter a valid Received Amount.');
      return;
    }

    const genReceipt = receiptNo || String(Math.floor(100 + Math.random() * 900));
    setReceiptNo(genReceipt);

    // Prompt user: "DO YOU WANT TO PRINT VOUCHER?" (Video 14 Frame 018)
    setShowPrintPrompt(true);
  };

  const handleConfirmPrintPrompt = (shouldPrint) => {
    setShowPrintPrompt(false);

    const parsedAmount = parseFloat(receivedAmount) || 2000;
    if (onSaveDeposit && selectedGuest) {
      onSaveDeposit({
        roomNo: selectedGuest.roomNo,
        guestName: selectedGuest.guestName || `${selectedGuest.title} ${selectedGuest.lastName}`,
        folioNo: selectedGuest.folioNo || `${selectedGuest.roomNo} / 1`,
        amount: parsedAmount,
        paymentMode,
        particulars,
        receiptNo,
        date: '17-JAN-2022 19:13'
      });
    }

    if (shouldPrint) {
      setShowVoucherPreview(true);
    } else {
      setSaveSuccessNotice(true);
      setTimeout(() => {
        setSaveSuccessNotice(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '740px', maxWidth: '98vw', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#ECE9D8', position: 'relative' }}
      >
        {/* Title Bar matching Frame 012 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Post Receipts FOR GUESTS</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          
          {saveSuccessNotice && (
            <div style={{ background: '#E6FFE6', border: '1px solid #4CAF50', padding: '6px 8px', marginBottom: '8px', color: '#1B5E20', fontWeight: 700 }}>
              ✓ Deposit Receipt #{receiptNo} of ₹{parseFloat(receivedAmount).toFixed(2)} posted successfully to Room {selectedGuest?.roomNo}!
            </div>
          )}

          {/* Header Guest & Room Information Strip matching Frame 012 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {/* Left Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Room#</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input 
                  className="ids-input" 
                  value={selectedRoomNo} 
                  onChange={handleRoomChange}
                  style={{ width: '80px', fontWeight: 700, background: '#FFF' }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '0 6px', fontWeight: 700 }}
                  onClick={onOpenRoomHelpLookup}
                  title="Search In-House Room"
                >
                  ?
                </button>
              </div>

              <span style={{ fontWeight: 600 }}>Reservation #</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input 
                  className="ids-input" 
                  value={selectedGuest?.resNo || '276'} 
                  readOnly 
                  style={{ width: '80px', background: '#EBEBE4' }} 
                />
                <button className="ids-btn-classic" style={{ padding: '0 6px' }}>?</button>
              </div>

              <span style={{ fontWeight: 600 }}>Company Code</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input 
                  className="ids-input" 
                  value={selectedGuest?.companyCode || 'COM0012'} 
                  readOnly 
                  style={{ width: '80px', background: '#EBEBE4' }} 
                />
                <button className="ids-btn-classic" style={{ padding: '0 6px' }}>?</button>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Folio #</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={selectedGuest?.folioNo?.split('/')[1]?.trim() || '1'} 
                  readOnly 
                  style={{ width: '60px', background: '#EBEBE4', fontWeight: 700 }} 
                />
                <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '1px 6px' }}>More..</button>
              </div>

              <span style={{ fontWeight: 600 }}>Guest Name</span>
              <input 
                className="ids-input" 
                value={selectedGuest ? (selectedGuest.guestName || `${selectedGuest.title} ${selectedGuest.lastName || ''} ${selectedGuest.firstName || ''}`) : ''} 
                readOnly 
                style={{ width: '100%', background: '#EBEBE4', fontWeight: 700, color: '#0A246A' }} 
              />

              <span style={{ fontWeight: 600 }}>Company Name</span>
              <input 
                className="ids-input" 
                value={selectedGuest?.companyName || 'Varun Beverages Ltd (Mr. Arobin De)'} 
                readOnly 
                style={{ width: '100%', background: '#EBEBE4' }} 
              />
            </div>
          </div>

          {/* Payment Mode Selector Tabs matching Frame 012 & Frame 016 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', borderTop: '1px solid #CCC', borderBottom: '1px solid #CCC', padding: '6px 0' }}>
            <button 
              className="ids-btn-classic"
              style={{
                padding: '4px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: paymentMode === 'cash' ? 700 : 400,
                background: paymentMode === 'cash' ? '#FFF7CC' : '#ECE9D8',
                border: paymentMode === 'cash' ? '2px solid #316AC5' : '1px solid #7F9DB9'
              }}
              onClick={() => setPaymentMode('cash')}
            >
              <span style={{ fontSize: '14px' }}>💵</span>
              Cash
            </button>

            <button 
              className="ids-btn-classic"
              style={{
                padding: '4px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: paymentMode === 'card' ? 700 : 400,
                background: paymentMode === 'card' ? '#FFF7CC' : '#ECE9D8',
                border: paymentMode === 'card' ? '2px solid #316AC5' : '1px solid #7F9DB9'
              }}
              onClick={() => setPaymentMode('card')}
            >
              <span style={{ fontSize: '14px' }}>💳</span>
              Credit Card
            </button>

            <button 
              className="ids-btn-classic"
              style={{
                padding: '4px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: paymentMode === 'cheque' ? 700 : 400,
                background: paymentMode === 'cheque' ? '#FFF7CC' : '#ECE9D8',
                border: paymentMode === 'cheque' ? '2px solid #316AC5' : '1px solid #7F9DB9'
              }}
              onClick={() => setPaymentMode('cheque')}
            >
              <span style={{ fontSize: '14px' }}>📄</span>
              Cheque
            </button>
          </div>

          {/* Currency Strip matching Frame 016 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Currency Code</span>
            <input 
              className="ids-input" 
              value={currencyCode} 
              onChange={(e) => setCurrencyCode(e.target.value)} 
              style={{ width: '45px', textAlign: 'center', fontWeight: 700 }} 
            />
            <button className="ids-btn-classic" style={{ padding: '0 6px' }}>?</button>

            <span style={{ fontWeight: 600, marginLeft: '14px' }}>Exchange Rate</span>
            <input 
              className="ids-input" 
              value={exchangeRate} 
              onChange={(e) => setExchangeRate(e.target.value)} 
              style={{ width: '80px', textAlign: 'right' }} 
            />

            <span style={{ fontWeight: 600, marginLeft: '14px' }}>Exg. Amt.</span>
            <input 
              className="ids-input" 
              value={receivedAmount} 
              readOnly 
              style={{ width: '85px', textAlign: 'right', background: '#EBEBE4', fontWeight: 700 }} 
            />
          </div>

          {/* Main Details Area: Left Form & Right Audit/Tax Info matching Frame 016 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginBottom: '10px' }}>
            
            {/* Left Box: Mode Details */}
            <div className="ids-groupbox" style={{ padding: '8px' }}>
              <span className="ids-groupbox-title">
                {paymentMode === 'cash' ? 'Cash Details' : paymentMode === 'card' ? 'Credit Card Details' : 'Cheque Details'}
              </span>

              {paymentMode === 'cash' && (
                <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Received Amount</span>
                  <input 
                    className="ids-input" 
                    value={receivedAmount} 
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    style={{ width: '130px', fontWeight: 700, fontSize: '12px', textAlign: 'right', background: '#FFF', color: '#900' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Particulars</span>
                  <input 
                    className="ids-input" 
                    value={particulars} 
                    onChange={(e) => setParticulars(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Encashment #</span>
                  <input 
                    className="ids-input" 
                    value={encashmentNo} 
                    onChange={(e) => setEncashmentNo(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Receipt #</span>
                  <input 
                    className="ids-input" 
                    value={receiptNo} 
                    readOnly 
                    style={{ width: '90px', background: '#EBEBE4', fontWeight: 700 }} 
                  />
                </div>
              )}

              {paymentMode === 'card' && (
                <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Received Amount</span>
                  <input 
                    className="ids-input" 
                    value={receivedAmount} 
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    style={{ width: '130px', fontWeight: 700, fontSize: '12px', textAlign: 'right', background: '#FFF', color: '#900' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Card Type</span>
                  <select 
                    className="ids-select" 
                    value={cardType} 
                    onChange={(e) => setCardType(e.target.value)}
                    style={{ width: '130px' }}
                  >
                    <option value="Visa">Visa</option>
                    <option value="MasterCard">MasterCard</option>
                    <option value="Rupay">Rupay</option>
                    <option value="Amex">Amex</option>
                  </select>

                  <span style={{ fontWeight: 600 }}>Card Number</span>
                  <input 
                    className="ids-input" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Auth / Ref #</span>
                  <input 
                    className="ids-input" 
                    value={cardAuthCode} 
                    onChange={(e) => setCardAuthCode(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Particulars</span>
                  <input 
                    className="ids-input" 
                    value={particulars} 
                    onChange={(e) => setParticulars(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />
                </div>
              )}

              {paymentMode === 'cheque' && (
                <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Received Amount</span>
                  <input 
                    className="ids-input" 
                    value={receivedAmount} 
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    style={{ width: '130px', fontWeight: 700, fontSize: '12px', textAlign: 'right', background: '#FFF', color: '#900' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Cheque / UPI Ref</span>
                  <input 
                    className="ids-input" 
                    value={chequeNo} 
                    onChange={(e) => setChequeNo(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Bank Name</span>
                  <input 
                    className="ids-input" 
                    value={bankName} 
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Particulars</span>
                  <input 
                    className="ids-input" 
                    value={particulars} 
                    onChange={(e) => setParticulars(e.target.value)}
                    style={{ width: '100%', background: '#FFF' }} 
                  />
                </div>
              )}
            </div>

            {/* Right Box: Tax Grid & Accounting Metadata matching Frame 016 */}
            <div>
              {/* Mini Tax Grid */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', height: '100px', marginBottom: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead style={{ background: '#ECE9D8' }}>
                    <tr>
                      <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Rev.Code</th>
                      <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #E0E0E0', padding: '2px 4px' }}>ADV01</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '2px 4px', textAlign: 'right' }}>0.00</td>
                    </tr>
                    {[1, 2, 3].map(i => (
                      <tr key={`tax-empty-${i}`} style={{ height: '18px' }}>
                        <td style={{ border: '1px solid #F0F0F0' }}></td>
                        <td style={{ border: '1px solid #F0F0F0' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Accounting Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Accounting Date</span>
                <input className="ids-input" value="17-JAN-2022" readOnly style={{ background: '#EBEBE4' }} />

                <span style={{ fontWeight: 600 }}>User</span>
                <input className="ids-input" value="MANAGER" readOnly style={{ background: '#EBEBE4', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Last Updated</span>
                <input className="ids-input" value="17-JAN-2022 19:13" readOnly style={{ background: '#EBEBE4', fontSize: '10px' }} />
              </div>
            </div>
          </div>

          {/* Bottom Action Command Bar matching Frame 016 & Frame 018 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="ids-btn-classic" style={{ minWidth: '45px' }}>Add</button>
              <button className="ids-btn-classic" style={{ minWidth: '45px' }}>Modify</button>
              <button className="ids-btn-classic" style={{ minWidth: '45px' }}>Delete</button>
              <button className="ids-btn-classic" style={{ minWidth: '45px' }}>Browse</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Previous</button>
              <button className="ids-btn-classic" style={{ minWidth: '45px' }}>Next</button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '60px', fontWeight: 700 }}
                onClick={handleSave}
              >
                <u>S</u>ave
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Panel</button>
              <button 
                className="ids-btn-classic" 
                style={{ minWidth: '55px' }}
                onClick={onClose}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PROMPT MODAL: "DO YOU WANT TO PRINT VOUCHER?" (Video 14 Frame 018)
            ========================================================================= */}
        {showPrintPrompt && (
          <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '380px', maxWidth: '92vw', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', background: '#ECE9D8', border: '2px solid #808080' }}
            >
              <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Post Receipts FOR GUESTS</span>
                <button className="ids-win-btn close" onClick={() => handleConfirmPrintPrompt(false)}>✕</button>
              </div>

              <div style={{ padding: '16px', fontSize: '11px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '26px', color: '#2B5797' }}>❓</span>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>DO YOU WANT TO PRINT VOUCHER?</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '70px', fontWeight: 700 }}
                    onClick={() => handleConfirmPrintPrompt(true)}
                  >
                    Yes
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '70px' }}
                    onClick={() => handleConfirmPrintPrompt(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PRINTABLE FRONT OFFICE CASHIERING DEPOSIT VOUCHER
            ========================================================================= */}
        {showVoucherPreview && (
          <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '580px', maxWidth: '96vw', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', background: '#FFF' }}
            >
              <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Deposit Voucher Preview - Receipt #{receiptNo}</span>
                <button className="ids-win-btn close" onClick={() => { setShowVoucherPreview(false); onClose(); }}>✕</button>
              </div>

              <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
                {/* Voucher Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>HOTEL ELITE INN</h2>
                  <div style={{ fontSize: '10px' }}>Old Market Road, Tawang, Arunachal Pradesh - 790104</div>
                  <div style={{ fontSize: '10px' }}>GSTIN: 12AAAAA0000A1Z5 | Phone: +91 3794 224488</div>
                  <div style={{ fontWeight: 700, marginTop: '6px', fontSize: '13px', textDecoration: 'underline' }}>
                    FRONT OFFICE DEPOSIT RECEIPT VOUCHER
                  </div>
                </div>

                {/* Voucher Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '11px' }}>
                  <div>
                    <div>Receipt No : <strong>#{receiptNo}</strong></div>
                    <div>Date & Time: 17-JAN-2022 19:13</div>
                    <div>Room No    : <strong>{selectedGuest?.roomNo || selectedRoomNo}</strong></div>
                    <div>Folio No   : {selectedGuest?.folioNo || '1'}</div>
                  </div>
                  <div>
                    <div>Guest Name : <strong>{selectedGuest?.guestName || 'Mr Kumar Anil'}</strong></div>
                    <div>Company    : {selectedGuest?.companyName || 'Varun Beverages Ltd'}</div>
                    <div>Cashier    : <strong>MANAGER</strong></div>
                    <div>Payment    : <strong>{paymentMode.toUpperCase()}</strong></div>
                  </div>
                </div>

                {/* Particulars & Amount Table */}
                <div style={{ border: '1px solid #000', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ borderBottom: '1px solid #000', background: '#F5F5F5' }}>
                      <tr>
                        <th style={{ padding: '4px 6px', textAlign: 'left' }}>Description / Particulars</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right', width: '110px' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 6px' }}>
                          {particulars}
                          <div style={{ fontSize: '10px', color: '#555' }}>Mode: {paymentMode.toUpperCase()} ({currencyCode})</div>
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                          ₹{parseFloat(receivedAmount).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot style={{ borderTop: '2px solid #000', fontWeight: 700 }}>
                      <tr>
                        <td style={{ padding: '6px' }}>TOTAL RECEIVED</td>
                        <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px' }}>
                          ₹{parseFloat(receivedAmount).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ fontSize: '10px', marginBottom: '24px' }}>
                  Amount in words: <em>Rupees Two Thousand Only</em>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '10px', borderTop: '1px dashed #666', paddingTop: '8px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div>_______________________</div>
                    <div style={{ marginTop: '2px' }}>Guest Signature</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div>_______________________</div>
                    <div style={{ marginTop: '2px' }}>Authorized Cashier</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, padding: '4px 14px' }}
                    onClick={() => {
                      window.print();
                    }}
                  >
                    🖨️ Print Voucher
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ padding: '4px 14px' }}
                    onClick={() => {
                      setShowVoucherPreview(false);
                      onClose();
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
