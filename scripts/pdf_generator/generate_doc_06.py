import os
import sys
sys.path.append(os.path.dirname(__file__))
from engine import PropLedgerPdfEngine

def build_doc_06(output_path="docs/pdf/06_Identity_JWT_And_Spring_Security.pdf"):
    doc = PropLedgerPdfEngine(
        filename=output_path,
        volume_num=6,
        volume_title="Identity, JWT & Spring Security",
        volume_category="ENTERPRISE SECURITY ENGINEERING"
    )

    # PAGE 1: COVER PAGE
    topics = [
        ["02", "Role-Based Access Control (RBAC)", "Hierarchical privilege tiers from Super Admin to Resident"],
        ["03", "Stateless JWT vs Stateful Sessions", "Eliminating sticky sessions and session database bottlenecks"],
        ["04", "RFC 7519 Token Anatomy", "Header, claims payload, and HMAC-SHA256 signature mechanics"],
        ["05", "End-to-End Authentication Flow", "From login credentials to SecurityContextHolder thread-binding"],
        ["06", "Deep-Dive: JwtTokenProvider", "Token generation, claims parsing, and cryptographic verification"],
        ["07", "Deep-Dive: JwtAuthenticationFilter", "OncePerRequestFilter interceptor extracting Bearer headers"],
        ["08", "Deep-Dive: SecurityConfig", "Stateless SecurityFilterChain, CORS policy, and CSRF disabling"],
        ["09", "Attack Vectors & Mitigations", "XSS vs CSRF, secret entropy, and token revocation strategies"],
        ["10", "Security & Auth Interview Q&A", "Senior engineering interview scenarios, JWE, and refresh tokens"]
    ]
    doc.draw_cover_page(
        title="Identity & Spring Security",
        subtitle="Stateless JWT Architecture, RBAC & Cryptographic Verification",
        volume_desc="This volume presents the zero-trust security and authentication architecture of PropLedger. Built with Spring Security 6.3 and Java 21, it provides an exhaustive code-level analysis of stateless JSON Web Tokens (RFC 7519), BCrypt password hashing, OncePerRequestFilter request interception, fine-grained Role-Based Access Control (RBAC), and enterprise attack mitigation strategies.",
        key_topics=topics
    )

    # PAGE 2: RBAC PERMISSIONS MATRIX
    doc.start_page("2. ROLE-BASED ACCESS CONTROL (RBAC) PRIVILEGE MATRIX", "Enterprise Personas & Least Privilege Segregation")
    doc.add_section("1. The Enterprise Persona Hierarchy")
    doc.add_paragraph("Enterprise real estate software manages sensitive lease contracts, bank payouts, and tenant PII. PropLedger enforces strict segregation of duties across five role tiers:")
    headers = ["Enterprise Role", "Asset Mgmt", "Tenant / Leases", "Billing / Invoices", "Audit Logs", "System Config"]
    rows = [
        ["ROLE_SUPER_ADMIN", "Full Control", "Full Control", "Full Control", "Full Access", "Full Control"],
        ["ROLE_PROPERTY_MANAGER", "Create / Edit", "Onboard / Sign", "Generate / Send", "Read Own", "No Access"],
        ["ROLE_ACCOUNTANT", "Read Only", "Read Only", "Post / Settle", "Read Ledger", "No Access"],
        ["ROLE_MAINTENANCE_TECH", "Read Spaces", "Read Work Tickets", "Log Labor Costs", "No Access", "No Access"],
        ["ROLE_TENANT", "No Access", "Read Own Lease", "Pay Own Invoices", "No Access", "No Access"]
    ]
    doc.add_table(headers, rows, [115, 80, 85, 95, 75, 82])

    doc.add_section("2. Method-Level Authorization via @PreAuthorize")
    doc.add_paragraph("PropLedger combines endpoint-level filter rules with method-level Spring-EL security annotations:")
    code = """// Method-level Security in Controller Layer
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
    propertyService.deleteProperty(id);
    return ResponseEntity.ok(ApiResponse.success("Property deactivated", null));
}"""
    doc.add_code_block(code, "Java 21 — Method-Level Authorization")
    doc.end_page()

    # PAGE 3: STATELESS JWT VS SESSIONS
    doc.start_page("3. STATELESS JWT VS STATEFUL SERVER-SIDE SESSIONS", "Horizontal Scalability & Zero-Database Session Bottlenecks")
    doc.add_section("1. The Architectural Breakdown of Stateful Sessions")
    doc.add_paragraph("In legacy session-based architectures (JSESSIONID stored in cookies): 1) Every API request hits a centralized Redis cluster to deserialize session state. If Redis experiences latency, the entire API stalls. 2) Load balancers require 'sticky sessions', preventing uniform traffic distribution.")

    doc.add_section("2. The Stateless JWT Paradigm in PropLedger")
    doc.add_paragraph("In PropLedger, the server signs a cryptographically verifiable token containing the user's ID and granted roles. Any backend container can verify the token's validity in sub-millisecond time using pure mathematics, with zero database lookups:")
    headers = ["Evaluation Metric", "Stateful Server Sessions (Redis)", "Stateless JWT (PropLedger)"]
    rows = [
        ["Database I/O on Request", "Requires 1 Redis/DB read per HTTP call", "ZERO database reads (pure math verification)"],
        ["Horizontal Scaling", "Requires shared distributed session cache", "Effortless (instances share only public/private key)"],
        ["Cross-Domain / Mobile", "Complex cookie domain & third-party blocks", "Simple (passed in Authorization: Bearer header)"],
        ["Token Revocation", "Instant (delete key in Redis)", "Requires short expiration or JTI blacklist cache"]
    ]
    doc.add_table(headers, rows, [125, 195, 212])
    doc.end_page()

    # PAGE 4: RFC 7519 TOKEN ANATOMY
    doc.start_page("4. ANATOMY OF A JSON WEB TOKEN (RFC 7519)", "Header, Claims Payload & Cryptographic Signature")
    doc.add_section("1. Three Token Components")
    doc.add_paragraph("A JWT is a compact, URL-safe string containing three base64url-encoded parts separated by periods:")
    doc.add_bullet("1. Header", "Algorithm (HS256) and token type (JWT): '{\"alg\": \"HS256\", \"typ\": \"JWT\"}'.")
    doc.add_bullet("2. Payload (Claims)", "Identity statements: subject ('manager@propledger.com'), roles (['ROLE_PROPERTY_MANAGER']), issuedAt, expiration.")
    doc.add_bullet("3. Signature", "Cryptographic hash guaranteeing tamper-proof integrity:")
    doc.add_paragraph("Signature = HMAC-SHA256(base64Url(Header) + '.' + base64Url(Payload), SecretKey)")

    doc.add_section("2. Real Decoded Token Payload from PropLedger")
    code = """{
  "sub": "manager@propledger.com",
  "userId": 1,
  "fullName": "Enterprise Property Manager",
  "roles": [
    "ROLE_PROPERTY_MANAGER"
  ],
  "iat": 1726100000,
  "exp": 1726186400
}"""
    doc.add_code_block(code, "JSON — Decoded Claims Payload")

    doc.add_callout("Security Golden Rule", "A JWT is signed, NOT encrypted! Anyone who intercepts the token can decode the claims. Never store sensitive secrets (passwords, social security numbers, credit card numbers) in a JWT payload.", "alert")
    doc.end_page()

    # PAGE 5: END-TO-END AUTHENTICATION FLOW
    doc.start_page("5. END-TO-END AUTHENTICATION & AUTHORIZATION FLOW", "Sequence of Operations: Login to SecurityContextHolder")
    doc.add_section("1. Sequence of Authentication Operations")
    doc.add_bullet("1. Login Request", "Browser POSTs { username, password } to /api/auth/login.")
    doc.add_bullet("2. AuthenticationManager", "Delegates to DaoAuthenticationProvider -> UserDetailsServiceImpl.")
    doc.add_bullet("3. BCrypt Verification", "Hashes candidate password with 12 rounds of salting and compares against users.password_hash.")
    doc.add_bullet("4. Token Generation", "JwtTokenProvider constructs signed JWT string and returns it in HTTP 200 payload.")
    doc.add_bullet("5. Client Storage", "React saves token in localStorage and React Context (AuthContext.tsx).")
    doc.add_bullet("6. Authenticated Request", "Axios interceptor attaches 'Authorization: Bearer <token>' to all subsequent API calls.")
    doc.add_bullet("7. Filter Interception", "JwtAuthenticationFilter extracts token, validates signature, builds Authentication object, and populates SecurityContextHolder.")

    doc.add_section("2. Password Hashing: BCrypt Work Factor 12")
    doc.add_paragraph("PropLedger enforces BCrypt with work factor 12 (2^12 = 4,096 iterations). This provides an optimal balance between server login latency (~200ms) and resistance against brute-force GPU attacks.")
    doc.end_page()

    # PAGE 6: DEEP-DIVE: JWTTOKENPROVIDER
    doc.start_page("6. DEEP-DIVE: JWTTOKENPROVIDER IMPLEMENTATION", "Generating, Signing & Parsing Cryptographic Tokens")
    doc.add_section("1. JwtTokenProvider.java Source Listing")
    code = """// propledger-backend/src/main/java/com/propledger/security/JwtTokenProvider.java
@Component
@Slf4j
public class JwtTokenProvider {
    @Value("${app.jwt.secret}") private String jwtSecret;
    @Value("${app.jwt.expiration-ms}") private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("roles", roles)
                .issuedAt(now).expiration(expiry)
                .signWith(getSigningKey(), Jwts.SIG.HS256).compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }
}"""
    doc.add_code_block(code, "Java 21 — JwtTokenProvider.java")
    doc.end_page()

    # PAGE 7: DEEP-DIVE: JWTAUTHENTICATIONFILTER
    doc.start_page("7. DEEP-DIVE: JWTAUTHENTICATIONFILTER", "OncePerRequestFilter & SecurityContext Injection")
    doc.add_section("1. JwtAuthenticationFilter.java Source Listing")
    code = """// propledger-backend/src/main/java/com/propledger/security/JwtAuthenticationFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String username = tokenProvider.getUsernameFromToken(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // BIND AUTHENTICATION TO THREAD-LOCAL CONTEXT:
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) ? bearer.substring(7) : null;
    }
}"""
    doc.add_code_block(code, "Java 21 — JwtAuthenticationFilter.java")
    doc.end_page()

    # PAGE 8: DEEP-DIVE: SECURITYCONFIG
    doc.start_page("8. DEEP-DIVE: SECURITYCONFIG & FILTERCHAIN", "Spring Security 6.3 DSL & Stateless Architecture")
    doc.add_section("1. SecurityConfig.java Source Listing")
    code = """// propledger-backend/src/main/java/com/propledger/config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Disabled: APIs are stateless Bearer auth
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/properties/**").hasRole("PROPERTY_MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}"""
    doc.add_code_block(code, "Java 21 — SecurityConfig.java")
    doc.end_page()

    # PAGE 9: ATTACK VECTORS & MITIGATIONS
    doc.start_page("9. ATTACK VECTORS & SECURITY MITIGATIONS", "XSS, CSRF, Token Revocation & Secret Entropy")
    doc.add_section("1. Security Analysis: XSS vs CSRF")
    doc.add_paragraph("Because Bearer tokens are stored in the browser and transmitted explicitly via the Authorization header, CSRF attacks are impossible (browsers never send custom headers automatically on cross-origin links).")
    doc.add_paragraph("To protect against XSS (Cross-Site Scripting), PropLedger implements: 1) Strict HTML input sanitization on all text fields. 2) Content Security Policy (CSP) headers. 3) Short token expiration windows.")

    doc.add_section("2. Token Revocation Strategies Compared")
    headers = ["Revocation Strategy", "Mechanism", "Latency Impact", "Complexity"]
    rows = [
        ["Short Expiration (Selected)", "Tokens expire in 24 hours; refresh required", "Zero latency overhead", "Simple & Stateless"],
        ["User token_version Counter", "Increment counter in users table on password change", "Requires checking 1 cached integer", "Low"],
        ["Redis JTI Blacklist", "Store revoked token IDs (JTI) in Redis with TTL", "Requires 1 Redis check per request", "Medium (adds state)"]
    ]
    doc.add_table(headers, rows, [130, 175, 120, 107])
    doc.end_page()

    # PAGE 10: SECURITY INTERVIEW Q&A
    doc.start_page("10. SECURITY & AUTHENTICATION INTERVIEW Q&A", "Senior Systems Design & Security Engineering Scenarios")
    doc.add_section("1. Real-World Security Interview Scenarios")

    doc.add_subsection("Question 1: What is the difference between Access Tokens and Refresh Tokens?")
    doc.add_paragraph("Answer: Access tokens are short-lived (15–30 minutes) and sent on every API request. Refresh tokens are long-lived (7–30 days), stored securely (e.g. HttpOnly cookie), and used solely to request a new access token when the current one expires. This limits exposure if an access token is intercepted while maintaining a seamless user login experience.")

    doc.add_subsection("Question 2: What is the difference between Symmetric (HS256) and Asymmetric (RS256) signing?")
    doc.add_paragraph("Answer: HS256 uses a shared private key for both signing and verification. RS256 uses an RSA keypair: the auth server signs with a private key, while downstream microservices verify with a public key without needing the private key. For PropLedger's unified Spring Boot cluster, HS256 provides optimal performance.")

    doc.add_subsection("Question 3: How does Spring Security prevent user credentials from leaking into heap dumps?")
    doc.add_paragraph("Answer: Spring Security's AuthenticationManager clears plaintext password credentials from the Authentication object immediately after successful authentication (eraseCredentialsAfterAuthentication = true), ensuring sensitive plaintext strings do not persist in long-lived JVM heap memory.")

    doc.add_callout("Security Architecture Key Takeaway", 
        "Articulating why CSRF is safely disabled for stateless Bearer APIs and explaining token_version revocation proves high security maturity to interviewers.",
        "tip"
    )
    doc.end_page()

    saved = doc.save()
    print(f"Generated Doc 06: {output_path} ({saved} pages)")
    return saved

if __name__ == "__main__":
    build_doc_06()
