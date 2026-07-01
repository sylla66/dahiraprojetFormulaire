const express = require("express");
const { Op } = require("sequelize");
const {
  Membre, Evenement, Cotisation, Inscription, Activite,
  Localite, Formulaire, User,
} = require("../models");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    if (req.user.estSuperAdmin()) {
      return res.redirect("/api/super-admin/dashboard");
    }
    const totalMembres = await Membre.count();
    const totalEvenements = await Evenement.count({ where: { userId: req.user.id } });
    const totalCotise = await Cotisation.sum("montant", {
      where: { estValide: true },
      include: [{
        model: Evenement, as: "evenementRef",
        where: { userId: req.user.id },
      }],
    }) || 0;

    const evenements = await Evenement.findAll({
      where: { userId: req.user.id },
      order: [["dateEvenement", "DESC"]],
      limit: 5,
      include: [{ model: Formulaire, as: "formulaireRef" }],
    });

    const membres = await Membre.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      include: [{ model: Localite, as: "localiteRef" }],
    });

    res.json({ stats: { totalMembres, totalEvenements, totalCotise }, evenements, membres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/evenement/:id", auth, async (req, res) => {
  try {
    const evenement = await Evenement.findByPk(req.params.id, {
      include: [
        { model: Formulaire, as: "formulaireRef" },
        { model: Localite, as: "localiteRef" },
      ],
    });
    if (!evenement) return res.status(404).json({ error: "Introuvable" });
    const cotisations = await Cotisation.findAll({
      where: { evenementId: req.params.id, estValide: true },
      include: [{ model: Membre, as: "membreRef" }],
    });
    const inscriptions = await Inscription.findAll({
      where: { evenementId: req.params.id },
      include: [{ model: Membre, as: "membreRef" }],
    });
    const totalCotise = cotisations.reduce((s, c) => s + c.montant, 0);
    const nbCotisants = new Set(cotisations.map(c => c.membreId)).size;
    const nbInscrits = inscriptions.length;
    const tauxCotisation = nbInscrits > 0 ? (nbCotisants / nbInscrits * 100) : 0;
    const champs = evenement.formulaireRef
      ? JSON.parse(evenement.formulaireRef.champsJson || "[]")
      : [];

    res.json({
      evenement, cotisations, inscriptions, totalCotise,
      nbCotisants, nbInscrits, tauxCotisation, champs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/:evenementId/:type", auth, async (req, res) => {
  try {
    const { evenementId, type } = req.params;
    const inscriptions = await Inscription.findAll({
      where: { evenementId },
      include: [{ model: Membre, as: "membreRef", include: [{ model: Localite, as: "localiteRef" }] }],
    });
    const cotisations = await Cotisation.findAll({
      where: { evenementId, estValide: true },
      include: [{ model: Membre, as: "membreRef" }],
    });
    const cotiseIds = new Set(cotisations.map(c => c.membreId));

    let rows = [];
    if (type === "inscrits") {
      rows = inscriptions.map(i => ({
        Nom: i.membreRef?.nom, Prenom: i.membreRef?.prenom,
        Telephone: i.membreRef?.telephone, Email: i.membreRef?.email || "",
        Localite: i.membreRef?.localiteRef?.nom || "",
        Inscription: i.createdAt.toISOString().split("T")[0],
        Cotise: cotiseIds.has(i.membreId) ? "Oui" : "Non",
      }));
    } else if (type === "cotisants") {
      rows = cotisations.map(c => ({
        Nom: c.membreRef?.nom, Prenom: c.membreRef?.prenom,
        Telephone: c.membreRef?.telephone, Email: c.membreRef?.email || "",
        Montant: c.montant, Date: c.createdAt.toISOString().split("T")[0],
        Mode: c.modePaiement,
      }));
    } else {
      rows = inscriptions.map(i => {
        const cot = cotisations.find(c => c.membreId === i.membreId);
        return {
          Nom: i.membreRef?.nom, Prenom: i.membreRef?.prenom,
          Telephone: i.membreRef?.telephone, Email: i.membreRef?.email || "",
          Localite: i.membreRef?.localiteRef?.nom || "",
          Inscrit: "Oui", Cotise: cot ? "Oui" : "Non",
          Montant: cot?.montant || "", Date: cot?.createdAt?.toISOString().split("T")[0] || "",
        };
      });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
