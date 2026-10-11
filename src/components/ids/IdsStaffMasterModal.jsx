import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  HOTEL_STAFF_MEMBERS, 
  DEPARTMENT_SUMMARY, 
  getStoredStaff, 
  saveStoredStaff 
} from '../../data/hotelStaffData';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';

export default function IdsStaffMasterModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'MANAGER',
  onOpenMessageBox
}) {
  const [staffList, setStaffList] = useState(() => getStoredStaff());
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'roster' | 'payroll' | 'badges'
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

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '1080px', 
          maxWidth: '96vw', 
          height: '720px', 
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
            <span>Staff Directory, Department Rosters & HR Shift Master — Total Staff: {staffList.length}</span>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              onClick={() => setReportModalOpen(true)}
              className="ids-btn"
              style={{ minWidth: '90px', padding: '3px 8px', color: '#0A246A' }}
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
              style={{ padding: '2px 6px', border: '1px solid #7F9DB9', fontSize: '11px', width: '180px', background: '#FFF' }}
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

        {/* Department Filters Bar */}
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
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0A246A' }}>{selectedStaff.name}</div>
                        <div style={{ color: '#666', fontSize: '10px' }}>{selectedStaff.designation} • {selectedStaff.gender}</div>
                      </div>
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

          {/* Toast Notification */}
          {toastMessage && (
            <div style={{ background: '#0A246A', color: '#FFF', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '3px', boxShadow: '2px 2px 8px rgba(0,0,0,0.3)', alignSelf: 'center' }}>
              ✓ {toastMessage}
            </div>
          )}

          {/* Bottom Dialog Action Footer */}
          <div style={{ background: '#ECE9D8', borderTop: '1px solid #D0CDC0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>
              PMS Accounting Date: <strong>{accountingDate}</strong> | User: <strong>{currentUser}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setReportModalOpen(true)} 
                className="ids-btn" 
                style={{ minWidth: '85px', padding: '3px 12px', fontWeight: 'bold' }}
              >
                🖨️ Roster Print
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
