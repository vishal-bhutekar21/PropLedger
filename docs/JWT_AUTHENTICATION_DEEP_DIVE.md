# PropLedger — JSON Web Token (JWT) Security Architecture & Implementation Deep-Dive

## 1. Executive Summary & Primary Purpose of JWT

In traditional web architectures, user authentication relies on **Stateful Server-Side Sessions**:
1. The client sends credentials (`username`, `password`).
2. The server creates an in-memory session object and returns a random cookie (`JSESSIONID`).
3. On every subsequent request, the server performs a lookup in memory or a centralized Redis cluster to verify the session.

### The Problem in Enterprise Real Estate Systems:
Enterprise SaaS systems like **Yardi** or **RealPage** must scale horizontally across dozens of containerized instances to support thousands of simultaneous property managers, accountants, and tenants. Stateful sessions introduce:
- **Sticky Session Bottlenecks**: Load balancers must route a user to the exact server holding their memory session.
- **Single Point of Failure**: If Redis crashes or undergoes maintenance, every user is logged out.
- **Cross-Domain / API Restrictions**: Cookie management across different mobile apps and third-party partner portals creates complex CORS issues.

### The PropLedger Solution: Stateless JWT Authentication
**PropLedger** implements stateless authentication using **JSON Web Tokens (RFC 7519)**:
- The server does not store active session records in memory or database tables.
- Instead, the server cryptographically signs a compact, URL-safe JSON payload containing the user's identity and enterprise roles (`ROLE_PROPERTY_MANAGER`, `ROLE_ACCOUNTANT`).
- The client stores this token and transmits it via the standard HTTP `Authorization: Bearer <token>` header.
- Any backend instance can verify the token's authenticity in sub-millisecond time using pure mathematics (signature verification with the shared secret key), with zero database session lookups!

---

## 2. Anatomy of a JSON Web Token

A JWT is a single string composed of three distinct base64url-encoded parts separated by periods (`.`):

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5hZ2VyQHByb3BsZWRnZXIuY29tIiwidXNlcklkIjoxLCJyb2xlcyI6WyJST0xFX1BST1BFUlRZX01BTkFHRVIiXSwiaWF0IjoxNzI2MTAwMDAwLCJleHAiOjE3MjYxODY0MDB9.7r8bE9q3Yv7lWk2...
```

```mermaid
graph TD
    JWT[JSON Web Token] --> Header["1. Header (Algorithm & Token Type)"]
    JWT --> Payload["2. Payload (Claims & Identity Data)"]
    JWT --> Signature["3. Signature (HMAC-SHA256 Cryptographic Hash)"]
```

### 2.1. Part 1: Header
Identifies the cryptographic algorithm used to sign the token:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2.2. Part 2: Payload (Claims)
Contains the statements about the authenticated principal and contextual metadata:
```json
{
  "sub": "manager@propledger.com",
  "userId": 1,
  "fullName": "Enterprise Property Manager",
  "roles": [
    "ROLE_PROPERTY_MANAGER"
  ],
  "iat": 1726100000,
  "exp": 1726186400
}
```
- `sub` (*Subject*): The unique username or email.
- `iat` (*Issued At*): Unix epoch timestamp when token was created.
- `exp` (*Expiration*): Unix epoch timestamp when token expires (enforces automatic logout).
- Custom Claims: `userId`, `roles`, allowing downstream endpoints to make authorization decisions without querying PostgreSQL.

### 2.3. Part 3: Signature
The signature guarantees that the token has not been tampered with in transit. It is calculated by hashing the encoded header and payload using the server's private secret key:
$$\text{Signature} = \text{HMAC-SHA256}\Big(\text{base64UrlEncode}(\text{Header}) + \text{"."} + \text{base64UrlEncode}(\text{Payload}),\ \text{SecretKey}\Big)$$

> **Tamper Proof Guarantee**: If an attacker attempts to elevate their privileges by changing `"roles": ["ROLE_TENANT"]` to `"roles": ["ROLE_SUPER_ADMIN"]`, the recalculated signature will not match the token's signature, and PropLedger will reject the request immediately with `SignatureException`.

---

## 3. End-to-End Authentication & Authorization Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser Client)
    participant React as React 19 Frontend (Axios)
    participant AuthCtrl as AuthController
    participant AuthMgr as AuthenticationManager
    participant UserDetailsSvc as UserDetailsServiceImpl
    participant JwtProv as JwtTokenProvider
    participant JwtFilter as JwtAuthenticationFilter
    participant ProtectedCtrl as PropertyController

    User->>React: Enters credentials (email, password)
    React->>AuthCtrl: POST /api/auth/login { username, password }
    AuthCtrl->>AuthMgr: authenticate(UsernamePasswordAuthenticationToken)
    AuthMgr->>UserDetailsSvc: loadUserByUsername("manager@propledger.com")
    UserDetailsSvc-->>AuthMgr: UserDetails (bcrypt hash + Authorities)
    AuthMgr->>AuthMgr: Verify password hash (BCrypt work factor 12)
    AuthMgr-->>AuthCtrl: Authentication Object (Authenticated = true)
    AuthCtrl->>JwtProv: generateToken(authentication)
    JwtProv-->>AuthCtrl: Signed JWT String
    AuthCtrl-->>React: 200 OK { token, userProfile }
    React->>React: Save token in localStorage / AuthContext

    Note over User, ProtectedCtrl: Subsequent API Requests (e.g. Loading Properties)
    React->>JwtFilter: GET /api/properties (Authorization: Bearer <token>)
    JwtFilter->>JwtFilter: Extract token from header
    JwtFilter->>JwtProv: validateToken(token)
    JwtProv-->>JwtFilter: Valid (Signature & Exp verified)
    JwtFilter->>JwtProv: getUsernameFromToken(token)
    JwtFilter->>UserDetailsSvc: loadUserByUsername(username)
    UserDetailsSvc-->>JwtFilter: UserDetails
    JwtFilter->>JwtFilter: SecurityContextHolder.getContext().setAuthentication(auth)
    JwtFilter->>ProtectedCtrl: FilterChain.doFilter(request, response)
    ProtectedCtrl-->>React: 200 OK [ Property Data ]
```

---

## 4. Code Walkthrough: PropLedger Implementation

### 4.1. The Token Generator & Validator (`JwtTokenProvider.java`)
Located at `propledger-backend/src/main/java/com/propledger/security/JwtTokenProvider.java`:

```java
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. GENERATE TOKEN
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // 2. VALIDATE TOKEN SIGNATURE & EXPIRATION
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
```

### 4.2. The Stateless Request Interceptor (`JwtAuthenticationFilter.java`)
Located at `propledger-backend/src/main/java/com/propledger/security/JwtAuthenticationFilter.java`:

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain
    ) throws ServletException, IOException {
        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String username = tokenProvider.getUsernameFromToken(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set Spring Security Context for this thread
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### 4.3. Spring Security Configuration (`SecurityConfig.java`)
Located at `propledger-backend/src/main/java/com/propledger/config/SecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Safe because REST API is stateless
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // ZERO HTTP SESSIONS
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/properties/**").hasAnyRole("PROPERTY_MANAGER", "SUPER_ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 5. Frontend Token Integration (React 19 & Axios)

In the frontend, every outgoing network request must transparently attach the bearer token without requiring developers to pass headers manually:

```typescript
// propledger-frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Inject Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid -> wipe storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 6. Security Analysis: Attack Vectors & Mitigations

### 6.1. XSS vs. CSRF Tradeoff
- **Why CSRF is Disabled in `SecurityConfig`**: CSRF (Cross-Site Request Forgery) exploits the browser's automatic inclusion of cookies on cross-origin requests. Because PropLedger uses bearer tokens passed explicitly in the `Authorization` header, the browser **never** sends the token automatically on third-party site requests. CSRF attacks are mathematically prevented.
- **XSS Mitigation**: If malicious script runs in the browser, it can read `localStorage`. To mitigate XSS:
  1. Strict input sanitization across all forms.
  2. Content Security Policy (CSP) headers enabled on web servers.
  3. Short token lifespans (e.g. 1 hour to 24 hours).

### 6.2. The Token Revocation Challenge
Since JWTs are stateless, what happens if an administrator terminates a rogue leasing agent?
1. **Short Expiration**: Access tokens expire quickly, limiting damage windows.
2. **User `token_version` Counter**: The `users` table holds a `token_version INT`. The token contains this claim. When a user is terminated or changes passwords, the backend increments `token_version`. If a presented token has an older version, it is rejected.
3. **Redis JTI Blacklist**: For immediate revocation, the server maintains an in-memory blocklist of revoked `jti` (JWT IDs) with TTLs matching the remaining expiration duration.

---

## 7. High-Yield Interview Q&A on JWT

| Question | Principal Engineer Answer |
| :--- | :--- |
| **"Can anyone read the contents of a JWT token?"** | **Yes!** The payload is merely base64url encoded, not encrypted. Anyone who intercepts the token can decode it (e.g. via `jwt.io`) and view the username, user ID, and roles. Therefore, **sensitive secrets (passwords, social security numbers, credit card numbers) must NEVER be placed in a JWT payload**. The signature only guarantees that the data was not modified, not that it is confidential. If confidentiality is required, JWE (JSON Web Encryption) must be used. |
| **"What is the difference between an Access Token and a Refresh Token?"** | An **Access Token** is short-lived (e.g., 15–30 minutes) and sent on every API request. A **Refresh Token** is long-lived (e.g., 7–30 days), stored securely (often in an `HttpOnly` cookie or encrypted storage), and used solely to request a new access token when the current one expires. This minimizes exposure if an access token is intercepted while maintaining a seamless user login experience. |
| **"What algorithm does PropLedger use for signing, and why?"** | PropLedger uses **HMAC-SHA256 (HS256)**, a symmetric key algorithm where the same 256-bit secret is used to sign and verify tokens. For our unified Spring Boot cluster, HS256 provides optimal cryptographic throughput. In a distributed microservices ecosystem with third-party verification, an asymmetric algorithm like **RS256** (RSA Signature with SHA-256) or **ES256** (ECDSA) would be preferred, allowing downstream services to verify tokens using a public key without sharing the private signing key. |
