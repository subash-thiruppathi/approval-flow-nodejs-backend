module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Expense', {
      title: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      current_approval_level: {
        type: DataTypes.INTEGER,
        defaultValue: 1 // 1: Manager, 2: Accountant, 3: Admin
      },
      description: DataTypes.TEXT,
      category: DataTypes.STRING,
      receipt_url: DataTypes.STRING
    });
  };
