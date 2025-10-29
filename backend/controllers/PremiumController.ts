import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import { Op } from 'sequelize';

// Get premium benefits info
export const getPremiumBenefits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const benefits = {
      features: [
        '⭐ Premium Badge on Profile',
        '🎁 Exclusive Discounts (10-20% off)',
        '🚀 Priority Customer Support',
        '📦 Free Shipping on All Orders',
        '🎯 Early Access to New Products',
        '💎 Special Premium-Only Deals',
        '🔔 Priority Notifications',
        '🏆 VIP Status in Community'
      ],
      pricing: {
        monthly: 9.99,
        yearly: 99.99,
        savings: 'Save 17% with yearly plan'
      }
    };

    res.json(benefits);
  } catch (error) {
    console.error('Error fetching premium benefits:', error);
    res.status(500).json({ message: 'Failed to fetch premium benefits' });
  }
};

// Check if user has active premium
export const checkPremiumStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'isPremium', 'premiumSince', 'premiumExpiresAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if premium has expired
    const now = new Date();
    const isActive = user.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > now);

    // If expired, update status
    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) <= now) {
      await user.update({ isPremium: false });
    }

    res.json({
      isPremium: isActive,
      premiumSince: user.premiumSince,
      premiumExpiresAt: user.premiumExpiresAt,
      daysRemaining: user.premiumExpiresAt 
        ? Math.ceil((new Date(user.premiumExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    res.status(500).json({ message: 'Failed to check premium status' });
  }
};

// Grant premium to user (Admin only)
export const grantPremium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { duration } = req.body; // duration in months

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    
    if (duration === 'lifetime') {
      // No expiration for lifetime premium
      await user.update({
        isPremium: true,
        premiumSince: user.premiumSince || now,
        premiumExpiresAt: null
      });
    } else {
      // Add duration in months
      const months = parseInt(duration) || 1;
      expiresAt.setMonth(expiresAt.getMonth() + months);
      
      await user.update({
        isPremium: true,
        premiumSince: user.premiumSince || now,
        premiumExpiresAt: expiresAt
      });
    }

    res.json({
      message: 'Premium granted successfully',
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium,
        premiumSince: user.premiumSince,
        premiumExpiresAt: user.premiumExpiresAt
      }
    });
  } catch (error) {
    console.error('Error granting premium:', error);
    res.status(500).json({ message: 'Failed to grant premium' });
  }
};

// Revoke premium from user (Admin only)
export const revokePremium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      isPremium: false,
      premiumExpiresAt: new Date() // Set to now to mark as expired
    });

    res.json({
      message: 'Premium revoked successfully',
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Error revoking premium:', error);
    res.status(500).json({ message: 'Failed to revoke premium' });
  }
};

// Get all premium users (Admin only)
export const getPremiumUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const premiumUsers = await User.findAll({
      where: { isPremium: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'isPremium', 'premiumSince', 'premiumExpiresAt', 'isVerified'],
      order: [['premiumSince', 'DESC']]
    });

    res.json(premiumUsers);
  } catch (error) {
    console.error('Error fetching premium users:', error);
    res.status(500).json({ message: 'Failed to fetch premium users' });
  }
};

// Subscribe to premium (Customer)
export const subscribeToPremium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { plan } = req.body; // 'monthly' or 'yearly'

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPremium) {
      return res.status(400).json({ message: 'User already has premium' });
    }

    // In a real app, you would process payment here
    // For now, we'll just grant premium

    const now = new Date();
    const expiresAt = new Date(now);
    
    if (plan === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    await user.update({
      isPremium: true,
      premiumSince: now,
      premiumExpiresAt: expiresAt
    });

    res.json({
      message: 'Successfully subscribed to premium!',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isPremium: user.isPremium,
        premiumSince: user.premiumSince,
        premiumExpiresAt: user.premiumExpiresAt
      }
    });
  } catch (error) {
    console.error('Error subscribing to premium:', error);
    res.status(500).json({ message: 'Failed to subscribe to premium' });
  }
};
