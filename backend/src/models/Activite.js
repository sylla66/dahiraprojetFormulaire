const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Activite = sequelize.define("Activite", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING(100), allowNull: false },
  details: { type: DataTypes.TEXT },
  typeActivite: { type: DataTypes.STRING(50), defaultValue: "admin" },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Activite;
