
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, stock: true }
  });
  console.log("Current Products:");
  products.forEach(p => console.log(`${p.id}: ${p.name} (Stock: ${p.stock})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
