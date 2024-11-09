const express = require("express");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
  RuneTrainerController,
} = require("./controllers");

const router = express.Router();

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);
router.get("/pokeball/trainer/:id", PokeballController.readByTrainer);
router.post("/pokeball/buy", PokeballController.buy);

router.get("/pokemon/trainer/:id/:type", PokemonController.readByTrainer);
router.post("/pokemon", PokemonController.import);
router.post("/pokemon/catch", PokemonController.catchPokemon);
router.post("/pokemon/evolve", PokemonController.evolvePokemon);
router.post("/pokemon/info", PokemonController.infoPokemon);
router.post("/pokemon/quantity", PokemonController.quantityPokemon);
router.post("/pokemon/sell", PokemonController.sellPokemon);
router.post("/pokemon/wild", PokemonController.addPokemonWild);
router.post("/pokemon/zone", PokemonController.findAllInZone);
router.delete("/pokemon/wild", PokemonController.deletePokemonWild);

router.get("/trainer/:idDiscord", TrainerController.read);
router.get("/trainer/verify/:idDiscord", TrainerController.verifyIdDiscord);
router.post("/trainer/affiliate", TrainerController.affiliate);
router.post("/trainer", TrainerController.add);
router.post("/trainer/pokemon/trade", TrainerController.tradePokemon);
router.delete("/trainer/:idDiscord", TrainerController.delete);

router.get("/rune/:idDiscordTrainer", RuneTrainerController.readByTrainer);
router.post("/rune/buy", RuneTrainerController.buy);
router.post("/rune/use", PokemonController.useRune);

router.get("/zone/pokemon/:name", ZoneController.findZoneByPokemonName);

module.exports = router;
