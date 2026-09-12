import { Router } from 'express';
import { getDashboard, getAnalytics } from '../controllers/dashboardController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, getDashboard);
router.get('/analytics', auth, getAnalytics);

export default router;