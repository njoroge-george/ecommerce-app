# Authentication & Role Setup Guide

## Issue: "Access Denied" for Admin Users

If you're seeing "Access denied" even though you should be an admin, it's because the database needs to be updated with the new role system.

## Solution

### Step 1: Update the Database Schema

The User model has been updated to use the new role system:
- Old roles: `"user"`, `"admin"`
- New roles: `"customer"`, `"admin"`, `"moderator"`

**For MySQL/MariaDB:**

Run this SQL command in your database:

```sql
ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer';
UPDATE users SET role = 'customer' WHERE role = 'user';
```

**For PostgreSQL:**

```sql
ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'moderator';
UPDATE users SET role = 'customer' WHERE role = 'user';
```

### Step 2: Set Your User as Admin

#### Option A: Using the Script (Recommended)

1. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

2. Run the admin setup script:
   ```bash
   node dist/scripts/setAdmin.js your-email@example.com
   ```

#### Option B: Direct SQL

Run this SQL command in your database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 3: Restart and Login

1. Restart your backend server (if running)
2. Logout from the frontend (if logged in)
3. Login again with your credentials
4. You should now have admin access!

## Quick Start for New Users

### 1. Access the Landing Page
Visit `http://localhost:5173/` (or your frontend URL)

### 2. Register a New Account
- Click the **"Register"** button in the top right corner
- Fill in your details (name, email, password)
- Submit the registration form

### 3. Make Yourself Admin
After registration, you'll need to promote your account to admin:

```bash
cd backend
npm run build
node dist/scripts/setAdmin.js your-email@example.com
```

### 4. Login
- Click the **"Login"** button
- Enter your credentials
- You'll now have full admin access!

## Role Permissions

### Customer (Default)
- Browse shop
- Add items to cart
- Place orders
- View own order history

### Moderator
- All customer permissions
- View dashboard
- View products list
- View analytics
- View and manage orders

### Admin
- All moderator permissions
- Add new products
- Edit/delete products
- View and manage customers
- Full system access

## Troubleshooting

### "Access Denied" After Login
1. Check your role in the database:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. Make sure the role is set to `'admin'` (not `'user'`)
3. Logout and login again for changes to take effect

### Can't See Admin Menu Items
- Make sure you're logged in as `admin` or `moderator`
- Check the user menu in the navbar - it should show your role
- Customers won't see admin menu items (this is by design)

### Backend Not Returning Role
- Make sure you've updated `backend/controllers/authController.ts`
- The login response should include the `role` field
- Check browser console for the login response

## Navigation

### Landing Page Elements
- **Login button** (top right) - Access existing account
- **Register button** (top right) - Create new account
- **Shop Now** - Browse products as guest
- **Go to Dashboard** - Access admin panel (requires admin/moderator login)

### After Login
- Your name and role appear in the navbar
- Click your profile icon to see the user menu
- Admin/Moderator users can access "Dashboard" from the menu
