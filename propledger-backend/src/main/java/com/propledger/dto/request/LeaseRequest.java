package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LeaseRequest {
    @NotNull private Long unitId;
    @NotNull private Long tenantId;
    @NotNull @DecimalMin("0.01") private BigDecimal monthlyRent;
    @DecimalMin("0") private BigDecimal securityDeposit;
    @Min(1) @Max(28) private Short paymentDueDay;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private String notes;
}
