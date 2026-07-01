const express = require("express");
const { Notification, Evenement, Membre, Inscription } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: notifications, count } = await Notification.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({ notifications, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/non-lues", async (req, res) => {
  try {
    const count = await Notification.count({ where: { estLue: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/lire", async (req, res) => {
  try {
    await Notification.update({ estLue: true }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/lire-toutes", async (req, res) => {
  try {
    await Notification.update({ estLue: true }, { where: { estLue: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
