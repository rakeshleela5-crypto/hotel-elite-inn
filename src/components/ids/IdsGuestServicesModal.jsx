import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  MessageSquare, Compass, ThumbsUp, PhoneCall, 
  AlertCircle, CheckSquare, Search 
} from 'lucide-react';
import { INITIAL_HOUSEKEEPING_COMPLAINTS } from '../../data/idsPmsStore';
import { createFastApiGuestComplaint, resolveFastApiGuestComplaint } from '../../utils/backendApi';

export default function IdsGuestServicesModal({
  isOpen,
  onClose,
  initialTab = 'log-complaints',
  accountingDate = '27-JAN-2026',
  inhouseGuests = [],
  onComplaintsCountChange,
  onOpenMessageBox
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'log-complaints');
  const [isMaximized, setIsMaximized] = useState(false);
  const [complaintsList, setComplaintsList] = useState(INITIAL_HOUSEKEEPING_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState(complaintsList[0] || null);

  // Form State for Log Complaints (Video 05 Frame 019)
  const [logFormData, setLogFormData] = useState({
    scope: 'Room',
    roomNo: '205',
    guestName: 'Mr Kumar Anil',
    department: 'Housekeeping',
    arrival: '27-JAN-2026',
    departure: '01-FEB-2026',
    guestStatus: 'In-House',
    natureOfComplaint: 'Extra bath towels required & linen replacement for extra pillow',
    receivedBy: 'MANAGER',
    date: accountingDate,
    time: '20:04'
  });

  // State for Attend Complaints (Video 07 Frame 015)
  const [attendData, setAttendData] = useState({
    attendedBy: '002 Ramesh Nayak',
    actionTaken: 'Fresh sanitized bath towels delivered to Room 205. Linen replaced.',
    tatMinutes: '12',
    status: 'Resolved'
  });

  if (!isOpen) return null;

  const handleRoomSelect = (rNo) => {
    const matched = inhouseGuests.find(g => g.roomNo === rNo) || {
      roomNo: rNo,
      guestName: rNo === '205' ? 'Mr Kumar Anil' : (rNo === '201' ? 'Mr Vikram Singhania' : 'In-House Guest'),
      arrivalDate: '27-JAN-2026',
      departureDate: '01-FEB-2026'
    };

    setLogFormData({
      ...logFormData,
      roomNo: rNo,
      guestName: matched.guestName,
      arrival: matched.arrivalDate || '27-JAN-2026',
      departure: matched.departureDate || '01-FEB-2026'
    });
  };

  const handleSaveComplaint = () => {
    if (!logFormData.natureOfComplaint.trim()) {
      if (onOpenMessageBox) {
        onOpenMessageBox({
          title: 'Validation Error',
          message: 'Please provide Nature of Complaint details.',
          type: 'error'
        });
      } else {
        alert('Please provide Nature of Complaint details.');
      }
      return;
    }

    const newComplaint = {
      complaintId: `CMP-${accountingDate.slice(-4)}-${String(complaintsList.length + 1).padStart(3, '0')}`,
      scope: logFormData.scope,
      roomNo: logFormData.roomNo,
      guestName: logFormData.guestName,
      arrival: logFormData.arrival,
      departure: logFormData.departure,
      department: logFormData.department,
      natureOfComplaint: logFormData.natureOfComplaint,
      receivedBy: logFormData.receivedBy,
      date: logFormData.date,
      time: logFormData.time,
      status: 'Pending'
    };

    const updated = [newComplaint, ...complaintsList];
    setComplaintsList(updated);
    setSelectedComplaint(newComplaint);

    // Auto-sync guest complaint to Railway PostgreSQL
    createFastApiGuestComplaint({
      complaint_id: newComplaint.complaintId,
      room_no: newComplaint.roomNo,
      guest_name: newComplaint.guestName,
      department: newComplaint.department,
      nature_of_complaint: newComplaint.natureOfComplaint,
      received_by: newComplaint.receivedBy,
      status: 'Pending'
    }).catch(err => console.warn('[FastAPI] Guest complaint sync failed:', err));

    const pendingCount = updated.filter(c => c.status === 'Pending').length;
    if (onComplaintsCountChange) {
      onComplaintsCountChange(pendingCount);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Guest Complaint Registered',
        message: `Complaint ${newComplaint.complaintId} registered for Room ${newComplaint.roomNo} (${newComplaint.department}). Registered Complaints KPI count updated to ${pendingCount}.`,
        type: 'info',
        onOk: () => setActiveTab('attend-complaints')
      });
    } else {
      setActiveTab('attend-complaints');
    }
  };

  const handleAttendComplaint = () => {
    if (!selectedComplaint) return;

    // Auto-sync resolution to Railway PostgreSQL
    resolveFastApiGuestComplaint(
      selectedComplaint.complaintId,
      attendData.attendedBy,
      attendData.actionTaken
    ).catch(err => console.warn('[FastAPI] Complaint resolve sync failed:', err));

    const updated = complaintsList.map(c => {
      if (c.complaintId === selectedComplaint.complaintId) {
        return {
          ...c,
          status: 'Resolved',
          attendedBy: attendData.attendedBy,
          actionTaken: attendData.actionTaken,
          tatMinutes: attendData.tatMinutes,
          resolvedDate: accountingDate,
          resolvedTime: '20:18'
        };
      }
      return c;
    });

    setComplaintsList(updated);
    const pendingCount = updated.filter(c => c.status === 'Pending').length;
    if (onComplaintsCountChange) {
      onComplaintsCountChange(pendingCount);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Complaint Attended & Resolved',
        message: `Complaint ${selectedComplaint.complaintId} marked as Resolved by ${attendData.attendedBy}. TAT: ${attendData.tatMinutes} mins. Active complaints count is now ${pendingCount}.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className={`ids-modal-window ${isMaximized ? 'maximized' : ''}`}
        style={{ 
          width: isMaximized ? '980px' : '880px', 
          maxWidth: isMaximized ? '96vw' : '94vw',
          height: isMaximized ? '620px' : '560px',
          maxHeight: isMaximized ? '92vh' : '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ECE9D8',
          border: '2px solid #000',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
          fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif"
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '4px 8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          <span>Guest Services V6.5.002.1</span>
          <div className="ids-window-controls" style={{ display: 'flex', gap: '2px' }}>
            <button className="ids-win-btn" title="Minimize" onClick={() => {}} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: 1 }}>_</button>
            <button className="ids-win-btn" title={isMaximized ? "Restore Window" : "Maximize (Compact Window)"} onClick={() => setIsMaximized(!isMaximized)} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="ids-win-btn close" title="Close Dialog" onClick={onClose} style={{ width: '20px', height: '20px', fontSize: '12px', lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* 7 Tabs Header with Authentic Retro Icons (Frame 019 & Frame 015) */}
        <div 
          style={{ 
            display: 'flex', 
            background: '#ECE9D8', 
            borderBottom: '2px solid #716F64',
            padding: '8px 10px 0 10px',
            gap: '4px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'messages', label: 'Messages', icon: <MessageSquare size={14} /> },
            { id: 'locator', label: 'Locator', icon: <Compass size={14} /> },
            { id: 'likes', label: 'Likes/Dislikes', icon: <ThumbsUp size={14} /> },
            { id: 'wakeups', label: 'Wakeup Calls', icon: <PhoneCall size={14} /> },
            { id: 'log-complaints', label: 'Log Complaints', icon: <AlertCircle size={14} color="#C00" /> },
            { id: 'attend-complaints', label: 'Attend Complaints', icon: <CheckSquare size={14} color="#008000" /> },
            { id: 'browse-complaints', label: 'Browse Complaints', icon: <Search size={14} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="ids-tab-btn" 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px', 
                  fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#0A246A' : '#1A1A1A',
                  background: isActive ? '#FFFFFF' : 'linear-gradient(180deg, #F0EFE7 0%, #D8D4C8 100%)',
                  border: '1px solid #716F64',
                  borderBottom: isActive ? '2px solid #FFFFFF' : '1px solid #716F64',
                  marginBottom: isActive ? '-2px' : '0px',
                  boxShadow: isActive ? 'inset 0 2px 0 #316AC5' : 'inset 0 1px 0 #FFFFFF',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  borderRadius: '3px 3px 0 0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 5: Log Complaints Body (Video 05 Frame 019) */}
        {activeTab === 'log-complaints' && (
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '18px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {/* Radio Selector */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px dotted #CCC' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={logFormData.scope === 'Room'} 
                    onChange={() => setLogFormData({ ...logFormData, scope: 'Room' })} 
                  />
                  <strong style={{ color: '#0A246A' }}>Room</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={logFormData.scope === 'Others'} 
                    onChange={() => setLogFormData({ ...logFormData, scope: 'Others' })} 
                  />
                  <strong>Others (Public Area / Banquet)</strong>
                </label>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Room No.</label>
                    <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                      <input 
                        type="text" 
                        value={logFormData.roomNo}
                        onChange={(e) => handleRoomSelect(e.target.value)}
                        className="ids-input"
                        style={{ width: '80px', fontWeight: 'bold', fontSize: '13px', height: '28px' }} 
                      />
                      <button 
                        className="ids-btn-classic"
                        style={{ padding: '0 8px', height: '28px', fontSize: '12px' }}
                        title="Room Lookup"
                        onClick={() => {
                          const r = prompt("Select Room (101, 102, 201, 202):", logFormData.roomNo);
                          if (r) handleRoomSelect(r);
                        }}
                      >?</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Guest Name</label>
                    <select 
                      value={logFormData.guestName}
                      onChange={(e) => setLogFormData({ ...logFormData, guestName: e.target.value })}
                      className="ids-select"
                      style={{ flex: 1, fontSize: '13px', height: '28px' }}
                    >
                      <option value="Mr Kumar Anil">Mr Kumar Anil</option>
                      <option value="Mr Vikram Singhania">Mr Vikram Singhania</option>
                      <option value="Mr Rajesh Sharma">Mr Rajesh Sharma</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Department</label>
                    <select 
                      value={logFormData.department}
                      onChange={(e) => setLogFormData({ ...logFormData, department: e.target.value })}
                      className="ids-select"
                      style={{ flex: 1, fontWeight: 'bold', color: '#0A246A', fontSize: '13px', height: '28px' }}
                    >
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Maintenance / Engineering">Maintenance / Engineering</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="IT & Telecom">IT & Telecom</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Arrival</label>
                    <input 
                      type="text" 
                      value={logFormData.arrival} 
                      onChange={(e) => setLogFormData({ ...logFormData, arrival: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Departure</label>
                    <input 
                      type="text" 
                      value={logFormData.departure} 
                      onChange={(e) => setLogFormData({ ...logFormData, departure: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600, fontSize: '13px' }}>Guest Status</label>
                    <input 
                      type="text" 
                      value={logFormData.guestStatus} 
                      onChange={(e) => setLogFormData({ ...logFormData, guestStatus: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Description & Audit Footer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px dotted #CCC' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Nature of Complaint</label>
                  <textarea 
                    rows={4}
                    value={logFormData.natureOfComplaint}
                    onChange={(e) => setLogFormData({ ...logFormData, natureOfComplaint: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #7F9DB9', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical', minHeight: '90px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px', fontWeight: 600, fontSize: '13px' }}>Received by</label>
                    <input 
                      type="text" 
                      value={logFormData.receivedBy} 
                      onChange={(e) => setLogFormData({ ...logFormData, receivedBy: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px', fontWeight: 600, fontSize: '13px' }}>Date</label>
                    <input 
                      type="text" 
                      value={logFormData.date} 
                      onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px', fontWeight: 600, fontSize: '13px' }}>Time</label>
                    <input 
                      type="text" 
                      value={logFormData.time} 
                      onChange={(e) => setLogFormData({ ...logFormData, time: e.target.value })}
                      className="ids-input" 
                      style={{ flex: 1, background: '#FFF', fontSize: '13px', height: '28px' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Command Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={handleSaveComplaint} className="ids-btn-classic success" style={{ minWidth: '85px', height: '28px', fontSize: '12.5px', fontWeight: 'bold' }}>Save</button>
              <button onClick={() => {}} className="ids-btn-classic info" style={{ minWidth: '85px', height: '28px', fontSize: '12.5px' }}>Panel</button>
              <button onClick={onClose} className="ids-btn-classic exit" style={{ minWidth: '85px', height: '28px', fontSize: '12.5px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Tab 6: Attend Complaints Body (Video 07 Frame 015) */}
        {activeTab === 'attend-complaints' && (
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Worklist Grid Table */}
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                flex: isMaximized ? 1 : 'unset',
                maxHeight: isMaximized ? '92vh' : '88vh', 
                minHeight: '140px', 
                overflowY: 'auto',
                marginBottom: '14px'
              }}
            >
              <table className="ids-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', borderRight: '1px solid #CCC', width: '80px' }}>Room No.</th>
                    <th style={{ padding: '6px 8px', borderRight: '1px solid #CCC' }}>Guest Name</th>
                    <th style={{ padding: '6px 8px', borderRight: '1px solid #CCC', width: '100px' }}>Status</th>
                    <th style={{ padding: '6px 8px', borderRight: '1px solid #CCC', width: '90px' }}>Complaints</th>
                    <th style={{ padding: '6px 8px', borderRight: '1px solid #CCC', width: '80px' }}>Messages</th>
                    <th style={{ padding: '6px 8px', width: '80px' }}>Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {complaintsList.map((c, idx) => (
                    <tr 
                      key={c.complaintId || idx}
                      onClick={() => setSelectedComplaint(c)}
                      style={{ 
                        cursor: 'pointer', 
                        borderBottom: '1px solid #EEE',
                        background: selectedComplaint?.complaintId === c.complaintId ? '#316AC5' : '#FFF',
                        color: selectedComplaint?.complaintId === c.complaintId ? '#FFF' : '#000'
                      }}
                    >
                      <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{c.roomNo}</td>
                      <td style={{ padding: '6px 8px' }}>{c.guestName}</td>
                      <td style={{ padding: '6px 8px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '2px', 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          background: c.status === 'Resolved' ? '#D4EDDA' : '#FFF3CD',
                          color: c.status === 'Resolved' ? '#155724' : '#856404'
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 'bold', color: c.status === 'Pending' ? '#C00' : 'inherit' }}>
                        {c.status === 'Pending' ? 'Yes' : 'No'}
                      </td>
                      <td style={{ padding: '6px 8px' }}>-</td>
                      <td style={{ padding: '6px 8px' }}>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Complaint Detail & Resolution Section */}
            {selectedComplaint && (
              <div 
                style={{ 
                  border: '1px solid #7F9DB9', 
                  background: '#FFF', 
                  padding: '14px',
                  fontSize: '13px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dotted #CCC' }}>
                  <strong style={{ color: '#0A246A' }}>Complaint Details ({selectedComplaint.complaintId}) - Room {selectedComplaint.roomNo}:</strong>
                  <div style={{ marginTop: '4px', color: '#333' }}>{selectedComplaint.natureOfComplaint}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600 }}>Attended By</label>
                    <input 
                      type="text" 
                      value={attendData.attendedBy}
                      onChange={(e) => setAttendData({ ...attendData, attendedBy: e.target.value })}
                      className="ids-input"
                      style={{ flex: 1, fontSize: '13px', height: '28px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '110px', fontWeight: 600 }}>TAT (Mins)</label>
                    <input 
                      type="number" 
                      value={attendData.tatMinutes}
                      onChange={(e) => setAttendData({ ...attendData, tatMinutes: e.target.value })}
                      className="ids-input"
                      style={{ width: '80px', fontSize: '13px', height: '28px' }} 
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Action Taken Remarks</label>
                  <input 
                    type="text" 
                    value={attendData.actionTaken}
                    onChange={(e) => setAttendData({ ...attendData, actionTaken: e.target.value })}
                    className="ids-input"
                    style={{ width: '100%', fontSize: '13px', height: '28px' }} 
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                onClick={handleAttendComplaint}
                disabled={!selectedComplaint || selectedComplaint.status === 'Resolved'}
                className="ids-btn-classic attend success" 
                style={{ minWidth: '120px', height: '28px', fontSize: '12.5px', fontWeight: 'bold' }}
              >
                Attend & Close
              </button>
              <button onClick={() => {}} className="ids-btn-classic refresh info" style={{ minWidth: '85px', height: '28px', fontSize: '12.5px' }}>Refresh</button>
              <button onClick={onClose} className="ids-btn-classic exit danger" style={{ minWidth: '85px', height: '28px', fontSize: '12.5px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'log-complaints' && activeTab !== 'attend-complaints' && (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
            <span>No active records found for this section. Use 'Log Complaints' or 'Attend Complaints' to manage room requests.</span>
          </div>
        )}
      </div>
    </div>
  );
}
