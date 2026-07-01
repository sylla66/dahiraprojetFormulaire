const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaiementCotisation = sequelize.define("PaiementCotisation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  typeCotisationId: { type: DataTypes.INTEGER, allowNull: false },
  membreId: { type: DataTypes.INTEGER, allowNull: false },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  mois: { type: DataTypes.INTEGER },
  annee: { type: DataTypes.INTEGER },
  modePaiement: { type: DataTypes.STRING(50), defaultValue: "especes" },
  confirmePar: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
  datePaiement: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = PaiementCotisation;