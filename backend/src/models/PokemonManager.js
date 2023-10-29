const AbstractManager = require("./AbstractManager");

class PokemonManager extends AbstractManager {
  static table = "pokemon";

  insert(pokemon) {
    return this.connection.query(
      `INSERT INTO
        ${PokemonManager.table}
        (id, name, type1, type2, generation, img, sellPrice, catchRate, escapeRate)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `SELECT
        p.*,
        pz.spawnChance
      FROM
        ${PokemonManager.table} AS p
      INNER JOIN
        pokemon_zone AS pz
        ON p.id = pz.idPokemon
      INNER JOIN
        zone AS z
        ON pz.idZone = z.id
      WHERE
        z.name = ?
        AND pz.spawnType = ?`,
      [zoneName, type]
    );
  }

  findAllInZone(nameZone) {
    return this.connection.query(
      `SELECT
        p.name,
        pz.spawnType
      FROM
        zone AS z
      INNER JOIN
        pokemon_zone AS pz
        ON z.id = pz.idZone
      INNER JOIN
        pokemon AS p
        ON pz.idPokemon = p.id
      WHERE
        z.name = ?
        AND p.name != "MEW"
      ORDER BY
        p.id ASC`,
      [nameZone]
    );
  }

  findByTrainer(idTrainer) {
    return this.connection.query(
      `select p.*, pt.quantity from ${PokemonManager.table} as p inner join pokemon_trainer as pt on p.id = pt.idPokemon where pt.idTrainer = ? and pt.quantity > 0 order by p.id asc`,
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
