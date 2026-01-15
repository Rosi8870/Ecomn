const express = require("express");
const router = express.Router();

// Payment disabled (UPI manual verification only)
router.post("/", (req, res) => {
  res.status(400).json({
    error: "Online payment gateway disabled",
  });
});

module.exports = router;
