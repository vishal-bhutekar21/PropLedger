package com.propledger.controller;

import com.propledger.dto.response.AuditLogResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.AuditLog;
import com.propledger.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/audit-logs", "/api/v1/audit-logs"})
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Immutable regulatory and compliance audit trail of system actions")
@SecurityRequirement(name = "BearerAuth")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get paginated audit trail records with filters")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AuditLog> logs = auditLogRepository.findWithFilters(
                entityType, entityId, action, userId, PageRequest.of(page, size));

        return ResponseEntity.ok(PagedResponse.<AuditLogResponse>builder()
                .content(logs.getContent().stream().map(this::toResponse).toList())
                .page(logs.getNumber())
                .size(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .last(logs.isLast())
                .build());
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .logId(a.getLogId())
                .userId(a.getUserId())
                .username(a.getUsername())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .oldValue(a.getOldValue())
                .newValue(a.getNewValue())
                .ipAddress(a.getIpAddress())
                .description(a.getDescription())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
