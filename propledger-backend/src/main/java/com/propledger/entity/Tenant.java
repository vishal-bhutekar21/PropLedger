package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tenants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id") private Long tenantId;

    @Column(name = "full_name", nullable = false, length = 255) private String fullName;
    @Column(name = "email", nullable = false, unique = true, length = 255) private String email;
    @Column(name = "phone", nullable = false, length = 30) private String phone;
    @Column(name = "alternate_phone", length = 30) private String alternatePhone;
    @Column(name = "date_of_birth") private LocalDate dateOfBirth;
    @Column(name = "national_id", length = 100) private String nationalId;
    @Column(name = "address_line1", length = 255) private String addressLine1;
    @Column(name = "address_line2", length = 255) private String addressLine2;
    @Column(name = "city", length = 100) private String city;
    @Column(name = "state", length = 100) private String state;
    @Column(name = "zip_code", length = 20) private String zipCode;
    @Column(name = "country", nullable = false, length = 100) @Builder.Default private String country = "India";
    @Column(name = "emergency_contact_name", length = 255) private String emergencyContactName;
    @Column(name = "emergency_contact_phone", length = 30) private String emergencyContactPhone;
    @Column(name = "status", nullable = false, length = 20) @Builder.Default private String status = "ACTIVE";
    @Column(name = "notes", columnDefinition = "TEXT") private String notes;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
