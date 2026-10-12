import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { getHousekeepingCrew } from '../../data/hotelStaffData';
import { 
  getFastApiLinenInventory, 
  createFastApiLinenItem, 
  createFastApiHousekeepingInspection 
} from '../../utils/backendApi';

export default function IdsHkInventoryModal({
  isOpen,
  onClose,
  initialTab = 'master', // 'master' | 'issue' | 'return' | 'dhobi' | 'assets'
  accountingDate = '27-JAN-2026',
  onOpenMessageBox
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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
    { issueId: 'ISS-2026-041', date: '27-JAN-2026', floor: 'FL-02 (2nd Floor Trolley)', attendant: '006 Sunil Mohapatra', item: 'Bath Towel 650 GSM', qty: 24, shift: 'Morning' },
    { issueId: 'ISS-2026-042', date: '27-JAN-2026', floor: 'FL-03 (3rd Floor Trolley)', attendant: '002 Ramesh Nayak', item: 'Bed Sheet King White', qty: 16, shift: 'Morning' }
  ]);

  // 3. Return Transactions
  const [returnLogs, setReturnLogs] = useState([
    { returnId: 'RET-2026-022', date: '26-JAN-2026', floor: 'FL-02 (2nd Floor Trolley)', attendant: '006 Sunil Mohapatra', item: 'Bath Towel 650 GSM', cleanRet: 4, soiledRet: 20, damaged: 0 },
    { returnId: 'RET-2026-023', date: '26-JAN-2026', floor: 'FL-03 (3rd Floor Trolley)', attendant: '002 Ramesh Nayak', item: 'Bed Sheet King White', cleanRet: 2, soiledRet: 14, damaged: 1 }
  ]);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    floor: 'FL-02 (2nd Floor Trolley)',
    attendant: '006 Sunil Mohapatra',
    itemCode: 'HK-LIN-002',
    qty: 12,
    shift: 'Morning'
  });

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    floor: 'FL-02 (2nd Floor Trolley)',
    attendant: '006 Sunil Mohapatra',
    itemCode: 'HK-LIN-002',
    cleanRet: 2,
    soiledRet: 10,
    damaged: 0
  });

  // Dhobi / External Laundry Movement State
  const [dhobiAction, setDhobiAction] = useState('dispatch'); // 'dispatch' | 'receive'
  const [dhobiItemCode, setDhobiItemCode] = useState('HK-LIN-001');
  const [dhobiQty, setDhobiQty] = useState(10);
  const [dhobiVendor, setDhobiVendor] = useState('Rayagada Express Laundry & Dry Cleaners');
  const [dhobiLogs, setDhobiLogs] = useState([
    { id: 'DHB-101', date: '26-JAN-2026', type: 'Dispatch', item: 'Bed Sheet King White', qty: 25, vendor: 'Rayagada Express Laundry & Dry Cleaners' },
    { id: 'DHB-102', date: '27-JAN-2026', type: 'Receive', item: 'Bath Towel 650 GSM', qty: 20, vendor: 'Rayagada Express Laundry & Dry Cleaners' }
  ]);

  // Room Asset Checklist State
  const ROOM_ASSET_CHECKLIST = [
    { id: 'A-01', name: 'Smart LED TV Remote', defaultQty: 1, replacementCost: 450 },
    { id: 'A-02', name: 'Split AC Remote Control', defaultQty: 1, replacementCost: 650 },
    { id: 'A-03', name: 'Electric Kettle & Cord', defaultQty: 1, replacementCost: 1200 },
    { id: 'A-04', name: 'Wooden Coat Hangers', defaultQty: 6, replacementCost: 300 },
    { id: 'A-05', name: 'Glass Tumblers (Set of 2)', defaultQty: 2, replacementCost: 150 },
    { id: 'A-06', name: 'Geyser & Electrical Fittings', defaultQty: 1, replacementCost: 2500 }
  ];
  const [selectedInspectRoom, setSelectedInspectRoom] = useState('101');
  const [checklistState, setChecklistState] = useState({
    'A-01': true, 'A-02': true, 'A-03': true, 'A-04': true, 'A-05': true, 'A-06': true
  });
  const [inspectionResult, setInspectionResult] = useState(null);

  // Sync live linen inventory from Railway PostgreSQL
  useEffect(() => {
    if (!isOpen) return;
    getFastApiLinenInventory()
      .then(apiData => {
        if (Array.isArray(apiData) && apiData.length > 0) {
          const mapped = apiData.map(item => ({
            code: item.item_code || `HK-LIN-${item.id}`,
            name: item.item_name,
            category: 'Linen',
            unit: 'Pcs',
            parStock: Number(item.par_stock) || 120,
            currentStock: Number(item.in_store) || 80,
            soiledStock: Number(item.at_dhobi) || 20
          }));
          setInventoryItems(prev => {
            const nonLinen = prev.filter(p => p.category !== 'Linen');
            return [...mapped, ...nonLinen];
          });
        }
      })
      .catch(err => console.warn('[FastAPI] Linen inventory fetch failed:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveIssue = () => {
    const selectedItem = inventoryItems.find(i => i.code === issueForm.itemCode) || inventoryItems[0];
    const newIssue = {
      issueId: `ISS-2026-${String(issueLogs.length + 43).padStart(3, '0')}`,
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
      returnId: `RET-2026-${String(returnLogs.length + 24).padStart(3, '0')}`,
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

  const handleDhobiSubmit = () => {
    const qty = parseInt(dhobiQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity!');
      return;
    }
    const selectedItem = inventoryItems.find(i => i.code === dhobiItemCode) || inventoryItems[0];
    
    if (dhobiAction === 'dispatch') {
      if (qty > selectedItem.currentStock) {
        alert(`Cannot dispatch ${qty} ${selectedItem.unit}. Available clean stock is only ${selectedItem.currentStock}.`);
        return;
      }
      setInventoryItems(prev => prev.map(item => {
        if (item.code === dhobiItemCode) {
          return {
            ...item,
            currentStock: Math.max(0, item.currentStock - qty),
            soiledStock: item.soiledStock + qty
          };
        }
        return item;
      }));
    } else {
      setInventoryItems(prev => prev.map(item => {
        if (item.code === dhobiItemCode) {
          return {
            ...item,
            currentStock: item.currentStock + qty,
            soiledStock: Math.max(0, item.soiledStock - qty)
          };
        }
        return item;
      }));
    }

    const newLog = {
      id: `DHB-${Date.now().toString().slice(-4)}`,
      date: accountingDate,
      type: dhobiAction === 'dispatch' ? 'Dispatch' : 'Receive',
      item: selectedItem.name,
      qty,
      vendor: dhobiVendor
    };
    setDhobiLogs([newLog, ...dhobiLogs]);

    // Dispatch update to Railway FastAPI PostgreSQL
    createFastApiLinenItem({
      item_name: selectedItem.name,
      item_code: selectedItem.code,
      par_stock: selectedItem.parStock,
      in_rooms: 0,
      in_store: dhobiAction === 'dispatch' ? Math.max(0, selectedItem.currentStock - qty) : selectedItem.currentStock + qty,
      at_dhobi: dhobiAction === 'dispatch' ? selectedItem.soiledStock + qty : Math.max(0, selectedItem.soiledStock - qty),
      damaged: 0
    }).catch(err => console.warn('[FastAPI] Linen update failed:', err));

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Dhobi Movement Logged',
        message: `${newLog.type} of ${qty} ${selectedItem.unit} '${selectedItem.name}' recorded with ${dhobiVendor}.`,
        type: 'info'
      });
    }
  };

  const handleVerifyRoomAssets = () => {
    const missing = ROOM_ASSET_CHECKLIST.filter(item => !checklistState[item.id]);
    const penaltyTotal = missing.reduce((acc, curr) => acc + curr.replacementCost, 0);

    const result = {
      roomNumber: selectedInspectRoom,
      allIntact: missing.length === 0,
      missingItems: missing,
      penaltyTotal,
      inspectedAt: new Date().toLocaleTimeString()
    };
    setInspectionResult(result);

    // Record inspection scorecard in Railway PostgreSQL
    createFastApiHousekeepingInspection({
      room_number: selectedInspectRoom,
      supervisor_name: 'DUTY SUPERVISOR',
      cleanliness_score: missing.length === 0 ? 100 : 75,
      linen_freshness_score: 95,
      amenities_intact: missing.length === 0,
      fixtures_working: true,
      status: missing.length === 0 ? 'Passed' : 'Follow-up Needed',
      notes: missing.length === 0 ? 'All room assets intact' : `Missing: ${missing.map(m => m.name).join(', ')} (Penalty: ₹${penaltyTotal})`
    }).catch(err => console.warn('[FastAPI] Inspection save error:', err));

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Room Asset Inspection Logged',
        message: missing.length === 0 
          ? `Room ${selectedInspectRoom}: All assets verified intact.` 
          : `Room ${selectedInspectRoom}: ${missing.length} missing asset(s) flagged! Replacement penalty: ₹${penaltyTotal}.`,
        type: missing.length === 0 ? 'info' : 'warning'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '920px', minHeight: '560px', 
          maxWidth: '96vw',
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
          <span>Housekeeping Linen, Laundry & Room Assets Suite V6.5.002.2</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* 5 Departmental Sub-Tabs matching Menu Hierarchy */}
        <div style={{ display: 'flex', background: '#ECE9D8', borderBottom: '2px solid #716F64', padding: '6px 12px 0 12px', gap: '3px', flexWrap: 'wrap' }}>
          {[
            { id: 'master', label: '📦 HK Inventory Master' },
            { id: 'issue', label: '📋 HK Issue Entry' },
            { id: 'return', label: '🔄 HK Issue Return' },
            { id: 'dhobi', label: '🧺 Dhobi / Laundry Movement' },
            { id: 'assets', label: '🔍 Room Asset Inspection' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="ids-tab-btn"
                style={{ 
                  padding: '5px 14px', 
                  fontSize: '11px', 
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#0A246A' : '#1A1A1A',
                  background: isActive ? '#FFFFFF' : 'linear-gradient(180deg, #F0EFE7 0%, #D8D4C8 100%)',
                  border: '1px solid #716F64',
                  borderBottom: isActive ? '2px solid #FFFFFF' : '1px solid #716F64',
                  marginBottom: isActive ? '-2px' : '0px',
                  boxShadow: isActive ? 'inset 0 2px 0 #316AC5' : 'inset 0 1px 0 #FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '3px 3px 0 0'
                }}
              >
                {tab.label}
              </button>
            );
          })}
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
                  <select 
                    value={issueForm.attendant} 
                    onChange={(e) => setIssueForm({ ...issueForm, attendant: e.target.value })} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#FFF' }}
                  >
                    {getHousekeepingCrew().map(st => (
                      <option key={st.id} value={`[${st.serverCode}] ${st.name}`}>
                        [{st.serverCode}] {st.name} ({st.shortName}) — {st.role}
                      </option>
                    ))}
                  </select>
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
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Issue No.</th>
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
                  <select 
                    value={returnForm.attendant} 
                    onChange={(e) => setReturnForm({ ...returnForm, attendant: e.target.value })} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#FFF' }}
                  >
                    {getHousekeepingCrew().map(st => (
                      <option key={st.id} value={`[${st.serverCode}] ${st.name}`}>
                        [{st.serverCode}] {st.name} ({st.shortName}) — {st.role}
                      </option>
                    ))}
                  </select>
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
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Return No.</th>
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

        {/* Tab 4: Dhobi / External Laundry Movement */}
        {activeTab === 'dhobi' && (
          <div style={{ padding: '14px', fontSize: '11px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#0A246A', marginBottom: '8px' }}>
                Dhobi Laundry Movement Gate Pass & Voucher [Rayagada Express Laundry]
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Movement Type</label>
                  <select 
                    value={dhobiAction} 
                    onChange={(e) => setDhobiAction(e.target.value)}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                  >
                    <option value="dispatch">Dispatch to Dhobi (Send Clean/Soiled)</option>
                    <option value="receive">Receive from Dhobi (Clean Return)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Laundry Vendor</label>
                  <input 
                    type="text" 
                    value={dhobiVendor} 
                    onChange={(e) => setDhobiVendor(e.target.value)} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
                  <label style={{ width: '90px' }}>Linen Item</label>
                  <select 
                    value={dhobiItemCode} 
                    onChange={(e) => setDhobiItemCode(e.target.value)}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                  >
                    {inventoryItems.filter(i => i.category === 'Linen').map(item => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code}) - Store: {item.currentStock} | At Dhobi: {item.soiledStock} {item.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Quantity</label>
                  <input 
                    type="number" 
                    value={dhobiQty} 
                    onChange={(e) => setDhobiQty(e.target.value)} 
                    style={{ width: '80px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={handleDhobiSubmit} className="ids-btn" style={{ padding: '4px 16px', fontWeight: 'bold' }}>
                  {dhobiAction === 'dispatch' ? 'Post Dhobi Dispatch Gatepass' : 'Record Dhobi Clean Receipt'}
                </button>
              </div>
            </div>

            {/* Dhobi Movement History */}
            <div style={{ maxHeight: '130px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Pass #</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Date</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Action</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Linen Item</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '4px' }}>Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {dhobiLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{log.id}</td>
                      <td style={{ padding: '4px' }}>{log.date}</td>
                      <td style={{ padding: '4px', fontWeight: 'bold', color: log.type === 'Dispatch' ? '#003366' : '#008000' }}>{log.type}</td>
                      <td style={{ padding: '4px' }}>{log.item}</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{log.qty}</td>
                      <td style={{ padding: '4px' }}>{log.vendor}</td>
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

        {/* Tab 5: Room Asset Inspection Checklist */}
        {activeTab === 'assets' && (
          <div style={{ padding: '14px', fontSize: '11px' }}>
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#0A246A' }}>
                  Housekeeping Supervisor Room Asset Physical Audit Checklist
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontWeight: 'bold' }}>Room #</label>
                  <select 
                    value={selectedInspectRoom} 
                    onChange={(e) => setSelectedInspectRoom(e.target.value)}
                    style={{ padding: '2px 8px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                  >
                    {['101', '102', '103', '104', '105', '106', '107', '108', '109', '201', '202', '203', '204', '205', '206', '207', '301', '302', '303', '304', '305', '306'].map(r => (
                      <option key={r} value={r}>Room {r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ border: '1px solid #CCC', borderRadius: '2px', padding: '8px', background: '#F8F9FA', marginBottom: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {ROOM_ASSET_CHECKLIST.map(asset => {
                    const isChecked = !!checklistState[asset.id];
                    return (
                      <label 
                        key={asset.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '4px 6px', 
                          background: isChecked ? '#E8F5E9' : '#FFEBEE',
                          border: `1px solid ${isChecked ? '#A5D6A7' : '#EF9A9A'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={(e) => setChecklistState({ ...checklistState, [asset.id]: e.target.checked })} 
                        />
                        <span style={{ flex: 1, fontWeight: isChecked ? 'normal' : 'bold' }}>{asset.name}</span>
                        <span style={{ fontSize: '10px', color: '#666' }}>₹{asset.replacementCost}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {inspectionResult && (
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: inspectionResult.allIntact ? '#008000' : '#C00' }}>
                    {inspectionResult.allIntact 
                      ? `✓ Room ${inspectionResult.roomNumber}: All Assets Intact (Score 100%)` 
                      : `⚠ Room ${inspectionResult.roomNumber}: Missing ${inspectionResult.missingItems.length} item(s)! Replacement Penalty: ₹${inspectionResult.penaltyTotal}`}
                  </div>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <button onClick={handleVerifyRoomAssets} className="ids-btn" style={{ padding: '4px 16px', fontWeight: 'bold' }}>
                    Record & Post Inspection Scorecard
                  </button>
                </div>
              </div>
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
