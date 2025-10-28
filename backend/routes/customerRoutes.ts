import express from "express";
import { getCustomers } from "../controllers/customerController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

// Admin-only customer routes
router.get("/", protect, adminOnly, getCustomers);

export default router;
