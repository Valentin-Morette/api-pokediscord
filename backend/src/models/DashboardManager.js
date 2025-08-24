const AbstractManager = require("./AbstractManager");

class DashboardManager extends AbstractManager {
  static table = "dashboard"; // Table virtuelle pour les stats

  async getStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM servers) as serverCount,
        (SELECT COUNT(*) FROM sale) as saleCount,
        (SELECT COUNT(*) FROM trainer) as trainerCount,
        (SELECT COUNT(*) FROM pokemon_wild WHERE idServer IS NOT NULL) as pokemonWildCount
    `;
    return this.connection.query(query);
  }

  async getServers() {
    const query = `
      SELECT 
        s.*,
        t_owner.name AS ownerName,
        COUNT(t_all.id) AS trainerCount
      FROM servers s
      LEFT JOIN trainer t_owner
        ON t_owner.idDiscord = s.idOwner
      LEFT JOIN trainer t_all
        ON t_all.firstServerId = s.idServer
      GROUP BY s.id, ownerName;
    `;
    return this.connection.query(query);
  }

  async getBugsIdeas() {
    const query = `
      SELECT 
        bugs_ideas.*,
        trainer.name AS trainerName
      FROM bugs_ideas
      INNER JOIN trainer ON bugs_ideas.idTrainer = trainer.idDiscord;
    `;
    return this.connection.query(query);
  }

  async getSales() {
    return this.connection.query(
      `SELECT 
        sale.id, sale.discord_id, sale.server_id, sale.product_id, sale.amount_total, sale.quantity, sale.currency, sale.created_at,
        trainer.name AS trainerName,
        servers.name AS serverName
      FROM sale
      INNER JOIN trainer ON sale.discord_id = trainer.idDiscord
      INNER JOIN servers ON sale.server_id = servers.idServer`
    );
  }

  async getTrainers() {
    return this.connection.query(
      `SELECT 
        t.id, 
        t.name, 
        t.money, 
        t.startDate, 
        t.isPremium, 
        t.idDiscord, 
        t.firstServerId,
        s.name AS serverName
      FROM trainer t
      LEFT JOIN servers s ON t.firstServerId = s.idServer
      ORDER BY t.name ASC`
    );
  }

  async getTrainerPokeballs(trainerId) {
    return this.connection.query(
      `SELECT 
        pt.idPokeball,
        p.name,
        pt.quantity
      FROM pokeball_trainer pt
      INNER JOIN pokeball p ON pt.idPokeball = p.id
      WHERE pt.idTrainer = ?
      ORDER BY p.name ASC`,
      [trainerId]
    );
  }

  async getTrainerPokemonStats(trainerId) {
    return this.connection.query(
      `SELECT 
        SUM(pt.quantity) as sumTotal,
        SUM(CASE WHEN pt.isShiny = 1 THEN pt.quantity ELSE 0 END) as sumShiny,
        SUM(CASE WHEN pt.isShiny = 0 THEN pt.quantity ELSE 0 END) as sumNoShiny,
        SUM(CASE WHEN pt.isShiny = 1 THEN 1 ELSE 0 END) as countShiny,
        SUM(CASE WHEN pt.isShiny = 0 THEN 1 ELSE 0 END) as countNoShiny
      FROM pokemon_trainer pt
      WHERE pt.idTrainer = ?`,
      [trainerId]
    );
  }

  async getPokemonWild() {
    return this.connection.query(
      `SELECT pw.id, pw.idPokemon, pw.dateAppear, pw.isShiny, pw.isEscape, pw.isCatch, pw.idServer, p.name AS pokemonName, s.name AS serverName
      FROM pokemon_wild pw
      INNER JOIN pokemon p ON pw.idPokemon = p.id
      INNER JOIN servers s ON pw.idServer = s.idServer
      WHERE pw.idServer IS NOT NULL`
    );
  }
}

module.exports = DashboardManager;
