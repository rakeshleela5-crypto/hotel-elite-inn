import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  FileText, Printer, Download, Search, RefreshCw, X, Shield, 
  Send, AlertTriangle, CheckCircle, MapPin, Car, User, Phone
} from 'lucide-react';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { getFastApiPoliceManifest, createFastApiPoliceManifest } from '../../utils/backendApi';

// Default Authentic In-House & Arrival Manifest for Muniguda Police Station (Thana)
export const DEFAULT_POLICE_MANIFEST = [
  {
    roomNo: '102',
    name: 'Rajesh Sharma',
    mobile: '9845012345',
    age: 42,
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNo: '9845-1234-8890',
    address: 'Flat 402, Sai Residency, Raipur, Chhattisgarh - 492001',
    arrivedFrom: 'Raipur Jn',
    destination: 'JK Paper Mills Ltd, Jaykaypur',
    purpose: 'Boiler Maintenance Audit',
    vehicleNo: 'CG-04-MB-8812',
    checkInTime: '11-OCT-2026 09:30',
    expectedCheckOut: '14-OCT-2026 12:00',
    status: 'In-House',
    type: 'Corporate'
  },
  {
    roomNo: '105',
    name: 'Debashis Mohanty',
    mobile: '9437088192',
    age: 38,
    gender: 'Male',
    idProofType: 'Driving License',
    idProofNo: 'OD-18-2018-00912',
    address: 'Plot 12, Jagamara, Bhubaneswar, Odisha - 751030',
    arrivedFrom: 'Bhubaneswar',
    destination: 'Vedanta Alumina Ltd, Lanjigarh',
    purpose: 'Process Automation Review',
    vehicleNo: 'OD-02-AK-9921',
    checkInTime: '11-OCT-2026 11:15',
    expectedCheckOut: '13-OCT-2026 10:00',
    status: 'In-House',
    type: 'Corporate'
  },
  {
    roomNo: '108',
    name: 'Sunil Patnaik',
    mobile: '9178234510',
    age: 29,
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNo: '4451-9920-1123',
    address: 'Ward 4, Main Road, Muniguda, Rayagada - 765020',
    arrivedFrom: 'Visakhapatnam Jn',
    destination: 'Local Muniguda',
    purpose: 'Railway Transit Fresh-Up (Train 18518)',
    vehicleNo: 'Train (VSKP-KRBA)',
    checkInTime: '11-OCT-2026 07:15',
    expectedCheckOut: '11-OCT-2026 10:15',
    status: 'In-House',
    type: 'Transit'
  },
  {
    roomNo: '201',
    name: 'Anil Kumar',
    mobile: '9938012390',
    age: 46,
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNo: '7721-3345-0981',
    address: 'Qtr B-14, Paper Mill Colony, Jaykaypur, Rayagada - 765017',
    arrivedFrom: 'Vizag Airport',
    destination: 'JK Paper Mills Ltd, Rayagada',
    purpose: 'Technical Delegation Lead',
    vehicleNo: 'OD-18-B-4412',
    checkInTime: '11-OCT-2026 13:40',
    expectedCheckOut: '15-OCT-2026 12:00',
    status: 'In-House',
    type: 'Corporate'
  },
  {
    roomNo: '203',
    name: 'Vikram Patel',
    mobile: '9825099881',
    age: 35,
    gender: 'Male',
    idProofType: 'Voter ID Card',
    idProofNo: 'WBD0918234',
    address: 'B-201, Shanti Park, Surat, Gujarat - 395001',
    arrivedFrom: 'Surat / Raipur',
    destination: 'Utkal Alumina, Doraguda',
    purpose: 'Refractory Lining Inspection',
    vehicleNo: 'GJ-05-CR-1190',
    checkInTime: '11-OCT-2026 14:10',
    expectedCheckOut: '14-OCT-2026 11:00',
    status: 'In-House',
    type: 'Corporate'
  },
  {
    roomNo: '206',
    name: 'Priyabrata Jena',
    mobile: '9439120485',
    age: 41,
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNo: '6610-8821-4439',
    address: 'At/PO Lanjigarh Township, Kalahandi, Odisha - 766027',
    arrivedFrom: 'Bhubaneswar',
    destination: 'Vedanta Limited, Lanjigarh',
    purpose: 'Safety & Environmental Audit',
    vehicleNo: 'OD-08-H-7711',
    checkInTime: '11-OCT-2026 16:20',
    expectedCheckOut: '13-OCT-2026 14:00',
    status: 'In-House',
    type: 'Corporate'
  },
  {
    roomNo: '207',
    name: 'Suresh Chandra Panda',
    mobile: '9937128844',
    age: 52,
    gender: 'Male',
    idProofType: 'Passport',
    idProofNo: 'Z9821440',
    address: 'Plot 44, Saheed Nagar, Bhubaneswar - 751007',
    arrivedFrom: 'Bhubaneswar',
    destination: 'JK Paper Mills Ltd, Rayagada',
    purpose: 'Corporate Legal Consultation',
    vehicleNo: 'OD-02-BL-5500',
    checkInTime: '11-OCT-2026 17:00',
    expectedCheckOut: '14-OCT-2026 12:00',
    status: 'In-House',
    type: 'Corporate'
  }
];

export default function IdsPoliceThanaManifestModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'MANAGER'
}) {
  const [manifestList, setManifestList] = useState(DEFAULT_POLICE_MANIFEST);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'CORPORATE' | 'TRANSIT'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  // Sync live manifest from Railway FastAPI PostgreSQL backend
  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingApi(true);
    getFastApiPoliceManifest()
      .then(apiData => {
        if (Array.isArray(apiData) && apiData.length > 0) {
          const mapped = apiData.map(item => ({
            roomNo: item.room_no || item.roomNo || '',
            name: item.name || '',
            mobile: item.mobile || '',
            age: Number(item.age) || 30,
            gender: item.gender || 'Male',
            idProofType: item.id_proof_type || item.idProofType || 'Aadhaar Card',
            idProofNo: item.id_proof_no || item.idProofNo || '',
            address: item.address || '',
            arrivedFrom: item.arrived_from || item.arrivedFrom || '',
            destination: item.destination || '',
            purpose: item.purpose || '',
            vehicleNo: item.vehicle_no || item.vehicleNo || '',
            checkInTime: item.check_in_time || item.checkInTime || '',
            expectedCheckOut: item.expected_check_out || item.expectedCheckOut || '',
            status: item.status || 'In-House',
            type: item.guest_type || item.type || 'Corporate'
          }));
          setManifestList(mapped);
        }
      })
      .catch(err => console.warn('[FastAPI] Police manifest fetch error:', err))
      .finally(() => setLoadingApi(false));
  }, [isOpen]);

  const [newGuest, setNewGuest] = useState({
    roomNo: '301',
    name: '',
    mobile: '',
    age: '',
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNo: '',
    address: '',
    arrivedFrom: '',
    destination: '',
    purpose: '',
    vehicleNo: '',
    status: 'In-House',
    type: 'Corporate'
  });

  // Filtered manifest
  const filteredManifest = useMemo(() => {
    return manifestList.filter(item => {
      if (filterType !== 'ALL' && item.type.toUpperCase() !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.roomNo.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.mobile.includes(q) ||
          item.idProofNo.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [manifestList, filterType, searchQuery]);

  if (!isOpen) return null;

  const handlePrint = () => {
    playReceptionChime();
    setIsPrintPreviewOpen(true);
  };

  const handleExportCsv = () => {
    playReceptionChime();
    const headers = [
      'Room #', 'Guest Name', 'Mobile', 'Age', 'Gender', 'ID Proof Type', 
      'ID Proof Number', 'Permanent Address', 'Arrived From', 'Destination', 
      'Purpose of Visit', 'Vehicle / Train #', 'Check-In Date/Time', 'Status'
    ];
    const rows = filteredManifest.map(m => [
      `"${m.roomNo}"`,
      `"${m.name}"`,
      `"${m.mobile}"`,
      m.age,
      `"${m.gender}"`,
      `"${m.idProofType}"`,
      `"${m.idProofNo}"`,
      `"${m.address.replace(/"/g, '""')}"`,
      `"${m.arrivedFrom}"`,
      `"${m.destination}"`,
      `"${m.purpose}"`,
      `"${m.vehicleNo}"`,
      `"${m.checkInTime}"`,
      `"${m.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Muniguda_Police_Thana_Manifest_${accountingDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDispatchWhatsApp = () => {
    playSuccessChime();
    setDispatchStatus('DISPATCHED');
    let message = `🚨 *DAILY GUEST MANIFEST (FORM C) — MUNIGUDA POLICE STATION (THANA)*\n`;
    message += `*Hotel Elite Inn, Muniguda, Dist. Rayagada, Odisha*\n`;
    message += `*Date of Report:* ${accountingDate} | *Total Guests:* ${filteredManifest.length}\n`;
    message += `*Statutory Sarai Act 1867 Registration:* MNGD-SARAI-2023/104\n\n`;

    filteredManifest.forEach((g, idx) => {
      message += `${idx + 1}. *Rm ${g.roomNo}*: ${g.name} (Age: ${g.age})\n`;
      message += `   📱 ${g.mobile} | 🆔 ${g.idProofType}: ${g.idProofNo}\n`;
      message += `   📍 From: ${g.arrivedFrom} ➔ Dest: ${g.destination}\n`;
      message += `   💼 Purpose: ${g.purpose} | 🚗 Veh: ${g.vehicleNo}\n\n`;
    });

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSaveNewGuest = (e) => {
    e.preventDefault();
    if (!newGuest.name || !newGuest.mobile) {
      alert("Guest Name and Mobile Number are required!");
      return;
    }
    const entry = {
      ...newGuest,
      age: Number(newGuest.age) || 30,
      checkInTime: `${accountingDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      expectedCheckOut: `${accountingDate} 12:00`
    };
    setManifestList(prev => [entry, ...prev]);
    setIsAddGuestOpen(false);
    playSuccessChime();

    // Persist asynchronously to Railway PostgreSQL
    createFastApiPoliceManifest({
      room_no: entry.roomNo,
      name: entry.name,
      mobile: entry.mobile,
      age: entry.age,
      gender: entry.gender,
      id_proof_type: entry.idProofType,
      id_proof_no: entry.idProofNo,
      address: entry.address,
      arrived_from: entry.arrivedFrom,
      destination: entry.destination,
      purpose: entry.purpose,
      vehicle_no: entry.vehicleNo,
      check_in_time: entry.checkInTime,
      expected_check_out: entry.expectedCheckOut,
      status: entry.status,
      guest_type: entry.type
    }).catch(err => console.warn('[FastAPI] Police manifest save failed:', err));
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
      {/* Authentic IDS FortuneNEXT Win32 Dialog Window */}
      <div 
        className={`ids-dialog-window ${isMaximized ? 'maximized' : ''}`}
        style={{ 
          width: isMaximized ? '1240px' : '1180px', 
          maxWidth: isMaximized ? '1240px' : '96vw', 
          height: isMaximized ? '760px' : '660px', 
          maxHeight: isMaximized ? '760px' : '92vh',
          display: 'flex', 
          flexDirection: 'column',
          background: '#ECE9D8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.65)'
        }}
      >
        {/* Win32 Title Bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ids-logo-badge" style={{ background: '#003366' }}>POLICE</span>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#000' }}>
              IDS FortuneNEXT 6.5 - Muniguda Police Station (Thana) Daily Guest Manifest [Form C / Sarai Act 1867]
            </span>
          </div>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className="ids-win-btn" onClick={handlePrint} title="Quick Print (F7)" style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>🖨️</button>
            <button className="ids-win-btn" title="Minimize to Normal Window" onClick={() => setIsMaximized(false)} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize Full Desktop"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="ids-win-btn close" onClick={onClose} title="Close (Esc)" style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* Top Statutory Header & Sub-Bar */}
        <div style={{ 
          background: '#FFF', 
          borderBottom: '1px solid #716F64', 
          padding: '6px 10px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#A02020', fontSize: '12px' }}>
              HOTEL ELITE INN • DAILY POLICE THANA GUEST REGISTRATION COMPLIANCE
            </div>
            <div style={{ color: '#555', fontSize: '10px' }}>
              Jurisdiction: Inspector-in-Charge, Muniguda Police Station, Rayagada District, Odisha • Daily 20:00 hrs Manifest
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ background: '#E0DEC8', padding: '2px 8px', border: '1px solid #999', fontWeight: 700 }}>
              Date: {accountingDate}
            </span>
            <span style={{ background: '#D4EDDA', color: '#155724', padding: '2px 8px', border: '1px solid #C3E6CB', fontWeight: 700 }}>
              Total Entries: {filteredManifest.length}
            </span>
            <span style={{ background: '#CCE5FF', color: '#004085', padding: '2px 8px', border: '1px solid #B8DAFF', fontWeight: 700 }}>
              Duty Officer: {currentUser}
            </span>
          </div>
        </div>

        {/* Filter and Control Ribbon */}
        <div style={{ 
          padding: '6px 10px', 
          background: '#ECE9D8', 
          borderBottom: '1px solid #ACA899', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          fontSize: '11px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 600 }}>Filter:</span>
            <select 
              className="ids-input" 
              style={{ width: '130px', fontSize: '11px', height: '22px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All In-House (All)</option>
              <option value="CORPORATE">Corporate Only</option>
              <option value="TRANSIT">Train Transit Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <span style={{ fontWeight: 600 }}>Search Manifest:</span>
            <input 
              type="text"
              placeholder="Search Room, Name, Mobile, ID No, Vehicle..."
              className="ids-input"
              style={{ flex: 1, height: '22px', fontSize: '11px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="ids-btn-classic" 
            style={{ fontWeight: 700, minWidth: '95px', height: '23px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setIsAddGuestOpen(true)}
          >
            <span>+ Add Manifest</span>
          </button>
        </div>

        {/* Main Win32 Tabular Manifest Grid */}
        <div style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', background: '#FFF' }}>
          <table className="ids-table" style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#ECE9D8', color: '#000', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ width: '40px', borderRight: '1px solid #ACA899', padding: '4px' }}>Rm #</th>
                <th style={{ width: '130px', borderRight: '1px solid #ACA899', padding: '4px' }}>Guest Full Name</th>
                <th style={{ width: '90px', borderRight: '1px solid #ACA899', padding: '4px' }}>Mobile No.</th>
                <th style={{ width: '50px', borderRight: '1px solid #ACA899', padding: '4px' }}>Age/Sex</th>
                <th style={{ width: '95px', borderRight: '1px solid #ACA899', padding: '4px' }}>ID Proof Type</th>
                <th style={{ width: '115px', borderRight: '1px solid #ACA899', padding: '4px' }}>ID Proof Number</th>
                <th style={{ width: '180px', borderRight: '1px solid #ACA899', padding: '4px' }}>Permanent Address</th>
                <th style={{ width: '110px', borderRight: '1px solid #ACA899', padding: '4px' }}>Arrived From</th>
                <th style={{ width: '130px', borderRight: '1px solid #ACA899', padding: '4px' }}>Destination</th>
                <th style={{ width: '130px', borderRight: '1px solid #ACA899', padding: '4px' }}>Purpose of Visit</th>
                <th style={{ width: '105px', borderRight: '1px solid #ACA899', padding: '4px' }}>Vehicle # / Train</th>
                <th style={{ width: '60px', padding: '4px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredManifest.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                    No manifest records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredManifest.map((item, idx) => {
                  const isSelected = selectedRowIndex === idx;
                  return (
                    <tr 
                      key={`${item.roomNo}-${idx}`}
                      onClick={() => setSelectedRowIndex(idx)}
                      style={{ 
                        background: isSelected ? '#316AC5' : (idx % 2 === 0 ? '#FFFFFF' : '#F9F8F4'),
                        color: isSelected ? '#FFFFFF' : '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 700, borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.roomNo}
                      </td>
                      <td style={{ fontWeight: 600, borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.name}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px', fontFamily: 'monospace' }}>
                        {item.mobile}
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.age}/{item.gender === 'Male' ? 'M' : 'F'}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.idProofType}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px', fontWeight: 600 }}>
                        {item.idProofNo}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.address}>
                        {item.address}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.arrivedFrom}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px', fontWeight: 600 }}>
                        {item.destination}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px' }}>
                        {item.purpose}
                      </td>
                      <td style={{ borderRight: '1px solid #DDD', padding: '3px 4px', fontWeight: 600 }}>
                        {item.vehicleNo}
                      </td>
                      <td style={{ textAlign: 'center', padding: '3px 4px' }}>
                        <span style={{ 
                          fontSize: '9px', 
                          padding: '1px 4px', 
                          borderRadius: '2px',
                          background: item.type === 'Transit' ? '#FFC107' : '#17A2B8',
                          color: '#000',
                          fontWeight: 700
                        }}>
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Row Inspector Bar */}
        {filteredManifest[selectedRowIndex] && (
          <div style={{ 
            background: '#F0ECE1', 
            borderTop: '1px solid #716F64', 
            padding: '5px 10px', 
            fontSize: '10.5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Selected:</strong> Rm {filteredManifest[selectedRowIndex].roomNo} • {filteredManifest[selectedRowIndex].name} • 🆔 {filteredManifest[selectedRowIndex].idProofType} ({filteredManifest[selectedRowIndex].idProofNo}) • 📍 {filteredManifest[selectedRowIndex].address}
            </div>
            <div style={{ color: '#006600', fontWeight: 700 }}>
              Purpose: {filteredManifest[selectedRowIndex].purpose}
            </div>
          </div>
        )}

        {/* Bottom Win32 Button Bar */}
        <div className="ids-dialog-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8', padding: '6px 12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '120px', background: '#28A745', color: '#FFF' }}
              onClick={handleDispatchWhatsApp}
            >
              📲 WhatsApp Thana
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '110px' }}
              onClick={handleExportCsv}
            >
              📊 Export CSV (F8)
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '110px', background: '#FFF7CC' }}
              onClick={handlePrint}
            >
              🖨️ Print Form C (F7)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => playReceptionChime()}>
              Refresh
            </button>
            <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={onClose}>
              Close (Esc)
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL 1: ADD NEW GUEST TO MANIFEST */}
      {isAddGuestOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div className="ids-dialog-window" style={{ width: '640px', background: '#ECE9D8', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>New Guest Manifest Entry - Police Station Form C</span>
              <button className="ids-win-btn close" onClick={() => setIsAddGuestOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveNewGuest} style={{ padding: '10px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Room Number:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.roomNo} 
                    onChange={e => setNewGuest({ ...newGuest, roomNo: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Guest Full Name:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.name} 
                    onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Mobile Number (10 digits):</label>
                  <input 
                    type="tel" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.mobile} 
                    onChange={e => setNewGuest({ ...newGuest, mobile: e.target.value })} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Age:</label>
                    <input 
                      type="number" 
                      className="ids-input" 
                      style={{ width: '100%' }}
                      value={newGuest.age} 
                      onChange={e => setNewGuest({ ...newGuest, age: e.target.value })} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Gender:</label>
                    <select 
                      className="ids-input" 
                      style={{ width: '100%' }}
                      value={newGuest.gender} 
                      onChange={e => setNewGuest({ ...newGuest, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>ID Proof Type:</label>
                  <select 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.idProofType} 
                    onChange={e => setNewGuest({ ...newGuest, idProofType: e.target.value })}
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID Card">Voter ID Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Corporate ID">Corporate Employee ID</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>ID Proof Number:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.idProofNo} 
                    onChange={e => setNewGuest({ ...newGuest, idProofNo: e.target.value })} 
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Permanent Address:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.address} 
                    onChange={e => setNewGuest({ ...newGuest, address: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Arrived From:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.arrivedFrom} 
                    onChange={e => setNewGuest({ ...newGuest, arrivedFrom: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Destination:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.destination} 
                    onChange={e => setNewGuest({ ...newGuest, destination: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Purpose of Visit:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.purpose} 
                    onChange={e => setNewGuest({ ...newGuest, purpose: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>Vehicle # / Train:</label>
                  <input 
                    type="text" 
                    required 
                    className="ids-input" 
                    style={{ width: '100%' }}
                    value={newGuest.vehicleNo} 
                    onChange={e => setNewGuest({ ...newGuest, vehicleNo: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button type="button" className="ids-btn-classic" onClick={() => setIsAddGuestOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="ids-btn-classic" style={{ background: '#316AC5', color: '#FFF', fontWeight: 700 }}>
                  Save to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: PRINTABLE OFFICIAL FORM C PREVIEW */}
      {isPrintPreviewOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '95vw', maxHeight: '90vh', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
            <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Official Print Preview - Muniguda Police Station Form C</span>
              <button className="ids-win-btn close" onClick={() => setIsPrintPreviewOpen(false)}>✕</button>
            </div>

            <div style={{ flex: 1, padding: '20px 25px', overflowY: 'auto', fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '12px', lineHeight: 1.4 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>GOVERNMENT OF ODISHA • POLICE DEPARTMENT</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', margin: '4px 0' }}>
                  DAILY GUEST ARRIVAL REGISTER & MANIFEST (FORM C)
                </div>
                <div style={{ fontSize: '12px' }}>
                  Under Section 3 & 4 of The Sarai Act, 1867 & Odisha Hotel Guest Reporting Mandate
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  <strong>Jurisdiction:</strong> Muniguda Police Station (Thana) • <strong>District:</strong> Rayagada, Odisha
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px' }}>
                <div>
                  <strong>Establishment:</strong> HOTEL ELITE INN<br />
                  <strong>Address:</strong> Station Road, Muniguda - 765020, Dist: Rayagada<br />
                  <strong>Sarai Reg. No:</strong> MNGD-SARAI-2023/104
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Report Date:</strong> {accountingDate}<br />
                  <strong>Generated At:</strong> 20:00 HRS (Daily Statutory Dispatch)<br />
                  <strong>Total Guests:</strong> {filteredManifest.length} Persons
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '20px' }} border="1" cellPadding="4">
                <thead>
                  <tr style={{ background: '#F0F0F0' }}>
                    <th>Sl.</th>
                    <th>Rm</th>
                    <th>Full Name</th>
                    <th>Mobile</th>
                    <th>Age/Sex</th>
                    <th>ID Type & Number</th>
                    <th>Permanent Address</th>
                    <th>From</th>
                    <th>Destination</th>
                    <th>Purpose</th>
                    <th>Vehicle #</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManifest.map((g, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{g.roomNo}</td>
                      <td><strong>{g.name}</strong></td>
                      <td>{g.mobile}</td>
                      <td style={{ textAlign: 'center' }}>{g.age}/{g.gender[0]}</td>
                      <td>{g.idProofType}: {g.idProofNo}</td>
                      <td style={{ fontSize: '9px' }}>{g.address}</td>
                      <td>{g.arrivedFrom}</td>
                      <td><strong>{g.destination}</strong></td>
                      <td>{g.purpose}</td>
                      <td>{g.vehicleNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px', borderTop: '1px dashed #666' }}>
                <div style={{ textAlign: 'center' }}>
                  ________________________________<br />
                  <strong>Front Office Manager / Cashier</strong><br />
                  Hotel Elite Inn, Muniguda
                </div>
                <div style={{ textAlign: 'center' }}>
                  ________________________________<br />
                  <strong>Duty Officer / Thana Stamp</strong><br />
                  Muniguda Police Station (Thana)<br />
                  General Diary (G.D.) Entry No: ________
                </div>
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: '#ECE9D8', borderTop: '1px solid #999', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="ids-btn-classic" onClick={() => window.print()} style={{ fontWeight: 700, background: '#316AC5', color: '#FFF' }}>
                Print Hardcopy
              </button>
              <button className="ids-btn-classic" onClick={() => setIsPrintPreviewOpen(false)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
