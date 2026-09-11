package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buildings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Building {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_id") private Long buildingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "building_name", nullable = false, length = 255) private String buildingName;
    @Column(name = "building_code", length = 50) private String buildingCode;
    @Column(name = "floors", nullable = false) @Builder.Default private Short floors = 1;
    @Column(name = "year_built") private Short yearBuilt;
    @Column(name = "description", columnDefinition = "TEXT") private String description;
    @Column(name = "status", nullable = false, length = 20) @Builder.Default private String status = "ACTIVE";

    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Unit> units = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
