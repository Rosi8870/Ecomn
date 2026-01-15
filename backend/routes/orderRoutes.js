const express = require("express");
const router = express.Router();
const db = require("../firebase");

const {
  placeOrder,
  getOrders,
} = require("../controllers/orderController");

/**
 * =====================================================
 * ORDERS ROUTES
 * =====================================================
 */

/**
 * ✅ PLACE ORDER
 * POST /api/orders
 * Body:
 * {
 *   userId,
 *   items,
 *   totalAmount,
 *   address: { name, address, city, pincode }
 * }
 */
router.post("/", placeOrder);

/**
 * ✅ GET USER ORDERS
 * GET /api/orders?userId=XXXX
 */
router.get("/", getOrders);

/**
 * ✅ SUBMIT UPI PAYMENT TRANSACTION ID
 * PUT /api/orders/:orderId/payment
 * Body:
 * {
 *   paymentTxnId
 * }
 */
router.put("/:orderId/payment", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentTxnId } = req.body;

    if (!paymentTxnId) {
      return res.status(400).json({
        error: "UPI Transaction ID is required",
      });
    }

    await db.collection("orders").doc(orderId).update({
      paymentTxnId,
      status: "PAYMENT_SUBMITTED",
      paymentSubmittedAt: new Date(),
    });

    res.json({
      message: "Payment submitted successfully",
    });
  } catch (err) {
    console.error("PAYMENT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
