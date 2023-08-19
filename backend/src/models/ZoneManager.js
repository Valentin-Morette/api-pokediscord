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
}

module.exports = ZoneManager;
