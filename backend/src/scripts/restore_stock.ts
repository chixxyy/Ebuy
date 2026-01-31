
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Restoring stock...");

  // Update Headphones (ID 41)
  await prisma.product.update({
    where: { id: 41 },
    data: { stock: 5 },
  });
  console.log("Updated ID 41 (Headphones) stock to 5.");

  // Update Office Chair (ID 42)
  await prisma.product.update({
    where: { id: 42 },
    data: { stock: 5 },
  });
  console.log("Updated ID 42 (Chair) stock to 5.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
