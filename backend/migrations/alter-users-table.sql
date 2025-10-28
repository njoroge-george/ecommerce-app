-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN firstName VARCHAR(255) AFTER name,
ADD COLUMN lastName VARCHAR(255) AFTER firstName,
ADD COLUMN phoneNumber VARCHAR(20) AFTER email;
