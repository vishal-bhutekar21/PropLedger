package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class VendorResponse {
    private Long vendorId;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String serviceType;
    private String address;
    private String taxId;
    private Short rating;
    private String status;
    private String notes;
    private OffsetDateTime createdAt;
}
