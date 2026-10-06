-- ============================================================================
-- Migration 0050: Staff Credentials & Shift Telemetry for Mobile PWA Portals
-- Dedicated authentication and real-time clock-in audit logging for:
-- 1. Steward Mobile Order Pad (?view=steward)
-- 2. Kitchen Display System - KDS (?view=kds)
-- 3. Housekeeping Mobile Portal - Manager & Supervisor (?view=housekeeping)
-- ============================================================================

-- 1. Staff Credentials Table
CREATE TABLE IF NOT EXISTS staff_credentials (
  staff_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- STEWARD, KITCHEN_KDS, HK_MANAGER, HK_SUPERVISOR, ADMIN
  department TEXT NOT NULL, -- F&B Service, Kitchen, Housekeeping, Operations
  portal_access TEXT NOT NULL, -- steward, kds, housekeeping, all
  phone TEXT,
  pin TEXT NOT NULL, -- 4-digit numeric PIN for swift mobile entry
  status TEXT NOT NULL DEFAULT 'Active', -- Active, Inactive
  default_shift TEXT NOT NULL DEFAULT 'Morning', -- Morning, Evening, Night
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Real-Time Staff Shift Logs (Clock-Ins & Attendance Telemetry)
CREATE TABLE IF NOT EXISTS staff_shift_logs (
  session_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  portal TEXT NOT NULL, -- steward, kds, housekeeping_mgr, housekeeping_sup
  shift TEXT NOT NULL, -- Morning, Evening, Night
  business_date TEXT NOT NULL, -- YYYY-MM-DD
  login_time TEXT NOT NULL, -- ISO timestamp (IST/UTC)
  logout_time TEXT, -- ISO timestamp when session ended / clocked out
  duration_minutes INTEGER DEFAULT 0,
  device_info TEXT, -- User-Agent / device model
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'Active', -- Active, Completed, Auto-Closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_shift_logs_staff ON staff_shift_logs(staff_id, business_date);
CREATE INDEX IF NOT EXISTS idx_staff_shift_logs_status ON staff_shift_logs(status, portal);
CREATE INDEX IF NOT EXISTS idx_staff_shift_logs_date ON staff_shift_logs(business_date);

-- 3. Seed Authentic Staff Credentials

-- A. Stewards (Cannon Kitchen F&B Floor Service)
INSERT OR REPLACE INTO staff_credentials (staff_id, name, role, department, portal_access, phone, pin, status, default_shift) VALUES
('STW-01', 'Sadananda', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12001', '1201', 'Active', 'Morning'),
('STW-02', 'Koti', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12002', '1202', 'Active', 'Evening'),
('STW-03', 'Deepak', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12003', '1203', 'Active', 'Morning'),
('STW-04', 'Bijay', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12004', '1204', 'Active', 'Evening'),
('STW-05', 'Ramesh', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12005', '1205', 'Active', 'Night'),
('STW-06', 'Santosh', 'STEWARD', 'F&B Service', 'steward', '+91 94370 12006', '1206', 'Active', 'Morning');

-- B. Kitchen Line Cooks & Chefs (Kitchen KDS Display)
INSERT OR REPLACE INTO staff_credentials (staff_id, name, role, department, portal_access, phone, pin, status, default_shift) VALUES
('CHEF-01', 'Chef Basanta Swain', 'KITCHEN_KDS', 'Kitchen', 'kds', '+91 94370 25001', '5501', 'Active', 'Morning'),
('CHEF-02', 'Chef Pradeep Patra', 'KITCHEN_KDS', 'Kitchen', 'kds', '+91 94370 25002', '5502', 'Active', 'Evening'),
('CHEF-03', 'Chef Niranjan Das', 'KITCHEN_KDS', 'Kitchen', 'kds', '+91 94370 25003', '5503', 'Active', 'Night');

-- C. Housekeeping Management & Floor Supervisors
INSERT OR REPLACE INTO staff_credentials (staff_id, name, role, department, portal_access, phone, pin, status, default_shift) VALUES
('HK-MGR-01', 'Anita Majhi', 'HK_MANAGER', 'Housekeeping', 'housekeeping', '+91 98611 52365', '7701', 'Active', 'Morning'),
('HK-SUP-01', 'Bikram Mohanty', 'HK_SUPERVISOR', 'Housekeeping', 'housekeeping', '+91 63707 57541', '7702', 'Active', 'Evening'),
('HK-SUP-02', 'Sunil Nayak', 'HK_SUPERVISOR', 'Housekeeping', 'housekeeping', '+91 63707 57542', '7703', 'Active', 'Night');

-- D. Master Operations & Duty Manager Override
INSERT OR REPLACE INTO staff_credentials (staff_id, name, role, department, portal_access, phone, pin, status, default_shift) VALUES
('MGR-MASTER', 'Duty Manager (Operations Lead)', 'ADMIN', 'Operations', 'all', '+91 63707 57541', '7650', 'Active', 'Morning');
