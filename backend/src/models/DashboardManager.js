const AbstractManager = require("./AbstractManager");

class DashboardManager extends AbstractManager {
  static table = "dashboard"; // Table virtuelle pour les stats

  async getStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM servers) as serverCount,
        (SELECT COUNT(*) FROM sale) as saleCount,
        (SELECT COUNT(*) FROM trainer) as trainerCount
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
        s.name AS serverName,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pt.idPokeball,
            'name', p.name,
            'quantity', pt.quantity
          )
        ) AS pokeballs,
        (
          SELECT JSON_OBJECT(
            'sumTotal', SUM(pt_pokemon.quantity),
            'sumShiny', SUM(CASE WHEN pt_pokemon.isShiny = 1 THEN pt_pokemon.quantity ELSE 0 END),
            'sumNoShiny', SUM(CASE WHEN pt_pokemon.isShiny = 0 THEN pt_pokemon.quantity ELSE 0 END),
            'countShiny', SUM(CASE WHEN pt_pokemon.isShiny = 1 THEN 1 ELSE 0 END),
            'countNoShiny', SUM(CASE WHEN pt_pokemon.isShiny = 0 THEN 1 ELSE 0 END)
          )
          FROM pokemon_trainer pt_pokemon 
          WHERE pt_pokemon.idTrainer = t.idDiscord
        ) AS pokemonStats
      FROM trainer t
      LEFT JOIN servers s ON t.firstServerId = s.idServer
      LEFT JOIN pokeball_trainer pt ON t.idDiscord = pt.idTrainer
      LEFT JOIN pokeball p ON pt.idPokeball = p.id
      GROUP BY t.id, t.name, t.money, t.startDate, t.isPremium, t.idDiscord, t.firstServerId, s.name
      ORDER BY t.name ASC`
    );
  }
}

module.exports = DashboardManager;
