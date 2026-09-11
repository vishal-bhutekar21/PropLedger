package com.propledger.repository;

import com.propledger.entity.Building;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByProperty_PropertyId(Long propertyId);
    Page<Building> findByProperty_PropertyId(Long propertyId, Pageable pageable);
    long countByProperty_PropertyId(Long propertyId);
}
