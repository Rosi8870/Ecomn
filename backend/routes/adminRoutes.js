const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const db = require("../firebase");

// 🔹 Get ALL orders
router.get("/orders", adminAuth, async (req, res) => {
  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();

  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(orders);
});

// 🔹 Update order status
router.put("/orders/:orderId", adminAuth, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  await db.collection("orders").doc(orderId).update({ status });

  res.json({ message: "Order status updated" });
});

module.exports = router;
