'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.CHAR(20)
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING(320)
      },
      password: {
        type: Sequelize.STRING
      },
      photoUrl: {
        type: Sequelize.STRING(2048)
      },
      isAdmin: {
        type: Sequelize.BOOLEAN
      },
      flags: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};