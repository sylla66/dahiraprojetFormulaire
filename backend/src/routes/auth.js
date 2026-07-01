const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { User, Activite, Localite } = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Compte temporairement bloque (15 min)." },
  standardHeaders: true,
  legacyHeaders: false,
});

function validatePassword(password) {
  if (password.length < 8) return "Minimum 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Doit contenir une majuscule";
  if (!/[a-z]/.test(password)) return "Doit contenir une minuscule";
  if (!/[0-9]/.test(password)) return "Doit contenir un chiffre";
  return null;
}

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Identifiant et mot de passes requis" });
    }
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
    if (!username || !email || !password || !nom || !prenom) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }
    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ error: `Mot de passe: ${pwdError}` });
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
