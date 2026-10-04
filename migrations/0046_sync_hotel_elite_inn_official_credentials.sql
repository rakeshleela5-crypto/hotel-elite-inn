-- ============================================================================
-- Migration 0046: Sync Authentic Hotel Elite Inn Credentials
-- Verified directly from printed Room Service Tax Invoice (Receipt R.S/2913)
-- Legal & Trade Name: Hotel Elite Inn
-- GSTIN: 21AEWFS9433F1ZN | PAN: AEWFS9433F | FSSAI: 10523016000047
-- SAC: 996311 (Lodging) | 996332 (Restaurant / Room Service F&B)
-- Location: Opposite Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) - 765020
-- Phone: +91-6370757541
-- ============================================================================

-- Ensure hotel_config table exists
CREATE TABLE IF NOT EXISTS hotel_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Upsert official credentials
INSERT OR REPLACE INTO hotel_config (key, value, updated_at) VALUES
('hotel_name', 'Hotel Elite Inn', CURRENT_TIMESTAMP),
('trade_name', 'Hotel Elite Inn', CURRENT_TIMESTAMP),
('legal_name', 'Hotel Elite Inn', CURRENT_TIMESTAMP),
('gstin', '21AEWFS9433F1ZN', CURRENT_TIMESTAMP),
('pan', 'AEWFS9433F', CURRENT_TIMESTAMP),
('fssai', '10523016000047', CURRENT_TIMESTAMP),
('sac_code_rooms', '996311', CURRENT_TIMESTAMP),
('sac_code_fb', '996332', CURRENT_TIMESTAMP),
('phone', '+91-6370757541', CURRENT_TIMESTAMP),
('email', 'hoteleliteinn.mngd@gmail.com', CURRENT_TIMESTAMP),
('address_street', 'Opposite Railway Station Main Road', CURRENT_TIMESTAMP),
('city', 'Muniguda', CURRENT_TIMESTAMP),
('district', 'Rayagada', CURRENT_TIMESTAMP),
('state', 'Odisha', CURRENT_TIMESTAMP),
('state_code', '21', CURRENT_TIMESTAMP),
('pin_code', '765020', CURRENT_TIMESTAMP),
('pos_outlet_name', 'POS 5- ROOM SERVICE', CURRENT_TIMESTAMP),
('bill_series_prefix', 'R.S/', CURRENT_TIMESTAMP),
('cashless_policy_notice', '------PLEASE DONOT PAY CASH------', CURRENT_TIMESTAMP);

-- Update any past GSTR-1 filings with official GSTIN
UPDATE gstr1_filings 
SET gstin = '21AEWFS9433F1ZN' 
WHERE gstin IS NULL OR gstin = '' OR gstin = '21ABCDE1234F1Z5';
