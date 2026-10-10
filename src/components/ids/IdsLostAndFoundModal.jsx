import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_LOST_AND_FOUND } from '../../data/idsPmsStore';

export default function IdsLostAndFoundModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2022',
  onSaveRecord,
  onOpenMessageBox
}) {
  const [records, setRecords] = useState(INITIAL_LOST_AND_FOUND);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [helpLookupOpen, setHelpLookupOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState('Front Office');

  const currentRecord = records[currentIndex] || records[0] || {
    refNo: 'LF-2022-014',
    module: 'Front Office',
    lostDate: '27-JAN-2022',
    place: 'Room 205',
    article: 'Black Leather Men Wallet with PAN & Driving License',
    approxValue: 2500,
    finder: 'Dhonsing Terang',
    checkedBy: 'IT ADMIN',
    foundDate: '27-JAN-2022',
    foundTime: '14:15',
    custodyLocker: 'HK-LOCKER-B04',
    status: 'In Safe Custody',
    returnedDate: '',
    whom: '',
    authorizedBy: '',
    guestName: 'Mr Kumar Anil',
    guestAddress: 'Plot 44, Saheed Nagar, Bhubaneswar, Odisha',
    user: 'MANAGER',
    lastUpdated: '27-JAN-2022 20:11'
  };

  const [formData, setFormData] = useState({ ...currentRecord });

  if (!isOpen) return null;

  const isFormLocked = !isAdding && !isModifying;

  const handleAdd = () => {
    setIsAdding(true);
    setIsModifying(false);
    const nextRef = `LF-${accountingDate.slice(-4)}-${String(records.length + 1).padStart(3, '0')}`;
    setFormData({
      refNo: nextRef,
      module: selectedModule,
      lostDate: accountingDate,
      place: 'Room 205',
      article: '',
      approxValue: '',
      finder: 'Dhonsing Terang',
      checkedBy: 'IT ADMIN',
      foundDate: accountingDate,
      foundTime: '20:10',
      custodyLocker: 'HK-LOCKER-B04',
      status: 'In Safe Custody',
      returnedDate: '',
      whom: '',
      authorizedBy: '',
      guestName: 'Mr Kumar Anil',
      guestAddress: 'Plot 44, Saheed Nagar, Bhubaneswar, Odisha',
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 20:15`
    });
  };

  const handleSave = () => {
    if (!formData.article.trim()) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Validation Error',
          message: 'Please provide the Article Description.',
          type: 'error'
        });
      } else {
        alert('Please provide the Article Description.');
      }
      return;
    }

    const payload = {
      ...formData,
      lastUpdated: `${accountingDate} 20:15`
    };

    let updatedList;
    if (isAdding) {
      updatedList = [...records, payload];
      setRecords(updatedList);
      setCurrentIndex(updatedList.length - 1);
      setIsAdding(false);
    } else {
      updatedList = records.map((r, i) => i === currentIndex ? payload : r);
      setRecords(updatedList);
      setIsModifying(false);
    }

    if (onSaveRecord) {
      onSaveRecord(payload);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Lost & Found Entry',
        message: `Article '${payload.article}' (Ref #${payload.refNo}) saved in safe custody locker ${payload.custodyLocker}.`,
        type: 'info'
      });
    }
  };

  const handleMarkReturned = () => {
    setFormData({
      ...formData,
      returnedDate: accountingDate,
      whom: formData.guestName || 'Mr Kumar Anil',
      authorizedBy: 'DUTY MANAGER',
      status: 'Returned to Guest'
    });
    setIsModifying(true);
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
          <span>Lost and Found V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px' }}>
          {/* Top Bar: View Lost Articles & Module Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button 
              onClick={() => setHelpLookupOpen(true)}
              className="ids-btn" 
              style={{ padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
            >
              View Lost Articles
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <label>Module</label>
              <select 
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                style={{ width: '150px', padding: '2px', border: '1px solid #7F9DB9' }}
              >
                <option value="Front Office">Front Office</option>
                <option value="BANQUETS">BANQUETS</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
            </div>
          </div>

          {/* 4 Groupboxes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
            {/* 1. Lost Details Group */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#0A246A', marginBottom: '8px', borderBottom: '1px solid #CCC', paddingBottom: '2px' }}>
                Lost Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Reference</label>
                  <input type="text" value={formData.refNo} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Date</label>
                  <input type="text" value={formData.lostDate} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, lostDate: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Place</label>
                  <input type="text" value={formData.place} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, place: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Article</label>
                  <input type="text" value={formData.article} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, article: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Approx Value</label>
                  <input type="text" value={formData.approxValue} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, approxValue: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
              </div>
            </div>

            {/* 2. Found Details Group */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#0A246A', marginBottom: '8px', borderBottom: '1px solid #CCC', paddingBottom: '2px' }}>
                Found Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Finder</label>
                  <input type="text" value={formData.finder} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, finder: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Checked By</label>
                  <input type="text" value={formData.checkedBy} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Date & Time</label>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    <input type="text" value={formData.foundDate} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                    <input type="text" value={formData.foundTime} disabled style={{ width: '50px', padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Safe Locker</label>
                  <input type="text" value={formData.custodyLocker} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, custodyLocker: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Status</label>
                  <span style={{ fontWeight: 'bold', color: formData.status === 'In Safe Custody' ? '#C00' : '#008000' }}>{formData.status}</span>
                </div>
              </div>
            </div>

            {/* 3. Returned Details Group */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #CCC', paddingBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#0A246A' }}>Returned Details</span>
                <button onClick={handleMarkReturned} className="ids-btn" style={{ padding: '1px 6px', fontSize: '10px' }}>Return to Guest</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Date</label>
                  <input type="text" value={formData.returnedDate} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, returnedDate: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Whom</label>
                  <input type="text" value={formData.whom} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, whom: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '90px' }}>Authorized By</label>
                  <input type="text" value={formData.authorizedBy} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
              </div>
            </div>

            {/* 4. Guest Details Group */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#0A246A', marginBottom: '8px', borderBottom: '1px solid #CCC', paddingBottom: '2px' }}>
                Guest Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Name</label>
                  <input type="text" value={formData.guestName} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '80px' }}>Address</label>
                  <input type="text" value={formData.guestAddress} disabled={isFormLocked} onChange={(e) => setFormData({ ...formData, guestAddress: e.target.value })} style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Audit Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '10px', fontSize: '10px', color: '#555' }}>
            <span>User: <strong>{formData.user || 'MANAGER'}</strong></span>
            <span>Last Updated: <strong>{formData.lastUpdated || `${accountingDate} 20:11`}</strong></span>
          </div>

          {/* Standard 9-Button Command Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
            <button onClick={handleAdd} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Add</button>
            <button onClick={() => { setIsModifying(true); setIsAdding(false); }} disabled={isAdding || isModifying} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Modify</button>
            <button onClick={() => {}} disabled className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Delete</button>
            <button onClick={() => setHelpLookupOpen(true)} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Browse</button>
            <button onClick={() => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setFormData(records[currentIndex - 1]); } }} disabled={currentIndex <= 0} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Previous</button>
            <button onClick={() => { if (currentIndex < records.length - 1) { setCurrentIndex(currentIndex + 1); setFormData(records[currentIndex + 1]); } }} disabled={currentIndex >= records.length - 1} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Next</button>
            <button onClick={handleSave} disabled={isFormLocked} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px', fontWeight: !isFormLocked ? 'bold' : 'normal' }}>Save</button>
            <button onClick={() => { setIsAdding(false); setIsModifying(false); setFormData(records[currentIndex]); }} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Panel</button>
            <button onClick={onClose} className="ids-btn" style={{ minWidth: '60px', padding: '4px 10px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* Help Article Lookup Grid Modal (Video 08 Frame 036 Exactly) */}
        {helpLookupOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '640px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Help - Lost and Found Articles</span>
                <button onClick={() => setHelpLookupOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '12px' }}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px' }}>Room#/Ref.#</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px' }}>Date</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px' }}>Time</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px' }}>Place</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Article</th>
                        <th style={{ padding: '4px', width: '60px', textAlign: 'right' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, idx) => (
                        <tr 
                          key={r.refNo || idx}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setFormData(r);
                            setHelpLookupOpen(false);
                          }}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        >
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{r.refNo}</td>
                          <td style={{ padding: '4px' }}>{r.lostDate}</td>
                          <td style={{ padding: '4px' }}>{r.foundTime}</td>
                          <td style={{ padding: '4px' }}>{r.place}</td>
                          <td style={{ padding: '4px' }}>{r.article}</td>
                          <td style={{ padding: '4px', textAlign: 'right' }}>₹{r.approxValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => setHelpLookupOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Select</button>
                  <button onClick={() => setHelpLookupOpen(false)} className="ids-btn" style={{ padding: '2px 14px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
