const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Evenement = sequelize.define("Evenement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  dateEvenement: { type: DataTypes.DATE, allowNull: false },
  dateFin: { type: DataTypes.DATE },
  dateDebutInscription: { type: DataTypes.DATE },
  dateFinInscription: { type: DataTypes.DATE },
  lieu: { type: DataTypes.STRING(200) },
  montantObjectif: { type: DataTypes.FLOAT, defaultValue: 0 },
  montantMinimum: { type: DataTypes.INTEGER, defaultValue: 0 },
  estCloture: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Evenement;
