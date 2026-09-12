package com.propledger.service.impl;

import com.propledger.dto.request.PaymentRequest;
import com.propledger.dto.response.InvoiceResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.PaymentResponse;
import com.propledger.entity.*;
import com.propledger.exception.BusinessException;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.*;
import com.propledger.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /**
     * PAYMENT TRANSACTION:
     * BEGIN
     *   1. Validate invoice exists and is not VOID/WAIVED
     *   2. Validate payment amount > 0
     *   3. Check payment doesn't exceed outstanding balance
     *   4. Insert payment record with status=SUCCESS
     *   5. DB trigger fn_refresh_invoice_status fires automatically,
     *      updating invoice.status to PAID/PARTIALLY_PAID/OVERDUE
     *   6. Write audit log (same transaction)
     * COMMIT
     *
     * If any step throws, Spring rolls back the entire transaction.
     */
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request, String recordedByUsername) {
        // ── STEP 1: Validate invoice
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", request.getInvoiceId()));

        if ("VOID".equals(invoice.getStatus()) || "WAIVED".equals(invoice.getStatus())) {
            throw new BusinessException("Cannot record payment for a " + invoice.getStatus() + " invoice.");
        }
        if ("PAID".equals(invoice.getStatus())) {
            throw new BusinessException("Invoice " + invoice.getInvoiceNumber() + " is already fully paid.");
        }

        // ── STEP 2: Calculate outstanding balance
        BigDecimal alreadyPaid = paymentRepository.sumSuccessfulPayments(invoice.getInvoiceId());
        BigDecimal outstanding = invoice.getTotalAmount().subtract(alreadyPaid);

        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Invoice " + invoice.getInvoiceNumber() + " has no outstanding balance.");
        }

        // ── STEP 3: Validate amount
        if (request.getAmount().compareTo(outstanding) > 0) {
            throw new BusinessException(
                "Payment amount " + request.getAmount() + " exceeds outstanding balance " + outstanding +
                " for invoice " + invoice.getInvoiceNumber());
        }

        // ── STEP 4: Get recording user
        User recordedBy = userRepository.findByUsername(recordedByUsername).orElse(null);

        // ── STEP 5: Insert payment
        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(request.getTransactionReference())
                .status("SUCCESS")
                .notes(request.getNotes())
                .recordedBy(recordedBy)
                .build();

        payment = paymentRepository.save(payment);
        // DB trigger fn_refresh_invoice_status automatically updates invoice.status

        // ── STEP 6: Audit log (inside same transaction)
        auditLogService.log(recordedByUsername, "PAYMENT_CREATED", "PAYMENT", payment.getPaymentId(),
            null,
            Map.of("invoice", invoice.getInvoiceNumber(), "amount", payment.getAmount(),
                   "method", payment.getPaymentMethod()),
            "Payment of " + payment.getAmount() + " recorded for invoice " + invoice.getInvoiceNumber()
        );

        log.info("Payment {} recorded for invoice {}: amount={}",
                payment.getPaymentId(), invoice.getInvoiceNumber(), payment.getAmount());

        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse refundPayment(Long id, com.propledger.dto.request.RefundRequest request, String refundedByUsername) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));

        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            throw new BusinessException("Cannot refund payment with status: " + payment.getStatus());
        }

        payment.setStatus("REFUNDED");
        payment.setNotes((payment.getNotes() != null ? payment.getNotes() : "") + " [Refunded: " + request.getReason() + "]");
        Payment saved = paymentRepository.save(payment);

        auditLogService.log(refundedByUsername, "PAYMENT_REFUNDED", "PAYMENT", saved.getPaymentId(),
                null,
                Map.of("invoice", payment.getInvoice().getInvoiceNumber(), "amount", payment.getAmount(), "reason", request.getReason()),
                "Payment of " + payment.getAmount() + " refunded: " + request.getReason()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public com.propledger.dto.response.ReceiptResponse getReceipt(Long id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));

        Invoice inv = p.getInvoice();
        Lease lease = inv.getLease();
        Tenant tenant = lease.getTenant();
        Unit unit = lease.getUnit();
        Property prop = unit.getBuilding().getProperty();

        BigDecimal alreadyPaid = paymentRepository.sumSuccessfulPayments(inv.getInvoiceId());
        BigDecimal outstanding = inv.getTotalAmount().subtract(alreadyPaid).max(BigDecimal.ZERO);

        return com.propledger.dto.response.ReceiptResponse.builder()
                .receiptNumber("RCP-" + p.getPaymentId() + "-" + p.getPaymentDate().toString().replace("-", ""))
                .paymentId(p.getPaymentId())
                .invoiceId(inv.getInvoiceId())
                .invoiceNumber(inv.getInvoiceNumber())
                .tenantName(tenant.getFullName())
                .tenantEmail(tenant.getEmail())
                .unitNumber(unit.getUnitNumber())
                .propertyName(prop.getPropertyName())
                .propertyAddress(prop.getAddressLine1() + ", " + prop.getCity())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod())
                .transactionReference(p.getTransactionReference())
                .status(p.getStatus())
                .notes(p.getNotes())
                .recordedBy(p.getRecordedBy() != null ? p.getRecordedBy().getUsername() : "System")
                .invoiceTotalAmount(inv.getTotalAmount())
                .invoiceRemainingBalance(outstanding)
                .issuedAt(p.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        return mapToResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<PaymentResponse> getPayments(Long invoiceId, String status,
                                                      LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Page<Payment> page = paymentRepository.findWithFilters(invoiceId, status, fromDate, toDate, pageable);
        return PagedResponse.<PaymentResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .first(page.isFirst()).last(page.isLast())
                .build();
    }

    private PaymentResponse mapToResponse(Payment p) {
        Lease lease = p.getInvoice().getLease();
        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .invoiceId(p.getInvoice().getInvoiceId())
                .invoiceNumber(p.getInvoice().getInvoiceNumber())
                .tenantName(lease.getTenant().getFullName())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod())
                .transactionReference(p.getTransactionReference())
                .status(p.getStatus())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
