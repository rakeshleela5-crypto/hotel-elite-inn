import React, { useState } from 'react';
import './idsFortuneNext.css';
import { INITIAL_LOST_AND_FOUND } from '../../data/idsPmsStore';

export default function IdsLostAndFoundModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onSaveRecord,
  onOpenMessageBox
}) {
  const [records, setRecords] = useState(INITIAL_LOST_AND_FOUND);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [helpLookupOpen, setHelpLookupOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState('Front Office');
  const [reportEngineOpen, setReportEngineOpen] = useState(false);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [reportEngineConfig, setReportEngineConfig] = useState({
    option: 'Display',
    deviceName: 'Microsoft Print to PDF',
    startPage: '1',
    endPage: '1',
    copies: '1',
    orientation: 'Portrait',
    height: '11.00 in',
    zoom: '80',
    fontSize: '10',
    outputFormat: 'Excel'
  });

  const currentRecord = records[currentIndex] || records[0] || {
    refNo: 'LF-2026-014',
    module: 'Front Office',
    lostDate: '27-JAN-2026',
    place: 'Room 205',
    article: 'Black Leather Men Wallet with PAN & Driving License',
    approxValue: 2500,
    finder: 'Ramesh Nayak',
    checkedBy: 'IT ADMIN',
    foundDate: '27-JAN-2026',
    foundTime: '14:15',
    custodyLocker: 'HK-LOCKER-B04',
    status: 'In Safe Custody',
    returnedDate: '',
    whom: '',
    authorizedBy: '',
    guestName: 'Mr Kumar Anil',
    guestAddress: 'Plot 44, Saheed Nagar, Bhubaneswar, Odisha',
    user: 'MANAGER',
    lastUpdated: '27-JAN-2026 20:11'
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
      finder: 'Ramesh Nayak',
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
              onClick={() => setReportEngineOpen(true)}
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

        {/* IDS Report Engine Modal Dialog (HK Video 08 Frame 059 Exactly) */}
        {reportEngineOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '480px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 14px rgba(0,0,0,0.6)', fontFamily: 'Tahoma, Arial, sans-serif' }}>
              <div style={{ background: 'linear-gradient(90deg, #4A76A8 0%, #8BAEC9 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#217346', color: '#FFF', padding: '1px 4px', fontSize: '10px', borderRadius: '2px' }}>Excel</span>
                  <span>IDS Report Engine</span>
                </div>
                <button onClick={() => setReportEngineOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px', fontSize: '11px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Option</label>
                    <select 
                      value={reportEngineConfig.option} 
                      onChange={(e) => setReportEngineConfig({ ...reportEngineConfig, option: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Display">Display</option>
                      <option value="Print">Print</option>
                      <option value="File">File</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Device Name</label>
                    <select 
                      value={reportEngineConfig.deviceName} 
                      onChange={(e) => setReportEngineConfig({ ...reportEngineConfig, deviceName: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                      <option value="HP LaserJet Professional">HP LaserJet Professional</option>
                      <option value="Default Windows Printer">Default Windows Printer</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ width: '100px' }}>Start Page #</label>
                    <input type="text" value={reportEngineConfig.startPage} readOnly style={{ width: '40px', padding: '2px', border: '1px solid #7F9DB9' }} />
                    <label style={{ marginLeft: '12px' }}>End Page #</label>
                    <input type="text" value={reportEngineConfig.endPage} readOnly style={{ width: '40px', padding: '2px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Copies</label>
                    <input type="text" value={reportEngineConfig.copies} readOnly style={{ width: '40px', padding: '2px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Orientation</label>
                    <select value={reportEngineConfig.orientation} onChange={(e) => setReportEngineConfig({ ...reportEngineConfig, orientation: e.target.value })} style={{ width: '120px', padding: '2px', border: '1px solid #7F9DB9' }}>
                      <option value="Portrait">Portrait</option>
                      <option value="Landscape">Landscape</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ width: '100px' }}>Height</label>
                    <input type="text" value={reportEngineConfig.height} readOnly style={{ width: '70px', padding: '2px', border: '1px solid #7F9DB9' }} />
                    <label style={{ marginLeft: '12px' }}>Zoom</label>
                    <input type="text" value={reportEngineConfig.zoom} readOnly style={{ width: '40px', padding: '2px', border: '1px solid #7F9DB9' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px' }}>Font Size</label>
                    <select value={reportEngineConfig.fontSize} onChange={(e) => setReportEngineConfig({ ...reportEngineConfig, fontSize: e.target.value })} style={{ width: '60px', padding: '2px', border: '1px solid #7F9DB9' }}>
                      <option value="8">8</option>
                      <option value="10">10</option>
                      <option value="12">12</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ width: '94px' }}>Output Format</label>
                      <span style={{ fontWeight: 'bold', color: '#217346' }}>Microsoft Excel (*.xlsx)</span>
                    </div>
                    {/* Retro IDS Softwares Brand Logo Stamp matching Video 08 */}
                    <div style={{ border: '1px solid #999', padding: '2px 8px', borderRadius: '3px', background: '#F8F8F8', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#0A246A', letterSpacing: '1px' }}>IDS</div>
                      <div style={{ fontSize: '8px', color: '#666', marginTop: '-2px' }}>SOFTWARES</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <button 
                    onClick={() => {
                      setReportEngineOpen(false);
                      setExcelPreviewOpen(true);
                    }} 
                    className="ids-btn" 
                    style={{ minWidth: '80px', padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    Continue
                  </button>
                  <button onClick={() => setReportEngineOpen(false)} className="ids-btn" style={{ minWidth: '80px', padding: '3px 14px', fontSize: '11px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentic Microsoft Excel Export Modal (HK Video 08 Frame 067 Exactly) */}
        {excelPreviewOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '820px', maxWidth: '96vw', background: '#F3F3F3', border: '2px solid #217346', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
              {/* Excel Green Header & Ribbon Bar */}
              <div style={{ background: '#217346', color: '#FFF', padding: '4px 8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Book1 - Returned Details Receipt - On {accountingDate} - Excel</span>
                <button onClick={() => setExcelPreviewOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              {/* Excel Ribbon Tabs */}
              <div style={{ background: '#FFF', borderBottom: '1px solid #D4D4D4', padding: '4px 8px', display: 'flex', gap: '14px', fontSize: '11px', color: '#333' }}>
                <span style={{ background: '#217346', color: '#FFF', padding: '1px 6px', fontWeight: 'bold' }}>FILE</span>
                <span style={{ fontWeight: 'bold', borderBottom: '2px solid #217346', paddingBottom: '2px' }}>HOME</span>
                <span>INSERT</span>
                <span>PAGE LAYOUT</span>
                <span>FORMULAS</span>
                <span>DATA</span>
                <span>REVIEW</span>
                <span>VIEW</span>
              </div>

              {/* Excel Formula Toolbar */}
              <div style={{ background: '#F8F9FA', borderBottom: '1px solid #D4D4D4', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Arial 10</span>
                <span style={{ border: '1px solid #CCC', padding: '1px 4px', background: '#FFF', fontWeight: 'bold' }}>B</span>
                <span style={{ border: '1px solid #CCC', padding: '1px 4px', background: '#FFF', fontStyle: 'italic' }}>I</span>
                <span style={{ color: '#999' }}>|</span>
                <span style={{ fontWeight: 'bold', color: '#777' }}>fx</span>
                <input type="text" readOnly value={`=CONCATENATE("Returned Receipt - ", "${formData.guestName}")`} style={{ flex: 1, padding: '1px 4px', border: '1px solid #CCC', background: '#FFF', fontSize: '11px' }} />
              </div>

              {/* Excel Sheet Body Grid matching Frame 067 */}
              <div style={{ padding: '10px', background: '#E1E1E1' }}>
                <div style={{ background: '#FFF', border: '1px solid #C0C0C0', padding: '16px', maxHeight: '360px', overflowY: 'auto', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
                  {/* Excel Content Rows */}
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                    HOTEL ELITE INN - HOUSEKEEPING LOST & FOUND RETURN RECEIPT
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '11px' }}>
                    <tbody>
                      <tr style={{ background: '#F0F0F0', borderBottom: '1px solid #000' }}>
                        <td colSpan="2" style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A' }}>Guest Details</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', width: '140px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Room#</td>
                        <td style={{ padding: '4px 8px' }}>{formData.place || '201'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Guest Name</td>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{formData.guestName || 'Sharma Raj'}</td>
                      </tr>

                      <tr style={{ background: '#F0F0F0', borderBottom: '1px solid #000' }}>
                        <td colSpan="2" style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A', paddingTop: '8px' }}>Lost Details</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Article</td>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{formData.article || 'Mobile phone'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Lost Date & Time</td>
                        <td style={{ padding: '4px 8px' }}>{formData.lostDate || accountingDate} 20:11</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Lost Place</td>
                        <td style={{ padding: '4px 8px' }}>{formData.place || 'Hotel Lobby'}</td>
                      </tr>

                      <tr style={{ background: '#F0F0F0', borderBottom: '1px solid #000' }}>
                        <td colSpan="2" style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A', paddingTop: '8px' }}>Found Details</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Found Date & Time</td>
                        <td style={{ padding: '4px 8px' }}>{formData.foundDate || accountingDate} {formData.foundTime || '20:12'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Checked By</td>
                        <td style={{ padding: '4px 8px' }}>{formData.checkedBy || 'Mr. Singh'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Found Place</td>
                        <td style={{ padding: '4px 8px' }}>Lobby Lounge</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Found By</td>
                        <td style={{ padding: '4px 8px' }}>{formData.finder || 'Mr. Swaraj'}</td>
                      </tr>

                      <tr style={{ background: '#F0F0F0', borderBottom: '1px solid #000' }}>
                        <td colSpan="2" style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A', paddingTop: '8px' }}>Returned Details</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Return Date</td>
                        <td style={{ padding: '4px 8px' }}>{formData.returnedDate || accountingDate}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Return To</td>
                        <td style={{ padding: '4px 8px' }}>{formData.whom || formData.guestName || 'Mr. Sharma'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #DDD' }}>Authorized By</td>
                        <td style={{ padding: '4px 8px' }}>{formData.authorizedBy || 'Supervisor'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Signatures matching Frame 067 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #000' }}>
                    <div style={{ width: '220px' }}>
                      <div style={{ fontSize: '11px' }}>Received by:</div>
                      <div style={{ marginTop: '20px', borderBottom: '1px solid #000', width: '180px' }}></div>
                      <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>(Guest Signature)</div>
                    </div>
                    <div style={{ width: '220px', textAlign: 'right' }}>
                      <div style={{ fontSize: '11px' }}>Issued By:</div>
                      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>MANAGER</div>
                      <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>(Housekeeping Executive)</div>
                    </div>
                  </div>
                </div>

                {/* Excel Bottom Sheets Tab Bar matching Frame 067 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0F0F0', borderTop: '1px solid #CCC', padding: '4px 8px', marginTop: '4px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ background: '#FFF', border: '1px solid #CCC', borderBottom: 'none', padding: '2px 10px', fontWeight: 'bold', color: '#217346' }}>Sheet2</span>
                    <span style={{ padding: '2px 10px', color: '#666' }}>Sheet1</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => window.print()} className="ids-btn" style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 'bold' }}>🖨️ Print Sheet</button>
                    <button onClick={() => alert("Spreadsheet exported as 'Book1 - Returned Details Receipt.xlsx'")} className="ids-btn" style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 'bold', color: '#217346' }}>💾 Save .XLSX</button>
                    <button onClick={() => setExcelPreviewOpen(false)} className="ids-btn" style={{ padding: '2px 10px', fontSize: '11px' }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
