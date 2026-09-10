import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, seedDefaultCategories } from '../controllers/categoryController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, getCategories);
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);
router.post('/seed', auth, seedDefaultCategories);

export default router;
