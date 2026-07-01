const express = require("express");
const PDFDocument = require("pdfkit");
const { TypeCotisation, PaiementCotisation, Membre, Localite, User, Activite, Notification } = require("../models");
const { auth, adminRequired, superAdminRequired } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

function drawTable(doc, headers, rows, startY) {
  const colWidths = headers.map((h) => h.width);
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const margin = 40;
  const left = margin;
  const rowH = 18;
  let y = startY;

  const drawHeader = () => {
    doc.fontSize(9).font("Helvetica-Bold");
    let x = left;
    headers.forEach((h, i) => {
      doc.text(h.label, x + 3, y + 4, { width: colWidths[i] - 6, align: "left" });
      x += colWidths[i];
    });
    y += rowH;
    doc.lineWidth(1).moveTo(left, y).lineTo(left + totalW, y).stroke();
    y += 4;
  };

  const drawRow = (cells) => {
    if (y + rowH > 770) {
      doc.addPage();
      y = 50;
      drawHeader();
    }
    doc.font("Helvetica").fontSize(8.5);
    let x = left;
    cells.forEach((cell, i) => {
      doc.text(String(cell), x + 3, y + 4, { width: colWidths[i] - 6, align: "left" });
      x += colWidths[i];
    });
    y += rowH;
    doc.lineWidth(0.5).moveTo(left, y).lineTo(left + totalW, y).stroke();
    y += 2;
  };

  drawHeader();
  rows.forEach(drawRow);
  return y;
}

router.get("/types", auth, adminRequired, async (req, res) => {
  try {
    const where = req.user.estSuperAdmin() ? {} : { userId: req.user.id };
    const types = await TypeCotisation.findAll({ where, order: [["nom", "ASC"]] });
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/types", auth, adminRequired, async (req, res) => {
  try {
    const { nom, description, periodicite, montant } = req.body;
    const type = await TypeCotisation.create({ nom, description, periodicite, montant: montant || 0, userId: req.user.id });
    await Activite.create({ userId: req.user.id, action: "Creation type cotisation", details: nom });
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/types/:id", auth, adminRequired, async (req, res) => {
  try {
    const type = await TypeCotisation.findByPk(req.params.id);
    if (!type) return res.status(404).json({ error: "Introuvable" });
    if (!req.user.estSuperAdmin() && type.userId !== req.user.id) return res.status(403).json({ error: "Acces refuse" });
    const { nom, description, periodicite, montant, estActif } = req.body;
    await type.update({ nom, description, periodicite, montant, estActif });
    await Activite.create({ userId: req.user.id, action: "Modification type cotisation", details: type.nom });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/types/:id", auth, adminRequired, async (req, res) => {
  try {
    const type = await TypeCotisation.findByPk(req.params.id);
    if (!type) return res.status(404).json({ error: "Introuvable" });
    if (!req.user.estSuperAdmin() && type.userId !== req.user.id) return res.status(403).json({ error: "Acces refuse" });
    await type.destroy();
    await Activite.create({ userId: req.user.id, action: "Suppression type cotisation", details: type.nom });
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/types/:id/paiements", auth, adminRequired, async (req, res) => {
  try {
    const paiements = await PaiementCotisation.findAll({
      where: { typeCotisationId: req.params.id },
      include: [
        { model: Membre, as: "membreRef" },
        { model: User, as: "valideur", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["datePaiement", "DESC"]],
    });
    const total = paiements.reduce((s, p) => s + p.montant, 0);
    res.json({ paiements, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/paiements", auth, adminRequired, async (req, res) => {
  try {
    const { typeCotisationId, membreId, montant, mois, annee, modePaiement, notes } = req.body;
    const now = new Date();
    const paiement = await PaiementCotisation.create({
      typeCotisationId, membreId, montant,
      mois: mois || now.getMonth() + 1,
      annee: annee || now.getFullYear(),
      modePaiement: modePaiement || "especes",
      confirmePar: req.user.id, notes,
    });
    const type = await TypeCotisation.findByPk(typeCotisationId);
    const membre = await Membre.findByPk(membreId);
    await Activite.create({
      userId: req.user.id, action: "Paiement cotisation",
      details: `${membre?.prenom} ${membre?.nom} - ${montant}F - ${type?.nom}`,
    });
    res.status(201).json(paiement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/paiements/:id", auth, adminRequired, async (req, res) => {
  try {
    const paiement = await PaiementCotisation.findByPk(req.params.id);
    if (!paiement) return res.status(404).json({ error: "Introuvable" });
    await paiement.destroy();
    res.json({ message: "Supprime" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/membres/:id/paiements", auth, adminRequired, async (req, res) => {
  try {
    const paiements = await PaiementCotisation.findAll({
      where: { membreId: req.params.id },
      include: [
        { model: TypeCotisation, as: "typeRef" },
        { model: User, as: "valideur", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["datePaiement", "DESC"]],
    });
    const total = paiements.reduce((s, p) => s + p.montant, 0);
    res.json({ paiements, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/paiements/recents", auth, adminRequired, async (req, res) => {
  try {
    const paiements = await PaiementCotisation.findAll({
      include: [
        { model: Membre, as: "membreRef" },
        { model: TypeCotisation, as: "typeRef" },
      ],
      order: [["datePaiement", "DESC"]],
      limit: 50,
    });
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", auth, adminRequired, async (req, res) => {
  try {
    const types = await TypeCotisation.findAll({ where: req.user.estSuperAdmin() ? {} : { userId: req.user.id } });
    const stats = [];
    for (const t of types) {
      const paiements = await PaiementCotisation.findAll({ where: { typeCotisationId: t.id } });
      const total = paiements.reduce((s, p) => s + p.montant, 0);
      stats.push({ id: t.id, nom: t.nom, total, nbPaiements: paiements.length });
    }
    const grandTotal = stats.reduce((s, st) => s + st.total, 0);
    res.json({ stats, grandTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/:typeId", auth, adminRequired, async (req, res) => {
  try {
    const type = await TypeCotisation.findByPk(req.params.typeId);
    if (!type) return res.status(404).json({ error: "Introuvable" });

    const paiements = await PaiementCotisation.findAll({
      where: { typeCotisationId: req.params.typeId },
      include: [
        { model: Membre, as: "membreRef" },
        { model: User, as: "valideur", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["datePaiement", "DESC"]],
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cotisations-${type.nom.replace(/[^a-z0-9]/gi, "-")}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text(type.nom, { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`Periode: ${type.periodicite}`, { align: "center" })
      .text(`Edite le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown(1);
    if (type.description) doc.fontSize(9).text(type.description, { align: "center" });
    doc.moveDown(1);

    const headers = [
      { label: "N°", width: 25 },
      { label: "Membre", width: 170 },
      { label: "Montant", width: 80 },
      { label: "Mois/Annee", width: 80 },
      { label: "Mode", width: 85 },
    ];

    const rows = paiements.map((p, idx) => [
      idx + 1,
      `${p.membreRef?.prenom || ""} ${p.membreRef?.nom || ""}`,
      `${p.montant.toLocaleString()} F`,
      `${p.mois || "-"}/${p.annee || "-"}`,
      p.modePaiement || "-",
    ]);

    drawTable(doc, headers, rows, doc.y + 10);
    doc.moveDown(1);
    const total = paiements.reduce((s, p) => s + p.montant, 0);
    doc.fontSize(10).font("Helvetica-Bold")
      .text(`Total: ${total.toLocaleString()} FCFA`, { align: "right" })
      .text(`Paiements: ${paiements.length}`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export-membre/:membreId", auth, adminRequired, async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.membreId);
    if (!membre) return res.status(404).json({ error: "Introuvable" });

    const paiements = await PaiementCotisation.findAll({
      where: { membreId: req.params.membreId },
      include: [{ model: TypeCotisation, as: "typeRef" }],
      order: [["datePaiement", "DESC"]],
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cotisations-${membre.prenom}-${membre.nom}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text(`Cotisations - ${membre.prenom} ${membre.nom}`, { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`Telephone: ${membre.telephone || "-"}`, { align: "center" })
      .text(`Edite le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown(1);

    const headers = [
      { label: "N°", width: 25 },
      { label: "Type cotisation", width: 150 },
      { label: "Montant", width: 80 },
      { label: "Mois/Annee", width: 80 },
      { label: "Mode", width: 85 },
    ];

    const rows = paiements.map((p, idx) => [
      idx + 1,
      p.typeRef?.nom || "-",
      `${p.montant.toLocaleString()} F`,
      `${p.mois || "-"}/${p.annee || "-"}`,
      p.modePaiement || "-",
    ]);

    drawTable(doc, headers, rows, doc.y + 10);
    doc.moveDown(1);
    const total = paiements.reduce((s, p) => s + p.montant, 0);
    doc.fontSize(10).font("Helvetica-Bold")
      .text(`Total: ${total.toLocaleString()} FCFA`, { align: "right" })
      .text(`Paiements: ${paiements.length}`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
