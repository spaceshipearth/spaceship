'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    title: DataTypes.STRING,
    shortDescription: DataTypes.STRING,
    longDescription: DataTypes.STRING(2048),
    displayRank: DataTypes.SMALLINT
  }, {});
  Category.associate = function(models) {
    // associations can be defined here
  };
  return Category;
};