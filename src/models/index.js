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
db.Notification = require('./notification.model')(sequelize, Sequelize.DataTypes);
db.DeviceToken = require('./deviceToken.model')(sequelize, Sequelize.DataTypes);

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

// Notification -> User, Expense (Many-to-One)
db.Notification.belongsTo(db.User, { as: 'recipient', foreignKey: 'recipient_id' });
db.Notification.belongsTo(db.User, { as: 'sender', foreignKey: 'sender_id' });
db.Notification.belongsTo(db.Expense, { foreignKey: 'expense_id' });

// User -> Notifications (One-to-Many)
db.User.hasMany(db.Notification, { as: 'receivedNotifications', foreignKey: 'recipient_id' });
db.User.hasMany(db.Notification, { as: 'sentNotifications', foreignKey: 'sender_id' });

// Expense -> Notifications (One-to-Many)
db.Expense.hasMany(db.Notification, { foreignKey: 'expense_id' });

// DeviceToken -> User (Many-to-One)
db.DeviceToken.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasMany(db.DeviceToken, { foreignKey: 'user_id' });

module.exports = db;
