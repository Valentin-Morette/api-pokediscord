const AbstractManager = require("./AbstractManager");

class PokeballTrainerManager extends AbstractManager {
  static table = "pokeball_trainer";

  insert(pokeball, trainerId) {
    return this.connection.query(
      `insert into ${PokeballTrainerManager.table} (idPokeball, idTrainer, quantity) values (?, ?, ?)`,
      [pokeball.id, trainerId, pokeball.quantity]
    );
  }

  update(pokeballTrainer) {
    return this.connection.query(
      `update ${PokeballTrainerManager.table} set title = ? where id = ?`,
      [pokeballTrainer.title, pokeballTrainer.id]
    );
  }
}

module.exports = PokeballTrainerManager;
