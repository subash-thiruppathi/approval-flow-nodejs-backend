module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Expense', {
      title: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      status: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED')
    });
  };