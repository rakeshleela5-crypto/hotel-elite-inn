-- ============================================================================
-- Migration 0047: Hotel Elite Inn Operational Upgrades
-- 1. Multi-KOT Running Table Sessions (POS Table Folios)
-- 2. Housekeeping Logs (Attendant Accountability & Turnaround tracking)
-- 3. Automated Midnight Day Close Audits (Night Audit Day Book snapshots)
-- 4. Room Stay Extensions (Anti-fraud short stay audits)
-- ============================================================================

-- Table for Active Running Table Sessions (Multi-KOT)
CREATE TABLE IF NOT EXISTS pos_table_sessions (
    session_id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen',
    guest_name TEXT,
    cover INTEGER DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'OCCUPIED', -- 'OCCUPIED', 'BILLED', 'SETTLED', 'VOIDED'
    kots_json TEXT NOT NULL DEFAULT '[]',
    cumulative_items_json TEXT NOT NULL DEFAULT '[]',
    subtotal REAL DEFAULT 0,
    gst REAL DEFAULT 0,
    net_total REAL DEFAULT 0,
    first_kot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_kot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP,
    settlement_mode TEXT,
    captain TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_table_sessions_status ON pos_table_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pos_table_sessions_table ON pos_table_sessions(table_number);

-- Table for Housekeeping Logs
CREATE TABLE IF NOT EXISTS housekeeping_logs (
    log_id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL, -- 'Dirty', 'Under Cleaning', 'Clean & Inspected', 'Maintenance'
    attendant_name TEXT NOT NULL,
    notes TEXT,
    cleaned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hk_room ON housekeeping_logs(room_number);
CREATE INDEX IF NOT EXISTS idx_hk_created_at ON housekeeping_logs(created_at);

-- Table for Automated Midnight Day Close (Night Audits)
CREATE TABLE IF NOT EXISTS night_audit_records (
    audit_id TEXT PRIMARY KEY,
    business_date TEXT NOT NULL UNIQUE,
    closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auto_triggered INTEGER DEFAULT 1, -- 1 = Automated Midnight Cron, 0 = Manual
    total_rooms INTEGER DEFAULT 18,
    occupied_rooms INTEGER DEFAULT 0,
    occupancy_pct REAL DEFAULT 0,
    room_revenue REAL DEFAULT 0,
    fnb_revenue REAL DEFAULT 0,
    other_revenue REAL DEFAULT 0,
    gross_revenue REAL DEFAULT 0,
    cash_collected REAL DEFAULT 0,
    upi_collected REAL DEFAULT 0,
    card_collected REAL DEFAULT 0,
    btc_corporate_credit REAL DEFAULT 0,
    drawer_cash_opening REAL DEFAULT 5000,
    drawer_cash_physical REAL DEFAULT 0,
    cash_variance REAL DEFAULT 0,
    auditor_name TEXT DEFAULT 'Automated System (12:00 AM Midnight Trigger)',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_night_audit_date ON night_audit_records(business_date);

-- Table for Anti-Fraud Stay Extensions
CREATE TABLE IF NOT EXISTS room_stay_extensions (
    extension_id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    booking_id TEXT,
    guest_name TEXT NOT NULL,
    stay_type TEXT NOT NULL, -- 'SHORT_STAY_HOURLY', 'STANDARD_24H'
    extended_hours INTEGER DEFAULT 0,
    extended_nights INTEGER DEFAULT 0,
    additional_tariff REAL DEFAULT 0,
    payment_mode TEXT NOT NULL, -- 'CASH', 'UPI', 'CARD', 'BTC'
    receptionist_name TEXT NOT NULL,
    receptionist_pin_verified INTEGER DEFAULT 1,
    extended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stay_ext_room ON room_stay_extensions(room_number);
