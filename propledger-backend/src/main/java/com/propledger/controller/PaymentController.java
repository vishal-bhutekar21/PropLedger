package com.propledger.controller;

import com.propledger.dto.request.PaymentRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.PaymentResponse;
import com.propledger.service.impl.PaymentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Transactional payment recording")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentServiceImpl paymentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<PaymentResponse>> list(
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getPayments(invoiceId, status, fromDate, toDate,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "paymentDate"))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @GetMapping("/{id}/receipt")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get formal payment receipt breakdown")
    public ResponseEntity<com.propledger.dto.response.ReceiptResponse> getReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getReceipt(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'TENANT', 'SUPER_ADMIN')")
    @Operation(summary = "Record payment — atomic transaction: validates, inserts, updates invoice status, logs audit")
    public ResponseEntity<PaymentResponse> record(@Valid @RequestBody PaymentRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(request, auth.getName()));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
    @Operation(summary = "Refund or reverse a payment (chargeback, bounced cheque, duplicate)")
    public ResponseEntity<PaymentResponse> refund(
            @PathVariable Long id,
            @Valid @RequestBody com.propledger.dto.request.RefundRequest request,
            Authentication auth) {
        return ResponseEntity.ok(paymentService.refundPayment(id, request, auth.getName()));
    }
}
