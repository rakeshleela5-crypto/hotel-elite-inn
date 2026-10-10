import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  Building2, DollarSign, Search, CheckCircle2, ChevronLeft, 
  ChevronRight, Save, Plus, Edit, Trash2, X, Tag, Package,
  Layers, Coffee, Wifi, ShieldCheck, FileText, Check
} from 'lucide-react';
import { INITIAL_COMPANIES_DATABASE } from './IdsCompanyProfileModal';
import { INITIAL_RATE_TABLES } from './IdsCompanyContractRatesModal';

/* =========================================================================
   VIDEO 32: HOW TO LINK COMPANY RATES IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Link Rates to Company V6.5.002.1 (Frames 010–060)
   2. Entry Points (Frames 006 & 058):
      - Sales and Marketing -> Profiles.. -> Link Rates to Company
      - Guest History.. -> Link Company Rates to Bookings
      - Quick Scan (Load Pgm) -> Type "link" -> "Link Rates to Company" -> [ Load ]
      - 44-Video Tutorial Player -> Video 32 -> Launch Interactive Feature Clone
   3. Fields & Linked Data (Frames 012 & 024):
      - Company...: COM0002 with [ ? ] lookup
      - Com. Name: Tata Motors Limited
      - Tel #: +91 22 6665 8282
      - IATA #: 98765432
      - Rate Structure: 100 with [ ? ] lookup + [ Package ] button
      - Description: Rate for Tata Motors Limited
      - Amenities: WELCOM with [ ? ] lookup
   4. Tables (Frame 024):
      - Left: Amenities for Rate Structure (WELCOM - WELCOM DRINKS, WIFI - HIGH SPEED WI-FI)
      - Right Top: Occupancy Rates Grid (Single 2999, Double 3499, Bed Adult 1500)
        with Room Type (DLX), Plan Code (MAP), Currency (INR) selectors
      - Right Bottom: Default Amenities for Company
   5. Integration Workflow (Frames 040–050):
      - When linked company is selected in Walk-ins / Reservations, the rate code
        switches to "Contract" and contracted plan/rate is applied automatically.
   ========================================================================= */

export const INITIAL_COMPANY_RATE_LINKS = [
  {
    companyCode: 'COM0002',
    companyName: 'Tata Motors Limited',
    tel: '+91 22 6665 8282',
    iata: 'TATAMOT',
    rateStructure: '100',
    rateDescription: 'Rate for Tata Motors Limited',
    planCode: 'MAP',
    currency: 'INR',
    roomType: 'DLX',
    occupancyRates: {
      single: 2999.00,
      double: 3499.00,
      triple: 0.00,
      quadruple: 0.00,
      bedAdult: 1500.00,
      bedChild: 0.00
    },
    rateAmenities: [
      { code: 'WELCOM', name: 'WELCOM DRINKS ON ARRIVAL' },
      { code: 'WIFI', name: 'COMPLIMENTARY HIGH SPEED WI-FI' },
      { code: 'BFST', name: 'BUFFET BREAKFAST (MAP INCLUDED)' }
    ],
    companyAmenities: [
      { code: 'NWSP', name: 'DAILY MORNING NEWSPAPER' },
      { code: 'DROP', name: 'AIRPORT / STATION COURTESY DROP' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:10'
  },
  {
    companyCode: 'COM0001',
    companyName: 'Mahindra & Mahindra Limited',
    tel: '+91 22 2490 1441',
    iata: 'MAHINDRA',
    rateStructure: '101',
    rateDescription: 'Rate for Mahindra & Mahindra Ltd',
    planCode: 'CP',
    currency: 'INR',
    roomType: 'DLX',
    occupancyRates: {
      single: 2600.00,
      double: 3100.00,
      triple: 0.00,
      quadruple: 0.00,
      bedAdult: 900.00,
      bedChild: 0.00
    },
    rateAmenities: [
      { code: 'WELCOM', name: 'WELCOM DRINKS ON ARRIVAL' },
      { code: 'BFST', name: 'CONTINENTAL BREAKFAST (CP)' }
    ],
    companyAmenities: [
      { code: 'WIFI', name: 'COMPLIMENTARY HIGH SPEED WI-FI' }
    ],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '23-FEB-2026 18:05'
  },
  {
    companyCode: 'COM0007',
    companyName: 'Infosys Technologies Limited',
    tel: '+91 80 2852 0261',
    iata: 'INFOSYS',
    rateStructure: '102',
    rateDescription: 'Rate for Infosys Technologies',
    planCode: 'EP',
    currency: 'INR',
    roomType: 'DLX',
    occupancyRates: {
      single: 2400.00,
      double: 2900.00,
      triple: 0.00,
      quadruple: 0.00,
      bedAdult: 600.00,
      bedChild: 0.00
    },
    rateAmenities: [
      { code: 'WIFI', name: 'HIGH SPEED CORPORATE BROADBAND' }
    ],
    companyAmenities: [],
    status: 'Active',
    user: 'MANAGER',
    lastUpdated: '01-JAN-2026 10:30'
  }
];

export const INITIAL_AVAILABLE_AMENITIES = [
  { code: 'WELCOM', name: 'WELCOM DRINKS ON ARRIVAL' },
  { code: 'WIFI', name: 'COMPLIMENTARY HIGH SPEED WI-FI' },
  { code: 'BFST', name: 'BUFFET BREAKFAST (INCLUDED)' },
  { code: 'NWSP', name: 'DAILY MORNING NEWSPAPER' },
  { code: 'DROP', name: 'AIRPORT / STATION COURTESY DROP' },
  { code: 'MNBR', name: 'COMPLIMENTARY SOFT MINIBAR' },
  { code: 'LNDY', name: '2 PIECES DAILY LAUNDRY' },
  { code: 'GYM', name: 'FITNESS CENTRE & POOL ACCESS' }
];

export default function IdsLinkRatesToCompanyModal({
  isOpen,
  onClose,
  initialCompanyCode = 'COM0002',
  accountingDate = '23-FEB-2026',
  onSaveLinkRate
}) {
  const [linksList, setLinksList] = useState(INITIAL_COMPANY_RATE_LINKS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active Link Record
  const [formData, setFormData] = useState(() => {
    const found = INITIAL_COMPANY_RATE_LINKS.find(l => l.companyCode === initialCompanyCode);
    return found || INITIAL_COMPANY_RATE_LINKS[0];
  });

  // Lookup Dialog States
  const [companyLookupOpen, setCompanyLookupOpen] = useState(false);
  const [rateTableLookupOpen, setRateTableLookupOpen] = useState(false);
  const [amenitiesLookupOpen, setAmenitiesLookupOpen] = useState(false);
  const [amenityTarget, setAmenityTarget] = useState('rate'); // 'rate' | 'company'
  const [searchCompTerm, setSearchCompTerm] = useState('');
  const [searchRateTerm, setSearchRateTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Handle company selection
  const handleSelectCompany = (comp) => {
    setFormData(prev => ({
      ...prev,
      companyCode: comp.code,
      companyName: comp.name,
      tel: comp.phone || comp.mobile || '+91 22 6665 8282',
      iata: comp.iata || ''
    }));
    setCompanyLookupOpen(false);
    setStatusMessage(`Selected company ${comp.code} - ${comp.name}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle rate table selection
  const handleSelectRateTable = (table) => {
    const defaultSlab = (table.slabs && table.slabs[0]) || {
      single: 2999.00,
      double: 3499.00,
      triple: 0.00,
      quadruple: 0.00,
      exbAdt: 1500.00,
      exbChild: 0.00
    };

    setFormData(prev => ({
      ...prev,
      rateStructure: table.tableNo,
      rateDescription: table.description,
      planCode: table.planCode || 'MAP',
      currency: table.currencyCode || 'INR',
      roomType: defaultSlab.roomType || 'DLX',
      occupancyRates: {
        single: defaultSlab.single,
        double: defaultSlab.double,
        triple: defaultSlab.triple || 0.00,
        quadruple: defaultSlab.quadruple || 0.00,
        bedAdult: defaultSlab.exbAdt || 1500.00,
        bedChild: defaultSlab.exbChild || 0.00
      }
    }));
    setRateTableLookupOpen(false);
    setStatusMessage(`Linked Rate Table #${table.tableNo} "${table.description}"`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Add Amenity
  const handleAddAmenity = (amenity) => {
    if (amenityTarget === 'rate') {
      if (!formData.rateAmenities.some(a => a.code === amenity.code)) {
        setFormData(prev => ({
          ...prev,
          rateAmenities: [...prev.rateAmenities, amenity]
        }));
      }
    } else {
      if (!formData.companyAmenities.some(a => a.code === amenity.code)) {
        setFormData(prev => ({
          ...prev,
          companyAmenities: [...prev.companyAmenities, amenity]
        }));
      }
    }
    setAmenitiesLookupOpen(false);
  };

  // Remove Amenity
  const handleRemoveAmenity = (code, target) => {
    if (target === 'rate') {
      setFormData(prev => ({
        ...prev,
        rateAmenities: prev.rateAmenities.filter(a => a.code !== code)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        companyAmenities: prev.companyAmenities.filter(a => a.code !== code)
      }));
    }
  };

  // Save
  const handleSave = () => {
    if (!formData.companyCode.trim()) {
      alert('Please select a Company.');
      return;
    }
    if (!formData.rateStructure.trim()) {
      alert('Please select a Rate Structure.');
      return;
    }

    const updatedRecord = {
      ...formData,
      lastUpdated: `${accountingDate} 18:10`
    };

    setLinksList(prev => {
      const exists = prev.some(l => l.companyCode === updatedRecord.companyCode);
      if (exists) {
        return prev.map(l => l.companyCode === updatedRecord.companyCode ? updatedRecord : l);
      }
      return [...prev, updatedRecord];
    });

    setStatusMessage(`Company [${updatedRecord.companyCode}] linked to Rate [${updatedRecord.rateStructure}] successfully!`);
    if (onSaveLinkRate) {
      onSaveLinkRate(updatedRecord);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Previous & Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setFormData(linksList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(linksList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setFormData(linksList[newIdx]);
  };

  // Add new link
  const handleAddNew = () => {
    const newLink = {
      companyCode: 'COM0005',
      companyName: 'Larsen & Toubro Ltd',
      tel: '+91 22 6752 5656',
      iata: '',
      rateStructure: '100',
      rateDescription: 'Rate for Corporate Contract',
      planCode: 'MAP',
      currency: 'INR',
      roomType: 'DLX',
      occupancyRates: {
        single: 2999.00,
        double: 3499.00,
        triple: 0.00,
        quadruple: 0.00,
        bedAdult: 1500.00,
        bedChild: 0.00
      },
      rateAmenities: [
        { code: 'WELCOM', name: 'WELCOM DRINKS ON ARRIVAL' },
        { code: 'WIFI', name: 'COMPLIMENTARY HIGH SPEED WI-FI' }
      ],
      companyAmenities: [],
      status: 'Active',
      user: 'MANAGER',
      lastUpdated: `${accountingDate} 18:10`
    };
    setFormData(newLink);
    setStatusMessage('Select Company & Rate Structure, then click Save.');
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
        {/* Titlebar matching Frame 012 */}
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
            <span>Link Rates to Company V6.5.002.1 — IDS Fortune NEXT PMS</span>
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

        {/* Main Content Body matching Frame 012 & Frame 024 */}
        <div style={{ padding: '14px 18px', fontSize: '11px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
            
            {/* Left Column: Company & Rate Structure Inputs */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 10px', alignItems: 'center' }}>
                
                <span style={{ fontWeight: 600 }}>Company...</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    className="ids-input" 
                    value={formData.companyCode} 
                    onChange={(e) => setFormData(prev => ({ ...prev, companyCode: e.target.value }))}
                    style={{ width: '100px', fontWeight: 700, background: '#FFF7CC' }} 
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '22px' }} 
                    onClick={() => setCompanyLookupOpen(true)}
                    title="Lookup Company"
                  >
                    ?
                  </button>
                </div>

                <span style={{ fontWeight: 600 }}>Com. Name</span>
                <input 
                  className="ids-input" 
                  value={formData.companyName} 
                  readOnly
                  style={{ width: '100%', background: '#F0F0F0', fontWeight: 600 }} 
                />

                <span style={{ fontWeight: 600 }}>Tel #</span>
                <input 
                  className="ids-input" 
                  value={formData.tel || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))}
                  style={{ width: '100%' }} 
                />

                <span style={{ fontWeight: 600 }}>IATA #</span>
                <input 
                  className="ids-input" 
                  value={formData.iata || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, iata: e.target.value }))}
                  style={{ width: '100%' }} 
                />

                <span style={{ fontWeight: 600 }}>Rate Structure</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input 
                    className="ids-input" 
                    value={formData.rateStructure} 
                    onChange={(e) => setFormData(prev => ({ ...prev, rateStructure: e.target.value }))}
                    style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} 
                  />
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '22px' }} 
                    onClick={() => setRateTableLookupOpen(true)}
                    title="Lookup Rate Structure"
                  >
                    ?
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    onClick={() => setRateTableLookupOpen(true)}
                  >
                    <Package size={12} color="#0A246A" /> Package
                  </button>
                </div>

                <span style={{ fontWeight: 600 }}>Description</span>
                <input 
                  className="ids-input" 
                  value={formData.rateDescription} 
                  readOnly
                  style={{ width: '100%', background: '#F0F0F0', fontWeight: 600 }} 
                />

                <span style={{ fontWeight: 600 }}>Amenities</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" placeholder="Select amenities..." style={{ width: '120px' }} />
                  <button 
                    className="ids-btn-classic" 
                    style={{ width: '22px' }}
                    onClick={() => {
                      setAmenityTarget('rate');
                      setAmenitiesLookupOpen(true);
                    }}
                  >
                    ?
                  </button>
                </div>

              </div>

              {/* Table: Amenities for Rate Structure */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '3px' }}>
                  Amenities for Rate Structure:
                </div>
                <div style={{ height: '90px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '2px 4px', textAlign: 'left', width: '70px', borderRight: '1px solid #B0AB9A' }}>Amenities Code</th>
                        <th style={{ padding: '2px 4px', textAlign: 'left' }}>Amenities for Rate Structure</th>
                        <th style={{ padding: '2px 4px', width: '20px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.rateAmenities || []).map((a, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                          <td style={{ padding: '2px 4px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{a.code}</td>
                          <td style={{ padding: '2px 4px' }}>{a.name}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <button 
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#C5221F', fontWeight: 700 }}
                              onClick={() => handleRemoveAmenity(a.code, 'rate')}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Occupancy Tariffs & Company Default Amenities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Top Selectors and Occupancy Table matching Frame 024 */}
              <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 10px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>Room Type</div>
                    <select 
                      className="ids-input" 
                      value={formData.roomType || 'DLX'} 
                      onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                      style={{ width: '80px', fontWeight: 700 }}
                    >
                      <option value="DLX">DLX</option>
                      <option value="EXE">EXE</option>
                      <option value="SUI">SUI</option>
                      <option value="PNH">PNH</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>Plan Code</div>
                    <select 
                      className="ids-input" 
                      value={formData.planCode || 'MAP'} 
                      onChange={(e) => setFormData(prev => ({ ...prev, planCode: e.target.value }))}
                      style={{ width: '80px', fontWeight: 700 }}
                    >
                      <option value="MAP">MAP</option>
                      <option value="CP">CP</option>
                      <option value="EP">EP</option>
                      <option value="AP">AP</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>Currency</div>
                    <select 
                      className="ids-input" 
                      value={formData.currency || 'INR'} 
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      style={{ width: '80px', fontWeight: 700 }}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                {/* Occupancy Tariff Grid */}
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Occupancy</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '90px' }}>Rate</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '60px' }}>Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Single', formData.occupancyRates?.single || 2999.00],
                        ['Double', formData.occupancyRates?.double || 3499.00],
                        ['Triple', formData.occupancyRates?.triple || 0.00],
                        ['Quadruple', formData.occupancyRates?.quadruple || 0.00],
                        ['Bed Adult', formData.occupancyRates?.bedAdult || 1500.00],
                        ['Bed Child', formData.occupancyRates?.bedChild || 0.00]
                      ].map(([occ, rateVal], idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                          <td style={{ padding: '2px 6px', fontWeight: 600, borderRight: '1px solid #E0E0E0' }}>{occ}</td>
                          <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>
                            ₹{rateVal.toFixed(2)}
                          </td>
                          <td style={{ padding: '2px 6px', textAlign: 'right', color: '#666' }}>0.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Default Amenities for Company */}
              <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '8px 10px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: '#0A246A' }}>Default Amenities for Company:</span>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                    onClick={() => {
                      setAmenityTarget('company');
                      setAmenitiesLookupOpen(true);
                    }}
                  >
                    + Add Amenity
                  </button>
                </div>
                <div style={{ height: '75px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '2px 4px', textAlign: 'left', width: '70px', borderRight: '1px solid #B0AB9A' }}>Amenities Code</th>
                        <th style={{ padding: '2px 4px', textAlign: 'left' }}>Default Amenities for Company</th>
                        <th style={{ padding: '2px 4px', width: '20px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.companyAmenities || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '10px', color: '#888' }}>
                            No specific company default amenities assigned.
                          </td>
                        </tr>
                      ) : (
                        formData.companyAmenities.map((a, idx) => (
                          <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
                            <td style={{ padding: '2px 4px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{a.code}</td>
                            <td style={{ padding: '2px 4px' }}>{a.name}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                              <button 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#C5221F', fontWeight: 700 }}
                                onClick={() => handleRemoveAmenity(a.code, 'company')}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Audit Metadata */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Status:</span>
              <select 
                className="ids-input" 
                value={formData.status} 
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                style={{ width: '80px', fontWeight: 700, color: formData.status === 'Active' ? '#137333' : '#C5221F' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>User:</span> <strong>{formData.user || 'MANAGER'}</strong>
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Last Updated:</span> <strong>{formData.lastUpdated || `${accountingDate} 18:10`}</strong>
            </div>
          </div>

          {/* Bottom Action Ribbon matching Frame 012 */}
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
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="ids-btn-classic" onClick={handleAddNew}>Add</button>
              <button className="ids-btn-classic" onClick={() => setStatusMessage('Edit mode active. Change fields and click Save.')}>Modify</button>
              <button className="ids-btn-classic" onClick={() => alert('Delete requires manager permissions.')}>Delete</button>
              <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={() => setCompanyLookupOpen(true)}>Browse</button>
              <button className="ids-btn-classic" onClick={handlePrevious}>Previous</button>
              <button className="ids-btn-classic" onClick={handleNext}>Next</button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                onClick={handleSave}
              >
                Save
              </button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => setCompanyLookupOpen(true)}>Panel...</button>
              <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            LOOKUP MODAL 1: COMPANY LOOKUP
            ========================================================================= */}
        {companyLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setCompanyLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '600px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Company Information - Help V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setCompanyLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Company:</span>
                  <input 
                    className="ids-input" 
                    value={searchCompTerm} 
                    onChange={(e) => setSearchCompTerm(e.target.value)} 
                    placeholder="Search by code or company name..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Company Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '90px' }}>City</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_COMPANIES_DATABASE
                        .filter(c => 
                          c.code.toLowerCase().includes(searchCompTerm.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchCompTerm.toLowerCase())
                        )
                        .map((comp, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => handleSelectCompany(comp)}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{comp.code}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{comp.name}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{comp.city || 'Mumbai'}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 600, color: comp.status === 'Active' ? '#137333' : '#C5221F' }}>{comp.status}</td>
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
            LOOKUP MODAL 2: RATE STRUCTURE LOOKUP
            ========================================================================= */}
        {rateTableLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setRateTableLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Room Rate Master - Help V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setRateTableLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Rate Table:</span>
                  <input 
                    className="ids-input" 
                    value={searchRateTerm} 
                    onChange={(e) => setSearchRateTerm(e.target.value)} 
                    placeholder="Search table # or description..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '55px' }}>Table #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Plan</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Curr</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '65px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_RATE_TABLES
                        .filter(t => 
                          t.tableNo.includes(searchRateTerm) || 
                          t.description.toLowerCase().includes(searchRateTerm.toLowerCase())
                        )
                        .map((tableItem, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => handleSelectRateTable(tableItem)}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{tableItem.tableNo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.description}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.planCode}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.currencyCode}</td>
                            <td style={{ padding: '3px 6px' }}>{tableItem.type}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setRateTableLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP MODAL 3: AMENITIES LOOKUP
            ========================================================================= */}
        {amenitiesLookupOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setAmenitiesLookupOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '480px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Amenities Lookup V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setAmenitiesLookupOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', marginBottom: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_AVAILABLE_AMENITIES.map((amenity, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => handleAddAmenity(amenity)}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{amenity.code}</td>
                          <td style={{ padding: '3px 6px' }}>{amenity.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button className="ids-btn-classic" onClick={() => setAmenitiesLookupOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
