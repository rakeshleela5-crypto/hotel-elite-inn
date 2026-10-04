-- ============================================================================
-- HOTEL ELITE INN - MUNIGUDA, RAYAGADA, ODISHA
-- AUTHENTIC 27-ROOM PHYSICAL INVENTORY & TARIFF SPECIFICATION
-- ============================================================================

PRAGMA foreign_keys = OFF;

DELETE FROM bookings;
DELETE FROM room_service_requests;
DELETE FROM food_orders;
DELETE FROM checkout_inspections;
DELETE FROM rooms;

-- FLOOR 1 (9 Keys: 101 - 109)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('101', 'Executive Room', 'EXECUTIVE', 1, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('102', 'Deluxe Room', 'DELUXE', 1, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('103', 'Executive Room', 'EXECUTIVE', 1, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('104', 'Deluxe Room', 'DELUXE', 1, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('105', 'Executive Room', 'EXECUTIVE', 1, 2050.00, 2, 1, 'Executive Twin Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('106', 'Deluxe Room', 'DELUXE', 1, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('107', 'Executive Room', 'EXECUTIVE', 1, 2050.00, 3, 1, 'Executive Triple Bed', '3 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('108', 'Standard Deluxe', 'STANDARD', 1, 1450.00, 1, 1, 'Standard Single Bed', '1 Adult', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('109', 'Premium Suite', 'SUITE', 1, 3250.00, 2, 2, 'Suite King Bed', '2 Adults', '["TP 1ST FLOOR Wi-Fi", "L.E.D TV", "Living Area", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available');

-- FLOOR 2 (9 Keys: 201 - 209)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('201', 'Executive Room', 'EXECUTIVE', 2, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('202', 'Deluxe Room', 'DELUXE', 2, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('203', 'Executive Room', 'EXECUTIVE', 2, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('204', 'Deluxe Room', 'DELUXE', 2, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('205', 'Executive Room', 'EXECUTIVE', 2, 2050.00, 2, 1, 'Executive Twin Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('206', 'Deluxe Room', 'DELUXE', 2, 1750.00, 2, 1, 'Deluxe King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('207', 'Executive Room', 'EXECUTIVE', 2, 2050.00, 3, 1, 'Executive Triple Bed', '3 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('208', 'Standard Deluxe', 'STANDARD', 2, 1450.00, 1, 1, 'Standard Single Bed', '1 Adult', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('209', 'Premium Suite', 'SUITE', 2, 3250.00, 2, 2, 'Suite King Bed', '2 Adults', '["TP 2ND FLOOR Wi-Fi", "L.E.D TV", "Living Area", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available');

-- FLOOR 3 (9 Keys: 301 - 309)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('301', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('302', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('303', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('304', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('305', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('306', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('307', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('308', 'Executive Room', 'EXECUTIVE', 3, 2050.00, 2, 1, 'Executive King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available'),
('309', 'Premium Suite', 'PREMIUM', 3, 2450.00, 2, 1, 'Premium King Bed', '2 Adults', '["TP 3RD FLOOR Wi-Fi", "L.E.D TV", "24h Hot & Cold Water", "Tea/Coffee Maker", "Complimentary Breakfast", "1L Mineral Water", "Intercom: 9"]', 'Available');

PRAGMA foreign_keys = ON;
