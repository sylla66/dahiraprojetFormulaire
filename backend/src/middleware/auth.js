const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Acces non autorise" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Compte inactif ou introuvable" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

const adminRequired = (req, res, next) => {
  if (!req.user.estAdmin() && !req.user.estSuperAdmin()) {
    return res.status(403).json({ error: "Acces reserve aux administrateurs" });
  }
  next();
};

const superAdminRequired = (req, res, next) => {
  if (!req.user.estSuperAdmin()) {
    return res.status(403).json({ error: "Acces reserve au super administrateur" });
  }
  next();
};

module.exports = { auth, adminRequired, superAdminRequired };
