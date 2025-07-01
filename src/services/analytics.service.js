const { Expense, User, Status, Approval } = require('../models');
const { sequelize } = require('../models');
const { getHumanReadableTime } = require('../utils/utils');

exports.getSummary = async () => {
    const totalExpenses = await Expense.count();
    const totalAmount = await Expense.sum('amount');
    const pendingExpenses = await Expense.count({ where: { status_id: 1 } });
    const approvedExpenses = await Expense.count({ where: { status_id: 4 } });

    return {
        totalExpenses,
        totalAmount,
        pendingExpenses,
        approvedExpenses
    };
};

exports.getExpensesByCategory = async () => {
    return Expense.findAll({
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['category']
    });
};

exports.getExpensesByStatus = async () => {
    return Expense.findAll({
        attributes: [
            [sequelize.literal('`Status`.`name`'), 'status'],
            [sequelize.literal('`Status`.`color_code`'), 'color_code'],
            [sequelize.fn('COUNT', sequelize.col('Expense.id')), 'count']
        ],
        include: [{
            model: Status,
            attributes: []
        }],
        group: [sequelize.literal('`Status`.`name`')]
    });
};

exports.getApprovalTimes = async () => {
    const approvals = await Approval.findAll({
      attributes: [
        'expense_id',
        [
          sequelize.fn(
            'AVG',
            sequelize.literal('TIMESTAMPDIFF(MINUTE, `Expense`.`createdAt`, `Approval`.`createdAt`)')
          ),
          'avg_approval_time'
        ]
      ],
      include: [
        {
          model: Expense,
          attributes: []
        }
      ],
      group: ['expense_id'],
      raw: true // <--- important for plain objects
    });
  
    // Convert to human-readable time
    const formatted = approvals.map(record => {
      const minutes = Number(record.avg_approval_time);
      const readable = getHumanReadableTime(minutes);
      return {
        expense_id: record.expense_id,
        avg_approval_time: readable
      };
    });
  
    return formatted;
  };
  

exports.getTopSpenders = async () => {
    return User.findAll({
        attributes: [
            'id',
            'name',
            [sequelize.literal('SUM(`expenses`.`amount`)'), 'total_spent']
        ],
        include: [{
            model: Expense,
            as: 'expenses',
            attributes: ['amount'],
            required: false,
            subQuery: false
        }],
        group: ['User.id', 'User.name'],
        order: [[sequelize.literal('total_spent'), 'DESC']],
        limit: 10
    });
};
