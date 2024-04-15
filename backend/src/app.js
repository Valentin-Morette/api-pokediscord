const express = require("express");
const path = require("path");
const cors = require("cors");
const router = require("./router");

const app = express();

// Middleware pour vérifier la clé API
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

// use some application-level middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// Serve the public folder for public resources
app.use(express.static(path.join(__dirname, "../public")));

// Serve REACT APP
app.use(express.static(path.join(__dirname, "..", "..", "frontend", "dist")));

app.use(apiKeyMiddleware);

// API routes
app.use(router);

// Redirect all requests to the REACT app
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "frontend", "dist", "index.html")
  );
});

// ready to export
module.exports = app;
