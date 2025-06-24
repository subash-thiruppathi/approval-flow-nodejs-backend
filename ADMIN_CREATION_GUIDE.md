# How to Create Admin Users - Quick Guide

## ✅ Admin User Successfully Created!

Your admin user has been created and tested successfully:

**Admin Credentials:**
- **Email:** `admin@company.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Methods to Create Admin Users

### Method 1: Automated Setup (Recommended)
```bash
npm run setup-user-management
```
This will:
- Update database schema
- Create roles and statuses
- Create initial admin user
- Display credentials

### Method 2: Manual Admin Creation
```bash
node src/seeders/admin.seeder.js
```
Creates admin user if it doesn't exist.

### Method 3: Using Admin API (After first admin exists)
```bash
# Login as admin first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Use the returned token to create new admin
curl -X POST http://localhost:3001/api/auth/onboard-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"New Admin","email":"newadmin@company.com","roles":["ADMIN"]}'
```

## ✅ Tested Features

All the following features have been tested and are working:

### 1. Admin Login ✅
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### 2. User Onboarding ✅
```bash
curl -X POST http://localhost:3001/api/auth/onboard-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"Test Employee","email":"test@company.com","roles":["EMPLOYEE"]}'
```

### 3. Password Reset Flow ✅
```bash
# Request reset
curl -X POST http://localhost:3001/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com"}'

# Reset with token
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset_token>","new_password":"newPassword123"}'
```

### 4. New User Login ✅
Users can login with both temporary and reset passwords.

## Server Status
- ✅ Server running on port 3001
- ✅ Database synchronized
- ✅ All roles and statuses created
- ✅ Admin user created and functional
- ✅ All new API endpoints working

## Security Features Implemented
- 🔒 Self-registration disabled
- 🔑 Admin-only user onboarding
- 🛡️ Secure password reset with tokens
- 👤 First-login password change tracking
- 🔐 JWT-based authentication
- 📝 Role-based access control

## Next Steps
1. **Change Admin Password**: Login and change the default password
2. **Start Onboarding Users**: Use the admin account to create users
3. **Frontend Development**: Use the updated `REACT_FRONTEND_PROMPT.md`
4. **Production Setup**: Configure email service for password resets

## Quick Commands
```bash
# Start server
npm run dev

# Create admin (if needed)
node src/seeders/admin.seeder.js

# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

Your secure user management system is now fully operational! 🎉
