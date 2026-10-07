-- ============================================================================
-- Migration 0051: Hotel Elite Inn Automated Continuous F&B Day-to-Date Statutory Ledger
-- Synchronizes, times, phases, and cryptographically seals daily F&B tax reconciliation
-- Core Statutory Accounting Equation:
--   Gross = Food + Bev
--   Net Taxable = Gross - Discount - MGM (Sheet 2 Table 444 VIP & Table 555 Staff @ 0% GST)
--   Output GST = CGST (2.5%) + SGST (2.5%)
--   Total Supply = Net Taxable + CGST + SGST
--   Tax Saved = MGM * 5% (Legal exemption on internal staff/VIP non-commercial dining)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fnb_daily_statutory_ledger (
  date TEXT PRIMARY KEY,
  day_number INTEGER NOT NULL,
  bills_count INTEGER NOT NULL DEFAULT 0,
  food_amount REAL NOT NULL DEFAULT 0.0,
  bev_amount REAL NOT NULL DEFAULT 0.0,
  gross_amount REAL NOT NULL DEFAULT 0.0,
  discount REAL NOT NULL DEFAULT 0.0,
  mgm_amount REAL NOT NULL DEFAULT 0.0,
  taxable_base REAL NOT NULL DEFAULT 0.0,
  cgst REAL NOT NULL DEFAULT 0.0,
  sgst REAL NOT NULL DEFAULT 0.0,
  total_gst REAL NOT NULL DEFAULT 0.0,
  total_amount REAL NOT NULL DEFAULT 0.0,
  tax_saved REAL NOT NULL DEFAULT 0.0,
  settlement_json TEXT,
  status TEXT NOT NULL DEFAULT 'Closed', -- 'Live Today', 'Audited & Locked', 'Closed', 'Scheduled'
  sealed_at TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fnb_statutory_date ON fnb_daily_statutory_ledger(date);
CREATE INDEX IF NOT EXISTS idx_fnb_statutory_status ON fnb_daily_statutory_ledger(status);

-- Seed Days 1 to 5 of October 2026 (Audited & Locked)
INSERT OR REPLACE INTO fnb_daily_statutory_ledger (
  date, day_number, bills_count, food_amount, bev_amount, gross_amount,
  discount, mgm_amount, taxable_base, cgst, sgst, total_gst, total_amount,
  tax_saved, settlement_json, status, sealed_at
) VALUES
  ('2026-10-01', 1, 42, 17850.00, 1420.00, 19270.00, 0.00, 1200.00, 18070.00, 451.75, 451.75, 903.50, 18973.50, 60.00, '{"cash":9200,"upi":9773.5,"card":0,"roomFolio":0}', 'Audited & Locked', '2026-10-02T00:05:00Z'),
  ('2026-10-02', 2, 58, 31200.00, 2593.00, 33793.00, 0.00, 1850.00, 31943.00, 798.58, 798.58, 1597.15, 33540.15, 92.50, '{"cash":15400,"upi":18140.15,"card":0,"roomFolio":0}', 'Audited & Locked', '2026-10-03T00:05:00Z'),
  ('2026-10-03', 3, 47, 22100.00, 1840.00, 23940.00, 50.00, 1400.00, 22490.00, 562.25, 562.25, 1124.50, 23614.50, 70.00, '{"cash":11000,"upi":12614.5,"card":0,"roomFolio":0}', 'Audited & Locked', '2026-10-04T00:05:00Z'),
  ('2026-10-04', 4, 51, 25400.00, 2150.00, 27550.00, 0.00, 1650.00, 25900.00, 647.50, 647.50, 1295.00, 27195.00, 82.50, '{"cash":12500,"upi":14695,"card":0,"roomFolio":0}', 'Audited & Locked', '2026-10-05T00:05:00Z'),
  ('2026-10-05', 5, 44, 19800.00, 1620.00, 21420.00, 20.00, 1350.00, 20050.00, 501.25, 501.25, 1002.50, 21052.50, 67.50, '{"cash":9800,"upi":11252.5,"card":0,"roomFolio":0}', 'Audited & Locked', '2026-10-06T00:05:00Z');
