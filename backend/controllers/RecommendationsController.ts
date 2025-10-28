import type { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { Op } from "sequelize";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

/**
 * @desc    Get related products (same category)
 * @route   GET /api/recommendations/related/:productId
 * @access  Public
 */
export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 6;

    // Get the current product
    const product = await Product.findByPk(parseInt(productId!));
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find products in the same category
    const relatedProducts = await Product.findAll({
      where: {
        category: product.category,
        id: { [Op.ne]: product.id }, // Exclude current product
        inStock: true,
      },
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get frequently bought together products
 * @route   GET /api/recommendations/frequently-bought-together/:productId
 * @access  Public
 */
export const getFrequentlyBoughtTogether = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;

    // Find orders that contain this product
    const ordersWithProduct = await OrderItem.findAll({
      where: { productId: parseInt(productId!) },
      attributes: ['orderId'],
      raw: true,
    });

    const orderIds = ordersWithProduct.map((item: any) => item.orderId);

    if (orderIds.length === 0) {
      return res.json([]);
    }

    // Find other products in those orders
    const frequentProducts = await OrderItem.findAll({
      where: {
        orderId: { [Op.in]: orderIds },
        productId: { [Op.ne]: parseInt(productId!) },
      },
      attributes: [
        'productId',
        [OrderItem.sequelize!.fn('COUNT', OrderItem.sequelize!.col('productId')), 'count']
      ],
      group: ['productId'],
      order: [[OrderItem.sequelize!.literal('count'), 'DESC']],
      limit,
      raw: true,
    });

    // Get full product details
    const productIds = frequentProducts.map((item: any) => item.productId);
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        inStock: true,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching frequently bought together:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get personalized recommendations based on user's order history
 * @route   GET /api/recommendations/for-you
 * @access  Authenticated
 */
export const getPersonalizedRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 8;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user's past orders
    const userOrders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (userOrders.length === 0) {
      // If user has no order history, return popular products
      const popularProducts = await Product.findAll({
        where: { inStock: true },
        limit,
        order: [['createdAt', 'DESC']],
      });
      return res.json(popularProducts);
    }

    // Extract categories from user's order history
    const productIds = userOrders.flatMap((order: any) => 
      order.items.map((item: any) => item.productId)
    );

    const purchasedProducts = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
    });

    const categories = [...new Set(purchasedProducts.map((p: any) => p.category))];

    // Find products in those categories that user hasn't purchased
    const recommendations = await Product.findAll({
      where: {
        category: { [Op.in]: categories },
        id: { [Op.notIn]: productIds },
        inStock: true,
      },
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get trending products (most ordered in last 30 days)
 * @route   GET /api/recommendations/trending
 * @access  Public
 */
export const getTrendingProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get most ordered products in last 30 days
    const trendingProductIds = await OrderItem.findAll({
      include: [{
        model: Order,
        as: 'order',
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
        attributes: [],
      }],
      attributes: [
        'productId',
        [OrderItem.sequelize!.fn('COUNT', OrderItem.sequelize!.col('productId')), 'orderCount']
      ],
      group: ['productId'],
      order: [[OrderItem.sequelize!.literal('orderCount'), 'DESC']],
      limit,
      raw: true,
    });

    const productIds = trendingProductIds.map((item: any) => item.productId);

    if (productIds.length === 0) {
      // Fallback to newest products
      const newProducts = await Product.findAll({
        where: { inStock: true },
        limit,
        order: [['createdAt', 'DESC']],
      });
      return res.json(newProducts);
    }

    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        inStock: true,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get new arrivals
 * @route   GET /api/recommendations/new-arrivals
 * @access  Public
 */
export const getNewArrivals = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;

    const newProducts = await Product.findAll({
      where: { inStock: true },
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.json(newProducts);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CommonJS exports for compatibility
module.exports = {
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations,
  getTrendingProducts,
  getNewArrivals,
};
