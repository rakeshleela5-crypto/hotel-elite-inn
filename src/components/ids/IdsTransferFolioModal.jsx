import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  ArrowRightLeft, Check, X, Info, Search, 
  HelpCircle, ChevronDown, ChevronRight, FileText, AlertCircle, ShieldCheck, Printer, RefreshCw
} from 'lucide-react';
import { INITIAL_ACCOUNTING_DATE } from '../../data/idsPmsStore';

/* =========================================================================
   VIDEO 25: HOW TO TRANSFER FOLIO FROM ONE ROOM TO ANOTHER ROOM IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   ========================================================================= */

export const INITIAL_ROOM_201_TRANSACTIONS = [
  { id: 1, tag: 'Yes', rev: 'TRF', description: 'Tariff', date: INITIAL_ACCOUNTING_DATE, billNo: '', amount: 5000.00 },
  { id: 2, tag: 'Yes', rev: 'CGT', description: 'Central GST', date: INITIAL_ACCOUNTING_DATE, billNo: '', amount: 300.00 },
  { id: 3, tag: 'Yes', rev: 'SGT', description: 'State GST', date: INITIAL_ACCOUNTING_DATE, billNo: '', amount: 300.00 },
  { id: 4, tag: 'No',  rev: 'LAU', description: 'Laundry', date: INITIAL_ACCOUNTING_DATE, billNo: '227', amount: 500.00 },
  { id: 5, tag: 'No',  rev: 'SGT', description: 'State GST', date: INITIAL_ACCOUNTING_DATE, billNo: '227', amount: 45.00 },
  { id: 6, tag: 'No',  rev: 'CGT', description: 'Central GST', date: INITIAL_ACCOUNTING_DATE, billNo: '227', amount: 45.00 },
  { id: 7, tag: 'Yes', rev: 'ADV', description: 'Adv.Cash', date: INITIAL_ACCOUNTING_DATE, billNo: '177', amount: -1000.00 }
];

export const AVAILABLE_GUESTS_FOR_TRANSFER = [
  { roomNo: '201', guestName: 'Mr Sharma Raj', regNo: '624', folioNo: '1', resvNo: '276', arrival: `${INITIAL_ACCOUNTING_DATE} 18:56` },
  { roomNo: '205', guestName: 'Mr Kumar Anil', regNo: '625', folioNo: '1', resvNo: '277', arrival: `${INITIAL_ACCOUNTING_DATE} 19:07` },
  { roomNo: '301', guestName: 'Mr Rath Amitav', regNo: '505', folioNo: '1', resvNo: '278', arrival: `${INITIAL_ACCOUNTING_DATE} 12:47` },
  { roomNo: '303', guestName: 'Mr Mishra Priyadarshi', regNo: '506', folioNo: '1', resvNo: '279', arrival: `${INITIAL_ACCOUNTING_DATE} 11:49` }
];

export const REVENUE_FILTER_CHECKLIST = [
  'All', 'Laundry', 'Traveldesk', 'MiscCharg', 'LDR Romm', 'LACL',
  'MINI BAR', 'EP', 'CP', 'MAP', 'AP', 'QUBE', 'TAP21', 'RMS',
  'BANQUET', 'BAN POS', 'Trnf.Debit', 'Trnf.Crd', 'Paid Out', 'Tariff', 'Extra Bed'
];

export default function IdsTransferFolioModal({
  isOpen,
  onClose,
  initialFromRoom = '201',
  initialToRoom = '205',
  accountingDate = INITIAL_ACCOUNTING_DATE,
  onCompleteTransfer
}) {
  // Views: 'transfer-folios' | 'view-bill-source' | 'view-bill-destination'
  const [currentView, setCurrentView] = useState('transfer-folios');

  // Rooms Context
  const [fromRoomNo, setFromRoomNo] = useState(initialFromRoom || '201');
  const [toRoomNo, setToRoomNo] = useState(initialToRoom || '205');

  const sourceGuest = AVAILABLE_GUESTS_FOR_TRANSFER.find(g => g.roomNo === fromRoomNo) || AVAILABLE_GUESTS_FOR_TRANSFER[0];
  const targetGuest = AVAILABLE_GUESTS_FOR_TRANSFER.find(g => g.roomNo === toRoomNo) || AVAILABLE_GUESTS_FOR_TRANSFER[1];

  // Mode Selection
  const [transferMode, setTransferMode] = useState('Selective'); // 'Selective' | 'All'

  // Checklist of Revenue filters
  const [checkedCategories, setCheckedCategories] = useState(
    REVENUE_FILTER_CHECKLIST.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  // Transactions list
  const [transactions, setTransactions] = useState(INITIAL_ROOM_201_TRANSACTIONS);

  // Authorization Popup State (Frames 085–092)
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authRemarks, setAuthRemarks] = useState('Tran');
  const [authorizedBy, setAuthorizedBy] = useState('MANAGER');

  // Lookup modal
  const [lookupTarget, setLookupTarget] = useState(null); // 'from' | 'to' | null

  // Transfer status
  const [transferCompleted, setTransferCompleted] = useState(false);
  const [transferredAmount, setTransferredAmount] = useState(4600.00);
  const [statusNotice, setStatusNotice] = useState('');

  // Re-synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setFromRoomNo(initialFromRoom || '201');
      setToRoomNo(initialToRoom || '205');
      setTransferMode('Selective');
      setTransactions(INITIAL_ROOM_201_TRANSACTIONS);
      setShowAuthPopup(false);
      setCurrentView('transfer-folios');
      setStatusNotice('');
    }
  }, [isOpen, initialFromRoom, initialToRoom]);

  if (!isOpen) return null;

  // Calculate tagged transaction total
  const taggedTotal = transactions
    .filter(t => t.tag === 'Yes')
    .reduce((sum, t) => sum + t.amount, 0);

  // Tag toggle handler
  const handleToggleTag = (id) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, tag: t.tag === 'Yes' ? 'No' : 'Yes' };
      }
      return t;
    }));
  };

  // Toggle All Transactions
  const handleToggleAllTags = (select) => {
    setTransactions(prev => prev.map(t => ({ ...t, tag: select ? 'Yes' : 'No' })));
  };

  // Category checkbox toggle
  const handleToggleCategory = (cat) => {
    if (cat === 'All') {
      const newState = !checkedCategories['All'];
      const updated = {};
      REVENUE_FILTER_CHECKLIST.forEach(c => { updated[c] = newState; });
      setCheckedCategories(updated);
    } else {
      setCheckedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    }
  };

  // Step 1: Click Save -> Opens Authorized By popup
  const handleSaveClick = () => {
    if (taggedTotal === 0) {
      alert('Please tag at least one transaction to transfer.');
      return;
    }
    if (fromRoomNo === toRoomNo) {
      alert('Source room and destination room cannot be the same.');
      return;
    }
    setShowAuthPopup(true);
  };

  // Step 2: Confirm Authorization -> Apply Transfer
  const handleConfirmTransfer = () => {
    setShowAuthPopup(false);
    const amount = taggedTotal;
    setTransferredAmount(amount);
    setTransferCompleted(true);

    if (onCompleteTransfer) {
      onCompleteTransfer({
        fromRoomNo,
        toRoomNo,
        amount,
        remarks: authRemarks,
        authorizedBy,
        date: `${accountingDate} 19:11`
      });
    }

    // Clear form matching Frame 094
    setTransactions([]);
    setStatusNotice(`Folio transfer of ₹${amount.toFixed(2)} from Room ${fromRoomNo} to Room ${toRoomNo} completed successfully!`);
  };

  return (
    <div 
      className="ids-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '10px'
      }}
    >
      {/* Primary Window Container */}
      <div 
        className="ids-window"
        style={{
          width: '960px',
          maxWidth: '98vw',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 6px 20px rgba(0,0,0,0.6)',
          backgroundColor: '#ECE9D8',
          border: '2px solid #002D96',
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        {/* Windows XP Classic Title Bar */}
        <div 
          className="ids-window-titlebar"
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFFFFF',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowRightLeft size={14} color="#FFF" />
            <span>
              {currentView === 'transfer-folios' 
                ? 'Transfer Folios V6.5.002.1 (Inter-Room Folio Transfer)' 
                : currentView === 'view-bill-source' 
                  ? `Check-out V6.5.002.6 - View Bill (Source Room ${fromRoomNo} Folio)`
                  : `Check-out V6.5.002.6 - View Bill (Destination Room ${toRoomNo} Folio)`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            <button 
              className="ids-titlebar-btn"
              style={{
                width: '18px',
                height: '18px',
                lineHeight: '14px',
                textAlign: 'center',
                background: '#D4D0C8',
                border: '1px outset #FFF',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: '11px'
              }}
              onClick={onClose}
              title="Close Window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div 
          style={{ 
            background: '#E4DFD0', 
            padding: '4px 10px', 
            borderBottom: '1px solid #999', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#0A246A' }}>Folio Views:</span>
            <button
              className="ids-btn-classic"
              style={{
                padding: '2px 8px',
                fontWeight: currentView === 'transfer-folios' ? 700 : 400,
                background: currentView === 'transfer-folios' ? '#FFE8A1' : '#ECE9D8',
                borderColor: currentView === 'transfer-folios' ? '#316AC5' : '#716F64'
              }}
              onClick={() => setCurrentView('transfer-folios')}
            >
              1. Transfer Folios Dialog
            </button>
            <button
              className="ids-btn-classic"
              style={{
                padding: '2px 8px',
                fontWeight: currentView === 'view-bill-source' ? 700 : 400,
                background: currentView === 'view-bill-source' ? '#C1D2EE' : '#ECE9D8'
              }}
              onClick={() => setCurrentView('view-bill-source')}
            >
              2. Source Room {fromRoomNo} Bill
            </button>
            <button
              className="ids-btn-classic"
              style={{
                padding: '2px 8px',
                fontWeight: currentView === 'view-bill-destination' ? 700 : 400,
                background: currentView === 'view-bill-destination' ? '#B8F4B8' : '#ECE9D8',
                color: currentView === 'view-bill-destination' ? '#004D00' : '#000'
              }}
              onClick={() => setCurrentView('view-bill-destination')}
            >
              3. Destination Room {toRoomNo} Bill
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ padding: '2px 8px' }}
              onClick={() => {
                setTransactions(INITIAL_ROOM_201_TRANSACTIONS);
                setStatusNotice('Reset transactions to Video 25 initial baseline');
              }}
            >
              Reset Sample Data
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div 
            style={{ 
              background: '#FFFFCC', 
              color: '#002D96', 
              padding: '3px 10px', 
              borderBottom: '1px solid #CCCCCC',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Info size={13} color="#002D96" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {currentView === 'transfer-folios' ? (
            /* =========================================================================
               VIEW 1: TRANSFER FOLIOS V6.5.002.1 (Video 25 Frames 065–085)
               ========================================================================= */
            <div>
              {/* Dual Room Header Grid matching Frame 065 */}
              <div 
                style={{ 
                  background: '#F0ECE0', 
                  border: '1px inset #D0C8B8', 
                  padding: '8px 12px', 
                  marginBottom: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: '20px',
                  rowGap: '6px',
                  fontSize: '11px'
                }}
              >
                {/* Left Side: Source Room (From Room) */}
                <div style={{ borderRight: '1px solid #D0C8B8', paddingRight: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '4px' }}>SOURCE FOLIO (FROM)</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: '4px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>From Room</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        type="text" 
                        value={fromRoomNo} 
                        readOnly 
                        style={{ width: '70px', border: '1px inset #999', padding: '1px 4px', fontWeight: 700, background: '#FFF' }}
                      />
                      <button 
                        className="ids-btn-classic" 
                        style={{ padding: '0 5px', fontSize: '10px' }}
                        onClick={() => setLookupTarget('from')}
                      >
                        ?
                      </button>
                    </div>

                    <div style={{ fontWeight: 600 }}>Guest Name</div>
                    <div>
                      <input 
                        type="text" 
                        value={sourceGuest.guestName} 
                        readOnly 
                        style={{ width: '100%', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                    </div>

                    <div style={{ fontWeight: 600 }}>Folio #</div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={sourceGuest.folioNo} 
                        readOnly 
                        style={{ width: '50px', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                      <span style={{ fontWeight: 600 }}>Reg. #</span>
                      <input 
                        type="text" 
                        value={sourceGuest.regNo} 
                        readOnly 
                        style={{ width: '70px', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Destination Room (To Room) */}
                <div>
                  <div style={{ fontWeight: 700, color: '#006600', marginBottom: '4px' }}>DESTINATION FOLIO (TO)</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: '4px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>To Room</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        type="text" 
                        value={toRoomNo} 
                        readOnly 
                        style={{ width: '70px', border: '1px inset #999', padding: '1px 4px', fontWeight: 700, background: '#FFF' }}
                      />
                      <button 
                        className="ids-btn-classic" 
                        style={{ padding: '0 5px', fontSize: '10px' }}
                        onClick={() => setLookupTarget('to')}
                      >
                        ?
                      </button>
                    </div>

                    <div style={{ fontWeight: 600 }}>Guest Name</div>
                    <div>
                      <input 
                        type="text" 
                        value={targetGuest.guestName} 
                        readOnly 
                        style={{ width: '100%', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                    </div>

                    <div style={{ fontWeight: 600 }}>Folio #</div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={targetGuest.folioNo} 
                        readOnly 
                        style={{ width: '50px', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                      <span style={{ fontWeight: 600 }}>Reg #</span>
                      <input 
                        type="text" 
                        value={targetGuest.regNo} 
                        readOnly 
                        style={{ width: '70px', border: '1px inset #999', padding: '1px 4px', background: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Options & Amount Header Strip matching Frame 065 */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  border: '1px solid #ACA899', 
                  padding: '4px 10px', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                {/* Radios */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="transferMode" 
                      checked={transferMode === 'Selective'} 
                      onChange={() => setTransferMode('Selective')} 
                    />
                    <span style={{ fontWeight: transferMode === 'Selective' ? 700 : 400 }}>Selective Transactions</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="transferMode" 
                      checked={transferMode === 'All'} 
                      onChange={() => {
                        setTransferMode('All');
                        handleToggleAllTags(true);
                      }} 
                    />
                    <span style={{ fontWeight: transferMode === 'All' ? 700 : 400 }}>All Transactions</span>
                  </label>
                </div>

                {/* Transactions Amount Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Transactions Amount</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={taggedTotal.toFixed(2)} 
                    style={{ 
                      width: '110px', 
                      textAlign: 'right', 
                      background: '#FFF', 
                      border: '1px inset #999', 
                      padding: '2px 6px',
                      fontWeight: 700,
                      color: taggedTotal > 0 ? '#006600' : '#A00'
                    }}
                  />
                </div>
              </div>

              {/* Main Content Layout: Checklist on Left + Grid on Right matching Frame 075 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {/* Left Side: Revenue Checklist Panel */}
                <div 
                  style={{ 
                    width: '160px', 
                    background: '#FFFFFF', 
                    border: '1px solid #7F9DB9', 
                    height: '260px', 
                    overflowY: 'auto',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ fontWeight: 700, paddingBottom: '4px', borderBottom: '1px solid #DDD', color: '#0A246A' }}>
                    Revenue Filter
                  </div>
                  {REVENUE_FILTER_CHECKLIST.map(cat => (
                    <label 
                      key={cat} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        padding: '2px 0', 
                        cursor: 'pointer',
                        color: cat === 'All' ? '#0A246A' : '#333',
                        fontWeight: cat === 'All' ? 700 : 400
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!checkedCategories[cat]} 
                        onChange={() => handleToggleCategory(cat)} 
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>

                {/* Right Side: Transactions Table */}
                <div 
                  style={{ 
                    flex: 1, 
                    background: '#FFFFFF', 
                    border: '1px solid #7F9DB9', 
                    height: '260px', 
                    overflowY: 'auto' 
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead style={{ background: '#ECE9D8', position: 'sticky', top: 0, zIndex: 5 }}>
                      <tr style={{ borderBottom: '1px solid #ACA899' }}>
                        <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '45px', textAlign: 'center' }}>Tag</th>
                        <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '55px' }}>REV</th>
                        <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8' }}>Description</th>
                        <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '95px' }}>Date</th>
                        <th style={{ padding: '3px 6px', borderRight: '1px solid #D0C8B8', width: '50px' }}>Bill #</th>
                        <th style={{ padding: '3px 6px', width: '85px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map(t => (
                          <tr 
                            key={t.id}
                            style={{ 
                              borderBottom: '1px solid #EEE',
                              background: t.tag === 'Yes' ? '#F0FFF0' : '#FFFFFF'
                            }}
                          >
                            <td 
                              style={{ 
                                padding: '3px 6px', 
                                borderRight: '1px solid #EEE', 
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: t.tag === 'Yes' ? '#006600' : '#888'
                              }}
                              onClick={() => handleToggleTag(t.id)}
                              title="Click to Toggle Tag Yes/No"
                            >
                              <span style={{ 
                                padding: '1px 6px', 
                                background: t.tag === 'Yes' ? '#C2F0C2' : '#E0E0E0',
                                border: '1px outset #999',
                                borderRadius: '2px',
                                fontSize: '10px'
                              }}>
                                {t.tag}
                              </span>
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>
                              {t.rev}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>
                              {t.description}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>
                              {t.date}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', color: '#666' }}>
                              {t.billNo}
                            </td>
                            <td style={{ 
                              padding: '3px 6px', 
                              textAlign: 'right', 
                              fontWeight: 600,
                              color: t.amount < 0 ? '#006600' : '#000'
                            }}>
                              {t.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                            {transferCompleted 
                              ? 'Transactions successfully transferred to Room ' + toRoomNo + '! Form cleared.' 
                              : 'No transactions found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Strip: Checkbox & Command Buttons matching Frame 065 */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '6px',
                  borderTop: '1px solid #D0C8B8'
                }}
              >
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleToggleAllTags(e.target.checked)} 
                    />
                    <span>Select All Transactions</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '75px', fontWeight: 700 }}
                    onClick={handleSaveClick}
                    disabled={transactions.length === 0}
                  >
                    Save
                  </button>

                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '75px' }}
                    onClick={() => {
                      setTransactions(prev => prev.map(t => ({ ...t, tag: 'No' })));
                      setStatusNotice('Untagged all transactions');
                    }}
                  >
                    Clear
                  </button>

                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '75px' }}
                    onClick={onClose}
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          ) : currentView === 'view-bill-source' ? (
            /* =========================================================================
               VIEW 2: SOURCE ROOM 201 VIEW BILL (Video 25 Frame 110)
               ========================================================================= */
            <div>
              {/* Header */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  border: '1px solid #ACA899', 
                  padding: '6px 10px', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>Company: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Group: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Room #: <strong style={{ color: '#0A246A' }}>{fromRoomNo}</strong></span>
                  <span>|</span>
                  <span>Guest: <strong>{sourceGuest.guestName}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => setCurrentView('transfer-folios')}>
                    Back to Transfer
                  </button>
                </div>
              </div>

              {/* Table with 8 rows matching Frame 110 */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '300px', overflowY: 'auto', marginBottom: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ background: '#ECE9D8' }}>
                    <tr style={{ borderBottom: '1px solid #ACA899' }}>
                      <th style={{ padding: '3px 4px', width: '30px' }}>Sl #</th>
                      <th style={{ padding: '3px 6px', width: '125px' }}>Date</th>
                      <th style={{ padding: '3px 4px', width: '40px' }}>Resv#</th>
                      <th style={{ padding: '3px 4px', width: '45px' }}>Room#</th>
                      <th style={{ padding: '3px 4px', width: '40px' }}>Reg#</th>
                      <th style={{ padding: '3px 4px', width: '50px' }}>RevCod</th>
                      <th style={{ padding: '3px 4px', width: '35px' }}>Bill #</th>
                      <th style={{ padding: '3px 6px' }}>Particulars</th>
                      <th style={{ padding: '3px 6px', width: '80px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '2px 4px' }}>1</td><td style={{ padding: '2px 6px' }}>{accountingDate} 18:57</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>TRF</td><td></td><td>*Tariff 201</td><td style={{ textAlign: 'right' }}>5,000.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>2</td><td style={{ padding: '2px 6px' }}>{accountingDate} 18:57</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>CGT</td><td></td><td>*Central GST</td><td style={{ textAlign: 'right' }}>300.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>3</td><td style={{ padding: '2px 6px' }}>{accountingDate} 18:57</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>SGT</td><td></td><td>*State GST</td><td style={{ textAlign: 'right' }}>300.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>4</td><td style={{ padding: '2px 6px' }}>{accountingDate} 19:02</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>LAU</td><td>227</td><td>Laundry</td><td style={{ textAlign: 'right' }}>500.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>5</td><td style={{ padding: '2px 6px' }}>{accountingDate} 19:02</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>SGT</td><td>227</td><td>State GST</td><td style={{ textAlign: 'right' }}>45.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>6</td><td style={{ padding: '2px 6px' }}>{accountingDate} 19:02</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>CGT</td><td>227</td><td>Central GST</td><td style={{ textAlign: 'right' }}>45.00</td></tr>
                    <tr><td style={{ padding: '2px 4px' }}>7</td><td style={{ padding: '2px 6px' }}>{accountingDate} 19:02</td><td>0</td><td>201</td><td>624</td><td style={{ fontWeight: 600 }}>ADV</td><td>177</td><td>Advance(Cash)</td><td style={{ textAlign: 'right', color: '#006600' }}>-1,000.00</td></tr>
                    
                    {/* Line 8: Transfer Credit matching Frame 110 */}
                    <tr style={{ background: '#F0FFF0', borderTop: '1px solid #ACA899' }}>
                      <td style={{ padding: '2px 4px', fontWeight: 700 }}>8</td>
                      <td style={{ padding: '2px 6px' }}>{accountingDate} 19:11</td>
                      <td>0</td>
                      <td>201</td>
                      <td>624</td>
                      <td style={{ fontWeight: 700, color: '#006600' }}>TRC</td>
                      <td></td>
                      <td style={{ fontWeight: 700, color: '#006600' }}>*TRANSFER CREDIT -&gt; FROM {toRoomNo}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#006600' }}>
                        - {transferredAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Balance after Transfer */}
              <div style={{ background: '#ECE9D8', padding: '6px 12px', border: '1px solid #ACA899', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div>Total Charges: ₹6,190.00 | Advance: -₹1,000.00 | Transfer Credit: -₹{transferredAmount.toFixed(2)}</div>
                <div>Net Folio Balance: <strong style={{ color: '#0A246A' }}>₹{(5190.00 - transferredAmount).toFixed(2)}</strong></div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               VIEW 3: DESTINATION ROOM 205 VIEW BILL (Video 25 Frame 135)
               ========================================================================= */
            <div>
              {/* Header */}
              <div 
                style={{ 
                  background: '#ECE9D8', 
                  border: '1px solid #ACA899', 
                  padding: '6px 10px', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>Company: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Group: <strong>ALL</strong></span>
                  <span>|</span>
                  <span>Room #: <strong style={{ color: '#006600' }}>{toRoomNo}</strong></span>
                  <span>|</span>
                  <span>Guest: <strong>{targetGuest.guestName}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => setCurrentView('transfer-folios')}>
                    Back to Transfer
                  </button>
                </div>
              </div>

              {/* Table with Transfer Debit Line matching Frame 135 */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '300px', overflowY: 'auto', marginBottom: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ background: '#ECE9D8' }}>
                    <tr style={{ borderBottom: '1px solid #ACA899' }}>
                      <th style={{ padding: '3px 4px', width: '30px' }}>Sl #</th>
                      <th style={{ padding: '3px 6px', width: '125px' }}>Date</th>
                      <th style={{ padding: '3px 4px', width: '40px' }}>Resv#</th>
                      <th style={{ padding: '3px 4px', width: '45px' }}>Room#</th>
                      <th style={{ padding: '3px 4px', width: '40px' }}>Reg#</th>
                      <th style={{ padding: '3px 4px', width: '50px' }}>RevCod</th>
                      <th style={{ padding: '3px 4px', width: '35px' }}>Bill #</th>
                      <th style={{ padding: '3px 6px' }}>Particulars</th>
                      <th style={{ padding: '3px 6px', width: '80px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#F0FFF0' }}>
                      <td style={{ padding: '3px 4px', fontWeight: 700 }}>1</td>
                      <td style={{ padding: '3px 6px' }}>{accountingDate} 19:11</td>
                      <td>0</td>
                      <td>{toRoomNo}</td>
                      <td>{targetGuest.regNo}</td>
                      <td style={{ fontWeight: 700, color: '#A00' }}>TRD</td>
                      <td></td>
                      <td style={{ fontWeight: 700, color: '#A00' }}>*TRANSFER DEBIT -&gt; FROM {fromRoomNo}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#A00' }}>
                        {transferredAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Balance for Destination */}
              <div style={{ background: '#ECE9D8', padding: '6px 12px', border: '1px solid #ACA899', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div>Transferred Debit: ₹{transferredAmount.toFixed(2)}</div>
                <div>Net Folio Balance: <strong style={{ color: '#A00' }}>₹{transferredAmount.toFixed(2)}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Windows XP Status Bar */}
        <div 
          className="ids-statusbar"
          style={{
            background: '#ECE9D8',
            borderTop: '1px solid #ACA899',
            padding: '3px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#444'
          }}
        >
          <div>
            System Date: <strong>{accountingDate}</strong> | User: <strong>IT ADMIN</strong>
          </div>
          <div>
            IDS Fortune NEXT V6.5.002.1 • Transfer Folio Transaction
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL POPUP 1: AUTHORIZED BY ? (Video 25 Frames 085–092)
          ========================================================================= */}
      {showAuthPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '320px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            {/* Title Bar */}
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Authorized By ?</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setShowAuthPopup(false)}
              >
                ✕
              </button>
            </div>

            {/* Content Area matching Frame 085 */}
            <div style={{ padding: '14px', fontSize: '11px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: '10px', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Remarks</div>
                <div>
                  <input 
                    type="text" 
                    value={authRemarks}
                    onChange={(e) => setAuthRemarks(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '2px 4px', background: '#FFF' }}
                    autoFocus
                  />
                </div>

                <div style={{ fontWeight: 600 }}>Authorized By</div>
                <div>
                  <input 
                    type="text" 
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    style={{ width: '100%', border: '1px inset #999', padding: '2px 4px', background: '#FFF', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Buttons matching Frame 085 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px', fontWeight: 700 }}
                  onClick={handleConfirmTransfer}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '75px' }}
                  onClick={() => setShowAuthPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL POPUP 2: ROOM SELECTION LOOKUP
          ========================================================================= */}
      {lookupTarget && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}
        >
          <div 
            className="ids-window"
            style={{
              width: '360px',
              backgroundColor: '#ECE9D8',
              border: '2px solid #002D96',
              boxShadow: '4px 6px 16px rgba(0,0,0,0.5)',
              padding: '0'
            }}
          >
            <div 
              style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFFFFF',
                padding: '3px 6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Select {lookupTarget === 'from' ? 'Source' : 'Destination'} Room</span>
              <button 
                style={{ width: '16px', height: '16px', lineHeight: '12px', background: '#D4D0C8', border: '1px outset #FFF', cursor: 'pointer', fontSize: '10px' }}
                onClick={() => setLookupTarget(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '180px', overflowY: 'auto' }}>
                {AVAILABLE_GUESTS_FOR_TRANSFER.map(g => (
                  <div
                    key={g.roomNo}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #EEE',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#316AC5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
                    onClick={() => {
                      if (lookupTarget === 'from') setFromRoomNo(g.roomNo);
                      else setToRoomNo(g.roomNo);
                      setLookupTarget(null);
                    }}
                  >
                    <span>Room <strong>{g.roomNo}</strong> - {g.guestName}</span>
                    <span style={{ color: '#666', fontSize: '10px' }}>Reg {g.regNo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
