const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,  // Назва БД
  process.env.PG_USER,      // Ім'я користувача
  process.env.PG_PASSWORD,  // Пароль
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = { sequelize };
