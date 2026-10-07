-- ============================================================================
-- Migration 0052: Hotel Elite Inn 26-Column Audited Sales & Night Audit Register
-- Synchronizes, times, phases, and cryptographically seals daily master PMS sales
-- 26 Integrated Columns:
--   1. Day # | 2. Date | 3. Status | 4. Sold/Bills | 5. Room Rent (5%)
--   6. Food Bill (93.5%) | 7. Beverage (6.5%) | 8. F&B Total | 9. Laundry (18%)
--   10. Misc | 11. Gross Amount | 12. Discount | 13. Management (0% Tax)
--   14. Taxable Base | 15. CGST (2.5%) | 16. SGST (2.5%) | 17. Total Invoiced
--   18. Cash In Hand | 19. Bank UPI | 20. Card / POS | 21. City Ledger (BTC)
--   22. Advance Applied | 23. Variance | 24. Actions / WhatsApp | 25. Remarks | 26. Tax Saved
-- ============================================================================

CREATE TABLE IF NOT EXISTS pms_daily_master_audit_ledger (
  date TEXT PRIMARY KEY,
  day_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Closed', -- 'Live Today', 'Audited & Locked', 'Closed', 'Scheduled'
  bills_count INTEGER NOT NULL DEFAULT 0,
  rooms_sold INTEGER NOT NULL DEFAULT 0,
  room_rent REAL NOT NULL DEFAULT 0.0,
  food_bill REAL NOT NULL DEFAULT 0.0,
  bev_bill REAL NOT NULL DEFAULT 0.0,
  fnb_total REAL NOT NULL DEFAULT 0.0,
  laundry REAL NOT NULL DEFAULT 0.0,
  misc REAL NOT NULL DEFAULT 0.0,
  gross_amount REAL NOT NULL DEFAULT 0.0,
  discount REAL NOT NULL DEFAULT 0.0,
  management REAL NOT NULL DEFAULT 0.0,
  taxable_base REAL NOT NULL DEFAULT 0.0,
  cgst REAL NOT NULL DEFAULT 0.0,
  sgst REAL NOT NULL DEFAULT 0.0,
  total_gst REAL NOT NULL DEFAULT 0.0,
  total_amount REAL NOT NULL DEFAULT 0.0,
  tax_saved REAL NOT NULL DEFAULT 0.0,
  cash REAL NOT NULL DEFAULT 0.0,
  online REAL NOT NULL DEFAULT 0.0,
  cc REAL NOT NULL DEFAULT 0.0,
  btc REAL NOT NULL DEFAULT 0.0,
  advance REAL NOT NULL DEFAULT 0.0,
  variance REAL NOT NULL DEFAULT 0.0,
  settlement_json TEXT,
  sealed_at TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pms_master_date ON pms_daily_master_audit_ledger(date);
CREATE INDEX IF NOT EXISTS idx_pms_master_status ON pms_daily_master_audit_ledger(status);

-- Seed October Days 1 to 5 (Audited & Locked Master Baseline)
INSERT OR REPLACE INTO pms_daily_master_audit_ledger (
  date, day_number, status, bills_count, rooms_sold, room_rent, food_bill, bev_bill,
  fnb_total, laundry, misc, gross_amount, discount, management, taxable_base,
  cgst, sgst, total_gst, total_amount, tax_saved, cash, online, cc, btc, advance,
  variance, settlement_json, sealed_at
) VALUES
  ('2026-10-01', 1, 'Audited & Locked', 8, 8, 26400.00, 3420.00, 380.00, 3800.00, 150.00, 0.00, 30350.00, 0.00, 1500.00, 28850.00, 721.25, 721.25, 1442.50, 30292.50, 75.00, 12500.00, 15081.00, 3000.00, 0.00, 5000.00, 0.00, '{"cash":12500,"online":15081,"cc":3000,"btc":0,"advance":5000}', '2026-10-02T00:05:00Z'),
  ('2026-10-02', 2, 'Audited & Locked', 11, 11, 35200.00, 4680.00, 520.00, 5200.00, 240.00, 0.00, 40640.00, 0.00, 2200.00, 38440.00, 961.00, 961.00, 1922.00, 40362.00, 110.00, 16800.00, 19946.40, 4000.00, 0.00, 7500.00, 0.00, '{"cash":16800,"online":19946.4,"cc":4000,"btc":0,"advance":7500}', '2026-10-03T00:05:00Z'),
  ('2026-10-03', 3, 'Audited & Locked', 7, 7, 22800.00, 2850.00, 310.00, 3160.00, 0.00, 0.00, 25960.00, 50.00, 1200.00, 24710.00, 617.75, 617.75, 1235.50, 25945.50, 60.00, 10500.00, 12892.60, 2800.00, 0.00, 4500.00, 0.00, '{"cash":10500,"online":12892.6,"cc":2800,"btc":0,"advance":4500}', '2026-10-04T00:05:00Z'),
  ('2026-10-04', 4, 'Audited & Locked', 9, 9, 28500.00, 3800.00, 420.00, 4220.00, 180.00, 0.00, 32900.00, 0.00, 1800.00, 31100.00, 777.50, 777.50, 1555.00, 32655.00, 90.00, 14200.00, 16167.00, 3500.00, 0.00, 6000.00, 0.00, '{"cash":14200,"online":16167,"cc":3500,"btc":0,"advance":6000}', '2026-10-05T00:05:00Z'),
  ('2026-10-05', 5, 'Audited & Locked', 8, 8, 25600.00, 3150.00, 350.00, 3500.00, 120.00, 0.00, 29220.00, 20.00, 1400.00, 27800.00, 695.00, 695.00, 1390.00, 29190.00, 70.00, 11800.00, 14590.00, 3200.00, 0.00, 5200.00, 0.00, '{"cash":11800,"online":14590,"cc":3200,"btc":0,"advance":5200}', '2026-10-06T00:05:00Z');
