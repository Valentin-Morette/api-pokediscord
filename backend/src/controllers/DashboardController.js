const models = require("../models");

class DashboardController {
  static getStats = async (req, res) => {
    try {
      const [stats] = await models.dashboard.getStats();

      res.json({
        servers: stats[0].serverCount,
        sales: stats[0].saleCount,
        trainers: stats[0].trainerCount,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  };

  static getServers = async (req, res) => {
    try {
      const [servers] = await models.dashboard.getServers();
      res.json({
        total: servers.length,
        servers,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des serveurs:", error);
      res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des serveurs",
      });
    }
  };
}

module.exports = DashboardController;
