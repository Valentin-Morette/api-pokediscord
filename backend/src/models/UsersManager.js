const AbstractManager = require("./AbstractManager");

class UsersManager extends AbstractManager {
  static table = "users";
  static dbName = "user";

  updateUser(discordId, data) {
    return this.connection.query(
      `UPDATE ${UsersManager.table} SET firstName = ? WHERE discord_id = ?`,
      [data.firstName, discordId]
    );
  }
}

module.exports = UsersManager;
