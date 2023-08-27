const AbstractManager = require("./AbstractManager");

class PokemonManager extends AbstractManager {
  static table = "pokemon";

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
      `update ${PokemonManager.table} set name = ?, type1 = ?, type2 = ?, generation = ?, img = ?, sellPrice = ?, catchRate = ?, escapeRate = ? where id = ?`,
      [
        pokemon.name,
        pokemon.type1,
        pokemon.type2,
        pokemon.generation,
        pokemon.img,
        pokemon.sellPrice,
        pokemon.catchRate,
        pokemon.escapeRate,
        pokemon.id,
      ]
    );
  }

  findInZone(zoneName) {
    return this.connection.query(
      `select p.* from ${PokemonManager.table} as p inner join pokemon_zone as pz on p.id = pz.idPokemon inner join zone as z on pz.idZone = z.id where z.name = ?`,
      [zoneName]
    );
  }
}

module.exports = PokemonManager;
