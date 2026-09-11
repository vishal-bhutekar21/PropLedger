package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class DashboardSummary {
    private long totalProperties;
    private long totalBuildings;
    private long totalUnits;
    private long occupiedUnits;
    private long vacantUnits;
    private BigDecimal occupancyRate;
    private BigDecimal monthlyRevenue;
    private BigDecimal outstandingAmount;
    private BigDecimal maintenanceCost;
    private BigDecimal netOperatingIncome;
    private long openMaintenanceRequests;
    private long urgentMaintenanceRequests;
    private long activeTenants;
    private long activeLeases;
    private long leasesExpiringIn30Days;
    private long overdueInvoices;
}
