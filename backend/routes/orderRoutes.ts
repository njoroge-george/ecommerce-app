const express = require("express");
const { getOrders, updateOrderStatus, createOrder, getOrderInvoice, getMyOrders, getOrderTracking } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// Customer order routes
router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id/tracking", protect, getOrderTracking);
router.get("/:orderNumber/invoice", protect, getOrderInvoice);

// Admin-only order routes
router.get("/", protect, adminOnly, getOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
