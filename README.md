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
