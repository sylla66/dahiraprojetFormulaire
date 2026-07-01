const express = require("express");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const {
  User, Membre, Evenement, Cotisation, Inscription,
  Activite, Localite, Formulaire, TypeCotisation, PaiementCotisation, Configuration,
} = require("../models");
const { auth, superAdminRequired } = require("../middleware/auth");
const PDFDocument = require("pdfkit");

const router = express.Router();

function drawTable(doc, headers, rows, startY) {
  const colWidths = headers.map(h => h.width);
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const margin = 40, left = margin, rowH = 18;
  let y = startY;
  const drawHeader = () => {
    doc.fontSize(9).font("Helvetica-Bold");
    let x = left;
    headers.forEach((h, i) => { doc.text(h.label, x + 3, y + 4, { width: colWidths[i] - 6, align: "left" }); x += colWidths[i]; });
    y += rowH; doc.lineWidth(1).moveTo(left, y).lineTo(left + totalW, y).stroke(); y += 4;
  };
  const drawRow = (cells) => {
    if (y + rowH > 770) { doc.addPage(); y = 50; drawHeader(); }
    doc.font("Helvetica").fontSize(8.5);
    let x = left;
    cells.forEach((cell, i) => { doc.text(String(cell), x + 3, y + 4, { width: colWidths[i] - 6, align: "left" }); x += colWidths[i]; });
    y += rowH; doc.lineWidth(0.5).moveTo(left, y).lineTo(left + totalW, y).stroke(); y += 2;
  };
  drawHeader();
  rows.forEach(drawRow);
  return y;
}

router.get("/dashboard", auth, superAdminRequired, async (req, res) => {
  try {
    const stats = {
      totalMembres: await Membre.count(),
      totalEvenements: await Evenement.count(),
      totalAdmins: await User.count({ where: { role: "admin", isActive: true } }),
      totalCotise: (await Cotisation.sum("montant", { where: { estValide: true } })) || 0,
      totalCotisations: await Cotisation.count({ where: { estValide: true } }),
      totalInscriptions: await Inscription.count(),
      totalTypesCotisation: await TypeCotisation.count({ where: { estActif: true } }),
      totalPaiementsRecurrents: await PaiementCotisation.sum("montant") || 0,
      nbPaiementsRecurrents: await PaiementCotisation.count(),
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

router.put("/utilisateurs/:id/role", auth, superAdminRequired, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Introuvable" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Impossible de changer votre propre role" });
    const { role } = req.body;
    if (!["admin", "super_admin"].includes(role)) return res.status(400).json({ error: "Role invalide" });
    user.role = role;
    await user.save();
    await Activite.create({
      userId: req.user.id, action: "Changement role", details: `${user.username} -> ${role}`,
    });
    res.json(user.toJSON());
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

router.get("/membres", auth, superAdminRequired, async (req, res) => {
  try {
    const membres = await Membre.findAll({
      include: [{ model: Localite, as: "localiteRef" }],
      order: [["nom", "ASC"]],
    });
    res.json(membres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/membres/:id", auth, superAdminRequired, async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ error: "Introuvable" });
    const nom = `${membre.prenom} ${membre.nom}`;
    await PaiementCotisation.destroy({ where: { membreId: membre.id } });
    await membre.destroy();
    await Activite.create({ userId: req.user.id, action: "Suppression membre (super admin)", details: nom });
    res.json({ message: "Membre supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/membres-pdf", auth, superAdminRequired, async (req, res) => {
  try {
    const membres = await Membre.findAll({
      include: [{ model: Localite, as: "localiteRef" }],
      order: [["nom", "ASC"]],
    });
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=annuaire-complet-membres.pdf");
    doc.pipe(res);
    doc.fontSize(16).font("Helvetica-Bold").text("Annuaire complet des membres", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Edite le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown(1);
    const headers = [
      { label: "N°", width: 25 }, { label: "Nom & Prenom", width: 150 },
      { label: "Telephone", width: 110 }, { label: "Email", width: 140 }, { label: "Localite", width: 85 },
    ];
    const rows = membres.map((m, idx) => [idx + 1, `${m.prenom || ""} ${m.nom}`, m.telephone || "-", m.email || "-", m.localiteRef?.nom || "-"]);
    drawTable(doc, headers, rows, doc.y + 10);
    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica-Bold").text(`Total: ${membres.length} membres`, { align: "right" });
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/cotisations-recurrentes", auth, superAdminRequired, async (req, res) => {
  try {
    const types = await TypeCotisation.findAll({ include: [{ model: User, as: "createur", attributes: ["id", "nom", "prenom"] }] });
    const stats = [];
    for (const t of types) {
      const paiements = await PaiementCotisation.findAll({ where: { typeCotisationId: t.id } });
      const total = paiements.reduce((s, p) => s + p.montant, 0);
      stats.push({ id: t.id, nom: t.nom, total, nbPaiements: paiements.length, createur: t.createur ? `${t.createur.prenom} ${t.createur.nom}` : "" });
    }
    const grandTotal = stats.reduce((s, st) => s + st.total, 0);
    res.json({ stats, grandTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/seed", auth, superAdminRequired, async (req, res) => {
  try {
    const count = await User.count();
    if (count > 0 && !req.query.force) {
      return res.status(400).json({ error: "La base contient deja des donnees. Ajoutez ?force=true pour reinitialiser." });
    }
    if (req.query.force) {
      const models = [PaiementCotisation, Cotisation, Inscription, TypeCotisation, Evenement, Formulaire, Membre, User, Activite, Configuration, Localite];
      for (const m of models) await m.destroy({ where: {} });
      await sequelize.query("DELETE FROM sqlite_sequence");
    }

    const localites = await Localite.bulkCreate([
      { nom: "Dakar", pays: "Senegal" }, { nom: "Thies", pays: "Senegal" },
      { nom: "Saint-Louis", pays: "Senegal" }, { nom: "Touba", pays: "Senegal" },
      { nom: "Kaolack", pays: "Senegal" }, { nom: "Ziguinchor", pays: "Senegal" },
    ]);

    const superAdmin = await User.create({
      username: "superadmin", email: "super@dahira.sn",
      password: "admin123", role: "super_admin",
      nom: "Diop", prenom: "Super", telephone: "771234500", localite: "Dakar",
    });
    const admin1 = await User.create({
      username: "admin1", email: "admin1@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Fall", prenom: "Admin", telephone: "771234501", localite: "Thies",
    });
    const admin2 = await User.create({
      username: "admin2", email: "admin2@dahira.sn",
      password: "admin123", role: "admin",
      nom: "Sy", prenom: "Modou", telephone: "771234502", localite: "Saint-Louis",
    });

    const membres = [];
    const membreData = [
      ["Sow", "Aminata", "771111111", "amina@ex.sn", 1, "Enseignante"],
      ["Gueye", "Mamadou", "771111112", "mgueye@ex.sn", 1, "Commercant"],
      ["Ndiaye", "Fatou", "771111113", "fndiaye@ex.sn", 2, "Infirmiere"],
      ["Dieng", "Oumar", "771111114", "odieng@ex.sn", 2, "Fonctionnaire"],
      ["Ba", "Marieme", "771111115", "mba@ex.sn", 3, "Etudiante"],
      ["Kane", "El Hadji", "771111116", "ekane@ex.sn", 3, "Transporteur"],
      ["Thiam", "Aissatou", "771111117", "athiam@ex.sn", 4, "Coiffeuse"],
      ["Sall", "Moustapha", "771111118", "msall@ex.sn", 4, "Mecanicien"],
      ["Faye", "Ndeye", "771111119", "nfaye@ex.sn", 5, "Secretaire"],
      ["Camara", "Boubacar", "771111120", "bcamara@ex.sn", 5, "Agriculteur"],
    ];
    for (const [nom, prenom, tel, email, locId, prof] of membreData) {
      membres.push(await Membre.create({ nom, prenom, telephone: tel, email, localiteId: locId, profession: prof }));
    }

    const form1 = await Formulaire.create({
      titre: "Formulaire standard", description: "Par defaut", typeEvenement: "cotisation",
      champsJson: JSON.stringify([{ nom: "nom", type: "text", label: "Nom", requis: true }, { nom: "telephone", type: "tel", label: "Telephone", requis: true }]),
      userId: admin1.id, localiteId: 1,
    });
    await Formulaire.create({
      titre: "Formulaire gala", description: "Pour galas", typeEvenement: "gala",
      champsJson: JSON.stringify([{ nom: "nom", type: "text", label: "Nom complet", requis: true }, { nom: "telephone", type: "tel", label: "Telephone", requis: true }, { nom: "nombrePlaces", type: "number", label: "Places", requis: true }]),
      userId: admin1.id, localiteId: 2,
    });

    const evenements = await Evenement.bulkCreate([
      { titre: "Ziarra annuelle 2026", description: "Grande ziarra", dateEvenement: new Date("2026-12-15"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-12-10"), lieu: "Dakar Plateau", montantObjectif: 5000000, montantMinimum: 5000, formulaireId: form1.id, userId: admin1.id, localiteId: 1 },
      { titre: "Gala de bienfaisance", description: "Soiree gala", dateEvenement: new Date("2026-11-20"), dateDebutInscription: new Date("2026-01-01"), dateFinInscription: new Date("2026-11-15"), lieu: "Thies", montantObjectif: 2000000, montantMinimum: 10000, formulaireId: form1.id, userId: admin2.id, localiteId: 2 },
      { titre: "Causerie religieuse", description: "Conference mouridisme", dateEvenement: new Date("2026-10-05"), lieu: "Saint-Louis", montantObjectif: 500000, montantMinimum: 2000, formulaireId: form1.id, userId: admin2.id, localiteId: 3 },
      { titre: "Khadimou Rassoul 2026", description: "Gamou", dateEvenement: new Date("2026-09-15"), lieu: "Touba", montantObjectif: 10000000, montantMinimum: 10000, formulaireId: form1.id, userId: admin1.id, localiteId: 4 },
    ]);

    const cotisations = [];
    for (let i = 0; i < 10; i++) {
      cotisations.push(await Cotisation.create({ montant: 5000 + i * 1000, evenementId: 1, membreId: i + 1, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: admin1.id }));
      cotisations.push(await Cotisation.create({ montant: 3000 + i * 500, evenementId: 2, membreId: i + 1, modePaiement: i % 2 === 0 ? "orange_money" : "especes", confirmePar: admin2.id }));
    }

    for (let i = 0; i < 10; i++) {
      await Inscription.create({ evenementId: 1, membreId: i + 1, estPresent: i % 3 === 0 });
      await Inscription.create({ evenementId: 2, membreId: i + 1, estPresent: false });
    }

    const types = await TypeCotisation.bulkCreate([
      { nom: "Caisse sociale", description: "Mensuelle caisse sociale", periodicite: "mensuel", montant: 5000, userId: admin1.id },
      { nom: "Barkelou", description: "Annuelle barkelou", periodicite: "annuel", montant: 15000, userId: admin1.id },
      { nom: "Budget mosquee", description: "Participation mosquee", periodicite: "mensuel", montant: 2000, userId: admin2.id },
      { nom: "Fonds d'entraide", description: "Aide aux membres", periodicite: "trimestriel", montant: 10000, userId: admin1.id },
      { nom: "Voyage spirituel", description: "Voyages a Touba", periodicite: "annuel", montant: 25000, userId: admin2.id },
    ]);

    for (let i = 0; i < 10; i++) {
      await PaiementCotisation.create({ typeCotisationId: 1, membreId: i + 1, montant: 5000, mois: 6, annee: 2026, modePaiement: i % 3 === 0 ? "wave" : "especes", confirmePar: admin1.id });
      await PaiementCotisation.create({ typeCotisationId: 3, membreId: i + 1, montant: 2000, mois: 6, annee: 2026, modePaiement: "orange_money", confirmePar: admin2.id });
      if (i < 5) {
        await PaiementCotisation.create({ typeCotisationId: 2, membreId: i + 1, montant: 15000, mois: 1, annee: 2026, modePaiement: i === 0 ? "cheque" : "especes", confirmePar: admin1.id });
      }
    }

    await Configuration.bulkCreate([
      { cle: "inscription_membre_debut", valeur: "2026-01-01" },
      { cle: "inscription_membre_fin", valeur: "2026-12-31" },
    ]);

    await Activite.create({ userId: req.user.id, action: "Seed base de donnees", details: "Reinitialisation et population avec donnees de demonstration" });

    res.json({
      message: "Base reinitialisee et peuplee avec succes",
      stats: {
        users: 3, localites: 6, membres: 10, formulaires: 2,
        evenements: 4, cotisations: cotisations.length, typesCotisation: 5,
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
