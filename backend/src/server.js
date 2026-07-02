require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sequelize = require("./config/database");
require("./models/index");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const superAdminRoutes = require("./routes/superAdmin");
const formsRoutes = require("./routes/forms");
const dashboardRoutes = require("./routes/dashboard");
const publicRoutes = require("./routes/public");
const notificationsRoutes = require("./routes/notifications");
const exportRoutes = require("./routes/export");
const backupRoutes = require("./routes/backup");
const cotisationsRoutes = require("./routes/cotisations");
const seedRoutes = require("./routes/seed");
const { User } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Trop de requetes. Reessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/cotisations", cotisationsRoutes);
app.use("/api/seed", seedRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist, {
  maxAge: "1d",
  etag: true,
}));
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendDist, "index.html"));
  }
});

async function autoSeed() {
  const count = await User.count();
  if (count === 0) {
    console.log("Base vide -> seed automatique...");
    const seed = require("./routes/seed");
    const req = { query: {}, user: { id: null } };
    const res = {
      json: (data) => console.log("Seed OK:", data.message),
      status: (code) => ({ json: (data) => console.error("Seed error:", data.error) }),
    };
    try {
      const {
        Localite, Membre, Evenement, Formulaire,
        Cotisation, Inscription, Activite, Configuration,
        TypeCotisation, PaiementCotisation,
      } = require("./models");

      const localites = await Localite.bulkCreate([
        { nom: "Dakar", pays: "Senegal" }, { nom: "Thies", pays: "Senegal" },
        { nom: "Saint-Louis", pays: "Senegal" }, { nom: "Touba", pays: "Senegal" },
        { nom: "Kaolack", pays: "Senegal" }, { nom: "Ziguinchor", pays: "Senegal" },
      ]);
      const superAdmin = await User.create({ username: "superadmin", email: "super@dahira.sn", password: "admin123", role: "super_admin", nom: "Diop", prenom: "Super", telephone: "771234500", localite: "Dakar", isActive: true });
      await User.create({ username: "admin1", email: "admin1@dahira.sn", password: "admin123", role: "admin", nom: "Fall", prenom: "Admin", telephone: "771234501", localite: "Thies", isActive: true });
      await User.create({ username: "admin2", email: "admin2@dahira.sn", password: "admin123", role: "admin", nom: "Sy", prenom: "Modou", telephone: "771234502", localite: "Saint-Louis", isActive: true });
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
      await Formulaire.create({ titre: "Formulaire evenement standard", description: "Formulaire par defaut", typeEvenement: "cotisation", estActif: true, champsJson: JSON.stringify([{ nom: "nom", type: "text", label: "Nom", requis: true }, { nom: "telephone", type: "tel", label: "Telephone", requis: true }]), userId: 2, localiteId: 1 });
      await Formulaire.create({ titre: "Formulaire gala", description: "Pour les galas et diners", typeEvenement: "gala", estActif: true, champsJson: JSON.stringify([{ nom: "nom", type: "text", label: "Nom complet", requis: true }, { nom: "telephone", type: "tel", label: "Telephone", requis: true }, { nom: "nombrePlaces", type: "number", label: "Nombre de places", requis: true }]), userId: 2, localiteId: 2 });
      await Evenement.bulkCreate([
        { titre: "Ziarra annuelle 2026", description: "Grande ziarra annuelle du dahira", dateEvenement: new Date("2026-12-15"), dateFin: new Date("2026-12-16"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-12-10"), lieu: "Dakar Plateau", montantObjectif: 5000000, montantMinimum: 5000, formulaireId: 1, userId: 2, localiteId: 1 },
        { titre: "Gala de bienfaisance", description: "Soiree gala pour collecte de fonds", dateEvenement: new Date("2026-11-20"), dateFin: new Date("2026-11-20"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-11-15"), lieu: "Salle des fetes Thies", montantObjectif: 2000000, montantMinimum: 10000, formulaireId: 2, userId: 3, localiteId: 2 },
        { titre: "Causerie religieuse", description: "Conference sur le mouridisme", dateEvenement: new Date("2026-10-05"), lieu: "Daara Saint-Louis", montantObjectif: 500000, montantMinimum: 2000, formulaireId: 1, userId: 3, localiteId: 3 },
        { titre: "Khadimou Rassoul 2026", description: "Celebration du gamou", dateEvenement: new Date("2026-09-15"), dateFin: new Date("2026-09-17"), lieu: "Touba", montantObjectif: 10000000, montantMinimum: 10000, formulaireId: 1, userId: 2, localiteId: 4 },
      ]);
      await TypeCotisation.bulkCreate([
        { nom: "Caisse sociale", description: "Cotisation mensuelle caisse sociale", periodicite: "mensuel", montant: 5000, userId: 2 },
        { nom: "Barkelou", description: "Cotisation annuelle barkelou", periodicite: "annuel", montant: 15000, userId: 2 },
        { nom: "Budget mosquee", description: "Participation budget mosquee", periodicite: "mensuel", montant: 2000, userId: 3 },
        { nom: "Fonds d'entraide", description: "Cotisation pour aide aux membres", periodicite: "trimestriel", montant: 10000, userId: 2 },
        { nom: "Voyage spirituel", description: "Pour financer les voyages a Touba", periodicite: "annuel", montant: 25000, userId: 3 },
      ]);
      console.log("Seed automatique termine avec succes !");
    } catch (err) {
      console.error("Seed automatique echoue:", err.message);
    }
  } else {
    console.log(`Base contient deja ${count} utilisateurs, pas de seed automatique.`);
  }
}

(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synchronized");
    await autoSeed();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
