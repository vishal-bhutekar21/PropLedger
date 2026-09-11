package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "leases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lease {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lease_id") private Long leaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "monthly_rent", nullable = false, precision = 12, scale = 2) private BigDecimal monthlyRent;
    @Column(name = "security_deposit", nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal securityDeposit = BigDecimal.ZERO;
    @Column(name = "payment_due_day", nullable = false) @Builder.Default private Short paymentDueDay = 1;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date", nullable = false) private LocalDate endDate;
    @Column(name = "status", nullable = false, length = 30) @Builder.Default private String status = "PENDING";
    @Column(name = "terminated_at") private OffsetDateTime terminatedAt;
    @Column(name = "termination_reason", columnDefinition = "TEXT") private String terminationReason;
    @Column(name = "is_renewal", nullable = false) @Builder.Default private Boolean isRenewal = false;
    @Column(name = "parent_lease_id") private Long parentLeaseId;
    @Column(name = "notes", columnDefinition = "TEXT") private String notes;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
