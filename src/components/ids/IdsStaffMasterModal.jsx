import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import QRCode from 'qrcode';
import { 
  HOTEL_STAFF_MEMBERS, 
  DEPARTMENT_SUMMARY, 
  getStoredStaff, 
  saveStoredStaff,
  OPERATIONAL_QR_BADGES 
} from '../../data/hotelStaffData';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

// Individual QR Badge Component with real QR generation and instant printing
function IdsQrBadgeCard({ badge, origin }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fullUrl = `${origin || (typeof window !== 'undefined' ? window.location.origin : '')}${badge.urlPath}`;
    QRCode.toDataURL(fullUrl, {
      width: 200,
      margin: 1,
      color: { dark: badge.darkColor || '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    }).then(setQrUrl).catch(console.error);
  }, [badge, origin]);

  const handleCopy = () => {
    const fullUrl = `${origin || window.location.origin}${badge.urlPath}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintBadge = () => {
    const win = window.open('', '_blank', 'width=450,height=600');
    if (!win) return;
    const fullUrl = `${origin || window.location.origin}${badge.urlPath}`;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Elite Inn - Operational Staff Badge: ${badge.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .badge { width: 320px; border: 2px solid #0f172a; border-radius: 8px; background: #fff; padding: 18px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
            .hotel-name { font-size: 15px; font-weight: 900; letter-spacing: 1.5px; color: #0f172a; margin-bottom: 2px; }
            .hotel-sub { font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
            .qr-box { margin: 8px auto; width: 160px; height: 160px; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; }
            .name { font-size: 16px; font-weight: 800; margin-top: 10px; color: #0f172a; }
            .role { font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px; }
            .code-pill { display: inline-block; margin-top: 8px; padding: 3px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-weight: 800; color: #0a246a; }
            .meta { font-size: 10px; color: #64748b; margin-top: 6px; font-weight: 600; }
            .foot { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 9px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="hotel-name">HOTEL ELITE INN</div>
            <div class="hotel-sub">AUTHORIZED OPERATIONAL STAFF ACCESS BADGE</div>
            <div class="qr-box">
              <img src="${qrUrl}" width="150" height="150" alt="QR Code" />
            </div>
            <div class="name">${badge.name}</div>
            <div class="role">${badge.role}</div>
            <div class="code-pill">BADGE: ${badge.code} • CODE: ${badge.serverCode}</div>
            <div class="meta">Department: ${badge.department} | ${badge.shift}</div>
            <div class="meta">${badge.phone}</div>
            <div class="foot">Scan with mobile camera to open authorized floor portal / display.</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{
      border: '1px solid #7F9DB9',
      background: '#FFF',
      borderRadius: '3px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '1px 1px 4px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #EEE', paddingBottom: '4px', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0A246A' }}>
          {badge.icon} {badge.code}
        </span>
        <span style={{ 
          fontSize: '9px', 
          background: badge.colorAccent, 
          color: '#000', 
          padding: '1px 6px', 
          borderRadius: '2px', 
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          {badge.badgeType.toUpperCase()}
        </span>
      </div>

      <div style={{
        background: '#FFF',
        border: '1px solid #CBD5E1',
        padding: '6px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '130px',
        minWidth: '130px'
      }}>
        {qrUrl ? (
          <img src={qrUrl} alt={badge.name} width="125" height="125" style={{ display: 'block' }} />
        ) : (
          <span style={{ fontSize: '10px', color: '#888' }}>Generating QR...</span>
        )}
      </div>

      <div style={{ marginTop: '8px', textAlign: 'center', width: '100%' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#0F172A' }}>{badge.name}</div>
        <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px', fontWeight: 600 }}>{badge.role}</div>
        <div style={{ fontSize: '9px', color: '#0A246A', fontWeight: 700, marginTop: '2px' }}>Code: {badge.serverCode} • {badge.phone}</div>
        <div style={{ fontSize: '9px', color: '#64748B', fontStyle: 'italic', marginTop: '4px', lineHeight: 1.25 }}>
          {badge.description}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '10px' }}>
        <button
          onClick={handlePrintBadge}
          className="ids-btn"
          style={{ flex: 1, padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', background: '#F8FAFC' }}
          title="Print official laminated paper badge"
        >
          🖨️ Print Badge
        </button>
        <button
          onClick={handleCopy}
          className="ids-btn"
          style={{ flex: 1, padding: '3px 4px', fontSize: '10px' }}
          title="Copy direct portal URL link"
        >
          {copied ? '✓ Copied' : '🔗 Link'}
        </button>
      </div>
    </div>
  );
}

export default function IdsStaffMasterModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'MANAGER',
  onOpenMessageBox,
  initialTab = 'directory'
}) {
  const [staffList, setStaffList] = useState(() => getStoredStaff());
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeTab, setActiveTab] = useState(initialTab); // 'directory' | 'roster' | 'payroll' | 'badges'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(() => staffList[0] || HOTEL_STAFF_MEMBERS[0]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchDept = selectedDept === 'ALL' || s.department.toLowerCase() === selectedDept.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serverCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchQuery;
    });
  }, [staffList, selectedDept, searchQuery]);

  // Dept counts
  const deptCounts = useMemo(() => {
    const counts = { ALL: staffList.length };
    staffList.forEach(s => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return counts;
  }, [staffList]);

  // Payroll summary totals
  const payrollSummary = useMemo(() => {
    const totalPayroll = staffList.reduce((acc, s) => acc + (Number(s.monthlySalary) || 0), 0);
    const byDept = {};
    staffList.forEach(s => {
      if (!byDept[s.department]) byDept[s.department] = { count: 0, total: 0 };
      byDept[s.department].count += 1;
      byDept[s.department].total += (Number(s.monthlySalary) || 0);
    });
    return { totalPayroll, byDept };
  }, [staffList]);

  // Check if selected staff has an operational QR badge
  const matchingQrBadge = useMemo(() => {
    if (!selectedStaff) return null;
    return OPERATIONAL_QR_BADGES.find(b => 
      b.serverCode === selectedStaff.serverCode || 
      b.id === selectedStaff.id ||
      b.code === selectedStaff.stewardBadge ||
      b.name.toLowerCase() === selectedStaff.name.toLowerCase()
    );
  }, [selectedStaff]);

  if (!isOpen) return null;

  const handleEditClick = (member) => {
    setEditFormData({ ...member });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    const updated = staffList.map(s => s.id === editFormData.id ? editFormData : s);
    setStaffList(updated);
    saveStoredStaff(updated);
    setSelectedStaff(editFormData);
    setEditModalOpen(false);
    playSuccessChime();
    showToast(`Staff member ${editFormData.name} (${editFormData.id}) updated successfully.`);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to restore the official default 31-staff roster for Hotel Elite Inn?")) {
      setStaffList(HOTEL_STAFF_MEMBERS);
      saveStoredStaff(HOTEL_STAFF_MEMBERS);
      setSelectedStaff(HOTEL_STAFF_MEMBERS[0]);
      playSuccessChime();
      showToast("Staff directory restored to 31 authentic members.");
    }
  };

  const handlePrintAllOperationalBadges = () => {
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    Promise.all(OPERATIONAL_QR_BADGES.map(async (b) => {
      const fullUrl = `${origin}${b.urlPath}`;
      const dataUrl = await QRCode.toDataURL(fullUrl, { width: 140, margin: 1 });
      return { ...b, dataUrl };
    })).then(badgesWithQr => {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hotel Elite Inn - Complete 9 Operational Staff Badges Sheet</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #fff; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
              .card { border: 1.5px solid #000; border-radius: 6px; padding: 12px; text-align: center; background: #fff; page-break-inside: avoid; }
              .title { font-size: 13px; font-weight: 900; }
              .sub { font-size: 8px; color: #555; }
              .name { font-size: 13px; font-weight: bold; margin-top: 6px; }
              .role { font-size: 10px; color: #333; }
              .code { font-size: 9px; font-weight: bold; background: #eee; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-top: 4px; }
              @media print {
                body { margin: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin:0;">HOTEL ELITE INN — OPERATIONAL STAFF QR BADGES</h2>
              <div style="font-size:11px; margin-top:4px;">Official Master Sheet: 6 Stewards + 2 Housekeeping Leads + 1 Kitchen Display KDS = 9 Badges</div>
            </div>
            <div class="grid">
              ${badgesWithQr.map(b => `
                <div class="card">
                  <div class="title">HOTEL ELITE INN</div>
                  <div class="sub">${b.category.toUpperCase()}</div>
                  <div style="margin:6px 0;"><img src="${b.dataUrl}" width="120" height="120" /></div>
                  <div class="name">${b.name}</div>
                  <div class="role">${b.role}</div>
                  <div class="code">BADGE: ${b.code} (${b.serverCode})</div>
                  <div style="font-size:8px; color:#666; margin-top:4px;">${b.phone}</div>
                </div>
              `).join('')}
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
        </html>
      `);
      win.document.close();
    });
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '1120px', 
          maxWidth: '96vw', 
          height: '730px', 
          maxHeight: '94vh',
          backgroundColor: '#ECE9D8',
          border: '2px solid #000',
          boxShadow: '8px 8px 24px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Win32 Title Bar */}
        <div 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', 
            color: '#FFF', 
            height: '28px', 
            padding: '0 8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '11px' }}>
            <span style={{ background: '#A02020', padding: '1px 5px', borderRadius: '2px', fontSize: '9px', fontWeight: 900 }}>IDS NEXT</span>
            <span>Staff Directory, Department Rosters & Operational QR Badges — Total Staff: {staffList.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={onClose} 
              style={{ 
                background: '#ECE9D8', 
                border: '1px solid #716F64', 
                fontSize: '11px', 
                fontWeight: 'bold', 
                height: '18px', 
                width: '18px', 
                lineHeight: '14px', 
                cursor: 'pointer' 
              }}
              title="Close Dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Win32 Menu / Toolbar */}
        <div style={{ background: '#ECE9D8', borderBottom: '1px solid #999488', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('directory')}
              className={`ids-btn ${activeTab === 'directory' ? 'active' : ''}`}
              style={{ fontWeight: activeTab === 'directory' ? 'bold' : 'normal', minWidth: '95px', padding: '3px 8px' }}
            >
              📋 Directory ({staffList.length})
            </button>
            <button 
              onClick={() => setActiveTab('roster')}
              className={`ids-btn ${activeTab === 'roster' ? 'active' : ''}`}
              style={{ fontWeight: activeTab === 'roster' ? 'bold' : 'normal', minWidth: '95px', padding: '3px 8px' }}
            >
              ⏰ Shift Rosters
            </button>
            <button 
              onClick={() => setActiveTab('payroll')}
              className={`ids-btn ${activeTab === 'payroll' ? 'active' : ''}`}
              style={{ fontWeight: activeTab === 'payroll' ? 'bold' : 'normal', minWidth: '95px', padding: '3px 8px' }}
            >
              💰 HR & Payroll
            </button>
            <button 
              onClick={() => setActiveTab('badges')}
              className={`ids-btn ${activeTab === 'badges' ? 'active' : ''}`}
              style={{ 
                fontWeight: 'bold', 
                minWidth: '145px', 
                padding: '3px 10px', 
                background: activeTab === 'badges' ? '#E6F4EA' : '#FFF', 
                borderColor: activeTab === 'badges' ? '#34A853' : '#7F9DB9',
                color: activeTab === 'badges' ? '#137333' : '#0A246A'
              }}
            >
              📱 Operational QR Badges (9)
            </button>
            <button 
              onClick={() => setReportModalOpen(true)}
              className="ids-btn"
              style={{ minWidth: '85px', padding: '3px 8px', color: '#0A246A' }}
            >
              🖨️ Print Roster
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#555' }}>Search:</span>
            <input 
              type="text" 
              placeholder="Search by name, role or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '2px 6px', border: '1px solid #7F9DB9', fontSize: '11px', width: '160px', background: '#FFF' }}
            />
            <button 
              onClick={handleResetDefaults} 
              className="ids-btn" 
              style={{ fontSize: '10px', padding: '2px 6px' }}
              title="Reset to factory 31 staff configuration"
            >
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Department Filters Bar (Visible for Directory & Roster) */}
        {activeTab !== 'badges' && (
          <div style={{ background: '#F5F4EC', borderBottom: '1px solid #D0CDC0', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', marginRight: '4px' }}>Department:</span>
            {[
              { id: 'ALL', label: `All Staff (${deptCounts['ALL'] || 31})` },
              { id: 'Reception', label: `Reception (${deptCounts['Reception'] || 3})` },
              { id: 'Restaurant', label: `Restaurant / F&B (${deptCounts['Restaurant'] || 7})` },
              { id: 'Kitchen', label: `Kitchen (${deptCounts['Kitchen'] || 10})` },
              { id: 'Housekeeping', label: `Housekeeping (${deptCounts['Housekeeping'] || 9})` },
              { id: 'Security', label: `Security (${deptCounts['Security'] || 2})` }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedDept === d.id ? '#0A246A' : '#7F9DB9',
                  background: selectedDept === d.id ? '#0A246A' : '#FFF',
                  color: selectedDept === d.id ? '#FFF' : '#000',
                  fontWeight: selectedDept === d.id ? 'bold' : 'normal'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px', gap: '10px' }}>

          {/* TAB 1: DIRECTORY TABLE & DETAIL VIEW */}
          {activeTab === 'directory' && (
            <div style={{ display: 'flex', flex: 1, gap: '10px', overflow: 'hidden' }}>
              {/* Left: Master Table */}
              <div style={{ flex: 3, border: '1px solid #7F9DB9', background: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', position: 'sticky', top: 0, zIndex: 10, textAlign: 'left' }}>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '85px' }}>Emp ID</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '60px' }}>Code</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '140px' }}>Staff Name</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '90px' }}>Department</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC' }}>Role / Designation</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '70px' }}>Shift</th>
                        <th style={{ padding: '4px 6px', borderRight: '1px solid #CCC', width: '95px' }}>Phone</th>
                        <th style={{ padding: '4px 6px', width: '60px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((s) => {
                        const isSelected = selectedStaff?.id === s.id;
                        let deptColor = '#333';
                        if (s.department === 'Reception') deptColor = '#0066CC';
                        else if (s.department === 'Restaurant') deptColor = '#B8860B';
                        else if (s.department === 'Kitchen') deptColor = '#D2691E';
                        else if (s.department === 'Housekeeping') deptColor = '#2E8B57';
                        else if (s.department === 'Security') deptColor = '#4B0082';

                        return (
                          <tr 
                            key={s.id}
                            onClick={() => setSelectedStaff(s)}
                            style={{ 
                              cursor: 'pointer', 
                              borderBottom: '1px solid #EEE',
                              background: isSelected ? '#316AC5' : '#FFF',
                              color: isSelected ? '#FFF' : '#000'
                            }}
                          >
                            <td style={{ padding: '4px 6px', fontWeight: 'bold' }}>{s.id}</td>
                            <td style={{ padding: '4px 6px' }}>{s.serverCode}</td>
                            <td style={{ padding: '4px 6px', fontWeight: 600 }}>{s.name}</td>
                            <td style={{ padding: '4px 6px', color: isSelected ? '#FFF' : deptColor, fontWeight: 'bold' }}>
                              {s.department}
                            </td>
                            <td style={{ padding: '4px 6px' }}>{s.role}</td>
                            <td style={{ padding: '4px 6px' }}>{s.shift}</td>
                            <td style={{ padding: '4px 6px' }}>{s.phone}</td>
                            <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                              <span style={{ 
                                color: isSelected ? '#FFF' : (s.status === 'Active' ? '#008000' : '#C00'), 
                                fontWeight: 'bold' 
                              }}>
                                ● {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#ECE9D8', borderTop: '1px solid #D0CDC0', padding: '4px 8px', fontSize: '10px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Showing {filteredStaff.length} of {staffList.length} staff members</span>
                  <span>Click any row to view complete personnel & shift profile</span>
                </div>
              </div>

              {/* Right: Selected Staff Detail Card */}
              {selectedStaff && (
                <div style={{ flex: 2, border: '1px solid #7F9DB9', background: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(90deg, #ECE9D8 0%, #E0DEC8 100%)', borderBottom: '1px solid #7F9DB9', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', color: '#0A246A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Personnel Record: {selectedStaff.id}</span>
                    <button 
                      onClick={() => handleEditClick(selectedStaff)}
                      className="ids-btn"
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      ✏️ Edit Record
                    </button>
                  </div>

                  <div style={{ padding: '10px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: '1px dashed #CCC' }}>
                      <div style={{ width: '42px', height: '42px', background: '#0A246A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold' }}>
                        {selectedStaff.shortName ? selectedStaff.shortName[0] : 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0A246A' }}>{selectedStaff.name}</div>
                        <div style={{ color: '#666', fontSize: '10px' }}>{selectedStaff.designation} • {selectedStaff.gender}</div>
                      </div>
                      {matchingQrBadge && (
                        <button
                          onClick={() => setActiveTab('badges')}
                          className="ids-btn"
                          style={{ fontSize: '10px', padding: '2px 8px', background: '#E6F4EA', borderColor: '#34A853', color: '#137333', fontWeight: 'bold' }}
                          title="View steward/lead operational QR code"
                        >
                          📱 View QR Badge
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Department</span>
                        <strong>{selectedStaff.department}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Sub-Department</span>
                        <strong style={{ fontSize: '10px' }}>{selectedStaff.subDept || '-'}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Shift Timings</span>
                        <strong>{selectedStaff.shift}</strong>
                        <div style={{ fontSize: '9px', color: '#555' }}>{selectedStaff.shiftHours}</div>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Weekly Off</span>
                        <strong style={{ color: '#C00' }}>{selectedStaff.weeklyOff || 'Rotational'}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Mobile Contact</span>
                        <strong>{selectedStaff.phone}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>IDS Server / Badge Code</span>
                        <strong style={{ color: '#0A246A' }}>{selectedStaff.serverCode} {selectedStaff.stewardBadge ? `(${selectedStaff.stewardBadge})` : ''}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>IDS Access Role</span>
                        <strong>{selectedStaff.idsRole}</strong>
                      </div>
                      <div style={{ background: '#F8F9FA', padding: '5px', border: '1px solid #E9ECEF' }}>
                        <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Monthly Basic Salary</span>
                        <strong style={{ color: '#008000' }}>₹{Number(selectedStaff.monthlySalary).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {selectedStaff.station && (
                      <div style={{ background: '#FFF9E6', padding: '6px', border: '1px solid #FFE082' }}>
                        <span style={{ fontSize: '10px', color: '#B8860B', display: 'block', fontWeight: 'bold' }}>Assigned Station / Section</span>
                        <div style={{ fontSize: '10px', color: '#333' }}>{selectedStaff.station}</div>
                      </div>
                    )}

                    {selectedStaff.assignedFloor && (
                      <div style={{ background: '#E8F5E9', padding: '6px', border: '1px solid #C8E6C9' }}>
                        <span style={{ fontSize: '10px', color: '#2E8B57', display: 'block', fontWeight: 'bold' }}>Assigned Housekeeping Beat</span>
                        <div style={{ fontSize: '10px', color: '#333' }}>{selectedStaff.assignedFloor}</div>
                      </div>
                    )}

                    <div style={{ background: '#F0F4FA', padding: '6px', border: '1px solid #D0E0F0', marginTop: 'auto' }}>
                      <div style={{ fontSize: '10px', color: '#555' }}>
                        <strong>Emergency Contact:</strong> {selectedStaff.emergencyContact || 'Verified on HR File'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#555' }}>
                        <strong>Date of Joining:</strong> {selectedStaff.joinDate || 'Hotel Opening'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHIFT ROSTER & WEEKLY DUTY CHART */}
          {activeTab === 'roster' && (
            <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#ECE9D8', padding: '6px 10px', borderBottom: '1px solid #7F9DB9', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#0A246A' }}>
                  📅 Weekly Shift Roster & Operational Coverage Matrix ({staffList.length} Active Staff)
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  Coverage: Front Office (24/7) • F&B & Kitchen (06:00 - 02:00) • HK (07:00 - 23:00) • Security (24/7)
                </span>
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                  <thead>
                    <tr style={{ background: '#F5F4EC', borderBottom: '1px solid #7F9DB9', position: 'sticky', top: 0, zIndex: 10, textAlign: 'center' }}>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '130px', textAlign: 'left' }}>Staff Member</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '90px' }}>Dept</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '100px' }}>Shift Hours</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Mon</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Tue</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Wed</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Thu</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Fri</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '50px' }}>Sat</th>
                      <th style={{ padding: '4px', width: '50px' }}>Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((s) => {
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const offDay = s.weeklyOff?.substring(0, 3) || 'None';

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '4px 6px', textAlign: 'left' }}>
                            <strong>{s.shortName}</strong>
                            <div style={{ fontSize: '9px', color: '#666' }}>{s.serverCode} • {s.role.split('(')[0]}</div>
                          </td>
                          <td style={{ padding: '4px', fontWeight: 'bold' }}>{s.department}</td>
                          <td style={{ padding: '4px', fontSize: '9px', color: '#444' }}>{s.shiftHours?.split('(')[0]}</td>
                          {days.map(d => {
                            const isOff = offDay.toLowerCase() === d.toLowerCase();
                            return (
                              <td 
                                key={d} 
                                style={{ 
                                  padding: '4px', 
                                  borderRight: '1px solid #EEE',
                                  textAlign: 'center',
                                  background: isOff ? '#FFF0F0' : '#F4F9F4',
                                  color: isOff ? '#C00' : '#006400',
                                  fontWeight: 'bold',
                                  fontSize: '10px'
                                }}
                              >
                                {isOff ? 'OFF' : s.shift.substring(0, 1)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HR & PAYROLL SUMMARY */}
          {activeTab === 'payroll' && (
            <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#ECE9D8', padding: '6px 10px', borderBottom: '1px solid #7F9DB9', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#0A246A' }}>
                  💼 Department Payroll Budget & Statutory Overview (Monthly Basis)
                </span>
                <span style={{ fontWeight: 'bold', color: '#008000', fontSize: '12px' }}>
                  Total Monthly Payroll: ₹{payrollSummary.totalPayroll.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ padding: '14px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {Object.entries(payrollSummary.byDept).map(([dept, data]) => (
                    <div key={dept} style={{ border: '1px solid #D0CDC0', background: '#FAFAFA', padding: '10px', borderRadius: '3px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0A246A' }}>{dept}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Staff Count: <strong>{data.count} members</strong></div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#008000', marginTop: '6px' }}>
                        ₹{data.total.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
                        Avg/Head: ₹{Math.round(data.total / data.count).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #7F9DB9', background: '#FFF' }}>
                  <div style={{ background: '#F5F4EC', padding: '6px 8px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #D0CDC0' }}>
                    Statutory Compliance & Bank Transfer Verification
                  </div>
                  <div style={{ padding: '10px', fontSize: '11px', lineHeight: 1.6, color: '#333' }}>
                    <div>• <strong>Bank Accounts:</strong> 31/31 Staff Bank Accounts mapped with Odisha Gramya Bank & SBI Jagatpur Branch.</div>
                    <div>• <strong>EPF & ESIC:</strong> Eligible staff under statutory wage ceilings enrolled with Unified Portal.</div>
                    <div>• <strong>Shift Allowance:</strong> Night shift allowance applicable for Reception Night Duty and Security Patrol.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPERATIONAL QR BADGES (EXACTLY 9 BADGES) */}
          {activeTab === 'badges' && (
            <div style={{ flex: 1, border: '1px solid #7F9DB9', background: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#ECE9D8', padding: '6px 10px', borderBottom: '1px solid #7F9DB9', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#0A246A', fontSize: '12px' }}>
                    📱 Operational Staff QR Badges — Exactly 9 Operational Codes
                  </span>
                  <span style={{ fontSize: '10px', color: '#555', marginLeft: '8px' }}>
                    (6 Stewards + 2 Housekeeping Leads + 1 Kitchen Display KDS)
                  </span>
                </div>
                <button
                  onClick={handlePrintAllOperationalBadges}
                  className="ids-btn"
                  style={{ fontSize: '10px', padding: '3px 10px', fontWeight: 'bold', color: '#0A246A' }}
                  title="Print all 9 badges on a single 3x3 master badge sheet"
                >
                  🖨️ Print All 9 Badges Sheet
                </button>
              </div>

              <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. RESTAURANT FLOOR STEWARDS (6 QR CODES) */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#B8860B', background: '#FFF8E7', padding: '4px 8px', borderLeft: '4px solid #F59E0B', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👨‍🍳 1. Restaurant Floor Stewards (6 QR Badges) — Scans into Personal Mobile Order Pad</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>Codes STW-01 to STW-06 (6 Staff)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                    {OPERATIONAL_QR_BADGES.filter(b => b.badgeType === 'steward').map(badge => (
                      <IdsQrBadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>

                {/* 2. HOUSEKEEPING LEADERSHIP (2 QR CODES) */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#10B981', background: '#ECFDF5', padding: '4px 8px', borderLeft: '4px solid #10B981', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🧹 2. Housekeeping Leadership (2 QR Badges) — Scans into HK Mobile Inspection Pad</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>1 Manager + 1 Supervisor</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                    {OPERATIONAL_QR_BADGES.filter(b => b.badgeType === 'housekeeping').map(badge => (
                      <IdsQrBadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>

                {/* 3. KITCHEN PRODUCTION DISPLAY (1 QR CODE) */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#EF4444', background: '#FEF2F2', padding: '4px 8px', borderLeft: '4px solid #EF4444', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🍳 3. Kitchen Production Display (1 QR Badge) — Live KOT Feed & Order Bell Chime</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>Kitchen Manager Wall Tablet</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px', maxWidth: '320px' }}>
                    {OPERATIONAL_QR_BADGES.filter(b => b.badgeType === 'kitchen').map(badge => (
                      <IdsQrBadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div style={{ background: '#0A246A', color: '#FFF', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '3px', boxShadow: '2px 2px 8px rgba(0,0,0,0.3)', alignSelf: 'center' }}>
              ✓ {toastMessage}
            </div>
          )}

          {/* Bottom Dialog Action Footer */}
          <div style={{ background: '#ECE9D8', borderTop: '1px solid #D0CDC0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>
              PMS Accounting Date: <strong>{accountingDate}</strong> | User: <strong>{currentUser}</strong> | Operational Badges: <strong>9 Codes (6 Stewards, 2 HK, 1 KDS)</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handlePrintAllOperationalBadges} 
                className="ids-btn" 
                style={{ minWidth: '95px', padding: '3px 12px', fontWeight: 'bold', color: '#0A246A' }}
              >
                📱 Badges Sheet
              </button>
              <button 
                onClick={onClose} 
                className="ids-btn" 
                style={{ minWidth: '75px', padding: '3px 14px', fontWeight: 'bold' }}
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>

        {/* SUB-MODAL: EDIT STAFF DETAILS */}
        {editModalOpen && editFormData && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '480px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '6px 6px 18px rgba(0,0,0,0.7)', padding: '0' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #3A6EA5 100%)', color: '#FFF', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Edit Staff Profile - {editFormData.id}</span>
                <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Full Name:</label>
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Short / Call Name:</label>
                  <input 
                    type="text" 
                    value={editFormData.shortName} 
                    onChange={e => setEditFormData({ ...editFormData, shortName: e.target.value })} 
                    style={{ width: '120px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                  <label style={{ width: '60px', textAlign: 'right', marginRight: '6px', fontWeight: 'bold' }}>Code:</label>
                  <input 
                    type="text" 
                    value={editFormData.serverCode} 
                    onChange={e => setEditFormData({ ...editFormData, serverCode: e.target.value })} 
                    style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Role / Post:</label>
                  <input 
                    type="text" 
                    value={editFormData.role} 
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Shift:</label>
                  <select 
                    value={editFormData.shift} 
                    onChange={e => setEditFormData({ ...editFormData, shift: e.target.value })}
                    style={{ width: '120px', padding: '2px', border: '1px solid #7F9DB9' }}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="General">General</option>
                    <option value="Split">Split</option>
                  </select>

                  <label style={{ width: '70px', textAlign: 'right', marginRight: '6px', fontWeight: 'bold' }}>Weekly Off:</label>
                  <select 
                    value={editFormData.weeklyOff} 
                    onChange={e => setEditFormData({ ...editFormData, weeklyOff: e.target.value })}
                    style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Rotational">Rotational</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Contact Phone:</label>
                  <input 
                    type="text" 
                    value={editFormData.phone} 
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} 
                    style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', fontWeight: 'bold' }}>Monthly Salary:</label>
                  <input 
                    type="number" 
                    value={editFormData.monthlySalary} 
                    onChange={e => setEditFormData({ ...editFormData, monthlySalary: Number(e.target.value) })} 
                    style={{ width: '120px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                  <label style={{ width: '60px', textAlign: 'right', marginRight: '6px', fontWeight: 'bold' }}>Status:</label>
                  <select 
                    value={editFormData.status} 
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ width: '90px', padding: '2px', border: '1px solid #7F9DB9' }}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Passive">Passive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button onClick={handleSaveEdit} className="ids-btn" style={{ minWidth: '70px', fontWeight: 'bold' }}>Save Changes</button>
                  <button onClick={() => setEditModalOpen(false)} className="ids-btn" style={{ minWidth: '60px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL: PRINTABLE CRYSTAL REPORT PREVIEW */}
        {reportModalOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '720px', maxWidth: '92vw', height: '560px', background: '#FFF', border: '2px solid #000', boxShadow: '8px 8px 24px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11px' }}>🖨️ Crystal Reports Preview - Staff Operational Roster</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => window.print()} className="ids-btn" style={{ fontSize: '10px', padding: '2px 8px' }}>Print Slip</button>
                  <button onClick={() => setReportModalOpen(false)} className="ids-btn" style={{ fontSize: '10px', padding: '2px 8px' }}>Close</button>
                </div>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '11px', color: '#000' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px double #000', paddingBottom: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>HOTEL ELITE INN</div>
                  <div style={{ fontSize: '10px' }}>Station Road, Near Railway Station, Cuttack / Puri, Odisha</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>OFFICIAL STAFF DUTY ROSTER & DEPARTMENT REGISTER</div>
                  <div style={{ fontSize: '10px' }}>Generated on: {new Date().toLocaleDateString('en-GB')} | Shift Auditor: {currentUser}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
                  <span>TOTAL AUTHORIZED STRENGTH: 31 MEMBERS</span>
                  <span>ACTIVE DEPARTMENTS: 5</span>
                </div>

                {['Reception', 'Restaurant', 'Kitchen', 'Housekeeping', 'Security'].map(dept => {
                  const deptStaff = staffList.filter(s => s.department === dept);
                  return (
                    <div key={dept} style={{ marginBottom: '14px' }}>
                      <div style={{ fontWeight: 'bold', background: '#EEE', padding: '2px 4px', borderLeft: '3px solid #000' }}>
                        DEPARTMENT: {dept.toUpperCase()} ({deptStaff.length} Members)
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #CCC', textAlign: 'left', fontSize: '10px' }}>
                            <th style={{ width: '80px' }}>ID</th>
                            <th style={{ width: '60px' }}>CODE</th>
                            <th style={{ width: '160px' }}>NAME</th>
                            <th>DESIGNATION</th>
                            <th style={{ width: '80px' }}>SHIFT</th>
                            <th style={{ width: '80px' }}>OFF DAY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptStaff.map(st => (
                            <tr key={st.id} style={{ borderBottom: '1px dotted #DDD' }}>
                              <td>{st.id}</td>
                              <td>{st.serverCode}</td>
                              <td><strong>{st.name}</strong></td>
                              <td>{st.role}</td>
                              <td>{st.shift}</td>
                              <td>{st.weeklyOff}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                <div style={{ marginTop: '24px', paddingTop: '10px', borderTop: '1px solid #000', display: 'flex', justifyContent: 'space-between' }}>
                  <div>Prepared By: <strong>Front Desk / HR</strong></div>
                  <div>Verified By: <strong>General Manager</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
