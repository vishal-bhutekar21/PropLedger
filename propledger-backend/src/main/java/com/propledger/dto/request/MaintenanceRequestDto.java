package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceRequestDto {
    @NotNull private Long unitId;
    private Long tenantId;
    @NotBlank @Size(max = 255) private String title;
    @NotBlank private String description;
    private String category;
    private String priority;
    private BigDecimal estimatedCost;
    private LocalDate scheduledDate;
}
