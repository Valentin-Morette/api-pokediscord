const AbstractManager = require("./AbstractManager");

class ZoneManager extends AbstractManager {
  static table = "zone";

  insert(zone) {
    return this.connection.query(
      `insert into ${ZoneManager.table} (id, name, type1, type2, generation, img, sellPrice, catchRate, escapeRate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        zone.id,
        zone.name,
        zone.type1,
        zone.type2,
        zone.generation,
        zone.img,
        zone.sellPrice,
        zone.catchRate,
        zone.escapeRate,
      ]
    );
  }

  update(zone) {
    return this.connection.query(
      `update ${ZoneManager.table} set name = ?, type1 = ?, type2 = ?, generation = ?, img = ?, sellPrice = ?, catchRate = ?, escapeRate = ? where id = ?`,
      [
        zone.name,
        zone.type1,
        zone.type2,
        zone.generation,
        zone.img,
        zone.sellPrice,
        zone.catchRate,
        zone.escapeRate,
        zone.id,
      ]
    );
  }

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
}

module.exports = ZoneManager;
