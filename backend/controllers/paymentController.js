const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../firebase");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
exports.createPayment = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: "order_rcptid_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await db.collection("orders").doc(orderId).update({
      status: "PAID",
      paymentId: razorpay_payment_id,
    });

    return res.json({ success: true });
  }

  res.status(400).json({ success: false });
};
