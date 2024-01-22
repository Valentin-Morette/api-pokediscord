const models = require("../models");

class RuneTrainerController {
  static browse = (req, res) => {
    models.runeTrainer
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
    models.runeTrainer
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
    const runeTrainer = req.body;

    runeTrainer.id = parseInt(req.params.id, 10);

    models.runeTrainer
      .update(runeTrainer)
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
    const runeTrainer = req.body;

    // TODO validations (length, format...)

    models.runeTrainer
      .insert(runeTrainer)
      .then(([result]) => {
        res.status(201).send({ ...runeTrainer, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.runeTrainer
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
              models.rune_trainer
                .insert(runeTrainer, quantity)
                .then(([result]) => {
                  res.status(201).send({ ...runeTrainer, id: result.insertId });
                })
                .catch((err) => {
                  console.error(err);
                  res.sendStatus(500);
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
}

module.exports = RuneTrainerController;
