-- Add 2FA columns to users table
ALTER TABLE users 
ADD COLUMN twoFactorSecret VARCHAR(255) NULL AFTER premiumExpiresAt,
ADD COLUMN twoFactorEnabled BOOLEAN DEFAULT FALSE AFTER twoFactorSecret,
ADD COLUMN twoFactorBackupCodes JSON NULL AFTER twoFactorEnabled;

-- Verify the changes
DESCRIBE users;
