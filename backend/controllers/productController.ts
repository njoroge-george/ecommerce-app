import { Request, Response } from "express";
import Product from "../models/Product";
import Rating from "../models/Rating";
import { Op } from "sequelize";
import sequelize from "../config/db";

/**
 * @desc    Get all products with advanced filtering
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice, minRating, inStock, sortBy, category } = req.query;
    
    // Build where clause
    const where: any = {};
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice as string);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice as string);
    }
    
    // Stock filter
    if (inStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    }
    
    // Category filter
    if (category) {
      where.category = category;
    }
    
    // Build order clause
    let order: any = [['createdAt', 'DESC']]; // default sort
    
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          order = [['price', 'ASC']];
          break;
        case 'price_desc':
          order = [['price', 'DESC']];
          break;
        case 'newest':
          order = [['createdAt', 'DESC']];
          break;
        case 'name_asc':
          order = [['name', 'ASC']];
          break;
      }
    }
    
    // Get products with rating info
    const products = await Product.findAll({
      where,
      order,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(rating), 0)
              FROM ratings
              WHERE ratings.productId = Product.id
            )`),
            'averageRating'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM ratings
              WHERE ratings.productId = Product.id
            )`),
            'totalRatings'
          ]
        ]
      }
    });
    
    // Filter by minimum rating if specified
    let filteredProducts = products;
    if (minRating) {
      const minRatingNum = parseFloat(minRating as string);
      filteredProducts = products.filter((product: any) => {
        const avgRating = parseFloat(product.get('averageRating') as string) || 0;
        return avgRating >= minRatingNum;
      });
    }
    
    res.json(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Admin
 */

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Use uploaded image file if available
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image: imagePath,
    });

    res.status(201).json({
      message: "✅ Product created successfully!",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updateData: any = { ...req.body };
    
    // Update image if a new one was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await product.update(updateData);
    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/products/stats/dashboard
 * @access  Admin
 */

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/products/stats/dashboard
 * @access  Admin
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    
    // Calculate metrics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockCount = products.filter(product => product.stock < 10).length;
    const outOfStockCount = products.filter(product => product.stock === 0).length;
    const inStockCount = products.filter(product => product.stock > 0).length;
    
    // Calculate average price
    const avgPrice = products.length > 0 
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length 
      : 0;

    // Get category breakdown
    const categoryBreakdown = products.reduce((acc: any, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, totalValue: 0 };
      }
      acc[product.category].count++;
      acc[product.category].totalValue += product.price * product.stock;
      return acc;
    }, {});

    res.json({
      totalProducts,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      avgPrice: Math.round(avgPrice * 100) / 100,
      categoryBreakdown
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
