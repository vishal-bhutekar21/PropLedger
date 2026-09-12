package com.propledger.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemRequest {

    @NotBlank(message = "Item description is required")
    private String description;

    @Builder.Default
    private String itemType = "RENT";

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    private BigDecimal amount;
}
