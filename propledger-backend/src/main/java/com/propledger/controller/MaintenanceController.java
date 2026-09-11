package com.propledger.controller;

import com.propledger.dto.request.MaintenanceRequestDto;
import com.propledger.dto.response.MaintenanceRequestResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.MaintenanceRequest;
import com.propledger.entity.Tenant;
import com.propledger.entity.Unit;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.MaintenanceRequestRepository;
import com.propledger.repository.TenantRepository;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@RestController
@RequestMapping({"/api/maintenance", "/api/v1/maintenance"})
@RequiredArgsConstructor
@Tag(name = "Maintenance", description = "Work orders, service tickets, contractor assignments, and resolution tracking")
@SecurityRequirement(name = "BearerAuth")
public class MaintenanceController {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final UnitRepository unitRepository;
    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Get paginated maintenance tickets with filtering by priority, status, unit")
    public ResponseEntity<PagedResponse<MaintenanceRequestResponse>> getRequests(
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long unitId,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<MaintenanceRequest> requests = maintenanceRepository.findWithFilters(
                priority, status, unitId, tenantId, search, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<MaintenanceRequestResponse>builder()
                .content(requests.getContent().stream().map(this::toResponse).toList())
                .page(requests.getNumber())
                .size(requests.getSize())
                .totalElements(requests.getTotalElements())
                .totalPages(requests.getTotalPages())
                .last(requests.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get maintenance request details by ID")
    public ResponseEntity<MaintenanceRequestResponse> getRequestById(@PathVariable Long id) {
        MaintenanceRequest req = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", id));
        return ResponseEntity.ok(toResponse(req));
    }

    @PostMapping
    @Operation(summary = "Submit a maintenance request")
    public ResponseEntity<MaintenanceRequestResponse> createRequest(@Valid @RequestBody MaintenanceRequestDto dto) {
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "unitId", dto.getUnitId()));

        Tenant tenant = null;
        if (dto.getTenantId() != null) {
            tenant = tenantRepository.findById(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant", "tenantId", dto.getTenantId()));
        }

        MaintenanceRequest req = MaintenanceRequest.builder()
                .unit(unit)
                .tenant(tenant)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? dto.getCategory() : "GENERAL")
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .estimatedCost(dto.getEstimatedCost())
                .status("OPEN")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(maintenanceRepository.save(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_TECH')")
    @Operation(summary = "Update ticket status (OPEN, IN_PROGRESS, RESOLVED, CANCELLED)")
    public ResponseEntity<MaintenanceRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNotes,
            @RequestParam(required = false) BigDecimal actualCost) {

        MaintenanceRequest req = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", id));

        req.setStatus(status.toUpperCase());
        if ("RESOLVED".equalsIgnoreCase(status)) {
            req.setResolvedAt(OffsetDateTime.now());
        }
        if (resolutionNotes != null) req.setResolutionNotes(resolutionNotes);
        if (actualCost != null) req.setActualCost(actualCost);

        return ResponseEntity.ok(toResponse(maintenanceRepository.save(req)));
    }

    private MaintenanceRequestResponse toResponse(MaintenanceRequest m) {
        return MaintenanceRequestResponse.builder()
                .requestId(m.getRequestId())
                .unitId(m.getUnit().getUnitId())
                .unitNumber(m.getUnit().getUnitNumber())
                .propertyName(m.getUnit().getBuilding().getProperty().getPropertyName())
                .tenantId(m.getTenant() != null ? m.getTenant().getTenantId() : null)
                .tenantName(m.getTenant() != null ? m.getTenant().getFullName() : null)
                .title(m.getTitle())
                .description(m.getDescription())
                .category(m.getCategory())
                .priority(m.getPriority())
                .status(m.getStatus())
                .estimatedCost(m.getEstimatedCost())
                .actualCost(m.getActualCost())
                .resolvedAt(m.getResolvedAt())
                .resolutionNotes(m.getResolutionNotes())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
