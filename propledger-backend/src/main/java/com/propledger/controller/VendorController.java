package com.propledger.controller;

import com.propledger.dto.request.VendorRequest;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.response.VendorResponse;
import com.propledger.entity.Vendor;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.VendorRepository;
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
@RequestMapping({"/api/vendors", "/api/v1/vendors"})
@RequiredArgsConstructor
@Tag(name = "Vendors", description = "Contractor and service vendor directory and ratings")
@SecurityRequirement(name = "BearerAuth")
public class VendorController {

    private final VendorRepository vendorRepository;

    @GetMapping
    @Operation(summary = "Get paginated vendors with search, status and service type filter")
    public ResponseEntity<PagedResponse<VendorResponse>> getVendors(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "companyName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Vendor> vendors = vendorRepository.findWithFilters(status, serviceType, search, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(PagedResponse.<VendorResponse>builder()
                .content(vendors.getContent().stream().map(this::toResponse).toList())
                .page(vendors.getNumber())
                .size(vendors.getSize())
                .totalElements(vendors.getTotalElements())
                .totalPages(vendors.getTotalPages())
                .last(vendors.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor by ID")
    public ResponseEntity<VendorResponse> getVendorById(@PathVariable Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", id));
        return ResponseEntity.ok(toResponse(vendor));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Register a new vendor")
    public ResponseEntity<VendorResponse> createVendor(@Valid @RequestBody VendorRequest request) {
        Vendor vendor = Vendor.builder()
                .companyName(request.getCompanyName())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .serviceType(request.getServiceType())
                .address(request.getAddress())
                .taxId(request.getTaxId())
                .rating(request.getRating())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .notes(request.getNotes())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(vendorRepository.save(vendor)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Update vendor details")
    public ResponseEntity<VendorResponse> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorRequest request) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", id));

        vendor.setCompanyName(request.getCompanyName());
        vendor.setContactPerson(request.getContactPerson());
        vendor.setEmail(request.getEmail());
        vendor.setPhone(request.getPhone());
        vendor.setServiceType(request.getServiceType());
        vendor.setAddress(request.getAddress());
        vendor.setTaxId(request.getTaxId());
        vendor.setRating(request.getRating());
        if (request.getStatus() != null) vendor.setStatus(request.getStatus());
        vendor.setNotes(request.getNotes());

        return ResponseEntity.ok(toResponse(vendorRepository.save(vendor)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete vendor")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "vendorId", id));
        vendorRepository.delete(vendor);
        return ResponseEntity.noContent().build();
    }

    private VendorResponse toResponse(Vendor v) {
        return VendorResponse.builder()
                .vendorId(v.getVendorId())
                .companyName(v.getCompanyName())
                .contactPerson(v.getContactPerson())
                .email(v.getEmail())
                .phone(v.getPhone())
                .serviceType(v.getServiceType())
                .address(v.getAddress())
                .taxId(v.getTaxId())
                .rating(v.getRating())
                .status(v.getStatus())
                .notes(v.getNotes())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
