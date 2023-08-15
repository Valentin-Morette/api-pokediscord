const AbstractManager = require("./AbstractManager");

class PokemonManager extends AbstractManager {
  static table = "Pokemon";

  insert(pokemon) {
    return this.connection.query(
      `insert into ${PokemonManager.table} (title) values (?)`,
      [pokemon.title]
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
