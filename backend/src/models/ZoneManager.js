const AbstractManager = require("./AbstractManager");

class ZoneManager extends AbstractManager {
  static table = "zone";

  findZoneByPokemonName(name) {
    return this.connection.query(
      `SELECT DISTINCT
        z.name
      FROM
        ${ZoneManager.table} AS z
      INNER JOIN
        pokemon_zone AS pz
        ON z.id = pz.idZone
      INNER JOIN
        pokemon AS p
        ON pz.idPokemon = p.id
      WHERE
        p.name = ?`,
      [name]
    );
  }

  readByGeneration(generation) {
    return this.connection.query(
      `SELECT name FROM ${ZoneManager.table} WHERE generation = ?`,
      [generation]
    );
  }
}

module.exports = ZoneManager;
