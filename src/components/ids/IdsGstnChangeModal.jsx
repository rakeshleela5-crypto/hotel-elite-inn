import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, Receipt, CheckCircle2, ShieldCheck, 
  Search, Printer, AlertCircle, FileText, ArrowRight, Check, X, RefreshCw
} from 'lucide-react';

/* =========================================================================
   VIDEO 43: HOW TO ADD COMPANY DETAILS & GSTN IN FO BILL AFTER CHECK OUT IN IDS 6.5 & 7.0
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: GSTN Number Change V6.5.006.1 (Frames 018–058)
   2. Entry Points (Frames 006 & 038):
      - Setup.. -> Add Company Details & GSTN After Check-out (GSTN Number Change)
      - Supervisor.. -> GSTN / VAT Number Change **
      - Quick Scan (Load Pgm) -> Type "gstn change" or "add company" -> [ Load ]
      - 44-Video Tutorial Player -> Video 43 -> Launch Interactive Feature Clone
   3. Module Tabs (Frame 038):
      - [ Front Office ] | [ Point Of Sale ] | [ Banquet ] | [ Laundry ] | [ Misc. Sales ]
   4. Search & Filter:
      - (o) Specific Date | ( ) Month/Year
      - Date: 02-MAR-2022 | Bill #: 1429 with [ ? ] lookup
   5. Dual Comparison Columns (Frame 038):
      - OLD (Unregistered B2C Guest):
        * GSTN #: [empty]
        * Name: SETHI KUMAR BINOD (Mrs Devi Sarala)
        * Address: WEST MANIPUR, IMPHAL, INDIA, 795001
      - NEW (Updated B2B Corporate Invoice):
        * GSTN #: 20AAAAAA12341ZT (or 27AABCT3521R1Z8)
        * Company Code: COM0001 (Tata Motors Limited) with [ ? ] lookup
        * Name: Tata Motors Limited
        * Address: Navi Mumbai, Mumbai, Maharashtra
        * City: Mumbai | State: Maharashtra (27) | Country: India
   6. Statutory Audit Trail (Frame 038):
      - Reason: Guest requested corporate tax invoice post check-out for GST input credit
      - Approved By: MANAGER | User ID: MANAGER | Last Updated: 25-MAR-2022 10:55
   7. Post-Update Invoice Regeneration (Frame 068):
      - Rule 46 Tax Invoice (1429 new.pdf) with B2B Company & GSTN details!
   ========================================================================= */

export const INITIAL_CHECKED_OUT_BILLS = [
  {
    billNo: '1429',
    billDate: '02-MAR-2022',
    roomNo: '404',
    roomType: 'DELUXE',
    pax: 2,
    guestName: 'MR BINOD SETHI / MRS DEVI SARALA',
    oldGstn: '',
    oldCompanyName: '',
    oldAddress: 'WEST MANIPUR, MANIPUR, IMPHAL, INDIA, 795001',
    oldCity: 'MANIPUR',
    oldState: 'IMPHAL',
    oldCountry: 'INDIA',
    totalAmount: 3920.00,
    roomTariff: 3500.00,
    cgst: 210.00,
    sgst: 210.00,
    isUpdated: false,
    newGstn: '20AAAAAA12341ZT',
    newCompanyCode: 'COM0001',
    newCompanyName: 'Tata Motors Limited',
    newAddress: 'Navi Mumbai, Mumbai, Maharashtra',
    newCity: 'Mumbai',
    newState: 'Maharashtra (27)',
    newCountry: 'India'
  },
  {
    billNo: '1428',
    billDate: '01-MAR-2022',
    roomNo: '202',
    roomType: 'EXECUTIVE',
    pax: 1,
    guestName: 'MR RAHUL VERMA',
    oldGstn: '',
    oldCompanyName: '',
    oldAddress: 'Connaught Place, New Delhi',
    oldCity: 'New Delhi',
    oldState: 'Delhi',
    oldCountry: 'India',
    totalAmount: 4928.00,
    roomTariff: 4400.00,
    cgst: 264.00,
    sgst: 264.00,
    isUpdated: false,
    newGstn: '27AABCT3521R1Z8',
    newCompanyCode: 'COM0002',
    newCompanyName: 'Tata Consultancy Services Ltd',
    newAddress: 'TCS House, Raveline Street, Fort',
    newCity: 'Mumbai',
    newState: 'Maharashtra (27)',
    newCountry: 'India'
  }
];

export const COMPANY_LOOKUP_DATABASE = [
  { code: 'COM0001', name: 'Tata Motors Limited', gstn: '20AAAAAA12341ZT', address: 'Navi Mumbai, Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra (27)' },
  { code: 'COM0002', name: 'Tata Consultancy Services Ltd', gstn: '27AABCT3521R1Z8', address: 'TCS House, Raveline Street, Fort', city: 'Mumbai', state: 'Maharashtra (27)' },
  { code: 'COM0003', name: 'Reliance Industries Limited', gstn: '27AAACR5055K1ZX', address: 'Maker Chambers IV, Nariman Point', city: 'Mumbai', state: 'Maharashtra (27)' },
  { code: 'COM0004', name: 'Infosys BPM Limited', gstn: '29AAACI4798M1ZR', address: 'Electronics City, Hosur Road', city: 'Bengaluru', state: 'Karnataka (29)' }
];

export default function IdsGstnChangeModal({
  isOpen,
  onClose,
  accountingDate = '25-MAR-2022',
  onOpenCrystalReport
}) {
  const [activeModuleTab, setActiveModuleTab] = useState('Front Office');
  const [billsList, setBillsList] = useState(INITIAL_CHECKED_OUT_BILLS);
  const [selectedBill, setSelectedBill] = useState(INITIAL_CHECKED_OUT_BILLS[0]);

  // Form State matching Frame 038
  const [searchDate, setSearchDate] = useState('02-MAR-2022');
  const [searchBillNo, setSearchBillNo] = useState('1429');
  
  // NEW Company details
  const [newGstn, setNewGstn] = useState(INITIAL_CHECKED_OUT_BILLS[0].newGstn);
  const [newCompanyCode, setNewCompanyCode] = useState(INITIAL_CHECKED_OUT_BILLS[0].newCompanyCode);
  const [newCompanyName, setNewCompanyName] = useState(INITIAL_CHECKED_OUT_BILLS[0].newCompanyName);
  const [newAddress, setNewAddress] = useState(INITIAL_CHECKED_OUT_BILLS[0].newAddress);
  const [newCity, setNewCity] = useState(INITIAL_CHECKED_OUT_BILLS[0].newCity);
  const [newState, setNewState] = useState(INITIAL_CHECKED_OUT_BILLS[0].newState);
  const [newCountry, setNewCountry] = useState(INITIAL_CHECKED_OUT_BILLS[0].newCountry);
  
  // Audit trail fields
  const [reason, setReason] = useState('Guest requested corporate tax invoice post check-out for GST input credit');
  const [approvedBy, setApprovedBy] = useState('MANAGER');

  // Sub-dialogs
  const [companyLookupOpen, setCompanyLookupOpen] = useState(false);
  const [billLookupOpen, setBillLookupOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Save GSTN and Company details to post-checkout folio
  const handleSaveGstnChange = () => {
    if (!newGstn.trim() || !newCompanyName.trim()) {
      alert('Please enter valid GSTIN and Company Name.');
      return;
    }

    setBillsList(prev => prev.map(b => 
      b.billNo === selectedBill.billNo 
        ? {
            ...b,
            isUpdated: true,
            newGstn,
            newCompanyCode,
            newCompanyName,
            newAddress,
            newCity,
            newState,
            newCountry
          }
        : b
    ));

    setSelectedBill(prev => ({
      ...prev,
      isUpdated: true,
      newGstn,
      newCompanyCode,
      newCompanyName,
      newAddress,
      newCity,
      newState,
      newCountry
    }));

    setStatusMessage(`Bill #${selectedBill.billNo} successfully updated with Company "${newCompanyName}" & GSTIN ${newGstn}!`);
    setTimeout(() => setStatusMessage(''), 4500);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '780px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Video 43 Frame 038 */}
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
            <Building2 size={14} />
            <span>GSTN Number Change V6.5.006.1 — Add Company & GSTN Post Check-out</span>
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

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Module Selection Tabs matching Frame 038 */}
        <div style={{ display: 'flex', gap: '4px', padding: '6px 12px 0 12px', background: '#D4D0C8', borderBottom: '1px solid #999' }}>
          {['Front Office', 'Point Of Sale', 'Banquet', 'Laundry', 'Misc. Sales'].map(tab => (
            <button 
              key={tab}
              className="ids-btn-classic" 
              style={{ 
                fontWeight: 700, 
                fontSize: '11px',
                background: activeModuleTab === tab ? '#ECE9D8' : '#D4D0C8',
                borderBottom: activeModuleTab === tab ? '2px solid #ECE9D8' : '1px solid #808080'
              }}
              onClick={() => setActiveModuleTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Header Controls matching Frame 038 */}
        <div style={{ padding: '12px 16px', fontSize: '11px' }}>
          
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <input type="radio" name="filterMode" defaultChecked /> Specific Date
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                  <input type="radio" name="filterMode" /> Month/Year
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Date</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <input className="ids-input" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} style={{ width: '90px', fontWeight: 700 }} />
                  <button className="ids-btn-classic" onClick={() => setBillLookupOpen(true)}>?</button>
                </div>

                <span style={{ fontWeight: 600 }}>Bill #</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <input className="ids-input" value={searchBillNo} onChange={(e) => setSearchBillNo(e.target.value)} style={{ width: '65px', fontWeight: 700, background: '#FFF7CC' }} />
                  <button className="ids-btn-classic" onClick={() => setBillLookupOpen(true)}>?</button>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Comparison Columns: OLD vs NEW matching Frame 038 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            
            {/* Left Box: OLD Details */}
            <div style={{ border: '1px solid #7F9DB9', background: '#F4F4F4', padding: '8px 10px' }}>
              <div style={{ fontWeight: 700, color: '#666', borderBottom: '1px solid #CCC', paddingBottom: '3px', marginBottom: '6px' }}>
                OLD (Checked-Out Guest Details)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '4px 6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>GSTN #</span>
                <input className="ids-input" value={selectedBill.oldGstn || '[ Not Provided ]'} readOnly style={{ width: '100%', color: '#999', fontStyle: 'italic' }} />

                <span style={{ fontWeight: 600 }}>Name</span>
                <input className="ids-input" value={selectedBill.guestName} readOnly style={{ width: '100%', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Address</span>
                <input className="ids-input" value={selectedBill.oldAddress} readOnly style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>City</span>
                <input className="ids-input" value={selectedBill.oldCity} readOnly style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>State</span>
                <input className="ids-input" value={selectedBill.oldState} readOnly style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>Country</span>
                <input className="ids-input" value={selectedBill.oldCountry} readOnly style={{ width: '100%' }} />
              </div>
            </div>

            {/* Right Box: NEW Corporate Details matching Frame 038 */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CCC', paddingBottom: '3px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#0A246A' }}>NEW (Corporate Tax Invoice Details)</span>
                <button className="ids-btn-classic" style={{ fontSize: '10px', fontWeight: 700 }} onClick={() => setCompanyLookupOpen(true)}>
                  Lookup Company..
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>GSTN #</span>
                <input className="ids-input" value={newGstn} onChange={(e) => setNewGstn(e.target.value)} style={{ width: '100%', fontWeight: 700, background: '#FFF7CC' }} />

                <span style={{ fontWeight: 600 }}>Company Code</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <input className="ids-input" value={newCompanyCode} onChange={(e) => setNewCompanyCode(e.target.value)} style={{ width: '70px', fontWeight: 700 }} />
                  <button className="ids-btn-classic" onClick={() => setCompanyLookupOpen(true)}>?</button>
                </div>

                <span style={{ fontWeight: 600 }}>Name</span>
                <input className="ids-input" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} style={{ width: '100%', fontWeight: 700, background: '#FFF7CC' }} />

                <span style={{ fontWeight: 600 }}>Address</span>
                <input className="ids-input" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>City</span>
                <input className="ids-input" value={newCity} onChange={(e) => setNewCity(e.target.value)} style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>State</span>
                <input className="ids-input" value={newState} onChange={(e) => setNewState(e.target.value)} style={{ width: '100%' }} />

                <span style={{ fontWeight: 600 }}>Country</span>
                <input className="ids-input" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

          </div>

          {/* Statutory Audit & Authorization Controls matching Frame 038 */}
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '6px 12px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 80px 110px', gap: '6px 10px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600 }}>Reason</span>
              <input className="ids-input" value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', fontWeight: 600 }} />

              <span style={{ fontWeight: 600 }}>Approved By</span>
              <input className="ids-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', borderTop: '1px solid #CCC', paddingTop: '4px' }}>
              <div>User ID: <strong>MANAGER</strong></div>
              <div>Last Updated: <strong>25-MAR-2022 10:55</strong></div>
            </div>
          </div>

          {/* Bottom Action Ribbon matching Frame 038 */}
          <div 
            style={{ 
              background: '#D4D0C8', 
              border: '1px solid #808080', 
              padding: '6px 10px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button 
              className="ids-btn-classic" 
              style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setInvoicePreviewOpen(true)}
            >
              <Printer size={12} /> View / Reprint Rule 46 Tax Invoice (1429 new.pdf)
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '65px', background: '#DCE6F1' }}
                onClick={handleSaveGstnChange}
              >
                Save
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => { setNewGstn(''); setNewCompanyName(''); }}>Clear</button>
              <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            COMPANY LOOKUP MODAL
            ========================================================================= */}
        {companyLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setCompanyLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Corporate Masters & GSTIN Lookup</span>
                <button className="ids-win-btn close" onClick={() => setCompanyLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '65px', borderRight: '1px solid #B0AB9A' }}>Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Company Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '130px', borderRight: '1px solid #B0AB9A' }}>GSTIN</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '90px' }}>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPANY_LOOKUP_DATABASE.map((comp, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setNewCompanyCode(comp.code);
                            setNewCompanyName(comp.name);
                            setNewGstn(comp.gstn);
                            setNewAddress(comp.address);
                            setNewCity(comp.city);
                            setNewState(comp.state);
                            setNewCountry('India');
                            setCompanyLookupOpen(false);
                          }}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{comp.code}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{comp.name}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #E0E0E0' }}>{comp.gstn}</td>
                          <td style={{ padding: '3px 6px' }}>{comp.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setCompanyLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CHECKED-OUT BILLS LOOKUP MODAL
            ========================================================================= */}
        {billLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBillLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '600px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Checked-Out Bills Lookup</span>
                <button className="ids-win-btn close" onClick={() => setBillLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '160px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '55px', borderRight: '1px solid #B0AB9A' }}>Bill #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>Room#</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Guest Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '80px', borderRight: '1px solid #B0AB9A' }}>Date</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '75px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billsList.map((b, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setSelectedBill(b);
                            setSearchBillNo(b.billNo);
                            setSearchDate(b.billDate);
                            setNewGstn(b.newGstn);
                            setNewCompanyCode(b.newCompanyCode);
                            setNewCompanyName(b.newCompanyName);
                            setNewAddress(b.newAddress);
                            setNewCity(b.newCity);
                            setNewState(b.newState);
                            setNewCountry(b.newCountry);
                            setBillLookupOpen(false);
                          }}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{b.billNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.roomNo}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{b.guestName}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{b.billDate}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#137333' }}>₹{b.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setBillLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            RULE 46 GST TAX INVOICE REPRINT MODAL (Frame 068: 1429 new.pdf)
            ========================================================================= */}
        {invoicePreviewOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setInvoicePreviewOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '680px', maxWidth: '96vw', background: '#FFF', border: '2px solid #000', boxShadow: '0 12px 36px rgba(0,0,0,0.75)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#0A246A', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>1429 new.pdf — Rule 46 GST Tax Invoice with Corporate GSTN Details</span>
                <button className="ids-win-btn close" onClick={() => setInvoicePreviewOpen(false)}>✕</button>
              </div>

              {/* Invoice Layout matching Frame 018 vs Frame 068 */}
              <div style={{ padding: '18px 24px', fontSize: '11px', color: '#111', fontFamily: 'monospace' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div>
                    <div><strong>Guest Name:</strong> {selectedBill.guestName}</div>
                    <div><strong>Address:</strong> {selectedBill.oldAddress}</div>
                    <div style={{ marginTop: '6px', background: '#FFF7CC', padding: '4px 6px', border: '1px solid #E6D043' }}>
                      <div><strong>Company Name:</strong> <span style={{ color: '#0A246A', fontWeight: 700 }}>{selectedBill.newCompanyName || newCompanyName}</span></div>
                      <div><strong>Address:</strong> {selectedBill.newAddress || newAddress}</div>
                      <div><strong>Guest GST No:</strong> <span style={{ color: '#C5221F', fontWeight: 700 }}>{selectedBill.newGstn || newGstn}</span></div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Bill Number:</strong> {selectedBill.billNo}</div>
                    <div><strong>Bill Date:</strong> {selectedBill.billDate}</div>
                    <div><strong>Room No:</strong> {selectedBill.roomNo} ({selectedBill.roomType})</div>
                    <div><strong>Pax:</strong> {selectedBill.pax}</div>
                    <div><strong>Arrival:</strong> 01-Mar-2022 16:00</div>
                    <div><strong>Departure:</strong> 02-Mar-2022 13:44</div>
                    <div><strong>Meal Plan:</strong> EP</div>
                  </div>
                </div>

                {/* Line Items Table matching Frame 068 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', marginBottom: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: '3px 0' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '3px 0' }}>Ref. No</th>
                      <th style={{ textAlign: 'left', padding: '3px 0' }}>Description</th>
                      <th style={{ textAlign: 'left', padding: '3px 0' }}>GST SAC No#</th>
                      <th style={{ textAlign: 'right', padding: '3px 0' }}>Debit</th>
                      <th style={{ textAlign: 'right', padding: '3px 0' }}>Credit</th>
                      <th style={{ textAlign: 'right', padding: '3px 0' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>01-Mar-22</td>
                      <td>492</td>
                      <td>Advance (Cash) / ROOM PARTH RECIVED</td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>-3920.00</td>
                      <td style={{ textAlign: 'right' }}>-3920.00</td>
                    </tr>
                    <tr>
                      <td>01-Mar-22</td>
                      <td></td>
                      <td>Tariff / 404</td>
                      <td>996311</td>
                      <td style={{ textAlign: 'right' }}>3500.00</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>-420.00</td>
                    </tr>
                    <tr>
                      <td>01-Mar-22</td>
                      <td></td>
                      <td>Central GST @ 6.00%</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>210.00</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>-210.00</td>
                    </tr>
                    <tr>
                      <td>01-Mar-22</td>
                      <td></td>
                      <td>State GST @ 6.00%</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>210.00</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1px solid #000', borderBottom: '2px double #000', fontWeight: 700 }}>
                      <td colSpan="4">Total Bill Amount (INR):</td>
                      <td style={{ textAlign: 'right' }}>₹{selectedBill.totalAmount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{selectedBill.totalAmount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#137333' }}>₹0.00</td>
                    </tr>
                  </tfoot>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '14px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, background: '#DCE6F1' }} 
                    onClick={() => {
                      if (onOpenCrystalReport) {
                        onOpenCrystalReport('rule46-bill', {
                          billNo: selectedBill.billNo,
                          billDate: selectedBill.billDate,
                          roomNo: selectedBill.roomNo,
                          guestName: selectedBill.guestName,
                          companyName: selectedBill.newCompanyName || newCompanyName,
                          gstin: selectedBill.newGstn || newGstn,
                          roomType: selectedBill.roomType,
                          ratePlan: 'EP',
                          roomTariff: selectedBill.roomTariff,
                          cgst: selectedBill.cgst,
                          sgst: selectedBill.sgst,
                          grandTotal: selectedBill.totalAmount,
                          payMode: 'Cash'
                        });
                        setInvoicePreviewOpen(false);
                      } else {
                        window.print();
                      }
                    }}
                  >
                    Crystal Reports Print
                  </button>
                  <button className="ids-btn-classic" onClick={() => window.print()}>
                    Quick Print
                  </button>
                  <button className="ids-btn-classic" onClick={() => setInvoicePreviewOpen(false)}>
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
