package com.propledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderRequest {

    @NotNull(message = "Maintenance Request ID is required")
    private Long requestId;

    private Long vendorId;

    private String workOrderNumber;

    @NotBlank(message = "Description is required")
    private String description;

    private LocalDate scheduledDate;

    private LocalDate completionDate;

    private BigDecimal estimatedCost;

    private BigDecimal actualCost;

    @Builder.Default
    private String status = "PENDING";

    private String vendorNotes;

    private String internalNotes;
}
