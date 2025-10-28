import { Router } from 'express';
import { getRatingsForProduct, createRating, getProductRatingStats } from '../controllers/RatingController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.route('/products/:productId/ratings')
  .get(getRatingsForProduct)
  .post(protect, createRating);

router.route('/products/:productId/rating-stats')
  .get(getProductRatingStats);

export default router;
