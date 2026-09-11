# PropLedger — Spring Boot, JPA, Security & Lombok Annotations Reference Guide

## 1. Executive Summary & Purpose

In modern enterprise Java applications (Spring Boot 3.3.4, Java 21), annotations act as declarative metadata instructing the Spring IoC container, Hibernate ORM, Jakarta Validation engine, and Spring Security filters on how to instantiate, wire, proxy, and protect classes.

This guide provides an exhaustive reference for **every annotation utilized across the PropLedger backend**, explaining:
1. **What it does under the hood** (Reflection, Dynamic Proxies, CGLIB, AST transforms, bytecode manipulation).
2. **Where and why it is used in PropLedger** (with exact code examples).
3. **Critical pitfalls, gotchas, and enterprise interview questions**.

---

## 2. Spring Core & Dependency Injection (IoC) Annotations

### 2.1. `@SpringBootApplication`
- **Found in**: `PropLedgerBackendApplication.java`
- **Under the Hood**: Meta-annotation combining three foundational annotations:
  1. `@SpringBootConfiguration`: Marks the class as a configuration source for Spring beans.
  2. `@EnableAutoConfiguration`: Scans the classpath (e.g., `spring-boot-starter-data-jpa`, `postgresql`) and automatically configures beans based on detected libraries (e.g., `HikariDataSource`, `LocalContainerEntityManagerFactoryBean`).
  3. `@ComponentScan`: Recursively scans package `com.propledger` and all sub-packages for `@Component`, `@Service`, `@Repository`, `@RestController`.
- **Purpose in PropLedger**: Bootstraps the enterprise server and registers all 13 domain subsystems.

### 2.2. `@Configuration` & `@Bean`
- **Found in**: `SecurityConfig.java`, `OpenApiConfig.java`, `CacheConfig.java`
- **Under the Hood**: Classes annotated with `@Configuration` are enhanced with CGLIB proxies. When a method annotated with `@Bean` is invoked multiple times, CGLIB intercepts the call to ensure it returns the singleton instance from the `ApplicationContext` rather than constructing a new object.
- **Example in PropLedger**:
  ```java
  @Configuration
  public class SecurityConfig {
      @Bean
      public PasswordEncoder passwordEncoder() {
          return new BCryptPasswordEncoder(12);
      }
  }
  ```

### 2.3. `@Component`, `@Service`, `@Repository`
- **Found in**: Throughout `com.propledger.service.impl`, `com.propledger.repository`, and `com.propledger.security`.
- **Under the Hood**: All three are specializations of `@Component`.
  - `@Service`: Identifies domain business logic components. Serves as a target for AOP transaction boundaries.
  - `@Repository`: Translates native database/JDBC vendor exceptions (e.g., PostgreSQL `PSQLException`) into Spring's unified unchecked `DataAccessException` hierarchy via `PersistenceExceptionTranslationPostProcessor`.
- **Example in PropLedger**:
  ```java
  @Service
  @RequiredArgsConstructor
  public class PaymentServiceImpl implements PaymentService { ... }

  @Repository
  public interface InvoiceRepository extends JpaRepository<Invoice, Long> { ... }
  ```

### 2.4. `@Value`
- **Found in**: `JwtTokenProvider.java`
- **Under the Hood**: Evaluates SpEL (Spring Expression Language) or resolves environment variable placeholders from `application.properties` during bean initialization via `PropertySourcesPlaceholderConfigurer`.
- **Example in PropLedger**:
  ```java
  @Value("${app.jwt.secret}")
  private String jwtSecret;

  @Value("${app.jwt.expiration-ms}")
  private long jwtExpirationMs;
  ```

---

## 3. Spring MVC & REST Controller Annotations

### 3.1. `@RestController` & `@RequestMapping`
- **Found in**: All 13 controllers in `com.propledger.controller`
- **Under the Hood**: `@RestController` combines `@Controller` and `@ResponseBody`. It tells Spring's `DispatcherServlet` that method return values should not resolve to HTML views, but instead serialize directly into HTTP response bodies using `MappingJackson2HttpMessageConverter`.
- **Dual-Routing in PropLedger**:
  ```java
  @RestController
  @RequestMapping({"/api/properties", "/api/v1/properties"})
  @RequiredArgsConstructor
  public class PropertyController { ... }
  ```
  Allows backwards-compatible versioned routing alongside standard REST routes.

### 3.2. HTTP Method Mappings: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- **Found in**: All controllers.
- **Under the Hood**: Shortcuts for `@RequestMapping(method = RequestMethod.GET)`, etc.
- **Example in PropLedger**:
  ```java
  @PostMapping
  public ResponseEntity<ApiResponse<PropertyResponseDto>> createProperty(
          @Valid @RequestBody PropertyCreateDto request) { ... }
  ```

### 3.3. Parameter Extraction: `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader`
- **`@PathVariable`**: Extracts URI template parameters (e.g. `/api/invoices/{id}`).
- **`@RequestParam`**: Extracts HTTP query string arguments (e.g. `?page=0&size=20&status=ACTIVE`).
- **`@RequestBody`**: Reads the raw HTTP input stream, deserializing the JSON payload into a Java DTO via Jackson.
- **Example in PropLedger**:
  ```java
  @GetMapping
  public ResponseEntity<PagedResponse<InvoiceDto>> getInvoices(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "20") int size,
          @RequestParam(required = false) String status) { ... }
  ```

### 3.4. `@ControllerAdvice` & `@ExceptionHandler`
- **Found in**: `GlobalExceptionHandler.java`
- **Under the Hood**: Implements centralized AOP exception interception across all `@RestController` beans. When an unhandled exception escapes a controller, `DispatcherServlet` delegates to the matching `@ExceptionHandler` method.
- **Purpose in PropLedger**: Formats errors into standard RFC 7807 problem details payloads, sanitizing stack traces to prevent security leaks.
- **Example in PropLedger**:
  ```java
  @ControllerAdvice
  public class GlobalExceptionHandler {
      @ExceptionHandler(MethodArgumentNotValidException.class)
      public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) { ... }
      
      @ExceptionHandler(EntityNotFoundException.class)
      public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) { ... }
  }
  ```

---

## 4. Jakarta Persistence (JPA) & Hibernate ORM Annotations

### 4.1. Entity Definition: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- **Found in**: All models in `com.propledger.entity`
- **Under the Hood**:
  - `@Entity`: Informs Hibernate that this class corresponds to a row in the relational database.
  - `@Table(name = "invoices")`: Specifies the exact PostgreSQL table name.
  - `@Id`: Marks the primary surrogate key.
  - `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Relies on PostgreSQL's native `BIGSERIAL` / `GENERATED ALWAYS AS IDENTITY` sequence.
- **Example in PropLedger**:
  ```java
  @Entity
  @Table(name = "invoices")
  public class Invoice {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;
  }
  ```

### 4.2. Relational Association Annotations: `@ManyToOne`, `@OneToMany`, `@JoinColumn`
- **Found in**: `Property.java`, `Unit.java`, `Lease.java`, `Invoice.java`
- **Under the Hood**: Directs Hibernate's relational navigation.
  - `fetch = FetchType.LAZY`: **Critical Enterprise Standard**. Tells Hibernate not to fetch the associated entity until explicitly referenced, preventing $N+1$ query cascades.
  - `@JoinColumn(name = "property_id")`: Defines the foreign key column name in the table.
- **Example in PropLedger**:
  ```java
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;

  @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Unit> units = new ArrayList<>();
  ```

### 4.3. Optimistic Locking: `@Version`
- **Found in**: `WorkOrder.java`
- **Under the Hood**: Hibernate automatically increments this version counter on every `UPDATE`. If another transaction modified the row concurrently, Hibernate executes `WHERE id = ? AND version = ?`, detects 0 rows updated, and throws an `OptimisticLockException`.
- **Purpose in PropLedger**: Prevents maintenance technicians in the field from accidentally overwriting work orders modified by office managers.
- **Example in PropLedger**:
  ```java
  @Version
  @Column(name = "version")
  private Long version;
  ```

### 4.4. Column Metadata & Audit: `@Column`, `@Enumerated`, `@CreationTimestamp`, `@UpdateTimestamp`
- **`@Enumerated(EnumType.STRING)`**: Persists enum values as human-readable strings (e.g. `'ACTIVE'`) rather than fragile ordinal integers ($0, 1$).
- **`@CreationTimestamp` / `@UpdateTimestamp`**: Injects automated timestamps managed by Hibernate during entity lifecycle events.
- **Example in PropLedger**:
  ```java
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  private LeaseStatus status;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private Instant createdAt;
  ```

---

## 5. Spring Data JPA & Concurrency Annotations

### 5.1. `@Query` & `@Param`
- **Found in**: All repositories in `com.propledger.repository`
- **Under the Hood**: Defines custom JPQL or native SQL queries. Parameters bound via `@Param` are injected into JDBC prepared statements as `?` placeholders, providing 100% defense against SQL Injection attacks.
- **Example in PropLedger**:
  ```java
  @Query("SELECT u FROM Unit u WHERE u.property.id = :propertyId AND u.status = :status")
  List<Unit> findAvailableUnitsByProperty(
      @Param("propertyId") Long propertyId, 
      @Param("status") UnitStatus status
  );
  ```

### 5.2. `@Modifying`
- **Found in**: `UserRepository.java`, `InvoiceRepository.java`
- **Under the Hood**: Informs Spring Data JPA that the `@Query` is a DML write statement (`UPDATE` or `DELETE`) rather than a `SELECT`. Instructs the `EntityManager` to clear its first-level persistence cache (`clearAutomatically = true`) to prevent stale entity reads.
- **Example in PropLedger**:
  ```java
  @Modifying
  @Query("UPDATE User u SET u.lastLogin = CURRENT_TIMESTAMP WHERE u.id = :userId")
  void updateLastLogin(@Param("userId") Long userId);
  ```

### 5.3. `@Lock` & `@QueryHints` (Pessimistic Concurrency)
- **Found in**: `InvoiceRepository.java`, `UnitRepository.java`
- **Under the Hood**: Appends `FOR UPDATE` to the generated SQL in PostgreSQL, acquiring an exclusive row lock at the database engine layer. The query hint specifies a lock timeout in milliseconds, preventing infinite thread hangs if another transaction holds the lock.
- **Example in PropLedger**:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
  @Query("SELECT i FROM Invoice i WHERE i.id = :id")
  Optional<Invoice> findByIdForUpdate(@Param("id") Long id);
  ```

---

## 6. Transaction Management: `@Transactional`

### 6.1. Attributes and Mechanisms
- **Found in**: All classes in `com.propledger.service.impl`
- **Under the Hood**: Spring wraps the class or method in a dynamic CGLIB or JDK AOP proxy (`TransactionInterceptor`). 
  - Before method execution: Acquires a connection from HikariCP, sets `connection.setAutoCommit(false)`, and binds it to `TransactionSynchronizationManager`.
  - On method success: Calls `connection.commit()`.
  - On exception: Calls `connection.rollback()`.

### 6.2. Key Attributes Used in PropLedger:
1. **`isolation`**:
   - `Isolation.READ_COMMITTED`: Default for standard OLTP operations.
   - `Isolation.SERIALIZABLE`: Used in `LeaseServiceImpl` for lease execution to guarantee zero write skew.
2. **`propagation`**:
   - `Propagation.REQUIRED` (default): Joins existing transaction or creates a new one.
   - `Propagation.REQUIRES_NEW`: Used in `AuditLogService.logAction()`. Suspends the outer transaction and creates an independent transaction so audit records are preserved even if the outer business transaction rolls back!
3. **`readOnly = true`**:
   - Informs Hibernate to disable dirty-checking flushes and routes the query to read replicas, saving significant CPU.
4. **`rollbackFor = Exception.class`**:
   - Forces rollback on *all* checked exceptions, not just `RuntimeException`.

- **Example in PropLedger**:
  ```java
  @Transactional(
      propagation = Propagation.REQUIRED,
      isolation = Isolation.READ_COMMITTED,
      rollbackFor = Exception.class
  )
  public PaymentResponseDto processPayment(PaymentRequestDto request) { ... }
  ```

---

## 7. Jakarta Bean Validation Annotations

Validated via `@Valid` in Controller request bodies. If constraints are violated, Spring throws `MethodArgumentNotValidException` before the service is ever reached.

| Annotation | Attribute Checked | Real PropLedger Usage |
| :--- | :--- | :--- |
| **`@NotNull`** | Disallows `null` objects | `@NotNull(message = "Property ID cannot be null") private Long propertyId;` |
| **`@NotBlank`** | Disallows `null`, empty string `""`, and whitespace `" "` | `@NotBlank(message = "Username is mandatory") private String username;` |
| **`@DecimalMin`** | Enforces minimum numeric currency values | `@DecimalMin(value = "0.01", message = "Rent must be positive") private BigDecimal marketRent;` |
| **`@Email`** | Enforces standard RFC 5322 email regex | `@Email(message = "Invalid email format") private String email;` |
| **`@Pattern`** | Enforces custom regular expression | `@Pattern(regexp = "^[A-Z0-9-]+$", message = "Alphanumeric only") private String propertyCode;` |
| **`@FutureOrPresent`**| Requires date $\ge$ current date | `@FutureOrPresent(message = "Start date must be current or future") private LocalDate startDate;` |

---

## 8. Project Lombok Annotations (Boilerplate Elimination)

Lombok operates at **compile-time** as an Annotation Processor (JSR 269), transforming the Java Abstract Syntax Tree (AST) before `.class` bytecode generation:

| Annotation | AST Modification | Why Used in PropLedger |
| :--- | :--- | :--- |
| **`@Getter` / `@Setter`** | Injects accessor/mutator methods directly into bytecode. | Keeps entity and DTO source files clean and concise. |
| **`@Builder`** | Injects the GoF Builder pattern (`User.builder().username("...").build()`). | Used across all DTOs and Mappers for clean object construction. |
| **`@NoArgsConstructor`** | Generates zero-argument constructor. | **Mandatory for JPA Entities** and Jackson deserialization. |
| **`@AllArgsConstructor`**| Generates constructor containing all fields. | Required by `@Builder`. |
| **`@RequiredArgsConstructor`**| Generates constructor for `final` fields only. | **Enterprise Standard for Constructor Dependency Injection**. Eliminates fragile `@Autowired` field injection. |
| **`@Slf4j`** | Injects `private static final org.slf4j.Logger log = LoggerFactory.getLogger(ThisClass.class);`. | Standardized structured logging across all services. |

### ⚠️ Critical Lombok Enterprise Trap:
**Never use `@Data` or `@EqualsAndHashCode` on bidirectional JPA Entities!**
- `@Data` generates `toString()` and `hashCode()` using all fields. If `Property` references `List<Unit>` and `Unit` references `Property`, calling `toString()` triggers infinite mutual recursion, crashing the JVM with a `StackOverflowError`.
- **PropLedger Standard**: We use explicit `@Getter`, `@Setter`, and base `equals()` and `hashCode()` strictly on primary keys (`id`).

---

## 9. Spring Security & Method Authorization Annotations

### 9.1. `@EnableWebSecurity` & `@EnableMethodSecurity`
- **Found in**: `SecurityConfig.java`
- **Under the Hood**:
  - `@EnableWebSecurity`: Switches off Spring Boot's default basic authentication and registers our custom `SecurityFilterChain`.
  - `@EnableMethodSecurity`: Enables Spring Security AOP method interception for `@PreAuthorize`.

### 9.2. `@PreAuthorize`
- **Found in**: Sensitive service and controller methods.
- **Under the Hood**: Evaluates Spring-EL expressions against the `SecurityContext` before method invocation. If the expression evaluates to `false`, throws `AccessDeniedException` (HTTP 403 Forbidden).
- **Example in PropLedger**:
  ```java
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) { ... }
  ```

---

## 10. Top Interview Questions on Spring Annotations

| Interview Question | Principal Engineer Answer |
| :--- | :--- |
| **"Why is `@RequiredArgsConstructor` preferred over `@Autowired` on private fields?"** | Field injection (`@Autowired private X x;`) makes unit testing difficult without starting a full Spring reflection context, hides circular dependencies, and violates immutability. Constructor injection (`@RequiredArgsConstructor` with `private final X x;`) guarantees that dependencies cannot be mutated after instantiation and allows direct passing of mocks in pure unit tests (`new ServiceImpl(mockRepo)`). |
| **"What happens if method A without `@Transactional` calls method B with `@Transactional` inside the same class?"** | The transaction will **fail to start**. Spring transactions are implemented via dynamic AOP proxies. When calling a method on `this`, the call bypasses the Spring CGLIB proxy and executes directly against the target instance in memory. |
| **"What is the difference between `@NotNull`, `@NotEmpty`, and `@NotBlank`?"** | - `@NotNull`: Rejects `null`, but allows empty strings `""` and whitespace `" "`.<br>- `@NotEmpty`: Rejects `null` and empty strings `""`, but allows whitespace `" "`.<br>- `@NotBlank`: Rejects `null`, empty strings `""`, and strings consisting only of whitespace (trims before checking). Always use `@NotBlank` for user inputs like usernames, titles, and property codes. |
