package com.propledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    @NotBlank(message = "Refund reason is required")
    private String reason;
}
