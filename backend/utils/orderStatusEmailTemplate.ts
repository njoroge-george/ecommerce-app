interface OrderStatusEmailData {
  customerName: string;
  orderNumber: string;
  status: string;
  statusMessage: string;
  orderDate: string;
  total: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export const generateOrderStatusEmail = (data: OrderStatusEmailData): string => {
  const {
    customerName,
    orderNumber,
    status,
    statusMessage,
    orderDate,
    total,
    trackingUrl,
    estimatedDelivery,
  } = data;

  const statusColors: Record<string, string> = {
    pending: "#ff9800",
    confirmed: "#2196f3",
    processing: "#2196f3",
    shipped: "#2196f3",
    delivered: "#4caf50",
    cancelled: "#f44336",
  };

  const statusIcons: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    processing: "📦",
    shipped: "🚚",
    delivered: "🎉",
    cancelled: "❌",
  };

  const statusColor = statusColors[status.toLowerCase()] || "#2196f3";
  const statusIcon = statusIcons[status.toLowerCase()] || "📋";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}CC 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ${statusIcon} Order Update
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                                Your order status has been updated
                            </p>
                        </td>
                    </tr>

                    <!-- Status Badge -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <div style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 12px 24px; border-radius: 25px; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
                                ${status}
                            </div>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">
                                Hello ${customerName},
                            </h2>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                ${statusMessage}
                            </p>
                        </td>
                    </tr>

                    <!-- Order Details -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="color: #666666; font-size: 14px;">Order Number:</span>
                                    </td>
                                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333; font-size: 14px;">${orderNumber}</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="color: #666666; font-size: 14px;">Order Date:</span>
                                    </td>
                                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333; font-size: 14px;">${orderDate}</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="color: #666666; font-size: 14px;">Total Amount:</span>
                                    </td>
                                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #2196f3; font-size: 16px;">${total}</strong>
                                    </td>
                                </tr>
                                ${estimatedDelivery ? `
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <span style="color: #666666; font-size: 14px;">Estimated Delivery:</span>
                                    </td>
                                    <td style="padding: 10px 0; text-align: right;">
                                        <strong style="color: #4caf50; font-size: 14px;">${estimatedDelivery}</strong>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                        </td>
                    </tr>

                    <!-- Track Order Button -->
                    ${trackingUrl ? `
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <a href="${trackingUrl}" style="display: inline-block; background-color: ${statusColor}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 25px; font-weight: 700; font-size: 16px; transition: all 0.3s;">
                                Track Your Order
                            </a>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Additional Info based on status -->
                    ${status.toLowerCase() === 'delivered' ? `
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; border-radius: 4px;">
                                <p style="margin: 0; color: #2e7d32; font-size: 14px; line-height: 1.6;">
                                    <strong>🎉 Thank you for your purchase!</strong><br>
                                    We hope you love your order. If you have any questions or concerns, please don't hesitate to contact us.
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    ${status.toLowerCase() === 'shipped' ? `
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px;">
                                <p style="margin: 0; color: #1565c0; font-size: 14px; line-height: 1.6;">
                                    <strong>🚚 Your order is on its way!</strong><br>
                                    Please ensure someone is available to receive the delivery. Track your order for real-time updates.
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Support Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <p style="color: #999999; font-size: 14px; margin: 0 0 10px 0;">
                                Need help? We're here for you!
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="mailto:support@yourstore.com" style="color: #2196f3; text-decoration: none; font-size: 14px; margin: 0 10px;">
                                    📧 Email Us
                                </a>
                                <span style="color: #cccccc;">|</span>
                                <a href="https://wa.me/254712345678" style="color: #25D366; text-decoration: none; font-size: 14px; margin: 0 10px;">
                                    💬 WhatsApp
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                © 2025 Your Store Name. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                This is an automated email. Please do not reply directly to this message.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

export const getStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    pending: "We've received your order and it's awaiting confirmation. We'll process it shortly!",
    confirmed: "Great news! Your order has been confirmed and will be processed soon.",
    processing: "Your order is being carefully prepared by our team. We're getting everything ready for shipment!",
    shipped: "Exciting! Your order has been shipped and is on its way to you. You'll receive it soon!",
    delivered: "Your order has been successfully delivered! We hope you enjoy your purchase. Thank you for shopping with us!",
    cancelled: "Your order has been cancelled as requested. If this wasn't intentional, please contact our support team.",
  };

  return messages[status.toLowerCase()] || "Your order status has been updated.";
};
