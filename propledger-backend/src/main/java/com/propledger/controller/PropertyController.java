package com.propledger.controller;

import com.propledger.dto.request.PropertyRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.PropertyResponse;
import com.propledger.entity.Owner;
import com.propledger.entity.Property;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.OwnerRepository;
import com.propledger.repository.PropertyRepository;
import com.propledger.report.ReportRepository;
import com.propledger.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
@Tag(name = "Properties", description = "Property management operations")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyRepository propertyRepo;
    private final OwnerRepository ownerRepo;
    private final ReportRepository reportRepo;
    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List properties with filtering, sorting, and pagination")
    public ResponseEntity<PagedResponse<PropertyResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "propertyName") String sort,
            @RequestParam(defaultValue = "asc") String dir) {

        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        Page<Property> propPage = propertyRepo.findWithFilters(city, status, type, search, pageable);

        List<PropertyResponse> content = propPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return ResponseEntity.ok(PagedResponse.<PropertyResponse>builder()
                .content(content).page(propPage.getNumber()).size(propPage.getSize())
                .totalElements(propPage.getTotalElements()).totalPages(propPage.getTotalPages())
                .first(propPage.isFirst()).last(propPage.isLast()).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get property details with occupancy statistics")
    public ResponseEntity<PropertyResponse> getById(@PathVariable Long id) {
        Property prop = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        return ResponseEntity.ok(mapToResponse(prop));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Create a new property")
    public ResponseEntity<PropertyResponse> create(@Valid @RequestBody PropertyRequest request, Authentication auth) {
        Owner owner = ownerRepo.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", request.getOwnerId()));

        Property property = Property.builder()
                .owner(owner)
                .propertyName(request.getPropertyName())
                .propertyType(request.getPropertyType())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .description(request.getDescription())
                .totalAreaSqft(request.getTotalAreaSqft())
                .yearBuilt(request.getYearBuilt())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        property = propertyRepo.save(property);
        auditLogService.log(auth.getName(), "CREATED", "PROPERTY", property.getPropertyId(),
                "Property created: " + property.getPropertyName());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(property));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Update a property")
    public ResponseEntity<PropertyResponse> update(@PathVariable Long id,
            @Valid @RequestBody PropertyRequest request, Authentication auth) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));

        if (request.getOwnerId() != null) {
            Owner owner = ownerRepo.findById(request.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", request.getOwnerId()));
            property.setOwner(owner);
        }
        if (request.getPropertyName() != null) property.setPropertyName(request.getPropertyName());
        if (request.getCity() != null) property.setCity(request.getCity());
        if (request.getState() != null) property.setState(request.getState());
        if (request.getStatus() != null) property.setStatus(request.getStatus());

        property = propertyRepo.save(property);
        auditLogService.log(auth.getName(), "UPDATED", "PROPERTY", id, "Property updated: " + property.getPropertyName());
        return ResponseEntity.ok(mapToResponse(property));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a property (ADMIN only)")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        propertyRepo.delete(property);
        auditLogService.log(auth.getName(), "DELETED", "PROPERTY", id, "Property deleted: " + property.getPropertyName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/financial-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get financial summary for a specific property")
    public ResponseEntity<List<Map<String, Object>>> financialSummary(@PathVariable Long id) {
        // Returns profitability for a single property
        return ResponseEntity.ok(reportRepo.getProfitabilityReport(
                java.time.LocalDate.now().withDayOfYear(1),
                java.time.LocalDate.now()
        ).stream().filter(m -> id.equals(toLong(m.get("property_id")))).collect(Collectors.toList()));
    }

    private PropertyResponse mapToResponse(Property p) {
        return PropertyResponse.builder()
                .propertyId(p.getPropertyId())
                .ownerId(p.getOwner() != null ? p.getOwner().getOwnerId() : null)
                .ownerName(p.getOwner() != null ? p.getOwner().getFullName() : null)
                .propertyName(p.getPropertyName())
                .propertyType(p.getPropertyType())
                .addressLine1(p.getAddressLine1())
                .addressLine2(p.getAddressLine2())
                .city(p.getCity())
                .state(p.getState())
                .zipCode(p.getZipCode())
                .country(p.getCountry())
                .description(p.getDescription())
                .totalAreaSqft(p.getTotalAreaSqft())
                .yearBuilt(p.getYearBuilt())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(v.toString());
    }
}
