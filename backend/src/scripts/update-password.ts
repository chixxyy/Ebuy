import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    const email = "test@ebuy.com";
    const newPassword = "test1234";

    console.log(`正在為 ${email} 產生新密碼雜湊...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(`正在更新資料庫...`);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log("✅ 密碼更新成功！");
    console.log("目前的雜湊值為:", updatedUser.password);
  } catch (error) {
    console.error("❌ 更新失敗：", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
