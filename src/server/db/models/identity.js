'use strict';
module.exports = (sequelize, DataTypes) => {
  const Identity = sequelize.define('Identity', {
    userId: DataTypes.CHAR(20),
    serviceId: DataTypes.SMALLINT,
    identifier: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    scopes: DataTypes.STRING
  }, {});
  Identity.associate = function(models) {
    // associations can be defined here
  };
  return Identity;
};