const db = require("../firebase");

/* =========================
   GET USER CART
========================= */
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db
      .collection("carts")
      .where("userId", "==", userId)
      .get();

    const cart = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    // Check if product already exists in cart
    const snapshot = await cartRef
      .where("userId", "==", userId)
      .where("productId", "==", product.id)
      .get();

    if (!snapshot.empty) {
      // Increase quantity
      const doc = snapshot.docs[0];
      await doc.ref.update({
        quantity: doc.data().quantity + (product.quantity || 1),
      });

      return res.json({ message: "Cart quantity updated" });
    }

    // Add new cart item
    await cartRef.add({
      userId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity || 1,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE QUANTITY (+ / −)
========================= */
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    await db
      .collection("carts")
      .doc(cartId)
      .update({ quantity });

    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   REMOVE FROM CART
========================= */
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    await db
      .collection("carts")
      .doc(cartId)
      .delete();

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
