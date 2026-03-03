import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('正在從資料庫撈取資料...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('=== 目前所有的帳號 (Users) ===');
    console.table(users);
    console.log('\n');

    const products = await prisma.product.findMany({
        take: 10
    });

    console.log('=== 目前所有的商品 (Products) (前 10 筆) ===');
    if (products.length === 0) {
        console.log('⚠️ 目前沒有任何商品！');
    } else {
        console.table(products);
    }
    
  } catch (error) {
    console.error('❌ 查詢失敗：', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
