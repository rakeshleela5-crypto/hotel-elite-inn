import React, { useState } from 'react';
import { X, Play, Film, CheckCircle2, ChevronRight, Video } from 'lucide-react';

export const TUTORIAL_PLAYLIST_DATA = [
  { id: '01', title: '01 - How to Make Room Booking in IDS 6.5 & 7.0 Software', file: '01 - How to Make Room Booking in IDS 6.5 & 7.0 Software.mp4', duration: '06:38', module: 'Reservations' },
  { id: '02', title: '02 - How to Assign Room Number for Reservation in IDS 6.5 & 7.0 Software', file: '02 - How to Assign Room Number for Reservation in IDS 6.5 & 7.0 Software.mp4', duration: '02:34', module: 'Room Assignment' },
  { id: '03', title: '03 - How to Amend/Modify Room Booking in IDS 6.5 & 7.0 Software', file: '03 - How to Amend⧸Modify Room Booking in IDS 6.5 & 7.0 Software.mp4', duration: '03:31', module: 'Reservations' },
  { id: '04', title: '04 - How to Cancel Room Booking in IDS 6.5 & 7.0 Software', file: '04 - How to Cancel Room Booking in IDS 6.5 & 7.0 Software.mp4', duration: '03:42', module: 'Reservations' },
  { id: '05', title: '05 - How to do Reservation Check In for single room in IDS 6.5 & 7.0 Software', file: '05 - How to do Reservation Check In for single room in IDS 6.5 & 7.0 Software.mp4', duration: '03:11', module: 'Check-In' },
  { id: '06', title: '06 - How to do express check-in for Single Room in IDS 6.5 & 7.0 Software', file: '06 - How to do express check-in for Single Room in IDS 6.5 & 7.0 Software.mp4', duration: '01:19', module: 'Check-In' },
  { id: '07', title: '07 - How to do Group Booking & Express Check In In IDS 6.5 & 7.0 Software', file: '07 - How to do Group Booking & Express Check In In IDS 6.5 & 7.0 Software.mp4', duration: '04:19', module: 'Group Booking' },
  { id: '08', title: '08 - How to Upgrade Room Category while doing Express Check-in In IDS 6.5 & 7.0 Software', file: '08 - How to Upgrade Room Category while doing Express Check-in In IDS 6.5 & 7.0 Software.mp4', duration: '02:23', module: 'Check-In' },
  { id: '09', title: '09 - How to Clear Dirty Room from Room Status in IDS 6.5 &  7.0 Software', file: '09 - How to Clear Dirty Room from Room Status in IDS 6.5 &  7.0 Software.mp4', duration: '02:09', module: 'Housekeeping' },
  { id: '10', title: '10 - How to Change Guest Details in IDS 6.5 & 7.0 Software', file: '10 - How to Change Guest Details in IDS 6.5 & 7.0 Software.mp4', duration: '02:30', module: 'Guest Info' },
  { id: '11', title: '11 - How to Change Room Rate/Change Tariff in IDS 6.5 & 7.0 Software', file: '11 - How to Change Room Rate⧸Change Tariff in IDS 6.5 & 7.0 Software.mp4', duration: '01:52', module: 'Tariffs' },
  { id: '12', title: '12 - How to Modify Guest Departure in IDS 6.5 & 7.0 Software', file: '12 - How to Modify Guest Departure  in IDS 6.5 & 7.0 Software.mp4', duration: '01:30', module: 'Front Desk' },
  { id: '13', title: '13 - How to do Room Transfer in IDS 6.5 & 7.0 Software', file: '13 - How to do Room Transfer  in IDS 6.5 & 7.0 Software.mp4', duration: '02:14', module: 'Room Operations' },
  { id: '14', title: '14 - How to Post Deposit or Advance in a Room Number in IDS 6.5 & 7.0 Software', file: '14 - How to Post Deposit or Advance in a Room Number  in IDS 6.5 & 7.0 Software.mp4', duration: '01:13', module: 'Cashiering' },
  { id: '15', title: '15 - How to Checkout & Settle Front Office Bill with Split Bill Process', file: '15 - How to Checkout & Settle Front Office Bill with Split Bill Process.mp4', duration: '04:20', module: 'Billing' },
  { id: '16', title: '16 - How to do Bulk Check Out at Once in IDS 6.5 & 7.0 Software', file: '16 - How to do Bulk Check Out at Once in IDS 6.5 & 7.0 Software.mp4', duration: '03:22', module: 'Cashiering' },
  { id: '17', title: '17 - Walk-in process for Direct Guest in IDS 6.5 & 7.0 Software', file: '17 - Walk-in process for Direct Guest in IDS 6.5 & 7.0 Software.mp4', duration: '04:44', module: 'Check-In' },
  { id: '18', title: '18 - Pax Check-Out in IDS 6.5 & 7.0 Software', file: '18 - Pax Check-Out in IDS 6.5 & 7.0 Software.mp4', duration: '01:51', module: 'Cashiering' },
  { id: '19', title: '19 - Night Audit Process In IDS 6.5 & 7.0 Software', file: '19 - Night Audit Process In IDS 6.5 & 7.0 Software.mp4', duration: '01:39', module: 'Night Audit' },
  { id: '20', title: '20 - How to Use Additional Room Rate Option in IDS 6.5 & 7.0 Software', file: '20 - How to Use Additional Room Rate Option in IDS 6.5 & 7.0 Software.mp4', duration: '02:25', module: 'Tariffs' },
  { id: '21', title: '21 - How to use Post Charges/Room Charges option in IDS 6.5 & 7.0 Software', file: '21 - How to use Post Charges⧸Room Charges option in IDS 6.5 & 7.0 Software.mp4', duration: '02:23', module: 'Cashiering' },
  { id: '22', title: '22 - How to Check-in 2nd Pax later in IDS 6.5 & 7.0 Software', file: '22 - How to Check-in 2nd Pax later in IDS 6.5 & 7.0 Software.mp4', duration: '01:33', module: 'Check-In' },
  { id: '23', title: '23 - Bill Allowance Day Wise in IDS 6.5 & 7.0 Software', file: '23 - Bill Allowance Day Wise in IDS 6.5 & 7.0 Software.mp4', duration: '02:02', module: 'Cashiering' },
  { id: '24', title: '24 - How to use Bill Allowance option in IDS 6.5 & 7.0 Software', file: '24 - How to use Bill Allowance option in IDS 6.5 & 7.0 Software.mp4', duration: '01:51', module: 'Cashiering' },
  { id: '25', title: '25 - How to Transfer Folio from one room to another room in IDS 6.5 & 7.0 software', file: '25 - How to Transfer Folio from one room to another room in IDS 6.5 & 7.0 software.mp4', duration: '02:29', module: 'Cashiering' },
  { id: '26', title: '26 - How to use Folio Reinstate Option in IDS 6.5 & 7.0 Software', file: '26 - How to use Folio Reinstate Option in IDS 6.5 & 7.0 Software.mp4', duration: '01:39', module: 'Cashiering' },
  { id: '27', title: '27 - How to Use Release Stop Posting option in IDS 6.5 & 7.0 Software', file: '27 - How to Use Release Stop Posting option in IDS 6.5 & 7.0 Software.mp4', duration: '03:31', module: 'Cashiering' },
  { id: '28', title: '28 - How to Create Company Profile in IDS 6.5 & 7.0 Software', file: '28 - How to Create Company Profile in IDS 6.5 & 7.0 Software.mp4', duration: '02:40', module: 'Corporate Master' },
  { id: '29', title: '29 - How to Add Business Source in IDS 6.5 & 7.0 Software', file: '29 - How to Add Business Source in IDS 6.5 & 7.0 Software.mp4', duration: '01:32', module: 'Master Setup' },
  { id: '30', title: '30 - How to Add Market Segment in IDS 6.5 & 7.0 Software', file: '30 - How to Add Market Segment in IDS 6.5 & 7.0 Software.mp4', duration: '01:40', module: 'Master Setup' },
  { id: '31', title: '31 - How To Create Company Contract Rates in IDS 6.5 & 7.0 Software', file: '31 - How To Create Company Contract Rates in IDS 6.5 & 7.0 Software.mp4', duration: '02:34', module: 'Corporate Master' },
  { id: '32', title: '32 - How to Link Company Rates in IDS 6.5 & 7.0 Software', file: '32 - How to Link Company Rates in IDS 6.5 & 7.0 Software.mp4', duration: '02:03', module: 'Corporate Master' },
  { id: '33', title: '33 - How to Add Room Numbers in Room Status in IDS 6.5 & 7.0 Software', file: '33 - How to Add Room Numbers in Room Status in IDS 6.5 & 7.0 Software.mp4', duration: '01:05', module: 'Inventory Setup' },
  { id: '34', title: '34 - How to Modify Room Master in IDS 6.5 & 7.0 Software', file: '34 - How to Modify Room Master in IDS 6.5 & 7.0 Software.mp4', duration: '01:15', module: 'Inventory Setup' },
  { id: '35', title: '35 - How to Reprint Front Office Module Voucher in IDS 6.5 & 7.0 Software', file: '35 - How to Reprint Front Office Module Voucher in IDS 6.5 & 7.0 Software.mp4', duration: '02:03', module: 'Vouchers' },
  { id: '36', title: '36 - How to Reprint Front Office Bill in IDS 6.5 & 7.0 Software', file: '36 - How to Reprint Front Office Bill in IDS 6.5 & 7.0 Software.mp4', duration: '01:28', module: 'Vouchers' },
  { id: '37', title: '37 - How to Walk In Regular Guest in IDS 6.5 & 7.0 Software', file: '37 - How to Walk In Regular Guest in IDS 6.5 & 7.0 Software.mp4', duration: '01:27', module: 'Check-In' },
  { id: '38', title: '38 - How to Remove or Cancel Check-In in IDS 6.5 & 7.0 Software', file: '38 - How to Remove or Cancel Check-In in IDS 6.5 & 7.0 Software.mp4', duration: '01:30', module: 'Check-In' },
  { id: '39', title: '39 - How to Delete Deposit Before Cancel Check in in IDS 6.5 & 7.0 Software', file: '39 - How to Delete Deposit Before Cancel Check in in IDS 6.5 & 7.0 Software.mp4', duration: '02:35', module: 'Cashiering' },
  { id: '40', title: '40 - How to Create/Sell Package Rates in IDS 6.5 & 7.0 Software', file: '40 - How to Create⧸Sell Package Rates in IDS 6.5 & 7.0 Software.mp4', duration: '03:36', module: 'Tariffs' },
  { id: '41', title: '41 - How to Use Multi Rate Option In IDS 6.5 & 7.0 Software', file: '41 - How to Use Multi Rate Option In IDS 6.5 & 7.0 Software.mp4', duration: '01:31', module: 'Tariffs' },
  { id: '42', title: '42 - Foreign Exchange Entry in IDS 6.5 & 7.0 Software', file: '42 - Foreign Exchange Entry in IDS 6.5 & 7.0 Software.mp4', duration: '02:55', module: 'Cashiering' },
  { id: '43', title: '43 - How to add Company Details and GSTN after Check-out in IDS 6.5 & 7.0 Software', file: '43 - How to add Company Details and GSTN after Check-out in IDS 6.5 & 7.0 Software.mp4', duration: '02:34', module: 'Billing' },
  { id: '44', title: '44 - How to Paid-out Excess Amount to Guest in IDS 6.5 & 7.0 Software', file: '44 - How to Paid-out Excess Amount to Guest in IDS 6.5 & 7.0 Software.mp4', duration: '03:41', module: 'Cashiering' }
];

export default function IdsTutorialPlayerModal({ isOpen, onClose, initialVideoId = '01', onLaunchInteractive }) {
  const [selectedVideo, setSelectedVideo] = useState(() => {
    return TUTORIAL_PLAYLIST_DATA.find(v => v.id === initialVideoId) || TUTORIAL_PLAYLIST_DATA[0];
  });
  const [filterModule, setFilterModule] = useState('All');

  if (!isOpen) return null;

  const modules = ['All', ...new Set(TUTORIAL_PLAYLIST_DATA.map(v => v.module))];
  const filteredList = filterModule === 'All' 
    ? TUTORIAL_PLAYLIST_DATA 
    : TUTORIAL_PLAYLIST_DATA.filter(v => v.module === filterModule);

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '920px', maxWidth: '96vw', height: '85vh' }}>
        {/* Title bar */}
        <div className="ids-dialog-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={14} />
            <span>IDS Fortune NEXT 6.5 & 7.0 Training Video Library ({TUTORIAL_PLAYLIST_DATA.length} Screen Recordings)</span>
          </div>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100% - 28px)', overflow: 'hidden' }}>
          {/* Playlist Sidebar */}
          <div style={{ borderRight: '1px solid #716F64', background: '#EDEAE0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px', background: '#DFDBC9', borderBottom: '1px solid #B0AB9A' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>Filter Module:</div>
              <select 
                className="ids-select" 
                style={{ width: '100%' }}
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredList.map((item) => {
                const isSelected = selectedVideo.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedVideo(item)}
                    style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid #D5D1BD',
                      background: isSelected ? '#316AC5' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#000000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <Play size={12} style={{ marginTop: '3px', flexShrink: 0, opacity: isSelected ? 1 : 0.6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.3 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
                        {item.module} • {item.duration}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Video Player Panel */}
          <div style={{ background: '#111111', display: 'flex', flexDirection: 'column', color: '#FFFFFF' }}>
            <div style={{ padding: '10px 14px', background: '#222222', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#A6CAF0' }}>
                  {selectedVideo.title}
                </div>
                <div style={{ fontSize: '10px', color: '#AAAAAA', marginTop: '2px' }}>
                  Module: <strong>{selectedVideo.module}</strong> | Duration: {selectedVideo.duration} | Full 1080p Offline HD
                </div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', position: 'relative' }}>
              {/* Local video element serving the exact mp4 */}
              <video 
                key={selectedVideo.file}
                controls 
                autoPlay 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                src={`/videos/ids_fortune_next_playlist/${encodeURIComponent(selectedVideo.file)}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div style={{ padding: '8px 14px', background: '#ECE9D8', color: '#000000', borderTop: '1px solid #716F64', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px' }}>
                📁 Local path: <code style={{ background: '#FFFFFF', padding: '1px 4px', border: '1px solid #B0AB9A' }}>videos/ids_fortune_next_playlist/{selectedVideo.file}</code>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {onLaunchInteractive && (
                  <button 
                    className="ids-btn-classic" 
                    style={{ background: '#FFF7CC', fontWeight: 700, color: '#0A246A' }}
                    onClick={() => {
                      onClose();
                      onLaunchInteractive(selectedVideo.id);
                    }}
                  >
                    🚀 Launch Interactive Feature Clone
                  </button>
                )}
                <button className="ids-btn-classic" onClick={onClose}>Close Player</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
