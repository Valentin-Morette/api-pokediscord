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
    const date = new Date();
    return this.connection.query(
      `insert into ${BugsIdeasManager.table} (type, idTrainer, message, createDate) values (?, ?, ?, ?)`,
      [bugsIdeas.type, bugsIdeas.idTrainer, bugsIdeas.message, date]
    );
  }

  delete(id) {
    return this.connection.query(
      `DELETE FROM ${BugsIdeasManager.table} WHERE id = ?`,
      [id]
    );
  }

  update(id, status) {
    return this.connection.query(
      `UPDATE ${BugsIdeasManager.table} SET status = ? WHERE id = ?`,
      [status, id]
    );
  }
}

module.exports = BugsIdeasManager;
