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
public class DepositSettlementResponse {
    private String settlementNumber;
    private Long leaseId;
    private String tenantName;
    private String unitNumber;
    private String propertyName;
    private BigDecimal originalDeposit;
    private BigDecimal damageDeductions;
    private BigDecimal unpaidRentDeductions;
    private BigDecimal totalDeductions;
    private BigDecimal netRefundAmount;
    private String deductionNotes;
    private String settledBy;
    private LocalDate settlementDate;
    private String leaseStatus;
    private OffsetDateTime timestamp;
}
