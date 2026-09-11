package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long expenseId;
    private Long propertyId;
    private String propertyName;
    private Long vendorId;
    private String vendorName;
    private String category;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String referenceNumber;
    private String status;
    private String notes;
    private OffsetDateTime createdAt;
}
