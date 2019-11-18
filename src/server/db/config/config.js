const fs = require('fs');

module.exports = {
  development: {
    username: 'spaceship',
    password: 'spaceship',
    database: 'spaceship',
    host: '127.0.0.1',
    port: 3100,
    dialect: 'mysql',
    logging: false,
    seederStorage: 'sequelize',
    dialectOptions: {
      decimalNumbers: true,
    },
  },
  test: {
    username: 'spaceship',
    password: 'spaceship',
    database: 'spaceship',
    host: '127.0.0.1',
    port: 3100,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  },
  production: {
    use_env_variable: 'RDS_CONNECTION_URL',
    dialect: 'mysql',
    seederStorage: 'sequelize',
    dialectOptions: {
      decimalNumbers: true,
    },
  },
};
