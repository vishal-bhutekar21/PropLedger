package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class PropertyResponse {
    private Long propertyId;
    private Long ownerId;
    private String ownerName;
    private String propertyName;
    private String propertyType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String description;
    private BigDecimal totalAreaSqft;
    private Short yearBuilt;
    private String status;
    // Derived occupancy stats (from view/query)
    private Long totalUnits;
    private Long occupiedUnits;
    private Long vacantUnits;
    private BigDecimal occupancyRate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
