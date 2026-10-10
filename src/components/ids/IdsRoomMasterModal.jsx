import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, BedDouble, CheckCircle2, Search, Plus, 
  Edit, Trash2, Save, X, Layers, Sparkles, LayoutGrid,
  ChevronLeft, ChevronRight, Check, AlertCircle, ShieldCheck,
  ArrowRight, ArrowLeft, DoorOpen, Link2
} from 'lucide-react';

/* =========================================================================
   VIDEOS 33 & 34: 
   - VIDEO 33: HOW TO ADD ROOM NUMBERS IN ROOM STATUS IN IDS 6.5 & 7.0 SOFTWARE
   - VIDEO 34: HOW TO MODIFY ROOM MASTER IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Room Master V6.5.002.1 (Frames 010–035)
   2. Entry Points (Frame 008):
      - Setup.. -> Room Master
      - Setup.. -> Modify Room Master
      - Quick Scan (Load Pgm) -> Type "room master" / "modify room" -> [ Load ]
      - 44-Video Tutorial Player -> Videos 33 & 34 -> Launch Interactive Feature Clone
   3. Fields & Controls (Video 34 Frame 016):
      - Property Code: DEMO / HOTEL ELITE INN
      - Room#: 202 with [ ? ] lookup
      - Room Type: EXE / DLX / SUI / PNH with [ ? ] Room Types Lookup
      - Block: MAIN / TOWER / WING A / VILLAS
      - Floor: Basement 01 / 1st Floor / 2nd Floor / 3rd Floor / 4th Floor / 5th Floor / 6th Floor
      - Available Features on Left <-> Features Selected on Right (with transfer)
      - Maximum Pax: 2 / 3 / 4
      - Rate Table: 100 / 101 with [ ? ] lookup
      - [ Connecting Rooms ] button (Frame 016)
      - [ Opposite Rooms ] button (Frame 016)
      - [ Change Room Type ] button (Frame 016)
      - Status: Active / Inactive (Passive) / Out of Order
      - User: MANAGER
      - Last Updated: 23-FEB-2026 18:16
   4. Live Sync with Room Status Rack (Video 34 Frame 020):
      - Active: visible in Room Status Rack (e.g. 202 V/EXE)
      - Inactive (Passive): hidden from Room Status Rack, reducing Rooms to Sell count!
   ========================================================================= */

export const INITIAL_ROOM_TYPES_DATABASE = [
  { propertyCode: 'HEI', roomType: 'STD', applicableFrom: '01-JAN-2023', name: 'STANDARD SINGLE BED', status: 'Active', maxPax: 1, defaultRate: 1450 },
  { propertyCode: 'HEI', roomType: 'DLX', applicableFrom: '01-JAN-2023', name: 'DELUXE KING BED', status: 'Active', maxPax: 2, defaultRate: 1750 },
  { propertyCode: 'HEI', roomType: 'EXE', applicableFrom: '01-JAN-2023', name: 'EXECUTIVE ROOM (KING/TWIN/TRIPLE)', status: 'Active', maxPax: 3, defaultRate: 2050 },
  { propertyCode: 'HEI', roomType: 'PRM', applicableFrom: '01-JAN-2023', name: 'PREMIUM KING BED', status: 'Active', maxPax: 2, defaultRate: 2450 },
  { propertyCode: 'HEI', roomType: 'SUI', applicableFrom: '01-JAN-2023', name: 'PREMIUM SUITE KING BED', status: 'Active', maxPax: 2, defaultRate: 3250 }
];

export const ALL_ROOM_FEATURES_MASTER = [
  'Non Smoking Room',
  'King Size Bed',
  'Twin Bed',
  'Triple Bedding',
  'Single Bed',
  'AC / Climate Control',
  '24h Hot Water',
  'High Speed Wi-Fi Enabled',
  'Smart LED TV',
  'Complimentary Breakfast',
  'Plush Living Area'
];

export const INITIAL_ROOM_MASTER_INVENTORY = [
  // Floor 1 (9 Rooms: 101 - 109)
  { roomNo: '101', roomType: 'EXE', block: 'MAIN', floor: '1', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '102', oppositeRoom: '108', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '102', roomType: 'DLX', block: 'MAIN', floor: '1', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '101', oppositeRoom: '107', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '103', roomType: 'EXE', block: 'MAIN', floor: '1', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '106', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '104', roomType: 'DLX', block: 'MAIN', floor: '1', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '105', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '105', roomType: 'EXE', block: 'MAIN', floor: '1', features: ['Twin Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '104', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '106', roomType: 'DLX', block: 'MAIN', floor: '1', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '103', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '107', roomType: 'EXE', block: 'MAIN', floor: '1', features: ['Triple Bedding', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 3, rateTable: '100', connectingRoom: '', oppositeRoom: '102', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '108', roomType: 'STD', block: 'MAIN', floor: '1', features: ['Single Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 1, rateTable: '100', connectingRoom: '', oppositeRoom: '101', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '109', roomType: 'SUI', block: 'MAIN', floor: '1', features: ['King Size Bed', 'Plush Living Area', 'AC / Climate Control'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },

  // Floor 2 (9 Rooms: 201 - 209)
  { roomNo: '201', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '202', oppositeRoom: '208', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '202', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '201', oppositeRoom: '207', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '203', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '206', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '204', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '205', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '205', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['Twin Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '204', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '206', roomType: 'DLX', block: 'MAIN', floor: '2', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '203', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '207', roomType: 'EXE', block: 'MAIN', floor: '2', features: ['Triple Bedding', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 3, rateTable: '100', connectingRoom: '', oppositeRoom: '202', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '208', roomType: 'STD', block: 'MAIN', floor: '2', features: ['Single Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 1, rateTable: '100', connectingRoom: '', oppositeRoom: '201', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '209', roomType: 'SUI', block: 'MAIN', floor: '2', features: ['King Size Bed', 'Plush Living Area', 'AC / Climate Control'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },

  // Floor 3 (9 Rooms: 301 - 309)
  { roomNo: '301', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '302', oppositeRoom: '308', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '302', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '301', oppositeRoom: '307', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '303', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '306', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '304', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '305', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '305', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '304', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '306', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '303', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '307', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '302', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '308', roomType: 'EXE', block: 'MAIN', floor: '3', features: ['King Size Bed', 'AC / Climate Control', 'High Speed Wi-Fi Enabled'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '301', status: 'Active', lastUpdated: '01-JAN-2023 10:00' },
  { roomNo: '309', roomType: 'PRM', block: 'MAIN', floor: '3', features: ['King Size Bed', 'Plush Living Area', 'AC / Climate Control'], maxPax: 2, rateTable: '100', connectingRoom: '', oppositeRoom: '', status: 'Active', lastUpdated: '01-JAN-2023 10:00' }
];

export default function IdsRoomMasterModal({
  isOpen,
  onClose,
  initialRoomNo = '202',
  accountingDate = '23-FEB-2026',
  onSaveRoomMaster,
  onOpenRoomRack
}) {
  const [roomList, setRoomList] = useState(INITIAL_ROOM_MASTER_INVENTORY);
  const [currentIndex, setCurrentIndex] = useState(1); // Room 202

  // Form State matching Video 34 Frame 016
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_ROOM_MASTER_INVENTORY.find(r => r.roomNo === initialRoomNo);
    return found || INITIAL_ROOM_MASTER_INVENTORY[1];
  });

  // Dual-list feature selections
  const [selectedAvailableFeature, setSelectedAvailableFeature] = useState('');
  const [selectedSelectedFeature, setSelectedSelectedFeature] = useState('');

  // Lookup Modals
  const [roomTypesLookupOpen, setRoomTypesLookupOpen] = useState(false);
  const [roomBrowseOpen, setRoomBrowseOpen] = useState(false);
  const [connectingRoomsOpen, setConnectingRoomsOpen] = useState(false);
  const [oppositeRoomsOpen, setOppositeRoomsOpen] = useState(false);
  const [searchRoomTerm, setSearchRoomTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Move feature to Selected (Left -> Right)
  const handleMoveToSelected = () => {
    if (!selectedAvailableFeature) return;
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), selectedAvailableFeature]
    }));
    setSelectedAvailableFeature('');
  };

  // Move feature to Available (Right -> Left)
  const handleMoveToAvailable = () => {
    if (!selectedSelectedFeature) return;
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f !== selectedSelectedFeature)
    }));
    setSelectedSelectedFeature('');
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
      connectingRoom: '',
      oppositeRoom: '',
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

    const isPassive = updatedRoom.status === 'Inactive';
    const statusNote = isPassive 
      ? 'Room set to Inactive (Passive) — hidden from Room Status Rack.' 
      : 'Room set to Active — live in Room Status Rack.';

    setStatusMessage(`Room ${updatedRoom.roomNo} (${updatedRoom.roomType}) saved! ${statusNote}`);
    if (onSaveRoomMaster) {
      onSaveRoomMaster(updatedRoom);
    }
    setTimeout(() => setStatusMessage(''), 4500);
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

  // Available features list (not currently assigned)
  const currentFeatures = formData.features || [];
  const availableFeatures = ALL_ROOM_FEATURES_MASTER.filter(f => !currentFeatures.includes(f));

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '740px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Frame 016 */}
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

        {/* Main Content Body matching Video 34 Frame 016 */}
        <div style={{ padding: '14px 18px', fontSize: '11px' }}>
          
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '12px 14px', marginBottom: '10px' }}>
            
            {/* Upper Form Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 180px 100px 1fr', gap: '8px 12px', alignItems: 'center', marginBottom: '12px' }}>
              
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

              <span style={{ fontWeight: 600 }}>Maximum Pax</span>
              <input 
                className="ids-input" 
                type="number"
                value={formData.maxPax || 2} 
                onChange={(e) => handleFieldChange('maxPax', parseInt(e.target.value) || 2)}
                style={{ width: '60px', fontWeight: 700 }}
              />

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
                style={{ width: '130px' }}
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
                style={{ width: '120px', fontWeight: 600 }}
              >
                <option value="Basement 01">Basement 01</option>
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
                <option value="3">3rd Floor</option>
                <option value="4">4th Floor</option>
                <option value="5">5th Floor</option>
                <option value="6">6th Floor</option>
              </select>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" onClick={() => setConnectingRoomsOpen(true)}>
                  Connecting Rooms
                </button>
                <button className="ids-btn-classic" onClick={() => setOppositeRoomsOpen(true)}>
                  Opposite Rooms
                </button>
              </div>

            </div>

            {/* Dual List Box: Available Features <-> Features Selected matching Video 34 Frame 016 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              
              {/* Left Box: Available Features */}
              <div>
                <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '3px' }}>
                  Available Features:
                </div>
                <div style={{ height: '110px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px' }}>
                  {availableFeatures.map(feat => (
                    <div 
                      key={feat}
                      onClick={() => setSelectedAvailableFeature(feat)}
                      onDoubleClick={() => {
                        setFormData(prev => ({ ...prev, features: [...(prev.features || []), feat] }));
                      }}
                      style={{ 
                        padding: '2px 4px', 
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        background: selectedAvailableFeature === feat ? '#316AC5' : 'transparent',
                        color: selectedAvailableFeature === feat ? '#FFF' : '#000'
                      }}
                    >
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Transfer Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '28px', height: '24px', padding: 0, fontWeight: 700 }}
                  onClick={handleMoveToSelected}
                  title="Add Feature"
                >
                  &gt;
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '28px', height: '24px', padding: 0, fontWeight: 700 }}
                  onClick={handleMoveToAvailable}
                  title="Remove Feature"
                >
                  &lt;
                </button>
              </div>

              {/* Right Box: Features Selected */}
              <div>
                <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '3px' }}>
                  Features Selected:
                </div>
                <div style={{ height: '110px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px' }}>
                  {currentFeatures.map(feat => (
                    <div 
                      key={feat}
                      onClick={() => setSelectedSelectedFeature(feat)}
                      onDoubleClick={() => {
                        setFormData(prev => ({ ...prev, features: (prev.features || []).filter(f => f !== feat) }));
                      }}
                      style={{ 
                        padding: '2px 4px', 
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        background: selectedSelectedFeature === feat ? '#316AC5' : 'transparent',
                        color: selectedSelectedFeature === feat ? '#FFF' : '#000'
                      }}
                    >
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Row: Status, User, Last Updated & Action Shortcuts */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 140px 50px 100px 90px 140px 1fr', gap: '6px 10px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 600 }}>Status</span>
              <select 
                className="ids-input" 
                value={formData.status || 'Active'} 
                onChange={(e) => handleFieldChange('status', e.target.value)}
                style={{ width: '100%', fontWeight: 700, color: formData.status === 'Active' ? '#137333' : '#C5221F' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive (Passive)</option>
                <option value="Out of Order">Out of Order</option>
              </select>

              <span style={{ fontWeight: 600 }}>User</span>
              <input 
                className="ids-input" 
                value={formData.user || 'MANAGER'} 
                readOnly
                style={{ width: '100%', background: '#F0F0F0' }}
              />

              <span style={{ fontWeight: 600 }}>Last Updated</span>
              <input 
                className="ids-input" 
                value={formData.lastUpdated || `${accountingDate} 18:16`} 
                readOnly
                style={{ width: '100%', background: '#F0F0F0' }}
              />

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button className="ids-btn-classic" onClick={() => setRoomTypesLookupOpen(true)}>
                  Change Room Type
                </button>
              </div>

            </div>

          </div>

          {/* Bottom Action Ribbon matching Video 34 Frame 016 */}
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
              {onOpenRoomRack && (
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    onClose();
                    onOpenRoomRack();
                  }}
                >
                  <LayoutGrid size={12} /> Room Status Rack (Frame 020)
                </button>
              )}
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
            LOOKUP 1: ROOM TYPES V6.5.002.1 LOOKUP MODAL
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
                            setStatusMessage(`Changed Room Type to ${rt.roomType} (${rt.name})`);
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
            LOOKUP 2: ROOM MASTER HELP / BROWSE MODAL
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

        {/* =========================================================================
            LOOKUP 3: CONNECTING ROOMS MODAL
            ========================================================================= */}
        {connectingRoomsOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setConnectingRoomsOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '420px', maxWidth: '90vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Connecting Rooms for Room {formData.roomNo}</span>
                <button className="ids-win-btn close" onClick={() => setConnectingRoomsOpen(false)}>✕</button>
              </div>
              <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                <div style={{ marginBottom: '10px' }}>
                  Select connecting room for adjacent suite/family linkage:
                </div>
                <select 
                  className="ids-input"
                  value={formData.connectingRoom || ''}
                  onChange={(e) => handleFieldChange('connectingRoom', e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  <option value="">-- No Connecting Room --</option>
                  {roomList.filter(r => r.roomNo !== formData.roomNo).map(r => (
                    <option key={r.roomNo} value={r.roomNo}>
                      Room {r.roomNo} ({r.roomType} - Floor {r.floor})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                  <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setConnectingRoomsOpen(false)}>Ok</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP 4: OPPOSITE ROOMS MODAL
            ========================================================================= */}
        {oppositeRoomsOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setOppositeRoomsOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '420px', maxWidth: '90vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Opposite Rooms for Room {formData.roomNo}</span>
                <button className="ids-win-btn close" onClick={() => setOppositeRoomsOpen(false)}>✕</button>
              </div>
              <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                <div style={{ marginBottom: '10px' }}>
                  Select corridor opposite room:
                </div>
                <select 
                  className="ids-input"
                  value={formData.oppositeRoom || ''}
                  onChange={(e) => handleFieldChange('oppositeRoom', e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  <option value="">-- No Opposite Room --</option>
                  {roomList.filter(r => r.roomNo !== formData.roomNo).map(r => (
                    <option key={r.roomNo} value={r.roomNo}>
                      Room {r.roomNo} ({r.roomType} - Floor {r.floor})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                  <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setOppositeRoomsOpen(false)}>Ok</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
