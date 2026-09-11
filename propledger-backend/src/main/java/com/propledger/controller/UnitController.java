package com.propledger.controller;

import com.propledger.dto.request.UnitRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.UnitResponse;
import com.propledger.entity.Building;
import com.propledger.entity.Unit;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.BuildingRepository;
import com.propledger.repository.UnitRepository;
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

@RestController
@RequestMapping({"/api/units", "/api/v1/units"})
@RequiredArgsConstructor
@Tag(name = "Units", description = "Unit inventory management, rent pricing, and status tracking")
@SecurityRequirement(name = "BearerAuth")
public class UnitController {

    private final UnitRepository unitRepository;
    private final BuildingRepository buildingRepository;

    @GetMapping
    @Operation(summary = "List units with multi-level filtering and pagination")
    public ResponseEntity<PagedResponse<UnitResponse>> getUnits(
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String unitType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "unitNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Unit> units = unitRepository.findWithFilters(
                propertyId, buildingId, status, unitType, search, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<UnitResponse>builder()
                .content(units.getContent().stream().map(this::toResponse).toList())
                .page(units.getNumber())
                .size(units.getSize())
                .totalElements(units.getTotalElements())
                .totalPages(units.getTotalPages())
                .last(units.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit by ID")
    public ResponseEntity<UnitResponse> getUnitById(@PathVariable Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "unitId", id));
        return ResponseEntity.ok(toResponse(unit));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Create a new unit")
    public ResponseEntity<UnitResponse> createUnit(@Valid @RequestBody UnitRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building", "buildingId", request.getBuildingId()));

        Unit unit = Unit.builder()
                .building(building)
                .unitNumber(request.getUnitNumber())
                .unitType(request.getUnitType())
                .floorNumber(request.getFloorNumber())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .areaSqft(request.getAreaSqft())
                .monthlyRent(request.getMonthlyRent())
                .securityDeposit(request.getSecurityDeposit())
                .status(request.getStatus() != null ? request.getStatus() : "VACANT")
                .description(request.getDescription())
                .amenities(request.getAmenities())
                .build();

        Unit saved = unitRepository.save(unit);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Update unit details, rent price, or status")
    public ResponseEntity<UnitResponse> updateUnit(@PathVariable Long id, @Valid @RequestBody UnitRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "unitId", id));

        if (request.getBuildingId() != null && !request.getBuildingId().equals(unit.getBuilding().getBuildingId())) {
            Building building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Building", "buildingId", request.getBuildingId()));
            unit.setBuilding(building);
        }

        unit.setUnitNumber(request.getUnitNumber());
        unit.setUnitType(request.getUnitType());
        unit.setFloorNumber(request.getFloorNumber());
        unit.setBedrooms(request.getBedrooms());
        unit.setBathrooms(request.getBathrooms());
        unit.setAreaSqft(request.getAreaSqft());
        unit.setMonthlyRent(request.getMonthlyRent());
        unit.setSecurityDeposit(request.getSecurityDeposit());
        if (request.getStatus() != null) unit.setStatus(request.getStatus());
        unit.setDescription(request.getDescription());
        unit.setAmenities(request.getAmenities());

        return ResponseEntity.ok(toResponse(unitRepository.save(unit)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'LEASING_AGENT')")
    @Operation(summary = "Quick update unit status (VACANT, OCCUPIED, RESERVED, MAINTENANCE)")
    public ResponseEntity<UnitResponse> updateUnitStatus(@PathVariable Long id, @RequestParam String status) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "unitId", id));
        unit.setStatus(status.toUpperCase());
        return ResponseEntity.ok(toResponse(unitRepository.save(unit)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete unit")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "unitId", id));
        unitRepository.delete(unit);
        return ResponseEntity.noContent().build();
    }

    private UnitResponse toResponse(Unit u) {
        return UnitResponse.builder()
                .unitId(u.getUnitId())
                .buildingId(u.getBuilding().getBuildingId())
                .buildingName(u.getBuilding().getBuildingName())
                .propertyId(u.getBuilding().getProperty().getPropertyId())
                .propertyName(u.getBuilding().getProperty().getPropertyName())
                .unitNumber(u.getUnitNumber())
                .unitType(u.getUnitType())
                .floorNumber(u.getFloorNumber())
                .bedrooms(u.getBedrooms())
                .bathrooms(u.getBathrooms())
                .areaSqft(u.getAreaSqft())
                .monthlyRent(u.getMonthlyRent())
                .securityDeposit(u.getSecurityDeposit())
                .status(u.getStatus())
                .description(u.getDescription())
                .amenities(u.getAmenities())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
