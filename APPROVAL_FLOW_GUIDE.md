# Multi-Level Expense Approval System

## Overview
This system implements a three-level approval workflow for expense management:
1. **Employee** submits expense
2. **Manager** provides first-level approval
3. **Accountant** provides second-level approval
4. **Admin** provides final approval

Only after all three approvals is the expense considered fully approved.

## User Roles

### EMPLOYEE
- Can submit new expenses
- Can view their own submitted expenses
- Cannot approve any expenses

### MANAGER
- Can view expenses pending manager approval (status: PENDING, level: 1)
- Can approve/reject expenses at first level
- Upon approval, expense moves to Accountant level

### ACCOUNTANT
- Can view expenses pending accountant approval (status: MANAGER_APPROVED, level: 2)
- Can approve/reject expenses at second level
- Upon approval, expense moves to Admin level

### ADMIN
- Can view expenses pending admin approval (status: ACCOUNTANT_APPROVED, level: 3)
- Can approve/reject expenses at final level
- Upon approval, expense becomes FULLY_APPROVED
- Can view all expenses in the system

## Expense Status Flow

```
PENDING (Level 1) 
    ↓ Manager Approval
MANAGER_APPROVED (Level 2)
    ↓ Accountant Approval  
ACCOUNTANT_APPROVED (Level 3)
    ↓ Admin Approval
FULLY_APPROVED (Complete)

Note: Any rejection at any level sets status to REJECTED
```

## API Endpoints

### Submit Expense
```
POST /api/expenses
Authorization: Bearer <token>
Role Required: EMPLOYEE

Body:
{
  "title": "Business Lunch",
  "amount": 150.00,
  "description": "Client meeting lunch",
  "category": "Meals",
  "receipt_url": "https://example.com/receipt.jpg"
}
```

### Get My Expenses
```
GET /api/expenses/my
Authorization: Bearer <token>
Role Required: Any authenticated user

Returns: List of user's expenses with approval history
```

### Get Pending Approvals
```
GET /api/expenses/pending-approvals
Authorization: Bearer <token>
Role Required: MANAGER, ACCOUNTANT, or ADMIN

Returns: Expenses pending approval at user's level
- MANAGER: Gets PENDING expenses (level 1)
- ACCOUNTANT: Gets MANAGER_APPROVED expenses (level 2)  
- ADMIN: Gets ACCOUNTANT_APPROVED expenses (level 3)
```

### Approve/Reject Expense
```
POST /api/expenses/:id/approve
Authorization: Bearer <token>
Role Required: MANAGER, ACCOUNTANT, or ADMIN

Body:
{
  "status": "APPROVED", // or "REJECTED"
  "remarks": "Approved for business purpose"
}
```

### Get Expense Details
```
GET /api/expenses/:id
Authorization: Bearer <token>
Role Required: Any authenticated user

Returns: Expense details with complete approval history
```

### Get All Expenses (Admin Only)
```
GET /api/expenses
Authorization: Bearer <token>
Role Required: ADMIN

Returns: All expenses in the system
```

## Database Schema

### Expenses Table
- `id`: Primary key
- `title`: Expense title
- `amount`: Expense amount
- `description`: Detailed description
- `category`: Expense category
- `receipt_url`: Receipt/document URL
- `status`: Current status (PENDING, MANAGER_APPROVED, ACCOUNTANT_APPROVED, FULLY_APPROVED, REJECTED)
- `current_approval_level`: Current level (1=Manager, 2=Accountant, 3=Admin)
- `requested_by`: User ID who submitted the expense

### Approvals Table
- `id`: Primary key
- `expense_id`: Foreign key to expense
- `approver_id`: User ID who approved/rejected
- `status`: APPROVED or REJECTED
- `remarks`: Approval/rejection comments
- `action_date`: When the action was taken
- `approval_level`: Level at which approval was given (1, 2, or 3)
- `approver_role`: Role of the approver (MANAGER, ACCOUNTANT, ADMIN)

## Validation Rules

1. **Sequential Approval**: Expenses must be approved in order (Manager → Accountant → Admin)
2. **Role-Based Access**: Users can only approve at their designated level
3. **Status Validation**: Expenses must be in correct status for each approval level
4. **Rejection Handling**: Any rejection stops the approval flow
5. **Audit Trail**: All approvals/rejections are logged with timestamps and remarks

## Error Handling

The system provides detailed error messages for:
- Invalid approval sequence
- Insufficient permissions
- Expense not found
- Wrong status for approval level
- Missing required fields

## Testing the System

1. **Setup Users**: Create users with different roles (EMPLOYEE, MANAGER, ACCOUNTANT, ADMIN)
2. **Submit Expense**: Login as EMPLOYEE and submit an expense
3. **Manager Approval**: Login as MANAGER and approve the expense
4. **Accountant Approval**: Login as ACCOUNTANT and approve the expense
5. **Admin Approval**: Login as ADMIN and give final approval
6. **Verify Status**: Check that expense status is now FULLY_APPROVED

## Security Features

- JWT-based authentication
- Role-based authorization
- Input validation
- SQL injection prevention through Sequelize ORM
- Audit trail for all approval actions
