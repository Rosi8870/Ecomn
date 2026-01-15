const admin = require("firebase-admin");

// Register
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).json({
      uid: user.uid,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login (token verification happens on frontend)
exports.login = async (req, res) => {
  res.json({ message: "Login handled by Firebase client SDK" });
};
