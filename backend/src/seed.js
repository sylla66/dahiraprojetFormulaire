require("dotenv").config();
const sequelize = require("./config/database");
require("./models/index");
const {
  User, Localite, Membre, Evenement, Formulaire,
  Cotisation, Inscription, Activite, Configuration,
  TypeCotisation, PaiementCotisation,
} = require("./models");

async function seed() {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synced");

    const existing = await User.count();
    if (existing > 0) {
      console.log("Database contains data already. Use force=true to reset.");
      if (process.argv.includes("force")) {
        console.log("Force mode: truncating all tables...");
        const models = [PaiementCotisation, Cotisation, Inscription, TypeCotisation, Evenement, Formulaire, Membre, User, Activite, Configuration, Localite];
        for (const m of models) await m.destroy({ where: {} });
        await sequelize.query("DELETE FROM sqlite_sequence");
        console.log("All tables truncated.");
      } else {
        process.exit(0);
      }
    }

    const localites = await Localite.bulkCreate([
      { nom: "Dakar", pays: "Senegal" },
      { nom: "Thies", pays: "Senegal" },
      { nom: "Saint-Louis", pays: "Senegal" },
      { nom: "Touba", pays: "Senegal" },
      { nom: "Kaolack", pays: "Senegal" },
      { nom: "Ziguinchor", pays: "Senegal" },
    ]);
    console.log(`Created ${localites.length} localites`);

    const superAdmin = await User.create({
      username: "superadmin", email: "super@dahira.sn",
      password: "admin123", role: "super_admin",
      nom: "Diop", prenom: "Super", telephone: "771234500",
      localite: "Dakar", isActive: true,
    });
    const admin1 = await User.create({
      username: "admin1", email: "admin1@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Fall", prenom: "Admin", telephone: "771234501",
      localite: "Thies", isActive: true,
    });
    const admin2 = await User.create({
      username: "admin2", email: "admin2@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Sy", prenom: "Modou", telephone: "771234502",
      localite: "Saint-Louis", isActive: true,
    });
    console.log("Created 3 users (superadmin, admin1, admin2)");

    const membres = await Membre.bulkCreate([
      { nom: "Sow", prenom: "Aminata", telephone: "771111111", email: "amina@ex.sn", localiteId: 1, profession: "Enseignante", dateNaissance: "1990-05-12" },
      { nom: "Gueye", prenom: "Mamadou", telephone: "771111112", email: "mgueye@ex.sn", localiteId: 1, profession: "Commercant", dateNaissance: "1985-08-22" },
      { nom: "Ndiaye", prenom: "Fatou", telephone: "771111113", email: "fndiaye@ex.sn", localiteId: 2, profession: "Infirmiere", dateNaissance: "1992-11-03" },
      { nom: "Dieng", prenom: "Oumar", telephone: "771111114", email: "odieng@ex.sn", localiteId: 2, profession: "Fonctionnaire", dateNaissance: "1988-02-15" },
      { nom: "Ba", prenom: "Marieme", telephone: "771111115", email: "mba@ex.sn", localiteId: 3, profession: "Etudiante", dateNaissance: "1998-07-30" },
      { nom: "Kane", prenom: "El Hadji", telephone: "771111116", email: "ekane@ex.sn", localiteId: 3, profession: "Transporteur", dateNaissance: "1980-12-10" },
      { nom: "Thiam", prenom: "Aissatou", telephone: "771111117", email: "athiam@ex.sn", localiteId: 4, profession: "Coiffeuse", dateNaissance: "1995-04-18" },
      { nom: "Sall", prenom: "Moustapha", telephone: "771111118", email: "msall@ex.sn", localiteId: 4, profession: "Mecanicien", dateNaissance: "1983-09-25" },
      { nom: "Faye", prenom: "Ndeye", telephone: "771111119", email: "nfaye@ex.sn", localiteId: 5, profession: "Secretaire", dateNaissance: "1993-01-08" },
      { nom: "Camara", prenom: "Boubacar", telephone: "771111120", email: "bcamara@ex.sn", localiteId: 5, profession: "Agriculteur", dateNaissance: "1987-06-14" },
    ]);
    console.log(`Created ${membres.length} membres`);

    const form1 = await Formulaire.create({
      titre: "Formulaire evenement standard", description: "Formulaire par defaut",
      typeEvenement: "cotisation", estActif: true,
      champsJson: JSON.stringify([
        { nom: "nom", type: "text", label: "Nom", requis: true },
        { nom: "telephone", type: "tel", label: "Telephone", requis: true },
      ]),
      userId: admin1.id, localiteId: 1,
    });
    const form2 = await Formulaire.create({
      titre: "Formulaire gala", description: "Pour les galas et diners",
      typeEvenement: "gala", estActif: true,
      champsJson: JSON.stringify([
        { nom: "nom", type: "text", label: "Nom complet", requis: true },
        { nom: "telephone", type: "tel", label: "Telephone", requis: true },
        { nom: "nombrePlaces", type: "number", label: "Nombre de places", requis: true },
      ]),
      userId: admin1.id, localiteId: 2,
    });
    console.log(`Created ${2} formulaires`);

    const now = new Date();
    const evenements = await Evenement.bulkCreate([
      { titre: "Ziarra annuelle 2026", description: "Grande ziarra annuelle du dahira", dateEvenement: new Date("2026-12-15"), dateFin: new Date("2026-12-16"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-12-10"), lieu: "Dakar Plateau", montantObjectif: 5000000, montantMinimum: 5000, formulaireId: form1.id, userId: admin1.id, localiteId: 1 },
      { titre: "Gala de bienfaisance", description: "Soiree gala pour collecte de fonds", dateEvenement: new Date("2026-11-20"), dateFin: new Date("2026-11-20"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-11-15"), lieu: "Salle des fetes Thies", montantObjectif: 2000000, montantMinimum: 10000, formulaireId: form2.id, userId: admin2.id, localiteId: 2 },
      { titre: "Causerie religieuse", description: "Conference sur le mouridisme", dateEvenement: new Date("2026-10-05"), lieu: "Daara Saint-Louis", montantObjectif: 500000, montantMinimum: 2000, formulaireId: form1.id, userId: admin2.id, localiteId: 3 },
      { titre: "Khadimou Rassoul 2026", description: "Celebration du gamou", dateEvenement: new Date("2026-09-15"), dateFin: new Date("2026-09-17"), lieu: "Touba", montantObjectif: 10000000, montantMinimum: 10000, formulaireId: form1.id, userId: admin1.id, localiteId: 4 },
    ]);
    console.log(`Created ${evenements.length} evenements`);

    const cotisationsData = [];
    for (let i = 0; i < 10; i++) {
      cotisationsData.push({ montant: 5000 + i * 1000, evenementId: 1, membreId: i + 1, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: admin1.id, estValide: true });
      cotisationsData.push({ montant: 3000 + i * 500, evenementId: 2, membreId: i + 1, modePaiement: i % 2 === 0 ? "orange_money" : "especes", confirmePar: admin2.id, estValide: true });
    }
    await Cotisation.bulkCreate(cotisationsData);
    console.log(`Created ${cotisationsData.length} cotisations`);

    const inscriptionsData = [];
    for (let i = 0; i < 10; i++) {
      inscriptionsData.push({ evenementId: 1, membreId: i + 1, estPresent: i % 3 === 0, donneesJson: JSON.stringify({ nom: membres[i].prenom + " " + membres[i].nom, telephone: membres[i].telephone }) });
      inscriptionsData.push({ evenementId: 2, membreId: i + 1, estPresent: false, donneesJson: JSON.stringify({ nom: membres[i].prenom + " " + membres[i].nom, telephone: membres[i].telephone }) });
    }
    await Inscription.bulkCreate(inscriptionsData);
    console.log(`Created ${inscriptionsData.length} inscriptions`);

    const typesCotisation = await TypeCotisation.bulkCreate([
      { nom: "Caisse sociale", description: "Cotisation mensuelle caisse sociale", periodicite: "mensuel", montant: 5000, userId: admin1.id },
      { nom: "Barkelou", description: "Cotisation annuelle barkelou", periodicite: "annuel", montant: 15000, userId: admin1.id },
      { nom: "Budget mosquee", description: "Participation budget mosquee", periodicite: "mensuel", montant: 2000, userId: admin2.id },
      { nom: "Fonds d'entraide", description: "Cotisation pour aide aux membres", periodicite: "trimestriel", montant: 10000, userId: admin1.id },
      { nom: "Voyage spirituel", description: "Pour financer les voyages a Touba", periodicite: "annuel", montant: 25000, userId: admin2.id },
    ]);
    console.log(`Created ${typesCotisation.length} types de cotisation`);

    const paiementsData = [];
    for (let i = 0; i < 10; i++) {
      paiementsData.push({ typeCotisationId: 1, membreId: i + 1, montant: 5000, mois: 6, annee: 2026, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: admin1.id });
      paiementsData.push({ typeCotisationId: 3, membreId: i + 1, montant: 2000, mois: 6, annee: 2026, modePaiement: "orange_money", confirmePar: admin2.id });
      if (i < 5) {
        paiementsData.push({ typeCotisationId: 2, membreId: i + 1, montant: 15000, mois: 1, annee: 2026, modePaiement: i === 0 ? "cheque" : "especes", confirmePar: admin1.id });
      }
    }
    await PaiementCotisation.bulkCreate(paiementsData);
    console.log(`Created ${paiementsData.length} paiements recurrents`);

    await Activite.bulkCreate([
      { action: "Creation dahira", details: "Initialisation de la base de donnees", userId: superAdmin.id },
      { action: "Seed automatique", details: "Population avec donnees de demonstration", userId: superAdmin.id },
    ]);

    await Configuration.bulkCreate([
      { cle: "inscription_membre_debut", valeur: "2026-01-01" },
      { cle: "inscription_membre_fin", valeur: "2026-12-31" },
    ]);

    console.log("\n--- Seed complete ---");
    console.log("Super admin: superadmin / admin123");
    console.log("Admin: admin1 admin2 / admin123");
    console.log("Membres: 10, Evenements: 4, Cotisations: 20");
    console.log("Types cotisation: 5, Paiements recurrents: 25");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
