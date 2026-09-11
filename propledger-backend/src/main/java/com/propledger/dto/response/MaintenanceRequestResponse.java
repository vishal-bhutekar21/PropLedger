package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @Builder
public class MaintenanceRequestResponse {
    private Long requestId;
    private Long unitId;
    private String unitNumber;
    private String propertyName;
    private Long tenantId;
    private String tenantName;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private OffsetDateTime resolvedAt;
    private String resolutionNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
