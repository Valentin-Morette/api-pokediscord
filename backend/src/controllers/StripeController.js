const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = "https://valentin-morette.github.io/payement-pages";
// eslint-disable-next-line consistent-return
const createCheckoutSession = async (req, res) => {
  const { discordId } = req.body;

  if (!discordId) {
    return res.status(400).json({ error: "Missing discordId in request body" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${YOUR_DOMAIN}/payment-success.html`,
      cancel_url: `${YOUR_DOMAIN}/payment-cancel.html`,
      metadata: {
        discord_id: discordId,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

module.exports = { createCheckoutSession };
