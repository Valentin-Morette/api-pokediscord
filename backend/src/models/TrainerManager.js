const AbstractManager = require("./AbstractManager");

class TrainerManager extends AbstractManager {
  static table = "trainer";

  insert(trainer) {
    return this.connection.query(
      `insert into ${TrainerManager.table} (id,idDiscord, name, money, hasFirstCatch, affiliateCode) values (?, ?, ?, ?, 0, ?)`,
      [
        trainer.id,
        trainer.idDiscord,
        trainer.name,
        trainer.money,
        trainer.affiliateCode,
      ]
    );
  }

  updateFirstCatch(id) {
    return this.connection.query(
      `update ${TrainerManager.table} set hasFirstCatch = 1 where idDiscord = ?`,
      [id]
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

  verifyIdDiscord(idDiscord) {
    return this.connection.query(
      `select * from ${TrainerManager.table} where idDiscord = ?`,
      [idDiscord]
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
       SET 
           affiliateCodeUse = CASE 
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

  findHasFirstCatch(idDiscord) {
    return this.connection.query(
      `select hasFirstCatch from ${TrainerManager.table} where idDiscord = ?`,
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
