import { api } from "./api";
import { auth } from "../firebase";

let localCart = [];

const notifyNav = () => {
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: localCart.length }));
};

// ✅ Get logged-in user's cart
export const getCart = async () => {
  const user = auth.currentUser;

  if (!user) {
    return { data: [] };
  }

  const res = await api.get(`/cart/${user.uid}`);
  localCart = res.data;
  notifyNav();
  return res;
};

// ✅ Add product to cart
export const addToCart = async (product) => {
  const user = auth.currentUser;

  if (!user) {
    return Promise.reject("User not logged in");
  }

  // Optimistic update for blazing fast UI
  const existing = localCart.find((item) => item.id === product.id || item.productId === product.id);
  if (!existing) {
    localCart.push(product);
    notifyNav(); 
  }

  const res = await api.post("/cart", {
    userId: user.uid,
    product,
  });
  return res;
};

// ✅ Update quantity (+ / −)
export const updateQuantity = async (cartId, quantity) => {
  // Optimistic
  const item = localCart.find((i) => i.id === cartId);
  if (item) item.quantity = quantity;
  
  const res = await api.put(`/cart/${cartId}`, {
    quantity,
  });
  return res;
};

// ✅ Remove item from cart
export const removeFromCart = async (cartId) => {
  // Optimistic update
  localCart = localCart.filter((i) => i.id !== cartId);
  notifyNav();

  const res = await api.delete(`/cart/${cartId}`);
  return res;
};

export const clearLocalCart = () => {
  localCart = [];
  notifyNav();
};
