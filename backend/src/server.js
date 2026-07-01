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

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("Evenement");
    if (!table.montantMinimum) {
      await sequelize.query("ALTER TABLE Evenement ADD COLUMN montantMinimum INTEGER DEFAULT 0;");
      console.log("Added column montantMinimum to Evenement");
    } else if (table.montantMinimum.type === "FLOAT") {
      await sequelize.query("ALTER TABLE Evenement ADD COLUMN montantMinimum_new INTEGER DEFAULT 0;");
      await sequelize.query("UPDATE Evenement SET montantMinimum_new = CAST(montantMinimum AS INTEGER);");
      await sequelize.query("ALTER TABLE Evenement DROP COLUMN montantMinimum;");
      await sequelize.query("ALTER TABLE Evenement RENAME COLUMN montantMinimum_new TO montantMinimum;");
      console.log("Converted montantMinimum from FLOAT to INTEGER");
    }
    if (!table.dateDebutInscription) {
      await sequelize.query("ALTER TABLE Evenement ADD COLUMN dateDebutInscription DATETIME;");
      console.log("Added column dateDebutInscription to Evenement");
    }
    if (!table.dateFinInscription) {
      await sequelize.query("ALTER TABLE Evenement ADD COLUMN dateFinInscription DATETIME;");
      console.log("Added column dateFinInscription to Evenement");
    }
    await sequelize.sync({ force: false });
    console.log("Database synchronized");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
