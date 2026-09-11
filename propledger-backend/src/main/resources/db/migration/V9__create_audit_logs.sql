-- ============================================================
-- V9: Audit Logs
-- Purpose: Enterprise-grade change tracking for all critical entities.
-- Every important state change is recorded here with before/after values.
-- ============================================================

CREATE TABLE audit_logs (
    log_id       BIGSERIAL    PRIMARY KEY,
    user_id      BIGINT       REFERENCES users(user_id),
    username     VARCHAR(100),                         -- denormalized for historical accuracy
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    BIGINT       NOT NULL,
    old_value    JSONB,
    new_value    JSONB,
    ip_address   VARCHAR(50),
    user_agent   TEXT,
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_audit_action CHECK (
        action IN (
            'CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED',
            'LOGIN', 'LOGOUT', 'PERMISSION_CHANGED',
            'LEASE_CREATED', 'LEASE_ACTIVATED', 'LEASE_TERMINATED', 'LEASE_RENEWED', 'LEASE_EXPIRED',
            'PAYMENT_CREATED', 'PAYMENT_UPDATED', 'PAYMENT_REFUNDED',
            'INVOICE_CREATED', 'INVOICE_VOIDED', 'INVOICE_WAIVED',
            'UNIT_STATUS_CHANGED',
            'MAINTENANCE_STATUS_CHANGED',
            'EXPENSE_APPROVED', 'EXPENSE_REJECTED',
            'WORK_ORDER_CREATED', 'WORK_ORDER_COMPLETED'
        )
    )
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_audit_user_id     ON audit_logs(user_id);
CREATE INDEX idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action      ON audit_logs(action);
CREATE INDEX idx_audit_created_at  ON audit_logs(created_at DESC);  -- most-recent-first queries

-- GIN index on JSONB columns for fast JSON field searches
CREATE INDEX idx_audit_old_value   ON audit_logs USING GIN (old_value);
CREATE INDEX idx_audit_new_value   ON audit_logs USING GIN (new_value);
