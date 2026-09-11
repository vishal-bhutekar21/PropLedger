package com.propledger.controller;

import com.propledger.dto.request.ExpenseRequest;
import com.propledger.dto.response.ExpenseResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.Expense;
import com.propledger.entity.Property;
import com.propledger.entity.Vendor;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.ExpenseRepository;
import com.propledger.repository.PropertyRepository;
import com.propledger.repository.VendorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/expenses", "/api/v1/expenses"})
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Operational expense logging, categorization, and vendor attribution")
@SecurityRequirement(name = "BearerAuth")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final PropertyRepository propertyRepository;
    private final VendorRepository vendorRepository;

    @GetMapping
    @Operation(summary = "Get paginated expenses with filters")
    public ResponseEntity<PagedResponse<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Expense> expenses = expenseRepository.findWithFilters(
                propertyId, category, status, fromDate, toDate, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<ExpenseResponse>builder()
                .content(expenses.getContent().stream().map(this::toResponse).toList())
                .page(expenses.getNumber())
                .size(expenses.getSize())
                .totalElements(expenses.getTotalElements())
                .totalPages(expenses.getTotalPages())
                .last(expenses.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "expenseId", id));
        return ResponseEntity.ok(toResponse(expense));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Record new expense")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "propertyId", request.getPropertyId()));

        Vendor vendor = null;
        if (request.getVendorId() != null) {
            vendor = vendorRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", request.getVendorId()));
        }

        Expense expense = Expense.builder()
                .property(property)
                .vendor(vendor)
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .referenceNumber(request.getReferenceNumber())
                .status(request.getStatus() != null ? request.getStatus() : "PAID")
                .notes(request.getNotes())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(expenseRepository.save(expense)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete expense")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "expenseId", id));
        expenseRepository.delete(expense);
        return ResponseEntity.noContent().build();
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .expenseId(e.getExpenseId())
                .propertyId(e.getProperty().getPropertyId())
                .propertyName(e.getProperty().getPropertyName())
                .vendorId(e.getVendor() != null ? e.getVendor().getVendorId() : null)
                .vendorName(e.getVendor() != null ? e.getVendor().getCompanyName() : null)
                .category(e.getCategory())
                .description(e.getDescription())
                .amount(e.getAmount())
                .expenseDate(e.getExpenseDate())
                .referenceNumber(e.getReferenceNumber())
                .status(e.getStatus())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
