const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = "https://valentin-morette.github.io/payement-pages";
// eslint-disable-next-line consistent-return
const createCheckoutSession = async (req, res) => {
  const { discordId, priceId, name } = req.body;

  if (!discordId || !priceId) {
    return res.status(400).json({ error: "Missing discordId or priceId" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: name !== "Premium",
            minimum: 1,
            maximum: 100,
          },
        },
      ],
      success_url: `${YOUR_DOMAIN}/payment-success.html`,
      cancel_url: `${YOUR_DOMAIN}/payment-cancel.html`,
      metadata: {
        discord_id: discordId,
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
