-- ============================================================
-- V6: Financial Tables — Invoices, Invoice Items, Payments
--
-- DESIGN DECISIONS:
-- 1. Invoice status is NOT stored as a pure derived value.
--    We store it explicitly for queryability, but it is always
--    recalculated and updated inside the payment transaction.
--
-- 2. outstanding_amount is NEVER stored. It is always derived:
--      invoice.total_amount - SUM(payments.amount WHERE status='SUCCESS')
--    A PostgreSQL VIEW (tenant_balance_view) provides this reliably.
--
-- 3. invoice_items normalizes line items. A single monthly invoice
--    may contain: Base Rent, Late Fee, Utility, Parking, etc.
--    Storing these as separate rows enables clean reporting.
-- ============================================================

-- ─────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────
CREATE TABLE invoices (
    invoice_id      BIGSERIAL      PRIMARY KEY,
    lease_id        BIGINT         NOT NULL REFERENCES leases(lease_id),
    invoice_number  VARCHAR(50)    NOT NULL UNIQUE,
    invoice_date    DATE           NOT NULL,
    due_date        DATE           NOT NULL,
    billing_period_start DATE,
    billing_period_end   DATE,
    subtotal        DECIMAL(12,2)  NOT NULL DEFAULT 0,
    tax             DECIMAL(12,2)  NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2)  NOT NULL DEFAULT 0,
    status          VARCHAR(30)    NOT NULL DEFAULT 'UNPAID',
    notes           TEXT,
    created_by      BIGINT         REFERENCES users(user_id),
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_invoice_status CHECK (
        status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID', 'WAIVED')
    ),
    CONSTRAINT chk_invoice_amounts CHECK (
        subtotal >= 0 AND tax >= 0 AND total_amount >= 0
    ),
    CONSTRAINT chk_invoice_total CHECK (
        total_amount = subtotal + tax
    ),
    CONSTRAINT chk_invoice_dates CHECK (due_date >= invoice_date)
);

-- ─────────────────────────────────────────────
-- INVOICE ITEMS (Normalized line items)
-- ─────────────────────────────────────────────
CREATE TABLE invoice_items (
    item_id         BIGSERIAL      PRIMARY KEY,
    invoice_id      BIGINT         NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description     VARCHAR(255)   NOT NULL,
    item_type       VARCHAR(50)    NOT NULL DEFAULT 'RENT',
    quantity        DECIMAL(10,2)  NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2)  NOT NULL,
    amount          DECIMAL(12,2)  NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_item_type CHECK (
        item_type IN ('RENT', 'LATE_FEE', 'UTILITY', 'PARKING', 'PET_FEE', 'MAINTENANCE_CHARGE', 'SECURITY_DEPOSIT', 'OTHER')
    ),
    CONSTRAINT chk_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_item_price CHECK (unit_price >= 0),
    CONSTRAINT chk_item_amount CHECK (amount >= 0)
);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE payments (
    payment_id           BIGSERIAL      PRIMARY KEY,
    invoice_id           BIGINT         NOT NULL REFERENCES invoices(invoice_id),
    amount               DECIMAL(12,2)  NOT NULL,
    payment_date         DATE           NOT NULL,
    payment_method       VARCHAR(30)    NOT NULL,
    transaction_reference VARCHAR(255),
    status               VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    failure_reason       TEXT,
    recorded_by          BIGINT         REFERENCES users(user_id),
    notes                TEXT,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_payment_method CHECK (
        payment_method IN ('CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE', 'OTHER')
    ),
    CONSTRAINT chk_payment_status CHECK (
        status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED')
    ),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_invoices_lease_id     ON invoices(lease_id);
CREATE INDEX idx_invoices_status       ON invoices(status);
CREATE INDEX idx_invoices_due_date     ON invoices(due_date);
CREATE INDEX idx_invoices_status_due   ON invoices(status, due_date);   -- composite: overdue detection
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice_id   ON payments(invoice_id);
CREATE INDEX idx_payments_status       ON payments(status);
CREATE INDEX idx_payments_date         ON payments(payment_date);
