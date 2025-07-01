const db = require('../models');
const { Expense, Approval, User, Role, Status } = db;
const NotificationService = require('../services/notification.service');

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, description, category } = req.body;
    console.log('Creating expense with data:', req.body);
    console.log('Uploaded file:', req.file);
    
    // Handle receipt file upload
    let receipt_url = null;
    if (req.file) {
      // Store the relative path to the uploaded file
      receipt_url = `/uploads/${req.file.filename}`;
    }
    
    // Get PENDING status ID
    const pendingStatus = await Status.findOne({ where: { name: 'PENDING' } });
    
    const expense = await Expense.create({
      title,
      amount: parseFloat(amount), // Ensure amount is a number
      description,
      category,
      receipt_url,
      status_id: pendingStatus.id,
      current_approval_level: 1,
      requested_by: req.user.id
    });
    
    // Send notification to managers about new expense submission
    try {
      await NotificationService.sendExpenseNotification(
        expense,
        'EXPENSE_SUBMITTED',
        req.user.name,
        req.user.id
      );
    } catch (notificationError) {
      console.error('Failed to send expense submission notification:', notificationError);
      // Don't fail the expense creation if notification fails
    }
    
    // Return expense with status details
    const expenseWithStatus = await Expense.findByPk(expense.id, {
      include: [{ model: Status }]
    });
    
    res.json(expenseWithStatus);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ 
      where: { requested_by: req.user.id },
      include: [{
        model: Approval,
        include: [{ model: User, as: 'approver', attributes: ['name', 'email'] }]
      }]
    });
    let data = {data: expenses};
    res.json(data);
    // res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Role });
    const userRoles = user.Roles.map(role => role.name);
    
    let whereCondition = {};
    
    if (userRoles.includes('MANAGER')) {
      whereCondition = { status_id: 1, current_approval_level: 1 };
    } else if (userRoles.includes('ACCOUNTANT')) {
      whereCondition = { status_id: 2, current_approval_level: 2 };
    } else if (userRoles.includes('ADMIN')) {
      whereCondition = { status_id: 3, current_approval_level: 3 };
    } else {
      return res.status(403).json({ error: 'No approval permissions' });
    }

    const expenses = await Expense.findAll({ 
      where: whereCondition,
      include: [
        { model: User, as: 'requester', attributes: ['name', 'email'] },
        { 
          model: Approval,
          include: [{ model: User, as: 'approver', attributes: ['name', 'email'] }]
        }
      ]
    });
    let data = {data: expenses};
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { id } = req.params;

    const user = await User.findByPk(req.user.id, { include: Role });
    const userRoles = user.Roles.map(role => role.name);
    
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Determine current approver role and level
    let approverRole = '';
    let expectedLevel = 0;
    let nextStatus = '';
    let nextLevel = 0;

    if (userRoles.includes('MANAGER')) {
      approverRole = 'MANAGER';
      expectedLevel = 1;
      nextStatus = status === 'APPROVED' ? 'MANAGER_APPROVED' : 'REJECTED';
      nextLevel = status === 'APPROVED' ? 2 : 0;
    } else if (userRoles.includes('ACCOUNTANT')) {
      approverRole = 'ACCOUNTANT';
      expectedLevel = 2;
      nextStatus = status === 'APPROVED' ? 'ACCOUNTANT_APPROVED' : 'REJECTED';
      nextLevel = status === 'APPROVED' ? 3 : 0;
    } else if (userRoles.includes('ADMIN')) {
      approverRole = 'ADMIN';
      expectedLevel = 3;
      nextStatus = status === 'APPROVED' ? 'FULLY_APPROVED' : 'REJECTED';
      nextLevel = status === 'APPROVED' ? 0 : 0;
    } else {
      return res.status(403).json({ error: 'No approval permissions' });
    }
    console.log(`Approver Role: ${expense.current_approval_level}`);
    console.log(`Expected Level: ${expectedLevel}`);
    // Validate approval sequence
    if (expense.current_approval_level !== expectedLevel) {
      return res.status(400).json({ 
        error: `Invalid approval sequence. Expected level ${expectedLevel}, current level ${expense.current_approval_level}` 
      });
    }

    const statusMap = {
      1: 'PENDING',
      2: 'MANAGER_APPROVED',
      3: 'ACCOUNTANT_APPROVED',
      4: 'FULLY_APPROVED',
      5: 'REJECTED'
    };

    const statusNameToId = {
      'PENDING': 1,
      'MANAGER_APPROVED': 2,
      'ACCOUNTANT_APPROVED': 3,
      'FULLY_APPROVED': 4,
      'REJECTED': 5
    };

    const validStatuses = {
      1: ['PENDING'],
      2: ['MANAGER_APPROVED'],
      3: ['ACCOUNTANT_APPROVED']
    };

    const statusKey = statusMap[expense.status_id];

    console.log(`Valid Statuses for Level ${expectedLevel}:`, validStatuses[expectedLevel]);
    console.log(`Expense Status Key: ${statusKey}`);

    if (!validStatuses[expectedLevel].includes(statusKey)) {
      return res.status(400).json({
        error: `Expense cannot be processed at this level. Current status: ${statusKey}`
      });
    }
    console.log(`Expense is valid for approval at level ${status}`);

    // Create approval record
    await Approval.create({
      expense_id: expense.id,
      approver_id: req.user.id,
      status,
      remarks,
      action_date: new Date(),
      approval_level: expectedLevel,
      approver_role: approverRole
    });

    // Convert status name to ID before updating
    const nextStatusId = statusNameToId[nextStatus];

    // Update expense status and level
    await expense.update({ 
      status_id: nextStatusId,
      current_approval_level: nextLevel
    });

    // Send appropriate notifications based on approval status
    try {
      const updatedExpense = await Expense.findByPk(id);
      const approverUser = await User.findByPk(req.user.id);
      
      if (status === 'APPROVED') {
        if (nextStatus === 'FULLY_APPROVED') {
          // Final approval - notify requester
          await NotificationService.sendExpenseNotification(
            updatedExpense,
            'EXPENSE_FULLY_APPROVED',
            approverUser.name,
            req.user.id
          );
        } else {
          // Intermediate approval - notify next level approvers
          await NotificationService.sendExpenseNotification(
            updatedExpense,
            'EXPENSE_APPROVED',
            approverUser.name,
            req.user.id
          );
        }
      } else {
        // Rejection - notify requester
        await NotificationService.sendExpenseNotification(
          updatedExpense,
          'EXPENSE_REJECTED',
          approverUser.name,
          req.user.id
        );
      }
    } catch (notificationError) {
      console.error('Failed to send approval notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    const message = status === 'APPROVED' 
      ? `Expense approved by ${approverRole}. ${nextStatus === 'FULLY_APPROVED' ? 'Expense fully approved!' : `Moved to ${approverRole === 'MANAGER' ? 'Accountant' : 'Admin'} approval.`}`
      : `Expense rejected by ${approverRole}`;

    res.json({ message, expense: await Expense.findByPk(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [
        { model: User, as: 'requester', attributes: ['name', 'email'] },
        { 
          model: Approval,
          include: [{ model: User, as: 'approver', attributes: ['name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    let data = {data: expenses};
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['name', 'email'] },
        { 
          model: Approval,
          include: [{ model: User, as: 'approver', attributes: ['name', 'email'] }],
          order: [['approval_level', 'ASC']]
        }
      ]
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
