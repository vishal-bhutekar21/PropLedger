package com.propledger.repository;

import com.propledger.entity.Lease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaseRepository extends JpaRepository<Lease, Long> {

    List<Lease> findByTenant_TenantIdAndStatusIn(Long tenantId, List<String> statuses);

    @Query("SELECT l FROM Lease l WHERE l.unit.unitId = :unitId AND l.status = 'ACTIVE'")
    Optional<Lease> findActiveLeaseByUnitId(@Param("unitId") Long unitId);

    @Query("""
        SELECT l FROM Lease l
        WHERE (:status IS NULL OR l.status = :status)
          AND (:tenantId IS NULL OR l.tenant.tenantId = :tenantId)
          AND (:unitId IS NULL OR l.unit.unitId = :unitId)
    """)
    Page<Lease> findWithFilters(
            @Param("status") String status,
            @Param("tenantId") Long tenantId,
            @Param("unitId") Long unitId,
            Pageable pageable
    );

    // Leases expiring within N days
    @Query("""
        SELECT l FROM Lease l
        WHERE l.status = 'ACTIVE'
          AND l.endDate BETWEEN :fromDate AND :toDate
        ORDER BY l.endDate ASC
    """)
    List<Lease> findExpiringBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    // Check for overlapping active leases on a unit (used before exclusion constraint as a pre-check)
    @Query("""
        SELECT COUNT(l) > 0 FROM Lease l
        WHERE l.unit.unitId = :unitId
          AND l.status IN ('ACTIVE', 'PENDING')
          AND l.leaseId <> :excludeLeaseId
          AND l.startDate <= :endDate
          AND l.endDate >= :startDate
    """)
    boolean existsOverlappingLease(
            @Param("unitId") Long unitId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeLeaseId") Long excludeLeaseId
    );
}
