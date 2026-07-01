const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Localite = sequelize.define("Localite", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  pays: { type: DataTypes.STRING(100), defaultValue: "Senegal" },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Localite;
