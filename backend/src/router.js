const express = require("express");

const {
  PokemonController,
  ZoneController,
  PokeballController,
} = require("./controllers");

const router = express.Router();

router.get("/pokemon", PokemonController.browse);
router.get("/pokemon/:id", PokemonController.read);
router.post("/pokemon", PokemonController.add);
router.put("/pokemon/:id", PokemonController.edit);
router.delete("/pokemon/:id", PokemonController.delete);

router.get("/pokeball", PokeballController.browse);
router.get("/pokeball/:id", PokeballController.read);

router.get("/zone", ZoneController.browse);
router.get("/zone/:id", ZoneController.read);

module.exports = router;
