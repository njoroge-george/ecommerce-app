import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { sendNewsletterWelcomeEmail, sendNewsletterUnsubscribeEmail } from '../utils/emailService';

// Subscribe to newsletter (public endpoint)
export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ where: { email } });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        res.status(400).json({ message: 'This email is already subscribed to our newsletter' });
        return;
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;
        await existingSubscriber.save();
        
        // Send welcome email
        console.log(`📧 Attempting to send re-subscribe email to: ${email}`);
        try {
          await sendNewsletterWelcomeEmail(email);
          console.log(`✅ Re-subscribe email sent successfully to: ${email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send re-subscribe email to ${email}:`, emailError);
        }
        
        res.status(200).json({ message: 'Successfully re-subscribed to newsletter!' });
        return;
      }
    }

    // Create new subscriber
    await Newsletter.create({ email });
    
    // Send welcome email
    console.log(`📧 Attempting to send welcome email to: ${email}`);
    try {
      await sendNewsletterWelcomeEmail(email);
      console.log(`✅ Welcome email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
    }

    res.status(201).json({ 
      message: 'Successfully subscribed! Check your email for confirmation.',
      email 
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Failed to subscribe. Please try again later.' });
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      res.status(404).json({ message: 'Email not found in our newsletter list' });
      return;
    }

    if (!subscriber.isActive) {
      res.status(400).json({ message: 'This email is already unsubscribed' });
      return;
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    
    // Send unsubscribe confirmation email
    await sendNewsletterUnsubscribeEmail(email);

    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again later.' });
  }
};

// Get all subscribers (admin only)
export const getAllSubscribers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { active } = req.query;

    const whereClause: any = {};
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const subscribers = await Newsletter.findAll({
      where: whereClause,
      order: [['subscribedAt', 'DESC']],
    });

    res.status(200).json({
      total: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

// Get subscriber count (admin only)
export const getSubscriberStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalSubscribers = await Newsletter.count();
    const activeSubscribers = await Newsletter.count({ where: { isActive: true } });
    const inactiveSubscribers = await Newsletter.count({ where: { isActive: false } });

    res.status(200).json({
      total: totalSubscribers,
      active: activeSubscribers,
      inactive: inactiveSubscribers,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// Delete a subscriber (admin only)
export const deleteSubscriber = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      res.status(404).json({ message: 'Subscriber not found' });
      return;
    }

    await subscriber.destroy();

    res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error: any) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ message: 'Failed to delete subscriber' });
  }
};
