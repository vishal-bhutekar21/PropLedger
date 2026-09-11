-- ============================================================
-- V8: Maintenance Requests and Work Orders
-- ============================================================

-- ─────────────────────────────────────────────
-- MAINTENANCE REQUESTS
-- ─────────────────────────────────────────────
CREATE TABLE maintenance_requests (
    request_id    BIGSERIAL    PRIMARY KEY,
    unit_id       BIGINT       NOT NULL REFERENCES units(unit_id),
    tenant_id     BIGINT       REFERENCES tenants(tenant_id),
    reported_by   BIGINT       REFERENCES users(user_id),
    title         VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL,
    category      VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status        VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
    estimated_cost DECIMAL(12,2),
    actual_cost   DECIMAL(12,2),
    scheduled_date DATE,
    resolved_at   TIMESTAMPTZ,
    resolved_by   BIGINT       REFERENCES users(user_id),
    resolution_notes TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_maint_category CHECK (
        category IN ('PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL',
                     'PEST_CONTROL', 'CLEANING', 'LANDSCAPING', 'GENERAL', 'OTHER')
    ),
    CONSTRAINT chk_maint_priority CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    ),
    CONSTRAINT chk_maint_status CHECK (
        status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED')
    ),
    CONSTRAINT chk_maint_cost CHECK (
        actual_cost IS NULL OR actual_cost >= 0
    )
);

-- ─────────────────────────────────────────────
-- WORK ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE work_orders (
    work_order_id  BIGSERIAL      PRIMARY KEY,
    request_id     BIGINT         NOT NULL REFERENCES maintenance_requests(request_id),
    vendor_id      BIGINT         REFERENCES vendors(vendor_id),
    assigned_by    BIGINT         REFERENCES users(user_id),
    work_order_number VARCHAR(50) NOT NULL UNIQUE,
    description    TEXT,
    scheduled_date DATE,
    completion_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost    DECIMAL(12,2),
    status         VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
    vendor_notes   TEXT,
    internal_notes TEXT,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_wo_status CHECK (
        status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD')
    ),
    CONSTRAINT chk_wo_cost CHECK (
        actual_cost IS NULL OR actual_cost >= 0
    ),
    CONSTRAINT chk_wo_dates CHECK (
        completion_date IS NULL OR scheduled_date IS NULL OR completion_date >= scheduled_date
    )
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_maint_unit_id    ON maintenance_requests(unit_id);
CREATE INDEX idx_maint_tenant_id  ON maintenance_requests(tenant_id);
CREATE INDEX idx_maint_status     ON maintenance_requests(status);
CREATE INDEX idx_maint_priority   ON maintenance_requests(priority);
CREATE INDEX idx_maint_created    ON maintenance_requests(created_at);
CREATE INDEX idx_wo_request_id    ON work_orders(request_id);
CREATE INDEX idx_wo_vendor_id     ON work_orders(vendor_id);
CREATE INDEX idx_wo_status        ON work_orders(status);
