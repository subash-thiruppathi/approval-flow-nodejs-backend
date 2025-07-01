# React Frontend Development Prompt for Multi-Level Expense Approval System

## Project Overview
Create a comprehensive React.js frontend application for a multi-level expense approval system. The backend API is already implemented with JWT authentication and a three-tier approval workflow (Manager → Accountant → Admin).

## Backend API Details

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- ~~`POST /auth/register`~~ - **DISABLED** (Self-registration disabled for security)
- `POST /auth/login` - User login (returns JWT token)
- `POST /auth/onboard-user` - Admin-only user onboarding (Admin role required)
- `GET /auth/users` - Get all users (Admin role required)
- `POST /auth/request-password-reset` - Request password reset token
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated users)

### Expense Management Endpoints
- `POST /expenses` - Submit new expense (Employee only)
- `GET /expenses/my` - Get user's expenses
- `GET /expenses/pending-approvals` - Get pending approvals for user's role
- `GET /expenses/:id` - Get expense details
- `POST /expenses/:id/approve` - Approve/reject expense
- `GET /expenses` - Get all expenses (Admin only)

### Analytics Endpoints (Admin Only)
- `GET /analytics/summary` - Get key metrics summary
- `GET /analytics/expenses-by-category` - Get expense breakdown by category
- `GET /analytics/expenses-by-status` - Get expense breakdown by status
- `GET /analytics/approval-times` - Get average approval times
- `GET /analytics/top-spenders` - Get top 10 spenders

#### Analytics API Integration Examples

##### Get Summary
```javascript
GET /api/analytics/summary
Authorization: Bearer admin_jwt_token_here

Response:
{
  "totalExpenses": 100,
  "totalAmount": 50000,
  "pendingExpenses": 10,
  "approvedExpenses": 85
}
```

##### Get Expenses by Category
```javascript
GET /api/analytics/expenses-by-category
Authorization: Bearer admin_jwt_token_here

Response:
[
  {
    "category": "Travel",
    "count": 20,
    "total": 15000
  },
  {
    "category": "Meals",
    "count": 50,
    "total": 10000
  }
]
```

##### Get Expenses by Status
```javascript
GET /api/analytics/expenses-by-status
Authorization: Bearer admin_jwt_token_here

Response:
[
  {
    "status": "PENDING",
    "count": 10,
    "color_code": "#FFA500"
  },
  {
    "status": "MANAGER_APPROVED",
    "count": 5,
    "color_code": "#87CEEB"
  },
  {
    "status": "ACCOUNTANT_APPROVED",
    "count": 5,
    "color_code": "#9370DB"
  },
  {
    "status": "FULLY_APPROVED",
    "count": 70,
    "color_code": "#32CD32"
  },
  {
    "status": "REJECTED",
    "count": 10,
    "color_code": "#DC143C"
  }
]
```

##### Get Approval Times
```javascript
GET /api/analytics/approval-times
Authorization: Bearer admin_jwt_token_here

Response:
[
  {
    "expense_id": 1,
    "avg_approval_time": "2 days"
  }
]
```

##### Get Top Spenders
```javascript
GET /api/analytics/top-spenders
Authorization: Bearer admin_jwt_token_here

Response:
[
  {
    "id": 5,
    "name": "John Doe",
    "total_spent": 12000
  },
  {
    "id": 12,
    "name": "Jane Smith",
    "total_spent": 9500
  }
]
```

### Real-time Notification Endpoints
- `POST /notifications/device-token` - Register device token for push notifications
- `GET /notifications` - Get user notifications (paginated)
- `GET /notifications/unread-count` - Get unread notification count
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all notifications as read
- `GET /notifications/device-tokens` - Get user's registered device tokens
- `DELETE /notifications/device-token/:id` - Remove device token
- `GET /notifications/settings` - Get notification preferences
- `PUT /notifications/settings` - Update notification preferences
- `POST /notifications/test` - Send test notification (development)

### User Roles & Permissions
1. **EMPLOYEE**: Submit expenses, view own expenses
2. **MANAGER**: First-level approval (Level 1)
3. **ACCOUNTANT**: Second-level approval (Level 2)  
4. **ADMIN**: Final approval (Level 3), view all expenses

### Expense Status Flow
```
PENDING → MANAGER_APPROVED → ACCOUNTANT_APPROVED → FULLY_APPROVED
                    ↓
                REJECTED (at any level)
```

## Frontend Requirements

### 1. Technology Stack
- **React 18+** with functional components and hooks
- **React Router v6** for navigation
- **Axios** for API calls
- **Material-UI (MUI)** or **Ant Design** for UI components
- **React Hook Form** for form handling
- **React Query/TanStack Query** for data fetching and caching
- **Context API** or **Zustand** for state management
- **TypeScript** (preferred) for type safety
- **Firebase SDK** for push notifications
- **Socket.IO Client** for real-time notifications

### 2. Core Features to Implement

#### Authentication System
- Login form with validation (no self-registration)
- Password reset functionality (forgot password flow)
- First-time login password change flow
- JWT token management (localStorage/sessionStorage)
- Protected routes based on authentication
- Auto-logout on token expiration
- Role-based navigation and UI elements

#### User Management (Admin Only)
- **User Onboarding Interface**:
  - Add new users with name, email, and role selection
  - Generate temporary passwords automatically
  - Display temporary credentials to admin
  - Bulk user import functionality (optional)
  
- **User Management Dashboard**:
  - View all users in the system
  - Edit user roles and information
  - Deactivate/activate user accounts
  - Reset user passwords
  - User activity tracking

#### Dashboard (Role-based)
- **Employee Dashboard**:
  - Submit new expense form
  - View submitted expenses with status
  - Expense history with approval timeline
  
- **Manager Dashboard**:
  - Pending approvals list (Level 1)
  - Approve/reject expenses with remarks
  - View approval history
  
- **Accountant Dashboard**:
  - Pending approvals list (Level 2)
  - Approve/reject expenses with remarks
  - View approval history
  
- **Admin Dashboard**:
  - Pending final approvals (Level 3)
  - View all expenses in system
  - System-wide expense analytics
  - Final approve/reject with remarks

#### Analytics Dashboard (Admin Only)
- **Summary Metrics**: Display total expenses, total amount, pending expenses, and approved expenses.
- **Expenses by Category**: Show a pie chart or bar chart of expenses broken down by category.
- **Expenses by Status**: Display a bar chart showing the number of expenses in each status (Pending, Approved, Rejected).
- **Approval Times**: Show the average time it takes for an expense to be approved.
- **Top Spenders**: Display a list of the top 10 users who have spent the most.

#### Expense Management
- **Expense Submission Form**:
  - Title, Amount, Description, Category
  - File upload for receipts
  - Form validation
  - Success/error feedback
  
- **Expense List/Table**:
  - Sortable columns (date, amount, status)
  - Filterable by status, date range, category
  - Pagination for large datasets
  - Status badges with color coding
  
- **Expense Details Modal/Page**:
  - Complete expense information
  - Approval timeline/history
  - Approver details and remarks
  - Receipt/document viewer

#### Approval Workflow
- **Approval Interface**:
  - Expense details review
  - Approve/Reject buttons
  - Remarks/comments field (required for rejection)
  - Confirmation dialogs
  
- **Approval Timeline**:
  - Visual progress indicator
  - Approval history with timestamps
  - Approver information
  - Status transitions

### 3. UI/UX Requirements

#### Design System
- Consistent color scheme:
  - Primary: Blue (#1976d2)
  - Success: Green (#4caf50)
  - Warning: Orange (#ff9800)
  - Error: Red (#f44336)
  - Pending: Orange (#ffa500)
  - Approved: Green (#32cd32)
  - Rejected: Red (#dc143c)

#### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Collapsible sidebar navigation
- Responsive tables/cards

#### User Experience
- Loading states for all API calls
- Error handling with user-friendly messages
- Success notifications
- Confirmation dialogs for critical actions
- Breadcrumb navigation
- Search and filter functionality

### 4. Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── AuthLayout.jsx
│   ├── expense/
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseList.jsx
│   │   ├── ExpenseCard.jsx
│   │   ├── ExpenseDetails.jsx
│   │   └── ExpenseFilters.jsx
│   ├── approval/
│   │   ├── ApprovalList.jsx
│   │   ├── ApprovalCard.jsx
│   │   ├── ApprovalModal.jsx
│   │   └── ApprovalTimeline.jsx
│   └── dashboard/
│       ├── EmployeeDashboard.jsx
│       ├── ManagerDashboard.jsx
│       ├── AccountantDashboard.jsx
│       └── AdminDashboard.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── MyExpenses.jsx
│   ├── PendingApprovals.jsx
│   ├── AllExpenses.jsx
│   └── ExpenseDetails.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useExpenses.js
│   ├── useApprovals.js
│   └── useApi.js
├── services/
│   ├── api.js
│   ├── auth.service.js
│   └── expense.service.js
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
└── styles/
    ├── globals.css
    └── components/
```

### 5. Key Features Implementation

#### Authentication Flow
```javascript
// Example auth hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return { user, login, logout, loading };
};
```

#### API Service Structure
```javascript
// Example API service
class ExpenseService {
  async createExpense(expenseData) {
    return api.post('/expenses', expenseData);
  }
  
  async getMyExpenses() {
    return api.get('/expenses/my');
  }
  
  async getPendingApprovals() {
    return api.get('/expenses/pending-approvals');
  }
  
  async approveExpense(id, approvalData) {
    return api.post(`/expenses/${id}/approve`, approvalData);
  }
}
```

#### Status Management
```javascript
// Status configuration
const EXPENSE_STATUSES = {
  PENDING: { color: '#ffa500', label: 'Pending Manager Approval' },
  MANAGER_APPROVED: { color: '#87ceeb', label: 'Pending Accountant Approval' },
  ACCOUNTANT_APPROVED: { color: '#9370db', label: 'Pending Admin Approval' },
  FULLY_APPROVED: { color: '#32cd32', label: 'Fully Approved' },
  REJECTED: { color: '#dc143c', label: 'Rejected' }
};
```

### 6. Advanced Features (Optional)

#### Real-time Updates
- WebSocket integration for real-time approval notifications
- Auto-refresh pending approvals
- Live status updates

#### Analytics Dashboard
- Expense trends and charts
- Approval time analytics
- Department-wise expense breakdown
- Monthly/yearly reports

#### Advanced Filtering
- Date range picker
- Multi-select filters
- Saved filter presets
- Export functionality

#### File Management
- Drag-and-drop file upload
- Image preview for receipts
- File size validation
- Multiple file support

### 7. Testing Requirements
- Unit tests for components (Jest + React Testing Library)
- Integration tests for API calls
- E2E tests for critical user flows (Cypress)
- Accessibility testing

### 8. Performance Optimization
- Code splitting and lazy loading
- Image optimization
- API response caching
- Virtual scrolling for large lists
- Debounced search inputs

### 9. Security Considerations
- Input sanitization
- XSS protection
- CSRF token handling
- Secure token storage
- Role-based UI rendering

### 10. Deployment
- Environment configuration
- Build optimization
- Docker containerization
- CI/CD pipeline setup

## Getting Started

1. **Setup Project**:
   ```bash
   npx create-react-app expense-approval-frontend --template typescript
   cd expense-approval-frontend
   npm install @mui/material @emotion/react @emotion/styled
   npm install axios react-router-dom react-hook-form
   npm install @tanstack/react-query
   ```

2. **Environment Variables**:
   ```
   REACT_APP_API_BASE_URL=http://localhost:3000/api
   REACT_APP_UPLOAD_URL=http://localhost:3000/uploads
   ```

3. **Start Development**:
   ```bash
   npm start
   ```

## API Integration Examples

### Login Request
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "roles": ["EMPLOYEE"]
  }
}
```

### Submit Expense
```javascript
POST /api/expenses
Authorization: Bearer jwt_token_here
{
  "title": "Business Lunch",
  "amount": 150.00,
  "description": "Client meeting lunch",
  "category": "Meals",
  "receipt_url": "https://example.com/receipt.jpg"
}
```

### Approve Expense
```javascript
POST /api/expenses/1/approve
Authorization: Bearer jwt_token_here
{
  "status": "APPROVED",
  "remarks": "Approved for business purpose"
}
```

### Admin User Onboarding
```javascript
POST /api/auth/onboard-user
Authorization: Bearer admin_jwt_token_here
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "roles": ["EMPLOYEE", "MANAGER"]
}

Response:
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

### Password Reset Flow
```javascript
// Step 1: Request password reset
POST /api/auth/request-password-reset
{
  "email": "user@company.com"
}

Response:
{
  "message": "Password reset token generated",
  "reset_token": "abc123def456...", // Remove in production
  "expires_at": "2024-01-01T12:00:00.000Z"
}

// Step 2: Reset password with token
POST /api/auth/reset-password
{
  "token": "abc123def456...",
  "new_password": "newSecurePassword123"
}

Response:
{
  "message": "Password reset successfully"
}
```

### Change Password (Authenticated Users)
```javascript
POST /api/auth/change-password
Authorization: Bearer jwt_token_here
{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword456"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Important Security Notes for Frontend Implementation

### User Onboarding Security
- **Admin-Only Access**: Only users with ADMIN role can access user onboarding features
- **Role Validation**: Validate role selections on frontend before submission
- **Temporary Password Handling**: Display temporary passwords securely and provide copy-to-clipboard functionality
- **First Login Flow**: Implement mandatory password change for first-time users

### Password Reset Security
- **Email Validation**: Implement proper email format validation
- **Token Expiry**: Handle token expiration gracefully with clear error messages
- **Password Strength**: Implement password strength validation (minimum 6 characters, complexity requirements)
- **Rate Limiting**: Consider implementing client-side rate limiting for password reset requests

### Additional Frontend Components Needed

#### User Management Components
```
src/components/admin/
├── UserOnboardingForm.jsx
├── UserManagementTable.jsx
├── UserEditModal.jsx
└── UserRoleSelector.jsx
```

#### Password Management Components
```
src/components/auth/
├── ForgotPasswordForm.jsx
├── ResetPasswordForm.jsx
├── ChangePasswordForm.jsx
└── FirstLoginPasswordChange.jsx
```

#### Notification Components
```
src/components/notifications/
├── NotificationBell.jsx
├── NotificationDropdown.jsx
├── NotificationList.jsx
├── NotificationItem.jsx
├── NotificationSettings.jsx
└── InAppNotification.jsx
```

#### Updated Page Structure
```
src/pages/
├── Login.jsx
├── ForgotPassword.jsx
├── ResetPassword.jsx
├── ChangePassword.jsx
├── UserManagement.jsx (Admin only)
├── FirstLoginSetup.jsx
└── Notifications.jsx
```

#### Real-time Notification System

The backend provides comprehensive real-time push notifications using Firebase Cloud Messaging and Socket.IO. The frontend should implement:

##### Notification Features
- **Push Notifications**: Browser/mobile push notifications via Firebase
- **Real-time Updates**: Live notifications via Socket.IO connection
- **Notification History**: Persistent notification storage and retrieval
- **Customizable Icons**: Different icons for different notification types
- **Notification Settings**: User preferences for notification types    

##### Notification Types
```javascript
const NOTIFICATION_TYPES = {
  EXPENSE_SUBMITTED: {
    icon: '💰',
    color: '#FFA500',
    title: 'New Expense Submitted'
  },
  EXPENSE_APPROVED: {
    icon: '✅',
    color: '#32CD32',
    title: 'Expense Approved'
  },
  EXPENSE_REJECTED: {
    icon: '❌',
    color: '#DC143C',
    title: 'Expense Rejected'
  },
  EXPENSE_FULLY_APPROVED: {
    icon: '🎉',
    color: '#4CAF50',
    title: 'Expense Fully Approved'
  }
};
```

##### Firebase Integration
```javascript
// Install Firebase dependencies
npm install firebase socket.io-client

// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Your Firebase configuration
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

##### Socket.IO Integration
```javascript
// src/hooks/useSocket.js
import { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const useSocket = () => {
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (user && token) {
      const socket = io('http://localhost:3001', {
        auth: { token }
      });

      socket.on('new_notification', (notification) => {
        // Handle real-time notification
        showInAppNotification(notification);
        updateNotificationCount();
      });

      return () => socket.disconnect();
    }
  }, [user, token]);
};
```

##### Notification Hook
```javascript
// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '../config/firebase';
import { registerDeviceToken, getNotifications } from '../services/api';

const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission and register token
  useEffect(() => {
    if (user && 'Notification' in window) {
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY'
        });
        
        if (token) {
          await registerDeviceToken({
            token,
            device_type: 'web',
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform
            }
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      showInAppNotification(payload);
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    requestNotificationPermission
  };
};
```

##### API Integration Examples

```javascript
// Register Device Token
POST /api/notifications/device-token
{
  "token": "firebase_device_token_here",
  "device_type": "web",
  "device_info": {
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel"
  }
}

// Get Notifications
GET /api/notifications?limit=20&offset=0
Response:
{
  "notifications": [...],
  "total": 45,
  "limit": 20,
  "offset": 0
}

// Get Unread Count
GET /api/notifications/unread-count
Response:
{
  "unread_count": 3
}

// Mark as Read
PUT /api/notifications/123/read
Response:
{
  "message": "Notification marked as read"
}
```

This comprehensive frontend will provide a complete user experience for the multi-level expense approval system, with secure user onboarding, robust password management, role-based dashboards, intuitive approval workflows, comprehensive expense management capabilities, and **real-time push notifications**.

**IMPORTANT**: The notification system is fully implemented in the backend with Firebase Cloud Messaging and Socket.IO. Follow the FIREBASE_SETUP_GUIDE.md to configure your Firebase credentials and implement the frontend notification features.