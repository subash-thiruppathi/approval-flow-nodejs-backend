module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Approval', {
      status: DataTypes.ENUM('APPROVED', 'REJECTED'),
      remarks: DataTypes.TEXT,
      action_date: DataTypes.DATE
    });
  };