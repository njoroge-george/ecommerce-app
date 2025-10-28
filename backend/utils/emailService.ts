const nodemailer = require('nodemailer');
import dotenv from 'dotenv';

dotenv.config();

// Create transporter lazily
let transporter: any = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
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

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
  getTransporter,
};
