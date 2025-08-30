class TopggController {
  static voteWebhook = async (req, res) => {
    try {
      console.warn("🔍 Webhook Top.gg appelé");
      console.warn("📋 Headers reçus:", JSON.stringify(req.headers, null, 2));
      console.warn("📦 Body reçu:", JSON.stringify(req.body, null, 2));
      console.warn("🔑 Token attendu:", process.env.TOKEN_TOPGG);

      // Vérification temporairement désactivée pour debug
      // const authHeader = req.headers.authorization;
      // const expectedToken = process.env.TOKEN_TOPGG;

      // if (!authHeader || authHeader !== expectedToken) {
      //   console.warn("❌ Token Top.gg invalide ou manquant:", authHeader);
      //   return res.status(401).json({
      //     status: "error",
      //     message: "Token d'authentification invalide",
      //   });
      // }

      // Log des données reçues
      console.warn("🎉 Vote Top.gg reçu !");
      console.warn("Données complètes:", JSON.stringify(req.body, null, 2));

      // Réponse de succès à Top.gg
      return res.status(200).json({
        status: "success",
        message: "Vote reçu avec succès",
      });
    } catch (error) {
      console.error("❌ Erreur dans le webhook Top.gg:", error);
      return res.status(500).json({
        status: "error",
        message: "Erreur interne du serveur",
      });
    }
  };
}

module.exports = TopggController;
