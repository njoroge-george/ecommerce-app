-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  isActive BOOLEAN DEFAULT TRUE NOT NULL,
  subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribedAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_active (isActive),
  INDEX idx_subscribed (subscribedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
