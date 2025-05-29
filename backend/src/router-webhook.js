const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const models = require("./models");

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const discordId = event.data.object.metadata.discord_id;
      const { email } = event.data.object.customer_details;
      try {
        await models.trainer.addPremium(discordId, email);
        return res.status(200).send({ status: "success" });
      } catch (err) {
        console.error("❌ DB error:", err);
        return res.sendStatus(500);
      }
    }

    res.status(200).send({ received: true });
  }
);

module.exports = router;
