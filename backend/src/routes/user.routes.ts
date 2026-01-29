import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
