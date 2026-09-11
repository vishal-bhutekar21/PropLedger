-- ============================================================
-- Query 09: Recursive CTEs — Lease Renewal Chains & Tenant Lifetime Value (LTV)
-- Concept: Recursive traversal of self-referencing parent_lease_id
-- relationships to reconstruct multi-year lease histories and cumulative LTV.
-- ============================================================

WITH RECURSIVE lease_lineage AS (
    -- Anchor member: Initial base leases (leases that are NOT renewals of prior leases)
    SELECT 
        l.lease_id,
        l.parent_lease_id,
        l.tenant_id,
        l.unit_id,
        l.start_date,
        l.end_date,
        l.monthly_rent,
        l.status,
        1 AS renewal_generation,
        ARRAY[l.lease_id] AS lease_chain_path,
        l.monthly_rent AS original_commencement_rent
    FROM leases l
    WHERE l.parent_lease_id IS NULL

    UNION ALL

    -- Recursive member: Successive renewal leases linked to parent leases
    SELECT 
        child.lease_id,
        child.parent_lease_id,
        child.tenant_id,
        child.unit_id,
        child.start_date,
        child.end_date,
        child.monthly_rent,
        child.status,
        parent.renewal_generation + 1 AS renewal_generation,
        parent.lease_chain_path || child.lease_id,
        parent.original_commencement_rent
    FROM leases child
    INNER JOIN lease_lineage parent ON child.parent_lease_id = parent.lease_id
)
SELECT 
    t.full_name AS tenant_name,
    p.property_name,
    u.unit_number,
    ll.lease_id,
    ll.renewal_generation,
    ll.start_date,
    ll.end_date,
    ll.original_commencement_rent,
    ll.monthly_rent AS current_rent,
    -- Cumulative rent inflation over lifecycle
    ROUND(((ll.monthly_rent - ll.original_commencement_rent) / NULLIF(ll.original_commencement_rent, 0) * 100), 2) AS lifetime_rent_escalation_pct,
    -- Audit lineage path
    array_to_string(ll.lease_chain_path, ' -> ') AS lease_ancestry_chain
FROM lease_lineage ll
JOIN tenants t    ON ll.tenant_id = t.tenant_id
JOIN units u      ON ll.unit_id = u.unit_id
JOIN buildings b  ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
ORDER BY t.full_name, ll.renewal_generation;
