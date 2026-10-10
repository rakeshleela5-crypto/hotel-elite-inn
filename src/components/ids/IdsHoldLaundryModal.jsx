import React, { useState } from 'react';
import './idsFortuneNext.css';

export default function IdsHoldLaundryModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onOpenMessageBox
}) {
  const [heldBags, setHeldBags] = useState([
    {
      refNo: 'HL-PKG-012',
      roomNo: '205',
      guestName: 'Mr Kumar Anil',
      pcs: 4,
      reason: 'Special Chemical Stain Treatment in Progress',
      holdDate: '27-JAN-2026 18:30',
      expectedRelease: '28-JAN-2026 10:00',
      storageBin: 'HK-LAU-BIN-08',
      status: 'On Hold',
      handledBy: '006 Sunil Mohapatra'
    },
    {
      refNo: 'HL-PKG-009',
      roomNo: '301',
      guestName: 'Biswakarma Santosh',
      pcs: 2,
      reason: 'Guest Out of Station / Delivery on Hold',
      holdDate: '26-JAN-2026 20:15',
      expectedRelease: '28-JAN-2026 14:00',
      storageBin: 'HK-LAU-BIN-03',
      status: 'On Hold',
      handledBy: '002 Ramesh Nayak'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const current = heldBags[currentIndex] || heldBags[0];

  const [formData, setFormData] = useState({ ...current });

  if (!isOpen) return null;

  const handleAddNew = () => {
    setIsAdding(true);
    setFormData({
      refNo: `HL-PKG-${String(heldBags.length + 13).padStart(3, '0')}`,
      roomNo: '201',
      guestName: 'Sharma Raj',
      pcs: 3,
      reason: 'Guest Requested Specific Evening Delivery Slot',
      holdDate: `${accountingDate} 19:40`,
      expectedRelease: `${accountingDate} 21:30`,
      storageBin: 'HK-LAU-BIN-05',
      status: 'On Hold',
      handledBy: '006 Sunil Mohapatra'
    });
  };

  const handleSave = () => {
    if (isAdding) {
      setHeldBags([...heldBags, formData]);
      setCurrentIndex(heldBags.length);
      setIsAdding(false);
    } else {
      const updated = heldBags.map((b, i) => i === currentIndex ? formData : b);
      setHeldBags(updated);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Hold Laundry Entry',
        message: `Laundry bag ${formData.refNo} (Room ${formData.roomNo}) registered to hold storage bin ${formData.storageBin}.`,
        type: 'info'
      });
    }
  };

  const handleRelease = (idx) => {
    const updated = heldBags.map((b, i) => i === idx ? { ...b, status: 'Released to Delivery' } : b);
    setHeldBags(updated);
    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Laundry Packet Released',
        message: `Laundry bag ${heldBags[idx].refNo} released for room delivery.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '740px', 
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
          <span>Hold Laundry V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px', fontSize: '11px' }}>
          {/* Header Form */}
          <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Bag Ref#</label>
                <input type="text" value={formData.refNo} disabled style={{ width: '110px', padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Room#</label>
                <input type="text" value={formData.roomNo} onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })} style={{ width: '70px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Guest Name</label>
                <input type="text" value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Items (Pcs)</label>
                <input type="number" value={formData.pcs} onChange={(e) => setFormData({ ...formData, pcs: e.target.value })} style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
                <label style={{ width: '90px' }}>Hold Reason</label>
                <select 
                  value={formData.reason} 
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                >
                  <option value="Guest Out of Station / Delivery on Hold">Guest Out of Station / Delivery on Hold</option>
                  <option value="External Vendor Dry-Cleaner Turnaround Delay">External Vendor Dry-Cleaner Turnaround Delay</option>
                  <option value="Special Chemical Stain Treatment in Progress">Special Chemical Stain Treatment in Progress</option>
                  <option value="Guest Requested Specific Evening Delivery Slot">Guest Requested Specific Evening Delivery Slot</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Storage Bin</label>
                <input type="text" value={formData.storageBin} onChange={(e) => setFormData({ ...formData, storageBin: e.target.value })} style={{ width: '130px', padding: '2px 4px', border: '1px solid #7F9DB9' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Expected Date</label>
                <input type="text" value={formData.expectedRelease} onChange={(e) => setFormData({ ...formData, expectedRelease: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Status</label>
                <span style={{ fontWeight: 'bold', color: formData.status === 'On Hold' ? '#C00' : '#008000' }}>{formData.status}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '90px' }}>Handled By</label>
                <input type="text" value={formData.handledBy} onChange={(e) => setFormData({ ...formData, handledBy: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
              </div>
            </div>
          </div>

          {/* Active Held Bags Grid */}
          <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Bag Ref#</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Room#</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Guest Name</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC', textAlign: 'center' }}>Pcs</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Hold Reason</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Bin Location</th>
                  <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Status</th>
                  <th style={{ padding: '4px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {heldBags.map((b, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setFormData(b);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      background: idx === currentIndex ? '#DCE6F1' : '#FFF',
                      borderBottom: '1px solid #EEE' 
                    }}
                  >
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>{b.refNo}</td>
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>{b.roomNo}</td>
                    <td style={{ padding: '4px' }}>{b.guestName}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>{b.pcs}</td>
                    <td style={{ padding: '4px' }}>{b.reason}</td>
                    <td style={{ padding: '4px' }}>{b.storageBin}</td>
                    <td style={{ padding: '4px', fontWeight: 'bold', color: b.status === 'On Hold' ? '#C00' : '#008000' }}>{b.status}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>
                      {b.status === 'On Hold' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRelease(idx);
                          }}
                          className="ids-btn" 
                          style={{ padding: '1px 6px', fontSize: '10px' }}
                        >
                          Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button onClick={handleAddNew} className="ids-btn" style={{ minWidth: '80px', padding: '3px 12px' }}>Hold Packet</button>
            <button onClick={handleSave} className="ids-btn" style={{ minWidth: '70px', padding: '3px 12px', fontWeight: 'bold' }}>Save</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '3px 12px' }}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
