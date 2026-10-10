import React, { useState } from 'react';
import { HOTEL_CONFIG } from '../../data/hotelData';

// Mock/Initial POS Audit & Sales records reflecting operational data from Videos 01-22
const INITIAL_SALES_RECORDS = [
  {
    billNo: 'RES-B-00101',
    tableNo: '10',
    outlet: 'RESTAURANT',
    shift: 'Shift 1',
    time: '12:35',
    date: '08-FEB-2022',
    server: 'Kaushik',
    pax: 2,
    gross: 1100.00,
    discount: 50.00,
    taxable: 1050.00,
    cgst: 26.25,
    sgst: 26.25,
    roundOff: 0.50,
    netPayable: 1103.00,
    settlementMode: 'Cash',
    tip: 50.00,
    status: 'Settled',
    cashier: 'MANAGER'
  },
  {
    billNo: 'RES-B-00102',
    tableNo: '14',
    outlet: 'RESTAURANT',
    shift: 'Shift 1',
    time: '13:15',
    date: '08-FEB-2022',
    server: 'Biren',
    pax: 4,
    gross: 991.43,
    discount: 0.00,
    taxable: 991.43,
    cgst: 24.79,
    sgst: 24.79,
    roundOff: -0.01,
    netPayable: 1041.00,
    settlementMode: 'Credit Card',
    tip: 0.00,
    status: 'Settled',
    cashier: 'MANAGER'
  },
  {
    billNo: 'BAR-B-00045',
    tableNo: 'B1',
    outlet: 'LIQUOR BAR',
    shift: 'Shift 2',
    time: '19:40',
    date: '08-FEB-2022',
    server: 'Ajay',
    pax: 2,
    gross: 2400.00,
    discount: 200.00,
    taxable: 2200.00,
    cgst: 55.00,
    sgst: 55.00,
    roundOff: 0.00,
    netPayable: 2310.00,
    settlementMode: 'Room Folio',
    roomNo: '104',
    guestName: 'Dr. Alok Verma',
    tip: 100.00,
    status: 'Settled',
    cashier: 'MANAGER'
  },
  {
    billNo: 'RES-B-00103',
    tableNo: '11',
    outlet: 'RESTAURANT',
    shift: 'Shift 2',
    time: '20:10',
    date: '08-FEB-2022',
    server: 'Bijay',
    pax: 3,
    gross: 1650.00,
    discount: 0.00,
    taxable: 1650.00,
    cgst: 41.25,
    sgst: 41.25,
    roundOff: 0.50,
    netPayable: 1733.00,
    settlementMode: 'Cash',
    tip: 20.00,
    status: 'Settled',
    cashier: 'MANAGER'
  },
  {
    billNo: 'RES-B-00104',
    tableNo: 'VIP-1',
    outlet: 'RESTAURANT',
    shift: 'Shift 2',
    time: '21:30',
    date: '08-FEB-2022',
    server: 'Kaushik',
    pax: 6,
    gross: 4500.00,
    discount: 450.00,
    taxable: 4050.00,
    cgst: 101.25,
    sgst: 101.25,
    roundOff: 0.50,
    netPayable: 4253.00,
    settlementMode: 'City Ledger',
    company: 'Vedanta Alumina Ltd',
    tip: 0.00,
    status: 'Settled',
    cashier: 'MANAGER'
  }
];

// Void & Cancellation audit log (Videos 05 & 06)
const INITIAL_VOID_RECORDS = [
  {
    voucherNo: 'VD-2022-001',
    kotNo: 'KOT-1042',
    tableNo: '10',
    outlet: 'RESTAURANT',
    date: '08-FEB-2022',
    time: '12:48',
    itemCode: '2',
    itemName: 'Tandoori Chicken (Full)',
    origQty: 2,
    cancelledQty: 1,
    unitRate: 450.00,
    lossValue: 450.00,
    reason: 'Guest Refused',
    remarks: 'Guest felt waiting time too high',
    steward: 'Kaushik',
    authBy: 'MANAGER'
  },
  {
    voucherNo: 'VD-2022-002',
    kotNo: 'KOT-1049',
    tableNo: '4',
    outlet: 'RESTAURANT',
    date: '08-FEB-2022',
    time: '13:30',
    itemCode: '8',
    itemName: 'Garlic Naan Butter',
    origQty: 4,
    cancelledQty: 2,
    unitRate: 65.00,
    lossValue: 130.00,
    reason: 'Wrong Entry',
    remarks: 'Steward wrongly punched 4 instead of 2',
    steward: 'Ajay',
    authBy: 'MANAGER'
  },
  {
    voucherNo: 'VD-2022-003',
    kotNo: 'KOT-1055',
    tableNo: '7',
    outlet: 'RESTAURANT',
    date: '08-FEB-2022',
    time: '14:10',
    itemCode: '15',
    itemName: 'Fresh Prawns Masala',
    origQty: 1,
    cancelledQty: 1,
    unitRate: 520.00,
    lossValue: 520.00,
    reason: 'Out of Stock',
    remarks: 'Kitchen informed seafood item depleted',
    steward: 'Bijay',
    authBy: 'CHEF'
  },
  {
    voucherNo: 'VD-2022-004',
    kotNo: 'KOT-1061',
    tableNo: '12',
    outlet: 'RESTAURANT',
    date: '08-FEB-2022',
    time: '20:45',
    itemCode: 'ALL',
    itemName: 'Full KOT Void (3 Items)',
    origQty: 3,
    cancelledQty: 3,
    unitRate: 850.00,
    lossValue: 850.00,
    reason: 'Guest Refused',
    remarks: 'Table cancelled order after 30 min kitchen delay',
    steward: 'Rahul',
    authBy: 'MANAGER'
  }
];

// NC (Non-Chargeable) consumption records (Videos 07 & 08)
const INITIAL_NC_RECORDS = [
  {
    ncKotNo: 'NC-KOT-089',
    ncBillNo: 'NC-B-0012',
    date: '08-FEB-2022',
    time: '13:00',
    outlet: 'RESTAURANT',
    department: 'GM Complimentary',
    officer: 'General Manager',
    beneficiary: 'VIP Guest - Railway Inspector',
    items: 'Veg Thali Deluxe x 2, Sweet Lassi x 2',
    qty: 4,
    foodCostRate: 320.00,
    authSignature: 'GM/APPROVED'
  },
  {
    ncKotNo: 'NC-KOT-090',
    ncBillNo: 'NC-B-0013',
    date: '08-FEB-2022',
    time: '16:30',
    outlet: 'RESTAURANT',
    department: 'Food Tasting',
    officer: 'Executive Chef',
    beneficiary: 'Kitchen Quality Audit',
    items: 'Paneer Butter Masala Sample, Biryani Rice Sample',
    qty: 2,
    foodCostRate: 145.00,
    authSignature: 'CHEF/AUDIT'
  },
  {
    ncKotNo: 'NC-KOT-091',
    ncBillNo: 'NC-B-0014',
    date: '08-FEB-2022',
    time: '21:00',
    outlet: 'RESTAURANT',
    department: 'Executive Office',
    officer: 'Owner (Raju Anna)',
    beneficiary: 'Business Partners Meeting',
    items: 'Tea, Coffee, Mixed Veg Pakoda x 3',
    qty: 5,
    foodCostRate: 210.00,
    authSignature: 'MGMT/APPROVED'
  },
  {
    ncKotNo: 'NC-KOT-092',
    ncBillNo: 'NC-B-0015',
    date: '08-FEB-2022',
    time: '23:30',
    outlet: 'RESTAURANT',
    department: 'Staff Duty Meal',
    officer: 'Night Auditor',
    beneficiary: 'Night Shift Duty Staff (3 pax)',
    items: 'Egg Curry, Dal Tadka, Rice, Roti',
    qty: 6,
    foodCostRate: 270.00,
    authSignature: 'NA/DUTY'
  }
];

// Server / Steward productivity records (Videos 18 & 19)
const INITIAL_SERVER_RECORDS = [
  {
    serverCode: '001',
    name: 'Kaushik',
    status: 'Active',
    tablesServed: 14,
    covers: 38,
    kotsPunched: 26,
    grossSales: 16850.00,
    apc: 443.42,
    commissionPct: 2.0,
    commissionEarned: 337.00
  },
  {
    serverCode: '002',
    name: 'Ajay',
    status: 'Active',
    tablesServed: 11,
    covers: 29,
    kotsPunched: 19,
    grossSales: 11420.00,
    apc: 393.79,
    commissionPct: 2.0,
    commissionEarned: 228.40
  },
  {
    serverCode: '003',
    name: 'Bijay',
    status: 'Active',
    tablesServed: 9,
    covers: 22,
    kotsPunched: 15,
    grossSales: 8940.00,
    apc: 406.36,
    commissionPct: 2.0,
    commissionEarned: 178.80
  },
  {
    serverCode: '004',
    name: 'Rahul',
    status: 'Active',
    tablesServed: 7,
    covers: 18,
    kotsPunched: 12,
    grossSales: 6300.00,
    apc: 350.00,
    commissionPct: 2.0,
    commissionEarned: 126.00
  },
  {
    serverCode: '101',
    name: 'Biren',
    status: 'Active',
    tablesServed: 12,
    covers: 31,
    kotsPunched: 21,
    grossSales: 13950.00,
    apc: 450.00,
    commissionPct: 2.0,
    commissionEarned: 279.00
  }
];

// Menu group & item sales records (Videos 14 & 20)
const INITIAL_MENU_SALES = [
  { group: 'MAIN COURSE', code: '1', name: 'Steamed Rice', kitchen: 'Main Kitchen', qtySold: 42, uom: 'Plate', price: 90.00, revenue: 3780.00, cost: 1050.00, marginPct: 72.2 },
  { group: 'MAIN COURSE', code: '2', name: 'Tandoori Chicken', kitchen: 'Main Kitchen', qtySold: 28, uom: 'Full', price: 450.00, revenue: 12600.00, cost: 4480.00, marginPct: 64.4 },
  { group: 'BEVERAGES', code: '3', name: 'Mineral Water 1L', kitchen: 'Pantry', qtySold: 65, uom: 'Bottle', price: 30.00, revenue: 1950.00, cost: 975.00, marginPct: 50.0 },
  { group: 'INDIAN BREADS', code: '8', name: 'Butter Naan', kitchen: 'Main Kitchen', qtySold: 84, uom: 'Piece', price: 55.00, revenue: 4620.00, cost: 924.00, marginPct: 80.0 },
  { group: 'STARTERS', code: '12', name: 'Paneer Tikka', kitchen: 'Main Kitchen', qtySold: 19, uom: 'Plate', price: 260.00, revenue: 4940.00, cost: 1580.00, marginPct: 68.0 },
  { group: 'LIQUOR BAR', code: '105', name: 'Kingfisher Premium 650ml', kitchen: 'Bar Counter', qtySold: 36, uom: 'Bottle', price: 280.00, revenue: 10080.00, cost: 4680.00, marginPct: 53.6 }
];

export default function IdsPosReportsModal({
  isOpen,
  onClose,
  initialTab = 'shift-sales',
  accountingDate = '08-FEB-2022',
  currentUser = 'MANAGER'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filterOutlet, setFilterOutlet] = useState('ALL');
  const [filterShift, setFilterShift] = useState('ALL');
  const [filterSearch, setFilterSearch] = useState('');
  const [fromDate, setFromDate] = useState('08-FEB-2022');
  const [toDate, setToDate] = useState('08-FEB-2022');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  if (!isOpen) return null;

  // Filter Sales
  const filteredSales = INITIAL_SALES_RECORDS.filter(r => {
    if (filterOutlet !== 'ALL' && r.outlet !== filterOutlet) return false;
    if (filterShift !== 'ALL' && r.shift !== filterShift) return false;
    if (filterSearch && !r.billNo.toLowerCase().includes(filterSearch.toLowerCase()) && !r.server.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalGross = filteredSales.reduce((acc, r) => acc + r.gross, 0);
  const totalTaxable = filteredSales.reduce((acc, r) => acc + r.taxable, 0);
  const totalCgst = filteredSales.reduce((acc, r) => acc + r.cgst, 0);
  const totalSgst = filteredSales.reduce((acc, r) => acc + r.sgst, 0);
  const totalNet = filteredSales.reduce((acc, r) => acc + r.netPayable, 0);
  const totalTips = filteredSales.reduce((acc, r) => acc + r.tip, 0);
  const cashTotal = filteredSales.filter(r => r.settlementMode === 'Cash').reduce((acc, r) => acc + r.netPayable, 0);
  const cardTotal = filteredSales.filter(r => r.settlementMode === 'Credit Card').reduce((acc, r) => acc + r.netPayable, 0);
  const folioTotal = filteredSales.filter(r => r.settlementMode === 'Room Folio').reduce((acc, r) => acc + r.netPayable, 0);
  const ledgerTotal = filteredSales.filter(r => r.settlementMode === 'City Ledger').reduce((acc, r) => acc + r.netPayable, 0);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'shift-sales') {
      csvContent += "Bill No,Table No,Outlet,Shift,Server,Pax,Gross,Discount,Taxable,CGST,SGST,Net Payable,Settlement Mode,Tip\n";
      filteredSales.forEach(r => {
        csvContent += `${r.billNo},${r.tableNo},${r.outlet},${r.shift},${r.server},${r.pax},${r.gross},${r.discount},${r.taxable},${r.cgst},${r.sgst},${r.netPayable},${r.settlementMode},${r.tip}\n`;
      });
    } else if (activeTab === 'void-audit') {
      csvContent += "Voucher No,KOT No,Table,Item Name,Orig Qty,Cancelled Qty,Unit Rate,Loss Value,Reason,Remarks,Steward,Auth By\n";
      INITIAL_VOID_RECORDS.forEach(r => {
        csvContent += `${r.voucherNo},${r.kotNo},${r.tableNo},"${r.itemName}",${r.origQty},${r.cancelledQty},${r.unitRate},${r.lossValue},"${r.reason}","${r.remarks}",${r.steward},${r.authBy}\n`;
      });
    } else if (activeTab === 'nc-ledger') {
      csvContent += "NC KOT No,NC Bill No,Department,Officer,Beneficiary,Items,Qty,Food Cost Rate,Auth\n";
      INITIAL_NC_RECORDS.forEach(r => {
        csvContent += `${r.ncKotNo},${r.ncBillNo},"${r.department}","${r.officer}","${r.beneficiary}","${r.items}",${r.qty},${r.foodCostRate},"${r.authSignature}"\n`;
      });
    } else if (activeTab === 'server-perf') {
      csvContent += "Server Code,Name,Status,Tables Served,Covers,KOTs Punched,Gross Sales,APC,Commission Pct,Commission Earned\n";
      INITIAL_SERVER_RECORDS.forEach(r => {
        csvContent += `${r.serverCode},${r.name},${r.status},${r.tablesServed},${r.covers},${r.kotsPunched},${r.grossSales},${r.apc},${r.commissionPct},${r.commissionEarned}\n`;
      });
    } else if (activeTab === 'menu-sales') {
      csvContent += "Menu Group,Item Code,Item Name,Kitchen,Qty Sold,UOM,Price,Revenue,Cost,Margin Pct\n";
      INITIAL_MENU_SALES.forEach(r => {
        csvContent += `"${r.group}",${r.code},"${r.name}","${r.kitchen}",${r.qtySold},${r.uom},${r.price},${r.revenue},${r.cost},${r.marginPct}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDS_POS_Report_${activeTab}_${accountingDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="ids-modal-overlay"
      style={{
        zIndex: 1400,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}
    >
      <div
        className="ids-dialog-window"
        style={{
          width: '1060px',
          maxWidth: '98vw',
          maxHeight: '94vh',
          background: '#ECE9D8',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar */}
        <div
          className="ids-dialog-titlebar plain"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFF',
            padding: '3px 8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>📊</span>
            <span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.4px' }}>
              Point of Sale Statutory & Management Reports V6.5.004.2 — Hotel Elite Inn
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#D4D0C8',
              border: '1px solid #FFF',
              borderRightColor: '#404040',
              borderBottomColor: '#404040',
              width: '18px',
              height: '18px',
              lineHeight: '14px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: '#ECE9D8',
            borderBottom: '2px solid #716F64',
            padding: '6px 8px 0 8px'
          }}
        >
          {[
            { id: 'shift-sales', label: '1. POS Shift Sales Register' },
            { id: 'void-audit', label: '2. KOT Void & Cancellation Audit' },
            { id: 'nc-ledger', label: '3. NC Department Cost Ledger' },
            { id: 'server-perf', label: '4. Server Sales & Commission' },
            { id: 'menu-sales', label: '5. Menu Item Engineering Sales' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: activeTab === tab.id ? 700 : 400,
                background: activeTab === tab.id ? '#FFF' : '#E0DFD8',
                border: '1px solid #716F64',
                borderBottom: activeTab === tab.id ? '2px solid #FFF' : '1px solid #716F64',
                marginBottom: activeTab === tab.id ? '-2px' : '0px',
                cursor: 'pointer',
                borderRadius: '3px 3px 0 0'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            background: '#F0EFE7',
            padding: '6px 12px',
            borderBottom: '1px solid #D4D0C8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <span style={{ fontWeight: 600, marginRight: '4px' }}>Date:</span>
              <input
                type="text"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ width: '85px', padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
              <span style={{ margin: '0 4px' }}>to</span>
              <input
                type="text"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ width: '85px', padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
            </div>

            <div>
              <span style={{ fontWeight: 600, marginRight: '4px' }}>Outlet:</span>
              <select
                value={filterOutlet}
                onChange={e => setFilterOutlet(e.target.value)}
                style={{ padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              >
                <option value="ALL">All Outlets</option>
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="ROOM SERVICE">ROOM SERVICE</option>
                <option value="BANQUET">BANQUET HALL</option>
              </select>
            </div>

            {activeTab === 'shift-sales' && (
              <div>
                <span style={{ fontWeight: 600, marginRight: '4px' }}>Shift:</span>
                <select
                  value={filterShift}
                  onChange={e => setFilterShift(e.target.value)}
                  style={{ padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
                >
                  <option value="ALL">All Shifts</option>
                  <option value="Shift 1">Shift 1 (Day)</option>
                  <option value="Shift 2">Shift 2 (Evening)</option>
                  <option value="Shift 3">Shift 3 (Night)</option>
                </select>
              </div>
            )}

            <div>
              <span style={{ fontWeight: 600, marginRight: '4px' }}>Filter:</span>
              <input
                type="text"
                placeholder="Search..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                style={{ width: '100px', padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPreviewModalOpen(true)}
              style={{
                background: '#ECE9D8',
                border: '2px solid #FFF',
                borderRightColor: '#716F64',
                borderBottomColor: '#716F64',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🖨️ Print Preview
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                background: '#ECE9D8',
                border: '2px solid #FFF',
                borderRightColor: '#716F64',
                borderBottomColor: '#716F64',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Content Body Area */}
        <div style={{ padding: '8px 10px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: POS SHIFT SALES REGISTER */}
          {activeTab === 'shift-sales' && (
            <div>
              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Gross Sales</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹{totalGross.toFixed(2)}</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>CGST (2.5%) / SGST (2.5%)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#006600' }}>₹{(totalCgst + totalSgst).toFixed(2)}</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Net Billed (Payable)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#B00' }}>₹{totalNet.toFixed(2)}</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Cash / Card Split</div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>C: ₹{cashTotal.toFixed(0)} | D: ₹{cardTotal.toFixed(0)}</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Room / City Ledger</div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>Rm: ₹{folioTotal.toFixed(0)} | CL: ₹{ledgerTotal.toFixed(0)}</div>
                </div>
              </div>

              {/* Grid Table */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '380px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#0A246A', color: '#FFF', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Bill #</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>Tbl</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Outlet</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Server</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>Pax</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Gross</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Disc</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Taxable</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>CGST</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>SGST</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Net Total</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Tender</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Tip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFF' : '#F7F7F7', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '3px 4px', fontWeight: 600, color: '#0A246A' }}>{r.billNo}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.tableNo}</td>
                        <td style={{ padding: '3px 4px' }}>{r.outlet}</td>
                        <td style={{ padding: '3px 4px' }}>{r.server}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.pax}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>{r.gross.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', color: r.discount > 0 ? '#B00' : '#888' }}>
                          {r.discount.toFixed(2)}
                        </td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>{r.taxable.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>{r.cgst.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>{r.sgst.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                          ₹{r.netPayable.toFixed(2)}
                        </td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>
                          {r.settlementMode} {r.roomNo ? `(Rm ${r.roomNo})` : ''}
                        </td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', color: '#006600' }}>
                          {r.tip > 0 ? `₹${r.tip.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', fontWeight: 700, borderTop: '2px solid #716F64' }}>
                      <td colSpan="5" style={{ padding: '4px', textAlign: 'right' }}>Grand Total ({filteredSales.length} Bills):</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{totalGross.toFixed(2)}</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#B00' }}>
                        ₹{filteredSales.reduce((a, b) => a + b.discount, 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{totalTaxable.toFixed(2)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{totalCgst.toFixed(2)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{totalSgst.toFixed(2)}</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#B00' }}>₹{totalNet.toFixed(2)}</td>
                      <td colSpan="1"></td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#006600' }}>₹{totalTips.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: KOT VOID & CANCELLATION AUDIT (VIDEOS 05 & 06) */}
          {activeTab === 'void-audit' && (
            <div>
              <div style={{ background: '#FFF8E7', border: '1px solid #FFE082', padding: '6px 10px', marginBottom: '8px', fontSize: '11px' }}>
                <span style={{ fontWeight: 700, color: '#B78103' }}>⚠️ Statutory Internal Control Audit Note:</span> All line deletions via <code>&lt;F5&gt;</code> and entire KOT voidings are permanently logged with mandatory reasons to prevent waiter pilferage.
              </div>

              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '420px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#8B0000', color: '#FFF', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Voucher #</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>KOT #</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #600' }}>Tbl</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Time</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Cancelled Item</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #600' }}>Orig</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #600' }}>Canc</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #600' }}>Unit Rate</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #600' }}>Loss Value</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Reason Code</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Remarks</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Steward</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #600' }}>Auth By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_VOID_RECORDS.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFF' : '#FFF5F5', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '3px 4px', fontWeight: 600, color: '#8B0000' }}>{r.voucherNo}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.kotNo}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.tableNo}</td>
                        <td style={{ padding: '3px 4px' }}>{r.time}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.itemName}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.origQty}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center', color: '#B00', fontWeight: 700 }}>{r.cancelledQty}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>₹{r.unitRate.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 700, color: '#B00' }}>₹{r.lossValue.toFixed(2)}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>
                          <span style={{ background: '#FFE4E1', color: '#8B0000', padding: '1px 4px', borderRadius: '2px' }}>
                            {r.reason}
                          </span>
                        </td>
                        <td style={{ padding: '3px 4px', color: '#555' }}>{r.remarks}</td>
                        <td style={{ padding: '3px 4px' }}>{r.steward}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.authBy}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', fontWeight: 700, borderTop: '2px solid #716F64' }}>
                      <td colSpan="8" style={{ padding: '4px', textAlign: 'right' }}>Total Void Loss:</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#B00' }}>
                        ₹{INITIAL_VOID_RECORDS.reduce((a, b) => a + b.lossValue, 0).toFixed(2)}
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NC DEPARTMENT COST LEDGER (VIDEOS 07 & 08) */}
          {activeTab === 'nc-ledger' && (
            <div>
              <div style={{ background: '#E6F4EA', border: '1px solid #A8DAB5', padding: '6px 10px', marginBottom: '8px', fontSize: '11px' }}>
                <span style={{ fontWeight: 700, color: '#137333' }}>ℹ️ Internal Consumption Cost Ledger:</span> Non-Chargeable (NC) KOTs are priced at ₹0.00 to guests, but the food cost rate is posted directly to the beneficiary department's operational expense ledger.
              </div>

              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '420px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#2E7D32', color: '#FFF', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>NC KOT #</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>NC Bill #</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Time</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Department</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Officer Name</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Beneficiary / Purpose</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Consumed Items</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #1B5E20' }}>Qty</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #1B5E20' }}>Cost Rate Billed</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #1B5E20' }}>Auth Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_NC_RECORDS.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFF' : '#F4FAF5', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '3px 4px', fontWeight: 600, color: '#2E7D32' }}>{r.ncKotNo}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.ncBillNo}</td>
                        <td style={{ padding: '3px 4px' }}>{r.time}</td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.department}</td>
                        <td style={{ padding: '3px 4px' }}>{r.officer}</td>
                        <td style={{ padding: '3px 4px', color: '#444' }}>{r.beneficiary}</td>
                        <td style={{ padding: '3px 4px' }}>{r.items}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.qty}</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 700, color: '#1B5E20' }}>
                          ₹{r.foodCostRate.toFixed(2)}
                        </td>
                        <td style={{ padding: '3px 4px', fontWeight: 600 }}>{r.authSignature}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', fontWeight: 700, borderTop: '2px solid #716F64' }}>
                      <td colSpan="8" style={{ padding: '4px', textAlign: 'right' }}>Total Department Cost Incurred:</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#1B5E20' }}>
                        ₹{INITIAL_NC_RECORDS.reduce((a, b) => a + b.foodCostRate, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SERVER / STEWARD PRODUCTIVITY (VIDEOS 18 & 19) */}
          {activeTab === 'server-perf' && (
            <div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '420px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#0A246A', color: '#FFF', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Code</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Steward / Server</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>Status</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Tables</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Covers (Pax)</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>KOTs</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Gross Sales</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>APC (Avg/Cover)</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>Comm %</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Commission (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_SERVER_RECORDS.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFF' : '#F7F7F7', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '4px', fontWeight: 600 }}>{r.serverCode}</td>
                        <td style={{ padding: '4px', fontWeight: 600, color: '#0A246A' }}>{r.name}</td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>
                          <span style={{ color: r.status === 'Active' ? '#006600' : '#888', fontWeight: 600 }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.tablesServed}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.covers}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.kotsPunched}</td>
                        <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹{r.grossSales.toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>₹{r.apc.toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>{r.commissionPct}%</td>
                        <td style={{ padding: '4px', textAlign: 'right', color: '#006600', fontWeight: 700 }}>
                          ₹{r.commissionEarned.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', fontWeight: 700, borderTop: '2px solid #716F64' }}>
                      <td colSpan="3" style={{ padding: '4px', textAlign: 'right' }}>Staff Totals:</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{INITIAL_SERVER_RECORDS.reduce((a, b) => a + b.tablesServed, 0)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{INITIAL_SERVER_RECORDS.reduce((a, b) => a + b.covers, 0)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{INITIAL_SERVER_RECORDS.reduce((a, b) => a + b.kotsPunched, 0)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{INITIAL_SERVER_RECORDS.reduce((a, b) => a + b.grossSales, 0).toFixed(2)}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>-</td>
                      <td></td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#006600' }}>
                        ₹{INITIAL_SERVER_RECORDS.reduce((a, b) => a + b.commissionEarned, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MENU ITEM ENGINEERING (VIDEOS 14 & 20) */}
          {activeTab === 'menu-sales' && (
            <div>
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '420px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#0A246A', color: '#FFF', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Menu Group</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>Code</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Item Description</th>
                      <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #4060A0' }}>Kitchen</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Qty Sold</th>
                      <th style={{ padding: '4px', textAlign: 'center', border: '1px solid #4060A0' }}>UOM</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Rate (INR)</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Gross Revenue</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Food Cost</th>
                      <th style={{ padding: '4px', textAlign: 'right', border: '1px solid #4060A0' }}>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_MENU_SALES.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFF' : '#F7F7F7', borderBottom: '1px solid #E0E0E0' }}>
                        <td style={{ padding: '4px', fontWeight: 600 }}>{r.group}</td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>{r.code}</td>
                        <td style={{ padding: '4px', fontWeight: 600, color: '#0A246A' }}>{r.name}</td>
                        <td style={{ padding: '4px' }}>{r.kitchen}</td>
                        <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>{r.qtySold}</td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>{r.uom}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>₹{r.price.toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹{r.revenue.toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', color: '#B00' }}>₹{r.cost.toFixed(2)}</td>
                        <td style={{ padding: '4px', textAlign: 'right', color: '#006600', fontWeight: 700 }}>{r.marginPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', fontWeight: 700, borderTop: '2px solid #716F64' }}>
                      <td colSpan="7" style={{ padding: '4px', textAlign: 'right' }}>Total Menu Revenue:</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#0A246A' }}>
                        ₹{INITIAL_MENU_SALES.reduce((a, b) => a + b.revenue, 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#B00' }}>
                        ₹{INITIAL_MENU_SALES.reduce((a, b) => a + b.cost, 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#006600' }}>
                        {(
                          ((INITIAL_MENU_SALES.reduce((a, b) => a + b.revenue, 0) - INITIAL_MENU_SALES.reduce((a, b) => a + b.cost, 0)) /
                            INITIAL_MENU_SALES.reduce((a, b) => a + b.revenue, 0)) *
                          100
                        ).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Button Bar */}
        <div
          style={{
            background: '#ECE9D8',
            borderTop: '2px solid #FFF',
            padding: '6px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '11px', color: '#444' }}>
            Accounting Date: <b>{accountingDate}</b> | Active User: <b>{currentUser}</b> | Property: <b>{HOTEL_CONFIG.name}</b>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => window.print()}
              style={{
                background: '#ECE9D8',
                border: '2px solid #FFF',
                borderRightColor: '#716F64',
                borderBottomColor: '#716F64',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🖨️ Direct Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#ECE9D8',
                border: '2px solid #FFF',
                borderRightColor: '#716F64',
                borderBottomColor: '#716F64',
                padding: '3px 14px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
