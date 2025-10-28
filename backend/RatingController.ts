import type { Request, Response } from 'express';
import Rating from '../models/Rating';
import Product from '../models/Product';
import User from '../models/User';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getRatingsForProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const ratings = await Rating.findAll({ 
      where: { productId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings', error });
  }
};

export const createRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const { rating, review } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already rated this product
    const existingRating = await Rating.findOne({ where: { userId, productId } });
    if (existingRating) {
      return res.status(409).json({ message: 'You have already rated this product' });
    }

    const newRating = await Rating.create({
      userId,
      productId: parseInt(productId, 10),
      rating,
      review,
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ message: 'Error creating rating', error });
  }
};

export const getProductRatingStats = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const ratings = await Rating.findAll({ 
      where: { productId },
      attributes: ['rating']
    });

    if (ratings.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalRatings: 0
      });
    }

    const sum = ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    const averageRating = sum / ratings.length;

    res.status(200).json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ message: 'Error fetching rating stats', error });
  }
};
