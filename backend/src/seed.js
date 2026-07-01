require("dotenv").config();
const sequelize = require("./config/database");
const models = require("./models/index");
const bcrypt = require("bcryptjs");

const { User, Localite, Membre, Formulaire, Evenement, Cotisation, Inscription, Activite } = models;

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database recreated");

    const superAdmin = await User.create({
      username: "superadmin",
      email: "superadmin@dahira.com",
      password: "admin123",
      nom: "DIOP",
      prenom: "Super",
      role: "super_admin",
      telephone: "+221 77 000 00 00",
      localite: "Dakar",
      isActive: true,
    });
    console.log("Super admin created: superadmin / admin123");

    await User.create({
      username: "admin1",
      email: "admin1@dahira.com",
      password: "admin123",
      nom: "FALL",
      prenom: "Admin",
      role: "admin",
      telephone: "+221 77 111 11 11",
      localite: "Rufisque",
      isActive: true,
    });
    console.log("Admin created: admin1 / admin123");

    const localites = await Localite.bulkCreate([
      { nom: "Dakar", pays: "Senegal" },
      { nom: "Rufisque", pays: "Senegal" },
      { nom: "Thies", pays: "Senegal" },
      { nom: "Saint-Louis", pays: "Senegal" },
      { nom: "Paris", pays: "France" },
      { nom: "Marseille", pays: "France" },
      { nom: "Lyon", pays: "France" },
      { nom: "Bordeaux", pays: "France" },
    ]);
    console.log(`${localites.length} localites created`);

    const membres = await Membre.bulkCreate([
      { nom: "NDIAYE", prenom: "Mamadou", telephone: "+221 77 123 45 67", email: "mamadou@email.com", localiteId: 1, profession: "Enseignant" },
      { nom: "DIALLO", prenom: "Aissatou", telephone: "+221 77 234 56 78", email: "aissatou@email.com", localiteId: 1, profession: "Medecin" },
      { nom: "SOW", prenom: "Ousmane", telephone: "+221 77 345 67 89", localiteId: 2, profession: "Commercant" },
      { nom: "BA", prenom: "Fatou", telephone: "+221 77 456 78 90", email: "fatou@email.com", localiteId: 2, profession: "Fonctionnaire" },
      { nom: "THIAM", prenom: "Modou", telephone: "+221 77 567 89 01", localiteId: 3, profession: "Etudiant" },
      { nom: "GUEYE", prenom: "Sokhna", telephone: "+221 77 678 90 12", email: "sokhna@email.com", localiteId: 5, profession: "Infirmiere" },
      { nom: "FALL", prenom: "Cheikh", telephone: "+221 77 789 01 23", localiteId: 5, profession: "Ingenieur" },
      { nom: "DIOP", prenom: "Aminata", telephone: "+221 77 890 12 34", localiteId: 1, profession: "Avocate" },
    ]);
    console.log(`${membres.length} membres created`);

    const formulaire = await Formulaire.create({
      titre: "Cotisation Ramadan 2026",
      description: "Formulaire de cotisation pour le mois de Ramadan",
      typeEvenement: "cotisation",
      champsJson: JSON.stringify([
        { nom: "montant", type: "number", label: "Montant cotisation", requis: true },
        { nom: "mois", type: "text", label: "Mois", requis: true },
      ]),
      userId: 1,
      localiteId: 1,
    });

    const formulaire2 = await Formulaire.create({
      titre: "Recensement Dahira",
      description: "Recensement general des membres du Dahira",
      typeEvenement: "recensement",
      champsJson: JSON.stringify([
        { nom: "profession", type: "text", label: "Profession", requis: true },
        { nom: "disponibilite", type: "text", label: "Disponibilite", requis: false },
        { nom: "competences", type: "textarea", label: "Competences", requis: false },
      ]),
      userId: 1,
      localiteId: 1,
    });
    console.log("Formulaires created");

    const now = new Date();
    const evenement = await Evenement.create({
      titre: "Collecte Ramadan 2026",
      description: "Collecte de fonds pour le programme du Ramadan",
      dateEvenement: new Date(now.getFullYear(), now.getMonth(), 15),
      dateFin: new Date(now.getFullYear(), now.getMonth(), 20),
      lieu: "Dakar Plateau",
      formulaireId: 1,
      userId: 1,
      localiteId: 1,
      montantObjectif: 500000,
    });

    await Inscription.bulkCreate([
      { evenementId: 1, membreId: 1, donneesJson: JSON.stringify({ montant: "25000", mois: "Mars" }) },
      { evenementId: 1, membreId: 2, donneesJson: JSON.stringify({ montant: "30000", mois: "Mars" }) },
      { evenementId: 1, membreId: 3, donneesJson: JSON.stringify({ montant: "15000", mois: "Mars" }) },
      { evenementId: 1, membreId: 4, donneesJson: JSON.stringify({ montant: "20000", mois: "Mars" }) },
      { evenementId: 1, membreId: 5, donneesJson: JSON.stringify({ montant: "10000", mois: "Mars" }) },
    ]);
    console.log("Inscriptions created");

    await Cotisation.bulkCreate([
      { evenementId: 1, membreId: 1, montant: 25000, confirmePar: 1 },
      { evenementId: 1, membreId: 2, montant: 30000, confirmePar: 1 },
      { evenementId: 1, membreId: 3, montant: 15000, confirmePar: 1 },
    ]);
    console.log("Cotisations created");

    await Activite.bulkCreate([
      { userId: 1, action: "Initialisation", details: "Base de donnees initialisee", typeActivite: "system" },
      { userId: 1, action: "Seed", details: "Donnees de demo inserees", typeActivite: "system" },
    ]);
    console.log("Activites created");

    console.log("\n========================================");
    console.log("  SEED REUSSI !");
    console.log("========================================");
    console.log("  Super Admin: superadmin / admin123");
    console.log("  Admin:       admin1 / admin123");
    console.log("========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
