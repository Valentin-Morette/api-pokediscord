const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = "https://valentin-morette.github.io/payement-pages";
// eslint-disable-next-line consistent-return
const createCheckoutSession = async (req, res) => {
  const { discordId, priceId, name, serverId } = req.body;

  if (!discordId || !priceId) {
    return res.status(400).json({ error: "Missing discordId or priceId" });
  }

  try {
    const lineItem = {
      price: priceId,
      quantity: 1,
    };

    // Ajouter adjustable_quantity seulement si ce n'est pas Premium
    if (name !== "Premium") {
      lineItem.adjustable_quantity = {
        enabled: true,
        minimum: 1,
        maximum: 100,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [lineItem],
      success_url: `${YOUR_DOMAIN}/payment-success.html`,
      cancel_url: `${YOUR_DOMAIN}/payment-cancel.html`,
      metadata: {
        discord_id: discordId,
        server_id: serverId,
        name,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

module.exports = { createCheckoutSession };
