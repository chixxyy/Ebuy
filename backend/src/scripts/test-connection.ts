import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('正在連線到資料庫...');
    // 嘗試撈出第一筆使用者資料
    const user = await prisma.user.findFirst();
    console.log('✅ 連線成功！第一筆使用者資料：', user);
  } catch (error) {
    console.error('❌ 資料庫連線失敗，請把以下錯誤貼給 AI：');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
