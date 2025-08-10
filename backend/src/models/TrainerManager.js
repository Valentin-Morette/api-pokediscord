const AbstractManager = require("./AbstractManager");

class TrainerManager extends AbstractManager {
  static table = "trainer";

  upsert(trainer) {
    return this.connection.query(
      `INSERT INTO ${TrainerManager.table}
        (idDiscord, name, money, affiliateCode, firstServerId)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         firstServerId = COALESCE(firstServerId, VALUES(firstServerId))`,
      [
        trainer.idDiscord,
        trainer.name,
        trainer.money,
        trainer.affiliateCode,
        trainer.firstServerId,
      ]
    );
  }

  updateMoney(id, money) {
    return this.connection.query(
      `update ${TrainerManager.table} set money = money + ? where idDiscord = ?`,
      [money, id]
    );
  }

  updateLastGift(id) {
    return this.connection.query(
      `update ${TrainerManager.table} set lastGift = now() where idDiscord = ?`,
      [id]
    );
  }

  find(idDiscord) {
    return this.connection.query(
      `select * from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }

  findTrainerByAffiliationCode(affiliationCode) {
    return this.connection.query(
      `select * from ${TrainerManager.table} where affiliateCode = ?`,
      [affiliationCode]
    );
  }

  affiliate(idTrainer, idTrainerGodfather) {
    return this.connection.query(
      `UPDATE ${TrainerManager.table} 
        SET affiliateCodeUse = CASE 
          WHEN idDiscord = ? THEN ? 
          ELSE affiliateCodeUse 
        END,
        money = CASE 
          WHEN idDiscord = ? THEN money + 10000 
          WHEN idDiscord = ? THEN money + 10000 
        END 
        WHERE idDiscord IN (?, ?)`,
      [
        idTrainer,
        idTrainerGodfather,
        idTrainer,
        idTrainerGodfather,
        idTrainer,
        idTrainerGodfather,
      ]
    );
  }

  addPremium(idDiscord) {
    return this.connection.query(
      `update ${TrainerManager.table} set isPremium = 1 where idDiscord = ?`,
      [idDiscord]
    );
  }

  delete(idDiscord) {
    return this.connection.query(
      `delete from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
    );
  }
}

module.exports = TrainerManager;
