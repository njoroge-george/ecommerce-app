-- Add premium fields to users table
ALTER TABLE users 
ADD COLUMN isPremium BOOLEAN DEFAULT FALSE,
ADD COLUMN premiumSince DATETIME NULL,
ADD COLUMN premiumExpiresAt DATETIME NULL;

-- Update existing verified users to be premium as a starting point (optional)
-- UPDATE users SET isPremium = TRUE, premiumSince = NOW() WHERE isVerified = TRUE;
