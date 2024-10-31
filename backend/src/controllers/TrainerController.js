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

  static add = (req, res) => {
    const payload = req.body;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let affiliateCode = "";
    for (let i = 0; i < 8; i += 1) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      affiliateCode += characters[randomIndex];
    }
    payload.trainer.affiliateCode = affiliateCode;

    models.trainer
      .insert(payload.trainer)
      .then(([result]) => {
        for (const pokeball of payload.ball) {
          models.pokeball_trainer.insert(
            pokeball.id,
            payload.trainer.idDiscord,
            pokeball.quantity
          );
        }
        res.status(201).send({ trainer: payload.trainer, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static verifyIdDiscord = (req, res) => {
    models.trainer
      .verifyIdDiscord(req.params.idDiscord)
      .then(([rows]) => {
        if (rows[0] == null) {
          res.status(200).send({ hasAccount: false });
        } else {
          res.status(200).send({ hasAccount: true });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
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
}

module.exports = TrainerController;
