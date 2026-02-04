import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import uploadRoutes from "./routes/upload.routes";
import cartRoutes from "./routes/cart.routes";
import inventoryRoutes from "./routes/inventory.routes";
import paymentRoutes from "./routes/payment.routes";
import { initSocket } from "./socket";
import path from "path";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payment", paymentRoutes);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ebuy Backend Status</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #f0fdf4;
                color: #166534;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                text-align: center;
                max-width: 400px;
            }
            .status-dot {
                height: 12px;
                width: 12px;
                background-color: #22c55e;
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
            }
            h1 { margin-top: 0; }
            p { color: #4b5563; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1><span class="status-dot"></span>System Operational</h1>
            <p>Ebuy Backend is running smoothly.</p>
            <p style="font-size: 0.875rem; color: #9ca3af;">Env: ${process.env.NODE_ENV || 'development'} | Time: ${new Date().toISOString()}</p>
        </div>
    </body>
    </html>
  `);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
