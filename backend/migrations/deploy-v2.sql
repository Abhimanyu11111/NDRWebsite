-- ============================================
-- NDR Website V2 Database Migrations
-- Run this on production BEFORE code deployment
-- ============================================

-- 1. Add missing columns to slots table
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Slot' AFTER room_id,
ADD COLUMN IF NOT EXISTS description TEXT AFTER title,
ADD COLUMN IF NOT EXISTS capacity INT AFTER description,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER capacity,
ADD COLUMN IF NOT EXISTS half_day_rate DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER hourly_rate,
ADD COLUMN IF NOT EXISTS full_day_rate DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER half_day_rate;

-- 2. Update existing slots with default title
UPDATE slots SET title = CONCAT('Room - ', id) WHERE title = 'Slot';

-- 3. Add status column to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' AFTER comments,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 4. Verify tables
SELECT 'Slots table verified' AS status, COUNT(*) AS count FROM slots;
SELECT 'Registrations table verified' AS status, COUNT(*) AS count FROM registrations;

-- ============================================
-- End of migrations
-- ============================================