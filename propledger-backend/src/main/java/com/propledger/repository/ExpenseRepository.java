package com.propledger.repository;

import com.propledger.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("""
        SELECT e FROM Expense e
        WHERE (:propertyId IS NULL OR e.property.propertyId = :propertyId)
          AND (:category IS NULL OR e.category = :category)
          AND (:status IS NULL OR e.status = :status)
          AND (:fromDate IS NULL OR e.expenseDate >= :fromDate)
          AND (:toDate IS NULL OR e.expenseDate <= :toDate)
    """)
    Page<Expense> findWithFilters(
            @Param("propertyId") Long propertyId,
            @Param("category") String category,
            @Param("status") String status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );
}
