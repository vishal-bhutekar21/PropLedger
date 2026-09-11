package com.propledger.repository;

import com.propledger.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    @Query("""
        SELECT v FROM Vendor v
        WHERE (:status IS NULL OR v.status = :status)
          AND (:serviceType IS NULL OR v.serviceType = :serviceType)
          AND (:search IS NULL OR
               LOWER(v.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(v.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Vendor> findWithFilters(
            @Param("status") String status,
            @Param("serviceType") String serviceType,
            @Param("search") String search,
            Pageable pageable
    );
}
