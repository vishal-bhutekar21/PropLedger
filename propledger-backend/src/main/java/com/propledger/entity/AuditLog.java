package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id") private Long logId;

    @Column(name = "user_id") private Long userId;
    @Column(name = "username", length = 100) private String username;
    @Column(name = "action", nullable = false, length = 100) private String action;
    @Column(name = "entity_type", nullable = false, length = 100) private String entityType;
    @Column(name = "entity_id", nullable = false) private Long entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private Map<String, Object> oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private Map<String, Object> newValue;

    @Column(name = "ip_address", length = 50) private String ipAddress;
    @Column(name = "description", columnDefinition = "TEXT") private String description;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
}
