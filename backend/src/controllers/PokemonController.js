/* eslint-disable prefer-destructuring */
const NodeCache = require("node-cache");
const models = require("../models");

const myCache = new NodeCache({ stdTTL: 86400, checkperiod: 90000 });

class PokemonController {
  static readByTrainer = (req, res) => {
    const isShiny =
      req.params.type === "shiny" || req.params.type === "shiny-reverse";
    const isReverse =
      req.params.type === "shiny-reverse" ||
      req.params.type === "regular-reverse";
    const generation = req.params.generation;
    if (!isReverse) {
      let countPokemon = 0;
      let sumPokemon = 0;
      models.pokemon_trainer
        .countAndSumPokemonByTrainer(req.params.id, isShiny, generation)
        .then(([result]) => {
          countPokemon = result[0].count;
          sumPokemon = parseInt(result[0].sum, 10);
          models.pokemon
            .findByTrainer(req.params.id, isShiny, generation)
            .then(([rows]) => {
              res.send({ countPokemon, sumPokemon, pokemon: rows });
            })
            .catch((err) => {
              console.error(err);
              res.sendStatus(500);
            });
        });
    } else {
      models.pokemon
        .findMissingByTrainer(req.params.id, generation, isShiny)
        .then(([rows]) => {
          res.send({
            countPokemon: rows.length,
            pokemon: rows,
          });
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    }
  };

  static import = (req, res) => {
    // Récupère le JSON du fichier gen4.json
    // eslint-disable-next-line global-require
    const pokemonsList = require("../gen4.json");

    const pokemonListClean = [];
    // Parcours la liste de pokémons
    pokemonsList.forEach((pokemon) => {
      // Crée un objet avec les données du pokémon
      const pokemonData = {
        id: pokemon.pokedex_id,
        name: pokemon.name.fr,
        generation: pokemon.generation,
        img: pokemon.sprites.regular,
        imgShiny: pokemon.sprites.shiny,
        sellPrice: 0,
        shinyRate: null,
        catchRate: 0,
        escapeRate: 0,
        idEvolution:
          pokemon.evolution !== null && pokemon.evolution.next !== null
            ? pokemon.evolution.next[0].pokedex_id
            : null,
        numberEvolution: null,
      };
      pokemonListClean.push(pokemonData);
    });

    pokemonListClean.forEach((pokemon) => {
      models.pokemon
        .insert(pokemon)
        .then(() => {})
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    });

    // Envoie une réponse au client
    res.sendStatus(201);
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
        const cacheKey = `zone_${zone}`;

        const cachedResult = myCache.get(cacheKey);
        if (cachedResult) {
          pokemonData = this.selectRandomPokemon(cachedResult);
        } else {
          const [rows] = await models.pokemon.findInZone(zone);
          if (rows.length === 0) {
            res.send(rows);
            return;
          }
          myCache.set(cacheKey, rows);
          pokemonData = this.selectRandomPokemon(rows);
        }
      }

      // Provoque un spawn légendaire avec une chance de 1/1000
      const legendarySpawn = Math.floor(Math.random() * 1000) === 512;
      // Va chercher les data de la zone
      if (legendarySpawn && pokemonName === undefined) {
        // UPDATEGENERATION !
        const legendaryPokemonByGeneration = {
          1: 151, // Mew
          2: 251, // Celebi
          3: 385, // Jirachi
          4: 489, // Phione
        };
        const [zoneData] = await models.zone.findByName(zone);
        const generation = zoneData[0].generation;

        pokemonData = await models.pokemon.find(
          legendaryPokemonByGeneration[generation]
        );
        pokemonData = pokemonData[0][0];
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
    const multiplier = this.shinyMultiplier();
    if (randomNum <= shinyRate * multiplier) {
      return 1;
    }
    return 0;
  }

  // EVENT : SHINY WEEKEND
  static shinyMultiplier() {
    const startDate = new Date("2025-06-13T17:00:00Z");
    const endDate = new Date("2025-06-15T23:59:59Z");
    const currentDate = new Date();
    if (currentDate >= startDate && currentDate <= endDate) {
      return 2;
    }
    return 1;
  }

  static selectRandomPokemon(rows) {
    const sumSpawnChance = rows.reduce((acc, row) => acc + row.spawnChance, 0);
    const randomSpawnChance = Math.floor(Math.random() * sumSpawnChance) + 1;
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

  static quantityPokemon = async (req, res) => {
    const { idTrainer, pokemonName, isShiny } = req.body;
    try {
      const [result] = await models.pokemon.findByName(pokemonName);
      if (result.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      const [resultQuantity] = await models.pokemon_trainer.findQuantity(
        result[0].id,
        idTrainer,
        isShiny
      );
      res.status(201).send({
        status: "quantity",
        quantity: resultQuantity[0] ? resultQuantity[0].quantity : 0,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };

  static evolvePokemon = async (req, res) => {
    const { namePokemon, idTrainer, nameZone, isShiny, max } = req.body;
    let { quantity } = req.body;
    try {
      const [pokemon] = await models.pokemon.findByName(namePokemon);
      if (pokemon.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      if (!pokemon[0].idEvolution) {
        res.status(201).send({ status: "noEvolution" });
        return;
      }

      // Gestion de l'évolution de Kangourex en MissingNo.
      if (pokemon[0].id === 115) {
        const [differentPokemon] =
          await models.pokemon_trainer.countAndSumPokemonByTrainer(idTrainer);
        if (differentPokemon[0].count < 151) {
          res.status(201).send({ status: "noMaster" });
          return;
        }
      }

      if (max) {
        const [result] = await models.pokemon_trainer.findQuantity(
          pokemon[0].id,
          idTrainer,
          isShiny
        );
        if (result.length === 0) {
          res.status(201).send({
            status: "noPokemon",
            numberPokemon: pokemon[0].numberEvolution,
            quantity: 1,
          });
          return;
        }
        quantity = Math.floor(result[0].quantity / pokemon[0].numberEvolution);
      }

      const updateResult = await models.pokemon_trainer.updateDownQuantity(
        pokemon[0].id,
        idTrainer,
        pokemon[0].numberEvolution * quantity,
        isShiny
      );

      if (updateResult[0].affectedRows === 0) {
        res.status(201).send({
          status: "noPokemon",
          numberPokemon: pokemon[0].numberEvolution,
          quantity,
        });
        return;
      }

      // Gestion de l'évolution spécifique d'Evoli
      let idEvolution = pokemon[0].idEvolution;
      if (idEvolution === 134) {
        if (nameZone === "centrale") {
          idEvolution = 135;
        } else if (nameZone === "iles-ecume") {
          idEvolution = 134;
        } else if (nameZone === "route-victoire") {
          idEvolution = 136;
        } else if (nameZone === "antre-noir") {
          idEvolution = 197;
        } else if (nameZone === "tour-cendree") {
          idEvolution = 196;
        } else if (nameZone === "foret-vestigion") {
          idEvolution = 470;
        } else if (nameZone === "temple-frimapic") {
          idEvolution = 471;
        } else {
          // Si la zone n'est pas reconnue, on choisit une évolution aléatoire
          const evolutions = [135, 134, 136, 197, 196, 470, 471];
          idEvolution =
            evolutions[Math.floor(Math.random() * evolutions.length)];
        }
      }

      // Gestion de l'évolution de chenipotte
      if (idEvolution === 266) {
        idEvolution = Math.random() < 0.5 ? 266 : 268;
      }

      const pokemonTrainer = { idPokemon: idEvolution, idTrainer, isShiny };
      await models.pokemon_trainer.insert(pokemonTrainer, quantity);

      const [resultPokemon] = await models.pokemon.find(idEvolution);
      res.status(201).send({
        status: "evolve",
        isShiny,
        pokemonPreEvolve: pokemon[0],
        pokemonEvolve: resultPokemon[0],
        quantity,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
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

  static catchPokemon = async (req, res) => {
    const { idPokemonWild, idTrainer, idBall } = req.body;

    try {
      const [pokemonWildResult] = await models.pokemon_wild.getById(
        idPokemonWild
      );

      if (!pokemonWildResult.length) {
        return res.status(201).send({ status: "noExistPokemon" });
      }

      const pokemonWild = pokemonWildResult[0];

      if (pokemonWild.isCatch) {
        return res.status(201).send({ status: "alreadyCatch" });
      }

      if (pokemonWild.isEscape) {
        return res.status(201).send({ status: "alreadyEscape" });
      }

      const [resultUpdate] = await models.pokeball_trainer.updateQuantity(
        idBall,
        idTrainer,
        1
      );

      if (resultUpdate.affectedRows === 0) {
        return res.status(201).send({ status: "noBall" });
      }

      const cacheKeyPokemon = `pokemon_${pokemonWild.idPokemon}`;
      const cacheKeyPokeball = `pokeball_${idBall}`;

      // Essayer de récupérer les données du cache
      let pokemonResult = myCache.get(cacheKeyPokemon);
      let pokeballResult = myCache.get(cacheKeyPokeball);

      // Si les données ne sont pas dans le cache, les récupérer de la base de données
      if (!pokemonResult || !pokeballResult) {
        const results = await Promise.all([
          models.pokemon.find(pokemonWild.idPokemon),
          models.pokeball.find(idBall),
        ]);

        pokemonResult = results[0];
        pokeballResult = results[1];

        // Mettre en cache les nouvelles données récupérées
        if (pokemonResult) {
          myCache.set(cacheKeyPokemon, pokemonResult);
        }
        if (pokeballResult) {
          myCache.set(cacheKeyPokeball, pokeballResult);
        }
      }

      let catchChance =
        pokemonResult[0][0].catchRate + pokeballResult[0][0].catchBonus;
      const escapeChance = pokemonResult[0][0].escapeRate;

      if (catchChance < 0) {
        catchChance = 1;
      }

      const randomCatch = Math.floor(Math.random() * 100);

      if (randomCatch <= catchChance) {
        await models.pokemon_trainer.insert({
          idPokemon: pokemonWild.idPokemon,
          idTrainer,
          isShiny: pokemonWild.isShiny,
        });

        await models.pokemon_wild.updateById(idPokemonWild, 1, 0);

        return res.status(201).send({
          status: "catch",
          pokemonName: pokemonResult[0][0].name,
        });
      }

      if (
        randomCatch > catchChance &&
        randomCatch <= catchChance + escapeChance
      ) {
        await models.pokemon_wild.updateById(idPokemonWild, 0, 1);

        return res.status(201).send({
          status: "escape",
          pokemonName: pokemonResult[0][0].name,
        });
      }

      return res.status(201).send({
        status: "noCatch",
        pokemonName: pokemonResult[0][0].name,
      });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  static shinyLuck = async (req, res) => {
    const { pokemonName } = req.body;
    try {
      const [resultPokemon] = await models.pokemon.findByName(pokemonName);
      if (resultPokemon.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      const shinyRate = resultPokemon[0].shinyRate;
      if (shinyRate === null) {
        res.status(201).send({ status: "noShinyRate" });
        return;
      }
      res.status(201).send({
        status: "shiny",
        shinyRate: shinyRate * this.shinyMultiplier(),
        imgShiny: resultPokemon[0].imgShiny,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };

  static catchPokemonLuck = async (req, res) => {
    const { pokemonName } = req.body;
    try {
      const [resultPokemon] = await models.pokemon.findByName(pokemonName);
      if (resultPokemon.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      if (resultPokemon[0].escapeRate === 300) {
        res.status(201).send({ status: "noCatchRate" });
        return;
      }
      const [resultPokeball] = await models.pokeball.findAll();
      res.status(201).send({
        status: "catchLuck",
        pokemonData: resultPokemon[0],
        pokeballData: resultPokeball,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };

  static sellPokemon = async (req, res) => {
    const { namePokemon, idTrainer, isShiny, max } = req.body;
    let { quantity } = req.body;

    try {
      const [resultId] = await models.pokemon.findByName(namePokemon);
      if (resultId.length === 0) {
        res.status(201).send({ status: "noExistPokemon" });
        return;
      }
      const idPokemon = resultId[0].id;

      if (max) {
        const [maxQtyResult] = await models.pokemon_trainer.findQuantity(
          idPokemon,
          idTrainer,
          isShiny
        );
        if (maxQtyResult[0].quantity === 0) {
          res.status(201).send({ status: "noPokemon", quantity: 1 });
          return;
        }
        if (maxQtyResult[0].quantity === 1) {
          quantity = 1;
        } else {
          quantity = maxQtyResult[0].quantity - 1;
        }
      }

      const [updateResult] = await models.pokemon_trainer.updateDownQuantity(
        idPokemon,
        idTrainer,
        quantity,
        isShiny
      );
      if (updateResult.affectedRows === 0) {
        res.status(201).send({ status: "noPokemon", quantity });
        return;
      }

      const [resultPokemon] = await models.pokemon.find(idPokemon);
      const sellPrice =
        resultPokemon[0].sellPrice * quantity * (isShiny ? 3 : 1);

      await models.trainer.updateMoney(idTrainer, sellPrice);

      res.status(201).send({
        status: "sell",
        pokemonName: resultPokemon[0].name,
        sellPrice,
        quantity,
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

module.exports = PokemonController;
