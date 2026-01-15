import { api } from "./api";
import { auth } from "../firebase";

// ✅ Get logged-in user's cart
export const getCart = () => {
  const user = auth.currentUser;

  if (!user) {
    return Promise.resolve({ data: [] });
  }

  return api.get(`/cart/${user.uid}`);
};

// ✅ Add product to cart
export const addToCart = product => {
  const user = auth.currentUser;

  if (!user) {
    return Promise.reject("User not logged in");
  }

  return api.post("/cart", {
    userId: user.uid,
    product,
  });
};

// ✅ Update quantity (+ / −)
export const updateQuantity = (cartId, quantity) => {
  return api.put(`/cart/${cartId}`, {
    quantity,
  });
};

// ✅ Remove item from cart
export const removeFromCart = cartId => {
  return api.delete(`/cart/${cartId}`);
};
