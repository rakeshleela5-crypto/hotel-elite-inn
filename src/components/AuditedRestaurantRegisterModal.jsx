import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, Download, Printer, Search, CheckCircle2, 
  AlertTriangle, Filter, Calendar, Building2, CreditCard, 
  DollarSign, ArrowUpDown, X, RefreshCw, Eye, ShieldCheck,
  Layers, Sparkles, ChevronDown, ChevronUp, Check,
  ExternalLink, FileCode, CheckCheck, Clock, Calculator, Info, Copy, FileText, MessageCircle,
  Coffee, ShoppingBag, Bed, UserCheck, FileSpreadsheet
} from 'lucide-react';
import { 
  JUNE_2026_RESTAURANT_TOTALS, 
  JUNE_2026_RESTAURANT_STATUTORY, 
  JUNE_2026_RESTAURANT_CHANNELS, 
  JUNE_2026_MANAGEMENT_RECORDS, 
  JUNE_2026_RESTAURANT_RECORDS 
} from '../data/june2026RestaurantData';
import { HOTEL_CONFIG } from '../data/hotelData';
import { sendRestaurantStatutoryTaxWhatsApp } from '../utils/whatsappDispatch';

export default function AuditedRestaurantRegisterModal({
  isOpen,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('register'); // register, statutory, management, channels, heatmap
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL'); // ALL, RESTAURANT, ROOM SERVICE, TAKE AWAY, MANAGEMENT
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortField, setSortField] = useState('sNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showStatutoryCard, setShowStatutoryCard] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [recalcMode, setRecalcMode] = useState('baseline'); // 'baseline' (June exact) or 'dynamic' (filtered)
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Distinct dates
  const distinctDates = useMemo(() => {
    const dates = new Set(JUNE_2026_RESTAURANT_RECORDS.map(r => r.date));
    return Array.from(dates).sort();
  }, []);

  // Distinct locations
  const distinctLocations = useMemo(() => {
    const locs = new Set(JUNE_2026_RESTAURANT_RECORDS.map(r => r.locationCode).filter(Boolean));
    return Array.from(locs).sort();
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return JUNE_2026_RESTAURANT_RECORDS.filter(record => {
      // Channel filter
      if (selectedChannel !== 'ALL') {
        if (selectedChannel === 'MANAGEMENT') {
          if (!record.isManagement && record.posChannel !== 'MANAGEMENT') return false;
        } else if (record.posChannel !== selectedChannel) {
          return false;
        }
      }

      // Date filter
      if (selectedDate !== 'ALL' && record.date !== selectedDate) {
        return false;
      }

      // Location filter
      if (selectedLocation !== 'ALL' && record.locationCode !== selectedLocation) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBill = record.billNo.toLowerCase().includes(q);
        const matchesDate = record.date.toLowerCase().includes(q);
        const matchesPos = record.posChannel.toLowerCase().includes(q);
        const matchesLoc = record.locationCode.toLowerCase().includes(q);
        if (!matchesBill && !matchesDate && !matchesPos && !matchesLoc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA - valB) : (valB - valA);
    });
  }, [searchQuery, selectedChannel, selectedDate, selectedLocation, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  // Statutory values
  const statutoryValues = useMemo(() => {
    if (recalcMode === 'baseline') {
      return {
        foodBase: JUNE_2026_RESTAURANT_STATUTORY.foodBase,
        bevBase: JUNE_2026_RESTAURANT_STATUTORY.bevBase,
        grossNetAmount: JUNE_2026_RESTAURANT_STATUTORY.grossNetAmount,
        discount: JUNE_2026_RESTAURANT_STATUTORY.discount,
        mgmComplimentary: JUNE_2026_RESTAURANT_STATUTORY.mgmComplimentary,
        netTaxableTurnover: JUNE_2026_RESTAURANT_STATUTORY.netTaxableTurnover,
        cgst: JUNE_2026_RESTAURANT_STATUTORY.cgst,
        sgst: JUNE_2026_RESTAURANT_STATUTORY.sgst,
        totalTax: JUNE_2026_RESTAURANT_STATUTORY.totalTax,
        totalTaxableSupply: JUNE_2026_RESTAURANT_STATUTORY.totalTaxableSupply
      };
    } else {
      const foodSum = filteredRecords.reduce((acc, r) => acc + r.foodAmount, 0);
      const bevSum = filteredRecords.reduce((acc, r) => acc + r.bevAmount, 0);
      const disSum = filteredRecords.reduce((acc, r) => acc + r.discount, 0);
      const mgmSum = filteredRecords.filter(r => r.isManagement).reduce((acc, r) => acc + r.grossAmount, 0);

      const grossNet = foodSum + bevSum;
      const netTaxable = Math.max(0, grossNet - disSum - mgmSum);
      const cgst = Math.round((netTaxable * 0.025) * 100) / 100;
      const sgst = Math.round((netTaxable * 0.025) * 100) / 100;
      const totalTax = cgst + sgst;
      const totalSupply = netTaxable + totalTax;

      return {
        foodBase: Math.round(foodSum * 100) / 100,
        bevBase: Math.round(bevSum * 100) / 100,
        grossNetAmount: Math.round(grossNet * 100) / 100,
        discount: Math.round(disSum * 100) / 100,
        mgmComplimentary: Math.round(mgmSum * 100) / 100,
        netTaxableTurnover: Math.round(netTaxable * 100) / 100,
        cgst,
        sgst,
        totalTax,
        totalTaxableSupply: Math.round(totalSupply * 100) / 100
      };
    }
  }, [recalcMode, filteredRecords]);

  // Print Statutory Slip
  const handlePrintStatutorySlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Restaurant Statutory Tax Reconciliation - Hotel Elite Inn</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #111; max-width: 820px; margin: auto; }
            h2 { margin: 0; text-transform: uppercase; color: #0f172a; }
            .header-box { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 15px; }
            .meta { font-size: 12px; color: #475569; margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1.5px solid #000; padding: 6px 10px; text-align: right; font-size: 13px; }
            th { background: #f1f5f9; color: #b91c1c; font-weight: 800; }
            td { color: #15803d; font-weight: 700; font-family: monospace; }
            .section-title { font-size: 13px; font-weight: bold; margin-top: 15px; color: #0f172a; }
            .summary-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 6px; font-size: 12px; margin-top: 15px; line-height: 1.6; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; border-top: 1px dashed #94a3b8; padding-top: 25px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h2>Hotel Elite Inn - Cannon Kitchen</h2>
            <div class="meta">Near Railway Station Main Road, Muniguda, Rayagada, Odisha - 765020</div>
            <div class="meta"><strong>GSTIN:</strong> ${HOTEL_CONFIG.gstin || '21AEWFS9433F1ZN'} | <strong>PAN:</strong> AEWFS9433F</div>
            <div class="meta"><strong>Document:</strong> STATUTORY RESTAURANT TAX RECONCILIATION CERTIFICATE (ROWS 1325-1326)</div>
            <div class="meta"><strong>Period:</strong> ${recalcMode === 'baseline' ? 'June 2026 (Audited Register - 1,320 Bills)' : `Filtered Date: ${selectedDate}`}</div>
          </div>

          <div class="section-title">FOOD & BEVERAGE TAX RECONCILIATION (SAC 996331 / 996332 @ 5% GST)</div>
          <table>
            <thead>
              <tr>
                <th>FOOD</th>
                <th>BEV</th>
                <th>NET AMOUNT</th>
                <th>DISCOUNT</th>
                <th>MGM COMP.</th>
                <th>NET TAXABLE</th>
                <th>CGST (2.5%)</th>
                <th>SGST (2.5%)</th>
                <th>TOTAL SUPPLY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₹${Number(statutoryValues?.foodBase || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.bevBase || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.grossNetAmount || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.discount || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.mgmComplimentary || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.netTaxableTurnover || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.cgst || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.sgst || 0).toFixed(2)}</td>
                <td>₹${Number(statutoryValues?.totalTaxableSupply || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-box">
            <strong>STATUTORY DEDUCTION & AUDIT PROOF:</strong><br/>
            • Gross Production (Food + Beverage): <strong>₹${Number(statutoryValues?.grossNetAmount || 0).toFixed(2)}</strong><br/>
            • Less Guest Discounts: <strong>-₹${Number(statutoryValues?.discount || 0).toFixed(2)}</strong><br/>
            • Less Management / Complimentary Meals (Sheet 2): <strong>-₹${Number(statutoryValues?.mgmComplimentary || 0).toFixed(2)}</strong> (Tax-Free Internal Cons.)<br/>
            • <strong>Actual Commercial Taxable Base: ₹${Number(statutoryValues?.netTaxableTurnover || 0).toFixed(2)}</strong><br/>
            • 5% Output GST (2.5% CGST + 2.5% SGST): <strong>₹${Number(statutoryValues?.totalTax || 0).toFixed(2)}</strong><br/>
            • <strong>Commercial Taxable Supply: ₹${Number(statutoryValues?.totalTaxableSupply || 0).toFixed(2)}</strong>
          </div>

          <div class="signatures">
            <div>
              Verified By:<br/><br/>
              <strong>F&B Manager / Chef Lead</strong><br/>
              Cannon Kitchen
            </div>
            <div>
              Approved By:<br/><br/>
              <strong>Chartered Accountant / Tax Lead</strong><br/>
              Statutory Audit Division
            </div>
            <div>
              Certified For:<br/><br/>
              <strong>Hotel Elite Inn (Proprietor)</strong><br/>
              Muniguda, Rayagada
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = `HOTEL ELITE INN - RESTAURANT STATUTORY TAX RECONCILIATION (ROWS 1325-1326)
Period: ${recalcMode === 'baseline' ? 'June 2026' : `Filtered Selection (${filteredRecords.length} Bills)`}
Food Base: ₹${Number(statutoryValues?.foodBase || 0).toFixed(2)}
Beverage Base: ₹${Number(statutoryValues?.bevBase || 0).toFixed(2)}
Gross Food & Bev: ₹${Number(statutoryValues?.grossNetAmount || 0).toFixed(2)}
Less Discount: -₹${Number(statutoryValues?.discount || 0).toFixed(2)}
Less Management Meals (Sheet 2): -₹${Number(statutoryValues?.mgmComplimentary || 0).toFixed(2)}
Net Taxable Base: ₹${Number(statutoryValues?.netTaxableTurnover || 0).toFixed(2)}
CGST @ 2.5%: ₹${Number(statutoryValues?.cgst || 0).toFixed(2)}
SGST @ 2.5%: ₹${Number(statutoryValues?.sgst || 0).toFixed(2)}
Total Output GST: ₹${Number(statutoryValues?.totalTax || 0).toFixed(2)}
Total Commercial Supply: ₹${Number(statutoryValues?.totalTaxableSupply || 0).toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['S.NO', 'DATE', 'BILL NO', 'GROSS AMT', 'FOOD', 'BEV', 'CGST', 'SGST', 'DISCOUNT', 'NET TOTAL', 'POS CHANNEL', 'TABLE / ROOM'];
    const rows = filteredRecords.map(r => [
      r.sNo,
      r.date,
      `#${r.billNo}`,
      Number(r.grossAmount || 0).toFixed(2),
      Number(r.foodAmount || 0).toFixed(2),
      Number(r.bevAmount || 0).toFixed(2),
      Number(r.cgst || 0).toFixed(2),
      Number(r.sgst || 0).toFixed(2),
      Number(r.discount || 0).toFixed(2),
      Number(r.netTotal || 0).toFixed(2),
      r.posChannel,
      r.locationCode
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HotelEliteInn_RestaurantSales_June2026_${selectedChannel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Heatmap rankings
  const topRooms = useMemo(() => {
    const map = {};
    JUNE_2026_RESTAURANT_RECORDS.filter(r => r.posChannel === 'ROOM SERVICE').forEach(r => {
      const code = r.locationCode.split('|')[0] || r.locationCode;
      if (!map[code]) map[code] = { count: 0, amount: 0 };
      map[code].count += 1;
      map[code].amount += r.grossAmount;
    });
    return Object.entries(map).map(([room, data]) => ({ room, ...data })).sort((a, b) => b.amount - a.amount);
  }, []);

  const topTables = useMemo(() => {
    const map = {};
    JUNE_2026_RESTAURANT_RECORDS.filter(r => r.posChannel === 'RESTAURANT').forEach(r => {
      const code = r.locationCode.split('|')[0] || r.locationCode;
      if (!map[code]) map[code] = { count: 0, amount: 0 };
      map[code].count += 1;
      map[code].amount += r.grossAmount;
    });
    return Object.entries(map).map(([table, data]) => ({ table, ...data })).sort((a, b) => b.amount - a.amount);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(3, 7, 18, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0.75rem'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="modal-content glass-panel"
        style={{
          width: '98vw',
          maxWidth: '1580px',
          height: '95vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          background: '#090d16',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(212,175,55,0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          background: 'linear-gradient(90deg, rgba(212,175,55,0.12), rgba(15,23,42,0.9))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(217,119,6,0.5)'
            }}>
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.03em' }}>
                  CANNON KITCHEN &amp; RESTAURANT SALES REGISTER (JUNE 2026)
                </h3>
                <span style={{
                  background: '#047857',
                  color: '#d1fae5',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ShieldCheck size={11} /> 1,320 Bills Reconciled
                </span>
                <span style={{
                  background: 'rgba(217, 119, 6, 0.2)',
                  color: '#fbbf24',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px'
                }}>
                  F10 Shortcut
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Statutory Dine-In, In-Room Service, Parcel Take-Away &amp; VIP Management Dining • SAC 996331 / 996332
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setShowStatutoryCard(!showStatutoryCard)}
              style={{
                background: showStatutoryCard ? 'rgba(217,119,6,0.2)' : '#1e293b',
                color: showStatutoryCard ? '#fbbf24' : '#cbd5e1',
                border: showStatutoryCard ? '1px solid #d97706' : '1px solid #334155',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Calculator size={13} /> {showStatutoryCard ? 'Hide Rows 1325-1326 Box' : 'Show Rows 1325-1326 Box'}
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #0284c7',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Download size={13} /> Export CSV
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.4rem',
                cursor: 'pointer'
              }}
              title="Close (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 POS Channels Metrics Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.65rem',
          padding: '0.65rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}>
          {JUNE_2026_RESTAURANT_CHANNELS.map(ch => (
            <div 
              key={ch.channel}
              onClick={() => {
                setSelectedChannel(selectedChannel === ch.channel ? 'ALL' : ch.channel);
                setPage(1);
              }}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                background: selectedChannel === ch.channel ? 'rgba(217, 119, 6, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                border: selectedChannel === ch.channel ? '1.5px solid #d97706' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  {ch.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 800 }}>
                  {ch.pctTurnover}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>
                  ₹{ch.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                  {ch.billCount} Bills
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rows 1325-1326 Statutory Reconciliation Card (Visual Excel Replica) */}
        {showStatutoryCard && (
          <div style={{
            background: 'linear-gradient(180deg, #0b1120 0%, #030712 100%)',
            borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
            padding: '0.85rem 1.25rem',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: '#b91c1c',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}>
                  EXCEL ROWS 1325–1326
                </span>
                <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.82rem' }}>
                  Official Statutory Food &amp; Beverage Tax Reconciliation Box
                </span>
                <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
                  (Deducts ₹90,478 MGM Meals Tax-Free Under Indian GST)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Recalc Toggle */}
                <div style={{
                  display: 'inline-flex',
                  background: '#1e293b',
                  padding: '2px',
                  borderRadius: '6px',
                  border: '1px solid #334155'
                }}>
                  <button
                    onClick={() => setRecalcMode('baseline')}
                    style={{
                      background: recalcMode === 'baseline' ? 'var(--gold-primary)' : 'transparent',
                      color: recalcMode === 'baseline' ? '#000' : '#94a3b8',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    June Baseline
                  </button>
                  <button
                    onClick={() => setRecalcMode('dynamic')}
                    style={{
                      background: recalcMode === 'dynamic' ? '#38bdf8' : 'transparent',
                      color: recalcMode === 'dynamic' ? '#000' : '#94a3b8',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Dynamic Filtered ({filteredRecords.length})
                  </button>
                </div>

                {/* Formula Toggle */}
                <button
                  onClick={() => setShowFormulas(!showFormulas)}
                  style={{
                    background: showFormulas ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                    color: showFormulas ? '#38bdf8' : '#cbd5e1',
                    border: showFormulas ? '1px solid #38bdf8' : '1px solid #334155',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <FileCode size={12} /> {showFormulas ? 'Show Values' : 'Show Formulas (=FX)'}
                </button>

                {/* Copy Summary */}
                <button
                  onClick={handleCopySummary}
                  style={{
                    background: '#0f172a',
                    color: copiedNotice ? '#34d399' : '#cbd5e1',
                    border: '1px solid #334155',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {copiedNotice ? <Check size={12} /> : <Copy size={12} />}
                  {copiedNotice ? 'Copied' : 'Copy'}
                </button>

                {/* Print Slip */}
                <button
                  onClick={handlePrintStatutorySlip}
                  style={{
                    background: '#0f172a',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Printer size={12} /> Print Slip
                </button>

                {/* WhatsApp to Owner */}
                <button
                  onClick={() => {
                    sendRestaurantStatutoryTaxWhatsApp({
                      period: recalcMode === 'baseline' ? 'June 2026 (Audited Register - 1,320 Bills)' : `Filtered Selection (${filteredRecords.length} Bills)`,
                      foodBase: statutoryValues.foodBase,
                      bevBase: statutoryValues.bevBase,
                      grossNetAmount: statutoryValues.grossNetAmount,
                      discount: statutoryValues.discount,
                      mgmComplimentary: statutoryValues.mgmComplimentary,
                      netTaxableTurnover: statutoryValues.netTaxableTurnover,
                      cgst: statutoryValues.cgst,
                      sgst: statutoryValues.sgst,
                      totalTax: statutoryValues.totalTax,
                      totalTaxableSupply: statutoryValues.totalTaxableSupply
                    });
                  }}
                  style={{
                    background: 'rgba(5, 150, 105, 0.25)',
                    color: '#34d399',
                    border: '1px solid #059669',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Send Statutory Tax Report directly to Proprietor's WhatsApp"
                >
                  <MessageCircle size={12} /> WhatsApp Owner
                </button>
              </div>
            </div>

            {/* The Visual Replica Table */}
            <div style={{
              overflowX: 'auto',
              border: '2px solid #000',
              borderRadius: '6px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Courier New, monospace' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>FOOD</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>BEV</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>NET AMOUNT</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>DISCOUNT</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>MGM</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>NET AMOUNT (TAXABLE)</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>CGST (2.5%)</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>SGST (2.5%)</th>
                    <th style={{ border: '1.5px solid #000', padding: '5px 8px', color: '#b91c1c', fontWeight: 900, fontSize: '0.72rem', textAlign: 'center' }}>TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#ffffff' }}>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=E1323' : `₹${statutoryValues.foodBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=F1323' : `₹${statutoryValues.bevBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=D1326+E1326' : `₹${statutoryValues.grossNetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#b91c1c', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=I1323' : `-₹${statutoryValues.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#854d0e', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=Sheet2!J71' : `-₹${statutoryValues.mgmComplimentary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#0369a1', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right', background: 'rgba(56, 189, 248, 0.1)' }}>
                      {showFormulas ? '=F1326-G1326-H1326' : `₹${statutoryValues.netTaxableTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=I1326*2.5%' : `₹${statutoryValues.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right' }}>
                      {showFormulas ? '=I1326*2.5%' : `₹${statutoryValues.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '6px 10px', color: '#15803d', fontWeight: 900, fontSize: '0.85rem', textAlign: 'right', background: 'rgba(52, 211, 153, 0.1)' }}>
                      {showFormulas ? '=I1326+J1326+K1326' : `₹${statutoryValues.totalTaxableSupply.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1.25rem',
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                background: activeTab === 'register' ? 'var(--gold-primary)' : 'transparent',
                color: activeTab === 'register' ? '#000' : '#94a3b8',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.76rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileSpreadsheet size={14} /> Master Sales Register ({filteredRecords.length})
            </button>

            <button
              onClick={() => setActiveTab('management')}
              style={{
                background: activeTab === 'management' ? '#d97706' : 'transparent',
                color: activeTab === 'management' ? '#fff' : '#94a3b8',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.76rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <UserCheck size={14} /> Sheet 2: Management Meals (₹90,478)
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              style={{
                background: activeTab === 'heatmap' ? '#0284c7' : 'transparent',
                color: activeTab === 'heatmap' ? '#fff' : '#94a3b8',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.76rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Bed size={14} /> Room Service &amp; Table Heatmap
            </button>
          </div>

          {/* Controls: Search, Channel, Date, Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search Bill #, POS, Room..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '0.35rem 0.6rem 0.35rem 1.7rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  width: '180px'
                }}
              />
            </div>

            {/* Date filter */}
            <select
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <option value="ALL">All June Dates (30 Days)</option>
              {distinctDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Location / Table filter */}
            <select
              value={selectedLocation}
              onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <option value="ALL">All Tables / Rooms</option>
              {distinctLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.25rem' }}>
          {/* TAB 1: MASTER SALES REGISTER */}
          {activeTab === 'register' && (
            <div>
              <div style={{
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.4)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#f8fafc', borderBottom: '2px solid rgba(212,175,55,0.4)' }}>
                      <th style={{ padding: '7px 8px', textAlign: 'center', width: '50px' }}>S.NO</th>
                      <th style={{ padding: '7px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setSortField('date'); setSortAsc(!sortAsc); }}>DATE</th>
                      <th style={{ padding: '7px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setSortField('billNo'); setSortAsc(!sortAsc); }}>BILL NO</th>
                      <th style={{ padding: '7px 8px', textAlign: 'left' }}>POS CHANNEL</th>
                      <th style={{ padding: '7px 8px', textAlign: 'center' }}>TABLE / ROOM</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSortField('grossAmount'); setSortAsc(!sortAsc); }}>GROSS AMT</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>FOOD</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>BEV</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>CGST (2.5%)</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>SGST (2.5%)</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>DISCOUNT</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSortField('netTotal'); setSortAsc(!sortAsc); }}>TOTAL NET</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((r, idx) => (
                      <tr 
                        key={r.billNo}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: r.isManagement 
                            ? 'rgba(217, 119, 6, 0.08)' 
                            : r.posChannel === 'ROOM SERVICE' 
                              ? 'rgba(56, 189, 248, 0.04)' 
                              : idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b' }}>{r.sNo}</td>
                        <td style={{ padding: '6px 8px', color: '#cbd5e1', fontFamily: 'monospace' }}>{r.date}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 800, color: r.isManagement ? '#fbbf24' : '#38bdf8' }}>
                          #{r.billNo}
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: r.posChannel === 'RESTAURANT' ? 'rgba(52, 211, 153, 0.15)' :
                                        r.posChannel === 'ROOM SERVICE' ? 'rgba(56, 189, 248, 0.15)' :
                                        r.posChannel === 'TAKE AWAY' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(217, 119, 6, 0.2)',
                            color: r.posChannel === 'RESTAURANT' ? '#34d399' :
                                   r.posChannel === 'ROOM SERVICE' ? '#38bdf8' :
                                   r.posChannel === 'TAKE AWAY' ? '#c084fc' : '#fbbf24'
                          }}>
                            {r.posChannel}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#f8fafc' }}>
                          {r.locationCode}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#f8fafc' }}>
                          ₹{Number(r.grossAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>
                          ₹{Number(r.foodAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>
                          ₹{Number(r.bevAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#34d399' }}>
                          {Number(r.cgst || 0) > 0 ? `₹${Number(r.cgst || 0).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#34d399' }}>
                          {Number(r.sgst || 0) > 0 ? `₹${Number(r.sgst || 0).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: Number(r.discount || 0) > 0 ? '#f87171' : '#64748b' }}>
                          {Number(r.discount || 0) > 0 ? `-₹${Number(r.discount || 0).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: r.isManagement ? '#fbbf24' : '#34d399' }}>
                          {r.isManagement ? 'COMPLIMENTARY' : `₹${Number(r.netTotal || 0).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.75rem',
                fontSize: '0.76rem',
                color: '#94a3b8'
              }}>
                <div>
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} Bills
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                      background: page === 1 ? '#1e293b' : '#334155',
                      color: page === 1 ? '#475569' : '#fff',
                      border: 'none',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{
                      background: page === totalPages ? '#1e293b' : '#334155',
                      color: page === totalPages ? '#475569' : '#fff',
                      border: 'none',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    style={{
                      background: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}
                  >
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                    <option value={500}>500 / page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHEET 2 MANAGEMENT COMPLIMENTARY LEDGER */}
          {activeTab === 'management' && (
            <div>
              <div style={{
                background: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.35)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '1rem', fontWeight: 800 }}>
                      Sheet 2: Management &amp; Staff Complimentary Dining Ledger
                    </h4>
                    <p style={{ margin: '0.25rem 0 0', color: '#cbd5e1', fontSize: '0.78rem' }}>
                      68 internal bills totaling <strong>₹90,478.00</strong>. Under statutory GST law, internal management &amp; staff meals are non-revenue supplies and are deducted from the GSTR-1 commercial taxable base.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24' }}>
                      ₹90,478.00
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      0% Tax Liability (Excluded from GST)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }}>Table 444|0 (Executive &amp; Director Dining)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>₹76,218.44</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>39 Bills for Proprietor Paidisetty Manmadha Rao &amp; Board Guests</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px' }}>
                    <div style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.75rem' }}>Table 555|0 (Duty Staff &amp; Operational Meals)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>₹14,259.64</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>29 Bills for Front Desk, Housekeeping &amp; Kitchen Shift Meals</div>
                  </div>
                </div>
              </div>

              {/* Table of MGM Bills */}
              <div style={{
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.4)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#f8fafc', borderBottom: '2px solid #d97706' }}>
                      <th style={{ padding: '7px 8px', textAlign: 'center' }}>S.NO</th>
                      <th style={{ padding: '7px 8px', textAlign: 'left' }}>DATE</th>
                      <th style={{ padding: '7px 8px', textAlign: 'left' }}>BILL NO</th>
                      <th style={{ padding: '7px 8px', textAlign: 'center' }}>TABLE CODE</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>FOOD AMOUNT</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>BEVERAGE</th>
                      <th style={{ padding: '7px 8px', textAlign: 'right' }}>TOTAL VALUE</th>
                      <th style={{ padding: '7px 8px', textAlign: 'center' }}>TAX STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JUNE_2026_MANAGEMENT_RECORDS.map(r => (
                      <tr key={r.billNo} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b' }}>{r.sNo}</td>
                        <td style={{ padding: '6px 8px', color: '#cbd5e1', fontFamily: 'monospace' }}>{r.date}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 800, color: '#fbbf24' }}>#{r.billNo}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: r.locationCode.startsWith('444') ? '#38bdf8' : '#c084fc' }}>
                          {r.locationCode} {r.locationCode.startsWith('444') ? '(VIP/Director)' : '(Staff)'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>₹{Number(r.foodAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>₹{Number(r.bevAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#f8fafc' }}>₹{Number(r.grossAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            Tax-Free Internal
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HEATMAP RANKINGS */}
          {activeTab === 'heatmap' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Room Service Rankings */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '10px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '0.45rem' }}>
                  <Bed size={16} color="#38bdf8" />
                  <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '0.92rem', fontWeight: 800 }}>
                    Top In-Room Dining Delivery Rooms (Room Service)
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {topRooms.slice(0, 15).map((rm, idx) => (
                    <div 
                      key={rm.room}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.45rem 0.75rem',
                        background: idx === 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        border: idx === 0 ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, width: '18px' }}>#{idx + 1}</span>
                        <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.82rem' }}>ROOM {rm.room}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{rm.count} Orders</span>
                        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem' }}>
                          ₹{rm.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Rankings */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '10px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(52, 211, 153, 0.2)', paddingBottom: '0.45rem' }}>
                  <UtensilsCrossed size={16} color="#34d399" />
                  <h4 style={{ margin: 0, color: '#34d399', fontSize: '0.92rem', fontWeight: 800 }}>
                    Top Dine-In Restaurant Tables (Cannon Kitchen)
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {topTables.slice(0, 15).map((tbl, idx) => (
                    <div 
                      key={tbl.table}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.45rem 0.75rem',
                        background: idx === 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        border: idx === 0 ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, width: '18px' }}>#{idx + 1}</span>
                        <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.82rem' }}>TABLE {tbl.table}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{tbl.count} Bills</span>
                        <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.85rem' }}>
                          ₹{tbl.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
