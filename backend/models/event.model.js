const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config.js");

const Event = sequelize.define(
  "Event",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organizerId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users", // Зв'язок із користувачем
        key: "id",
      },
      allowNull: false,
    },
    targetGroupId: {
      type: DataTypes.INTEGER,
      references: {
        model: "groups", // Зв'язок із групою
        key: "id",
      },
      allowNull: true, // Може бути відсутнім, якщо подія індивідуальна
    },
    targetDepartmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "departments",
        key: "id",
      },
      allowNull: true, // Може бути відсутнім, якщо подія індивідуальна або для групи
    },
  },
  {
    tableName: "events",
    timestamps: true,
  }
);

module.exports = Event;
