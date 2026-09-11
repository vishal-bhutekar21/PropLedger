package com.propledger.repository;

import com.propledger.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoice_InvoiceIdAndStatus(Long invoiceId, String status);

    @Query("""
        SELECT p FROM Payment p JOIN p.invoice i
        WHERE (:invoiceId IS NULL OR i.invoiceId = :invoiceId)
          AND (:status IS NULL OR p.status = :status)
          AND (:fromDate IS NULL OR p.paymentDate >= :fromDate)
          AND (:toDate IS NULL OR p.paymentDate <= :toDate)
        ORDER BY p.paymentDate DESC
    """)
    Page<Payment> findWithFilters(
            @Param("invoiceId") Long invoiceId,
            @Param("status") String status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.invoiceId = :invoiceId AND p.status = 'SUCCESS'")
    java.math.BigDecimal sumSuccessfulPayments(@Param("invoiceId") Long invoiceId);
}
