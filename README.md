# E-Buy 電商平台

## 可用指令 (Available Scripts)

### 前端 (Frontend)

請先確保位於前端目錄：`cd frontend`

| 指令                     | 說明                       |
| ------------------------ | -------------------------- |
| `npm install`            | 安裝專案相依套件           |
| `npm run dev`            | 啟動開發環境伺服器         |
| `npm run build`          | 打包正式環境程式碼         |
| `npm run preview`        | 預覽打包後的專案           |
| `npx prettier --write .` | 格式化程式碼               |
| `npx cypress run`        | 執行 E2E 測試 (無 UI 模式) |
| `npx cypress open`       | 開啟 Cypress 測試互動介面  |

### 後端 (Backend)

請先確保位於後端目錄：`cd backend`

| 指令                         | 說明                                          |
| ---------------------------- | --------------------------------------------- |
| `npm install`                | 安裝專案相依套件 (會自動執行 Prisma generate) |
| `npm run dev`                | 啟動開發環境伺服器 (Port 3000)                |
| `npm run build`              | 編譯 TypeScript 與產生 Prisma Client          |
| `npm start`                  | 啟動正式環境伺服器 (`dist/server.js`)         |
| `npx prisma migrate dev`     | 執行資料庫遷移                                |
| `npx ts-node prisma/seed.ts` | 寫入初始種子資料                              |
| `npx prisma studio`          | 開啟本地資料庫圖形化管理介面                  |
| `npx vitest run`             | 執行後端業務邏輯測試                          |
| `npx prettier --write .`     | 格式化程式碼                                  |

## 🚀 快速開發環境建置

```bash
# 1. 建置並啟動後端
cd backend
npm install
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run dev

# 2. 啟動前端 (請開新的終端機視窗)
cd frontend
npm install
npm run dev
```
