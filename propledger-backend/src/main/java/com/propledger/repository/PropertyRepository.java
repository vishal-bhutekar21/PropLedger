package com.propledger.repository;

import com.propledger.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>,
        JpaSpecificationExecutor<Property> {

    Page<Property> findByStatus(String status, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.status = 'ACTIVE' ORDER BY p.propertyName")
    List<Property> findAllActive();

    @Query("""
        SELECT p FROM Property p
        WHERE (:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:status IS NULL OR p.status = :status)
          AND (:type IS NULL OR p.propertyType = :type)
          AND (:search IS NULL OR
               LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(p.city) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Property> findWithFilters(
            @Param("city") String city,
            @Param("status") String status,
            @Param("type") String type,
            @Param("search") String search,
            Pageable pageable
    );
}
