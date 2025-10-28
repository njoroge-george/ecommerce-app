-- Add M-Pesa payment fields to orders table

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS mpesaCheckoutRequestId VARCHAR(255),
ADD COLUMN IF NOT EXISTS mpesaReceiptNumber VARCHAR(255),
ADD COLUMN IF NOT EXISTS mpesaTransactionDate DATETIME,
ADD COLUMN IF NOT EXISTS paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS couponCode VARCHAR(50),
ADD COLUMN IF NOT EXISTS couponDiscount DECIMAL(10, 2) DEFAULT 0;

-- Add index for faster M-Pesa checkout request lookups
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout ON orders(mpesaCheckoutRequestId);

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(paymentStatus);
