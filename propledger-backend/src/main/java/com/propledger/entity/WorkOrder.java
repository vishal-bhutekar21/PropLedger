package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "work_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "work_order_id") private Long workOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private MaintenanceRequest maintenanceRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "work_order_number", nullable = false, unique = true, length = 50) private String workOrderNumber;
    @Column(name = "description", columnDefinition = "TEXT") private String description;
    @Column(name = "scheduled_date") private LocalDate scheduledDate;
    @Column(name = "completion_date") private LocalDate completionDate;
    @Column(name = "estimated_cost", precision = 12, scale = 2) private BigDecimal estimatedCost;
    @Column(name = "actual_cost", precision = 12, scale = 2) private BigDecimal actualCost;
    @Column(name = "status", nullable = false, length = 30) @Builder.Default private String status = "PENDING";
    @Column(name = "vendor_notes", columnDefinition = "TEXT") private String vendorNotes;
    @Column(name = "internal_notes", columnDefinition = "TEXT") private String internalNotes;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
