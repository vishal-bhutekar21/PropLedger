package com.propledger.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "PropLedger API",
        version = "1.0.0",
        description = """
            PropLedger — Property Management and Rental Operations Platform.
            
            **Authentication**: All endpoints (except /api/auth/**) require a JWT Bearer token.
            Obtain a token via POST /api/auth/login.
            
            **Pagination**: Paginated endpoints accept ?page=0&size=20&sort=field&dir=asc
            
            **Key Business Rules**:
            - Overlapping active leases on same unit are prevented by PostgreSQL exclusion constraint
            - Payment recording is fully transactional (ACID)
            - Invoice status is automatically recalculated by DB trigger after each payment
            - Outstanding balance is always derived — never stored
        """,
        contact = @Contact(name = "PropLedger", email = "admin@propledger.io")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local development"),
        @Server(url = "https://api.propledger.io", description = "Production")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class OpenApiConfig {}
