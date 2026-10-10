import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  INITIAL_LAUNDRY_ITEMS, 
  INITIAL_LAUNDRY_RATES, 
  INITIAL_HOUSEKEEPING_STAFF,
  INITIAL_LAUNDRY_ENTRIES,
  calculateLaundryTax
} from '../../data/idsPmsStore';

export default function IdsLaundryEntryModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  inhouseGuests = [],
  onSaveEntry,
  onOpenMessageBox
}) {
  const [entries, setEntries] = useState(INITIAL_LAUNDRY_ENTRIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [roomLookupOpen, setRoomLookupOpen] = useState(false);

  // Active Entry
  const currentEntry = entries[currentIndex] || entries[0] || {
    refNo: 'LND-2026-001',
    billTo: 'Guest A/C',
    roomNo: '205',
    guestName: 'Mr Kumar Anil',
    guestType: 'Regular',
    guestStatus: 'In-House',
    currency: 'Indian Rupees',
    rcvDate: '27-JAN-2026',
    rcvTime: '20:00',
    deliveryDate: '28-JAN-2026',
    deliveryTime: '18:00',
    collectedBy: '002 Ramesh Nayak',
    service: 'Pressing',
    rateType: 'Standard',
    remarks: 'Gentle steam press requested',
    items: [
      { itemNo: '1', code: '2', name: 'TROUSER', qty: 2, rate: 50, discount: 0, amount: 100, remarks: '' },
      { itemNo: '2', code: '1', name: 'SHIRT', qty: 2, rate: 50, discount: 0, amount: 100, remarks: '' }
    ],
    grossAmount: 200,
    discountAmount: 0,
    taxAmount: 36,
    netAmount: 236
  };

  const [formData, setFormData] = useState({
    ...currentEntry
  });

  const [lineItems, setLineItems] = useState(currentEntry.items || []);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentEntry);
      setLineItems(currentEntry.items || []);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const isFormLocked = !isAdding && !isModifying;

  // Auto-fetch guest upon room number change
  const handleRoomChange = (roomNo) => {
    const matched = inhouseGuests.find(g => g.roomNo === roomNo) || {
      roomNo,
      guestName: roomNo === '205' ? 'Mr Kumar Anil' : (roomNo === '201' ? 'Mr Vikram Singhania' : 'Mr Walk-in Guest'),
      arrivalDate: '27-JAN-2026 19:07',
      departureDate: '01-FEB-2026 12:00',
      vipStatus: 'Regular'
    };

    setFormData({
      ...formData,
      roomNo,
      guestName: matched.guestName,
      guestType: matched.vipStatus || 'Regular',
      arrivalDate: matched.arrivalDate || '27-JAN-2026 19:07',
      departureDate: matched.departureDate || '01-FEB-2026 12:00'
    });
  };

  // Add Item Line
  const handleAddItemRow = (itemCode = '1', service = formData.service) => {
    const it = INITIAL_LAUNDRY_ITEMS.find(x => x.itemCode === itemCode) || INITIAL_LAUNDRY_ITEMS[0];
    const rateRecord = INITIAL_LAUNDRY_RATES.find(r => r.itemCode === itemCode && r.serviceType === service);
    const unitRate = rateRecord ? (formData.rateType === 'Express' ? rateRecord.expressCharge : rateRecord.standardCharge) : 50;
    const defaultQty = 1;

    const newItem = {
      itemNo: String(lineItems.length + 1),
      code: it.itemCode,
      name: it.itemName,
      qty: defaultQty,
      rate: unitRate,
      discount: 0,
      amount: unitRate * defaultQty,
      remarks: ''
    };

    const updatedLines = [...lineItems, newItem];
    setLineItems(updatedLines);
    updateCalculations(updatedLines);
  };

  const handleUpdateLineQty = (idx, qtyVal) => {
    const qty = Math.max(1, Number(qtyVal) || 1);
    const updated = lineItems.map((ln, i) => {
      if (i === idx) {
        const amt = (qty * ln.rate) - (ln.discount || 0);
        return { ...ln, qty, amount: amt };
      }
      return ln;
    });
    setLineItems(updated);
    updateCalculations(updated);
  };

  const handleRemoveLine = (idx) => {
    const updated = lineItems.filter((_, i) => i !== idx).map((ln, i) => ({ ...ln, itemNo: String(i + 1) }));
    setLineItems(updated);
    updateCalculations(updated);
  };

  const updateCalculations = (itemsList) => {
    const gross = itemsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxCalc = calculateLaundryTax(gross, 0);
    setFormData(prev => ({
      ...prev,
      grossAmount: gross,
      taxAmount: taxCalc.totalTax,
      netAmount: taxCalc.netAmount
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsModifying(false);
    const nextRef = `LND-${accountingDate.slice(-4)}-${String(entries.length + 1).padStart(3, '0')}`;
    setFormData({
      refNo: nextRef,
      billTo: 'Guest A/C',
      roomNo: '205',
      guestName: 'Mr Kumar Anil',
      guestType: 'Regular',
      guestStatus: 'In-House',
      currency: 'Indian Rupees',
      rcvDate: accountingDate,
      rcvTime: '20:00',
      deliveryDate: '28-JAN-2026',
      deliveryTime: '18:00',
      collectedBy: '002 Ramesh Nayak',
      service: 'Pressing',
      rateType: 'Standard',
      remarks: '',
      grossAmount: 0,
      taxAmount: 0,
      netAmount: 0,
      status: 'Pending Billing'
    });
    setLineItems([]);
  };

  const handleSave = () => {
    if (!formData.roomNo || lineItems.length === 0) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Validation Error',
          message: 'Please assign a valid Room Number and at least one laundry item.',
          type: 'error'
        });
      } else {
        alert('Please assign a valid Room Number and at least one laundry item.');
      }
      return;
    }

    const payload = {
      ...formData,
      items: lineItems
    };

    let updatedList;
    if (isAdding) {
      updatedList = [...entries, payload];
      setEntries(updatedList);
      setCurrentIndex(updatedList.length - 1);
      setIsAdding(false);
    } else {
      updatedList = entries.map((en, i) => i === currentIndex ? payload : en);
      setEntries(updatedList);
      setIsModifying(false);
    }

    if (onSaveEntry) {
      onSaveEntry(payload);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Entry',
        message: `Laundry Voucher '${payload.refNo}' for Room ${payload.roomNo} (${payload.guestName}) saved successfully. Total Net: ₹${payload.netAmount}.00`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '840px', 
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
          <span>Laundry Entry V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px' }}>
          {/* Top Form Header with Left & Right Sections */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
            {/* Left Header Box */}
            <div 
              style={{ 
                flex: 1.1, 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>Reference</label>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input 
                    type="text" 
                    value={formData.refNo}
                    disabled={isFormLocked}
                    onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF', fontWeight: 'bold' }}
                  />
                  <button style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}>?</button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>Bill To</label>
                <select 
                  value={formData.billTo}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, billTo: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Guest A/C">Guest A/C</option>
                  <option value="City Ledger">City Ledger</option>
                  <option value="Direct Cash">Direct Cash</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>Room#</label>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input 
                    type="text" 
                    value={formData.roomNo}
                    disabled={isFormLocked}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    style={{ width: '70px', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF', fontWeight: 'bold' }}
                  />
                  <button 
                    onClick={() => setRoomLookupOpen(true)}
                    disabled={isFormLocked}
                    style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}
                  >
                    ?
                  </button>
                  <input 
                    type="text" 
                    value={formData.guestName}
                    disabled
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>Cur</label>
                <select 
                  value={formData.currency}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Indian Rupees">Indian Rupees</option>
                  <option value="US Dollars">US Dollars</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>RCV Date</label>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input 
                    type="text" 
                    value={formData.rcvDate}
                    disabled={isFormLocked}
                    style={{ width: '100px', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                  />
                  <input 
                    type="text" 
                    value={formData.rcvTime}
                    disabled={isFormLocked}
                    style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px' }}>Collected By</label>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input 
                    type="text" 
                    value={formData.collectedBy}
                    disabled
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }}
                  />
                  <button 
                    onClick={() => setStaffModalOpen(true)}
                    disabled={isFormLocked}
                    style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9', cursor: 'pointer' }}
                    title="Select House Keeping Staff"
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>

            {/* Right Guest Folio Context */}
            <div 
              style={{ 
                flex: 0.9, 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Guest Name</label>
                <input type="text" value={formData.guestName} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Guest Type</label>
                <input type="text" value={formData.guestType || 'Regular'} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Guest Status</label>
                <input type="text" value={formData.guestStatus || 'In-House'} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Arrival</label>
                <input type="text" value="27-JAN-2026 19:07" disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Dep Date</label>
                <input type="text" value="01-FEB-2026 12:00" disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Bill.Inst</label>
                <input type="text" value="Direct" disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>
            </div>
          </div>

          {/* Service & Delivery Sub-bar */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#ECE9D8', 
              padding: '8px 12px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              fontSize: '11px',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Service</span>
              <select 
                value={formData.service} 
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                style={{ padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="Pressing">Pressing</option>
                <option value="Washing">Washing</option>
                <option value="Dry Cleaning">Dry Cleaning</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Rate</span>
              <select 
                value={formData.rateType} 
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                style={{ padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express (Urgent)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Target Delivery</span>
              <input 
                type="text" 
                value={formData.deliveryDate} 
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                style={{ width: '90px', padding: '2px', border: '1px solid #7F9DB9' }} 
              />
              <input 
                type="text" 
                value={formData.deliveryTime} 
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                style={{ width: '50px', padding: '2px', border: '1px solid #7F9DB9' }} 
              />
            </div>

            <button 
              onClick={() => handleAddItemRow('1', formData.service)}
              disabled={isFormLocked}
              className="ids-btn"
              style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 'bold' }}
            >
              + Add Garment
            </button>
          </div>

          {/* Garments Grid Table */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              maxHeight: '160px', 
              minHeight: '130px',
              overflowY: 'auto' 
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '40px' }}>Item#</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Name</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '70px', textAlign: 'right' }}>Rate</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px', textAlign: 'right' }}>Discount</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '4px', width: '50px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                      No garment line items added. Click "+ Add Garment" to add clothes.
                    </td>
                  </tr>
                ) : (
                  lineItems.map((ln, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{ln.itemNo}</td>
                      <td style={{ padding: '4px' }}>
                        <select 
                          value={ln.code}
                          disabled={isFormLocked}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            const it = INITIAL_LAUNDRY_ITEMS.find(x => x.itemCode === newCode);
                            const rateRec = INITIAL_LAUNDRY_RATES.find(r => r.itemCode === newCode && r.serviceType === formData.service);
                            const newRate = rateRec ? rateRec.standardCharge : 50;
                            const updated = lineItems.map((item, i) => i === idx ? {
                              ...item,
                              code: newCode,
                              name: it ? it.itemName : item.name,
                              rate: newRate,
                              amount: (item.qty * newRate) - (item.discount || 0)
                            } : item);
                            setLineItems(updated);
                            updateCalculations(updated);
                          }}
                          style={{ padding: '2px', border: '1px solid #CCC', width: '100%' }}
                        >
                          {INITIAL_LAUNDRY_ITEMS.map(it => (
                            <option key={it.itemCode} value={it.itemCode}>{it.itemName}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <input 
                          type="number" 
                          value={ln.qty}
                          disabled={isFormLocked}
                          onChange={(e) => handleUpdateLineQty(idx, e.target.value)}
                          style={{ width: '45px', textAlign: 'center', border: '1px solid #CCC', padding: '1px' }}
                        />
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{ln.rate}.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{ln.discount || 0}.00</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>₹{ln.amount}.00</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleRemoveLine(idx)}
                          disabled={isFormLocked}
                          style={{ padding: '0 4px', fontSize: '10px', color: '#C00', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Ribbon */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '24px', 
              padding: '8px 12px',
              background: '#EBE9ED',
              border: '1px solid #7F9DB9',
              borderTop: 'none',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            <span>Gross: ₹{formData.grossAmount || 0}.00</span>
            <span style={{ color: '#0A246A' }}>GST 18% (SAC 999791): ₹{formData.taxAmount || 0}.00</span>
            <span style={{ color: '#900', fontSize: '12px' }}>Net Total: ₹{formData.netAmount || 0}.00</span>
          </div>

          {/* Standard 9-Button Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
            <button onClick={handleAdd} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Add</button>
            <button onClick={() => { setIsModifying(true); setIsAdding(false); }} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Modify</button>
            <button onClick={() => {}} disabled className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Delete</button>
            <button onClick={() => {}} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Browse</button>
            <button onClick={() => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); }} disabled={currentIndex <= 0} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Previous</button>
            <button onClick={() => { if (currentIndex < entries.length - 1) setCurrentIndex(currentIndex + 1); }} disabled={currentIndex >= entries.length - 1} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Next</button>
            <button onClick={handleSave} disabled={isFormLocked} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px', fontWeight: !isFormLocked ? 'bold' : 'normal' }}>Save</button>
            <button onClick={() => { setIsAdding(false); setIsModifying(false); }} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Panel</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* House Keeping Staff Selection Modal Popup (Video 03 Frame 025) */}
        {staffModalOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '420px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>House Keeping Staff V6.5.002.1</span>
                <button onClick={() => setStaffModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '12px' }}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Code</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Name</th>
                        <th style={{ padding: '4px', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_HOUSEKEEPING_STAFF.map(st => (
                        <tr 
                          key={st.code}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              collectedBy: `${st.code} ${st.name}`
                            });
                            setStaffModalOpen(false);
                          }}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        >
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{st.code}</td>
                          <td style={{ padding: '4px' }}>{st.name}</td>
                          <td style={{ padding: '4px', color: '#008000' }}>{st.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => setStaffModalOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Select</button>
                  <button onClick={() => setStaffModalOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Lookup Modal */}
        {roomLookupOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '480px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Select In-House Room</span>
                <button onClick={() => setRoomLookupOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '12px' }}>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px' }}>Room#</th>
                        <th style={{ padding: '4px' }}>Guest Name</th>
                        <th style={{ padding: '4px' }}>Arrival</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['102', '201', '205', '206', '301'].map(rNo => (
                        <tr 
                          key={rNo}
                          onClick={() => {
                            handleRoomChange(rNo);
                            setRoomLookupOpen(false);
                          }}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        >
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{rNo}</td>
                          <td style={{ padding: '4px' }}>{rNo === '205' ? 'Mr Kumar Anil' : (rNo === '201' ? 'Mr Vikram Singhania' : 'In-House Guest')}</td>
                          <td style={{ padding: '4px' }}>27-JAN-2026</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => setRoomLookupOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
