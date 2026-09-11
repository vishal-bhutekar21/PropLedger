package com.propledger.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long expiresIn;
    private UserResponse user;
}
