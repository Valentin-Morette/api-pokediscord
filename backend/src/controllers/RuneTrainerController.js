const models = require("../models");

class RuneTrainerController {
  static browse = (req, res) => {
    models.rune_trainer
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
    models.rune_trainer
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
    let countRune = 0;
    let sumRune = 0;
    const idTrainer = req.params.idDiscordTrainer;
    models.rune_trainer.countAndSumRuneByTrainer(idTrainer).then(([result]) => {
      countRune = result[0].count;
      sumRune = parseInt(result[0].sum, 10);
      models.rune_trainer
        .findAllByTrainer(idTrainer)
        .then(([rows]) => {
          res.send({ countRune, sumRune, rune: rows });
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    });
  };

  static delete = (req, res) => {
    models.rune_trainer
      .delete(req.params.id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static buy = (req, res) => {
    const { idTrainer, pokemonName, quantity } = req.body;
    models.pokemon
      .findByName(pokemonName)
      .then(([rowPokemon]) => {
        if (rowPokemon.length === 0) {
          res.status(201).send({ status: "noExistPokemon" });
        } else if (rowPokemon[0].catchRate === -100) {
          res.status(201).send({ status: "noSell" });
        } else {
          models.trainer.find(idTrainer).then(([rowsTrainer]) => {
            const runePrice = rowPokemon[0].sellPrice * quantity * 3;
            if (rowsTrainer[0].money < runePrice) {
              res.send({
                status: "noMoney",
              });
            } else {
              models.trainer.updateMoney(idTrainer, -runePrice);
              const runeTrainer = {
                idTrainer,
                idPokemon: rowPokemon[0].id,
                isShiny: 0,
              };
              models.rune_trainer.insert(runeTrainer, quantity);
              res
                .status(201)
                .send({ status: "buy", ...runeTrainer, priceSend: runePrice });
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}

module.exports = RuneTrainerController;
