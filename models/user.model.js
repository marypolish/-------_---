const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    allowNull: false,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'departments',
      key: 'id',
    },
    allowNull: true, // Викладачі можуть не мати кафедри
  },
  groupId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'groups',
      key: 'id',
    },
    allowNull: true, // Студенти можуть не мати групи 
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
