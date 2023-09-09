const models = require("../models");

class PokeballController {
  static browse = (req, res) => {
    models.pokeball
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
    models.pokeball
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
    models.pokeball
      .findByTrainer(req.params.id)
      .then(([rows]) => {
        res.send(rows);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static edit = (req, res) => {
    const pokeball = req.body;

    pokeball.id = parseInt(req.params.id, 10);

    models.pokeball
      .update(pokeball)
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
    const pokeball = req.body;

    models.pokeball
      .insert(pokeball)
      .then(([result]) => {
        res.status(201).send({ ...pokeball, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static buy = (req, res) => {
    const { idBall } = req.body;
    const { idDiscord } = req.body;
    const { quantity } = req.body;
    models.pokeball
      .find(idBall)
      .then(([rowsBall]) => {
        if (rowsBall[0] == null) {
          res.sendStatus(404);
        } else {
          models.trainer
            .find(idDiscord)
            .then(([rowsTrainer]) => {
              if (rowsTrainer[0].money < rowsBall[0].buyingPrice * quantity) {
                res.sendStatus(403);
              } else {
                models.pokeball_trainer
                  .insertMany(idBall, idDiscord, quantity)
                  .then(() => {
                    models.trainer
                      .updateMoney(
                        idDiscord,
                        -rowsBall[0].buyingPrice * quantity
                      )
                      .then(() => {
                        res.send({
                          status: "success",
                          message: "Pokeball(s) bought",
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

  static delete = (req, res) => {
    models.pokeball
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

module.exports = PokeballController;
