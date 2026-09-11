-- ============================================================
-- Query 08: Maintenance SLAs, MTTR & Vendor Cost Variance
-- Concept: Mean Time to Resolution (MTTR), SLA compliance tracking,
-- and repair budget variance (Estimated vs Actual cost).
-- ============================================================

WITH ticket_sla_benchmarks AS (
    SELECT 
        mr.request_id,
        mr.category,
        mr.priority,
        mr.status,
        mr.created_at,
        mr.resolved_at,
        mr.estimated_cost,
        mr.actual_cost,
        p.property_name,
        -- SLA targets in hours based on priority
        CASE mr.priority
            WHEN 'URGENT' THEN 4
            WHEN 'HIGH'   THEN 24
            WHEN 'MEDIUM' THEN 48
            ELSE 168 -- LOW: 7 days (168 hours)
        END AS sla_target_hours,
        -- Actual resolution time in decimal hours
        ROUND(EXTRACT(EPOCH FROM (mr.resolved_at - mr.created_at)) / 3600.0, 1) AS actual_resolution_hours
    FROM maintenance_requests mr
    JOIN units u     ON mr.unit_id = u.unit_id
    JOIN buildings b ON u.building_id = b.building_id
    JOIN properties p ON b.property_id = p.property_id
)
SELECT 
    priority,
    COUNT(request_id)                                           AS total_tickets,
    COUNT(request_id) FILTER (WHERE status = 'RESOLVED')        AS resolved_tickets,
    COUNT(request_id) FILTER (WHERE status IN ('OPEN', 'IN_PROGRESS')) AS open_tickets,
    
    -- SLA Target Benchmark
    MAX(sla_target_hours)                                       AS sla_target_hours,

    -- Mean Time to Resolution (MTTR) in hours
    ROUND(AVG(actual_resolution_hours) FILTER (WHERE status = 'RESOLVED'), 1) AS mean_time_to_resolution_hours,

    -- SLA Compliance Rate (% of tickets resolved within SLA target)
    ROUND(
        (COUNT(request_id) FILTER (WHERE status = 'RESOLVED' AND actual_resolution_hours <= sla_target_hours)::DECIMAL 
        / NULLIF(COUNT(request_id) FILTER (WHERE status = 'RESOLVED'), 0) * 100), 1
    ) AS sla_compliance_pct,

    -- Financial budget accuracy
    SUM(estimated_cost)                                         AS total_estimated_cost,
    SUM(actual_cost)                                            AS total_actual_cost,
    ROUND(
        ((SUM(actual_cost) - SUM(estimated_cost)) / NULLIF(SUM(estimated_cost), 0) * 100), 2
    ) AS budget_cost_variance_pct
FROM ticket_sla_benchmarks
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'URGENT' THEN 1
        WHEN 'HIGH'   THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END;
