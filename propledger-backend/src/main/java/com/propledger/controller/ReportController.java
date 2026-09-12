package com.propledger.controller;

import com.propledger.report.ReportRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Business intelligence reports using native SQL with CTEs and window functions")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
public class ReportController {

    private final ReportRepository reportRepo;
    private final com.propledger.repository.OwnerRepository ownerRepository;
    private final com.propledger.repository.PropertyRepository propertyRepository;
    private final com.propledger.repository.PaymentRepository paymentRepository;
    private final com.propledger.repository.ExpenseRepository expenseRepository;

    @GetMapping("/occupancy")
    @Operation(summary = "Property occupancy report with RANK window function")
    public ResponseEntity<List<Map<String, Object>>> occupancy() {
        return ResponseEntity.ok(reportRepo.getOccupancyReport());
    }

    @GetMapping("/outstanding-rent")
    @Operation(summary = "Outstanding rent report with days overdue calculation")
    public ResponseEntity<List<Map<String, Object>>> outstandingRent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(reportRepo.getOutstandingRentReport(page, size));
    }

    @GetMapping("/profitability")
    @Operation(summary = "Property profitability: revenue - expenses - maintenance cost (with RANK)")
    public ResponseEntity<List<Map<String, Object>>> profitability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().withDayOfYear(1);
        if (toDate == null) toDate = LocalDate.now();
        return ResponseEntity.ok(reportRepo.getProfitabilityReport(fromDate, toDate));
    }

    @GetMapping("/maintenance-performance")
    @Operation(summary = "Maintenance KPIs per property with DENSE_RANK by cost")
    public ResponseEntity<List<Map<String, Object>>> maintenancePerformance() {
        return ResponseEntity.ok(reportRepo.getMaintenancePerformanceReport());
    }

    @GetMapping("/revenue-trend")
    @Operation(summary = "Monthly revenue trend with LAG window function for MoM change")
    public ResponseEntity<List<Map<String, Object>>> revenueTrend(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(reportRepo.getRevenueTrend(months));
    }

    @GetMapping("/owner-distribution")
    @Operation(summary = "Calculate owner payout statements with gross collections, management fees, and expense deductions")
    public ResponseEntity<List<com.propledger.dto.response.OwnerDistributionResponse>> ownerDistribution(
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "8.0") java.math.BigDecimal managementFeeRate) {

        LocalDate start = fromDate != null ? fromDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = toDate != null ? toDate : LocalDate.now();

        List<com.propledger.entity.Owner> owners = (ownerId != null)
                ? ownerRepository.findById(ownerId).map(List::of).orElse(List.of())
                : ownerRepository.findAll();

        List<com.propledger.dto.response.OwnerDistributionResponse> list = new java.util.ArrayList<>();

        for (com.propledger.entity.Owner owner : owners) {
            List<com.propledger.entity.Property> properties = propertyRepository.findAll().stream()
                    .filter(p -> p.getOwner() != null && p.getOwner().getOwnerId().equals(owner.getOwnerId()))
                    .toList();

            List<Long> propertyIds = properties.stream().map(com.propledger.entity.Property::getPropertyId).toList();
            List<String> propertyNames = properties.stream().map(com.propledger.entity.Property::getPropertyName).toList();

            java.math.BigDecimal grossCollections = paymentRepository.findAll().stream()
                    .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()) &&
                            (p.getPaymentDate().isEqual(start) || p.getPaymentDate().isAfter(start)) &&
                            (p.getPaymentDate().isEqual(end) || p.getPaymentDate().isBefore(end)) &&
                            p.getInvoice() != null && p.getInvoice().getLease() != null &&
                            p.getInvoice().getLease().getUnit() != null &&
                            p.getInvoice().getLease().getUnit().getBuilding() != null &&
                            p.getInvoice().getLease().getUnit().getBuilding().getProperty() != null &&
                            propertyIds.contains(p.getInvoice().getLease().getUnit().getBuilding().getProperty().getPropertyId()))
                    .map(com.propledger.entity.Payment::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal totalExpenses = expenseRepository.findAll().stream()
                    .filter(e -> "PAID".equalsIgnoreCase(e.getStatus()) &&
                            (e.getExpenseDate().isEqual(start) || e.getExpenseDate().isAfter(start)) &&
                            (e.getExpenseDate().isEqual(end) || e.getExpenseDate().isBefore(end)) &&
                            e.getProperty() != null && propertyIds.contains(e.getProperty().getPropertyId()))
                    .map(com.propledger.entity.Expense::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal feeMultiplier = managementFeeRate.divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal feeAmount = grossCollections.multiply(feeMultiplier).setScale(2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal netPayout = grossCollections.subtract(feeAmount).subtract(totalExpenses).max(java.math.BigDecimal.ZERO);

            list.add(com.propledger.dto.response.OwnerDistributionResponse.builder()
                    .ownerId(owner.getOwnerId())
                    .ownerName(owner.getFullName())
                    .companyName(owner.getCompanyName())
                    .email(owner.getEmail())
                    .phone(owner.getPhone())
                    .periodStart(start)
                    .periodEnd(end)
                    .propertyCount(properties.size())
                    .propertyNames(propertyNames)
                    .grossRentCollected(grossCollections)
                    .managementFeeRate(managementFeeRate)
                    .managementFeeAmount(feeAmount)
                    .totalExpensesIncurred(totalExpenses)
                    .netOwnerPayout(netPayout)
                    .currency("INR (₹)")
                    .build());
        }

        return ResponseEntity.ok(list);
    }
}
