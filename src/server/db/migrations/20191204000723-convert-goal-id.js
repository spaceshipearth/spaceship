'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Missions', 'goalId', { type: Sequelize.CHAR(20), allowNull: false });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Missions', 'goalId', { type: Sequelize.INTEGER, allowNull: false });
  }
};
