const db = require("../firebase");
const admin = require("firebase-admin");

/* =========================
   PLACE ORDER (UPI + ADDRESS)
========================= */
const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      paymentTxnId,
      address,
    } = req.body;

    if (
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !totalAmount ||
      !paymentTxnId ||
      !address ||
      !address.address ||
      !address.city ||
      !address.pincode
    ) {
      return res.status(400).json({
        error: "Invalid order data",
      });
    }

    const order = {
      userId,
      items,
      totalAmount,
      paymentMethod: "UPI",
      paymentTxnId,
      address,

      status: "PAYMENT_PENDING",

      // ✅ CORRECT TIMESTAMPS
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await db.collection("orders").add(order);

    // 🧹 Clear cart
    const cartSnap = await db
      .collection("carts")
      .where("userId", "==", userId)
      .get();

    const batch = db.batch();
    cartSnap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(201).json({
      message: "Order placed",
      orderId: orderRef.id,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET USER ORDERS
========================= */
const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const snapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,

        // ✅ FORCE timestamps to frontend
        createdAt: data.createdAt || null,
        paymentSubmittedAt: data.paymentSubmittedAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  placeOrder,
  getOrders,
};
