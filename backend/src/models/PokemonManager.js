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

  findInZone(zoneName, type) {
    return this.connection.query(
      `select p.*, pz.spawnChance from ${PokemonManager.table} as p inner join pokemon_zone as pz on p.id = pz.idPokemon inner join zone as z on pz.idZone = z.id where z.name = ? and pz.spawnType = ?`,
      [zoneName, type]
    );
  }

  findByTrainer(idTrainer) {
    return this.connection.query(
      `select p.*, pt.quantity from ${PokemonManager.table} as p inner join pokemon_trainer as pt on p.id = pt.idPokemon where pt.idTrainer = ? and pt.quantity > 0 order by p.name asc`,
      [idTrainer]
    );
  }

  findByName(name) {
    return this.connection.query(
      `select * from ${PokemonManager.table} where name = ?`,
      [name]
    );
  }
}

module.exports = PokemonManager;
