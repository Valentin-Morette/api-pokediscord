const express = require("express");
const path = require("path");
const cors = require("cors");
const webhookRouter = require("./router-webhook");
const router = require("./router");

const app = express();

app.use("/webhook", webhookRouter);

app.use(express.static(path.join(__dirname, "public")));

// eslint-disable-next-line consistent-return
const apiKeyMiddleware = (req, res, next) => {
  const exemptPaths = [
    "/payment-success",
    "/payment-cancel",
    "/webhook",
    "/phpmyadmin",
  ];

  if (exemptPaths.includes(req.path)) {
    return next();
  }

  const apiKey = req.get("X-API-KEY");
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res
      .status(401)
      .json({ error: "Accès non autorisé. Clé API invalide ou manquante." });
  }
};

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

// ready to export
module.exports = app;
