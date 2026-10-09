import React, { useState } from 'react';
import './idsFortuneNext.css';
import { 
  DollarSign, FileText, CheckCircle2, Search, Calendar,
  ChevronLeft, ChevronRight, Save, Plus, Edit, Trash2, X,
  Percent, ShieldCheck, Tag, Copy, Building2
} from 'lucide-react';

/* =========================================================================
   VIDEO 31: HOW TO CREATE COMPANY CONTRACT RATES IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Room Rate Master V6.5.002.1 (Frames 010–075)
   2. Mode Tabs:
      - [ Package ], [ Rate ], [ Non Rack ], [ Exit ]
   3. Main Header Fields (Frames 016 & 030):
      - Property: DEMO / ELITE INN
      - Rate Table #: 100 with [ ? ] lookup
      - Description: Rate for Tata Motors / Mahindra / Corporate Contract
      - Applicable From: 23-FEB-2022
      - Applicable To: 31-MAR-2022
      - Currency: Indian Rupees (INR)
      - Meal Plan: Modified American Plan (MAP) / CP / EP / AP
      - [ ] Include Spl. Rooms
      - [ Copy ] button
   4. Rates Grid Table (Frames 016 & 065):
      - Columns: Room | Single | Double | Triple | Quadruple | Tax | Exb.Adt | Exb.Child | Tax | S M T W T F S
   5. Rate Slab Sub-Dialog: Room Rate Master V6.5.002.1 Add (Frames 030 & 064):
      - Header: Rate - Modified American Plan - Indian Rupees
      - Applies to Room Types checkboxes (DLX, EXE, SUI, PNH, Select all)
      - Single, Double, Triple, Quadruple, Extra Adult, Extra Child rates
      - Tax Structure lookup (798 - Slab, 804 - 12%, 806 - 18%)
      - Applies To Days (Sunday to Saturday, Deselect all)
   6. Tax Structure Lookup Modal (Frame 048): Room Tax Structure V6.5.002.1
   7. Rate Master Browse Lookup Modal (Frame 070): Room Rate Master - Help V6.5.002.1
   ========================================================================= */

export const INITIAL_TAX_STRUCTURES = [
  { applicableFrom: '01-OCT-2019', module: 'FOM', taxStructure: '796', description: 'Oct New Tax Slab with KFC', status: 'Active' },
  { applicableFrom: '01-OCT-2019', module: 'FOM', taxStructure: '798', description: 'Oct New Tax Slab', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '100', description: 'SEZ (IGST) 0%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '101', description: 'SEZ (CGST & SGST) 0%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '798', description: 'Room Tax Structure (Slab)', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '799', description: 'IGST Slab', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '800', description: 'SGST & CGST 0%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '801', description: 'IGST 0%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '802', description: 'SGST & CGST 5%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '803', description: 'IGST 5%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '804', description: 'SGST & CGST 12%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '805', description: 'IGST 12%', status: 'Active' },
  { applicableFrom: '01-JUL-2017', module: 'FOM', taxStructure: '806', description: 'SGST & CGST 18%', status: 'Active' }
];

export const INITIAL_RATE_TABLES = [
  {
    tableNo: '100',
    description: 'Rate for Tata Motors Limited',
    prpCode: 'DEMO',
    applicableFrom: '23-FEB-2022',
    validUpto: '31-MAR-2022',
    mealPlan: 'Modified American Plan',
    planCode: 'MAP',
    currency: 'Indian Rupees',
    currencyCode: 'INR',
    type: 'Non Rack',
    includeSplRooms: false,
    slabs: [
      {
        roomType: 'DLX',
        single: 2999.00,
        double: 3499.00,
        triple: 3999.00,
        quadruple: 4499.00,
        tax: '798',
        exbAdt: 800.00,
        exbChild: 500.00,
        exbTax: '798',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      },
      {
        roomType: 'EXE',
        single: 3999.00,
        double: 4499.00,
        triple: 4999.00,
        quadruple: 5499.00,
        tax: '798',
        exbAdt: 1000.00,
        exbChild: 600.00,
        exbTax: '798',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      },
      {
        roomType: 'SUI',
        single: 7499.00,
        double: 7499.00,
        triple: 8499.00,
        quadruple: 9499.00,
        tax: '798',
        exbAdt: 1500.00,
        exbChild: 800.00,
        exbTax: '798',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      }
    ]
  },
  {
    tableNo: '101',
    description: 'Rate for Mahindra & Mahindra Ltd',
    prpCode: 'DEMO',
    applicableFrom: '01-JAN-2022',
    validUpto: '31-DEC-2022',
    mealPlan: 'Continental Plan',
    planCode: 'CP',
    currency: 'Indian Rupees',
    currencyCode: 'INR',
    type: 'Non Rack',
    includeSplRooms: false,
    slabs: [
      {
        roomType: 'DLX',
        single: 2600.00,
        double: 3100.00,
        triple: 3600.00,
        quadruple: 4100.00,
        tax: '804',
        exbAdt: 700.00,
        exbChild: 400.00,
        exbTax: '804',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      },
      {
        roomType: 'EXE',
        single: 3600.00,
        double: 4100.00,
        triple: 4600.00,
        quadruple: 5100.00,
        tax: '804',
        exbAdt: 900.00,
        exbChild: 500.00,
        exbTax: '804',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      }
    ]
  },
  {
    tableNo: '102',
    description: 'Rate for Infosys Technologies',
    prpCode: 'DEMO',
    applicableFrom: '01-JAN-2022',
    validUpto: '31-DEC-2022',
    mealPlan: 'European Plan',
    planCode: 'EP',
    currency: 'Indian Rupees',
    currencyCode: 'INR',
    type: 'Non Rack',
    includeSplRooms: false,
    slabs: [
      {
        roomType: 'DLX',
        single: 2400.00,
        double: 2900.00,
        triple: 3400.00,
        quadruple: 3900.00,
        tax: '804',
        exbAdt: 600.00,
        exbChild: 300.00,
        exbTax: '804',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      }
    ]
  }
];

export default function IdsCompanyContractRatesModal({
  isOpen,
  onClose,
  initialTableNo = '100',
  accountingDate = '23-FEB-2022',
  onSaveContractRate
}) {
  const [rateTablesList, setRateTablesList] = useState(INITIAL_RATE_TABLES);
  const [activeTab, setActiveTab] = useState('Non Rack'); // 'Package' | 'Rate' | 'Non Rack'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active Rate Table Form
  const [selectedTable, setSelectedTable] = useState(() => {
    const found = INITIAL_RATE_TABLES.find(r => r.tableNo === initialTableNo);
    return found || INITIAL_RATE_TABLES[0];
  });

  // Modal dialog states
  const [addSlabModalOpen, setAddSlabModalOpen] = useState(false);
  const [browseTableModalOpen, setBrowseTableModalOpen] = useState(false);
  const [taxLookupModalOpen, setTaxLookupModalOpen] = useState(false);
  const [taxTargetField, setTaxTargetField] = useState('tax'); // 'tax' | 'exbTax'
  const [searchTableTerm, setSearchTableTerm] = useState('');
  const [searchTaxTerm, setSearchTaxTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Add/Edit Slab Form State matching Frame 030 & Frame 064
  const [slabForm, setSlabForm] = useState({
    selectedRoomTypes: { DLX: true, EXE: false, SUI: false, PNH: false },
    single: 2999.00,
    double: 3499.00,
    triple: 3999.00,
    quadruple: 4499.00,
    tax: '798',
    exbAdt: 800.00,
    exbChild: 500.00,
    exbTax: '798',
    days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
  });

  if (!isOpen) return null;

  const handleTableFieldChange = (field, value) => {
    setSelectedTable(prev => ({ ...prev, [field]: value }));
  };

  // Open add slab dialog
  const handleOpenAddSlab = (existingSlab = null) => {
    if (existingSlab) {
      setSlabForm({
        selectedRoomTypes: { [existingSlab.roomType]: true },
        single: existingSlab.single,
        double: existingSlab.double,
        triple: existingSlab.triple,
        quadruple: existingSlab.quadruple,
        tax: existingSlab.tax,
        exbAdt: existingSlab.exbAdt,
        exbChild: existingSlab.exbChild,
        exbTax: existingSlab.exbTax,
        days: existingSlab.days || { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      });
    } else {
      setSlabForm({
        selectedRoomTypes: { DLX: true, EXE: false, SUI: false, PNH: false },
        single: 2999.00,
        double: 3499.00,
        triple: 3999.00,
        quadruple: 4499.00,
        tax: '798',
        exbAdt: 800.00,
        exbChild: 500.00,
        exbTax: '798',
        days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
      });
    }
    setAddSlabModalOpen(true);
  };

  // Commit Slab to active Table
  const handleSaveSlab = () => {
    const activeRoomTypes = Object.entries(slabForm.selectedRoomTypes)
      .filter(([_, isChecked]) => isChecked)
      .map(([code]) => code);

    if (activeRoomTypes.length === 0) {
      alert('Please select at least one Room Type.');
      return;
    }

    const newSlabs = activeRoomTypes.map(roomType => ({
      roomType,
      single: parseFloat(slabForm.single) || 0,
      double: parseFloat(slabForm.double) || 0,
      triple: parseFloat(slabForm.triple) || 0,
      quadruple: parseFloat(slabForm.quadruple) || 0,
      tax: slabForm.tax || '798',
      exbAdt: parseFloat(slabForm.exbAdt) || 0,
      exbChild: parseFloat(slabForm.exbChild) || 0,
      exbTax: slabForm.exbTax || '798',
      days: slabForm.days
    }));

    setSelectedTable(prev => {
      // Remove overlapping roomTypes and add new ones
      const existing = (prev.slabs || []).filter(s => !activeRoomTypes.includes(s.roomType));
      return {
        ...prev,
        slabs: [...existing, ...newSlabs]
      };
    });

    setAddSlabModalOpen(false);
    setStatusMessage(`Added rate slab for ${activeRoomTypes.join(', ')} successfully!`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Commit Whole Rate Table to Database
  const handleSaveRateTable = () => {
    if (!selectedTable.tableNo.trim()) {
      alert('Please enter Rate Table #.');
      return;
    }
    if (!selectedTable.description.trim()) {
      alert('Please enter Rate Table Description.');
      return;
    }

    setRateTablesList(prev => {
      const exists = prev.some(t => t.tableNo === selectedTable.tableNo);
      if (exists) {
        return prev.map(t => t.tableNo === selectedTable.tableNo ? selectedTable : t);
      }
      return [...prev, selectedTable];
    });

    setStatusMessage(`Rate Table #${selectedTable.tableNo} "${selectedTable.description}" saved successfully!`);
    if (onSaveContractRate) {
      onSaveContractRate(selectedTable);
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Previous & Next
  const handlePrevious = () => {
    const newIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIdx);
    setSelectedTable(rateTablesList[newIdx]);
  };

  const handleNext = () => {
    const newIdx = Math.min(rateTablesList.length - 1, currentIndex + 1);
    setCurrentIndex(newIdx);
    setSelectedTable(rateTablesList[newIdx]);
  };

  // Clear / New Table
  const handleClearNew = () => {
    const newTable = {
      tableNo: (rateTablesList.length + 100).toString(),
      description: '',
      prpCode: 'DEMO',
      applicableFrom: accountingDate,
      validUpto: '31-DEC-2022',
      mealPlan: 'Modified American Plan',
      planCode: 'MAP',
      currency: 'Indian Rupees',
      currencyCode: 'INR',
      type: 'Non Rack',
      includeSplRooms: false,
      slabs: []
    };
    setSelectedTable(newTable);
    setStatusMessage('Enter new Rate Table details, click Add to define room slabs, then click Save.');
  };

  return (
    <div className="ids-modal-overlay">
      <div 
        className="ids-dialog-window" 
        style={{ 
          width: '740px', 
          maxWidth: '96vw', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.65)', 
          border: '2px outset #ECE9D8',
          background: '#ECE9D8'
        }}
      >
        {/* Titlebar matching Frame 010 */}
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
            <DollarSign size={14} />
            <span>Room Rate Master V6.5.002.1 — Company Contract Rates</span>
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

        {/* Mode Selector Tabs matching Frame 010 */}
        <div style={{ background: '#D4D0C8', borderBottom: '1px solid #716F64', padding: '4px 10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button 
            className="ids-btn-classic" 
            style={{ fontWeight: activeTab === 'Package' ? 700 : 500, background: activeTab === 'Package' ? '#FFF' : '#ECE9D8' }}
            onClick={() => setActiveTab('Package')}
          >
            Package
          </button>
          <button 
            className="ids-btn-classic" 
            style={{ fontWeight: activeTab === 'Rate' ? 700 : 500, background: activeTab === 'Rate' ? '#FFF' : '#ECE9D8' }}
            onClick={() => setActiveTab('Rate')}
          >
            Rate
          </button>
          <button 
            className="ids-btn-classic" 
            style={{ fontWeight: activeTab === 'Non Rack' ? 700 : 500, background: activeTab === 'Non Rack' ? '#FFF' : '#ECE9D8', borderBottom: activeTab === 'Non Rack' ? '2px solid #0A246A' : 'none' }}
            onClick={() => setActiveTab('Non Rack')}
          >
            Non Rack
          </button>
          <button className="ids-btn-classic" onClick={onClose} style={{ marginLeft: 'auto' }}>
            Exit
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div style={{ background: '#E6F4EA', borderBottom: '1px solid #137333', color: '#137333', padding: '4px 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main Content Body matching Frame 016 */}
        <div style={{ padding: '12px 16px', fontSize: '11px' }}>
          
          {/* Upper Form Section */}
          <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 14px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 200px 110px 1fr', gap: '8px 12px', alignItems: 'center' }}>
              
              <span style={{ fontWeight: 600 }}>Property</span>
              <select 
                className="ids-input" 
                value={selectedTable.prpCode} 
                onChange={(e) => handleTableFieldChange('prpCode', e.target.value)}
                style={{ width: '100%', fontWeight: 600 }}
              >
                <option value="DEMO">DEMO</option>
                <option value="ELITE">HOTEL ELITE INN</option>
              </select>

              <span style={{ fontWeight: 600 }}>Applicable From</span>
              <input 
                className="ids-input" 
                value={selectedTable.applicableFrom} 
                onChange={(e) => handleTableFieldChange('applicableFrom', e.target.value)}
                style={{ width: '130px' }}
              />

              <span style={{ fontWeight: 600 }}>Rate Table #</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={selectedTable.tableNo} 
                  onChange={(e) => handleTableFieldChange('tableNo', e.target.value)}
                  style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }}
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ width: '22px' }} 
                  onClick={() => setBrowseTableModalOpen(true)}
                  title="Open Rate Master Help Browser (Frame 070)"
                >
                  ?
                </button>
              </div>

              <span style={{ fontWeight: 600 }}>Applicable To</span>
              <input 
                className="ids-input" 
                value={selectedTable.validUpto} 
                onChange={(e) => handleTableFieldChange('validUpto', e.target.value)}
                style={{ width: '130px' }}
              />

              <span style={{ fontWeight: 600 }}>Description</span>
              <input 
                className="ids-input" 
                value={selectedTable.description} 
                onChange={(e) => handleTableFieldChange('description', e.target.value)}
                placeholder="e.g. Rate for Tata Motors Limited"
                style={{ width: '100%', fontWeight: 600 }}
              />

              <span style={{ fontWeight: 600 }}>Currency</span>
              <select 
                className="ids-input" 
                value={selectedTable.currency} 
                onChange={(e) => handleTableFieldChange('currency', e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="Indian Rupees">Indian Rupees (INR)</option>
                <option value="US Dollars">US Dollars (USD)</option>
                <option value="Euro">Euro (EUR)</option>
              </select>

              <span style={{ fontWeight: 600 }}>Meal Plan</span>
              <select 
                className="ids-input" 
                value={selectedTable.mealPlan} 
                onChange={(e) => handleTableFieldChange('mealPlan', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Modified American Plan">Modified American Plan (MAP)</option>
                <option value="Continental Plan">Continental Plan (CP)</option>
                <option value="European Plan">European Plan (EP)</option>
                <option value="American Plan">American Plan (AP)</option>
              </select>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedTable.includeSplRooms || false}
                    onChange={(e) => handleTableFieldChange('includeSplRooms', e.target.checked)}
                  />
                  <span>Include Spl. Rooms</span>
                </label>
                <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={() => alert('Copy rate table settings dialog.')}>
                  Copy
                </button>
              </div>

            </div>
          </div>

          {/* Rates Grid Table matching Frames 016 & 065 */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: '#0A246A' }}>Contract Room Tariffs & Tax Structure:</span>
              <button 
                className="ids-btn-classic" 
                style={{ background: '#FFF7CC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleOpenAddSlab()}
              >
                <Plus size={12} /> Add Room Tariff Slab (Frame 030)
              </button>
            </div>

            <div style={{ height: '170px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                  <tr>
                    <th style={{ padding: '3px 4px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Room</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '60px' }}>Single</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '60px' }}>Double</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '60px' }}>Triple</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '60px' }}>Quad</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '45px' }}>Tax</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '55px' }}>Exb.Adt</th>
                    <th style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #B0AB9A', width: '55px' }}>Exb.Chd</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #B0AB9A', width: '45px' }}>Tax</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', width: '80px' }}>Days</th>
                    <th style={{ padding: '3px 4px', textAlign: 'center', width: '40px' }}>Act</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTable.slabs || []).length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                        No rate slabs defined for this contract table. Click <strong>[ Add Room Tariff Slab ]</strong> above.
                      </td>
                    </tr>
                  ) : (
                    selectedTable.slabs.map((slab, idx) => (
                      <tr 
                        key={idx}
                        style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}
                      >
                        <td style={{ padding: '3px 4px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{slab.roomType}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.single.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.double.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.triple.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.quadruple.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #E0E0E0', fontWeight: 600, color: '#137333' }}>{slab.tax}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.exbAdt.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', borderRight: '1px solid #E0E0E0' }}>₹{slab.exbChild.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #E0E0E0', fontWeight: 600, color: '#137333' }}>{slab.exbTax}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center', fontSize: '9px', fontWeight: 700, letterSpacing: '1px' }}>
                          SMTWTFS
                        </td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>
                          <button 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={() => handleOpenAddSlab(slab)}
                            title="Edit Slab"
                          >
                            <Edit size={12} color="#0A246A" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Toolbar matching Frame 016 */}
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
              <button className="ids-btn-classic" style={{ fontWeight: 700 }} onClick={handleSaveRateTable}>Save</button>
              <button className="ids-btn-classic" onClick={() => setBrowseTableModalOpen(true)}>Search</button>
              <button className="ids-btn-classic" onClick={handlePrevious}>Previous</button>
              <button className="ids-btn-classic" onClick={handleNext}>Next</button>
              <button className="ids-btn-classic" onClick={() => setBrowseTableModalOpen(true)}>Panel</button>
              <button className="ids-btn-classic" onClick={handleClearNew}>Clear</button>
            </div>

            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
          </div>

        </div>

        {/* =========================================================================
            SUB-DIALOG: ROOM RATE MASTER V6.5.002.1 ADD (Frame 030 & Frame 064)
            ========================================================================= */}
        {addSlabModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => setAddSlabModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ 
                width: '600px', 
                maxWidth: '94vw', 
                background: '#ECE9D8', 
                border: '2px outset #ECE9D8', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.65)' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar */}
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
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Room Rate Master V6.5.002.1 Add</span>
                <button className="ids-win-btn close" onClick={() => setAddSlabModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A246A', marginBottom: '8px' }}>
                  Rate - {selectedTable.mealPlan} - {selectedTable.currency}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: '10px' }}>
                  
                  {/* Room Types selection */}
                  <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '6px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid #E0E0E0', paddingBottom: '3px', marginBottom: '4px' }}>
                      Applies to Room Types
                    </div>
                    {['DLX', 'EXE', 'PNH', 'SUI'].map(rt => (
                      <label key={rt} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={slabForm.selectedRoomTypes[rt] || false}
                          onChange={(e) => setSlabForm(prev => ({
                            ...prev,
                            selectedRoomTypes: { ...prev.selectedRoomTypes, [rt]: e.target.checked }
                          }))}
                        />
                        <span style={{ fontWeight: 600 }}>{rt}</span>
                      </label>
                    ))}
                    <div style={{ borderTop: '1px solid #E0E0E0', marginTop: '6px', paddingTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '10px' }}>
                        <input 
                          type="checkbox"
                          onChange={(e) => {
                            const val = e.target.checked;
                            setSlabForm(prev => ({
                              ...prev,
                              selectedRoomTypes: { DLX: val, EXE: val, PNH: val, SUI: val }
                            }));
                          }}
                        />
                        <span>Select all RoomType</span>
                      </label>
                    </div>
                  </div>

                  {/* Rates inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Single</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.single} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, single: e.target.value }))}
                      style={{ fontWeight: 700 }}
                    />

                    <span style={{ fontWeight: 600 }}>Double</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.double} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, double: e.target.value }))}
                      style={{ fontWeight: 700 }}
                    />

                    <span style={{ fontWeight: 600 }}>Triple</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.triple} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, triple: e.target.value }))}
                    />

                    <span style={{ fontWeight: 600 }}>Quadruple</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.quadruple} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, quadruple: e.target.value }))}
                    />

                    <span style={{ fontWeight: 600 }}>Tax Structure</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        className="ids-input" 
                        value={slabForm.tax} 
                        onChange={(e) => setSlabForm(prev => ({ ...prev, tax: e.target.value }))}
                        style={{ width: '60px', fontWeight: 700, background: '#FFF7CC' }}
                      />
                      <button 
                        className="ids-btn-classic" 
                        style={{ width: '22px' }} 
                        onClick={() => {
                          setTaxTargetField('tax');
                          setTaxLookupModalOpen(true);
                        }}
                      >
                        ?
                      </button>
                    </div>

                    <span style={{ fontWeight: 600 }}>Extra Adult</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.exbAdt} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, exbAdt: e.target.value }))}
                    />

                    <span style={{ fontWeight: 600 }}>Extra Child</span>
                    <input 
                      className="ids-input" 
                      type="number"
                      value={slabForm.exbChild} 
                      onChange={(e) => setSlabForm(prev => ({ ...prev, exbChild: e.target.value }))}
                    />

                    <span style={{ fontWeight: 600 }}>Tax Structure</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        className="ids-input" 
                        value={slabForm.exbTax} 
                        onChange={(e) => setSlabForm(prev => ({ ...prev, exbTax: e.target.value }))}
                        style={{ width: '60px', fontWeight: 700, background: '#FFF7CC' }}
                      />
                      <button 
                        className="ids-btn-classic" 
                        style={{ width: '22px' }} 
                        onClick={() => {
                          setTaxTargetField('exbTax');
                          setTaxLookupModalOpen(true);
                        }}
                      >
                        ?
                      </button>
                    </div>
                  </div>

                  {/* Applies to days of week */}
                  <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '6px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid #E0E0E0', paddingBottom: '3px', marginBottom: '4px' }}>
                      Applies To
                    </div>
                    {[
                      ['sun', 'Sunday'],
                      ['mon', 'Monday'],
                      ['tue', 'Tuesday'],
                      ['wed', 'Wednesday'],
                      ['thu', 'Thursday'],
                      ['fri', 'Friday'],
                      ['sat', 'Saturday']
                    ].map(([dayKey, dayLabel]) => (
                      <label key={dayKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={slabForm.days[dayKey] !== false}
                          onChange={(e) => setSlabForm(prev => ({
                            ...prev,
                            days: { ...prev.days, [dayKey]: e.target.checked }
                          }))}
                        />
                        <span>{dayLabel}</span>
                      </label>
                    ))}
                    <div style={{ borderTop: '1px solid #E0E0E0', marginTop: '6px', paddingTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '10px' }}>
                        <input 
                          type="checkbox"
                          onChange={(e) => {
                            const val = !e.target.checked;
                            setSlabForm(prev => ({
                              ...prev,
                              days: { sun: val, mon: val, tue: val, wed: val, thu: val, fri: val, sat: val }
                            }));
                          }}
                        />
                        <span>Deselect all days</span>
                      </label>
                    </div>
                  </div>

                </div>

                {/* Subdialog footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px', background: '#DCE6F1' }}
                    onClick={handleSaveSlab}
                  >
                    Ok
                  </button>
                  <button 
                    className="ids-btn-classic" 
                    style={{ minWidth: '60px' }}
                    onClick={() => setAddSlabModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FRAME 048: ROOM TAX STRUCTURE V6.5.002.1 LOOKUP MODAL
            ========================================================================= */}
        {taxLookupModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1700 }} onClick={() => setTaxLookupModalOpen(false)}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '580px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Room Tax Structure V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => setTaxLookupModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Tax:</span>
                  <input 
                    className="ids-input" 
                    value={searchTaxTerm} 
                    onChange={(e) => setSearchTaxTerm(e.target.value)} 
                    placeholder="Search tax structure or description..."
                    style={{ flex: 1, padding: '2px 6px' }}
                    autoFocus
                  />
                </div>

                <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '90px' }}>Applicable From</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '50px' }}>Module</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Tax Structure</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Description</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '60px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_TAX_STRUCTURES
                        .filter(t => 
                          t.taxStructure.includes(searchTaxTerm) || 
                          t.description.toLowerCase().includes(searchTaxTerm.toLowerCase())
                        )
                        .map((taxItem, idx) => (
                          <tr 
                            key={idx}
                            onClick={() => {
                              setSlabForm(prev => ({ ...prev, [taxTargetField]: taxItem.taxStructure }));
                              setTaxLookupModalOpen(false);
                            }}
                            style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                          >
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{taxItem.applicableFrom}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{taxItem.module}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{taxItem.taxStructure}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{taxItem.description}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 600, color: '#137333' }}>{taxItem.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => setTaxLookupModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FRAME 070: ROOM RATE MASTER - HELP V6.5.002.1 LOOKUP MODAL
            ========================================================================= */}
        {browseTableModalOpen && (
          <div className="ids-modal-overlay" style={{ zIndex: 1650 }} onClick={() => setBrowseTableModalOpen(false)}>
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
                <button className="ids-win-btn close" onClick={() => setBrowseTableModalOpen(false)}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Search size={14} />
                  <span style={{ fontWeight: 600 }}>Filter Table:</span>
                  <input 
                    className="ids-input" 
                    value={searchTableTerm} 
                    onChange={(e) => setSearchTableTerm(e.target.value)} 
                    placeholder="Search table number or description..."
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
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '60px' }}>Prp. Code</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Appli. Date</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '80px' }}>Valid Upto</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '45px' }}>Plan</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A', width: '45px' }}>Currency</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '65px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateTablesList
                        .filter(t => 
                          t.tableNo.includes(searchTableTerm) || 
                          t.description.toLowerCase().includes(searchTableTerm.toLowerCase())
                        )
                        .map((tableItem, idx) => {
                          const isSelected = selectedTable.tableNo === tableItem.tableNo;
                          return (
                            <tr 
                              key={idx}
                              onClick={() => setSelectedTable(tableItem)}
                              onDoubleClick={() => {
                                setSelectedTable(tableItem);
                                setBrowseTableModalOpen(false);
                              }}
                              style={{ 
                                background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F9F9F9',
                                color: isSelected ? '#FFF' : '#000',
                                cursor: 'pointer',
                                borderBottom: '1px solid #E0E0E0'
                              }}
                            >
                              <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{tableItem.tableNo}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.description}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.prpCode}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.applicableFrom}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.validUpto}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.planCode}</td>
                              <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{tableItem.currencyCode}</td>
                              <td style={{ padding: '3px 6px' }}>{tableItem.type}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button 
                    className="ids-btn-classic" 
                    style={{ fontWeight: 700, minWidth: '70px' }}
                    onClick={() => setBrowseTableModalOpen(false)}
                  >
                    Select
                  </button>
                  <button className="ids-btn-classic" onClick={() => setBrowseTableModalOpen(false)}>
                    Cancel
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
