package com.propledger.controller;

import com.propledger.dto.response.LeaseResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.dto.request.LeaseRequest;
import com.propledger.service.LeaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leases")
@Tag(name = "Leases", description = "Lease lifecycle management with transactional safety")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class LeaseController {

    private final LeaseService leaseService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<LeaseResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) Long unitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        return ResponseEntity.ok(leaseService.getLeases(status, tenantId, unitId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leaseService.getLeaseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    @Operation(summary = "Create lease — uses SERIALIZABLE tx + SELECT FOR UPDATE to prevent double-leasing")
    public ResponseEntity<LeaseResponse> create(@Valid @RequestBody LeaseRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaseService.createLease(request, auth.getName()));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<LeaseResponse> activate(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(leaseService.activateLease(id, auth.getName()));
    }

    @PutMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<LeaseResponse> terminate(@PathVariable Long id,
            @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(leaseService.terminateLease(id, body.get("reason"), auth.getName()));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<LeaseResponse> renew(@PathVariable Long id,
            @Valid @RequestBody LeaseRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaseService.renewLease(id, request, auth.getName()));
    }

    @GetMapping("/expiring")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get leases expiring within N days")
    public ResponseEntity<List<LeaseResponse>> expiring(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(leaseService.getExpiringLeases(days));
    }
}
