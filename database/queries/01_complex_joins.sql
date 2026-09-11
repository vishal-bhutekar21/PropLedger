-- ============================================================
-- Query 01: Complex Multi-Table Relational Joins
-- Concept: Demonstrates deep relational joins across 8 entities:
-- Properties -> Buildings -> Units -> Leases -> Tenants -> Invoices -> Payments -> Owners
-- ============================================================

-- Scenario: Generate a comprehensive Portfolio Rent Roll & Remittance Ledger
-- connecting the property owner, property, building, unit, tenant contact,
-- active lease term, latest billing invoice, and settlement payment.

SELECT 
    o.full_name                         AS owner_name,
    o.company_name                      AS owner_entity,
    p.property_name,
    p.property_type,
    p.city,
    b.building_name,
    u.unit_number,
    u.unit_type,
    u.floor_number,
    t.full_name                         AS tenant_name,
    t.email                             AS tenant_email,
    t.phone                             AS tenant_phone,
    l.lease_id,
    l.start_date                        AS lease_start,
    l.end_date                          AS lease_end,
    l.monthly_rent,
    l.security_deposit,
    inv.invoice_number,
    inv.invoice_date,
    inv.total_amount                    AS invoice_total,
    inv.status                          AS invoice_status,
    COALESCE(SUM(pay.amount), 0)        AS total_paid_to_date,
    (inv.total_amount - COALESCE(SUM(pay.amount), 0)) AS outstanding_balance
FROM properties p
INNER JOIN owners o             ON p.owner_id = o.owner_id
INNER JOIN buildings b          ON b.property_id = p.property_id
INNER JOIN units u              ON u.building_id = b.building_id
INNER JOIN leases l             ON l.unit_id = u.unit_id AND l.status = 'ACTIVE'
INNER JOIN tenants t            ON l.tenant_id = t.tenant_id
LEFT JOIN invoices inv          ON inv.lease_id = l.lease_id 
                               AND inv.billing_period_start >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN payments pay          ON pay.invoice_id = inv.invoice_id 
                               AND pay.status = 'COMPLETED'
WHERE p.status = 'ACTIVE'
GROUP BY 
    o.full_name, o.company_name, p.property_name, p.property_type, p.city,
    b.building_name, u.unit_number, u.unit_type, u.floor_number,
    t.full_name, t.email, t.phone, l.lease_id, l.start_date, l.end_date,
    l.monthly_rent, l.security_deposit, inv.invoice_number, inv.invoice_date,
    inv.total_amount, inv.status
ORDER BY 
    p.property_name ASC, 
    b.building_name ASC, 
    u.unit_number ASC;
