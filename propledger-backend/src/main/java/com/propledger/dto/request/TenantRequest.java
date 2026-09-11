package com.propledger.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TenantRequest {
    @NotBlank @Size(max = 255)
    private String fullName;

    @NotBlank @Email @Size(max = 255)
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 20)
    private String alternatePhone;

    private LocalDate dateOfBirth;

    @Size(max = 100)
    private String nationalId;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String country;

    private String status;
}
