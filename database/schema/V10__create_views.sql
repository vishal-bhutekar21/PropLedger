-- ============================================================
-- V10: Views
-- Purpose: Reusable, pre-joined business queries.
-- Each view represents a genuine analytical need, not a demo.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROPERTY OCCUPANCY VIEW
-- Shows real-time occupancy per property.
-- Used by: Dashboard, Occupancy Report, Property Details
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW property_occupancy_view AS
SELECT
    p.property_id,
    p.property_name,
    p.city,
    p.state,
    p.property_type,
    COUNT(u.unit_id)                                           AS total_units,
    COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED')     AS occupied_units,
    COUNT(u.unit_id) FILTER (WHERE u.status = 'VACANT')       AS vacant_units,
    COUNT(u.unit_id) FILTER (WHERE u.status = 'MAINTENANCE')  AS maintenance_units,
    COUNT(u.unit_id) FILTER (WHERE u.status = 'RESERVED')     AS reserved_units,
    ROUND(
        COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED') * 100.0
        / NULLIF(COUNT(u.unit_id), 0),
        2
    )                                                          AS occupancy_rate,
    COALESCE(SUM(u.monthly_rent) FILTER (WHERE u.status = 'OCCUPIED'), 0) AS occupied_rent_total
FROM properties p
LEFT JOIN buildings b  ON b.property_id = p.property_id
LEFT JOIN units u      ON u.building_id = b.building_id
GROUP BY p.property_id, p.property_name, p.city, p.state, p.property_type;

-- ─────────────────────────────────────────────
-- 2. TENANT BALANCE VIEW
-- Calculates real-time outstanding balance per tenant.
-- Outstanding = SUM(invoice total) - SUM(successful payments)
-- NEVER store outstanding_balance in a column.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW tenant_balance_view AS
SELECT
    t.tenant_id,
    t.full_name                                          AS tenant_name,
    t.email,
    t.phone,
    t.status                                             AS tenant_status,
    l.lease_id,
    l.start_date,
    l.end_date,
    l.status                                             AS lease_status,
    l.monthly_rent,
    u.unit_id,
    u.unit_number,
    b.building_id,
    b.building_name,
    p.property_id,
    p.property_name,
    COALESCE(SUM(i.total_amount), 0)                    AS total_invoiced,
    COALESCE(SUM(py.paid_amount), 0)                    AS total_paid,
    COALESCE(SUM(i.total_amount), 0)
        - COALESCE(SUM(py.paid_amount), 0)              AS outstanding_balance,
    COUNT(i.invoice_id) FILTER (WHERE i.status = 'OVERDUE') AS overdue_invoices
FROM tenants t
JOIN leases l          ON l.tenant_id = t.tenant_id AND l.status = 'ACTIVE'
JOIN units u           ON u.unit_id = l.unit_id
JOIN buildings b       ON b.building_id = u.building_id
JOIN properties p      ON p.property_id = b.property_id
LEFT JOIN invoices i   ON i.lease_id = l.lease_id AND i.status NOT IN ('VOID', 'WAIVED')
LEFT JOIN LATERAL (
    SELECT invoice_id, SUM(amount) AS paid_amount
    FROM payments
    WHERE status = 'SUCCESS'
    GROUP BY invoice_id
) py ON py.invoice_id = i.invoice_id
GROUP BY
    t.tenant_id, t.full_name, t.email, t.phone, t.status,
    l.lease_id, l.start_date, l.end_date, l.status, l.monthly_rent,
    u.unit_id, u.unit_number, b.building_id, b.building_name,
    p.property_id, p.property_name;

-- ─────────────────────────────────────────────
-- 3. PROPERTY REVENUE VIEW
-- Monthly revenue summary per property.
-- Used by: Revenue Report, Property Profitability, Dashboard charts
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW property_revenue_view AS
SELECT
    p.property_id,
    p.property_name,
    p.city,
    DATE_TRUNC('month', i.invoice_date)::DATE           AS revenue_month,
    COUNT(DISTINCT l.lease_id)                           AS active_leases,
    SUM(i.total_amount)                                  AS invoiced_amount,
    COALESCE(SUM(py.paid_amount), 0)                    AS collected_amount,
    SUM(i.total_amount) - COALESCE(SUM(py.paid_amount), 0) AS outstanding_amount,
    COALESCE(SUM(e.expense_amount), 0)                  AS expense_amount,
    SUM(i.total_amount) - COALESCE(SUM(e.expense_amount), 0) AS net_revenue
FROM properties p
JOIN buildings b  ON b.property_id = p.property_id
JOIN units u      ON u.building_id = b.building_id
JOIN leases l     ON l.unit_id = u.unit_id
JOIN invoices i   ON i.lease_id = l.lease_id AND i.status NOT IN ('VOID', 'WAIVED')
LEFT JOIN LATERAL (
    SELECT invoice_id, SUM(amount) AS paid_amount
    FROM payments WHERE status = 'SUCCESS'
    GROUP BY invoice_id
) py ON py.invoice_id = i.invoice_id
LEFT JOIN LATERAL (
    SELECT property_id,
           DATE_TRUNC('month', expense_date) AS exp_month,
           SUM(amount) AS expense_amount
    FROM expenses WHERE status IN ('APPROVED', 'PAID')
    GROUP BY property_id, DATE_TRUNC('month', expense_date)
) e ON e.property_id = p.property_id
   AND e.exp_month = DATE_TRUNC('month', i.invoice_date)
GROUP BY p.property_id, p.property_name, p.city, DATE_TRUNC('month', i.invoice_date);

-- ─────────────────────────────────────────────
-- 4. MAINTENANCE SUMMARY VIEW
-- Per-property maintenance KPIs.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW maintenance_summary_view AS
SELECT
    p.property_id,
    p.property_name,
    COUNT(mr.request_id)                                               AS total_requests,
    COUNT(mr.request_id) FILTER (WHERE mr.status = 'OPEN')            AS open_requests,
    COUNT(mr.request_id) FILTER (WHERE mr.status = 'IN_PROGRESS')     AS in_progress,
    COUNT(mr.request_id) FILTER (WHERE mr.status IN ('RESOLVED','CLOSED')) AS resolved_requests,
    COUNT(mr.request_id) FILTER (WHERE mr.priority = 'URGENT')        AS urgent_requests,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (mr.resolved_at - mr.created_at)) / 3600.0
    ) FILTER (WHERE mr.resolved_at IS NOT NULL), 2)                    AS avg_resolution_hours,
    COALESCE(SUM(wo.actual_cost), 0)                                   AS total_maintenance_cost
FROM properties p
JOIN buildings b ON b.property_id = p.property_id
JOIN units u     ON u.building_id = b.building_id
LEFT JOIN maintenance_requests mr ON mr.unit_id = u.unit_id
LEFT JOIN work_orders wo ON wo.request_id = mr.request_id AND wo.status = 'COMPLETED'
GROUP BY p.property_id, p.property_name;

-- ─────────────────────────────────────────────
-- 5. LEASE EXPIRATION VIEW
-- Shows upcoming lease expirations with tenant and unit info.
-- Used by: Dashboard alerts, Lease Expiration Report
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW lease_expiration_view AS
SELECT
    l.lease_id,
    t.tenant_id,
    t.full_name                                                  AS tenant_name,
    t.email,
    t.phone,
    u.unit_id,
    u.unit_number,
    b.building_name,
    p.property_id,
    p.property_name,
    p.city,
    l.start_date,
    l.end_date,
    l.monthly_rent,
    l.status,
    (l.end_date - CURRENT_DATE)                                 AS days_until_expiry,
    CASE
        WHEN l.end_date < CURRENT_DATE              THEN 'EXPIRED'
        WHEN l.end_date <= CURRENT_DATE + INTERVAL '30 days'  THEN 'EXPIRING_30'
        WHEN l.end_date <= CURRENT_DATE + INTERVAL '60 days'  THEN 'EXPIRING_60'
        WHEN l.end_date <= CURRENT_DATE + INTERVAL '90 days'  THEN 'EXPIRING_90'
        ELSE 'ACTIVE'
    END                                                          AS expiry_category
FROM leases l
JOIN tenants t     ON t.tenant_id = l.tenant_id
JOIN units u       ON u.unit_id   = l.unit_id
JOIN buildings b   ON b.building_id = u.building_id
JOIN properties p  ON p.property_id = b.property_id
WHERE l.status = 'ACTIVE';
