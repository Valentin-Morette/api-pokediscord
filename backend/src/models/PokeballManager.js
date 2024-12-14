const AbstractManager = require("./AbstractManager");

class PokeballManager extends AbstractManager {
  static table = "pokeball";

  findByTrainer(trainerId) {
    return this.connection.query(
      `SELECT p.name, COALESCE(pt.quantity, 0) AS quantity
      FROM ${PokeballManager.table} p
      LEFT JOIN pokeball_trainer pt ON p.id = pt.idPokeball AND pt.idTrainer = ?
      `,
      [trainerId]
    );
  }

  findRandomForGift() {
    return this.connection.query(
      `SELECT * FROM ${PokeballManager.table} WHERE id IN (1, 2, 3) ORDER BY RAND() LIMIT 1`
    );
  }

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
