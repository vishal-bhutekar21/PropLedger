-- ============================================================================
-- PropLedger: Multi-Table Transaction Workflows (ACID Implementation)
-- ============================================================================

-- TRANSACTION PATTERN 1: Multi-Invoice Payment Allocation with Pessimistic Locking
-- Simulates the exact SQL boundary executed when a tenant settles multiple invoices.

BEGIN;

-- Step 1: Lock invoices in strict ascending order to prevent deadlocks
SELECT id, total_amount, balance_due, status 
FROM invoices 
WHERE id IN (1, 2)
ORDER BY id ASC
FOR UPDATE;

-- Step 2: Insert payment record
INSERT INTO payments (
    payment_reference, tenant_id, amount, payment_method, 
    status, payment_date, created_at
) VALUES (
    'PAY-ACH-202609-0091', 1, 2500.00, 'ACH', 
    'SETTLED', NOW(), NOW()
);

-- Step 3: Insert allocation for Invoice 1 ($1,800.00)
-- (Row-level trigger automatically updates invoice 1 balance_due to $0.00 and status to 'PAID')
INSERT INTO payment_allocations (
    payment_id, invoice_id, allocated_amount, allocated_at
) VALUES (
    currval('payments_id_seq'), 1, 1800.00, NOW()
);

-- Step 4: Insert allocation for Invoice 2 ($700.00)
-- (Row-level trigger automatically updates invoice 2 balance_due)
INSERT INTO payment_allocations (
    payment_id, invoice_id, allocated_amount, allocated_at
) VALUES (
    currval('payments_id_seq'), 2, 700.00, NOW()
);

-- Step 5: Verification of invariants
DO $$
DECLARE
    v_bal1 NUMERIC;
    v_bal2 NUMERIC;
BEGIN
    SELECT balance_due INTO v_bal1 FROM invoices WHERE id = 1;
    SELECT balance_due INTO v_bal2 FROM invoices WHERE id = 2;
    IF v_bal1 < 0 OR v_bal2 < 0 THEN
        RAISE EXCEPTION 'Invariant violation: negative balance detected';
    END IF;
END $$;

COMMIT;


-- TRANSACTION PATTERN 2: Lease Execution & Immediate Unit Status Transition
-- Atomic signing of a new lease contract, initializing unit occupancy, and billing deposit.

BEGIN;

-- Step 1: Pessimistic lock on target unit to prevent concurrent double-booking
SELECT id, status, market_rent 
FROM units 
WHERE id = 15 
FOR UPDATE;

-- Step 2: Insert active lease contract
INSERT INTO leases (
    lease_number, unit_id, start_date, end_date, 
    rent_amount, deposit_amount, payment_due_day, status, created_at
) VALUES (
    'LSE-2026-EXEC-01', 15, '2026-10-01', '2027-09-30',
    2150.00, 2150.00, 1, 'ACTIVE', NOW()
);

-- Step 3: Bind primary tenant
INSERT INTO lease_tenants (
    lease_id, tenant_id, is_primary_tenant, guarantor, created_at
) VALUES (
    currval('leases_id_seq'), 2, TRUE, FALSE, NOW()
);

-- Step 4: Update tenant's active lease pointer
UPDATE tenants 
SET current_lease_id = currval('leases_id_seq') 
WHERE id = 2;

-- Step 5: Unit status updated via trigger (or explicit statement)
UPDATE units 
SET status = 'OCCUPIED' 
WHERE id = 15;

-- Step 6: Generate initial security deposit invoice
INSERT INTO invoices (
    invoice_number, lease_id, invoice_date, due_date, 
    total_amount, balance_due, status, created_at
) VALUES (
    'INV-DEP-2026-0015', currval('leases_id_seq'), CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days',
    2150.00, 2150.00, 'PENDING', NOW()
);

INSERT INTO invoice_items (
    invoice_id, charge_type, amount, description, created_at
) VALUES (
    currval('invoices_id_seq'), 'SECURITY_DEPOSIT', 2150.00, 'Initial refundable security deposit', NOW()
);

COMMIT;
