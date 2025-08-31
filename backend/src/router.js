const express = require("express");
const StripeController = require("./controllers/StripeController");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
  RuneTrainerController,
  PokemonWildController,
  BugsIdeasController,
  ServersController,
  DashboardController,
  LogController,
  TopggController,
} = require("./controllers");

const router = express.Router();

router.post("/bugs-ideas", BugsIdeasController.insert);
router.delete("/bugs-ideas/:id", BugsIdeasController.delete);
router.put("/bugs-ideas/:id", BugsIdeasController.update);

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);
router.get("/pokeball/trainer/:id", PokeballController.readByTrainer);
router.post("/pokeball/buy", PokeballController.buy);

router.get(
  "/pokemon/trainer/:id/:generation/:type",
  PokemonController.readByTrainer
);
router.post("/pokemon", PokemonController.import);
router.post("/pokemon/catch", PokemonController.catchPokemon);
router.post("/pokemon/catch-luck", PokemonController.catchPokemonLuck);
router.post("/pokemon/evolve", PokemonController.evolvePokemon);
router.post("/pokemon/info", PokemonController.infoPokemon);
router.post("/pokemon/quantity", PokemonController.quantityPokemon);
router.post("/pokemon/sell", PokemonController.sellPokemon);
router.post("/pokemon/shiny-luck", PokemonController.shinyLuck);
router.post("/pokemon/wild", PokemonController.addPokemonWild);
router.post("/pokemon/zone", PokemonController.findAllInZone);
router.delete("/pokemon/wild", PokemonController.deletePokemonWild);

router.get("/trainer/:idDiscord", TrainerController.read);
router.get("/trainer/gift/:idDiscord", TrainerController.gift);
router.post("/trainer", TrainerController.add);
router.post("/trainer/affiliate", TrainerController.affiliate);
router.post("/trainer/bulk", TrainerController.bulkAdd);
router.post("/trainer/pokemon/trade", TrainerController.tradePokemon);
router.post("/trainer/premium", TrainerController.addPremium);
router.delete("/trainer/:idDiscord", TrainerController.delete);

router.get("/rune/:idDiscordTrainer", RuneTrainerController.readByTrainer);
router.post("/rune/buy", RuneTrainerController.buy);
router.post("/rune/use", PokemonController.useRune);

router.get("/servers/uninstal", ServersController.getUninstal);
router.post("/servers", ServersController.insert);
router.put("/servers/:id", ServersController.update);

router.get("/zone/pokemon/:name", ZoneController.findZoneByPokemonName);
router.get("/zone/:generation", ZoneController.readByGeneration);

router.get("/recap", PokemonWildController.recap);

router.get("/dashboard/stats", DashboardController.getStats);
router.get("/dashboard/servers", DashboardController.getServers);
router.get("/dashboard/bugs-ideas", DashboardController.getBugsIdeas);
router.get("/dashboard/sales", DashboardController.getSales);
router.get("/dashboard/trainers", DashboardController.getTrainers);
router.get("/dashboard/pokemon-wild", DashboardController.getPokemonWild);

router.post(
  "/payment/create-checkout-session",
  StripeController.createCheckoutSession
);

// Routes pour les logs
router.post("/logs", LogController.createLog);
router.get("/logs", LogController.getAllLogs);
router.get("/logs/server/:idServer", LogController.getLogsByServer);
router.get("/logs/discord/:idDiscord", LogController.getLogsByDiscord);
router.get("/logs/type/:type", LogController.getLogsByType);
router.get("/logs/category/:category", LogController.getLogsByCategory);

// Route pour reset des streaks
router.post("/topgg/reset-streaks", TopggController.resetStreaks);

module.exports = router;
