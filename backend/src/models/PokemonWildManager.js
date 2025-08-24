const AbstractManager = require("./AbstractManager");

class PokemonWildManager extends AbstractManager {
  static table = "pokemon_wild";

  insert(pokemonWild) {
    return this.connection.query(
      `insert into ${PokemonWildManager.table} (idPokemon, dateAppear, isShiny, isEscape, isCatch, idServer) values (?, ?, ?, ?, ?, ?)`,
      [
        pokemonWild.idPokemon,
        pokemonWild.dateAppear,
        pokemonWild.isShiny,
        pokemonWild.isEscape,
        pokemonWild.isCatch,
        pokemonWild.idServer,
      ]
    );
  }

  getById(id) {
    return this.connection.query(
      `select * from ${PokemonWildManager.table} where id = ?`,
      [id]
    );
  }

  getRecapPreviousDay() {
    return this.connection.query(
      `SELECT COUNT(*) AS total_pokemon,
        SUM(isShiny = 0) AS total_normal,
        SUM(isShiny = 1) AS total_shiny,
        SUM(isShiny = 0 AND isCatch = 1) AS total_normal_captured,
        SUM(isShiny = 1 AND isCatch = 1) AS total_shiny_captured,
        SUM(isShiny = 0 AND isEscape = 1) AS total_normal_escaped,
        SUM(isShiny = 1 AND isEscape = 1) AS total_shiny_escaped 
      FROM ${PokemonWildManager.table} 
      WHERE dateAppear >= CURDATE() - INTERVAL 1 DAY AND dateAppear < CURDATE();`
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
      `delete from ${PokemonWildManager.table} where dateAppear < ? AND (isCatch = 1 OR isEscape = 1)`,
      [date]
    );
  }
}

module.exports = PokemonWildManager;
