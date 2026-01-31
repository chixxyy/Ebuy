import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// In-memory debounce timers
// Map<userId, NodeJS.Timeout>
const debounceTimers = new Map<number, NodeJS.Timeout>();

// In-memory pending requests to accumulate quantity
// Map<userId, Map<productId, quantity>>
const pendingUpdates = new Map<number, Map<number, number>>();

const DEBOUNCE_DELAY = 500; // 500ms

export const addToCartDebounced = async (
  userId: number,
  productId: number,
  quantity: number,
) => {
  // Direct DB write to safely prevent any in-memory mix-ups
  const result = await processCartUpdates(userId, new Map([[productId, quantity]]));
  return { status: "success", message: "Item added to cart", result };
};

const processCartUpdates = async (
  userId: number,
  updates: Map<number, number>,
) => {
  // Transaction for safety
  await prisma.$transaction(async (tx) => {
    // Ensure Cart exists
    let cart = await tx.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await tx.cart.create({ data: { userId } });
    }

    for (const [productId, quantity] of updates.entries()) {
      // Check Stock
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) continue; // Skip invalid products

      // Check if cart item exists to know current quantity if needed,
      // but for "adding", we usually add to existing.
      // Wait, the request is "add to cart", so quantity is delta.

      if (product.stock < quantity) {
        console.warn(
          `[Stock] Not enough stock for Product ${productId}. Requested: ${quantity}, Available: ${product.stock}`,
        );
        // Ideally we should notify the user via socket or just fail silently/log for now as response is already sent.
        // In a real app, this might be handled differently.
        continue;
      }

      // NOTE: Traditional e-commerce does NOT decrement stock on 'Add to Cart'.
      // Stock is only decremented on 'Purchase/Checkout'.
      // We only CHECK if there is enough stock here to prevent adding obviously OOS items.
      
      // Update Cart Item
      const existingItem = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        // Optional: Check if (existingItem.quantity + quantity) > product.stock
        // But stock varies, so maybe just let it be for now and strict check at checkout.
        
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }
    }
  });
};

export const getCart = async (userId: number) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { productId: 'asc' }
      },
    },
  });
};

export const removeFromCart = async (userId: number, productId: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId: productId,
    },
  });
};

export const updateCartQuantity = async (
  userId: number,
  productId: number,
  quantity: number
) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  if (quantity <= 0) {
    await removeFromCart(userId, productId);
    return;
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity },
    });
  }
};
