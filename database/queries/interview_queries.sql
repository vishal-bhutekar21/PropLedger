-- ==============================================================================
-- PropLedger — Enterprise Real Estate & Database Engineering Interview Queries
-- Target Roles: Senior Software Engineer / Database Architect (Yardi, RealPage, AppFolio, CoStar)
-- ==============================================================================

-- ==============================================================================
-- QUESTION 1: How do you prevent overlapping active leases on the same unit?
-- Business Problem: Two leasing agents might try to lease Unit 401 for overlapping dates.
-- Technical Concept: Database-level exclusion constraint vs Application locking.
-- ==============================================================================
-- EXPLANATION:
-- An application-level check (`SELECT COUNT(*) WHERE start_date <= new_end ...`) suffers from
-- race conditions under concurrent traffic. The gold standard PostgreSQL solution uses
-- EXCLUSION CONSTRAINTS backed by GiST indexes and daterange ranges:
--
-- ALTER TABLE leases ADD CONSTRAINT no_overlapping_active_leases
-- EXCLUDE USING gist (
--     unit_id WITH =,
--     daterange(start_date, end_date, '[]') WITH &&
-- ) WHERE (status IN ('PENDING', 'ACTIVE'));
--
-- In application code, we also execute pessimistic row locking on the unit:
-- SELECT unit_id FROM units WHERE unit_id = :unitId FOR UPDATE;
SELECT 
    l.lease_id, 
    l.unit_id, 
    l.start_date, 
    l.end_date, 
    l.status
FROM leases l
WHERE l.unit_id = 7
  AND l.status IN ('PENDING', 'ACTIVE');


-- ==============================================================================
-- QUESTION 2: Calculating Rent Roll with Running Totals and Contribution Share
-- Business Problem: Generate a live rent roll showing cumulative revenue contribution.
-- Technical Concept: Window functions OVER (PARTITION BY ... ORDER BY ...).
-- ==============================================================================
SELECT 
    p.property_name,
    u.unit_number,
    t.full_name AS tenant_name,
    l.monthly_rent,
    -- Running total within property
    SUM(l.monthly_rent) OVER (
        PARTITION BY p.property_id 
        ORDER BY l.monthly_rent DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_property_rent,
    -- Percentage of property gross income
    ROUND(
        (l.monthly_rent / SUM(l.monthly_rent) OVER (PARTITION BY p.property_id) * 100), 2
    ) AS pct_share
FROM leases l
JOIN units u ON l.unit_id = u.unit_id
JOIN buildings b ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
JOIN tenants t ON l.tenant_id = t.tenant_id
WHERE l.status = 'ACTIVE';


-- ==============================================================================
-- QUESTION 3: Accounts Receivable Aging Buckets (0-30, 31-60, 61-90, 90+ days)
-- Business Problem: Determine outstanding cash receivables grouped by risk aging.
-- Technical Concept: FILTER (WHERE ...) clause vs CASE WHEN inside SUM().
-- ==============================================================================
SELECT 
    p.property_name,
    COUNT(i.invoice_id) AS total_unpaid_invoices,
    COALESCE(SUM(i.total_amount) FILTER (WHERE CURRENT_DATE - i.due_date <= 30), 0)  AS current_0_to_30,
    COALESCE(SUM(i.total_amount) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 31 AND 60), 0) AS overdue_31_to_60,
    COALESCE(SUM(i.total_amount) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 61 AND 90), 0) AS overdue_61_to_90,
    COALESCE(SUM(i.total_amount) FILTER (WHERE CURRENT_DATE - i.due_date > 90), 0)  AS default_risk_over_90
FROM invoices i
JOIN leases l ON i.lease_id = l.lease_id
JOIN units u ON l.unit_id = u.unit_id
JOIN buildings b ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
WHERE i.status NOT IN ('PAID', 'VOID')
GROUP BY p.property_id, p.property_name;


-- ==============================================================================
-- QUESTION 4: Top N Units by Rent per Property without subquery explosion
-- Business Problem: Retrieve the top 2 highest-earning units for each building.
-- Technical Concept: DENSE_RANK() window function inside a CTE.
-- ==============================================================================
WITH ranked_units AS (
    SELECT 
        b.building_name,
        u.unit_number,
        u.unit_type,
        u.monthly_rent,
        DENSE_RANK() OVER (
            PARTITION BY b.building_id 
            ORDER BY u.monthly_rent DESC
        ) AS rent_rank
    FROM units u
    JOIN buildings b ON u.building_id = b.building_id
)
SELECT building_name, unit_number, unit_type, monthly_rent, rent_rank
FROM ranked_units
WHERE rent_rank <= 2;


-- ==============================================================================
-- QUESTION 5: Economic Occupancy vs Physical Occupancy
-- Business Problem: Why physical occupancy can be 100% while economic occupancy is 85%.
-- Technical Concept: Vacancy loss & concessions compared to Gross Potential Rent.
-- ==============================================================================
SELECT 
    p.property_name,
    COUNT(u.unit_id) AS total_units,
    COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED') AS occupied_units,
    -- Physical Occupancy %
    ROUND((COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED')::DECIMAL / COUNT(u.unit_id) * 100), 2) AS physical_occupancy_pct,
    -- Gross Potential Rent (GPR)
    SUM(u.monthly_rent) AS gross_potential_rent,
    -- Contract Effective Rent
    COALESCE(SUM(l.monthly_rent) FILTER (WHERE l.status = 'ACTIVE'), 0) AS effective_contract_rent,
    -- Economic Occupancy Rate (EOR) %
    ROUND((COALESCE(SUM(l.monthly_rent) FILTER (WHERE l.status = 'ACTIVE'), 0) / SUM(u.monthly_rent) * 100), 2) AS economic_occupancy_pct
FROM properties p
JOIN buildings b ON b.property_id = p.property_id
JOIN units u     ON u.building_id = b.building_id
LEFT JOIN leases l ON l.unit_id = u.unit_id AND l.status = 'ACTIVE'
GROUP BY p.property_id, p.property_name;


-- ==============================================================================
-- QUESTION 6: Tenant Retention Rate & Churn Calculation
-- Business Problem: Calculate renewal rate of tenants over rolling 12 months.
-- Technical Concept: Self-join on parent_lease_id or conditional count of is_renewal.
-- ==============================================================================
SELECT 
    p.property_name,
    COUNT(l.lease_id) AS total_leases_ended,
    COUNT(l.lease_id) FILTER (WHERE l.is_renewal = true) AS renewed_leases,
    ROUND((COUNT(l.lease_id) FILTER (WHERE l.is_renewal = true)::DECIMAL / NULLIF(COUNT(l.lease_id), 0) * 100), 2) AS tenant_retention_rate_pct
FROM leases l
JOIN units u ON l.unit_id = u.unit_id
JOIN buildings b ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
WHERE l.start_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY p.property_id, p.property_name;


-- ==============================================================================
-- QUESTION 7: Net Operating Income (NOI) Calculation
-- Business Problem: Real estate's primary profitability metric (NOI).
-- Technical Concept: Merging two independent aggregates (Revenues vs OPEX) via CTE.
-- ==============================================================================
WITH property_rev AS (
    SELECT p.property_id, SUM(pay.amount) AS total_revenue
    FROM properties p
    JOIN buildings b ON b.property_id = p.property_id
    JOIN units u ON u.building_id = b.building_id
    JOIN leases l ON l.unit_id = u.unit_id
    JOIN invoices i ON i.lease_id = l.lease_id
    JOIN payments pay ON pay.invoice_id = i.invoice_id AND pay.status = 'COMPLETED'
    GROUP BY p.property_id
),
property_exp AS (
    SELECT property_id, SUM(amount) AS total_opex
    FROM expenses
    WHERE status = 'PAID'
    GROUP BY property_id
)
SELECT 
    p.property_name,
    COALESCE(r.total_revenue, 0) AS total_revenue,
    COALESCE(e.total_opex, 0)    AS total_opex,
    (COALESCE(r.total_revenue, 0) - COALESCE(e.total_opex, 0)) AS net_operating_income
FROM properties p
LEFT JOIN property_rev r ON p.property_id = r.property_id
LEFT JOIN property_exp e ON p.property_id = e.property_id;


-- ==============================================================================
-- QUESTION 8: Finding Gaps / Lapsed Periods Between Leases
-- Business Problem: Calculate unit vacancy duration (days unit remained empty between leases).
-- Technical Concept: LAG(end_date) compared to start_date.
-- ==============================================================================
SELECT 
    u.unit_number,
    l.lease_id,
    l.start_date,
    LAG(l.end_date) OVER (PARTITION BY l.unit_id ORDER BY l.start_date) AS prev_lease_end,
    (l.start_date - LAG(l.end_date) OVER (PARTITION BY l.unit_id ORDER BY l.start_date)) AS vacancy_turnover_days
FROM leases l
JOIN units u ON l.unit_id = u.unit_id
ORDER BY l.unit_id, l.start_date;


-- ==============================================================================
-- QUESTION 9: Mean Time to Resolution (MTTR) for Maintenance Requests
-- Business Problem: Track engineering SLA performance in hours.
-- Technical Concept: EXTRACT(EPOCH FROM (resolved_at - created_at)).
-- ==============================================================================
SELECT 
    category,
    priority,
    COUNT(request_id) AS completed_tickets,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0), 1) AS mttr_hours
FROM maintenance_requests
WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL
GROUP BY category, priority
ORDER BY mttr_hours DESC;


-- ==============================================================================
-- QUESTION 10: Recursive CTE for Lease Ancestry Tree
-- Business Problem: Trace full renewal chain from initial tenant inception.
-- Technical Concept: WITH RECURSIVE anchor + recursive join.
-- ==============================================================================
WITH RECURSIVE lease_tree AS (
    SELECT lease_id, parent_lease_id, unit_id, start_date, monthly_rent, 1 as depth
    FROM leases
    WHERE parent_lease_id IS NULL
    UNION ALL
    SELECT c.lease_id, c.parent_lease_id, c.unit_id, c.start_date, c.monthly_rent, p.depth + 1
    FROM leases c
    JOIN lease_tree p ON c.parent_lease_id = p.lease_id
)
SELECT * FROM lease_tree ORDER BY unit_id, depth;


-- ==============================================================================
-- QUESTION 11: Idempotency in Payment Recording
-- Business Problem: Avoid duplicate payments when network timeouts cause retries.
-- Technical Concept: Unique constraint on transaction_reference + conditional insert.
-- ==============================================================================
-- INSERT INTO payments (invoice_id, amount, payment_date, payment_method, transaction_reference)
-- VALUES (1, 371700.00, '2024-09-01', 'UPI', 'UPI-TXN-998822')
-- ON CONFLICT (transaction_reference) DO NOTHING;


-- ==============================================================================
-- QUESTION 12: Querying JSONB Audit History for Sensitive Column Changes
-- Business Problem: Find all times a property manager updated rent or security deposit.
-- Technical Concept: JSONB ? operator and path extraction.
-- ==============================================================================
SELECT 
    log_id, username, created_at, entity_id,
    old_value->>'monthly_rent' AS old_rent,
    new_value->>'monthly_rent' AS new_rent
FROM audit_logs
WHERE entity_type = 'Unit'
  AND (new_value ? 'monthly_rent');


-- ==============================================================================
-- QUESTION 13: Database-Enforced Soft Deletes vs Hard Deletes
-- Business Problem: Regulatory audit requirements prohibit hard deletes on leases/payments.
-- Technical Concept: Partial unique indexes on non-deleted rows.
-- ==============================================================================
-- CREATE UNIQUE INDEX uq_active_unit ON units (building_id, unit_number) WHERE status != 'INACTIVE';


-- ==============================================================================
-- QUESTION 14: Month-over-Month (MoM) Cash Flow Percentage Growth
-- Business Problem: Calculate financial growth rate using LAG().
-- Technical Concept: Window function comparison with mathematical null-safe division.
-- ==============================================================================
WITH monthly_cash AS (
    SELECT 
        DATE_TRUNC('month', payment_date)::DATE AS month_bucket,
        SUM(amount) AS collected_cash
    FROM payments
    WHERE status = 'COMPLETED'
    GROUP BY DATE_TRUNC('month', payment_date)
)
SELECT 
    month_bucket,
    collected_cash,
    LAG(collected_cash) OVER (ORDER BY month_bucket) AS prev_month_cash,
    ROUND(
        ((collected_cash - LAG(collected_cash) OVER (ORDER BY month_bucket)) 
        / NULLIF(LAG(collected_cash) OVER (ORDER BY month_bucket), 0) * 100), 2
    ) AS mom_growth_pct
FROM monthly_cash
ORDER BY month_bucket;


-- ==============================================================================
-- QUESTION 15: Concurrency Control Under High Load
-- Business Problem: Preventing two users from reserving the same vacant unit.
-- Technical Concept: Optimistic locking (@Version) vs Pessimistic locking (FOR UPDATE).
--
-- OPTIMISTIC LOCKING:
-- UPDATE units SET status = 'OCCUPIED', version = version + 1 WHERE unit_id = 1 AND version = 3;
--
-- PESSIMISTIC LOCKING:
-- BEGIN;
-- SELECT * FROM units WHERE unit_id = 1 FOR UPDATE;
-- INSERT INTO leases (...);
-- UPDATE units SET status = 'OCCUPIED' WHERE unit_id = 1;
-- COMMIT;
-- ==============================================================================
SELECT 'Concurrency discussion: Refer to docs/CONCURRENCY.md for comprehensive benchmarks' AS architectural_guideline;
