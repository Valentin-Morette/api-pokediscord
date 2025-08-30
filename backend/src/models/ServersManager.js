const AbstractManager = require("./AbstractManager");

class ServersManager extends AbstractManager {
  static table = "servers";

  insert(servers) {
    const isInstal = servers.hasPokefarmCategory ? 1 : 0;
    return this.connection.query(
      `INSERT INTO ${ServersManager.table} (idServer, name, idOwner, isInstal, isDelete)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       idOwner = VALUES(idOwner),
       isInstal = VALUES(isInstal),
       isDelete = 0`,
      [servers.idServer, servers.name, servers.idOwner, isInstal]
    );
  }

  updateIsInstal(idServer, isInstal) {
    return this.connection.query(
      `UPDATE ${ServersManager.table} SET isInstal = ? WHERE idServer = ?`,
      [isInstal, idServer]
    );
  }

  updateIsDelete(idServer, isDelete) {
    return this.connection.query(
      `UPDATE ${ServersManager.table} SET isDelete = ? WHERE idServer = ?`,
      [isDelete, idServer]
    );
  }

  findAllUninstal() {
    return this.connection.query(
      `SELECT servers.*, trainer.name AS ownerName FROM ${ServersManager.table}
        INNER JOIN trainer ON servers.idOwner = trainer.idDiscord
        WHERE servers.isInstal = 0 AND servers.isDelete = 0`
    );
  }
}

module.exports = ServersManager;
