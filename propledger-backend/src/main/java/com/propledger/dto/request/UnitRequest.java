package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UnitRequest {
    @NotNull private Long buildingId;
    @NotBlank @Size(max = 50) private String unitNumber;
    @NotBlank private String unitType;
    private Short floorNumber;
    @Min(0) private Short bedrooms;
    @Min(0) private Short bathrooms;
    @DecimalMin("0.01") private BigDecimal areaSqft;
    @NotNull @DecimalMin("0") private BigDecimal monthlyRent;
    @DecimalMin("0") private BigDecimal securityDeposit;
    private String status;
    private String description;
    private String amenities;
}
