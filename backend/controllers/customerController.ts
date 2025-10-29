import type { Request, Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import sequelize from "../config/db";

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Admin
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    // Fetch all customers with their order statistics
    const customers = await User.findAll({
      where: { role: "customer" },
      attributes: [
        "id",
        "name",
        "firstName",
        "lastName",
        "email",
        "role",
        "avatar",
        "createdAt",
        "isPremium",
        "isVerified",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM orders
            WHERE orders.userId = User.id
          )`),
          "totalOrders",
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(total), 0)
            FROM orders
            WHERE orders.userId = User.id AND orders.status != 'cancelled'
          )`),
          "totalSpent",
        ],
        [
          sequelize.literal(`(
            SELECT MAX(createdAt)
            FROM orders
            WHERE orders.userId = User.id
          )`),
          "lastOrderDate",
        ],
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format the response
    const formattedCustomers = customers.map((customer: any) => ({
      id: customer.id,
      name: customer.firstName && customer.lastName 
        ? `${customer.firstName} ${customer.lastName}` 
        : customer.name || customer.email,
      email: customer.email,
      role: customer.role,
      avatar: customer.avatar,
      totalOrders: parseInt(customer.getDataValue("totalOrders")) || 0,
      totalSpent: parseFloat(customer.getDataValue("totalSpent")) || 0,
      lastOrderDate: customer.getDataValue("lastOrderDate") || null,
      createdAt: customer.createdAt,
      isActive: true, // All registered users are considered active
      isPremium: customer.isPremium,
      isVerified: customer.isVerified,
    }));

    res.json(formattedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
