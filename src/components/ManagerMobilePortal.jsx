import React, { useState, useMemo, useEffect } from 'react';
import { 
  Smartphone, UtensilsCrossed, Printer, Package, AlertTriangle, 
  CheckCircle2, Clock, DollarSign, Bed, RefreshCw, X, ShieldCheck, 
  ChevronRight, Wrench, Share2, Layers, FileText, Check, ArrowRight,
  Globe, ExternalLink, Database, Server, Code, Terminal, CheckCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { sendDebtorStatementWhatsApp } from '../utils/whatsappDispatch';
import {
  FASTAPI_BASE_URL,
  SWAGGER_DOCS_URL,
  REDOC_URL,
  checkFastApiHealth,
  getFastApiDashboardStats,
  getFastApiRooms,
  getFastApiTables,
  getFastApiInventory,
  getFastApiCorporateAccounts,
  getFastApiRoomDefects,
  getFastApiPropertyInfo,
  getFastApiMenu,
  getFastApiSampleThermalReceipt,
  syncFastApiMasterData
} from '../utils/backendApi';

export function amountToWords(amount) {
  const rounded = Math.round(Number(amount) || 0);
  if (rounded === 0) return 'Zero Rs Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  }
  
  const words = convert(rounded);
  return `${words.charAt(0).toUpperCase() + words.slice(1)} Rs Only`;
}

export default function ManagerMobilePortal({
  isOpen,
  onClose,
  rooms = [],
  bookings = [],
  foodOrders = [],
  onOpenKitchenPOS,
  onOpenOrderEntry,
  onOpenAccountsLedger,
  onOpenNightAudit
}) {
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'thermal' | 'inventory' | 'corporate' | 'defects'
  const [selectedTable, setSelectedTable] = useState('10');
  const [printerDestination, setPrinterDestination] = useState('restaurant'); // 'kitchen' | 'restaurant'
  const [thermalSlipSource, setThermalSlipSource] = useState('photo2'); // 'photo2' | 'liveTable'
  const [toastMessage, setToastMessage] = useState(null);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidItemTarget, setVoidItemTarget] = useState(null);
  const [voidReason, setVoidReason] = useState('Guest Disliked Taste / Food Quality Reject');
  const [managerPin, setManagerPin] = useState('');

  // Live FastAPI Cloud Engine State (Railway Production)
  const [fastApiHealth, setFastApiHealth] = useState(null);
  const [fastApiStats, setFastApiStats] = useState(null);
  const [liveEndpointPayload, setLiveEndpointPayload] = useState(null);
  const [activeEndpointName, setActiveEndpointName] = useState('/api/stats/dashboard');
  const [loadingEndpoint, setLoadingEndpoint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkFastApiHealth().then(data => setFastApiHealth(data)).catch(() => {});
      getFastApiDashboardStats().then(stats => {
        setFastApiStats(stats);
        if (!liveEndpointPayload) setLiveEndpointPayload(stats);
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleTestEndpoint = async (name, fetcher) => {
    setLoadingEndpoint(true);
    setActiveEndpointName(name);
    try {
      const data = await fetcher();
      setLiveEndpointPayload(data);
      showToast(`Live response loaded for ${name}`);
    } catch (err) {
      setLiveEndpointPayload({ error: err.message });
      showToast(`Error fetching ${name}: ${err.message}`);
    } finally {
      setLoadingEndpoint(false);
    }
  };

  // Sample running tables state matching IDS POS Table Matrix
  const [runningTables, setRunningTables] = useState({
    '10': {
      tableNo: '10',
      status: 'Occupied',
      server: 'Biren',
      covers: 2,
      kotNo: '1312',
      startTime: '12:40 PM',
      outlet: 'RESTAURANT',
      items: [
        { code: '82', name: 'STEAMED RICE', quantity: 1, rate: 145.0, modifier: '' },
        { code: '54', name: 'DAL MAHARANI', quantity: 1, rate: 200.0, modifier: '' },
        { code: '175', name: 'ANDHRA CHICKEN CURRY', quantity: 1, rate: 280.0, modifier: 'Extra Spicy' },
        { code: '186', name: 'MINERAL WATER(58)', quantity: 2, rate: 60.0, modifier: '' }
      ]
    },
    '11': {
      tableNo: '11',
      status: 'Occupied',
      server: 'Manash',
      covers: 4,
      kotNo: '1315',
      startTime: '01:10 PM',
      outlet: 'RESTAURANT',
      items: [
        { code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 2, rate: 199.0, modifier: '' },
        { code: '87', name: 'PANEER TIKKA BUTTER MASALA', quantity: 1, rate: 260.0, modifier: 'Less Spicy' },
        { code: '90', name: 'BUTTER NAAN (2 PCS)', quantity: 2, rate: 65.0, modifier: '' }
      ]
    },
    '14': {
      tableNo: '14',
      status: 'Occupied',
      server: 'Biren',
      covers: 3,
      kotNo: '1314',
      startTime: '01:25 PM',
      outlet: 'RESTAURANT',
      items: [
        { code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 2, rate: 199.0, modifier: '' },
        { code: '2', name: 'RED BEANS PEANUT SALAD', quantity: 1, rate: 199.0, modifier: '' },
        { code: '4', name: 'CAESAR SALAD (VEG)', quantity: 1, rate: 245.0, modifier: '' }
      ]
    },
    '20': {
      tableNo: '20',
      status: 'Billed',
      server: 'Ajay',
      covers: 2,
      kotNo: '1309',
      billNo: '18',
      startTime: '12:15 PM',
      outlet: 'RESTAURANT',
      items: [
        { code: '102', name: 'CHICKEN BIRYANI SPECIAL', quantity: 2, rate: 290.0, modifier: 'With Raita' },
        { code: '186', name: 'MINERAL WATER(58)', quantity: 1, rate: 60.0, modifier: '' }
      ]
    }
  });

  // Table Matrix (20 standard restaurant tables)
  const allTables = ['10', '11', '12', '14', '15', '20', '21', '22', '23', '24', '25', '30', '31', '32', '33', '34', '35', '40', '41', '100'];

  // Table calculations helper
  const getTableTotals = (tbl) => {
    if (!tbl || !tbl.items) return { subtotal: 0, cgst: 0, sgst: 0, net: 0 };
    const subtotal = tbl.items.reduce((sum, it) => sum + (it.quantity * it.rate), 0);
    const cgst = Number((subtotal * 0.025).toFixed(2));
    const sgst = Number((subtotal * 0.025).toFixed(2));
    const net = Math.round(subtotal + cgst + sgst);
    return { subtotal, cgst, sgst, net };
  };

  const activeTableData = runningTables[selectedTable] || null;
  const activeTableTotals = useMemo(() => getTableTotals(activeTableData), [activeTableData]);

  // Inventory store items matching Audio 4 Min 15
  const inventoryItems = [
    { code: 'INV-01', name: 'Basmati Rice Premium (Kolam)', currentStock: '18.5 kg', minStock: '10.0 kg', status: 'Optimal', unitPrice: 85 },
    { code: 'INV-02', name: 'Andhra Chicken Masala Spices', currentStock: '4.2 kg', minStock: '2.5 kg', status: 'Optimal', unitPrice: 320 },
    { code: 'INV-03', name: 'Country Chicken (Fresh Halal)', currentStock: '14.0 kg', minStock: '5.0 kg', status: 'Optimal', unitPrice: 220 },
    { code: 'INV-04', name: 'Refined Sunflower Oil (Fortune)', currentStock: '9.0 L', minStock: '15.0 L', status: 'Reorder Alert', unitPrice: 140 },
    { code: 'INV-05', name: 'Amul Fresh Dairy Milk (Gold)', currentStock: '12.0 L', minStock: '8.0 L', status: 'Optimal', unitPrice: 66 },
    { code: 'INV-06', name: 'Paneer Fresh Malai', currentStock: '6.5 kg', minStock: '4.0 kg', status: 'Optimal', unitPrice: 380 },
    { code: 'INV-07', name: 'Dairy Cream (Amul 25% Fat)', currentStock: '2.0 kg', minStock: '5.0 kg', status: 'Low Stock', unitPrice: 240 },
    { code: 'INV-08', name: 'Kinley Mineral Water 1L (Pack of 12)', currentStock: '14 cases', minStock: '6 cases', status: 'Optimal', unitPrice: 180 },
    { code: 'INV-09', name: 'Gas Cylinder LPG Commercial (19kg)', currentStock: '3 cylinders', minStock: '2 cylinders', status: 'Optimal', unitPrice: 1850 }
  ];

  // Corporate Dues & Aging matching Audio 2 Min 01-02
  const corporateDebtors = [
    { name: 'Ashok Leyland Rayagada Unit', gstin: '21AAACA1234B1Z2', totalDue: 64500, agingDays: 15, agingBand: '0-30 Days', phone: '+919437012345' },
    { name: 'Utkal Alumina International', gstin: '21AABCU5678C1Z9', totalDue: 32400, agingDays: 12, agingBand: '0-30 Days', phone: '+919437098765' },
    { name: 'Linde India Industrial Gases', gstin: '21AABCL9012D1Z4', totalDue: 38900, agingDays: 38, agingBand: '31-60 Days Overdue', phone: '+919861054321' },
    { name: 'JK Paper Mills Ltd Jaykaypur', gstin: '21AAACJ4321E1Z1', totalDue: 0, agingDays: 0, agingBand: 'Settled / Nil Balance', phone: '+919437055555' }
  ];

  // Room Defect & AC Issues matching Audio 3 Min 05-07
  const roomIssues = [
    { roomNumber: '107', issue: 'AC Cooling Coil Leaking & Defective Remote', category: 'HVAC', status: 'Repair In Progress', technician: 'Bikram Patra (AC Specialist)', loggedTime: '08:30 AM' },
    { roomNumber: '204', issue: 'Geyser Thermostat Tripping after 5 mins', category: 'Electrical', status: 'Pending Market Spares', technician: 'Pradeep Jena', loggedTime: '09:15 AM' },
    { roomNumber: '102', issue: 'Guest Requested Do-Not-Disturb (DND)', category: 'Service', status: 'Active DND', technician: 'Housekeeping Desk', loggedTime: '10:00 AM' },
    { roomNumber: '205', issue: 'Guest Requested Do-Not-Disturb (DND)', category: 'Service', status: 'Active DND', technician: 'Housekeeping Desk', loggedTime: '11:30 AM' }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Void item handler matching Audio 4 Min 01
  const handleConfirmVoid = () => {
    if (!voidItemTarget) return;
    if (managerPin !== '1234' && managerPin !== '7651' && managerPin.trim() === '') {
      showToast('⚠️ Please enter Manager Authorization PIN (Default: 1234)');
      return;
    }

    setRunningTables(prev => {
      const current = prev[selectedTable];
      if (!current) return prev;
      const updatedItems = current.items.filter((_, idx) => idx !== voidItemTarget.idx);
      return {
        ...prev,
        [selectedTable]: {
          ...current,
          items: updatedItems
        }
      };
    });

    showToast(`✓ Voided "${voidItemTarget.item.name}" from Table ${selectedTable}. Reason: ${voidReason}. Kitchen cancellation slip transmitted!`);
    setShowVoidModal(false);
    setVoidItemTarget(null);
    setManagerPin('');
  };

  // Mobile Thermal Print trigger matching Audio 4 Min 50
  const handleMobilePrint = () => {
    showToast(`🖨️ Transmitting 80mm ESC/POS thermal slip to ${printerDestination === 'kitchen' ? 'Cannon Kitchen Thermal' : 'Restaurant Counter Thermal'}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Merge table handler matching Audio 4 Min 00
  const handleMergeTablePrompt = () => {
    const target = prompt(`Merge Table ${selectedTable} with which running table? (e.g. 11, 14):`, '11');
    if (target && target !== selectedTable && runningTables[target]) {
      const srcItems = runningTables[selectedTable].items;
      setRunningTables(prev => {
        const tgt = prev[target];
        return {
          ...prev,
          [target]: {
            ...tgt,
            items: [...tgt.items, ...srcItems]
          },
          [selectedTable]: {
            ...prev[selectedTable],
            items: []
          }
        };
      });
      showToast(`✓ Tables Merged! Items from Table ${selectedTable} moved to Table ${target} for single consolidated bill.`);
    } else if (target) {
      showToast(`Table ${target} is either vacant or invalid.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 9, 20, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 580,
        height: '95vh',
        background: '#0d1322',
        border: '1px solid rgba(212, 175, 55, 0.45)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        color: '#f8fafc',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Top App Header */}
        <div style={{
          padding: '0.85rem 1rem',
          background: 'linear-gradient(90deg, #162036 0%, #0d1322 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d4af37 0%, #854d0e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
              fontSize: '14px'
            }}>
              <Smartphone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.3px', color: '#fff' }}>
                HOTEL ELITE INN
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Manager Operations Console • Rayagada Property
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <a
              href={SWAGGER_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Interactive FastAPI Swagger Documentation"
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(14, 165, 233, 0.45)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <ExternalLink size={10} />
              <span>Swagger /docs</span>
            </a>
            <span style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: fastApiHealth?.status === 'healthy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontWeight: 600
            }}>
              ● {fastApiHealth?.status === 'healthy' ? 'FastAPI Connected' : 'Edge Live'}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Top Quick KPI Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.5rem 0.75rem',
          textAlign: 'center',
          gap: '0.25rem'
        }}>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Cash Drawer</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>₹33,500</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Occupancy</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80' }}>44.4% (12/27)</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>F&amp;B Today</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24' }}>₹42,150</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Running Tbls</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f43f5e' }}>4 Active</div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{
            background: 'linear-gradient(90deg, #1e3a8a, #0369a1)',
            color: '#fff',
            padding: '6px 12px',
            fontSize: '11px',
            textAlign: 'center',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease'
          }}>
            {toastMessage}
          </div>
        )}

        {/* Tab Navigation (Mobile One-Thumb Friendly) */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'tables', label: '🍽️ Tables', desc: 'Live Orders' },
            { id: 'thermal', label: '🖨️ Thermal Print', desc: 'ESC/POS' },
            { id: 'inventory', label: '📦 Store Stock', desc: 'Kitchen Lows' },
            { id: 'corporate', label: '🏢 Aging Dues', desc: 'Corporate' },
            { id: 'defects', label: '🛠️ Defects/DND', desc: 'Room Alert' },
            { id: 'cloudapi', label: '⚡ Cloud API', desc: 'FastAPI /docs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '78px',
                padding: '0.6rem 0.3rem',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #d4af37' : '2px solid transparent',
                color: activeTab === tab.id ? '#fef08a' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <div>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          
          {/* TAB 1: LIVE TABLES & BILLING CARDS (Audio 4 Min 00-02 & 15) */}
          {activeTab === 'tables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  RESTAURANT TABLE MATRIX (TAP TABLE TO INSPECT)
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  🟢 Vacant | 🔴 Occupied | 🔵 Billed
                </span>
              </div>

              {/* Table Selector Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px'
              }}>
                {allTables.map(tblNo => {
                  const running = runningTables[tblNo];
                  const isOccupied = running && running.items && running.items.length > 0 && running.status === 'Occupied';
                  const isBilled = running && running.status === 'Billed';
                  const isSelected = selectedTable === tblNo;

                  let bg = 'rgba(255,255,255,0.03)';
                  let border = '1px solid rgba(255,255,255,0.1)';
                  let color = '#94a3b8';
                  let statusText = 'Vacant';

                  if (isBilled) {
                    bg = 'rgba(59, 130, 246, 0.2)';
                    border = '1px solid #3b82f6';
                    color = '#60a5fa';
                    statusText = 'Billed';
                  } else if (isOccupied) {
                    bg = 'rgba(239, 68, 68, 0.2)';
                    border = '1px solid #ef4444';
                    color = '#f87171';
                    statusText = 'Occupied';
                  }

                  if (isSelected) {
                    border = '2px solid #d4af37';
                  }

                  return (
                    <div
                      key={tblNo}
                      onClick={() => setSelectedTable(tblNo)}
                      style={{
                        background: bg,
                        border: border,
                        borderRadius: '6px',
                        padding: '6px 4px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                        T-{tblNo}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: color }}>
                        {statusText}
                      </div>
                      {isOccupied && (
                        <div style={{ fontSize: '9px', color: '#fef08a', marginTop: '2px', fontWeight: 600 }}>
                          ₹{getTableTotals(running).net}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Table Billing Card */}
              {activeTableData && activeTableData.items && activeTableData.items.length > 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        Table #{activeTableData.tableNo} • KOT #{activeTableData.kotNo || '1312'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        Server: {activeTableData.server} | Covers: {activeTableData.covers} | Started: {activeTableData.startTime}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: activeTableData.status === 'Billed' ? '#1e3a8a' : '#7f1d1d',
                      color: activeTableData.status === 'Billed' ? '#93c5fd' : '#fca5a5',
                      fontWeight: 700
                    }}>
                      {activeTableData.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Items List */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                    {activeTableData.items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          fontSize: '11px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, color: '#fff' }}>{it.quantity}x </span>
                          <span>{it.name}</span>
                          {it.modifier && (
                            <div style={{ fontSize: '9px', color: '#f59e0b', fontStyle: 'italic', paddingLeft: '14px' }}>
                              + {it.modifier}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600 }}>₹{(it.quantity * it.rate).toFixed(2)}</span>
                          <button
                            onClick={() => {
                              setVoidItemTarget({ item: it, idx: idx });
                              setShowVoidModal(true);
                            }}
                            title="Void punched item if guest rejects taste (Audio 4)"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #ef4444',
                              color: '#f87171',
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Void
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Subtotal:</span>
                      <span>₹{activeTableTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>CGST (2.5%) + SGST (2.5%):</span>
                      <span>₹{(activeTableTotals.cgst + activeTableTotals.sgst).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', fontWeight: 800, color: '#38bdf8' }}>
                      <span>Net Payable:</span>
                      <span>₹{activeTableTotals.net.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Table Actions matching Audio 4 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
                    <button
                      onClick={handleMergeTablePrompt}
                      title="Merge 2-3 tables for same single bill (Audio 4 Min 00)"
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid #a855f7',
                        color: '#d8b4fe',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Layers size={12} /> Merge Table
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('thermal');
                      }}
                      title="Preview 80mm ESC/POS Thermal Slip (Audio 4 Min 50)"
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(14, 165, 233, 0.2)',
                        border: '1px solid #0ea5e9',
                        color: '#7dd3fc',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Printer size={12} /> Thermal Slip
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenOrderEntry) {
                          onOpenOrderEntry();
                        } else {
                          showToast('Launching Full Win32 POS Order Entry...');
                        }
                      }}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid #22c55e',
                        color: '#86efac',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <UtensilsCrossed size={12} /> Win32 POS
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🟢</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    Table #{selectedTable} is currently Vacant
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Ready for new guests or steward punch via Win32 POS Order Entry.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MOBILE THERMAL RECEIPT SPOOLER (Audio 4 Min 50) */}
          {activeTab === 'thermal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  MOBILE THERMAL PRINTER (58MM / 80MM ESC/POS)
                </span>
                <span style={{ fontSize: '10px', color: '#38bdf8' }}>
                  Small Mobile Print Option
                </span>
              </div>

              {/* Destination Radio & Source Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <button
                    onClick={() => setPrinterDestination('restaurant')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: 'none',
                      background: printerDestination === 'restaurant' ? '#d4af37' : 'transparent',
                      color: printerDestination === 'restaurant' ? '#000' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🧾 Tax Invoice POS Slip (Photo 2)
                  </button>
                  <button
                    onClick={() => setPrinterDestination('kitchen')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: 'none',
                      background: printerDestination === 'kitchen' ? '#d4af37' : 'transparent',
                      color: printerDestination === 'kitchen' ? '#000' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🍳 Kitchen KOT Slip
                  </button>
                </div>

                {printerDestination === 'restaurant' && (
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '4px',
                    borderRadius: '6px',
                    fontSize: '10px'
                  }}>
                    <button
                      onClick={() => setThermalSlipSource('photo2')}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: 'none',
                        background: thermalSlipSource === 'photo2' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                        color: thermalSlipSource === 'photo2' ? '#38bdf8' : '#94a3b8',
                        fontWeight: thermalSlipSource === 'photo2' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      📸 Photo 2 Receipt (R.S/2913 • Room 106)
                    </button>
                    <button
                      onClick={() => setThermalSlipSource('liveTable')}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: 'none',
                        background: thermalSlipSource === 'liveTable' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                        color: thermalSlipSource === 'liveTable' ? '#38bdf8' : '#94a3b8',
                        fontWeight: thermalSlipSource === 'liveTable' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      🔴 Live Selected Table (T-{selectedTable})
                    </button>
                  </div>
                )}
              </div>

              {/* Authentic ESC/POS Monospace Thermal Preview Container */}
              <div 
                id="thermal-slip-print-area"
                style={{
                  background: '#fff',
                  color: '#000',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '10px',
                  lineHeight: '1.2',
                  padding: '16px 12px',
                  borderRadius: '4px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                  margin: '0 auto',
                  width: '100%',
                  maxWidth: '320px',
                  border: '1px solid #ddd'
                }}
              >
                {printerDestination === 'kitchen' ? (
                  /* Authentic Kitchen Order Ticket (KOT) Slip */
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                      HOTEL ELITE INN
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px' }}>
                      STATION ROAD, MUNIGUDA, RAYAGADA
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '8px' }}>
                      GSTIN: 21AEWFS9433F1ZN | PH: +91-6370757541
                    </div>
                    <div style={{ textAlign: 'center', margin: '4px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0', fontWeight: 'bold' }}>
                      *** KITCHEN ORDER TICKET (KOT) ***
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>Table: T-{selectedTable}</span>
                      <span>KOT #: {activeTableData?.kotNo || '1312'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>Server: {activeTableData?.server || 'Biren'}</span>
                      <span>Covers: {activeTableData?.covers || 2}</span>
                    </div>
                    <div style={{ fontSize: '9px', margin: '2px 0' }}>
                      Date: {new Date().toLocaleDateString('en-GB')} {activeTableData?.startTime || '12:45 PM'}
                    </div>
                    <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
                    <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Qty  Item Name</span>
                      <span>Type</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>
                    {(activeTableData?.items || [
                      { name: 'ANDHRA CHICKEN CURRY', quantity: 1, modifier: 'Extra Spicy' },
                      { name: 'STEAMED RICE', quantity: 1 },
                      { name: 'MINERAL WATER(58)', quantity: 2 }
                    ]).map((it, idx) => (
                      <div key={idx} style={{ margin: '3px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>{it.quantity} x  {it.name}</span>
                          <span>FOOD</span>
                        </div>
                        {it.modifier && (
                          <div style={{ fontSize: '9px', paddingLeft: '14px', fontStyle: 'italic' }}>
                            * MOD: {it.modifier}
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed #000', margin: '6px 0 3px' }}></div>
                    <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                      ** CHEF COPY - SPEED OF SERVICE **
                    </div>
                  </div>
                ) : (
                  /* 100% Authentic Photo 2 Tax Invoice POS Receipt */
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                      TAX INVOICE
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '0.5px' }}>
                      ORIGINAL FOR RECIPIENT
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', margin: '2px 0' }}>
                      HOTEL ELITE INN
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                      {thermalSlipSource === 'photo2' ? 'POS 5- ROOM SERVICE' : `POS 1- RESTAURANT (T-${selectedTable})`}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px' }}>
                      Opposite Railway Station Main Road Muniguda
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                      GSTIN NO: - 21AEWFS9433F1ZN
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px' }}>
                      SAC CODE - 996332
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px' }}>
                      FSSAI NO: - 10523016000047
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px' }}>
                      +91-6370757541
                    </div>

                    <div style={{ margin: '6px 0 2px', borderTop: '1px dashed #000' }}></div>

                    {/* Metadata block matching Photo 2 */}
                    {thermalSlipSource === 'photo2' ? (
                      <>
                        <div style={{ fontSize: '9px' }}>Guest Name: - Mr. KHAGESWARA SAHU</div>
                        <div style={{ fontSize: '9px' }}>Guest Name: - </div>
                        <div style={{ fontSize: '9px' }}>Company GST No: - </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                          <span>Room No: - 106</span>
                          <span>Bill no: - R.S/2913</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                          <span>Cover - 1</span>
                          <span>Date - 28/09/26</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '9px' }}>
                          Time - 22:29:04
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>Day Session DINNER</div>
                        <div style={{ fontSize: '9px' }}>First KOT Time : - 22:14</div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>KOT NO. : 2056</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '9px' }}>Guest Name: - {activeTableData?.server ? `Table Guest (${activeTableData.server})` : 'Walk-in Guest'}</div>
                        <div style={{ fontSize: '9px' }}>Guest Name: - </div>
                        <div style={{ fontSize: '9px' }}>Company GST No: - </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                          <span>Table No: - T-{selectedTable}</span>
                          <span>Bill no: - RES/{activeTableData?.billNo || '4182'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                          <span>Cover - {activeTableData?.covers || 2}</span>
                          <span>Date - {new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '9px' }}>
                          Time - {activeTableData?.startTime || '13:10:00'}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>Day Session LUNCH</div>
                        <div style={{ fontSize: '9px' }}>First KOT Time : - {activeTableData?.startTime || '12:45'}</div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>KOT NO. : {activeTableData?.kotNo || '1312'}</div>
                      </>
                    )}

                    <div style={{ margin: '4px 0', borderTop: '1px dashed #000' }}></div>

                    {/* Table Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 48px 24px 50px', fontSize: '9px', fontWeight: 'bold' }}>
                      <span>No.</span>
                      <span>Dish Name</span>
                      <span style={{ textAlign: 'right' }}>Rate</span>
                      <span style={{ textAlign: 'right' }}>Qty</span>
                      <span style={{ textAlign: 'right' }}>Total</span>
                    </div>

                    <div style={{ margin: '2px 0', borderTop: '1px dashed #000' }}></div>

                    {/* Line Items */}
                    {thermalSlipSource === 'photo2' ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 48px 24px 50px', fontSize: '9px', margin: '2px 0' }}>
                          <span>1</span>
                          <span>Dal Fry</span>
                          <span style={{ textAlign: 'right' }}>123.81</span>
                          <span style={{ textAlign: 'right' }}>1</span>
                          <span style={{ textAlign: 'right' }}>123.81</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 48px 24px 50px', fontSize: '9px', margin: '2px 0' }}>
                          <span>2</span>
                          <span>Tawa Roti</span>
                          <span style={{ textAlign: 'right' }}>23.81</span>
                          <span style={{ textAlign: 'right' }}>4</span>
                          <span style={{ textAlign: 'right' }}>95.24</span>
                        </div>
                      </>
                    ) : (
                      (activeTableData?.items || [
                        { name: 'DAL FRY', quantity: 1, rate: 130 },
                        { name: 'TAWA ROTI', quantity: 4, rate: 25 }
                      ]).map((it, idx) => {
                        const baseRate = Number((it.rate / 1.05).toFixed(2));
                        const lineTotal = Number((baseRate * it.quantity).toFixed(2));
                        return (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 48px 24px 50px', fontSize: '9px', margin: '2px 0' }}>
                            <span>{idx + 1}</span>
                            <span>{it.name}</span>
                            <span style={{ textAlign: 'right' }}>{baseRate.toFixed(2)}</span>
                            <span style={{ textAlign: 'right' }}>{it.quantity}</span>
                            <span style={{ textAlign: 'right' }}>{lineTotal.toFixed(2)}</span>
                          </div>
                        );
                      })
                    )}

                    <div style={{ margin: '4px 0', borderTop: '1px dashed #000' }}></div>

                    {/* Totals Section */}
                    {thermalSlipSource === 'photo2' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                          <span>Total Qty : 5</span>
                          <span>Total            219.01</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', gap: '8px' }}>
                          <span>CGST @ 2.5 %</span>
                          <span>5.48</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', gap: '8px' }}>
                          <span>SGST @ 2.5 %</span>
                          <span>5.48</span>
                        </div>
                        <div style={{ margin: '4px 0', borderTop: '1px dashed #000' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 'bold', gap: '10px' }}>
                          <span>Grand Total</span>
                          <span>230.00</span>
                        </div>
                        <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '2px' }}>
                          Two hundred Thirty Rs Only
                        </div>
                      </>
                    ) : (() => {
                      const items = activeTableData?.items || [{ name: 'DAL FRY', quantity: 1, rate: 130 }, { name: 'TAWA ROTI', quantity: 4, rate: 25 }];
                      const totQty = items.reduce((acc, it) => acc + it.quantity, 0);
                      const baseTot = items.reduce((acc, it) => acc + Number(((it.rate / 1.05) * it.quantity).toFixed(2)), 0);
                      const cgst = Number((baseTot * 0.025).toFixed(2));
                      const sgst = Number((baseTot * 0.025).toFixed(2));
                      const grand = Math.round(baseTot + cgst + sgst);
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                            <span>Total Qty : {totQty}</span>
                            <span>Total            {baseTot.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', gap: '8px' }}>
                            <span>CGST @ 2.5 %</span>
                            <span>{cgst.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', gap: '8px' }}>
                            <span>SGST @ 2.5 %</span>
                            <span>{sgst.toFixed(2)}</span>
                          </div>
                          <div style={{ margin: '4px 0', borderTop: '1px dashed #000' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 'bold', gap: '10px' }}>
                            <span>Grand Total</span>
                            <span>{grand.toFixed(2)}</span>
                          </div>
                          <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '2px' }}>
                            {amountToWords(grand)}
                          </div>
                        </>
                      );
                    })()}

                    <div style={{ margin: '8px 0 4px', borderTop: '1px dashed #000' }}></div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px' }}>
                      ------PLEASE DONOT PAY CASH------
                    </div>
                    <div style={{ fontSize: '9px', margin: '2px 0' }}>
                      Cashier : - Bikram26
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '4px' }}>
                      Allow Us To Serve You Again
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px' }}>
                      Thank You, Visit Again !
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginTop: '6px' }}>
                      <span>E & O E</span>
                      <span style={{ fontWeight: 'bold' }}>PLACE OF SUPPLY 'O.D'</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                onClick={handleMobilePrint}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)'
                }}
              >
                <Printer size={16} /> 🖨️ Print 80mm ESC/POS Thermal Slip
              </button>
            </div>
          )}

          {/* TAB 3: STORE INVENTORY STATUS (Audio 4 Min 15) */}
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  KITCHEN &amp; STORE INVENTORY MONITOR (Audio 4)
                </span>
                <span style={{ fontSize: '10px', color: '#f59e0b' }}>
                  Live Stock Counts
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {inventoryItems.map(item => {
                  const isLow = item.status.includes('Alert') || item.status.includes('Low');
                  return (
                    <div
                      key={item.code}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: isLow ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Code: {item.code} | Reorder Threshold: {item.minStock} | Approx Rate: ₹{item.unitPrice}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isLow ? '#f87171' : '#4ade80' }}>
                          {item.currentStock}
                        </div>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isLow ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: isLow ? '#fca5a5' : '#86efac',
                          fontWeight: 700
                        }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  showToast('📱 WhatsApp Purchase Order dispatched to Rayagada Wholesale Grocery Supplier!');
                }}
                style={{
                  padding: '9px',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid #22c55e',
                  color: '#86efac',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Share2 size={14} /> Send WhatsApp Low Stock Order to Vendor
              </button>
            </div>
          )}

          {/* TAB 4: CORPORATE AGING DUES (Audio 2 Min 01-02) */}
          {activeTab === 'corporate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  CORPORATE BILLINGS STATUS &amp; OUTSTANDING AGING (Audio 2)
                </span>
                <span style={{ fontSize: '10px', color: '#f43f5e' }}>
                  Due Today: ₹1,35,800
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {corporateDebtors.map(debtor => (
                  <div
                    key={debtor.name}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                          {debtor.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          GSTIN: {debtor.gstin} | Contact: {debtor.phone}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: debtor.totalDue > 0 ? '#fbbf24' : '#4ade80' }}>
                          ₹{debtor.totalDue.toLocaleString()}
                        </div>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: debtor.totalDue > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: debtor.totalDue > 0 ? '#fef08a' : '#86efac',
                          fontWeight: 700
                        }}>
                          {debtor.agingBand}
                        </span>
                      </div>
                    </div>

                    {debtor.totalDue > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          onClick={() => {
                            sendDebtorStatementWhatsApp({
                              companyName: debtor.name,
                              gstin: debtor.gstin,
                              balanceDue: debtor.totalDue,
                              agingDays: debtor.agingDays,
                              clientPhone: debtor.phone
                            });
                            showToast(`✓ Dispatched Outstanding Statement via WhatsApp to ${debtor.name}`);
                          }}
                          style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid #22c55e',
                            color: '#86efac',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Share2 size={11} /> WhatsApp Statement
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROOM DEFECTS & DND (Audio 3 Min 05-07) */}
          {activeTab === 'defects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  ROOM DEFECTS &amp; SERVICE STATUS (Audio 3)
                </span>
                <span style={{ fontSize: '10px', color: '#f87171' }}>
                  Cold &amp; Defective AC Tracking
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roomIssues.map(issue => (
                  <div
                    key={issue.roomNumber}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: issue.category === 'HVAC' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Room #{issue.roomNumber}</span>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: issue.category === 'HVAC' ? '#7f1d1d' : 'rgba(255,255,255,0.1)',
                          color: issue.category === 'HVAC' ? '#fca5a5' : '#cbd5e1'
                        }}>
                          {issue.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#f1f5f9', marginTop: '2px', fontWeight: 600 }}>
                        {issue.issue}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                        Assignee: {issue.technician} | Logged: {issue.loggedTime}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: issue.status.includes('Progress') ? 'rgba(245, 158, 11, 0.2)' : (issue.status.includes('DND') ? 'rgba(168, 85, 247, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                        color: issue.status.includes('Progress') ? '#fde047' : (issue.status.includes('DND') ? '#e9d5ff' : '#fca5a5'),
                        fontWeight: 700
                      }}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FASTAPI CLOUD ENGINE & SWAGGER DOCS */}
          {activeTab === 'cloudapi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                  FASTAPI &amp; POSTGRESQL PRODUCTION BACKEND
                </span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: fastApiHealth?.status === 'healthy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: fastApiHealth?.status === 'healthy' ? '#4ade80' : '#f87171',
                  fontWeight: 700
                }}>
                  ● {fastApiHealth?.status === 'healthy' ? 'LIVE & CONNECTED' : 'CHECKING ENGINE'}
                </span>
              </div>

              {/* Railway Server Info Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(30, 58, 138, 0.2) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={18} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Railway Cloud Production API</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Python 3.11 • FastAPI 0.115 • SQLAlchemy 2.0 • PostgreSQL</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: '#bae6fd',
                  fontFamily: 'monospace',
                  marginBottom: '10px',
                  wordBreak: 'break-all'
                }}>
                  {FASTAPI_BASE_URL}
                </div>

                {/* Primary Documentation Launchers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <a
                    href={SWAGGER_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Swagger UI (/docs)</span>
                  </a>
                  <a
                    href={REDOC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={14} />
                    <span>Open ReDoc (/redoc)</span>
                  </a>
                </div>
              </div>

              {/* Real-time Server KPIs */}
              {fastApiStats && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px'
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>TOTAL ROOMS</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>{fastApiStats.total_rooms || 24}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>REVENUE TODAY</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80' }}>₹{(fastApiStats.total_revenue_today || 56950).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>CORP AGING DUE</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24' }}>₹{(fastApiStats.corporate_aging_due || 135800).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}

              {/* Interactive Endpoint Query Console */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={14} color="#38bdf8" />
                  <span>Interactive Endpoint Tester (Tap to Query Live Cloud Engine)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  <button
                    onClick={() => handleTestEndpoint('/health', checkFastApiHealth)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/health' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/health' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /health
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/stats/dashboard', getFastApiDashboardStats)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/stats/dashboard' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/stats/dashboard' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/stats
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/rooms', getFastApiRooms)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/rooms' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/rooms' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/rooms
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/restaurant/tables', getFastApiTables)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/restaurant/tables' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/restaurant/tables' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/tables
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/inventory', getFastApiInventory)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/inventory' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/inventory' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/inventory
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/corporate', getFastApiCorporateAccounts)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/corporate' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/corporate' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/corporate
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/property/info', getFastApiPropertyInfo)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/property/info' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/property/info' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/property
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/restaurant/menu', getFastApiMenu)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/restaurant/menu' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/restaurant/menu' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    GET /api/menu
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/pos/thermal-receipt/sample', getFastApiSampleThermalReceipt)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/pos/thermal-receipt/sample' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: activeEndpointName === '/api/pos/thermal-receipt/sample' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fef08a',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🧾 GET Photo 2 Slip
                  </button>
                  <button
                    onClick={() => handleTestEndpoint('/api/system/sync-master-data', syncFastApiMasterData)}
                    style={{
                      padding: '6px 4px',
                      background: activeEndpointName === '/api/system/sync-master-data' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.15)',
                      border: activeEndpointName === '/api/system/sync-master-data' ? '1px solid #4ade80' : '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#86efac',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Sync 27 Rooms
                  </button>
                </div>

                {/* Live JSON Payload Inspector */}
                <div style={{
                  background: '#090d16',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  padding: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PAYLOAD: {activeEndpointName}</span>
                    <span>{loadingEndpoint ? 'Querying...' : '200 OK'}</span>
                  </div>
                  <pre style={{
                    margin: 0,
                    fontSize: '10px',
                    color: '#34d399',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {loadingEndpoint ? 'Fetching real-time data from Railway cloud engine...' : JSON.stringify(liveEndpointPayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* WIN32 ITEM VOID MODAL (Audio 4 Min 01) */}
        {showVoidModal && voidItemTarget && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '100%',
              maxWidth: 380,
              background: '#ECE9D8',
              border: '2px solid #808080',
              boxShadow: '4px 4px 16px rgba(0,0,0,0.8)',
              color: '#000',
              fontSize: '11px',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}>
              {/* Titlebar */}
              <div style={{
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                color: '#FFF',
                padding: '3px 6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 700
              }}>
                <span>Item Void / KOT Cancellation (Audio 4)</span>
                <button
                  onClick={() => setShowVoidModal(false)}
                  style={{
                    background: '#C0C0C0',
                    border: '1px outset #FFF',
                    height: '16px',
                    width: '16px',
                    fontSize: '10px',
                    lineHeight: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#0A246A' }}>
                    {voidItemTarget.item.name}
                  </div>
                  <div style={{ color: '#555', fontSize: '10px' }}>
                    Table #{selectedTable} | Qty: {voidItemTarget.item.quantity} | Rate: ₹{voidItemTarget.item.rate}
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    Statutory Void Reason:
                  </label>
                  <select
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FFF',
                      border: '1px solid #7F9DB9',
                      padding: '3px 4px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <option value="Guest Disliked Taste / Food Quality Reject">
                      Guest Disliked Taste / Food Quality Reject (Client Audio 4)
                    </option>
                    <option value="Wrong Item Punched by Steward">
                      Wrong Item Punched by Steward
                    </option>
                    <option value="Order Cancelled by Guest Before Prep">
                      Order Cancelled by Guest Before Prep
                    </option>
                    <option value="Excessive Delay in Service">
                      Excessive Delay in Service
                    </option>
                    <option value="Item Unavailable / Kitchen 86 Stockout">
                      Item Unavailable / Kitchen 86 Stockout
                    </option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    Manager Authorization PIN:
                  </label>
                  <input
                    type="password"
                    value={managerPin}
                    onChange={e => setManagerPin(e.target.value)}
                    placeholder="Enter PIN (Default: 1234)"
                    style={{
                      width: '100%',
                      background: '#FFF',
                      border: '1px solid #7F9DB9',
                      padding: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                  <button
                    onClick={handleConfirmVoid}
                    style={{
                      padding: '4px 12px',
                      background: '#DFF0D8',
                      border: '1px solid #3C763D',
                      color: '#3C763D',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Void
                  </button>
                  <button
                    onClick={() => setShowVoidModal(false)}
                    style={{
                      padding: '4px 12px',
                      background: '#ECE9D8',
                      border: '1px solid #808080',
                      cursor: 'pointer'
                    }}
                  >
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
