import React, { useState } from 'react';
import { HOTEL_CONFIG } from '../../data/hotelData';

// Touch Screen Menu Groups configured from Video 15
const TOUCH_GROUPS = [
  { id: 'ALL', name: 'ALL ITEMS', color: '#0A246A' },
  { id: 'FOOD', name: 'FOOD / MAIN', color: '#B8860B' },
  { id: 'BEVERAGE', name: 'BEVERAGES', color: '#008080' },
  { id: 'BAR', name: 'LIQUOR BAR', color: '#8B0000' },
  { id: 'BREADS', name: 'INDIAN BREADS', color: '#D2691E' },
  { id: 'STARTERS', name: 'STARTERS & TIKKA', color: '#2E8B57' },
  { id: 'DESSERTS', name: 'DESSERTS', color: '#C71585' }
];

// Touch Catalog Items configured from Menu Master (Video 20)
const TOUCH_ITEMS = [
  { code: '1', name: 'Steamed Rice (Full)', group: 'FOOD', price: 90.00, kitchen: 'Main Kitchen' },
  { code: '2', name: 'Tandoori Chicken (Full)', group: 'FOOD', price: 450.00, kitchen: 'Main Kitchen' },
  { code: '3', name: 'Mineral Water 1L', group: 'BEVERAGE', price: 30.00, kitchen: 'Pantry' },
  { code: '4', name: 'Fresh Lime Soda', group: 'BEVERAGE', price: 60.00, kitchen: 'Pantry' },
  { code: '5', name: 'Cold Coffee with Ice Cream', group: 'BEVERAGE', price: 120.00, kitchen: 'Pantry' },
  { code: '8', name: 'Butter Naan', group: 'BREADS', price: 55.00, kitchen: 'Main Kitchen' },
  { code: '9', name: 'Tandoori Roti Butter', group: 'BREADS', price: 35.00, kitchen: 'Main Kitchen' },
  { code: '10', name: 'Garlic Naan', group: 'BREADS', price: 65.00, kitchen: 'Main Kitchen' },
  { code: '12', name: 'Paneer Butter Masala', group: 'FOOD', price: 240.00, kitchen: 'Main Kitchen' },
  { code: '13', name: 'Dal Makhani', group: 'FOOD', price: 190.00, kitchen: 'Main Kitchen' },
  { code: '14', name: 'Chicken Biryani Special', group: 'FOOD', price: 320.00, kitchen: 'Main Kitchen' },
  { code: '15', name: 'Paneer Tikka (6 Pcs)', group: 'STARTERS', price: 260.00, kitchen: 'Main Kitchen' },
  { code: '16', name: 'Crispy Chilli Baby Corn', group: 'STARTERS', price: 210.00, kitchen: 'Main Kitchen' },
  { code: '17', name: 'Chicken 65', group: 'STARTERS', price: 280.00, kitchen: 'Main Kitchen' },
  { code: '101', name: 'Kingfisher Premium 650ml', group: 'BAR', price: 280.00, kitchen: 'Bar Counter' },
  { code: '102', name: 'Budweiser Magnum 650ml', group: 'BAR', price: 330.00, kitchen: 'Bar Counter' },
  { code: '103', name: 'Old Monk Rum 60ml', group: 'BAR', price: 140.00, kitchen: 'Bar Counter' },
  { code: '104', name: 'Blenders Pride Whisky 60ml', group: 'BAR', price: 190.00, kitchen: 'Bar Counter' },
  { code: '201', name: 'Gulab Jamun (2 Pcs)', group: 'DESSERTS', price: 80.00, kitchen: 'Pantry' },
  { code: '202', name: 'Vanilla Ice Cream with Hot Fudge', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' }
];

export default function IdsTouchPosTerminalModal({
  isOpen,
  onClose,
  accountingDate = '08-FEB-2026',
  currentUser = 'MANAGER',
  onKotPunched,
  onBillSettled
}) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedTable, setSelectedTable] = useState('10');
  const [selectedServer, setSelectedServer] = useState('Kaushik');
  const [covers, setCovers] = useState(2);
  const [cart, setCart] = useState([
    { code: '1', name: 'Steamed Rice (Full)', price: 90.00, qty: 2, kitchen: 'Main Kitchen', modifier: '' },
    { code: '2', name: 'Tandoori Chicken (Full)', price: 450.00, qty: 1, kitchen: 'Main Kitchen', modifier: 'spicy' }
  ]);
  const [activeOutlet, setActiveOutlet] = useState('RESTAURANT');
  const [activeSession, setActiveSession] = useState('Dinner');
  const [messagePrompt, setMessagePrompt] = useState(null);

  if (!isOpen) return null;

  const filteredItems = selectedGroup === 'ALL'
    ? TOUCH_ITEMS
    : TOUCH_ITEMS.filter(item => item.group === selectedGroup);

  const handleAddItem = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.code === item.code);
      if (existing) {
        return prev.map(i => i.code === item.code ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, modifier: '' }];
    });
  };

  const handleIncrement = (code) => {
    setCart(prev => prev.map(i => i.code === code ? { ...i, qty: i.qty + 1 } : i));
  };

  const handleDecrement = (code) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.code === code) {
          return { ...i, qty: Math.max(0, i.qty - 1) };
        }
        return i;
      }).filter(i => i.qty > 0);
    });
  };

  const handleRemove = (code) => {
    setCart(prev => prev.filter(i => i.code !== code));
  };

  const handleSetModifier = (code) => {
    const mod = prompt("Enter kitchen instruction / modifier (e.g. less spicy, no onion, extra cheese):");
    if (mod !== null) {
      setCart(prev => prev.map(i => i.code === code ? { ...i, modifier: mod.trim() } : i));
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const rawTotal = subtotal + cgst + sgst;
  const roundOff = Math.round(rawTotal) - rawTotal;
  const grandTotal = Math.round(rawTotal);

  const handlePunchKOT = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please tap items to punch KOT.");
      return;
    }
    const kotId = `KOT-${Math.floor(1000 + Math.random() * 9000)}`;
    setMessagePrompt(`✅ KOT ${kotId} Printed Successfully for Table ${selectedTable} (${covers} Pax) -> Main Kitchen!`);
    if (onKotPunched) {
      onKotPunched({ kotId, tableNo: selectedTable, items: cart, grandTotal });
    }
  };

  const handleFastCashSettle = () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    const billNo = `RES-B-${Math.floor(10000 + Math.random() * 90000)}`;
    setMessagePrompt(`💵 Bill ${billNo} Settled via Fast Cash! Table ${selectedTable} released to Vacant. Total: ₹${grandTotal}`);
    setCart([]);
    if (onBillSettled) {
      onBillSettled({ billNo, tableNo: selectedTable, amount: grandTotal, mode: 'Cash' });
    }
  };

  return (
    <div
      className="ids-modal-overlay"
      style={{
        zIndex: 1450,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px'
      }}
    >
      <div
        className="ids-dialog-window"
        style={{
          width: '1200px',
          maxWidth: '98vw',
          height: '92vh',
          maxHeight: '94vh',
          background: '#2B2B2B',
          border: '3px solid #FFF',
          borderRightColor: '#505050',
          borderBottomColor: '#505050',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          color: '#FFF'
        }}
      >
        {/* Top Titlebar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #0A246A 0%, #1E5799 100%)',
            padding: '6px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #FFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🖥️</span>
            <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.4px' }}>
              Fortune NEXT Touch POS Terminal V7.0 — {activeOutlet} ({activeSession})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#FFD700' }}>
              📅 {accountingDate} | 👤 {currentUser}
            </span>
            <button
              onClick={onClose}
              style={{
                background: '#D9534F',
                border: '1px solid #FFF',
                color: '#FFF',
                fontWeight: 700,
                padding: '2px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* Operational Control Bar */}
        <div
          style={{
            background: '#3A3A3A',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            borderBottom: '1px solid #505050'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <span style={{ color: '#BBB', marginRight: '6px' }}>Table:</span>
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
                style={{ padding: '3px 8px', fontWeight: 700, background: '#FFF', color: '#000', fontSize: '12px' }}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', 'B1', 'B2', 'VIP-1'].map(t => (
                  <option key={t} value={t}>Table {t}</option>
                ))}
              </select>
            </div>

            <div>
              <span style={{ color: '#BBB', marginRight: '6px' }}>Covers (Pax):</span>
              <select
                value={covers}
                onChange={e => setCovers(Number(e.target.value))}
                style={{ padding: '3px 8px', fontWeight: 700, background: '#FFF', color: '#000', fontSize: '12px' }}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(p => (
                  <option key={p} value={p}>{p} Pax</option>
                ))}
              </select>
            </div>

            <div>
              <span style={{ color: '#BBB', marginRight: '6px' }}>Server:</span>
              <select
                value={selectedServer}
                onChange={e => setSelectedServer(e.target.value)}
                style={{ padding: '3px 8px', fontWeight: 700, background: '#FFF', color: '#000', fontSize: '12px' }}
              >
                {['Kaushik', 'Ajay', 'Bijay', 'Rahul', 'Biren'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <span style={{ color: '#BBB', marginRight: '6px' }}>Outlet:</span>
              <select
                value={activeOutlet}
                onChange={e => setActiveOutlet(e.target.value)}
                style={{ padding: '3px 8px', fontWeight: 700, background: '#FFF', color: '#000', fontSize: '12px' }}
              >
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="ROOM SERVICE">ROOM SERVICE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {messagePrompt && (
              <span style={{ background: '#2E7D32', color: '#FFF', padding: '3px 10px', borderRadius: '3px', fontWeight: 600 }}>
                {messagePrompt}
              </span>
            )}
          </div>
        </div>

        {/* Main Workspace (Grid 3 Columns) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Categories Column (Touch Screen Groups) */}
          <div
            style={{
              width: '180px',
              background: '#222',
              borderRight: '2px solid #505050',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontSize: '11px', color: '#AAA', fontWeight: 700, paddingLeft: '4px', textTransform: 'uppercase' }}>
              Touch Groups
            </div>
            {TOUCH_GROUPS.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                style={{
                  background: selectedGroup === g.id ? '#FFF' : g.color,
                  color: selectedGroup === g.id ? '#000' : '#FFF',
                  border: selectedGroup === g.id ? '3px solid #FFD700' : '2px solid #FFF',
                  borderRightColor: '#333',
                  borderBottomColor: '#333',
                  padding: '12px 6px',
                  fontWeight: 700,
                  fontSize: '11px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  boxShadow: selectedGroup === g.id ? '0 0 10px rgba(255,215,0,0.8)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Center Items Grid */}
          <div
            style={{
              flex: 1,
              background: '#1E1E1E',
              padding: '10px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gridAutoRows: '95px',
              gap: '8px'
            }}
          >
            {filteredItems.map(item => (
              <button
                key={item.code}
                onClick={() => handleAddItem(item)}
                style={{
                  background: '#2D3748',
                  border: '2px solid #4A5568',
                  borderRadius: '6px',
                  color: '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '8px 6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  transition: 'transform 0.1s, background 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontWeight: 700, fontSize: '11px', lineHeight: '14px' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#A0AEC0' }}>#{item.code}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#48BB78' }}>
                    ₹{item.price.toFixed(0)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Ticket / Cart Pane */}
          <div
            style={{
              width: '380px',
              background: '#ECE9D8',
              borderLeft: '2px solid #505050',
              display: 'flex',
              flexDirection: 'column',
              color: '#000'
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                background: '#0A246A',
                color: '#FFF',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>RUNNING TICKET: TBL {selectedTable}</span>
              <span>{cart.length} ITEMS</span>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '12px' }}>
                  Tap items from center grid to add to order
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {cart.map(item => (
                    <div
                      key={item.code}
                      style={{
                        background: '#FFF',
                        border: '1px solid #7F9DB9',
                        padding: '4px 6px',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#0A246A' }}>{item.name}</span>
                        <span style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>

                      {/* Modifier instruction */}
                      {item.modifier ? (
                        <div style={{ color: '#D97706', fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>
                          ↳ Mod: {item.modifier}
                        </div>
                      ) : null}

                      {/* Qty & Action Controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <button
                          onClick={() => handleSetModifier(item.code)}
                          style={{
                            background: '#FFF3CD',
                            border: '1px solid #FFEBAA',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            cursor: 'pointer'
                          }}
                        >
                          + Modifier
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleDecrement(item.code)}
                            style={{ width: '22px', height: '20px', fontWeight: 800, background: '#ECE9D8', border: '1px solid #716F64', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                          <button
                            onClick={() => handleIncrement(item.code)}
                            style={{ width: '22px', height: '20px', fontWeight: 800, background: '#ECE9D8', border: '1px solid #716F64', cursor: 'pointer' }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemove(item.code)}
                            style={{ marginLeft: '4px', background: '#F8D7DA', border: '1px solid #F5C6CB', color: '#721C24', fontSize: '10px', cursor: 'pointer', padding: '1px 4px' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Billing Summary Footer */}
            <div style={{ background: '#E0DFD8', borderTop: '2px solid #716F64', padding: '8px 10px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Sub Total:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
                <span>CGST (2.5%) + SGST (2.5%):</span>
                <span>₹{(cgst + sgst).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#777' }}>
                <span>Round Off:</span>
                <span>{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #716F64', paddingTop: '4px', fontSize: '14px', fontWeight: 800, color: '#0A246A' }}>
                <span>TOTAL PAYABLE:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* Big Touch Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={handlePunchKOT}
                  style={{
                    background: '#0A246A',
                    color: '#FFF',
                    border: '2px solid #FFF',
                    borderRightColor: '#001040',
                    borderBottomColor: '#001040',
                    padding: '8px 4px',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  🖨️ Punch KOT
                </button>
                <button
                  onClick={handleFastCashSettle}
                  style={{
                    background: '#2E7D32',
                    color: '#FFF',
                    border: '2px solid #FFF',
                    borderRightColor: '#1B5E20',
                    borderBottomColor: '#1B5E20',
                    padding: '8px 4px',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  💵 Fast Cash Settle
                </button>
                <button
                  onClick={() => setCart([])}
                  style={{
                    background: '#C0C0C0',
                    color: '#000',
                    border: '2px solid #FFF',
                    borderRightColor: '#666',
                    borderBottomColor: '#666',
                    padding: '6px 4px',
                    fontWeight: 600,
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  Clear Cart
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#D9534F',
                    color: '#FFF',
                    border: '2px solid #FFF',
                    borderRightColor: '#800',
                    borderBottomColor: '#800',
                    padding: '6px 4px',
                    fontWeight: 700,
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  Exit Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
