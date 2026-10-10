import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  CreditCard, Banknote, Building, Check, X, Search, 
  ArrowRight, AlertCircle, RotateCcw, DollarSign, Percent
} from 'lucide-react';
import { INITIAL_INHOUSE_GUESTS } from './IdsGuestManagementModal';

// Authentic Bank / Card Codes in IDS Fortune NEXT
export const CARD_PROVIDERS = [
  { code: 'CRDSBI1', name: 'State Bank Of India' },
  { code: 'CRDHDFC', name: 'HDFC Bank Ltd.' },
  { code: 'CRDICICI', name: 'ICICI Bank' },
  { code: 'CRDAXIS', name: 'Axis Bank' },
  { code: 'CRDAMEX', name: 'American Express India' }
];

export default function IdsPosBillSettlementModal({
  isOpen,
  onClose,
  initialBillNo = '4',
  accountingDate = '03-FEB-2022',
  outlet = 'RESTAURANT',
  session = 'General',
  steward = 'Manash',
  inhouseGuests = INITIAL_INHOUSE_GUESTS,
  onBillSettled,
  onOpenCrystalReport
}) {
  // Registry of all pending and settled bills matching Video 04 Frame 020, 033 & 052
  const [billsRegistry, setBillsRegistry] = useState([
    {
      billNo: '4',
      outlet: 'RES',
      billDate: '03-FEB-2022',
      session: 'GN',
      tableNo: '10',
      covers: '2',
      server: 'Manash',
      amount: 627.00,
      status: 'Pending',
      items: [
        { code: '1', name: 'Classic Russian Salad .', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '2', name: 'Red Beans Peanut _Dry', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '3', name: 'Sprouted Moong Peanut D', quantity: 1.0, rate: 199.0, value: 199.0 }
      ],
      discount: 0.0,
      payments: []
    },
    {
      billNo: '3',
      outlet: 'RES',
      billDate: '03-FEB-2022',
      session: 'GN',
      tableNo: '15',
      covers: '2',
      server: 'Manash',
      amount: 619.00,
      status: 'Pending',
      items: [
        { code: '82', name: 'STEAMED RICE', quantity: 1.0, rate: 145.0, value: 145.0 },
        { code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, value: 200.0 },
        { code: '175', name: 'CHICKEN SHAWARMA', quantity: 1.0, rate: 150.0, value: 150.0 },
        { code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.0, value: 120.0 }
      ],
      discount: 0.0,
      payments: []
    },
    {
      billNo: '2',
      outlet: 'RES',
      billDate: '03-FEB-2022',
      session: 'GN',
      tableNo: '10',
      covers: '1',
      server: 'Biren',
      amount: 209.00,
      status: 'Settled',
      items: [
        { code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, value: 200.0 }
      ],
      discount: 0.0,
      payments: [{ mode: 'Cash', cur: 'INR', foreignAmt: '', localAmt: 209.00, details: 'Cash Settlement' }]
    }
  ]);

  // Current active bill selection state
  const [activeBillNo, setActiveBillNo] = useState(initialBillNo);
  const [activeRegNo, setActiveRegNo] = useState('0');
  const [activeNation, setActiveNation] = useState('IND');
  const [discountAmount, setDiscountAmount] = useState(0.00);
  const [paymentsGrid, setPaymentsGrid] = useState([]);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState(null);

  // Sub-dialogs state
  const [billHelpOpen, setBillHelpOpen] = useState(false);
  const [billHelpUserFilter, setBillHelpUserFilter] = useState('ALL');
  const [selectedHelpBillNo, setSelectedHelpBillNo] = useState(initialBillNo);

  // Payment Sub-dialogs
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  // Credit Card Modal Form State (Video 04 Frame 040 & 045)
  const [cardActiveTab, setCardActiveTab] = useState(1);
  const [cardType, setCardType] = useState('VISA');
  const [cardProvider, setCardProvider] = useState('CRDSBI1');
  const [cardNo, setCardNo] = useState('1234**********56');
  const [cardGuestName, setCardGuestName] = useState('');
  const [cardAuth, setCardAuth] = useState('AUTH-99214');
  const [cardAmount, setCardAmount] = useState('');
  const [cardTips, setCardTips] = useState('0.00');

  // Cash Modal Form State (Video 04 Frame 048)
  const [cashReceived, setCashReceived] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashTips, setCashTips] = useState('0.00');
  const [cashRemarks, setCashRemarks] = useState('');

  // Guest / Room Folio Modal Form State
  const [guestRoomNo, setGuestRoomNo] = useState('201');
  const [guestFolioNo, setGuestFolioNo] = useState('FOL-201-998');
  const [guestName, setGuestName] = useState('Mr. P Ashok');
  const [guestRemarks, setGuestRemarks] = useState('Restaurant Dining Charge');

  // Discount Form State
  const [discPercent, setDiscPercent] = useState('0');
  const [discReason, setDiscReason] = useState('Manager Discretion');

  // Active Bill Record
  const currentBill = useMemo(() => {
    return billsRegistry.find(b => b.billNo === activeBillNo) || billsRegistry[0];
  }, [billsRegistry, activeBillNo]);

  // Synchronize initial bill selection
  useEffect(() => {
    if (currentBill) {
      setPaymentsGrid(currentBill.payments || []);
      setDiscountAmount(currentBill.discount || 0);
    }
  }, [activeBillNo]);

  // Total payments already applied in grid
  const totalPaid = useMemo(() => {
    return paymentsGrid.reduce((sum, p) => sum + (Number(p.localAmt) || 0), 0);
  }, [paymentsGrid]);

  // Calculated Remaining Balance
  const currentNettAmount = useMemo(() => {
    return Math.max(0, (currentBill?.amount || 0) - discountAmount);
  }, [currentBill, discountAmount]);

  const currentBalance = useMemo(() => {
    const bal = currentNettAmount - totalPaid;
    return Number(Math.max(0, bal).toFixed(2));
  }, [currentNettAmount, totalPaid]);

  // Handle Opening Card Modal (Pre-populates remaining balance or custom)
  const handleOpenCardModal = () => {
    setCardAmount(currentBalance > 0 ? currentBalance.toFixed(2) : '0.00');
    setCardModalOpen(true);
  };

  // Handle Opening Cash Modal (Video 04 Frame 048)
  const handleOpenCashModal = () => {
    setCashAmount(currentBalance > 0 ? currentBalance.toFixed(2) : '0.00');
    setCashReceived(currentBalance > 0 ? currentBalance.toFixed(2) : '0.00');
    setCashModalOpen(true);
  };

  // Handle Opening Guest / Room Modal
  const handleOpenGuestModal = () => {
    if (inhouseGuests.length > 0) {
      const g = inhouseGuests[0];
      setGuestRoomNo(g.roomNo);
      setGuestName(g.guestName);
      setGuestFolioNo(`FOL-${g.roomNo}-${Math.floor(100 + Math.random() * 899)}`);
    }
    setGuestModalOpen(true);
  };

  // Apply Credit Card Payment (Video 04 Frame 040 & Frame 048)
  const handleConfirmCardPayment = () => {
    const amt = parseFloat(cardAmount) || 0;
    if (amt <= 0) {
      alert("Please enter a valid card amount.");
      return;
    }
    const providerObj = CARD_PROVIDERS.find(c => c.code === cardProvider) || CARD_PROVIDERS[0];
    const detailsStr = `${cardType}-${providerObj.code}-CARD # ${cardNo}`;

    const newPayment = {
      id: Date.now(),
      mode: 'Credit Card',
      cur: 'INR',
      foreignAmt: '',
      localAmt: amt,
      diffAmt: '',
      tipsCur: 'INR',
      tipsAmount: parseFloat(cardTips) || 0,
      details: detailsStr
    };

    setPaymentsGrid(prev => [...prev, newPayment]);
    setCardModalOpen(false);
  };

  // Apply Cash Payment (Video 04 Frame 048 & Frame 029)
  const handleConfirmCashPayment = () => {
    const amt = parseFloat(cashAmount) || 0;
    if (amt <= 0) {
      alert("Please enter a valid cash amount.");
      return;
    }

    const newPayment = {
      id: Date.now(),
      mode: 'Cash',
      cur: 'INR',
      foreignAmt: '',
      localAmt: amt,
      diffAmt: '',
      tipsCur: 'INR',
      tipsAmount: parseFloat(cashTips) || 0,
      details: cashRemarks ? `Cash - ${cashRemarks}` : 'Cash Tender'
    };

    setPaymentsGrid(prev => [...prev, newPayment]);
    setCashModalOpen(false);
  };

  // Apply Guest Folio Payment
  const handleConfirmGuestPayment = () => {
    const amt = currentBalance;
    if (amt <= 0) {
      alert("Bill is already fully paid.");
      return;
    }

    const newPayment = {
      id: Date.now(),
      mode: 'Guest (Folio)',
      cur: 'INR',
      foreignAmt: '',
      localAmt: amt,
      diffAmt: '',
      tipsCur: '',
      tipsAmount: 0,
      details: `Room ${guestRoomNo} - ${guestName} (${guestFolioNo})`
    };

    setPaymentsGrid(prev => [...prev, newPayment]);
    setGuestModalOpen(false);
  };

  // Apply Quick Direct Cash (when user clicks Cash button if zero dialog requested)
  const handleQuickCash = () => {
    if (currentBalance <= 0) return;
    const newPayment = {
      id: Date.now(),
      mode: 'Cash',
      cur: 'INR',
      foreignAmt: '',
      localAmt: currentBalance,
      diffAmt: '',
      tipsCur: '',
      tipsAmount: 0,
      details: 'Direct Cash'
    };
    setPaymentsGrid(prev => [...prev, newPayment]);
  };

  // Delete a payment line from grid
  const handleDeletePayment = (id) => {
    setPaymentsGrid(prev => prev.filter(p => p.id !== id));
  };

  // Handle Save / Settle Bill (Video 04 Frame 029 & 050)
  const handleSaveSettlement = () => {
    if (currentBalance > 0) {
      alert(`Cannot save settlement: Remaining Balance is ₹${currentBalance.toFixed(2)}. Please settle full amount.`);
      return;
    }

    // Update Bills Registry to Settled
    setBillsRegistry(prev => prev.map(b => {
      if (b.billNo === currentBill.billNo) {
        return {
          ...b,
          status: 'Settled',
          payments: paymentsGrid,
          discount: discountAmount
        };
      }
      return b;
    }));

    const settlementRecord = {
      billNo: currentBill.billNo,
      tableNo: currentBill.tableNo,
      outlet: currentBill.outlet || outlet,
      billDate: currentBill.billDate || accountingDate,
      server: currentBill.server || steward,
      nettAmount: currentNettAmount,
      discount: discountAmount,
      payments: paymentsGrid,
      status: 'Settled',
      items: currentBill.items || []
    };

    if (onBillSettled) {
      onBillSettled(settlementRecord);
    }

    setSettleSuccessMsg(`Bill #${currentBill.billNo} on Table ${currentBill.tableNo} Settled Successfully! Table is now Vacant.`);
    setTimeout(() => {
      setSettleSuccessMsg(null);
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1280 }}>
      {/* Authentic Win32 Bill Settlement Dialog Window (Video 04 Frame 016 - 054) */}
      <div 
        className="ids-modal-container" 
        style={{ 
          width: '790px', 
          maxWidth: '98vw', 
          background: '#ECE9D8', 
          border: '2px solid #808080', 
          boxShadow: '4px 4px 18px rgba(0,0,0,0.65)' 
        }}
      >
        {/* Title Bar matching Video 04 Frame 016: Bill Settlement V6.5.008.30 */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '3px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '12px' }}>Bill Settlement V6.5.008.30</span>
          <button 
            className="ids-win-btn close" 
            onClick={onClose} 
            style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}
          >
            ✕
          </button>
        </div>

        {/* Top 3-Beveled Header Indicators (Video 04 Frame 016) */}
        <div style={{ background: '#ECE9D8', padding: '6px 12px 2px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '3px 8px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
              {currentBill?.billDate || accountingDate}
            </div>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '3px 8px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
              {outlet}
            </div>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '3px 8px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
              {session}
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {settleSuccessMsg && (
          <div style={{ background: '#D4EDDA', borderBottom: '1px solid #C3E6CB', color: '#155724', padding: '4px 14px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{settleSuccessMsg}</span>
          </div>
        )}

        {/* Upper Form Fields (Video 04 Frame 016 & Frame 024) */}
        <div style={{ padding: '4px 14px 8px 14px', background: '#ECE9D8', fontSize: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {/* Left Column Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Bill # with Help ? Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '60px', fontWeight: 600 }}>Bill #</label>
                <input 
                  type="text" 
                  value={activeBillNo} 
                  onChange={e => setActiveBillNo(e.target.value)}
                  style={{ width: '85px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setBillHelpOpen(true)}
                  title="Lookup Pending / Settled Bills (Video 04 Frame 020)"
                  style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700, background: '#FFE4B5' }}
                >
                  ?
                </button>
                <span style={{ fontSize: '10px', color: currentBill?.status === 'Settled' ? '#008000' : '#C00', fontWeight: 700, marginLeft: '8px' }}>
                  [{currentBill?.status || 'Pending'}]
                </span>
              </div>

              {/* Reg # + GO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '60px', fontWeight: 600 }}>Reg #</label>
                <input 
                  type="text" 
                  value={activeRegNo} 
                  onChange={e => setActiveRegNo(e.target.value)}
                  style={{ width: '85px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <button className="ids-btn" style={{ padding: '1px 8px', fontSize: '10px', fontWeight: 600 }}>
                  GO
                </button>
              </div>

              {/* Nation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '60px', fontWeight: 600 }}>Nation</label>
                <input 
                  type="text" 
                  value={activeNation} 
                  readOnly 
                  style={{ width: '85px', background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
                <span style={{ fontSize: '10px' }}>🇮🇳</span>
              </div>
            </div>

            {/* Right Column Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Nett Amount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '85px', fontWeight: 600 }}>Nett Amount</label>
                <input 
                  type="text" 
                  readOnly 
                  value={currentNettAmount.toFixed(2)}
                  style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}
                />
                <input 
                  type="text" 
                  readOnly 
                  value="INR" 
                  style={{ width: '45px', background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }}
                />
              </div>

              {/* Discount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setDiscountModalOpen(true)}
                  style={{ width: '85px', padding: '1px 4px', fontSize: '11px', fontWeight: 600 }}
                >
                  Discount
                </button>
                <input 
                  type="text" 
                  readOnly 
                  value={discountAmount.toFixed(2)}
                  style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', textAlign: 'right' }}
                />
                <div style={{ width: '45px', background: '#E0DFE3', border: '1px solid #7F9DB9', height: '19px' }}></div>
              </div>

              {/* Server */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '85px', fontWeight: 600 }}>Server</label>
                <input 
                  type="text" 
                  readOnly 
                  value={currentBill?.server || steward} 
                  style={{ width: '171px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Table / Room # and Covers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ width: '85px', fontWeight: 600 }}>Table/Room #</label>
                <input 
                  type="text" 
                  readOnly 
                  value={currentBill?.tableNo || '10'} 
                  style={{ width: '55px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
                <label style={{ width: '45px', fontWeight: 600, textAlign: 'right' }}>Covers</label>
                <input 
                  type="text" 
                  readOnly 
                  value={currentBill?.covers || '2'} 
                  style={{ width: '45px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 12 Payment Mode Buttons Grid (Video 04 Frame 016 & Frame 024) */}
        <div style={{ padding: '6px 14px', background: '#ECE9D8', borderTop: '1px solid #BBB' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {/* Row 1 */}
            <button 
              className="ids-btn" 
              onClick={handleOpenCashModal}
              style={{ fontWeight: 700, padding: '5px 4px', fontSize: '11px' }}
            >
              <u>C</u>ash
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Foreign Exchange Settlement Routine")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              <u>F</u>oreign Exchange
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Plan Settlement Routine (CP/MAP/AP)")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              <u>P</u>lan
            </button>
            <button 
              className="ids-btn" 
              onClick={handleOpenCardModal}
              style={{ fontWeight: 700, padding: '5px 4px', fontSize: '11px', color: '#000080' }}
            >
              C<u>r</u>edit Card
            </button>

            {/* Row 2 */}
            <button 
              className="ids-btn" 
              onClick={() => alert("Cheque Settlement Routine")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              C<u>h</u>eque
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Company / BTC Direct Billing")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              C<u>o</u>mpany
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Coupon / Voucher Settlement")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              C<u>o</u>upon
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Staff Meal / Internal Account")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              <u>S</u>taff
            </button>

            {/* Row 3 */}
            <button 
              className="ids-btn" 
              onClick={() => alert("Non Chargeable (NC) Protocol")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              <u>N</u>on Chargeable
            </button>
            <button 
              className="ids-btn" 
              onClick={handleOpenGuestModal}
              style={{ fontWeight: 700, padding: '5px 4px', fontSize: '11px', color: '#800080' }}
            >
              <u>G</u>uest
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Void / Hold Bill Routine")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              <u>V</u>oid / Hold
            </button>
            <button 
              className="ids-btn" 
              onClick={() => alert("Complimentary Management Exemption")}
              style={{ padding: '5px 4px', fontSize: '11px' }}
            >
              Co<u>m</u>plimentary
            </button>
          </div>
        </div>

        {/* Balance Display (Video 04 Frame 016 & Frame 024) */}
        <div style={{ padding: '4px 14px', background: '#ECE9D8', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <label style={{ fontWeight: 700 }}>Balance</label>
          <input 
            type="text" 
            readOnly 
            value={currentBalance.toFixed(2)} 
            style={{ 
              width: '120px', 
              background: '#FFF', 
              border: '1px solid #7F9DB9', 
              padding: '2px 4px', 
              fontSize: '12px', 
              fontWeight: 800, 
              textAlign: 'right',
              color: currentBalance > 0 ? '#C00' : '#008000'
            }}
          />
        </div>

        {/* Mid Navigation & Action Row (Video 04 Frame 016 & Frame 029) */}
        <div style={{ padding: '6px 14px', background: '#ECE9D8', borderTop: '1px solid #CCC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="ids-btn" style={{ padding: '2px 8px', fontSize: '11px' }}>
              Previous
            </button>
            <button className="ids-btn" style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
              Current
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="ids-btn" 
              onClick={handleSaveSettlement}
              disabled={currentBill?.status === 'Settled' && currentBalance === 0 && paymentsGrid.length === 0}
              style={{ 
                padding: '3px 14px', 
                fontSize: '11px', 
                fontWeight: 700, 
                background: currentBalance === 0 ? '#DFF0D8' : '#ECE9D8', 
                borderColor: currentBalance === 0 ? '#3C763D' : '#808080' 
              }}
            >
              <u>S</u>ave
            </button>
            <button 
              className="ids-btn" 
              onClick={() => setPaymentsGrid([])}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              Clear
            </button>
            {currentBill?.status === 'Settled' && (
              <button 
                className="ids-btn" 
                onClick={() => {
                  if (onOpenCrystalReport) {
                    onOpenCrystalReport({
                      reportType: 'pos-bill',
                      data: {
                        billNo: currentBill.billNo,
                        tableNo: currentBill.tableNo,
                        outlet: outlet,
                        session: session,
                        server: currentBill.server,
                        accountingDate: currentBill.billDate,
                        items: currentBill.items,
                        subTotal: (currentBill.amount / 1.05),
                        cgst: (currentBill.amount * 0.025),
                        sgst: (currentBill.amount * 0.025),
                        total: currentBill.amount,
                        isSettled: true,
                        settlementDetails: paymentsGrid.map(p => `${p.mode}: ₹${p.localAmt}`).join(' | ')
                      }
                    });
                  }
                }}
                style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: '#000080' }}
              >
                Print Receipt
              </button>
            )}
            <button 
              className="ids-btn" 
              onClick={onClose}
              style={{ padding: '3px 12px', fontSize: '11px' }}
            >
              <u>E</u>xit
            </button>
          </div>
        </div>

        {/* Lower Payments Data Grid (Video 04 Frame 016, 029 & 048) */}
        <div style={{ padding: '0 14px 10px 14px', background: '#ECE9D8' }}>
          <div style={{ height: '170px', background: '#FFF', border: '1px solid #808080', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#F5EBDC', borderBottom: '1px solid #999' }}>
                <tr>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '90px' }}>Mode</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '45px' }}>Cur.</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '80px', textAlign: 'right' }}>Foreign Amt</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '85px', textAlign: 'right' }}>Local Amt</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '60px', textAlign: 'right' }}>Diff. Amt</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '50px' }}>Tips Cur</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '65px', textAlign: 'right' }}>Tips Amt</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC' }}>Details</th>
                  <th style={{ padding: '3px 6px', width: '35px', textAlign: 'center' }}>Act</th>
                </tr>
              </thead>
              <tbody>
                {paymentsGrid.map((p, idx) => (
                  <tr key={p.id || idx} style={{ borderBottom: '1px solid #EAEAEA', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>{p.mode}</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{p.cur}</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>{p.foreignAmt || '-'}</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right', fontWeight: 700, color: '#000080' }}>
                      {Number(p.localAmt).toFixed(2)}
                    </td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>{p.diffAmt || '-'}</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{p.tipsCur || '-'}</td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', textAlign: 'right' }}>
                      {p.tipsAmount ? Number(p.tipsAmount).toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', color: '#555', fontSize: '10px' }}>{p.details}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeletePayment(p.id)}
                        className="ids-win-btn close" 
                        title="Remove payment line"
                        style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '12px', margin: '0 auto' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty Grid Rows */}
                {Array.from({ length: Math.max(0, 5 - paymentsGrid.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: '22px', borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SUB-MODAL 1: BILL HELP V6.5.008.30 (Video 04 Frame 020 & Frame 033 & Frame 052) */}
      {billHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '560px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Help V6.5.008.30</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setBillHelpOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '8px 12px', fontSize: '11px' }}>
              {/* User Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600 }}>User</label>
                <select 
                  value={billHelpUserFilter} 
                  onChange={e => setBillHelpUserFilter(e.target.value)}
                  style={{ width: '160px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="ALL">ALL</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
              </div>

              {/* Bills List Grid (Video 04 Frame 020) */}
              <div style={{ height: '230px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#EAE6D6', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '50px' }}>Bill #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '45px' }}>Outlet</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '85px' }}>Bill Date</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '50px' }}>Session</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '75px' }}>Table/Room #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '70px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '3px 6px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billsRegistry.map(b => {
                      const isSelected = selectedHelpBillNo === b.billNo;
                      return (
                        <tr 
                          key={b.billNo}
                          onClick={() => setSelectedHelpBillNo(b.billNo)}
                          style={{ 
                            background: isSelected ? '#C0FFFF' : '#FFF', 
                            borderBottom: '1px solid #EEE',
                            cursor: 'pointer' 
                          }}
                        >
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', fontWeight: 700 }}>{b.billNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.outlet}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.billDate}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.session}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', fontWeight: 600 }}>{b.tableNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', textAlign: 'right', fontWeight: 700 }}>
                            {b.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '3px 6px', color: b.status === 'Settled' ? '#008000' : '#C00', fontWeight: 700 }}>
                            {b.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setActiveBillNo(selectedHelpBillNo);
                    setBillHelpOpen(false);
                  }}
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Select
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setBillHelpOpen(false)}
                  style={{ minWidth: '65px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: CREDIT/DEBIT CARD MODAL (Video 04 Frame 040 & Frame 045) */}
      {cardModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1310 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '450px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.65)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Credit/Debit Card</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setCardModalOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px' }}>
              {/* Tab Bar: 1 2 3 4 5 */}
              <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #7F9DB9', paddingBottom: '2px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(t => (
                  <button 
                    key={t}
                    onClick={() => setCardActiveTab(t)}
                    className="ids-btn"
                    style={{ 
                      padding: '1px 8px', 
                      fontSize: '11px', 
                      fontWeight: cardActiveTab === t ? 700 : 400,
                      background: cardActiveTab === t ? '#FFF' : '#ECE9D8',
                      borderBottom: cardActiveTab === t ? 'none' : '1px solid #7F9DB9'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Swipe card</label>
                  <input 
                    type="text" 
                    placeholder="Swipe card or leave blank"
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Card Type</label>
                  <select 
                    value={cardType} 
                    onChange={e => setCardType(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  >
                    <option value="VISA">VISA</option>
                    <option value="MASTER">MASTER</option>
                    <option value="AMEX">AMEX</option>
                    <option value="RUPAY">RUPAY</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 90px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Credit/Debit Card</label>
                  <select 
                    value={cardProvider} 
                    onChange={e => setCardProvider(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  >
                    {CARD_PROVIDERS.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    readOnly 
                    value={CARD_PROVIDERS.find(c => c.code === cardProvider)?.name || 'State Bank Of India'}
                    style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Card #</label>
                  <input 
                    type="text" 
                    value={cardNo} 
                    onChange={e => setCardNo(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Guest Name</label>
                  <input 
                    type="text" 
                    value={cardGuestName} 
                    onChange={e => setCardGuestName(e.target.value)}
                    placeholder="Name on card"
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Authorization</label>
                  <input 
                    type="text" 
                    value={cardAuth} 
                    onChange={e => setCardAuth(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 70px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Amount</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="INR" 
                    style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }}
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    value={cardAmount} 
                    onChange={e => setCardAmount(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 70px 1fr', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 600 }}>Tips</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="INR" 
                    style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }}
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    value={cardTips} 
                    onChange={e => setCardTips(e.target.value)}
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmCardPayment}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setCardAmount('')}
                  style={{ minWidth: '60px' }}
                >
                  Clear
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setCardModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: CASH MODAL (Video 04 Frame 048) */}
      {cashModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1310 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '360px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.65)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Cash</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setCashModalOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Received</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={cashReceived} 
                  onChange={e => setCashReceived(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Amount</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={cashAmount} 
                  onChange={e => setCashAmount(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Tips</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={cashTips} 
                  onChange={e => setCashTips(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Balance / Change Return calculation */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Balance</label>
                <input 
                  type="text" 
                  readOnly 
                  value={Math.max(0, (parseFloat(cashReceived) || 0) - (parseFloat(cashAmount) || 0)).toFixed(2)}
                  style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Remarks</label>
                <input 
                  type="text" 
                  value={cashRemarks} 
                  onChange={e => setCashRemarks(e.target.value)}
                  placeholder="Optional remarks"
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmCashPayment}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => { setCashReceived(''); setCashAmount(''); }}
                  style={{ minWidth: '60px' }}
                >
                  Clear
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setCashModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: GUEST / ROOM SETTLEMENT (Folio Transfer) */}
      {guestModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1310 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '420px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.65)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Charge to In-House Guest Folio</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setGuestModalOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Room #</label>
                <select 
                  value={guestRoomNo} 
                  onChange={e => {
                    const r = e.target.value;
                    setGuestRoomNo(r);
                    const found = inhouseGuests.find(g => g.roomNo === r);
                    if (found) {
                      setGuestName(found.guestName);
                      setGuestFolioNo(`FOL-${r}-${Math.floor(100 + Math.random() * 899)}`);
                    }
                  }}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  {inhouseGuests.map(g => (
                    <option key={g.roomNo} value={g.roomNo}>Room {g.roomNo} - {g.guestName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Guest Name</label>
                <input 
                  type="text" 
                  readOnly 
                  value={guestName} 
                  style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Folio #</label>
                <input 
                  type="text" 
                  readOnly 
                  value={guestFolioNo} 
                  style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Amount</label>
                <input 
                  type="text" 
                  readOnly 
                  value={`₹${currentBalance.toFixed(2)}`} 
                  style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Remarks</label>
                <input 
                  type="text" 
                  value={guestRemarks} 
                  onChange={e => setGuestRemarks(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmGuestPayment}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Post to Folio
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setGuestModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 5: DISCOUNT MODAL */}
      {discountModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1310 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '320px', 
              background: '#ECE9D8', 
              border: '2px solid #808080', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.65)' 
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '3px 6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Bill Discount</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setDiscountModalOpen(false)} 
                style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Discount %</label>
                <select 
                  value={discPercent} 
                  onChange={e => setDiscPercent(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Reason</label>
                <input 
                  type="text" 
                  value={discReason} 
                  onChange={e => setDiscReason(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const pct = parseFloat(discPercent) || 0;
                    const calculatedDisc = Number(((currentBill.amount * pct) / 100).toFixed(2));
                    setDiscountAmount(calculatedDisc);
                    setDiscountModalOpen(false);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Apply
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => { setDiscountAmount(0); setDiscountModalOpen(false); }}
                  style={{ minWidth: '60px' }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
