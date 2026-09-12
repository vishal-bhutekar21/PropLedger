package com.propledger.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingResponse {
    private Long buildingId;
    private Long propertyId;
    private String propertyName;
    private String buildingName;
    private String buildingCode;
    private Short floors;
    private Short yearBuilt;
    private String description;
    private String status;
    private int totalUnits;
    private OffsetDateTime createdAt;
}
