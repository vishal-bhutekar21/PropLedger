-- ============================================================
-- V1: Roles, Users, User-Role Join Table
-- Purpose: Authentication and Role-Based Access Control foundation
-- ============================================================

-- ─────────────────────────────────────────────
-- ROLES
-- ─────────────────────────────────────────────
CREATE TABLE roles (
    role_id     BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed base roles immediately (required for FK integrity in user_roles)
INSERT INTO roles (name, description) VALUES
    ('ADMIN',                'Full system access'),
    ('PROPERTY_MANAGER',     'Manages properties, buildings, units, tenants, leases, maintenance'),
    ('ACCOUNTANT',           'Manages invoices, payments, expenses, financial reports'),
    ('MAINTENANCE_MANAGER',  'Manages maintenance requests, work orders, vendors'),
    ('VIEWER',               'Read-only access across all modules');

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
    user_id      BIGSERIAL    PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    phone        VARCHAR(30),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

-- ─────────────────────────────────────────────
-- USER_ROLES (Many-to-Many)
-- ─────────────────────────────────────────────
CREATE TABLE user_roles (
    user_id  BIGINT NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
    role_id  BIGINT NOT NULL REFERENCES roles(role_id)  ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by BIGINT REFERENCES users(user_id),

    PRIMARY KEY (user_id, role_id)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
