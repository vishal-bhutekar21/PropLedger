-- ============================================================
-- Query 05: Occupancy Analytics & Vacancy Loss Calculation
-- Concept: Physical Occupancy vs Economic Occupancy Rate (EOR),
-- Gross Potential Rent (GPR), and Dollar Vacancy Loss.
-- ============================================================

-- Key Industry Definitions:
-- 1. Physical Occupancy = (Occupied Units / Total Units) * 100
-- 2. Gross Potential Rent (GPR) = Sum of standard asking rent for ALL units (both vacant & occupied)
-- 3. Effective Gross Income (EGI) = Actual rent recognized on active leases
-- 4. Economic Occupancy Rate (EOR) = (Effective Gross Income / Gross Potential Rent) * 100
-- 5. Vacancy Loss = GPR - EGI

WITH property_inventory AS (
    SELECT 
        p.property_id,
        p.property_name,
        p.property_type,
        COUNT(u.unit_id)                                         AS total_units,
        COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED')    AS occupied_units,
        COUNT(u.unit_id) FILTER (WHERE u.status = 'VACANT')      AS vacant_units,
        COUNT(u.unit_id) FILTER (WHERE u.status = 'MAINTENANCE') AS maintenance_units,
        COUNT(u.unit_id) FILTER (WHERE u.status = 'RESERVED')    AS reserved_units,
        -- Gross Potential Rent: asking monthly rent across all units
        SUM(u.monthly_rent)                                      AS gross_potential_rent_monthly
    FROM properties p
    JOIN buildings b ON b.property_id = p.property_id
    JOIN units u     ON u.building_id = b.building_id
    GROUP BY p.property_id, p.property_name, p.property_type
),
active_contract_rent AS (
    SELECT 
        p.property_id,
        -- Sum of contractually executed rent on currently active leases
        SUM(l.monthly_rent) AS active_contract_rent_monthly
    FROM properties p
    JOIN buildings b ON b.property_id = p.property_id
    JOIN units u     ON u.building_id = b.building_id
    JOIN leases l    ON l.unit_id = u.unit_id AND l.status = 'ACTIVE'
    GROUP BY p.property_id
)
SELECT 
    inv.property_name,
    inv.property_type,
    inv.total_units,
    inv.occupied_units,
    inv.vacant_units,
    inv.maintenance_units,
    
    -- Physical Occupancy
    ROUND((inv.occupied_units::DECIMAL / NULLIF(inv.total_units, 0) * 100), 1) AS physical_occupancy_pct,

    -- Financial metrics
    inv.gross_potential_rent_monthly,
    COALESCE(act.active_contract_rent_monthly, 0) AS effective_contract_rent_monthly,
    
    -- Vacancy Loss ($ / ₹)
    (inv.gross_potential_rent_monthly - COALESCE(act.active_contract_rent_monthly, 0)) AS monthly_dollar_vacancy_loss,

    -- Economic Occupancy Rate (EOR)
    ROUND(
        (COALESCE(act.active_contract_rent_monthly, 0) / NULLIF(inv.gross_potential_rent_monthly, 0) * 100), 1
    ) AS economic_occupancy_rate_pct
FROM property_inventory inv
LEFT JOIN active_contract_rent act ON inv.property_id = act.property_id
ORDER BY physical_occupancy_pct DESC;
