package com.propledger.service.impl;

import com.propledger.dto.request.LeaseRequest;
import com.propledger.dto.response.LeaseResponse;
import com.propledger.dto.response.PagedResponse;
import com.propledger.entity.*;
import com.propledger.exception.BusinessException;
import com.propledger.exception.ResourceNotFoundException;
import com.propledger.repository.*;
import com.propledger.service.AuditLogService;
import com.propledger.service.LeaseService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaseServiceImpl implements LeaseService {

    private final LeaseRepository leaseRepository;
    private final UnitRepository unitRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @PersistenceContext
    private EntityManager em;

    /**
     * Creates a new lease with SERIALIZABLE isolation to prevent race conditions.
     *
     * CONCURRENCY DESIGN:
     * 1. We use SERIALIZABLE isolation (strongest) + SELECT FOR UPDATE (pessimistic lock)
     *    on the unit row to prevent two concurrent transactions from simultaneously
     *    leasing the same unit.
     * 2. After acquiring the lock, we check unit availability in Java AND rely on
     *    the PostgreSQL exclusion constraint (excl_no_overlapping_active_leases)
     *    as a final safety net.
     * 3. If the exclusion constraint fires, the DataIntegrityViolationException is
     *    caught by GlobalExceptionHandler and returns a 409 with a clear message.
     *
     * See docs/CONCURRENCY.md for full analysis.
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public LeaseResponse createLease(LeaseRequest request, String createdByUsername) {
        // Validate dates
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new BusinessException("Lease end date must be after start date.");
        }

        // ── STEP 1: Lock the unit row (SELECT FOR UPDATE)
        // This prevents another transaction from modifying the unit
        // or creating another lease on it simultaneously.
        Unit unit = em.createQuery(
                "SELECT u FROM Unit u WHERE u.unitId = :id", Unit.class)
                .setParameter("id", request.getUnitId())
                .setLockMode(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
                .getSingleResult();

        if (unit == null) {
            throw new ResourceNotFoundException("Unit", "id", request.getUnitId());
        }

        // ── STEP 2: Validate unit availability
        if ("MAINTENANCE".equals(unit.getStatus())) {
            throw new BusinessException("Unit " + unit.getUnitNumber() + " is currently under maintenance.");
        }
        if ("INACTIVE".equals(unit.getStatus())) {
            throw new BusinessException("Unit " + unit.getUnitNumber() + " is inactive.");
        }

        // ── STEP 3: Check for overlapping leases (pre-constraint Java check for better error message)
        boolean hasOverlap = leaseRepository.existsOverlappingLease(
                unit.getUnitId(), request.getStartDate(), request.getEndDate(), -1L);
        if (hasOverlap) {
            throw new BusinessException(
                "Unit " + unit.getUnitNumber() + " already has an active/pending lease overlapping with " +
                request.getStartDate() + " to " + request.getEndDate());
        }

        // ── STEP 4: Validate tenant
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", request.getTenantId()));
        if ("BLACKLISTED".equals(tenant.getStatus())) {
            throw new BusinessException("Tenant " + tenant.getFullName() + " is blacklisted and cannot be leased to.");
        }

        // ── STEP 5: Get creating user
        User createdBy = userRepository.findByUsername(createdByUsername).orElse(null);

        // ── STEP 6: Create the lease
        Lease lease = Lease.builder()
                .unit(unit)
                .tenant(tenant)
                .createdBy(createdBy)
                .monthlyRent(request.getMonthlyRent())
                .securityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : unit.getSecurityDeposit())
                .paymentDueDay(request.getPaymentDueDay() != null ? request.getPaymentDueDay() : (short)1)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status("PENDING")
                .notes(request.getNotes())
                .build();

        lease = leaseRepository.save(lease);

        // ── STEP 7: Write audit log
        auditLogService.log(
            createdByUsername, "LEASE_CREATED", "LEASE", lease.getLeaseId(), null,
            Map.of("status", "PENDING", "unit", unit.getUnitNumber(), "tenant", tenant.getFullName()),
            "Lease created for unit " + unit.getUnitNumber() + " and tenant " + tenant.getFullName()
        );

        log.info("Lease {} created for unit {} tenant {}", lease.getLeaseId(), unit.getUnitNumber(), tenant.getFullName());
        return mapToResponse(lease);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public LeaseResponse activateLease(Long id, String username) {
        Lease lease = getLeaseEntityById(id);
        if (!"PENDING".equals(lease.getStatus())) {
            throw new BusinessException("Only PENDING leases can be activated. Current status: " + lease.getStatus());
        }

        String oldStatus = lease.getStatus();
        lease.setStatus("ACTIVE");
        // Trigger fn_sync_unit_status_on_lease_change fires automatically via DB trigger
        lease = leaseRepository.save(lease);

        auditLogService.log(username, "LEASE_ACTIVATED", "LEASE", lease.getLeaseId(),
            Map.of("status", oldStatus), Map.of("status", "ACTIVE"), "Lease activated");
        return mapToResponse(lease);
    }

    @Override
    @Transactional
    public LeaseResponse terminateLease(Long id, String reason, String username) {
        Lease lease = getLeaseEntityById(id);
        if ("EXPIRED".equals(lease.getStatus()) || "TERMINATED".equals(lease.getStatus())) {
            throw new BusinessException("Lease is already " + lease.getStatus());
        }

        String oldStatus = lease.getStatus();
        lease.setStatus("TERMINATED");
        lease.setTerminatedAt(OffsetDateTime.now());
        lease.setTerminationReason(reason);
        lease = leaseRepository.save(lease);

        auditLogService.log(username, "LEASE_TERMINATED", "LEASE", lease.getLeaseId(),
            Map.of("status", oldStatus), Map.of("status", "TERMINATED", "reason", reason),
            "Lease terminated: " + reason);
        return mapToResponse(lease);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public LeaseResponse renewLease(Long id, LeaseRequest request, String username) {
        Lease original = getLeaseEntityById(id);
        if (!"ACTIVE".equals(original.getStatus()) && !"EXPIRED".equals(original.getStatus())) {
            throw new BusinessException("Only ACTIVE or EXPIRED leases can be renewed.");
        }

        request.setUnitId(original.getUnit().getUnitId());
        request.setTenantId(original.getTenant().getTenantId());

        LeaseResponse newLease = createLease(request, username);

        // Link as renewal
        Lease renewedLease = getLeaseEntityById(newLease.getLeaseId());
        renewedLease.setIsRenewal(true);
        renewedLease.setParentLeaseId(id);
        leaseRepository.save(renewedLease);

        auditLogService.log(username, "LEASE_RENEWED", "LEASE", id,
            Map.of("status", original.getStatus()),
            Map.of("newLeaseId", renewedLease.getLeaseId()),
            "Lease renewed, new lease id: " + renewedLease.getLeaseId());

        return mapToResponse(renewedLease);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaseResponse getLeaseById(Long id) {
        return mapToResponse(getLeaseEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaseResponse> getLeases(String status, Long tenantId, Long unitId, Pageable pageable) {
        Page<Lease> page = leaseRepository.findWithFilters(status, tenantId, unitId, pageable);
        return buildPagedResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaseResponse> getExpiringLeases(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate to = today.plusDays(daysAhead);
        return leaseRepository.findExpiringBetween(today, to).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private Lease getLeaseEntityById(Long id) {
        return leaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lease", "id", id));
    }

    private LeaseResponse mapToResponse(Lease l) {
        return LeaseResponse.builder()
                .leaseId(l.getLeaseId())
                .unitId(l.getUnit().getUnitId())
                .unitNumber(l.getUnit().getUnitNumber())
                .buildingName(l.getUnit().getBuilding().getBuildingName())
                .propertyName(l.getUnit().getBuilding().getProperty().getPropertyName())
                .tenantId(l.getTenant().getTenantId())
                .tenantName(l.getTenant().getFullName())
                .tenantEmail(l.getTenant().getEmail())
                .monthlyRent(l.getMonthlyRent())
                .securityDeposit(l.getSecurityDeposit())
                .paymentDueDay(l.getPaymentDueDay())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .status(l.getStatus())
                .isRenewal(l.getIsRenewal())
                .parentLeaseId(l.getParentLeaseId())
                .notes(l.getNotes())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public LeaseResponse escalateRent(Long id, java.math.BigDecimal percentage, String username) {
        Lease lease = getLeaseEntityById(id);
        if (percentage == null || percentage.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            percentage = new java.math.BigDecimal("5.0");
        }

        java.math.BigDecimal oldRent = lease.getMonthlyRent();
        java.math.BigDecimal multiplier = java.math.BigDecimal.ONE.add(percentage.divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));
        java.math.BigDecimal newRent = oldRent.multiply(multiplier).setScale(2, java.math.RoundingMode.HALF_UP);

        lease.setMonthlyRent(newRent);
        lease.setNotes((lease.getNotes() != null ? lease.getNotes() : "") +
                " [Annual rent escalated by " + percentage + "% from ₹" + oldRent + " to ₹" + newRent + " by " + username + "]");

        Lease saved = leaseRepository.save(lease);

        auditLogService.log(username, "RENT_ESCALATED", "LEASE", saved.getLeaseId(),
                Map.of("oldRent", oldRent),
                Map.of("newRent", newRent, "percentage", percentage),
                "Escalated monthly rent on lease #" + id + " by " + percentage + "% to ₹" + newRent);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public com.propledger.dto.response.DepositSettlementResponse settleDeposit(
            Long id, com.propledger.dto.request.DepositSettlementRequest request, String username) {
        Lease lease = getLeaseEntityById(id);

        java.math.BigDecimal originalDeposit = lease.getSecurityDeposit() != null ? lease.getSecurityDeposit() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal damageDeductions = request != null && request.getDamageDeductions() != null ? request.getDamageDeductions() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal unpaidRentDeductions = request != null && request.getUnpaidRentDeductions() != null ? request.getUnpaidRentDeductions() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalDeductions = damageDeductions.add(unpaidRentDeductions);
        java.math.BigDecimal netRefund = originalDeposit.subtract(totalDeductions).max(java.math.BigDecimal.ZERO);

        lease.setStatus("TERMINATED");
        lease.setNotes((lease.getNotes() != null ? lease.getNotes() : "") +
                " [Deposit settled: ₹" + originalDeposit + " - ₹" + totalDeductions + " deductions = ₹" + netRefund + " refunded]");

        Unit unit = lease.getUnit();
        if (unit != null) {
            unit.setStatus("VACANT");
            unitRepository.save(unit);
        }

        leaseRepository.save(lease);

        auditLogService.log(username, "DEPOSIT_SETTLED", "LEASE", lease.getLeaseId(),
                null,
                Map.of("originalDeposit", originalDeposit, "totalDeductions", totalDeductions, "netRefund", netRefund),
                "Settled security deposit on lease #" + id + ": net refund ₹" + netRefund);

        return com.propledger.dto.response.DepositSettlementResponse.builder()
                .settlementNumber("SETTLE-" + lease.getLeaseId() + "-" + System.currentTimeMillis())
                .leaseId(lease.getLeaseId())
                .tenantName(lease.getTenant().getFullName())
                .unitNumber(unit != null ? unit.getUnitNumber() : "")
                .propertyName(unit != null && unit.getBuilding() != null && unit.getBuilding().getProperty() != null
                        ? unit.getBuilding().getProperty().getPropertyName() : "")
                .originalDeposit(originalDeposit)
                .damageDeductions(damageDeductions)
                .unpaidRentDeductions(unpaidRentDeductions)
                .totalDeductions(totalDeductions)
                .netRefundAmount(netRefund)
                .deductionNotes(request != null ? request.getDeductionNotes() : "Move-out deposit inspection complete")
                .settledBy(username)
                .settlementDate(LocalDate.now())
                .leaseStatus("TERMINATED")
                .timestamp(java.time.OffsetDateTime.now())
                .build();
    }

    private PagedResponse<LeaseResponse> buildPagedResponse(Page<Lease> page) {
        return PagedResponse.<LeaseResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
