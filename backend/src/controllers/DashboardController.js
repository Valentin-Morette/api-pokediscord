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

  static getBugsIdeas = async (req, res) => {
    try {
      const [bugsIdeas] = await models.dashboard.getBugsIdeas();
      res.json(bugsIdeas);
    } catch (error) {
      console.error("Erreur lors de la récupération des bugs et idées:", error);

      res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des bugs et idées",
      });
    }
  };

  static getTrainers = async (req, res) => {
    try {
      const [trainers] = await models.dashboard.getTrainers();

      // Traitement des pokeballs et pokemonStats pour gérer les NULL
      const processedTrainers = trainers.map(trainer => ({
        ...trainer,
        pokeballs: trainer.pokeballs[0] === null ? [] : trainer.pokeballs,
        pokemonStats: trainer.pokemonStats || {
          sumTotal: 0,
          sumShiny: 0,
          sumNoShiny: 0,
          countShiny: 0,
          countNoShiny: 0
        }
      }));

      res.json({
        status: "success",
        trainers: processedTrainers,
        count: processedTrainers.length
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des trainers:", error);
      res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des trainers",
      });
    }
  };

  static getSales = async (req, res) => {
    const [sales] = await models.dashboard.getSales();
    res.json(sales);
  };
}

module.exports = DashboardController;
