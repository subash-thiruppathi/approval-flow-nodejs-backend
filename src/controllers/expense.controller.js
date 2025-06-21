const db = require('../models');
const { Expense, Approval, User, Role, Status } = db;

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, description, category, receipt_url } = req.body;
    
    // Get PENDING status ID
    const pendingStatus = await Status.findOne({ where: { name: 'PENDING' } });
    
    const expense = await Expense.create({
      title,
      amount,
      description,
      category,
      receipt_url,
      status_id: pendingStatus.id,
      current_approval_level: 1,
      requested_by: req.user.id
    });
    
    // Return expense with status details
    const expenseWithStatus = await Expense.findByPk(expense.id, {
      include: [{ model: Status }]
    });
    
    res.json(expenseWithStatus);
  } catch (error) {
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
    res.json(expenses);
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
      whereCondition = { status: 'PENDING', current_approval_level: 1 };
    } else if (userRoles.includes('ACCOUNTANT')) {
      whereCondition = { status: 'MANAGER_APPROVED', current_approval_level: 2 };
    } else if (userRoles.includes('ADMIN')) {
      whereCondition = { status: 'ACCOUNTANT_APPROVED', current_approval_level: 3 };
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
    
    res.json(expenses);
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

    // Validate approval sequence
    if (expense.current_approval_level !== expectedLevel) {
      return res.status(400).json({ 
        error: `Invalid approval sequence. Expected level ${expectedLevel}, current level ${expense.current_approval_level}` 
      });
    }

    // Check if expense is in correct status for this level
    const validStatuses = {
      1: ['PENDING'],
      2: ['MANAGER_APPROVED'],
      3: ['ACCOUNTANT_APPROVED']
    };

    if (!validStatuses[expectedLevel].includes(expense.status)) {
      return res.status(400).json({ 
        error: `Expense cannot be processed at this level. Current status: ${expense.status}` 
      });
    }

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

    // Update expense status and level
    await expense.update({ 
      status: nextStatus,
      current_approval_level: nextLevel
    });

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
    res.json(expenses);
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
