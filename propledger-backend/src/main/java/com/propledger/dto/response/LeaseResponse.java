package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data @Builder
public class LeaseResponse {
    private Long leaseId;
    private Long unitId;
    private String unitNumber;
    private String buildingName;
    private String propertyName;
    private Long tenantId;
    private String tenantName;
    private String tenantEmail;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private Short paymentDueDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Boolean isRenewal;
    private Long parentLeaseId;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
