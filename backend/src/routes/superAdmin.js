const express = require("express");
const { Op } = require("sequelize");
const {
  User, Membre, Evenement, Cotisation, Inscription,
  Activite, Localite, Formulaire,
} = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", auth, superAdminRequired, async (req, res) => {
  try {
    const stats = {
      totalMembres: await Membre.count(),
      totalEvenements: await Evenement.count(),
      totalAdmins: await User.count({ where: { role: "admin", isActive: true } }),
      totalCotise: (await Cotisation.sum("montant", { where: { estValide: true } })) || 0,
      totalCotisations: await Cotisation.count({ where: { estValide: true } }),
      totalInscriptions: await Inscription.count(),
    };
    const evenements = await Evenement.findAll({
      order: [["dateEvenement", "DESC"]],
      limit: 10,
      include: [
        { model: Formulaire, as: "formulaireRef" },
        { model: User, as: "organisateur", attributes: ["id", "nom", "prenom"] },
      ],
    });
    const admins = await User.findAll({ where: { role: "admin" } });
    res.json({ stats, evenements, admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/utilisateurs", auth, superAdminRequired, async (req, res) => {
  const users = await User.findAll({ order: [["role", "ASC"], ["nom", "ASC"]] });
  res.json(users);
});

router.post("/utilisateurs/:id/toggle", auth, superAdminRequired, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Introuvable" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Impossible" });
    user.isActive = !user.isActive;
    await user.save();
    await Activite.create({
      userId: req.user.id, action: "Toggle utilisateur",
      details: `Compte ${user.username} ${user.isActive ? "active" : "desactive"}`,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/utilisateurs/:id", auth, superAdminRequired, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Introuvable" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Impossible" });
    const nom = `${user.prenom} ${user.nom}`;
    await user.destroy();
    await Activite.create({
      userId: req.user.id, action: "Suppression utilisateur", details: nom,
    });
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/compile", auth, superAdminRequired, async (req, res) => {
  try {
    const { evenementId, localiteId } = req.query;
    const where = {};
    if (evenementId) where.id = parseInt(evenementId);
    if (localiteId) where.localiteId = parseInt(localiteId);
    const evenements = await Evenement.findAll({
      where, order: [["dateEvenement", "DESC"]],
      include: [{ model: Localite, as: "localiteRef" }],
    });
    const donnees = [];
    for (const e of evenements) {
      const cotisations = await Cotisation.findAll({ where: { evenementId: e.id, estValide: true } });
      const inscriptions = await Inscription.findAll({ where: { evenementId: e.id } });
      const total = cotisations.reduce((s, c) => s + c.montant, 0);
      const nbCotisants = new Set(cotisations.map(c => c.membreId)).size;
      const nbInscrits = inscriptions.length;
      donnees.push({
        id: e.id, titre: e.titre, date: e.dateEvenement,
        localite: e.localiteRef?.nom || "",
        totalCotise: total, nbCotisants, nbInscrits,
        taux: nbInscrits > 0 ? (nbCotisants / nbInscrits * 100) : 0,
      });
    }
    res.json({
      donnees,
      grandTotal: donnees.reduce((s, d) => s + d.totalCotise, 0),
      totalInscrits: donnees.reduce((s, d) => s + d.nbInscrits, 0),
      totalCotisants: donnees.reduce((s, d) => s + d.nbCotisants, 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/localites", auth, superAdminRequired, async (req, res) => {
  const localites = await Localite.findAll({ order: [["nom", "ASC"]] });
  res.json(localites);
});

router.post("/localites", auth, superAdminRequired, async (req, res) => {
  try {
    const { nom, pays } = req.body;
    if (await Localite.findOne({ where: { nom } })) {
      return res.status(400).json({ error: "Existe deja" });
    }
    const localite = await Localite.create({ nom, pays: pays || "Senegal" });
    await Activite.create({
      userId: req.user.id, action: "Ajout localite", details: nom,
    });
    res.status(201).json(localite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/localites/:id", auth, superAdminRequired, async (req, res) => {
  try {
    const localite = await Localite.findByPk(req.params.id);
    if (!localite) return res.status(404).json({ error: "Introuvable" });
    await localite.destroy();
    await Activite.create({
      userId: req.user.id, action: "Suppression localite", details: localite.nom,
    });
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/activites", auth, superAdminRequired, async (req, res) => {
  try {
    const { adminId } = req.query;
    const where = {};
    if (adminId) where.userId = parseInt(adminId);
    const activites = await Activite.findAll({
      where,
      include: [{ model: User, as: "utilisateur", attributes: ["id", "nom", "prenom", "username"] }],
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json(activites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export", auth, superAdminRequired, async (req, res) => {
  try {
    const evenements = await Evenement.findAll({
      include: [{ model: Localite, as: "localiteRef" }],
    });
    const rows = [];
    for (const e of evenements) {
      const cotisations = await Cotisation.findAll({ where: { evenementId: e.id, estValide: true } });
      const inscriptions = await Inscription.findAll({ where: { evenementId: e.id } });
      const total = cotisations.reduce((s, c) => s + c.montant, 0);
      const nbCotisants = new Set(cotisations.map(c => c.membreId)).size;
      const nbInscrits = inscriptions.length;
      rows.push({
        Evenement: e.titre,
        Date: e.dateEvenement.toISOString().split("T")[0],
        Localite: e.localiteRef?.nom || "",
        Inscrits: nbInscrits,
        Cotisants: nbCotisants,
        Total: total,
        Taux: nbInscrits > 0 ? ((nbCotisants / nbInscrits) * 100).toFixed(1) + "%" : "0%",
      });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
