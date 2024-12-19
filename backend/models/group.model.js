const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const Group = sequelize.define('Group', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'groups',
  timestamps: false,
});

module.exports = Group;
