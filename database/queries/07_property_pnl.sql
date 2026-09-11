-- ============================================================
-- Query 07: Property Profit & Loss (P&L) & Net Operating Income (NOI)
-- Concept: Real estate financial statement calculation:
-- Revenue (Rental + Ancillary) - Operating Expenses (OPEX) = NOI
-- Includes Operating Expense Ratio (OER) and Capitalization yield.
-- ============================================================

WITH revenue_stream AS (
    -- Collect all revenue from paid invoice line items grouped by category
    SELECT 
        p.property_id,
        p.property_name,
        SUM(ii.amount) FILTER (WHERE ii.item_type = 'RENT')           AS rental_income,
        SUM(ii.amount) FILTER (WHERE ii.item_type = 'PARKING')        AS parking_income,
        SUM(ii.amount) FILTER (WHERE ii.item_type = 'UTILITIES')      AS utility_recharge_income,
        SUM(ii.amount) FILTER (WHERE ii.item_type = 'MAINTENANCE_FEE') AS maintenance_surcharge_income,
        SUM(ii.amount) FILTER (WHERE ii.item_type = 'LATE_FEE')       AS late_fee_income,
        SUM(ii.amount)                                                AS gross_effective_revenue
    FROM properties p
    JOIN buildings b    ON b.property_id = p.property_id
    JOIN units u        ON u.building_id = b.building_id
    JOIN leases l       ON l.unit_id = u.unit_id
    JOIN invoices i     ON i.lease_id = l.lease_id
    JOIN invoice_items ii ON ii.invoice_id = i.invoice_id
    WHERE i.status = 'PAID'
    GROUP BY p.property_id, p.property_name
),
expense_stream AS (
    -- Collect all property operating expenses by cost category
    SELECT 
        e.property_id,
        SUM(e.amount) FILTER (WHERE e.category = 'MAINTENANCE')     AS opex_repairs_maintenance,
        SUM(e.amount) FILTER (WHERE e.category = 'UTILITIES')       AS opex_utilities,
        SUM(e.amount) FILTER (WHERE e.category = 'CLEANING')        AS opex_janitorial,
        SUM(e.amount) FILTER (WHERE e.category = 'INSURANCE')       AS opex_insurance,
        SUM(e.amount) FILTER (WHERE e.category = 'TAXES')           AS opex_property_taxes,
        SUM(e.amount) FILTER (WHERE e.category = 'MANAGEMENT_FEE')  AS opex_management_fees,
        SUM(e.amount)                                               AS total_operating_expenses
    FROM expenses e
    WHERE e.status = 'PAID'
    GROUP BY e.property_id
)
SELECT 
    r.property_name,
    -- Top line revenue
    r.rental_income,
    COALESCE(r.parking_income, 0) + COALESCE(r.utility_recharge_income, 0) AS ancillary_income,
    r.gross_effective_revenue,
    
    -- Operating expense breakdown
    COALESCE(e.opex_repairs_maintenance, 0) AS maintenance_expenses,
    COALESCE(e.opex_utilities, 0)           AS utility_expenses,
    COALESCE(e.opex_janitorial, 0)          AS janitorial_expenses,
    COALESCE(e.total_operating_expenses, 0) AS total_opex,

    -- Net Operating Income (NOI)
    (r.gross_effective_revenue - COALESCE(e.total_operating_expenses, 0)) AS net_operating_income_noi,

    -- Operating Expense Ratio (OER): Total OPEX / Effective Revenue
    ROUND(
        (COALESCE(e.total_operating_expenses, 0) / NULLIF(r.gross_effective_revenue, 0) * 100), 2
    ) AS operating_expense_ratio_pct,

    -- Operating Profit Margin
    ROUND(
        ((r.gross_effective_revenue - COALESCE(e.total_operating_expenses, 0)) / NULLIF(r.gross_effective_revenue, 0) * 100), 2
    ) AS net_operating_margin_pct
FROM revenue_stream r
LEFT JOIN expense_stream e ON r.property_id = e.property_id
ORDER BY net_operating_income_noi DESC;
