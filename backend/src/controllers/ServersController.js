const models = require("../models");

class ServersController {
  static insert = async (req, res) => {
    const data = req.body;
    try {
      const [rows] = await models.servers.insert(data);

      if (rows.affectedRows === 0) {
        return res
          .status(201)
          .send({ status: "error", message: "Creation failed" });
      }
      return res.status(201).send({ status: "success", id: rows.insertId });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  static update = async (req, res) => {
    const { id } = req.params;
    const { isInstal, isDelete } = req.body;

    try {
      if (isInstal !== undefined) {
        await models.servers.updateIsInstal(id, isInstal);
      }
      if (isDelete !== undefined) {
        await models.servers.updateIsDelete(id, isDelete);
      }
      res.status(200).send({ status: "success" });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

module.exports = ServersController;
