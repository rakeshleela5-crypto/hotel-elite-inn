import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  Save, X, FileText, CheckCircle2, ShieldAlert, DollarSign, Percent, 
  HelpCircle, Check, Phone, Mail, Globe, MapPin, CreditCard
} from 'lucide-react';

/* =========================================================================
   VIDEO 28: HOW TO CREATE COMPANY PROFILE IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Company Profile V6.5002.4 (Frames 010–075)
   2. Company Details Entry (Frames 010–050):
      - Company Code: COM0001
      - Name: Make My Trip India Pvt. Ltd.
      - Classification: Companies (Companies, Travel Agent, Corporate FIT)
      - Watch List: No / Yes
      - Address: Kolkata, City: Kolkata, State: West Bengal, Country: India, Zip: 781225
      - Phone #: 9128562985, Mobile #: 9128562985
      - Email: xyz@gmail.com, Web: www.makemytrip.com
      - Status: Active, GSTIN #: 21AAAAAA12341ZT
   3. Sales & Market Segments (Frames 050–065):
      - Bill Inst: 2
      - Mar.Seg: OTA (Online Travel Agent)
      - Bus. Source: MMT (with Business Sources V6.5.002.1 Lookup dialog)
   4. Side Panels:
      - Document Centre, Black Listed..., Receivable Details, Contact Details, Revenue Discount, Tax Information
   5. Save Prompt (Frame 070):
      - MESSAGE: "Link Rates to Company ?" [ Ok ] [ Cancel ]
   6. Browse Modal (Frame 075):
      - Company Profile V6.5.002.1 table grid with search & selection.
   ========================================================================= */

export const INITIAL_COMPANIES_DATABASE = [
  {
    companyCode: 'COM0001',
    name: 'Make My Trip India Pvt. Ltd.',
    classification: 'Companies',
    watchList: 'No',
    address: 'Kolkata Corporate Hub, Salt Lake Sector V',
    area: 'Salt Lake',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    zip: '781225',
    phone: '9128562985',
    mobile: '9128562985',
    fax: '033-28562980',
    iataNo: 'IATA-IN-9812',
    email: 'corporate@makemytrip.com',
    web: 'www.makemytrip.com',
    status: 'Active',
    gstin: '21AAAAAA12341ZT',
    salesOffice: 'CAL',
    salesExec: 'SO01',
    billInst: '2',
    marSeg: 'OTA',
    busSource: 'MMT',
    natureOfBusiness: 'Online Travel Aggregator & Corporate Travel',
    creditLimit: 500000.00,
    creditDays: 30,
    contactPerson: 'Mr. Rajesh Sen',
    contactDesignation: 'Regional Key Accounts Manager',
    contactPhone: '9830012345',
    roomDiscountPct: 15,
    fnbDiscountPct: 10,
    sezExempt: false,
    user: 'MANAGER',
    lastUpdated: '22-FEB-2026 19:52'
  },
  {
    companyCode: 'COM0003',
    name: 'Utkal Alumina International Ltd',
    classification: 'Companies',
    watchList: 'No',
    address: 'Aditya Birla Complex, Doraguda, Kashipur',
    area: 'Kashipur',
    city: 'Rayagada',
    state: 'Odisha',
    country: 'India',
    zip: '765015',
    phone: '06865-286100',
    mobile: '9437012345',
    fax: '',
    iataNo: '',
    email: 'travel.utkal@adityabirla.com',
    web: 'www.adityabirla.com',
    status: 'Active',
    gstin: '21AAACU1234F1Z8',
    salesOffice: 'RGDA',
    salesExec: 'SO01',
    billInst: '1',
    marSeg: 'CORP',
    busSource: 'DIR',
    natureOfBusiness: 'Alumina Refinery & Mining',
    creditLimit: 500000.00,
    creditDays: 30,
    contactPerson: 'Mr. Manoj Kumar Sahu',
    contactDesignation: 'VP - Administration & Travel',
    contactPhone: '9437012345',
    roomDiscountPct: 20,
    fnbDiscountPct: 15,
    sezExempt: false,
    user: 'MANAGER',
    lastUpdated: '10-OCT-2026 11:30'
  },
  {
    companyCode: 'COM0007',
    name: 'Mahindra & Mahindra Limited',
    classification: 'Companies',
    watchList: 'No',
    address: 'Gateway Building, Apollo Bunder',
    area: 'Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    zip: '400001',
    phone: '022-22895500',
    mobile: '9820011223',
    fax: '022-22895501',
    iataNo: '',
    email: 'travel.desk@mahindra.com',
    web: 'www.mahindra.com',
    status: 'Active',
    gstin: '27AAACM1234P1Z2',
    salesOffice: 'BOM',
    salesExec: 'SO03',
    billInst: '3',
    marSeg: 'CORP',
    busSource: 'DIR',
    natureOfBusiness: 'Automotive & Farm Equipment',
    creditLimit: 1000000.00,
    creditDays: 45,
    contactPerson: 'Mr. Santosh Biswakarma',
    contactDesignation: 'VP - Operations',
    contactPhone: '9820011223',
    roomDiscountPct: 25,
    fnbDiscountPct: 20,
    sezExempt: false,
    user: 'MANAGER',
    lastUpdated: '14-JAN-2026 19:56'
  }
];

export const BUSINESS_SOURCES_LIST = [
  { code: 'MMT', applicableFrom: '15-SEP-2021', name: 'MAKE MY TRIP', status: 'Active' },
  { code: 'GOD', applicableFrom: '15-SEP-2021', name: 'GOOMO', status: 'Active' },
  { code: 'HRS', applicableFrom: '15-SEP-2021', name: 'HRS', status: 'Active' },
  { code: 'HYD', applicableFrom: '15-SEP-2021', name: 'RSO HYDERABAD', status: 'Active' },
  { code: 'JAI', applicableFrom: '15-SEP-2021', name: 'RSO JAIPUR', status: 'Active' },
  { code: 'KOC', applicableFrom: '15-SEP-2021', name: 'RSO KOCHI', status: 'Active' },
  { code: 'KOL', applicableFrom: '15-SEP-2021', name: 'RSO KOLKATA', status: 'Active' },
  { code: 'LUD', applicableFrom: '15-SEP-2021', name: 'RSO LUDHIANA', status: 'Active' },
  { code: 'MIC', applicableFrom: '15-SEP-2021', name: 'MICROSITE', status: 'Active' },
  { code: 'MUM', applicableFrom: '15-SEP-2021', name: 'RSO MUMBAI', status: 'Active' },
  { code: 'BKG', applicableFrom: '01-JAN-2026', name: 'BOOKING.COM', status: 'Active' },
  { code: 'EXP', applicableFrom: '01-JAN-2026', name: 'EXPEDIA TRAVEL', status: 'Active' },
  { code: 'AGD', applicableFrom: '01-JAN-2026', name: 'AGODA INTERNATIONAL', status: 'Active' }
];

export default function IdsCompanyProfileModal({
  isOpen,
  onClose,
  initialCompanyCode = 'COM0001',
  accountingDate = '22-FEB-2026',
  onSaveCompanyProfile
}) {
  const [companiesList, setCompaniesList] = useState(INITIAL_COMPANIES_DATABASE);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active form data matching Video 28 Frames 010–050
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_COMPANIES_DATABASE.find(c => c.companyCode === initialCompanyCode);
    return found || INITIAL_COMPANIES_DATABASE[0];
  });

  // Modal dialog states
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [browseSearchTerm, setBrowseSearchTerm] = useState('');
  const [busSourceLookupOpen, setBusSourceLookupOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(null); // 'document' | 'blacklist' | 'receivable' | 'contact' | 'discount' | 'tax'
  const [linkRatesPromptOpen, setLinkRatesPromptOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add New Company
  const handleAddNew = () => {
    const newCode = `COM000${companiesList.length + 1}`;
    const newRecord = {
      companyCode: newCode,
      name: 'New Company Profile Pvt. Ltd.',
      classification: 'Companies',
      watchList: 'No',
      address: '',
      area: '',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      zip: '',
      phone: '',
      mobile: '',
      fax: '',
      iataNo: '',
      email: '',
      web: '',
      status: 'Active',
      gstin: '',
      salesOffice: 'CAL',
      salesExec: 'SO01',
      billInst: '2',
      marSeg: 'OTA',
      busSource: 'MMT',
      natureOfBusiness: '',
      creditLimit: 100000.00,
      creditDays: 30,
      contactPerson: '',
      contactDesignation: '',
      contactPhone: '',
      roomDiscountPct: 10,
      fnbDiscountPct: 5,
      sezExempt: false,
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 19:52`
    };
    setFormData(newRecord);
    setStatusMessage(`Editing new company profile (${newCode}). Fill in details and click Save.`);
  };

  // Trigger Save -> Shows "Link Rates to Company ?" (Frame 070)
  const handleSaveClick = () => {
    setLinkRatesPromptOpen(true);
  };

  // Confirm Save with/without Link Rates
  const handleConfirmSave = (linkRates = true) => {
    setLinkRatesPromptOpen(false);
    setCompaniesList(prev => {
      const exists = prev.some(c => c.companyCode === formData.companyCode);
      if (exists) {
        return prev.map(c => c.companyCode === formData.companyCode ? formData : c);
      }
      return [...prev, formData];
    });

    setStatusMessage(`Company Profile [${formData.companyCode}] ${formData.name} saved successfully! ${linkRates ? '(Rates Linked to Corporate Profile)' : ''}`);
    if (onSaveCompanyProfile) {
      onSaveCompanyProfile(formData, linkRates);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Navigate Previous / Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(companiesList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(companiesList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setFormData(companiesList[newIdx]);
  };

  // Select Business Source from Lookup (Frame 060)
  const handleSelectBusSource = (source) => {
    handleChange('busSource', source.code);
    setBusSourceLookupOpen(false);
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '920px', 
          maxWidth: '96vw', 
          maxHeight: '92vh',
          boxShadow: '0 10px 36px rgba(0,0,0,0.6)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar matching Frame 010 */}
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
            <span>Company Profile V6.5002.4 — IDS Fortune NEXT PMS</span>
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

        {/* Status notification */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body matching Frames 010–060 */}
        <div style={{ padding: '12px', overflowY: 'auto', flex: 1, fontSize: '11px' }}>
          
          {/* Top Header Group */}
          <div style={{ border: '1px solid #999', padding: '8px', background: '#FFF', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 140px 60px 1fr 100px 100px', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Company Code</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input 
                  className="ids-input" 
                  value={formData.companyCode} 
                  onChange={(e) => handleChange('companyCode', e.target.value)}
                  style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} 
                />
                <button className="ids-btn-classic" style={{ width: '22px' }} onClick={() => setBrowseModalOpen(true)}>?</button>
              </div>

              <span style={{ fontWeight: 600 }}>Name</span>
              <input 
                className="ids-input" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ width: '100%', fontWeight: 700 }} 
              />

              <span style={{ fontWeight: 600 }}>Classification</span>
              <select 
                className="ids-input" 
                value={formData.classification} 
                onChange={(e) => handleChange('classification', e.target.value)}
              >
                <option value="Companies">Companies</option>
                <option value="Travel Agent">Travel Agent</option>
                <option value="Corporate FIT">Corporate FIT</option>
                <option value="Airlines">Airlines</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px 120px 80px 80px', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Chief Executive</span>
              <input 
                className="ids-input" 
                value={formData.contactPerson || ''} 
                onChange={(e) => handleChange('contactPerson', e.target.value)} 
              />

              <span style={{ fontWeight: 600 }}>Holding Comp</span>
              <input 
                className="ids-input" 
                value="MakeMyTrip Limited (MMYT)" 
                readOnly 
              />

              <span style={{ fontWeight: 600 }}>Watch List</span>
              <select 
                className="ids-input" 
                value={formData.watchList} 
                onChange={(e) => handleChange('watchList', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px' }}>

            {/* Left Column: Address, Contact & GST (Frames 030–050) */}
            <div style={{ border: '1px solid #999', padding: '10px', background: '#FFF' }}>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #CCC', paddingBottom: '4px', marginBottom: '8px', color: '#0A246A' }}>
                📍 Address & Statutory GST Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Address</span>
                <input 
                  className="ids-input" 
                  value={formData.address} 
                  onChange={(e) => handleChange('address', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Area</span>
                <input 
                  className="ids-input" 
                  value={formData.area} 
                  onChange={(e) => handleChange('area', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>City</span>
                <input 
                  className="ids-input" 
                  value={formData.city} 
                  onChange={(e) => handleChange('city', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>State</span>
                <input 
                  className="ids-input" 
                  value={formData.state} 
                  onChange={(e) => handleChange('state', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Country</span>
                <input 
                  className="ids-input" 
                  value={formData.country} 
                  onChange={(e) => handleChange('country', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Zip</span>
                <input 
                  className="ids-input" 
                  value={formData.zip} 
                  onChange={(e) => handleChange('zip', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Phone #:</span>
                <input 
                  className="ids-input" 
                  value={formData.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Mobile #</span>
                <input 
                  className="ids-input" 
                  value={formData.mobile} 
                  onChange={(e) => handleChange('mobile', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Email</span>
                <input 
                  className="ids-input" 
                  value={formData.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Web</span>
                <input 
                  className="ids-input" 
                  value={formData.web} 
                  onChange={(e) => handleChange('web', e.target.value)} 
                />

                <span style={{ fontWeight: 600 }}>Status</span>
                <select 
                  className="ids-input" 
                  value={formData.status} 
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <span style={{ fontWeight: 600, color: '#0A246A' }}>GSTIN #</span>
                <input 
                  className="ids-input" 
                  value={formData.gstin} 
                  onChange={(e) => handleChange('gstin', e.target.value)} 
                  style={{ fontWeight: 700, color: '#0A246A', background: '#F0F4FF' }}
                />
              </div>
            </div>

            {/* Right Column: Sales, Segment & Side Panels (Frames 050–070) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Sales & Market Segment Box */}
              <div style={{ border: '1px solid #999', padding: '8px', background: '#FFF' }}>
                <div style={{ fontWeight: 700, borderBottom: '1px solid #CCC', paddingBottom: '4px', marginBottom: '6px', color: '#0A246A' }}>
                  💼 Sales & Market Segment
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '5px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Bill Inst</span>
                  <input 
                    className="ids-input" 
                    value={formData.billInst} 
                    onChange={(e) => handleChange('billInst', e.target.value)}
                    style={{ width: '60px' }} 
                  />

                  <span style={{ fontWeight: 600 }}>Mar.Seg</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      className="ids-input" 
                      value={formData.marSeg} 
                      onChange={(e) => handleChange('marSeg', e.target.value)}
                      style={{ width: '70px', fontWeight: 700 }} 
                    />
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }}
                      title="Market Segment Lookup"
                      onClick={() => {
                        const seg = prompt("Select Market Segment (OTA, CORP, FIT, GROUP):", formData.marSeg);
                        if (seg) handleChange('marSeg', seg.toUpperCase());
                      }}
                    >?</button>
                    <span style={{ fontSize: '10px', color: '#666', lineHeight: '20px' }}>OTA (Online)</span>
                  </div>

                  <span style={{ fontWeight: 600 }}>Bus. Source</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input 
                      className="ids-input" 
                      value={formData.busSource} 
                      onChange={(e) => handleChange('busSource', e.target.value)}
                      style={{ width: '70px', fontWeight: 700, background: '#FFF7CC' }} 
                    />
                    <button 
                      className="ids-btn-classic" 
                      style={{ width: '22px' }} 
                      onClick={() => setBusSourceLookupOpen(true)}
                      title="Open Business Sources Lookup V6.5.002.1"
                    >
                      ?
                    </button>
                    <span style={{ fontSize: '10px', color: '#666', lineHeight: '20px' }}>MAKE MY TRIP</span>
                  </div>

                  <span style={{ fontWeight: 600 }}>Nature Bus.</span>
                  <input 
                    className="ids-input" 
                    value={formData.natureOfBusiness} 
                    onChange={(e) => handleChange('natureOfBusiness', e.target.value)} 
                  />
                </div>
              </div>

              {/* Side Panels Buttons matching Frame 010 & 030 */}
              <div style={{ border: '1px solid #999', padding: '6px', background: '#D4D0C8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px' }}
                  onClick={() => setSidePanelOpen('document')}
                >
                  📁 Document Centre
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px', color: '#C5221F' }}
                  onClick={() => setSidePanelOpen('blacklist')}
                >
                  ☠️ Black Listed...
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px', fontWeight: 600 }}
                  onClick={() => setSidePanelOpen('receivable')}
                >
                  💰 Receivable Details
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px' }}
                  onClick={() => setSidePanelOpen('contact')}
                >
                  🤝 Contact Details
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px' }}
                  onClick={() => setSidePanelOpen('discount')}
                >
                  % Revenue Discount
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '4px 6px', fontSize: '10px' }}
                  onClick={() => setSidePanelOpen('tax')}
                >
                  🏛️ Tax Information
                </button>
              </div>

            </div>
          </div>

          {/* Bottom metadata footer */}
          <div style={{ marginTop: '8px', borderTop: '1px solid #CCC', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555' }}>
            <div>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.sezExempt} 
                  onChange={(e) => handleChange('sezExempt', e.target.checked)} 
                />{' '}
                Company belongs to SEZ
              </label>
            </div>
            <div>
              <span>User: <strong>{formData.user}</strong></span>
              <span style={{ marginLeft: '16px' }}>Last Updated: <strong>{formData.lastUpdated}</strong></span>
            </div>
          </div>

        </div>

        {/* Bottom Toolbar matching Frames 010–075 */}
        <div 
          style={{ 
            background: '#D4D0C8', 
            borderTop: '2px outset #FFF', 
            padding: '6px 12px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="ids-btn-classic" onClick={handleAddNew}>Add</button>
            <button className="ids-btn-classic" onClick={() => setStatusMessage('Edit mode active. Update fields and click Save.')}>Modify</button>
            <button className="ids-btn-classic" onClick={() => alert('Delete operation requires Manager/Admin authorization.')}>Delete</button>
            <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setBrowseModalOpen(true)}>Browse</button>
            <button className="ids-btn-classic" onClick={handlePrevious}>Previous</button>
            <button className="ids-btn-classic" onClick={handleNext}>Next</button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
              onClick={handleSaveClick}
            >
              Save
            </button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setBrowseModalOpen(true)}>Panel...</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
          </div>
        </div>

        {/* =========================================================================
            FRAME 070: "MESSAGE: Link Rates to Company ?" PROMPT DIALOG
            ========================================================================= */}
        {linkRatesPromptOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setLinkRatesPromptOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '380px', maxWidth: '90vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>MESSAGE</span>
                <button className="ids-win-btn close" onClick={() => setLinkRatesPromptOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <HelpCircle size={28} color="#0A246A" />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  Link Rates to Company ?
                </div>
              </div>

              <div style={{ padding: '8px 14px 12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px', fontWeight: 700 }}
                  onClick={() => handleConfirmSave(true)}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn-classic" 
                  style={{ minWidth: '70px' }}
                  onClick={() => handleConfirmSave(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FRAME 060: BUSINESS SOURCES V6.5.002.1 LOOKUP MODAL
            ========================================================================= */}
        {busSourceLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBusSourceLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '560px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Business Sources V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setBusSourceLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px' }}>
                <div style={{ border: '1px solid #808080', background: '#FFF', maxHeight: '240px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #808080', fontWeight: 700 }}>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '110px' }}>Applicable From</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BUSINESS_SOURCES_LIST.map((b) => (
                        <tr 
                          key={b.code} 
                          style={{ 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #EEE',
                            background: b.code === formData.busSource ? '#316AC5' : '#FFF',
                            color: b.code === formData.busSource ? '#FFF' : '#000'
                          }}
                          onDoubleClick={() => handleSelectBusSource(b)}
                          onClick={() => handleChange('busSource', b.code)}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700 }}>{b.code}</td>
                          <td style={{ padding: '3px 6px' }}>{b.applicableFrom}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 600 }}>{b.name}</td>
                          <td style={{ padding: '3px 6px' }}>{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px' }}
                    onClick={() => {
                      const selected = BUSINESS_SOURCES_LIST.find(b => b.code === formData.busSource) || BUSINESS_SOURCES_LIST[0];
                      handleSelectBusSource(selected);
                    }}
                  >
                    Select
                  </button>
                  <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => setBusSourceLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FRAME 075: COMPANY PROFILE V6.5.002.1 BROWSE LOOKUP MODAL
            ========================================================================= */}
        {browseModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setBrowseModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '720px', maxWidth: '95vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Company Profile V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setBrowseModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>Search Name:</span>
                  <input 
                    className="ids-input" 
                    value={browseSearchTerm} 
                    onChange={(e) => setBrowseSearchTerm(e.target.value)}
                    placeholder="Type company name..."
                    style={{ flex: 1 }} 
                  />
                </div>

                <div style={{ border: '1px solid #808080', background: '#FFF', maxHeight: '260px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #808080', fontWeight: 700 }}>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Company Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'center' }}>Black Listed</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>City</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companiesList
                        .filter(c => c.name.toLowerCase().includes(browseSearchTerm.toLowerCase()) || c.companyCode.toLowerCase().includes(browseSearchTerm.toLowerCase()))
                        .map((c, idx) => (
                          <tr 
                            key={c.companyCode}
                            style={{ 
                              cursor: 'pointer',
                              borderBottom: '1px solid #EEE',
                              background: c.companyCode === formData.companyCode ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                              color: c.companyCode === formData.companyCode ? '#FFF' : '#000'
                            }}
                            onClick={() => setFormData(c)}
                            onDoubleClick={() => {
                              setFormData(c);
                              setBrowseModalOpen(false);
                            }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700 }}>{c.companyCode}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'center' }}>{c.watchList}</td>
                            <td style={{ padding: '3px 6px' }}>{c.status}</td>
                            <td style={{ padding: '3px 6px' }}>{c.city}</td>
                            <td style={{ padding: '3px 6px' }}>{c.country}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px' }}
                    onClick={() => setBrowseModalOpen(false)}
                  >
                    Select
                  </button>
                  <button className="ids-btn-classic" style={{ minWidth: '70px' }} onClick={() => setBrowseModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SIDE PANELS (Receivables, Discounts, Contacts, Tax)
            ========================================================================= */}
        {sidePanelOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1650 }} onClick={() => setSidePanelOpen(null)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '480px', maxWidth: '92vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>
                  {sidePanelOpen === 'receivable' && '💰 Receivable Credit Details'}
                  {sidePanelOpen === 'discount' && '% Revenue Discount Configuration'}
                  {sidePanelOpen === 'contact' && '🤝 Contact Persons'}
                  {sidePanelOpen === 'tax' && '🏛️ Statutory Tax Information'}
                  {sidePanelOpen === 'document' && '📁 Document Repository'}
                  {sidePanelOpen === 'blacklist' && '☠️ Blacklist Status & History'}
                </span>
                <button className="ids-win-btn close" onClick={() => setSidePanelOpen(null)}>✕</button>
              </div>

              <div style={{ padding: '14px', fontSize: '11px' }}>
                {sidePanelOpen === 'receivable' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Credit Limit (₹)</span>
                    <input 
                      className="ids-input" 
                      type="number" 
                      value={formData.creditLimit} 
                      onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value) || 0)} 
                    />

                    <span style={{ fontWeight: 600 }}>Credit Days</span>
                    <input 
                      className="ids-input" 
                      type="number" 
                      value={formData.creditDays} 
                      onChange={(e) => handleChange('creditDays', parseInt(e.target.value) || 0)} 
                    />

                    <span style={{ fontWeight: 600 }}>Bill To Company</span>
                    <select className="ids-input" defaultValue="Allowed">
                      <option value="Allowed">Allowed (Direct BTC)</option>
                      <option value="Restricted">Restricted / Advance Required</option>
                    </select>
                  </div>
                )}

                {sidePanelOpen === 'discount' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Room Discount %</span>
                    <input 
                      className="ids-input" 
                      type="number" 
                      value={formData.roomDiscountPct} 
                      onChange={(e) => handleChange('roomDiscountPct', parseFloat(e.target.value) || 0)} 
                    />

                    <span style={{ fontWeight: 600 }}>F&B Discount %</span>
                    <input 
                      className="ids-input" 
                      type="number" 
                      value={formData.fnbDiscountPct} 
                      onChange={(e) => handleChange('fnbDiscountPct', parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                )}

                {sidePanelOpen === 'contact' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Contact Person</span>
                    <input 
                      className="ids-input" 
                      value={formData.contactPerson} 
                      onChange={(e) => handleChange('contactPerson', e.target.value)} 
                    />

                    <span style={{ fontWeight: 600 }}>Designation</span>
                    <input 
                      className="ids-input" 
                      value={formData.contactDesignation} 
                      onChange={(e) => handleChange('contactDesignation', e.target.value)} 
                    />

                    <span style={{ fontWeight: 600 }}>Direct Phone</span>
                    <input 
                      className="ids-input" 
                      value={formData.contactPhone} 
                      onChange={(e) => handleChange('contactPhone', e.target.value)} 
                    />
                  </div>
                )}

                {sidePanelOpen === 'tax' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>GSTIN</span>
                    <input 
                      className="ids-input" 
                      value={formData.gstin} 
                      onChange={(e) => handleChange('gstin', e.target.value)} 
                      style={{ fontWeight: 700 }}
                    />

                    <span style={{ fontWeight: 600 }}>SEZ Exemption</span>
                    <select 
                      className="ids-input" 
                      value={formData.sezExempt ? 'Yes' : 'No'} 
                      onChange={(e) => handleChange('sezExempt', e.target.value === 'Yes')}
                    >
                      <option value="No">No (Normal GST 18%)</option>
                      <option value="Yes">Yes (SEZ LUT 0% Tax)</option>
                    </select>
                  </div>
                )}

                {sidePanelOpen === 'document' && (
                  <div>
                    <div style={{ color: '#555', marginBottom: '8px' }}>Attached Corporate Contracts & KYC Documents:</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                      <li>📄 Corporate_Rate_Contract_2026_MakeMyTrip.pdf (Signed)</li>
                      <li>📄 GST_Registration_Certificate_WestBengal.pdf (Verified)</li>
                    </ul>
                  </div>
                )}

                {sidePanelOpen === 'blacklist' && (
                  <div style={{ color: '#137333', fontWeight: 600 }}>
                    ✅ Good Standing. This corporate profile is not blacklisted.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button className="ids-btn-classic" style={{ minWidth: '70px', fontWeight: 700 }} onClick={() => setSidePanelOpen(null)}>OK</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
