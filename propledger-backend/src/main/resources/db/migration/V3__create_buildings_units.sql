-- ============================================================
-- V3: Buildings and Units
-- Purpose: Physical hierarchy below a property
-- ============================================================

-- ─────────────────────────────────────────────
-- BUILDINGS
-- ─────────────────────────────────────────────
CREATE TABLE buildings (
    building_id    BIGSERIAL    PRIMARY KEY,
    property_id    BIGINT       NOT NULL REFERENCES properties(property_id) ON DELETE RESTRICT,
    building_name  VARCHAR(255) NOT NULL,
    building_code  VARCHAR(50),
    floors         SMALLINT     NOT NULL DEFAULT 1,
    year_built     SMALLINT,
    description    TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_building_floors CHECK (floors >= 1 AND floors <= 200),
    CONSTRAINT chk_building_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_RENOVATION')),
    CONSTRAINT uq_building_code_per_property UNIQUE (property_id, building_code)
);

-- ─────────────────────────────────────────────
-- UNITS
-- ─────────────────────────────────────────────
CREATE TABLE units (
    unit_id          BIGSERIAL      PRIMARY KEY,
    building_id      BIGINT         NOT NULL REFERENCES buildings(building_id) ON DELETE RESTRICT,
    unit_number      VARCHAR(50)    NOT NULL,
    unit_type        VARCHAR(50)    NOT NULL,
    floor_number     SMALLINT,
    bedrooms         SMALLINT       NOT NULL DEFAULT 0,
    bathrooms        SMALLINT       NOT NULL DEFAULT 1,
    area_sqft        DECIMAL(10,2),
    monthly_rent     DECIMAL(12,2)  NOT NULL,
    security_deposit DECIMAL(12,2)  NOT NULL DEFAULT 0,
    status           VARCHAR(30)    NOT NULL DEFAULT 'VACANT',
    description      TEXT,
    amenities        TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_unit_number_per_building UNIQUE (building_id, unit_number),
    CONSTRAINT chk_unit_type CHECK (
        unit_type IN ('STUDIO', '1BHK', '2BHK', '3BHK', '4BHK', 'PENTHOUSE', 'COMMERCIAL_OFFICE', 'RETAIL', 'WAREHOUSE', 'OTHER')
    ),
    CONSTRAINT chk_unit_status CHECK (
        status IN ('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'INACTIVE')
    ),
    CONSTRAINT chk_unit_rent CHECK (monthly_rent >= 0),
    CONSTRAINT chk_unit_deposit CHECK (security_deposit >= 0),
    CONSTRAINT chk_unit_bedrooms CHECK (bedrooms >= 0),
    CONSTRAINT chk_unit_bathrooms CHECK (bathrooms >= 0),
    CONSTRAINT chk_unit_area CHECK (area_sqft IS NULL OR area_sqft > 0)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_buildings_property_id ON buildings(property_id);
CREATE INDEX idx_buildings_status      ON buildings(status);
CREATE INDEX idx_units_building_id     ON units(building_id);
CREATE INDEX idx_units_status          ON units(status);
CREATE INDEX idx_units_unit_type       ON units(unit_type);
CREATE INDEX idx_units_monthly_rent    ON units(monthly_rent);
