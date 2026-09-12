package com.propledger.service.impl;

import com.propledger.entity.Invoice;
import com.propledger.entity.InvoiceItem;
import com.propledger.entity.Lease;
import com.propledger.repository.InvoiceRepository;
import com.propledger.repository.LeaseRepository;
import com.propledger.service.AuditLogService;
import com.propledger.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final LeaseRepository leaseRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditLogService auditLogService;

    /**
     * Automatic Cron: Runs at 00:05 on the 1st of every month
     */
    @Scheduled(cron = "0 5 0 1 * ?")
    public void scheduledMonthlyBilling() {
        log.info("Cron triggered: Running automated 1st-of-month rental billing");
        generateMonthlyInvoices(LocalDate.now(), "SYSTEM_CRON");
    }

    @Override
    @Transactional
    public Map<String, Object> generateMonthlyInvoices(LocalDate billingDate, String generatedBy) {
        if (billingDate == null) billingDate = LocalDate.now();
        LocalDate periodStart = billingDate.withDayOfMonth(1);
        LocalDate periodEnd = periodStart.plusMonths(1).minusDays(1);
        LocalDate dueDate = periodStart.plusDays(4); // 5th of current month

        List<Lease> activeLeases = leaseRepository.findByStatus("ACTIVE");
        int generatedCount = 0;
        int skippedCount = 0;
        BigDecimal totalBilled = BigDecimal.ZERO;

        for (Lease lease : activeLeases) {
            // Check if already invoiced for this billing period
            boolean alreadyInvoiced = invoiceRepository.findAll().stream().anyMatch(inv ->
                    inv.getLease() != null &&
                    inv.getLease().getLeaseId().equals(lease.getLeaseId()) &&
                    periodStart.equals(inv.getBillingPeriodStart()) &&
                    !"VOID".equalsIgnoreCase(inv.getStatus())
            );

            if (alreadyInvoiced) {
                skippedCount++;
                continue;
            }

            BigDecimal baseRent = lease.getMonthlyRent();
            String propType = lease.getUnit() != null && lease.getUnit().getBuilding() != null && lease.getUnit().getBuilding().getProperty() != null
                    ? lease.getUnit().getBuilding().getProperty().getPropertyType() : "RESIDENTIAL";

            // Commercial rentals attract 18% GST under Indian tax regulations
            BigDecimal tax = "COMMERCIAL".equalsIgnoreCase(propType)
                    ? baseRent.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal total = baseRent.add(tax);

            String invNum = "INV-" + periodStart.format(DateTimeFormatter.ofPattern("yyyyMM")) +
                    "-" + String.format("%04d", lease.getLeaseId()) +
                    "-" + (int)(Math.random() * 900 + 100);

            Invoice invoice = Invoice.builder()
                    .lease(lease)
                    .invoiceNumber(invNum)
                    .invoiceDate(periodStart)
                    .dueDate(dueDate)
                    .billingPeriodStart(periodStart)
                    .billingPeriodEnd(periodEnd)
                    .subtotal(baseRent)
                    .tax(tax)
                    .totalAmount(total)
                    .status("UNPAID")
                    .notes("Automated monthly rent billing for " + periodStart.getMonth() + " " + periodStart.getYear())
                    .build();

            List<InvoiceItem> items = new ArrayList<>();
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .description("Monthly Base Rent - " + periodStart.getMonth() + " " + periodStart.getYear())
                    .itemType("RENT")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(baseRent)
                    .amount(baseRent)
                    .build());

            if (tax.compareTo(BigDecimal.ZERO) > 0) {
                items.add(InvoiceItem.builder()
                        .invoice(invoice)
                        .description("GST on Commercial Rent (18%)")
                        .itemType("OTHER")
                        .quantity(BigDecimal.ONE)
                        .unitPrice(tax)
                        .amount(tax)
                        .build());
            }

            invoice.setItems(items);
            invoiceRepository.save(invoice);
            generatedCount++;
            totalBilled = totalBilled.add(total);
        }

        auditLogService.log(generatedBy, "MONTHLY_BILLING_GENERATED", "INVOICE", null, null,
                Map.of("period", periodStart.toString(), "generated", generatedCount, "skipped", skippedCount, "totalBilled", totalBilled),
                "Generated " + generatedCount + " monthly invoices totaling ₹" + totalBilled);

        log.info("Monthly billing complete: generated={}, skipped={}, totalBilled={}", generatedCount, skippedCount, totalBilled);

        return Map.of(
                "billingPeriodStart", periodStart.toString(),
                "billingPeriodEnd", periodEnd.toString(),
                "invoicesGenerated", generatedCount,
                "leasesSkipped", skippedCount,
                "totalBilledAmount", totalBilled
        );
    }

    @Override
    @Transactional
    public Map<String, Object> assessLateFees(LocalDate asOfDate, BigDecimal lateFeeAmount, String assessedBy) {
        if (asOfDate == null) asOfDate = LocalDate.now();
        if (lateFeeAmount == null || lateFeeAmount.compareTo(BigDecimal.ZERO) <= 0) {
            lateFeeAmount = new BigDecimal("1000.00"); // Standard ₹1,000 late fee
        }

        LocalDate targetDate = asOfDate;
        List<Invoice> overdueInvoices = invoiceRepository.findAll().stream()
                .filter(i -> ("UNPAID".equalsIgnoreCase(i.getStatus()) || "PARTIALLY_PAID".equalsIgnoreCase(i.getStatus()))
                        && i.getDueDate().isBefore(targetDate))
                .toList();

        int assessedCount = 0;
        BigDecimal totalLateFeesAssessed = BigDecimal.ZERO;

        for (Invoice invoice : overdueInvoices) {
            boolean alreadyHasLateFee = invoice.getItems() != null && invoice.getItems().stream()
                    .anyMatch(it -> "LATE_FEE".equalsIgnoreCase(it.getItemType()));

            if (alreadyHasLateFee) continue;

            InvoiceItem lateFeeItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .description("Late Payment Assessment Fee (Overdue past " + invoice.getDueDate() + ")")
                    .itemType("LATE_FEE")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(lateFeeAmount)
                    .amount(lateFeeAmount)
                    .build();

            invoice.getItems().add(lateFeeItem);
            invoice.setSubtotal(invoice.getSubtotal().add(lateFeeAmount));
            invoice.setTotalAmount(invoice.getTotalAmount().add(lateFeeAmount));
            invoiceRepository.save(invoice);

            assessedCount++;
            totalLateFeesAssessed = totalLateFeesAssessed.add(lateFeeAmount);
        }

        auditLogService.log(assessedBy, "LATE_FEES_ASSESSED", "INVOICE", null, null,
                Map.of("asOfDate", asOfDate.toString(), "count", assessedCount, "fee", lateFeeAmount),
                "Assessed late fees on " + assessedCount + " overdue invoices totaling ₹" + totalLateFeesAssessed);

        return Map.of(
                "asOfDate", asOfDate.toString(),
                "overdueInvoicesAssessed", assessedCount,
                "lateFeePerInvoice", lateFeeAmount,
                "totalLateFeesAssessed", totalLateFeesAssessed
        );
    }
}
