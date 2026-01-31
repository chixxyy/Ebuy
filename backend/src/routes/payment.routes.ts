import { Router } from 'express';
import { createPaymentIntent, checkout } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-payment-intent', authenticateToken, createPaymentIntent);
router.post('/checkout', authenticateToken, checkout);

export default router;
