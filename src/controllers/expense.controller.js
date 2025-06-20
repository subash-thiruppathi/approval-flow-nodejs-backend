const db = require('../models');
const { Expense, Approval } = db;

exports.createExpense = async (req, res) => {
  const { title, amount } = req.body;
  const expense = await Expense.create({
    title,
    amount,
    status: 'PENDING',
    requested_by: req.user.id
  });
  res.json(expense);
};

exports.getMyExpenses = async (req, res) => {
  const expenses = await Expense.findAll({ where: { requested_by: req.user.id } });
  res.json(expenses);
};

exports.pendingApprovals = async (req, res) => {
  const expenses = await Expense.findAll({ where: { status: 'PENDING' } });
  res.json(expenses);
};

exports.approveExpense = async (req, res) => {
  const { status, remarks } = req.body;
  const { id } = req.params;

  const expense = await Expense.findByPk(id);
  if (!expense || expense.status !== 'PENDING') return res.status(400).json({ error: 'Invalid expense' });

  await expense.update({ status });
  await Approval.create({
    expense_id: expense.id,
    approver_id: req.user.id,
    status,
    remarks,
    action_date: new Date()
  });

  res.json({ message: `Expense ${status.toLowerCase()}` });
};