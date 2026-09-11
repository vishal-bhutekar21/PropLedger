package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id") private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lease_id", nullable = false)
    private Lease lease;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50) private String invoiceNumber;
    @Column(name = "invoice_date", nullable = false) private LocalDate invoiceDate;
    @Column(name = "due_date", nullable = false) private LocalDate dueDate;
    @Column(name = "billing_period_start") private LocalDate billingPeriodStart;
    @Column(name = "billing_period_end") private LocalDate billingPeriodEnd;
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal subtotal = BigDecimal.ZERO;
    @Column(name = "tax", nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal tax = BigDecimal.ZERO;
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(name = "status", nullable = false, length = 30) @Builder.Default private String status = "UNPAID";
    @Column(name = "notes", columnDefinition = "TEXT") private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
