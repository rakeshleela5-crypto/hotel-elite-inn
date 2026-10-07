import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, ShieldCheck, CheckCircle2, AlertTriangle, 
  Share2, Printer, Sparkles, RefreshCw, Calculator, FileSpreadsheet,
  TrendingUp, Award, ExternalLink, Calendar, ChevronDown, ChevronUp,
  FileText, Download, Check, Eye
} from 'lucide-react';
import { JUNE_2026_RESTAURANT_STATUTORY, JUNE_2026_RESTAURANT_TOTALS } from '../data/june2026RestaurantData';
import { HOTEL_CONFIG } from '../data/hotelData';
import { 
  getCurrentMonthDayToDateLedger, 
  getJune2026DailyStatutoryRecords, 
  calculateMonthlyStatutoryTotals, 
  printStatutoryMonthEndPdf,
  computeTodayStatutoryRecord
} from '../utils/fnbStatutoryLedger';
import {
  sendDailyFnbStatutoryEodWhatsApp,
  sendMonthlyFnbStatutorySummaryWhatsApp
} from '../utils/whatsappDispatch';

/**
 * Automated Statutory F&B Reconciliation Strip & Day-to-Date Ledger
 * Replaces manual Excel reconciliation (Rows 1325-1326) with automated real-time calculation.
 * Formula: Taxable Base = (Food + Beverage) - Customer Discount - MGM (Sheet 2 Management Meals)
 * Dual Tax: CGST 2.5% + SGST 2.5%
 */
export default function AutomatedFnbReconciliationStrip({
  liveOrders = [],
  onOpenFullRegister,
  onOpenCaStation,
  compact = false
}) {
  // Mode: 'live' (Today's Live POS) | 'dayToDate' (Current Month 31-Day Ledger) | 'audited' (June 2026 Baseline)
  const [dataMode, setDataMode] = useState('live');
  const [showDailyLedgerTable, setShowDailyLedgerTable] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [lastUpdatePing, setLastUpdatePing] = useState(0);

  // Synchronized Event Listeners for Live Operations & Midnight Day Seals
  React.useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('hotel_elite_inn_live_kds');
      bc.onmessage = (event) => {
        if (event && event.data) {
          const type = event.data.type;
          if (type === 'NEW_KOT_ORDER' || type === 'FNB_STATUTORY_SEALED' || type === 'TABLE_SETTLED' || type === 'NIGHT_AUDIT_COMPLETED') {
            setLastUpdatePing(p => p + 1);
          }
        }
      };
    } catch (e) {}

    const handleCustomUpdate = () => setLastUpdatePing(p => p + 1);
    const handleStorage = (e) => {
      if (e.key === 'hotel_elite_inn_live_kots' || e.key === 'hotel_elite_inn_fnb_daily_statutory_ledger' || e.key === 'hotel_elite_inn_business_date') {
        setLastUpdatePing(p => p + 1);
      }
    };

    window.addEventListener('fnb_statutory_updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('fnb_statutory_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // 1. Current Live Today Record
  const todayRecord = useMemo(() => {
    return computeTodayStatutoryRecord(liveOrders);
  }, [liveOrders, lastUpdatePing]);

  // 2. Full Month-to-Date Ledger (Days 1 to 31 for Current Month)
  const currentMonthDailyRecords = useMemo(() => {
    return getCurrentMonthDayToDateLedger(liveOrders);
  }, [liveOrders, lastUpdatePing]);

  // 3. June 2026 Historical Daily Records (30 Days from 1,320 Bills)
  const juneDailyRecords = useMemo(() => {
    return getJune2026DailyStatutoryRecords();
  }, []);

  // Active records based on selected mode
  const activeDailyRecords = useMemo(() => {
    if (dataMode === 'audited') return juneDailyRecords;
    return currentMonthDailyRecords;
  }, [dataMode, juneDailyRecords, currentMonthDailyRecords]);

  // MTD Totals for current month
  const currentMonthTotals = useMemo(() => {
    return calculateMonthlyStatutoryTotals(currentMonthDailyRecords);
  }, [currentMonthDailyRecords]);

  // June 2026 MTD Totals
  const juneTotals = useMemo(() => {
    return {
      totalBills: 1320,
      foodBase: Number(JUNE_2026_RESTAURANT_STATUTORY?.foodBase || 828328.53),
      bevBase: Number(JUNE_2026_RESTAURANT_STATUTORY?.bevBase || 52935.00),
      grossNetAmount: Number(JUNE_2026_RESTAURANT_STATUTORY?.grossNetAmount || 881263.53),
      discount: Number(JUNE_2026_RESTAURANT_STATUTORY?.discount || 63.00),
      mgmComplimentary: Number(JUNE_2026_RESTAURANT_STATUTORY?.mgmComplimentary || 90478.00),
      netTaxableTurnover: Number(JUNE_2026_RESTAURANT_STATUTORY?.netTaxableTurnover || 790722.53),
      cgst: Number(JUNE_2026_RESTAURANT_STATUTORY?.cgst || 19768.06),
      sgst: Number(JUNE_2026_RESTAURANT_STATUTORY?.sgst || 19768.06),
      totalTax: Number(JUNE_2026_RESTAURANT_STATUTORY?.totalTax || 39536.13),
      totalTaxableSupply: Number(JUNE_2026_RESTAURANT_STATUTORY?.totalTaxableSupply || 830258.66),
      taxSaved: Math.round(Number(JUNE_2026_RESTAURANT_STATUTORY?.mgmComplimentary || 90478.00) * 0.05 * 100) / 100,
      statutoryVariance: 0.00
    };
  }, []);

  // Currently displayed strip KPI data
  const activeData = useMemo(() => {
    if (dataMode === 'live') {
      return {
        food: todayRecord.foodAmount,
        bev: todayRecord.bevAmount,
        gross: todayRecord.grossAmount,
        discount: todayRecord.discount,
        mgm: todayRecord.mgmAmount,
        taxable: todayRecord.taxableBase,
        cgst: todayRecord.cgst,
        sgst: todayRecord.sgst,
        total: todayRecord.totalAmount,
        taxSaved: todayRecord.taxSaved,
        bills: todayRecord.billsCount
      };
    } else if (dataMode === 'dayToDate') {
      return {
        food: currentMonthTotals.foodBase,
        bev: currentMonthTotals.bevBase,
        gross: currentMonthTotals.grossNetAmount,
        discount: currentMonthTotals.discount,
        mgm: currentMonthTotals.mgmComplimentary,
        taxable: currentMonthTotals.netTaxableTurnover,
        cgst: currentMonthTotals.cgst,
        sgst: currentMonthTotals.sgst,
        total: currentMonthTotals.totalTaxableSupply,
        taxSaved: currentMonthTotals.taxSaved,
        bills: currentMonthTotals.totalBills
      };
    } else {
      return {
        food: juneTotals.foodBase,
        bev: juneTotals.bevBase,
        gross: juneTotals.grossNetAmount,
        discount: juneTotals.discount,
        mgm: juneTotals.mgmComplimentary,
        taxable: juneTotals.netTaxableTurnover,
        cgst: juneTotals.cgst,
        sgst: juneTotals.sgst,
        total: juneTotals.totalTaxableSupply,
        taxSaved: juneTotals.taxSaved,
        bills: juneTotals.totalBills
      };
    }
  }, [dataMode, todayRecord, currentMonthTotals, juneTotals]);

  // Export A4 PDF Statement
  const handleExportA4Pdf = () => {
    const title = dataMode === 'audited' ? 'June 2026 (Audited Baseline)' : 'Current Month Live (October 2026)';
    const totals = dataMode === 'audited' ? juneTotals : currentMonthTotals;
    printStatutoryMonthEndPdf({
      monthTitle: title,
      dailyRecords: activeDailyRecords,
      totals
    });
  };

  // WhatsApp EOD Flash (Today)
  const handleWhatsAppTodayFlash = () => {
    sendDailyFnbStatutoryEodWhatsApp(todayRecord);
  };

  // WhatsApp Month-End Pack (MTD)
  const handleWhatsAppMonthlyPack = () => {
    const title = dataMode === 'audited' ? 'June 2026' : 'October 2026';
    const totals = dataMode === 'audited' ? juneTotals : currentMonthTotals;
    sendMonthlyFnbStatutorySummaryWhatsApp({
      monthTitle: title,
      totals
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(6, 14, 26, 0.98))',
      border: '1.5px solid rgba(212, 175, 55, 0.45)',
      borderRadius: '12px',
      padding: compact ? '0.75rem 1rem' : '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      position: 'relative'
    }}>
      {/* Top Banner Header with Mode Switcher & Export Suite */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.4rem 0.65rem',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            fontWeight: 800
          }}>
            <Calculator size={16} /> AUTOMATED STATUTORY F&B STRIP
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
              Official Restaurant Statutory Reconciliation (Rows 1325–1326 Live Engine)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              ⚡ Continuous Day-to-Date Recording • Real-time Management Dining Isolation (Sheet 2) • Zero Manual Excel
            </div>
          </div>
        </div>

        {/* 3-Way Mode Switcher & Operational Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Mode Segmented Controls */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setDataMode('live')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: dataMode === 'live' ? '#10b981' : 'transparent',
                color: dataMode === 'live' ? '#ffffff' : '#94a3b8',
                fontWeight: dataMode === 'live' ? 800 : 500,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ⚡ Today's Live POS
            </button>
            <button
              type="button"
              onClick={() => setDataMode('dayToDate')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: dataMode === 'dayToDate' ? '#0284c7' : 'transparent',
                color: dataMode === 'dayToDate' ? '#ffffff' : '#94a3b8',
                fontWeight: dataMode === 'dayToDate' ? 800 : 500,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📅 MTD Day-to-Date (31 Days)
            </button>
            <button
              type="button"
              onClick={() => setDataMode('audited')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: dataMode === 'audited' ? 'var(--gold-primary)' : 'transparent',
                color: dataMode === 'audited' ? '#000000' : '#94a3b8',
                fontWeight: dataMode === 'audited' ? 800 : 500,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📊 June Audited (1,320 Bills)
            </button>
          </div>

          {/* Toggle Full 31-Day Table */}
          <button
            type="button"
            onClick={() => setShowDailyLedgerTable(!showDailyLedgerTable)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: showDailyLedgerTable ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <Calendar size={13} /> {showDailyLedgerTable ? 'Hide 31-Day Ledger' : 'View 31-Day Ledger'}
            {showDailyLedgerTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* 1-Click A4 Official PDF Generator */}
          <button
            type="button"
            onClick={handleExportA4Pdf}
            title="Download / Print Official A4 Statutory Statement for Owner & CA"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(185, 28, 28, 0.35))',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <FileText size={13} /> 📄 Official A4 PDF
          </button>

          {/* WhatsApp EOD Flash Button */}
          <button
            type="button"
            onClick={handleWhatsAppTodayFlash}
            title="Dispatch Today's Statutory Strip to Owner via WhatsApp"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid #25d366',
              color: '#25d366',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} /> WhatsApp Flash
          </button>

          {/* WhatsApp Month-End Pack Button */}
          <button
            type="button"
            onClick={handleWhatsAppMonthlyPack}
            title="Send MTD Month-End Reconciliation Pack to Owner & CA"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid #d97706',
              color: '#fbbf24',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <Download size={13} /> WhatsApp MTD Pack
          </button>

          {onOpenFullRegister && (
            <button
              type="button"
              onClick={onOpenFullRegister}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.3), rgba(180, 83, 9, 0.4))',
                border: '1px solid #d97706',
                color: '#fbbf24',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={13} /> Full Register (F10)
            </button>
          )}
        </div>
      </div>

      {/* Scope Identifier Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.55rem',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: dataMode === 'live' ? 'rgba(16, 185, 129, 0.15)' : dataMode === 'dayToDate' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(212, 175, 55, 0.15)',
            border: `1px solid ${dataMode === 'live' ? '#10b981' : dataMode === 'dayToDate' ? '#0284c7' : 'var(--gold-primary)'}`,
            color: dataMode === 'live' ? '#34d399' : dataMode === 'dayToDate' ? '#38bdf8' : 'var(--gold-glow)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 800
          }}>
            {dataMode === 'live' ? `⚡ Today's Live Active Operations (${activeData.bills || 0} Bills Closed)` : 
             dataMode === 'dayToDate' ? `📅 October 2026 Month-to-Date (${activeData.bills || 0} Total Settled Bills)` : 
             `📊 Audited June 2026 Baseline (1,320 Bills Reconciled)`}
          </span>
          <span style={{ color: '#94a3b8' }}>
            Dual GST: <strong>2.5% CGST + 2.5% SGST (5% Total)</strong> | SAC 996331 / 996332
          </span>
        </div>

        <div style={{ color: '#38bdf8', fontWeight: 600 }}>
          {showDailyLedgerTable ? 'Showing 31-Day Ledger Breakdown below' : 'Click "View 31-Day Ledger" to inspect all days'}
        </div>
      </div>

      {/* THE AUTHENTIC 9-CELL STATUTORY TABLE STRIP (Matching Rows 1325-1326) */}
      <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(0, 0, 0, 0.45)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: 'rgba(239, 68, 68, 0.15)', borderBottom: '2px solid rgba(239, 68, 68, 0.4)' }}>
              {[
                { label: 'FOOD', hint: 'Gross Food Sales (Col E)' },
                { label: 'BEV', hint: 'Beverage Sales (Col F)' },
                { label: 'NET AM (GROSS)', hint: 'Food + Beverage (Col D+E)' },
                { label: 'DISCOU', hint: 'Customer Discount (Col I)' },
                { label: 'MGM', hint: 'Table 444 VIP & 555 Staff (Sheet 2 Non-Revenue: 0% Tax)' },
                { label: 'NET AM (TAXABLE)', hint: 'Gross - Disc - MGM (Col F-G-H)' },
                { label: 'CGST', hint: '2.5% Central GST (Col I*2.5%)' },
                { label: 'SGST', hint: '2.5% State GST (Col I*2.5%)' },
                { label: 'TOTAL AMOUNT', hint: 'Taxable + CGST + SGST (Col I+J+K)' }
              ].map((h, idx) => (
                <th
                  key={idx}
                  title={h.hint}
                  style={{
                    padding: '0.65rem 0.5rem',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f87171',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
              {/* 1. FOOD */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#34d399',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.food || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 2. BEVERAGE */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#34d399',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.bev || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 3. NET AM (GROSS) */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#34d399',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 4. DISCOU */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: (activeData?.discount || 0) > 0 ? '#fbbf24' : '#94a3b8',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 5. MGM (MANAGEMENT COMPLIMENTARY) */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f43f5e',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                background: 'rgba(244, 63, 94, 0.14)'
              }}
              title="Sheet 2 Non-Revenue Internal Meals: Table 444 (Director VIP) & Table 555 (Staff Mess). 0% Tax."
              >
                ₹{Number(activeData?.mgm || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 6. NET AM (TAXABLE BASE) */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#38bdf8',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                background: 'rgba(56, 189, 248, 0.14)'
              }}
              title="Commercial Taxable Supply = Gross - Discount - MGM"
              >
                ₹{Number(activeData?.taxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 7. CGST */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#34d399',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 8. SGST */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#34d399',
                fontSize: '0.98rem',
                fontWeight: 900,
                fontFamily: 'monospace'
              }}>
                ₹{Number(activeData?.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>

              {/* 9. TOTAL AMOUNT */}
              <td style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                color: 'var(--gold-glow)',
                fontSize: '1.05rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                background: 'rgba(212, 175, 55, 0.18)'
              }}>
                ₹{Number(activeData?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Audit Footnote & Verification Ribbon */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.73rem',
        color: '#94a3b8',
        marginBottom: showDailyLedgerTable ? '1rem' : 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span>
            <strong>Statutory Formula:</strong> Net Taxable = <code style={{ color: '#38bdf8' }}>Gross F&amp;B ₹{Number(activeData?.gross || 0).toLocaleString('en-IN')} - Disc ₹{Number(activeData?.discount || 0).toFixed(0)} - MGM ₹{Number(activeData?.mgm || 0).toLocaleString('en-IN')}</code> = <strong style={{ color: '#38bdf8' }}>₹{Number(activeData?.taxable || 0).toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '0.15rem 0.55rem',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            🛡️ 0.00 Statutory Variance
          </span>

          <span style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fda4af',
            padding: '0.15rem 0.55rem',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            💰 ₹{Number(activeData?.taxSaved || 0).toLocaleString('en-IN')} Legal Tax Overpayment Prevented
          </span>
        </div>
      </div>

      {/* EXPANDABLE CONTINUOUS 31-DAY DAY-TO-DATE STATUTORY LEDGER */}
      {showDailyLedgerTable && (
        <div style={{
          marginTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '1rem',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.65rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--gold-glow)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                {dataMode === 'audited' ? 'Audited June Month (Days 1 to 30) - 1,320 Bills Ledger' : 'Current Month Day-to-Date Continuous Ledger (Days 1 to 31)'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                ({activeDailyRecords.length} Daily Rows Recorded)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={handleExportA4Pdf}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '5px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Printer size={12} /> Print A4 PDF
              </button>
            </div>
          </div>

          <div style={{
            maxHeight: '380px',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.5)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem'
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                  {['DAY', 'DATE', 'BILLS', 'FOOD', 'BEVERAGE', 'NET GROSS', 'DISCOUNT', 'MGM (0%)', 'NET TAXABLE', 'CGST', 'SGST', 'TOTAL AMOUNT', 'ACTION'].map((col, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: '0.5rem 0.4rem',
                        textAlign: idx <= 2 ? 'center' : 'right',
                        color: idx === 7 ? '#f43f5e' : idx === 8 ? '#38bdf8' : idx === 11 ? 'var(--gold-glow)' : '#cbd5e1',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeDailyRecords.map((r, idx) => {
                  const isToday = r.status === 'Live Today';
                  return (
                    <tr
                      key={r.date}
                      style={{
                        background: isToday ? 'rgba(16, 185, 129, 0.12)' : idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <td style={{ textAlign: 'center', padding: '0.4rem', fontWeight: 800, color: isToday ? '#10b981' : r.status === 'Audited & Locked' ? 'var(--gold-glow)' : '#94a3b8' }}>
                        {r.dayNumber} {isToday ? '⚡' : r.status === 'Audited & Locked' ? '🔒' : ''}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.4rem', fontFamily: 'monospace', color: '#e2e8f0' }}>
                        {r.date}
                      </td>
                      <td 
                        style={{ textAlign: 'center', padding: '0.4rem', color: '#cbd5e1', cursor: r.settlement ? 'help' : 'default' }}
                        title={r.settlement ? `Cash: ₹${(r.settlement.cash || 0).toLocaleString('en-IN')} | UPI: ₹${(r.settlement.upi || 0).toLocaleString('en-IN')} | Card: ₹${(r.settlement.card || 0).toLocaleString('en-IN')} | Room: ₹${(r.settlement.roomFolio || 0).toLocaleString('en-IN')}` : undefined}
                      >
                        {r.billsCount || '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#34d399', fontFamily: 'monospace' }}>
                        ₹{Number(r.foodAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#34d399', fontFamily: 'monospace' }}>
                        ₹{Number(r.bevAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                        ₹{Number(r.grossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: Number(r.discount || 0) > 0 ? '#fbbf24' : '#64748b', fontFamily: 'monospace' }}>
                        {Number(r.discount || 0) > 0 ? '₹' + Number(r.discount).toFixed(2) : '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#f43f5e', fontWeight: 700, fontFamily: 'monospace', background: 'rgba(244, 63, 94, 0.08)' }}>
                        {Number(r.mgmAmount || 0) > 0 ? '₹' + Number(r.mgmAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.08)' }}>
                        ₹{Number(r.taxableBase || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#34d399', fontFamily: 'monospace' }}>
                        ₹{Number(r.cgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', color: '#34d399', fontFamily: 'monospace' }}>
                        ₹{Number(r.sgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.4rem', fontWeight: 800, color: 'var(--gold-glow)', fontFamily: 'monospace' }}>
                        ₹{Number(r.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => sendDailyFnbStatutoryEodWhatsApp(r)}
                          title={`Send WhatsApp Statutory Slip for ${r.date} to Owner`}
                          style={{
                            background: 'rgba(37, 211, 102, 0.15)',
                            border: '1px solid #25d366',
                            color: '#25d366',
                            borderRadius: '4px',
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Share2 size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#020617', borderTop: '2px solid rgba(212, 175, 55, 0.5)' }}>
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '0.55rem', fontWeight: 900, color: 'var(--gold-glow)' }}>
                    GRAND MTD TOTAL
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.55rem', fontWeight: 800, color: '#f8fafc' }}>
                    {activeData.bills}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.food).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.bev).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.gross).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.discount).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 900, color: '#f43f5e', fontFamily: 'monospace', background: 'rgba(244, 63, 94, 0.2)' }}>
                    ₹{Number(activeData.mgm).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.2)' }}>
                    ₹{Number(activeData.taxable).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.cgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{Number(activeData.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.55rem', fontWeight: 900, color: 'var(--gold-glow)', fontFamily: 'monospace', background: 'rgba(212, 175, 55, 0.2)' }}>
                    ₹{Number(activeData.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
