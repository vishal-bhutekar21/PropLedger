package com.propledger.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDistributionResponse {
    private Long ownerId;
    private String ownerName;
    private String companyName;
    private String email;
    private String phone;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private int propertyCount;
    private List<String> propertyNames;
    private BigDecimal grossRentCollected;
    private BigDecimal managementFeeRate;
    private BigDecimal managementFeeAmount;
    private BigDecimal totalExpensesIncurred;
    private BigDecimal netOwnerPayout;
    private String currency;
}
