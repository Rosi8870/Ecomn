import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../firebase";

/* ================= SETUP RECAPTCHA ================= */
const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  }
  return window.recaptchaVerifier;
};

/* ================= SEND OTP ================= */
export const sendOtp = async (phone) => {
  const appVerifier = setupRecaptcha();
  return signInWithPhoneNumber(auth, phone, appVerifier);
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = (confirmationResult, otp) => {
  return confirmationResult.confirm(otp);
};
