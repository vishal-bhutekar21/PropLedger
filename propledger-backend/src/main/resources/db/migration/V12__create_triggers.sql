-- ============================================================
-- V12: Triggers
-- Purpose: Database-level automation for critical business rules.
--
-- Triggers implemented:
-- 1. trg_updated_at        — auto-update updated_at on all key tables
-- 2. trg_unit_status_lease — update unit status when lease activates/terminates
-- 3. trg_invoice_status    — recalculate invoice status after each payment
-- 4. trg_audit_lease       — write audit log on lease status change
-- 5. trg_audit_payment     — write audit log on payment insert
-- ============================================================

-- ─────────────────────────────────────────────
-- TRIGGER FUNCTION: auto-set updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- Apply to all relevant tables
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_leases_updated_at
    BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_maintenance_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ─────────────────────────────────────────────
-- TRIGGER 2: Sync unit status with lease lifecycle
--
-- WHY AT DB LEVEL:
-- Unit availability is a critical invariant. If a lease is
-- activated, the unit MUST become OCCUPIED — regardless of
-- whether the application layer remembers to update it.
-- The trigger is the safety net.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_unit_status_on_lease_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Lease becoming ACTIVE → unit becomes OCCUPIED
    IF NEW.status = 'ACTIVE' AND (OLD.status IS DISTINCT FROM 'ACTIVE') THEN
        UPDATE units SET status = 'OCCUPIED' WHERE unit_id = NEW.unit_id;

    -- Lease becoming TERMINATED or EXPIRED → unit becomes VACANT
    ELSIF NEW.status IN ('TERMINATED', 'EXPIRED')
          AND OLD.status NOT IN ('TERMINATED', 'EXPIRED') THEN
        -- Only set VACANT if there is no other ACTIVE lease on this unit
        IF NOT EXISTS (
            SELECT 1 FROM leases
            WHERE unit_id = NEW.unit_id
              AND status = 'ACTIVE'
              AND lease_id <> NEW.lease_id
        ) THEN
            UPDATE units SET status = 'VACANT' WHERE unit_id = NEW.unit_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_unit_status_on_lease
    AFTER UPDATE ON leases
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION fn_sync_unit_status_on_lease_change();

-- ─────────────────────────────────────────────
-- TRIGGER 3: Recalculate invoice status after payment insert/update
--
-- WHY AT DB LEVEL:
-- Invoice status (PAID/PARTIALLY_PAID/OVERDUE/UNPAID) must always
-- reflect the actual payment state. Rather than trust the application,
-- we recompute it automatically whenever a payment row changes.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_refresh_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_invoice_id BIGINT;
    v_new_status VARCHAR(30);
BEGIN
    -- Works for INSERT and UPDATE on payments
    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Only recalculate if the invoice is not VOID or WAIVED
    IF EXISTS (
        SELECT 1 FROM invoices
        WHERE invoice_id = v_invoice_id AND status NOT IN ('VOID', 'WAIVED')
    ) THEN
        v_new_status := get_invoice_status(v_invoice_id);
        UPDATE invoices
        SET status = v_new_status
        WHERE invoice_id = v_invoice_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoice_status_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION fn_refresh_invoice_status();

-- ─────────────────────────────────────────────
-- TRIGGER 4: Audit log on lease status change
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_lease_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (
            action, entity_type, entity_id,
            old_value, new_value, description
        ) VALUES (
            'STATUS_CHANGED',
            'LEASE',
            NEW.lease_id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status),
            'Lease status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_lease_status
    AFTER UPDATE ON leases
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION fn_audit_lease_status_change();

-- ─────────────────────────────────────────────
-- TRIGGER 5: Audit log on payment insert
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_payment_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO audit_logs (
        action, entity_type, entity_id,
        new_value, description
    ) VALUES (
        'PAYMENT_CREATED',
        'PAYMENT',
        NEW.payment_id,
        jsonb_build_object(
            'invoice_id',  NEW.invoice_id,
            'amount',      NEW.amount,
            'method',      NEW.payment_method,
            'status',      NEW.status
        ),
        'Payment of ' || NEW.amount || ' recorded via ' || NEW.payment_method
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_payment
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION fn_audit_payment_insert();

-- ─────────────────────────────────────────────
-- TRIGGER 6: Audit log on maintenance status change
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_maintenance_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (
            action, entity_type, entity_id,
            old_value, new_value, description
        ) VALUES (
            'MAINTENANCE_STATUS_CHANGED',
            'MAINTENANCE_REQUEST',
            NEW.request_id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status),
            'Maintenance request #' || NEW.request_id || ' changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_maintenance_status
    AFTER UPDATE ON maintenance_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION fn_audit_maintenance_status();
