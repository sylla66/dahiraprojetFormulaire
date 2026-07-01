const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Configuration = sequelize.define("Configuration", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cle: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  valeur: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Configuration;