package com.propledger.exception;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
public class ApiError {
    private OffsetDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;
}
