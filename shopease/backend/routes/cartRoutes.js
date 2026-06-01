import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateQuantity } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/remove/:itemId', protect, removeFromCart);
router.put('/update/:itemId', protect, updateQuantity);

export default router;