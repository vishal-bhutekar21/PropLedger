-- ============================================================================
-- PropLedger: Enterprise Reporting & Operational Database Views
-- ============================================================================

-- 1. Property Occupancy & Physical Metrics View
CREATE OR REPLACE VIEW v_property_occupancy AS
SELECT 
    p.id AS property_id,
    p.property_code,
    p.name AS property_name,
    p.property_type,
    p.city,
    p.state,
    COUNT(u.id) AS total_units,
    COUNT(CASE WHEN u.status = 'OCCUPIED' THEN 1 END) AS occupied_units,
    COUNT(CASE WHEN u.status = 'AVAILABLE' THEN 1 END) AS vacant_units,
    COUNT(CASE WHEN u.status = 'MAINTENANCE' THEN 1 END) AS maintenance_units,
    ROUND(
        (COUNT(CASE WHEN u.status = 'OCCUPIED' THEN 1 END)::NUMERIC / NULLIF(COUNT(u.id), 0)) * 100.0, 
        2
    ) AS occupancy_rate_pct,
    COALESCE(SUM(u.market_rent), 0.00) AS total_gross_potential_rent,
    COALESCE(SUM(l.rent_amount), 0.00) AS total_contract_rent
FROM properties p
LEFT JOIN units u ON u.property_id = p.id AND u.is_active = TRUE
LEFT JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE'
WHERE p.is_active = TRUE
GROUP BY p.id, p.property_code, p.name, p.property_type, p.city, p.state;

-- 2. Master Rent Roll View
CREATE OR REPLACE VIEW v_rent_roll AS
SELECT 
    p.id AS property_id,
    p.name AS property_name,
    b.building_name,
    u.id AS unit_id,
    u.unit_number,
    u.unit_type,
    u.bedrooms,
    u.bathrooms,
    u.area_sqft,
    u.market_rent,
    u.status AS unit_status,
    l.id AS lease_id,
    l.lease_number,
    l.start_date AS lease_start_date,
    l.end_date AS lease_end_date,
    l.rent_amount AS contract_rent,
    l.deposit_amount,
    l.status AS lease_status,
    t.id AS primary_tenant_id,
    t.first_name || ' ' || t.last_name AS primary_tenant_name,
    t.email AS primary_tenant_email,
    t.phone AS primary_tenant_phone,
    COALESCE(ar.total_outstanding_balance, 0.00) AS current_outstanding_balance
FROM properties p
JOIN units u ON u.property_id = p.id
LEFT JOIN buildings b ON b.id = u.building_id
LEFT JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE'
LEFT JOIN lease_tenants lt ON lt.lease_id = l.id AND lt.is_primary_tenant = TRUE
LEFT JOIN tenants t ON t.id = lt.tenant_id
LEFT JOIN (
    SELECT lease_id, SUM(balance_due) AS total_outstanding_balance
    FROM invoices
    WHERE balance_due > 0
    GROUP BY lease_id
) ar ON ar.lease_id = l.id
WHERE p.is_active = TRUE;

-- 3. Aged Receivables (Aging AR) View
CREATE OR REPLACE VIEW v_aging_receivables AS
SELECT 
    i.id AS invoice_id,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    p.id AS property_id,
    p.name AS property_name,
    u.unit_number,
    t.id AS tenant_id,
    t.first_name || ' ' || t.last_name AS tenant_name,
    t.email AS tenant_email,
    i.total_amount,
    i.balance_due,
    GREATEST(0, (CURRENT_DATE - i.due_date)) AS days_overdue,
    CASE 
        WHEN i.due_date >= CURRENT_DATE THEN 'CURRENT'
        WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN '1-30_DAYS'
        WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN '31-60_DAYS'
        WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN '61-90_DAYS'
        ELSE '90+_DAYS'
    END AS aging_bucket
FROM invoices i
JOIN leases l ON l.id = i.lease_id
JOIN units u ON u.id = l.unit_id
JOIN properties p ON p.id = u.property_id
LEFT JOIN lease_tenants lt ON lt.lease_id = l.id AND lt.is_primary_tenant = TRUE
LEFT JOIN tenants t ON t.id = lt.tenant_id
WHERE i.balance_due > 0;

-- 4. Property Profit & Loss (P&L) Summary View
CREATE OR REPLACE VIEW v_property_pnl AS
WITH revenue AS (
    SELECT 
        u.property_id,
        COALESCE(SUM(pa.allocated_amount), 0.00) AS total_revenue_collected
    FROM payment_allocations pa
    JOIN invoices i ON i.id = pa.invoice_id
    JOIN leases l ON l.id = i.lease_id
    JOIN units u ON u.id = l.unit_id
    GROUP BY u.property_id
),
expenses_agg AS (
    SELECT 
        property_id,
        COALESCE(SUM(CASE WHEN category <> 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END), 0.00) AS total_operating_expenses,
        COALESCE(SUM(CASE WHEN category = 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END), 0.00) AS total_capital_expenditures,
        COALESCE(SUM(amount), 0.00) AS grand_total_expenses
    FROM expenses
    GROUP BY property_id
)
SELECT 
    p.id AS property_id,
    p.name AS property_name,
    p.property_code,
    COALESCE(r.total_revenue_collected, 0.00) AS total_revenue,
    COALESCE(e.total_operating_expenses, 0.00) AS operating_expenses,
    COALESCE(e.total_capital_expenditures, 0.00) AS capital_expenditures,
    COALESCE(e.grand_total_expenses, 0.00) AS total_expenses,
    (COALESCE(r.total_revenue_collected, 0.00) - COALESCE(e.total_operating_expenses, 0.00)) AS net_operating_income,
    ROUND(
        CASE 
            WHEN COALESCE(r.total_revenue_collected, 0.00) > 0 
            THEN ((COALESCE(r.total_revenue_collected, 0.00) - COALESCE(e.total_operating_expenses, 0.00)) / r.total_revenue_collected) * 100.0
            ELSE 0.00 
        END, 2
    ) AS operating_margin_pct
FROM properties p
LEFT JOIN revenue r ON r.property_id = p.id
LEFT JOIN expenses_agg e ON e.property_id = p.id
WHERE p.is_active = TRUE;
