package com.propledger.repository;

import com.propledger.entity.Unit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    Page<Unit> findByBuilding_BuildingId(Long buildingId, Pageable pageable);
    List<Unit> findByBuilding_BuildingId(Long buildingId);

    @Query("""
        SELECT u FROM Unit u
        JOIN u.building b JOIN b.property p
        WHERE (:propertyId IS NULL OR p.propertyId = :propertyId)
          AND (:buildingId IS NULL OR b.buildingId = :buildingId)
          AND (:status IS NULL OR u.status = :status)
          AND (:unitType IS NULL OR u.unitType = :unitType)
          AND (:search IS NULL OR LOWER(u.unitNumber) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Unit> findWithFilters(
            @Param("propertyId") Long propertyId,
            @Param("buildingId") Long buildingId,
            @Param("status") String status,
            @Param("unitType") String unitType,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COUNT(u) FROM Unit u JOIN u.building b JOIN b.property p WHERE p.propertyId = :propertyId AND u.status = :status")
    long countByPropertyIdAndStatus(@Param("propertyId") Long propertyId, @Param("status") String status);

    @Query("SELECT COUNT(u) FROM Unit u JOIN u.building b JOIN b.property p WHERE p.propertyId = :propertyId")
    long countByPropertyId(@Param("propertyId") Long propertyId);
}
