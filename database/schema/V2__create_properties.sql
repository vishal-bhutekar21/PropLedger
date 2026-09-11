-- ============================================================
-- V2: Owners and Properties
-- Purpose: Top-level property ownership and property catalog
-- ============================================================

-- ─────────────────────────────────────────────
-- OWNERS
-- ─────────────────────────────────────────────
CREATE TABLE owners (
    owner_id     BIGSERIAL    PRIMARY KEY,
    full_name    VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(30),
    company_name VARCHAR(255),
    address      TEXT,
    tax_id       VARCHAR(100),
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_owner_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- ─────────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────────
CREATE TABLE properties (
    property_id    BIGSERIAL    PRIMARY KEY,
    owner_id       BIGINT       NOT NULL REFERENCES owners(owner_id),
    property_name  VARCHAR(255) NOT NULL,
    property_type  VARCHAR(50)  NOT NULL,
    address_line1  VARCHAR(255) NOT NULL,
    address_line2  VARCHAR(255),
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    zip_code       VARCHAR(20)  NOT NULL,
    country        VARCHAR(100) NOT NULL DEFAULT 'India',
    description    TEXT,
    total_area_sqft DECIMAL(12,2),
    year_built     SMALLINT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_property_type CHECK (
        property_type IN ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL')
    ),
    CONSTRAINT chk_property_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_RENOVATION')),
    CONSTRAINT chk_year_built CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW())::SMALLINT + 5)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city     ON properties(city);
CREATE INDEX idx_properties_status   ON properties(status);
CREATE INDEX idx_properties_type     ON properties(property_type);
