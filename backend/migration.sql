-- Create Database
CREATE DATABASE retailbusiness_db;

-- Connect to the database (if running via psql CLI, or run subsequent queries inside retailbusiness_db)
\c retailbusiness_db;

-- 1. Businesses Table
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Handles both Super Admin and Business Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE, -- NULL for Super Admin
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'super_admin' or 'business_user'
);

-- 3. Daily Sessions Table (Opening and Closing the Business Day)
CREATE TABLE daily_sessions (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    session_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open' or 'closed'
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    CONSTRAINT unique_business_date UNIQUE (business_id, session_date)
);

-- 4. Incomes Table
CREATE TABLE incomes (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    session_id INT REFERENCES daily_sessions(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    source VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Expenses Table (Categorized for Gross vs. Net Profit calculations)
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    session_id INT REFERENCES daily_sessions(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_type VARCHAR(20) NOT NULL, -- 'direct' (for Gross Profit) or 'operating' (for Net Profit)
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE businesses ADD COLUMN logo_url VARCHAR(255);

-- Add status column to businesses for suspension/deactivation
ALTER TABLE businesses ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Create Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE, -- NULL for Super Admin global actions
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE businesses ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;