# E-Buy 電商平台

現代化全端電商示範專案。

## 🛠 技術棧

- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia, Vue I18n
- **Backend**: Express, TypeScript, Prisma, SQLite

## 🚀 快速開始

### 後端 (Backend)

```bash
cd backend
npm install

# 資料庫遷移與種子資料
npx prisma migrate dev
npx ts-node prisma/seed.ts

# 啟動伺服器 (Port 3000)
npm run dev
```

### 前端 (Frontend)

```bash
cd frontend
npm install

# 啟動開發伺服器
npm run dev
```

## ✨ 主要功能

- **多語言支援**：繁體中文 / English 介面即時切換。
- **商品管理**：完整的 CRUD 功能（需登入後操作）。
- **購物車系統**：即時更新與資料持久化。
- **會員機制**：JWT 驗證、註冊與登入。
