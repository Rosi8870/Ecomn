const express = require("express");
const router = express.Router();
const db = require("../firebase");

/* =========================
   GET ALL PRODUCTS
========================= */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE PRODUCT (DETAIL PAGE)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const doc = await db
      .collection("products")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD PRODUCT (ADMIN ONLY)
========================= */
router.post("/", async (req, res) => {
  try {
    const { name, price, image, category, featured, description } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const product = {
      name,
      price,
      image,
      category: category || "General",
      featured: featured || false,
      description: description || "",
      createdAt: new Date(),
    };

    const ref = await db.collection("products").add(product);

    res.status(201).json({
      id: ref.id,
      message: "Product added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE PRODUCT (ADMIN)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    await db
      .collection("products")
      .doc(req.params.id)
      .delete();

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
