# Multi-Level Expense Approval API

A comprehensive expense management system with a three-level approval workflow built with Node.js, Express, and Sequelize.

## 🚀 Features

- **Multi-Level Approval Workflow**: Manager → Accountant → Admin
- **Role-Based Access Control**: Employee, Manager, Accountant, Admin roles
- **JWT Authentication**: Secure token-based authentication
- **Audit Trail**: Complete approval history tracking
- **RESTful API**: Well-structured API endpoints
- **Swagger Documentation**: Interactive API documentation
- **Sequential Validation**: Ensures proper approval sequence

## 📋 Approval Flow

```
Employee submits expense
        ↓
Manager approval (Level 1)
        ↓
Accountant approval (Level 2)
        ↓
Admin final approval (Level 3)
        ↓
Expense fully approved
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-approval-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and JWT configurations
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` and automatically:
- Sync the database schema
- Seed the required roles (EMPLOYEE, MANAGER, ACCOUNTANT, ADMIN)

## 🗄️ Database Schema

### Users
- Basic user information with many-to-many relationship with roles

### Roles
- EMPLOYEE, MANAGER, ACCOUNTANT, ADMIN

### Expenses
- `status`: PENDING → MANAGER_APPROVED → ACCOUNTANT_APPROVED → FULLY_APPROVED
- `current_approval_level`: Tracks current approval stage (1, 2, 3)
- Additional fields: title, amount, description, category, receipt_url

### Approvals
- Complete audit trail of all approval actions
- Links approver, expense, approval level, and role
- Stores remarks and timestamps

## 🔐 User Roles & Permissions

### EMPLOYEE
- ✅ Submit new expenses
- ✅ View own expenses
- ❌ Cannot approve expenses

### MANAGER
- ✅ View expenses pending manager approval
- ✅ Approve/reject at Level 1
- ❌ Cannot skip approval levels

### ACCOUNTANT
- ✅ View expenses pending accountant approval
- ✅ Approve/reject at Level 2
- ❌ Cannot approve Level 1 expenses

### ADMIN
- ✅ View expenses pending admin approval
- ✅ Give final approval at Level 3
- ✅ View all expenses in system
- ❌ Cannot skip previous approval levels

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `POST /api/expenses` - Submit expense (Employee)
- `GET /api/expenses/my` - Get user's expenses
- `GET /api/expenses/pending-approvals` - Get pending approvals for user's level
- `GET /api/expenses/:id` - Get expense details
- `POST /api/expenses/:id/approve` - Approve/reject expense
- `GET /api/expenses` - Get all expenses (Admin only)

## 📖 API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

## 🧪 Testing

### Automated Test Script
Run the complete approval flow test:

```bash
node test-approval-flow.js
```

This script will:
1. Register test users for each role
2. Guide you through role assignment
3. Demonstrate the complete approval workflow
4. Show the final approval status and history

### Manual Testing Steps

1. **Create users with different roles**
2. **Employee submits expense**
   ```bash
   POST /api/expenses
   {
     "title": "Business Lunch",
     "amount": 150.00,
     "description": "Client meeting",
     "category": "Meals"
   }
   ```

3. **Manager approves** (Level 1)
4. **Accountant approves** (Level 2)
5. **Admin gives final approval** (Level 3)
6. **Verify expense is FULLY_APPROVED**

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Authorization**: Granular permission control
- **Input Validation**: Prevents invalid data
- **SQL Injection Protection**: Sequelize ORM protection
- **Audit Trail**: Complete action logging
- **Sequential Validation**: Prevents approval sequence bypass

## 📁 Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication & authorization
├── models/          # Database models
├── routes/          # API routes
├── seeders/         # Database seeders
└── services/        # Business logic services
```

## 🚨 Error Handling

The system provides detailed error messages for:
- Invalid approval sequences
- Insufficient permissions
- Missing expenses
- Wrong status transitions
- Validation failures

## 📚 Additional Documentation

- [APPROVAL_FLOW_GUIDE.md](./APPROVAL_FLOW_GUIDE.md) - Detailed approval flow documentation
- [test-approval-flow.js](./test-approval-flow.js) - Complete test script

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please refer to the documentation or create an issue in the repository.
