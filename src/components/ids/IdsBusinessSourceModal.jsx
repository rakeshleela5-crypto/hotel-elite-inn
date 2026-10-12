import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Globe, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  Save, X, CheckCircle2, FileText, Calendar, User, ShieldCheck, Tag
} from 'lucide-react';
import { createFastApiBusinessSource } from '../../utils/backendApi';

/* =========================================================================
   VIDEO 29: HOW TO ADD BUSINESS SOURCE IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Business Sources V6.5.002.1 (Frames 010–040)
   2. Entry Points (Frame 008):
      - Setup.. -> Business Sources
      - Quick Scan (Load Pgm) -> Type "business" -> "Business Sources" -> [ Load ]
      - 44-Video Tutorial Player -> Video 29 -> Launch Interactive Feature Clone
   3. Fields & Creation Flow (Frames 015–035):
      - Applicable From: 23-FEB-2026
      - Code: OTA / URO / USO / WAL / WEB / MMT
      - Name: Online Travel Agent / Unit Reservation Office / Unit Sales Office / Walkin / Website
      - Short Name: OTA / URO / USO
      - Status: Active / Inactive
      - User: MANAGER
      - Last Updated: 23-FEB-2026 18:02
   4. Action Buttons:
      - [ Add ], [ Modify ], [ Delete ], [ Browse ], [ Previous ], [ Next ], [ Save ], [ Panel... ], [ Exit ]
   5. Browse Lookup Modal (Frame 040):
      - Table Columns: Code | Applicable From | Name | Status
      - Full interactive search & selection.
   ========================================================================= */

export const INITIAL_BUSINESS_SOURCES = [
  {
    code: 'OTA',
    applicableFrom: '23-FEB-2026',
    name: 'Online Travel Agent',
    shortName: 'OTA',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:02'
  },
  {
    code: 'URO',
    applicableFrom: '23-FEB-2026',
    name: 'Unit Reservation Office',
    shortName: 'URO',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:03'
  },
  {
    code: 'USO',
    applicableFrom: '23-FEB-2026',
    name: 'Unit Sales Office',
    shortName: 'USO',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:02'
  },
  {
    code: 'WAL',
    applicableFrom: '23-FEB-2026',
    name: 'Walkin',
    shortName: 'WAL',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 17:55'
  },
  {
    code: 'WEB',
    applicableFrom: '23-FEB-2026',
    name: 'Website Direct Booking',
    shortName: 'WEB',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 17:58'
  },
  {
    code: 'MMT',
    applicableFrom: '15-SEP-2021',
    name: 'MakeMyTrip India',
    shortName: 'MMT',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '15-SEP-2021 11:20'
  },
  {
    code: 'BKG',
    applicableFrom: '01-JAN-2026',
    name: 'Booking.com Online',
    shortName: 'BKG',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2026 10:00'
  },
  {
    code: 'DIR',
    applicableFrom: '01-JAN-2026',
    name: 'Direct Guest / Corporate Call',
    shortName: 'DIR',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2026 10:05'
  }
];

export default function IdsBusinessSourceModal({
  isOpen,
  onClose,
  initialCode = 'OTA',
  accountingDate = '23-FEB-2026',
  onSaveBusinessSource
}) {
  const [sourcesList, setSourcesList] = useState(INITIAL_BUSINESS_SOURCES);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form State matching Video 29 Frames 015–035
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_BUSINESS_SOURCES.find(s => s.code === initialCode);
    return found || INITIAL_BUSINESS_SOURCES[0];
  });

  // Lookup modal
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add New Source
  const handleAddNew = () => {
    const newRecord = {
      code: '',
      applicableFrom: accountingDate,
      name: '',
      shortName: '',
      status: 'Active',
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 18:05`
    };
    setFormData(newRecord);
    setStatusMessage('Enter new Business Source Code & Name, then click Save.');
  };

  // Save
  const handleSave = () => {
    if (!formData.code.trim()) {
      alert('Please enter Business Source Code.');
      return;
    }
    if (!formData.name.trim()) {
      alert('Please enter Business Source Name.');
      return;
    }

    const updatedRecord = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      shortName: formData.shortName || formData.code.trim().toUpperCase(),
      lastUpdated: `${accountingDate} 18:05`
    };

    setSourcesList(prev => {
      const exists = prev.some(s => s.code === updatedRecord.code);
      if (exists) {
        return prev.map(s => s.code === updatedRecord.code ? updatedRecord : s);
      }
      return [...prev, updatedRecord];
    });

    setStatusMessage(`Business Source [${updatedRecord.code}] "${updatedRecord.name}" saved successfully!`);

    // Auto-sync business source to Railway PostgreSQL
    createFastApiBusinessSource({
      code: updatedRecord.code,
      name: updatedRecord.name,
      short_name: updatedRecord.shortName,
      applicable_from: updatedRecord.applicableFrom || accountingDate,
      status: updatedRecord.status || 'Active',
      user: updatedRecord.user || 'MANAGER'
    }).catch(err => console.warn('[FastAPI] Business source cloud sync failed:', err));

    if (onSaveBusinessSource) {
      onSaveBusinessSource(updatedRecord);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Previous & Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(sourcesList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(sourcesList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setFormData(sourcesList[newIdx]);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className={`ids-dialog-window ${isMaximized ? 'maximized' : ''}`} 
        style={{ 
          width: isMaximized ? '1024px' : '860px', 
          maxWidth: '98vw', 
          boxShadow: '0 14px 44px rgba(0,0,0,0.65), 0 3px 10px rgba(0,0,0,0.4)', 
          border: '2px outset #FFFFFF',
          borderRightColor: '#555544',
          borderBottomColor: '#555544',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar with Working Maximize / Restore Window Controls */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 65%, #A6CAF0 100%)', 
            color: '#FFF', 
            height: '32px',
            padding: '0 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
            <span className="ids-logo-badge">IDS</span>
            <span>Business Sources V6.5.002.1 — IDS Fortune NEXT PMS</span>
          </div>
          <div className="ids-titlebar-buttons">
            <button className="ids-win-btn" title="Minimize">_</button>
            <button 
              className="ids-win-btn" 
              title={isMaximized ? "Restore Down" : "Maximize (15\" 4:3 Workstation)"} 
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              className="ids-win-btn close" 
              onClick={onClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Form Body matching Frame 015 & Frame 030 */}
        <div style={{ padding: '16px 20px', fontSize: '11px' }}>
          
          <div style={{ border: '2px groove #FFFFFF', background: '#ECE9D8', padding: '18px 22px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px 18px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Applicable From</span>
              <input 
                className="ids-input" 
                value={formData.applicableFrom} 
                onChange={(e) => handleChange('applicableFrom', e.target.value)} 
                style={{ width: '180px', height: '28px' }} 
              />

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Code</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={formData.code} 
                  onChange={(e) => handleChange('code', e.target.value)} 
                  placeholder="e.g. OTA"
                  style={{ width: '130px', height: '28px', fontWeight: 800, background: '#FFF7CC', textTransform: 'uppercase', color: '#0A246A' }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '30px', height: '28px', padding: 0, fontWeight: 800 }} 
                  onClick={() => setBrowseModalOpen(true)}
                  title="Open Business Sources Browser (Frame 040)"
                >
                  ?
                </button>
              </div>

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Name</span>
              <input 
                className="ids-input" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. Online Travel Agent"
                style={{ width: '100%', height: '28px', fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Short Name</span>
              <input 
                className="ids-input" 
                value={formData.shortName || ''} 
                onChange={(e) => handleChange('shortName', e.target.value)} 
                style={{ width: '180px', height: '28px' }} 
              />

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Status</span>
              <select 
                className="ids-select" 
                value={formData.status} 
                onChange={(e) => handleChange('status', e.target.value)}
                style={{ width: '180px', height: '28px', fontWeight: 700, color: formData.status === 'Active' ? '#137333' : '#C5221F' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>User</span>
              <input 
                className="ids-input" 
                value={formData.user || 'MANAGER'} 
                readOnly 
                style={{ width: '180px', height: '28px', background: '#F0F0F0' }} 
              />

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Last Updated</span>
              <input 
                className="ids-input" 
                value={formData.lastUpdated || `${accountingDate} 18:02`} 
                readOnly 
                style={{ width: '220px', height: '28px', background: '#F0F0F0' }} 
              />

            </div>
          </div>

          {/* Bottom Toolbar matching Frames 010–040 */}
          <div 
            style={{ 
              background: '#DFDBC9', 
              border: '2px solid #716F64', 
              borderTopColor: '#FFFFFF',
              borderLeftColor: '#FFFFFF',
              padding: '8px 14px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="ids-btn-classic" onClick={handleAddNew}>Add</button>
              <button className="ids-btn-classic" onClick={() => setStatusMessage('Edit mode active. Update fields and click Save.')}>Modify</button>
              <button className="ids-btn-classic" onClick={() => alert('Delete operation requires Manager authorization.')}>Delete</button>
              <button className="ids-btn-classic" style={{ fontWeight: 800 }} onClick={() => setBrowseModalOpen(true)}>Browse</button>
              <button className="ids-btn-classic" onClick={handlePrevious}>Previous</button>
              <button className="ids-btn-classic" onClick={handleNext}>Next</button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 800, minWidth: '85px', background: '#DCE6F1', borderColor: '#316AC5' }}
                onClick={handleSave}
              >
                Save
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={() => setBrowseModalOpen(true)}>Panel...</button>
              <button className="ids-btn-classic" style={{ minWidth: '75px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            FRAME 040: BUSINESS SOURCES V6.5.002.1 BROWSE LOOKUP MODAL
            ========================================================================= */}
        {browseModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBrowseModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '740px', maxWidth: '96vw', background: '#ECE9D8', border: '2px outset #FFFFFF', borderRightColor: '#555544', borderBottomColor: '#555544', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', height: '32px', padding: '0 10px', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Select Business Source</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '14px 18px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Search:</span>
                  <input 
                    className="ids-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search code or name..."
                    style={{ flex: 1, height: '28px' }} 
                  />
                </div>

                <div style={{ border: '2px inset #FFFFFF', borderRightColor: '#716F64', borderBottomColor: '#716F64', background: '#FFF', maxHeight: '320px', overflowY: 'auto' }}>
                  <table className="ids-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '90px' }}>Code</th>
                        <th style={{ width: '150px' }}>Applicable From</th>
                        <th>Name</th>
                        <th style={{ width: '90px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourcesList
                        .filter(s => s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((s, idx) => (
                          <tr 
                            key={s.code} 
                            style={{ 
                              cursor: 'pointer', 
                              borderBottom: '1px solid #EEE',
                              background: s.code === formData.code ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                              color: s.code === formData.code ? '#FFF' : '#000'
                            }}
                            onClick={() => setFormData(s)}
                            onDoubleClick={() => {
                              setFormData(s);
                              setBrowseModalOpen(false);
                            }}
                          >
                            <td style={{ fontWeight: 800, padding: '6px 10px' }}>{s.code}</td>
                            <td style={{ padding: '6px 10px' }}>{s.applicableFrom}</td>
                            <td style={{ fontWeight: 600, padding: '6px 10px' }}>{s.name}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: s.code === formData.code ? '#FFF' : s.status === 'Active' ? '#137333' : '#C5221F' }}>
                              {s.status}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 800, minWidth: '85px', background: '#DCE6F1' }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Select
                  </button>
                  <button className="ids-btn-classic" style={{ minWidth: '85px' }} onClick={() => setBrowseModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
