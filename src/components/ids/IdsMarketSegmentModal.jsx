import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  PieChart, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  Save, X, CheckCircle2, FileText, Calendar, User, ShieldCheck, Tag,
  AlertTriangle
} from 'lucide-react';
import { createFastApiMarketSegment } from '../../utils/backendApi';

/* =========================================================================
   VIDEO 30: HOW TO ADD MARKET SEGMENT IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Market Segments V6.5.002.1 (Frames 010–050)
   2. Entry Points (Frame 008):
      - Setup.. -> Market Segments
      - Quick Scan (Load Pgm) -> Type "market" or "segment" -> "Market Segments" -> [ Load ]
      - 44-Video Tutorial Player -> Video 30 -> Launch Interactive Feature Clone
   3. Fields & Creation Flow (Frames 015–040):
      - Applicable From: 23-FEB-2026
      - Code: AIR / CON / CVG / FIT / MAR / NCV / CORP / GRP
      - Name: Airlines / Conference / CVGR / FIT / Marriage / Non CVGR / Corporate Business / Group Tour
      - Short Name: AIR / CON / CVG / FIT / MAR / NCV
      - Status: Active / Inactive
      - User: MANAGER
      - Last Updated: 23-FEB-2026 18:01
   4. Action Buttons (Frames 012–044):
      - [ Add ], [ Modify ], [ Delete ], [ Browse ], [ Previous ], [ Next ], [ Save ], [ Panel... ], [ Exit ]
   5. Browse Lookup Modal (Frame 044):
      - Table Columns: Code | Applicable From | Name | Status
      - Full interactive search, double-click & selection.
   6. System Information Dialog (Frame 012):
      - ID: GENH007 MSG CODE: 10
   ========================================================================= */

export const INITIAL_MARKET_SEGMENTS = [
  {
    code: 'AIR',
    applicableFrom: '23-FEB-2026',
    name: 'Airlines Crew & Passenger Layover',
    shortName: 'AIR',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'CON',
    applicableFrom: '23-FEB-2026',
    name: 'Conference & Event Delegations',
    shortName: 'Conference',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'CVG',
    applicableFrom: '23-FEB-2026',
    name: 'CVGR (Commercial Volume Guaranteed Rate)',
    shortName: 'CVG',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'FIT',
    applicableFrom: '23-FEB-2026',
    name: 'FIT (Free Independent Traveler)',
    shortName: 'FIT',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'MAR',
    applicableFrom: '23-FEB-2026',
    name: 'Marriage & Banquet Guest Rooms',
    shortName: 'Marriage',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'NCV',
    applicableFrom: '23-FEB-2026',
    name: 'Non CVGR (Retail Corporate Rate)',
    shortName: 'Non CVGR',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:01'
  },
  {
    code: 'CORP',
    applicableFrom: '01-JAN-2026',
    name: 'Corporate Contracted Business',
    shortName: 'CORP',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2026 10:15'
  },
  {
    code: 'GRP',
    applicableFrom: '01-JAN-2026',
    name: 'Group Leisure & Pilgrim Series',
    shortName: 'GRP',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2026 10:20'
  }
];

export default function IdsMarketSegmentModal({
  isOpen,
  onClose,
  initialCode = 'CVG',
  accountingDate = '23-FEB-2026',
  onSaveMarketSegment
}) {
  const [segmentsList, setSegmentsList] = useState(INITIAL_MARKET_SEGMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form State matching Video 30 Frames 015–040
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_MARKET_SEGMENTS.find(s => s.code === initialCode);
    return found || INITIAL_MARKET_SEGMENTS[0];
  });

  // Lookup modal
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showGenh007Info, setShowGenh007Info] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add New Segment
  const handleAddNew = () => {
    const newRecord = {
      code: '',
      applicableFrom: accountingDate,
      name: '',
      shortName: '',
      status: 'Active',
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 18:01`
    };
    setFormData(newRecord);
    setStatusMessage('Enter new Market Segment Code & Name, then click Save.');
  };

  // Save
  const handleSave = () => {
    if (!formData.code.trim()) {
      alert('Please enter Market Segment Code.');
      return;
    }
    if (!formData.name.trim()) {
      alert('Please enter Market Segment Name.');
      return;
    }

    const updatedRecord = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      shortName: formData.shortName || formData.code.trim().toUpperCase(),
      lastUpdated: `${accountingDate} 18:01`
    };

    setSegmentsList(prev => {
      const exists = prev.some(s => s.code === updatedRecord.code);
      if (exists) {
        return prev.map(s => s.code === updatedRecord.code ? updatedRecord : s);
      }
      return [...prev, updatedRecord];
    });

    setStatusMessage(`Market Segment [${updatedRecord.code}] "${updatedRecord.name}" saved successfully!`);

    // Auto-sync market segment to Railway PostgreSQL
    createFastApiMarketSegment({
      code: updatedRecord.code,
      name: updatedRecord.name,
      short_name: updatedRecord.shortName,
      applicable_from: updatedRecord.applicableFrom || accountingDate,
      status: updatedRecord.status || 'Active',
      user: updatedRecord.user || 'MANAGER'
    }).catch(err => console.warn('[FastAPI] Market segment cloud sync failed:', err));

    if (onSaveMarketSegment) {
      onSaveMarketSegment(updatedRecord);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Previous & Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(segmentsList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(segmentsList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setFormData(segmentsList[newIdx]);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className={`ids-dialog-window ${isMaximized ? 'maximized' : ''}`} 
        style={{ 
          width: isMaximized ? '98vw' : '860px', 
          maxWidth: '98vw', 
          boxShadow: '0 14px 44px rgba(0,0,0,0.65), 0 3px 10px rgba(0,0,0,0.4)', 
          border: '2px outset #FFFFFF',
          borderRightColor: '#555544',
          borderBottomColor: '#555544',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar with Working Maximize / Restore Controls */}
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
            <span>Market Segments V6.5.002.1 — IDS Fortune NEXT PMS</span>
          </div>
          <div className="ids-titlebar-buttons">
            <button className="ids-win-btn" title="Minimize">_</button>
            <button 
              className="ids-win-btn" 
              title={isMaximized ? "Restore Down" : "Maximize Full Desktop"} 
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
        <div style={{ padding: '18px 24px', fontSize: '13px' }}>
          
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
                  placeholder="e.g. CVG"
                  style={{ width: '130px', height: '28px', fontWeight: 800, background: '#FFF7CC', textTransform: 'uppercase', color: '#0A246A' }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '30px', height: '28px', padding: 0, fontWeight: 800 }} 
                  onClick={() => setBrowseModalOpen(true)}
                  title="Open Market Segments Browser (Frame 044)"
                >
                  ?
                </button>
              </div>

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Name</span>
              <input 
                className="ids-input" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. CVGR / Free Independent Traveler"
                style={{ width: '100%', height: '28px', fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>Short Name</span>
              <input 
                className="ids-input" 
                value={formData.shortName || ''} 
                onChange={(e) => handleChange('shortName', e.target.value)} 
                placeholder="e.g. CVG / FIT"
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
                value={formData.lastUpdated || `${accountingDate} 18:01`} 
                readOnly 
                style={{ width: '220px', height: '28px', background: '#F0F0F0' }} 
              />

            </div>
          </div>

          {/* Bottom Toolbar matching Frames 010–044 */}
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
            FRAME 012: SYSTEM INFORMATION DIALOG (GENH007 / MSG CODE: 10)
            ========================================================================= */}
        {showGenh007Info && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setShowGenh007Info(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '380px', maxWidth: '90vw', background: '#FFFFE1', border: '1px solid #D4D0C8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', padding: '16px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={32} color="#F9AB00" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#000', marginBottom: '6px' }}>
                    Market Segments
                  </div>
                  <div style={{ fontSize: '11px', color: '#333', marginBottom: '12px' }}>
                    No information to be displayed for the given Search Criteria.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#666', fontWeight: 600 }}>
                      ID: GENH007 &nbsp;&nbsp;&nbsp; MSG CODE: 10
                    </span>
                    <button 
                      className="ids-btn-classic" 
                      style={{ minWidth: '60px', fontWeight: 700 }}
                      onClick={() => setShowGenh007Info(false)}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FRAME 044: MARKET SEGMENTS V6.5.002.1 BROWSE LOOKUP MODAL
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
                <span>Select Market Segment</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '14px 18px', fontSize: '13px' }}>
                {/* Search Header */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <Search size={16} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Search Segment:</span>
                  <input 
                    className="ids-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search by Code or Name..."
                    style={{ flex: 1, height: '28px' }}
                    autoFocus
                  />
                </div>

                {/* Table Data matching Frame 044 */}
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
                      {segmentsList
                        .filter(s => 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((seg, idx) => {
                          const isSelected = formData.code === seg.code;
                          return (
                            <tr 
                              key={seg.code}
                              onClick={() => {
                                setFormData(seg);
                                setCurrentIndex(idx);
                              }}
                              onDoubleClick={() => {
                                setFormData(seg);
                                setCurrentIndex(idx);
                                setBrowseModalOpen(false);
                              }}
                              style={{ 
                                background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                                color: isSelected ? '#FFF' : '#000',
                                cursor: 'pointer',
                                borderBottom: '1px solid #E0E0E0'
                              }}
                            >
                              <td style={{ padding: '6px 10px', fontWeight: 800 }}>{seg.code}</td>
                              <td style={{ padding: '6px 10px' }}>{seg.applicableFrom}</td>
                              <td style={{ padding: '6px 10px', fontWeight: 600 }}>{seg.name}</td>
                              <td style={{ padding: '6px 10px', color: isSelected ? '#FFF' : seg.status === 'Active' ? '#137333' : '#C5221F', fontWeight: 700 }}>
                                {seg.status}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Footer buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 800, minWidth: '85px', background: '#DCE6F1' }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Select
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '85px' }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Cancel
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
