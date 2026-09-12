import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, getBudgets);
router.post('/', auth, createBudget);
router.put('/:id', auth, updateBudget);
router.delete('/:id', auth, deleteBudget);

export default router;