const models = require("../models");

class PokeballTrainerController {
  static browse = (req, res) => {
    models.pokeballTrainer
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
    models.pokeballTrainer
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
    const pokeballTrainer = req.body;

    pokeballTrainer.id = parseInt(req.params.id, 10);

    models.pokeballTrainer
      .update(pokeballTrainer)
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
    const pokeballTrainer = req.body;

    // TODO validations (length, format...)

    models.pokeballTrainer
      .insert(pokeballTrainer)
      .then(([result]) => {
        res.status(201).send({ ...pokeballTrainer, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.pokeballTrainer
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

module.exports = PokeballTrainerController;
