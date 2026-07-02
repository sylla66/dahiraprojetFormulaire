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

(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synchronized");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
