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
}
