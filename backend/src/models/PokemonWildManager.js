const AbstractManager = require("./AbstractManager");

class PokemonWildManager extends AbstractManager {
  static table = "pokemon_wild";

  insert(pokemonWild) {
    return this.connection.query(
      `insert into ${PokemonWildManager.table} (idPokemon, dateAppear, isShiny, isEscape, isCatch) values (?, ?, ?, ?, ?)`,
      [
        pokemonWild.idPokemon,
        pokemonWild.dateAppear,
        pokemonWild.isShiny,
        pokemonWild.isEscape,
        pokemonWild.isCatch,
      ]
    );
  }

  getById(id) {
    return this.connection.query(
      `select * from ${PokemonWildManager.table} where id = ?`,
      [id]
    );
  }

  updateById(id, isCatch, isEscape) {
    return this.connection.query(
      `update ${PokemonWildManager.table} set isCatch = ?, isEscape = ? where id = ?`,
      [isCatch, isEscape, id]
    );
  }

  deleteByDate(date) {
    return this.connection.query(
      `delete from ${PokemonWildManager.table} where dateAppear < ?`,
      [date]
    );
  }
}

module.exports = PokemonWildManager;
