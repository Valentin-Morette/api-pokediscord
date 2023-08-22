const AbstractManager = require("./AbstractManager");

class RoleManager extends AbstractManager {
  static table = "role";

  insert(role) {
    return this.connection.query(
      `insert into ${RoleManager.table} (id, name, type1, type2, generation, img, sellPrice, catchRate, escapeRate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role.id,
        role.name,
        role.type1,
        role.type2,
        role.generation,
        role.img,
        role.sellPrice,
        role.catchRate,
        role.escapeRate,
      ]
    );
  }

  update(role) {
    return this.connection.query(
      `update ${RoleManager.table} set name = ?, type1 = ?, type2 = ?, generation = ?, img = ?, sellPrice = ?, catchRate = ?, escapeRate = ? where id = ?`,
      [
        role.name,
        role.type1,
        role.type2,
        role.generation,
        role.img,
        role.sellPrice,
        role.catchRate,
        role.escapeRate,
        role.id,
      ]
    );
  }
}

module.exports = RoleManager;
