'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Identities', 'accessToken', { type: Sequelize.STRING(1024) });
    await queryInterface.changeColumn('Identities', 'refreshToken', { type: Sequelize.STRING(1024) });
    await queryInterface.changeColumn('Categories', 'longDescription', { type: Sequelize.STRING(1024) });
    await queryInterface.changeColumn('Goals', 'longDescription', { type: Sequelize.STRING(1024) });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Identities', 'accessToken', { type: Sequelize.STRING(255) });
    await queryInterface.changeColumn('Identities', 'refreshToken', { type: Sequelize.STRING(255) });
    await queryInterface.changeColumn('Categories', 'longDescription', { type: Sequelize.STRING(255) });
    await queryInterface.changeColumn('Goals', 'longDescription', { type: Sequelize.STRING(255) });
  }
};
