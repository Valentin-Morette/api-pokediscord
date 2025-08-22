const models = require("../models");

class DashboardController {
  static getStats = async (req, res) => {
    try {
      const [stats] = await models.dashboard.getStats();

      res.json({
        stats: {
          servers: stats[0].serverCount,
          sales: stats[0].saleCount,
          trainers: stats[0].trainerCount,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  };
}

module.exports = DashboardController;
