package com.propledger.repository;

import com.propledger.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
        SELECT t FROM Tenant t
        WHERE (:status IS NULL OR t.status = :status)
          AND (:search IS NULL OR
               LOWER(t.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               t.phone LIKE CONCAT('%', :search, '%'))
    """)
    Page<Tenant> findWithFilters(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );
}
