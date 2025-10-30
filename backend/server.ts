import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import sequelize, { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import orderRoutes from "./routes/orderRoutes";
import customerRoutes from "./routes/customerRoutes";
import messageRoutes from "./routes/messageRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import ratingsRoutes from "./routes/ratings";
import wishlistRoutes from "./routes/wishlistRoutes";
import profileRoutes from "./routes/profile";
import couponRoutes from "./routes/couponRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import mpesaRoutes from "./routes/mpesaRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import premiumRoutes from "./routes/premium";
import newsletterRoutes from "./routes/newsletter";
import testimonialRoutes from "./routes/testimonials";
import twoFactorRoutes from "./routes/twoFactor";
const googleAuthRoutes = require("./routes/googleAuth");
const passport = require("./config/passport");
import './models/associations'; // Initialize model associations

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Make io accessible to our router
app.set("io", io);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes); // Google OAuth routes
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", ratingsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/uploads", express.static("uploads"));

// Socket.IO connection handling
const connectedUsers = new Map(); // Store userId -> socketId mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User authentication
  socket.on("authenticate", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Handle chat messages
  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message } = data;
    
    // Emit to receiver if online
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
      });
      console.log(`✉️ Message delivered to user ${receiverId} in real-time`);
    } else {
      console.log(`📬 User ${receiverId} offline - message saved to database`);
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { senderId, receiverId, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        userId: senderId,
        isTyping,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Sync models - only create new tables, don't alter existing ones
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Database synced with Sequelize"))
  .catch((err) => console.error("❌ Sync error:", err));

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
