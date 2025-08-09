const AbstractManager = require("./AbstractManager");

class BugsIdeasManager extends AbstractManager {
  static table = "bugs_ideas";

  findById(id) {
    return this.connection.query(
      `SELECT * FROM ${BugsIdeasManager.table} WHERE id = ?`,
      [id]
    );
  }

  findLastByTrainer(idTrainer, type) {
    return this.connection.query(
      `SELECT * FROM ${BugsIdeasManager.table}
       WHERE idTrainer = ? AND type = ?
       ORDER BY createDate DESC
       LIMIT 1`,
      [idTrainer, type]
    );
  }

  insert(bugsIdeas) {
    return this.connection.query(
      `insert into ${BugsIdeasManager.table} (type, idTrainer, message) values (?, ?, ?)`,
      [bugsIdeas.type, bugsIdeas.idTrainer, bugsIdeas.message]
    );
  }
}

module.exports = BugsIdeasManager;
