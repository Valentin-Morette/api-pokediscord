/* eslint-disable prefer-destructuring */
const models = require("../models");

class PokemonController {
  static readByTrainer = (req, res) => {
    const isShiny = req.params.type === "shiny" ? 1 : 0;
    let countPokemon = 0;
    let sumPokemon = 0;
    models.pokemon_trainer
      .countAndSumPokemonByTrainer(req.params.id, isShiny)
      .then(([result]) => {
        countPokemon = result[0].count;
        sumPokemon = parseInt(result[0].sum, 10);
        models.pokemon
          .findByTrainer(req.params.id, isShiny)
          .then(([rows]) => {
            res.send({ countPokemon, sumPokemon, pokemon: rows });
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
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

  static addPokemonWild = async (req, res) => {
    const zone = req.body.nameZone;
    const type = req.body.spawnType;
    const pokemonName = req.body.namePokemon;
    try {
      let pokemonData;

      if (pokemonName !== undefined) {
        const [result] = await models.pokemon.findByName(pokemonName);
        if (result.length === 0) {
          res.status(201).send({ status: "noExistPokemon" });
          return;
        }
        pokemonData = result[0];
      } else {
        const [rows] = await models.pokemon.findInZone(zone, type);
        if (rows.length === 0) {
          res.send(rows);
          return;
        }
        pokemonData = this.selectRandomPokemon(rows);
      }

      let isShiny = 0;
      if (pokemonData.shinyRate !== null) {
        isShiny = this.ifIsShiny(pokemonData.shinyRate);
      }
      const pokemonWild = this.createPokemonWildObject(pokemonData, isShiny);
      const [resultInsert] = await models.pokemon_wild.insert(pokemonWild);
      res.status(201).send({
        idPokemonWild: resultInsert.insertId,
        isShiny: pokemonWild.isShiny,
        ...pokemonData,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };

  static useRune = (req, res) => {
    const { pokemonName } = req.body;
    const { idTrainer } = req.body;
    models.rune_trainer
      .findByPokemonName(pokemonName, idTrainer)
      .then(([result]) => {
        if (result.length === 0) {
          res.status(201).send({ status: "noRune" });
        } else {
          models.rune_trainer
            .updateDownQuantity(result[0].idPokemon, idTrainer, 1)
            .then(([resultUpdate]) => {
              if (resultUpdate.affectedRows === 0) {
                res.status(201).send({ status: "noRune" });
              } else {
                const payloadAddPokemon = {
                  body: {
                    namePokemon: pokemonName,
                  },
                };
                this.addPokemonWild(payloadAddPokemon, res);
              }
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static ifIsShiny(shinyRate) {
    const randomNum = Math.floor(Math.random() * 1000);
    if (randomNum <= shinyRate) {
      return 1;
    }
    return 0;
  }

  static selectRandomPokemon(rows) {
    const sumSpawnChance = rows.reduce((acc, row) => acc + row.spawnChance, 0);
    const randomSpawnChance = Math.floor(Math.random() * sumSpawnChance);
    let sumSpawnChance2 = 0;

    for (const row of rows) {
      sumSpawnChance2 += row.spawnChance;
      if (randomSpawnChance <= sumSpawnChance2) {
        return row;
      }
    }
    return rows[0];
  }

  static createPokemonWildObject(pokemonData, isShiny = 0) {
    return {
      idPokemon: pokemonData.id,
      isShiny,
      isCatch: 0,
      isEscape: 0,
      dateAppear: new Date(),
    };
  }

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
    const { isShiny } = req.body;
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
          pokemon[0].numberEvolution,
          isShiny
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
              isShiny,
            };
            models.pokemon_trainer.insert(pokemonTrainer).then(() => {
              models.pokemon.find(idEvolution).then(([resultPokemon]) => {
                res.status(201).send({
                  status: "evolve",
                  isShiny,
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
    const { idPokemonWild } = req.body;
    const { idTrainer } = req.body;
    const { idBall } = req.body;
    models.pokemon_wild
      .getById(idPokemonWild)
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
                      isShiny: result[0].isShiny,
                    });
                    models.pokemon_wild
                      .updateById(idPokemonWild, 1, 0)
                      .then(() => {
                        models.trainer
                          .findHasFirstCatch(idTrainer)
                          .then(([resultCatch]) => {
                            models.trainer.updateFirstCatch(idTrainer);
                            res.status(201).send({
                              status: "catch",
                              pokemonName: pokemonResult[0][0].name,
                              sendTuto: resultCatch[0].hasFirstCatch === 0,
                            });
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
                      .updateById(idPokemonWild, 0, 1)
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
    const { isShiny } = req.body;
    let idPokemon = 0;
    models.pokemon.findByName(namePokemon).then(([resultId]) => {
      if (resultId.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      idPokemon = resultId[0].id;
      models.pokemon_trainer
        .updateDownQuantity(idPokemon, idTrainer, quantity, isShiny)
        .then(([result]) => {
          if (result.affectedRows === 0) {
            res.status(201).send({ status: "noPokemon" });
          } else {
            models.pokemon.find(idPokemon).then(([resultPokemon]) => {
              const sellPrice =
                resultPokemon[0].sellPrice * quantity * (isShiny ? 3 : 1);
              models.trainer.updateMoney(idTrainer, sellPrice).then(() => {
                res.status(201).send({
                  status: "sell",
                  pokemonName: resultPokemon[0].name,
                  sellPrice,
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
}

module.exports = PokemonController;
