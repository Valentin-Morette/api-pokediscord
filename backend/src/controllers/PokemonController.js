const models = require("../models");

class PokemonController {
  static browse = (req, res) => {
    models.pokemon
      .findAll()
      .then(([rows]) => {
        res.send(rows);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static read = (req, res) => {
    models.pokemon
      .find(req.params.id)
      .then(([rows]) => {
        if (rows[0] == null) {
          res.sendStatus(404);
        } else {
          res.send(rows[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static edit = (req, res) => {
    const pokemon = req.body;

    pokemon.id = parseInt(req.params.id, 10);

    models.pokemon
      .update(pokemon)
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.sendStatus(404);
        } else {
          res.sendStatus(204);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static add = (req, res) => {
    const pokemon = req.body;
    models.pokemon
      .insert(pokemon)
      .then(([result]) => {
        res.status(201).send({ ...pokemon, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static findInZone = (req, res) => {
    const zone = req.body.nameZone;
    models.pokemon
      .findInZone(zone)
      .then(([rows]) => {
        res.send(rows);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static addPokemonWild = (req, res) => {
    const zone = req.body.nameZone;
    models.pokemon
      .findInZone(zone)
      .then(([rows]) => {
        if (rows.length === 0) {
          res.send(rows);
          return;
        }
        const randomPokemonWild = rows[Math.floor(Math.random() * rows.length)];
        const pokemonWild = {
          idPokemon: randomPokemonWild.id,
          isCatch: 0,
          isEscape: 0,
          catchCode: Math.floor(Math.random() * 100000),
          dateAppear: new Date(),
        };
        models.pokemon_wild
          .insert(pokemonWild)
          .then(([result]) => {
            res.status(201).send({
              id: result.insertId,
              catchCode: pokemonWild.catchCode,
              ...randomPokemonWild,
            });
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static catchPokemon = (req, res) => {
    const { catchCode } = req.body;
    const { idTrainer } = req.body;
    const { idBall } = req.body;
    models.pokemon_wild
      .getByCatchCode(catchCode)
      .then(([result]) => {
        if (result[0].isEscape === 1) {
          res.status(201).send({ status: "alreadyEscape" });
        } else if (result[0].isCatch === 1) {
          res.status(201).send({ status: "alreadyCatch" });
        } else {
          models.pokeball_trainer
            .updateQuantity(idBall, idTrainer)
            .then(([resultUpdate]) => {
              if (resultUpdate.affectedRows === 0) {
                res.status(201).send({ status: "noBall" });
              } else {
                Promise.all([
                  models.pokemon.find(result[0].idPokemon),
                  models.pokeball.find(idBall),
                ]).then(([pokemonResult, pokeballResult]) => {
                  let catchChance = 0;
                  let escapeChance = 0;
                  catchChance += pokemonResult[0][0].catchRate;
                  escapeChance += pokemonResult[0][0].escapeRate;
                  catchChance += pokeballResult[0][0].catchBonus;

                  const randomCatch = Math.floor(Math.random() * 100);

                  if (randomCatch <= catchChance) {
                    models.pokemon_trainer.insert({
                      idPokemon: result[0].idPokemon,
                      idTrainer,
                      isShiny: 0,
                    });
                    models.pokemon_wild
                      .updateByCatchCode(catchCode, 1, 0)
                      .then(() => {
                        res.status(201).send({
                          status: "catch",
                          pokemonName: pokemonResult[0][0].name,
                        });
                      })
                      .catch((err) => {
                        console.error(err);
                        res.sendStatus(500);
                      });
                  } else if (
                    randomCatch > catchChance &&
                    randomCatch <= catchChance + escapeChance
                  ) {
                    models.pokemon_wild
                      .updateByCatchCode(catchCode, 0, 1)
                      .then(() => {
                        res.status(201).send({
                          status: "escape",
                          pokemonName: pokemonResult[0][0].name,
                        });
                      })
                      .catch((err) => {
                        console.error(err);
                        res.sendStatus(500);
                      });
                  } else {
                    res.status(201).send({
                      status: "noCatch",
                      pokemonName: pokemonResult[0][0].name,
                    });
                  }
                });
              }
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.pokemon
      .delete(req.params.id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}

module.exports = PokemonController;
