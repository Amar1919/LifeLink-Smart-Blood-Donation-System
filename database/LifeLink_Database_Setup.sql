
-- ============================================================
-- PROJECT: LifeLink - Smart Blood Donation and Urgent Matching
-- DATABASE: lifelink_db
-- DBMS: MySQL
-- TEAM: Amar and Ullas
-- ============================================================


-- 1. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS lifelink_db;

USE lifelink_db;


-- ============================================================
-- 2. USERS TABLE
-- Stores common information for all registered users.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'DONOR',
        'PATIENT',
        'HOSPITAL_STAFF',
        'BLOOD_BANK_STAFF',
        'ADMIN'
    ) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10)
);


-- ============================================================
-- 3. HOSPITAL TABLE
-- Stores registered hospital details.
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital (
    hospital_id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10)
);


-- ============================================================
-- 4. BLOOD BANK TABLE
-- Stores registered blood bank details.
-- ============================================================

CREATE TABLE IF NOT EXISTS blood_bank (
    blood_bank_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10)
);


-- ============================================================
-- 5. USER_PHONE TABLE
-- Stores multiple phone numbers for a user.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_phone (
    user_id INT,
    phone_number VARCHAR(15),
    PRIMARY KEY (user_id, phone_number),
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 6. DONOR TABLE
-- Stores donor-specific information.
-- ============================================================

CREATE TABLE IF NOT EXISTS donor (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    blood_group ENUM(
        'A+','A-','B+','B-','AB+','AB-','O+','O-'
    ) NOT NULL,
    date_of_birth DATE NOT NULL,
    availability_status BOOLEAN DEFAULT TRUE,
    last_donation_date DATE,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 7. BLOOD_REQUEST TABLE
-- Stores patient blood requests.
-- ============================================================

CREATE TABLE IF NOT EXISTS blood_request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hospital_id INT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    required_blood_group ENUM(
        'A+','A-','B+','B-','AB+','AB-','O+','O-'
    ) NOT NULL,
    units_required INT NOT NULL,
    urgency_level ENUM(
        'LOW','MEDIUM','HIGH'
    ) NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'PENDING',
        'MATCHED',
        'ACCEPTED',
        'FULFILLED',
        'CANCELLED'
    ) DEFAULT 'PENDING',
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (hospital_id)
        REFERENCES hospital(hospital_id),

    CHECK (units_required > 0)
);


-- ============================================================
-- 8. MATCH_RECORD TABLE
-- Stores donor and blood request matching information.
-- ============================================================

CREATE TABLE IF NOT EXISTS match_record (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    match_score DECIMAL(5,2),
    match_status ENUM(
        'SUGGESTED',
        'ACCEPTED',
        'REJECTED'
    ) DEFAULT 'SUGGESTED',
    response_status ENUM(
        'PENDING',
        'ACCEPTED',
        'REJECTED'
    ) DEFAULT 'PENDING',
    matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
        REFERENCES blood_request(request_id)
        ON DELETE CASCADE,

    FOREIGN KEY (donor_id)
        REFERENCES donor(donor_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 9. DONATION TABLE
-- Stores donor donation history.
-- ============================================================

CREATE TABLE IF NOT EXISTS donation (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    blood_bank_id INT NOT NULL,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    units_donated DECIMAL(5,2) NOT NULL,
    donation_status ENUM(
        'SUCCESSFUL',
        'DEFERRED',
        'REJECTED'
    ) NOT NULL,

    FOREIGN KEY (donor_id)
        REFERENCES donor(donor_id),

    FOREIGN KEY (blood_bank_id)
        REFERENCES blood_bank(blood_bank_id),

    CHECK (units_donated > 0)
);


-- ============================================================
-- 10. BLOOD_INVENTORY TABLE
-- Maintains blood stock at each blood bank.
-- ============================================================

CREATE TABLE IF NOT EXISTS blood_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    blood_group ENUM(
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-'
    ) NOT NULL,
    units_available INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (blood_bank_id)
        REFERENCES blood_bank(blood_bank_id)
        ON DELETE CASCADE,

    UNIQUE (blood_bank_id, blood_group),

    CHECK (units_available >= 0)
);


-- ============================================================
-- 11. BLOOD_ALLOCATION TABLE
-- Stores blood allocation details for requests.
-- ============================================================

CREATE TABLE IF NOT EXISTS blood_allocation (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    blood_bank_id INT NOT NULL,
    blood_group ENUM(
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-'
    ) NOT NULL,
    units_allocated INT NOT NULL,
    allocation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    allocation_status ENUM(
        'ALLOCATED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'ALLOCATED',

    FOREIGN KEY (request_id)
        REFERENCES blood_request(request_id),

    FOREIGN KEY (blood_bank_id)
        REFERENCES blood_bank(blood_bank_id),

    CHECK (units_allocated > 0)
);


-- ============================================================
-- 12. DATABASE VERIFICATION
-- ============================================================

-- Check selected database
SELECT DATABASE();

-- Display all tables
SHOW TABLES;

-- Count total tables
SELECT COUNT(*) AS total_tables
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'lifelink_db'
AND TABLE_TYPE = 'BASE TABLE';

-- Verify foreign key relationships
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'lifelink_db'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
