const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTwoFactorColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dashboard',
  });

  try {
    console.log('Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'twoFactorSecret'"
    );

    if (columns.length > 0) {
      console.log('✓ 2FA columns already exist');
      process.exit(0);
    }

    // Add the columns
    console.log('Adding 2FA columns...');
    
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN twoFactorSecret VARCHAR(255) NULL,
      ADD COLUMN twoFactorEnabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN twoFactorBackupCodes JSON NULL
    `);

    console.log('✓ Successfully added 2FA columns to users table');

    // Verify
    const [result] = await connection.query('DESCRIBE users');
    console.log('\nUsers table structure:');
    console.table(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addTwoFactorColumns();
