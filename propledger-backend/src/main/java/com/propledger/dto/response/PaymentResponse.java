package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data @Builder
public class PaymentResponse {
    private Long paymentId;
    private Long invoiceId;
    private String invoiceNumber;
    private String tenantName;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String transactionReference;
    private String status;
    private String notes;
    private OffsetDateTime createdAt;
}
