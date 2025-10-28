import express from "express";
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const RecommendationsController = require("../controllers/RecommendationsController");

// @route   GET /api/recommendations/related/:productId
// @desc    Get related products
// @access  Public
router.get("/related/:productId", RecommendationsController.getRelatedProducts);

// @route   GET /api/recommendations/frequently-bought-together/:productId
// @desc    Get frequently bought together products
// @access  Public
router.get("/frequently-bought-together/:productId", RecommendationsController.getFrequentlyBoughtTogether);

// @route   GET /api/recommendations/for-you
// @desc    Get personalized recommendations
// @access  Authenticated
router.get("/for-you", protect, RecommendationsController.getPersonalizedRecommendations);

// @route   GET /api/recommendations/trending
// @desc    Get trending products
// @access  Public
router.get("/trending", RecommendationsController.getTrendingProducts);

// @route   GET /api/recommendations/new-arrivals
// @desc    Get new arrivals
// @access  Public
router.get("/new-arrivals", RecommendationsController.getNewArrivals);

module.exports = router;
