const AbstractManager = require("./AbstractManager");

class PokeballManager extends AbstractManager {
  static table = "Pokeball";

  insert(pokeball) {
    return this.connection.query(
      `insert into ${PokeballManager.table} (title) values (?)`,
      [pokeball.title]
    );
  }

  update(pokeball) {
    return this.connection.query(
      `update ${PokeballManager.table} set title = ? where id = ?`,
      [pokeball.title, pokeball.id]
    );
  }
}

module.exports = PokeballManager;
