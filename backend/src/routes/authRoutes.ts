import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import authMiddleware from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, (req, res: Response) => getMe(req as AuthRequest, res));

export default router;
