import type { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getUserWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'category', 'stock', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ where: { userId, productId } });
    if (existingItem) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    const wishlistWithProduct = await Wishlist.findByPk(wishlistItem.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'category', 'stock', 'image']
        }
      ]
    });

    res.status(201).json(wishlistWithProduct);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist', error });
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deleted = await Wishlist.destroy({
      where: { userId, productId }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
};

export const clearWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Wishlist.destroy({ where: { userId } });

    res.status(200).json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Error clearing wishlist', error });
  }
};
