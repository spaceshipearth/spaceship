'use strict';
const nanoid = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.CHAR(20),
        defaultValue: () => nanoid(20),
        autoIncrement: false,
        primaryKey: true
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING(320),
      password: DataTypes.STRING,
      photoUrl: DataTypes.STRING(2048),
      isAdmin: DataTypes.BOOLEAN,
      flags: DataTypes.INTEGER.UNSIGNED
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};