const AbstractManager = require("./AbstractManager");

class PokemonWildManager extends AbstractManager {
  static table = "pokemon_wild";

  insert(pokemonWild) {
    return this.connection.query(
      `insert into ${PokemonWildManager.table} (idPokemon, dateAppear, catchCode, isEscape, isCatch) values (?, ?, ?, ?, ?)`,
      [
        pokemonWild.idPokemon,
        pokemonWild.dateAppear,
        pokemonWild.catchCode,
        pokemonWild.isEscape,
        pokemonWild.isCatch,
      ]
    );
  }

  getByCatchCode(catchCode) {
    return this.connection.query(
      `select * from ${PokemonWildManager.table} where catchCode = ?`,
      [catchCode]
    );
  }

  updateByCatchCode(catchCode, isCatch, isEscape) {
    return this.connection.query(
      `update ${PokemonWildManager.table} set isCatch = ?, isEscape = ? where catchCode = ?`,
      [isCatch, isEscape, catchCode]
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
