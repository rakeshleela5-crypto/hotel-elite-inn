import React, { useState, useMemo } from 'react';
import './idsFortuneNext.css';
import { 
  Package, Sparkles, DollarSign, Calendar, Check, 
  X, Plus, Trash2, Search, CheckCircle2, ShieldCheck, 
  Coffee, Utensils, Car, Compass, Scissors, LayoutGrid, ArrowRight
} from 'lucide-react';

/* =========================================================================
   VIDEO 40: HOW TO CREATE / SELL PACKAGE RATES IN IDS 6.5 & 7.0 SOFTWARE
   Authentic 1:1 Windows Desktop Replica of IDS Fortune NEXT PMS
   Replication of:
   1. Window Title: Room Rate Master V6.5.002.1 — PACKAGE Tab (Frames 010–060)
   2. Entry Points:
      - Setup.. -> Create / Sell Package Rates (Room Rate Master)
      - Reservations.. -> Sell Package Rates (Room Booking / Walk-In)
      - Quick Scan (Load Pgm) -> Type "package rate" -> [ Load ]
      - 44-Video Tutorial Player -> Video 40 -> Launch Interactive Feature Clone
   3. Phase 1: Package Creation in Room Rate Master (Frames 018–060):
      - Property: DEM | Package ID: 10 with [ ? ] lookup
      - Description: Corporate Executive Package (3N/4D)
      - Applicable From: 13-MAR-2026 to 31-DEC-2026
      - Room Type: DLX / EXE / SUI | Occupancy: DOUBLE (2 Adults, 0 Child)
      - Days: 4, Nights: 3 | Currency: INR
      - Package Plan Dialog: Plan AP (American Plan - ₹1,500.00/day)
      - Services Inclusions Dialog:
        * CAM (Sightseeing / City Tour) - ₹2,000.00
        * DSP (Dinner & Spa Voucher) - ₹3,500.00
        * TRV (Airport Luxury Pickup & Drop) - ₹1,200.00
      - Total Package Calculated: ₹14,500.00
      - [ Add ], [ Modify ], [ Delete ], [ Browse ], [ Save ], [ Panel ], [ Exit ]
   4. Phase 2: Sell Package Rates in Walk-in / Booking (Frames 076–096):
      - Package Selection & Package Help Dialog
      - Attaching Package 10 to Room 203 for Guest "Mr Abhinash Sah"
      - Live Sync: Room 203 turns Occupied (Orange: 203 O/DLX Abhinash Sah) in Room Status Rack!
   ========================================================================= */

export const INITIAL_PACKAGES_DATABASE = [
  {
    packageId: '10',
    property: 'DEM',
    description: 'Corporate Executive Package (3N/4D)',
    applicableFrom: '13-MAR-2026',
    applicableTo: '31-DEC-2026',
    roomType: 'DLX',
    occupancyType: 'DOUBLE',
    adultPax: 2,
    childPax: 0,
    days: 4,
    nights: 3,
    currency: 'INR',
    planCode: 'AP',
    planName: 'American Plan (All Meals)',
    planAmount: 1500.00,
    roomTariffPerNight: 2800.00,
    taxInclusive: false,
    services: [
      { code: 'CAM', name: 'Sightseeing / Guided City Tour', rateType: 'Flat', pax: 2, amount: 2000.00 },
      { code: 'DSP', name: 'Dinner & Spa Access Pass', rateType: 'Flat', pax: 2, amount: 3500.00 },
      { code: 'TRV', name: 'Airport Pickup & Drop (Luxury Cab)', rateType: 'Flat', pax: 2, amount: 1200.00 }
    ],
    totalPackageAmount: 14500.00
  },
  {
    packageId: '5',
    property: 'DEM',
    description: 'Honeymoon Suite Royale Package (2N/3D)',
    applicableFrom: '13-MAR-2026',
    applicableTo: '31-DEC-2026',
    roomType: 'SUI',
    occupancyType: 'DOUBLE',
    adultPax: 2,
    childPax: 0,
    days: 3,
    nights: 2,
    currency: 'INR',
    planCode: 'MAP',
    planName: 'Modified American Plan',
    planAmount: 1800.00,
    roomTariffPerNight: 5500.00,
    taxInclusive: false,
    services: [
      { code: 'DSP', name: 'Candlelight Dinner & Wine Bottle', rateType: 'Flat', pax: 2, amount: 4500.00 },
      { code: 'TRV', name: 'Airport Pickup & Drop', rateType: 'Flat', pax: 2, amount: 1500.00 }
    ],
    totalPackageAmount: 19800.00
  },
  {
    packageId: '3',
    property: 'DEM',
    description: 'Weekend Getaway Deluxe Package (1N/2D)',
    applicableFrom: '11-MAR-2026',
    applicableTo: '31-DEC-2026',
    roomType: 'DLX',
    occupancyType: 'SINGLE',
    adultPax: 1,
    childPax: 0,
    days: 2,
    nights: 1,
    currency: 'INR',
    planCode: 'CP',
    planName: 'Continental Plan',
    planAmount: 600.00,
    roomTariffPerNight: 2800.00,
    taxInclusive: false,
    services: [
      { code: 'MIB', name: 'Complimentary Minibar & Fruit Platter', rateType: 'Flat', pax: 1, amount: 800.00 }
    ],
    totalPackageAmount: 4200.00
  }
];

export default function IdsPackageRatesModal({
  isOpen,
  onClose,
  initialMode = 'create', // 'create' | 'sell'
  accountingDate = '13-MAR-2026',
  onPackageBookingComplete,
  onOpenRoomRack
}) {
  const [activeTab, setActiveTab] = useState(initialMode === 'sell' ? 'sellPackage' : 'packageMaster'); // 'packageMaster' | 'sellPackage' | 'completed'
  const [packagesList, setPackagesList] = useState(INITIAL_PACKAGES_DATABASE);
  const [selectedPackage, setSelectedPackage] = useState(INITIAL_PACKAGES_DATABASE[0]);

  // Master Form Editor State
  const [packageId, setPackageId] = useState('10');
  const [description, setDescription] = useState('Corporate Executive Package (3N/4D)');
  const [applicableFrom, setApplicableFrom] = useState('13-MAR-2026');
  const [applicableTo, setApplicableTo] = useState('31-DEC-2026');
  const [roomType, setRoomType] = useState('DLX');
  const [occupancyType, setOccupancyType] = useState('DOUBLE');
  const [adultPax, setAdultPax] = useState(2);
  const [childPax, setChildPax] = useState(0);
  const [days, setDays] = useState(4);
  const [nights, setNights] = useState(3);
  const [planCode, setPlanCode] = useState('AP');
  const [planAmount, setPlanAmount] = useState(1500.00);
  const [roomTariffPerNight, setRoomTariffPerNight] = useState(2800.00);
  const [servicesList, setServicesList] = useState(INITIAL_PACKAGES_DATABASE[0].services);

  // Sub-Modals
  const [packagePlanModalOpen, setPackagePlanModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [packageLookupOpen, setPackageLookupOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Sell Package Flow States (Frames 076–096)
  const [sellRoomNo, setSellRoomNo] = useState('203');
  const [sellGuestTitle, setSellGuestTitle] = useState('Mr');
  const [sellGuestName, setSellGuestName] = useState('Abhinash Sah');
  const [sellMobile, setSellMobile] = useState('09876543210');
  const [sellSelectedPkg, setSellSelectedPkg] = useState(INITIAL_PACKAGES_DATABASE[0]);
  const [sellPkgLookupOpen, setSellPkgLookupOpen] = useState(false);

  if (!isOpen) return null;

  // Calculate Total Package Amount
  const computedTotal = (nights * roomTariffPerNight) + (nights * planAmount) + servicesList.reduce((sum, s) => sum + s.amount, 0);

  // Save Package in Master
  const handleSavePackageMaster = () => {
    const newPkg = {
      packageId,
      property: 'DEM',
      description,
      applicableFrom,
      applicableTo,
      roomType,
      occupancyType,
      adultPax,
      childPax,
      days,
      nights,
      currency: 'INR',
      planCode,
      planName: planCode === 'AP' ? 'American Plan (All Meals)' : planCode === 'MAP' ? 'Modified American Plan' : 'Continental Plan',
      planAmount,
      roomTariffPerNight,
      taxInclusive: false,
      services: servicesList,
      totalPackageAmount: computedTotal
    };

    setPackagesList(prev => {
      const idx = prev.findIndex(p => p.packageId === packageId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newPkg;
        return copy;
      }
      return [newPkg, ...prev];
    });

    setSelectedPackage(newPkg);
    setStatusMessage(`Package #${packageId} ("${description}") saved successfully into Room Rate Master!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Sell Package to In-House / Walk-in Room (Frame 096)
  const handleConfirmSellPackage = () => {
    setActiveTab('completed');

    const bookingRecord = {
      roomNo: sellRoomNo,
      roomType: sellSelectedPkg.roomType,
      guestName: `${sellGuestTitle} ${sellGuestName}`,
      packageId: sellSelectedPkg.packageId,
      packageName: sellSelectedPkg.description,
      pax: sellSelectedPkg.adultPax,
      nights: sellSelectedPkg.nights,
      rate: sellSelectedPkg.totalPackageAmount,
      planCode: sellSelectedPkg.planCode,
      arrival: `${accountingDate} 18:05`,
      departure: '16-MAR-2026 12:00'
    };

    if (onPackageBookingComplete) {
      onPackageBookingComplete(bookingRecord);
    }
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
        {/* Titlebar matching Video 40 Frame 018 */}
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
            <Package size={14} />
            <span>Room Rate Master V6.5.002.1 — Create / Sell Package Rates</span>
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

        {/* Main Mode Navigation Bar matching Frame 018 Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '6px 12px 0 12px', background: '#D4D0C8', borderBottom: '1px solid #999' }}>
          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: 700, 
              background: activeTab === 'packageMaster' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'packageMaster' ? '2px solid #ECE9D8' : '1px solid #808080'
            }}
            onClick={() => setActiveTab('packageMaster')}
          >
            Package Rate Master (Setup)
          </button>
          <button 
            className="ids-btn-classic" 
            style={{ 
              fontWeight: 700, 
              background: activeTab === 'sellPackage' ? '#ECE9D8' : '#D4D0C8',
              borderBottom: activeTab === 'sellPackage' ? '2px solid #ECE9D8' : '1px solid #808080'
            }}
            onClick={() => setActiveTab('sellPackage')}
          >
            Sell Package (Room Booking / Walk-In)
          </button>
        </div>

        {/* =========================================================================
            MODE 1: PACKAGE MASTER CONFIGURATION CONSOLE (Frames 018–060)
            ========================================================================= */}
        {activeTab === 'packageMaster' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            {/* Header Form Controls matching Frame 018 */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 14px', marginBottom: '10px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '90px 130px 90px 1fr', gap: '6px 10px', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Property</span>
                <input className="ids-input" value="DEM" readOnly style={{ width: '70px', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Package ID</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" value={packageId} onChange={(e) => setPackageId(e.target.value)} style={{ width: '60px', fontWeight: 700, background: '#FFF7CC' }} />
                  <button className="ids-btn-classic" style={{ width: '22px' }} onClick={() => setPackageLookupOpen(true)}>?</button>
                  <button className="ids-btn-classic" onClick={() => alert('Package copied to new ID')}>Copy</button>
                </div>

                <span style={{ fontWeight: 600 }}>Description</span>
                <input className="ids-input" value={description} onChange={(e) => setDescription(e.target.value)} style={{ gridColumn: 'span 3', width: '100%', fontWeight: 700 }} />

                <span style={{ fontWeight: 600 }}>Applicable From</span>
                <input className="ids-input" value={applicableFrom} onChange={(e) => setApplicableFrom(e.target.value)} style={{ width: '110px' }} />

                <span style={{ fontWeight: 600 }}>Applicable To</span>
                <input className="ids-input" value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)} style={{ width: '110px' }} />

                <span style={{ fontWeight: 600 }}>Room Type</span>
                <select className="ids-input" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ width: '90px', fontWeight: 700 }}>
                  <option value="DLX">DLX - Deluxe</option>
                  <option value="EXE">EXE - Executive</option>
                  <option value="SUI">SUI - Suite</option>
                </select>

                <span style={{ fontWeight: 600 }}>Occupancy Type</span>
                <select className="ids-input" value={occupancyType} onChange={(e) => setOccupancyType(e.target.value)} style={{ width: '110px', fontWeight: 700 }}>
                  <option value="SINGLE">SINGLE (1 Pax)</option>
                  <option value="DOUBLE">DOUBLE (2 Pax)</option>
                </select>

                <span style={{ fontWeight: 600 }}>Stay Duration</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span>{days} Days / {nights} Nights</span>
                </div>

                <span style={{ fontWeight: 600 }}>Total Rate</span>
                <div style={{ fontWeight: 900, color: '#0A246A', fontSize: '13px' }}>
                  ₹{computedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (INR)
                </div>
              </div>

            </div>

            {/* Inclusions & Plan Breakdown Tables matching Frame 038 & Frame 048 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              
              {/* Left Column: Meal Plan & Room Tariff */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CCC', paddingBottom: '4px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A246A' }}>Meal Plan & Room Tariff</span>
                  <button className="ids-btn-classic" style={{ fontSize: '10px', fontWeight: 700 }} onClick={() => setPackagePlanModalOpen(true)}>Edit Plan..</button>
                </div>
                <div style={{ fontSize: '10.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Plan Code:</span>
                    <strong>{planCode} ({planCode === 'AP' ? 'All Meals' : 'Breakfast'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Plan Meal Charge:</span>
                    <strong>₹{planAmount.toFixed(2)} / night</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Base Room Tariff:</span>
                    <strong>₹{roomTariffPerNight.toFixed(2)} / night</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CCC', paddingTop: '4px', color: '#137333', fontWeight: 700 }}>
                    <span>Room & Meals Total ({nights}N):</span>
                    <span>₹{((roomTariffPerNight + planAmount) * nights).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Bundled Services (Sightseeing / Spa / Cabs) */}
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CCC', paddingBottom: '4px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A246A' }}>Bundled Services & Amenities</span>
                  <button className="ids-btn-classic" style={{ fontSize: '10px', fontWeight: 700 }} onClick={() => setServiceModalOpen(true)}>Add Service..</button>
                </div>
                <div style={{ height: '70px', overflowY: 'auto', fontSize: '10px' }}>
                  {servicesList.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', borderBottom: '1px solid #EEE', paddingBottom: '2px' }}>
                      <span>• {s.name} ({s.code})</span>
                      <strong>₹{s.amount.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CCC', paddingTop: '4px', color: '#137333', fontWeight: 700, fontSize: '10.5px' }}>
                  <span>Services Total:</span>
                  <span>₹{servicesList.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Bottom Action Ribbon matching Frame 018 */}
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
                style={{ background: '#E6F4EA', color: '#137333', fontWeight: 700 }}
                onClick={() => setActiveTab('sellPackage')}
              >
                Proceed to Sell This Package →
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Add</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Modify</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Delete</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={() => setPackageLookupOpen(true)}>Browse</button>
                <button 
                  className="ids-btn-classic" 
                  style={{ fontWeight: 700, minWidth: '65px', background: '#DCE6F1' }}
                  onClick={handleSavePackageMaster}
                >
                  Save
                </button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }}>Panel</button>
                <button className="ids-btn-classic" style={{ minWidth: '55px' }} onClick={onClose}>Exit</button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            MODE 2: SELL PACKAGE IN ROOM BOOKING / WALK-IN (Frames 076–096)
            ========================================================================= */}
        {activeTab === 'sellPackage' && (
          <div style={{ padding: '12px 16px', fontSize: '11px' }}>
            
            <div style={{ background: '#FFFDE6', border: '1px solid #E6D043', padding: '6px 10px', fontSize: '11px', color: '#7D5700', marginBottom: '10px' }}>
              Select a guest and room number to attach package rate <strong>#{sellSelectedPkg.packageId} ({sellSelectedPkg.description})</strong>:
            </div>

            {/* Guest & Room Assignment Fields */}
            <div style={{ border: '2px groove #ECE9D8', background: '#ECE9D8', padding: '10px 14px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 120px 90px 1fr', gap: '8px 10px', alignItems: 'center' }}>
                
                <span style={{ fontWeight: 600 }}>Room #</span>
                <input className="ids-input" value={sellRoomNo} onChange={(e) => setSellRoomNo(e.target.value)} style={{ width: '80px', fontWeight: 700, background: '#FFF7CC' }} />

                <span style={{ fontWeight: 600 }}>Selected Package</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" value={`#${sellSelectedPkg.packageId} - ${sellSelectedPkg.description}`} readOnly style={{ width: '100%', fontWeight: 700, background: '#F0F0F0' }} />
                  <button className="ids-btn-classic" onClick={() => setSellPkgLookupOpen(true)} title="Browse Packages">?</button>
                </div>

                <span style={{ fontWeight: 600 }}>Guest Name</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" value={sellGuestTitle} onChange={(e) => setSellGuestTitle(e.target.value)} style={{ width: '40px', fontWeight: 700 }} />
                  <input className="ids-input" value={sellGuestName} onChange={(e) => setSellGuestName(e.target.value)} style={{ flex: 1, fontWeight: 700, background: '#FFF7CC' }} />
                </div>

                <span style={{ fontWeight: 600 }}>Mobile #</span>
                <input className="ids-input" value={sellMobile} onChange={(e) => setSellMobile(e.target.value)} style={{ width: '120px' }} />

                <span style={{ fontWeight: 600 }}>Duration</span>
                <span>{sellSelectedPkg.days} Days / {sellSelectedPkg.nights} Nights</span>

                <span style={{ fontWeight: 600 }}>Total Package Rate</span>
                <span style={{ fontWeight: 900, color: '#0A246A', fontSize: '13px' }}>
                  ₹{sellSelectedPkg.totalPackageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Package Folio Breakdown Preview */}
            <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '8px 12px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, color: '#0A246A', marginBottom: '4px' }}>Included Package Folio Line Items:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px' }}>
                <div>• Room Tariff ({sellSelectedPkg.roomType}): ₹{(sellSelectedPkg.roomTariffPerNight * sellSelectedPkg.nights).toFixed(2)}</div>
                <div>• Meal Plan ({sellSelectedPkg.planCode}): ₹{(sellSelectedPkg.planAmount * sellSelectedPkg.nights).toFixed(2)}</div>
                {sellSelectedPkg.services.map((s, i) => (
                  <div key={i}>• {s.name}: ₹{s.amount.toFixed(2)}</div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div 
              style={{ 
                background: '#D4D0C8', 
                border: '1px solid #808080', 
                padding: '6px 10px', 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '6px'
              }}
            >
              <button 
                className="ids-btn-classic" 
                style={{ fontWeight: 700, minWidth: '80px', background: '#DCE6F1' }}
                onClick={handleConfirmSellPackage}
              >
                Confirm & Sell Package
              </button>
              <button className="ids-btn-classic" onClick={() => setActiveTab('packageMaster')}>Back</button>
              <button className="ids-btn-classic" onClick={onClose}>Exit</button>
            </div>

          </div>
        )}

        {/* =========================================================================
            MODE 3: PACKAGE SALE COMPLETED CONFIRMATION (Frame 096)
            ========================================================================= */}
        {activeTab === 'completed' && (
          <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#E6F4EA', borderRadius: '50%', color: '#137333', marginBottom: '12px' }}>
              <CheckCircle2 size={42} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A246A', marginBottom: '6px' }}>
              Package Rate Sold & Checked-In Successfully!
            </div>

            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '14px 18px', maxWidth: '480px', margin: '0 auto 16px auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
                <div><strong>Assigned Room:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Room {sellRoomNo} ({sellSelectedPkg.roomType})</div>
                <div><strong>Guest Name:</strong></div>
                <div>{sellGuestTitle} {sellGuestName}</div>
                <div><strong>Package:</strong></div>
                <div style={{ fontWeight: 700, color: '#0A246A' }}>#{sellSelectedPkg.packageId} — {sellSelectedPkg.description}</div>
                <div><strong>Total Package Rate:</strong></div>
                <div style={{ fontWeight: 700, color: '#137333' }}>₹{sellSelectedPkg.totalPackageAmount.toFixed(2)} (All inclusive)</div>
                <div><strong>Room Status Rack:</strong></div>
                <div style={{ fontWeight: 700, color: '#C5221F' }}>Updated to 203 O/DLX {sellGuestName} (Occupied)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {onOpenRoomRack && (
                <button 
                  className="ids-btn-classic" 
                  style={{ background: '#DCE6F1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    onClose();
                    onOpenRoomRack();
                  }}
                >
                  <LayoutGrid size={13} /> View in Room Status Rack (Frame 096)
                </button>
              )}
              <button className="ids-btn-classic" onClick={onClose}>
                Close PMS Window
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            LOOKUP 1: PACKAGE MASTER LOOKUP MODAL (Frame 076)
            ========================================================================= */}
        {(packageLookupOpen || sellPkgLookupOpen) && (
          <div className="ids-modal-overlay" style={{ zIndex: 1600 }} onClick={() => { setPackageLookupOpen(false); setSellPkgLookupOpen(false); }}>
            <div 
              className="ids-dialog-window" 
              style={{ width: '640px', maxWidth: '94vw', background: '#ECE9D8', border: '2px outset #ECE9D8', boxShadow: '0 8px 24px rgba(0,0,0,0.65)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="ids-dialog-titlebar plain" 
                style={{ background: '#316AC5', color: '#FFF', padding: '3px 8px', fontWeight: 700, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Package Help V6.5.002.1</span>
                <button className="ids-win-btn close" onClick={() => { setPackageLookupOpen(false); setSellPkgLookupOpen(false); }}>✕</button>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '11px' }}>
                <div style={{ height: '180px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #716F64', fontWeight: 700 }}>
                      <tr>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>PRPCOD</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>Pkg #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0AB9A' }}>Package Name</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '75px', borderRight: '1px solid #B0AB9A' }}>From</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', width: '50px', borderRight: '1px solid #B0AB9A' }}>Room</th>
                        <th style={{ padding: '3px 6px', textAlign: 'right', width: '70px' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagesList.map((pkg, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setPackageId(pkg.packageId);
                            setDescription(pkg.description);
                            setRoomType(pkg.roomType);
                            setOccupancyType(pkg.occupancyType);
                            setPlanCode(pkg.planCode);
                            setPlanAmount(pkg.planAmount);
                            setRoomTariffPerNight(pkg.roomTariffPerNight);
                            setServicesList(pkg.services);
                            setSellSelectedPkg(pkg);
                            setPackageLookupOpen(false);
                            setSellPkgLookupOpen(false);
                          }}
                          style={{ background: idx % 2 === 0 ? '#FFF' : '#F9F9F9', cursor: 'pointer', borderBottom: '1px solid #E0E0E0' }}
                        >
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{pkg.property}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0A246A', borderRight: '1px solid #E0E0E0' }}>{pkg.packageId}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #E0E0E0' }}>{pkg.description}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{pkg.applicableFrom}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0' }}>{pkg.roomType}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: '#137333' }}>₹{pkg.totalPackageAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button className="ids-btn-classic" onClick={() => { setPackageLookupOpen(false); setSellPkgLookupOpen(false); }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
