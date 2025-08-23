const models = require("../models");

class BugsIdeasController {
  static read = (req, res) => {
    models.bugs_ideas
      .findById(req.params.id)
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

  static insert = async (req, res) => {
    const data = req.body;

    try {
      const [[last]] = await models.bugs_ideas.findLastByTrainer(
        data.idTrainer,
        data.type
      );

      if (last) {
        const lastSent = new Date(last.createDate);
        const now = new Date();
        const diffInMinutes = (now - lastSent) / (1000 * 60);

        if (diffInMinutes < 10) {
          return res.status(201).send({ status: "alreadySent" });
        }
      }

      const [rows] = await models.bugs_ideas.insert(data);

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

  static delete = async (req, res) => {
    const { id } = req.params;
    await models.bugs_ideas.delete(id);
    res.json({ status: "success" });
  };

  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // DEBUG: Voir exactement ce qui arrive
      console.warn("=== DEBUG UPDATE BUGS-IDEAS ===");
      console.warn("req.params:", req.params);
      console.warn("req.body:", req.body);
      console.warn("req.body.status:", req.body.status);
      console.warn("typeof req.body.status:", typeof req.body.status);
      console.warn("status === null:", status === null);
      console.warn("status === undefined:", status === undefined);
      console.warn("status === '':", status === "");
      console.warn("==================================");

      // Validation du status
      if (status === null || status === undefined || status === "") {
        return res.status(400).json({
          status: "error",
          message: "Le status ne peut pas être vide ou null",
        });
      }

      await models.bugs_ideas.update(id, status);
      return res.json({ status: "success" });
    } catch (error) {
      console.error("Erreur lors de l'update:", error);
      return res.status(500).json({
        status: "error",
        message: "Erreur lors de la mise à jour",
      });
    }
  };

  static updateById = async (req, res) => {
    try {
      const { id, status } = req.body;

      // DEBUG: Voir exactement ce qui arrive
      console.warn("=== DEBUG UPDATE BY ID BUGS-IDEAS ===");
      console.warn("req.body:", req.body);
      console.warn("id:", id);
      console.warn("status:", status);
      console.warn("=====================================");

      // Validation
      if (!id || !status) {
        return res.status(400).json({
          status: "error",
          message: "L'id et le status sont requis",
        });
      }

      await models.bugs_ideas.update(id, status);
      return res.json({ status: "success" });
    } catch (error) {
      console.error("Erreur lors de l'update by id:", error);
      return res.status(500).json({
        status: "error",
        message: "Erreur lors de la mise à jour",
      });
    }
  };
}

module.exports = BugsIdeasController;
