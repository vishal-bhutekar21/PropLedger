-- ============================================================
-- Query 06: Accounts Receivable (AR) Aging Analysis
-- Concept: Conditional aggregation bucketing overdue receivables
-- into standard corporate aging buckets (0-30, 31-60, 61-90, 90+ days).
-- Essential for Yardi/RealPage property accounting.
-- ============================================================

WITH unpaid_invoices_with_payments AS (
    SELECT 
        i.invoice_id,
        i.invoice_number,
        i.invoice_date,
        i.due_date,
        i.total_amount,
        l.lease_id,
        t.tenant_id,
        t.full_name AS tenant_name,
        t.phone     AS tenant_phone,
        p.property_name,
        u.unit_number,
        -- Calculate how many days past due this invoice is today
        (CURRENT_DATE - i.due_date) AS days_past_due,
        -- Calculate net remaining unpaid balance
        (i.total_amount - COALESCE(SUM(pay.amount), 0)) AS balance_due
    FROM invoices i
    JOIN leases l     ON i.lease_id = l.lease_id
    JOIN tenants t    ON l.tenant_id = t.tenant_id
    JOIN units u      ON l.unit_id = u.unit_id
    JOIN buildings b  ON u.building_id = b.building_id
    JOIN properties p ON b.property_id = p.property_id
    LEFT JOIN payments pay ON pay.invoice_id = i.invoice_id AND pay.status = 'COMPLETED'
    WHERE i.status NOT IN ('PAID', 'VOID')
    GROUP BY i.invoice_id, i.invoice_number, i.invoice_date, i.due_date, i.total_amount,
             l.lease_id, t.tenant_id, t.full_name, t.phone, p.property_name, u.unit_number
    HAVING (i.total_amount - COALESCE(SUM(pay.amount), 0)) > 0
)
SELECT 
    property_name,
    tenant_name,
    unit_number,
    tenant_phone,
    COUNT(invoice_id) AS outstanding_invoices_count,
    
    -- Current / Not yet due or <30 days
    COALESCE(SUM(balance_due) FILTER (WHERE days_past_due <= 30), 0) AS current_0_to_30_days,
    
    -- 31 to 60 days overdue (Follow-up notice tier)
    COALESCE(SUM(balance_due) FILTER (WHERE days_past_due BETWEEN 31 AND 60), 0) AS aging_31_to_60_days,
    
    -- 61 to 90 days overdue (Legal warning tier)
    COALESCE(SUM(balance_due) FILTER (WHERE days_past_due BETWEEN 61 AND 90), 0) AS aging_61_to_90_days,
    
    -- 90+ days overdue (Default / Eviction risk tier)
    COALESCE(SUM(balance_due) FILTER (WHERE days_past_due > 90), 0) AS aging_90_plus_days,

    -- Total delinquent receivable balance
    SUM(balance_due) AS total_delinquent_balance,

    -- Risk Level Assessment
    CASE 
        WHEN MAX(days_past_due) > 90 THEN 'CRITICAL (EVICTION REVIEW)'
        WHEN MAX(days_past_due) > 60 THEN 'HIGH (LEGAL DEMAND)'
        WHEN MAX(days_past_due) > 30 THEN 'MEDIUM (LATE NOTICE)'
        ELSE 'LOW (CURRENT)'
    END AS collection_risk_rating
FROM unpaid_invoices_with_payments
GROUP BY property_name, tenant_name, unit_number, tenant_phone
ORDER BY total_delinquent_balance DESC;
