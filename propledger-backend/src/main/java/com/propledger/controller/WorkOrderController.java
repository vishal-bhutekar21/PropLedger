package com.propledger.controller;

import com.propledger.dto.request.WorkOrderRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.WorkOrderResponse;
import com.propledger.entity.MaintenanceRequest;
import com.propledger.entity.Vendor;
import com.propledger.entity.WorkOrder;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.MaintenanceRequestRepository;
import com.propledger.repository.VendorRepository;
import com.propledger.repository.WorkOrderRepository;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/work-orders", "/api/v1/work-orders"})
@RequiredArgsConstructor
@Tag(name = "Work Orders", description = "Contractor dispatch, work orders, and service execution")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrderController {

    private final WorkOrderRepository workOrderRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final VendorRepository vendorRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List paginated work orders")
    public ResponseEntity<PagedResponse<WorkOrderResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<WorkOrder> pageResult = workOrderRepository.findAll(PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<WorkOrderResponse>builder()
                .content(pageResult.getContent().stream().map(this::toResponse).toList())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get work order by ID")
    public ResponseEntity<WorkOrderResponse> getById(@PathVariable Long id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "workOrderId", id));
        return ResponseEntity.ok(toResponse(wo));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_TECH')")
    @Operation(summary = "Create and dispatch work order for a maintenance ticket")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody WorkOrderRequest request) {
        MaintenanceRequest req = maintenanceRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", request.getRequestId()));

        Vendor vendor = null;
        if (request.getVendorId() != null) {
            vendor = vendorRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", request.getVendorId()));
        }

        String woNum = (request.getWorkOrderNumber() != null && !request.getWorkOrderNumber().isBlank())
                ? request.getWorkOrderNumber()
                : "WO-" + System.currentTimeMillis();

        WorkOrder wo = WorkOrder.builder()
                .maintenanceRequest(req)
                .vendor(vendor)
                .workOrderNumber(woNum)
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .completionDate(request.getCompletionDate())
                .estimatedCost(request.getEstimatedCost())
                .actualCost(request.getActualCost())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .vendorNotes(request.getVendorNotes())
                .internalNotes(request.getInternalNotes())
                .build();

        // Update maintenance request to IN_PROGRESS if OPEN
        if ("OPEN".equalsIgnoreCase(req.getStatus())) {
            req.setStatus("IN_PROGRESS");
            maintenanceRepository.save(req);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(workOrderRepository.save(wo)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_TECH')")
    @Operation(summary = "Update work order status, cost, or notes")
    public ResponseEntity<WorkOrderResponse> update(@PathVariable Long id, @Valid @RequestBody WorkOrderRequest request) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "workOrderId", id));

        if (request.getVendorId() != null) {
            Vendor vendor = vendorRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", request.getVendorId()));
            wo.setVendor(vendor);
        }

        wo.setDescription(request.getDescription());
        if (request.getScheduledDate() != null) wo.setScheduledDate(request.getScheduledDate());
        if (request.getCompletionDate() != null) wo.setCompletionDate(request.getCompletionDate());
        if (request.getEstimatedCost() != null) wo.setEstimatedCost(request.getEstimatedCost());
        if (request.getActualCost() != null) wo.setActualCost(request.getActualCost());
        if (request.getStatus() != null) wo.setStatus(request.getStatus());
        if (request.getVendorNotes() != null) wo.setVendorNotes(request.getVendorNotes());
        if (request.getInternalNotes() != null) wo.setInternalNotes(request.getInternalNotes());

        if ("COMPLETED".equalsIgnoreCase(request.getStatus()) && wo.getCompletionDate() == null) {
            wo.setCompletionDate(LocalDate.now());
        }

        return ResponseEntity.ok(toResponse(workOrderRepository.save(wo)));
    }

    public WorkOrderResponse toResponse(WorkOrder wo) {
        MaintenanceRequest mr = wo.getMaintenanceRequest();
        return WorkOrderResponse.builder()
                .workOrderId(wo.getWorkOrderId())
                .requestId(mr != null ? mr.getRequestId() : null)
                .requestTitle(mr != null ? mr.getTitle() : null)
                .unitNumber(mr != null && mr.getUnit() != null ? mr.getUnit().getUnitNumber() : null)
                .propertyName(mr != null && mr.getUnit() != null && mr.getUnit().getBuilding() != null && mr.getUnit().getBuilding().getProperty() != null
                        ? mr.getUnit().getBuilding().getProperty().getPropertyName() : null)
                .vendorId(wo.getVendor() != null ? wo.getVendor().getVendorId() : null)
                .vendorName(wo.getVendor() != null ? wo.getVendor().getCompanyName() : null)
                .workOrderNumber(wo.getWorkOrderNumber())
                .description(wo.getDescription())
                .scheduledDate(wo.getScheduledDate())
                .completionDate(wo.getCompletionDate())
                .estimatedCost(wo.getEstimatedCost())
                .actualCost(wo.getActualCost())
                .status(wo.getStatus())
                .vendorNotes(wo.getVendorNotes())
                .internalNotes(wo.getInternalNotes())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .build();
    }
}
