package com.propledger.controller;

import com.propledger.dto.response.DashboardSummary;
import com.propledger.report.ReportRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Real-time dashboard metrics")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final ReportRepository reportRepo;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard KPI summary — all metrics from real SQL queries")
    public ResponseEntity<DashboardSummary> getSummary() {
        Map<String, Object> data = reportRepo.getDashboardSummary();
        DashboardSummary summary = DashboardSummary.builder()
                .totalProperties(toLong(data.get("total_properties")))
                .totalBuildings(toLong(data.get("total_buildings")))
                .totalUnits(toLong(data.get("total_units")))
                .occupiedUnits(toLong(data.get("occupied_units")))
                .vacantUnits(toLong(data.get("vacant_units")))
                .occupancyRate(toDecimal(data.get("occupancy_rate")))
                .monthlyRevenue(toDecimal(data.get("monthly_revenue")))
                .outstandingAmount(toDecimal(data.get("outstanding_amount")))
                .maintenanceCost(toDecimal(data.get("maintenance_cost")))
                .netOperatingIncome(toDecimal(data.get("net_operating_income")))
                .openMaintenanceRequests(toLong(data.get("open_requests")))
                .urgentMaintenanceRequests(toLong(data.get("urgent_requests")))
                .activeTenants(toLong(data.get("active_tenants")))
                .activeLeases(toLong(data.get("active_leases")))
                .leasesExpiringIn30Days(toLong(data.get("leases_expiring_30")))
                .overdueInvoices(toLong(data.get("overdue_invoices")))
                .build();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/revenue-trend")
    @Operation(summary = "Monthly revenue trend with LAG window function for MoM change")
    public ResponseEntity<List<Map<String, Object>>> revenueTrend(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(reportRepo.getRevenueTrend(months));
    }

    @GetMapping("/top-properties")
    @Operation(summary = "Top properties by revenue (RANK window function)")
    public ResponseEntity<List<Map<String, Object>>> topProperties(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportRepo.getTopPropertiesByRevenue(limit));
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(v.toString());
    }

    private BigDecimal toDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(v.toString());
    }
}
