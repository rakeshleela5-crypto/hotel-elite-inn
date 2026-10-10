import React, { useState } from 'react';
import './idsFortuneNext.css';

export default function IdsLaundryPlantModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onOpenMessageBox
}) {
  const [formData, setFormData] = useState({
    plantCode: 'PLT-LAU-01',
    plantName: 'Central In-House Laundry & Steam Press Plant',
    department: 'Housekeeping / Laundry',
    printerDevice: 'LAU_RECEIPT_PRN (Network Port 9100)',
    autoPrintReceipt: 'Yes',
    standardHours: '4.0',
    expressHours: '1.5',
    sacCode: '999791 (18% GST Statutory)',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: `${accountingDate} 19:44`
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsEditing(false);
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'User Defined Plant (LAU)',
        message: `Plant configuration for '${formData.plantName}' saved successfully. Printer routing updated.`,
        type: 'info'
      });
    }
  };

  const handleTestPrint = () => {
    alert(`Test print job routed to: ${formData.printerDevice}`);
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '580px', 
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
          <span>User Defined Plnt (LAU) V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px', fontSize: '11px' }}>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Plant Code</label>
                <input type="text" value={formData.plantCode} disabled style={{ width: '120px', padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Plant Name</label>
                <input 
                  type="text" 
                  value={formData.plantName} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, plantName: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Department</label>
                <input type="text" value={formData.department} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Printer Device</label>
                <input 
                  type="text" 
                  value={formData.printerDevice} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, printerDevice: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Auto-Print Slips</label>
                <select 
                  value={formData.autoPrintReceipt} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, autoPrintReceipt: e.target.value })} 
                  style={{ width: '80px', padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Std Turnaround (Hrs)</label>
                <input 
                  type="text" 
                  value={formData.standardHours} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, standardHours: e.target.value })} 
                  style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Express Turnaround (Hrs)</label>
                <input 
                  type="text" 
                  value={formData.expressHours} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, expressHours: e.target.value })} 
                  style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Statutory SAC Code</label>
                <input type="text" value={formData.sacCode} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '150px' }}>Status</label>
                <select 
                  value={formData.status} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  style={{ width: '90px', padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginBottom: '12px' }}>
            <span>User: <strong>{formData.user}</strong></span>
            <span>Last Updated: <strong>{formData.lastUpdated}</strong></span>
          </div>

          {/* Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="ids-btn" style={{ minWidth: '70px', padding: '3px 12px' }}>Modify</button>
            ) : (
              <button onClick={handleSave} className="ids-btn" style={{ minWidth: '70px', padding: '3px 12px', fontWeight: 'bold' }}>Save</button>
            )}
            <button onClick={handleTestPrint} className="ids-btn" style={{ minWidth: '90px', padding: '3px 12px' }}>Test Print</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '3px 12px' }}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
