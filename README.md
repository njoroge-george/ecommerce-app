# 🛒 E-Commerce Platform

A full-stack e-commerce application built with React, TypeScript, Node.js, Express, and MySQL. Features include real-time chat, M-Pesa payment integration, product management, order tracking, and comprehensive admin dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

## ✨ Features

### 🛍️ Customer Features
- **Product Browsing**: Browse products with search, filtering, and sorting
- **Shopping Cart**: Add/remove products, update quantities
- **Wishlist**: Save favorite products for later
- **Product Reviews**: Rate and review products
- **Order Management**: Place orders, track status, download invoices
- **M-Pesa Integration**: Pay via M-Pesa STK Push (with mock mode for testing)
- **Live Chat**: Real-time chat with admin support
- **Profile Management**: Update profile, upload avatar, request verification
- **Email Notifications**: Order confirmations and status updates

### 👨‍💼 Admin Features
- **Dashboard Analytics**: Real-time revenue, orders, customers, and sales trends
- **Product Management**: Create, update, delete products with image uploads
- **Order Management**: View, update order status, process payments
- **Customer Management**: View customer list and details
- **Message Center**: Respond to customer inquiries with email notifications
- **Coupon System**: Create and manage discount coupons
- **User Verification**: Verify user accounts to prevent scammers

### 🔒 Security Features
- JWT-based authentication
- Role-based access control (Admin, Moderator, Customer)
- Password hashing with bcrypt
- Profile verification system
- Secure file uploads with validation

### 🎨 UI/UX Features
- **Unified Navigation**: Single navbar for all user roles with theme toggle
- **Dark/Light Mode**: System-wide theme switching
- **Responsive Design**: Mobile-first design with Material-UI
- **Role Indicators**: Visual badges for admin/moderator users
- **Verification Badges**: Verified user indicators
- **Modern Profile Page**: Avatar upload, verification status, comprehensive editing

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization
- **Formik & Yup** - Form validation
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM
- **MySQL** - Database
- **Socket.IO** - Real-time messaging
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing

### Payment Integration
- **M-Pesa Daraja API** - Mobile payments (with mock mode)
- **Stripe** - Card payments (optional)

## 📋 Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/njoroge-george/ecommerce-app.git
cd ecommerce-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
nano .env
```

**Backend Environment Variables:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dashboard

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_MOCK_MODE=true  # Set to false for production

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Database Setup:**
```bash
# Create database
mysql -u root -p
CREATE DATABASE dashboard;

# Run migrations
mysql -u root -p dashboard < migrations/add-mpesa-fields.sql
mysql -u root -p dashboard < migrations/add-user-avatar-verification.sql

# Run database seeder (optional)
npm run seed
```

**Start Backend Server:**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
nano .env
```

**Frontend Environment Variables:**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Start Frontend Server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/           # Database and configuration
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Auth, upload, validation
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   │   ├── avatars/     # User profile pictures
│   │   └── products/    # Product images
│   ├── migrations/      # Database migrations
│   └── server.ts        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── theme/       # MUI theme configuration
│   │   ├── utils/       # Helper functions
│   │   └── App.tsx      # Main app component
│   └── public/          # Static assets
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
```

### Products
```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product by ID
POST   /api/products           - Create product (Admin)
PATCH  /api/products/:id       - Update product (Admin)
DELETE /api/products/:id       - Delete product (Admin)
```

### Orders
```
GET    /api/orders             - Get all orders (Admin)
GET    /api/orders/my-orders   - Get user orders
POST   /api/orders             - Create order
PATCH  /api/orders/:id         - Update order status (Admin)
GET    /api/orders/:id/invoice - Download invoice
```

### Profile
```
GET    /api/users/profile                    - Get profile
PATCH  /api/users/profile                    - Update profile
PATCH  /api/users/profile/password           - Change password
POST   /api/users/profile/avatar             - Upload avatar
POST   /api/users/profile/request-verification - Request verification
GET    /api/users/addresses                  - Get addresses
POST   /api/users/addresses                  - Add address
```

### M-Pesa
```
POST   /api/mpesa/stk-push     - Initiate STK Push
POST   /api/mpesa/callback     - M-Pesa callback
GET    /api/mpesa/status/:id   - Query transaction status
```

### Messages
```
GET    /api/messages/conversations           - Get all conversations
GET    /api/messages/conversation/:userId    - Get conversation
POST   /api/messages/send                    - Send message
PATCH  /api/messages/:id/read                - Mark as read
```

### Analytics (Admin)
```
GET    /api/analytics          - Get dashboard analytics
```

## 🎯 Usage

### Default Admin Account
After running the seeder, you can login with:
- **Email**: admin@example.com
- **Password**: admin123

### M-Pesa Mock Mode
For testing without actual M-Pesa API:
1. Set `MPESA_MOCK_MODE=true` in `.env`
2. Use any phone number format (e.g., 0712345678)
3. Payment auto-confirms after 3 seconds
4. Mock receipt number generated automatically

### Profile Verification
1. Upload a profile picture
2. Click "Request Verification" button
3. Account is verified instantly (in production, would require admin approval)
4. Verified badge appears on profile and navbar

## 🔄 Real-Time Features

### Live Chat
- Customer-to-admin messaging
- Real-time message delivery via Socket.IO
- Typing indicators
- Email notifications for offline users
- Message persistence in database

### Socket Events
```javascript
// Client
socket.emit('authenticate', { userId })
socket.emit('sendMessage', { receiverId, content })
socket.emit('typing', { receiverId })

// Server
socket.on('newMessage', (message) => {})
socket.on('userTyping', (data) => {})
```

## 📧 Email Notifications

The system sends automated emails for:
- Order confirmations with details
- Order status updates
- New message notifications
- Password reset (if implemented)

## 🎨 Theme Customization

The app supports light and dark modes. Theme can be toggled from the navbar.

Theme configuration: `frontend/src/theme/theme.ts`

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🚀 Deployment

### Backend Deployment (e.g., Render, Railway)
1. Set environment variables
2. Configure database connection
3. Run migrations
4. Deploy from GitHub

### Frontend Deployment (e.g., Vercel, Netlify)
1. Set `VITE_API_URL` to production backend URL
2. Build project
3. Deploy

### Database
- Use managed MySQL (e.g., PlanetScale, AWS RDS)
- Ensure proper indexes for performance
- Regular backups

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**George Njoroge**
- GitHub: [@njoroge-george](https://github.com/njoroge-george)

## 🙏 Acknowledgments

- Material-UI for the component library
- Sequelize for ORM
- Socket.IO for real-time features
- Safaricom for M-Pesa Daraja API

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Product recommendation engine
- [ ] Advanced search with filters
- [ ] Social media authentication
- [ ] Multiple payment gateways
- [ ] Inventory management
- [ ] Sales reports and exports
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Shipping integration
- [ ] Advanced analytics dashboard

## 📸 Screenshots

### Customer Dashboard
![Customer Dashboard](screenshots/dashboard.png)

### Product Listing
![Products](screenshots/products.png)

### Admin Panel
![Admin](screenshots/admin.png)

### Live Chat
![Chat](screenshots/chat.png)

---

**Note**: Remember to update the email address, add screenshots, and customize sections as needed for your specific implementation.
