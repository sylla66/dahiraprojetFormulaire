const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TypeCotisation = sequelize.define("TypeCotisation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  periodicite: { type: DataTypes.STRING(50), defaultValue: "mensuel" },
  montant: { type: DataTypes.FLOAT, defaultValue: 0 },
  estActif: { type: DataTypes.BOOLEAN, defaultValue: true },
  userId: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = TypeCotisation;