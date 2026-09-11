package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "maintenance_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id") private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "title", nullable = false, length = 255) private String title;
    @Column(name = "description", nullable = false, columnDefinition = "TEXT") private String description;
    @Column(name = "category", nullable = false, length = 50) @Builder.Default private String category = "GENERAL";
    @Column(name = "priority", nullable = false, length = 20) @Builder.Default private String priority = "MEDIUM";
    @Column(name = "status", nullable = false, length = 30) @Builder.Default private String status = "OPEN";
    @Column(name = "estimated_cost", precision = 12, scale = 2) private BigDecimal estimatedCost;
    @Column(name = "actual_cost", precision = 12, scale = 2) private BigDecimal actualCost;
    @Column(name = "scheduled_date") private LocalDate scheduledDate;
    @Column(name = "resolved_at") private OffsetDateTime resolvedAt;
    @Column(name = "resolution_notes", columnDefinition = "TEXT") private String resolutionNotes;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
