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

  update(pokemonWild) {
    return this.connection.query(
      `update ${PokemonWildManager.table} set name = ?, type1 = ?, type2 = ?, generation = ?, img = ?, sellPrice = ?, catchRate = ?, escapeRate = ? where id = ?`,
      [
        pokemonWild.name,
        pokemonWild.type1,
        pokemonWild.type2,
        pokemonWild.generation,
        pokemonWild.img,
        pokemonWild.sellPrice,
        pokemonWild.catchRate,
        pokemonWild.escapeRate,
        pokemonWild.id,
      ]
    );
  }
}

module.exports = PokemonWildManager;
