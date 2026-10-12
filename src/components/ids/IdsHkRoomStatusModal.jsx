import React, { useState } from 'react';
import './idsFortuneNext.css';
import { getHousekeepingCrew } from '../../data/hotelStaffData';

export default function IdsHkRoomStatusModal({
  isOpen,
  onClose,
  accountingDate = '27-JAN-2026',
  onUpdateStatus,
  onOpenMessageBox,
  onOpenRoomVerificationReport
}) {
  const hkCrew = getHousekeepingCrew();
  const [roomsList, setRoomsList] = useState([
    { roomNo: '201', status: 'Do not Disturb', adult: '1', child: '0', infant: '0', attendant: 'Mamata Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '203', status: 'Dirty', adult: '0', child: '0', infant: '0', attendant: 'Ramesh Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '204', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Mamata Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '205', status: 'Occupied', adult: '2', child: '0', infant: '0', attendant: 'Ramesh Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '206', status: 'Out of Order', adult: '0', child: '0', infant: '0', attendant: 'Debendra Jena', inspectedBy: 'Subrat Patnaik' },
    { roomNo: '207', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Mamata Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '208', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Ramesh Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '209', status: 'Dirty', adult: '0', child: '0', infant: '0', attendant: 'Mamata Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '210', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Ramesh Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '211', status: 'Inspected', adult: '0', child: '0', infant: '0', attendant: 'Mamata Nayak', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '301', status: 'Occupied', adult: '1', child: '0', infant: '0', attendant: 'Puspalata Biswal', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '303', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Debendra Jena', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '304', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Puspalata Biswal', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '305', status: 'Dirty', adult: '0', child: '0', infant: '0', attendant: 'Debendra Jena', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '306', status: 'Clean', adult: '0', child: '0', infant: '0', attendant: 'Puspalata Biswal', inspectedBy: 'Sunil Mohapatra' },
    { roomNo: '307', status: 'Inspected', adult: '0', child: '0', infant: '0', attendant: 'Debendra Jena', inspectedBy: 'Sunil Mohapatra' }
  ]);

  // Sub-Modal: Details (Video 11 Frame 022)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailsForm, setDetailsForm] = useState({
    roomNo: '203',
    status: 'Occupied',
    adult: '',
    child: '',
    infant: '',
    attendant: 'Mamata Nayak',
    inspectedBy: 'Sunil Mohapatra'
  });

  if (!isOpen) return null;

  const handleRowClick = (rm) => {
    setSelectedRoom(rm);
    setDetailsForm({
      roomNo: rm.roomNo,
      status: rm.status,
      adult: rm.adult,
      child: rm.child,
      infant: rm.infant,
      attendant: rm.attendant || 'Mamata Nayak',
      inspectedBy: rm.inspectedBy || 'Sunil Mohapatra'
    });
    setDetailsModalOpen(true);
  };

  const handleSaveDetails = () => {
    const updated = roomsList.map(rm => {
      if (rm.roomNo === detailsForm.roomNo) {
        return {
          ...rm,
          status: detailsForm.status,
          adult: detailsForm.adult || '0',
          child: detailsForm.child || '0',
          infant: detailsForm.infant || '0',
          attendant: detailsForm.attendant,
          inspectedBy: detailsForm.inspectedBy
        };
      }
      return rm;
    });

    setRoomsList(updated);
    setDetailsModalOpen(false);

    if (onUpdateStatus) {
      onUpdateStatus({
        roomNo: detailsForm.roomNo,
        status: detailsForm.status,
        headcount: { adult: detailsForm.adult, child: detailsForm.child, infant: detailsForm.infant }
      });
    }

    if (onOpenMessageBox) {
      onOpenMessageBox({
        title: 'HK Room Status Updated',
        message: `Room ${detailsForm.roomNo} status updated to '${detailsForm.status}'. Front Office room rack refreshed.`,
        type: 'info'
      });
    }
  };

  return (
    <div className="ids-modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="ids-modal-window" 
        style={{ 
          width: '840px', minHeight: '540px', 
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
          <span>House Keeping Room Status V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px' }}>
          {/* Master Table Grid */}
          <div 
            style={{ 
              border: '1px solid #7F9DB9', 
              background: '#FFF', 
              maxHeight: '320px', 
              overflowY: 'auto',
              fontSize: '11px' 
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #7F9DB9', textAlign: 'left' }}>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '65px' }}>Room No.</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '95px' }}>Status</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '45px', textAlign: 'center' }}>Adult</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '45px', textAlign: 'center' }}>Child</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '120px' }}>HK Attendant</th>
                  <th style={{ padding: '4px 8px', width: '110px' }}>Inspected By</th>
                </tr>
              </thead>
              <tbody>
                {roomsList.map((rm) => {
                  let statusColor = '#000';
                  let statusBg = '#FFF';
                  if (rm.status === 'Clean' || rm.status === 'Inspected') {
                    statusColor = '#008000';
                  } else if (rm.status === 'Dirty') {
                    statusColor = '#C00';
                  } else if (rm.status === 'Occupied') {
                    statusColor = '#0A246A';
                    statusBg = '#F0F4FA';
                  } else if (rm.status === 'Out of Order') {
                    statusColor = '#8D6E63';
                  }

                  return (
                    <tr 
                      key={rm.roomNo}
                      onClick={() => handleRowClick(rm)}
                      style={{ 
                        cursor: 'pointer', 
                        borderBottom: '1px solid #EEE',
                        background: statusBg 
                      }}
                    >
                      <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{rm.roomNo}</td>
                      <td style={{ padding: '4px 8px', color: statusColor, fontWeight: 'bold' }}>{rm.status}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'center' }}>{rm.adult}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'center' }}>{rm.child}</td>
                      <td style={{ padding: '4px 8px', fontSize: '10px' }}>🧹 {rm.attendant || '-'}</td>
                      <td style={{ padding: '4px 8px', fontSize: '10px', color: '#0A246A', fontWeight: 600 }}>{rm.inspectedBy || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footnote Instruction Ribbon (Video 11 Frame 022) */}
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#0A246A', fontStyle: 'italic', fontWeight: 'bold' }}>
            For this option you can refer Room Verification Report.
          </div>

          {/* Bottom Command Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <button onClick={() => {}} className="ids-btn info refresh" style={{ minWidth: '70px', padding: '3px 12px', fontSize: '11px' }}>Refresh</button>
            <button 
              onClick={() => {
                if (onOpenRoomVerificationReport) {
                  onOpenRoomVerificationReport();
                } else {
                  alert("Opening Room Verification Report...");
                }
              }} 
              className="ids-btn info print" 
              style={{ minWidth: '160px', padding: '3px 12px', fontSize: '11px', fontWeight: 'bold' }}
            >
              📄 Room Verification Report
            </button>
            <button onClick={onClose} className="ids-btn exit danger" style={{ minWidth: '70px', padding: '3px 12px', fontSize: '11px' }}>Exit</button>
          </div>
        </div>

        {/* Details Sub-Modal Popup (Video 11 Frame 022 Exactly) */}
        {detailsModalOpen && (
          <div className="ids-modal-backdrop" style={{ zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '320px', background: '#ECE9D8', border: '2px solid #000', boxShadow: '4px 4px 12px rgba(0,0,0,0.6)' }}>
              <div style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Details</span>
                <button onClick={() => setDetailsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '14px', fontSize: '11px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Room No.</label>
                    <input 
                      type="text" 
                      value={detailsForm.roomNo} 
                      onChange={(e) => setDetailsForm({ ...detailsForm, roomNo: e.target.value })}
                      style={{ width: '80px', padding: '2px 4px', border: '1px solid #7F9DB9', background: '#FFF', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Status</label>
                    <select 
                      value={detailsForm.status}
                      onChange={(e) => setDetailsForm({ ...detailsForm, status: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontWeight: 'bold' }}
                    >
                      <option value="Occupied">Occupied</option>
                      <option value="Clean">Clean</option>
                      <option value="Dirty">Dirty</option>
                      <option value="Do not Disturb">Do not Disturb</option>
                      <option value="Out of Order">Out of Order</option>
                      <option value="Inspected">Inspected</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Adult</label>
                    <input 
                      type="number" 
                      value={detailsForm.adult}
                      onChange={(e) => setDetailsForm({ ...detailsForm, adult: e.target.value })}
                      style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Child</label>
                    <input 
                      type="number" 
                      value={detailsForm.child}
                      onChange={(e) => setDetailsForm({ ...detailsForm, child: e.target.value })}
                      style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Infant</label>
                    <input 
                      type="number" 
                      value={detailsForm.infant}
                      onChange={(e) => setDetailsForm({ ...detailsForm, infant: e.target.value })}
                      style={{ width: '60px', padding: '2px 4px', border: '1px solid #7F9DB9' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Attendant</label>
                    <select
                      value={detailsForm.attendant}
                      onChange={(e) => setDetailsForm({ ...detailsForm, attendant: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontSize: '10px' }}
                    >
                      {hkCrew.map(st => (
                        <option key={st.id} value={st.shortName}>
                          {st.shortName} ({st.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '80px' }}>Inspected By</label>
                    <select
                      value={detailsForm.inspectedBy}
                      onChange={(e) => setDetailsForm({ ...detailsForm, inspectedBy: e.target.value })}
                      style={{ flex: 1, padding: '2px', border: '1px solid #7F9DB9', fontSize: '10px' }}
                    >
                      <option value="Sunil Mohapatra">Sunil Mohapatra (Floor Supervisor)</option>
                      <option value="Subrat Patnaik">Subrat Patnaik (HK Manager)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Modal Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <button onClick={handleSaveDetails} className="ids-btn success confirm" style={{ minWidth: '60px', padding: '3px 12px', fontSize: '11px', fontWeight: 'bold' }}>Ok</button>
                  <button onClick={() => {}} className="ids-btn info" style={{ minWidth: '80px', padding: '3px 12px', fontSize: '11px' }}>Instruction</button>
                  <button onClick={() => setDetailsModalOpen(false)} className="ids-btn danger cancel" style={{ minWidth: '60px', padding: '3px 12px', fontSize: '11px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
