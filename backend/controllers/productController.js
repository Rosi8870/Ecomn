const db = require("../firebase");

// ✅ GET all products
exports.getProducts = async (req, res) => {
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
};

// ✅ ADD product (POST)
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, image, featured } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const product = {
      name,
      price,
      category: category || "General",
      image,
      featured: featured || false,
      createdAt: new Date(),
    };

    const docRef = await db.collection("products").add(product);

    res.status(201).json({
      message: "Product added",
      id: docRef.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
