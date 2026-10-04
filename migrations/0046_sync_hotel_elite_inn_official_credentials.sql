-- ============================================================================
-- HOTEL ELITE INN - MUNIGUDA, RAYAGADA (OFFICIAL CREDENTIALS & STATUTORY SYNC)
-- Trade Name: Hotel Elite Inn
-- Legal Name: Hotel Elite Inn
-- GSTIN: 21AEWFS9433F1ZN | PAN: AEWFS9433F | State Code: 21 (Odisha)
-- FSSAI Lic No: 10523016000047
-- SAC Code Lodging: 996311 | SAC Code F&B: 996332
-- Address: Opposite Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) - 765020
-- Phone: +91-6370757541 | Cashless Policy: PLEASE DO NOT PAY CASH
-- ============================================================================

-- 1. Insert or Replace Hotel Configuration Master Records
INSERT OR REPLACE INTO hotel_config (key, value, description) VALUES
('hotel_name', 'Hotel Elite Inn', 'Official Trade Name'),
('trade_name', 'Hotel Elite Inn', 'Form GST REG-06 Trade Name'),
('legal_name', 'Hotel Elite Inn', 'Form GST REG-06 Legal Name'),
('hotel_address', 'Opposite Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) - 765020', 'Principal Place of Business'),
('landmark', 'Opposite Railway Station Main Road', 'Address Landmark'),
('street', 'Station Main Road', 'Road/Street'),
('city', 'Muniguda', 'City/Town/Village'),
('district', 'Rayagada', 'District'),
('state', 'Odisha', 'State Name'),
('pin_code', '765020', 'PIN Code'),
('gstin', '21AEWFS9433F1ZN', 'Official GST Identification Number'),
('pan', 'AEWFS9433F', 'Permanent Account Number'),
('state_code', '21', 'GST State Code for Odisha'),
('fssai', '10523016000047', 'FSSAI Food Safety License Number'),
('sac_code_rooms', '996311', 'SAC Code for Lodging and Room Accommodation'),
('sac_code_fb', '996332', 'SAC Code for Restaurant and Room Service F&B'),
('pos_outlet', 'POS 5- ROOM SERVICE', 'Primary F&B Point of Sale Outlet'),
('bill_series_rs', 'R.S/', 'Room Service Invoice Numbering Prefix'),
('cashless_policy', 'PLEASE DO NOT PAY CASH', 'Mandatory Cashless Guest Policy Notice'),
('phone', '+91-6370757541', 'Primary Reception Switchboard'),
('alt_phone', '+91 6370757541', 'Secondary Reception Desk Phone'),
('email', 'hoteleliteinn@gmail.com', 'Official Reservations Email'),
('upi_id', 'hoteleliteinn@upi', 'Official Merchant UPI ID');

-- 2. Update existing GSTR-1 records with the official Hotel Elite Inn GSTIN
UPDATE gstr1_filings 
SET gstin = '21AEWFS9433F1ZN'
WHERE gstin != '21AEWFS9433F1ZN';
