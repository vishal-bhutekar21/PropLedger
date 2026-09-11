package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Unit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id") private Long unitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "unit_number", nullable = false, length = 50) private String unitNumber;
    @Column(name = "unit_type", nullable = false, length = 50) private String unitType;
    @Column(name = "floor_number") private Short floorNumber;
    @Column(name = "bedrooms", nullable = false) @Builder.Default private Short bedrooms = 0;
    @Column(name = "bathrooms", nullable = false) @Builder.Default private Short bathrooms = 1;
    @Column(name = "area_sqft", precision = 10, scale = 2) private BigDecimal areaSqft;
    @Column(name = "monthly_rent", nullable = false, precision = 12, scale = 2) private BigDecimal monthlyRent;
    @Column(name = "security_deposit", nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal securityDeposit = BigDecimal.ZERO;
    @Column(name = "status", nullable = false, length = 30) @Builder.Default private String status = "VACANT";
    @Column(name = "description", columnDefinition = "TEXT") private String description;
    @Column(name = "amenities", columnDefinition = "TEXT") private String amenities;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
