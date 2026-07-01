const { Sequelize } = require("sequelize");
const path = require("path");

const dbPath = process.env.DB_PATH || "./dahira.db";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "../..", dbPath),
  logging: false,
  dialectOptions: {
    // Use sql.js for pure JS SQLite (no native compilation needed)
  },
  define: {
    freezeTableName: true,
  },
});

module.exports = sequelize;
