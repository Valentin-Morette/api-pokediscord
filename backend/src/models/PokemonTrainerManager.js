const AbstractManager = require("./AbstractManager");

class PokemonTrainerManager extends AbstractManager {
  static table = "pokemon_trainer";

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

  updateQuantity(idBall, idTrainer) {
    return this.connection.query(
      `update ${PokemonTrainerManager.table} set quantity = quantity - 1 WHERE idPokemon = ? AND idTrainer = ? AND quantity > 0`,
      [idBall, idTrainer]
    );
  }
}

module.exports = PokemonTrainerManager;
