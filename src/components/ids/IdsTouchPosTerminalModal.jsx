import React, { useState } from 'react';
import { HOTEL_CONFIG } from '../../data/hotelData';

// Touch Screen Menu Groups configured from Official Hotel Elite Inn Menu Card
const TOUCH_GROUPS = [
  { id: 'ALL', name: 'ALL ITEMS', color: '#0A246A' },
  { id: 'BEVERAGE', name: 'BEVERAGES & SHAKES', color: '#008080' },
  { id: 'BREAKFAST', name: 'BREAKFAST & DOSAS', color: '#E65100' },
  { id: 'STARTERS', name: 'KEBABS & STARTERS', color: '#2E8B57' },
  { id: 'MAIN', name: 'MAIN COURSE CURRIES', color: '#B8860B' },
  { id: 'BREADS', name: 'INDIAN BREADS & ROTI', color: '#D2691E' },
  { id: 'RICE', name: 'BASMATI RICE & BIRYANI', color: '#4A148C' },
  { id: 'CONTINENTAL', name: 'PASTA & SIZZLERS', color: '#1B5E20' },
  { id: 'DESSERTS', name: 'SWEET MEMORIES', color: '#C71585' }
];

// Touch Catalog Items configured directly from Official Hotel Elite Inn Menu Card
const TOUCH_ITEMS = [
  // Beverages & Mocktails
  { code: 'BEV-01', name: 'Tea', group: 'BEVERAGE', price: 25.00, kitchen: 'Pantry' },
  { code: 'BEV-02', name: 'Black Tea', group: 'BEVERAGE', price: 20.00, kitchen: 'Pantry' },
  { code: 'BEV-03', name: 'Lemon Tea', group: 'BEVERAGE', price: 25.00, kitchen: 'Pantry' },
  { code: 'BEV-04', name: 'Green Tea', group: 'BEVERAGE', price: 30.00, kitchen: 'Pantry' },
  { code: 'BEV-05', name: 'Coffee', group: 'BEVERAGE', price: 35.00, kitchen: 'Pantry' },
  { code: 'BEV-06', name: 'Black Coffee', group: 'BEVERAGE', price: 40.00, kitchen: 'Pantry' },
  { code: 'BEV-07', name: 'Hot & Cold Milk', group: 'BEVERAGE', price: 60.00, kitchen: 'Pantry' },
  { code: 'BEV-08', name: 'Choice of Lassi', group: 'BEVERAGE', price: 60.00, kitchen: 'Pantry' },
  { code: 'BEV-09', name: 'Cold Coffee with Ice Cream', group: 'BEVERAGE', price: 90.00, kitchen: 'Pantry' },
  { code: 'BEV-10', name: 'Butter Milk', group: 'BEVERAGE', price: 50.00, kitchen: 'Pantry' },
  { code: 'BEV-11', name: 'Fresh Lime Water / Soda', group: 'BEVERAGE', price: 40.00, kitchen: 'Pantry' },
  { code: 'MOCK-01', name: 'Pina Colada', group: 'BEVERAGE', price: 80.00, kitchen: 'Pantry' },
  { code: 'MOCK-02', name: 'Virgin Mojito', group: 'BEVERAGE', price: 100.00, kitchen: 'Pantry' },
  { code: 'MOCK-03', name: 'Blue Lagoon', group: 'BEVERAGE', price: 120.00, kitchen: 'Pantry' },
  { code: 'MOCK-04', name: 'Choice of Shake', group: 'BEVERAGE', price: 130.00, kitchen: 'Pantry' },

  // Breakfast & Dosas
  { code: 'BF-01', name: 'Special Maggi', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-02', name: 'Idly with Sambhar Chutney', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-03', name: 'Sambhar Vada', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-04', name: 'Plain Dosa', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-05', name: 'Masala Dosa', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-06', name: 'Gini Dosa', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-07', name: 'Mysore Masala Dosa', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-08', name: 'Ghee Podi Masala Dosa', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-09', name: 'Upma', group: 'BREAKFAST', price: 60.00, kitchen: 'Main Kitchen' },
  { code: 'BF-10', name: 'Uttapam', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-11', name: 'Rawa Masala Dosa', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-12', name: 'Special Poha', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-13', name: 'Poori Bhaji', group: 'BREAKFAST', price: 140.00, kitchen: 'Main Kitchen' },
  { code: 'BF-14', name: 'Chholey Bhature', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-15', name: 'Aloo Paratha with Curd', group: 'BREAKFAST', price: 110.00, kitchen: 'Main Kitchen' },
  { code: 'BF-16', name: 'Paneer Paratha with Curd', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-17', name: 'Veg Grilled Sandwich', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-18', name: 'Bread Omelette', group: 'BREAKFAST', price: 110.00, kitchen: 'Main Kitchen' },
  { code: 'BF-19', name: 'Chicken Sandwich', group: 'BREAKFAST', price: 200.00, kitchen: 'Main Kitchen' },

  // Starters & Kebabs
  { code: 'ST-01', name: 'Hara Bhara Kebab', group: 'STARTERS', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'ST-02', name: 'Paneer Pakoda', group: 'STARTERS', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'ST-03', name: 'Paneer Tikka', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'ST-04', name: 'Paneer Hariyali Tikka', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'ST-05', name: 'Chana Roast', group: 'STARTERS', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'ST-06', name: 'Finger Chips', group: 'STARTERS', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'ST-07', name: 'Mushroom Pakoda', group: 'STARTERS', price: 180.00, kitchen: 'Main Kitchen' },
  { code: 'ST-08', name: 'Tandoori Platter (Veg)', group: 'STARTERS', price: 650.00, kitchen: 'Main Kitchen' },
  { code: 'NST-01', name: 'Chicken Pakoda', group: 'STARTERS', price: 220.00, kitchen: 'Main Kitchen' },
  { code: 'NST-02', name: 'Chicken Amritsari (Fry)', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'NST-03', name: 'Chicken Tikka', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-04', name: 'Chicken Banjara Tikka', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-05', name: 'Chicken Malai Tikka', group: 'STARTERS', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'NST-06', name: 'Chicken Afghani Tikka', group: 'STARTERS', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'NST-07', name: 'Chicken Reshmi Kebab', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-08', name: 'Chicken Tangdi Kebab', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },

  // Main Course Curries
  { code: 'MC-01', name: 'Chicken Masala', group: 'MAIN', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'MC-02', name: 'Chicken Kadai', group: 'MAIN', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'MC-03', name: 'Chicken Hyderabadi', group: 'MAIN', price: 290.00, kitchen: 'Main Kitchen' },
  { code: 'MC-04', name: 'Chicken Rara', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-05', name: 'Chicken Bharta', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-06', name: 'Chicken Butter Masala', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-07', name: 'Chicken Tikka Masala', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-08', name: 'Butter Chicken Boneless', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-09', name: 'Murg Mussallam (Half)', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-10', name: 'Fish Curry (B/L)', group: 'MAIN', price: 270.00, kitchen: 'Main Kitchen' },
  { code: 'MC-11', name: 'Prawns Masala', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-12', name: 'Mutton Curry', group: 'MAIN', price: 380.00, kitchen: 'Main Kitchen' },
  { code: 'MC-13', name: 'Mutton Rogan Josh', group: 'MAIN', price: 380.00, kitchen: 'Main Kitchen' },
  { code: 'MC-14', name: 'Champaran Meat', group: 'MAIN', price: 500.00, kitchen: 'Main Kitchen' },
  { code: 'MC-15', name: 'Dal Fry', group: 'MAIN', price: 130.00, kitchen: 'Main Kitchen' },
  { code: 'MC-16', name: 'Dal Tadka', group: 'MAIN', price: 140.00, kitchen: 'Main Kitchen' },

  // Indian Breads
  { code: 'BRD-01', name: 'Tawa Roti', group: 'BREADS', price: 25.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-02', name: 'Butter Tawa Roti', group: 'BREADS', price: 25.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-03', name: 'Tandoori Roti', group: 'BREADS', price: 30.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-04', name: 'Butter Tandoori Roti', group: 'BREADS', price: 35.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-05', name: 'Rumali Roti', group: 'BREADS', price: 40.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-06', name: 'Plain Naan', group: 'BREADS', price: 40.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-07', name: 'Butter Naan', group: 'BREADS', price: 45.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-08', name: 'Garlic Naan', group: 'BREADS', price: 55.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-09', name: 'Masala Kulcha', group: 'BREADS', price: 55.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-10', name: 'Paneer Kulcha', group: 'BREADS', price: 70.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-11', name: 'Roti Basket', group: 'BREADS', price: 350.00, kitchen: 'Main Kitchen' },

  // Basmati Rice & Biryani
  { code: 'RC-01', name: 'Plain Rice (Basmati)', group: 'RICE', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'RC-02', name: 'Jeera Rice', group: 'RICE', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'RC-03', name: 'Veg Biryani', group: 'RICE', price: 210.00, kitchen: 'Main Kitchen' },
  { code: 'RC-04', name: 'Veg Pulao', group: 'RICE', price: 210.00, kitchen: 'Main Kitchen' },
  { code: 'RC-05', name: 'Curd Rice', group: 'RICE', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'RC-06', name: 'Egg Biryani', group: 'RICE', price: 180.00, kitchen: 'Main Kitchen' },
  { code: 'RC-07', name: 'Chicken Dum Biryani', group: 'RICE', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'RC-08', name: 'Chicken Hyderabadi Biryani', group: 'RICE', price: 270.00, kitchen: 'Main Kitchen' },
  { code: 'RC-09', name: 'Chicken Tikka Biryani', group: 'RICE', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'RC-10', name: 'Mutton Biryani', group: 'RICE', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'RC-11', name: 'Mutton Handi Biryani', group: 'RICE', price: 400.00, kitchen: 'Main Kitchen' },

  // Continental & Pastas
  { code: 'CT-01', name: 'White Sauce Pasta Veg', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-02', name: 'Red Sauce Pasta Veg', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-03', name: 'White Sauce Chicken Pasta', group: 'CONTINENTAL', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'CT-04', name: 'Veg Mix Grilled Sizzler', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-05', name: 'Chicken Tikka Sizzler', group: 'CONTINENTAL', price: 400.00, kitchen: 'Main Kitchen' },

  // Sweet Memories (Desserts)
  { code: 'DES-01', name: 'Fresh Fruit Platter', group: 'DESSERTS', price: 200.00, kitchen: 'Pantry' },
  { code: 'DES-02', name: 'Hot Gulab Jamun', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' },
  { code: 'DES-03', name: 'Rice Kheer', group: 'DESSERTS', price: 90.00, kitchen: 'Pantry' },
  { code: 'DES-04', name: 'Hot Gulab Jamun with Ice-Cream', group: 'DESSERTS', price: 150.00, kitchen: 'Pantry' },
  { code: 'DES-05', name: 'Vanilla Ice-Cream', group: 'DESSERTS', price: 80.00, kitchen: 'Pantry' },
  { code: 'DES-06', name: 'Vanilla with Hot Chocolate Sauce', group: 'DESSERTS', price: 150.00, kitchen: 'Pantry' },
  { code: 'DES-07', name: 'Kesar Pista', group: 'DESSERTS', price: 100.00, kitchen: 'Pantry' },
  { code: 'DES-08', name: 'Butter Scotch', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' },
  { code: 'DES-09', name: 'Chocolate Ice-Cream', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' }
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
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [selectedServer, setSelectedServer] = useState('Kaushik');
  const [covers, setCovers] = useState(2);
  const [cart, setCart] = useState([
    { code: 'RC-01', name: 'Plain Rice (Basmati)', price: 100.00, qty: 2, kitchen: 'Main Kitchen', modifier: '' },
    { code: 'MC-06', name: 'Chicken Butter Masala', price: 320.00, qty: 1, kitchen: 'Main Kitchen', modifier: 'Medium Spicy' }
  ]);
  const [activeOutlet, setActiveOutlet] = useState('RESTAURANT');
  const [activeSession, setActiveSession] = useState('Dinner');
  const [messagePrompt, setMessagePrompt] = useState(null);

  if (!isOpen) return null;

  const filteredItems = selectedGroup === 'ALL'
    ? TOUCH_ITEMS
    : TOUCH_ITEMS.filter(item => item.group === selectedGroup);

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cgst = subTotal * 0.025; // 2.5% CGST
  const sgst = subTotal * 0.025; // 2.5% SGST
  const grandTotal = Math.round(subTotal + cgst + sgst);

  const handleAddItem = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.code === item.code);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { ...item, qty: 1, modifier: '' }];
    });
  };

  const handleUpdateQty = (code, delta) => {
    setCart(prev => {
      return prev.map(p => {
        if (p.code === code) {
          const newQty = p.qty + delta;
          return newQty > 0 ? { ...p, qty: newQty } : null;
        }
        return p;
      }).filter(Boolean);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePunchKot = () => {
    if (cart.length === 0) {
      setMessagePrompt("Cannot punch KOT: Cart is empty!");
      return;
    }
    const kotId = Math.floor(1000 + Math.random() * 9000);
    if (onKotPunched) {
      onKotPunched({
        kotId,
        tableNo: selectedTable,
        server: selectedServer,
        covers,
        items: cart,
        outlet: activeOutlet,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    setMessagePrompt(`✅ KOT #${kotId} punched successfully to Main Kitchen for Table ${selectedTable}!`);
    setCart([]);
  };

  const handlePrintBill = () => {
    if (cart.length === 0) {
      setMessagePrompt("Cannot print bill: Cart is empty!");
      return;
    }
    const billId = Math.floor(2000 + Math.random() * 8000);
    if (onBillSettled) {
      onBillSettled({
        billId,
        tableNo: selectedTable,
        grandTotal,
        items: cart,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    setMessagePrompt(`🧾 Bill #${billId} generated: ₹${grandTotal.toFixed(2)} (Table ${selectedTable})`);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '980px', 
          height: '680px', 
          display: 'flex', 
          flexDirection: 'column',
          background: '#D4D0C8' 
        }}
      >
        {/* Title Bar */}
        <div className="ids-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Touch Screen POS Terminal V7.0 — {HOTEL_CONFIG.name} ({activeOutlet})</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Top Control Bar */}
        <div style={{ padding: '6px 10px', background: '#ECE9D8', borderBottom: '1px solid #716F64', display: 'flex', gap: '15px', alignItems: 'center', fontSize: '11px' }}>
          <div>
            <strong>Outlet:</strong>{' '}
            <select className="ids-select" value={activeOutlet} onChange={e => setActiveOutlet(e.target.value)}>
              <option value="RESTAURANT">RESTAURANT (Dine-in)</option>
              <option value="ROOM SERVICE">ROOM SERVICE (POS 5)</option>
              <option value="BANQUET">BANQUET HALL</option>
            </select>
          </div>
          <div>
            <strong>Table No.:</strong>{' '}
            <select className="ids-select" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
              {['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08', 'T-09', 'T-10', 'T-11', 'T-12'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <strong>Steward:</strong>{' '}
            <select className="ids-select" value={selectedServer} onChange={e => setSelectedServer(e.target.value)}>
              <option value="Kaushik">Kaushik</option>
              <option value="Ajay">Ajay</option>
              <option value="Bijay">Bijay</option>
              <option value="Ranjan">Ranjan</option>
            </select>
          </div>
          <div>
            <strong>Covers:</strong>{' '}
            <input 
              type="number" 
              className="ids-input" 
              value={covers} 
              onChange={e => setCovers(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '45px', textAlign: 'center' }} 
            />
          </div>
          <div style={{ marginLeft: 'auto', color: '#0A246A', fontWeight: 700 }}>
            Session: {activeSession} | Date: {accountingDate} | User: {currentUser}
          </div>
        </div>

        {/* Main Work Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Column: Menu Groups + Item Grid (65% width) */}
          <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #716F64', background: '#F0EFEA' }}>
            
            {/* Group Filter Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', padding: '6px', background: '#D4D0C8', borderBottom: '1px solid #716F64' }}>
              {TOUCH_GROUPS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  style={{
                    background: selectedGroup === g.id ? g.color : '#E0DFD8',
                    color: selectedGroup === g.id ? '#FFF' : '#000',
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '5px 8px',
                    border: '1px solid #716F64',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    boxShadow: selectedGroup === g.id ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '1px 1px 0 #FFF'
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Touch Item Tiles */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', alignContent: 'start' }}>
              {filteredItems.map(item => (
                <div
                  key={item.code}
                  onClick={() => handleAddItem(item)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    padding: '8px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '68px',
                    boxShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    transition: 'transform 0.05s'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#000', lineHeight: '1.2' }}>{item.name}</div>
                    <div style={{ fontSize: '9.5px', color: '#666' }}>{item.kitchen}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#888' }}>{item.code}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#B8860B' }}>₹{item.price.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Bill & KOT Cart (35% width) */}
          <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', background: '#FFF', borderLeft: '1px solid #FFF' }}>
            
            {/* Cart Header */}
            <div style={{ padding: '8px 10px', background: '#0A246A', color: '#FFF', fontWeight: 700, fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>CURRENT ORDER — {selectedTable}</span>
              <span>{cart.length} ITEMS</span>
            </div>

            {/* Cart Items Table */}
            <div style={{ flex: 1, overflowY: 'auto', borderBottom: '1px solid #CCC' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ background: '#ECE9D8', borderBottom: '1px solid #716F64', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '4px', textAlign: 'center', width: '40px' }}>Qty</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '55px' }}>Price</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '60px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px 10px', color: '#888' }}>
                        Cart is empty.<br />Tap any menu item on the left to add.
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.code} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '4px 6px' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          {item.modifier && <div style={{ fontSize: '9.5px', color: '#E65100' }}>• {item.modifier}</div>}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                            <button 
                              onClick={() => handleUpdateQty(item.code, -1)}
                              style={{ width: '16px', height: '16px', padding: 0, fontSize: '10px', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 700, minWidth: '14px' }}>{item.qty}</span>
                            <button 
                              onClick={() => handleUpdateQty(item.code, 1)}
                              style={{ width: '16px', height: '16px', padding: 0, fontSize: '10px', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', color: '#555' }}>
                          {item.price.toFixed(2)}
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                          {(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bill Calculation Totals */}
            <div style={{ padding: '8px 12px', background: '#ECE9D8', borderTop: '1px solid #CCC', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Sub Total:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
                <span>CGST (2.5%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#555' }}>
                <span>SGST (2.5%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', borderTop: '1px solid #716F64', paddingTop: '4px', color: '#0A246A' }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '8px 10px', background: '#D4D0C8', borderTop: '1px solid #716F64', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button 
                onClick={handlePunchKot}
                className="ids-btn-classic" 
                style={{ background: '#2E8B57', color: '#FFF', fontWeight: 700, padding: '8px 0', fontSize: '11.5px', cursor: 'pointer' }}
              >
                PUNCH KOT
              </button>
              <button 
                onClick={handlePrintBill}
                className="ids-btn-classic" 
                style={{ background: '#0A246A', color: '#FFF', fontWeight: 700, padding: '8px 0', fontSize: '11.5px', cursor: 'pointer' }}
              >
                PRINT BILL
              </button>
              <button 
                onClick={handleClearCart}
                className="ids-btn-classic" 
                style={{ background: '#B22222', color: '#FFF', fontWeight: 700, padding: '8px 0', fontSize: '11.5px', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            </div>

          </div>

        </div>

        {/* Status / Message Bar */}
        {messagePrompt && (
          <div style={{ padding: '6px 12px', background: '#FFF7CC', borderTop: '1px solid #E6B800', fontSize: '11.5px', fontWeight: 700, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{messagePrompt}</span>
            <button 
              onClick={() => setMessagePrompt(null)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
