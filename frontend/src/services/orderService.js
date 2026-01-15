import { api } from "./api";
import { auth } from "../firebase";

/**
 * ✅ PLACE ORDER (UPI + ADDRESS)
 * This MUST match backend controller exactly
 */
export const submitPayment = (orderId, txnId) => {
  return api.put(`/orders/${orderId}/payment`, {
    paymentTxnId: txnId,
  });
};

export const placeOrder = (cart, totalAmount, txnId, address) => {
  const user = auth.currentUser;

  if (!user) {
    return Promise.reject("User not logged in");
  }

  // 🔄 Normalize cart items for backend
  const items = cart.map(item => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  return api.post("/orders", {
    userId: user.uid,          // ✅ required by backend
    items,                     // ✅ normalized
    totalAmount,               // ✅ required
    paymentTxnId: txnId,       // ✅ stored
    address,                   // ✅ stored
  });
};

/**
 * ✅ GET LOGGED-IN USER ORDERS
 * Uses query param (NO /orders/:id)
 */
export const getOrders = () => {
  const user = auth.currentUser;

  if (!user) {
    return Promise.resolve({ data: [] });
  }

  return api.get(`/orders?userId=${user.uid}`);
};
