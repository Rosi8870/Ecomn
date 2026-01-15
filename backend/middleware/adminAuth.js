const isAdmin = require("../utils/isAdmin");

module.exports = (req, res, next) => {
  const email =
    req.query.email ||
    req.body.email ||
    req.headers["x-admin-email"];

  if (!email || !isAdmin(email)) {
    return res.status(403).json({ error: "Admin access only" });
  }

  next(); // ✅ FULL ACCESS GRANTED
};
