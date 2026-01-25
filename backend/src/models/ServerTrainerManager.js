const AbstractManager = require("./AbstractManager");

class ServerTrainerManager extends AbstractManager {
  static table = "server_trainer";

  insertBulkIsOnServer(rows) {
    if (!rows.length) return Promise.resolve();
    return this.connection.query(
      `INSERT INTO ${ServerTrainerManager.table} (id_trainer, id_server, isOnServer)
       VALUES ?
       ON DUPLICATE KEY UPDATE isOnServer = 1`,
      [rows]
    );
  }

  updateIsOnServer(idTrainer, idServer, isOnServer) {
    return this.connection.query(
      `UPDATE ${ServerTrainerManager.table} SET isOnServer = ? WHERE id_trainer = ? AND id_server = ?`,
      [isOnServer, idTrainer, idServer]
    );
  }

  async upsertIsOnServer(idTrainer, idServer, isOnServer) {
    const [result] = await this.updateIsOnServer(idTrainer, idServer, isOnServer);
    if (result.affectedRows === 0) {
      return this.connection.query(
        `INSERT INTO ${ServerTrainerManager.table} (id_trainer, id_server, isOnServer)
         VALUES (?, ?, ?)`,
        [idTrainer, idServer, isOnServer]
      );
    }
    return Promise.resolve([result]);
  }
}

module.exports = ServerTrainerManager;
