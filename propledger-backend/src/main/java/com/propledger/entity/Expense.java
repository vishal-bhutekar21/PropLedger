package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id") private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "category", nullable = false, length = 50) private String category;
    @Column(name = "description", nullable = false, columnDefinition = "TEXT") private String description;
    @Column(name = "amount", nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(name = "expense_date", nullable = false) private LocalDate expenseDate;
    @Column(name = "reference_number", length = 100) private String referenceNumber;
    @Column(name = "status", nullable = false, length = 20) @Builder.Default private String status = "PENDING";
    @Column(name = "notes", columnDefinition = "TEXT") private String notes;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
