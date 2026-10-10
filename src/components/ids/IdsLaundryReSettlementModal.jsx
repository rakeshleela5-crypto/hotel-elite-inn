import React, { useState } from 'react';
import './idsFortuneNext.css';
import { Users, Building, CreditCard, Gift, AlertOctagon } from 'lucide-react';

export default function IdsLaundryReSettlementModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onReSettlementComplete,
  onOpenMessageBox
}) {
  const [billNo, setBillNo] = useState('LAU-501');
  const [roomNo, setRoomNo] = useState('205');
  const [guestName, setGuestName] = useState('Mr Kumar Anil');
  const [grossAmount, setGrossAmount] = useState(200);
  const [netAmount, setNetAmount] = useState(236); // includes 18% GST
  const [currentSettlement, setCurrentSettlement] = useState('Direct Cash (Settled on 27-JAN 20:15)');

  // Selected Tender
  const [activeTender, setActiveTender] = useState('credit-card');
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Credit Card Form Fields (Frame 019)
  const [cardData, setCardData] = useState({
    cardType: 'AMEX',
    company: '',
    cardNumber: '3782-8224-9100-3005',
    guestName: 'Mr Kumar Anil',
    authNo: 'AUTH-77892',
    currency: 'Indian Rupees',
    exchange: '1.00',
    amount: '236.00',
    tips: '0.00',
    remarks: 'Re-settled from Cash to American Express card'
  });

  if (!isOpen) return null;

  const handleTenderClick = (mode) => {
    setActiveTender(mode);
    if (mode === 'credit-card') {
      setCardModalOpen(true);
    } else if (mode === 'guest-ac') {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Re-settle Laundry Bill',
          message: `Transfer laundry bill ${billNo} (₹${netAmount}.00) directly to Guest In-House Folio Room ${roomNo}?`,
          type: 'question',
          buttons: 'YesNo',
          onYes: () => {
            completeSettlement('Guest A/C (Room Folio 205/1)');
          }
        });
      }
    } else if (mode === 'company') {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Re-settle Laundry Bill',
          message: `Bill laundry charge to Corporate City Ledger?`,
          type: 'question',
          buttons: 'YesNo',
          onYes: () => {
            completeSettlement('Company City Ledger (BTC)');
          }
        });
      }
    }
  };

  const completeSettlement = (tenderName) => {
    const payload = {
      billNo,
      roomNo,
      guestName,
      netAmount,
      previousSettlement: currentSettlement,
      newSettlement: tenderName,
      date: accountingDate,
      cardDetails: tenderName.includes('Credit Card') ? cardData : null
    };

    if (onReSettlementComplete) {
      onReSettlementComplete(payload);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Settlement Complete',
        message: `Laundry Bill ${billNo} re-settled successfully to ${tenderName}. Reversal credit voucher posted.`,
        type: 'info',
        onOk: onClose
      });
    } else {
      alert(`Laundry Bill ${billNo} re-settled successfully to ${tenderName}.`);
      onClose();
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '680px', 
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
          <span>Settle Laundry Bill V6.5.008.10</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px' }}>
          {/* Bill Info Header */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '60px', fontWeight: 'bold' }}>Bill #</label>
                <input 
                  type="text" 
                  value={billNo} 
                  onChange={(e) => setBillNo(e.target.value)}
                  style={{ width: '90px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '60px', fontWeight: 'bold' }}>Room #</label>
                <input 
                  type="text" 
                  value={roomNo} 
                  onChange={(e) => setRoomNo(e.target.value)}
                  style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '50px', fontWeight: 'bold' }}>Name</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dotted #CCC' }}>
              <span style={{ color: '#666' }}>Current Settlement: <strong style={{ color: '#0A246A' }}>{currentSettlement}</strong></span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#900' }}>Bill Amount: ₹{netAmount}.00</span>
            </div>
          </div>

          {/* Large Graphical Tender Buttons (Matching Video 04 Frame 019 Exactly) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px', 
              marginBottom: '16px' 
            }}
          >
            {/* 1. Guest A/C */}
            <button
              onClick={() => handleTenderClick('guest-ac')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer',
                background: activeTender === 'guest-ac' ? '#D5E2F2' : '#ECE9D8',
                borderColor: activeTender === 'guest-ac' ? '#0A246A' : '#7F9DB9'
              }}
            >
              <Users size={32} color="#0A246A" />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Guest A/C</span>
            </button>

            {/* 2. Company */}
            <button
              onClick={() => handleTenderClick('company')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer',
                background: activeTender === 'company' ? '#D5E2F2' : '#ECE9D8'
              }}
            >
              <Building size={32} color="#008000" />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Company</span>
            </button>

            {/* 3. Credit Card */}
            <button
              onClick={() => handleTenderClick('credit-card')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer',
                background: activeTender === 'credit-card' ? '#D5E2F2' : '#ECE9D8'
              }}
            >
              <CreditCard size={32} color="#000080" />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Credit Card</span>
            </button>

            {/* 4. Complimentary */}
            <button
              onClick={() => handleTenderClick('complimentary')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Gift size={32} color="#B8860B" />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Complimentary</span>
            </button>

            {/* 5. Stop Posting */}
            <button
              onClick={() => handleTenderClick('stop-posting')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <AlertOctagon size={32} color="#CC0000" />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#900' }}>Stop Posting</span>
            </button>

            {/* Direct Cash Re-settlement */}
            <button
              onClick={() => handleTenderClick('cash')}
              className="ids-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }}>💵</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Direct Cash</span>
            </button>
          </div>

          {/* Bottom Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button onClick={() => completeSettlement('Direct Cash')} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Save</button>
            <button onClick={() => {}} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Clear</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* Credit Card Settlement Sub-Modal (Video 04 Frame 019) */}
        {cardModalOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '480px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Credit Card Settlement</span>
                <button onClick={() => setCardModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Card Type</label>
                    <select 
                      value={cardData.cardType}
                      onChange={(e) => setCardData({ ...cardData, cardType: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="AMEX">AMEX (American Express)</option>
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">MASTERCARD</option>
                      <option value="RUPAY">RUPAY</option>
                      <option value="DINERS">DINERS CLUB</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Company</label>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      <input 
                        type="text" 
                        value={cardData.company} 
                        onChange={(e) => setCardData({ ...cardData, company: e.target.value })}
                        style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }} 
                      />
                      <button style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}>?</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Card Number</label>
                    <input 
                      type="text" 
                      value={cardData.cardNumber} 
                      onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Guest Name</label>
                    <input 
                      type="text" 
                      value={cardData.guestName} 
                      onChange={(e) => setCardData({ ...cardData, guestName: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Authorization #</label>
                    <input 
                      type="text" 
                      value={cardData.authNo} 
                      onChange={(e) => setCardData({ ...cardData, authNo: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Currency</label>
                    <select 
                      value={cardData.currency}
                      onChange={(e) => setCardData({ ...cardData, currency: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Indian Rupees">Indian Rupees</option>
                      <option value="US Dollars">US Dollars</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Amount (INR)</label>
                    <input 
                      type="text" 
                      value={cardData.amount} 
                      disabled
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Remarks</label>
                    <input 
                      type="text" 
                      value={cardData.remarks} 
                      onChange={(e) => setCardData({ ...cardData, remarks: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <button 
                    onClick={() => {
                      setCardModalOpen(false);
                      completeSettlement(`Credit Card (${cardData.cardType} - ${cardData.cardNumber.slice(-4)})`);
                    }} 
                    className="ids-btn" 
                    style={{ padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setCardData({ ...cardData, cardNumber: '', authNo: '' })} 
                    className="ids-btn" 
                    style={{ padding: '3px 14px', fontSize: '11px' }}
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setCardModalOpen(false)} 
                    className="ids-btn" 
                    style={{ padding: '3px 14px', fontSize: '11px' }}
                  >
                    Back
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
