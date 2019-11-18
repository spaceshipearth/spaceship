'use strict';
const nanoid = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define(
    "Mission",
    {
      id: {
        type: DataTypes.CHAR(20),
        defaultValue: () => nanoid(20),
        autoIncrement: false,
        primaryKey: true
      },
      captainId: DataTypes.CHAR(20),
      goalId: DataTypes.CHAR(20),
      startTime: DataTypes.DATE,
      endTime: DataTypes.DATE
    },
    {}
  );
  Mission.associate = function(models) {
    // associations can be defined here
  };
  return Mission;
};
