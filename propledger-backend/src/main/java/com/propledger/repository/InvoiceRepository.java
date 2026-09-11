package com.propledger.repository;

import com.propledger.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByLease_LeaseId(Long leaseId);

    @Query("""
        SELECT i FROM Invoice i JOIN i.lease l
        WHERE (:leaseId IS NULL OR l.leaseId = :leaseId)
          AND (:status IS NULL OR i.status = :status)
          AND (:fromDate IS NULL OR i.invoiceDate >= :fromDate)
          AND (:toDate IS NULL OR i.invoiceDate <= :toDate)
    """)
    Page<Invoice> findWithFilters(
            @Param("leaseId") Long leaseId,
            @Param("status") String status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    // All overdue invoices that haven't been marked yet
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.status NOT IN ('PAID', 'VOID', 'WAIVED')
          AND i.dueDate < :today
    """)
    List<Invoice> findAllUnpaidOverdue(@Param("today") LocalDate today);
}
