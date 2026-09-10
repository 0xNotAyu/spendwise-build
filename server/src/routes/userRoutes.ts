import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

export default router;
