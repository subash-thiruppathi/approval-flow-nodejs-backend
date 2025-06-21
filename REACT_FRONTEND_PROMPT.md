# React Frontend Development Prompt for Multi-Level Expense Approval System

## Project Overview
Create a comprehensive React.js frontend application for a multi-level expense approval system. The backend API is already implemented with JWT authentication and a three-tier approval workflow (Manager → Accountant → Admin).

## Backend API Details

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT token)

### Expense Management Endpoints
- `POST /expenses` - Submit new expense (Employee only)
- `GET /expenses/my` - Get user's expenses
- `GET /expenses/pending-approvals` - Get pending approvals for user's role
- `GET /expenses/:id` - Get expense details
- `POST /expenses/:id/approve` - Approve/reject expense
- `GET /expenses` - Get all expenses (Admin only)

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

### 2. Core Features to Implement

#### Authentication System
- Login/Register forms with validation
- JWT token management (localStorage/sessionStorage)
- Protected routes based on authentication
- Auto-logout on token expiration
- Role-based navigation and UI elements

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

This comprehensive frontend will provide a complete user experience for the multi-level expense approval system, with role-based dashboards, intuitive approval workflows, and robust expense management capabilities.
