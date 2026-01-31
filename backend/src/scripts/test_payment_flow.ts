
import { PrismaClient } from "@prisma/client";
import { io as Client } from "socket.io-client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const API_URL = "http://localhost:3000/api";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("🚀 Starting Payment Flow Integration Test...");

  // 1. Setup Test Data
  console.log("1. Setting up test data...");
  const email = `test_payment_${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      password: "hashedpassword", // Not using login API so hash doesn't matter
      name: "Test Payment User",
    },
  });

  const product = await prisma.product.create({
    data: {
        name: `Test Product ${Date.now()}`,
        description: "Test Desc",
        price: 100,
        image: "https://via.placeholder.com/150",
        category: "Test",
        stock: 10, // Initial Stock 10
        sellerId: user.id
    }
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  console.log(`   User created: ${user.id}`);
  console.log(`   Product created: ${product.id} (Stock: ${product.stock})`);

  // 2. Add to Cart (using DB directly for speed, or API if strict)
  // Let's use API to be sure, or just DB. API is safer flow.
  // Actually, let's use DB for cart setup to focus on Checkout flow.
  const cart = await prisma.cart.create({
      data: { userId: user.id }
  });
  await prisma.cartItem.create({
      data: {
          cartId: cart.id,
          productId: product.id,
          quantity: 1
      }
  });
  console.log("   Item added to cart (Quantity: 1)");

  // 3. Setup Socket Listener
  console.log("2. Connecting Socket...");
  const socket = Client("http://localhost:3000");
  
  let socketReceived = false;
  let receivedStock = -1;

  socket.on("connect", () => {
      console.log("   Socket connected:", socket.id);
  });

  socket.on("INVENTORY_UPDATE", (data: any) => {
      console.log("   📩 RECEIVED EVENT [INVENTORY_UPDATE]:", data);
      if (data.productId === product.id.toString()) {
          socketReceived = true;
          receivedStock = data.stock;
      }
  });

  // Give socket time to connect
  await wait(1000);

  // 4. Action: Call Checkout API
  console.log("3. Calling Checkout API...");
  const response = await fetch(`${API_URL}/payment/checkout`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  });

  const result = await response.json();
  console.log("   API Response:", response.status, result);

  if (!response.ok) {
      console.error("❌ Checkout API Failed");
      process.exit(1);
  }

  // Wait for socket event
  console.log("4. Waiting for broadcasts...");
  await wait(2000);

  // 5. Verification
  console.log("5. Verifying results...");
  
  // Verify DB
  const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  
  if (!updatedProduct) {
      console.error("❌ Product disappeared from DB!");
      process.exit(1);
  }

  console.log(`   DB Stock: ${updatedProduct.stock} (Expected: 9)`);

  let pass = true;

  // Expectation 1: DB Stock = 9
  if (updatedProduct.stock === 9) {
      console.log("   ✅ Expectation 1 (DB Stock) Passed");
  } else {
      console.error("   ❌ Expectation 1 Failed: Stock is " + updatedProduct.stock);
      pass = false;
  }

  // Expectation 2: Socket Event
  if (socketReceived && receivedStock === 9) {
      console.log("   ✅ Expectation 2 (Socket Broadcast) Passed");
  } else {
      console.error(`   ❌ Expectation 2 Failed: Event received? ${socketReceived}, Stock in event: ${receivedStock}`);
      pass = false;
  }

  // Cleanup
  console.log("6. Cleaning up...");
  socket.disconnect();
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.user.delete({ where: { id: user.id } }); // Delete creates cascading delete issues usually, but here minimal relations.
  // Actually product has comments relation to user? No comments made.
  
  if (pass) {
      console.log("\n🎉 TEST SUITE PASSED!");
  } else {
      console.error("\n💀 TEST SUITE FAILED!");
      process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
