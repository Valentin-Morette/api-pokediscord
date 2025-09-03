const models = require("../models");

class TrainerController {
  static read = (req, res) => {
    models.trainer
      .find(req.params.idDiscord)
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

  static add = async (req, res) => {
    try {
      const { trainer, ball = [] } = req.body;

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let affiliateCode = "";
      for (let i = 0; i < 8; i += 1)
        affiliateCode += chars[Math.floor(Math.random() * chars.length)];

      trainer.affiliateCode = affiliateCode;

      const [result] = await models.trainer.upsert(trainer);

      const created = result.affectedRows === 1;

      if (created && ball.length) {
        await Promise.all(
          ball.map((b) =>
            models.pokeball_trainer.insert(b.id, trainer.idDiscord, b.quantity)
          )
        );
        return res.status(201).send({ trainer, created: true });
      }

      return res
        .status(200)
        .send({ message: "Trainer already exists", created: false });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  static bulkAdd = async (req, res) => {
    const { trainers = [], money, ball = [] } = req.body;
    if (!Array.isArray(trainers) || trainers.length === 0) {
      return res.status(400).send({ error: "trainers array is required" });
    }
    if (typeof money !== "number") {
      return res.status(400).send({ error: "money must be a number" });
    }

    const map = new Map();
    for (const t of trainers) {
      if (t?.idDiscord && t?.name) map.set(t.idDiscord, t);
    }
    const list = Array.from(map.values());
    const ids = list.map((t) => t.idDiscord);

    const conn = models.trainer.connection;
    const genCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let s = "";
      for (let i = 0; i < 8; i += 1)
        s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };

    try {
      const [existingBefore] = await conn.query(
        `SELECT idDiscord FROM trainer WHERE idDiscord IN (?)`,
        [ids]
      );
      const existed = new Set(existingBefore.map((r) => r.idDiscord));

      const values = list.map((t) => [
        t.idDiscord,
        t.name,
        money,
        genCode(),
        t.firstServerId ?? null,
      ]);

      await conn.query(
        `INSERT INTO trainer (idDiscord, name, money, affiliateCode, firstServerId)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         firstServerId = COALESCE(firstServerId, VALUES(firstServerId))`,
        [values]
      );

      const newIds = list
        .map((t) => t.idDiscord)
        .filter((id) => !existed.has(id));

      if (newIds.length && ball.length) {
        const ballValues = [];
        for (const id of newIds) {
          for (const b of ball) {
            ballValues.push([b.id, id, b.quantity]);
          }
        }
        await models.pokeball_trainer.connection.query(
          `INSERT INTO pokeball_trainer (idPokeball, idTrainer, quantity) VALUES ?`,
          [ballValues]
        );
      }

      return res.status(200).send({
        total: list.length,
        created: newIds.length,
        skipped: list.length - newIds.length,
      });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  static swapForTrade = (trade, payload, accept = true) => {
    models.pokemon_trainer
      .updateDownQuantity(
        accept ? trade.idPokemonPropose : trade.idPokemonRequest,
        accept ? trade.idTrainer : payload.idTrainer,
        accept ? trade.quantityPokemonPropose : trade.quantityPokemonRequest,
        accept ? trade.isShinyPropose : trade.isShinyRequest
      )
      .then(() => {
        const pokemondPropose = {
          idPokemon: accept ? trade.idPokemonRequest : trade.idPokemonPropose,
          idTrainer: accept ? trade.idTrainer : payload.idTrainer,
          isShiny: accept ? trade.isShinyRequest : trade.isShinyPropose,
        };
        models.pokemon_trainer.insert(
          pokemondPropose,
          accept ? trade.quantityPokemonRequest : trade.quantityPokemonPropose
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  static affiliate = (req, res) => {
    const { affiliateCode } = req.body;
    const { idTrainer } = req.body;
    models.trainer
      .findTrainerByAffiliationCode(affiliateCode)
      .then(([trainergodfather]) => {
        if (trainergodfather[0] == null) {
          res.status(200).send({ status: "noExistCode" });
        } else {
          models.trainer
            .find(idTrainer)
            .then(([trainer]) => {
              if (trainer[0].affiliateCodeUse != null) {
                res.status(200).send({ status: "alreadyAffiliate" });
              } else if (
                trainer[0].idDiscord === trainergodfather[0].idDiscord
              ) {
                res.status(200).send({ status: "sameTrainer" });
              } else {
                models.trainer
                  .affiliate(idTrainer, trainergodfather[0].idDiscord)
                  .then(() => {
                    res.status(200).send({
                      status: "success",
                      name: trainergodfather[0].name,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    res.sendStatus(500);
                  });
              }
            })
            .catch((err) => {
              console.error(err);
              res.sendStatus(500);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static verifyPokemon = (idTrainer, idPokemon, quantity, isShiny) => {
    return models.pokemon_trainer
      .findOnePokemonByTrainer(idTrainer, idPokemon, isShiny)
      .then(([rows]) => {
        if (rows[0] == null || rows[0].quantity < quantity) {
          return false;
        }
        return true;
      });
  };

  static addPremium = (req, res) => {
    const { idDiscord } = req.body;
    models.trainer
      .addPremium(idDiscord)
      .then(() => {
        res.status(200).send({ status: "success" });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static tradePokemon = (req, res) => {
    const payload = req.body;
    if (payload.type === "propose") {
      models.pokemon.findByName(payload.pokemonPropose).then(([rowsPkmn1]) => {
        if (rowsPkmn1.length === 0) {
          res.status(201).send({ status: "not found pokemon propose" });
          return;
        }
        const pokemonPropose = rowsPkmn1[0];
        this.verifyPokemon(
          payload.idTrainer,
          pokemonPropose.id,
          payload.quantityPokemonPropose,
          payload.pokemonProposeShiny
        ).then((isValid) => {
          if (!isValid) {
            res.status(200).send({ status: "not enough pokemon propose" });
            return;
          }
          models.pokemon
            .findByName(payload.pokemonRequest)
            .then(([rowsPkmn2]) => {
              if (rowsPkmn2.length === 0) {
                res.status(201).send({ status: "not found pokemon request" });
                return;
              }
              const pokemonRequest = rowsPkmn2[0];
              models.trade
                .insert(
                  payload.idTrainer,
                  pokemonPropose.id,
                  pokemonRequest.id,
                  payload.quantityPokemonPropose,
                  payload.quantityPokemonRequest,
                  payload.pokemonProposeShiny,
                  payload.pokemonRequestShiny
                )
                .then(([result]) => {
                  res.status(201).send({
                    status: "success",
                    idTrade: result.insertId,
                    imgPokemonPropose: payload.pokemonProposeShiny
                      ? pokemonPropose.imgShiny
                      : pokemonPropose.img,
                    imgPokemonRequest: payload.pokemonRequestShiny
                      ? pokemonRequest.imgShiny
                      : pokemonRequest.img,
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
        });
      });
    } else if (payload.type === "accept") {
      models.trade.find(payload.idTrade).then(([rows]) => {
        const trade = rows[0];
        if (!trade.isAccept) {
          this.verifyPokemon(
            trade.idTrainer,
            trade.idPokemonPropose,
            trade.quantityPokemonPropose,
            trade.isShinyPropose
          )
            .then((isValidForPropose) => {
              if (isValidForPropose) {
                return this.verifyPokemon(
                  payload.idTrainer,
                  trade.idPokemonRequest,
                  trade.quantityPokemonRequest,
                  trade.isShinyRequest
                );
              }
              res.status(200).send({ status: "not enough pokemon propose" });
              throw new Error("Bypass next then()");
            })
            .then((isValidForRequest) => {
              if (isValidForRequest) {
                this.swapForTrade(trade, payload, false);
                this.swapForTrade(trade, payload, true);
                return models.trade.updateAccept(payload.idTrade);
              }
              res.status(200).send({ status: "not enough pokemon request" });
              throw new Error("Bypass next then()");
            })
            .then(() => {
              res.status(200).send({ status: "success" });
            })
            .catch((err) => {
              if (err.message !== "Bypass next then()") {
                console.error(err);
                res.sendStatus(500);
              }
            });
        } else {
          res.status(200).send({ status: "already accepted" });
        }
      });
    }
  };

  static gift = (req, res) => {
    models.trainer
      .find(req.params.idDiscord)
      .then(([rows]) => {
        if (rows[0] == null) {
          res.sendStatus(404);
        } else {
          const now = new Date();
          const lastGift = new Date(rows[0].lastGift);
          const { isPremium } = rows[0];
          const delay = isPremium ? 14400000 : 43200000;
          if (now - lastGift < delay) {
            res.status(200).send({
              status: "alreadyGift",
              remainning: delay - (now - lastGift),
              isPremium,
            });
            return;
          }

          const moneyChance = 45;
          const ballChance = 85;
          const pokemonChance = 100;
          const random = Math.floor(Math.random() * 100);

          if (random < moneyChance) {
            const amount = Math.floor(Math.random() * 35) * 100 + 1000; // Between 1000 and 4500
            models.trainer
              .updateMoney(req.params.idDiscord, amount)
              .then(() => {
                models.trainer.updateLastGift(req.params.idDiscord).then(() => {
                  res.status(200).send({ status: "successMoney", amount });
                });
              });
          } else if (random < ballChance) {
            models.pokeball
              .findRandomForGift()
              .then(([pokeballs]) => {
                const pokeball = pokeballs[0];
                const quantity = Math.floor(Math.random() * 15) + 11; // Between 11 and 25
                models.pokeball_trainer
                  .insertMany(pokeball.id, req.params.idDiscord, quantity)
                  .then(() => {
                    models.trainer
                      .updateLastGift(req.params.idDiscord)
                      .then(() => {
                        res
                          .status(200)
                          .send({ status: "successBall", pokeball, quantity });
                      });
                  });
              })
              .catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
          } else if (random <= pokemonChance) {
            models.pokemon
              .findRandomPokemon()
              .then(([pokemons]) => {
                const pokemon = pokemons[0];
                const isShiny = Math.floor(Math.random() * 100) < 5;
                models.pokemon_trainer
                  .insert(
                    {
                      idPokemon: pokemon.id,
                      idTrainer: req.params.idDiscord,
                      isShiny,
                    },
                    1
                  )
                  .then(() => {
                    models.trainer
                      .updateLastGift(req.params.idDiscord)
                      .then(() => {
                        res
                          .status(200)
                          .send({ status: "successPokemon", pokemon, isShiny });
                      });
                  });
              })
              .catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.trainer
      .delete(req.params.idDiscord)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static cleanupInactive = async (req, res) => {
    try {
      const { activeUserIds = [] } = req.body;

      if (!Array.isArray(activeUserIds)) {
        return res.status(400).json({
          status: "error",
          message: "activeUserIds doit être un tableau"
        });
      }

      // Mettre à jour tous les trainers : isOnServer = 0 par défaut
      await models.trainer.connection.query(
        `UPDATE trainer SET isOnServer = 0`
      );

      // Si on a des activeUserIds, mettre isOnServer = 1 pour ceux-là
      if (activeUserIds.length > 0) {
        await models.trainer.connection.query(
          `UPDATE trainer SET isOnServer = 1 WHERE idDiscord IN (?)`,
          [activeUserIds]
        );
      }

      return res.status(200).json({
        status: "success",
        message: "Nettoyage des trainers inactifs terminé",
        updatedCount: activeUserIds.length
      });
    } catch (error) {
      console.error("Erreur lors du nettoyage des trainers inactifs:", error);
      return res.status(500).json({
        status: "error",
        message: "Erreur lors du nettoyage des trainers inactifs"
      });
    }
  };
}

module.exports = TrainerController;
