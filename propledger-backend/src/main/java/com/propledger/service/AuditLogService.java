package com.propledger.service;

import com.propledger.entity.AuditLog;
import com.propledger.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Logs an audit event. Uses REQUIRES_NEW so the audit record is
     * committed even if the caller's transaction is rolled back.
     * Note: For payment and lease transactions, we deliberately log
     * INSIDE the same transaction so the audit record rolls back with
     * the business operation if something fails.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String username, String action, String entityType, Long entityId,
                    Map<String, Object> oldValue, Map<String, Object> newValue, String description) {
        AuditLog entry = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .description(description)
                .build();
        auditLogRepository.save(entry);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String username, String action, String entityType, Long entityId, String description) {
        log(username, action, entityType, entityId, null, null, description);
    }
}
