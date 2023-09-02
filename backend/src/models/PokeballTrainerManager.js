const AbstractManager = require("./AbstractManager");

class PokeballTrainerManager extends AbstractManager {
  static table = "pokeball_trainer";

  insert(pokeball, trainerId) {
    return this.connection.query(
      `insert into ${PokeballTrainerManager.table} (idPokeball, idTrainer, quantity) values (?, ?, ?)`,
      [pokeball.id, trainerId, pokeball.quantity]
    );
  }

  updateQuantity(idBall, idTrainer) {
    return this.connection.query(
      `update ${PokeballTrainerManager.table} set quantity = quantity - 1 WHERE idPokeball = ? AND idTrainer = ? AND quantity > 0`,
      [idBall, idTrainer]
    );
  }
}

module.exports = PokeballTrainerManager;
