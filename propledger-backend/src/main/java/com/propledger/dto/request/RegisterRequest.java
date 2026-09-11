package com.propledger.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 100) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6, max = 100) private String password;
    @NotBlank @Size(max = 255) private String fullName;
    private String phone;
    @NotEmpty private Set<String> roles;
}
