package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PropertyRequest {
    @NotNull private Long ownerId;
    @NotBlank @Size(max = 255) private String propertyName;
    @NotBlank private String propertyType;
    @NotBlank @Size(max = 255) private String addressLine1;
    private String addressLine2;
    @NotBlank @Size(max = 100) private String city;
    @NotBlank @Size(max = 100) private String state;
    @NotBlank @Size(max = 20) private String zipCode;
    private String country;
    private String description;
    @DecimalMin("0") private BigDecimal totalAreaSqft;
    @Min(1800) @Max(2100) private Short yearBuilt;
    private String status;
}
