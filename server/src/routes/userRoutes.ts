import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.post('/me/change-password', auth, changePassword);

export default router;
