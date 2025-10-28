import { Request, Response } from "express";
import Order from "../models/Order";
import User from "../models/User";
import Product from "../models/Product";
import OrderItem from "../models/OrderItem";
import { Op } from "sequelize";
import sequelize from "../config/db";

/**
 * @desc    Get analytics data
 * @route   GET /api/analytics
 * @access  Admin
 */
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { range = "month" } = req.query;

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total revenue (completed orders only)
    const totalRevenueResult = await Order.sum('total', {
      where: {
        paymentStatus: 'completed',
      }
    });
    const totalRevenue = totalRevenueResult || 0;

    // Get current month revenue
    const currentMonthRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    }) || 0;

    // Get last month revenue
    const lastMonthRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'completed',
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lte]: endOfLastMonth
        }
      }
    }) || 0;

    // Calculate revenue growth
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Get total orders
    const totalOrders = await Order.count();

    // Get current month orders
    const currentMonthOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Get last month orders
    const lastMonthOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lte]: endOfLastMonth
        }
      }
    });

    // Calculate orders growth
    const ordersGrowth = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    // Get total customers
    const totalCustomers = await User.count({
      where: { role: 'customer' }
    });

    // Get total products
    const totalProducts = await Product.count();

    // Get sales trend for last 6 months
    const salesTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthRevenue = await Order.sum('total', {
        where: {
          paymentStatus: 'completed',
          createdAt: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd
          }
        }
      }) || 0;

      const monthOrders = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd
          }
        }
      });

      salesTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: parseFloat(monthRevenue.toString()),
        orders: monthOrders
      });
    }

    // Get top products
    const topProductsData = await OrderItem.findAll({
      attributes: [
        'productName',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.literal('quantity * price')), 'totalRevenue']
      ],
      group: ['productName'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: 5,
      raw: true
    });

    const topProducts = topProductsData.map((item: any) => ({
      name: item.productName,
      sold: parseInt(item.totalSold),
      revenue: parseFloat(item.totalRevenue)
    }));

    // Get recent orders
    const recentOrdersData = await Order.findAll({
      attributes: ['id', 'orderNumber', 'total', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: true
    });

    const recentOrders = recentOrdersData.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: parseFloat(order.total),
      status: order.status,
      date: order.createdAt
    }));

    // Category performance (mock for now - add categories to products table if needed)
    const categoryPerformance = [
      { category: "Electronics", sales: 0, revenue: 0 },
      { category: "Clothing", sales: 0, revenue: 0 },
      { category: "Home & Garden", sales: 0, revenue: 0 },
      { category: "Sports", sales: 0, revenue: 0 },
      { category: "Books", sales: 0, revenue: 0 },
    ];

    const analyticsData = {
      overview: {
        totalRevenue: parseFloat(totalRevenue.toString()),
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth: parseFloat(revenueGrowth.toString()),
        ordersGrowth: parseFloat(ordersGrowth.toString()),
      },
      salesTrend,
      categoryPerformance,
      topProducts,
      recentOrders,
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
