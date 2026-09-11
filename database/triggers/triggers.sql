-- ============================================================================
-- PropLedger: Database Row-Level Triggers & Automated Consistency
-- ============================================================================

-- 1. TRIGGER: Maintain Invoice balance_due and status upon Payment Allocations
CREATE OR REPLACE FUNCTION fn_trg_update_invoice_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_allocated NUMERIC(14,2);
    v_total_amount NUMERIC(14,2);
    v_invoice_id BIGINT;
BEGIN
    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    SELECT COALESCE(SUM(allocated_amount), 0.00)
    INTO v_total_allocated
    FROM payment_allocations
    WHERE invoice_id = v_invoice_id;

    SELECT total_amount INTO v_total_amount
    FROM invoices
    WHERE id = v_invoice_id;

    UPDATE invoices
    SET balance_due = GREATEST(0.00, v_total_amount - v_total_allocated),
        status = CASE 
            WHEN (v_total_amount - v_total_allocated) <= 0.00 THEN 'PAID'
            WHEN v_total_allocated > 0.00 THEN 'PARTIALLY_PAID'
            ELSE 'PENDING'
        END
    WHERE id = v_invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_balance ON payment_allocations;
CREATE TRIGGER trg_update_invoice_balance
AFTER INSERT OR UPDATE OR DELETE ON payment_allocations
FOR EACH ROW
EXECUTE FUNCTION fn_trg_update_invoice_balance();

-- 2. TRIGGER: Synchronize Unit status when Lease status changes
CREATE OR REPLACE FUNCTION fn_trg_sync_unit_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status = 'ACTIVE' THEN
            UPDATE units SET status = 'OCCUPIED' WHERE id = NEW.unit_id;
        ELSIF NEW.status IN ('TERMINATED', 'EXPIRED') THEN
            IF NOT EXISTS (
                SELECT 1 FROM leases 
                WHERE unit_id = NEW.unit_id 
                  AND status = 'ACTIVE' 
                  AND id <> NEW.id
            ) THEN
                UPDATE units SET status = 'AVAILABLE' WHERE id = NEW.unit_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_unit_status_on_lease ON leases;
CREATE TRIGGER trg_sync_unit_status_on_lease
AFTER INSERT OR UPDATE OF status ON leases
FOR EACH ROW
EXECUTE FUNCTION fn_trg_sync_unit_status();

-- 3. TRIGGER: Universal Audit Trail Capture on Leases, Invoices, and Payments
CREATE OR REPLACE FUNCTION fn_trg_audit_log_capture()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id BIGINT;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        table_name, record_id, action, 
        old_values, new_values, created_at
    ) VALUES (
        TG_TABLE_NAME, v_record_id, TG_OP,
        v_old_data, v_new_data, NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_leases ON leases;
CREATE TRIGGER trg_audit_leases
AFTER INSERT OR UPDATE OR DELETE ON leases
FOR EACH ROW EXECUTE FUNCTION fn_trg_audit_log_capture();

DROP TRIGGER IF EXISTS trg_audit_invoices ON invoices;
CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION fn_trg_audit_log_capture();

DROP TRIGGER IF EXISTS trg_audit_payments ON payments;
CREATE TRIGGER trg_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_trg_audit_log_capture();
