const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Activite, Localite } = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Compte desactive" });
    }
    user.lastLogin = new Date();
    await user.save();
    await Activite.create({
      userId: user.id, action: "Connexion", details: "Connexion reussie",
    });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  res.json(req.user.toJSON());
});

router.post("/register", auth, superAdminRequired, async (req, res) => {
  try {
    const { username, email, password, nom, prenom, telephone, localite, role } = req.body;
    if (await User.findOne({ where: { username } })) {
      return res.status(400).json({ error: "Nom d'utilisateur existe deja" });
    }
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: "Email existe deja" });
    }
    const user = await User.create({
      username, email, password, nom, prenom, telephone, localite, role: role || "admin",
    });
    await Activite.create({
      userId: req.user.id,
      action: "Creation utilisateur",
      details: `Compte cree pour ${prenom} ${nom} (${username}) - ${role}`,
    });
    res.status(201).json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/localites", async (req, res) => {
  const localites = await Localite.findAll({ order: [["nom", "ASC"]] });
  res.json(localites);
});

module.exports = router;
