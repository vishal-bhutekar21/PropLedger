package com.propledger.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VendorRequest {
    @NotBlank @Size(max = 255)
    private String companyName;

    @Size(max = 255)
    private String contactPerson;

    @Size(max = 255)
    private String email;

    @Size(max = 30)
    private String phone;

    @NotBlank @Size(max = 100)
    private String serviceType;

    private String address;

    @Size(max = 100)
    private String taxId;

    @Min(1) @Max(5)
    private Short rating;

    private String status;
    private String notes;
}
