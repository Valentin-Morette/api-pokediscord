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
}

module.exports = DashboardManager;
