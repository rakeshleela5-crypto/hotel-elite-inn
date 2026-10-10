import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_LAUNDRY_ITEMS, INITIAL_LAUNDRY_RATES } from '../../data/idsPmsStore';

export default function IdsLaundryRateMasterModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2022',
  onSaveRate,
  onOpenMessageBox
}) {
  const [rates, setRates] = useState(INITIAL_LAUNDRY_RATES);
  const [items] = useState(INITIAL_LAUNDRY_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [itemLookupOpen, setItemLookupOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentRate = rates[currentIndex] || rates[0] || {
    itemCode: '1',
    itemName: 'SHIRT',
    applicableFrom: '27-JAN-2022',
    serviceType: 'Washing',
    category: 'Gentleman',
    currency: 'Indian Rupees',
    taxStructure: 'GST18_LAU',
    standardCharge: 80,
    expressCharge: 120,
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '27-JAN-2022 19:50'
  };

  const [formData, setFormData] = useState({
    itemCode: currentRate.itemCode,
    itemName: currentRate.itemName,
    applicableFrom: currentRate.applicableFrom || accountingDate,
    serviceType: currentRate.serviceType,
    category: currentRate.category,
    currency: currentRate.currency,
    taxStructure: currentRate.taxStructure,
    standardCharge: currentRate.standardCharge,
    expressCharge: currentRate.expressCharge,
    status: currentRate.status,
    user: currentRate.user,
    lastUpdated: currentRate.lastUpdated
  });

  if (!isOpen) return null;

  const isFormLocked = !isAdding && !isModifying;

  const handleItemSelect = (item) => {
    setFormData({
      ...formData,
      itemCode: item.itemCode,
      itemName: item.itemName
    });
    setItemLookupOpen(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsModifying(false);
    setFormData({
      itemCode: '1',
      itemName: 'SHIRT',
      applicableFrom: accountingDate,
      serviceType: 'Washing',
      category: 'Gentleman',
      currency: 'Indian Rupees',
      taxStructure: 'GST18_LAU',
      standardCharge: '',
      expressCharge: '',
      status: 'Active',
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 19:50`
    });
  };

  const handleModify = () => {
    setIsModifying(true);
    setIsAdding(false);
  };

  const handleDelete = () => {
    if (rates.length <= 1) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Laundry Rate Master',
          message: 'Cannot delete the only remaining rate record.',
          type: 'warning'
        });
      }
      return;
    }
    const updated = rates.filter((_, idx) => idx !== currentIndex);
    setRates(updated);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(updated[newIdx]);
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Rate Master',
        message: 'Rate record deleted successfully.',
        type: 'info'
      });
    }
  };

  const handleSave = () => {
    if (!formData.standardCharge || isNaN(Number(formData.standardCharge))) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Validation Error',
          message: 'Please specify a valid Standard Charge amount.',
          type: 'error'
        });
      } else {
        alert('Please specify a valid Standard Charge amount.');
      }
      return;
    }

    const payload = {
      ...formData,
      standardCharge: Number(formData.standardCharge),
      expressCharge: Number(formData.expressCharge || Number(formData.standardCharge) * 1.5),
      lastUpdated: `${accountingDate} 19:50`
    };

    let updatedList;
    if (isAdding) {
      updatedList = [...rates, payload];
      setRates(updatedList);
      setCurrentIndex(updatedList.length - 1);
      setIsAdding(false);
    } else {
      updatedList = rates.map((r, idx) => idx === currentIndex ? payload : r);
      setRates(updatedList);
      setIsModifying(false);
    }

    if (onSaveRate) {
      onSaveRate(payload);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Rate Master',
        message: `Rates for '${formData.itemName} (${formData.serviceType})' saved successfully.`,
        type: 'info'
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIdx = currentIndex - 1;
      setCurrentIndex(newIdx);
      setFormData(rates[newIdx]);
      setIsAdding(false);
      setIsModifying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < rates.length - 1) {
      const newIdx = currentIndex + 1;
      setCurrentIndex(newIdx);
      setFormData(rates[newIdx]);
      setIsAdding(false);
      setIsModifying(false);
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '720px', 
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
          <span>Laundry Rate Master V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px' }}>
          {/* Top Section */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '11px',
              marginBottom: '10px'
            }}
          >
            {/* Applicable From & Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '120px', color: '#000' }}>Applicable From</label>
                <input 
                  type="text" 
                  value={formData.applicableFrom}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, applicableFrom: e.target.value })}
                  style={{ width: '110px', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                />
              </div>
              <button 
                onClick={() => setPreviewOpen(true)}
                className="ids-btn" 
                style={{ padding: '2px 14px', fontSize: '11px', background: '#D4D0C8' }}
              >
                Preview
              </button>
            </div>

            {/* Item Code & Name */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '120px', color: '#000' }}>Item Code</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
                <input 
                  type="text" 
                  value={formData.itemCode}
                  disabled={isFormLocked}
                  onChange={(e) => {
                    const code = e.target.value;
                    const matched = items.find(x => x.itemCode === code);
                    setFormData({
                      ...formData,
                      itemCode: code,
                      itemName: matched ? matched.itemName : formData.itemName
                    });
                  }}
                  style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                />
                <button 
                  onClick={() => setItemLookupOpen(true)}
                  disabled={isFormLocked}
                  style={{ padding: '1px 5px', fontSize: '11px', cursor: 'pointer', background: '#ECE9D8', border: '1px solid #7F9DB9' }}
                >
                  ?
                </button>
                <input 
                  type="text" 
                  value={formData.itemName}
                  disabled
                  style={{ flex: 1, padding: '2px 6px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }}
                />
              </div>
            </div>

            {/* Service Type & Category */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '120px', color: '#000' }}>Service Type</label>
                <select 
                  value={formData.serviceType}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Washing">Washing</option>
                  <option value="Pressing">Pressing</option>
                  <option value="Dry Cleaning">Dry Cleaning</option>
                  <option value="Steam Iron">Steam Iron</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '80px', color: '#000' }}>Category</label>
                <select 
                  value={formData.category}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Gentleman">Gentleman</option>
                  <option value="Lady">Lady</option>
                  <option value="Child">Child</option>
                  <option value="Linen">Linen</option>
                </select>
              </div>
            </div>

            {/* Currency & Tax Structure */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '120px', color: '#000' }}>Currency</label>
                <select 
                  value={formData.currency}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Indian Rupees">Indian Rupees</option>
                  <option value="US Dollars">US Dollars</option>
                  <option value="Euro">Euro</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <label style={{ width: '80px', color: '#000' }}>Tax Structure</label>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input 
                    type="text" 
                    value={formData.taxStructure}
                    disabled={isFormLocked}
                    onChange={(e) => setFormData({ ...formData, taxStructure: e.target.value })}
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                  />
                  <button 
                    disabled={isFormLocked}
                    style={{ padding: '1px 5px', fontSize: '11px', cursor: 'pointer', background: '#ECE9D8', border: '1px solid #7F9DB9' }}
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Slabs & Audit Section */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Rate Slabs Grid */}
            <div 
              style={{ 
                flex: 1, 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '12px' 
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60%' }}>Type</th>
                    <th style={{ padding: '4px' }}>Charge (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Standard</td>
                    <td style={{ padding: '4px' }}>
                      <input 
                        type="number" 
                        value={formData.standardCharge}
                        disabled={isFormLocked}
                        onChange={(e) => setFormData({ ...formData, standardCharge: e.target.value })}
                        style={{ width: '100%', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Express</td>
                    <td style={{ padding: '4px' }}>
                      <input 
                        type="number" 
                        value={formData.expressCharge}
                        disabled={isFormLocked}
                        onChange={(e) => setFormData({ ...formData, expressCharge: e.target.value })}
                        placeholder={formData.standardCharge ? String(Number(formData.standardCharge) * 1.5) : ''}
                        style={{ width: '100%', padding: '2px 4px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Audit Status Block */}
            <div 
              style={{ 
                width: '240px', 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '80px' }}>Status</label>
                <select 
                  value={formData.status}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', background: isFormLocked ? '#EBE9ED' : '#FFF' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '80px' }}>User</label>
                <input 
                  type="text" 
                  value={formData.user}
                  disabled
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '80px' }}>Last Updated</label>
                <input 
                  type="text" 
                  value={formData.lastUpdated}
                  disabled
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }}
                />
              </div>
            </div>
          </div>

          {/* Standard 9-Button Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <button onClick={handleAdd} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Add</button>
            <button onClick={handleModify} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Modify</button>
            <button onClick={handleDelete} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Delete</button>
            <button onClick={() => setPreviewOpen(true)} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Browse</button>
            <button onClick={handlePrevious} disabled={currentIndex <= 0 || isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Previous</button>
            <button onClick={handleNext} disabled={currentIndex >= rates.length - 1 || isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Next</button>
            <button onClick={handleSave} disabled={isFormLocked} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px', fontWeight: !isFormLocked ? 'bold' : 'normal' }}>Save</button>
            <button onClick={() => { setIsAdding(false); setIsModifying(false); setFormData(rates[currentIndex]); }} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Panel</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* Item Lookup Modal */}
        {itemLookupOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '480px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Select Laundry Item</span>
                <button onClick={() => setItemLookupOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px' }}>Code</th>
                        <th style={{ padding: '4px' }}>Item Name</th>
                        <th style={{ padding: '4px' }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(it => (
                        <tr 
                          key={it.itemCode} 
                          onClick={() => handleItemSelect(it)}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        >
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{it.itemCode}</td>
                          <td style={{ padding: '4px' }}>{it.itemName}</td>
                          <td style={{ padding: '4px' }}>{it.shortName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => setItemLookupOpen(false)} className="ids-btn" style={{ padding: '2px 12px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rate Sheet Preview Modal */}
        {previewOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '640px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rate Schedule Preview - All Services</span>
                <button onClick={() => setPreviewOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ maxHeight: '240px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px' }}>Item</th>
                        <th style={{ padding: '4px' }}>Service</th>
                        <th style={{ padding: '4px' }}>Category</th>
                        <th style={{ padding: '4px', textAlign: 'right' }}>Standard</th>
                        <th style={{ padding: '4px', textAlign: 'right' }}>Express</th>
                        <th style={{ padding: '4px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.map((r, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setFormData(r);
                            setPreviewOpen(false);
                          }}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        >
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{r.itemName}</td>
                          <td style={{ padding: '4px' }}>{r.serviceType}</td>
                          <td style={{ padding: '4px' }}>{r.category}</td>
                          <td style={{ padding: '4px', textAlign: 'right' }}>₹{r.standardCharge}.00</td>
                          <td style={{ padding: '4px', textAlign: 'right' }}>₹{r.expressCharge}.00</td>
                          <td style={{ padding: '4px' }}>{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => setPreviewOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
