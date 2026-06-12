import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

/* ================= EMAIL LOGIN ================= */
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/* ================= REGISTER ================= */
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/* ================= GOOGLE LOGIN ================= */
export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};
