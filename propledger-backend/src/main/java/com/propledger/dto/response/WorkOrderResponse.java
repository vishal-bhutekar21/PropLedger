package com.propledger.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderResponse {
    private Long workOrderId;
    private Long requestId;
    private String requestTitle;
    private String unitNumber;
    private String propertyName;
    private Long vendorId;
    private String vendorName;
    private String workOrderNumber;
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completionDate;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String status;
    private String vendorNotes;
    private String internalNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
