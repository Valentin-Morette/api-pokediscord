const express = require("express");

const { PokemonController } = require("./controllers");

const router = express.Router();

router.get("/pokemon", PokemonController.browse);
router.get("/pokemon/:id", PokemonController.read);
router.put("/pokemon/:id", PokemonController.edit);
router.post("/pokemon", PokemonController.add);
router.delete("/pokemon/:id", PokemonController.delete);

module.exports = router;
