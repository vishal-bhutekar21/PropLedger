package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vendors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vendor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vendor_id") private Long vendorId;
    @Column(name = "company_name", nullable = false, length = 255) private String companyName;
    @Column(name = "contact_person", length = 255) private String contactPerson;
    @Column(name = "email", length = 255) private String email;
    @Column(name = "phone", length = 30) private String phone;
    @Column(name = "service_type", nullable = false, length = 100) private String serviceType;
    @Column(name = "address", columnDefinition = "TEXT") private String address;
    @Column(name = "tax_id", length = 100) private String taxId;
    @Column(name = "rating") private Short rating;
    @Column(name = "status", nullable = false, length = 20) @Builder.Default private String status = "ACTIVE";
    @Column(name = "notes", columnDefinition = "TEXT") private String notes;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
