const AbstractManager = require("./AbstractManager");

class PokemonTrainerManager extends AbstractManager {
  static table = "pokemon_trainer";

  find(idPokemon, idTrainer) {
    return this.connection.query(
      `select * from ${PokemonTrainerManager.table} where idPokemon = ? AND idTrainer = ?`,
      [idPokemon, idTrainer]
    );
  }

  insert(pokemonTrainer, quantity = 1) {
    return this.connection.query(
      `insert into ${PokemonTrainerManager.table} (idPokemon, idTrainer, isShiny, quantity) values (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?;`,
      [
        pokemonTrainer.idPokemon,
        pokemonTrainer.idTrainer,
        pokemonTrainer.isShiny,
        quantity,
        quantity,
      ]
    );
  }

  findQuantity(idPokemon, idTrainer, isShiny = false) {
    return this.connection.query(
      `select quantity from ${PokemonTrainerManager.table} where idPokemon = ? AND idTrainer = ? AND isShiny = ?`,
      [idPokemon, idTrainer, isShiny]
    );
  }

  updateDownQuantity(idPokemon, idTrainer, number, isShiny = false) {
    return this.connection.query(
      `update ${PokemonTrainerManager.table} set quantity = quantity - ? where idPokemon = ? AND idTrainer = ? AND quantity >= ? AND isShiny = ?`,
      [number, idPokemon, idTrainer, number, isShiny]
    );
  }

  countAndSumPokemonByTrainer(idTrainer, isShiny = false, generation = 1) {
    return this.connection.query(
      `SELECT COUNT(*) AS count, SUM(pt.quantity) AS sum 
       FROM ${PokemonTrainerManager.table} AS pt
       JOIN pokemon AS p ON pt.idPokemon = p.id 
       WHERE pt.idTrainer = ? 
         AND pt.quantity > 0 
         AND pt.isShiny = ? 
         AND p.generation = ?`,
      [idTrainer, isShiny, generation]
    );
  }

  findOnePokemonByTrainer(idTrainer, idPokemon, isShiny = false) {
    return this.connection.query(
      `select * from ${PokemonTrainerManager.table} where idTrainer = ? AND idPokemon = ? AND isShiny = ?`,
      [idTrainer, idPokemon, isShiny]
    );
  }
}

module.exports = PokemonTrainerManager;
