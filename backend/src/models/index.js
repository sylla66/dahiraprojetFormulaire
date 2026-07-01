const User = require("./User");
const Localite = require("./Localite");
const Membre = require("./Membre");
const Formulaire = require("./Formulaire");
const Evenement = require("./Evenement");
const Cotisation = require("./Cotisation");
const Inscription = require("./Inscription");
const Activite = require("./Activite");

Localite.hasMany(Membre, { foreignKey: "localiteId" });
Membre.belongsTo(Localite, { foreignKey: "localiteId", as: "localiteRef" });

Localite.hasMany(Evenement, { foreignKey: "localiteId" });
Evenement.belongsTo(Localite, { foreignKey: "localiteId", as: "localiteRef" });

Localite.hasMany(Formulaire, { foreignKey: "localiteId" });
Formulaire.belongsTo(Localite, { foreignKey: "localiteId", as: "localiteRef" });

User.hasMany(Formulaire, { foreignKey: "userId", as: "formulaires" });
Formulaire.belongsTo(User, { foreignKey: "userId", as: "createur" });

User.hasMany(Evenement, { foreignKey: "userId" });
Evenement.belongsTo(User, { foreignKey: "userId", as: "organisateur" });

User.hasMany(Activite, { foreignKey: "userId", as: "activites" });
Activite.belongsTo(User, { foreignKey: "userId", as: "utilisateur" });

Formulaire.hasMany(Evenement, { foreignKey: "formulaireId", as: "evenements" });
Evenement.belongsTo(Formulaire, { foreignKey: "formulaireId", as: "formulaireRef" });

Evenement.hasMany(Cotisation, { foreignKey: "evenementId" });
Cotisation.belongsTo(Evenement, { foreignKey: "evenementId", as: "evenementRef" });

Evenement.hasMany(Inscription, { foreignKey: "evenementId" });
Inscription.belongsTo(Evenement, { foreignKey: "evenementId", as: "evenementRef" });

Membre.hasMany(Cotisation, { foreignKey: "membreId" });
Cotisation.belongsTo(Membre, { foreignKey: "membreId", as: "membreRef" });

Membre.hasMany(Inscription, { foreignKey: "membreId" });
Inscription.belongsTo(Membre, { foreignKey: "membreId", as: "membreRef" });

User.hasMany(Cotisation, { foreignKey: "confirmePar", as: "validations" });
Cotisation.belongsTo(User, { foreignKey: "confirmePar", as: "valideur" });

module.exports = {
  User, Localite, Membre, Formulaire,
  Evenement, Cotisation, Inscription, Activite,
};
