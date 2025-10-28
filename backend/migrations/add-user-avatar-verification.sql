-- Add avatar and verification fields to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255),
ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE;
