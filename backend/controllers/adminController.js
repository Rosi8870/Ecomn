const db = require("../firebase");
const isAdmin = require("../utils/isAdmin");

exports.getAllOrders = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(403).json({ error: "Email missing" });
    }

    if (!isAdmin(email)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { email, status } = req.body;
  const { orderId } = req.params;

  if (!isAdmin(email)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await db.collection("orders").doc(orderId).update({
    status,
  });

  res.json({ message: "Order updated" });
};
