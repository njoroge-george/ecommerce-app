# 🛒 EcoShop - Ecommerce Application

A full-stack ecommerce application with React + TypeScript frontend and Node.js + Express backend.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL or MySQL database

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 2. Setup Environment Variables

#### Backend (.env)
Create `/backend/.env`:
```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

#### Frontend (.env)
Already created at `/frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### 3. Start Development Servers

```bash
# Start both backend and frontend concurrently
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📱 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Test Page**: http://localhost:5173/api-test

## 🔑 Test the Setup

1. Visit http://localhost:5173/api-test to verify backend connection
2. Register a new user at http://localhost:5173/login
3. Login with your credentials
4. Navigate to Dashboard to manage products

## 📦 Features

### ✅ Implemented
- User authentication (Register/Login/Logout)
- Product CRUD operations
- Image upload for products
- Product categories and filtering
- Responsive design with Material-UI
- CSS Grid layout system
- Protected routes
- JWT authentication
- File upload with Multer

### 📝 API Endpoints

#### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

#### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin only, with image upload)
- PUT `/api/products/:id` - Update product (Admin only)
- DELETE `/api/products/:id` - Delete product (Admin only)

## 🐛 Troubleshooting

### Products not showing?
1. Check if backend is running on port 5000
2. Visit http://localhost:5173/api-test
3. Check browser console for errors
4. Verify you're logged in (token should exist)

### Can't create products?
1. Ensure you're logged in
2. Check if your user has admin role
3. Verify image size is under 2MB
4. Check backend console for errors

### Image upload failing?
1. Check `/backend/uploads` folder exists
2. Verify multer middleware is configured
3. Check file type (only jpg, png, gif allowed)
4. Ensure file size is under 2MB

## 🛠️ Tech Stack

### Frontend
- React 18+ with TypeScript
- Material-UI v5
- React Router v6
- Axios for API calls
- Framer Motion for animations
- Vite build tool

### Backend
- Node.js with Express
- TypeScript
- Sequelize ORM
- PostgreSQL/MySQL
- JWT authentication
- Multer for file uploads
- bcrypt for password hashing

## 📂 Project Structure

```
myapp/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Auth, upload middlewares
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded images
│   └── server.ts        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API modules
│   │   ├── components/
│   │   │   ├── layout/    # Navbar, Sidebar, Footer
│   │   │   ├── common/    # Reusable components
│   │   │   └── forms/     # Form components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   ├── theme/         # Theme configuration
│   │   ├── utils/         # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── package.json         # Root package.json
```

## 🎨 Key Features

### CSS Grid Layout
All layouts use CSS Grid for responsive design:
- Desktop: Sidebar (280px) + Main content
- Mobile: Full-width with drawer sidebar
- Footer always at bottom

### Authentication Flow
1. User registers/logs in
2. JWT token stored in localStorage
3. Token attached to all API requests
4. Protected routes redirect to login if not authenticated

### Image Upload
1. Select image in AddProduct form
2. Image preview shown before upload
3. Image uploaded with FormData
4. Backend saves to `/uploads` folder
5. Image URL stored in database
6. Images served from `/uploads` route

## 📝 Notes

- Default admin credentials: Check backend seed data
- Images are served from backend: http://localhost:5000/uploads/filename
- Token is automatically attached to all API requests
- CORS is configured for localhost:5173

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC
