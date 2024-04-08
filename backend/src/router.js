const express = require("express");
// const { apiKeyMiddleware } = require("./middleware");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
  RoleController,
  RuneTrainerController,
} = require("./controllers");

const router = express.Router();

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);
router.get("/pokeball/trainer/:id", PokeballController.readByTrainer);
router.post("/pokeball/buy", PokeballController.buy);

router.get("/pokemon", PokemonController.browse);
router.get("/pokemon/:id", PokemonController.read);
router.get("/pokemon/trainer/:id/:type", PokemonController.readByTrainer);
router.post("/pokemon", PokemonController.add);
router.post("/pokemon/catch", PokemonController.catchPokemon);
router.post("/pokemon/evolve", PokemonController.evolvePokemon);
router.post("/pokemon/info", PokemonController.infoPokemon);
router.post("/pokemon/sell", PokemonController.sellPokemon);
router.post("/pokemon/wild", PokemonController.addPokemonWild);
router.post("/pokemon/zone", PokemonController.findAllInZone);
router.put("/pokemon/:id", PokemonController.edit);
router.delete("/pokemon/wild", PokemonController.deletePokemonWild);
router.delete("/pokemon/:id", PokemonController.delete);

router.get("/role", RoleController.browse);
router.get("/role/:id", RoleController.read);

router.get("/trainer", TrainerController.browse);
router.get("/trainer/:idDiscord", TrainerController.read);
router.get("/trainer/verify/:idDiscord", TrainerController.verifyIdDiscord);
router.post("/trainer", TrainerController.add);
router.post("/trainer/pokemon/trade", TrainerController.tradePokemon);
router.put("/trainer/:id", TrainerController.edit);
router.delete("/trainer/:id", TrainerController.delete);

router.get("/rune/:idDiscordTrainer", RuneTrainerController.readByTrainer);
router.post("/rune/buy", RuneTrainerController.buy);
router.post("/rune/use", PokemonController.useRune);

router.get("/zone", ZoneController.browse);
router.get("/zone/:id", ZoneController.read);
router.get("/zone/pokemon/:name", ZoneController.findZoneByPokemonName);

module.exports = router;
