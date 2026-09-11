# PropLedger — Entity Relationship (ER) Diagram & Schema Reference

```mermaid
erDiagram
    ROLES ||--o{ USER_ROLES : "assigned to"
    USERS ||--o{ USER_ROLES : "has"
    USERS ||--o{ AUDIT_LOGS : "performed"
    
    OWNERS ||--o{ PROPERTIES : "owns"
    PROPERTIES ||--o{ BUILDINGS : "contains"
    BUILDINGS ||--o{ UNITS : "houses"
    
    PROPERTIES ||--o{ EXPENSES : "incurs"
    VENDORS ||--o{ EXPENSES : "billed by"
    
    TENANTS ||--o{ LEASE_APPLICATIONS : "submits"
    UNITS ||--o{ LEASE_APPLICATIONS : "applied for"
    
    TENANTS ||--o{ LEASES : "enters"
    UNITS ||--o{ LEASES : "leased via"
    LEASES ||--o{ LEASES : "renews (parent_lease_id)"
    
    LEASES ||--o{ INVOICES : "billed by"
    INVOICES ||--o{ INVOICE_ITEMS : "itemized with"
    INVOICES ||--o{ PAYMENTS : "settled by"
    
    UNITS ||--o{ MAINTENANCE_REQUESTS : "located at"
    TENANTS ||--o{ MAINTENANCE_REQUESTS : "reported by"
    MAINTENANCE_REQUESTS ||--o{ WORK_ORDERS : "dispatched to"
    VENDORS ||--o{ WORK_ORDERS : "fulfilled by"

    OWNERS {
        bigint owner_id PK
        varchar full_name
        varchar email UK
        varchar phone
        varchar company_name
        varchar tax_id
        varchar status
    }

    PROPERTIES {
        bigint property_id PK
        bigint owner_id FK
        varchar property_name
        varchar property_type
        varchar address_line1
        varchar city
        varchar state
        varchar zip_code
        decimal total_area_sqft
        smallint year_built
        varchar status
    }

    BUILDINGS {
        bigint building_id PK
        bigint property_id FK
        varchar building_name
        varchar building_code
        smallint floors
        smallint year_built
        varchar status
    }

    UNITS {
        bigint unit_id PK
        bigint building_id FK
        varchar unit_number
        varchar unit_type
        smallint floor_number
        smallint bedrooms
        smallint bathrooms
        decimal area_sqft
        decimal monthly_rent
        decimal security_deposit
        varchar status
    }

    TENANTS {
        bigint tenant_id PK
        varchar full_name
        varchar email UK
        varchar phone
        date date_of_birth
        varchar national_id
        varchar status
    }

    LEASES {
        bigint lease_id PK
        bigint unit_id FK
        bigint tenant_id FK
        bigint parent_lease_id FK
        decimal monthly_rent
        decimal security_deposit
        smallint payment_due_day
        date start_date
        date end_date
        varchar status
        boolean is_renewal
    }

    INVOICES {
        bigint invoice_id PK
        bigint lease_id FK
        varchar invoice_number UK
        date invoice_date
        date due_date
        decimal subtotal
        decimal tax
        decimal total_amount
        varchar status
    }

    PAYMENTS {
        bigint payment_id PK
        bigint invoice_id FK
        decimal amount
        date payment_date
        varchar payment_method
        varchar transaction_reference UK
        varchar status
    }

    EXPENSES {
        bigint expense_id PK
        bigint property_id FK
        bigint vendor_id FK
        varchar category
        decimal amount
        date expense_date
        varchar status
    }

    MAINTENANCE_REQUESTS {
        bigint request_id PK
        bigint unit_id FK
        bigint tenant_id FK
        varchar title
        varchar category
        varchar priority
        decimal estimated_cost
        decimal actual_cost
        varchar status
    }

    AUDIT_LOGS {
        bigint log_id PK
        bigint user_id
        varchar username
        varchar action
        varchar entity_type
        bigint entity_id
        jsonb old_value
        jsonb new_value
        varchar ip_address
        timestamptz created_at
    }
```

## Relational Cardinality Summary
- **Owner to Properties**: `1 : N` (One owner owns multiple commercial/residential properties)
- **Property to Buildings**: `1 : N` (A property complex contains one or more distinct buildings)
- **Building to Units**: `1 : N` (A physical building contains individual leasable unit suites)
- **Unit to Leases**: `1 : N` (A unit has multiple historical leases, but **only 1 active** lease at any given instant, enforced by database exclusion constraint)
- **Lease to Invoices**: `1 : N` (A monthly recurring rent schedule generates periodic billing invoices)
- **Invoice to Payments**: `1 : N` (An invoice can be settled by full payment or partial installments)
- **Unit to Maintenance Requests**: `1 : N` (Tickets and work orders logged against individual physical spaces)
