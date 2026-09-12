package com.propledger.controller;

import com.propledger.dto.response.InvoiceItemResponse;
import com.propledger.dto.response.InvoiceResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.Invoice;
import com.propledger.entity.InvoiceItem;
import com.propledger.entity.Payment;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.InvoiceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/invoices", "/api/v1/invoices"})
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Rental billing, recurring invoice generation, tracking, and aging")
@SecurityRequirement(name = "BearerAuth")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final com.propledger.repository.LeaseRepository leaseRepository;
    private final com.propledger.service.BillingService billingService;

    @PostMapping("/generate-monthly")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Batch generate monthly rent invoices for all active leases")
    public ResponseEntity<java.util.Map<String, Object>> generateMonthly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate billingDate,
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(billingService.generateMonthlyInvoices(billingDate, auth != null ? auth.getName() : "ADMIN"));
    }

    @PostMapping("/assess-late-fees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Assess late fees on all overdue invoices")
    public ResponseEntity<java.util.Map<String, Object>> assessLateFees(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @RequestParam(required = false) BigDecimal feeAmount,
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(billingService.assessLateFees(asOfDate, feeAmount, auth != null ? auth.getName() : "ADMIN"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Create an invoice manually with line items")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody com.propledger.dto.request.InvoiceRequest request) {
        com.propledger.entity.Lease lease = leaseRepository.findById(request.getLeaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Lease", "leaseId", request.getLeaseId()));

        String invoiceNumber = (request.getInvoiceNumber() != null && !request.getInvoiceNumber().isBlank())
                ? request.getInvoiceNumber()
                : "INV-" + java.time.format.DateTimeFormatter.ofPattern("yyyyMM").format(request.getInvoiceDate()) + "-" + String.format("%05d", (int)(Math.random() * 90000) + 10000);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<InvoiceItem> items = new java.util.ArrayList<>();

        Invoice invoice = Invoice.builder()
                .lease(lease)
                .invoiceNumber(invoiceNumber)
                .invoiceDate(request.getInvoiceDate())
                .dueDate(request.getDueDate())
                .billingPeriodStart(request.getBillingPeriodStart())
                .billingPeriodEnd(request.getBillingPeriodEnd())
                .status("UNPAID")
                .notes(request.getNotes())
                .build();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (com.propledger.dto.request.InvoiceItemRequest itemReq : request.getItems()) {
                BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
                BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal itemAmount = (itemReq.getAmount() != null && itemReq.getAmount().compareTo(BigDecimal.ZERO) > 0)
                        ? itemReq.getAmount()
                        : qty.multiply(unitPrice);

                subtotal = subtotal.add(itemAmount);

                items.add(InvoiceItem.builder()
                        .invoice(invoice)
                        .description(itemReq.getDescription())
                        .itemType(itemReq.getItemType() != null ? itemReq.getItemType() : "RENT")
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .amount(itemAmount)
                        .build());
            }
        } else {
            // Default base rent line item if empty
            BigDecimal rent = lease.getMonthlyRent();
            subtotal = rent;
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .description("Monthly Base Rent")
                    .itemType("RENT")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(rent)
                    .amount(rent)
                    .build());
        }

        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax);

        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setTotalAmount(total);
        invoice.setItems(items);

        Invoice saved = invoiceRepository.save(invoice);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(toResponse(saved));
    }

    @GetMapping
    @Operation(summary = "Get paginated invoices with filter by lease, status, date range")
    public ResponseEntity<PagedResponse<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) Long leaseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Invoice> invoices = invoiceRepository.findWithFilters(
                leaseId, status, fromDate, toDate, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<InvoiceResponse>builder()
                .content(invoices.getContent().stream().map(this::toResponse).toList())
                .page(invoices.getNumber())
                .size(invoices.getSize())
                .totalElements(invoices.getTotalElements())
                .totalPages(invoices.getTotalPages())
                .last(invoices.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice details with line items and payment history")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "invoiceId", id));
        return ResponseEntity.ok(toResponse(invoice));
    }

    @PatchMapping("/{id}/void")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Void an invoice")
    public ResponseEntity<InvoiceResponse> voidInvoice(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "invoiceId", id));
        invoice.setStatus("VOID");
        return ResponseEntity.ok(toResponse(invoiceRepository.save(invoice)));
    }

    private InvoiceResponse toResponse(Invoice i) {
        BigDecimal paid = i.getPayments() != null ? i.getPayments().stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()) || "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;

        BigDecimal outstanding = i.getTotalAmount().subtract(paid).max(BigDecimal.ZERO);

        List<InvoiceItemResponse> items = i.getItems() != null ? i.getItems().stream()
                .map(it -> InvoiceItemResponse.builder()
                        .itemId(it.getItemId())
                        .itemType(it.getItemType())
                        .description(it.getDescription())
                        .quantity(it.getQuantity())
                        .unitPrice(it.getUnitPrice())
                        .amount(it.getAmount())
                        .build())
                .toList() : List.of();

        return InvoiceResponse.builder()
                .invoiceId(i.getInvoiceId())
                .leaseId(i.getLease().getLeaseId())
                .tenantName(i.getLease().getTenant().getFullName())
                .unitNumber(i.getLease().getUnit().getUnitNumber())
                .propertyName(i.getLease().getUnit().getBuilding().getProperty().getPropertyName())
                .invoiceNumber(i.getInvoiceNumber())
                .invoiceDate(i.getInvoiceDate())
                .dueDate(i.getDueDate())
                .billingPeriodStart(i.getBillingPeriodStart())
                .billingPeriodEnd(i.getBillingPeriodEnd())
                .subtotal(i.getSubtotal())
                .tax(i.getTax())
                .totalAmount(i.getTotalAmount())
                .paidAmount(paid)
                .outstandingAmount(outstanding)
                .status(i.getStatus())
                .notes(i.getNotes())
                .items(items)
                .createdAt(i.getCreatedAt())
                .build();
    }
}
