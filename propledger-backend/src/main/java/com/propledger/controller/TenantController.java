package com.propledger.controller;

import com.propledger.dto.request.TenantRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.TenantResponse;
import com.propledger.entity.Tenant;
import com.propledger.exception.DuplicateResourceException;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.TenantRepository;
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
@RequestMapping({"/api/tenants", "/api/v1/tenants"})
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Tenant profile, identity verification, contact and status management")
@SecurityRequirement(name = "BearerAuth")
public class TenantController {

    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Get paginated tenants with search and status filters")
    public ResponseEntity<PagedResponse<TenantResponse>> getTenants(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Tenant> tenants = tenantRepository.findWithFilters(status, search, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<TenantResponse>builder()
                .content(tenants.getContent().stream().map(this::toResponse).toList())
                .page(tenants.getNumber())
                .size(tenants.getSize())
                .totalElements(tenants.getTotalElements())
                .totalPages(tenants.getTotalPages())
                .last(tenants.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant details by ID")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "tenantId", id));
        return ResponseEntity.ok(toResponse(tenant));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'LEASING_AGENT')")
    @Operation(summary = "Register new tenant profile")
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody TenantRequest request) {
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Tenant already exists with email: " + request.getEmail());
        }

        Tenant tenant = Tenant.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .alternatePhone(request.getAlternatePhone())
                .dateOfBirth(request.getDateOfBirth())
                .nationalId(request.getNationalId())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(tenantRepository.save(tenant)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'LEASING_AGENT')")
    @Operation(summary = "Update tenant information")
    public ResponseEntity<TenantResponse> updateTenant(@PathVariable Long id, @Valid @RequestBody TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "tenantId", id));

        if (!tenant.getEmail().equalsIgnoreCase(request.getEmail()) && tenantRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        tenant.setFullName(request.getFullName());
        tenant.setEmail(request.getEmail());
        tenant.setPhone(request.getPhone());
        tenant.setAlternatePhone(request.getAlternatePhone());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setNationalId(request.getNationalId());
        tenant.setAddressLine1(request.getAddressLine1());
        tenant.setCity(request.getCity());
        tenant.setState(request.getState());
        if (request.getCountry() != null) tenant.setCountry(request.getCountry());
        if (request.getStatus() != null) tenant.setStatus(request.getStatus());

        return ResponseEntity.ok(toResponse(tenantRepository.save(tenant)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete tenant profile")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "tenantId", id));
        tenantRepository.delete(tenant);
        return ResponseEntity.noContent().build();
    }

    private TenantResponse toResponse(Tenant t) {
        return TenantResponse.builder()
                .tenantId(t.getTenantId())
                .fullName(t.getFullName())
                .email(t.getEmail())
                .phone(t.getPhone())
                .alternatePhone(t.getAlternatePhone())
                .dateOfBirth(t.getDateOfBirth())
                .nationalId(t.getNationalId())
                .addressLine1(t.getAddressLine1())
                .city(t.getCity())
                .state(t.getState())
                .country(t.getCountry())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
