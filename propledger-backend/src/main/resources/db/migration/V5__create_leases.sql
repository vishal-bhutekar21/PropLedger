-- ============================================================
-- V5: Leases
-- Purpose: Core lease contract connecting tenant to unit.
--
-- KEY DESIGN DECISION:
-- We prevent overlapping active leases using a PostgreSQL
-- EXCLUSION CONSTRAINT on (unit_id, daterange(start_date, end_date))
-- filtered to non-terminated statuses.
-- This is enforced at the DATABASE level, not just application code.
--
-- Additionally, lease creation uses SELECT FOR UPDATE on the unit row
-- to prevent a race condition where two concurrent transactions
-- attempt to create a lease for the same unit simultaneously.
-- See docs/CONCURRENCY.md for full explanation.
-- ============================================================

-- Requires btree_gist extension for exclusion constraints on non-range columns
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE leases (
    lease_id          BIGSERIAL      PRIMARY KEY,
    unit_id           BIGINT         NOT NULL REFERENCES units(unit_id),
    tenant_id         BIGINT         NOT NULL REFERENCES tenants(tenant_id),
    application_id    BIGINT         REFERENCES lease_applications(application_id),
    created_by        BIGINT         REFERENCES users(user_id),

    -- Financial terms (stored on lease, NOT on tenant)
    monthly_rent      DECIMAL(12,2)  NOT NULL,
    security_deposit  DECIMAL(12,2)  NOT NULL DEFAULT 0,
    payment_due_day   SMALLINT       NOT NULL DEFAULT 1,

    -- Lease period
    start_date        DATE           NOT NULL,
    end_date          DATE           NOT NULL,

    -- Status lifecycle: PENDING → ACTIVE → EXPIRED | TERMINATED
    status            VARCHAR(30)    NOT NULL DEFAULT 'PENDING',

    -- Termination tracking
    terminated_at     TIMESTAMPTZ,
    terminated_by     BIGINT         REFERENCES users(user_id),
    termination_reason TEXT,

    -- Renewal tracking
    is_renewal        BOOLEAN        NOT NULL DEFAULT FALSE,
    parent_lease_id   BIGINT         REFERENCES leases(lease_id),

    notes             TEXT,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_lease_status CHECK (
        status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED')
    ),
    CONSTRAINT chk_lease_dates CHECK (end_date > start_date),
    CONSTRAINT chk_lease_rent CHECK (monthly_rent > 0),
    CONSTRAINT chk_lease_deposit CHECK (security_deposit >= 0),
    CONSTRAINT chk_payment_due_day CHECK (payment_due_day BETWEEN 1 AND 28),

    -- ─────────────────────────────────────────────────────────
    -- EXCLUSION CONSTRAINT: prevents overlapping active leases
    -- on the same unit. Uses btree_gist operator class so we
    -- can combine a scalar column (unit_id) with a range type.
    --
    -- Only leases with status IN ('PENDING','ACTIVE') participate.
    -- EXPIRED and TERMINATED leases are excluded — a terminated
    -- lease must NOT block re-leasing the unit.
    -- ─────────────────────────────────────────────────────────
    CONSTRAINT excl_no_overlapping_active_leases
        EXCLUDE USING GIST (
            unit_id WITH =,
            daterange(start_date, end_date, '[]') WITH &&
        )
        WHERE (status IN ('PENDING', 'ACTIVE'))
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_leases_unit_id       ON leases(unit_id);
CREATE INDEX idx_leases_tenant_id     ON leases(tenant_id);
CREATE INDEX idx_leases_status        ON leases(status);
CREATE INDEX idx_leases_start_date    ON leases(start_date);
CREATE INDEX idx_leases_end_date      ON leases(end_date);
CREATE INDEX idx_leases_end_date_status ON leases(end_date, status)
    WHERE status = 'ACTIVE';  -- partial index: only active leases matter for expiration queries
