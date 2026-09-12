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
public class ReceiptResponse {
    private String receiptNumber;
    private Long paymentId;
    private Long invoiceId;
    private String invoiceNumber;
    private String tenantName;
    private String tenantEmail;
    private String unitNumber;
    private String propertyName;
    private String propertyAddress;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String transactionReference;
    private String status;
    private String notes;
    private String recordedBy;
    private BigDecimal invoiceTotalAmount;
    private BigDecimal invoiceRemainingBalance;
    private OffsetDateTime issuedAt;
}
