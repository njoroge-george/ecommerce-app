-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discountType ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discountValue DECIMAL(10, 2) NOT NULL,
    minPurchase DECIMAL(10, 2) DEFAULT 0,
    maxDiscount DECIMAL(10, 2),
    usageLimit INT DEFAULT NULL,
    usedCount INT DEFAULT 0,
    expiryDate DATETIME,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (isActive),
    INDEX idx_expiry (expiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample coupons
INSERT INTO coupons (code, description, discountType, discountValue, minPurchase, maxDiscount, usageLimit, expiryDate, isActive) 
VALUES 
    ('WELCOME10', 'Welcome discount - 10% off your first order', 'percentage', 10.00, 50.00, 20.00, 100, DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
    ('SAVE20', '20% off orders over $100', 'percentage', 20.00, 100.00, 50.00, 50, DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE),
    ('FLAT15', '$15 off any order', 'fixed', 15.00, 30.00, NULL, NULL, DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE);
