package com.propledger.report;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * ReportRepository uses JDBC + native SQL instead of JPA.
 *
 * WHY NATIVE SQL HERE:
 * - Window functions (RANK, ROW_NUMBER, LAG, LEAD) have no JPQL equivalent
 * - CTEs are not expressible in JPQL
 * - Conditional aggregation (SUM CASE WHEN) is more readable in SQL
 * - For reporting, we select only required columns — not full entity graphs
 * - EXPLAIN ANALYZE optimization is only meaningful on actual SQL
 *
 * All queries are documented in database/queries/ for interview reference.
 */
@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final JdbcTemplate jdbc;

    // ─────────────────────────────────────────────
    // DASHBOARD SUMMARY
    // ─────────────────────────────────────────────
    public Map<String, Object> getDashboardSummary() {
        String sql = """
            WITH unit_stats AS (
                SELECT
                    COUNT(*)                                             AS total_units,
                    COUNT(*) FILTER (WHERE u.status = 'OCCUPIED')       AS occupied_units,
                    COUNT(*) FILTER (WHERE u.status = 'VACANT')         AS vacant_units
                FROM units u
            ),
            revenue_stats AS (
                SELECT
                    COALESCE(SUM(p.amount) FILTER (
                        WHERE p.status = 'SUCCESS'
                        AND DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', CURRENT_DATE)
                    ), 0)                                                AS monthly_revenue,
                    COALESCE(SUM(i.total_amount) FILTER (
                        WHERE i.status NOT IN ('PAID','VOID','WAIVED')
                    ), 0) - COALESCE(SUM(p.amount) FILTER (
                        WHERE p.status = 'SUCCESS'
                        AND i.status NOT IN ('VOID','WAIVED')
                    ), 0)                                                AS outstanding_amount
                FROM invoices i
                LEFT JOIN payments p ON p.invoice_id = i.invoice_id
            ),
            maintenance_stats AS (
                SELECT
                    COUNT(*) FILTER (WHERE mr.status = 'OPEN')          AS open_requests,
                    COUNT(*) FILTER (WHERE mr.priority = 'URGENT' AND mr.status NOT IN ('RESOLVED','CLOSED','CANCELLED')) AS urgent_requests,
                    COALESCE(SUM(wo.actual_cost), 0)                    AS maintenance_cost
                FROM maintenance_requests mr
                LEFT JOIN work_orders wo ON wo.request_id = mr.request_id AND wo.status = 'COMPLETED'
            ),
            expense_stats AS (
                SELECT COALESCE(SUM(e.amount) FILTER (
                    WHERE e.status IN ('APPROVED','PAID')
                    AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', CURRENT_DATE)
                ), 0) AS monthly_expenses
                FROM expenses e
            )
            SELECT
                (SELECT COUNT(*) FROM properties WHERE status = 'ACTIVE') AS total_properties,
                (SELECT COUNT(*) FROM buildings WHERE status = 'ACTIVE')  AS total_buildings,
                us.total_units, us.occupied_units, us.vacant_units,
                ROUND(us.occupied_units * 100.0 / NULLIF(us.total_units, 0), 2) AS occupancy_rate,
                rs.monthly_revenue, rs.outstanding_amount,
                ms.open_requests, ms.urgent_requests, ms.maintenance_cost,
                es.monthly_expenses,
                (rs.monthly_revenue - es.monthly_expenses)               AS net_operating_income,
                (SELECT COUNT(*) FROM tenants WHERE status = 'ACTIVE')   AS active_tenants,
                (SELECT COUNT(*) FROM leases WHERE status = 'ACTIVE')    AS active_leases,
                (SELECT COUNT(*) FROM leases WHERE status = 'ACTIVE'
                 AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS leases_expiring_30,
                (SELECT COUNT(*) FROM invoices WHERE status = 'OVERDUE') AS overdue_invoices
            FROM unit_stats us, revenue_stats rs, maintenance_stats ms, expense_stats es
        """;
        return jdbc.queryForMap(sql);
    }

    // ─────────────────────────────────────────────
    // REVENUE TREND (last 12 months)
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getRevenueTrend(int months) {
        String sql = """
            WITH months AS (
                SELECT generate_series(
                    DATE_TRUNC('month', CURRENT_DATE - (? - 1) * INTERVAL '1 month'),
                    DATE_TRUNC('month', CURRENT_DATE),
                    '1 month'::interval
                ) AS month
            ),
            monthly_revenue AS (
                SELECT
                    DATE_TRUNC('month', p.payment_date) AS month,
                    SUM(p.amount)                       AS collected
                FROM payments p
                WHERE p.status = 'SUCCESS'
                GROUP BY DATE_TRUNC('month', p.payment_date)
            ),
            monthly_invoiced AS (
                SELECT
                    DATE_TRUNC('month', i.invoice_date) AS month,
                    SUM(i.total_amount)                  AS invoiced
                FROM invoices i
                WHERE i.status NOT IN ('VOID', 'WAIVED')
                GROUP BY DATE_TRUNC('month', i.invoice_date)
            )
            SELECT
                TO_CHAR(m.month, 'YYYY-MM') AS month,
                COALESCE(mi.invoiced, 0)    AS invoiced_amount,
                COALESCE(mr.collected, 0)   AS collected_amount,
                COALESCE(mi.invoiced, 0) - COALESCE(mr.collected, 0) AS outstanding,
                -- LAG window function: previous month collected
                LAG(COALESCE(mr.collected, 0)) OVER (ORDER BY m.month) AS prev_month_collected,
                -- Month-over-month change
                COALESCE(mr.collected, 0) - LAG(COALESCE(mr.collected, 0)) OVER (ORDER BY m.month) AS mom_change
            FROM months m
            LEFT JOIN monthly_invoiced mi ON mi.month = m.month
            LEFT JOIN monthly_revenue mr ON mr.month = m.month
            ORDER BY m.month
        """;
        return jdbc.queryForList(sql, months);
    }

    // ─────────────────────────────────────────────
    // OCCUPANCY REPORT (by property)
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getOccupancyReport() {
        String sql = """
            SELECT
                p.property_id,
                p.property_name,
                p.city,
                p.property_type,
                COUNT(u.unit_id)                                              AS total_units,
                COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED')        AS occupied_units,
                COUNT(u.unit_id) FILTER (WHERE u.status = 'VACANT')          AS vacant_units,
                COUNT(u.unit_id) FILTER (WHERE u.status = 'MAINTENANCE')     AS maintenance_units,
                ROUND(
                    COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED') * 100.0
                    / NULLIF(COUNT(u.unit_id), 0), 2
                )                                                             AS occupancy_rate,
                COALESCE(SUM(u.monthly_rent) FILTER (WHERE u.status = 'OCCUPIED'), 0) AS potential_monthly_revenue,
                -- RANK by occupancy rate
                RANK() OVER (ORDER BY
                    COUNT(u.unit_id) FILTER (WHERE u.status = 'OCCUPIED') * 100.0
                    / NULLIF(COUNT(u.unit_id), 0) DESC
                )                                                             AS occupancy_rank
            FROM properties p
            LEFT JOIN buildings b ON b.property_id = p.property_id
            LEFT JOIN units u     ON u.building_id = b.building_id
            WHERE p.status = 'ACTIVE'
            GROUP BY p.property_id, p.property_name, p.city, p.property_type
            ORDER BY occupancy_rate DESC NULLS LAST
        """;
        return jdbc.queryForList(sql);
    }

    // ─────────────────────────────────────────────
    // OUTSTANDING RENT REPORT
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getOutstandingRentReport(int page, int size) {
        String sql = """
            SELECT
                t.tenant_id,
                t.full_name                                     AS tenant_name,
                t.email,
                t.phone,
                u.unit_number,
                b.building_name,
                p.property_name,
                i.invoice_id,
                i.invoice_number,
                i.invoice_date,
                i.due_date,
                i.total_amount                                   AS invoice_amount,
                COALESCE(SUM(py.amount) FILTER (WHERE py.status = 'SUCCESS'), 0) AS paid_amount,
                i.total_amount - COALESCE(SUM(py.amount) FILTER (WHERE py.status = 'SUCCESS'), 0) AS outstanding,
                CURRENT_DATE - i.due_date                        AS days_overdue,
                i.status
            FROM invoices i
            JOIN leases l     ON l.lease_id = i.lease_id
            JOIN tenants t    ON t.tenant_id = l.tenant_id
            JOIN units u      ON u.unit_id = l.unit_id
            JOIN buildings b  ON b.building_id = u.building_id
            JOIN properties p ON p.property_id = b.property_id
            LEFT JOIN payments py ON py.invoice_id = i.invoice_id
            WHERE i.status NOT IN ('PAID', 'VOID', 'WAIVED')
            GROUP BY t.tenant_id, t.full_name, t.email, t.phone,
                     u.unit_number, b.building_name, p.property_name,
                     i.invoice_id, i.invoice_number, i.invoice_date, i.due_date, i.total_amount, i.status
            HAVING i.total_amount - COALESCE(SUM(py.amount) FILTER (WHERE py.status = 'SUCCESS'), 0) > 0
            ORDER BY days_overdue DESC, outstanding DESC
            LIMIT ? OFFSET ?
        """;
        return jdbc.queryForList(sql, size, page * size);
    }

    // ─────────────────────────────────────────────
    // PROPERTY PROFITABILITY
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getProfitabilityReport(LocalDate fromDate, LocalDate toDate) {
        String sql = """
            WITH revenue AS (
                SELECT
                    p.property_id,
                    p.property_name,
                    p.city,
                    COALESCE(SUM(py.amount) FILTER (WHERE py.status='SUCCESS'), 0) AS total_revenue
                FROM properties p
                JOIN buildings b  ON b.property_id = p.property_id
                JOIN units u      ON u.building_id = b.building_id
                JOIN leases l     ON l.unit_id = u.unit_id
                JOIN invoices i   ON i.lease_id = l.lease_id
                LEFT JOIN payments py ON py.invoice_id = i.invoice_id
                    AND py.payment_date BETWEEN ? AND ?
                GROUP BY p.property_id, p.property_name, p.city
            ),
            expenses AS (
                SELECT
                    p.property_id,
                    COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('APPROVED','PAID')), 0) AS total_expenses
                FROM properties p
                LEFT JOIN expenses e ON e.property_id = p.property_id
                    AND e.expense_date BETWEEN ? AND ?
                GROUP BY p.property_id
            ),
            maintenance_cost AS (
                SELECT
                    p.property_id,
                    COALESCE(SUM(wo.actual_cost) FILTER (WHERE wo.status = 'COMPLETED'), 0) AS maint_cost
                FROM properties p
                JOIN buildings b  ON b.property_id = p.property_id
                JOIN units u      ON u.building_id = b.building_id
                JOIN maintenance_requests mr ON mr.unit_id = u.unit_id
                LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
                    AND wo.completion_date BETWEEN ? AND ?
                GROUP BY p.property_id
            )
            SELECT
                r.property_id,
                r.property_name,
                r.city,
                r.total_revenue,
                COALESCE(e.total_expenses, 0)                                           AS total_expenses,
                COALESCE(mc.maint_cost, 0)                                              AS maintenance_cost,
                r.total_revenue - COALESCE(e.total_expenses, 0) - COALESCE(mc.maint_cost, 0) AS net_operating_income,
                ROUND(
                    (r.total_revenue - COALESCE(e.total_expenses,0) - COALESCE(mc.maint_cost,0))
                    * 100.0 / NULLIF(r.total_revenue, 0), 2
                )                                                                        AS profit_margin,
                -- RANK by NOI
                RANK() OVER (ORDER BY
                    r.total_revenue - COALESCE(e.total_expenses,0) - COALESCE(mc.maint_cost,0) DESC
                )                                                                        AS profitability_rank
            FROM revenue r
            LEFT JOIN expenses e        ON e.property_id = r.property_id
            LEFT JOIN maintenance_cost mc ON mc.property_id = r.property_id
            ORDER BY net_operating_income DESC
        """;
        return jdbc.queryForList(sql, fromDate, toDate, fromDate, toDate, fromDate, toDate);
    }

    // ─────────────────────────────────────────────
    // MAINTENANCE PERFORMANCE REPORT
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getMaintenancePerformanceReport() {
        String sql = """
            SELECT
                p.property_id,
                p.property_name,
                p.city,
                COUNT(mr.request_id)                                            AS total_requests,
                COUNT(mr.request_id) FILTER (WHERE mr.status IN ('RESOLVED','CLOSED')) AS resolved_count,
                COUNT(mr.request_id) FILTER (WHERE mr.status = 'OPEN')         AS open_count,
                COUNT(mr.request_id) FILTER (WHERE mr.priority = 'URGENT')     AS urgent_count,
                ROUND(AVG(
                    EXTRACT(EPOCH FROM (mr.resolved_at - mr.created_at)) / 3600.0
                ) FILTER (WHERE mr.resolved_at IS NOT NULL), 1)                AS avg_resolution_hours,
                COALESCE(SUM(wo.actual_cost), 0)                               AS total_cost,
                ROUND(
                    COUNT(mr.request_id) FILTER (WHERE mr.status IN ('RESOLVED','CLOSED')) * 100.0
                    / NULLIF(COUNT(mr.request_id), 0), 2
                )                                                               AS resolution_rate,
                -- DENSE_RANK: tie-safe ranking by maintenance cost
                DENSE_RANK() OVER (ORDER BY COALESCE(SUM(wo.actual_cost), 0) DESC) AS cost_rank
            FROM properties p
            JOIN buildings b ON b.property_id = p.property_id
            JOIN units u     ON u.building_id = b.building_id
            LEFT JOIN maintenance_requests mr ON mr.unit_id = u.unit_id
            LEFT JOIN work_orders wo ON wo.request_id = mr.request_id AND wo.status = 'COMPLETED'
            WHERE p.status = 'ACTIVE'
            GROUP BY p.property_id, p.property_name, p.city
            ORDER BY total_requests DESC
        """;
        return jdbc.queryForList(sql);
    }

    // ─────────────────────────────────────────────
    // TOP PROPERTIES BY REVENUE (with window function)
    // ─────────────────────────────────────────────
    public List<Map<String, Object>> getTopPropertiesByRevenue(int limit) {
        String sql = """
            SELECT
                p.property_id,
                p.property_name,
                p.city,
                COALESCE(SUM(py.amount) FILTER (WHERE py.status='SUCCESS'), 0) AS total_revenue,
                COUNT(DISTINCT l.lease_id) FILTER (WHERE l.status='ACTIVE')    AS active_leases,
                RANK() OVER (ORDER BY COALESCE(SUM(py.amount) FILTER (WHERE py.status='SUCCESS'), 0) DESC) AS revenue_rank
            FROM properties p
            LEFT JOIN buildings b  ON b.property_id = p.property_id
            LEFT JOIN units u      ON u.building_id = b.building_id
            LEFT JOIN leases l     ON l.unit_id = u.unit_id
            LEFT JOIN invoices i   ON i.lease_id = l.lease_id
            LEFT JOIN payments py  ON py.invoice_id = i.invoice_id
            WHERE p.status = 'ACTIVE'
              AND (py.payment_date IS NULL OR py.payment_date >= CURRENT_DATE - INTERVAL '12 months')
            GROUP BY p.property_id, p.property_name, p.city
            ORDER BY total_revenue DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, limit);
    }
}
