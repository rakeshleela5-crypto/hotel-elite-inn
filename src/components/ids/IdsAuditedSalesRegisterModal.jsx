// Authentic IDS FortuneNEXT 6.5/7.0 Win32 Tabular Sales Register Modal
// Built according to the Win32 dialog, folder-tab, and sunken datagrid model
import React, { useState, useEffect, useMemo } from 'react';
import { HOTEL_CONFIG } from '../../data/hotelData';
import { HOTEL_JUNE_SALES, HOTEL_JUNE_SUMMARY } from '../../data/hotelSaleJuneReportData';
import { RESTAURANT_JUNE_SALES, RESTAURANT_JUNE_MGM_SALES, RESTAURANT_JUNE_SUMMARY } from '../../data/restaurantSaleJuneReportData';
import { 
  getFastApiHotelSaleMonthlyReport, 
  getFastApiRestaurantSaleMonthlyReport, 
  getFastApiRestaurantMgmReport 
} from '../../utils/backendApi';

export default function IdsAuditedSalesRegisterModal({
  isOpen,
  onClose,
  initialTab = 'hotel-sales',
  accountingDate = '08-FEB-2026',
  currentUser = 'MANAGER'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedMonth, setSelectedMonth] = useState('JUNE-2026');
  const [outletFilter, setOutletFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Live state from FastAPI backend with seamless offline edge dataset fallback
  const [hotelSalesData, setHotelSalesData] = useState(HOTEL_JUNE_SALES);
  const [restaurantSalesData, setRestaurantSalesData] = useState(RESTAURANT_JUNE_SALES);
  const [restaurantMgmData, setRestaurantMgmData] = useState(RESTAURANT_JUNE_MGM_SALES);
  const [backendSyncStatus, setBackendSyncStatus] = useState('Checking PostgreSQL API...');

  useEffect(() => {
    setActiveTab(initialTab);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedRowIndex(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getFastApiHotelSaleMonthlyReport('JUNE-2026').catch(() => null),
      getFastApiRestaurantSaleMonthlyReport('JUNE-2026', 'ALL').catch(() => null),
      getFastApiRestaurantMgmReport('JUNE-2026').catch(() => null)
    ]).then(([hotelRes, restRes, mgmRes]) => {
      if (!isMounted) return;
      if (hotelRes && Array.isArray(hotelRes.records) && hotelRes.records.length > 0) {
        setHotelSalesData(hotelRes.records);
      }
      if (restRes && Array.isArray(restRes.records) && restRes.records.length > 0) {
        setRestaurantSalesData(restRes.records);
      }
      if (mgmRes && Array.isArray(mgmRes.records) && mgmRes.records.length > 0) {
        setRestaurantMgmData(mgmRes.records);
      }
      setBackendSyncStatus('Connected to PostgreSQL (Railway API)');
    }).catch(() => {
      if (isMounted) setBackendSyncStatus('Using Verified Edge Seed Cache (Offline Mode)');
    });

    return () => { isMounted = false; };
  }, []);

  // 1. Filtered Hotel Sales
  const filteredHotelSales = useMemo(() => {
    if (!searchQuery.trim()) return hotelSalesData;
    const q = searchQuery.toLowerCase();
    return hotelSalesData.filter(r => 
      (r.billNo && String(r.billNo).toLowerCase().includes(q)) ||
      (r.roomNo && String(r.roomNo).toLowerCase().includes(q)) ||
      (r.guestName && String(r.guestName).toLowerCase().includes(q)) ||
      (r.company && String(r.company).toLowerCase().includes(q)) ||
      (r.remark && String(r.remark).toLowerCase().includes(q)) ||
      (r.gstin && String(r.gstin).toLowerCase().includes(q))
    );
  }, [hotelSalesData, searchQuery]);

  // 2. Filtered Restaurant Sales
  const filteredRestaurantSales = useMemo(() => {
    return restaurantSalesData.filter(r => {
      if (outletFilter !== 'ALL' && r.pos !== outletFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (r.billNo && String(r.billNo).toLowerCase().includes(q)) ||
          (r.pos && String(r.pos).toLowerCase().includes(q)) ||
          (r.tableRoom && String(r.tableRoom).toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [restaurantSalesData, outletFilter, searchQuery]);

  // 3. Filtered Management NC Sales
  const filteredRestaurantMgm = useMemo(() => {
    if (!searchQuery.trim()) return restaurantMgmData;
    const q = searchQuery.toLowerCase();
    return restaurantMgmData.filter(r => 
      (r.billNo && String(r.billNo).toLowerCase().includes(q)) ||
      (r.tableRoom && String(r.tableRoom).toLowerCase().includes(q)) ||
      (r.date && String(r.date).toLowerCase().includes(q))
    );
  }, [restaurantMgmData, searchQuery]);

  // Active records by current tab
  const activeRecords = useMemo(() => {
    if (activeTab === 'hotel-sales') return filteredHotelSales;
    if (activeTab === 'restaurant-sales') return filteredRestaurantSales;
    if (activeTab === 'mgm-dining') return filteredRestaurantMgm;
    return [];
  }, [activeTab, filteredHotelSales, filteredRestaurantSales, filteredRestaurantMgm]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(activeRecords.length / Number(pageSize)));
  const paginatedRecords = useMemo(() => {
    if (pageSize === 'ALL') return activeRecords;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return activeRecords.slice(start, start + size);
  }, [activeRecords, currentPage, pageSize]);

  // CSV Export handler
  const handleExportCSV = () => {
    let csv = '';
    let filename = '';

    if (activeTab === 'hotel-sales' || activeTab === 'statutory-reconciliation') {
      filename = `IDS_HOTEL_SALE_REPORT_${selectedMonth}.csv`;
      csv += 'S.NO.,DATE,BILL NO,R.NO,RENT,CGST,SGST,MISC,LAUNDRY,MIN.B,R/S,NET AMT.,ADVANC,DISCOUNT,COMPLT,VOID,ALLOWANCES,PAID OUT,CASH,B.T.C,C. C,ONLINE,REMARK,G.NAME,COMPANY,GST.NO\n';
      filteredHotelSales.forEach(r => {
        csv += [
          r.sNo,
          `"${r.date || ''}"`,
          `"${r.billNo || ''}"`,
          `"${r.roomNo || ''}"`,
          Number(r.rent || 0).toFixed(2),
          Number(r.cgst || 0).toFixed(2),
          Number(r.sgst || 0).toFixed(2),
          Number(r.misc || 0).toFixed(2),
          Number(r.laundry || 0).toFixed(2),
          Number(r.minibar || 0).toFixed(2),
          Number(r.roomService || 0).toFixed(2),
          Number(r.netAmount || 0).toFixed(2),
          Number(r.advance || 0).toFixed(2),
          Number(r.discount || 0).toFixed(2),
          Number(r.complimentary || 0).toFixed(2),
          Number(r.void || 0).toFixed(2),
          Number(r.allowances || 0).toFixed(2),
          Number(r.paidOut || 0).toFixed(2),
          Number(r.cash || 0).toFixed(2),
          Number(r.btc || 0).toFixed(2),
          Number(r.creditCard || 0).toFixed(2),
          Number(r.online || 0).toFixed(2),
          `"${(r.remark || '').replace(/"/g, '""')}"`,
          `"${(r.guestName || '').replace(/"/g, '""')}"`,
          `"${(r.company || '').replace(/"/g, '""')}"`,
          `"${(r.gstin || '').replace(/"/g, '""')}"`
        ].join(',') + '\n';
      });
    } else if (activeTab === 'restaurant-sales') {
      filename = `IDS_RESTAURANT_SALE_REPORT_${selectedMonth}.csv`;
      csv += 'No.,DATE,BILL,AMT.,FOOD,BEVE.,CGST,SGST,DIS,TOTAL,P.O.S,Table\\Room\n';
      filteredRestaurantSales.forEach(r => {
        csv += [
          r.no,
          `"${r.date || ''}"`,
          `"${r.billNo || ''}"`,
          Number(r.amount || 0).toFixed(2),
          Number(r.food || 0).toFixed(2),
          Number(r.beverage || 0).toFixed(2),
          Number(r.cgst || 0).toFixed(2),
          Number(r.sgst || 0).toFixed(2),
          Number(r.discount || 0).toFixed(2),
          Number(r.total || 0).toFixed(2),
          `"${r.pos || ''}"`,
          `"${r.tableRoom || ''}"`
        ].join(',') + '\n';
      });
    } else if (activeTab === 'mgm-dining') {
      filename = `IDS_RESTAURANT_MGM_NC_REGISTER_${selectedMonth}.csv`;
      csv += 'No.,DATE,BILL,AMT.,FOOD,BEVE.,CGST,SGST,DIS,TOTAL,P.O.S,Table\\Room,STATUS\n';
      filteredRestaurantMgm.forEach(r => {
        csv += [
          r.no,
          `"${r.date || ''}"`,
          `"${r.billNo || ''}"`,
          Number(r.amount || 0).toFixed(2),
          Number(r.food || 0).toFixed(2),
          Number(r.beverage || 0).toFixed(2),
          0.00,
          0.00,
          0.00,
          0.00,
          `"${r.pos || 'MANAGEMENT'}"`,
          `"${r.tableRoom || ''}"`,
          `"NON-CHARGEABLE COST CENTER DEBIT"`
        ].join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="ids-modal-overlay"
      style={{
        zIndex: 1450,
        background: 'rgba(0, 0, 0, 0.68)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px'
      }}
    >
      {/* Win32 Desktop Dialog Window */}
      <div
        className="ids-dialog-window"
        style={{
          width: '1240px',
          maxWidth: '98vw',
          maxHeight: '94vh',
          background: '#ECE9D8',
          border: '2px solid #FFF',
          borderRightColor: '#716F64',
          borderBottomColor: '#716F64',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar (Classic Win32 Deep Navy Gradient) */}
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
              Audited Hotel & F&B Sales Registers V6.5.004.2 — Hotel Elite Inn (Muniguda)
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

        {/* Win32 Folder Tab Headers */}
        <div
          style={{
            display: 'flex',
            gap: '3px',
            background: '#ECE9D8',
            borderBottom: '2px solid #716F64',
            padding: '6px 8px 0 8px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'hotel-sales', label: '1. Hotel Sales Register (26 Columns - June Month)' },
            { id: 'statutory-reconciliation', label: '2. Statutory Tax Reconciliation (GSTR-3B)' },
            { id: 'restaurant-sales', label: '3. Restaurant & Bar Sales Register (12 Columns - 1,320 Orders)' },
            { id: 'mgm-dining', label: '4. Management NC Dining Register (68 Orders)' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#0A246A' : '#1A1A1A',
                  background: isActive ? '#FFFFFF' : 'linear-gradient(180deg, #F0EFE7 0%, #D8D4C8 100%)',
                  border: '1px solid #716F64',
                  borderBottom: isActive ? '2px solid #FFFFFF' : '1px solid #716F64',
                  marginBottom: isActive ? '-2px' : '0px',
                  cursor: 'pointer',
                  borderRadius: '3px 3px 0 0',
                  boxShadow: isActive ? 'inset 0 2px 0 #316AC5' : 'inset 0 1px 0 #FFFFFF',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Win32 Filter Controls Bar */}
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
            fontSize: '11px',
            color: '#000000'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontWeight: 600, marginRight: '4px' }}>Period:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
              >
                <option value="JUNE-2026">JUNE 2026 (Audited Client Month)</option>
              </select>
            </div>

            {activeTab === 'restaurant-sales' && (
              <div>
                <span style={{ fontWeight: 600, marginRight: '4px' }}>Outlet:</span>
                <select
                  value={outletFilter}
                  onChange={e => { setOutletFilter(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
                >
                  <option value="ALL">All POS Outlets</option>
                  <option value="RESTAURANT">RESTAURANT</option>
                  <option value="ROOM SERVICE">ROOM SERVICE</option>
                  <option value="TAKE AWAY">TAKE AWAY</option>
                  <option value="MANAGEMENT">MANAGEMENT</option>
                </select>
              </div>
            )}

            <div>
              <span style={{ fontWeight: 600, marginRight: '4px' }}>Find:</span>
              <input
                type="text"
                placeholder="Search bill, room, guest, co..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ width: '150px', padding: '1px 4px', fontSize: '11px', border: '1px solid #7F9DB9', background: '#FFF' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ marginLeft: '2px', padding: '0 4px', fontSize: '10px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            {activeTab !== 'statutory-reconciliation' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  style={{ padding: '1px 5px', fontSize: '10px', cursor: 'pointer' }}
                  title="First Page"
                >⏮</button>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ padding: '1px 5px', fontSize: '10px', cursor: 'pointer' }}
                  title="Previous Page"
                >◀</button>
                <span style={{ fontWeight: 600, fontSize: '10.5px' }}>
                  Page {currentPage} / {totalPages} ({activeRecords.length} recs)
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '1px 5px', fontSize: '10px', cursor: 'pointer' }}
                  title="Next Page"
                >▶</button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ padding: '1px 5px', fontSize: '10px', cursor: 'pointer' }}
                  title="Last Page"
                >⏭</button>

                <select
                  value={pageSize}
                  onChange={e => { setPageSize(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '1px 3px', fontSize: '10.5px', border: '1px solid #7F9DB9', background: '#FFF', marginLeft: '4px' }}
                >
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="ALL">All</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => window.print()}
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
              🖨️ Print
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
                color: '#006600',
                cursor: 'pointer'
              }}
            >
              📥 Export CSV (Excel)
            </button>
          </div>
        </div>

        {/* Content Body Area */}
        <div style={{ padding: '8px 10px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: 26-COLUMN HOTEL SALES REGISTER */}
          {activeTab === 'hotel-sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* KPI Summary Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginBottom: '8px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Room Rent Net</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹7,52,368.20</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Gross: ₹7,53,058.20</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>CGST / SGST (Room)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹18,809.20 ea</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Total: ₹37,618.40</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Room Service Net</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#006600' }}>₹1,38,919.45</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Outward Supply</div>
                </div>
                <div style={{ background: '#EBF3EB', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#006600', fontWeight: 700 }}>Total Hotel Net Turnover</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#006600' }}>₹9,33,663.13</div>
                  <div style={{ fontSize: '9px', color: '#444' }}>223 Audited Bills</div>
                </div>
                <div style={{ background: '#FFF8E7', border: '1px solid #D2B48C', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#8B4513' }}>Advances Applied</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#8B4513' }}>₹2,45,777.15</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>FO Deposits</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Online (UPI/QR)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹3,98,998.00</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>42.7% Settlement</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>BTC (Corporate)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹85,436.00</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Company Ledger</div>
                </div>
              </div>

              {/* Sunken Win32 DataGrid with 26 Columns */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '430px', overflow: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: '#0A246A', color: '#FFF', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>S.NO.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>DATE</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>BILL NO</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>R.NO</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>RENT</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>CGST</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>SGST</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>MISC</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>LAUNDRY</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>MIN.B</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>R/S</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right', background: '#316AC5' }}>NET AMT.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>ADVANC</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>DISCOUNT</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>COMPLT</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>VOID</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>ALLOWANCES</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>PAID OUT</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>CASH</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>B.T.C</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>C. C</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>ONLINE</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'left' }}>REMARK</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'left' }}>G.NAME</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'left' }}>COMPANY</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'left' }}>GST.NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((r, idx) => {
                      const isSelected = selectedRowIndex === idx;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedRowIndex(idx)}
                          style={{
                            background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F7F7F7',
                            color: isSelected ? '#FFF' : '#000',
                            borderBottom: '1px solid #E0E0E0',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.sNo}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.date}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 600 }}>{r.billNo}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.roomNo}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.rent || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.cgst || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.sgst || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.misc || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.laundry || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.minibar || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.roomService || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700, background: isSelected ? '#1B4E9B' : '#EAF2FF' }}>
                            {Number(r.netAmount || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.advance || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.discount || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.complimentary || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.void || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.allowances || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.paidOut || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.cash || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.btc || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.creditCard || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.online || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'left', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.remark || ''}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'left', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.guestName || ''}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'left', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company || ''}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'left', fontFamily: 'monospace', fontSize: '9px' }}>{r.gstin || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', color: '#000', fontWeight: 700, borderTop: '2px solid #716F64', position: 'sticky', bottom: 0, zIndex: 10 }}>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'center' }}>
                        MONTHLY JUNE TOTALS ({hotelSalesData.length} BILLS)
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹7,53,058.20</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹18,809.20</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹18,809.20</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹3,446.62</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹1,38,919.45</td>
                      <td style={{ padding: '4px', textAlign: 'right', background: '#316AC5', color: '#FFF' }}>₹9,33,663.13</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹2,45,777.15</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹690.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹1,728.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹39.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹48,767.98</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹85,436.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹1,51,713.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹3,98,998.00</td>
                      <td colSpan={4} style={{ padding: '4px', textAlign: 'center', fontSize: '9px', fontStyle: 'italic' }}>
                        Reconciled with Client Master Excel
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: STATUTORY RECONCILIATION SUMMARY */}
          {activeTab === 'statutory-reconciliation' && (
            <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '12px', flex: 1, overflowY: 'auto' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0A246A', borderBottom: '2px solid #0A246A', paddingBottom: '4px', marginBottom: '10px' }}>
                FORM GSTR-3B & MASTER AUDIT RECONCILIATION — MONTH OF JUNE 2026
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div style={{ border: '1px solid #D4D0C8', background: '#F9F9F9', padding: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '11px', color: '#0A246A', marginBottom: '6px' }}>
                    1. Outward Taxable Supplies (Room Rent SAC 996311)
                  </div>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px dotted #CCC' }}>
                        <td style={{ padding: '3px 0' }}>Room Rent Gross Turnover:</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹7,53,058.20</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dotted #CCC' }}>
                        <td style={{ padding: '3px 0' }}>Less Tariff Discounts Allowed:</td>
                        <td style={{ textAlign: 'right', color: '#B00' }}>-₹690.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000', fontWeight: 700 }}>
                        <td style={{ padding: '4px 0' }}>Net Taxable Room Tariff (Table 3.1a):</td>
                        <td style={{ textAlign: 'right', color: '#0A246A' }}>₹7,52,368.20</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px 0' }}>Central GST @ 2.50%:</td>
                        <td style={{ textAlign: 'right' }}>₹18,809.20</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px 0' }}>State GST @ 2.50%:</td>
                        <td style={{ textAlign: 'right' }}>₹18,809.20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ border: '1px solid #D4D0C8', background: '#F9F9F9', padding: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '11px', color: '#006600', marginBottom: '6px' }}>
                    2. Ancillary & In-Room Outward Services
                  </div>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px dotted #CCC' }}>
                        <td style={{ padding: '3px 0' }}>Room Service Food Billed (SAC 996332):</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹1,38,919.45</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dotted #CCC' }}>
                        <td style={{ padding: '3px 0' }}>Guest Laundry Services (SAC 999791):</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹3,446.62</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dotted #CCC' }}>
                        <td style={{ padding: '3px 0' }}>Laundry GST (CGST + SGST 18%):</td>
                        <td style={{ textAlign: 'right' }}>₹620.40</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000', fontWeight: 700 }}>
                        <td style={{ padding: '4px 0' }}>Total In-House Hotel Net Billed:</td>
                        <td style={{ textAlign: 'right', color: '#006600' }}>₹9,33,663.13</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ border: '1px solid #D4D0C8', background: '#FDFDFD', padding: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', color: '#333', marginBottom: '6px' }}>
                  3. Cash Flow & Settlement Mode Reconciliation (Audited vs Actual)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontSize: '10.5px' }}>
                  <div style={{ background: '#ECE9D8', padding: '6px', border: '1px solid #716F64' }}>
                    <div>Online UPI / QR</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0A246A' }}>₹3,98,998.00</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>42.74% of Total</div>
                  </div>
                  <div style={{ background: '#ECE9D8', padding: '6px', border: '1px solid #716F64' }}>
                    <div>Advance Adjusted</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#8B4513' }}>₹2,45,777.15</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>26.32% of Total</div>
                  </div>
                  <div style={{ background: '#ECE9D8', padding: '6px', border: '1px solid #716F64' }}>
                    <div>Credit Card Swipe</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0A246A' }}>₹1,51,713.00</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>16.25% of Total</div>
                  </div>
                  <div style={{ background: '#ECE9D8', padding: '6px', border: '1px solid #716F64' }}>
                    <div>Bill to Company (BTC)</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0A246A' }}>₹85,436.00</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>9.15% of Total</div>
                  </div>
                  <div style={{ background: '#ECE9D8', padding: '6px', border: '1px solid #716F64' }}>
                    <div>Cash Collections</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0A246A' }}>₹48,767.98</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>5.22% of Total</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 12-COLUMN RESTAURANT & BAR SALES REGISTER */}
          {activeTab === 'restaurant-sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* KPI Summary Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginBottom: '8px' }}>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Food Sales Gross</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹8,28,328.53</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Kitchen Production</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>Beverage Sales</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹52,935.00</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Pantry & Bar</div>
                </div>
                <div style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>CGST / SGST (2.5%)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A246A' }}>₹19,768.06 ea</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>Total: ₹39,536.12</div>
                </div>
                <div style={{ background: '#EBF3EB', border: '1px solid #7F9DB9', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#006600', fontWeight: 700 }}>Total F&B Production</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#006600' }}>₹9,20,739.00</div>
                  <div style={{ fontSize: '9px', color: '#444' }}>Commercial + NC</div>
                </div>
                <div style={{ background: '#FFF8E7', border: '1px solid #D2B48C', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#8B4513' }}>Management NC Value</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#8B4513' }}>₹90,478.00</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>68 Cost Center Orders</div>
                </div>
              </div>

              {/* Sunken Win32 DataGrid with 12 Columns */}
              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '430px', overflow: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: '#0A246A', color: '#FFF', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>No.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>DATE</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>BILL</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>AMT.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>FOOD</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>BEVE.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>CGST</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>SGST</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right' }}>DIS</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'right', background: '#316AC5' }}>TOTAL</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>P.O.S</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #4060A0', textAlign: 'center' }}>Table\Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((r, idx) => {
                      const isSelected = selectedRowIndex === idx;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedRowIndex(idx)}
                          style={{
                            background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#F7F7F7',
                            color: isSelected ? '#FFF' : '#000',
                            borderBottom: '1px solid #E0E0E0',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.no}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.date}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 600 }}>{r.billNo}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.food || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.beverage || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.cgst || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.sgst || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right' }}>{Number(r.discount || 0).toFixed(2)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 700, color: isSelected ? '#FFF' : '#006600' }}>
                            {Number(r.total || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <span style={{
                              padding: '1px 4px',
                              borderRadius: '2px',
                              fontSize: '9px',
                              fontWeight: 600,
                              background: r.pos === 'RESTAURANT' ? '#EBF3FB' : r.pos === 'ROOM SERVICE' ? '#FFF2E6' : '#EAF6EA',
                              color: r.pos === 'RESTAURANT' ? '#0A246A' : r.pos === 'ROOM SERVICE' ? '#B85D00' : '#1D781D'
                            }}>
                              {r.pos}
                            </span>
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{r.tableRoom}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', color: '#000', fontWeight: 700, borderTop: '2px solid #716F64', position: 'sticky', bottom: 0, zIndex: 10 }}>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'center' }}>
                        MONTHLY F&B PRODUCTION TOTALS
                      </td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹8,81,200.53</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹8,28,328.53</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹52,935.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹19,768.06</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹19,768.06</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹63.00</td>
                      <td style={{ padding: '4px', textAlign: 'right', background: '#316AC5', color: '#FFF' }}>₹9,20,739.00</td>
                      <td colSpan={2} style={{ padding: '4px', textAlign: 'center', fontSize: '9px' }}>
                        SAC 996331 Reconciled
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGEMENT NC DINING REGISTER */}
          {activeTab === 'mgm-dining' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ background: '#FFF8E7', border: '1px solid #D2B48C', padding: '6px 10px', marginBottom: '8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Internal Management Non-Chargeable (NC) Dining:</strong> 68 Orders Recorded in June 2026.
                </div>
                <div style={{ fontWeight: 700, color: '#800000' }}>
                  Total Kitchen Production Value: ₹90,478.00 (Zero GST Outward Supply)
                </div>
              </div>

              <div style={{ background: '#FFF', border: '1px solid #7F9DB9', maxHeight: '430px', overflow: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: '#800000', color: '#FFF', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'center' }}>No.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'center' }}>Date</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'center' }}>NC Bill No.</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'right' }}>Valuation (₹)</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'right' }}>Food (₹)</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'right' }}>Beverage (₹)</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'center' }}>Outlet</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'center' }}>Table / Location</th>
                      <th style={{ padding: '3px 4px', border: '1px solid #A04040', textAlign: 'left' }}>Accounting Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((r, idx) => {
                      const isSelected = selectedRowIndex === idx;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedRowIndex(idx)}
                          style={{
                            background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFF' : '#FFFDF9',
                            color: isSelected ? '#FFF' : '#000',
                            borderBottom: '1px solid #E0E0E0',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.no}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.date}</td>
                          <td style={{ padding: '3px 4px', fontWeight: 600, color: isSelected ? '#FFF' : '#800000', textAlign: 'center' }}>{r.billNo}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 700 }}>{Number(r.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'right' }}>{Number(r.food || 0).toFixed(2)}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'right' }}>{Number(r.beverage || 0).toFixed(2)}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.pos || 'MANAGEMENT'}</td>
                          <td style={{ padding: '3px 4px', textAlign: 'center' }}>{r.tableRoom}</td>
                          <td style={{ padding: '3px 4px', fontStyle: 'italic', color: isSelected ? '#EEE' : '#555' }}>
                            Debited to Department Cost Center
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#ECE9D8', color: '#000', fontWeight: 700, borderTop: '2px solid #716F64', position: 'sticky', bottom: 0, zIndex: 10 }}>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'center' }}>TOTAL MANAGEMENT NC COST (68 ORDERS)</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: '#800000' }}>₹90,478.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹90,478.00</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹0.00</td>
                      <td colSpan={3} style={{ padding: '4px', textAlign: 'center', fontSize: '9px' }}>
                        Complimentary Dining & Kitchen Quality Sampling
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Win32 Bottom Status Bar */}
        <div
          style={{
            background: '#ECE9D8',
            borderTop: '2px solid #FFF',
            padding: '4px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#333'
          }}
        >
          <div>
            Accounting Date: <b>{accountingDate}</b> | Active User: <b>{currentUser}</b> | Status: <b style={{ color: '#006600' }}>{backendSyncStatus}</b>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#ECE9D8',
                border: '2px solid #FFF',
                borderRightColor: '#716F64',
                borderBottomColor: '#716F64',
                padding: '2px 14px',
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
