const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config.js");

const Remainder = sequelize.define(
  "Remainder",
  {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    remainderTime: {
      type: DataTypes.DATE,
      allowNull: false, // Час нагадування обов'язковий
    },
  },
  {
    tableName: "remainders",
    timestamps: false,
  }
);

module.exports = Remainder;
