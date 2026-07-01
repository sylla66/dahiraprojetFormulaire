require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models/index");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const superAdminRoutes = require("./routes/superAdmin");
const formsRoutes = require("./routes/forms");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
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
