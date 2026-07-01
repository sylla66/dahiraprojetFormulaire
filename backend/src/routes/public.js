const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { Evenement, Inscription, Membre, Formulaire, Localite, Cotisation, Notification, Configuration } = require("../models");

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

const inscrireLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives. Reessayez dans une minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/captcha", (req, res) => {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const answer = a + b;
  const token = signToken({ answer, expiresAt: Date.now() + 120000 });
  res.json({ question: `${a} + ${b} = ?`, token });
});

router.get("/evenements/:id", async (req, res) => {
  try {
    const evenement = await Evenement.findByPk(req.params.id, {
      include: [
        { model: Formulaire, as: "formulaireRef" },
        { model: Localite, as: "localiteRef" },
      ],
    });
    if (!evenement) return res.status(404).json({ error: "Evenement introuvable" });
    if (evenement.estCloture) return res.status(400).json({ error: "Evenement clos" });
    const now = new Date();
    if (evenement.dateDebutInscription && new Date(evenement.dateDebutInscription) > now) {
      return res.status(400).json({ error: "Inscriptions pas encore ouvertes", periode: "pas_encore" });
    }
    if (evenement.dateFinInscription && new Date(evenement.dateFinInscription) < now) {
      return res.status(400).json({ error: "Periode d'inscription terminee", periode: "terminee" });
    }

    const inscriptions = await Inscription.findAll({
      where: { evenementId: req.params.id },
      include: [{ model: Membre, as: "membreRef" }],
    });

    const inscritsMembreIds = inscriptions.map((i) => i.membreId);

    const membres = await Membre.findAll({
      where: { estActif: true },
      order: [["nom", "ASC"]],
    });

    const cotisations = await Cotisation.findAll({
      where: { evenementId: req.params.id },
    });
    const totalCotise = cotisations.reduce((s, c) => s + parseFloat(c.montant || 0), 0);
    const objectif = evenement.montantObjectif || 0;

    res.json({
      evenement: {
        id: evenement.id,
        titre: evenement.titre,
        description: evenement.description,
        dateEvenement: evenement.dateEvenement,
        dateDebutInscription: evenement.dateDebutInscription,
        dateFinInscription: evenement.dateFinInscription,
        lieu: evenement.lieu,
        localite: evenement.localiteRef?.nom || "",
        montantObjectif: objectif,
        montantMinimum: Math.round(evenement.montantMinimum || 0),
        totalCotise,
        progression: objectif > 0 ? Math.min(Math.round((totalCotise / objectif) * 100), 100) : 0,
      },
      membres: membres.map((m) => ({
        id: m.id,
        nom: m.nom,
        prenom: m.prenom,
        telephone: m.telephone,
        dejaInscrit: inscritsMembreIds.includes(m.id),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/inscrire", inscrireLimiter, async (req, res) => {
  try {
    const { evenementId, membreId, captchaToken, captchaAnswer } = req.body;

    const payload = verifyToken(captchaToken);
    if (!payload) return res.status(400).json({ error: "Captcha invalide ou trafique" });
    if (Date.now() > payload.expiresAt) return res.status(400).json({ error: "Captcha expire. Rechargez la page." });
    if (parseInt(captchaAnswer) !== payload.answer) return res.status(400).json({ error: "Reponse captcha incorrecte" });

    const evenement = await Evenement.findByPk(evenementId);
    if (!evenement) return res.status(404).json({ error: "Evenement introuvable" });
    if (evenement.estCloture) return res.status(400).json({ error: "Evenement clos" });
    const now = new Date();
    if (evenement.dateDebutInscription && new Date(evenement.dateDebutInscription) > now) {
      return res.status(400).json({ error: "Inscriptions pas encore ouvertes" });
    }
    if (evenement.dateFinInscription && new Date(evenement.dateFinInscription) < now) {
      return res.status(400).json({ error: "Periode d'inscription terminee" });
    }

    const existing = await Inscription.findOne({
      where: { evenementId, membreId },
    });
    if (existing) return res.status(400).json({ error: "Deja inscrit a cet evenement" });

    const membre = await Membre.findByPk(membreId);
    if (!membre) return res.status(404).json({ error: "Membre introuvable" });

    const inscription = await Inscription.create({
      evenementId,
      membreId,
      donneesJson: "{}",
    });

    await Notification.create({
      message: `${membre.prenom} ${membre.nom} s'est inscrit a "${evenement.titre}"`,
      lien: `/admin/evenements/${evenement.id}/gerer`,
    });

    res.status(201).json({
      message: `Inscription reussie ! ${membre.prenom} ${membre.nom} est inscrit a "${evenement.titre}".`,
      inscription: {
        id: inscription.id,
        membre: `${membre.prenom} ${membre.nom}`,
        evenement: { id: evenement.id, titre: evenement.titre },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const membreLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Reessayez dans une heure." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/config/membre", async (req, res) => {
  try {
    const configs = await Configuration.findAll({ where: { cle: ["dateDebutInscriptionMembre", "dateFinInscriptionMembre"] } });
    const configMap = {};
    configs.forEach((c) => { configMap[c.cle] = c.valeur; });
    const now = new Date();
    const debut = configMap.dateDebutInscriptionMembre ? new Date(configMap.dateDebutInscriptionMembre) : null;
    const fin = configMap.dateFinInscriptionMembre ? new Date(configMap.dateFinInscriptionMembre) : null;
    let statut = "ouvert";
    let message = "";
    if (debut && fin) {
      if (now < debut) { statut = "pas_encore"; message = "Les inscriptions membres ne sont pas encore ouvertes."; }
      else if (now > fin) { statut = "termine"; message = "La periode d'inscription membres est terminee."; }
    } else if (debut && now < debut) { statut = "pas_encore"; message = "Les inscriptions membres ne sont pas encore ouvertes."; }
    else if (fin && now > fin) { statut = "termine"; message = "La periode d'inscription membres est terminee."; }
    res.json({ statut, message, dateDebut: configMap.dateDebutInscriptionMembre || null, dateFin: configMap.dateFinInscriptionMembre || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/localites", async (req, res) => {
  try {
    const localites = await Localite.findAll({ order: [["nom", "ASC"]] });
    res.json(localites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/membres", membreLimiter, async (req, res) => {
  try {
    const { nom, prenom, telephone, email, localiteId, adresse, profession, captchaToken, captchaAnswer } = req.body;

    const payload = verifyToken(captchaToken);
    if (!payload) return res.status(400).json({ error: "Captcha invalide ou trafique" });
    if (Date.now() > payload.expiresAt) return res.status(400).json({ error: "Captcha expire. Rechargez la page." });
    if (parseInt(captchaAnswer) !== payload.answer) return res.status(400).json({ error: "Reponse captcha incorrecte" });

    if (!nom || !prenom || !telephone) {
      return res.status(400).json({ error: "Nom, prenom et telephone obligatoires" });
    }

    const configs = await Configuration.findAll({ where: { cle: ["dateDebutInscriptionMembre", "dateFinInscriptionMembre"] } });
    const configMap = {};
    configs.forEach((c) => { configMap[c.cle] = c.valeur; });
    const now = new Date();
    if (configMap.dateDebutInscriptionMembre && new Date(configMap.dateDebutInscriptionMembre) > now) {
      return res.status(400).json({ error: "Les inscriptions membres ne sont pas encore ouvertes", periode: "pas_encore" });
    }
    if (configMap.dateFinInscriptionMembre && new Date(configMap.dateFinInscriptionMembre) < now) {
      return res.status(400).json({ error: "La periode d'inscription membres est terminee", periode: "terminee" });
    }

    const existant = await Membre.findOne({ where: { telephone } });
    if (existant) return res.status(400).json({ error: "Un membre avec ce telephone existe deja" });

    const membre = await Membre.create({ nom, prenom, telephone, email, localiteId, adresse, profession });

    await Notification.create({
      message: `Nouveau membre inscrit: ${prenom} ${nom} (${telephone})`,
      lien: `/admin/membres`,
    });

    res.status(201).json({
      message: `Inscription reussie ! Bienvenue ${prenom} ${nom}.`,
      membre: { id: membre.id, nom: membre.nom, prenom: membre.prenom, telephone: membre.telephone },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
