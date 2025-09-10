const AbstractManager = require("./AbstractManager");

class LogManager extends AbstractManager {
  static table = "logs";

  async insert(log) {
    const { idServer, idDiscord, type, category, message } = log;

    const [result] = await this.connection.query(
      `INSERT INTO ${this.table} (idServer, idDiscord, type, category, message, timestamp) VALUES (?, ?, ?, ?, ?, NOW())`,
      [idServer, idDiscord, type, category, message]
    );

    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.connection.query(
      `SELECT 
        l.*,
        t.name AS trainerName,
        s.name AS serverName
      FROM ${this.table} l
      LEFT JOIN trainer t ON l.idDiscord = t.idDiscord
      LEFT JOIN servers s ON l.idServer = s.idServer
      ORDER BY l.timestamp DESC`
    );

    return rows;
  }

  async findByServer(idServer) {
    const [rows] = await this.connection.query(
      `SELECT 
        l.*,
        t.name AS trainerName,
        s.name AS serverName
      FROM ${this.table} l
      LEFT JOIN trainer t ON l.idDiscord = t.idDiscord
      LEFT JOIN servers s ON l.idServer = s.idServer
      WHERE l.idServer = ? 
      ORDER BY l.timestamp DESC`,
      [idServer]
    );

    return rows;
  }

  async findByDiscord(idDiscord) {
    const [rows] = await this.connection.query(
      `SELECT 
        l.*,
        t.name AS trainerName,
        s.name AS serverName
      FROM ${this.table} l
      LEFT JOIN trainer t ON l.idDiscord = t.idDiscord
      LEFT JOIN servers s ON l.idServer = s.idServer
      WHERE l.idDiscord = ? 
      ORDER BY l.timestamp DESC`,
      [idDiscord]
    );

    return rows;
  }

  async findByType(type) {
    const [rows] = await this.connection.query(
      `SELECT 
        l.*,
        t.name AS trainerName,
        s.name AS serverName
      FROM ${this.table} l
      LEFT JOIN trainer t ON l.idDiscord = t.idDiscord
      LEFT JOIN servers s ON l.idServer = s.idServer
      WHERE l.type = ? 
      ORDER BY l.timestamp DESC`,
      [type]
    );

    return rows;
  }

  async findByCategory(category) {
    const [rows] = await this.connection.query(
      `SELECT 
        l.*,
        t.name AS trainerName,
        s.name AS serverName
      FROM ${this.table} l
      LEFT JOIN trainer t ON l.idDiscord = t.idDiscord
      LEFT JOIN servers s ON l.idServer = s.idServer
      WHERE l.category = ? 
      ORDER BY l.timestamp DESC`,
      [category]
    );

    return rows;
  }
}

module.exports = LogManager;
