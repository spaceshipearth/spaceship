'use strict';
module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    title: DataTypes.STRING,
    shortDescription: DataTypes.STRING,
    longDescription: DataTypes.STRING(2048),
    displayRank: DataTypes.SMALLINT,
    categoryId: DataTypes.CHAR(20)
  }, {});
  Goal.associate = function(models) {
    // associations can be defined here
  };
  return Goal;
};