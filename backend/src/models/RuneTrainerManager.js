const AbstractManager = require("./AbstractManager");

class RuneTrainerManager extends AbstractManager {
  static table = "rune_trainer";

  find(idPokemon, idTrainer) {
    return this.connection.query(
      `select * from ${RuneTrainerManager.table} where idPokemon = ? AND idTrainer = ?`,
      [idPokemon, idTrainer]
    );
  }

  findByPokemonName(name, idTrainer) {
    return this.connection.query(
      `SELECT * 
       FROM ${RuneTrainerManager.table} AS tp
       JOIN pokemon AS p ON tp.idPokemon = p.id
       WHERE p.name = ? AND tp.idTrainer = ?`,
      [name, idTrainer]
    );
  }

  insert(rune, quantity = 1) {
    return this.connection.query(
      `insert into ${RuneTrainerManager.table} (idPokemon, idTrainer, isShiny, quantity) values (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?;`,
      [rune.idPokemon, rune.idTrainer, rune.isShiny, quantity, quantity]
    );
  }

  updateDownQuantity(idPokemon, idTrainer, number) {
    return this.connection.query(
      `update ${RuneTrainerManager.table} set quantity = quantity - ? where idPokemon = ? AND idTrainer = ? AND quantity >= ?`,
      [number, idPokemon, idTrainer, number]
    );
  }
}

module.exports = RuneTrainerManager;
