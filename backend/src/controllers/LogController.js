const models = require("../models");

class LogController {
  static async createLog(req, res) {
    try {
      const { idServer, idDiscord, type, category, message } = req.body;

      // Validation des données requises
      if (!type || !category || !message) {
        return res.status(400).json({
          error: "Les champs type, category et message sont obligatoires",
        });
      }

      // Validation du type (doit être une des valeurs de l'enum)
      const validTypes = ["ERROR", "CRITICAL", "SUCCESS", "INFO", "WARN"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error:
            "Le type doit être une des valeurs suivantes: ERROR, CRITICAL, SUCCESS, INFO, WARN",
        });
      }

      const logData = {
        idServer: idServer || null,
        idDiscord: idDiscord || null,
        type,
        category,
        message,
      };

      const insertId = await models.logs.insert(logData);

      return res.status(201).json({
        message: "Log créé avec succès",
        id: insertId,
        log: logData,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Erreur interne du serveur lors de la création du log : ${error}`,
      });
    }
  }

  static async getAllLogs(req, res) {
    try {
      const logs = await models.logs.findAll();

      return res.status(200).json({
        message: "Logs récupérés avec succès",
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erreur interne du serveur lors de la récupération des logs",
      });
    }
  }

  static async getLogsByServer(req, res) {
    try {
      const { idServer } = req.params;
      const logs = await models.logs.findByServer(idServer);

      return res.status(200).json({
        message: "Logs du serveur récupérés avec succès",
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        error:
          "Erreur interne du serveur lors de la récupération des logs du serveur",
      });
    }
  }

  static async getLogsByDiscord(req, res) {
    try {
      const { idDiscord } = req.params;
      const logs = await models.logs.findByDiscord(idDiscord);

      return res.status(200).json({
        message: "Logs de l'utilisateur Discord récupérés avec succès",
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        error:
          "Erreur interne du serveur lors de la récupération des logs de l'utilisateur Discord",
      });
    }
  }

  static async getLogsByType(req, res) {
    try {
      const { type } = req.params;
      const logs = await models.logs.findByType(type);

      return res.status(200).json({
        message: "Logs du type récupérés avec succès",
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        error:
          "Erreur interne du serveur lors de la récupération des logs du type",
      });
    }
  }

  static async getLogsByCategory(req, res) {
    try {
      const { category } = req.params;
      const logs = await models.logs.findByCategory(category);

      return res.status(200).json({
        message: "Logs de la catégorie récupérés avec succès",
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        error:
          "Erreur interne du serveur lors de la récupération des logs de la catégorie",
      });
    }
  }
}

module.exports = LogController;
