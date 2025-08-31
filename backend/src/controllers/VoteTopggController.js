const models = require("../models");

class VoteTopggController {
  static insert = async (voteData) => {
    try {
      const [result] = await models.vote_topgg.insert(voteData);
      return result.insertId;
    } catch (error) {
      console.error("❌ Erreur lors de l'insertion du vote Top.gg:", error);
      throw error;
    }
  };

  static findByDiscord = async (idDiscord) => {
    try {
      const [votes] = await models.vote_topgg.findByDiscord(idDiscord);
      return votes;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des votes:", error);
      throw error;
    }
  };

  static getVoteCount = async (idDiscord) => {
    try {
      const [result] = await models.vote_topgg.getVoteCountByDiscord(idDiscord);
      return result[0].voteCount;
    } catch (error) {
      console.error("❌ Erreur lors du comptage des votes:", error);
      throw error;
    }
  };
}

module.exports = VoteTopggController;
