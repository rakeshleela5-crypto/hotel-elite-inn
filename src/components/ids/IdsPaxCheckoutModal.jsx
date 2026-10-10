import React, { useState, useEffect } from 'react';
import './idsFortuneNext.css';
import { User, Users, Check, X, Search, ShieldCheck, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { INITIAL_ACCOUNTING_DATE, NEXT_ACCOUNTING_DATE } from '../../data/idsPmsStore';

/* =========================================================================
   VIDEO 18: PAX CHECK-OUT IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Room Status Context Menu -> "Pax Check-Out" (Frame 020–025)
   2. Pax Checkout V6.5.002.1 Main Window (Frames 026–095)
      - Top Section: Pax to Check Out (Room#, Reg #, Folio #, Guest Name, Arrival, Departure)
      - "Main Folio" Group Box: Main Guest in-house details (Room#, Reg #, Folio #, Guest Name, Arrival, Departure)
      - [ Checkout ], [ Clear ], [ Panel ], [ Exit ]
   3. "Pax Checkout" Lookup Table Popup (Frame 028–030)
      - Data Grid: Room#, Reg #, Folio #, Guest Name
      - Selectable Multi-Pax Rooms: 102 (MR RAJESH SHARMA), 203 (MR MANOJ KUMAR), 206 (MR DEEPAK MOHANTY), 301 (MR ANIL PATNAIK)
      - [ Select ], [ Cancel ]
   4. "Authorized By" Dialog (Frames 035–045 & 085–090)
      - Remarks: "Checked Out" / "Guest Checkout"
      - Authorised By: "Manager"
      - Reason: "Guest" / "Early Departure"
      - [ Ok ], [ Exit ]
   5. Success Message Dialog (Frame 050 & Frame 092)
      - Title: "Pax Checkout V6.5.002.1"
      - Red Stop/X icon
      - "Pax check out operation is completed. Use change rate program to apply rate changes"
      - ID: FOMT785    MSG CODE: 6271    [ Exit ]
   6. PMS State Synchronization:
      - Room remains Occupied (O/DLX) with primary guest in-house
      - Guest count decrements by 1 in Room Status & Live PMS Statistics
      - Guest Information V6.5002.2 reflects 1 Pax (1/0)
   ========================================================================= */

export const DEFAULT_PAX_CHECKOUT_LIST = [
  {
    roomNo: '102',
    regNo: '588',
    folioNo: '1',
    guestName: 'MRS Pooja Sharma',
    title: 'MRS',
    firstName: 'Pooja',
    lastName: 'Sharma',
    arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
    departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
    roomType: 'DLX',
    company: 'Ashok Leyland Ltd',
    mainFolio: {
      roomNo: '102',
      regNo: '587',
      folioNo: '1',
      guestName: 'MR RAJESH SHARMA',
      title: 'MR',
      firstName: 'RAJESH',
      lastName: 'SHARMA',
      arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
      departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
      company: 'Ashok Leyland Ltd',
      balance: '3,500.00',
      rate: '1,750.00',
      plan: '0.00',
      nights: 2
    }
  },
  {
    roomNo: '203',
    regNo: '590',
    folioNo: '1',
    guestName: 'MRS Sunita Patel',
    title: 'MRS',
    firstName: 'Sunita',
    lastName: 'Patel',
    arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
    departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
    roomType: 'EXE',
    company: 'Utkal Alumina International Ltd',
    mainFolio: {
      roomNo: '203',
      regNo: '589',
      folioNo: '1',
      guestName: 'MR VIKRAM PATEL',
      title: 'MR',
      firstName: 'VIKRAM',
      lastName: 'PATEL',
      arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
      departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
      company: 'Utkal Alumina International Ltd',
      balance: '4,100.00',
      rate: '2,050.00',
      plan: '0.00',
      nights: 2
    }
  },
  {
    roomNo: '206',
    regNo: '592',
    folioNo: '1',
    guestName: 'MRS Rashmita Jena',
    title: 'MRS',
    firstName: 'Rashmita',
    lastName: 'Jena',
    arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
    departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
    roomType: 'DLX',
    company: 'Vedanta Ltd',
    mainFolio: {
      roomNo: '206',
      regNo: '591',
      folioNo: '1',
      guestName: 'MR SUBRAT JENA',
      title: 'MR',
      firstName: 'SUBRAT',
      lastName: 'JENA',
      arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
      departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
      company: 'Vedanta Ltd',
      balance: '3,500.00',
      rate: '1,750.00',
      plan: '0.00',
      nights: 2
    }
  },
  {
    roomNo: '301',
    regNo: '594',
    folioNo: '1',
    guestName: 'MRS Smita Rath',
    title: 'MRS',
    firstName: 'Smita',
    lastName: 'Rath',
    arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
    departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
    roomType: 'STD',
    company: 'Corporate FIT',
    mainFolio: {
      roomNo: '301',
      regNo: '593',
      folioNo: '1',
      guestName: 'MR AMITAV RATH',
      title: 'MR',
      firstName: 'AMITAV',
      lastName: 'RATH',
      arrival: `${INITIAL_ACCOUNTING_DATE} 14:00`,
      departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
      company: 'Corporate FIT',
      balance: '2,900.00',
      rate: '1,450.00',
      plan: '0.00',
      nights: 2
    }
  },
  {
    roomNo: '109',
    regNo: '596',
    folioNo: '1',
    guestName: 'MRS Mohanty',
    title: 'MRS',
    firstName: 'Swarna',
    lastName: 'Mohanty',
    arrival: `${INITIAL_ACCOUNTING_DATE} 18:00`,
    departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
    roomType: 'SUI',
    company: 'AIIMS Healthcare Consultant',
    mainFolio: {
      roomNo: '109',
      regNo: '595',
      folioNo: '1',
      guestName: 'DR S N MOHANTY',
      title: 'DR',
      firstName: 'S N',
      lastName: 'MOHANTY',
      arrival: `${INITIAL_ACCOUNTING_DATE} 18:00`,
      departure: `${NEXT_ACCOUNTING_DATE} 12:00`,
      company: 'AIIMS Healthcare Consultant',
      balance: '6,500.00',
      rate: '3,250.00',
      plan: '0.00',
      nights: 2
    }
  }
];

export default function IdsPaxCheckoutModal({
  isOpen,
  onClose,
  initialRoomNo = '102',
  onPaxCheckedOut,
  dynamicPaxList = [],
  onOpenRoomRack,
  onOpenGuestInfo
}) {
  // Combine static defaults with any dynamic walk-in pax (e.g. Room 203 Mrs Sharma)
  const fullPaxList = React.useMemo(() => {
    const list = [...DEFAULT_PAX_CHECKOUT_LIST];
    if (dynamicPaxList && dynamicPaxList.length > 0) {
      dynamicPaxList.forEach(item => {
        if (!list.find(x => x.roomNo === item.roomNo && x.regNo === item.regNo)) {
          list.push(item);
        }
      });
    }
    return list;
  }, [dynamicPaxList]);

  // Current selected Pax object
  const [selectedPax, setSelectedPax] = useState(null);

  // Form field states (Top Box: Departing Pax)
  const [formRoomNo, setFormRoomNo] = useState('');
  const [formRegNo, setFormRegNo] = useState('');
  const [formFolioNo, setFormFolioNo] = useState('');
  const [formGuestName, setFormGuestName] = useState('');
  const [formArrival, setFormArrival] = useState('');
  const [formDeparture, setFormDeparture] = useState('');

  // Form field states (Bottom Box: Main Folio)
  const [mainRoomNo, setMainRoomNo] = useState('');
  const [mainRegNo, setMainRegNo] = useState('');
  const [mainFolioNo, setMainFolioNo] = useState('');
  const [mainGuestName, setMainGuestName] = useState('');
  const [mainArrival, setMainArrival] = useState('');
  const [mainDeparture, setMainDeparture] = useState('');

  // Sub-dialogs
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupSelectedIndex, setLookupSelectedIndex] = useState(0);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Authorization Form fields
  const [authRemarks, setAuthRemarks] = useState('Checked Out');
  const [authAuthorisedBy, setAuthAuthorisedBy] = useState('Manager');
  const [authReason, setAuthReason] = useState('Guest');

  // Checkout completed history in current session
  const [completedCheckouts, setCompletedCheckouts] = useState([]);

  // Auto-populate or open lookup when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialRoomNo) {
        const found = fullPaxList.find(p => p.roomNo === String(initialRoomNo));
        if (found) {
          loadPax(found);
          setShowLookupModal(false);
        } else {
          // If no specific match, pre-select first item and open lookup
          setShowLookupModal(true);
        }
      } else {
        setShowLookupModal(true);
      }
    }
  }, [isOpen, initialRoomNo, fullPaxList]);

  const loadPax = (pax) => {
    setSelectedPax(pax);
    // Departing Pax
    setFormRoomNo(pax.roomNo || '');
    setFormRegNo(pax.regNo || '');
    setFormFolioNo(pax.folioNo || '1');
    setFormGuestName(pax.guestName || '');
    setFormArrival(pax.arrival || '');
    setFormDeparture(pax.departure || '');

    // Main Folio
    const main = pax.mainFolio || {};
    setMainRoomNo(main.roomNo || pax.roomNo || '');
    setMainRegNo(main.regNo || '');
    setMainFolioNo(main.folioNo || '1');
    setMainGuestName(main.guestName || '');
    setMainArrival(main.arrival || pax.arrival || '');
    setMainDeparture(main.departure || pax.departure || '');
  };

  const handleClear = () => {
    setSelectedPax(null);
    setFormRoomNo('');
    setFormRegNo('');
    setFormFolioNo('');
    setFormGuestName('');
    setFormArrival('');
    setFormDeparture('');

    setMainRoomNo('');
    setMainRegNo('');
    setMainFolioNo('');
    setMainGuestName('');
    setMainArrival('');
    setMainDeparture('');
  };

  const handleOpenLookup = () => {
    // Determine initial selected index in table
    const idx = fullPaxList.findIndex(p => p.roomNo === formRoomNo);
    if (idx >= 0) setLookupSelectedIndex(idx);
    setShowLookupModal(true);
  };

  const handleSelectFromLookup = () => {
    const chosen = fullPaxList[lookupSelectedIndex];
    if (chosen) {
      loadPax(chosen);
    }
    setShowLookupModal(false);
  };

  const handleStartCheckout = () => {
    if (!formRoomNo || !formRegNo) {
      alert('Please select a pax from lookup first.');
      return;
    }
    // Set default remarks (Frame 040 uses "Guest Checkout", Frame 085 uses "Checked Out")
    if (formRoomNo === '102') {
      setAuthRemarks('Guest Checkout');
      setAuthAuthorisedBy('Manager');
      setAuthReason('secori');
    } else {
      setAuthRemarks('Checked Out');
      setAuthAuthorisedBy('Manager');
      setAuthReason('Guest');
    }
    setShowAuthorizeModal(true);
  };

  const handleConfirmAuthorization = () => {
    setShowAuthorizeModal(false);
    setShowAlertModal(true);
  };

  const handleDismissAlert = () => {
    setShowAlertModal(false);

    // Record checkout completion
    const record = {
      roomNo: formRoomNo,
      regNo: formRegNo,
      folioNo: formFolioNo,
      guestName: formGuestName,
      mainRegNo: mainRegNo,
      mainGuestName: mainGuestName,
      remarks: authRemarks,
      authorisedBy: authAuthorisedBy,
      reason: authReason,
      timestamp: new Date().toLocaleTimeString()
    };
    setCompletedCheckouts(prev => [record, ...prev]);

    if (onPaxCheckedOut) {
      onPaxCheckedOut(record);
    }

    // Per Video 18 Frame 095: fields clear after successful checkout
    handleClear();
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>


      {/* Main Modal: Pax Check-out V6.5.002.1 */}
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '640px', 
          maxWidth: '96vw', 
          background: '#ECE9D8', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}
      >
        {/* Title Bar matching Video 18 Frame 030 */}
        <div 
          className="ids-dialog-titlebar plain" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>🚪</span>
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>Pax Check-out V6.5.002.1</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button className="ids-win-btn" style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>_</button>
            <button className="ids-win-btn" style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}>□</button>
            <button className="ids-win-btn close" style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Dialog Body */}
        <div style={{ padding: '10px 12px', fontSize: '11px', color: '#000' }}>
          {/* Top Section: Departing Pax Details (Frames 030, 035, 050, 080) */}
          <div 
            style={{ 
              border: '1px solid #D0CEBF', 
              padding: '10px 12px', 
              marginBottom: '10px',
              background: '#F5F4EE'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '70px 120px 30px 1fr 150px', rowGap: '6px', columnGap: '6px', alignItems: 'center' }}>
              {/* Row 1: Room# and Arrival */}
              <label style={{ fontWeight: 600 }}>Room#</label>
              <input 
                className="ids-input" 
                value={formRoomNo} 
                onChange={(e) => setFormRoomNo(e.target.value)}
                style={{ width: '110px', background: '#FFF', fontWeight: 700 }}
              />
              <button 
                type="button"
                className="ids-btn-classic" 
                onClick={handleOpenLookup}
                title="Lookup Pax Checkout Rooms (Frame 028)"
                style={{ width: '24px', height: '20px', padding: 0, fontWeight: 700 }}
              >
                ?
              </button>
              <div style={{ textAlign: 'right', paddingRight: '6px', fontWeight: 600 }}>Arrival</div>
              <input 
                className="ids-input" 
                value={formArrival} 
                readOnly
                style={{ width: '140px', background: '#EBEBE4', fontSize: '10px' }}
              />

              {/* Row 2: Reg # and Departure */}
              <label style={{ fontWeight: 600 }}>Reg #</label>
              <input 
                className="ids-input" 
                value={formRegNo} 
                readOnly
                style={{ width: '110px', background: '#EBEBE4' }}
              />
              <div />
              <div style={{ textAlign: 'right', paddingRight: '6px', fontWeight: 600 }}>Departure</div>
              <input 
                className="ids-input" 
                value={formDeparture} 
                readOnly
                style={{ width: '140px', background: '#EBEBE4', fontSize: '10px' }}
              />

              {/* Row 3: Folio # */}
              <label style={{ fontWeight: 600 }}>Folio #</label>
              <input 
                className="ids-input" 
                value={formFolioNo} 
                readOnly
                style={{ width: '110px', background: '#EBEBE4' }}
              />
              <div colSpan={3} />

              {/* Row 4: Guest Name */}
              <label style={{ fontWeight: 600 }}>Guest Name</label>
              <div style={{ gridColumn: '2 / span 4' }}>
                <input 
                  className="ids-input" 
                  value={formGuestName} 
                  readOnly
                  style={{ width: '100%', background: '#EBEBE4', fontWeight: 700, color: '#0A246A' }}
                />
              </div>
            </div>
          </div>

          {/* Group Box: Main Folio (Frames 030, 035, 050, 080) */}
          <fieldset 
            style={{ 
              border: '1px solid #7F9DB9', 
              padding: '8px 12px', 
              marginBottom: '12px',
              background: '#F5F4EE'
            }}
          >
            <legend style={{ padding: '0 4px', fontWeight: 700, color: '#000', fontSize: '11px' }}>
              Main Folio
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 120px 30px 1fr 150px', rowGap: '6px', columnGap: '6px', alignItems: 'center' }}>
              {/* Row 1: Room# and Arrival */}
              <label style={{ fontWeight: 600 }}>Room#</label>
              <input 
                className="ids-input" 
                value={mainRoomNo} 
                readOnly
                style={{ width: '110px', background: '#EBEBE4', fontWeight: 700 }}
              />
              <div />
              <div style={{ textAlign: 'right', paddingRight: '6px', fontWeight: 600 }}>Arrival</div>
              <input 
                className="ids-input" 
                value={mainArrival} 
                readOnly
                style={{ width: '140px', background: '#EBEBE4', fontSize: '10px' }}
              />

              {/* Row 2: Reg # and Departure */}
              <label style={{ fontWeight: 600 }}>Reg #</label>
              <input 
                className="ids-input" 
                value={mainRegNo} 
                readOnly
                style={{ width: '110px', background: '#EBEBE4' }}
              />
              <div />
              <div style={{ textAlign: 'right', paddingRight: '6px', fontWeight: 600 }}>Departure</div>
              <input 
                className="ids-input" 
                value={mainDeparture} 
                readOnly
                style={{ width: '140px', background: '#EBEBE4', fontSize: '10px' }}
              />

              {/* Row 3: Folio # */}
              <label style={{ fontWeight: 600 }}>Folio #</label>
              <input 
                className="ids-input" 
                value={mainFolioNo} 
                readOnly
                style={{ width: '110px', background: '#EBEBE4' }}
              />
              <div colSpan={3} />

              {/* Row 4: Guest Name */}
              <label style={{ fontWeight: 600 }}>Guest Name</label>
              <div style={{ gridColumn: '2 / span 4' }}>
                <input 
                  className="ids-input" 
                  value={mainGuestName} 
                  readOnly
                  style={{ width: '100%', background: '#EBEBE4', fontWeight: 700, color: '#333' }}
                />
              </div>
            </div>
          </fieldset>

          {/* Bottom Action Bar matching Frames 030, 035, 050, 080 */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '6px', 
              borderTop: '1px solid #CCC', 
              paddingTop: '8px' 
            }}
          >
            <button 
              type="button"
              className="ids-btn-classic" 
              onClick={handleStartCheckout}
              disabled={!formRoomNo || !formRegNo}
              style={{ 
                minWidth: '76px', 
                fontWeight: 700, 
                color: (!formRoomNo || !formRegNo) ? '#888' : '#0A246A',
                cursor: (!formRoomNo || !formRegNo) ? 'not-allowed' : 'pointer'
              }}
            >
              Checkout
            </button>
            <button 
              type="button"
              className="ids-btn-classic" 
              onClick={handleClear}
              style={{ minWidth: '60px' }}
            >
              Clear
            </button>
            <button 
              type="button"
              className="ids-btn-classic" 
              style={{ minWidth: '60px' }}
              onClick={() => {
                if (selectedPax && onOpenGuestInfo) {
                  onOpenGuestInfo(selectedPax.roomNo);
                } else {
                  alert(`Main Folio: ${mainGuestName} in Room #${mainRoomNo || formRoomNo}.`);
                }
              }}
            >
              Panel
            </button>
            <button 
              type="button"
              className="ids-btn-classic" 
              onClick={onClose}
              style={{ minWidth: '60px' }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          POPUP 1: "Pax Checkout" DATA GRID LOOKUP TABLE (Frames 028–030)
          ========================================================================= */}
      {showLookupModal && (
        <div 
          className="ids-modal-overlay" 
          style={{ zIndex: 1300, background: 'rgba(0,0,0,0.35)' }}
        >
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '460px', 
              maxWidth: '92vw', 
              background: '#ECE9D8',
              boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
              border: '2px solid #FFF',
              borderRightColor: '#716F64',
              borderBottomColor: '#716F64'
            }}
          >
            {/* Title Bar matching Frame 028 */}
            <div 
              className="ids-dialog-titlebar plain" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#0A246A',
                color: '#FFF',
                padding: '2px 6px'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Pax Checkout</span>
              <button 
                className="ids-win-btn close" 
                style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
                onClick={() => setShowLookupModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '8px 10px', fontSize: '11px' }}>
              {/* Lookup Table Header and Grid matching Frame 030 */}
              <div 
                style={{ 
                  border: '1px solid #7F9DB9', 
                  background: '#FFF', 
                  maxHeight: '220px', 
                  overflowY: 'auto',
                  marginBottom: '10px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #999', textAlign: 'left', fontWeight: 700 }}>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '55px' }}>Room#</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '55px' }}>Reg #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #CCC', width: '45px' }}>Folio #</th>
                      <th style={{ padding: '3px 6px' }}>Guest Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullPaxList.map((row, idx) => {
                      const isSelected = lookupSelectedIndex === idx;
                      return (
                        <tr 
                          key={`${row.roomNo}-${row.regNo}-${idx}`}
                          onClick={() => setLookupSelectedIndex(idx)}
                          onDoubleClick={() => {
                            setLookupSelectedIndex(idx);
                            loadPax(row);
                            setShowLookupModal(false);
                          }}
                          style={{
                            background: isSelected ? '#0A246A' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'),
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <td style={{ padding: '2px 6px', borderRight: '1px solid #E0E0E0', fontWeight: 600 }}>{row.roomNo}</td>
                          <td style={{ padding: '2px 6px', borderRight: '1px solid #E0E0E0' }}>{row.regNo}</td>
                          <td style={{ padding: '2px 6px', borderRight: '1px solid #E0E0E0' }}>{row.folioNo}</td>
                          <td style={{ padding: '2px 6px' }}>{row.guestName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Buttons matching Frame 030 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={handleSelectFromLookup}
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Select
                </button>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={() => setShowLookupModal(false)}
                  style={{ minWidth: '65px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          POPUP 2: "Authorized By" DIALOG (Frames 035–045 & 085–090)
          ========================================================================= */}
      {showAuthorizeModal && (
        <div 
          className="ids-modal-overlay" 
          style={{ zIndex: 1350, background: 'rgba(0,0,0,0.4)' }}
        >
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '380px', 
              maxWidth: '92vw', 
              background: '#ECE9D8',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              border: '2px solid #FFF',
              borderRightColor: '#716F64',
              borderBottomColor: '#716F64'
            }}
          >
            {/* Title Bar matching Frame 035 */}
            <div 
              className="ids-dialog-titlebar plain" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#0A246A',
                color: '#FFF',
                padding: '2px 6px'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Authorized By</span>
              <button 
                className="ids-win-btn close" 
                style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
                onClick={() => setShowAuthorizeModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', fontSize: '11px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ fontWeight: 600 }}>Remarks</label>
                <input 
                  className="ids-input" 
                  value={authRemarks} 
                  onChange={(e) => setAuthRemarks(e.target.value)}
                  style={{ width: '100%', background: '#FFF' }}
                  autoFocus
                />

                <label style={{ fontWeight: 600 }}>Authorised By</label>
                <input 
                  className="ids-input" 
                  value={authAuthorisedBy} 
                  onChange={(e) => setAuthAuthorisedBy(e.target.value)}
                  style={{ width: '100%', background: '#FFF' }}
                />

                <label style={{ fontWeight: 600 }}>Reason</label>
                <input 
                  className="ids-input" 
                  value={authReason} 
                  onChange={(e) => setAuthReason(e.target.value)}
                  style={{ width: '100%', background: '#FFF' }}
                />
              </div>

              {/* Bottom Buttons matching Frame 035 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid #CCC', paddingTop: '8px' }}>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={handleConfirmAuthorization}
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={() => setShowAuthorizeModal(false)}
                  style={{ minWidth: '65px' }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          POPUP 3: "Pax Checkout V6.5.002.1" SUCCESS ALERT (Frames 050 & 092)
          ========================================================================= */}
      {showAlertModal && (
        <div 
          className="ids-modal-overlay" 
          style={{ zIndex: 1400, background: 'rgba(0,0,0,0.45)' }}
        >
          <div 
            className="ids-dialog-window" 
            style={{ 
              width: '420px', 
              maxWidth: '92vw', 
              background: '#ECE9D8',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              border: '2px solid #FFF',
              borderRightColor: '#716F64',
              borderBottomColor: '#716F64'
            }}
          >
            {/* Title Bar matching Frame 050 */}
            <div 
              className="ids-dialog-titlebar plain" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#0A246A',
                color: '#FFF',
                padding: '2px 6px'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Pax Checkout V6.5.002.1</span>
              <button 
                className="ids-win-btn close" 
                style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: '10px' }}
                onClick={handleDismissAlert}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '14px 16px', fontSize: '11px', color: '#000' }}>
              {/* Message Body with Red X Icon matching Frame 050 */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: '#CC0000', 
                    color: '#FFF',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}
                >
                  ✕
                </div>
                <div style={{ lineHeight: '1.45', paddingTop: '2px', fontSize: '11px', color: '#000' }}>
                  Pax check out operation is completed. Use change rate program to apply rate changes
                </div>
              </div>

              {/* Status Code Footer matching Frame 050: ID: FOMT785   MSG CODE: 6271   [ Exit ] */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px solid #CCC',
                  paddingTop: '8px',
                  fontSize: '10px',
                  color: '#444'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>ID:</span> FOMT785 &nbsp;&nbsp;&nbsp;
                  <span style={{ fontWeight: 700 }}>MSG CODE:</span> 6271
                </div>
                <button 
                  type="button"
                  className="ids-btn-classic" 
                  onClick={handleDismissAlert}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                  autoFocus
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
