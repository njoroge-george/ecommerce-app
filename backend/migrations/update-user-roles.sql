-- Migration to update User roles from 'user' to 'customer'
-- and add 'moderator' as a valid role

-- First, update existing users with role 'user' to 'customer'
-- This will fail if the ENUM constraint is strict, so we do it carefully

-- Step 1: Add new ENUM values (PostgreSQL approach)
-- ALTER TYPE "enum_users_role" ADD VALUE 'customer';
-- ALTER TYPE "enum_users_role" ADD VALUE 'moderator';

-- Step 2: For MySQL/MariaDB, modify the column
ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer';

-- Step 3: Update existing 'user' roles to 'customer' (if any exist)
UPDATE users SET role = 'customer' WHERE role = 'user';

-- Step 4: Verify the changes
SELECT id, name, email, role FROM users;
