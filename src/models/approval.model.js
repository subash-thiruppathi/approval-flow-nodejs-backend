module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Approval', {
      status: DataTypes.ENUM('APPROVED', 'REJECTED'),
      remarks: DataTypes.TEXT,
      action_date: DataTypes.DATE,
      approval_level: {
        type: DataTypes.INTEGER,
        allowNull: false // 1: Manager, 2: Accountant, 3: Admin
      },
      approver_role: {
        type: DataTypes.STRING,
        allowNull: false // MANAGER, ACCOUNTANT, ADMIN
      }
    });
  };
