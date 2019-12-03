'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('UserMissions', ['userId', 'missionId'], { type: 'UNIQUE' });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('UserMissions', ['userId', 'missionId']);
  }
};
