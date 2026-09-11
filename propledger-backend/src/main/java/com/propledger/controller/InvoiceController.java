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
                .filter(p -> "COMPLETED".equals(p.getStatus()))
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
