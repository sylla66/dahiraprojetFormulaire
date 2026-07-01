const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inscription = sequelize.define("Inscription", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  donneesJson: { type: DataTypes.TEXT },
  estPresent: { type: DataTypes.BOOLEAN, defaultValue: false },
  dateInscription: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Inscription;
