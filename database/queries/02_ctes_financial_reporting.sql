-- ============================================================
-- Query 02: Common Table Expressions (CTEs) & Financial Reporting
-- Concept: Multi-stage CTEs with Month-Over-Month (MoM) Growth,
-- Cumulative Year-To-Date (YTD) Totals, and Cash Collection Velocity.
-- ============================================================

WITH monthly_invoiced AS (
    -- Stage 1: Monthly billing accrual by property
    SELECT 
        p.property_id,
        p.property_name,
        DATE_TRUNC('month', i.invoice_date)::DATE AS billing_month,
        SUM(i.total_amount)                       AS gross_invoiced_amount,
        COUNT(i.invoice_id)                       AS total_invoices_generated
    FROM properties p
    JOIN buildings b  ON b.property_id = p.property_id
    JOIN units u      ON u.building_id = b.building_id
    JOIN leases l     ON l.unit_id = u.unit_id
    JOIN invoices i   ON i.lease_id = l.lease_id
    WHERE i.status != 'VOID'
      AND i.invoice_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY p.property_id, p.property_name, DATE_TRUNC('month', i.invoice_date)
),
monthly_collected AS (
    -- Stage 2: Actual cash received matching billing periods
    SELECT 
        p.property_id,
        DATE_TRUNC('month', pay.payment_date)::DATE AS collection_month,
        SUM(pay.amount)                             AS actual_collected_amount,
        COUNT(pay.payment_id)                       AS total_payments_settled
    FROM properties p
    JOIN buildings b  ON b.property_id = p.property_id
    JOIN units u      ON u.building_id = b.building_id
    JOIN leases l     ON l.unit_id = u.unit_id
    JOIN invoices i   ON i.lease_id = l.lease_id
    JOIN payments pay ON pay.invoice_id = i.invoice_id
    WHERE pay.status = 'COMPLETED'
      AND pay.payment_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY p.property_id, DATE_TRUNC('month', pay.payment_date)
),
monthly_financials AS (
    -- Stage 3: Merge accrual billing with cash collection and calculate variance
    SELECT 
        inv.property_id,
        inv.property_name,
        inv.billing_month,
        inv.gross_invoiced_amount,
        COALESCE(col.actual_collected_amount, 0)   AS actual_collected_amount,
        (inv.gross_invoiced_amount - COALESCE(col.actual_collected_amount, 0)) AS monthly_deficit,
        ROUND(
            (COALESCE(col.actual_collected_amount, 0) / NULLIF(inv.gross_invoiced_amount, 0) * 100), 2
        ) AS collection_efficiency_percentage
    FROM monthly_invoiced inv
    LEFT JOIN monthly_collected col 
           ON inv.property_id = col.property_id 
          AND inv.billing_month = col.collection_month
)
-- Final Output: Calculate Windowed MoM trends and cumulative totals
SELECT 
    property_name,
    TO_CHAR(billing_month, 'YYYY-Mon')               AS month_label,
    gross_invoiced_amount,
    actual_collected_amount,
    monthly_deficit,
    collection_efficiency_percentage,
    -- Month-over-Month Revenue Delta
    actual_collected_amount - LAG(actual_collected_amount, 1, actual_collected_amount) 
        OVER (PARTITION BY property_id ORDER BY billing_month) AS mom_collection_change,
    -- Running Cumulative Total for the Trailing Period
    SUM(actual_collected_amount) 
        OVER (PARTITION BY property_id ORDER BY billing_month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_cash_collected
FROM monthly_financials
ORDER BY property_name, billing_month DESC;
