package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
public class AuditLogResponse {
    private Long logId;
    private Long userId;
    private String username;
    private String action;
    private String entityType;
    private Long entityId;
    private Map<String, Object> oldValue;
    private Map<String, Object> newValue;
    private String ipAddress;
    private String description;
    private OffsetDateTime createdAt;
}
