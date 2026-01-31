import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as PaymentService from '../services/payment.service';
import { getIO } from '../socket';

const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        // 1. Calculate Cart Total from DB (Security: Don't trust frontend)
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { 
                items: {
                    include: { product: true }
                } 
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        // Stripe expects amount in cents (integers)
        const amountInCents = Math.round(totalAmount * 100);

        if (amountInCents < 50) { // Minimum charge usually ~50 cents
             return res.status(400).json({ message: 'Amount too small' });
        }

        // 2. Create Intent
        const paymentIntent = await PaymentService.createPaymentIntent(amountInCents, 'usd');

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount,
            currency: paymentIntent.currency.toUpperCase()
        });

    } catch (error: any) {
        console.error("Payment intent error:", error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }

};

export const checkout = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        await prisma.$transaction(async (tx) => {
            // 1. Get Cart
            const cart = await tx.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true } } }
            });

            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            // 2. Process Items (Deduct Stock)
            for (const item of cart.items) {
                const product = await tx.product.findUnique({ 
                    where: { id: item.productId } 
                });

                if (!product) throw new Error(`Product ${item.productId} not found`);

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                // Deduct Stock
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                // Broadcast Inventory Update
                try {
                    const io = getIO();
                    io.emit("INVENTORY_UPDATE", {
                        productId: item.productId.toString(),
                        stock: updatedProduct.stock
                    });
                } catch (e) {
                    console.error("Socket emit failed:", e);
                }
            }

            // 3. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // 4. Create Order (Optional for now, but good practice)
            // if (orderTableExists) ...
        });

        res.json({ message: "Checkout successful" });

    } catch (error: any) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: error.message || "Checkout failed" });
    }
};
