const AbstractManager = require("./AbstractManager");

class TrainerManager extends AbstractManager {
  static table = "trainer";

  insert(trainer) {
    return this.connection.query(
      `insert into ${TrainerManager.table} (id,idDiscord, name, money, hasFirstCatch) values (?, ?, ?, ?, 0)`,
      [trainer.id, trainer.idDiscord, trainer.name, trainer.money]
    );
  }

  updateFirstCatch(id) {
    return this.connection.query(
      `update ${TrainerManager.table} set hasFirstCatch = 1 where idDiscord = ?`,
      [id]
    );
  }

  updateMoney(id, money) {
    return this.connection.query(
      `update ${TrainerManager.table} set money = money + ? where idDiscord = ?`,
      [money, id]
    );
  }

  verifyIdDiscord(idDiscord) {
    return this.connection.query(
      `select * from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }

  find(idDiscord) {
    return this.connection.query(
      `select * from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }

  findHasFirstCatch(idDiscord) {
    return this.connection.query(
      `select hasFirstCatch from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }

  delete(idDiscord) {
    return this.connection.query(
      `delete from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }
}

module.exports = TrainerManager;
