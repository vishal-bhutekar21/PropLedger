-- ============================================================
-- V7: Expenses and Vendors
-- Purpose: Operating cost tracking at property level
-- ============================================================

-- ─────────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────────
CREATE TABLE vendors (
    vendor_id        BIGSERIAL    PRIMARY KEY,
    company_name     VARCHAR(255) NOT NULL,
    contact_person   VARCHAR(255),
    email            VARCHAR(255),
    phone            VARCHAR(30),
    alternate_phone  VARCHAR(30),
    service_type     VARCHAR(100) NOT NULL,
    address          TEXT,
    tax_id           VARCHAR(100),
    rating           SMALLINT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_vendor_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLACKLISTED')),
    CONSTRAINT chk_vendor_rating CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
);

-- ─────────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────────
CREATE TABLE expenses (
    expense_id    BIGSERIAL      PRIMARY KEY,
    property_id   BIGINT         NOT NULL REFERENCES properties(property_id),
    vendor_id     BIGINT         REFERENCES vendors(vendor_id),
    created_by    BIGINT         REFERENCES users(user_id),
    category      VARCHAR(50)    NOT NULL,
    description   TEXT           NOT NULL,
    amount        DECIMAL(12,2)  NOT NULL,
    expense_date  DATE           NOT NULL,
    reference_number VARCHAR(100),
    status        VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    approved_by   BIGINT         REFERENCES users(user_id),
    approved_at   TIMESTAMPTZ,
    notes         TEXT,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_expense_category CHECK (
        category IN ('MAINTENANCE', 'UTILITIES', 'INSURANCE', 'TAX', 'SECURITY',
                     'CLEANING', 'LANDSCAPING', 'MANAGEMENT_FEE', 'LEGAL', 'OTHER')
    ),
    CONSTRAINT chk_expense_status CHECK (
        status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED')
    ),
    CONSTRAINT chk_expense_amount CHECK (amount > 0)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_vendors_status       ON vendors(status);
CREATE INDEX idx_vendors_service_type ON vendors(service_type);
CREATE INDEX idx_expenses_property_id ON expenses(property_id);
CREATE INDEX idx_expenses_vendor_id   ON expenses(vendor_id);
CREATE INDEX idx_expenses_category    ON expenses(category);
CREATE INDEX idx_expenses_date        ON expenses(expense_date);
CREATE INDEX idx_expenses_prop_date   ON expenses(property_id, expense_date);  -- composite for profitability report
