import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter lazily
let transporter: any = null;

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Email templates
export const sendOrderConfirmationEmail = async (
  to: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: number;
    items: any[];
    shippingAddress: string;
  }
) => {
  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmation - ${orderDetails.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 20px; font-weight: bold; color: #667eea; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p>Thank you for your purchase, ${orderDetails.customerName}</p>
            </div>
            <div class="content">
              <div class="order-info">
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h3>Items Ordered:</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderDetails.items.map(item => `
                      <tr>
                        <td>${item.productName || item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <p class="total">Total: $${orderDetails.total.toFixed(2)}</p>
                
                <h3>Shipping Address:</h3>
                <p>${orderDetails.shippingAddress}</p>
              </div>
              
              <p>We'll send you another email when your order ships. You can track your order status anytime by logging into your account.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
              <p>If you have any questions, contact us at support@ecoshop.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

export const sendOrderStatusEmail = async (
  to: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    status: string;
    trackingNumber?: string;
  }
) => {
  const statusMessages: any = {
    confirmed: {
      subject: 'Order Confirmed',
      message: 'Your order has been confirmed and is being prepared.',
    },
    processing: {
      subject: 'Order Processing',
      message: 'We are currently processing your order.',
    },
    shipped: {
      subject: 'Order Shipped',
      message: 'Great news! Your order has been shipped.',
    },
    delivered: {
      subject: 'Order Delivered',
      message: 'Your order has been delivered. We hope you enjoy your purchase!',
    },
  };

  const statusInfo = statusMessages[orderDetails.status] || {
    subject: 'Order Update',
    message: 'Your order status has been updated.',
  };

  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to,
    subject: `${statusInfo.subject} - ${orderDetails.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .status-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.subject}</h1>
            </div>
            <div class="content">
              <p>Hello ${orderDetails.customerName},</p>
              
              <div class="status-box">
                <h2>Order #${orderDetails.orderNumber}</h2>
                <p>${statusInfo.message}</p>
                ${orderDetails.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>` : ''}
              </div>
              
              <p>You can track your order status anytime:</p>
              <a href="http://localhost:5173/my-orders" class="button">Track Order</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${to}`);
  } catch (error) {
    console.error('Error sending order status email:', error);
  }
};

export const sendPasswordResetEmail = async (to: string, resetToken: string, userName: string) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendNewsletterWelcomeEmail = async (to: string) => {
  const mailOptions = {
    from: `"EcoShop Newsletter" <${process.env.SMTP_USER}>`,
    to,
    subject: '🎉 Welcome to EcoShop Newsletter!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #093FB4 0%, #ED3500 100%); 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px 20px; }
            .welcome-box { 
              background: white; 
              padding: 25px; 
              margin: 20px 0; 
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .benefits { 
              background: white; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 8px;
            }
            .benefit-item {
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .benefit-item:last-child {
              border-bottom: none;
            }
            .button { 
              display: inline-block; 
              padding: 15px 40px; 
              background: #093FB4; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 12px; 
              background: #f9f9f9;
              border-radius: 0 0 10px 10px;
            }
            .emoji { font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">📬 Welcome to Our Newsletter!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">You're now part of our exclusive community</p>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2 style="color: #093FB4; margin-top: 0;">Thank You for Subscribing! 🎉</h2>
                <p>We're thrilled to have you join our community of over <strong>50,000+ happy customers</strong>.</p>
                <p>Get ready to receive:</p>
              </div>
              
              <div class="benefits">
                <div class="benefit-item">
                  <span class="emoji">🎁</span> <strong>Exclusive Deals & Discounts</strong> - Special offers just for subscribers
                </div>
                <div class="benefit-item">
                  <span class="emoji">✨</span> <strong>New Product Launches</strong> - Be the first to know about new arrivals
                </div>
                <div class="benefit-item">
                  <span class="emoji">💡</span> <strong>Expert Tips & Guides</strong> - Helpful content curated for you
                </div>
                <div class="benefit-item">
                  <span class="emoji">🎉</span> <strong>Seasonal Sales</strong> - Early access to our biggest promotions
                </div>
                <div class="benefit-item">
                  <span class="emoji">🏆</span> <strong>Premium Member Benefits</strong> - Learn about our VIP program
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #093FB4; font-weight: bold;">Start Shopping Now!</p>
                <a href="http://localhost:5173/shop" class="button">Explore Our Products</a>
              </div>
              
              <div class="welcome-box">
                <p style="margin: 0;"><strong>💎 Want More?</strong> Upgrade to Premium Membership for exclusive perks, free shipping, and priority support!</p>
                <a href="http://localhost:5173/premium" style="color: #093FB4; text-decoration: none; font-weight: bold;">Learn More →</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
              <p style="margin: 5px 0;">You're receiving this because you subscribed to our newsletter.</p>
              <p style="margin: 5px 0; color: #999;">
                Don't want these emails? <a href="http://localhost:5173" style="color: #093FB4;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Newsletter welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending newsletter welcome email:', error);
    return false;
  }
};

export const sendNewsletterUnsubscribeEmail = async (to: string) => {
  const mailOptions = {
    from: `"EcoShop Newsletter" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Sorry to See You Go - EcoShop Newsletter',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: #6c757d; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px 20px; }
            .message-box { 
              background: white; 
              padding: 25px; 
              margin: 20px 0; 
              border-radius: 8px;
              text-align: center;
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #093FB4; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">We'll Miss You! 😢</h1>
            </div>
            <div class="content">
              <div class="message-box">
                <h2 style="color: #6c757d; margin-top: 0;">You've Been Unsubscribed</h2>
                <p>You've successfully unsubscribed from our newsletter. We're sorry to see you go!</p>
                <p>You will no longer receive promotional emails from EcoShop.</p>
                
                <p style="margin-top: 30px;"><strong>Changed your mind?</strong></p>
                <a href="http://localhost:5173" class="button">Subscribe Again</a>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  We'd love to hear your feedback! Let us know why you unsubscribed so we can improve.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Newsletter unsubscribe confirmation sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending unsubscribe confirmation email:', error);
    return false;
  }
};

// Generic send email function
export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

