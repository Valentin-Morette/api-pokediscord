const fs = require("fs");
const mysql = require("mysql2/promise");
const path = require("path");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_TIMEZONE } = process.env;
const DB_PORT = process.env.DB_PORT || 3306;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD ?? "",
  database: DB_NAME,
  port: DB_PORT,
  timezone: DB_TIMEZONE || '+02:00', // Fuseau horaire configurable (à changer manuellement lors des changements d'heure)
});

pool.getConnection().catch((err) => {
  console.warn(
    "Warning:",
    "Failed to get a DB connection.",
    "Did you create a .env file with valid credentials?",
    "Routes using models won't work as intended",
    err.message
  );
});

const models = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "AbstractManager.js" && file !== "index.js")
  .reduce((acc, file) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const Manager = require(path.join(__dirname, file));

    // eslint-disable-next-line no-param-reassign
    acc[Manager.table] = new Manager(pool, Manager.table);

    return acc;
  }, {});

const handler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }

    const pascalize = (string) =>
      string.slice(0, 1).toUpperCase() + string.slice(1);

    throw new ReferenceError(
      `models.${prop} is not defined. Did you create ${pascalize(
        prop
      )}Manager.js?`
    );
  },
};

module.exports = new Proxy(models, handler);
