package com.propledger.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositSettlementRequest {

    @Builder.Default
    private BigDecimal damageDeductions = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal unpaidRentDeductions = BigDecimal.ZERO;

    private String deductionNotes;
}
