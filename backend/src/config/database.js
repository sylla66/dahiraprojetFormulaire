const { Sequelize } = require("sequelize");

const isSqlite = !process.env.DATABASE_URL;

let sequelize;

if (isSqlite) {
  const path = require("path");
  const dbPath = process.env.DB_PATH || "./dahira.db";
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.resolve(__dirname, "../..", dbPath),
    logging: false,
    define: { freezeTableName: true },
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: { freezeTableName: true },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
