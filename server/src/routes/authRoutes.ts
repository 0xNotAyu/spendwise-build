import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);

export default router;
