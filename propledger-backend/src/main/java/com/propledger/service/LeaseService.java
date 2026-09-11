package com.propledger.service;

import com.propledger.dto.request.LeaseRequest;
import com.propledger.dto.response.LeaseResponse;
import com.propledger.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface LeaseService {
    LeaseResponse createLease(LeaseRequest request, String createdByUsername);
    LeaseResponse getLeaseById(Long id);
    PagedResponse<LeaseResponse> getLeases(String status, Long tenantId, Long unitId, Pageable pageable);
    LeaseResponse activateLease(Long id, String username);
    LeaseResponse terminateLease(Long id, String reason, String username);
    LeaseResponse renewLease(Long id, LeaseRequest request, String username);
    List<LeaseResponse> getExpiringLeases(int daysAhead);
}
