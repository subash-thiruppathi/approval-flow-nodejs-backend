# User Management System Guide

## Overview

The expense approval system now includes a secure user management system with admin-only user onboarding and password reset functionality. Self-registration has been disabled for security purposes.

## Security Features

### 🔒 Admin-Only User Onboarding
- Only users with ADMIN role can create new users
- Self-registration endpoint is disabled
- Temporary passwords are generated automatically
- Users must change password on first login

### 🔑 Password Reset System
- Secure token-based password reset
- Tokens expire after 1 hour
- Email-based reset flow (tokens provided in response for development)
- Password strength validation

## Setup Instructions

### 1. Run the Setup Script
```bash
npm run setup-user-management
```

This will:
- Update the database schema with new user fields
- Create default roles and statuses
- Create an initial admin user

### 2. Default Admin Credentials
```
Email: admin@company.com
Password: admin123
```
**⚠️ IMPORTANT: Change this password immediately after first login!**

## API Endpoints

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
```

#### Admin User Onboarding
```http
POST /api/auth/onboard-user
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "roles": ["EMPLOYEE", "MANAGER"]
}
```

**Response:**
```json
{
  "message": "User onboarded successfully",
  "user": {
    "id": 5,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "roles": ["EMPLOYEE", "MANAGER"],
    "temporary_password": "a1b2c3d4e5f6"
  }
}
```

#### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin_jwt_token>
```

#### Request Password Reset
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@company.com"
}
```

#### Reset Password with Token
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newSecurePassword123"
}
```

#### Change Password (Authenticated Users)
```http
POST /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword456"
}
```

## User Roles and Permissions

### EMPLOYEE
- Submit expenses
- View own expenses
- Change own password

### MANAGER
- All EMPLOYEE permissions
- Approve/reject expenses at Level 1
- View pending Level 1 approvals

### ACCOUNTANT
- All EMPLOYEE permissions
- Approve/reject expenses at Level 2
- View pending Level 2 approvals

### ADMIN
- All permissions from other roles
- Final approval at Level 3
- View all expenses in the system
- **User Management:**
  - Onboard new users
  - View all users
  - Reset user passwords
  - Manage user roles

## Database Schema Changes

### User Model Updates
```javascript
{
  name: STRING,
  email: STRING (unique, required),
  password: STRING,
  reset_token: STRING,
  reset_token_expires: DATE,
  is_first_login: BOOLEAN (default: true),
  created_by: INTEGER (references Users.id)
}
```

## Security Best Practices

### Password Requirements
- Minimum 6 characters
- Must be changed on first login
- Secure token-based reset system

### Admin Security
- Only admins can create users
- Temporary passwords are randomly generated
- Admin actions are logged via created_by field

### Token Security
- JWT tokens for authentication
- Password reset tokens expire in 1 hour
- Tokens are cryptographically secure

## Frontend Integration

### Required Components
```
src/components/admin/
├── UserOnboardingForm.jsx
├── UserManagementTable.jsx
├── UserEditModal.jsx
└── UserRoleSelector.jsx

src/components/auth/
├── ForgotPasswordForm.jsx
├── ResetPasswordForm.jsx
├── ChangePasswordForm.jsx
└── FirstLoginPasswordChange.jsx
```

### Required Pages
```
src/pages/
├── Login.jsx
├── ForgotPassword.jsx
├── ResetPassword.jsx
├── ChangePassword.jsx
├── UserManagement.jsx (Admin only)
└── FirstLoginSetup.jsx
```

## Testing the System

### 1. Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### 2. Test User Onboarding
```bash
curl -X POST http://localhost:3000/api/auth/onboard-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"Test User","email":"test@company.com","roles":["EMPLOYEE"]}'
```

### 3. Test Password Reset
```bash
# Request reset
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com"}'

# Reset with token
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset_token>","new_password":"newPassword123"}'
```

## Migration from Old System

### For Existing Users
1. Existing users can continue to log in normally
2. They will be marked as `is_first_login: false` automatically
3. No data loss or disruption to existing functionality

### Disabling Self-Registration
- The `/api/auth/register` endpoint is commented out in routes
- Frontend should remove registration forms
- All new users must be created by admins

## Production Considerations

### Email Integration
- Currently, reset tokens are returned in API response for development
- In production, implement email service to send reset links
- Remove `reset_token` from API responses

### Security Enhancements
- Implement rate limiting for password reset requests
- Add account lockout after failed login attempts
- Log all admin actions for audit trail
- Consider 2FA for admin accounts

### Monitoring
- Monitor failed login attempts
- Track password reset usage
- Alert on suspicious admin activities

## Troubleshooting

### Common Issues

#### "Admin role not found" Error
```bash
# Run the roles seeder first
node src/seeders/roles.seeder.js
```

#### Database Schema Issues
```bash
# Run the setup script to sync schema
npm run setup-user-management
```

#### Permission Denied Errors
- Ensure user has correct role assignments
- Check JWT token validity
- Verify middleware is properly configured

### Support
For issues or questions, check:
1. Server logs for detailed error messages
2. Database connection and schema
3. JWT token expiration and format
4. Role assignments in database

## Next Steps

1. **Frontend Development**: Use the updated `REACT_FRONTEND_PROMPT.md` to implement the UI
2. **Email Service**: Integrate email service for password reset notifications
3. **Advanced Features**: Consider implementing user deactivation, bulk operations, and audit logs
4. **Security Audit**: Review and enhance security measures before production deployment
