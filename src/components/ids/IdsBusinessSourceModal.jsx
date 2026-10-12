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
        className="ids-dialog-window" 
        style={{ 
          width: '620px', 
          maxWidth: '95vw', 
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 24px rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          background: '#0f172a'
        }}
      >
        {/* Modern Luxury Header */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc', 
            padding: '14px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '6px', borderRadius: '8px', color: '#38bdf8' }}>
              <Globe size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em', color: '#f8fafc' }}>
                Business Source Master
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                IDS Fortune NEXT PMS • Rate & Distribution Channel Setup
              </div>
            </div>
          </div>
          <button 
            className="ids-win-btn close" 
            onClick={onClose}
            title="Close Dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '8px 20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div style={{ padding: '20px 22px' }}>
          
          <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', padding: '18px 20px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px 16px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Applicable From</span>
              <input 
                className="ids-input" 
                value={formData.applicableFrom} 
                onChange={(e) => handleChange('applicableFrom', e.target.value)} 
                style={{ width: '160px' }} 
              />

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Source Code</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={formData.code} 
                  onChange={(e) => handleChange('code', e.target.value)} 
                  placeholder="e.g. OTA"
                  style={{ width: '120px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  onClick={() => setBrowseModalOpen(true)}
                  title="Open Business Sources Browser (Frame 040)"
                >
                  <Search size={14} />
                </button>
              </div>

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Full Name</span>
              <input 
                className="ids-input" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. Online Travel Agent"
                style={{ width: '100%', fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Short Name</span>
              <input 
                className="ids-input" 
                value={formData.shortName || ''} 
                onChange={(e) => handleChange('shortName', e.target.value)} 
                style={{ width: '160px' }} 
              />

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Status</span>
              <select 
                className="ids-select" 
                value={formData.status} 
                onChange={(e) => handleChange('status', e.target.value)}
                style={{ width: '160px', fontWeight: 600, color: formData.status === 'Active' ? '#34d399' : '#f87171' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Audit User</span>
              <input 
                className="ids-input" 
                value={formData.user || 'MANAGER'} 
                readOnly 
                style={{ width: '160px', opacity: 0.8 }} 
              />

              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '12px' }}>Last Updated</span>
              <input 
                className="ids-input" 
                value={formData.lastUpdated || `${accountingDate} 18:02`} 
                readOnly 
                style={{ width: '200px', opacity: 0.8 }} 
              />

            </div>
          </div>

          {/* Bottom Toolbar matching Frames 010–040 */}
          <div 
            style={{ 
              background: '#1e293b', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '10px',
              padding: '10px 14px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="ids-btn-classic" onClick={handleAddNew}>Add</button>
              <button className="ids-btn-classic" onClick={() => setStatusMessage('Edit mode active. Update fields and click Save.')}>Modify</button>
              <button className="ids-btn-classic" onClick={() => alert('Delete operation requires Manager authorization.')}>Delete</button>
              <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setBrowseModalOpen(true)}>Browse</button>
              <button className="ids-btn-classic" onClick={handlePrevious}>Prev</button>
              <button className="ids-btn-classic" onClick={handleNext}>Next</button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ 
                  fontWeight: 700, 
                  minWidth: '78px', 
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  borderColor: '#38bdf8',
                  color: '#ffffff'
                }}
                onClick={handleSave}
              >
                Save
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={() => setBrowseModalOpen(true)}>Panel...</button>
              <button className="ids-btn-classic" style={{ minWidth: '65px' }} onClick={onClose}>Exit</button>
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
              style={{ width: '600px', maxWidth: '94vw', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 16px', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Select Business Source</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Search:</span>
                  <input 
                    className="ids-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search code or name..."
                    style={{ flex: 1 }} 
                  />
                </div>

                <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', background: '#0f172a', maxHeight: '260px', overflowY: 'auto' }}>
                  <table className="ids-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Code</th>
                        <th style={{ width: '130px' }}>Applicable From</th>
                        <th>Name</th>
                        <th style={{ width: '80px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourcesList
                        .filter(s => s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((s) => (
                          <tr 
                            key={s.code} 
                            className={s.code === formData.code ? 'selected' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFormData(s)}
                            onDoubleClick={() => {
                              setFormData(s);
                              setBrowseModalOpen(false);
                            }}
                          >
                            <td style={{ fontWeight: 700, color: '#38bdf8' }}>{s.code}</td>
                            <td>{s.applicableFrom}</td>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td>
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                background: s.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: s.status === 'Active' ? '#34d399' : '#f87171' 
                              }}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ 
                      fontWeight: 700, 
                      minWidth: '80px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      borderColor: '#38bdf8',
                      color: '#ffffff'
                    }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Select
                  </button>
                  <button className="ids-btn-classic" style={{ minWidth: '80px' }} onClick={() => setBrowseModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
