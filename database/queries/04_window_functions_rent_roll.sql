-- ============================================================
-- Query 04: Advanced PostgreSQL Window Functions
-- Concept: Comprehensive demonstration of:
-- 1. ROW_NUMBER(), RANK(), DENSE_RANK() (Lease value ranking)
-- 2. LAG(), LEAD() (Consecutive lease renewal delta)
-- 3. NTILE(4) (Rent quartile tiering across portfolio)
-- 4. Moving Average over sliding frame specifications
-- ============================================================

-- Query 4A: Property Lease Ranking & Rent Quartile Categorization
SELECT 
    p.property_name,
    u.unit_number,
    u.unit_type,
    t.full_name AS tenant_name,
    l.monthly_rent,
    
    -- 1. Sequential rank within property
    ROW_NUMBER() OVER (
        PARTITION BY p.property_id 
        ORDER BY l.monthly_rent DESC
    ) AS rank_row_num,

    -- 2. Dense rank handling tie rents gracefully
    DENSE_RANK() OVER (
        PARTITION BY p.property_id 
        ORDER BY l.monthly_rent DESC
    ) AS rent_dense_rank,

    -- 3. Portfolio-wide rent quartile (Tier 1 to 4)
    NTILE(4) OVER (
        ORDER BY l.monthly_rent ASC
    ) AS portfolio_rent_quartile,

    -- 4. Percentage contribution to property gross rent
    ROUND(
        (l.monthly_rent / SUM(l.monthly_rent) OVER (PARTITION BY p.property_id) * 100), 2
    ) AS pct_of_property_gross_rent,

    -- 5. Cumulative rent sum within property
    SUM(l.monthly_rent) OVER (
        PARTITION BY p.property_id 
        ORDER BY l.monthly_rent DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_property_revenue
FROM leases l
JOIN units u      ON l.unit_id = u.unit_id
JOIN buildings b  ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
JOIN tenants t    ON l.tenant_id = t.tenant_id
WHERE l.status = 'ACTIVE'
ORDER BY p.property_name, l.monthly_rent DESC;


-- Query 4B: Renewal Escalation Tracking with LAG() and LEAD()
-- Tracks how rental rates escalated across parent and renewal leases for the same unit.
SELECT 
    u.unit_number,
    t.full_name AS tenant_name,
    l.lease_id,
    l.start_date,
    l.end_date,
    l.monthly_rent,
    l.is_renewal,
    
    -- Rent of the immediately preceding lease for this unit
    LAG(l.monthly_rent, 1) OVER (
        PARTITION BY l.unit_id 
        ORDER BY l.start_date ASC
    ) AS previous_lease_rent,

    -- Escalation percentage
    ROUND((
        (l.monthly_rent - LAG(l.monthly_rent, 1) OVER (PARTITION BY l.unit_id ORDER BY l.start_date ASC))
        / NULLIF(LAG(l.monthly_rent, 1) OVER (PARTITION BY l.unit_id ORDER BY l.start_date ASC), 0) * 100
    ), 2) AS escalation_percentage,

    -- 3-Lease Moving Average rent
    ROUND(
        AVG(l.monthly_rent) OVER (
            PARTITION BY l.unit_id 
            ORDER BY l.start_date ASC
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2
    ) AS moving_avg_rent_3period
FROM leases l
JOIN units u   ON l.unit_id = u.unit_id
JOIN tenants t ON l.tenant_id = t.tenant_id
ORDER BY l.unit_id, l.start_date;
