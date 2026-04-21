const fs = require("fs");
const mysql = require("mysql2/promise");
const path = require("path");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_NAME_USER } = process.env;
const DB_PORT = process.env.DB_PORT || 3306;

const createPool = (databaseName) =>
  mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD ?? "",
    database: databaseName,
    port: DB_PORT,
  });

const pools = {
  main: createPool(DB_NAME),
  user: createPool(DB_NAME_USER || DB_NAME),
};

const checkConnection = (pool, label) =>
  pool
    .getConnection()
    .then((connection) => connection.release())
    .catch((err) => {
      console.warn(
        "Warning:",
        `Failed to get a ${label} DB connection.`,
        "Did you create a .env file with valid credentials?",
        "Routes using models won't work as intended",
        err.message
      );
    });

checkConnection(pools.main, "main");
checkConnection(pools.user, "user");

if (!DB_NAME_USER) {
  console.warn(
    "Warning:",
    "DB_NAME_USER is not set.",
    "User DB managers will fallback to DB_NAME."
  );
}

const models = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "AbstractManager.js" && file !== "index.js")
  .reduce((acc, file) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const Manager = require(path.join(__dirname, file));
    const dbName = Manager.dbName || "main";
    const connection = pools[dbName];

    if (!connection) {
      throw new Error(
        `Unknown dbName "${dbName}" on ${file}. Use one of: ${Object.keys(
          pools
        ).join(", ")}`
      );
    }

    // eslint-disable-next-line no-param-reassign
    acc[Manager.table] = new Manager(connection, Manager.table);

    return acc;
  }, {});

models.$db = pools;

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
