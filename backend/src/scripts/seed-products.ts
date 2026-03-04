import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const defaultSellerId = 1; // 剛才看到的 test@ebuy.com 帳號 ID

    // 檢查賣家是否存在
    const seller = await prisma.user.findUnique({
      where: { id: defaultSellerId },
    });
    if (!seller) {
      throw new Error("找不到賣家帳號，請確認有 id 為 1 的 user");
    }

    const products = [
      {
        name: "高級無線耳機",
        description: "體驗具備主動降噪與 30 小時續航力的高保真音質。",
        // Prisma schema require string fields... Using default values for these.
        category: "Audio",
        price: 299.99,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        stock: 50,
        sellerId: defaultSellerId,
      },
      {
        name: "人體工學辦公椅",
        description: "全可調式人體工學設計，網狀椅背提供絕佳透氣性與腰部支撐。",
        category: "Furniture",
        price: 199.5,
        image:
          "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
        stock: 30,
        sellerId: defaultSellerId,
      },
      {
        name: "機械電競鍵盤",
        description:
          "觸感極佳的機械軸與可自訂 RGB 燈效，打造極致遊戲體驗。耐用鋁合金框架。",
        category: "Gaming",
        price: 129.0,
        image:
          "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        stock: 100,
        sellerId: defaultSellerId,
      },
      {
        name: "智慧運動手錶",
        description:
          "精準追蹤您的運動、心率與睡眠。具備防水功能與鮮豔 OLED 螢幕。",
        category: "Wearables",
        price: 199.99,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        stock: 45,
        sellerId: defaultSellerId,
      },
      {
        name: "設計師飛行員墨鏡",
        description:
          "以這款高級飛行員墨鏡展現風格並保護您的雙眼。偏光鏡片減少眩光。",
        category: "Accessories",
        price: 89.99,
        image:
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        stock: 60,
        sellerId: defaultSellerId,
      },
      {
        name: "極簡都會後背包",
        description:
          "適合日常通勤的耐用時尚後背包。具備加厚筆電夾層與防潑水面料。",
        category: "Bags",
        price: 59.9,
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        stock: 120,
        sellerId: defaultSellerId,
      },
    ];

    console.log("開始寫入商品資料...");
    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }
    console.log("✅ 成功寫入 6 筆商品資料！");
  } catch (error) {
    console.error("❌ 寫入失敗：", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
