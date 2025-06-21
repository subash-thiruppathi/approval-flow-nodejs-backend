module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Status', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '0=Initial, 1=Manager Level, 2=Accountant Level, 3=Admin Level, 99=Final/Terminal'
      },
      is_terminal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'True for FULLY_APPROVED and REJECTED statuses'
      },
      color_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Hex color code for UI display'
      }
    });
  };
