import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Mock notifications for development
let mockNotifications = [
  {
    id: 1,
    userId: 2,
    type: 'order_placed',
    title: 'Order Placed Successfully',
    message: 'Your order #ORD-12345 has been placed successfully.',
    link: '/dashboard/orders',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 2,
    userId: 2,
    type: 'message',
    title: 'New Message from Support',
    message: 'You have a new message from our support team.',
    link: '/chat',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
];

let notificationIdCounter = 3;

// Get all notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 10, unreadOnly = false } = req.query;

    let userNotifications = mockNotifications.filter((n) => n.userId === userId);

    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter((n) => !n.isRead);
    }

    // Sort by date (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit results
    const limitedNotifications = userNotifications.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: limitedNotifications,
      unreadCount: userNotifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: (error as Error).message,
    });
  }
};

// Create a notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, link } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, type, title, and message are required',
      });
    }

    const notification = {
      id: notificationIdCounter++,
      userId,
      type,
      title,
      message,
      link: link || null,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNotifications.push(notification);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: (error as Error).message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const notification = mockNotifications.find(
      (n) => n.id === parseInt(id) && n.userId === userId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isRead = true;
    notification.updatedAt = new Date();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: (error as Error).message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    mockNotifications.forEach((notification) => {
      if (notification.userId === userId && !notification.isRead) {
        notification.isRead = true;
        notification.updatedAt = new Date();
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: (error as Error).message,
    });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const index = mockNotifications.findIndex(
      (n) => n.id === parseInt(id) && n.userId === userId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    mockNotifications.splice(index, 1);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: (error as Error).message,
    });
  }
};

export { mockNotifications };
