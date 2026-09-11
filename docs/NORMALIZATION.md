# PropLedger — Database Normalization & Form Analysis

## 1. Normalization Theory & Business Motivations

In real estate enterprise software (e.g., Yardi Voyager, RealPage), legacy systems frequently suffer from **data anomalies** caused by denormalized "flat-file" spreadsheets or premature optimization:
- **Insertion Anomaly**: In an unnormalized sheet, you cannot record a newly constructed Unit without already having an assigned Tenant and Lease.
- **Update Anomaly**: If a Property Manager updates the property address or owner contact, modifying it in 400 separate unit rows risks inconsistent data if a single row fails.
- **Deletion Anomaly**: If a single tenant moves out and their row is deleted in a flat schema, the historical record of the property's square footage and amenities is permanently lost.

**PropLedger** is normalized to **Third Normal Form (3NF)** and **Boyce-Codd Normal Form (BCNF)** across all core OLTP transaction boundaries, while practicing **controlled, trigger-maintained denormalization** solely for high-frequency financial aggregates.

---

## 2. Unnormalized Form (UNF) vs. Normalized Architecture

### The Unnormalized "Spreadsheet" Anti-Pattern (UNF)
Consider how a typical spreadsheet tracks rental operations:

| PropertyName | UnitNo | TenantName | TenantPhone | LeaseStart | LeaseEnd | MonthlyRent | InvoiceNo | InvAmount | PaidAmount |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Grandview Heights | 101 | John Doe, Jane Doe | 555-0192 | 2026-01-01 | 2026-12-31 | $2,000 | INV-101 | $2,000 | $2,000 |
| Grandview Heights | 102 | Alice Smith | 555-0144 | 2026-02-01 | 2027-01-31 | $2,400 | INV-102 | $2,400 | $1,200 |

### Defects in UNF:
1. Multi-valued attributes (`TenantName` contains comma-separated values).
2. Redundant property details repeated on every line.
3. Partial dependencies (rent belongs to lease, phone belongs to tenant, square footage belongs to unit).
4. Inability to record future vacant units.

---

## 3. Step-by-Step Normalization Proofs

### 3.1. First Normal Form (1NF)
**Definition**: A relation is in 1NF if and only if:
1. Every attribute contains only atomic (indivisible) values.
2. There are no repeating groups or arrays.
3. Each record is uniquely identifiable by a Primary Key.

#### Transformation to 1NF in PropLedger:
- **Atomicity Enforcement**:
  - Multi-tenant occupancies are separated out of `leases` into a distinct junction table `lease_tenants (lease_id, tenant_id)`.
  - Names are separated into `first_name`, `last_name`.
  - Addresses are decomposed into `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`.
- **Primary Key Assignment**:
  - Every table is assigned an atomic surrogate primary key `id BIGINT GENERATED ALWAYS AS IDENTITY`.

### 3.2. Second Normal Form (2NF)
**Definition**: A relation is in 2NF if:
1. It is in 1NF.
2. Every non-prime attribute is **fully functionally dependent** on the *entire* candidate key (no partial key dependencies).

#### Proof in PropLedger:
Consider the relationship between Leases, Invoices, and Line Items:
- If we stored line items in an invoice table with composite key `{invoice_id, item_seq}`, having `invoice_due_date` inside that table would violate 2NF because `invoice_due_date` depends only on `invoice_id`, not on `{item_seq}`.
- **Decomposition**:
  - Entity 1: `invoices (id, lease_id, invoice_number, invoice_date, due_date, total_amount, balance_due)`
    - Candidate Key: `{id}`, Alternate Key: `{invoice_number}`
    - All attributes depend on the entire key `{id}`.
  - Entity 2: `invoice_items (id, invoice_id, charge_type, amount, description)`
    - Candidate Key: `{id}`
    - Foreign Key: `invoice_id` referencing `invoices(id)`.
    - Every attribute depends strictly on `{id}`.
  - Therefore, all tables in PropLedger satisfy **2NF**.

### 3.3. Third Normal Form (3NF)
**Definition**: A relation is in 3NF if:
1. It is in 2NF.
2. There is **no transitive dependency** ($X \to Y$ and $Y \to Z$ where $Z$ is a non-prime attribute and $Y$ is not a candidate key). Non-prime attributes must depend *only* on the candidate key ("nothing but the key, so help me Codd").

#### Real Estate Example Resolved in PropLedger:
- **Transitive Violation in Units Table**:
  - Suppose `units` contained: `(unit_id, unit_number, property_id, property_name, owner_id, owner_name)`.
  - Functional Dependencies:
    - $unit\_id \to property\_id$
    - $property\_id \to owner\_id$
    - $owner\_id \to owner\_name$
  - Here, `owner_name` is transitively dependent on `unit_id` through `property_id` and `owner_id`. If the owner changes their corporate legal name, updating it across 500 units causes an update anomaly.
- **PropLedger 3NF Decomposition**:
  1. `owners (id, company_name, contact_name, email, phone)`
  2. `properties (id, owner_id, property_code, name, address_line1, ...)`
  3. `units (id, property_id, building_id, unit_number, unit_type, market_rent, ...)`
  - Each non-key attribute depends *directly* on the primary key of its relation. No transitive dependencies exist.

### 3.4. Boyce-Codd Normal Form (BCNF)
**Definition**: A relation is in BCNF if for every non-trivial functional dependency $X \to Y$, $X$ is a **superkey**.

#### Verification in PropLedger:
- In `lease_tenants (lease_id, tenant_id, is_primary_tenant, guarantor)`:
  - Candidate Key: `{lease_id, tenant_id}`
  - Non-prime attributes `{is_primary_tenant, guarantor}` depend on `{lease_id, tenant_id}`.
  - The left-hand side of every dependency is a superkey.
- In `units (id, property_id, building_id, unit_number, ...)`:
  - Candidate Keys: `{id}` and `{property_id, building_id, unit_number}`.
  - All functional dependencies have a candidate key on the left-hand side.
  - Therefore, PropLedger satisfies **BCNF**.

---

## 4. Controlled Intentional Denormalizations

In enterprise financial applications handling millions of ledger rows, pure academic normalization can introduce prohibitive query latency on high-frequency transactions. PropLedger introduces **three controlled denormalizations**, each backed by automated consistency mechanics.

| Denormalized Attribute | Location | Pure Normalized Calculation | Optimization Rationale | Integrity Enforcement Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **`invoices.balance_due`** | `invoices` table | `total_amount - COALESCE(SUM(pa.allocated_amount), 0)` | High-frequency queries (e.g. Tenant Checkout, Dashboard AR Aging) need immediate outstanding balances without doing an expensive `JOIN payment_allocations` across 50,000 records. | PostgreSQL Trigger `trg_update_invoice_balance_on_allocation` recalculates `balance_due` atomically whenever a `payment_allocation` is inserted, updated, or deleted. |
| **`units.status`** | `units` table | Inferred dynamically from `leases` date ranges and `maintenance_requests` | Property search and unit listing grids query `WHERE status = 'AVAILABLE'` thousands of times per minute. Running subqueries against historical lease dates on every page view degrades response time. | Trigger `trg_sync_unit_status_on_lease_change` updates `units.status` to `OCCUPIED` upon lease activation, and back to `AVAILABLE` or `MAINTENANCE` upon termination. |
| **`invoices.status`** | `invoices` table | Derived from `balance_due = 0` (`PAID`), `due_date < CURRENT_DATE` (`OVERDUE`), etc. | Enables indexed queries: `SELECT * FROM invoices WHERE status = 'OVERDUE'`. | Maintained by settlement trigger and scheduled nightly batch status evaluation. |

---

## 5. Functional Dependency (FD) Catalog

| Table | Candidate Keys | Functional Dependencies | Normal Form Achieved |
| :--- | :--- | :--- | :--- |
| `owners` | `{id}`, `{tax_id}` | $id \to \{company\_name, contact\_name, email, phone\}$ | BCNF |
| `properties` | `{id}`, `{property_code}` | $id \to \{owner\_id, property\_code, name, address, ...\}$ | BCNF |
| `buildings` | `{id}`, `{property_id, building_code}` | $id \to \{property\_id, building\_name, building\_code\}$ | BCNF |
| `units` | `{id}`, `{property_id, building_id, unit_number}` | $id \to \{property\_id, unit\_number, market\_rent, bedrooms, bathrooms\}$ | BCNF |
| `tenants` | `{id}`, `{email}` | $id \to \{first\_name, last\_name, email, phone, credit\_score\}$ | BCNF |
| `leases` | `{id}`, `{lease_number}` | $id \to \{unit\_id, start\_date, end\_date, rent\_amount, deposit\_amount, status\}$ | BCNF |
| `invoices` | `{id}`, `{invoice_number}` | $id \to \{lease\_id, invoice\_date, due\_date, total\_amount\}$ | 3NF (due to cached `balance_due`) |
| `payment_allocations` | `{id}`, `{payment_id, invoice_id}` | $id \to \{payment\_id, invoice\_id, allocated\_amount, allocated\_at\}$ | BCNF |

---

## 6. Summary for Enterprise Technical Interviews

When asked in an interview: *"How do you decide between 3NF and denormalization in a financial system?"*

> **PropLedger Answer**: 
> "We design the relational core strictly to **3NF/BCNF** to prevent update and deletion anomalies, ensuring that relationships between properties, units, leases, and transactions are cleanly separated. However, in enterprise real estate accounting, calculating an invoice balance or property occupancy from raw event tables on every read creates extreme I/O overhead. We selectively denormalize derived aggregates like `invoices.balance_due` and `units.status`, but we **never** allow application code to manually manage that state. Instead, we enforce data integrity at the database engine layer using ACID-compliant PostgreSQL triggers and check constraints (`CHECK (balance_due >= 0)`). This gives us $O(1)$ read performance with $O(1)$ transaction-safe write integrity."
