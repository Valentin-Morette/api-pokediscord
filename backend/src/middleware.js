const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.get("X-API-KEY"); // Obtient la clé API de l'en-tête de la requête
  if (apiKey && apiKey === process.env.API_KEY) {
    next(); // Si la clé API est correcte, continue vers le prochain middleware
  } else {
    res
      .status(401)
      .json({ error: "Accès non autorisé. Clé API invalide ou manquante." });
  }
};

module.exports = apiKeyMiddleware;
