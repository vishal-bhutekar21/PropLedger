import os
import sys
sys.path.append(os.path.dirname(__file__))
from engine import PropLedgerPdfEngine

def build_doc_08(output_path="docs/pdf/08_Financial_Subledger_And_Billing_Engine.pdf"):
    doc = PropLedgerPdfEngine(
        filename=output_path,
        volume_num=8,
        volume_title="Financial Subledger & Billing Engine",
        volume_category="FINANCIAL & REAL ESTATE ACCOUNTING"
    )

    # PAGE 1: COVER PAGE
    topics = [
        ["02", "Financial Accounting Architecture", "Accounts Receivable (AR) subledger and accrual vs cash basis"],
        ["03", "Recurring Monthly Billing Engine", "Batch generation of monthly recurring rent charges at scale"],
        ["04", "Itemized Charge Breakdowns", "Base rent, parking, water, electric, late fees, and deposits"],
        ["05", "Payment Settlement Architecture", "Multi-invoice payment allocations and double-entry settlement"],
        ["06", "Automated ACID Balance Triggers", "Row-level trigger maintaining balance_due and settlement status"],
        ["07", "Accounts Payable (AP) & Expenses", "Vendor voucher processing and operating expenditure categorization"],
        ["08", "CapEx vs OpEx & NOI Calculation", "Capital expenditures vs operating expenses and asset yield formulas"],
        ["09", "Vendor Compliance & 1099 Tax", "W-9 tax ID tracking, insurance expirations, and compliance gates"],
        ["10", "Financial Operations Interview Q&A", "Senior accounting and FinTech system design interview scenarios"]
    ]
    doc.draw_cover_page(
        title="Financial Subledger & Billing",
        subtitle="Accounts Receivable, Payment Allocations & Real Estate Accounting",
        volume_desc="This volume presents the mission-critical financial subledger and billing engine of PropLedger. Designed to the accounting standards of Yardi Voyager and RealPage, it details the automated monthly rent generation pipeline, multi-invoice payment settlement allocations, double-entry ledger invariants, accounts payable categorization, and Net Operating Income (NOI) financial analytics.",
        key_topics=topics
    )

    # PAGE 2: FINANCIAL ACCOUNTING ARCHITECTURE
    doc.start_page("2. FINANCIAL ACCOUNTING & AR SUBLEDGER DESIGN", "Accrual Basis vs Cash Basis Accounting in Real Estate")
    doc.add_section("1. The Two Real Estate Accounting Methods")
    doc.add_paragraph("Enterprise property management software must support both statutory accounting methodologies:")
    doc.add_bullet("1. Accrual Basis Accounting", "Revenue is recognized the exact moment an invoice is generated on the 1st of the month, establishing a legal Accounts Receivable asset.")
    doc.add_bullet("2. Cash Basis Accounting", "Revenue is recognized only when cash funds physically settle in the bank account. PropLedger models this via the 'payments' and 'payment_allocations' tables.")

    doc.add_section("2. The Invoice State Machine")
    headers = ["State Code", "Mathematical Condition", "Operational Description"]
    rows = [
        ["PENDING", "balance_due == total_amount", "Invoice billed; zero payment allocations received."],
        ["PARTIALLY_PAID", "0 < balance_due < total_amount", "Partial payment received; remaining balance overdue or current."],
        ["PAID", "balance_due == 0.00", "Fully settled and closed. Immutable."],
        ["OVERDUE", "balance_due > 0 AND due_date < NOW", "Grace period expired; subject to automated late fees."],
        ["VOID", "Manually cancelled by Accountant", "Invalidated charge; reversal recorded in audit log."]
    ]
    doc.add_table(headers, rows, [110, 165, 257])
    doc.end_page()

    # PAGE 3: RECURRING MONTHLY BILLING ENGINE
    doc.start_page("3. RECURRING MONTHLY RENT BILLING ENGINE", "Automated Period Billing via Stored Database Procedures")
    doc.add_section("1. The Monthly Billing Challenge")
    doc.add_paragraph("On the 1st of each month, an enterprise platform managing 200,000 units must generate 200,000 invoices with itemized rent charges. Executing this in application code over HTTP roundtrips causes timeouts. PropLedger implements a high-performance stored database procedure:")
    code = """-- fn_batch_generate_monthly_invoices (V11__create_functions.sql)
CREATE OR REPLACE FUNCTION fn_batch_generate_monthly_invoices(
    p_invoice_date DATE, p_due_date DATE
) RETURNS INTEGER AS $$
DECLARE
    r RECORD;
    v_invoice_id BIGINT;
    v_count INTEGER := 0;
BEGIN
    FOR r IN (
        SELECT l.id AS lease_id, l.rent_amount
        FROM leases l
        WHERE l.status = 'ACTIVE' AND l.start_date <= p_invoice_date AND l.end_date >= p_invoice_date
          AND NOT EXISTS (
              SELECT 1 FROM invoices i WHERE i.lease_id = l.id
                AND EXTRACT(YEAR FROM i.invoice_date) = EXTRACT(YEAR FROM p_invoice_date)
                AND EXTRACT(MONTH FROM i.invoice_date) = EXTRACT(MONTH FROM p_invoice_date)
          )
    ) LOOP
        INSERT INTO invoices (invoice_number, lease_id, invoice_date, due_date, total_amount, balance_due, status)
        VALUES ('INV-' || TO_CHAR(p_invoice_date, 'YYYYMM') || '-' || LPAD(r.lease_id::TEXT, 5, '0'),
                r.lease_id, p_invoice_date, p_due_date, r.rent_amount, r.rent_amount, 'PENDING')
        RETURNING id INTO v_invoice_id;

        INSERT INTO invoice_items (invoice_id, charge_type, amount, description)
        VALUES (v_invoice_id, 'BASE_RENT', r.rent_amount, 'Monthly Base Rent for ' || TO_CHAR(p_invoice_date, 'Month YYYY'));
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END; $$ LANGUAGE plpgsql;"""
    doc.add_code_block(code, "PL/pgSQL — High-Throughput Batch Billing Procedure")
    doc.end_page()

    # PAGE 4: ITEMIZED CHARGE BREAKDOWNS
    doc.start_page("4. ITEMIZED CHARGE BREAKDOWNS & LEDGER CATEGORIES", "Granular Accounting: Rent, Utilities, Fees & Deposits")
    doc.add_section("1. Line Item Separation")
    doc.add_paragraph("An invoice is not a monolithic number. In legal lease disputes, property managers must prove the exact breakdown of charges:")
    headers = ["Charge Category", "Tax Classification", "Ledger Accounting Account", "Auto-Generated"]
    rows = [
        ["BASE_RENT", "Rental Income", "4000 - Gross Potential Rent", "Yes (Monthly 1st)"],
        ["PARKING_FEE", "Ancillary Income", "4100 - Parking & Garage Revenue", "Yes (Monthly 1st)"],
        ["UTILITY_WATER", "Expense Reimbursement", "4200 - Utility Reimbursements (RUBS)", "Manual / Utility Sync"],
        ["LATE_FEE", "Fee Income", "4300 - Tenant Late Charges", "Yes (Post Grace Period)"],
        ["SECURITY_DEPOSIT", "Liability (Trust Escrow)", "2100 - Security Deposit Holdings", "Yes (Lease Signing)"]
    ]
    doc.add_table(headers, rows, [110, 125, 185, 112])

    doc.add_section("2. Security Deposit Escrow Accounting")
    doc.add_paragraph("Under statutory real estate trust laws, security deposits are **NOT income**! They are recorded as balance sheet liabilities in escrow accounts until tenant move-out and damages reconciliation.")
    doc.end_page()

    # PAGE 5: PAYMENT SETTLEMENT ARCHITECTURE
    doc.start_page("5. PAYMENT ALLOCATION & DOUBLE-ENTRY SETTLEMENT", "Distributing Single Cash Receipts Across Multiple Receivables")
    doc.add_section("1. Multi-Invoice Split Settlement Algorithm")
    doc.add_paragraph("When a resident pays $2,500, the system must apply the funds according to accounting priority: oldest overdue charges first, followed by current rent:")
    code = """// PaymentServiceImpl.java: Allocation Processing Logic
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
public PaymentResponseDto processPayment(PaymentRequestDto dto) {
    // 1. Validate total allocation equals payment amount
    BigDecimal totalAllocated = dto.getAllocations().stream()
            .map(AllocationItemDto::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (totalAllocated.compareTo(dto.getAmount()) != 0) {
        throw new BusinessRuleException("Allocations sum ($" + totalAllocated + 
            ") must match payment amount ($" + dto.getAmount() + ")");
    }

    // 2. Persist Payment Receipt Voucher
    Payment payment = paymentRepository.save(mapToPaymentEntity(dto));

    // 3. Persist Allocations (Triggers maintain invoice balances atomically!)
    for (AllocationItemDto allocDto : dto.getAllocations()) {
        PaymentAllocation alloc = PaymentAllocation.builder()
                .payment(payment)
                .invoice(invoiceRepository.findByIdForUpdate(allocDto.getInvoiceId()).orElseThrow())
                .allocatedAmount(allocDto.getAmount())
                .build();
        allocationRepository.save(alloc);
    }
    return mapToResponseDto(payment);
}"""
    doc.add_code_block(code, "Java 21 — Payment Allocation Processing")
    doc.end_page()

    # PAGE 6: AUTOMATED ACID BALANCE TRIGGERS
    doc.start_page("6. AUTOMATED ACID INVOICE BALANCE TRIGGERS", "PostgreSQL Row-Level Triggers Maintaining Ledger Truth")
    doc.add_section("1. Trigger Design & Invariants")
    doc.add_paragraph("To guarantee that no concurrent race condition or application bug can cause an invoice balance to drift from its allocations, PropLedger delegates balance recalculation to an ACID database trigger:")
    code = """-- trg_update_invoice_balance (V12__create_triggers.sql)
CREATE OR REPLACE FUNCTION fn_trg_update_invoice_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_allocated NUMERIC(14,2);
    v_total_amount NUMERIC(14,2);
    v_invoice_id BIGINT := COALESCE(NEW.invoice_id, OLD.invoice_id);
BEGIN
    SELECT COALESCE(SUM(allocated_amount), 0.00) INTO v_total_allocated
    FROM payment_allocations WHERE invoice_id = v_invoice_id;

    SELECT total_amount INTO v_total_amount
    FROM invoices WHERE id = v_invoice_id;

    UPDATE invoices
    SET balance_due = GREATEST(0.00, v_total_amount - v_total_allocated),
        status = CASE 
            WHEN (v_total_amount - v_total_allocated) <= 0.00 THEN 'PAID'
            WHEN v_total_allocated > 0.00 THEN 'PARTIALLY_PAID'
            ELSE 'PENDING'
        END
    WHERE id = v_invoice_id;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_invoice_balance
AFTER INSERT OR UPDATE OR DELETE ON payment_allocations
FOR EACH ROW EXECUTE FUNCTION fn_trg_update_invoice_balance();"""
    doc.add_code_block(code, "PL/pgSQL — Invoice Balance Maintenance Trigger")
    doc.end_page()

    # PAGE 7: ACCOUNTS PAYABLE & EXPENSES
    doc.start_page("7. ACCOUNTS PAYABLE (AP) & OPERATING EXPENSES", "Vendor Invoices, Spend Vouchers & General Ledger Accounts")
    doc.add_section("1. Accounts Payable Workflow")
    doc.add_paragraph("Accounts Payable tracks money paid to third-party contractors and utility providers:")
    doc.add_bullet("1. Invoice Ingestion", "Property Manager logs contractor bill with invoice reference and tax classification.")
    doc.add_bullet("2. Compliance Check", "System verifies vendor's Certificate of Insurance (COI) is current before approving payout.")
    doc.add_bullet("3. Category Booking", "Voucher is booked to an OpEx general ledger category (e.g. UTILITIES, LANDSCAPING).")

    doc.add_section("2. Operating Expense Categories in PropLedger")
    headers = ["Category Code", "GAAP Classification", "Expense Description"]
    rows = [
        ["REPAIRS", "Operating Expense (OpEx)", "Routine maintenance, appliance repairs, plumbing dispatch."],
        ["UTILITIES", "Operating Expense (OpEx)", "Municipal water, sewage, common area electricity, gas."],
        ["LANDSCAPING", "Operating Expense (OpEx)", "Grounds maintenance, tree trimming, snow removal."],
        ["PROPERTY_TAX", "Operating Expense (OpEx)", "County and municipal real estate ad valorem taxes."],
        ["CAPITAL_IMPROVEMENT", "Capital Expenditure (CapEx)", "Long-term asset improvements capitalized on balance sheet."]
    ]
    doc.add_table(headers, rows, [125, 145, 262])
    doc.end_page()

    # PAGE 8: CAPEX VS OPEX & NOI CALCULATION
    doc.start_page("8. CAPEX VS OPEX & NET OPERATING INCOME (NOI)", "Asset Valuation Formulas & Capital Allocation Mechanics")
    doc.add_section("1. The Mathematical Definition of NOI")
    doc.add_paragraph("In commercial real estate, asset value is calculated directly via the Capitalization Rate (Cap Rate) formula:")
    doc.add_paragraph("Asset Market Value = Net Operating Income (NOI) / Capitalization Rate")
    doc.add_paragraph("NOI = Effective Gross Revenue Collected - Total Operating Expenses (OpEx)")

    doc.add_section("2. Why CapEx is Strictly Excluded from NOI")
    doc.add_paragraph("A major interview question: Why are roof replacements or parking lot repaving excluded from OpEx? Because CapEx expenditures provide multi-year utility and are capitalized on the balance sheet rather than expensed immediately. Including CapEx in OpEx would artificially crush the property's operational valuation yield.")

    doc.add_section("3. Operating Expense Ratio (OER) Benchmark")
    doc.add_paragraph("OER = (Total OpEx / Gross Collected Revenue) * 100. In well-managed multifamily assets, OER typically ranges between 35% and 45%.")
    doc.end_page()

    # PAGE 9: VENDOR COMPLIANCE & 1099 TAX
    doc.start_page("9. VENDOR COMPLIANCE & IRS FORM 1099 REPORTING", "Certificate of Insurance (COI) Gates & Tax Compliance")
    doc.add_section("1. Certificate of Insurance (COI) Enforcement Gate")
    doc.add_paragraph("If an uninsured contractor causes a fire or flood on property premises, the property owner is legally liable. PropLedger implements a compliance gate in 'MaintenanceServiceImpl':")
    code = """// Vendor Insurance Expiration Gate
if (vendor.getInsuranceExpiryDate().isBefore(LocalDate.now())) {
    throw new ComplianceException(
        "Cannot assign Vendor '" + vendor.getName() + "': Certificate of Insurance expired on " + 
        vendor.getInsuranceExpiryDate() + ". Work order dispatch blocked."
    );
}"""
    doc.add_code_block(code, "Java 21 — Automated Compliance Insurance Gate")

    doc.add_section("2. IRS Form 1099-NEC / 1099-MISC Reporting")
    doc.add_paragraph("At calendar year-end, property management firms must issue Form 1099 to all unincorporated vendors paid over $600. The vendors table tracks encrypted Tax IDs (EIN / SSN) and aggregate calendar year payouts.")
    doc.end_page()

    # PAGE 10: FINANCIAL OPERATIONS INTERVIEW Q&A
    doc.start_page("10. FINANCIAL OPERATIONS INTERVIEW Q&A", "Senior Accounting & FinTech Engineering Scenarios")
    doc.add_section("1. High-Yield Financial Engineering Scenarios")

    doc.add_subsection("Question 1: What is the difference between Cash Basis and Accrual Basis accounting in rental platforms?")
    doc.add_paragraph("Answer: Accrual basis recognizes revenue when earned (when the invoice is issued on the 1st of the month, establishing Accounts Receivable). Cash basis recognizes revenue only when funds physically settle in the bank. PropLedger tracks both: invoices represent Accrual AR, while payment_allocations represent Cash Basis receipts, allowing instant reconciliation between both methods.")

    doc.add_subsection("Question 2: How do you prevent over-allocation when multiple payments settle simultaneously?")
    doc.add_paragraph("Answer: We enforce a two-layer defense: 1) Pessimistic write locking on the target invoice ('findByIdForUpdate') serializes concurrent allocation threads. 2) A database engine check constraint 'CHECK (balance_due >= 0.00)' guarantees that even if application logic were completely bypassed, PostgreSQL aborts any transaction resulting in a negative invoice balance.")

    doc.add_subsection("Question 3: How does PropLedger handle resident chargebacks and payment refunds?")
    doc.add_paragraph("Answer: We never delete settled payment records. A chargeback is recorded as a negative payment adjustment voucher linked to a 'REVERSAL' allocation. The row-level trigger immediately increments the invoice's balance_due back to overdue status and applies late fee penalties.")

    doc.add_callout("FinTech Interview Key Takeaway", 
        "Demonstrating double-entry ledger mechanics and mathematical check constraints proves you can be trusted with mission-critical financial systems.",
        "tip"
    )
    doc.end_page()

    saved = doc.save()
    print(f"Generated Doc 08: {output_path} ({saved} pages)")
    return saved

if __name__ == "__main__":
    build_doc_08()
