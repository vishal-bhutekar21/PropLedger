# PropLedger — REST API Reference & Specification

## 1. Architectural Overview & API Design Principles

The **PropLedger API** is built on RESTful principles, supporting high-throughput property operations, real-time analytics, and secure administrative controls.

- **Base URLs**: Dual-routed at `/api` and `/api/v1` (e.g. `/api/v1/properties` and `/api/properties`).
- **Interactive Documentation**: Available at `http://localhost:8080/swagger-ui.html` (OpenAPI 3.0 via SpringDoc).
- **Transport Security**: JSON payloads over HTTPS with UTF-8 encoding.
- **Stateless Authentication**: Signed JWT Bearer tokens passed via HTTP `Authorization: Bearer <token>`.

---

## 2. Global Standards & Response Formats

### 2.1. Standard Response Envelope (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-12T10:15:30Z"
}
```

### 2.2. Paginated Envelope (`PagedResponse<T>`)
All list endpoints support pagination, multi-column sorting, and filtering:
```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 142,
  "totalPages": 8,
  "last": false
}
```

#### Query Parameters for Lists:
- `page`: 0-indexed page number (default: `0`).
- `size`: Items per page (default: `20`, max: `100`).
- `sort`: Field and direction, e.g. `sort=createdAt,desc` or `sort=name,asc`.
- `search`: Case-insensitive text search query.

### 2.3. Error Response Format (RFC 7807)
```json
{
  "timestamp": "2026-09-12T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/v1/leases",
  "fieldErrors": [
    {
      "field": "rentAmount",
      "rejectedValue": -500,
      "message": "Rent amount must be greater than zero"
    }
  ]
}
```

---

## 3. Detailed Endpoint Catalog

### 3.1. Authentication (`/api/auth`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT bearer token + user profile. |
| `POST` | `/api/auth/register` | Public | Registers a new manager or tenant user account. |
| `GET` | `/api/auth/me` | Authenticated | Returns profile of currently authenticated token holder. |

#### Login Request Payload:
```json
{
  "username": "manager@propledger.com",
  "password": "Password123!"
}
```

#### Login Response Payload:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "manager@propledger.com",
  "fullName": "Enterprise Property Manager",
  "roles": ["PROPERTY_MANAGER"]
}
```

---

### 3.2. Dashboard & Operational KPI Analytics (`/api/dashboard`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Manager, Admin | Returns top-line metrics: total units, occupancy %, active leases, overdue balance, open maintenance tickets. |
| `GET` | `/api/dashboard/revenue-trend` | Manager, Admin | Returns monthly revenue vs. expenses comparison over last 12 months. |
| `GET` | `/api/dashboard/occupancy-summary`| Manager, Admin | Returns unit count breakdown by status (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`). |

#### Dashboard Stats Response:
```json
{
  "totalProperties": 4,
  "totalUnits": 120,
  "occupiedUnits": 114,
  "occupancyRate": 95.0,
  "activeLeases": 114,
  "monthlyRevenue": 228000.00,
  "outstandingReceivables": 8450.00,
  "openMaintenanceRequests": 3
}
```

---

### 3.3. Properties & Asset Management (`/api/properties`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/properties` | All Roles | Lists all properties with pagination, search, and type filter. |
| `GET` | `/api/properties/{id}` | All Roles | Fetches single property by ID with attached buildings and unit count. |
| `POST` | `/api/properties` | Manager, Admin | Creates a new real estate property. |
| `PUT` | `/api/properties/{id}` | Manager, Admin | Updates property metadata. |
| `DELETE`| `/api/properties/{id}` | Super Admin | Soft-deletes property (`is_active = false`). |

#### Create Property Request:
```json
{
  "propertyCode": "PROP-BVT-01",
  "name": "Bellevue Terrace Apartments",
  "propertyType": "RESIDENTIAL_MULTIFAMILY",
  "ownerId": 1,
  "addressLine1": "10400 NE 4th Street",
  "city": "Bellevue",
  "state": "WA",
  "postalCode": "98004",
  "yearBuilt": 2021,
  "totalAreaSqft": 145000
}
```

---

### 3.4. Units (`/api/units`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/units` | All Roles | Lists units with filters: `propertyId`, `status`, `bedrooms`, `maxRent`. |
| `GET` | `/api/units/{id}` | All Roles | Retrieves unit details including active lease and maintenance log. |
| `POST` | `/api/units` | Manager, Admin | Adds a new unit to a property. |
| `PUT` | `/api/units/{id}` | Manager, Admin | Updates unit specs, rent, or status. |
| `DELETE`| `/api/units/{id}` | Super Admin | Deactivates unit. |

---

### 3.5. Tenants & Resident Directory (`/api/tenants`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants` | Manager, Admin | Lists all tenants with pagination and search. |
| `GET` | `/api/tenants/{id}` | Manager, Tenant | Fetches tenant profile, current lease, and payment history. |
| `POST` | `/api/tenants` | Manager, Admin | Onboards a new tenant. |
| `PUT` | `/api/tenants/{id}` | Manager, Admin | Updates tenant contact or employment records. |

---

### 3.6. Leases & Contract Management (`/api/leases`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leases` | Manager, Admin | Lists leases with filters for `status` (`ACTIVE`, `EXPIRED`, `DRAFT`). |
| `GET` | `/api/leases/{id}` | Manager, Tenant | Retrieves lease contract, assigned tenants, and billed ledger. |
| `POST` | `/api/leases` | Manager, Admin | Creates lease contract (enforces GiST non-overlap check). |
| `PUT` | `/api/leases/{id}/terminate` | Manager, Admin | Early terminates lease and triggers unit status back to `AVAILABLE`. |
| `PUT` | `/api/leases/{id}/renew` | Manager, Admin | Creates renewal contract extension. |

---

### 3.7. Invoicing & Receivables (`/api/invoices`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invoices` | Manager, Admin | Lists invoices with filters for `leaseId`, `status`, `overdueOnly`. |
| `GET` | `/api/invoices/{id}` | Manager, Tenant | Fetches invoice with line items and applied payment allocations. |
| `POST` | `/api/invoices` | Manager, Admin | Generates invoice with line items (rent, utilities, late fees). |
| `POST` | `/api/invoices/generate-monthly` | Manager, Admin | Batch generates monthly recurring rent invoices for all active leases. |

---

### 3.8. Payments & Settlement (`/api/payments`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | Manager, Admin | Lists payment transactions with filters for `tenantId`, `method`, `date`. |
| `GET` | `/api/payments/{id}` | Manager, Tenant | Fetches payment receipt and its allocation breakdown across invoices. |
| `POST` | `/api/payments` | Manager, Tenant | Submits payment with multi-invoice allocation (ACID transaction). |

#### Payment Request with Split Allocation:
```json
{
  "tenantId": 4,
  "paymentMethod": "ACH",
  "amount": 2500.00,
  "referenceNumber": "ACH-TX-9988231",
  "allocations": [
    {
      "invoiceId": 12,
      "amount": 1800.00
    },
    {
      "invoiceId": 14,
      "amount": 700.00
    }
  ]
}
```

---

### 3.9. Expenses & Payables (`/api/expenses`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses` | Manager, Admin | Lists operating expenses with filters: `propertyId`, `category`, `vendorId`. |
| `POST` | `/api/expenses` | Manager, Admin | Records new property expense. |
| `GET` | `/api/expenses/summary` | Manager, Admin | Aggregates expenses by category and property. |

---

### 3.10. Vendors & Contractors (`/api/vendors`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vendors` | All Roles | Lists vendors and specialty service providers. |
| `POST` | `/api/vendors` | Manager, Admin | Registers a new vendor with tax ID and insurance records. |

---

### 3.11. Maintenance & Work Orders (`/api/maintenance`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/maintenance` | All Roles | Lists tickets with filters: `unitId`, `priority`, `status`. |
| `POST` | `/api/maintenance` | All Roles | Submits a maintenance request ticket. |
| `PUT` | `/api/maintenance/{id}/status` | Staff, Tech | Updates ticket status (`IN_PROGRESS`, `COMPLETED`). |
| `POST` | `/api/maintenance/{id}/work-order` | Manager | Dispatches formal work order to internal tech or vendor. |

---

### 3.12. Executive Financial & Operational Reports (`/api/reports`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/rent-roll` | Executive, Manager | Returns complete operational rent roll by property and unit. |
| `GET` | `/api/reports/aging-ar` | Executive, Accountant | Returns 30/60/90+ day delinquent receivables breakdown. |
| `GET` | `/api/reports/property-pnl` | Executive, Owner | Returns Profit & Loss statement (Gross Potential Rent vs Vacancy vs OpEx). |
| `GET` | `/api/reports/occupancy` | Executive, Manager | Historical and current occupancy rate analytics. |

---

### 3.13. Compliance & Audit Logs (`/api/audit-logs`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | Super Admin, Compliance | Queries audit log trail by `tableName`, `recordId`, `userId`, `dateRange`. |

---

## 4. HTTP Status Codes Glossary

| Status Code | Meaning in PropLedger |
| :--- | :--- |
| `200 OK` | Request succeeded; payload returned in `data`. |
| `201 Created` | Resource successfully created (e.g., Lease, Payment, Property). |
| `400 Bad Request` | Malformed JSON or input validation failure (`fieldErrors` attached). |
| `401 Unauthorized` | Missing, expired, or invalid JWT bearer token. |
| `403 Forbidden` | Authenticated user lacks required enterprise role permission. |
| `404 Not Found` | Target resource does not exist. |
| `409 Conflict` | Optimistic lock collision or business rule violation (e.g. lease date overlap). |
| `422 Unprocessable` | Semantic domain error (e.g. payment allocation exceeds invoice balance). |
| `500 Internal Error` | Unhandled server or database exception (never leaks stack trace to client). |
