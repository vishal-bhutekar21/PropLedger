# Module 01: Authentication, Authorization & Identity Management

## 1. Module Overview & Business Context
In enterprise property management platforms (e.g. Yardi Voyager, RealPage), access to sensitive financial, lease, and personal tenant records requires stringent role-based segregation. Different personas interact with the platform:
- **Super Administrators**: Manage system configurations, audit records, and security profiles.
- **Property Managers**: Oversee unit inventory, tenant onboarding, lease lifecycle, and maintenance dispatching.
- **Accountants**: Access invoices, payment settlement records, expense vouchers, and financial P&L statements.
- **Maintenance Technicians**: View assigned work tickets, update progress notes, and log labor hours.
- **Tenants**: Submit service tickets and review their individual ledger statements.

This module provides stateless, cryptographically signed token authentication (JWT), RBAC enforcement at both the HTTP gateway and Java method levels, and secure credential storage.

---

## 2. Technology Stack & Frameworks

| Layer | Framework / Library | Role & Rationale |
| :--- | :--- | :--- |
| **Backend Core** | Spring Boot 3.3.4 (Java 21) | Enterprise runtime providing dependency injection, reactive web abstractions, and actuator monitoring. |
| **Security Framework** | Spring Security 6.3 | Provides the stateless `SecurityFilterChain`, CORS configuration, password hashing, and role extraction. |
| **Token Engine** | `jjwt-api` / `jjwt-impl` (0.12.5) | Generates and parses HMAC-SHA256 (HS256) JSON Web Tokens. |
| **Frontend Framework**| React 19 + TypeScript | Type-safe single page application with strict compile-time checks. |
| **State & Auth Store** | React Context API (`AuthContext.tsx`) | Manages login state, current user metadata, and persistent local storage synchronization. |
| **HTTP Interceptors** | Axios (1.7.9) | Injects `Authorization: Bearer <token>` into outbound requests and captures 401/403 responses to trigger auto-logout. |

---

## 3. API Specifications & Data Contracts

### Endpoints
1. `POST /api/auth/login` (or `/api/v1/auth/login`)
   - **Backend Handler**: `AuthController.login(@Valid @RequestBody LoginRequestDto loginRequest)`
   - **Frontend Hook**: `useAuth().login(username, password)` in `LoginPage.tsx`
   - **Payload**:
     ```json
     {
       "username": "manager@propledger.com",
       "password": "Password123!"
     }
     ```
   - **Success Response (200 OK)**:
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsIn...",
       "type": "Bearer",
       "userId": 1,
       "username": "manager@propledger.com",
       "fullName": "Enterprise Property Manager",
       "roles": ["PROPERTY_MANAGER"]
     }
     ```
2. `POST /api/auth/register`
   - Creates a new user profile with encoded credentials.
3. `GET /api/auth/me`
   - Returns the profile of the current token holder.

---

## 4. Database Schema & Persistence

### Tables
- **`roles`**: `id BIGSERIAL PRIMARY KEY`, `name VARCHAR(50) UNIQUE` (`ROLE_SUPER_ADMIN`, `ROLE_PROPERTY_MANAGER`, etc.).
- **`users`**: `id BIGSERIAL PRIMARY KEY`, `username VARCHAR(100) UNIQUE`, `password_hash VARCHAR(255)`, `full_name VARCHAR(150)`, `is_active BOOLEAN`, `last_login_at TIMESTAMPTZ`.
- **`user_roles`**: Junction table `user_id BIGINT REFERENCES users(id)`, `role_id BIGINT REFERENCES roles(id)`, `assigned_at TIMESTAMPTZ`.

### Indexes
- `CREATE UNIQUE INDEX idx_users_username ON users(username);`
- `CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);`

---

## 5. Security Architecture & Implementation Details

1. **Password Hashing**: Spring Security's `BCryptPasswordEncoder(12)` provides salted, CPU/memory-hard password derivation to protect against rainbow table and brute-force GPU attacks.
2. **Stateless JWT Filter Chain**:
   - `JwtAuthenticationFilter` intercepts each incoming HTTP request.
   - Extracts the token from `Authorization: Bearer <token>`.
   - Validates the cryptographic signature against the server's secret key (`app.jwt.secret`).
   - Reconstructs a `UsernamePasswordAuthenticationToken` containing the user's granted authorities (`ROLE_PROPERTY_MANAGER`).
   - Populates `SecurityContextHolder.getContext().setAuthentication(auth)`.
3. **Frontend Interceptor Pattern**:
   ```typescript
   // propledger-frontend/src/services/api.ts
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

---

## 6. Interview Q&A (Technical & System Design)

### Q1: How do you handle JWT revocation if a Property Manager is terminated immediately?
> **Answer**: By definition, JWTs are stateless and remain valid until expiration. In PropLedger, we implement a multi-tiered revocation strategy:
> 1. **Short Expiration**: Access tokens are configured with a 30-minute lifespan.
> 2. **Token Versioning / Blacklisting**: When a user is terminated or changes their password, we increment a `token_version` column on the `users` table or publish the revoked token ID (JTI) to an in-memory Redis cluster with a TTL matching token expiration. The `JwtAuthenticationFilter` cross-references this cache.

### Q2: Why did you choose JWT over traditional Server-Side HTTP Sessions with Cookies?
> **Answer**:
> 1. **Horizontal Scalability**: Stateless JWTs eliminate the need for sticky load-balancer sessions or centralized Redis session storage across multiple Spring Boot container instances.
> 2. **Cross-Client Usability**: The same JWT authentication endpoint natively supports the React web application, third-party enterprise integrations, and future native mobile apps for maintenance technicians without cookie domain restriction issues.
