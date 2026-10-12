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
        className="ids-modal-window" 
        style={{ 
          width: '820px', 
          maxWidth: '96vw',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 24px rgba(56, 189, 248, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Modern Luxury Title Bar */}
        <div 
          className="ids-modal-titlebar" 
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
              <Compass size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em', color: '#f8fafc' }}>
                Guest Services & Complaints Console
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                IDS Fortune NEXT PMS • Guest Concierge, Wakeups & Ticket Dispatch
              </div>
            </div>
          </div>
          <button className="ids-win-btn close" onClick={onClose} title="Close Dialog">
            <X size={15} />
          </button>
        </div>

        {/* 7 Tabs Header with Modern Executive Pills */}
        <div 
          style={{ 
            display: 'flex', 
            background: '#0f172a', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 14px 0 14px',
            gap: '6px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'messages', label: 'Messages', icon: <MessageSquare size={14} /> },
            { id: 'locator', label: 'Locator', icon: <Compass size={14} /> },
            { id: 'likes', label: 'Likes/Dislikes', icon: <ThumbsUp size={14} /> },
            { id: 'wakeups', label: 'Wakeup Calls', icon: <PhoneCall size={14} /> },
            { id: 'log-complaints', label: 'Log Complaints', icon: <AlertCircle size={14} color="#f87171" /> },
            { id: 'attend-complaints', label: 'Attend Complaints', icon: <CheckSquare size={14} color="#34d399" /> },
            { id: 'browse-complaints', label: 'Browse Complaints', icon: <Search size={14} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`ids-tab-btn ${isActive ? 'active' : ''}`}
                style={{ 
                  padding: '8px 14px', 
                  fontSize: '12px', 
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 5: Log Complaints Body (Video 05 Frame 019) */}
        {activeTab === 'log-complaints' && (
          <div style={{ padding: '14px' }}>
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                padding: '16px',
                fontSize: '11px',
                marginBottom: '14px'
              }}
            >
              {/* Radio Selector */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dotted #CCC' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={logFormData.scope === 'Room'} 
                    onChange={() => setLogFormData({ ...logFormData, scope: 'Room' })} 
                  />
                  <strong>Room</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Room No.</label>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      <input 
                        type="text" 
                        value={logFormData.roomNo}
                        onChange={(e) => handleRoomSelect(e.target.value)}
                        style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                      />
                      <button 
                        style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}
                        title="Room Lookup"
                        onClick={() => {
                          const r = prompt("Select Room (101, 102, 201, 202):", logFormData.roomNo);
                          if (r) handleRoomSelect(r);
                        }}
                      >?</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Guest Name</label>
                    <select 
                      value={logFormData.guestName}
                      onChange={(e) => setLogFormData({ ...logFormData, guestName: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9' }}
                    >
                      <option value="Mr Kumar Anil">Mr Kumar Anil</option>
                      <option value="Mr Vikram Singhania">Mr Vikram Singhania</option>
                      <option value="Mr Rajesh Sharma">Mr Rajesh Sharma</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Department</label>
                    <select 
                      value={logFormData.department}
                      onChange={(e) => setLogFormData({ ...logFormData, department: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold', color: '#0A246A' }}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Arrival</label>
                    <input type="text" value={logFormData.arrival} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Departure</label>
                    <input type="text" value={logFormData.departure} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Guest Status</label>
                    <input type="text" value={logFormData.guestStatus} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>
                </div>
              </div>

              {/* Description & Audit Footer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginTop: '14px', paddingTop: '10px', borderTop: '1px dotted #CCC' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Nature of Complaint</label>
                  <textarea 
                    rows={4}
                    value={logFormData.natureOfComplaint}
                    onChange={(e) => setLogFormData({ ...logFormData, natureOfComplaint: e.target.value })}
                    style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9', fontFamily: 'inherit', fontSize: '11px', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Received by</label>
                    <input type="text" value={logFormData.receivedBy} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Date</label>
                    <input type="text" value={logFormData.date} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Time</label>
                    <input type="text" value={logFormData.time} disabled style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9', background: '#EBE9ED' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Command Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button onClick={handleSaveComplaint} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px', fontWeight: 'bold' }}>Save</button>
              <button onClick={() => {}} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Panel</button>
              <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Tab 6: Attend Complaints Body (Video 07 Frame 015) */}
        {activeTab === 'attend-complaints' && (
          <div style={{ padding: '14px' }}>
            {/* Worklist Grid Table */}
            <div 
              style={{ 
                border: '1px solid #7F9DB9', 
                background: '#FFF', 
                maxHeight: '160px', 
                minHeight: '120px', 
                overflowY: 'auto',
                marginBottom: '12px'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px' }}>Room No.</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC' }}>Guest Name</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '80px' }}>Status</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '70px' }}>Complaints</th>
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px' }}>Messages</th>
                    <th style={{ padding: '4px', width: '60px' }}>Requests</th>
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
                      <td style={{ padding: '4px', fontWeight: 'bold' }}>{c.roomNo}</td>
                      <td style={{ padding: '4px' }}>{c.guestName}</td>
                      <td style={{ padding: '4px' }}>
                        <span style={{ 
                          padding: '1px 6px', 
                          borderRadius: '2px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          background: c.status === 'Resolved' ? '#D4EDDA' : '#FFF3CD',
                          color: c.status === 'Resolved' ? '#155724' : '#856404'
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '4px', fontWeight: 'bold', color: c.status === 'Pending' ? '#C00' : 'inherit' }}>
                        {c.status === 'Pending' ? 'Yes' : 'No'}
                      </td>
                      <td style={{ padding: '4px' }}>-</td>
                      <td style={{ padding: '4px' }}>-</td>
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
                  padding: '12px',
                  fontSize: '11px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px dotted #CCC' }}>
                  <strong>Complaint Details ({selectedComplaint.complaintId}) - Room {selectedComplaint.roomNo}:</strong>
                  <div style={{ marginTop: '4px', color: '#444' }}>{selectedComplaint.natureOfComplaint}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>Attended By</label>
                    <input 
                      type="text" 
                      value={attendData.attendedBy}
                      onChange={(e) => setAttendData({ ...attendData, attendedBy: e.target.value })}
                      style={{ flex: 1, padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '90px' }}>TAT (Mins)</label>
                    <input 
                      type="number" 
                      value={attendData.tatMinutes}
                      onChange={(e) => setAttendData({ ...attendData, tatMinutes: e.target.value })}
                      style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px' }}>Action Taken Remarks</label>
                  <input 
                    type="text" 
                    value={attendData.actionTaken}
                    onChange={(e) => setAttendData({ ...attendData, actionTaken: e.target.value })}
                    style={{ width: '100%', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button 
                onClick={handleAttendComplaint}
                disabled={!selectedComplaint || selectedComplaint.status === 'Resolved'}
                className="ids-btn" 
                style={{ minWidth: '100px', padding: '4px 14px', fontSize: '11px', fontWeight: 'bold' }}
              >
                Attend & Close
              </button>
              <button onClick={() => {}} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Refresh</button>
              <button onClick={onClose} className="ids-btn" style={{ minWidth: '70px', padding: '4px 14px', fontSize: '11px' }}>Exit</button>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'log-complaints' && activeTab !== 'attend-complaints' && (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
            <span>No active records found for this section. Use 'Log Complaints' or 'Attend Complaints' to manage room requests.</span>
          </div>
        )}
      </div>
    </div>
  );
}
