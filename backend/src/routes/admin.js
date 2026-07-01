const express = require("express");
const { Op } = require("sequelize");
const { Membre, Localite, Evenement, Cotisation, Inscription, Formulaire, Activite } = require("../models");
const { auth, adminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/membres", auth, adminRequired, async (req, res) => {
  try {
    const { localite, search } = req.query;
    const where = {};
    if (localite) where.localiteId = parseInt(localite);
    if (search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
        { telephone: { [Op.like]: `%${search}%` } },
      ];
    }
    const membres = await Membre.findAll({
      where,
      include: [{ model: Localite, as: "localiteRef" }],
      order: [["nom", "ASC"]],
    });
    res.json(membres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/membres", auth, adminRequired, async (req, res) => {
  try {
    const { nom, prenom, telephone, email, localiteId, adresse, profession } = req.body;
    if (await Membre.findOne({ where: { telephone } })) {
      return res.status(400).json({ error: "Telephone existe deja" });
    }
    const membre = await Membre.create({ nom, prenom, telephone, email, localiteId, adresse, profession });
    await Activite.create({
      userId: req.user.id, action: "Ajout membre", details: `${prenom} ${nom} (${telephone})`,
    });
    res.status(201).json(membre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/membres/:id", auth, adminRequired, async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ error: "Membre introuvable" });
    const { nom, prenom, telephone, email, localiteId, adresse, profession, estActif } = req.body;
    await membre.update({ nom, prenom, telephone, email, localiteId, adresse, profession, estActif });
    await Activite.create({
      userId: req.user.id, action: "Modification membre", details: `${membre.prenom} ${membre.nom}`,
    });
    res.json(membre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/membres/:id", auth, adminRequired, async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ error: "Membre introuvable" });
    const nom = `${membre.prenom} ${membre.nom}`;
    await membre.destroy();
    await Activite.create({
      userId: req.user.id, action: "Suppression membre", details: nom,
    });
    res.json({ message: "Membre supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/evenements", auth, adminRequired, async (req, res) => {
  try {
    const evenements = await Evenement.findAll({
      include: [
        { model: Formulaire, as: "formulaireRef" },
        { model: Localite, as: "localiteRef" },
        { model: User, as: "organisateur", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["dateEvenement", "DESC"]],
    });
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/evenements", auth, adminRequired, async (req, res) => {
  try {
    const evenement = await Evenement.create({ ...req.body, userId: req.user.id });
    await Activite.create({
      userId: req.user.id, action: "Creation evenement", details: evenement.titre,
    });
    res.status(201).json(evenement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/evenements/:id", auth, adminRequired, async (req, res) => {
  try {
    const evenement = await Evenement.findByPk(req.params.id, {
      include: [
        { model: Formulaire, as: "formulaireRef" },
        { model: Localite, as: "localiteRef" },
      ],
    });
    if (!evenement) return res.status(404).json({ error: "Evenement introuvable" });
    const membres = await Membre.findAll({ where: { estActif: true }, order: [["nom", "ASC"]] });
    const cotisations = await Cotisation.findAll({
      where: { evenementId: req.params.id },
      include: [{ model: Membre, as: "membreRef" }],
    });
    const inscriptions = await Inscription.findAll({
      where: { evenementId: req.params.id },
      include: [{ model: Membre, as: "membreRef" }],
    });
    res.json({ evenement, membres, cotisations, inscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/evenements/:id/inscrire", auth, adminRequired, async (req, res) => {
  try {
    const { membreId, donnees } = req.body;
    const existing = await Inscription.findOne({
      where: { evenementId: req.params.id, membreId },
    });
    if (existing) return res.status(400).json({ error: "Deja inscrit" });
    const inscription = await Inscription.create({
      evenementId: parseInt(req.params.id),
      membreId: parseInt(membreId),
      donneesJson: JSON.stringify(donnees || {}),
    });
    await Activite.create({
      userId: req.user.id, action: "Inscription", details: `Membre #${membreId} -> Evenement #${req.params.id}`,
    });
    res.status(201).json(inscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/evenements/:id/cotisation", auth, adminRequired, async (req, res) => {
  try {
    const { membreId, montant, modePaiement } = req.body;
    const cotisation = await Cotisation.create({
      evenementId: parseInt(req.params.id),
      membreId: parseInt(membreId),
      montant: parseFloat(montant),
      modePaiement: modePaiement || "especes",
      confirmePar: req.user.id,
    });
    await Activite.create({
      userId: req.user.id, action: "Cotisation", details: `Membre #${membreId} -> ${montant}F`,
    });
    res.status(201).json(cotisation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/evenements/:id/cloturer", auth, adminRequired, async (req, res) => {
  try {
    const evenement = await Evenement.findByPk(req.params.id);
    evenement.estCloture = true;
    await evenement.save();
    await Activite.create({
      userId: req.user.id, action: "Cloture evenement", details: evenement.titre,
    });
    res.json({ message: "Evenement clos" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/cotisations/:id", auth, adminRequired, async (req, res) => {
  try {
    const cotisation = await Cotisation.findByPk(req.params.id);
    if (!cotisation) return res.status(404).json({ error: "Introuvable" });
    await cotisation.destroy();
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/inscriptions/:id", auth, adminRequired, async (req, res) => {
  try {
    const inscription = await Inscription.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ error: "Introuvable" });
    await inscription.destroy();
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/historique", auth, adminRequired, async (req, res) => {
  try {
    const activites = await Activite.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    res.json(activites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const User = require("../models/User");

module.exports = router;
