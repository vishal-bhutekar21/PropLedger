package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @Builder
public class UnitResponse {
    private Long unitId;
    private Long buildingId;
    private String buildingName;
    private Long propertyId;
    private String propertyName;
    private String unitNumber;
    private String unitType;
    private Short floorNumber;
    private Short bedrooms;
    private Short bathrooms;
    private BigDecimal areaSqft;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private String status;
    private String description;
    private String amenities;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
