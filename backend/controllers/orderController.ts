import type { Request, Response } from "express";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Product from "../models/Product";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { mockNotifications } from "./notificationController";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "../utils/emailService";

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Admin
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          required: false,
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders/create
 * @access  Authenticated
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, total, shippingAddress, paymentMethod, customerEmail, customerName } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!items || !total || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate stock availability for all items before creating order
    for (const item of items) {
      const product = await Product.findByPk(item.id);
      if (!product) {
        return res.status(404).json({ 
          message: `Product "${item.name}" not found` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units available.`,
          productId: product.id,
          availableStock: product.stock
        });
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Format shipping address
    const formattedAddress = typeof shippingAddress === 'string'
      ? shippingAddress
      : `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

    // Create new order
    const newOrder = await Order.create({
      orderNumber,
      userId,
      customerName: customerName || req.user?.name || "Guest",
      customerEmail: customerEmail || req.user?.email || "guest@example.com",
      total: parseFloat(total),
      status: "pending",
      shippingAddress: formattedAddress,
      paymentMethod,
    });

    // Create order items and update product stock
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        // Find the product and update its stock
        const product = await Product.findByPk(item.id);
        if (product) {
          // Deduct the ordered quantity from stock
          const newStock = Math.max(0, product.stock - item.quantity);
          await product.update({ stock: newStock });
          console.log(`📦 Stock updated for ${product.name}: ${product.stock} → ${newStock}`);
        }

        return OrderItem.create({
          orderId: newOrder.id,
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        });
      })
    );

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        newOrder.customerEmail,
        {
          orderNumber: newOrder.orderNumber,
          customerName: newOrder.customerName,
          total: newOrder.total,
          items: items,
          shippingAddress: formattedAddress,
        }
      );
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    console.log(`✅ New order created: ${orderNumber}`);

    res.status(201).json({
      message: "Order created successfully",
      orderNumber,
      order: { ...newOrder.toJSON(), items: orderItems },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get invoice for an order (PDF generation placeholder)
 * @route   GET /api/orders/:orderNumber/invoice
 * @access  Authenticated
 */
export const getOrderInvoice = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    // Find the order
    const order = await Order.findOne({
      where: { orderNumber },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData: any = order.toJSON();
    
    // Convert total to number (from DECIMAL string)
    const total = parseFloat(orderData.total);
    const tax = total * 0.08;
    const shipping = 10.00;
    const grandTotal = total + tax + shipping;
    
    // In a real application, you would generate a PDF here using libraries like:
    // - pdfkit
    // - puppeteer
    // - jspdf
    
    // For now, return a simple text invoice
    const invoiceText = `
INVOICE
-------
Order Number: ${orderData.orderNumber}
Date: ${new Date(orderData.createdAt).toLocaleDateString()}

Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}

Items:
${orderData.items.map((item: any, index: number) => 
  `${index + 1}. ${item.productName} x ${item.quantity} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${total.toFixed(2)}
Tax (8%): $${tax.toFixed(2)}
Shipping: $${shipping.toFixed(2)}
Total: $${grandTotal.toFixed(2)}

Shipping Address:
${orderData.shippingAddress}

Payment Method: ${orderData.paymentMethod}
Payment Status: ${orderData.paymentStatus || 'N/A'}
${orderData.mpesaReceiptNumber ? `M-Pesa Receipt: ${orderData.mpesaReceiptNumber}` : ''}
Order Status: ${orderData.status}

Thank you for your business!
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderNumber}.txt`);
    res.send(invoiceText);

  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find and update the order
    const order = await Order.findByPk(parseInt(id!));
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.status = status as any;
    await order.save();

    // Send order status email
    try {
      const emailData: any = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: status,
      };
      
      if (status === 'shipped') {
        emailData.trackingNumber = `TRK-${Date.now()}`;
      }
      
      await sendOrderStatusEmail(order.customerEmail, emailData);
    } catch (emailError) {
      console.error("Failed to send order status email:", emailError);
      // Don't fail the status update if email fails
    }

    // Create notification for the customer
    const notificationTitles: { [key: string]: string } = {
      confirmed: "Order Confirmed",
      processing: "Order Processing",
      shipped: "Order Shipped",
      delivered: "Order Delivered",
      cancelled: "Order Cancelled",
    };

    const notificationMessages: { [key: string]: string } = {
      confirmed: `Your order ${order.orderNumber} has been confirmed and is being prepared.`,
      processing: `Your order ${order.orderNumber} is being processed.`,
      shipped: `Your order ${order.orderNumber} has been shipped and is on its way!`,
      delivered: `Your order ${order.orderNumber} has been delivered. Enjoy your purchase!`,
      cancelled: `Your order ${order.orderNumber} has been cancelled.`,
    };

    if (notificationTitles[status]) {
      mockNotifications.push({
        id: mockNotifications.length + 1,
        userId: order.userId,
        type: `order_${status}` as any,
        title: notificationTitles[status],
        message: notificationMessages[status] || '',
        link: '/dashboard/orders',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Emit socket event if io is available
      const io = (req as any).app.get('io');
      if (io) {
        io.emit('notification', {
          userId: order.userId,
          type: `order_${status}`,
          title: notificationTitles[status],
          message: notificationMessages[status],
        });
      }
    }

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user's own orders
 * @route   GET /api/orders/my-orders
 * @access  Authenticated
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          required: false,
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get order tracking/timeline
 * @route   GET /api/orders/:id/tracking
 * @access  Authenticated
 */
export const getOrderTracking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [Product]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData: any = order.toJSON();

    // Check if user owns this order or is admin
    if (orderData.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create timeline based on order status
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(orderData.status);
    
    const timeline = [
      {
        status: 'pending',
        label: 'Order Placed',
        completed: currentStatusIndex >= 0,
        date: orderData.createdAt,
        active: orderData.status === 'pending',
      },
      {
        status: 'confirmed',
        label: 'Confirmed',
        completed: currentStatusIndex >= 1,
        date: currentStatusIndex >= 1 ? orderData.updatedAt : null,
        active: orderData.status === 'confirmed',
      },
      {
        status: 'processing',
        label: 'Processing',
        completed: currentStatusIndex >= 2,
        date: currentStatusIndex >= 2 ? orderData.updatedAt : null,
        active: orderData.status === 'processing',
      },
      {
        status: 'shipped',
        label: 'Shipped',
        completed: currentStatusIndex >= 3,
        date: currentStatusIndex >= 3 ? orderData.updatedAt : null,
        active: orderData.status === 'shipped',
      },
      {
        status: 'delivered',
        label: 'Delivered',
        completed: currentStatusIndex >= 4,
        date: currentStatusIndex >= 4 ? orderData.updatedAt : null,
        active: orderData.status === 'delivered',
      },
    ];

    // Handle cancelled status
    if (orderData.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        label: 'Cancelled',
        completed: true,
        date: orderData.updatedAt,
        active: true,
      });
    }

    res.json({
      order: orderData,
      timeline,
    });
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CommonJS exports for compatibility
module.exports = {
  getOrders,
  createOrder,
  getOrderInvoice,
  updateOrderStatus,
  getMyOrders,
  getOrderTracking,
};
