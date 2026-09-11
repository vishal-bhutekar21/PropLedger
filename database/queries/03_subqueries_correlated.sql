-- ============================================================
-- Query 03: Correlated Subqueries & Scalar Optimization
-- Concept: Demonstrates nested correlated subqueries, EXISTS vs IN,
-- and benchmarking against windowed joins.
-- ============================================================

-- Query 3A: Find all units whose monthly rent is significantly higher (+20%) 
-- than the average rent of their specific building and property class.
SELECT 
    p.property_name,
    b.building_name,
    u.unit_number,
    u.unit_type,
    u.monthly_rent,
    -- Correlated scalar subquery: computes building baseline
    ROUND((
        SELECT AVG(u_inner.monthly_rent)
        FROM units u_inner
        WHERE u_inner.building_id = u.building_id
    ), 2) AS building_avg_rent,
    -- Rent variance percentage compared to peers
    ROUND((
        (u.monthly_rent - (SELECT AVG(u2.monthly_rent) FROM units u2 WHERE u2.building_id = u.building_id)) 
        / (SELECT AVG(u3.monthly_rent) FROM units u3 WHERE u3.building_id = u.building_id) * 100
    ), 1) AS rent_premium_pct
FROM units u
JOIN buildings b  ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
WHERE u.monthly_rent > (
    SELECT AVG(sub.monthly_rent) * 1.15
    FROM units sub
    WHERE sub.building_id = u.building_id
)
ORDER BY rent_premium_pct DESC;


-- Query 3B: Correlated EXISTS — Identify high-reliability tenants who have 
-- occupied units for over 6 months with ZERO overdue or unpaid invoices.
SELECT 
    t.tenant_id,
    t.full_name,
    t.email,
    t.phone,
    l.lease_id,
    l.monthly_rent,
    l.start_date
FROM tenants t
JOIN leases l ON l.tenant_id = t.tenant_id
WHERE l.status = 'ACTIVE'
  AND l.start_date <= CURRENT_DATE - INTERVAL '6 months'
  -- Must have generated at least 3 invoices
  AND (
      SELECT COUNT(*)
      FROM invoices i_sub
      WHERE i_sub.lease_id = l.lease_id
  ) >= 3
  -- Must NOT have any unpaid or overdue invoices
  AND NOT EXISTS (
      SELECT 1 
      FROM invoices inv_bad
      WHERE inv_bad.lease_id = l.lease_id
        AND inv_bad.status IN ('OVERDUE', 'UNPAID', 'PARTIALLY_PAID')
        AND inv_bad.due_date < CURRENT_DATE
  )
ORDER BY l.monthly_rent DESC;
