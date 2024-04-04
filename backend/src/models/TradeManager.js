const AbstractManager = require("./AbstractManager");

class TradeManager extends AbstractManager {
  static table = "trade";

  insert(
    idTrainer,
    idPokemonPropose,
    idPokemonRequest,
    quantityPokemonPropose,
    quantityPokemonRequest,
    isShinyPropose,
    isShinyRequest
  ) {
    return this.connection.query(
      `insert into ${TradeManager.table} (idTrainer, idPokemonPropose, idPokemonRequest, quantityPokemonPropose, quantityPokemonRequest, isShinyPropose, isShinyRequest, isAccept) values (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        idTrainer,
        idPokemonPropose,
        idPokemonRequest,
        quantityPokemonPropose,
        quantityPokemonRequest,
        isShinyPropose,
        isShinyRequest,
      ]
    );
  }

  updateAccept(idTrade) {
    return this.connection.query(
      `update ${TradeManager.table} set isAccept = 1 where id = ?`,
      [idTrade]
    );
  }
}

module.exports = TradeManager;
