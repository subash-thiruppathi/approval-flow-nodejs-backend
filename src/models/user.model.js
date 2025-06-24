module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: DataTypes.STRING,
      reset_token: DataTypes.STRING,
      reset_token_expires: DataTypes.DATE,
      is_first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    });
    return User;
  };
