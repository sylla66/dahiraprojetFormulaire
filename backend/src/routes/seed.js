const express = require("express");
const router = express.Router();
const sequelize = require("../config/database");
const {
  User, Localite, Membre, Evenement, Formulaire,
  Cotisation, Inscription, Activite, Configuration,
  TypeCotisation, PaiementCotisation,
} = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");

router.post("/", auth, superAdminRequired, async (req, res) => {
  try {
    const force = req.query.force === "true";
    if (force) {
      const models = [PaiementCotisation, Cotisation, Inscription, TypeCotisation, Evenement, Formulaire, Membre, User, Activite, Configuration, Localite];
      for (const m of models) await m.destroy({ where: {} });
      if (process.env.DATABASE_URL) {
        const tables = await sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'", { type: sequelize.QueryTypes.SELECT });
        for (const t of tables) {
          const tableName = t.tablename;
          await sequelize.query(`ALTER SEQUENCE IF EXISTS "${tableName}_id_seq" RESTART WITH 1`);
        }
      } else {
        await sequelize.query("DELETE FROM sqlite_sequence");
      }
    }

    const existing = await User.count();
    if (existing > 0 && !force) {
      return res.status(400).json({ error: "Base déjà initialisée. Ajoutez ?force=true pour réinitialiser." });
    }

    const localites = await Localite.bulkCreate([
      { nom: "Dakar", pays: "Senegal" },
      { nom: "Thies", pays: "Senegal" },
      { nom: "Saint-Louis", pays: "Senegal" },
      { nom: "Touba", pays: "Senegal" },
      { nom: "Kaolack", pays: "Senegal" },
      { nom: "Ziguinchor", pays: "Senegal" },
    ]);

    const superAdmin = await User.create({
      username: "superadmin", email: "super@dahira.sn",
      password: "admin123", role: "super_admin",
      nom: "Diop", prenom: "Super", telephone: "771234500",
      localite: "Dakar", isActive: true,
    });
    await User.create({
      username: "admin1", email: "admin1@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Fall", prenom: "Admin", telephone: "771234501",
      localite: "Thies", isActive: true,
    });
    await User.create({
      username: "admin2", email: "admin2@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Sy", prenom: "Modou", telephone: "771234502",
      localite: "Saint-Louis", isActive: true,
    });

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

    const form1 = await Formulaire.create({
      titre: "Formulaire evenement standard", description: "Formulaire par defaut",
      typeEvenement: "cotisation", estActif: true,
      champsJson: JSON.stringify([
        { nom: "nom", type: "text", label: "Nom", requis: true },
        { nom: "telephone", type: "tel", label: "Telephone", requis: true },
      ]),
      userId: 2, localiteId: 1,
    });
    const form2 = await Formulaire.create({
      titre: "Formulaire gala", description: "Pour les galas et diners",
      typeEvenement: "gala", estActif: true,
      champsJson: JSON.stringify([
        { nom: "nom", type: "text", label: "Nom complet", requis: true },
        { nom: "telephone", type: "tel", label: "Telephone", requis: true },
        { nom: "nombrePlaces", type: "number", label: "Nombre de places", requis: true },
      ]),
      userId: 2, localiteId: 2,
    });

    const evenements = await Evenement.bulkCreate([
      { titre: "Ziarra annuelle 2026", description: "Grande ziarra annuelle du dahira", dateEvenement: new Date("2026-12-15"), dateFin: new Date("2026-12-16"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-12-10"), lieu: "Dakar Plateau", montantObjectif: 5000000, montantMinimum: 5000, formulaireId: 1, userId: 2, localiteId: 1 },
      { titre: "Gala de bienfaisance", description: "Soiree gala pour collecte de fonds", dateEvenement: new Date("2026-11-20"), dateFin: new Date("2026-11-20"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-11-15"), lieu: "Salle des fetes Thies", montantObjectif: 2000000, montantMinimum: 10000, formulaireId: 2, userId: 3, localiteId: 2 },
      { titre: "Causerie religieuse", description: "Conference sur le mouridisme", dateEvenement: new Date("2026-10-05"), lieu: "Daara Saint-Louis", montantObjectif: 500000, montantMinimum: 2000, formulaireId: 1, userId: 3, localiteId: 3 },
      { titre: "Khadimou Rassoul 2026", description: "Celebration du gamou", dateEvenement: new Date("2026-09-15"), dateFin: new Date("2026-09-17"), lieu: "Touba", montantObjectif: 10000000, montantMinimum: 10000, formulaireId: 1, userId: 2, localiteId: 4 },
    ]);

    const cotisationsData = [];
    for (let i = 0; i < 10; i++) {
      cotisationsData.push({ montant: 5000 + i * 1000, evenementId: 1, membreId: i + 1, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: 2, estValide: true });
      cotisationsData.push({ montant: 3000 + i * 500, evenementId: 2, membreId: i + 1, modePaiement: i % 2 === 0 ? "orange_money" : "especes", confirmePar: 3, estValide: true });
    }
    await Cotisation.bulkCreate(cotisationsData);

    const inscriptionsData = [];
    for (let i = 0; i < 10; i++) {
      inscriptionsData.push({ evenementId: 1, membreId: i + 1, estPresent: i % 3 === 0, donneesJson: JSON.stringify({ nom: membres[i].prenom + " " + membres[i].nom, telephone: membres[i].telephone }) });
      inscriptionsData.push({ evenementId: 2, membreId: i + 1, estPresent: false, donneesJson: JSON.stringify({ nom: membres[i].prenom + " " + membres[i].nom, telephone: membres[i].telephone }) });
    }
    await Inscription.bulkCreate(inscriptionsData);

    await TypeCotisation.bulkCreate([
      { nom: "Caisse sociale", description: "Cotisation mensuelle caisse sociale", periodicite: "mensuel", montant: 5000, userId: 2 },
      { nom: "Barkelou", description: "Cotisation annuelle barkelou", periodicite: "annuel", montant: 15000, userId: 2 },
      { nom: "Budget mosquee", description: "Participation budget mosquee", periodicite: "mensuel", montant: 2000, userId: 3 },
      { nom: "Fonds d'entraide", description: "Cotisation pour aide aux membres", periodicite: "trimestriel", montant: 10000, userId: 2 },
      { nom: "Voyage spirituel", description: "Pour financer les voyages a Touba", periodicite: "annuel", montant: 25000, userId: 3 },
    ]);

    const paiementsData = [];
    for (let i = 0; i < 10; i++) {
      paiementsData.push({ typeCotisationId: 1, membreId: i + 1, montant: 5000, mois: 6, annee: 2026, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: 2 });
      paiementsData.push({ typeCotisationId: 3, membreId: i + 1, montant: 2000, mois: 6, annee: 2026, modePaiement: "orange_money", confirmePar: 3 });
      if (i < 5) {
        paiementsData.push({ typeCotisationId: 2, membreId: i + 1, montant: 15000, mois: 1, annee: 2026, modePaiement: i === 0 ? "cheque" : "especes", confirmePar: 2 });
      }
    }
    await PaiementCotisation.bulkCreate(paiementsData);

    await Activite.bulkCreate([
      { action: "Seed API", details: "Initialisation via endpoint API", userId: req.user.id },
    ]);

    await Configuration.bulkCreate([
      { cle: "inscription_membre_debut", valeur: "2026-01-01" },
      { cle: "inscription_membre_fin", valeur: "2026-12-31" },
    ]);

    res.json({
      message: "Seed effectué avec succès",
      comptes: { superadmin: "admin123", admin1: "admin123", admin2: "admin123" },
      stats: { localites: 6, users: 3, membres: 10, evenements: 4, formulaires: 2, cotisations: cotisationsData.length, inscriptions: inscriptionsData.length }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
