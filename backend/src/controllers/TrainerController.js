const models = require("../models");

class TrainerController {
  static browse = (req, res) => {
    models.trainer
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
    models.trainer
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
    const trainer = req.body;

    trainer.id = parseInt(req.params.id, 10);

    models.trainer
      .update(trainer)
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
    const trainer = req.body;

    models.trainer
      .insert(trainer)
      .then(([result]) => {
        res.status(201).send({ ...trainer, id: result.insertId });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.trainer
      .delete(req.params.id)
      .then(() => {
        res.sendStatus(204);
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
}

module.exports = TrainerController;
