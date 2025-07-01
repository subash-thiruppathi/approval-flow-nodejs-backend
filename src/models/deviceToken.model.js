module.exports = (sequelize, DataTypes) => {
  const DeviceToken = sequelize.define('DeviceToken', {
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    device_type: {
      type: DataTypes.ENUM('web', 'android', 'ios'),
      allowNull: false
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_used: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return DeviceToken;
};
