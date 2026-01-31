# E-Buy 電商平台

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

## 🧪 測試 (Testing)

### 前端 E2E 測試 (Cypress)

確保前端開發伺服器正在運行 (`npm run dev`)，然後執行：

```bash
cd frontend

# 執行headless測試（不開啟視窗）
npx cypress run

# 開啟Cypress互動式介面
npx cypress open
```

### 後端 API 測試 (Vitest)

後端測試包含商品購買與庫存扣除的邏輯測試。

```bash
cd backend

# 執行測試
npx vitest run
```

```bash
npx prisma studio
```

## 🧹 程式碼整理 (Linting & Formatting)

本專案使用 Prettier 進行程式碼格式化。

```bash
cd frontend && npx prettier --write .
cd backend && npx prettier --write .
```
