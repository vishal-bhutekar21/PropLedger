-- ============================================================
-- PropLedger — Enterprise Seed Data (Deterministic & FK-Safe)
-- ============================================================

-- 1. ROLES & USERS
-- Password for all seeded users: Password@123 (BCrypt: $2a$10$w8T0U1B2vIe6Cj8vV1YmU.yE3z7SjX5d1aWbA4q7Z2p8R9e0T6u2K)
-- We insert users and associate roles.

INSERT INTO users (user_id, username, email, password_hash, full_name, phone, is_active) VALUES
(1, 'admin', 'admin@propledger.io', '$2a$10$w8T0U1B2vIe6Cj8vV1YmU.yE3z7SjX5d1aWbA4q7Z2p8R9e0T6u2K', 'Vikramaditya Singhania', '+91 98200 11223', true),
(2, 'manager_priya', 'priya.nair@propledger.io', '$2a$10$w8T0U1B2vIe6Cj8vV1YmU.yE3z7SjX5d1aWbA4q7Z2p8R9e0T6u2K', 'Priya Nair', '+91 98450 33445', true),
(3, 'accountant_rahul', 'rahul.mehta@propledger.io', '$2a$10$w8T0U1B2vIe6Cj8vV1YmU.yE3z7SjX5d1aWbA4q7Z2p8R9e0T6u2K', 'Rahul Mehta', '+91 98110 55667', true),
(4, 'tech_suresh', 'suresh.kumar@propledger.io', '$2a$10$w8T0U1B2vIe6Cj8vV1YmU.yE3z7SjX5d1aWbA4q7Z2p8R9e0T6u2K', 'Suresh Kumar', '+91 97310 77889', true)
ON CONFLICT (user_id) DO NOTHING;

-- Map users to roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ADMIN
(2, 2), -- priya -> PROPERTY_MANAGER
(3, 3), -- rahul -> ACCOUNTANT
(4, 4)  -- suresh -> MAINTENANCE_MANAGER
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Reset sequence for users
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- 2. OWNERS
INSERT INTO owners (owner_id, full_name, email, phone, company_name, address, tax_id, status) VALUES
(1, 'Rajiv Oberoi', 'rajiv@oberoiholdings.com', '+91 98200 44556', 'Oberoi Realty Holdings Ltd.', 'Level 18, Commerz II, International Business Park, Mumbai', '27AAACH1234F1Z1', 'ACTIVE'),
(2, 'Ananya Birla', 'ananya@birlaestates.in', '+91 98220 77889', 'Birla Heritage Estates LLP', 'Birla Tower, 25 Barakhamba Road, New Delhi', '07AACCB5678G1Z2', 'ACTIVE'),
(3, 'Girish Reddy', 'girish@deccanproperties.com', '+91 98450 99001', 'Deccan Prime Assets Corp', 'Deccan Chambers, Raj Bhavan Road, Somajiguda, Hyderabad', '36AAACD9012H1Z3', 'ACTIVE')
ON CONFLICT (owner_id) DO NOTHING;

SELECT setval('owners_owner_id_seq', (SELECT MAX(owner_id) FROM owners));

-- 3. PROPERTIES
INSERT INTO properties (property_id, owner_id, property_name, property_type, address_line1, city, state, zip_code, country, description, total_area_sqft, year_built, status) VALUES
(1, 1, 'Prestige Tech Cloud Towers', 'COMMERCIAL', 'Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', 'India', 'Grade-A LEED Platinum certified IT business park with modern HVAC and data centers.', 450000.00, 2021, 'ACTIVE'),
(2, 1, 'Oberoi Garden City Residences', 'RESIDENTIAL', 'Western Express Highway, Goregaon East', 'Mumbai', 'Maharashtra', '400063', 'India', 'Luxury residential gated community featuring 3 towers with clubhouse and swimming pools.', 320000.00, 2019, 'ACTIVE'),
(3, 2, 'Lodha Grandeur Commercial', 'COMMERCIAL', 'Senapati Bapat Marg, Lower Parel', 'Mumbai', 'Maharashtra', '400013', 'India', 'High-end corporate office tower catering to fintech and global investment banking firms.', 280000.00, 2020, 'ACTIVE'),
(4, 3, 'Cyber Gateway Suites', 'MIXED_USE', 'HITEC City, Madhapur', 'Hyderabad', 'Telangana', '500081', 'India', 'Integrated retail and residential studio apartments adjacent to the metro line.', 195000.00, 2022, 'ACTIVE'),
(5, 3, 'Logistics Hub North', 'INDUSTRIAL', 'NH 44, Medchal Industrial Corridor', 'Hyderabad', 'Telangana', '501401', 'India', 'State-of-the-art logistics and temperature-controlled cold-chain warehousing.', 550000.00, 2023, 'ACTIVE')
ON CONFLICT (property_id) DO NOTHING;

SELECT setval('properties_property_id_seq', (SELECT MAX(property_id) FROM properties));

-- 4. BUILDINGS
INSERT INTO buildings (building_id, property_id, building_name, building_code, floors, year_built, description, status) VALUES
(1, 1, 'Tower Alpha', 'BLD-A', 14, 2021, 'Main software development tower', 'ACTIVE'),
(2, 1, 'Tower Beta', 'BLD-B', 12, 2021, 'Executive offices and innovation hub', 'ACTIVE'),
(3, 2, 'Cedar Tower', 'BLD-C', 24, 2019, 'Residential 2BHK and 3BHK high-rise', 'ACTIVE'),
(4, 2, 'Oak Tower', 'BLD-O', 24, 2019, 'Residential 3BHK and 4BHK luxury units', 'ACTIVE'),
(5, 3, 'Pinnacle Tower', 'BLD-P', 30, 2020, 'Commercial premium floorplates', 'ACTIVE'),
(6, 4, 'Gateway Plaza A', 'GW-A', 10, 2022, 'Retail ground floors and studio suites', 'ACTIVE'),
(7, 5, 'Warehouse Unit 1', 'WH-01', 2, 2023, 'Cold storage and distribution facility', 'ACTIVE'),
(8, 5, 'Warehouse Unit 2', 'WH-02', 2, 2023, 'Bulk pallet storage center', 'ACTIVE')
ON CONFLICT (building_id) DO NOTHING;

SELECT setval('buildings_building_id_seq', (SELECT MAX(building_id) FROM buildings));

-- 5. UNITS
INSERT INTO units (unit_id, building_id, unit_number, unit_type, floor_number, bedrooms, bathrooms, area_sqft, monthly_rent, security_deposit, status, description, amenities) VALUES
-- Prestige Tech Cloud (Tower Alpha)
(1, 1, 'Suite 101', 'COMMERCIAL_OFFICE', 1, 0, 4, 4500.00, 315000.00, 1890000.00, 'OCCUPIED', 'Turnkey office floor with 60 workstations', 'Fibre Internet, Central HVAC, Cafeteria Access'),
(2, 1, 'Suite 102', 'COMMERCIAL_OFFICE', 1, 0, 2, 2800.00, 196000.00, 1176000.00, 'OCCUPIED', 'Corner office suite with natural lighting', 'Central HVAC, Dual Power Backup'),
(3, 1, 'Suite 201', 'COMMERCIAL_OFFICE', 2, 0, 6, 8000.00, 560000.00, 3360000.00, 'OCCUPIED', 'Full floor tech setup with server room', 'Dedicated UPS, 24/7 Access, Card Access'),
(4, 1, 'Suite 301', 'COMMERCIAL_OFFICE', 3, 0, 4, 4200.00, 294000.00, 1764000.00, 'VACANT', 'Warm shell office space ready for fit-out', 'Central HVAC, Fire Suppression'),

-- Prestige Tech Cloud (Tower Beta)
(5, 2, 'Suite B-101', 'COMMERCIAL_OFFICE', 1, 0, 3, 3500.00, 245000.00, 1470000.00, 'OCCUPIED', 'Executive corporate suite', 'Executive Lounge, Boardroom Access'),
(6, 2, 'Suite B-201', 'COMMERCIAL_OFFICE', 2, 0, 5, 6000.00, 420000.00, 2520000.00, 'VACANT', 'Open plan floorplate with scenic view', 'HVAC, 100% Power Backup'),

-- Oberoi Garden City (Cedar Tower)
(7, 3, 'Unit 401', '2BHK', 4, 2, 2, 1150.00, 58000.00, 174000.00, 'OCCUPIED', 'Spacious garden-facing 2 bedroom apartment', 'Covered Parking, Modular Kitchen, Balcony'),
(8, 3, 'Unit 402', '2BHK', 4, 2, 2, 1150.00, 58000.00, 174000.00, 'OCCUPIED', 'Well-ventilated East-facing 2 bedroom flat', 'Modular Kitchen, Piped Gas, Intercom'),
(9, 3, 'Unit 501', '3BHK', 5, 3, 3, 1600.00, 82000.00, 246000.00, 'OCCUPIED', 'Premium 3 bedroom with master ensuite', 'Clubhouse, Swimming Pool, 2 Car Parks'),
(10, 3, 'Unit 502', '3BHK', 5, 3, 3, 1600.00, 82000.00, 246000.00, 'VACANT', 'Freshly painted 3BHK ready for immediate move-in', 'Balcony, Wooden Flooring, Solar Water'),
(11, 3, 'Unit 601', '2BHK', 6, 2, 2, 1150.00, 60000.00, 180000.00, 'MAINTENANCE', 'Undergoing bathroom plumbing refurbishment', 'Clubhouse, Gym, Covered Parking'),

-- Oberoi Garden City (Oak Tower)
(12, 4, 'Unit 1201', '3BHK', 12, 3, 3, 1750.00, 95000.00, 285000.00, 'OCCUPIED', 'High floor skyline view apartment', 'Smart Home Controls, Italian Marble, 2 Parkings'),
(13, 4, 'Unit 1202', '3BHK', 12, 3, 3, 1750.00, 95000.00, 285000.00, 'OCCUPIED', 'Sunset facing luxury residence', 'Clubhouse Access, Heated Pool, Balcony'),
(14, 4, 'Unit 1801', '4BHK', 18, 4, 4, 2600.00, 145000.00, 435000.00, 'OCCUPIED', 'Ultra luxury 4BHK with domestic staff quarters', 'Private Elevator, 3 Parkings, Jacuzzi'),
(15, 4, 'Unit 2401', 'PENTHOUSE', 24, 4, 5, 3800.00, 250000.00, 750000.00, 'RESERVED', 'Duplex penthouse with private terrace and sky garden', 'Private Pool, Butler Pantry, 4 Parkings'),

-- Lodha Grandeur
(16, 5, 'Floor 15-East', 'COMMERCIAL_OFFICE', 15, 0, 8, 12000.00, 1440000.00, 8640000.00, 'OCCUPIED', 'Financial trading floor setup', 'Triple Redundant Power, Low-Latency Fibre'),
(17, 5, 'Floor 15-West', 'COMMERCIAL_OFFICE', 15, 0, 6, 9500.00, 1140000.00, 6840000.00, 'OCCUPIED', 'Multinational advisory firm headquarters', 'Acoustic Glass, Executive Lounge'),
(18, 5, 'Floor 16', 'COMMERCIAL_OFFICE', 16, 0, 12, 21500.00, 2580000.00, 15480000.00, 'VACANT', 'Full contiguous corporate floorplate', 'Dedicated Elevator Bank, LEED Platinum'),

-- Cyber Gateway (Mixed Use)
(19, 6, 'Studio 301', 'STUDIO', 3, 1, 1, 550.00, 28000.00, 84000.00, 'OCCUPIED', 'Furnished studio for IT professionals', 'Wi-Fi, Kitchenette, Housekeeping, Gym'),
(20, 6, 'Studio 302', 'STUDIO', 3, 1, 1, 550.00, 28000.00, 84000.00, 'OCCUPIED', 'Furnished studio near metro station', 'Gym, Terrace Cafe, 24/7 Security'),
(21, 6, 'Retail Ground 01', 'RETAIL', 1, 0, 2, 2200.00, 176000.00, 1056000.00, 'OCCUPIED', 'High footfall corner retail banking outlet', 'Glass Façade, Loading Dock, Customer Parking'),
(22, 6, 'Retail Ground 02', 'RETAIL', 1, 0, 2, 1800.00, 144000.00, 864000.00, 'VACANT', 'Prime retail showroom space', 'Direct Road Visibility, HVAC Ducting'),

-- Logistics Hub North
(23, 7, 'Bay 101', 'WAREHOUSE', 1, 0, 4, 45000.00, 900000.00, 2700000.00, 'OCCUPIED', 'Cold chain storage facility (-20C to +4C)', 'Dock Levelers, Solar Roof, 12m Clear Height'),
(24, 7, 'Bay 102', 'WAREHOUSE', 1, 0, 2, 35000.00, 700000.00, 2100000.00, 'OCCUPIED', 'Pharmaceutical temperature-controlled bay', 'HVAC, Automated Sprinklers, High-Bay Racks'),
(25, 8, 'Bay 201', 'WAREHOUSE', 1, 0, 4, 60000.00, 1080000.00, 3240000.00, 'VACANT', 'Dry goods FMCG cross-docking warehouse', '16 Loading Docks, Heavy-Duty Concrete Floor')
ON CONFLICT (unit_id) DO NOTHING;

SELECT setval('units_unit_id_seq', (SELECT MAX(unit_id) FROM units));

-- 6. TENANTS
INSERT INTO tenants (tenant_id, full_name, email, phone, date_of_birth, national_id, address_line1, city, state, country, status) VALUES
(1, 'Infosys Enterprise Cloud Ltd', 'facilities@infosys.com', '+91 80 2852 0261', '1981-07-02', 'AAACI1234F', 'Electronics City', 'Bengaluru', 'Karnataka', 'India', 'ACTIVE'),
(2, 'Razorpay Software Pvt Ltd', 'admin@razorpay.com', '+91 80 4666 9555', '2014-05-18', 'AABCR5678G', 'Koramangala 4th Block', 'Bengaluru', 'Karnataka', 'India', 'ACTIVE'),
(3, 'Flipkart Internet Pvt Ltd', 'realestate@flipkart.com', '+91 80 6798 7777', '2007-09-05', 'AACCF9012H', 'Bellandur Village', 'Bengaluru', 'Karnataka', 'India', 'ACTIVE'),
(4, 'Siddharth & Meera Sengupta', 'siddharth.sengupta@gmail.com', '+91 98201 12345', '1986-04-12', 'ABCD1234E', 'Goregaon East', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(5, 'Rohan & Tanvi Kulkarni', 'rohan.kulkarni@outlook.com', '+91 98202 23456', '1989-11-23', 'BCDE2345F', 'Goregaon East', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(6, 'Dr. Arvind Swaminathan', 'dr.arvind.s@apollohospitals.com', '+91 98203 34567', '1975-08-30', 'CDEF3456G', 'Lower Parel', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(7, 'Vikram & Radhika Deshmukh', 'vikram.deshmukh@tcs.com', '+91 98204 45678', '1984-02-14', 'DEFG4567H', 'Andheri West', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(8, 'Goldman Sachs Asset Mgmt', 'facilities.india@gs.com', '+91 22 6616 9000', '1869-01-01', 'AABCG1234K', 'Lower Parel Financial Dist', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(9, 'Morgan Stanley India Co', 'operations.mumbai@morganstanley.com', '+91 22 6118 1000', '1935-09-05', 'AACCM5678L', 'Senapati Bapat Marg', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(10, 'Arjun Reddy', 'arjun.reddy@techmahindra.com', '+91 98480 11223', '1995-06-19', 'EFGH5678I', 'HITEC City', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(11, 'Neha Sharma', 'neha.sharma@microsoft.com', '+91 98481 22334', '1997-01-25', 'FGHI6789J', 'Gachibowli', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(12, 'HDFC Bank Ltd (Retail Branch)', 'branch.mgr.hitec@hdfcbank.com', '+91 40 2311 4455', '1994-08-30', 'AAACH9876P', 'Madhapur Main Road', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(13, 'BigBasket (Supermarket Groceries)', 'supplychain@bigbasket.com', '+91 80 4310 9999', '2011-12-01', 'AABCB3456R', 'Medchal Highway Corridor', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(14, 'Dr. Reddy''s Laboratories Ltd', 'pharma.logistics@drreddys.com', '+91 40 4900 2900', '1984-02-04', 'AAACD8901S', 'Bollaram Industrial Area', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(15, 'Manish Kapoor', 'manish.kapoor@startup.io', '+91 98205 56789', '1992-09-15', 'GHIJ7890K', 'Bandra West', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE')
ON CONFLICT (tenant_id) DO NOTHING;

SELECT setval('tenants_tenant_id_seq', (SELECT MAX(tenant_id) FROM tenants));

-- 7. LEASES
INSERT INTO leases (lease_id, unit_id, tenant_id, monthly_rent, security_deposit, payment_due_day, start_date, end_date, status, is_renewal) VALUES
-- Commercial Leases
(1, 1, 1, 315000.00, 1890000.00, 1, '2024-01-01', '2026-12-31', 'ACTIVE', false),
(2, 2, 2, 196000.00, 1176000.00, 1, '2024-03-01', '2027-02-28', 'ACTIVE', false),
(3, 3, 3, 560000.00, 3360000.00, 5, '2023-06-01', '2026-05-31', 'ACTIVE', false),
(4, 5, 2, 245000.00, 1470000.00, 1, '2024-04-01', '2026-03-31', 'ACTIVE', false),
(5, 16, 8, 1440000.00, 8640000.00, 1, '2023-01-01', '2028-12-31', 'ACTIVE', false),
(6, 17, 9, 1140000.00, 6840000.00, 1, '2023-07-01', '2028-06-30', 'ACTIVE', false),

-- Residential Leases
(7, 7, 4, 58000.00, 174000.00, 5, '2024-01-01', '2024-12-31', 'ACTIVE', false),
(8, 8, 5, 58000.00, 174000.00, 5, '2024-02-01', '2025-01-31', 'ACTIVE', false),
(9, 9, 6, 82000.00, 246000.00, 5, '2023-11-01', '2024-10-31', 'ACTIVE', false),
(10, 12, 7, 95000.00, 285000.00, 5, '2024-01-15', '2025-01-14', 'ACTIVE', false),
(11, 13, 15, 95000.00, 285000.00, 5, '2024-05-01', '2025-04-30', 'ACTIVE', false),
(12, 14, 4, 145000.00, 435000.00, 5, '2023-08-01', '2025-07-31', 'ACTIVE', false),

-- Mixed Use Studios & Retail
(13, 19, 10, 28000.00, 84000.00, 5, '2024-03-01', '2025-02-28', 'ACTIVE', false),
(14, 20, 11, 28000.00, 84000.00, 5, '2024-02-15', '2025-02-14', 'ACTIVE', false),
(15, 21, 12, 176000.00, 1056000.00, 1, '2022-09-01', '2027-08-31', 'ACTIVE', false),

-- Industrial Warehousing
(16, 23, 13, 900000.00, 2700000.00, 1, '2023-04-01', '2026-03-31', 'ACTIVE', false),
(17, 24, 14, 700000.00, 2100000.00, 1, '2023-10-01', '2026-09-30', 'ACTIVE', false),

-- Historical terminated lease (for churn analytics)
(18, 10, 5, 80000.00, 240000.00, 5, '2023-01-01', '2023-12-31', 'EXPIRED', false)
ON CONFLICT (lease_id) DO NOTHING;

SELECT setval('leases_lease_id_seq', (SELECT MAX(lease_id) FROM leases));

-- 8. INVOICES & PAYMENTS
-- Recent monthly invoices
INSERT INTO invoices (invoice_id, lease_id, invoice_number, invoice_date, due_date, billing_period_start, billing_period_end, subtotal, tax, total_amount, status) VALUES
(1, 1, 'INV-202408-001', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 315000.00, 56700.00, 371700.00, 'PAID'),
(2, 2, 'INV-202408-002', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 196000.00, 35280.00, 231280.00, 'PAID'),
(3, 7, 'INV-202408-003', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 58000.00, 0.00, 58000.00, 'PAID'),
(4, 9, 'INV-202408-004', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 82000.00, 0.00, 82000.00, 'PAID'),
(5, 15, 'INV-202408-005', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 176000.00, 31680.00, 207680.00, 'PAID'),
(6, 16, 'INV-202408-006', '2024-08-01', '2024-08-05', '2024-08-01', '2024-08-31', 900000.00, 162000.00, 1062000.00, 'PAID'),

-- Current Month (September) Invoices
(7, 1, 'INV-202409-001', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 315000.00, 56700.00, 371700.00, 'PAID'),
(8, 2, 'INV-202409-002', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 196000.00, 35280.00, 231280.00, 'PAID'),
(9, 3, 'INV-202409-003', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 560000.00, 100800.00, 660800.00, 'UNPAID'),
(10, 7, 'INV-202409-004', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 58000.00, 0.00, 58000.00, 'PAID'),
(11, 8, 'INV-202409-005', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 58000.00, 0.00, 58000.00, 'PARTIALLY_PAID'),
(12, 9, 'INV-202409-006', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 82000.00, 0.00, 82000.00, 'UNPAID'),
(13, 10, 'INV-202409-007', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 95000.00, 0.00, 95000.00, 'PAID'),
(14, 16, 'INV-202409-008', '2024-09-01', '2024-09-05', '2024-09-01', '2024-09-30', 900000.00, 162000.00, 1062000.00, 'PAID')
ON CONFLICT (invoice_id) DO NOTHING;

SELECT setval('invoices_invoice_id_seq', (SELECT MAX(invoice_id) FROM invoices));

-- Invoice Items
INSERT INTO invoice_items (item_id, invoice_id, item_type, description, quantity, unit_price, amount) VALUES
(1, 1, 'RENT', 'Monthly Base Rent - August 2024', 1.00, 315000.00, 315000.00),
(2, 2, 'RENT', 'Monthly Base Rent - August 2024', 1.00, 196000.00, 196000.00),
(3, 7, 'RENT', 'Monthly Base Rent - September 2024', 1.00, 315000.00, 315000.00),
(4, 8, 'RENT', 'Monthly Base Rent - September 2024', 1.00, 196000.00, 196000.00),
(5, 9, 'RENT', 'Monthly Base Rent - September 2024', 1.00, 560000.00, 560000.00),
(6, 10, 'RENT', 'Monthly Apartment Rent - September 2024', 1.00, 58000.00, 58000.00),
(7, 11, 'RENT', 'Monthly Apartment Rent - September 2024', 1.00, 58000.00, 58000.00)
ON CONFLICT (item_id) DO NOTHING;

SELECT setval('invoice_items_item_id_seq', (SELECT MAX(item_id) FROM invoice_items));

-- Payments recorded
INSERT INTO payments (payment_id, invoice_id, amount, payment_date, payment_method, transaction_reference, status, notes) VALUES
(1, 1, 371700.00, '2024-08-04', 'NEFT', 'NEFT2408041001', 'SUCCESS', 'Received in HDFC Operational Escrow'),
(2, 2, 231280.00, '2024-08-03', 'NEFT', 'NEFT2408032002', 'SUCCESS', 'Received via RTGS'),
(3, 3, 58000.00, '2024-08-02', 'UPI', 'UPI421588102931', 'SUCCESS', 'Google Pay tenant transfer'),
(4, 4, 82000.00, '2024-08-05', 'UPI', 'UPI421699304122', 'SUCCESS', 'Netbanking transfer'),
(5, 5, 207680.00, '2024-08-01', 'NEFT', 'NEFT2408019941', 'SUCCESS', 'Corporate treasury sweep'),
(6, 6, 1062000.00, '2024-08-04', 'NEFT', 'NEFT2408047712', 'SUCCESS', 'Logistics hub tenant payment'),
(7, 7, 371700.00, '2024-09-03', 'NEFT', 'NEFT2409038812', 'SUCCESS', 'September billing clearance'),
(8, 8, 231280.00, '2024-09-02', 'NEFT', 'NEFT2409026615', 'SUCCESS', 'Corporate transfer'),
(9, 10, 58000.00, '2024-09-04', 'UPI', 'UPI424811902233', 'SUCCESS', 'UPI AutoPay transfer'),
(10, 11, 30000.00, '2024-09-05', 'UPI', 'UPI424822001144', 'SUCCESS', 'Partial installment payment'),
(11, 13, 95000.00, '2024-09-05', 'CHEQUE', 'CHQ8849201', 'SUCCESS', 'Kotak Mahindra Bank clearance'),
(12, 14, 1062000.00, '2024-09-04', 'NEFT', 'NEFT2409041289', 'SUCCESS', 'Direct wire transfer')
ON CONFLICT (payment_id) DO NOTHING;

SELECT setval('payments_payment_id_seq', (SELECT MAX(payment_id) FROM payments));

-- 9. VENDORS & EXPENSES
INSERT INTO vendors (vendor_id, company_name, contact_person, email, phone, service_type, rating, status) VALUES
(1, 'BlueStar Climate Solutions', 'Manoj Joshi', 'service@bluestarindia.com', '+91 80 4112 3344', 'HVAC', 5, 'ACTIVE'),
(2, 'Otis Elevator Company India', 'Deepak Verma', 'support@otis.com', '+91 22 2844 5566', 'Elevators', 5, 'ACTIVE'),
(3, 'Godrej Facility Services', 'Suman Das', 'facilities@godrej.com', '+91 22 6796 1122', 'Cleaning', 4, 'ACTIVE'),
(4, 'Schneider Electric Infrastructure', 'Karthik Rao', 'support.in@se.com', '+91 80 4055 7788', 'Electrical', 5, 'ACTIVE'),
(5, 'AquaTech Plumbing Solutions', 'Ramesh Yadav', 'aquatech.mumbai@gmail.com', '+91 98209 88776', 'Plumbing', 4, 'ACTIVE')
ON CONFLICT (vendor_id) DO NOTHING;

SELECT setval('vendors_vendor_id_seq', (SELECT MAX(vendor_id) FROM vendors));

INSERT INTO expenses (expense_id, property_id, vendor_id, category, description, amount, expense_date, status) VALUES
(1, 1, 1, 'MAINTENANCE', 'Quarterly chiller plant overhaul and refrigerant top-up', 85000.00, '2024-08-10', 'PAID'),
(2, 1, 4, 'MAINTENANCE', 'HT transformer testing and relay calibration', 45000.00, '2024-08-15', 'PAID'),
(3, 2, 2, 'MAINTENANCE', 'Comprehensive elevator AMC annual advance installment', 120000.00, '2024-08-05', 'PAID'),
(4, 2, 3, 'CLEANING', 'Monthly clubhouse and common areas janitorial service', 38000.00, '2024-08-28', 'PAID'),
(5, 3, 1, 'UTILITIES', 'Common area water tanker supply during municipal outage', 22000.00, '2024-08-20', 'PAID'),
(6, 4, 5, 'MAINTENANCE', 'Main sewage pump impeller replacement', 18500.00, '2024-09-02', 'PAID'),
(7, 5, 4, 'MAINTENANCE', 'High-mast LED solar yard lighting maintenance', 32000.00, '2024-09-03', 'PAID')
ON CONFLICT (expense_id) DO NOTHING;

SELECT setval('expenses_expense_id_seq', (SELECT MAX(expense_id) FROM expenses));

-- 10. MAINTENANCE REQUESTS
INSERT INTO maintenance_requests (request_id, unit_id, tenant_id, title, description, category, priority, status, estimated_cost, actual_cost, resolved_at) VALUES
(1, 7, 4, 'Balcony drainage blockage', 'Slow rainwater discharge during heavy monsoon showers', 'PLUMBING', 'MEDIUM', 'RESOLVED', 1200.00, 1100.00, '2024-08-12 16:30:00+05:30'),
(2, 1, 1, 'Server room AC temperature fluctuation', 'Unit 3 DX system tripping on high head pressure', 'HVAC', 'HIGH', 'RESOLVED', 8500.00, 7800.00, '2024-08-18 11:15:00+05:30'),
(3, 11, NULL, 'Bathroom ceramic re-tiling and grouting', 'Refurbishing floor tiles prior to next tenant viewings', 'STRUCTURAL', 'LOW', 'IN_PROGRESS', 15000.00, NULL, NULL),
(4, 8, 5, 'Kitchen sink mixer tap dripping', 'Quarter-turn ceramic disc valve requires replacement', 'PLUMBING', 'LOW', 'RESOLVED', 850.00, 800.00, '2024-09-03 14:00:00+05:30'),
(5, 19, 10, 'Microwave power socket tripping breaker', 'Earth leakage circuit breaker tripping when microwave operates', 'ELECTRICAL', 'HIGH', 'OPEN', 1500.00, NULL, NULL)
ON CONFLICT (request_id) DO NOTHING;

SELECT setval('maintenance_requests_request_id_seq', (SELECT MAX(request_id) FROM maintenance_requests));

-- 11. INITIAL AUDIT LOGS
INSERT INTO audit_logs (log_id, user_id, username, action, entity_type, entity_id, description, ip_address) VALUES
(1, 1, 'admin', 'SYSTEM_INITIALIZATION', 'DATABASE', 1, 'PropLedger schema initialized with Flyway V1-V12', '127.0.0.1'),
(2, 1, 'admin', 'CREATE', 'Property', 1, 'Created commercial property: Prestige Tech Cloud Towers', '127.0.0.1'),
(3, 2, 'manager_priya', 'CREATE', 'Lease', 1, 'Executed commercial lease agreement for Infosys Cloud', '192.168.1.45'),
(4, 3, 'accountant_rahul', 'PAYMENT_RECORDED', 'Payment', 1, 'Recorded ₹371,700 NEFT payment for INV-202408-001', '192.168.1.60')
ON CONFLICT (log_id) DO NOTHING;

SELECT setval('audit_logs_log_id_seq', (SELECT MAX(log_id) FROM audit_logs));
