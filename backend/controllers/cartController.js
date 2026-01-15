const db = require("../firebase");

/* =========================
   GET USER CART
========================= */
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const snapshot = await db
      .collection("carts")
      .where("userId", "==", userId)
      .get();

    const cart = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(cart);
  } catch (err) {
    console.error("❌ GET CART ERROR:", err);
    res.status(500).json({ error: "Failed to load cart" });
  }
};

/* =========================
   ADD TO CART
========================= */
exports.addToCart = async (req, res) => {
  try {
    const { userId, product } = req.body;

    if (!userId || !product || !product.id) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const cartRef = db.collection("carts");

    const snapshot = await cartRef
      .where("userId", "==", userId)
      .where("productId", "==", product.id)
      .get();

    // 🔁 Product already in cart
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const currentQty = doc.data().quantity || 1;

      await doc.ref.update({
        quantity: currentQty + (Number(product.quantity) || 1),
        updatedAt: new Date(),
      });

      return res.json({ message: "Cart quantity updated" });
    }

    // ➕ New cart item
    await cartRef.add({
      userId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: Number(product.quantity) || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    console.error("❌ ADD TO CART ERROR:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

/* =========================
   UPDATE QUANTITY (+ / −)
========================= */
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);

    if (!cartId || isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const cartRef = db.collection("carts").doc(cartId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartRef.update({
      quantity: qty,
      updatedAt: new Date(),
    });

    res.json({ message: "Quantity updated", quantity: qty });
  } catch (err) {
    console.error("❌ UPDATE CART ERROR:", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
};

/* =========================
   REMOVE FROM CART
========================= */
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ error: "cartId is required" });
    }

    const cartRef = db.collection("carts").doc(cartId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartRef.delete();

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("❌ REMOVE CART ERROR:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};
