package com.propledger.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {

    @NotNull(message = "Lease ID is required")
    private Long leaseId;

    private String invoiceNumber;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private LocalDate billingPeriodStart;

    private LocalDate billingPeriodEnd;

    private BigDecimal tax;

    private String notes;

    @Builder.Default
    private List<InvoiceItemRequest> items = new ArrayList<>();
}
