const express = require("express");
const PDFDocument = require("pdfkit");
const { Evenement, Inscription, Membre, Cotisation, Localite } = require("../models");

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
    doc.lineWidth(0.5)
      .moveTo(left, y)
      .lineTo(left + totalW, y)
      .stroke();
    y += 2;
  };

  drawHeader();
  rows.forEach(drawRow);
  return y;
}

router.get("/evenements/:id/inscrits", async (req, res) => {
  try {
    const evenement = await Evenement.findByPk(req.params.id);
    if (!evenement) return res.status(404).json({ error: "Evenement introuvable" });

    const inscriptions = await Inscription.findAll({
      where: { evenementId: req.params.id },
      include: [{ model: Membre, as: "membreRef" }],
      order: [[{ model: Membre, as: "membreRef" }, "nom", "ASC"]],
    });

    const cotisations = await Cotisation.findAll({
      where: { evenementId: req.params.id },
    });

    const cotiseIds = cotisations.map((c) => c.membreId);
    const totalCotisations = cotisations.reduce((s, c) => s + parseFloat(c.montant || 0), 0);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="inscrits-${evenement.titre.replace(/[^a-z0-9]/gi, "-")}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text(evenement.titre, { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`Date: ${new Date(evenement.dateEvenement).toLocaleDateString("fr-FR")}`, { align: "center" });
    if (evenement.lieu) doc.text(`Lieu: ${evenement.lieu}`, { align: "center" });
    doc.moveDown(1);

    const headers = [
      { label: "N°", width: 25 },
      { label: "Nom & Prenom", width: 170 },
      { label: "Telephone", width: 110 },
      { label: "Statut", width: 70 },
      { label: "Montant", width: 75 },
    ];

    const rows = inscriptions.map((ins, idx) => {
      const c = cotisations.find((co) => co.membreId === ins.membreId);
      return [
        idx + 1,
        `${ins.membreRef?.prenom || ""} ${ins.membreRef?.nom || ""}`,
        ins.membreRef?.telephone || "-",
        c ? "Cotise" : "En attente",
        c ? `${parseFloat(c.montant).toLocaleString()} F` : "-",
      ];
    });

    drawTable(doc, headers, rows, doc.y + 10);

    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica-Bold")
      .text(`Total cotisations: ${totalCotisations.toLocaleString()} FCFA`, { align: "right" })
      .text(`Inscrits: ${inscriptions.length}  |  Cotisants: ${cotisations.length}`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/membres", async (req, res) => {
  try {
    const membres = await Membre.findAll({
      include: [{ model: Localite, as: "localiteRef" }],
      order: [["nom", "ASC"]],
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=annuaire-membres.pdf");
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("Annuaire des membres", { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`Edite le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown(1);

    const headers = [
      { label: "N°", width: 25 },
      { label: "Nom & Prenom", width: 170 },
      { label: "Telephone", width: 130 },
      { label: "Localite", width: 125 },
    ];

    const rows = membres.map((m, idx) => [
      idx + 1,
      `${m.prenom || ""} ${m.nom}`,
      m.telephone || "-",
      m.localiteRef?.nom || "-",
    ]);

    drawTable(doc, headers, rows, doc.y + 10);
    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica-Bold").text(`Total: ${membres.length} membres`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
