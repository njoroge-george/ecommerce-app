import express from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);
// Protected routes
router.get("/profile", protect, (req, res) => {
    res.json({ message: `Welcome ${req.user.name}` });
})

// Admin-only route
router.get("/admin", protect, adminOnly, (req, res) => {
    res.json({ message: "Welcome to the admin panel" });
})

export default router;
