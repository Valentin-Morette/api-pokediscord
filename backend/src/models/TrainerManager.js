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

  updateStreak(idDiscord, streak) {
    return this.connection.query(
      `update ${TrainerManager.table} set streak = ? where idDiscord = ?`,
      [streak, idDiscord]
    );
  }

  addStreakPremium(idDiscord) {
    return this.connection.query(
      `update ${TrainerManager.table} set isStreakPremium = 1 where idDiscord = ? and isStreakPremium = 0`,
      [idDiscord]
    );
  }

  findInactiveUsers() {
    return this.connection.query(
      `SELECT 
        t.idDiscord,
        t.name,
        t.firstServerId,
        s.name AS serverName
      FROM ${TrainerManager.table} t
      LEFT JOIN servers s ON t.firstServerId = s.idServer
      WHERE t.isOnServer = 1 AND t.money = 2500
      AND s.isInstal = 1 AND s.isDelete = 0
      ORDER BY RAND()
      LIMIT 10`
    );
  }
}

module.exports = TrainerManager;
