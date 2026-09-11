package com.propledger.repository;

import com.propledger.entity.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    @Query("""
        SELECT m FROM MaintenanceRequest m
        WHERE (:priority IS NULL OR m.priority = :priority)
          AND (:status IS NULL OR m.status = :status)
          AND (:unitId IS NULL OR m.unit.unitId = :unitId)
          AND (:tenantId IS NULL OR m.tenant.tenantId = :tenantId)
          AND (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<MaintenanceRequest> findWithFilters(
            @Param("priority") String priority,
            @Param("status") String status,
            @Param("unitId") Long unitId,
            @Param("tenantId") Long tenantId,
            @Param("search") String search,
            Pageable pageable
    );
}
