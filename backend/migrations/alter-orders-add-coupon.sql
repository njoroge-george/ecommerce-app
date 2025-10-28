-- Add coupon fields to orders table
ALTER TABLE orders
ADD COLUMN couponCode VARCHAR(50) AFTER paymentMethod,
ADD COLUMN couponDiscount DECIMAL(10, 2) DEFAULT 0 AFTER couponCode;
