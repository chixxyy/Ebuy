import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2024-10-28.acacia" as any, // Use latest or matching version
    // explicit typing cast if type defs are older
  },
);

export const createPaymentIntent = async (
  amount: number,
  currency: string = "usd",
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};
