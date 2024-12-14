const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/config.js');

const Department = sequelize.define('Department', {
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Назва кафедри обов'язкова
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,  // Опис кафедри може бути порожнім
  },
}, {
  tableName: 'departments',  // Назва таблиці в базі даних
  timestamps: true,          // Додавати поля createdAt і updatedAt
});

module.exports = Department;