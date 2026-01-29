const models = require("../models");

class ServerTrainerController {
  static leave = async (req, res) => {
    const { idTrainer, idServer } = req.body;
    try {
      await models.server_trainer.updateIsOnServer(idTrainer, idServer, 0);
      return res.status(200).send({ status: "success" });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  static bulk = async (req, res) => {
    const { rows = [] } = req.body;
    console.log(rows);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).send({ error: "rows array is required" });
    }
    try {
      const seen = new Set();
      const values = [];
      for (const r of rows) {
        const idTrainer = r.idTrainer ?? r[0];
        const idServer = r.idServer ?? r[1];
        if (idTrainer == null || idServer == null) continue;
        const key = `${idTrainer}:${idServer}`;
        if (seen.has(key)) continue;
        seen.add(key);
        values.push([idTrainer, idServer, 1]);
      }
      await models.server_trainer.insertBulkIsOnServer(values);
      return res.status(200).send({
        status: "success",
        inserted: values.length,
      });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = ServerTrainerController;
