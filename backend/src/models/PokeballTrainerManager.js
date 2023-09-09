const AbstractManager = require("./AbstractManager");

class PokeballTrainerManager extends AbstractManager {
  static table = "pokeball_trainer";

  insert(idBall, trainerId, quantity) {
    return this.connection.query(
      `insert into ${PokeballTrainerManager.table} (idPokeball, idTrainer, quantity) values (?, ?, ?)`,
      [idBall, trainerId, quantity]
    );
  }

  insertMany(idBall, trainerId, quantity) {
    return this.connection.query(
      `insert into ${PokeballTrainerManager.table} (idPokeball, idTrainer, quantity) values (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [idBall, trainerId, quantity, quantity]
    );
  }

  updateQuantity(idBall, idTrainer, number) {
    return this.connection.query(
      `update ${PokeballTrainerManager.table} set quantity = quantity - ? where idPokeball = ? AND idTrainer = ? AND quantity >= ?`,
      [number, idBall, idTrainer, number]
    );
  }
}

module.exports = PokeballTrainerManager;
