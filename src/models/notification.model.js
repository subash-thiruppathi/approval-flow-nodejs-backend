module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'EXPENSE_FULLY_APPROVED'),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    expense_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  return Notification;
};
