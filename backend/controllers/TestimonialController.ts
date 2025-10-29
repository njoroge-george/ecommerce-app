import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import User from '../models/User';

// Submit a testimonial (public or authenticated)
export const submitTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, comment, rating } = req.body;
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user?.id;

    if (!name || !email || !comment || !rating) {
      res.status(400).json({ message: 'Name, email, comment, and rating are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    // Create testimonial (pending approval)
    const testimonial = await Testimonial.create({
      userId: userId || null,
      name,
      email,
      role: role || 'Customer',
      comment,
      rating,
      isApproved: false, // Requires admin approval
      isVisible: true,
    });

    res.status(201).json({
      message: 'Thank you for your testimonial! It will be reviewed and published soon.',
      testimonial: {
        id: testimonial.id,
        name: testimonial.name,
        rating: testimonial.rating,
        comment: testimonial.comment,
      },
    });
  } catch (error: any) {
    console.error('Submit testimonial error:', error);
    res.status(500).json({ message: 'Failed to submit testimonial. Please try again later.' });
  }
};

// Get approved testimonials (public)
export const getApprovedTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const testimonials = await Testimonial.findAll({
      where: {
        isApproved: true,
        isVisible: true,
      },
      attributes: ['id', 'name', 'role', 'comment', 'rating', 'createdAt', 'userId'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    // Format response to include avatar at the root level with full URL
    const formattedTestimonials = testimonials.map((t: any) => {
      let avatarUrl = null;
      if (t.user?.avatar) {
        // Convert relative path to full URL
        avatarUrl = t.user.avatar.startsWith('http') 
          ? t.user.avatar 
          : `${req.protocol}://${req.get('host')}${t.user.avatar}`;
      }
      
      return {
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
        createdAt: t.createdAt,
        avatar: avatarUrl,
      };
    });

    res.status(200).json({
      total: formattedTestimonials.length,
      testimonials: formattedTestimonials,
    });
  } catch (error: any) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

// Get all testimonials (admin only)
export const getAllTestimonials = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { approved, visible } = req.query;

    const whereClause: any = {};
    if (approved !== undefined) {
      whereClause.isApproved = approved === 'true';
    }
    if (visible !== undefined) {
      whereClause.isVisible = visible === 'true';
    }

    const testimonials = await Testimonial.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format response to include avatar at the root level with full URL
    const formattedTestimonials = testimonials.map((t: any) => {
      let avatarUrl = null;
      if (t.user?.avatar) {
        // Convert relative path to full URL
        avatarUrl = t.user.avatar.startsWith('http') 
          ? t.user.avatar 
          : `${req.protocol}://${req.get('host')}${t.user.avatar}`;
      }
      
      return {
        id: t.id,
        userId: t.userId,
        name: t.name,
        email: t.email,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
        isApproved: t.isApproved,
        isVisible: t.isVisible,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        avatar: avatarUrl,
        user: t.user,
      };
    });

    res.status(200).json({
      total: formattedTestimonials.length,
      testimonials: formattedTestimonials,
    });
  } catch (error: any) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

// Approve a testimonial (admin only)
export const approveTestimonial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    testimonial.isApproved = true;
    await testimonial.save();

    res.status(200).json({
      message: 'Testimonial approved successfully',
      testimonial,
    });
  } catch (error: any) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ message: 'Failed to approve testimonial' });
  }
};

// Reject/Delete a testimonial (admin only)
export const deleteTestimonial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    await testimonial.destroy();

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
};

// Toggle testimonial visibility (admin only)
export const toggleVisibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    testimonial.isVisible = !testimonial.isVisible;
    await testimonial.save();

    res.status(200).json({
      message: `Testimonial ${testimonial.isVisible ? 'shown' : 'hidden'} successfully`,
      testimonial,
    });
  } catch (error: any) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ message: 'Failed to toggle visibility' });
  }
};

// Get pending testimonials count (admin only)
export const getPendingCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const count = await Testimonial.count({
      where: {
        isApproved: false,
      },
    });

    res.status(200).json({ pendingCount: count });
  } catch (error: any) {
    console.error('Get pending count error:', error);
    res.status(500).json({ message: 'Failed to get pending count' });
  }
};
