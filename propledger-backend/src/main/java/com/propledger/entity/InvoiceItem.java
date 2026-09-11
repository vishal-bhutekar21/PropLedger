package com.propledger.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoice_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id") private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "description", nullable = false, length = 255) private String description;
    @Column(name = "item_type", nullable = false, length = 50) @Builder.Default private String itemType = "RENT";
    @Column(name = "quantity", nullable = false, precision = 10, scale = 2) @Builder.Default private BigDecimal quantity = BigDecimal.ONE;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(name = "amount", nullable = false, precision = 12, scale = 2) private BigDecimal amount;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
}
