const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Formulaire = sequelize.define("Formulaire", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  typeEvenement: { type: DataTypes.STRING(50), defaultValue: "cotisation" },
  champsJson: { type: DataTypes.TEXT, allowNull: false },
  estActif: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Formulaire;
