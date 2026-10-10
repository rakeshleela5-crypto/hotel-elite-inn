import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_LAUNDRY_ITEMS } from '../../data/idsPmsStore';

export default function IdsLaundryItemMasterModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2022',
  onSaveItem,
  onOpenMessageBox
}) {
  const [items, setItems] = useState(INITIAL_LAUNDRY_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');

  // Form State
  const currentItem = items[currentIndex] || items[0] || {
    itemCode: '1',
    itemName: 'SHIRT',
    shortName: 'SHIRT',
    discountAllowed: 'Yes',
    costPct: '15',
    printerDevice: 'LAU_PRT_01',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '27-JAN-2022 19:47'
  };

  const [formData, setFormData] = useState({
    itemCode: currentItem.itemCode,
    itemName: currentItem.itemName,
    shortName: currentItem.shortName,
    discountAllowed: currentItem.discountAllowed,
    costPct: currentItem.costPct,
    printerDevice: currentItem.printerDevice,
    status: currentItem.status,
    user: currentItem.user,
    lastUpdated: currentItem.lastUpdated
  });

  if (!isOpen) return null;

  const handleAdd = () => {
    const nextCode = String(items.length + 1);
    setIsAdding(true);
    setIsModifying(false);
    setFormData({
      itemCode: nextCode,
      itemName: '',
      shortName: '',
      discountAllowed: 'Yes',
      costPct: '15',
      printerDevice: 'LAU_PRT_01',
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
    if (items.length <= 1) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Laundry Item Master',
          message: 'Cannot delete the only remaining laundry item master record.',
          type: 'warning'
        });
      }
      return;
    }
    const updated = items.filter((_, idx) => idx !== currentIndex);
    setItems(updated);
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(updated[newIdx]);
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Item Master',
        message: `Laundry Item '${formData.itemName}' deleted successfully.`,
        type: 'info'
      });
    }
  };

  const handleSave = () => {
    if (!formData.itemCode.trim() || !formData.itemName.trim()) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Validation Error',
          message: 'Item Code and Item Name are mandatory fields.',
          type: 'error'
        });
      } else {
        alert('Item Code and Item Name are mandatory fields.');
      }
      return;
    }

    let updatedList;
    if (isAdding) {
      const newItem = {
        ...formData,
        lastUpdated: `${accountingDate} 19:50`
      };
      updatedList = [...items, newItem];
      setItems(updatedList);
      setCurrentIndex(updatedList.length - 1);
      setIsAdding(false);
    } else {
      updatedList = items.map((it, idx) => idx === currentIndex ? { ...formData, lastUpdated: `${accountingDate} 19:50` } : it);
      setItems(updatedList);
      setIsModifying(false);
    }

    if (onSaveItem) {
      onSaveItem(formData);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Item Master',
        message: `Laundry Item '${formData.itemName}' saved successfully.`,
        type: 'info'
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIdx = currentIndex - 1;
      setCurrentIndex(newIdx);
      setFormData(items[newIdx]);
      setIsAdding(false);
      setIsModifying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const newIdx = currentIndex + 1;
      setCurrentIndex(newIdx);
      setFormData(items[newIdx]);
      setIsAdding(false);
      setIsModifying(false);
    }
  };

  const isFormLocked = !isAdding && !isModifying;

  const filteredBrowse = items.filter(it => 
    it.itemCode.toLowerCase().includes(browseSearch.toLowerCase()) ||
    it.itemName.toLowerCase().includes(browseSearch.toLowerCase()) ||
    it.shortName.toLowerCase().includes(browseSearch.toLowerCase())
  );

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
          <span>Laundry Item Master V6.5.002.1</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px' }}>
          {/* Main Field Box */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '11px'
            }}
          >
            {/* Item Code */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Item Code</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={formData.itemCode}
                  disabled={isFormLocked}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  style={{ 
                    width: '60px', 
                    padding: '2px 4px', 
                    border: '1px solid #7F9DB9',
                    background: isFormLocked ? '#EBE9ED' : '#FFF',
                    fontWeight: 'bold'
                  }} 
                />
                <button 
                  onClick={() => setBrowseOpen(true)}
                  style={{ 
                    padding: '1px 5px', 
                    fontSize: '11px', 
                    cursor: 'pointer',
                    background: '#ECE9D8',
                    border: '1px solid #7F9DB9'
                  }}
                  title="Lookup Item"
                >
                  ?
                </button>
              </div>
            </div>

            {/* Item Name */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Item Name</label>
              <input 
                type="text" 
                value={formData.itemName}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value.toUpperCase() })}
                style={{ 
                  width: '320px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }} 
              />
            </div>

            {/* Short Name */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Short Name</label>
              <input 
                type="text" 
                value={formData.shortName}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                style={{ 
                  width: '180px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }} 
              />
            </div>

            {/* Discount Allowed */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Discount Allowed</label>
              <select 
                value={formData.discountAllowed}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, discountAllowed: e.target.value })}
                style={{ 
                  width: '120px', 
                  padding: '2px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Cost % */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Cost %</label>
              <input 
                type="text" 
                value={formData.costPct}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, costPct: e.target.value })}
                style={{ 
                  width: '60px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }} 
              />
            </div>

            {/* Printer Device */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Printer Device</label>
              <input 
                type="text" 
                value={formData.printerDevice}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, printerDevice: e.target.value })}
                style={{ 
                  width: '180px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }} 
              />
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Status</label>
              <select 
                value={formData.status}
                disabled={isFormLocked}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ 
                  width: '120px', 
                  padding: '2px', 
                  border: '1px solid #7F9DB9',
                  background: isFormLocked ? '#EBE9ED' : '#FFF'
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>User</label>
              <input 
                type="text" 
                value={formData.user}
                disabled
                style={{ 
                  width: '140px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: '#EBE9ED',
                  color: '#444'
                }} 
              />
            </div>

            {/* Last Updated */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '140px', color: '#000' }}>Last Updated</label>
              <input 
                type="text" 
                value={formData.lastUpdated}
                disabled
                style={{ 
                  width: '180px', 
                  padding: '2px 4px', 
                  border: '1px solid #7F9DB9',
                  background: '#EBE9ED',
                  color: '#444'
                }} 
              />
            </div>
          </div>

          {/* Standard 9-Button Win32 Command Bar */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '6px', 
              marginTop: '16px' 
            }}
          >
            <button 
              onClick={handleAdd}
              disabled={isAdding || isModifying}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Add
            </button>
            <button 
              onClick={handleModify}
              disabled={isAdding || isModifying}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Modify
            </button>
            <button 
              onClick={handleDelete}
              disabled={isAdding || isModifying}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Delete
            </button>
            <button 
              onClick={() => setBrowseOpen(true)}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Browse
            </button>
            <button 
              onClick={handlePrevious}
              disabled={currentIndex <= 0 || isAdding || isModifying}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Previous
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex >= items.length - 1 || isAdding || isModifying}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Next
            </button>
            <button 
              onClick={handleSave}
              disabled={isFormLocked}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px', fontWeight: !isFormLocked ? 'bold' : 'normal' }}
            >
              Save
            </button>
            <button 
              onClick={() => {
                setIsAdding(false);
                setIsModifying(false);
                setFormData(items[currentIndex]);
              }}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Panel
            </button>
            <button 
              onClick={onClose}
              className="ids-btn" 
              style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* Browse Modal Sub-Dialog */}
        {browseOpen && (
          <div 
            className="ids-modal-backdrop" 
            style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div 
              style={{ 
                width: '560px', 
                background: '#ECE9D8', 
                border: '2px solid #000', 
                boxShadow: '4px 4px 12px rgba(0,0,0,0.6)',
                fontFamily: 'Tahoma, Arial, sans-serif'
              }}
            >
              <div 
                style={{ 
                  background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                  color: '#FFF', 
                  padding: '3px 8px', 
                  fontWeight: 'bold', 
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Browse - Laundry Items</span>
                <button 
                  onClick={() => setBrowseOpen(false)} 
                  style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '12px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                  <span>Search Item:</span>
                  <input 
                    type="text" 
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    placeholder="Search code or name..."
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div 
                  style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    background: '#FFF', 
                    border: '1px solid #7F9DB9' 
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Code</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Item Name</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Short Name</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Discount</th>
                        <th style={{ padding: '4px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBrowse.map((it, idx) => (
                        <tr 
                          key={it.itemCode}
                          onClick={() => {
                            const foundIdx = items.findIndex(x => x.itemCode === it.itemCode);
                            if (foundIdx !== -1) {
                              setCurrentIndex(foundIdx);
                              setFormData(items[foundIdx]);
                              setIsAdding(false);
                              setIsModifying(false);
                            }
                            setBrowseOpen(false);
                          }}
                          style={{ 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #EEE',
                            background: it.itemCode === formData.itemCode ? '#316AC5' : '#FFF',
                            color: it.itemCode === formData.itemCode ? '#FFF' : '#000'
                          }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{it.itemCode}</td>
                          <td style={{ padding: '3px 6px' }}>{it.itemName}</td>
                          <td style={{ padding: '3px 6px' }}>{it.shortName}</td>
                          <td style={{ padding: '3px 6px' }}>{it.discountAllowed}</td>
                          <td style={{ padding: '3px 6px' }}>{it.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button 
                    onClick={() => setBrowseOpen(false)}
                    className="ids-btn"
                    style={{ padding: '3px 14px', fontSize: '11px' }}
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
