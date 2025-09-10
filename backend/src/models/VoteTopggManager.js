const AbstractManager = require("./AbstractManager");

class VoteTopggManager extends AbstractManager {
  static table = "vote_topgg";

  insert(voteData) {
    const { idDiscord, reward_pokemon_id, reward_is_shiny, streak } = voteData;
    const date = new Date();

    return this.connection.query(
      `INSERT INTO ${this.table} (idDiscord, date, reward_pokemon_id, reward_is_shiny, streak) VALUES (?, ?, ?, ?, ?)`,
      [idDiscord, date, reward_pokemon_id, reward_is_shiny, streak]
    );
  }

  findByDiscord(idDiscord) {
    return this.connection.query(
      `SELECT * FROM ${this.table} WHERE idDiscord = ? ORDER BY date DESC`,
      [idDiscord]
    );
  }

  findAll() {
    return this.connection.query(
      `SELECT * FROM ${this.table} ORDER BY date DESC`
    );
  }

  getVoteCountByDiscord(idDiscord) {
    return this.connection.query(
      `SELECT COUNT(*) as voteCount FROM ${this.table} WHERE idDiscord = ?`,
      [idDiscord]
    );
  }
}

module.exports = VoteTopggManager;
