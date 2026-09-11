-- ============================================================================
-- PropLedger: Stored Functions & Business Logic Engine
-- ============================================================================

-- 1. Function: Calculate Property Occupancy Rate Percentage
CREATE OR REPLACE FUNCTION fn_calculate_occupancy_rate(p_property_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_units INTEGER;
    v_occupied_units INTEGER;
    v_rate NUMERIC;
BEGIN
    SELECT COUNT(*), COUNT(CASE WHEN status = 'OCCUPIED' THEN 1 END)
    INTO v_total_units, v_occupied_units
    FROM units
    WHERE property_id = p_property_id AND is_active = TRUE;

    IF v_total_units = 0 THEN
        RETURN 0.00;
    END IF;

    v_rate := ROUND((v_occupied_units::NUMERIC / v_total_units::NUMERIC) * 100.0, 2);
    RETURN v_rate;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Function: Check Lease Date Overlap for a Unit
CREATE OR REPLACE FUNCTION fn_check_lease_overlap(
    p_unit_id BIGINT,
    p_start_date DATE,
    p_end_date DATE,
    p_exclude_lease_id BIGINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_overlap_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_overlap_count
    FROM leases
    WHERE unit_id = p_unit_id
      AND status IN ('ACTIVE', 'DRAFT', 'RENEWED')
      AND (p_exclude_lease_id IS NULL OR id <> p_exclude_lease_id)
      AND daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');

    RETURN (v_overlap_count > 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Function: Calculate Tenant Outstanding Balance
CREATE OR REPLACE FUNCTION fn_get_tenant_total_balance(p_tenant_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_balance NUMERIC;
BEGIN
    SELECT COALESCE(SUM(i.balance_due), 0.00)
    INTO v_total_balance
    FROM invoices i
    JOIN leases l ON l.id = i.lease_id
    JOIN lease_tenants lt ON lt.lease_id = l.id
    WHERE lt.tenant_id = p_tenant_id
      AND i.balance_due > 0;

    RETURN v_total_balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Function: Batch Generate Monthly Rent Invoices for an Accounting Period
CREATE OR REPLACE FUNCTION fn_batch_generate_monthly_invoices(
    p_invoice_date DATE,
    p_due_date DATE
)
RETURNS INTEGER AS $$
DECLARE
    r RECORD;
    v_invoice_id BIGINT;
    v_generated_count INTEGER := 0;
    v_invoice_num VARCHAR;
BEGIN
    FOR r IN (
        SELECT l.id AS lease_id, l.unit_id, l.rent_amount
        FROM leases l
        WHERE l.status = 'ACTIVE'
          AND l.start_date <= p_invoice_date
          AND l.end_date >= p_invoice_date
          AND NOT EXISTS (
              SELECT 1 FROM invoices i
              WHERE i.lease_id = l.id
                AND EXTRACT(YEAR FROM i.invoice_date) = EXTRACT(YEAR FROM p_invoice_date)
                AND EXTRACT(MONTH FROM i.invoice_date) = EXTRACT(MONTH FROM p_invoice_date)
          )
    ) LOOP
        v_invoice_num := 'INV-' || TO_CHAR(p_invoice_date, 'YYYYMM') || '-' || LPAD(r.lease_id::TEXT, 5, '0');
        
        INSERT INTO invoices (
            invoice_number, lease_id, invoice_date, due_date,
            total_amount, balance_due, status, created_at
        ) VALUES (
            v_invoice_num, r.lease_id, p_invoice_date, p_due_date,
            r.rent_amount, r.rent_amount, 'PENDING', NOW()
        ) RETURNING id INTO v_invoice_id;

        INSERT INTO invoice_items (
            invoice_id, charge_type, amount, description, created_at
        ) VALUES (
            v_invoice_id, 'BASE_RENT', r.rent_amount, 
            'Monthly Base Rent for ' || TO_CHAR(p_invoice_date, 'Month YYYY'), NOW()
        );

        v_generated_count := v_generated_count + 1;
    END LOOP;

    RETURN v_generated_count;
END;
$$ LANGUAGE plpgsql VOLATILE;
