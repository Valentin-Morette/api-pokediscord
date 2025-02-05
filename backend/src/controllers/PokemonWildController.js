const models = require("../models");

class PokemonWildController {
  static async recap(req, res) {
    try {
      const recap = await models.pokemon_wild.getRecapPreviousDay();
      // parseInt tout les champs de l'objet
      for (const key in recap[0][0]) {
        if (Object.prototype.hasOwnProperty.call(recap[0][0], key)) {
          recap[0][0][key] = parseInt(recap[0][0][key], 10);
        }
      }
      res.json(recap[0][0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PokemonWildController;
