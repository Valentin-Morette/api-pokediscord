const AbstractManager = require("./AbstractManager");

class PokemonManager extends AbstractManager {
  static table = "pokemon";

  insert(pokemon) {
    return this.connection.query(
      `INSERT INTO
        ${PokemonManager.table}
        (id, name, generation, img, imgShiny, sellPrice, shinyRate, catchRate, escapeRate, idEvolution, numberEvolution)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pokemon.id,
        pokemon.name,
        pokemon.generation,
        pokemon.img,
        pokemon.imgShiny,
        pokemon.sellPrice,
        pokemon.shinyRate,
        pokemon.catchRate,
        pokemon.escapeRate,
        pokemon.idEvolution,
        pokemon.numberEvolution,
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
        z.name = ?`,
      [zoneName]
    );
  }

  findAllInZone(nameZone) {
    return this.connection.query(
      `SELECT
        p.name,
        pz.spawnChance
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
      ORDER BY
        p.id ASC`,
      [nameZone]
    );
  }

  findByTrainer(idTrainer, isShiny = 0, generation = 1) {
    return this.connection.query(
      `SELECT p.*, pt.quantity 
        FROM ${PokemonManager.table} AS p 
        INNER JOIN pokemon_trainer AS pt ON p.id = pt.idPokemon 
        WHERE pt.idTrainer = ? 
        AND pt.quantity > 0 
        AND pt.isShiny = ?
        AND p.generation = ?
        ORDER BY p.id ASC`,
      [idTrainer, isShiny, generation]
    );
  }

  findMissingByTrainer(idTrainer, generation = 1, isShiny = 0) {
    return this.connection.query(
      `SELECT p.*
     FROM pokemon AS p
     WHERE p.generation = ?
     AND p.id NOT IN (
       SELECT pt.idPokemon
       FROM pokemon_trainer AS pt
       WHERE pt.idTrainer = ?
       AND pt.quantity > 0
       AND pt.isShiny = ?
     )
    AND p.id != 9999
     ORDER BY p.id ASC`,
      [generation, idTrainer, isShiny]
    );
  }

  findByName(name) {
    return this.connection.query(
      `SELECT * FROM ${PokemonManager.table} WHERE name = ?`,
      [name]
    );
  }

  // UPDATEGENERATION: Change max value to total number of pokemons in the database
  findRandomPokemon() {
    return this.connection.query(
      `SELECT * 
     FROM ${PokemonManager.table}
     WHERE id BETWEEN 1 AND 493
       AND id NOT IN (151, 251, 385, 489)
     ORDER BY RAND()
     LIMIT 1;`
    );
  }
}

module.exports = PokemonManager;
