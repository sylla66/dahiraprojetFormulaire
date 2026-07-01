const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cotisation = sequelize.define("Cotisation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  datePaiement: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  modePaiement: { type: DataTypes.STRING(50), defaultValue: "especes" },
  notes: { type: DataTypes.TEXT },
  estValide: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Cotisation;
