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
}

module.exports = DashboardManager;
