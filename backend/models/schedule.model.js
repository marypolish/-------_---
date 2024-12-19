const { DataTypes } = require('sequelize');
const { sequelize } = require('../backend/config/config.js');

const Schedule = sequelize.define('Schedule', {
  eventId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'events', // Зв'язок із таблицею Events
      key: 'id',
    },
    allowNull: true, // Якщо розклад пов’язаний із подією
  },
  groupId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'groups', // Зв'язок із таблицею Groups
      key: 'id',
    },
    allowNull: true, // Якщо розклад стосується певної групи
  },
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'departments', // Зв'язок із таблицею Departments
      key: 'id',
    },
    allowNull: true, // Якщо розклад стосується певної кафедри
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false, // Дата та час події в розкладі
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false, // Тривалість у хвилинах
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true, // Місце проведення
  },
}, {
  tableName: 'schedules',
  timestamps: false,
});

module.exports = Schedule;
