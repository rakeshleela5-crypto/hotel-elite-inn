import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, BedDouble, CheckCircle2, Search, Plus, 
  Edit, Trash2, Save, X, Layers, Sparkles, LayoutGrid,
  ChevronLeft, ChevronRight, Check, AlertCircle, ShieldCheck
} from 'lucide-react';

/* =========================================================================
   VIDEO 33: HOW TO ADD ROOM NUMBERS IN ROOM STATUS IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Room Master V6.5.002.1 (Frames 010–022)
   2. Entry Points (Frame 008):
      - Setup.. -> Room Master
      - Setup.. -> How to Add Room Numbers in Room Status
      - Quick Scan (Load Pgm) -> Type "room master" -> "Room Master" -> [ Load ]
      - 44-Video Tutorial Player -> Video 33 -> Launch Interactive Feature Clone
   3. Fields & Controls (Frames 014 & 018):
      - Property Code: DEMO / HOTEL ELITE INN
      - Room#: 202 with [ ? ] lookup
      - Room Type: EXE / DLX / SUI / PNH with [ ? ] Room Types Lookup
      - Block: MAIN / TOWER / WING A
      - Floor: 2 / 3 / 4 / 5 / 6
      - Available Features: King Size Bed, Non Smoking Room, Queen Size Bed, etc.
      - Maximum Pax: 2 / 3 / 4
      - Rate Table: 100 / 101 with [ ? ] lookup
      - [ Opposite Rooms ] button
      - [ Change Room Type ] button
      - Status: Active / Inactive / Out of Order
      - User: MANAGER
      - Last Updated: 23-FEB-2022 18:16
   4. Room Types Lookup Modal (Frame 014):
      - Room Types V6.5.002.1 (DLX, EXE, PNH, SUI, ZZZ)
   5. Live Sync with Room Status Rack (Frame 026):
      - Added rooms automatically reflect in Room Status V6.5.002.1 (e.g. 202 V/EXE)
   ========================================================================= */

export const INITIAL_ROOM_TYPES_DATABASE = [
  { propertyCode: 'DEM', roomType: 'DLX', applicableFrom: '15-SEP-2021', name: 'DELUXE ROOM', status: 'Active', maxPax: 2, defaultRate: 2999 },
  { propertyCode: 'DEM', roomType: 'EXE', applicableFrom: '15-SEP-2021', name: 'EXECUTIVE ROOM', status: 'Active', maxPax: 2, defaultRate: 3999 },
  { propertyCode: 'DEM', roomType: 'PNH', applicableFrom: '15-SEP-2021', name: 'PENT HOUSE SUITE', status: 'Active', maxPax: 4, defaultRate: 9999 },
  { propertyCode: 'DEM', roomType: 'SUI', applicableFrom: '15-SEP-2021', name: 'ROYAL SUITE', status: 'Active', maxPax: 3, defaultRate: 7499 },
  { propertyCode: 'DEM', roomType: 'ZZZ', applicableFrom: '26-SEP-2021', name: 'Special Rooms / Dormitory', status: 'Active', maxPax: 6, defaultRate: 1500 }
];

export const INITIAL_ROOM_FEATURES = [
  'King Size Bed',
  'Non Smoking Room',
  'Queen Size Bed',
  'Smoking Room',
  'Twin Bed',
  'Pool View',
  'City View / Garden View',
  'Balcony',
  'Jacuzzi & Bathtub',
  'High Speed Wi-Fi Enabled',
  'Smart 4K LED TV'
];

export const INITIAL_ROOM_MASTER_INVENTORY = [
  { roomNo: '201', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['King Size Bed', 'Non Smoking Room'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '202', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['King Size Bed', 'Non Smoking Room', 'City View / Garden View'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '203', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['Twin Bed', 'Non Smoking Room'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '204', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['Queen Size Bed', 'Pool View'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '205', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['Queen Size Bed', 'Non Smoking Room'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '206', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['Twin Bed', 'Non Smoking Room'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '301', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'Balcony'], maxPax: 2, rateTable: '101', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '312', roomType: 'DLX', block: 'MAIN', floor: '3', features: ['King Size Bed', 'Pool View'], maxPax: 2, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '316', roomType: 'SUI', block: 'TOWER', floor: '3', features: ['King Size Bed', 'Jacuzzi & Bathtub', 'Balcony'], maxPax: 3, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '516', roomType: 'SUI', block: 'TOWER', floor: '5', features: ['King Size Bed', 'Jacuzzi & Bathtub', 'City View / Garden View'], maxPax: 3, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' },
  { roomNo: '601', roomType: 'PNH', block: 'TOWER', floor: '6', features: ['King Size Bed', 'Jacuzzi & Bathtub', 'Balcony', 'Smart 4K LED TV'], maxPax: 4, rateTable: '100', status: 'Active', lastUpdated: '23-FEB-2022 18:16' }
];

export default function IdsRoomMasterModal({
  isOpen,
  onClose,
  initialRoomNo = '202',
  accountingDate = '23-FEB-2022',
  onSaveRoomMaster,
  onOpenRoomRack
}) {
  const [roomList, setRoomList] = useState(INITIAL_ROOM_MASTER_INVENTORY);
  const [currentIndex, setCurrentIndex] = useState(1); // Room 202

  // Form State matching Video 33 Frames 014–022
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_ROOM_MASTER_INVENTORY.find(r => r.roomNo === initialRoomNo);
    return found || INITIAL_ROOM_MASTER_INVENTORY[1];
  });

  // Lookup Modals
  const [roomTypesLookupOpen, setRoomTypesLookupOpen] = useState(false);
  const [roomBrowseOpen, setRoomBrowseOpen] = useState(false);
  const [searchRoomTerm, setSearchRoomTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle Feature checkbox
  const handleToggleFeature = (feature) => {
    setFormData(prev => {
      const exists = (prev.features || []).includes(feature);
      if (exists) {
        return { ...prev, features: prev.features.filter(f => f !== feature) };
      }
      return { ...prev, features: [...(prev.features || []), feature] };
    });
  };

  // Add New Room
  const handleAddNew = () => {
    const newRoom = {
      propertyCode: 'DEMO',
      roomNo: '',
      roomType: 'EXE',
      block: 'MAIN',
      floor: '2',
      features: ['King Size Bed', 'Non Smoking Room'],
      maxPax: 2,
      rateTable: '100',
      status: 'Active',
      lastUpdated: `${accountingDate} 18:16`
    };
    setFormData(newRoom);
    setStatusMessage('Enter new Room #, select Room Type and Floor, then click Save.');
  };

  // Save Room Master
  const handleSave = () => {
    if (!formData.roomNo.trim()) {
      alert('Please enter Room Number.');
      return;
    }
    if (!formData.roomType.trim()) {
      alert('Please select Room Type.');
      return;
    }

    const updatedRoom = {
      ...formData,
      roomNo: formData.roomNo.trim(),
      roomType: formData.roomType.trim().toUpperCase(),
      floor: formData.floor || formData.roomNo.charAt(0) || '2',
      lastUpdated: `${accountingDate} 18:16`
    };

    setRoomList(prev => {
      const exists = prev.some(r => r.roomNo === updatedRoom.roomNo);
      if (exists) {
        return prev.map(r => r.roomNo === updatedRoom.roomNo ? updatedRoom : r);
      }
      return [...prev, updatedRoom];
    });

    setStatusMessage(`Room ${updatedRoom.roomNo} (${updatedRoom.roomType}) saved successfully and synced with Room Status Rack!`);
    if (onSaveRoomMaster) {
      onSaveRoomMaster(updatedRoom);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Previous & Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(roomList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(roomList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setFormData(roomList[newIdx]);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '680px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Frame 014 */}
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
            <BedDouble size={14} />
            <span>Room Master V6.5.002.1 — Room Inventory Master Setup</span>
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

        {/* Main Content Body matching Frame 014 & Frame 018 */}
        <div style={{ padding: '14px 18px', fontSize: '11px' }}>
          
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '12px 14px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              
              {/* Left Column: Room Identifiers & Features */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 10px', alignItems: 'center', marginBottom: '10px' }}>
                  
                  <span style={{ fontWeight: 600 }}>Property Code</span>
                  <select 
                    className="ids-input" 
                    value={formData.propertyCode || 'DEMO'} 
                    onChange={(e) => handleFieldChange('propertyCode', e.target.value)}
                    style={{ width: '100%', fontWeight: 600 }}
                  >
                    <option value="DEMO">DEMO</option>
                    <option value="ELITE">HOTEL ELITE INN</option>
                  </select>

                  <span style={{ fontWeight: 600 }}>Room#</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      className="ids-input" 
                      value={formData.roomNo} 
                      onChange={(e) => handleFieldChange('roomNo', e.target.value)}
                      placeholder="e.g. 202"
                      style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} 
                    />
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }} 
                      onClick={() => setRoomBrowseOpen(true)}
                      title="Browse Room Numbers"
                    >
                      ?
                    </button>
                  </div>

                  <span style={{ fontWeight: 600 }}>Room Type</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      className="ids-input" 
                      value={formData.roomType} 
                      onChange={(e) => handleFieldChange('roomType', e.target.value)}
                      placeholder="e.g. EXE"
                      style={{ width: '80px', fontWeight: 700, textTransform: 'uppercase' }} 
                    />
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }} 
                      onClick={() => setRoomTypesLookupOpen(true)}
                      title="Lookup Room Types (Frame 014)"
                    >
                      ?
                    </button>
                  </div>

                  <span style={{ fontWeight: 600 }}>Block</span>
                  <select 
                    className="ids-input" 
                    value={formData.block || 'MAIN'} 
                    onChange={(e) => handleFieldChange('block', e.target.value)}
                    style={{ width: '120px' }}
                  >
                    <option value="MAIN">MAIN BLOCK</option>
                    <option value="TOWER">TOWER WING</option>
                    <option value="WING A">WING A</option>
                    <option value="VILLAS">VILLAS</option>
                  </select>

                  <span style={{ fontWeight: 600 }}>Floor</span>
                  <select 
                    className="ids-input" 
                    value={formData.floor || '2'} 
                    onChange={(e) => handleFieldChange('floor', e.target.value)}
                    style={{ width: '80px', fontWeight: 600 }}
                  >
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                    <option value="5">5th Floor</option>
                    <option value="6">6th Floor</option>
                  </select>

                </div>

                {/* Available Features matching Frame 014 */}
                <div>
                  <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '3px' }}>
                    Available Features:
                  </div>
                  <div style={{ height: '110px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px' }}>
                    {INITIAL_ROOM_FEATURES.map((feat) => {
                      const isChecked = (formData.features || []).includes(feat);
                      return (
                        <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleToggleFeature(feat)}
                          />
                          <span style={{ fontSize: '10.5px' }}>{feat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Capacity, Rates & Shortcuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 10px', alignItems: 'center' }}>
                  
                  <span style={{ fontWeight: 600 }}>Maximum Pax</span>
                  <input 
                    className="ids-input" 
                    type="number"
                    value={formData.maxPax || 2} 
                    onChange={(e) => handleFieldChange('maxPax', parseInt(e.target.value) || 2)}
                    style={{ width: '60px', fontWeight: 700 }}
                  />

                  <span style={{ fontWeight: 600 }}>Rate Table</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      className="ids-input" 
                      value={formData.rateTable || '100'} 
                      onChange={(e) => handleFieldChange('rateTable', e.target.value)}
                      style={{ width: '80px', fontWeight: 700 }}
                    />
                    <button className="ids-btn-classic" style={{ width: '22px' }}>?</button>
                  </div>

                  <span style={{ fontWeight: 600 }}>Status</span>
                  <select 
                    className="ids-input" 
                    value={formData.status || 'Active'} 
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    style={{ width: '120px', fontWeight: 600, color: formData.status === 'Active' ? '#137333' : '#C5221F' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>

                  <span style={{ fontWeight: 600 }}>Last Updated</span>
                  <input 
                    className="ids-input" 
                    value={formData.lastUpdated || `${accountingDate} 18:16`} 
                    readOnly
                    style={{ width: '140px', background: '#F0F0F0' }}
                  />

                </div>

                {/* Auxiliary Control Buttons matching Frame 014 */}
                <div style={{ borderTop: '1px solid #CCC', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => alert('Opposite Room linkage panel')}>
                    Opposite Rooms
                  </button>
                  <button className="ids-btn-classic" onClick={() => setRoomTypesLookupOpen(true)}>
                    Change Room Type
                  </button>
                  {onOpenRoomRack && (
                    <button 
                      className="ids-btn-classic" 
                      style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => {
                        onClose();
                        onOpenRoomRack();
                      }}
                    >
                      <LayoutGrid size={13} /> View in Room Status (Rack)
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Bottom Action Ribbon matching Frame 014 */}
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
              <button className="ids-btn-classic" onClick={() => setStatusMessage('Modify mode: edit room properties and click Save.')}>Modify</button>
              <button className="ids-btn-classic" onClick={() => alert('Room deletion requires administrator authorization.')}>Delete</button>
              <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setRoomBrowseOpen(true)}>Browse</button>
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
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setRoomBrowseOpen(true)}>Panel...</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            FRAME 014: ROOM TYPES V6.5.002.1 LOOKUP MODAL
            ========================================================================= */}
        {roomTypesLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setRoomTypesLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '560px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Room Types V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setRoomTypesLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Property Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '70px' }}>Room Type</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '90px' }}>Applicable From</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_ROOM_TYPES_DATABASE.map((rt, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, roomType: rt.roomType, maxPax: rt.maxPax }));
                            setRoomTypesLookupOpen(false);
                          }}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{rt.propertyCode}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{rt.roomType}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{rt.applicableFrom}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{rt.name}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 600, color: rt.status === 'Active' ? '#137333' : '#C5221F' }}>{rt.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => setRoomTypesLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ROOM MASTER HELP / BROWSE MODAL
            ========================================================================= */}
        {roomBrowseOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setRoomBrowseOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '600px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Room Master - Help V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setRoomBrowseOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Room:</span>
                  <input 
                    className="ids-input" 
                    value={searchRoomTerm} 
                    onChange={(e) => setSearchRoomTerm(e.target.value)} 
                    placeholder="Search by Room # or Type..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Room #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Type</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Floor</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Features</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomList
                        .filter(r => 
                          r.roomNo.includes(searchRoomTerm) || 
                          r.roomType.toLowerCase().includes(searchRoomTerm.toLowerCase())
                        )
                        .map((rm, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => {
                              setFormData(rm);
                              setCurrentIndex(idx);
                              setRoomBrowseOpen(false);
                            }}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{rm.roomNo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{rm.roomType}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{rm.floor}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{(rm.features || []).join(', ')}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 600, color: rm.status === 'Active' ? '#137333' : '#C5221F' }}>{rm.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setRoomBrowseOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
