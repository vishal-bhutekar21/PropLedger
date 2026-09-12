package com.propledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotBlank(message = "Building name is required")
    @Size(max = 255)
    private String buildingName;

    @Size(max = 50)
    private String buildingCode;

    @Builder.Default
    private Short floors = 1;

    private Short yearBuilt;

    private String description;

    @Builder.Default
    private String status = "ACTIVE";
}
