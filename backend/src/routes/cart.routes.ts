import { Router } from "express";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken, addToCart);
router.get("/", authenticateToken, getCart);
router.delete("/:id", authenticateToken, removeFromCart);
router.put("/", authenticateToken, updateCartQuantity);

export default router;
