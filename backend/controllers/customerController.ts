import { Request, Response } from "express";

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Admin
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    // Mock customers data - replace with real database queries
    const mockCustomers = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        totalOrders: 5,
        totalSpent: 1249.95,
        lastOrderDate: new Date("2024-10-20").toISOString(),
        createdAt: new Date("2024-01-15").toISOString(),
        isActive: true,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "customer",
        totalOrders: 8,
        totalSpent: 2150.50,
        lastOrderDate: new Date("2024-10-23").toISOString(),
        createdAt: new Date("2024-02-10").toISOString(),
        isActive: true,
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "customer",
        totalOrders: 3,
        totalSpent: 450.75,
        lastOrderDate: new Date("2024-10-24").toISOString(),
        createdAt: new Date("2024-03-05").toISOString(),
        isActive: true,
      },
      {
        id: 4,
        name: "Alice Williams",
        email: "alice@example.com",
        role: "customer",
        totalOrders: 1,
        totalSpent: 199.50,
        lastOrderDate: new Date("2024-10-25").toISOString(),
        createdAt: new Date("2024-10-01").toISOString(),
        isActive: true,
      },
      {
        id: 5,
        name: "Charlie Brown",
        email: "charlie@example.com",
        role: "customer",
        totalOrders: 12,
        totalSpent: 3500.00,
        lastOrderDate: new Date("2024-10-22").toISOString(),
        createdAt: new Date("2023-11-20").toISOString(),
        isActive: true,
      },
      {
        id: 6,
        name: "Diana Prince",
        email: "diana@example.com",
        role: "customer",
        totalOrders: 6,
        totalSpent: 890.25,
        lastOrderDate: new Date("2024-10-18").toISOString(),
        createdAt: new Date("2024-04-12").toISOString(),
        isActive: true,
      },
      {
        id: 7,
        name: "Ethan Hunt",
        email: "ethan@example.com",
        role: "customer",
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        createdAt: new Date("2024-10-26").toISOString(),
        isActive: true,
      },
    ];

    res.json(mockCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
