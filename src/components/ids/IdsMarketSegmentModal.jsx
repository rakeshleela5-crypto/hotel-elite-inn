import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  PieChart, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  Save, X, CheckCircle2, FileText, Calendar, User, ShieldCheck, Tag,
  AlertTriangle
} from 'lucide-react';

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
      - Applicable From: 23-FEB-2022
      - Code: AIR / CON / CVG / FIT / MAR / NCV / CORP / GRP
      - Name: Airlines / Conference / CVGR / FIT / Marriage / Non CVGR / Corporate Business / Group Tour
      - Short Name: AIR / CON / CVG / FIT / MAR / NCV
      - Status: Active / Inactive
      - User: MANAGER
      - Last Updated: 23-FEB-2022 18:01
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
    applicableFrom: '23-FEB-2022',
    name: 'Airlines Crew & Passenger Layover',
    shortName: 'AIR',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'CON',
    applicableFrom: '23-FEB-2022',
    name: 'Conference & Event Delegations',
    shortName: 'Conference',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'CVG',
    applicableFrom: '23-FEB-2022',
    name: 'CVGR (Commercial Volume Guaranteed Rate)',
    shortName: 'CVG',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'FIT',
    applicableFrom: '23-FEB-2022',
    name: 'FIT (Free Independent Traveler)',
    shortName: 'FIT',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'MAR',
    applicableFrom: '23-FEB-2022',
    name: 'Marriage & Banquet Guest Rooms',
    shortName: 'Marriage',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'NCV',
    applicableFrom: '23-FEB-2022',
    name: 'Non CVGR (Retail Corporate Rate)',
    shortName: 'Non CVGR',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2022 18:01'
  },
  {
    code: 'CORP',
    applicableFrom: '01-JAN-2022',
    name: 'Corporate Contracted Business',
    shortName: 'CORP',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2022 10:15'
  },
  {
    code: 'GRP',
    applicableFrom: '01-JAN-2022',
    name: 'Group Leisure & Pilgrim Series',
    shortName: 'GRP',
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2022 10:20'
  }
];

export default function IdsMarketSegmentModal({
  isOpen,
  onClose,
  initialCode = 'CVG',
  accountingDate = '23-FEB-2022',
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
        className="ids-dialog-window" 
        style={{ 
          width: '580px', 
          maxWidth: '94vw', 
          boxShadow: '0 10px 32px rgba(0,0,0,0.6)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Frame 010 */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
            color: '#FFF', 
            padding: '4px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
            <PieChart size={14} />
            <span>Market Segments V6.5.002.1 — IDS Fortune NEXT PMS</span>
          </div>
          <button 
            className="ids-win-btn close" 
            onClick={onClose}
            style={{ 
              background: '#C75050', 
              color: '#FFF', 
              border: '1px outset #FFF', 
              fontWeight: 700, 
              width: '18px', 
              height: '18px', 
              lineHeight: '14px', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
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
          
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '16px 18px', marginBottom: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 14px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 600 }}>Applicable From</span>
              <input 
                className="ids-input" 
                value={formData.applicableFrom} 
                onChange={(e) => handleChange('applicableFrom', e.target.value)} 
                style={{ width: '140px' }} 
              />

              <span style={{ fontWeight: 600 }}>Code</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={formData.code} 
                  onChange={(e) => handleChange('code', e.target.value)} 
                  placeholder="e.g. CVG"
                  style={{ width: '100px', fontWeight: 700, background: '#FFF7CC', textTransform: 'uppercase' }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '22px' }} 
                  onClick={() => setBrowseModalOpen(true)}
                  title="Open Market Segments Browser (Frame 044)"
                >
                  ?
                </button>
              </div>

              <span style={{ fontWeight: 600 }}>Name</span>
              <input 
                className="ids-input" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. CVGR / Free Independent Traveler"
                style={{ width: '100%', fontWeight: 600 }} 
              />

              <span style={{ fontWeight: 600 }}>Short Name</span>
              <input 
                className="ids-input" 
                value={formData.shortName || ''} 
                onChange={(e) => handleChange('shortName', e.target.value)} 
                placeholder="e.g. CVG / FIT"
                style={{ width: '140px' }} 
              />

              <span style={{ fontWeight: 600 }}>Status</span>
              <select 
                className="ids-input" 
                value={formData.status} 
                onChange={(e) => handleChange('status', e.target.value)}
                style={{ width: '140px', fontWeight: 600, color: formData.status === 'Active' ? '#137333' : '#C5221F' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <span style={{ fontWeight: 600 }}>User</span>
              <input 
                className="ids-input" 
                value={formData.user || 'MANAGER'} 
                readOnly 
                style={{ width: '140px', background: '#F0F0F0' }} 
              />

              <span style={{ fontWeight: 600 }}>Last Updated</span>
              <input 
                className="ids-input" 
                value={formData.lastUpdated || `${accountingDate} 18:01`} 
                readOnly 
                style={{ width: '180px', background: '#F0F0F0' }} 
              />

            </div>
          </div>

          {/* Bottom Toolbar matching Frames 010–044 */}
          <div 
            style={{ 
              background: '#D4D0C8', 
              border: '1px solid #808080', 
              padding: '6px 10px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="ids-btn-classic" onClick={handleAddNew}>Add</button>
              <button className="ids-btn-classic" onClick={() => setStatusMessage('Edit mode active. Update fields and click Save.')}>Modify</button>
              <button className="ids-btn-classic" onClick={() => alert('Delete operation requires Manager authorization.')}>Delete</button>
              <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setBrowseModalOpen(true)}>Browse</button>
              <button className="ids-btn-classic" onClick={handlePrevious}>Previous</button>
              <button className="ids-btn-classic" onClick={handleNext}>Next</button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                onClick={handleSave}
              >
                Save
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setBrowseModalOpen(true)}>Panel...</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
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
              style={{ width: '560px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Market Segments V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                {/* Search Header */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Search Segment:</span>
                  <input 
                    className="ids-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search by Code or Name..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                {/* Table Data matching Frame 044 */}
                <div style={{ height: '220px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '4px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Code</th>
                        <th style={{ padding: '4px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '100px' }}>Applicable From</th>
                        <th style={{ padding: '4px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Name</th>
                        <th style={{ padding: '4px 6px', textAlign: 'left', width: '70px' }}>Status</th>
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
                              <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{seg.code}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #E0E0E0' }}>{seg.applicableFrom}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #E0E0E0' }}>{seg.name}</td>
                              <td style={{ padding: '4px 6px', color: isSelected ? '#FFF' : seg.status === 'Active' ? '#137333' : '#C5221F', fontWeight: 600 }}>
                                {seg.status}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Footer buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px' }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Select
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '60px' }}
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
