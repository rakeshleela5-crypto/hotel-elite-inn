import React, { useState } from 'react';
import './idsFortuneNext.css';

export default function IdsHkInventoryModal({
  isOpen,
  onClose,
  initialTab = 'master', // 'master' | 'issue' | 'return'
  accountingDate = '27-JAN-2022',
  onOpenMessageBox
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // 1. HK Inventory Master Catalog
  const [inventoryItems, setInventoryItems] = useState([
    { code: 'HK-LIN-001', name: 'Bed Sheet King White', category: 'Linen', unit: 'Pcs', parStock: 120, currentStock: 85, soiledStock: 25 },
    { code: 'HK-LIN-002', name: 'Bath Towel 650 GSM', category: 'Linen', unit: 'Pcs', parStock: 150, currentStock: 90, soiledStock: 45 },
    { code: 'HK-LIN-003', name: 'Hand Towel Cotton', category: 'Linen', unit: 'Pcs', parStock: 150, currentStock: 110, soiledStock: 30 },
    { code: 'HK-LIN-004', name: 'Pillow Cover Satin Stripe', category: 'Linen', unit: 'Pcs', parStock: 240, currentStock: 180, soiledStock: 40 },
    { code: 'HK-LIN-005', name: 'Luxury Cotton Bathrobe', category: 'Linen', unit: 'Pcs', parStock: 60, currentStock: 42, soiledStock: 12 },
    { code: 'HK-AMN-001', name: 'Herbal Shampoo 30ml', category: 'Guest Amenity', unit: 'Bottles', parStock: 500, currentStock: 340, soiledStock: 0 },
    { code: 'HK-AMN-002', name: 'Body Moisturizer 30ml', category: 'Guest Amenity', unit: 'Bottles', parStock: 500, currentStock: 380, soiledStock: 0 },
    { code: 'HK-AMN-003', name: 'Dental Kit Biodegradable', category: 'Guest Amenity', unit: 'Sets', parStock: 400, currentStock: 260, soiledStock: 0 },
    { code: 'HK-AMN-004', name: 'Shaving Kit Twin Blade', category: 'Guest Amenity', unit: 'Sets', parStock: 300, currentStock: 210, soiledStock: 0 },
    { code: 'HK-CHM-001', name: 'R2 Surface Cleaner Taski', category: 'Chemical', unit: 'Liters', parStock: 50, currentStock: 32, soiledStock: 0 }
  ]);

  // 2. Issue Transactions
  const [issueLogs, setIssueLogs] = useState([
    { issueId: 'ISS-2022-041', date: '27-JAN-2022', floor: 'FL-02 (2nd Floor Trolley)', attendant: '006 Tejnur Borah', item: 'Bath Towel 650 GSM', qty: 24, shift: 'Morning' },
    { issueId: 'ISS-2022-042', date: '27-JAN-2022', floor: 'FL-03 (3rd Floor Trolley)', attendant: '002 Dhonsing Terang', item: 'Bed Sheet King White', qty: 16, shift: 'Morning' }
  ]);

  // 3. Return Transactions
  const [returnLogs, setReturnLogs] = useState([
    { returnId: 'RET-2022-022', date: '26-JAN-2022', floor: 'FL-02 (2nd Floor Trolley)', attendant: '006 Tejnur Borah', item: 'Bath Towel 650 GSM', cleanRet: 4, soiledRet: 20, damaged: 0 },
    { returnId: 'RET-2022-023', date: '26-JAN-2022', floor: 'FL-03 (3rd Floor Trolley)', attendant: '002 Dhonsing Terang', item: 'Bed Sheet King White', cleanRet: 2, soiledRet: 14, damaged: 1 }
  ]);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    floor: 'FL-02 (2nd Floor Trolley)',
    attendant: '006 Tejnur Borah',
    itemCode: 'HK-LIN-002',
    qty: 12,
    shift: 'Morning'
  });

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    floor: 'FL-02 (2nd Floor Trolley)',
    attendant: '006 Tejnur Borah',
    itemCode: 'HK-LIN-002',
    cleanRet: 2,
    soiledRet: 10,
    damaged: 0
  });

  if (!isOpen) return null;

  const handleSaveIssue = () => {
    const selectedItem = inventoryItems.find(i => i.code === issueForm.itemCode) || inventoryItems[0];
    const newIssue = {
      issueId: `ISS-2022-${String(issueLogs.length + 43).padStart(3, '0')}`,
      date: accountingDate,
      floor: issueForm.floor,
      attendant: issueForm.attendant,
      item: selectedItem.name,
      qty: Number(issueForm.qty),
      shift: issueForm.shift
    };

    setIssueLogs([newIssue, ...issueLogs]);

    // Deduct from current stock
    setInventoryItems(inventoryItems.map(item => {
      if (item.code === issueForm.itemCode) {
        return { ...item, currentStock: Math.max(0, item.currentStock - Number(issueForm.qty)) };
      }
      return item;
    }));

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'HK Issue Entry Saved',
        message: `${newIssue.qty} ${selectedItem.unit} of '${selectedItem.name}' issued to ${newIssue.floor}. Current stock updated.`,
        type: 'info'
      });
    }
  };

  const handleSaveReturn = () => {
    const selectedItem = inventoryItems.find(i => i.code === returnForm.itemCode) || inventoryItems[0];
    const newReturn = {
      returnId: `RET-2022-${String(returnLogs.length + 24).padStart(3, '0')}`,
      date: accountingDate,
      floor: returnForm.floor,
      attendant: returnForm.attendant,
      item: selectedItem.name,
      cleanRet: Number(returnForm.cleanRet),
      soiledRet: Number(returnForm.soiledRet),
      damaged: Number(returnForm.damaged)
    };

    setReturnLogs([newReturn, ...returnLogs]);

    // Restore clean to stock, soiled to soiled pool
    setInventoryItems(inventoryItems.map(item => {
      if (item.code === returnForm.itemCode) {
        return { 
          ...item, 
          currentStock: item.currentStock + Number(returnForm.cleanRet),
          soiledStock: item.soiledStock + Number(returnForm.soiledRet)
        };
      }
      return item;
    }));

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'HK Issue Return Saved',
        message: `Linen return processed for ${selectedItem.name}: Clean=${newReturn.cleanRet}, Soiled=${newReturn.soiledRet}, Damaged=${newReturn.damaged}.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '780px', 
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
          <span>Housekeeping Linen & Inventory Suite V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* 3 Departmental Sub-Tabs matching Menu Hierarchy */}
        <div style={{ display: 'flex', background: '#ECE9D8', borderBottom: '1px solid #716F64', padding: '6px 12px 0 12px', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('master')}
            style={{ 
              padding: '4px 14px', 
              fontSize: '11px', 
              fontWeight: activeTab === 'master' ? 'bold' : 'normal',
              background: activeTab === 'master' ? '#FFF' : '#ECE9D8',
              border: '1px solid #716F64',
              borderBottom: activeTab === 'master' ? '1px solid #FFF' : '1px solid #716F64',
              cursor: 'pointer'
            }}
          >
            📦 HK Inventory Master
          </button>
          <button 
            onClick={() => setActiveTab('issue')}
            style={{ 
              padding: '4px 14px', 
              fontSize: '11px', 
              fontWeight: activeTab === 'issue' ? 'bold' : 'normal',
              background: activeTab === 'issue' ? '#FFF' : '#ECE9D8',
              border: '1px solid #716F64',
              borderBottom: activeTab === 'issue' ? '1px solid #FFF' : '1px solid #716F64',
              cursor: 'pointer'
            }}
          >
            📋 HK Issue Entry
          </button>
          <button 
            onClick={() => setActiveTab('return')}
            style={{ 
              padding: '4px 14px', 
              fontSize: '11px', 
              fontWeight: activeTab === 'return' ? 'bold' : 'normal',
              background: activeTab === 'return' ? '#FFF' : '#ECE9D8',
              border: '1px solid #716F64',
              borderBottom: activeTab === 'return' ? '1px solid #FFF' : '1px solid #716F64',
              cursor: 'pointer'
            }}
          >
            🔄 HK Issue Return
          </button>
        </div>

        {/* Tab 1: Inventory Master */}
        {activeTab === 'master' && (
          <div style={{ padding: '14px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#0A246A' }}>Central Linen Room & Guest Amenities Stock Status</span>
              <span style={{ fontSize: '10px', color: '#666' }}>Accounting Date: {accountingDate}</span>
            </div>

            <div style={{ maxHeight: '260px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Item Code</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Item Description</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Category</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'center' }}>Unit</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'right' }}>Par Stock</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'right' }}>Clean Stock</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Soiled / Wash</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{item.code}</td>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{item.name}</td>
                      <td style={{ padding: '4px' }}>{item.category}</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{item.parStock}</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold', color: item.currentStock < (item.parStock * 0.4) ? '#C00' : '#008000' }}>{item.currentStock}</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: item.soiledStock > 0 ? '#E65100' : '#333' }}>{item.soiledStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button onClick={() => alert("Reorder Purchase Indent generated for low stock items.")} className="ids-btn" style={{ padding: '3px 14px' }}>Generate Purchase Indent</button>
              <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '3px 14px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Tab 2: Issue Entry */}
        {activeTab === 'issue' && (
          <div style={{ padding: '14px', fontSize: '11px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Floor Trolley</label>
                  <select 
                    value={issueForm.floor} 
                    onChange={(e) => setIssueForm({ ...issueForm, floor: e.target.value })}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                  >
                    <option value="FL-02 (2nd Floor Trolley)">FL-02 (2nd Floor Trolley)</option>
                    <option value="FL-03 (3rd Floor Trolley)">FL-03 (3rd Floor Trolley)</option>
                    <option value="FL-04 (4th Floor Trolley)">FL-04 (4th Floor Trolley)</option>
                    <option value="FL-05 (5th Floor Trolley)">FL-05 (5th Floor Trolley)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Attendant</label>
                  <input type="text" value={issueForm.attendant} onChange={(e) => setIssueForm({ ...issueForm, attendant: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
                  <label style={{ width: '90px' }}>Select Item</label>
                  <select 
                    value={issueForm.itemCode} 
                    onChange={(e) => setIssueForm({ ...issueForm, itemCode: e.target.value })}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                  >
                    {inventoryItems.map(item => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code}) - Avail: {item.currentStock} {item.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Issue Quantity</label>
                  <input type="number" value={issueForm.qty} onChange={(e) => setIssueForm({ ...issueForm, qty: e.target.value })} style={{ width: '70px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Shift</label>
                  <select value={issueForm.shift} onChange={(e) => setIssueForm({ ...issueForm, shift: e.target.value })} style={{ width: '100px', padding: '2px', border: '1px solid #7F9DB9' }}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={handleSaveIssue} className="ids-btn" style={{ padding: '3px 14px', fontWeight: 'bold' }}>Post Issue</button>
              </div>
            </div>

            {/* Issued Logs Table */}
            <div style={{ maxHeight: '140px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Issue#</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Date</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Floor Trolley</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Attendant</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Item</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {issueLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{log.issueId}</td>
                      <td style={{ padding: '4px' }}>{log.date}</td>
                      <td style={{ padding: '4px' }}>{log.floor}</td>
                      <td style={{ padding: '4px' }}>{log.attendant}</td>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{log.item}</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{log.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '3px 14px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Tab 3: Issue Return */}
        {activeTab === 'return' && (
          <div style={{ padding: '14px', fontSize: '11px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>From Trolley</label>
                  <select 
                    value={returnForm.floor} 
                    onChange={(e) => setReturnForm({ ...returnForm, floor: e.target.value })}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                  >
                    <option value="FL-02 (2nd Floor Trolley)">FL-02 (2nd Floor Trolley)</option>
                    <option value="FL-03 (3rd Floor Trolley)">FL-03 (3rd Floor Trolley)</option>
                    <option value="FL-04 (4th Floor Trolley)">FL-04 (4th Floor Trolley)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Attendant</label>
                  <input type="text" value={returnForm.attendant} onChange={(e) => setReturnForm({ ...returnForm, attendant: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
                  <label style={{ width: '90px' }}>Return Item</label>
                  <select 
                    value={returnForm.itemCode} 
                    onChange={(e) => setReturnForm({ ...returnForm, itemCode: e.target.value })}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                  >
                    {inventoryItems.filter(i => i.category === 'Linen').map(item => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Clean Returned</label>
                  <input type="number" value={returnForm.cleanRet} onChange={(e) => setReturnForm({ ...returnForm, cleanRet: e.target.value })} style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', color: '#008000', fontWeight: 'bold' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Soiled Returned</label>
                  <input type="number" value={returnForm.soiledRet} onChange={(e) => setReturnForm({ ...returnForm, soiledRet: e.target.value })} style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', color: '#E65100', fontWeight: 'bold' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Damaged / Torn</label>
                  <input type="number" value={returnForm.damaged} onChange={(e) => setReturnForm({ ...returnForm, damaged: e.target.value })} style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', color: '#C00', fontWeight: 'bold' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={handleSaveReturn} className="ids-btn" style={{ padding: '3px 14px', fontWeight: 'bold' }}>Process Return</button>
              </div>
            </div>

            {/* Return Logs Table */}
            <div style={{ maxHeight: '140px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Return#</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Date</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Floor</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Item</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'center' }}>Clean</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'center' }}>Soiled</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Damaged</th>
                  </tr>
                </thead>
                <tbody>
                  {returnLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{log.returnId}</td>
                      <td style={{ padding: '4px' }}>{log.date}</td>
                      <td style={{ padding: '4px' }}>{log.floor}</td>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{log.item}</td>
                      <td style={{ padding: '4px', textAlign: 'center', color: '#008000', fontWeight: 'bold' }}>{log.cleanRet}</td>
                      <td style={{ padding: '4px', textAlign: 'center', color: '#E65100', fontWeight: 'bold' }}>{log.soiledRet}</td>
                      <td style={{ padding: '4px', textAlign: 'center', color: log.damaged > 0 ? '#C00' : '#666', fontWeight: 'bold' }}>{log.damaged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '3px 14px' }}>Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
