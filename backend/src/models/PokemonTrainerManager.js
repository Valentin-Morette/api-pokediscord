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

  delete(idPokemon, idTrainer) {
    return this.connection.query(
      `delete from ${PokemonTrainerManager.table} where idPokemon = ? AND idTrainer = ?`,
      [idPokemon, idTrainer]
    );
  }

  updateDownQuantity(idPokemon, idTrainer, number) {
    return this.connection.query(
      `update ${PokemonTrainerManager.table} set quantity = quantity - ? where idPokemon = ? AND idTrainer = ? AND quantity >= ?`,
      [number, idPokemon, idTrainer, number]
    );
  }

  countAndSumPokemonByTrainer(idTrainer) {
    return this.connection.query(
      `select count(*) as count, sum(quantity) as sum from ${PokemonTrainerManager.table} where idTrainer = ?`,
      [idTrainer]
    );
  }

  findOnePokemonByTrainer(idTrainer, idPokemon) {
    return this.connection.query(
      `select * from ${PokemonTrainerManager.table} where idTrainer = ? AND idPokemon = ?`,
      [idTrainer, idPokemon]
    );
  }
}

module.exports = PokemonTrainerManager;
