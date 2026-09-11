package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @Builder
public class InvoiceItemResponse {
    private Long itemId;
    private String description;
    private String itemType;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}
