const AbstractManager = require("./AbstractManager");

class PokemonManager extends AbstractManager {
  static table = "Pokemon";

  insert(pokemon) {
    return this.connection.query(
      `insert into ${PokemonManager.table} (id, name, type1, type2, generation, img, sellPrice, catchRate, escapeRate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pokemon.id,
        pokemon.name,
        pokemon.type1,
        pokemon.type2,
        pokemon.generation,
        pokemon.img,
        pokemon.sellPrice,
        pokemon.catchRate,
        pokemon.escapeRate,
      ]
    );
  }

  update(pokemon) {
    return this.connection.query(
      `update ${PokemonManager.table} set title = ? where id = ?`,
      [pokemon.title, pokemon.id]
    );
  }
}

module.exports = PokemonManager;
