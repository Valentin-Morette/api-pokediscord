const AbstractManager = require("./AbstractManager");

class TrainerManager extends AbstractManager {
  static table = "trainer";

  insert(trainer) {
    return this.connection.query(
      `insert into ${TrainerManager.table} (id,idDiscord, name, money, point, level) values (?, ?, ?, ?, ?, ?)`,
      [
        trainer.id,
        trainer.idDiscord,
        trainer.name,
        trainer.money,
        trainer.point,
        trainer.level,
      ]
    );
  }

  update(trainer) {
    return this.connection.query(
      `update ${TrainerManager.table} set idDiscord = ?, name = ?, money = ?, point = ?, level = ? where id = ?`,
      [
        trainer.idDiscord,
        trainer.name,
        trainer.money,
        trainer.point,
        trainer.level,
        trainer.id,
      ]
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
}

module.exports = TrainerManager;
