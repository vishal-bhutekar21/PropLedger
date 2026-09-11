-- ============================================================
-- V11: Database Functions
-- Purpose: Encapsulate business calculations that belong at DB level.
-- These functions are called by stored triggers and reporting queries.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. calculate_invoice_balance(invoice_id)
-- Returns the current outstanding amount on an invoice.
-- Outstanding = total_amount - SUM(successful payments)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_invoice_balance(p_invoice_id BIGINT)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total_amount    DECIMAL(12,2);
    v_paid_amount     DECIMAL(12,2);
BEGIN
    SELECT total_amount INTO v_total_amount
    FROM invoices
    WHERE invoice_id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found', p_invoice_id;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payments
    WHERE invoice_id = p_invoice_id AND status = 'SUCCESS';

    RETURN GREATEST(v_total_amount - v_paid_amount, 0);
END;
$$;

-- ─────────────────────────────────────────────
-- 2. get_invoice_status(invoice_id)
-- Derives the correct invoice status from payment data + due date.
-- Status is NOT stored permanently — it's always recalculated.
-- Called inside the payment transaction to update invoice.status.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_invoice_status(p_invoice_id BIGINT)
RETURNS VARCHAR(30)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total_amount DECIMAL(12,2);
    v_paid_amount  DECIMAL(12,2);
    v_due_date     DATE;
    v_balance      DECIMAL(12,2);
BEGIN
    SELECT total_amount, due_date INTO v_total_amount, v_due_date
    FROM invoices WHERE invoice_id = p_invoice_id;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payments
    WHERE invoice_id = p_invoice_id AND status = 'SUCCESS';

    v_balance := v_total_amount - v_paid_amount;

    IF v_balance <= 0 THEN
        RETURN 'PAID';
    ELSIF v_paid_amount > 0 AND v_due_date < CURRENT_DATE THEN
        RETURN 'OVERDUE';  -- partial + past due
    ELSIF v_paid_amount > 0 THEN
        RETURN 'PARTIALLY_PAID';
    ELSIF v_due_date < CURRENT_DATE THEN
        RETURN 'OVERDUE';
    ELSE
        RETURN 'UNPAID';
    END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. calculate_property_occupancy(property_id)
-- Returns current occupancy rate (0.00 to 100.00) for a property.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_property_occupancy(p_property_id BIGINT)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total    BIGINT;
    v_occupied BIGINT;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE u.status = 'OCCUPIED')
    INTO v_total, v_occupied
    FROM buildings b
    JOIN units u ON u.building_id = b.building_id
    WHERE b.property_id = p_property_id;

    RETURN CASE WHEN v_total = 0 THEN 0
                ELSE ROUND(v_occupied * 100.0 / v_total, 2)
           END;
END;
$$;

-- ─────────────────────────────────────────────
-- 4. calculate_property_revenue(property_id, from_date, to_date)
-- Returns total collected revenue for a property in a date range.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_property_revenue(
    p_property_id BIGINT,
    p_from DATE,
    p_to   DATE
)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_revenue DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(py.amount), 0) INTO v_revenue
    FROM properties p
    JOIN buildings b ON b.property_id = p.property_id
    JOIN units u     ON u.building_id = b.building_id
    JOIN leases l    ON l.unit_id = u.unit_id
    JOIN invoices i  ON i.lease_id = l.lease_id
    JOIN payments py ON py.invoice_id = i.invoice_id
    WHERE p.property_id = p_property_id
      AND py.status = 'SUCCESS'
      AND py.payment_date BETWEEN p_from AND p_to;

    RETURN v_revenue;
END;
$$;

-- ─────────────────────────────────────────────
-- 5. calculate_late_fee(invoice_id, rate_per_day)
-- Calculates accrued late fee for an overdue invoice.
-- Default rate: 0.1% of outstanding per day.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_late_fee(
    p_invoice_id   BIGINT,
    p_rate_per_day DECIMAL(6,4) DEFAULT 0.001
)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_balance    DECIMAL(12,2);
    v_due_date   DATE;
    v_days_late  INTEGER;
BEGIN
    SELECT due_date INTO v_due_date
    FROM invoices WHERE invoice_id = p_invoice_id;

    IF v_due_date >= CURRENT_DATE THEN
        RETURN 0;
    END IF;

    v_balance   := calculate_invoice_balance(p_invoice_id);
    v_days_late := CURRENT_DATE - v_due_date;

    RETURN ROUND(v_balance * p_rate_per_day * v_days_late, 2);
END;
$$;

-- ─────────────────────────────────────────────
-- 6. generate_invoice_number()
-- Generates a sequential invoice number like INV-2024-00001
-- ─────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
    v_seq BIGINT;
BEGIN
    v_seq := NEXTVAL('invoice_seq');
    RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;

-- ─────────────────────────────────────────────
-- 7. generate_work_order_number()
-- ─────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS work_order_seq START 1;

CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
    v_seq BIGINT;
BEGIN
    v_seq := NEXTVAL('work_order_seq');
    RETURN 'WO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$;
