import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Coupon from '../models/Coupon';
import { Op } from 'sequelize';

// Validate and apply coupon
export const validateCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: 'Coupon code and order total are required' });
    }

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    // Check expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    // Check minimum purchase
    const minPurchaseValue = parseFloat(coupon.minPurchase.toString());
    if (orderTotal < minPurchaseValue) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${minPurchaseValue.toFixed(2)} required to use this coupon` 
      });
    }

    // Calculate discount
    let discount = 0;
    const discountValue = parseFloat(coupon.discountValue.toString());
    const maxDiscountValue = coupon.maxDiscount ? parseFloat(coupon.maxDiscount.toString()) : null;
    
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * discountValue) / 100;
      if (maxDiscountValue && discount > maxDiscountValue) {
        discount = maxDiscountValue;
      }
    } else {
      discount = discountValue;
    }

    const finalTotal = Math.max(0, orderTotal - discount);

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: discountValue,
      },
      discount: parseFloat(discount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply coupon (increment usage count)
export const applyCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({ message: 'Coupon applied successfully', coupon });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all coupons (admin)
export const getAllCoupons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active coupons (public)
export const getActiveCoupons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { expiryDate: null },
          { expiryDate: { [Op.gt]: new Date() } }
        ]
      },
      attributes: ['code', 'description', 'discountType', 'discountValue', 'minPurchase', 'expiryDate'],
      order: [['createdAt', 'DESC']],
    });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create coupon (admin)
export const createCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minPurchase, 
      maxDiscount, 
      usageLimit, 
      expiryDate,
      isActive 
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: 'Code, discount type, and discount value are required' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update coupon (admin)
export const updateCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      description, 
      discountType, 
      discountValue, 
      minPurchase, 
      maxDiscount, 
      usageLimit, 
      expiryDate,
      isActive 
    } = req.body;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Update fields
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = parseFloat(discountValue);
    if (minPurchase !== undefined) coupon.minPurchase = parseFloat(minPurchase);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete coupon (admin)
export const deleteCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.destroy();

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
