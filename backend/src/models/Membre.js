const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Membre = sequelize.define("Membre", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  prenom: { type: DataTypes.STRING(100), allowNull: false },
  telephone: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(120) },
  adresse: { type: DataTypes.STRING(255) },
  dateNaissance: { type: DataTypes.DATEONLY },
  profession: { type: DataTypes.STRING(100) },
  estActif: { type: DataTypes.BOOLEAN, defaultValue: true },
  dateInscription: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Membre;
