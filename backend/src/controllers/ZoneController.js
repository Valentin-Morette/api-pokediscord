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
            const generationMap = {
              1: "Kanto",
              2: "Johto",
              3: "Hoenn",
              4: "Sinnoh",
              5: "Unys",
              6: "Kalos",
              7: "Alola",
              8: "Galar",
              9: "Paldea",
            };

            const groupedZones = Object.values(
              rows.reduce((acc, zone) => {
                const gen = zone.generation;
                if (!acc[gen]) {
                  acc[gen] = {
                    name: generationMap[gen] || `Génération ${gen}`,
                    generation: gen,
                    zones: [],
                  };
                }
                acc[gen].zones.push(zone);
                return acc;
              }, {})
            );

            // Optionnel : trier par ordre croissant de génération
            groupedZones.sort((a, b) => a.generation - b.generation);
            res.send({
              status: "zoneListed",
              pokemon: result[0],
              result: groupedZones,
            });
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
      }
    });
  };

  static readByGeneration = async (req, res) => {
    try {
      const { generation } = req.params;
      const [rows] = await models.zone.readByGeneration(generation);
      const zones = [];
      rows.forEach((row) => {
        zones.push(row.name);
      });
      res.send(zones);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

module.exports = ZoneController;
