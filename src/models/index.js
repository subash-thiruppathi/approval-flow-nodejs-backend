const Sequelize = require('sequelize');
const sequelize = require('../config/db.config');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.model')(sequelize, Sequelize.DataTypes);
db.Role = require('./role.model')(sequelize, Sequelize.DataTypes);
db.Status = require('./status.model')(sequelize, Sequelize.DataTypes);
db.Expense = require('./expense.model')(sequelize, Sequelize.DataTypes);
db.Approval = require('./approval.model')(sequelize, Sequelize.DataTypes);

// Associations

// Roles <-> Users (Many-to-Many)
db.User.belongsToMany(db.Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
});
db.Role.belongsToMany(db.User, {
  through: 'user_roles',
  foreignKey: 'role_id',
});

// Expense -> User (One-to-Many)
db.Expense.belongsTo(db.User, { as: 'requester', foreignKey: 'requested_by' });

// Approval -> Expense, User
db.Approval.belongsTo(db.User, { as: 'approver', foreignKey: 'approver_id' });
db.Approval.belongsTo(db.Expense, { foreignKey: 'expense_id' });

// Expense -> Approvals (One-to-Many)
db.Expense.hasMany(db.Approval, { foreignKey: 'expense_id' });

// Status -> Expense (One-to-Many)
db.Expense.belongsTo(db.Status, { foreignKey: 'status_id' });
db.Status.hasMany(db.Expense, { foreignKey: 'status_id' });

module.exports = db;
