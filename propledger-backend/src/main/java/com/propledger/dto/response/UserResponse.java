package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private Boolean isActive;
    private Set<String> roles;
    private OffsetDateTime lastLogin;
    private OffsetDateTime createdAt;
}
