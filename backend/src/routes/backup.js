const express = require("express");
const { User, Activite } = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/database", auth, superAdminRequired, async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      return res.status(400).json({ error: "Sauvegarde SQLite indisponible avec PostgreSQL. Utilisez pg_dump ou l'interface Render." });
    }
    const path = require("path");
    const fs = require("fs");
    const dbPath = path.join(__dirname, "../database.sqlite");
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: "Fichier de base de donnees introuvable" });
    }
    await Activite.create({
      userId: req.user.id,
      action: "Sauvegarde BDD",
      details: `Sauvegarde de la base de donnees telechargee par ${req.user.prenom} ${req.user.nom}`,
    });
    const date = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="dahira-backup-${date}.sqlite"`);
    res.sendFile(dbPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/info", auth, superAdminRequired, async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      return res.json({ exists: false, message: "Base PostgreSQL distante. Utilisez l'interface Render." });
    }
    const path = require("path");
    const fs = require("fs");
    const dbPath = path.join(__dirname, "../database.sqlite");
    if (!fs.existsSync(dbPath)) {
      return res.json({ exists: false });
    }
    const stats = fs.statSync(dbPath);
    res.json({
      exists: true,
      size: (stats.size / 1024 / 1024).toFixed(2),
      lastModified: stats.mtime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
