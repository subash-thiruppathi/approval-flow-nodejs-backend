module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Role', {
      name: DataTypes.STRING
    });
  };