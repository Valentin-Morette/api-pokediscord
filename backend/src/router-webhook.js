const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const models = require("./models");

const router = express.Router();

router.post(
  "/",
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

    const ballDataPackage = {
      pokeball: { id: 1, quantity: 1000, name: "pokeball" },
      superball: { id: 2, quantity: 1000, name: "superball" },
      hyperball: { id: 3, quantity: 1000, name: "hyperball" },
      masterball: { id: 4, quantity: 10, name: "masterball" },
    };

    const productIdArray = {
      pokeball: process.env.STRIPE_POKEBALL_PRICE_ID,
      superball: process.env.STRIPE_SUPERBALL_PRICE_ID,
      hyperball: process.env.STRIPE_HYPERBALL_PRICE_ID,
      masterball: process.env.STRIPE_MASTERBALL_PRICE_ID,
      premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
        }
      );

      let itemQuantity = 1;
      lineItems.data.forEach((item) => {
        itemQuantity = item.quantity;
      });

      const discordId = event.data.object.metadata.discord_id;
      const serverId = event.data.object.metadata.server_id;
      let { name } = event.data.object.metadata;
      name = name ? name.toLowerCase().trim() : null;
      const productId = productIdArray[name] || null;
      if (name && name === "premium") {
        try {
          await models.trainer.addPremium(discordId);
        } catch (err) {
          console.error("❌ DB error:", err);
          return res.sendStatus(500);
        }
      } else if (name && name in ballDataPackage) {
        const { id, quantity } = ballDataPackage[name];
        try {
          await models.pokeball_trainer.insertMany(
            id,
            discordId,
            quantity * itemQuantity
          );
        } catch (err) {
          console.error("❌ DB error:", err);
          return res.sendStatus(500);
        }
      }

      try {
        await models.sale.create({
          stripe_session_id: event.data.object.id,
          stripe_payment_intent: event.data.object.payment_intent,
          discord_id: discordId,
          server_id: serverId,
          email: event.data.object.customer_details.email,
          product_id: productId,
          amount_total: event.data.object.amount_total,
          quantity: itemQuantity,
          currency: event.data.object.currency,
          payment_status: event.data.object.payment_status,
        });
      } catch (err) {
        console.error("❌ Sale creation error:", err);
        return res
          .status(500)
          .send({ status: "error", message: "Sale creation failed" });
      }
    }

    res.status(200).send({ received: true });
  }
);

module.exports = router;
