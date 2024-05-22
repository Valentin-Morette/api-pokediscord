const models = require("../models");

class ZoneController {
  static findZoneByPokemonName = (req, res) => {
    const { name } = req.params;
    models.pokemon.findByName(name).then(([result]) => {
      if (result.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
      } else {
        models.zone
          .findZoneByPokemonName(name)
          .then(([rows]) => {
            res.send({
              status: "zoneListed",
              pokemon: result[0],
              result: rows,
            });
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
      }
    });
  };
}

module.exports = ZoneController;
