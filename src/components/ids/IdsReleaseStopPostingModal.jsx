import React, { useState } from 'react';
import './idsFortuneNext.css';
import { playReceptionChime, playSuccessChime } from '../../utils/soundAlert';
import { 
  Lock, Unlock, ShieldAlert, Check, X, AlertTriangle, 
  HelpCircle, ChevronDown, FileText, Printer, RefreshCw, 
  CheckCircle2, DollarSign, Layers, Search
} from 'lucide-react';
import { INITIAL_ACCOUNTING_DATE, NEXT_ACCOUNTING_DATE } from '../../data/idsPmsStore';

/* =========================================================================
   VIDEO 27: HOW TO USE RELEASE STOP POSTING OPTION IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   ========================================================================= */

export const DEFAULT_STOP_POSTING_ROOMS = [
  {
    roomNo: '201',
    folNo: '1',
    regNo: '624',
    guestName: 'MR SHARMA RAJ',
    released: false,
    lockReason: 'FO Bill #511 Printed / Provisional Bill Generated',
    accountingDate: INITIAL_ACCOUNTING_DATE,
    arrivalDate: `${INITIAL_ACCOUNTING_DATE} 12:00`,
    tariff: 2999.00,
    advance: 1000.00,
    charges: []
  },
  {
    roomNo: '205',
    folNo: '1',
    regNo: '582',
    guestName: 'MR ANIL PATNAIK',
    released: true,
    lockReason: 'None (Active In-House)',
    accountingDate: INITIAL_ACCOUNTING_DATE,
    arrivalDate: `${INITIAL_ACCOUNTING_DATE} 14:00`,
    tariff: 2999.00,
    advance: 2000.00,
    charges: []
  }
];

export default function IdsReleaseStopPostingModal({
  isOpen,
  onClose,
  initialRoomNo = '201',
  accountingDate = INITIAL_ACCOUNTING_DATE,
  onReleaseSuccess,
  onPostAdditionalCharge
}) {
  // Active workflow view: 'release-dialog' | 'post-charges-sim' | 'quick-balances' | 'merge-checkout'
  const [activeView, setActiveView] = useState('release-dialog');

  // Stop posting records list
  const [stopPostingList, setStopPostingList] = useState(DEFAULT_STOP_POSTING_ROOMS);

  // Selected room release status state for table
  const [selectedRoom, setSelectedRoom] = useState(initialRoomNo);
  const [releaseToggle, setReleaseToggle] = useState('Yes'); // 'Yes' | 'No'

  // Post Charges simulation state
  const [simRevenueCode, setSimRevenueCode] = useState('LAU'); // LAU: Laundry, POS: Restaurant, MIN: Minibar
  const [simBaseAmount, setSimBaseAmount] = useState('500');
  const [simRemarks, setSimRemarks] = useState('2 Shirts Dry Cleaned');
  const [supervisorAlertVisible, setSupervisorAlertVisible] = useState(false);
  const [supervisorAlertMsg, setSupervisorAlertMsg] = useState({
    title: 'Post Charges V6.5.002.1',
    text: 'FO Bill already generated for the guest. Contact Supervisor.',
    id: 'FOMT550',
    code: '3395'
  });

  // Success Notification banner
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Added charges list for Room 201
  const [postedChargesList, setPostedChargesList] = useState([
    { code: 'LAU', desc: 'Laundry', base: 500, sgst: 45, cgst: 45, total: 590, date: `${INITIAL_ACCOUNTING_DATE} 19:02`, ref: '227' }
  ]);

  if (!isOpen) return null;

  const currentRoomRecord = stopPostingList.find(r => r.roomNo === selectedRoom) || stopPostingList[0];
  const isRoomLocked = !currentRoomRecord?.released;

  // Handle Save Release
  const handleSaveRelease = () => {
    const isNowReleased = releaseToggle === 'Yes';
    setStopPostingList(prev => prev.map(r => {
      if (r.roomNo === selectedRoom) {
        return {
          ...r,
          released: isNowReleased,
          lockReason: isNowReleased ? 'Released by Supervisor / IT Admin' : 'Stop Posting Active'
        };
      }
      return r;
    }));

    setSaveSuccessMsg(`Posting privileges ${isNowReleased ? 'RELEASED (Enabled)' : 'LOCKED'} successfully for Room ${selectedRoom} / Folio ${currentRoomRecord.folNo}.`);
    if (onReleaseSuccess) {
      onReleaseSuccess({
        roomNo: selectedRoom,
        folNo: currentRoomRecord.folNo,
        released: isNowReleased
      });
    }

    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Attempt Post Charge Simulation
  const handleAttemptPostCharge = () => {
    if (isRoomLocked) {
      // Show exact PMS Error from Frame 015 & Frame 025
      setSupervisorAlertMsg({
        title: 'Post Charges V6.5.002.1',
        text: 'FO Bill already generated for the guest. Contact Supervisor.',
        id: 'FOMT550',
        code: '3395'
      });
      setSupervisorAlertVisible(true);
      return;
    }

    // Success posting
    const base = parseFloat(simBaseAmount) || 500;
    const sgst = base * 0.09;
    const cgst = base * 0.09;
    const total = base + sgst + cgst;

    const newCharge = {
      code: simRevenueCode,
      desc: simRevenueCode === 'LAU' ? 'Laundry' : simRevenueCode === 'POS' ? 'Restaurant POS' : 'Travel Desk',
      base,
      sgst,
      cgst,
      total,
      date: `${accountingDate} 19:15`,
      ref: Math.floor(200 + Math.random() * 90).toString()
    };

    setPostedChargesList(prev => [newCharge, ...prev]);
    setSaveSuccessMsg(`₹${total.toFixed(2)} (${simRevenueCode} ${newCharge.desc}) successfully posted to Room ${selectedRoom}!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);

    if (onPostAdditionalCharge) {
      onPostAdditionalCharge({
        roomNo: selectedRoom,
        ...newCharge
      });
    }
  };

  // Calculate Quick Balances
  const totalLaundry = postedChargesList.reduce((sum, c) => sum + c.total, 0);
  const totalDebit = (currentRoomRecord.tariff || 5600) + totalLaundry;
  const advanceCredit = currentRoomRecord.advance || 1000;
  const netBalance = totalDebit - advanceCredit;

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '900px', 
          maxWidth: '96vw', 
          boxShadow: '0 10px 32px rgba(0,0,0,0.6)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Main Windows Titlebar */}
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
            <Unlock size={14} />
            <span>Release Stop Posting V6.5.002.1 — IDS Fortune NEXT PMS</span>
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

        {/* Top Feature Workflow Navigation Tabs */}
        <div style={{ background: '#D4D0C8', borderBottom: '1px solid #999', padding: '6px 10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: activeView === 'release-dialog' ? 700 : 400,
              background: activeView === 'release-dialog' ? '#FFF' : '#ECE9D8',
              borderBottom: activeView === 'release-dialog' ? '2px solid #0A246A' : '1px outset #FFF'
            }}
            onClick={() => setActiveView('release-dialog')}
          >
            🔓 Release Stop Posting Dialog (Frame 038)
          </button>

          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: activeView === 'post-charges-sim' ? 700 : 400,
              background: activeView === 'post-charges-sim' ? '#FFF' : '#ECE9D8',
              borderBottom: activeView === 'post-charges-sim' ? '2px solid #0A246A' : '1px outset #FFF'
            }}
            onClick={() => setActiveView('post-charges-sim')}
          >
            📋 Test Post Charges (Frames 015 & 045)
          </button>

          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: activeView === 'quick-balances' ? 700 : 400,
              background: activeView === 'quick-balances' ? '#FFF' : '#ECE9D8',
              borderBottom: activeView === 'quick-balances' ? '2px solid #0A246A' : '1px outset #FFF'
            }}
            onClick={() => setActiveView('quick-balances')}
          >
            🔍 Quick Balances V6.5.002.2 (Frame 065)
          </button>

          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: activeView === 'merge-checkout' ? 700 : 400,
              background: activeView === 'merge-checkout' ? '#FFF' : '#ECE9D8',
              borderBottom: activeView === 'merge-checkout' ? '2px solid #0A246A' : '1px outset #FFF'
            }}
            onClick={() => setActiveView('merge-checkout')}
          >
            🔀 Merge Folios & Final Checkout (Frames 075 & 095)
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessMsg && (
          <div style={{ background: '#E6F4EA', border: '1px solid #137333', color: '#137333', padding: '6px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ padding: '14px', minHeight: '380px' }}>

          {/* =========================================================================
              VIEW 1: RELEASE STOP POSTING PRIMARY DIALOG (Frame 038)
              ========================================================================= */}
          {activeView === 'release-dialog' && (
            <div>
              {/* Context Explanation Box matching Video 27 explanation */}
              <div style={{ background: '#FFF7CC', border: '1px solid #E6B800', padding: '8px 12px', marginBottom: '12px', fontSize: '11px', color: '#664D03', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
                <div>
                  <strong>PMS Posting Lock Protocol:</strong> Once a Front Office guest bill has been generated/printed, the system automatically engages <em>Stop Posting</em> protection to prevent billing discrepancy. Select <strong>Yes</strong> under <strong>Release</strong> and click <strong>[ Save ]</strong> to allow new charges to be posted.
                </div>
              </div>

              {/* Classic IDS 6.5 / 7.0 Table matching Frame 038 */}
              <div style={{ border: '2px inset #FFF', background: '#FFF', minHeight: '220px', maxHeight: '280px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #808080', textAlign: 'left', fontWeight: 700 }}>
                      <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '90px' }}>Room #</th>
                      <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '70px' }}>Fol #</th>
                      <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC', width: '90px' }}>Reg #</th>
                      <th style={{ padding: '4px 8px', borderRight: '1px solid #CCC' }}>Guest Name</th>
                      <th style={{ padding: '4px 8px', width: '120px', textAlign: 'center' }}>Release</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stopPostingList.map((row, idx) => {
                      const isSelected = row.roomNo === selectedRoom;
                      return (
                        <tr 
                          key={row.roomNo}
                          style={{ 
                            background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedRoom(row.roomNo);
                            setReleaseToggle(row.released ? 'Yes' : 'No');
                          }}
                        >
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #E0E0E0', fontWeight: 700 }}>
                            {row.roomNo}
                          </td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #E0E0E0' }}>
                            {row.folNo}
                          </td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #E0E0E0' }}>
                            {row.regNo}
                          </td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #E0E0E0', fontWeight: 600 }}>
                            {row.guestName}
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                            {isSelected ? (
                              <select 
                                className="ids-input"
                                value={releaseToggle}
                                onChange={(e) => setReleaseToggle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ 
                                  height: '22px', 
                                  padding: '1px 6px', 
                                  fontSize: '11px', 
                                  fontWeight: 700,
                                  background: releaseToggle === 'Yes' ? '#E6F4EA' : '#FCE8E6',
                                  color: releaseToggle === 'Yes' ? '#137333' : '#C5221F',
                                  width: '80px'
                                }}
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            ) : (
                              <span 
                                style={{ 
                                  padding: '1px 8px', 
                                  borderRadius: '2px', 
                                  fontWeight: 700,
                                  background: row.released ? '#E6F4EA' : '#FCE8E6',
                                  color: row.released ? '#137333' : '#C5221F'
                                }}
                              >
                                {row.released ? 'Yes (Unlocked)' : 'No (Locked)'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Status details bar */}
              <div style={{ marginTop: '12px', padding: '8px 12px', background: '#FFF', border: '1px solid #999', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Selected Room:</span> <strong>{currentRoomRecord.roomNo} ({currentRoomRecord.guestName})</strong>
                  <span style={{ marginLeft: '16px', color: '#666' }}>Reg #: {currentRoomRecord.regNo} | Folio #: {currentRoomRecord.folNo}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Current Status:</span>{' '}
                  <span style={{ color: currentRoomRecord.released ? '#137333' : '#C5221F', fontWeight: 700 }}>
                    {currentRoomRecord.released ? '🔓 Posting Enabled (Released)' : '🔒 Stop Posting Active (Locked)'}
                  </span>
                </div>
              </div>

              {/* Frame 038 Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '80px', fontWeight: 700 }}
                  onClick={handleSaveRelease}
                >
                  Save
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '80px' }}
                  onClick={() => setActiveView('post-charges-sim')}
                >
                  Panel
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '80px' }}
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: POST CHARGES SIMULATION (Frames 015 & 045)
              ========================================================================= */}
          {activeView === 'post-charges-sim' && (
            <div>
              <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '12px', fontSize: '11px' }}>
                <div style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, marginBottom: '10px' }}>
                  Post Charges V6.5.002.1 — Room #{selectedRoom} ({currentRoomRecord.guestName})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 180px 100px 1fr', gap: '8px 12px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Room#</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input className="ids-input" value={selectedRoom} readOnly style={{ width: '80px', fontWeight: 700 }} />
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }}
                      title="Select Room"
                      onClick={() => {
                        playReceptionChime();
                        const r = prompt("Select Room (201, 202, 105):", selectedRoom);
                        if (r && stopPostingList.find(x => x.roomNo === r)) setSelectedRoom(r);
                      }}
                    >?</button>
                  </div>

                  <span style={{ fontWeight: 600 }}>Folio #</span>
                  <input className="ids-input" value="1" readOnly style={{ width: '60px' }} />

                  <span style={{ fontWeight: 600 }}>Registration #</span>
                  <input className="ids-input" value={currentRoomRecord.regNo} readOnly style={{ width: '120px' }} />

                  <span style={{ fontWeight: 600 }}>Guest Name</span>
                  <input className="ids-input" value={currentRoomRecord.guestName} readOnly style={{ width: '220px' }} />

                  <span style={{ fontWeight: 600 }}>Accounting Date</span>
                  <input className="ids-input" value={accountingDate} readOnly style={{ width: '120px' }} />

                  <span style={{ fontWeight: 600 }}>Posting Status</span>
                  <span style={{ fontWeight: 700, color: currentRoomRecord.released ? '#137333' : '#C5221F' }}>
                    {currentRoomRecord.released ? '🔓 Allowed (Released)' : '🔒 Stop Posting Engaged'}
                  </span>

                  <span style={{ fontWeight: 600 }}>Revenue Code</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <select 
                      className="ids-input" 
                      value={simRevenueCode} 
                      onChange={(e) => setSimRevenueCode(e.target.value)}
                      style={{ width: '120px' }}
                    >
                      <option value="LAU">LAU - Laundry</option>
                      <option value="POS">POS - Restaurant Food</option>
                      <option value="MIN">MIN - Minibar</option>
                      <option value="TRV">TRV - Travel Desk</option>
                    </select>
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }}
                      title="Select Revenue Outlet"
                      onClick={() => {
                        playReceptionChime();
                        const rev = prompt("Enter Revenue Outlet Code (LAU, POS, MIN, TRV):", simRevenueCode);
                        if (rev) setSimRevenueCode(rev.toUpperCase());
                      }}
                    >?</button>
                  </div>

                  <span style={{ fontWeight: 600 }}>Description</span>
                  <input 
                    className="ids-input" 
                    value={simRevenueCode === 'LAU' ? 'Laundry Service (2 Shirts Dry Cleaned)' : 'Food & Beverage Service'} 
                    readOnly 
                    style={{ width: '260px' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Base Charges</span>
                  <input 
                    className="ids-input" 
                    type="number" 
                    value={simBaseAmount} 
                    onChange={(e) => setSimBaseAmount(e.target.value)}
                    style={{ width: '100px', fontWeight: 700 }} 
                  />

                  <span style={{ fontWeight: 600 }}>Tax Details</span>
                  <div style={{ fontSize: '10px', color: '#444' }}>
                    SGST 9% (₹{(parseFloat(simBaseAmount || 0) * 0.09).toFixed(2)}) + CGST 9% (₹{(parseFloat(simBaseAmount || 0) * 0.09).toFixed(2)})
                  </div>
                </div>

                {/* Total box */}
                <div style={{ borderTop: '1px solid #999', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px' }}>
                    Total Local Value: <strong style={{ fontSize: '13px', color: '#0A246A' }}>₹{(parseFloat(simBaseAmount || 0) * 1.18).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="ids-btn-classic" 
                      style={{ fontWeight: 700, minWidth: '100px', background: '#DCE6F1' }}
                      onClick={handleAttemptPostCharge}
                    >
                      💾 Post Charge
                    </button>
                    <button 
                      className="ids-btn-classic" 
                      style={{ minWidth: '70px' }}
                      onClick={() => setActiveView('release-dialog')}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>

              {/* Posted charges on this room history */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}>
                  Charges Posted to Room {selectedRoom} Folio 1:
                </div>
                <div style={{ border: '1px solid #999', background: '#FFF', maxHeight: '130px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #CCC' }}>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Rev Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Particulars</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right' }}>Tax (18%)</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postedChargesList.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '3px 6px' }}>{c.date}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 600 }}>{c.code}</td>
                          <td style={{ padding: '3px 6px' }}>{c.desc}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right' }}>₹{(c.sgst + c.cgst).toFixed(2)}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>₹{c.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: QUICK BALANCES (Frame 065)
              ========================================================================= */}
          {activeView === 'quick-balances' && (
            <div>
              <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px', fontSize: '11px' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  <div><strong>Room #:</strong> {selectedRoom}</div>
                  <div><strong>Guest Name:</strong> {currentRoomRecord.guestName}</div>
                  <div><strong>Reg #:</strong> {currentRoomRecord.regNo}</div>
                  <div><strong>Folio #:</strong> {currentRoomRecord.folNo}</div>
                  <div><strong>Arrival:</strong> {currentRoomRecord.arrivalDate}</div>
                  <div><strong>Departure:</strong> {NEXT_ACCOUNTING_DATE}</div>
                  <div><strong>Accounting Date:</strong> {accountingDate}</div>
                  <div><strong>Status:</strong> <span style={{ color: '#137333', fontWeight: 700 }}>In-House</span></div>
                </div>

                {/* Ledger Breakdown matching Frame 065 */}
                <div style={{ border: '1px solid #808080', background: '#FFF' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #808080', fontWeight: 700 }}>
                        <th style={{ padding: '4px 8px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Date</th>
                        <th style={{ padding: '4px 8px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Revenue Code</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #CCC', width: '100px' }}>Debit (₹)</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #CCC', width: '100px' }}>Credit (₹)</th>
                        <th style={{ padding: '4px 8px', textAlign: 'right', width: '100px' }}>Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE' }}>{accountingDate}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE', fontWeight: 600 }}>Room Tariff + Taxes</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE' }}>2,999.00</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE' }}>-</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>2,999.00</td>
                      </tr>
                      {postedChargesList.map((c, i) => (
                        <tr key={i}>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE' }}>{accountingDate}</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE', fontWeight: 600 }}>{c.desc} ({c.code})</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{c.total.toFixed(2)}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE' }}>-</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right' }}>{(2999 + c.total).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE' }}>{accountingDate}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #EEE', color: '#137333', fontWeight: 600 }}>Advance Deposit (Cash)</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE' }}>-</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #EEE', color: '#137333' }}>-1,000.00</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>1,999.00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#ECE9D8', borderTop: '2px solid #808080', fontWeight: 700 }}>
                        <td colSpan={2} style={{ padding: '4px 8px', textAlign: 'right' }}>Summary Total:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>{totalDebit.toFixed(2)}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', color: '#137333' }}>-1,000.00</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', color: '#0A246A', fontSize: '12px' }}>₹{netBalance.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button className="ids-btn-classic" onClick={() => setActiveView('merge-checkout')}>Proceed to Checkout</button>
                  <button className="ids-btn-classic" onClick={() => setActiveView('release-dialog')}>Back</button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: MERGE FOLIOS & FINAL BILL (Frames 075 & 095)
              ========================================================================= */}
          {activeView === 'merge-checkout' && (
            <div>
              {/* Note matching Frame 075 */}
              <div style={{ background: '#FFEBE8', border: '1px solid #EA4335', padding: '8px 12px', marginBottom: '10px', fontSize: '11px', color: '#C5221F', fontWeight: 600 }}>
                ⚠️ Notice (Frame 075): "Before printing final bill you have to merge both bills so that 1 copy of bill will print."
              </div>

              <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div><strong>Room #:</strong> {selectedRoom} | <strong>Guest:</strong> {currentRoomRecord.guestName}</div>
                  <div><strong>Net Payable:</strong> <strong style={{ fontSize: '13px', color: '#0A246A' }}>₹{netBalance.toFixed(2)}</strong></div>
                </div>

                {/* Folios Merge Table */}
                <div style={{ border: '1px solid #808080', background: '#FFF', marginBottom: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #808080', fontWeight: 700 }}>
                        <th style={{ padding: '3px 6px', width: '40px', textAlign: 'center' }}>Select</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Folio #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Bill Details</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Folio 1</td>
                        <td style={{ padding: '4px 6px' }}>Room Tariff (₹5,600.00) less Advance (₹1,000.00)</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹4,600.00</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Folio 2</td>
                        <td style={{ padding: '4px 6px' }}>Post-Release Laundry Service Charges</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹590.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Settlement options */}
                <div style={{ background: '#FFF', border: '1px solid #CCC', padding: '8px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>Settlements V6.5.008.30 (Frame 095)</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="radio" name="settleMode" defaultChecked /> Cash (₹{netBalance.toFixed(2)})
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="radio" name="settleMode" /> Credit Card
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="radio" name="settleMode" /> Company Direct Bill
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '140px', background: '#DCE6F1' }}
                    onClick={() => {
                      alert(`Bill for Room ${selectedRoom} successfully merged & settled for ₹${netBalance.toFixed(2)}.`);
                      onClose();
                    }}
                  >
                    Merge & Print Final Bill
                  </button>
                  <button className="ids-btn-classic" onClick={() => setActiveView('release-dialog')}>Exit</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================================
            EXACT PMS ERROR POPUP: SUPERVISOR STOP POSTING ALERT (Frame 015 & 025)
            ========================================================================= */}
        {supervisorAlertVisible && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setSupervisorAlertVisible(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ 
                width: '420px', 
                maxWidth: '92vw', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                background: '#ECE9D8',
                border: '2px outset #ECE9D8'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alert Title bar */}
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: '#316AC5',
                  color: '#FFF',
                  padding: '3px 6px',
                  fontWeight: 700,
                  fontSize: '11px'
                }}
              >
                <span>{supervisorAlertMsg.title}</span>
                <button className="ids-win-btn close" onClick={() => setSupervisorAlertVisible(false)}>✕</button>
              </div>

              {/* Alert body matching Frame 015 & 025 */}
              <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#FFF', padding: '6px', borderRadius: '50%', border: '2px solid #E6B800' }}>
                  <AlertTriangle size={28} color="#D97706" />
                </div>
                <div style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1A1A1A' }}>
                    {supervisorAlertMsg.text}
                  </div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
                    ID: {supervisorAlertMsg.id} &nbsp;&nbsp;&nbsp;&nbsp; MSG CODE: {supervisorAlertMsg.code}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ padding: '8px 14px 12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => {
                    setSupervisorAlertVisible(false);
                    setActiveView('release-dialog');
                  }}
                >
                  OK (Release Posting)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
