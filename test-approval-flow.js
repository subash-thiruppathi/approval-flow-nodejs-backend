/**
 * Test script for Multi-Level Expense Approval System
 * This script demonstrates the complete approval flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test users for different roles
const testUsers = {
  employee: { email: 'employee@test.com', password: 'password123', name: 'John Employee' },
  manager: { email: 'manager@test.com', password: 'password123', name: 'Jane Manager' },
  accountant: { email: 'accountant@test.com', password: 'password123', name: 'Bob Accountant' },
  admin: { email: 'admin@test.com', password: 'password123', name: 'Alice Admin' }
};

let tokens = {};
let expenseId = null;

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Step 1: Register test users
const registerUsers = async () => {
  console.log('\n=== Step 1: Registering Test Users ===');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    try {
      await apiCall('POST', '/auth/register', userData);
      console.log(`✓ Registered ${role}: ${userData.email}`);
    } catch (error) {
      console.log(`- ${role} might already exist: ${userData.email}`);
    }
  }
};

// Step 2: Login users and get tokens
const loginUsers = async () => {
  console.log('\n=== Step 2: Logging in Users ===');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    try {
      const response = await apiCall('POST', '/auth/login', {
        email: userData.email,
        password: userData.password
      });
      tokens[role] = response.token;
      console.log(`✓ Logged in ${role}: ${userData.email}`);
    } catch (error) {
      console.error(`✗ Failed to login ${role}`);
    }
  }
};

// Step 3: Assign roles to users (you'll need to do this manually in your system)
const displayRoleAssignmentInstructions = () => {
  console.log('\n=== Step 3: Role Assignment Instructions ===');
  console.log('You need to manually assign roles to users in your database:');
  console.log('1. employee@test.com → EMPLOYEE role');
  console.log('2. manager@test.com → MANAGER role');
  console.log('3. accountant@test.com → ACCOUNTANT role');
  console.log('4. admin@test.com → ADMIN role');
  console.log('\nSQL Example:');
  console.log(`
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM Users WHERE email = 'employee@test.com'), (SELECT id FROM Roles WHERE name = 'EMPLOYEE')),
((SELECT id FROM Users WHERE email = 'manager@test.com'), (SELECT id FROM Roles WHERE name = 'MANAGER')),
((SELECT id FROM Users WHERE email = 'accountant@test.com'), (SELECT id FROM Roles WHERE name = 'ACCOUNTANT')),
((SELECT id FROM Users WHERE email = 'admin@test.com'), (SELECT id FROM Roles WHERE name = 'ADMIN'));
  `);
};

// Step 4: Employee submits expense
const submitExpense = async () => {
  console.log('\n=== Step 4: Employee Submits Expense ===');
  
  const expenseData = {
    title: 'Business Conference Registration',
    amount: 500.00,
    description: 'Annual tech conference registration fee',
    category: 'Training',
    receipt_url: 'https://example.com/receipt.pdf'
  };
  
  try {
    const response = await apiCall('POST', '/expenses', expenseData, tokens.employee);
    expenseId = response.id;
    console.log(`✓ Expense submitted with ID: ${expenseId}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Level: ${response.current_approval_level}`);
  } catch (error) {
    console.error('✗ Failed to submit expense');
  }
};

// Step 5: Manager approves expense
const managerApproval = async () => {
  console.log('\n=== Step 5: Manager Approval ===');
  
  try {
    // First, check pending approvals for manager
    const pendingApprovals = await apiCall('GET', '/expenses/pending-approvals', null, tokens.manager);
    console.log(`Manager sees ${pendingApprovals.length} pending approval(s)`);
    
    if (pendingApprovals.length > 0) {
      // Approve the expense
      const approvalData = {
        status: 'APPROVED',
        remarks: 'Approved by manager - valid business expense'
      };
      
      const response = await apiCall('POST', `/expenses/${expenseId}/approve`, approvalData, tokens.manager);
      console.log(`✓ ${response.message}`);
    }
  } catch (error) {
    console.error('✗ Manager approval failed');
  }
};

// Step 6: Accountant approves expense
const accountantApproval = async () => {
  console.log('\n=== Step 6: Accountant Approval ===');
  
  try {
    // Check pending approvals for accountant
    const pendingApprovals = await apiCall('GET', '/expenses/pending-approvals', null, tokens.accountant);
    console.log(`Accountant sees ${pendingApprovals.length} pending approval(s)`);
    
    if (pendingApprovals.length > 0) {
      // Approve the expense
      const approvalData = {
        status: 'APPROVED',
        remarks: 'Approved by accountant - budget allocation confirmed'
      };
      
      const response = await apiCall('POST', `/expenses/${expenseId}/approve`, approvalData, tokens.accountant);
      console.log(`✓ ${response.message}`);
    }
  } catch (error) {
    console.error('✗ Accountant approval failed');
  }
};

// Step 7: Admin final approval
const adminApproval = async () => {
  console.log('\n=== Step 7: Admin Final Approval ===');
  
  try {
    // Check pending approvals for admin
    const pendingApprovals = await apiCall('GET', '/expenses/pending-approvals', null, tokens.admin);
    console.log(`Admin sees ${pendingApprovals.length} pending approval(s)`);
    
    if (pendingApprovals.length > 0) {
      // Give final approval
      const approvalData = {
        status: 'APPROVED',
        remarks: 'Final approval by admin - expense fully approved'
      };
      
      const response = await apiCall('POST', `/expenses/${expenseId}/approve`, approvalData, tokens.admin);
      console.log(`✓ ${response.message}`);
    }
  } catch (error) {
    console.error('✗ Admin approval failed');
  }
};

// Step 8: Verify final status
const verifyFinalStatus = async () => {
  console.log('\n=== Step 8: Verify Final Status ===');
  
  try {
    const expense = await apiCall('GET', `/expenses/${expenseId}`, null, tokens.employee);
    console.log(`Final Status: ${expense.status}`);
    console.log(`Approval Level: ${expense.current_approval_level}`);
    console.log(`Number of Approvals: ${expense.Approvals.length}`);
    
    console.log('\nApproval History:');
    expense.Approvals.forEach((approval, index) => {
      console.log(`  ${index + 1}. ${approval.approver_role} - ${approval.status} - "${approval.remarks}"`);
    });
  } catch (error) {
    console.error('✗ Failed to verify final status');
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Multi-Level Expense Approval System Test');
  console.log('Make sure your server is running on http://localhost:3000');
  
  try {
    await registerUsers();
    await loginUsers();
    displayRoleAssignmentInstructions();
    
    console.log('\n⚠️  Please assign roles to users as shown above, then press Enter to continue...');
    process.stdin.once('data', async () => {
      await submitExpense();
      await managerApproval();
      await accountantApproval();
      await adminApproval();
      await verifyFinalStatus();
      
      console.log('\n🎉 Test completed! Check the results above.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
};

// Run the test
runTest();
