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

  findAllByTrainer(idTrainer) {
    return this.connection.query(
      `SELECT rt.quantity,p.name FROM ${RuneTrainerManager.table}
       rt JOIN pokemon p ON rt.idPokemon = p.id
       WHERE rt.idTrainer = ?
       AND rt.quantity > 0`,
      [idTrainer]
    );
  }

  countAndSumRuneByTrainer(idTrainer) {
    return this.connection.query(
      `SELECT count(*) as count, sum(quantity) as sum FROM ${RuneTrainerManager.table} WHERE idTrainer = ? and quantity > 0`,
      [idTrainer]
    );
  }

  insertRune(rune, quantity = 1) {
    return this.connection.query(
      `insert into ${RuneTrainerManager.table} (idPokemon, idTrainer, quantity) values (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?;`,
      [rune.idPokemon, rune.idTrainer, quantity, quantity]
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
