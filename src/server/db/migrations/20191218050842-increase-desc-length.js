'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Goals", "longDescription", {
      type: Sequelize.STRING(4096)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Goals", "longDescription", {
      type: Sequelize.STRING(1024)
    });
  }
};
