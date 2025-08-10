const AbstractManager = require("./AbstractManager");

class ServersManager extends AbstractManager {
  static table = "servers";

  insert(servers) {
    return this.connection.query(
      `INSERT INTO ${ServersManager.table} (idServer, name, idOwner)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       idOwner = VALUES(idOwner)`,
      [servers.idServer, servers.name, servers.idOwner]
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
}

module.exports = ServersManager;
