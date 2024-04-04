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

  updateDownQuantity(idPokemon, idTrainer, number, isShiny = false) {
    return this.connection.query(
      `update ${PokemonTrainerManager.table} set quantity = quantity - ? where idPokemon = ? AND idTrainer = ? AND quantity >= ? AND isShiny = ?`,
      [number, idPokemon, idTrainer, number, isShiny]
    );
  }

  countAndSumPokemonByTrainer(idTrainer, isShiny = false) {
    return this.connection.query(
      `select count(*) as count, sum(quantity) as sum from ${PokemonTrainerManager.table} where idTrainer = ? and quantity > 0 AND isShiny = ?`,
      [idTrainer, isShiny]
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
