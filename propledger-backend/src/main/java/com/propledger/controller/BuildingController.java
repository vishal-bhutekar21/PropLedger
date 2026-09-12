package com.propledger.controller;

import com.propledger.dto.request.BuildingRequest;
import com.propledger.dto.response.BuildingResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.Building;
import com.propledger.entity.Property;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.BuildingRepository;
import com.propledger.repository.PropertyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/buildings", "/api/v1/buildings"})
@RequiredArgsConstructor
@Tag(name = "Buildings", description = "Building asset inventory and hierarchy management")
@SecurityRequirement(name = "bearerAuth")
public class BuildingController {

    private final BuildingRepository buildingRepository;
    private final PropertyRepository propertyRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List buildings with optional property filter and pagination")
    public ResponseEntity<PagedResponse<BuildingResponse>> list(
            @RequestParam(required = false) Long propertyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "buildingName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Building> buildings = (propertyId != null)
                ? buildingRepository.findByProperty_PropertyId(propertyId, PageRequest.of(page, size, sort))
                : buildingRepository.findAll(PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<BuildingResponse>builder()
                .content(buildings.getContent().stream().map(this::toResponse).toList())
                .page(buildings.getNumber())
                .size(buildings.getSize())
                .totalElements(buildings.getTotalElements())
                .totalPages(buildings.getTotalPages())
                .first(buildings.isFirst())
                .last(buildings.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get building details by ID")
    public ResponseEntity<BuildingResponse> getById(@PathVariable Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building", "buildingId", id));
        return ResponseEntity.ok(toResponse(building));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Create a new building under a property")
    public ResponseEntity<BuildingResponse> create(@Valid @RequestBody BuildingRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "propertyId", request.getPropertyId()));

        Building building = Building.builder()
                .property(property)
                .buildingName(request.getBuildingName())
                .buildingCode(request.getBuildingCode())
                .floors(request.getFloors())
                .yearBuilt(request.getYearBuilt())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(buildingRepository.save(building)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Update building details")
    public ResponseEntity<BuildingResponse> update(@PathVariable Long id, @Valid @RequestBody BuildingRequest request) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building", "buildingId", id));

        if (request.getPropertyId() != null && !building.getProperty().getPropertyId().equals(request.getPropertyId())) {
            Property property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Property", "propertyId", request.getPropertyId()));
            building.setProperty(property);
        }

        building.setBuildingName(request.getBuildingName());
        building.setBuildingCode(request.getBuildingCode());
        if (request.getFloors() != null) building.setFloors(request.getFloors());
        if (request.getYearBuilt() != null) building.setYearBuilt(request.getYearBuilt());
        if (request.getDescription() != null) building.setDescription(request.getDescription());
        if (request.getStatus() != null) building.setStatus(request.getStatus());

        return ResponseEntity.ok(toResponse(buildingRepository.save(building)));
    }

    private BuildingResponse toResponse(Building b) {
        return BuildingResponse.builder()
                .buildingId(b.getBuildingId())
                .propertyId(b.getProperty() != null ? b.getProperty().getPropertyId() : null)
                .propertyName(b.getProperty() != null ? b.getProperty().getPropertyName() : null)
                .buildingName(b.getBuildingName())
                .buildingCode(b.getBuildingCode())
                .floors(b.getFloors())
                .yearBuilt(b.getYearBuilt())
                .description(b.getDescription())
                .status(b.getStatus())
                .totalUnits(b.getUnits() != null ? b.getUnits().size() : 0)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
