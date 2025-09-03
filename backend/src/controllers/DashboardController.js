const models = require("../models");

class DashboardController {
  static getStats = async (req, res) => {
    try {
      const [stats] = await models.dashboard.getStats();

      res.json({
        servers: stats[0].serverCount,
        sales: stats[0].saleCount,
        trainers: stats[0].trainerCount,
        pokemonWild: stats[0].pokemonWildCount,
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

      // Récupérer les pokeballs et stats pour chaque trainer
      const trainersWithDetails = await Promise.all(
        trainers.map(async (trainer) => {
          const [pokeballs] = await models.dashboard.getTrainerPokeballs(trainer.idDiscord);
          const [pokemonStats] = await models.dashboard.getTrainerPokemonStats(trainer.idDiscord);

          return {
            ...trainer,
            pokeballs: pokeballs || [],
            pokemonStats: {
              sumTotal: pokemonStats[0]?.sumTotal || 0,
              sumShiny: pokemonStats[0]?.sumShiny || 0,
              sumNoShiny: pokemonStats[0]?.sumNoShiny || 0,
              countShiny: pokemonStats[0]?.countShiny || 0,
              countNoShiny: pokemonStats[0]?.countNoShiny || 0
            }
          };
        })
      );

      res.json({
        status: "success",
        trainers: trainersWithDetails,
        count: trainersWithDetails.length
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
    res.json({
      status: "success",
      data: sales
    });
  };

  static getTopggVotes = async (req, res) => {
    const [topggVotes] = await models.dashboard.getTopggVotes();
    res.json({
      status: "success",
      count: topggVotes.length,
      data: topggVotes
    });
  };

  static getPokemonWild = async (req, res) => {
    const [pokemonWild] = await models.dashboard.getPokemonWild();
    const count = pokemonWild.length;
    const countShiny = pokemonWild.filter((pokemon) => pokemon.isShiny).length;
    const countNoShiny = pokemonWild.filter((pokemon) => !pokemon.isShiny).length;
    const countEscape = pokemonWild.filter((pokemon) => pokemon.isEscape).length;
    const countCatch = pokemonWild.filter((pokemon) => pokemon.isCatch).length;
    const countNoCatchNoEscape = count - countCatch - countEscape;

    res.json({
      status: "success",
      data: {
        count,
        countShiny,
        countNoShiny,
        countEscape,
        countCatch,
        countNoCatchNoEscape,
        pokemonWild,
      },
    });
  };
}

module.exports = DashboardController;
