const AbstractManager = require("./AbstractManager");

class ChampionManager extends AbstractManager {
  static table = "champion";

  insert(champion) {
    return this.connection.query(
      `insert into ${ChampionManager.table} (id, name, type1, type2, generation, img, sellPrice, catchRate, escapeRate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        champion.id,
        champion.name,
        champion.type1,
        champion.type2,
        champion.generation,
        champion.img,
        champion.sellPrice,
        champion.catchRate,
        champion.escapeRate,
      ]
    );
  }

  update(champion) {
    return this.connection.query(
      `update ${ChampionManager.table} set name = ?, type1 = ?, type2 = ?, generation = ?, img = ?, sellPrice = ?, catchRate = ?, escapeRate = ? where id = ?`,
      [
        champion.name,
        champion.type1,
        champion.type2,
        champion.generation,
        champion.img,
        champion.sellPrice,
        champion.catchRate,
        champion.escapeRate,
        champion.id,
      ]
    );
  }
}

module.exports = ChampionManager;
