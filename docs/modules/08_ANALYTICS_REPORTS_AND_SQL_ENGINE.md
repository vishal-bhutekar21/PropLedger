# Module 08: Executive Analytics, Financial Reports & SQL Engine

## 1. Module Overview & Business Context
Enterprise real estate asset managers, regional directors, and REIT investors make multi-million dollar capital allocation decisions based on four standard operational reports:
1. **The Rent Roll**: Unit-by-unit census of market rent, contract rent, lease dates, and physical occupancy.
2. **Aged Accounts Receivable (Aging AR)**: Aging buckets (`Current`, `1–30 Days`, `31–60 Days`, `61–90 Days`, `90+ Days`) identifying delinquent tenant balances and bad debt exposure.
3. **Property Profit & Loss (P&L)**: Gross Potential Rent (GPR), Vacancy Loss, Concessions, Effective Gross Income, Operating Expenses (OpEx), and Net Operating Income (NOI).
4. **Occupancy & Trend Analytics**: Physical vs Economic occupancy trends across rolling 12-month periods.

---

## 2. Technology Stack & Frameworks

| Layer | Framework / Technology | Role in Analytics Engine |
| :--- | :--- | :--- |
| **Backend Core** | Spring Boot 3.3.4 (Java 21) | `ReportController`, `DashboardController`, `ReportService`, read-only transactions (`@Transactional(readOnly = true)`). |
| **SQL Engine** | PostgreSQL 16 Native Features | Common Table Expressions (CTEs), Window Functions, Views, Aggregation Filters. |
| **Frontend Core** | React 19 + TypeScript | `ReportsPage.tsx`, `DashboardPage.tsx`. |
| **Data Visualization**| Recharts (2.15.1) | Dynamic SVG charts: `RevenueChart.tsx` (AreaChart), `OccupancyChart.tsx` (PieChart), `TopPropertiesChart.tsx` (BarChart). |
| **State Management** | TanStack React Query | Configured with `staleTime: 60000` (1 minute cache) to prevent repeated analytical compute overhead. |

---

## 3. API Specifications & Data Contracts

### 3.1. Executive Endpoints (`/api/reports` and `/api/dashboard`)
- `GET /api/dashboard/stats`: Returns real-time portfolio KPI counters.
- `GET /api/dashboard/revenue-trend`: Returns 12-month revenue vs expense time-series data.
- `GET /api/reports/rent-roll?propertyId=1`: Generates the complete legal rent roll breakdown.
- `GET /api/reports/aging-ar?asOfDate=2026-09-12`: Generates aged delinquency buckets.
- `GET /api/reports/property-pnl?startDate=2026-01-01&endDate=2026-12-31`: Generates income and expense statement.

---

## 4. Advanced SQL Techniques in Action

### 4.1. Aged Receivables (Aging AR) with Conditional Aggregation
```sql
SELECT 
    p.id AS property_id,
    p.name AS property_name,
    t.id AS tenant_id,
    t.first_name || ' ' || t.last_name AS tenant_name,
    u.unit_number,
    SUM(i.balance_due) AS total_outstanding,
    -- Current (Not yet due)
    SUM(i.balance_due) FILTER (WHERE i.due_date >= CURRENT_DATE) AS current_balance,
    -- 1 to 30 Days Past Due
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 1 AND 30) AS past_due_1_30,
    -- 31 to 60 Days Past Due
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 31 AND 60) AS past_due_31_60,
    -- 61 to 90 Days Past Due
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date BETWEEN 61 AND 90) AS past_due_61_90,
    -- Over 90 Days Past Due
    SUM(i.balance_due) FILTER (WHERE CURRENT_DATE - i.due_date > 90) AS past_due_90_plus
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN leases l ON l.unit_id = u.id
JOIN tenants t ON t.current_lease_id = l.id
JOIN invoices i ON i.lease_id = l.id
WHERE i.balance_due > 0
GROUP BY p.id, p.name, t.id, t.first_name, t.last_name, u.unit_number
ORDER BY total_outstanding DESC;
```

---

### 4.2. Window Functions: Rent Variance & Cumulative Revenue
Using `OVER (...)` to compute unit rent ranking and cumulative property revenue:

```sql
SELECT 
    p.name AS property_name,
    u.unit_number,
    l.rent_amount,
    -- Average rent for this unit's bedroom count
    AVG(l.rent_amount) OVER (PARTITION BY u.bedrooms) AS avg_rent_for_bed_type,
    -- Rent variance from bedroom category average
    ROUND(l.rent_amount - AVG(l.rent_amount) OVER (PARTITION BY u.bedrooms), 2) AS rent_variance,
    -- Dense rank of rent within property
    DENSE_RANK() OVER (PARTITION BY p.id ORDER BY l.rent_amount DESC) AS rent_rank_in_property,
    -- Running cumulative contract revenue
    SUM(l.rent_amount) OVER (
        PARTITION BY p.id 
        ORDER BY l.rent_amount DESC 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_property_revenue
FROM properties p
JOIN units u ON u.property_id = p.id
JOIN leases l ON l.unit_id = u.id AND l.status = 'ACTIVE';
```

---

### 4.3. Native Database Views Catalog
PropLedger registers standard enterprise reporting views in `V10__create_views.sql`:
1. `v_property_occupancy`: Real-time units, occupied count, vacant count, occupancy percentage.
2. `v_rent_roll`: Master census joining properties, units, active tenants, and contract rents.
3. `v_aging_receivables`: Tenant delinquency buckets computed on-the-fly.
4. `v_property_pnl`: Financial statement synthesizing revenues and OpEx categories.

---

## 5. Performance Engineering for Executive Dashboards

### The Problem:
If 50 regional executives load the dashboard on Monday morning at 9:00 AM, recalculating aggregate sums over millions of historical invoice and payment rows exhausts database CPU.

### PropLedger Architectural Mitigations:
1. **`@Transactional(readOnly = true)`**: Informs Hibernate and the JDBC driver that no dirty checking or write locks are required, routing the transaction directly to read replicas.
2. **Materialized Views with Concurrent Refresh**:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_property_financials;
   ```
3. **Frontend Cache Decoupling**: React Query caches dashboard metrics for 60 seconds. Navigating between pages reuses cached data rather than executing fresh database scans.

---

## 6. Interview Q&A (Technical & System Design)

### Q1: What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()` in SQL?
> **Answer**:
> - `ROW_NUMBER()` assigns a strictly sequential integer ($1, 2, 3, 4$) without ties.
> - `RANK()` assigns identical ranks to tied rows, but skips subsequent rank numbers (e.g., if two units tie for \$2,000 at rank 2: $1, 2, 2, 4$).
> - `DENSE_RANK()` assigns identical ranks to tied rows without gaps (e.g. $1, 2, 2, 3$). In PropLedger rent roll analysis, `DENSE_RANK()` is preferred so that tiered rent groupings remain continuous.

### Q2: How do you design an analytical reporting pipeline that doesn't impact OLTP tenant checkout latency?
> **Answer**: We use **Read-Write Splitting (CQRS Lite)**:
> 1. Write transactions (`POST /api/payments`) execute against the primary PostgreSQL writer instance.
> 2. Analytical reporting queries (`GET /api/reports/*`) are directed to asynchronous PostgreSQL Read Replicas using Spring's dynamic `RoutingDataSource`.
> 3. This physically isolates expensive analytical `HashAgg` and `Bitmap Heap Scan` operations from tenant checkout transactions.
