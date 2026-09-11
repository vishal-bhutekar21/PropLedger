package com.propledger.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    @NotNull
    private Long propertyId;

    private Long vendorId;

    @NotBlank @Size(max = 50)
    private String category;

    @NotBlank
    private String description;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private LocalDate expenseDate;

    @Size(max = 100)
    private String referenceNumber;

    private String status;
    private String notes;
}
