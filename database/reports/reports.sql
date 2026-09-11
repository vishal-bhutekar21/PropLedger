-- ============================================================================
-- PropLedger: Executive Financial & Operational Report Queries
-- ============================================================================

-- REPORT 1: Executive Monthly Portfolio Performance Summary
WITH monthly_revenue AS (
    SELECT 
        u.property_id,
        TO_CHAR(pa.allocated_at, 'YYYY-MM') AS report_month,
        SUM(pa.allocated_amount) AS revenue_collected
    FROM payment_allocations pa
    JOIN invoices i ON i.id = pa.invoice_id
    JOIN leases l ON l.id = i.lease_id
    JOIN units u ON u.id = l.unit_id
    GROUP BY u.property_id, TO_CHAR(pa.allocated_at, 'YYYY-MM')
),
monthly_expenses AS (
    SELECT 
        property_id,
        TO_CHAR(expense_date, 'YYYY-MM') AS report_month,
        SUM(CASE WHEN category <> 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END) AS opex,
        SUM(CASE WHEN category = 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END) AS capex,
        SUM(amount) AS total_expense
    FROM expenses
    GROUP BY property_id, TO_CHAR(expense_date, 'YYYY-MM')
)
SELECT 
    p.name AS property_name,
    COALESCE(r.report_month, e.report_month) AS billing_cycle,
    COALESCE(r.revenue_collected, 0.00) AS gross_revenue,
    COALESCE(e.opex, 0.00) AS operating_expenses,
    COALESCE(e.capex, 0.00) AS capital_expenditures,
    (COALESCE(r.revenue_collected, 0.00) - COALESCE(e.opex, 0.00)) AS net_operating_income,
    ROUND(
        CASE 
            WHEN COALESCE(r.revenue_collected, 0.00) > 0 
            THEN ((COALESCE(r.revenue_collected, 0.00) - COALESCE(e.opex, 0.00)) / r.revenue_collected) * 100.0
            ELSE 0.00 
        END, 2
    ) AS noi_margin_pct
FROM properties p
LEFT JOIN monthly_revenue r ON r.property_id = p.id
LEFT JOIN monthly_expenses e ON e.property_id = p.id AND e.report_month = r.report_month
WHERE p.is_active = TRUE
ORDER BY billing_cycle DESC, gross_revenue DESC;


-- REPORT 2: Delinquency & Aging Accounts Receivable Rollup by Property
SELECT 
    p.name AS property_name,
    COUNT(DISTINCT t.id) AS total_delinquent_tenants,
    COUNT(i.id) AS total_overdue_invoices,
    SUM(i.balance_due) AS grand_total_receivables,
    SUM(i.balance_due) FILTER (WHERE i.due_date >= CURRENT_DATE) AS current_due,
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 1 AND 30) AS aged_1_30_days,
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 31 AND 60) AS aged_31_60_days,
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 61 AND 90) AS aged_61_90_days,
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date > 90) AS aged_over_90_days
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN leases l ON l.unit_id = u.id
JOIN tenants t ON t.current_lease_id = l.id
JOIN invoices i ON i.lease_id = l.id
WHERE i.balance_due > 0
GROUP BY p.id, p.name
ORDER BY grand_total_receivables DESC;


-- REPORT 3: Maintenance Operations SLA Resolution Performance
SELECT 
    p.name AS property_name,
    COUNT(mr.id) AS total_tickets_filed,
    COUNT(CASE WHEN mr.status = 'COMPLETED' THEN 1 END) AS completed_tickets,
    COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) AS active_backlog,
    COUNT(CASE WHEN mr.priority = 'EMERGENCY' THEN 1 END) AS emergency_tickets,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (wo.completed_at - mr.created_at)) / 3600.0) FILTER (WHERE wo.completed_at IS NOT NULL),
        1
    ) AS avg_hours_to_resolve,
    COALESCE(SUM(wo.total_cost), 0.00) AS total_maintenance_spend
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN maintenance_requests mr ON mr.unit_id = u.id
LEFT JOIN work_orders wo ON wo.request_id = mr.id
GROUP BY p.id, p.name
ORDER BY active_backlog DESC, total_tickets_filed DESC;
