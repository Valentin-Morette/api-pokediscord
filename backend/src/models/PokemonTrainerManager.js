const AbstractManager = require("./AbstractManager");

class PokemonTrainerManager extends AbstractManager {
  static table = "pokemon_trainer";

  find(idPokemon, idTrainer) {
    return this.connection.query(
      `select * from ${PokemonTrainerManager.table} where idPokemon = ? AND idTrainer = ?`,
      [idPokemon, idTrainer]
    );
  }

  insert(pokemonTrainer) {
    return this.connection.query(
      `insert into ${PokemonTrainerManager.table} (idPokemon, idTrainer, isShiny, quantity) values (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1;`,
      [
        pokemonTrainer.idPokemon,
        pokemonTrainer.idTrainer,
        pokemonTrainer.isShiny,
      ]
    );
  }

  delete(idPokemon, idTrainer) {
    return this.connection.query(
      `delete from ${PokemonTrainerManager.table} where idPokemon = ? AND idTrainer = ?`,
      [idPokemon, idTrainer]
    );
  }

  updateQuantity(idPokemon, idTrainer, number) {
    return this.connection.query(
      `update ${PokemonTrainerManager.table} set quantity = quantity - ? where idPokemon = ? AND idTrainer = ? AND quantity >= ?`,
      [number, idPokemon, idTrainer, number]
    );
  }
}

module.exports = PokemonTrainerManager;
