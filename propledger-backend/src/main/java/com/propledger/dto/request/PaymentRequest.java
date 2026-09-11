package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    @NotNull private Long invoiceId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    @NotNull private LocalDate paymentDate;
    @NotBlank private String paymentMethod;
    private String transactionReference;
    private String notes;
}
