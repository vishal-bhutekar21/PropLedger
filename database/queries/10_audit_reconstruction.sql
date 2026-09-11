-- ============================================================
-- Query 10: JSONB Audit Trail State Reconstruction & Temporal Forensics
-- Concept: Utilizing PostgreSQL JSONB operators (->, ->>, #>>, @>)
-- to inspect entity change deltas and reconstruct past database states.
-- ============================================================

-- Query 10A: Query all unit price adjustments recorded in the audit logs
-- extracting previous rent and new rent directly from the JSONB columns.
SELECT 
    a.log_id,
    a.created_at                     AS modified_at,
    a.username                       AS changed_by,
    a.ip_address,
    a.entity_id                      AS unit_id,
    u.unit_number,
    p.property_name,
    -- Extract values from JSONB delta payloads
    (a.old_value->>'monthly_rent')::DECIMAL AS previous_rent,
    (a.new_value->>'monthly_rent')::DECIMAL AS updated_rent,
    -- Delta calculation
    ((a.new_value->>'monthly_rent')::DECIMAL - (a.old_value->>'monthly_rent')::DECIMAL) AS rent_delta_amount,
    -- Reason description
    a.description
FROM audit_logs a
JOIN units u      ON a.entity_id = u.unit_id
JOIN buildings b  ON u.building_id = b.building_id
JOIN properties p ON b.property_id = p.property_id
WHERE a.entity_type = 'Unit'
  AND a.action = 'UPDATE'
  -- Filter only audit rows where monthly_rent was modified
  AND a.new_value ? 'monthly_rent'
ORDER BY a.created_at DESC;


-- Query 10B: Forensic Compliance Report — Detect administrative actions 
-- performed outside standard business hours (8 AM - 8 PM IST) or on critical financial records.
SELECT 
    a.log_id,
    a.created_at,
    TO_CHAR(a.created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS') AS timestamp_ist,
    a.username,
    a.action,
    a.entity_type,
    a.entity_id,
    a.description,
    a.ip_address,
    CASE 
        WHEN EXTRACT(HOUR FROM a.created_at AT TIME ZONE 'Asia/Kolkata') NOT BETWEEN 8 AND 20 
        THEN 'FLAG: OUT-OF-HOURS MODIFICATION'
        WHEN a.action IN ('DELETE', 'STATUS_CHANGE') 
        THEN 'FLAG: SENSITIVE LIFECYCLE MUTATION'
        ELSE 'STANDARD AUDIT'
    END AS risk_flag
FROM audit_logs a
WHERE a.entity_type IN ('Lease', 'Payment', 'Invoice', 'Property')
ORDER BY a.created_at DESC
LIMIT 50;
