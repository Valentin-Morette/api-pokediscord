const AbstractManager = require("./AbstractManager");

class TrainerManager extends AbstractManager {
  static table = "trainer";

  insert(trainer) {
    return this.connection.query(
      `insert into ${TrainerManager.table} (id, name, money, point, level) values (?, ?, ?, ?, ?)`,
      [trainer.id, trainer.name, trainer.money, trainer.point, trainer.level]
    );
  }

  update(trainer) {
    return this.connection.query(
      `update ${TrainerManager.table} set name = ?, money = ?, point = ?, level = ? where id = ?`,
      [trainer.name, trainer.money, trainer.point, trainer.level, trainer.id]
    );
  }
}

module.exports = TrainerManager;
