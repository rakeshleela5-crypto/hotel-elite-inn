import React, { useState } from 'react';
import './idsFortuneNext.css';

export default function IdsLaundryHolidayTableModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2022',
  onOpenMessageBox
}) {
  const [holidays, setHolidays] = useState([
    { date: '01-JAN-2022', day: 'Saturday', desc: 'New Year Day', mode: 'Express Surcharge Only (+50%)', surcharge: '50.00', status: 'Active' },
    { date: '26-JAN-2022', day: 'Wednesday', desc: 'Republic Day', mode: 'Express Surcharge Only (+50%)', surcharge: '50.00', status: 'Active' },
    { date: '18-MAR-2022', day: 'Friday', desc: 'Holi Holiday', mode: 'Plant Closed / Off Day', surcharge: '0.00', status: 'Active' },
    { date: '15-AUG-2022', day: 'Monday', desc: 'Independence Day', mode: 'Plant Closed / Off Day', surcharge: '0.00', status: 'Active' },
    { date: '02-OCT-2022', day: 'Sunday', desc: 'Gandhi Jayanti', mode: 'Express Surcharge Only (+50%)', surcharge: '50.00', status: 'Active' },
    { date: '24-OCT-2022', day: 'Monday', desc: 'Diwali Festival', mode: 'Plant Closed / Off Day', surcharge: '0.00', status: 'Active' }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  const current = holidays[currentIndex] || holidays[0];
  const [formData, setFormData] = useState({ ...current });

  if (!isOpen) return null;

  const isFormLocked = !isAdding && !isModifying;

  const handleAdd = () => {
    setIsAdding(true);
    setIsModifying(false);
    setFormData({
      date: accountingDate,
      day: 'Thursday',
      desc: '',
      mode: 'Express Surcharge Only (+50%)',
      surcharge: '50.00',
      status: 'Active'
    });
  };

  const handleSave = () => {
    if (!formData.desc.trim()) {
      alert('Please specify the Holiday Description.');
      return;
    }
    if (isAdding) {
      setHolidays([...holidays, formData]);
      setCurrentIndex(holidays.length);
      setIsAdding(false);
    } else {
      const updated = holidays.map((h, i) => i === currentIndex ? formData : h);
      setHolidays(updated);
      setIsModifying(false);
    }
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Holiday Table',
        message: `Holiday '${formData.desc}' (${formData.date}) saved successfully.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '660px', 
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
          <span>Laundry Holiday table V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '14px', fontSize: '11px' }}>
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Holiday Date</label>
                <input 
                  type="text" 
                  value={formData.date} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Day of Week</label>
                <input 
                  type="text" 
                  value={formData.day} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
                <label style={{ width: '90px' }}>Description</label>
                <input 
                  type="text" 
                  value={formData.desc} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Operation Mode</label>
                <select 
                  value={formData.mode} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })} 
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Full Service Normal Rate">Full Service Normal Rate</option>
                  <option value="Express Surcharge Only (+50%)">Express Surcharge Only (+50%)</option>
                  <option value="Plant Closed / Off Day">Plant Closed / Off Day</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Surcharge %</label>
                <input 
                  type="text" 
                  value={formData.surcharge} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, surcharge: e.target.value })} 
                  style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Status</label>
                <select 
                  value={formData.status} 
                  disabled={isFormLocked} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  style={{ width: '100px', padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Grid */}
          <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Date</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Day</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Holiday Description</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Operation Mode</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'right' }}>Surcharge %</th>
                  <th style={{ padding: '4px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setFormData(h);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      background: idx === currentIndex ? '#DCE6F1' : '#FFF',
                      borderBottom: '1px solid #EEE' 
                    }}
                  >
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>{h.date}</td>
                    <td style={{ padding: '4px' }}>{h.day}</td>
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>{h.desc}</td>
                    <td style={{ padding: '4px' }}>{h.mode}</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>{h.surcharge}%</td>
                    <td style={{ padding: '4px' }}>{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 9-Button Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            <button onClick={handleAdd} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Add</button>
            <button onClick={() => { setIsModifying(true); setIsAdding(false); }} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Modify</button>
            <button onClick={() => {}} disabled className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Delete</button>
            <button onClick={() => {}} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Browse</button>
            <button onClick={() => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setFormData(holidays[currentIndex - 1]); } }} disabled={currentIndex <= 0} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Previous</button>
            <button onClick={() => { if (currentIndex < holidays.length - 1) { setCurrentIndex(currentIndex + 1); setFormData(holidays[currentIndex + 1]); } }} disabled={currentIndex >= holidays.length - 1} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Next</button>
            <button onClick={handleSave} disabled={isFormLocked} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px', fontWeight: !isFormLocked ? 'bold' : 'normal' }}>Save</button>
            <button onClick={() => { setIsAdding(false); setIsModifying(false); setFormData(holidays[currentIndex]); }} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Panel</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '55px', padding: '3px 8px' }}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
