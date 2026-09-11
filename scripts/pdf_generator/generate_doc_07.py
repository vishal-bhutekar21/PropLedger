import os
import sys
sys.path.append(os.path.dirname(__file__))
from engine import PropLedgerPdfEngine

def build_doc_07(output_path="docs/pdf/07_Spring_Boot_API_And_Domain_Services.pdf"):
    doc = PropLedgerPdfEngine(
        filename=output_path,
        volume_num=7,
        volume_title="Spring Boot API & Domain Services",
        volume_category="BACKEND APPLICATION ENGINEERING"
    )

    # PAGE 1: COVER PAGE
    topics = [
        ["02", "Dual RESTful API Architecture", "Backwards-compatible /api and /api/v1 routing standards"],
        ["03", "The Life of an HTTP Request", "End-to-end execution path from socket to PostgreSQL and back"],
        ["04", "Why DTOs are Mandatory", "Defense against mass-assignment, circular recursion, and lazy errors"],
        ["05", "Mapper Design & Zero-Reflection", "Lombok builder pattern vs MapStruct compile-time mappers"],
        ["06", "Jakarta Bean Validation Engine", "@Valid, @NotNull, @DecimalMin, and custom constraint enforcement"],
        ["07", "Controller Layer Architecture", "Standard envelopes (ApiResponse<T>, PagedResponse<T>) and HTTP codes"],
        ["08", "Centralized Exception Handling", "GlobalExceptionHandler conforming to RFC 7807 problem details"],
        ["09", "Domain Service Layer & Coordinators", "Decoupling business transactions from transport protocols"],
        ["10", "Spring Boot & REST Interview Q&A", "Senior engineering interview scenarios and design tradeoffs"]
    ]
    doc.draw_cover_page(
        title="Spring Boot API & Services",
        subtitle="RESTful Endpoints, DTO Architecture & Domain Business Layer",
        volume_desc="This volume establishes the backend application engineering standards of PropLedger. Built with Spring Boot 3.3.4 and Java 21, it details dual-routed RESTful controllers, strict Data Transfer Object (DTO) isolation, zero-reflection builder mappers, Jakarta Bean Validation, centralized RFC 7807 exception handling, and decoupled domain business services.",
        key_topics=topics
    )

    # PAGE 2: DUAL RESTFUL API ARCHITECTURE
    doc.start_page("2. DUAL RESTFUL API ARCHITECTURE & ROUTING", "Backwards Compatibility via /api and /api/v1 Dual-Routing")
    doc.add_section("1. The Enterprise Versioning Dilemma")
    doc.add_paragraph("In enterprise SaaS platforms serving multiple client generations (web apps, native mobile apps, and third-party partner ERPs), breaking API contracts causes catastrophic business disruption. PropLedger implements **Dual-Routing** across all 13 controllers:")
    code = """// Dual-Routing Controller Declaration in PropertyController.java
@RestController
@RequestMapping({"/api/properties", "/api/v1/properties"})
@RequiredArgsConstructor
public class PropertyController {
    // Both endpoints /api/properties and /api/v1/properties map to this identical handler!
}"""
    doc.add_code_block(code, "Java 21 — Dual-Routing REST Controller")

    doc.add_section("2. Controller Inventory & Base Paths")
    headers = ["Domain Subsystem", "Primary Controller", "Dual Base Path", "Primary Operations"]
    rows = [
        ["Authentication", "AuthController", "/api[/v1]/auth", "login, register, me"],
        ["Asset Management", "PropertyController", "/api[/v1]/properties", "CRUD properties, asset summary"],
        ["Space Inventory", "UnitController", "/api[/v1]/units", "Unit specs, availability filter"],
        ["Resident Directory", "TenantController", "/api[/v1]/tenants", "Onboard residents, credit screening"],
        ["Lease Lifecycle", "LeaseController", "/api[/v1]/leases", "Execute, renew, early-terminate"],
        ["Accounts Receivable", "InvoiceController", "/api[/v1]/invoices", "Monthly billing, line items"],
        ["Payment Settlement", "PaymentController", "/api[/v1]/payments", "Multi-invoice split allocations"]
    ]
    doc.add_table(headers, rows, [95, 105, 120, 212])
    doc.end_page()

    # PAGE 3: THE LIFE OF AN HTTP REQUEST
    doc.start_page("3. THE LIFE OF AN HTTP REQUEST: END-TO-END", "From TCP Socket to Database Engine and Back")
    doc.add_section("1. Detailed Execution Pipeline")
    doc.add_bullet("1. TCP Handshake & Worker Allocation", "Tomcat accepts the connection and assigns a thread from its worker pool.")
    doc.add_bullet("2. Security Filter Traversal", "JwtAuthenticationFilter extracts Bearer token, validates HS256 signature, and populates SecurityContextHolder.")
    doc.add_bullet("3. DispatcherServlet Dispatch", "DispatcherServlet queries RequestMappingHandlerMapping to match URI and HTTP method to controller.")
    doc.add_bullet("4. Jackson Deserialization", "MappingJackson2HttpMessageConverter reads HTTP body and maps JSON to Request DTO.")
    doc.add_bullet("5. Jakarta Bean Validation", "Validator checks @Valid constraints (@NotBlank, @DecimalMin). If invalid, throws exception.")
    doc.add_bullet("6. CGLIB Transaction Interception", "TransactionInterceptor begins transaction, borrows connection from HikariCP, and binds thread.")
    doc.add_bullet("7. Service Execution & Mapping", "Service applies domain rules, invokes JPA repositories, and transforms entities into Response DTOs.")
    doc.add_bullet("8. Transaction Commit", "TransactionInterceptor commits transaction and releases HikariCP connection.")
    doc.add_bullet("9. Serialization & Response", "DispatcherServlet serializes ApiResponse<T> envelope to JSON and writes HTTP 200/201.")
    doc.end_page()

    # PAGE 4: WHY DTOS ARE MANDATORY
    doc.start_page("4. WHY DATA TRANSFER OBJECTS (DTOS) ARE MANDATORY", "Preventing Mass-Assignment, Recursion & Lazy Errors")
    doc.add_section("1. The Dangers of Exposing JPA Entities Directly")
    doc.add_paragraph("Exposing JPA Entities directly through REST controllers is a fatal security and architectural anti-pattern:")
    doc.add_bullet("1. Mass-Assignment / Over-Posting", "If an entity is accepted directly in @RequestBody, an attacker can supply uneditable fields (e.g. balanceDue: 0.00, status: 'PAID') and compromise the ledger.")
    doc.add_bullet("2. Infinite Recursion (StackOverflowError)", "Bidirectional associations (Property -> Units -> Property) crash Jackson serialization during JSON generation.")
    doc.add_bullet("3. LazyInitializationException", "Accessing uninitialized lazy associations outside transaction boundaries crashes the serializer with 'could not initialize proxy - no Session'.")
    doc.add_bullet("4. API Contract Tight Coupling", "Renaming an internal database column immediately breaks external client integrations.")

    doc.add_section("2. DTO Architecture in PropLedger")
    doc.add_paragraph("PropLedger strictly separates Request DTOs (only permitting client-writable fields) from Response DTOs (safe, flattened client representations):")
    headers = ["DTO Category", "Sample Class", "Key Responsibilities", "Validation Mechanism"]
    rows = [
        ["Request DTO", "PropertyCreateDto", "Carries user input; zero persistence logic", "Jakarta @Valid (@NotBlank, @Size)"],
        ["Response DTO", "PropertyResponseDto", "Client view; flattened; circular-free", "Lombok @Builder, immutable fields"],
        ["Summary DTO", "RentRollDto", "Projection for high-performance reporting", "Constructed via JPQL SELECT new ..."]
    ]
    doc.add_table(headers, rows, [95, 125, 165, 147])
    doc.end_page()

    # PAGE 5: MAPPER DESIGN & ZERO-REFLECTION
    doc.start_page("5. MAPPER DESIGN & ZERO-REFLECTION BUILDERS", "Type-Safe Transformations vs Runtime Reflection Overhead")
    doc.add_section("1. Why ModelMapper Fails in High-Throughput Systems")
    doc.add_paragraph("Reflection-based mappers (like ModelMapper or Dozer) use runtime reflection to inspect class properties on every request. In high-throughput systems, reflection incurs severe CPU overhead and fails silently when field names mismatch.")

    doc.add_section("2. PropLedger's Manual Builder Mapper Pattern")
    doc.add_paragraph("PropLedger implements explicit, type-safe builder mappers offering zero-reflection runtime speed and step-through debugging:")
    code = """// Manual Type-Safe Mapping in PropertyServiceImpl.java
private PropertyResponseDto mapToResponseDto(Property property) {
    return PropertyResponseDto.builder()
            .id(property.getId())
            .propertyCode(property.getPropertyCode())
            .name(property.getName())
            .propertyType(property.getPropertyType().name())
            .ownerId(property.getOwner() != null ? property.getOwner().getId() : null)
            .ownerName(property.getOwner() != null ? property.getOwner().getCompanyName() : null)
            .addressLine1(property.getAddressLine1())
            .city(property.getCity())
            .state(property.getState())
            .postalCode(property.getPostalCode())
            .yearBuilt(property.getYearBuilt())
            .totalAreaSqft(property.getTotalAreaSqft())
            .totalUnits(property.getUnits() != null ? property.getUnits().size() : 0)
            .createdAt(property.getCreatedAt())
            .build();
}"""
    doc.add_code_block(code, "Java 21 — Zero-Reflection Builder Mapping")
    doc.end_page()

    # PAGE 6: JAKARTA BEAN VALIDATION ENGINE
    doc.start_page("6. JAKARTA BEAN VALIDATION ENGINE", "Fail-Fast Input Sanitation & Custom Constraint Rules")
    doc.add_section("1. Declarative Field Validation")
    doc.add_paragraph("All incoming Request DTOs are validated at the controller boundary before the service layer is reached. If invalid, Spring raises MethodArgumentNotValidException:")
    code = """// PropertyCreateDto.java: Declarative Input Validation
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PropertyCreateDto {
    @NotBlank(message = "Property code is mandatory")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Property code must be alphanumeric with hyphens")
    private String propertyCode;

    @NotBlank(message = "Property name cannot be blank")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotNull(message = "Owner ID cannot be null")
    private Long ownerId;

    @NotNull(message = "Year built is mandatory")
    @Min(value = 1800, message = "Year built must be after 1800")
    private Integer yearBuilt;
}"""
    doc.add_code_block(code, "Java 21 — Jakarta Validation Annotations")

    doc.add_section("2. Standard Annotation Reference")
    headers = ["Annotation", "Validation Rule", "Primary PropLedger Use Case"]
    rows = [
        ["@NotBlank", "Not null, not empty, and not whitespace only", "Usernames, titles, property codes"],
        ["@DecimalMin", "Asserts minimum numeric currency value", "Rent amounts (@DecimalMin('0.01'))"],
        ["@FutureOrPresent", "Asserts date is today or in the future", "Lease start dates"],
        ["@Email", "Validates RFC 5322 email address format", "Resident and vendor email addresses"]
    ]
    doc.add_table(headers, rows, [110, 205, 217])
    doc.end_page()

    # PAGE 7: CONTROLLER LAYER & ENVELOPES
    doc.start_page("7. CONTROLLER ARCHITECTURE & RESPONSE ENVELOPES", "Standardized REST Payloads & HTTP Status Semantics")
    doc.add_section("1. Standard Response Envelope (ApiResponse<T>)")
    doc.add_paragraph("PropLedger standardizes all single-entity REST responses into a uniform envelope:")
    code = """public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Instant timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }
}

// JSON Output Example:
// { "success": true, "message": "Operation successful", "data": { ... }, "timestamp": "..." }"""
    doc.add_code_block(code, "Java 21 — ApiResponse Envelope Structure")

    doc.add_section("2. Paginated Response Envelope (PagedResponse<T>)")
    headers = ["Field Name", "Type", "Description & Client Usage"]
    rows = [
        ["content", "List<T>", "Array of records for the requested page slice."],
        ["pageNumber", "int", "Current 0-indexed page number."],
        ["pageSize", "int", "Number of records requested per page."],
        ["totalElements", "long", "Total count of records matching filter across entire table."],
        ["totalPages", "int", "Calculated total pages (ceil(totalElements / pageSize))."],
        ["last", "boolean", "True if current page is the final page."]
    ]
    doc.add_table(headers, rows, [100, 75, 357])
    doc.end_page()

    # PAGE 8: CENTRALIZED EXCEPTION HANDLING
    doc.start_page("8. CENTRALIZED EXCEPTION HANDLING (RFC 7807)", "Global Controller Advice & Field Error Deserialization")
    doc.add_section("1. RFC 7807 Problem Details Standard")
    doc.add_paragraph("Unhandled server errors must never leak stack traces to clients. PropLedger implements a centralized @ControllerAdvice returning standardized problem payloads:")
    code = """// GlobalExceptionHandler.java: RFC 7807 Problem Details
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<FieldErrorItem> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new FieldErrorItem(err.getField(), err.getDefaultMessage(), err.getRejectedValue()))
            .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse.builder()
                .status(400).error("Bad Request")
                .message("Validation failed for one or more fields")
                .fieldErrors(fieldErrors).timestamp(Instant.now()).build()
        );
    }
}"""
    doc.add_code_block(code, "Java 21 — GlobalExceptionHandler Implementation")
    doc.end_page()

    # PAGE 9: DOMAIN SERVICE LAYER
    doc.start_page("9. DOMAIN SERVICE LAYER & BUSINESS COORDINATORS", "Decoupling Business Logic from Web Transports")
    doc.add_section("1. The Role of Domain Services")
    doc.add_paragraph("The Service Layer in PropLedger represents the authoritative business transaction coordinator:")
    doc.add_bullet("1. Transaction Boundaries", "Coordinates multi-repository operations under atomic @Transactional scopes.")
    doc.add_bullet("2. Business Rule Enforcement", "Validates operational invariants (e.g. verifying unit is vacant before lease creation).")
    doc.add_bullet("3. Transport Independence", "Services have zero dependencies on HttpServletRequest or HTTP concepts, allowing identical reuse in CLI jobs or message queues.")
    doc.add_bullet("4. Audit Dispatch", "Dispatches immutable audit records upon successful entity mutation.")
    doc.end_page()

    # PAGE 10: SPRING BOOT INTERVIEW Q&A
    doc.start_page("10. SPRING BOOT & REST ARCHITECTURE INTERVIEW Q&A", "Senior Backend Engineering Interview Scenarios")
    doc.add_section("1. High-Yield Backend Interview Questions")

    doc.add_subsection("Question 1: What is the difference between @RestController and @Controller?")
    doc.add_paragraph("Answer: @Controller is designed for traditional Spring MVC web applications returning HTML view templates (JSP, Thymeleaf). @RestController is a convenience meta-annotation combining @Controller and @ResponseBody, instructing Spring to serialize method return values directly into HTTP response bodies (JSON) using Jackson.")

    doc.add_subsection("Question 2: How do you prevent N+1 query cascades when using Spring Data JPA?")
    doc.add_paragraph("Answer: 1) Declare associations as FetchType.LAZY. 2) Use 'JOIN FETCH' in JPQL queries to load parent and child associations in a single SQL query. 3) Configure 'hibernate.default_batch_fetch_size = 30' in application.properties, allowing Hibernate to batch-fetch lazy collections using an 'IN (?, ?, ...)' clause rather than individual queries.")

    doc.add_subsection("Question 3: Why should services return DTOs rather than JPA Entities?")
    doc.add_paragraph("Answer: Returning entities leaks persistence concerns into the presentation layer, risks LazyInitializationExceptions if associations are accessed outside transaction boundaries, and exposes sensitive or circular data. Returning immutable DTOs guarantees clean separation of concerns and deterministic API contracts.")

    doc.add_callout("Backend Staff Engineer Interview Tip", 
        "Articulating how you eliminated LazyInitializationException and N+1 query cascades demonstrates deep mastery of Spring Data JPA and Hibernate.",
        "tip"
    )
    doc.end_page()

    saved = doc.save()
    print(f"Generated Doc 07: {output_path} ({saved} pages)")
    return saved

if __name__ == "__main__":
    build_doc_07()
