import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { sendEmail } from '../utils/emailService';

// Get conversation between two users
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    // Fetch messages from database
    const messages = await Message.findAll({
      where: {
        [Symbol.for('or')]: [
          { senderId: currentUserId, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: (error as Error).message,
    });
  }
};

// Get all conversations for current user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;

    // Get all messages where user is involved
    const allMessages = await Message.findAll({
      where: {
        [Symbol.for('or')]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'DESC']],
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of allMessages) {
      const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(partnerId)) {
        // Fetch partner user info
        const partner = await User.findByPk(partnerId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'avatar'],
        });

        // Count unread messages
        const unreadCount = await Message.count({
          where: {
            senderId: partnerId,
            receiverId: currentUserId,
            isRead: false,
          },
        });

        conversationsMap.set(partnerId, {
          userId: partnerId,
          user: partner,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: (error as Error).message,
    });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = (req as any).user.id;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message are required',
      });
    }

    // Create message in database
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      type: 'chat',
      isRead: false,
    });

    // Get sender and receiver info for email
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
    });
    const receiver = await User.findByPk(receiverId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
    });

    // Send email notification
    if (receiver && sender) {
      const senderName = `${sender.firstName} ${sender.lastName}`;
      const subject = `New message from ${senderName}`;
      const html = `
        <h2>You have a new message</h2>
        <p><strong>From:</strong> ${senderName} (${sender.email})</p>
        <p><strong>Message:</strong></p>
        <p style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #667eea;">
          ${message}
        </p>
        <p>Log in to your dashboard to reply.</p>
      `;

      try {
        await sendEmail(receiver.email, subject, html);
        console.log(`✉️ Email sent to ${receiver.email}`);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: (error as Error).message,
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    // Mark all messages from userId to currentUserId as read
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: parseInt(userId),
          receiverId: currentUserId,
          isRead: false,
        },
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: (error as Error).message,
    });
  }
};

// Get all users (for admin to select who to chat with)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Get all customers
    const users = await User.findAll({
      where: {
        role: 'customer',
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'avatar'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: (error as Error).message,
    });
  }
};
