const express = require("express");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
  RoleController,
  ChampionController,
} = require("./controllers");

const router = express.Router();

router.get("/champion", ChampionController.browse);

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);
router.get("/pokeball/trainer/:id", PokeballController.readByTrainer);
router.post("/pokeball/buy", PokeballController.buy);

router.get("/pokemon", PokemonController.browse);
router.get("/pokemon/:id", PokemonController.read);
router.get("/pokemon/trainer/:id", PokemonController.readByTrainer);
router.post("/pokemon", PokemonController.add);
router.post("/pokemon/catch", PokemonController.catchPokemon);
router.post("/pokemon/sell", PokemonController.sellPokemon);
router.post("/pokemon/wild", PokemonController.addPokemonWild);
router.post("/pokemon/zone", PokemonController.findInZone);
router.put("/pokemon/:id", PokemonController.edit);
router.delete("/pokemon/:id", PokemonController.delete);

router.get("/role", RoleController.browse);
router.get("/role/:id", RoleController.read);

router.get("/trainer", TrainerController.browse);
router.get("/trainer/:idDiscord", TrainerController.read);
router.get("/trainer/verify/:idDiscord", TrainerController.verifyIdDiscord);
router.post("/trainer", TrainerController.add);
router.put("/trainer/:id", TrainerController.edit);
router.delete("/trainer/:id", TrainerController.delete);

router.get("/zone", ZoneController.browse);
router.get("/zone/:id", ZoneController.read);

module.exports = router;
