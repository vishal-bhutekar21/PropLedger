package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data @Builder
public class TenantResponse {
    private Long tenantId;
    private String fullName;
    private String email;
    private String phone;
    private String alternatePhone;
    private LocalDate dateOfBirth;
    private String nationalId;
    private String addressLine1;
    private String city;
    private String state;
    private String country;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
