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
}

module.exports = DashboardManager;
