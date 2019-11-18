'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserMission = sequelize.define('UserMission', {
    missionId: DataTypes.CHAR(20),
    userId: DataTypes.CHAR(20),
    joinedAt: DataTypes.DATE
  }, {});
  UserMission.associate = function(models) {
    // associations can be defined here
  };
  return UserMission;
};