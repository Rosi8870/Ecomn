const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cartController");

// Get user's cart
router.get("/:userId", getCart);

// Add product to cart
router.post("/", addToCart);

// Update quantity (+ / −)
router.put("/:cartId", updateCartQuantity);

// Remove item
router.delete("/:cartId", removeFromCart);

module.exports = router;
