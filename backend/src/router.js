const express = require("express");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
} = require("./controllers");

const router = express.Router();

router.get("/pokemon", PokemonController.browse);
router.get("/pokemon/:id", PokemonController.read);
router.post("/pokemon", PokemonController.add);
router.put("/pokemon/:id", PokemonController.edit);
router.delete("/pokemon/:id", PokemonController.delete);

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);

router.get("/trainer", TrainerController.browse);
router.get("/trainer/:id", TrainerController.read);
router.post("/trainer", TrainerController.add);
router.put("/trainer/:id", TrainerController.edit);
router.delete("/trainer/:id", TrainerController.delete);

router.get("/zone", ZoneController.browse);
router.get("/zone/:id", ZoneController.read);

module.exports = router;
