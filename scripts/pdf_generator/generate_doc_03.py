import os
import sys
sys.path.append(os.path.dirname(__file__))
from engine import PropLedgerPdfEngine

def build_doc_03(output_path="docs/pdf/03_Advanced_SQL_And_Analytics_Engine.pdf"):
    doc = PropLedgerPdfEngine(
        filename=output_path,
        volume_num=3,
        volume_title="Advanced SQL & Analytics Engine",
        volume_category="SQL PERFORMANCE & ANALYTICS"
    )

    # PAGE 1: COVER PAGE
    topics = [
        ["02", "Complex Multi-Table Joins", "5-table joins across properties, units, leases, tenants, and ledger"],
        ["03", "Common Table Expressions (CTEs)", "CTE pipeline design and explicit AS MATERIALIZED optimization"],
        ["04", "Correlated Subqueries & Semi-Joins", "EXISTS vs IN execution plans and optimizer unnesting"],
        ["05", "Window Functions: Rent Roll", "DENSE_RANK(), running cumulative sums, and partition variance"],
        ["06", "Occupancy Analytics", "Calculating physical vs economic occupancy rates and loss-to-lease"],
        ["07", "Aging AR Delinquency Buckets", "30/60/90+ day past due bucketing via FILTER (WHERE ...) clauses"],
        ["08", "Property P&L and NOI Statement", "Synthesizing gross collected revenue against itemized OpEx categories"],
        ["09", "Recursive Hierarchy Rollups", "WITH RECURSIVE rollups and JSONB state reconstruction queries"],
        ["10", "Top 15 SQL Interview Queries", "High-yield real-world SQL problems asked at enterprise real estate tech"]
    ]
    doc.draw_cover_page(
        title="Advanced SQL & Analytics",
        subtitle="CTEs, Window Functions, Complex Joins & Financial Reporting",
        volume_desc="This volume deep-dives into the advanced PostgreSQL 16 SQL engineering powering PropLedger. It deconstructs production query designs for rent rolls, aged receivables, recursive asset rollups, and property P&L statements. Senior database engineering candidates will master Window Functions, Common Table Expressions, semi-joins, and execution optimization required to query millions of rows in single-digit milliseconds.",
        key_topics=topics
    )

    # PAGE 2: COMPLEX MULTI-TABLE JOINS
    doc.start_page("2. COMPLEX MULTI-TABLE JOINS IN PROPERTY OPERATIONS", "5-Table Operational Joins & Join Type Selection")
    doc.add_section("1. The Enterprise Rent Roll Query")
    doc.add_paragraph("In property management, a 'Rent Roll' is the definitive census report. It requires joining five relational boundaries: properties, buildings, units, leases, and primary tenants:")
    code = """-- 01_complex_joins.sql: Master Operational Rent Roll Census
SELECT 
    p.property_code,
    p.name AS property_name,
    COALESCE(b.building_name, 'Main Structure') AS building,
    u.unit_number,
    u.unit_type,
    u.market_rent,
    u.status AS unit_status,
    l.lease_number,
    l.start_date,
    l.end_date,
    l.rent_amount AS contract_rent,
    t.first_name || ' ' || t.last_name AS primary_resident,
    t.email AS resident_email,
    COALESCE(SUM(i.balance_due), 0.00) AS total_past_due
FROM properties p
JOIN units u ON u.property_id = p.id
LEFT JOIN buildings b ON b.id = u.building_id
LEFT JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE'
LEFT JOIN lease_tenants lt ON lt.lease_id = l.id AND lt.is_primary_tenant = TRUE
LEFT JOIN tenants t ON t.id = lt.tenant_id
LEFT JOIN invoices i ON i.lease_id = l.id AND i.balance_due > 0
WHERE p.is_active = TRUE
GROUP BY p.property_code, p.name, b.building_name, u.unit_number, 
         u.unit_type, u.market_rent, u.status, l.lease_number, 
         l.start_date, l.end_date, l.rent_amount, t.first_name, t.last_name, t.email
ORDER BY p.name, u.unit_number;"""
    doc.add_code_block(code, "SQL — Master Operational Rent Roll Query")

    doc.add_section("2. Join Semantics & Why LEFT JOIN is Critical Here")
    doc.add_paragraph("Notice that while 'JOIN units' is an INNER JOIN (every unit must have a property), the joins to 'leases', 'buildings', and 'tenants' must be **LEFT JOINS**. An INNER JOIN would exclude all vacant apartments from the census, corrupting occupancy calculations!")
    doc.end_page()

    # PAGE 3: COMMON TABLE EXPRESSIONS (CTES)
    doc.start_page("3. COMMON TABLE EXPRESSIONS & MATERIALIZATION MECHANICS", "PostgreSQL 12+ CTE Inlining vs AS MATERIALIZED Optimization")
    doc.add_section("1. The Multi-Stage CTE Reporting Pipeline")
    doc.add_paragraph("Common Table Expressions (CTEs) break complex queries into readable, modular steps. In PropLedger's financial engine, we calculate tenant ledger standings through modular CTE pipelines:")
    code = """-- 02_ctes_financial_reporting.sql: Multi-Stage Financial Delinquency CTE
WITH active_tenant_leases AS (
    SELECT l.id AS lease_id, l.unit_id, l.rent_amount, lt.tenant_id
    FROM leases l
    JOIN lease_tenants lt ON lt.lease_id = l.id AND lt.is_primary_tenant = TRUE
    WHERE l.status = 'ACTIVE'
),
tenant_balances AS (
    SELECT 
        atl.tenant_id,
        atl.unit_id,
        SUM(i.total_amount) AS total_billed,
        SUM(i.balance_due) AS total_outstanding
    FROM active_tenant_leases atl
    JOIN invoices i ON i.lease_id = atl.lease_id
    GROUP BY atl.tenant_id, atl.unit_id
)
SELECT 
    t.first_name || ' ' || t.last_name AS tenant_name,
    u.unit_number,
    p.name AS property_name,
    tb.total_billed,
    tb.total_outstanding
FROM tenant_balances tb
JOIN tenants t ON t.id = tb.tenant_id
JOIN units u ON u.id = tb.unit_id
JOIN properties p ON p.id = u.property_id
WHERE tb.total_outstanding > 0
ORDER BY tb.total_outstanding DESC;"""
    doc.add_code_block(code, "SQL — Modular Common Table Expression Pipeline")

    doc.add_section("2. 'AS MATERIALIZED' vs Inlined CTEs")
    doc.add_paragraph("In PostgreSQL 12+, the query planner inlines CTEs automatically. However, if a CTE is referenced multiple times, inlining can cause duplicate evaluations. Adding **'AS MATERIALIZED'** forces PostgreSQL to evaluate the CTE exactly once and cache the temporary working table in RAM.")
    doc.end_page()

    # PAGE 4: CORRELATED SUBQUERIES & SEMI-JOINS
    doc.start_page("4. CORRELATED SUBQUERIES VS SEMI-JOINS: PERFORMANCE", "Analyzing EXISTS vs IN vs LEFT JOIN Anti-Joins")
    doc.add_section("1. The Vacant Units Problem: Three Query Approaches")
    doc.add_paragraph("Finding units that currently have zero active maintenance tickets or zero pending lease applications can be written in three distinct ways:")

    headers = ["Approach", "SQL Syntax", "Planner Operator", "Performance on Large Tables"]
    rows = [
        ["NOT IN", "WHERE id NOT IN (SELECT unit_id ...)", "Seq Scan + Materialize", "POOR (Fails on NULLs, O(N*M) worst case)"],
        ["NOT EXISTS", "WHERE NOT EXISTS (SELECT 1 ...)", "Hash Anti-Join", "EXCELLENT (Stops at first match, NULL safe)"],
        ["LEFT JOIN + IS NULL", "LEFT JOIN ... WHERE r.id IS NULL", "Hash Anti-Join", "EXCELLENT (Equivalent to NOT EXISTS)"]
    ]
    doc.add_table(headers, rows, [110, 155, 115, 152])

    doc.add_section("2. Production Code: NOT EXISTS Anti-Join")
    code = """-- 03_subqueries_correlated.sql: High-Performance Vacancy Query
SELECT 
    u.id AS unit_id,
    u.unit_number,
    p.name AS property_name,
    u.market_rent
FROM units u
JOIN properties p ON p.id = u.property_id
WHERE u.status = 'AVAILABLE'
  AND NOT EXISTS (
      -- Semi-join check for any active lease covering today
      SELECT 1 FROM leases l
      WHERE l.unit_id = u.id 
        AND l.status = 'ACTIVE'
        AND CURRENT_DATE BETWEEN l.start_date AND l.end_date
  )
  AND NOT EXISTS (
      -- Check for pending emergency work orders
      SELECT 1 FROM maintenance_requests mr
      WHERE mr.unit_id = u.id
        AND mr.status NOT IN ('COMPLETED', 'CANCELLED')
  );"""
    doc.add_code_block(code, "SQL — Semi-Join Anti-Filter Implementation")

    doc.add_callout("Interview Rule of Thumb", "Never use 'NOT IN' with nullable foreign keys. In SQL 3-valued logic, if the subquery returns even a single NULL, 'NOT IN' evaluates to UNKNOWN, returning zero rows!", "alert")
    doc.end_page()

    # PAGE 5: WINDOW FUNCTIONS: RENT ROLL
    doc.start_page("5. WINDOW FUNCTIONS: RENT ROLL & RUNNING TOTALS", "OVER(), PARTITION BY, DENSE_RANK() & Analytic Aggregations")
    doc.add_section("1. Window Function Mechanics")
    doc.add_paragraph("Unlike 'GROUP BY' which collapses rows, SQL Window Functions compute aggregate values over a sliding partition while preserving the individual identity of every underlying row.")

    doc.add_section("2. Production Code: Rent Roll Variance & Ranking")
    code = """-- 04_window_functions_rent_roll.sql: Rent Roll Analytics
SELECT 
    p.name AS property_name,
    u.unit_number,
    u.bedrooms,
    l.rent_amount,
    -- 1. Average rent for this specific bedroom category across property
    ROUND(AVG(l.rent_amount) OVER (
        PARTITION BY p.id, u.bedrooms
    ), 2) AS avg_rent_for_beds,
    -- 2. Variance from bedroom average (Premium / Discount)
    ROUND(l.rent_amount - AVG(l.rent_amount) OVER (
        PARTITION BY p.id, u.bedrooms
    ), 2) AS variance_from_avg,
    -- 3. Dense Rank of rent within this building
    DENSE_RANK() OVER (
        PARTITION BY p.id ORDER BY l.rent_amount DESC
    ) AS rent_rank_in_property,
    -- 4. Cumulative running total contract revenue
    SUM(l.rent_amount) OVER (
        PARTITION BY p.id 
        ORDER BY l.rent_amount DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total_revenue
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE';"""
    doc.add_code_block(code, "SQL — Advanced Window Functions Implementation")

    doc.add_section("3. Key Function Explanations")
    doc.add_bullet("AVG(...) OVER (PARTITION BY ...)", "Computes the sub-group benchmark without a separate self-join subquery.")
    doc.add_bullet("DENSE_RANK()", "Ranks apartments by rent without skipping ranks in the event of identical rent amounts.")
    doc.add_bullet("ROWS BETWEEN UNBOUNDED PRECEDING...", "Explicitly bounds the window frame for running accumulators.")
    doc.end_page()

    # PAGE 6: OCCUPANCY RATE ANALYTICS
    doc.start_page("6. OCCUPANCY RATE ANALYTICS & LOSS-TO-LEASE", "Physical Occupancy, Economic Occupancy & Financial Leakage")
    doc.add_section("1. Physical vs Economic Occupancy")
    doc.add_paragraph("Institutional property investors track two distinct occupancy metrics:")
    doc.add_bullet("Physical Occupancy Rate", "The percentage of physical units occupied by active leases: (Occupied Units / Total Units) * 100.")
    doc.add_bullet("Economic Occupancy Rate", "The actual rent collected divided by the Gross Potential Rent (GPR) at full market rate.")
    doc.add_bullet("Loss-to-Lease", "The financial gap between current market rents and contract rents signed in older leases.")

    doc.add_section("2. Production Code: Occupancy Analytics")
    code = """-- 05_occupancy_analytics.sql: Physical vs Economic Occupancy
SELECT 
    p.id AS property_id,
    p.name AS property_name,
    COUNT(u.id) AS total_units,
    COUNT(CASE WHEN u.status = 'OCCUPIED' THEN 1 END) AS occupied_units,
    ROUND((COUNT(CASE WHEN u.status = 'OCCUPIED' THEN 1 END)::NUMERIC / 
           NULLIF(COUNT(u.id), 0)) * 100.0, 2) AS physical_occupancy_pct,
    -- Financial Potentials
    COALESCE(SUM(u.market_rent), 0.00) AS gross_potential_rent,
    COALESCE(SUM(l.rent_amount), 0.00) AS actual_contract_rent,
    -- Loss-to-Lease Calculation
    ROUND(COALESCE(SUM(u.market_rent), 0.00) - COALESCE(SUM(l.rent_amount), 0.00), 2) AS loss_to_lease,
    -- Economic Yield %
    ROUND((COALESCE(SUM(l.rent_amount), 0.00) / 
           NULLIF(SUM(u.market_rent), 0)) * 100.0, 2) AS economic_occupancy_pct
FROM properties p
JOIN units u ON u.property_id = p.id
LEFT JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE'
WHERE p.is_active = TRUE
GROUP BY p.id, p.name
ORDER BY physical_occupancy_pct DESC;"""
    doc.add_code_block(code, "SQL — Comprehensive Occupancy Metrics Query")
    doc.end_page()

    # PAGE 7: AGED RECEIVABLES (AGING AR)
    doc.start_page("7. AGED RECEIVABLES (AGING AR) BUCKETING", "Conditional Aggregations via FILTER (WHERE ...) Clauses")
    doc.add_section("1. Accounts Receivable Aging Buckets")
    doc.add_paragraph("Delinquency analysis groups unpaid debt into standard aging buckets: Current, 1–30 Days, 31–60 Days, 61–90 Days, and 90+ Days Past Due. PropLedger implements this using PostgreSQL's modern 'FILTER (WHERE ...)' clause:")

    doc.add_section("2. Production Code: Aging AR Query")
    code = """-- 06_aging_ar_analysis.sql: Aged Accounts Receivable Bucketing
SELECT 
    p.name AS property_name,
    t.id AS tenant_id,
    t.first_name || ' ' || t.last_name AS resident_name,
    u.unit_number,
    SUM(i.balance_due) AS total_debt,
    -- Modern SQL: Filter Clauses
    COALESCE(SUM(i.balance_due) FILTER (
        WHERE i.due_date >= CURRENT_DATE
    ), 0.00) AS current_balance,
    COALESCE(SUM(i.balance_due) FILTER (
        WHERE CURRENT_DATE - i.due_date BETWEEN 1 AND 30
    ), 0.00) AS past_due_1_30,
    COALESCE(SUM(i.balance_due) FILTER (
        WHERE CURRENT_DATE - i.due_date BETWEEN 31 AND 60
    ), 0.00) AS past_due_31_60,
    COALESCE(SUM(i.balance_due) FILTER (
        WHERE CURRENT_DATE - i.due_date BETWEEN 61 AND 90
    ), 0.00) AS past_due_61_90,
    COALESCE(SUM(i.balance_due) FILTER (
        WHERE CURRENT_DATE - i.due_date > 90
    ), 0.00) AS severely_delinquent_90_plus
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN leases l ON l.unit_id = u.id
JOIN tenants t ON t.current_lease_id = l.id
JOIN invoices i ON i.lease_id = l.id
WHERE i.balance_due > 0
GROUP BY p.name, t.id, t.first_name, t.last_name, u.unit_number
ORDER BY total_debt DESC;"""
    doc.add_code_block(code, "SQL — Aged Accounts Receivable Implementation")

    doc.add_section("3. Performance Advantage of FILTER Over CASE WHEN")
    doc.add_paragraph("Standard 'SUM(CASE WHEN ... THEN balance_due ELSE 0 END)' must evaluate the CASE statement for every row. PostgreSQL's native 'FILTER (WHERE ...)' passes only matching tuples to the accumulator, executing significantly faster.")
    doc.end_page()

    # PAGE 8: PROPERTY P&L AND NOI AGGREGATION
    doc.start_page("8. PROPERTY PROFIT & LOSS (P&L) AND NOI AGGREGATION", "Operating Expenses, Collected Revenues & Net Operating Income")
    doc.add_section("1. Net Operating Income (NOI) Financial Formula")
    doc.add_paragraph("NOI is the primary metric used by banks to value real estate. PropLedger synthesizes cash revenues against operating expenditures across all 13 accounting categories:")

    doc.add_section("2. Production Code: Property P&L Statement")
    code = """-- 07_property_pnl.sql: Comprehensive Property P&L
WITH collected_revenue AS (
    SELECT u.property_id, SUM(pa.allocated_amount) AS revenue
    FROM payment_allocations pa
    JOIN invoices i ON i.id = pa.invoice_id
    JOIN leases l ON l.id = i.lease_id
    JOIN units u ON u.id = l.unit_id
    WHERE pa.allocated_at >= '2026-01-01' AND pa.allocated_at < '2027-01-01'
    GROUP BY u.property_id
),
itemized_expenses AS (
    SELECT 
        property_id,
        SUM(CASE WHEN category <> 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END) AS total_opex,
        SUM(CASE WHEN category = 'CAPITAL_IMPROVEMENT' THEN amount ELSE 0 END) AS total_capex,
        SUM(CASE WHEN category = 'UTILITIES' THEN amount ELSE 0 END) AS opex_utilities,
        SUM(CASE WHEN category = 'REPAIRS' THEN amount ELSE 0 END) AS opex_repairs,
        SUM(CASE WHEN category = 'PROPERTY_TAX' THEN amount ELSE 0 END) AS opex_taxes
    FROM expenses
    WHERE expense_date >= '2026-01-01' AND expense_date < '2027-01-01'
    GROUP BY property_id
)
SELECT 
    p.name AS property_name,
    COALESCE(r.revenue, 0.00) AS gross_revenue_collected,
    COALESCE(e.total_opex, 0.00) AS operating_expenses,
    (COALESCE(r.revenue, 0.00) - COALESCE(e.total_opex, 0.00)) AS net_operating_income,
    ROUND((COALESCE(e.total_opex, 0.00) / NULLIF(r.revenue, 0)) * 100.0, 1) AS opex_ratio_pct,
    COALESCE(e.total_capex, 0.00) AS capital_expenditures
FROM properties p
LEFT JOIN collected_revenue r ON r.property_id = p.id
LEFT JOIN itemized_expenses e ON e.property_id = p.id
WHERE p.is_active = TRUE;"""
    doc.add_code_block(code, "SQL — Property Profit & Loss Statement")
    doc.end_page()

    # PAGE 9: RECURSIVE HIERARCHIES & AUDIT RECONSTRUCTION
    doc.start_page("9. RECURSIVE HIERARCHIES & AUDIT RECONSTRUCTION", "WITH RECURSIVE Trees & Point-in-Time Historical Diffs")
    doc.add_section("1. Recursive Common Table Expressions (WITH RECURSIVE)")
    doc.add_paragraph("PropLedger supports nested asset hierarchies (Corporate Portfolio -> Regional Group -> Property -> Building -> Unit). Traversing this acyclic graph is executed via 'WITH RECURSIVE':")
    code = """-- 09_recursive_hierarchies.sql: Recursive Asset Rollup
WITH RECURSIVE asset_tree AS (
    -- Anchor member: root properties
    SELECT id, name, NULL::BIGINT AS parent_id, 1 AS depth, name::TEXT AS path
    FROM properties WHERE is_active = TRUE
    UNION ALL
    -- Recursive member: buildings under properties
    SELECT b.id, b.building_name, b.property_id, at.depth + 1, at.path || ' -> ' || b.building_name
    FROM buildings b
    JOIN asset_tree at ON at.id = b.property_id
)
SELECT depth, path FROM asset_tree ORDER BY path;"""
    doc.add_code_block(code, "SQL — Recursive Common Table Expression")

    doc.add_section("2. Point-in-Time Audit State Reconstruction")
    doc.add_paragraph("Reconstructing the state of an invoice as of a specific second using JSONB deltas:")
    code = """-- 10_audit_reconstruction.sql: Reconstruct Historical State
SELECT 
    record_id, action, created_at AS transition_time,
    new_values->>'balance_due' AS balance_due_at_time,
    new_values->>'status' AS status_at_time,
    changed_by_user_id
FROM audit_logs
WHERE table_name = 'invoices' AND record_id = 104
  AND created_at <= '2026-06-01 12:00:00+00'
ORDER BY created_at DESC LIMIT 1;"""
    doc.add_code_block(code, "SQL — JSONB Audit State Reconstruction")
    doc.end_page()

    # PAGE 10: TOP 15 SQL INTERVIEW QUERIES
    doc.start_page("10. TOP 15 SQL INTERVIEW QUERIES & SOLUTIONS", "Real-World Real Estate Tech Interview Questions")
    doc.add_section("1. High-Yield Interview SQL Problems")

    doc.add_subsection("Question 1: Find the 2nd highest contract rent in each property without using LIMIT/OFFSET.")
    doc.add_paragraph("Solution: Use DENSE_RANK() in a subquery: 'WITH ranked AS (SELECT rent_amount, property_id, DENSE_RANK() OVER (PARTITION BY property_id ORDER BY rent_amount DESC) as rnk FROM leases) SELECT * FROM ranked WHERE rnk = 2'. LIMIT/OFFSET cannot partition by property!")

    doc.add_subsection("Question 2: How do you identify delinquent tenants whose debt has grown continuously for 3 consecutive months?")
    doc.add_paragraph("Solution: Use the LAG() window function: 'LAG(balance_due, 1) OVER (PARTITION BY tenant_id ORDER BY invoice_date)'. Compare 'balance_due > lag_1 AND lag_1 > lag_2' to detect strictly increasing arrears.")

    doc.add_subsection("Question 3: Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK().")
    doc.add_paragraph("Solution: Given tied rents ($2000, $2000, $1800): ROW_NUMBER gives 1, 2, 3 (arbitrary tie-break). RANK gives 1, 1, 3 (skips rank 2). DENSE_RANK gives 1, 1, 2 (no gaps). For rent rolls, DENSE_RANK is preferred so tiers remain continuous.")

    doc.add_callout("SQL Interview Preparation Tip", 
        "Interviewers at enterprise software companies test your ability to avoid self-joins using Window Functions and your understanding of NULL handling in NOT IN vs NOT EXISTS subqueries.",
        "tip"
    )
    doc.end_page()

    saved = doc.save()
    print(f"Generated Doc 03: {output_path} ({saved} pages)")
    return saved

if __name__ == "__main__":
    build_doc_03()
