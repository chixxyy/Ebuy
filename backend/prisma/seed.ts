import { PrismaClient } from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ebuy.com" },
    update: {},
    create: {
      email: "admin@ebuy.com",
      name: "Admin",
      password: hashedPassword,
    },
  });

  const products = [
    {
      name: "頂級無線耳機",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      category: "影音設備",
      rating: 4.8,
      reviews: 128,
      description:
        "使用我們的頂級無線耳機體驗高保真音質。具備主動降噪功能和 30 小時電池續航力。",
    },
    {
      name: "人體工學辦公椅",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
      category: "家具",
      rating: 4.5,
      reviews: 85,
      description:
        "這款完全可調的人體工學辦公椅讓您工作更舒適。網狀椅背提供透氣性和腰部支撐。",
    },
    {
      name: "機械電競鍵盤",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
      category: "電競週邊",
      rating: 4.9,
      reviews: 210,
      description:
        "觸感機械軸和可自訂的 RGB 燈光，帶給您極致的遊戲體驗。耐用的鋁合金框架。",
    },
    {
      name: "智慧健身手錶",
      price: 159,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: "穿戴裝置",
      rating: 4.6,
      reviews: 150,
      description:
        "精準追蹤您的鍛煉、心率和睡眠。具備防水功能並配備鮮豔的 OLED 顯示器。",
    },
    {
      name: "設計師飛行員太陽眼鏡",
      price: 89,
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      category: "配件",
      rating: 4.7,
      reviews: 92,
      description:
        "戴上這款頂級飛行員太陽眼鏡，時尚地保護您的眼睛。偏光鏡片可減少眩光。",
    },
    {
      name: "極簡都市後背包",
      price: 79,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      category: "包袋",
      rating: 4.4,
      reviews: 64,
      description:
        "時尚耐用的後背包，適合您的日常通勤。設有筆墊隔層和防潑水布料。",
    },
  ];

  // Clear existing products to prevent duplicates
  await prisma.product.deleteMany({});

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        sellerId: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
