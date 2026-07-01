const express = require("express");
const { Formulaire, Localite, Activite } = require("../models");
const { auth, adminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, adminRequired, async (req, res) => {
  try {
    const where = req.user.estSuperAdmin() ? {} : { userId: req.user.id };
    const formulaires = await Formulaire.findAll({
      where,
      include: [{ model: Localite, as: "localiteRef" }, { model: User, as: "createur", attributes: ["id", "nom", "prenom"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(formulaires);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, adminRequired, async (req, res) => {
  try {
    const { titre, description, typeEvenement, localiteId, champs } = req.body;
    const formulaire = await Formulaire.create({
      titre, description, typeEvenement: typeEvenement || "cotisation",
      champsJson: JSON.stringify(champs || []),
      userId: req.user.id, localiteId,
    });
    await Activite.create({
      userId: req.user.id, action: "Creation formulaire", details: titre,
    });
    res.status(201).json(formulaire);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", auth, adminRequired, async (req, res) => {
  try {
    const formulaire = await Formulaire.findByPk(req.params.id, {
      include: [{ model: Localite, as: "localiteRef" }],
    });
    if (!formulaire) return res.status(404).json({ error: "Formulaire introuvable" });
    if (!req.user.estSuperAdmin() && formulaire.userId !== req.user.id) {
      return res.status(403).json({ error: "Acces refuse" });
    }
    res.json({ ...formulaire.toJSON(), champs: JSON.parse(formulaire.champsJson || "[]") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, adminRequired, async (req, res) => {
  try {
    const formulaire = await Formulaire.findByPk(req.params.id);
    if (!formulaire) return res.status(404).json({ error: "Introuvable" });
    if (!req.user.estSuperAdmin() && formulaire.userId !== req.user.id) {
      return res.status(403).json({ error: "Acces refuse" });
    }
    const { titre, description, typeEvenement, estActif, champs } = req.body;
    await formulaire.update({
      titre, description, typeEvenement, estActif,
      champsJson: JSON.stringify(champs || JSON.parse(formulaire.champsJson)),
    });
    await Activite.create({
      userId: req.user.id, action: "Modification formulaire", details: titre,
    });
    res.json(formulaire);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, adminRequired, async (req, res) => {
  try {
    const formulaire = await Formulaire.findByPk(req.params.id);
    if (!formulaire) return res.status(404).json({ error: "Introuvable" });
    if (!req.user.estSuperAdmin() && formulaire.userId !== req.user.id) {
      return res.status(403).json({ error: "Acces refuse" });
    }
    await formulaire.destroy();
    await Activite.create({
      userId: req.user.id, action: "Suppression formulaire", details: formulaire.titre,
    });
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const User = require("../models/User");

module.exports = router;
