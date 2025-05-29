const express = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const bodyParser = require("body-parser");
// const models = require("./models");
const StripeController = require("./controllers/StripeController");

const {
  PokemonController,
  ZoneController,
  PokeballController,
  TrainerController,
  RuneTrainerController,
  PokemonWildController,
} = require("./controllers");

const router = express.Router();

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
router.get("/trainer/verify/:idDiscord", TrainerController.verifyIdDiscord);
router.post("/trainer", TrainerController.add);
router.post("/trainer/affiliate", TrainerController.affiliate);
router.post("/trainer/pokemon/trade", TrainerController.tradePokemon);
router.post("/trainer/premium", TrainerController.addPremium);
router.delete("/trainer/:idDiscord", TrainerController.delete);

router.get("/rune/:idDiscordTrainer", RuneTrainerController.readByTrainer);
router.post("/rune/buy", RuneTrainerController.buy);
router.post("/rune/use", PokemonController.useRune);

router.get("/zone/pokemon/:name", ZoneController.findZoneByPokemonName);
router.get("/zone/:generation", ZoneController.readByGeneration);

router.get("/recap", PokemonWildController.recap);

router.post(
  "/payment/create-checkout-session",
  StripeController.createCheckoutSession
);

// router.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   // eslint-disable-next-line consistent-return
//   (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;
//     console.error("Received webhook event:");

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error("❌ Webhook Error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       console.error("Checkout session completed:");
//       const discordId = event.data.object.metadata.discord_id;
//       const { email } = event.data.object.customer_details;
//       models.trainer
//         .addPremium(discordId, email)
//         .then(() => {
//           res.status(200).send({ status: "success" });
//         })
//         .catch((err) => {
//           console.error(err);
//           res.sendStatus(500);
//         });
//     }

//     res.status(200).send({ received: true });
//   }
// );

module.exports = router;
