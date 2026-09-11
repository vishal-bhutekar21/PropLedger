package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "owners")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Owner {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id") private Long ownerId;
    @Column(name = "full_name", nullable = false, length = 255) private String fullName;
    @Column(name = "email", nullable = false, unique = true, length = 255) private String email;
    @Column(name = "phone", length = 30) private String phone;
    @Column(name = "company_name", length = 255) private String companyName;
    @Column(name = "address", columnDefinition = "TEXT") private String address;
    @Column(name = "tax_id", length = 100) private String taxId;
    @Column(name = "status", nullable = false, length = 20) @Builder.Default private String status = "ACTIVE";
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
