/**
 * Product Routes
 * --------------
 * Defines all RESTful routes for product management.
 */

import express from "express";
import { upload } from "../middlewares/uploadMiddleware";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} from "../controllers/productController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

// Stats route (must come before /:id)
router.get("/stats/dashboard", protect, adminOnly, getDashboardStats);

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
