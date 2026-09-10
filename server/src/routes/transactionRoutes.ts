import { Router } from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, getTransactions);
router.get('/:id', auth, getTransaction);
router.post('/', auth, createTransaction);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);

export default router;
