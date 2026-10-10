import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  MessageSquare, Compass, ThumbsUp, PhoneCall, 
  AlertCircle, CheckSquare, Search 
} from 'lucide-react';
import { INITIAL_HOUSEKEEPING_COMPLAINTS } from '../../data/idsPmsStore';

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

    const pendingCount = updated.filter(c => c.status === 'Pending').length;
    if (onComplaintsCountChange) {
      onComplaintsCountChange(pendingCount);
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'Guest Complaint Registered',
        message: `Complaint #${newComplaint.complaintId} registered for Room ${newComplaint.roomNo} (${newComplaint.department}). Registered Complaints KPI count updated to ${pendingCount}.`,
        type: 'info',
        onOk: () => setActiveTab('attend-complaints')
      });
    } else {
      setActiveTab('attend-complaints');
    }
  };

  const handleAttendComplaint = () => {
    if (!selectedComplaint) return;

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
        message: `Complaint #${selectedComplaint.complaintId} marked as Resolved by ${attendData.attendedBy}. TAT: ${attendData.tatMinutes} mins. Active complaints count is now ${pendingCount}.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '780px', 
          backgroundColor: '#ECE9D8',
          border: '2px solid #000',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar */}
        <div 
          className="ids-modal-titlebar" 
          style={{ 
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
            color: '#FFF', 
            padding: '3px 6px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          <span>Guest Services V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* 7 Tabs Header with Authentic Retro Icons (Frame 019 & Frame 015) */}
        <div 
          style={{ 
            display: 'flex', 
            background: '#D4D0C8', 
            borderBottom: '1px solid #7F9DB9',
            padding: '4px 6px 0 6px',
            gap: '3px'
          }}
        >
          <button 
            onClick={() => setActiveTab('messages')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: activeTab === 'messages' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'messages' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <MessageSquare size={14} /> Messages
          </button>

          <button 
            onClick={() => setActiveTab('locator')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: activeTab === 'locator' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'locator' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <Compass size={14} /> Locator
          </button>

          <button 
            onClick={() => setActiveTab('likes')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: activeTab === 'likes' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'likes' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <ThumbsUp size={14} /> Likes/Dislikes
          </button>

          <button 
            onClick={() => setActiveTab('wakeups')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: activeTab === 'wakeups' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'wakeups' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <PhoneCall size={14} /> Wakeup Calls
          </button>

          <button 
            onClick={() => setActiveTab('log-complaints')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontWeight: activeTab === 'log-complaints' ? 'bold' : 'normal',
              background: activeTab === 'log-complaints' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'log-complaints' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <AlertCircle size={14} color="#C00" /> Log Complaints
          </button>

          <button 
            onClick={() => setActiveTab('attend-complaints')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontWeight: activeTab === 'attend-complaints' ? 'bold' : 'normal',
              background: activeTab === 'attend-complaints' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'attend-complaints' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <CheckSquare size={14} color="#008000" /> Attend Complaints
          </button>

          <button 
            onClick={() => setActiveTab('browse-complaints')}
            className="ids-tab-btn" 
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: activeTab === 'browse-complaints' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'browse-complaints' ? '2px solid #ECE9D8' : '1px solid #7F9DB9'
            }}
          >
            <Search size={14} /> Browse Complaints
          </button>
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
                    <label style={{ width: '90px' }}>Room #</label>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      <input 
                        type="text" 
                        value={logFormData.roomNo}
                        onChange={(e) => handleRoomSelect(e.target.value)}
                        style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9', fontWeight: 'bold' }} 
                      />
                      <button style={{ padding: '1px 5px', background: '#ECE9D8', border: '1px solid #7F9DB9' }}>?</button>
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
                    <th style={{ padding: '4px', borderRight: '1px solid #CCC', width: '60px' }}>Room#</th>
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
