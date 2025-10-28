import { Router } from 'express';
import { getUserWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/WishlistController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, getUserWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

export default router;
