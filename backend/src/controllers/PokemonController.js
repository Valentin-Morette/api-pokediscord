const { v4: uuidv4 } = require("uuid");
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

  static readByTrainer = (req, res) => {
    let countPokemon = 0;
    let sumPokemon = 0;
    models.pokemon_trainer
      .countAndSumPokemonByTrainer(req.params.id)
      .then(([result]) => {
        countPokemon = result[0].count;
        sumPokemon = parseInt(result[0].sum, 10);
        models.pokemon
          .findByTrainer(req.params.id)
          .then(([rows]) => {
            res.send({ countPokemon, sumPokemon, pokemon: rows });
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
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

  static findAllInZone = (req, res) => {
    const zone = req.body.nameZone;
    models.pokemon
      .findAllInZone(zone)
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
    const type = req.body.spawnType;
    models.pokemon
      .findInZone(zone, type)
      .then(([rows]) => {
        if (rows.length === 0) {
          res.send(rows);
          return;
        }
        let sumSpawnChance = 0;
        for (let i = 0; i < rows.length; i += 1) {
          sumSpawnChance += rows[i].spawnChance;
        }
        const randomSpawnChance = Math.floor(Math.random() * sumSpawnChance);
        let sumSpawnChance2 = 0;
        let randomPokemonWild = {};
        for (let i = 0; i < rows.length; i += 1) {
          sumSpawnChance2 += rows[i].spawnChance;
          if (randomSpawnChance <= sumSpawnChance2) {
            randomPokemonWild = rows[i];
            break;
          }
        }
        const pokemonWild = {
          idPokemon: randomPokemonWild.id,
          isCatch: 0,
          isEscape: 0,
          catchCode: uuidv4(),
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

  static deletePokemonWild = (req, res) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    models.pokemon_wild
      .deleteByDate(yesterday)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static evolvePokemon = (req, res) => {
    const { namePokemon } = req.body;
    const { idTrainer } = req.body;
    models.pokemon.findByName(namePokemon).then(([pokemon]) => {
      if (pokemon.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      if (pokemon[0].idEvolution === null) {
        res.status(201).send({ status: "noEvolution" });
        return;
      }
      models.pokemon_trainer
        .updateDownQuantity(
          pokemon[0].id,
          idTrainer,
          pokemon[0].numberEvolution
        )
        .then(([result]) => {
          if (result.affectedRows === 0) {
            res.status(201).send({
              status: "noPokemon",
              numberPokemon: pokemon[0].numberEvolution,
            });
          } else {
            let { idEvolution } = pokemon[0];
            // Evolution Evoli
            if (idEvolution === 134) {
              const randomNum = Math.floor(Math.random() * 3);
              idEvolution = 134 + randomNum;
            }
            const pokemonTrainer = {
              idPokemon: idEvolution,
              idTrainer,
              isShiny: 0,
            };
            models.pokemon_trainer.insert(pokemonTrainer).then(() => {
              models.pokemon.find(idEvolution).then(([resultPokemon]) => {
                res.status(201).send({
                  status: "evolve",
                  pokemonPreEvolve: pokemon[0],
                  pokemonEvolve: resultPokemon[0],
                });
              });
            });
          }
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    });
  };

  static infoPokemon = async (req, res) => {
    try {
      const { namePokemon } = req.body;
      const [[result]] = await models.pokemon.findByName(namePokemon);

      if (!result) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }

      let pokemonInfo = result;

      if (result.idEvolution !== null) {
        const [[evolution]] = await models.pokemon.find(result.idEvolution);
        pokemonInfo = { ...result, evolution };
      }

      res.status(201).send({
        status: "info",
        infos: pokemonInfo,
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  };

  static catchPokemon = (req, res) => {
    const { catchCode } = req.body;
    const { idTrainer } = req.body;
    const { idBall } = req.body;
    models.pokemon_wild
      .getByCatchCode(catchCode)
      .then(([result]) => {
        if (result.length === 0) {
          res.status(201).send({ status: "noExistPokemon" });
        } else if (result[0].isCatch === 1) {
          res.status(201).send({ status: "alreadyCatch" });
        } else if (result[0].isEscape === 1) {
          res.status(201).send({ status: "alreadyEscape" });
        } else {
          models.pokeball_trainer
            .updateQuantity(idBall, idTrainer, 1)
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
                  if (catchChance < 0) {
                    catchChance = 1;
                  }

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

  static sellPokemon = (req, res) => {
    const { namePokemon } = req.body;
    const { idTrainer } = req.body;
    const { quantity } = req.body;
    let idPokemon = 0;
    models.pokemon.findByName(namePokemon).then(([resultId]) => {
      if (resultId.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      idPokemon = resultId[0].id;
      models.pokemon_trainer
        .updateDownQuantity(idPokemon, idTrainer, quantity)
        .then(([result]) => {
          if (result.affectedRows === 0) {
            res.status(201).send({ status: "noPokemon" });
          } else {
            models.pokemon_trainer
              .find(idPokemon, idTrainer)
              .then(([resultFind]) => {
                if (resultFind[0].quantity === 0) {
                  models.pokemon_trainer.delete(idPokemon, idTrainer);
                }
                models.pokemon.find(idPokemon).then(([resultPokemon]) => {
                  const sellPrice = resultPokemon[0].sellPrice * quantity;
                  models.trainer.updateMoney(idTrainer, sellPrice).then(() => {
                    res.status(201).send({
                      status: "sell",
                      pokemonName: resultPokemon[0].name,
                      sellPrice,
                    });
                  });
                });
              });
          }
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
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
