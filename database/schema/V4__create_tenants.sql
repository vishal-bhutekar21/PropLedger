-- ============================================================
-- V4: Tenants and Lease Applications
-- Purpose: Tenant profiles and pre-lease applications
-- ============================================================

-- ─────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────
CREATE TABLE tenants (
    tenant_id     BIGSERIAL    PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(30)  NOT NULL,
    alternate_phone VARCHAR(30),
    date_of_birth DATE,
    national_id   VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city          VARCHAR(100),
    state         VARCHAR(100),
    zip_code      VARCHAR(20),
    country       VARCHAR(100) NOT NULL DEFAULT 'India',
    emergency_contact_name   VARCHAR(255),
    emergency_contact_phone  VARCHAR(30),
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_tenant_status  CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLACKLISTED')),
    CONSTRAINT chk_tenant_email   CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT chk_tenant_dob     CHECK (date_of_birth IS NULL OR date_of_birth < CURRENT_DATE)
);

-- ─────────────────────────────────────────────
-- LEASE APPLICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE lease_applications (
    application_id   BIGSERIAL    PRIMARY KEY,
    unit_id          BIGINT       NOT NULL REFERENCES units(unit_id),
    tenant_id        BIGINT       NOT NULL REFERENCES tenants(tenant_id),
    applied_by       BIGINT       REFERENCES users(user_id),
    desired_start_date DATE       NOT NULL,
    desired_end_date   DATE       NOT NULL,
    proposed_rent    DECIMAL(12,2),
    status           VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    notes            TEXT,
    applied_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reviewed_at      TIMESTAMPTZ,
    reviewed_by      BIGINT       REFERENCES users(user_id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_app_status CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'CONVERTED')
    ),
    CONSTRAINT chk_app_dates CHECK (desired_end_date > desired_start_date)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_tenants_email        ON tenants(email);
CREATE INDEX idx_tenants_status       ON tenants(status);
CREATE INDEX idx_tenants_name         ON tenants(full_name);
CREATE INDEX idx_lease_apps_unit      ON lease_applications(unit_id);
CREATE INDEX idx_lease_apps_tenant    ON lease_applications(tenant_id);
CREATE INDEX idx_lease_apps_status    ON lease_applications(status);
